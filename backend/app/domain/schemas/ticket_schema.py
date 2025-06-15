from typing import Optional

from pydantic import BaseModel


class TicketBase(BaseModel):
    passenger_id: str
    flight_id: str


class TicketCreate(TicketBase):
    seat_id: Optional[str]


class TicketUpdate(BaseModel):
    seat_id: Optional[str] = None


class TicketPublic(TicketBase):
    id: str
    ticket_number: str
    seat_id: str


class TicketWithSeat(TicketPublic):
    seat_number: str


class TicketsPublic(BaseModel):
    data: list[TicketPublic]
    count: int
