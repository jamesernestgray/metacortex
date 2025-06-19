.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend \
        test test-backend test-frontend lint lint-backend lint-frontend \
        migrate docker-up docker-down clean

# Default target
help:
	@echo "MetaCortex Development Commands:"
	@echo "  make install       - Install all dependencies"
	@echo "  make dev          - Run development servers"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Run linters"
	@echo "  make migrate      - Run database migrations"
	@echo "  make docker-up    - Start Docker services"
	@echo "  make docker-down  - Stop Docker services"

# Installation
install: install-backend install-frontend

install-backend:
	cd backend && pip install -r requirements.txt
	cd backend && pip install pre-commit && pre-commit install

install-frontend:
	cd frontend && npm install

# Development servers
dev:
	@echo "Starting development servers..."
	make docker-up
	make -j 2 dev-backend dev-frontend

dev-backend:
	cd backend && python run.py

dev-frontend:
	cd frontend && npm start

# Testing
test: test-backend test-frontend

test-backend:
	cd backend && pytest

test-frontend:
	cd frontend && npm test

# Linting
lint: lint-backend lint-frontend

lint-backend:
	cd backend && black app tests
	cd backend && isort app tests
	cd backend && flake8 app tests

lint-frontend:
	cd frontend && npm run lint

# Database
migrate:
	cd backend && alembic upgrade head

migrate-create:
	cd backend && alembic revision --autogenerate -m "$(message)"

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".coverage" -delete
	rm -rf backend/htmlcov
	rm -rf frontend/build
	rm -rf frontend/node_modules
	rm -rf backend/.pytest_cache