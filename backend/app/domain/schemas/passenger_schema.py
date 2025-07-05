from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, field_validator

from .ticket_schema import TicketWithSeat


class PassengerBase(BaseModel):
    first_name: str
    last_name: str
    nationality: str
    date_of_birth: date
    passport_number: Optional[str] = None

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_date_of_birth(cls, v):
        """Convert string to date if needed"""
        if isinstance(v, date):
            return v
        if isinstance(v, str):
            try:
                # Try ISO format (YYYY-MM-DD)
                return datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                try:
                    # Try other common formats
                    return datetime.strptime(v, "%d/%m/%Y").date()
                except ValueError:
                    try:
                        return datetime.strptime(v, "%m/%d/%Y").date()
                    except ValueError as e:
                        raise ValueError(
                            "Invalid date format. Expected YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY"
                        ) from e
        raise ValueError(
            "Invalid date format. Expected YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY"
        )


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
