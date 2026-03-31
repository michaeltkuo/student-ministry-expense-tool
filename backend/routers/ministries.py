from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Ministry
from schemas import MinistryCreate, MinistryRead, MinistryUpdate
from auth import verify_token
from typing import List

router = APIRouter()


@router.get("/ministries", response_model=List[MinistryRead])
def list_ministries(db: Session = Depends(get_db)):
    return db.query(Ministry).order_by(Ministry.name).all()


@router.post("/ministries", response_model=MinistryRead, status_code=status.HTTP_201_CREATED)
def create_ministry(
    body: MinistryCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    existing = db.query(Ministry).filter(Ministry.name == body.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ministry already exists")
    ministry = Ministry(name=body.name)
    db.add(ministry)
    db.commit()
    db.refresh(ministry)
    return ministry


@router.patch("/ministries/{ministry_id}", response_model=MinistryRead)
def update_ministry(
    ministry_id: int,
    body: MinistryUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    ministry = db.query(Ministry).filter(Ministry.id == ministry_id).first()
    if not ministry:
        raise HTTPException(status_code=404, detail="Ministry not found")
    ministry.name = body.name
    db.commit()
    db.refresh(ministry)
    return ministry


@router.delete("/ministries/{ministry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ministry(
    ministry_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    ministry = db.query(Ministry).filter(Ministry.id == ministry_id).first()
    if not ministry:
        raise HTTPException(status_code=404, detail="Ministry not found")
    db.delete(ministry)
    db.commit()
