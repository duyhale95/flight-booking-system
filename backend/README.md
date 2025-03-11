# Flight Booking - Backend

Backend service for the Flight Booking project.

## Technology Stack

- **FastAPI**: A high-performance framework for building APIs.
- **SQLModel**: A library for interacting with SQL databases.
- **PostgreSQL**: A powerful object-relational database system.

## Requirements

- [Docker](https://www.docker.com/) for containerizing applications and managing environments.
- [uv](https://docs.astral.sh/uv/) for managing Python packages and environments.

## Setup

1. **Clone the repository:**

```bash
$ git clone https://github.com/dangvonguyen/flight-booking
$ cd flight-booking/backend
```

2. **Install dependencies:**

Use `uv` to sync and install all dependencies:

```bash
$ uv sync
```

3. **Activate the virtual environment:**

```bash
$ source .venv/bin/activate
```

## Development

- **Start the development server:**

Use Docker Compose to start the local development environment:

```bash
$ docker-compose up --build
```

- **Live Reloading:**

During development, you can use `docker compose watch` to enable live reloading of the FastAPI server.

## Migrations

- **Create a new migration:**

After modifying models, create a new Alembic migration:

```bash
$ docker compose exec backend alembic revision --autogenerate -m "Description of changes"
```

- **Apply migrations:**

Apply the latest migrations to the database:

```bash
$ docker compose exec backend alembic upgrade head
```
