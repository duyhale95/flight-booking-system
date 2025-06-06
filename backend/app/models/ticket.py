from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_unique_id

if TYPE_CHECKING:
    from .flight import Flight
    from .passenger import Passenger
    from .seat import Seat


class Ticket(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    ticket_number: str = Field(unique=True)

    # Foreign keys
    passenger_id: str = Field(foreign_key="passenger.id")
    flight_id: str = Field(foreign_key="flight.id")
    seat_id: Optional[str] = Field(foreign_key="seat.id", default=None)

    # Relationships
    passenger: "Passenger" = Relationship(back_populates="tickets")
    flight: "Flight" = Relationship(back_populates="tickets")
    seat: Optional["Seat"] = Relationship(back_populates="ticket")
