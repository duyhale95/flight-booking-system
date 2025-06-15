from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_unique_id

if TYPE_CHECKING:
    from .booking_model import Booking
    from .ticket_model import Ticket


class Passenger(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    first_name: str
    last_name: str
    nationality: str
    date_of_birth: date
    passport_number: Optional[str] = None

    # Foreign keys
    booking_id: str = Field(foreign_key="booking.id")

    # Relationship
    booking: "Booking" = Relationship(back_populates="passengers")
    tickets: list["Ticket"] = Relationship(back_populates="passenger")
