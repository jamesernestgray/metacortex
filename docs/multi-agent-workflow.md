# Multi-Agent Workflow Documentation

## Overview

The Metacortex project uses a multi-agent workflow where each Claude Code agent operates within a specific role, following defined responsibilities and communication protocols.

## Structure

```
roles/
├── [role-name]/
│   ├── inbox/              # New messages from other agents
│   │   └── archive/        # Processed messages
│   └── tasks.md           # Role-specific task tracking
└── README.md              # Role definitions and protocols
```

## How It Works

### 1. Role Assignment
When starting a session, agents identify their role (e.g., "I am operating as the Backend Engineer").

### 2. Inbox Checking
Agents check their inbox folder for new messages at the start of each session.

### 3. Task Execution
Agents work on tasks from their tasks.md file, respecting role boundaries.

### 4. Inter-Agent Communication
When needing help from another role, agents create structured messages in that role's inbox.

### 5. Message Processing
After handling a message, agents move it to the archive folder and update their tasks.

## Message Format

Messages follow a structured format with:
- Clear subject line
- Sender/recipient roles
- Priority level
- Context and request details
- Expected outcomes
- Response deadline

## Benefits

1. **Clear Boundaries**: Each agent knows exactly what they're responsible for
2. **Async Communication**: Agents can work independently and communicate asynchronously
3. **Audit Trail**: All communications are preserved in archives
4. **Task Tracking**: Each role maintains its own task list
5. **Scalability**: New roles can be added easily

## Example Workflow

1. **Product Designer** creates mockups and sends design specs to **Frontend Engineer**
2. **Frontend Engineer** implements UI and requests API endpoints from **Backend Engineer**
3. **Backend Engineer** implements APIs and notifies **QA Engineer** for testing
4. **QA Engineer** tests and sends bugs back to respective engineers
5. **DevOps Engineer** deploys after receiving deployment request

## Getting Started

To use the multi-agent workflow:

1. Choose your role for the session
2. Check your inbox: `roles/[your-role]/inbox/`
3. Review your tasks: `roles/[your-role]/tasks.md`
4. Process any messages
5. Work on your tasks
6. Communicate with other roles as needed

## Best Practices

- Process high-priority messages first
- Keep messages concise but complete
- Update task status regularly
- Archive messages after processing
- Escalate blockers to Project Manager
- Document decisions in messages