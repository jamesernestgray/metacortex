# Metacortex Backend

FastAPI-based backend for the Metacortex productivity application.

## Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL 14+
- Redis (for background tasks)

### Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── repositories/  # Data access layer
│   └── main.py        # Application entry point
├── alembic/           # Database migrations
├── tests/             # Test suite
└── scripts/           # Utility scripts
```

## Available Endpoints

### Authentication
- `POST /api/v1/auth/webhook` - Clerk webhook for user sync

### Tasks
- `GET /api/v1/tasks` - List tasks with filtering
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/{id}` - Get task details
- `PATCH /api/v1/tasks/{id}` - Update a task
- `DELETE /api/v1/tasks/{id}` - Delete a task
- `POST /api/v1/tasks/{id}/complete` - Mark task as complete

### Notes
- `GET /api/v1/notes` - List notes with search
- `POST /api/v1/notes` - Create a new note
- `GET /api/v1/notes/{id}` - Get note with links
- `PATCH /api/v1/notes/{id}` - Update a note
- `DELETE /api/v1/notes/{id}` - Delete a note
- `POST /api/v1/notes/{id}/links` - Add note link
- `DELETE /api/v1/notes/{id}/links/{target_id}` - Remove note link

### Habits
- `GET /api/v1/habits` - List habits
- `POST /api/v1/habits` - Create a new habit
- `GET /api/v1/habits/{id}` - Get habit with logs
- `PATCH /api/v1/habits/{id}` - Update a habit
- `DELETE /api/v1/habits/{id}` - Delete a habit
- `POST /api/v1/habits/{id}/logs` - Log habit completion
- `GET /api/v1/habits/streaks` - Get current streaks

## Testing

Run the test suite:
```bash
pytest
```

With coverage:
```bash
pytest --cov=app --cov-report=html
```

## Database Management

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback one migration:
```bash
alembic downgrade -1
```

## Development

### Code Quality
```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/
mypy app/
```

### Environment Variables

See `.env.example` for all available configuration options.