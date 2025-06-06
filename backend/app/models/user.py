from typing import TYPE_CHECKING

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

from app.utils import generate_unique_id

if TYPE_CHECKING:
    from .booking import Booking


class User(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    name: str
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False

    # Relationships
    bookings: list["Booking"] = Relationship(back_populates="user")
