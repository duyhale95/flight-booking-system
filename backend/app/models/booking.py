from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_booking_number, generate_unique_id

if TYPE_CHECKING:
    from .passenger import Passenger
    from .user import User


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Booking(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    booking_number: str = Field(
        default_factory=generate_booking_number,
        unique=True,
        index=True,
    )
    booking_date: datetime = Field(default_factory=datetime.now)
    total_price: float
    status: BookingStatus = BookingStatus.PENDING
    deleted: bool = Field(default=False, index=True)
    deleted_at: Optional[datetime] = Field(default=None)

    # Foreign keys
    user_id: str = Field(foreign_key="user.id")

    # Relationships
    user: "User" = Relationship(back_populates="bookings")
    passengers: list["Passenger"] = Relationship(back_populates="booking")
