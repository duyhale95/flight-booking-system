from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    total_price: float
    status: BookingStatus = BookingStatus.PENDING


class BookingCreate(BookingBase):
    user_id: str


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    total_price: Optional[float] = None


class BookingPublic(BookingBase):
    id: str
    booking_number: str
    booking_date: datetime
    user_id: str


class BookingsPublic(BaseModel):
    data: list[BookingPublic]
    count: int
