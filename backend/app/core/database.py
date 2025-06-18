import logging

from sqlmodel import Session, create_engine

from app.api.cruds import user_crud
from app.core.config import settings
from app.domain.schemas import UserCreate

logger = logging.getLogger(__name__)

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def init_db(session: Session) -> None:
    """
    Initialize the database with required initial data.
    """
    # Check if the superuser exists
    user = user_crud.get_by_email(session=session, email=settings.FIRST_SUPERUSER)

    # Create superuser if not exists
    if not user:
        logger.info("Creating initial superuser account")
        user_in = UserCreate(
            name="admin",
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = user_crud.create(session=session, user_in=user_in)
        logger.info("Superuser created successfully")
