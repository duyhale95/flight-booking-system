from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.booking import BookingStatus
from app.schemas.passenger import PassengerInfo, PassengerPublic
from app.schemas.ticket import TicketPublic


class BookingBase(BaseModel):
    total_price: float
    status: BookingStatus = BookingStatus.PENDING


class BookingFlightInfo(BaseModel):
    """Schema for flight information when creating a booking with tickets"""

    flight_id: str
    seat_ids: list[str | None] = Field(
        description="Optional seat IDs to assign. Must match number of passengers.",
    )


class BookingCreate(BookingBase):
    user_id: str
    passengers: list[PassengerInfo] = Field(
        description="Passenger information to create with this booking"
    )
    flight_info: BookingFlightInfo = Field(
        description="Flight information to create tickets"
    )


class BookingUpdate(BaseModel):
    total_price: Optional[float] = None


class BookingStatusUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class BookingPublic(BookingBase):
    id: str
    booking_number: str
    booking_date: datetime
    deleted: bool
    deleted_at: Optional[datetime]
    user_id: str


class BookingDetailPublic(BookingPublic):
    """Detailed booking information with nested passengers and their tickets"""

    class PassengerWithTickets(PassengerPublic):
        tickets: list[TicketPublic]

    passengers: list[PassengerWithTickets]


class BookingsPublic(BaseModel):
    data: list[BookingPublic]
    count: int
