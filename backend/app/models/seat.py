from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_unique_id

if TYPE_CHECKING:
    from .flight import Flight
    from .ticket import Ticket


class Seat(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    seat_number: str
    is_available: bool = True

    # Foreign keys
    flight_id: str = Field(foreign_key="flight.id")

    # Relationships
    flight: "Flight" = Relationship(back_populates="seats")
    ticket: Optional["Ticket"] = Relationship(back_populates="seat")
