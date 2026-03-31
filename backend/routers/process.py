from fastapi import APIRouter, File, UploadFile, HTTPException
from ai.extractor import extract_receipt_data
from schemas import ExtractedData

router = APIRouter()


@router.post("/process-receipt", response_model=ExtractedData)
async def process_receipt(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        image_bytes = await file.read()
        result = await extract_receipt_data(image_bytes)
        return ExtractedData(
            vendor=result.get("vendor"),
            date=result.get("date"),
            amount=result.get("amount"),
            currency=result.get("currency", "USD"),
            category=result.get("category"),
            description=result.get("description"),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
