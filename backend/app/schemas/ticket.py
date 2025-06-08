from typing import Optional

from pydantic import BaseModel


class TicketBase(BaseModel):
    passenger_id: str
    flight_id: str
    seat_id: Optional[str] = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    seat_id: Optional[str] = None


class TicketPublic(TicketBase):
    id: str
    ticket_number: str


class TicketsPublic(BaseModel):
    data: list[TicketPublic]
    count: int
