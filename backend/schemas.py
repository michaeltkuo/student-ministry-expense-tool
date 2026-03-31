from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MinistryCreate(BaseModel):
    name: str


class MinistryRead(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class MinistryUpdate(BaseModel):
    name: str


class SubmissionCreate(BaseModel):
    ministry_id: int
    student_name: str
    vendor: Optional[str] = None
    transaction_date: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "USD"
    category: Optional[str] = None
    description: Optional[str] = None
    raw_ai_response: Optional[str] = None


class SubmissionRead(BaseModel):
    id: int
    ministry_id: int
    ministry_name: Optional[str] = None
    student_name: str
    vendor: Optional[str] = None
    transaction_date: Optional[str] = None
    amount: Optional[float] = None
    currency: str
    category: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    status: str
    raw_ai_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionUpdate(BaseModel):
    ministry_id: Optional[int] = None
    student_name: Optional[str] = None
    vendor: Optional[str] = None
    transaction_date: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ExtractedData(BaseModel):
    vendor: Optional[str] = None
    date: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "USD"
    category: Optional[str] = None
    description: Optional[str] = None
