from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import (
    CurrentSuperuser,
    CurrentUser,
    SessionDep,
    get_current_superuser,
)
from app.core.config import settings
from app.core.security import verify_password
from app.cruds import user_crud
from app.models import User
from app.schemas import (
    Message,
    UpdatePassword,
    UserPublic,
    UsersPublic,
    UserUpdate,
    UserUpdateStatus,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "",
    dependencies=[Depends(get_current_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 10) -> Any:
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).first()

    statement = select(User).offset(skip).limit(limit)
    users = list(session.exec(statement).all())

    return {"data": users, "count": count}


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep, current_user: CurrentUser, user_in: UserUpdate
) -> Any:
    if user_in.email:
        user_db = user_crud.get_by_gmail(session=session, email=user_in.email)
        if user_db:
            raise HTTPException(status_code=400, detail="The email is already in use")
    user = user_crud.update(session=session, user_db=current_user, new_data=user_in)
    return user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    session: SessionDep, current_user: CurrentUser, data: UpdatePassword
) -> Any:
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400, detail="New password must be different from the current"
        )
    user_crud.update(
        session=session,
        user_db=current_user,
        new_data={"password": data.new_password},
    )
    return Message(msg="Password updated successfully")


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    if current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="Superusers are not allow to delete themselves"
        )
    user_crud.delete(session=session, user_db=current_user)
    return Message(msg="User deleted successfully")


@router.get(
    "/{user_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=UserPublic,
)
def read_user(session: SessionDep, user_id: str) -> Any:
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    return user_db


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_superuser)],
    response_model=UserPublic,
)
def update_user_status(
    session: SessionDep, status_in: UserUpdateStatus, user_id: str
) -> Any:
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    if user_db.email == settings.FIRST_SUPERUSER:
        raise HTTPException(status_code=403, detail="Cannot update the first superuser")
    user = user_crud.update(session=session, user_db=user_db, new_data=status_in)
    return user


@router.delete("/{user_id}", response_model=Message)
def delete_user(
    session: SessionDep, current_user: CurrentSuperuser, user_id: str
) -> Any:
    user_db = session.get(User, user_id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    if user_db.email == settings.FIRST_SUPERUSER:
        raise HTTPException(status_code=403, detail="Cannot delete the first superuser")
    user_crud.delete(session=session, user_db=user_db)
    return Message(msg="User deleted successfully")
