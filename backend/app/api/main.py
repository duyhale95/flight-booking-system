from fastapi import APIRouter

from app.api.routes import bookings, flights, login, users

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(flights.router)
api_router.include_router(bookings.router)
