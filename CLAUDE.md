# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MetaCortex is a modular, extensible web and mobile application that serves as a centralized digital interface for managing personal life and work. It functions as a "life OS" combining task management, time management, personal knowledge management (PKM), personal ERP, AI task delegation, and integrations with external apps.

## Technical Stack

### Frontend
- **Web Framework**: React with component-based modular design
- **Mobile Framework**: React Native for code sharing and feature parity
- **State Management**: Redux Toolkit or Zustand for complex application state
- **Styling**: CSS-in-JS (Styled Components) or Tailwind CSS for theming support

### Backend
- **Framework**: FastAPI (Python) for high performance and AI/ML integration
- **Database**: PostgreSQL with SQLAlchemy ORM (async support)
- **Migrations**: Alembic for database schema management
- **AI Infrastructure**: 
  - OpenAI GPT-4 for natural language processing
  - Vector database (Pinecone) for semantic search
- **Authentication**: Clerk for managed authentication and user management
- **Task Queue**: Celery with Redis for background jobs
- **API Documentation**: Automatic OpenAPI/Swagger via FastAPI

## Architecture Principles

### Modular Plugin System
Each module (Tasks, Finance, Health, etc.) is a self-contained package with:
- Own API routes
- Database schema/migrations
- Frontend components
- Can be enabled/disabled per user

### Microservice-Compatible Design
- Starting as modular monolith
- Strict domain separation (task-service, auth-service, notifications-service)
- Can be broken into microservices as needed

### API-First Design
- REST or GraphQL APIs
- Web and mobile apps are API clients
- Enables future client additions

## Development Commands

*To be added when project scaffolding is complete. Will include:*
- Installation and setup
- Development server startup
- Build commands
- Test execution
- Linting and formatting
- Database migrations

## Core Modules (Phase 1 MVP)

1. **Task Manager**: Core task creation, organization, delegation with AI support
2. **Notes & PKM**: Zettelkasten-style note system with bi-directional linking
3. **Habit Tracker**: Daily habit management with streak tracking
4. **Time Management**: Calendar integration and time-blocking features
5. **Dashboard & Workflows**: Customizable dashboards and automation rules

## Key Development Considerations

- **Security**: End-to-end encryption for sensitive data, zero-knowledge architecture for legal documents
- **Accessibility**: WCAG 2.1 Level AA compliance, full keyboard navigation
- **Offline Support**: Robust offline functionality for mobile with intelligent sync
- **Performance**: Background task queue for long-running operations
- **Theming**: Full light/dark theme support with design tokens

## Integration Points

- Calendar systems (Google, Outlook, Apple)
- Financial aggregators (Plaid)
- Health platforms (Apple Health, Fitbit)
- Automation services (Zapier, IFTTT)
- AI services (OpenAI GPT-4)

## Project Timeline

- Phase 1: Tasks + Notes MVP (3-4 months)
- Phase 2: Modular System, Habit Tracker (2 months)
- Phase 3: Finance + ERP Dashboard (2-3 months)
- Phase 4: AI Agent + Delegation (2 months)

## Multi-Agent Workflow Guidelines

### Role-Based Agent System

When acting as a specific role (e.g., Backend Engineer, Frontend Engineer, etc.), agents must:

1. **Identify Your Role**: Clearly state which role you are operating as at the beginning of each session
2. **Stay Within Role Boundaries**: Only perform tasks and make decisions within your role's defined scope (see `roles/[role-name].md`)
3. **Respect Other Roles**: When tasks fall outside your domain, suggest involving the appropriate role

### Inter-Agent Communication

Each role has a structured workspace at `roles/[role-name]/`:
- `inbox/` - New messages from other agents
- `inbox/archive/` - Processed messages  
- `tasks.md` - Role-specific task tracking

#### Message Protocol

1. **Check Your Inbox**: At the start of each session, check `roles/[your-role]/inbox/` for new messages
2. **Send Messages**: Place messages in other roles' inboxes using the format:
   - Filename: `YYYY-MM-DD-HH-MM-SS-from-[your-role]-[subject].md`
   - Use the standard message template (see roles/README.md)
3. **Process Messages**: After handling a message, move it to `inbox/archive/`
4. **Update Tasks**: Add any new tasks from messages to your `tasks.md` file

#### Collaboration Examples

- **Frontend needs API change**: Frontend Engineer → Backend Engineer inbox
- **Security review needed**: Any role → Security Engineer inbox  
- **Design clarification**: Any engineer → Product Designer inbox
- **Deployment ready**: Backend/Frontend Engineer → DevOps Engineer inbox

### Task Management

1. **Role-Specific Tasks**: Maintain your own `tasks.md` in your role folder
2. **Cross-Role Dependencies**: Note dependencies on other roles in your tasks
3. **Status Updates**: Send progress updates to dependent roles via inbox messages

### Decision Making

- **Independent Decisions**: Make decisions within your role's authority
- **Collaborative Decisions**: Request input via inbox messages when needed
- **Escalations**: Send to Project Manager's inbox for cross-role conflicts

### Best Practices

1. **Clear Communication**: Use structured messages with context and clear requests
2. **Timely Responses**: Process high-priority messages promptly
3. **Documentation**: Keep inbox archives for audit trail
4. **Proactive Updates**: Don't wait to be asked for status updates
5. **Role Clarity**: When uncertain, refer to your role definition file