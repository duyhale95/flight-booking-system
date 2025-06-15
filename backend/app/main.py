import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.api.main import api_router
from app.common.logging import setup_logging
from app.core.config import settings
from app.core.database import engine, init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Setup application logging
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info(f"Starting {settings.PROJECT_NAME}")
    logger.info(f"API version: {settings.API_V1_STR}")

    # Initialize data in the database
    try:
        with Session(engine) as session:
            init_db(session)
            logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Fail to initialize database: {e}", exc_info=True)
        raise

    logger.info("Application startup completed successfully")

    yield

    logger.info("Shutting down application")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.all_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
