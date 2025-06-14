from fastapi import APIRouter

from app.api.routes import (
    bookings,
    flights,
    login,
    me,
    passengers,
    seats,
    tickets,
    users,
)

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(me.router)
api_router.include_router(users.router)
api_router.include_router(flights.router)
api_router.include_router(bookings.router)
api_router.include_router(passengers.router)
api_router.include_router(seats.router)
api_router.include_router(tickets.router)
