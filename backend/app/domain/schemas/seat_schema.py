from typing import Optional

from pydantic import BaseModel


class SeatBase(BaseModel):
    seat_number: str
    is_available: bool = True
    flight_id: str


class SeatCreate(SeatBase):
    pass


class SeatUpdate(BaseModel):
    seat_number: Optional[str] = None
    is_available: Optional[bool] = None


class SeatPublic(SeatBase):
    id: str


class SeatsPublic(BaseModel):
    data: list[SeatPublic]
    count: int
