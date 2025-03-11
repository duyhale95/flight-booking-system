from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import create_access_token
from app.cruds import user_crud
from app.schemas import Token, UserCreate, UserPublic, UserRegister

router = APIRouter(tags=["login"])


@router.post("/signup", response_model=UserPublic)
def register(session: SessionDep, user_in: UserRegister) -> Any:
    user_db = user_crud.get_by_gmail(session=session, email=user_in.email)
    if user_db:
        raise HTTPException(status_code=400, detail="The email is already in use")
    user_create = UserCreate.model_validate(user_in)
    user = user_crud.create(session=session, user_in=user_create)
    return user


@router.post("/signin/access-token", response_model=Token)
def login_access_token(
    session: SessionDep, form: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Any:
    user_db = user_crud.authenticate(
        session=session, email=form.username, password=form.password
    )
    if not user_db:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user_db.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {"access_token": create_access_token(user_db.id, access_token_expires)}
