from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, Field


class FlightBase(BaseModel):
    flight_number: str
    flight_date: date
    airline_name: str
    airline_code: str
    departure_airport: str
    departure_code: str
    departure_time: datetime
    departure_terminal: Optional[str] = None
    departure_gate: Optional[str] = None
    arrival_airport: str
    arrival_code: str
    arrival_time: datetime
    arrival_terminal: Optional[str] = None
    arrival_gate: Optional[str] = None
    price: float = Field(ge=0)
    available_seats: int = Field(ge=0)


class FlightCreate(FlightBase):
    pass


class FlightUpdate(BaseModel):
    flight_number: Optional[str] = None
    flight_date: Optional[date] = None
    airline_name: Optional[str] = None
    airline_code: Optional[str] = None
    departure_airport: Optional[str] = None
    departure_code: Optional[str] = None
    departure_time: Optional[datetime] = None
    departure_terminal: Optional[str] = None
    departure_gate: Optional[str] = None
    arrival_airport: Optional[str] = None
    arrival_code: Optional[str] = None
    arrival_time: Optional[datetime] = None
    arrival_terminal: Optional[str] = None
    arrival_gate: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    available_seats: Optional[int] = Field(default=None, ge=0)


class FlightPublic(FlightBase):
    id: str


class FlightsPublic(BaseModel):
    data: list[FlightPublic]
    count: int


class FlightSearch(BaseModel):
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=10, ge=0)
    flight_date: Optional[date] = None
    airline_code: Optional[str] = None
    departure_code: Optional[str] = None
    departure_start_time: time = time.min
    departure_end_time: time = time.max
    arrival_code: Optional[str] = None
    arrival_start_time: time = time.min
    arrival_end_time: time = time.max
    start_price: Optional[float] = Field(default=None, ge=0)
    end_price: Optional[float] = Field(default=None, ge=0)
