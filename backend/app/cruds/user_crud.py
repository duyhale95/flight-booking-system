from typing import Any

from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserCreate


def create(*, session: Session, user_in: UserCreate) -> User:
    extra = {"hashed_password": get_password_hash(user_in.password)}
    user_db = User.model_validate(user_in, update=extra)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db


def update(
    *, session: Session, user_db: User, new_data: dict[str, Any] | BaseModel
) -> User:
    if isinstance(new_data, BaseModel):
        new_data = new_data.model_dump(exclude_unset=True)
    if new_data.get("password"):
        new_data["hashed_password"] = get_password_hash(new_data["password"])

    user_db.sqlmodel_update(new_data)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db


def delete(*, session: Session, user_db: User) -> None:
    session.delete(user_db)
    session.commit()


def get_by_gmail(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    user_db = session.exec(statement).first()
    return user_db


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    user_db = get_by_gmail(session=session, email=email)
    if not user_db:
        return None
    if not verify_password(password, user_db.hashed_password):
        return None
    return user_db
