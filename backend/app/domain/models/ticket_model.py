from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_ticket_number, generate_unique_id

if TYPE_CHECKING:
    from .flight_model import Flight
    from .passenger_model import Passenger
    from .seat_model import Seat


class Ticket(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    ticket_number: str = Field(default_factory=generate_ticket_number)

    # Foreign keys
    passenger_id: str = Field(foreign_key="passenger.id")
    flight_id: str = Field(foreign_key="flight.id")
    seat_id: str = Field(foreign_key="seat.id")

    # Relationships
    passenger: "Passenger" = Relationship(back_populates="tickets")
    flight: "Flight" = Relationship(back_populates="tickets")
    seat: "Seat" = Relationship(back_populates="ticket")
