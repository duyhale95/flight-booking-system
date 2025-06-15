from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_unique_id

if TYPE_CHECKING:
    from .seat_model import Seat
    from .ticket_model import Ticket


class Flight(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    flight_number: str
    flight_date: date = Field(index=True)
    airline_name: str
    airline_code: str

    # Departure information
    departure_airport: str
    departure_code: str
    departure_time: datetime
    departure_terminal: Optional[str] = None
    departure_gate: Optional[str] = None

    # Arrival information
    arrival_airport: str
    arrival_code: str
    arrival_time: datetime
    arrival_terminal: Optional[str] = None
    arrival_gate: Optional[str] = None

    # Price and seat availability
    price: float
    available_seats: int

    # Relationships
    seats: list["Seat"] = Relationship(back_populates="flight")
    tickets: list["Ticket"] = Relationship(back_populates="flight")
