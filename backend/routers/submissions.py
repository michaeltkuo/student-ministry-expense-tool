import csv
import io
import json
import os
import uuid
from datetime import datetime
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from auth import verify_token
from database import get_db
from models import Ministry, Submission
from schemas import SubmissionRead, SubmissionUpdate

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def _submission_to_read(sub: Submission) -> SubmissionRead:
    return SubmissionRead(
        id=sub.id,
        ministry_id=sub.ministry_id,
        ministry_name=sub.ministry.name if sub.ministry else None,
        student_name=sub.student_name,
        vendor=sub.vendor,
        transaction_date=sub.transaction_date,
        amount=sub.amount,
        currency=sub.currency or "USD",
        category=sub.category,
        description=sub.description,
        image_path=sub.image_path,
        status=sub.status,
        raw_ai_response=sub.raw_ai_response,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
    )


@router.post("/submissions", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
async def create_submission(
    ministry_id: int = Form(...),
    student_name: str = Form(...),
    vendor: Optional[str] = Form(None),
    transaction_date: Optional[str] = Form(None),
    amount: Optional[float] = Form(None),
    currency: str = Form("USD"),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    raw_ai_response: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    ministry = db.query(Ministry).filter(Ministry.id == ministry_id).first()
    if not ministry:
        raise HTTPException(status_code=404, detail="Ministry not found")

    image_path = None
    if file and file.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        image_path = filename

    submission = Submission(
        ministry_id=ministry_id,
        student_name=student_name,
        vendor=vendor,
        transaction_date=transaction_date,
        amount=amount,
        currency=currency,
        category=category,
        description=description,
        image_path=image_path,
        raw_ai_response=raw_ai_response,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return _submission_to_read(submission)


@router.get("/submissions", response_model=List[SubmissionRead])
def list_submissions(
    ministry_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    query = db.query(Submission)
    if ministry_id:
        query = query.filter(Submission.ministry_id == ministry_id)
    if status:
        query = query.filter(Submission.status == status)
    if from_date:
        query = query.filter(Submission.transaction_date >= from_date)
    if to_date:
        query = query.filter(Submission.transaction_date <= to_date)
    query = query.order_by(Submission.created_at.desc())
    offset = (page - 1) * per_page
    submissions = query.offset(offset).limit(per_page).all()
    return [_submission_to_read(s) for s in submissions]


@router.get("/submissions/{submission_id}", response_model=SubmissionRead)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _submission_to_read(sub)


@router.patch("/submissions/{submission_id}", response_model=SubmissionRead)
def update_submission(
    submission_id: int,
    body: SubmissionUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sub, field, value)
    sub.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)
    return _submission_to_read(sub)


@router.delete("/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if sub.image_path:
        file_path = os.path.join(UPLOAD_DIR, sub.image_path)
        if os.path.exists(file_path):
            os.remove(file_path)
    db.delete(sub)
    db.commit()


@router.get("/export")
def export_csv(
    ministry_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    query = db.query(Submission)
    if ministry_id:
        query = query.filter(Submission.ministry_id == ministry_id)
    if status:
        query = query.filter(Submission.status == status)
    if from_date:
        query = query.filter(Submission.transaction_date >= from_date)
    if to_date:
        query = query.filter(Submission.transaction_date <= to_date)
    submissions = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Employee Name", "Ministry", "Expense Type", "Transaction Date",
        "Vendor", "Amount", "Currency", "Business Purpose"
    ])
    for sub in submissions:
        writer.writerow([
            sub.student_name,
            sub.ministry.name if sub.ministry else "",
            sub.category or "",
            sub.transaction_date or "",
            sub.vendor or "",
            sub.amount if sub.amount is not None else "",
            sub.currency or "USD",
            sub.description or "",
        ])
        sub.status = "exported"

    db.commit()
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expense_report.csv"},
    )
