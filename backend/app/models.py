from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from app.utils import generate_unique_id


class User(SQLModel, table=True):
    id: str = Field(default_factory=generate_unique_id, primary_key=True)
    email: EmailStr = Field(index=True)
    name: str
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
