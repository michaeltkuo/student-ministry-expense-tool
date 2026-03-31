from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class Ministry(Base):
    __tablename__ = "ministries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="ministry")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ministry_id = Column(Integer, ForeignKey("ministries.id"), nullable=False)
    student_name = Column(String, nullable=False)
    vendor = Column(String, nullable=True)
    transaction_date = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    status = Column(String, default="pending")
    raw_ai_response = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ministry = relationship("Ministry", back_populates="submissions")
