# Contributing to MetaCortex

Thank you for your interest in contributing to MetaCortex! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (to be defined).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/metacortex.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes using conventional commits
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

See the [README.md](README.md) for detailed setup instructions.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

Format: `<type>(<scope>): <subject>`

Examples:
- `feat(tasks): add task delegation feature`
- `fix(auth): resolve login redirect issue`
- `docs(api): update endpoint documentation`
- `style(frontend): format code with prettier`
- `refactor(backend): extract task service logic`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

## Code Style

### Python (Backend)
- Follow PEP 8
- Use Black for formatting (88 character line length)
- Use isort for import sorting
- Run `make lint-backend` before committing

### TypeScript/React (Frontend)
- Use ESLint configuration provided
- Use Prettier for formatting
- Run `make lint-frontend` before committing

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage
- Run `make test` to run all tests

### Backend Testing
- Use pytest for testing
- Place tests in `backend/tests/`
- Use fixtures for test data
- Mock external dependencies

### Frontend Testing
- Use Jest and React Testing Library
- Place tests next to components (`.test.tsx` files)
- Test user interactions, not implementation details

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update the CHANGELOG.md with your changes (if applicable)
5. Request review from maintainers
6. Address review feedback
7. Squash commits if requested

## Pull Request Template

See [.github/pull_request_template.md](.github/pull_request_template.md)

## Project Structure

```
metacortex/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   ├── tests/       # Backend tests
│   └── alembic/     # Database migrations
├── frontend/        # React frontend
│   ├── src/         # Source code
│   └── public/      # Static assets
└── docs/           # Documentation
```

## Questions?

Feel free to open an issue for any questions about contributing.