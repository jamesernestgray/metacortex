# Metacortex Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL (via Docker)
- Redis (via Docker)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd metacortex
```

### 2. Set Up Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
# Edit .env and add your Clerk API keys:
# CLERK_SECRET_KEY=your_secret_key
# CLERK_PUBLISHABLE_KEY=your_publishable_key
```

#### Frontend
```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local and add your Clerk publishable key:
# REACT_APP_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

### 3. Start Docker Services
```bash
cd ..
docker-compose up -d
```

This starts PostgreSQL and Redis.

### 4. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the backend server
python run.py
```

The backend will be available at http://localhost:8000

### 5. Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000

## Clerk Authentication Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Add the keys to your .env files as shown above

## Development

### Backend Development
- API documentation: http://localhost:8000/docs
- Database migrations: `alembic revision --autogenerate -m "Description"`
- Run tests: `pytest`

### Frontend Development
- Run tests: `npm test`
- Build for production: `npm run build`
- Lint code: `npm run lint`

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the backend is running and CORS is configured correctly
2. **Database connection errors**: Ensure PostgreSQL is running via Docker
3. **Authentication errors**: Verify your Clerk API keys are correct
4. **Port conflicts**: Make sure ports 3000, 8000, 5432, and 6379 are available

### Reset Database

```bash
cd backend
alembic downgrade base
alembic upgrade head
```

## Project Structure

```
metacortex/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   ├── alembic/     # Database migrations
│   └── tests/       # Backend tests
├── frontend/        # React frontend
│   ├── src/         # Source code
│   └── public/      # Static assets
├── docker-compose.yml
└── docs/           # Documentation
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.