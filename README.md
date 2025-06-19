# MetaCortex

A modular, extensible platform for personal life and work management.

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL 15 or higher (or Docker)
- Redis 7 or higher (or Docker)

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/metacortex.git
cd metacortex
```

### 2. Set up the backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Start PostgreSQL and Redis (using Docker)
cd ..
docker-compose up -d

# Run database migrations (once implemented)
# cd backend && alembic upgrade head

# Start the backend server
cd backend
python run.py
```

The API will be available at http://localhost:8000 with interactive documentation at http://localhost:8000/docs

### 3. Set up the frontend

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000

## Development

### Using Make commands

```bash
# Install all dependencies
make install

# Start development servers
make dev

# Run tests
make test

# Run linters
make lint

# Database migrations
make migrate

# Docker services
make docker-up
make docker-down
```

### Project Structure

```
metacortex/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── repositories/  # Data access layer
│   ├── alembic/          # Database migrations
│   ├── tests/            # Test files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── modules/      # Feature modules
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utilities
│   │   └── types/        # TypeScript types
│   └── package.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## API Documentation

Once the backend is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.