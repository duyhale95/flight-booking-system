import secrets
from typing import Annotated, Any

from pydantic import AnyUrl, BeforeValidator, EmailStr, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(value: Any) -> list[str] | str:
    """
    Parse CORS origins from string or list.
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [origin.strip() for origin in value.split(",")]
    raise ValueError(value)


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.
    """

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # API settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS settings
    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field  # type: ignore
    @property
    def all_cors_origins(self) -> list[str]:
        """
        Get normalized list of CORS origins.
        """
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS]

    # Project settings
    PROJECT_NAME: str

    # Database settings
    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    @computed_field  # type: ignore
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:  # noqa: N802
        """
        Build the PostgreSQL connection URI from individual components.
        """
        return PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    # User settings
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str


settings = Settings()  # type: ignore
