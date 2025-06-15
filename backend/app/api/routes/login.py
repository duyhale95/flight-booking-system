import logging
from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.api.cruds import user_crud
from app.api.deps import SessionDep
from app.common.exceptions import (
    AuthenticationError,
    InactiveUserError,
    UserAlreadyExistsError,
    UserError,
    handle_exception,
)
from app.core.config import settings
from app.core.security import create_access_token
from app.domain.schemas import Token, UserCreate, UserPublic, UserRegister

logger = logging.getLogger(__name__)
router = APIRouter(tags=["login"])


@router.post("/signup", response_model=UserPublic, status_code=201)
def register(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Register a new user.
    """
    try:
        logger.info(f"New user registration attempt: {user_in.email}")

        user_create = UserCreate.model_validate(user_in.model_dump())
        user = user_crud.create(session=session, user_in=user_create)

        logger.info(f"User registered successfully: {user.email}")
        return user

    except (UserAlreadyExistsError, UserError) as e:
        logger.warning(f"Registration failed: {user_in.email}")
        raise handle_exception(e) from e


@router.post("/signin/access-token", response_model=Token)
def login_access_token(
    session: SessionDep, form: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Any:
    """
    Get access token for authenticated user.
    """
    try:
        logger.info(f"Login attempt: {form.username}")

        user_db = user_crud.authenticate(
            session=session, email=form.username, password=form.password
        )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(user_db.id, access_token_expires)

        logger.info(f"Login successful: {user_db.email}")
        return {"access_token": token, "token_type": "bearer"}

    except (AuthenticationError, InactiveUserError) as e:
        logger.warning(f"Login failed for {form.username}: {e.detail}")
        raise handle_exception(e) from e
