from datetime import date
from typing import Optional

from pydantic import BaseModel

from .ticket_schema import TicketWithSeat


class PassengerBase(BaseModel):
    first_name: str
    last_name: str
    nationality: str
    date_of_birth: date
    passport_number: Optional[str] = None


class PassengerInfo(PassengerBase):
    pass


class PassengerCreate(PassengerBase):
    booking_id: str


class PassengerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    passport_number: Optional[str] = None


class PassengerPublic(PassengerBase):
    id: str
    booking_id: str


class PassengerWithDetails(PassengerPublic):
    tickets: list[TicketWithSeat]


class PassengersPublic(BaseModel):
    data: list[PassengerPublic]
    count: int
