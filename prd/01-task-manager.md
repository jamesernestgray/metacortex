# Task Manager Module

## Overview
The Task Manager is the foundational module of the application. It allows users to create, organize, and track tasks with various metadata such as due dates, priorities, tags, and assignments. Tasks can be nested (subtasks), recurring, and optionally delegated to an AI agent or another user.

---

## Features & Functional Requirements

### 1. **Task Creation**
- Users can create a task via:
  - Floating "+" button (UI)
  - Inline entry in a list or board
  - Natural language (e.g., "Remind me to call Mom at 3pm tomorrow")
- Required fields:
  - `Title` (string)
- Optional fields:
  - `Description` (markdown-compatible text)
  - `Due Date & Time` (datetime picker)
  - `Priority` (enum: Low, Medium, High)
  - `Tags` (multi-select from user-defined list)
  - `Project` (optional parent grouping)
  - `Status` (enum: Pending, In Progress, Completed, Blocked)
  - `Assignee` (self, another user, or "AI agent" placeholder)

### 2. **Task Views**
- **List View**: Default interface grouped by due date or project
- **Board View (Kanban)**: Columns by status or custom field
- **Calendar View**: Tasks placed on a calendar grid (optional)
- Allow filtering by tag, project, priority, and assignee

### 3. **Subtasks**
- Tasks can have an arbitrary number of child tasks
- Subtasks should inherit tags/project by default but allow overrides
- Completion of all subtasks should optionally auto-complete parent

### 4. **Recurring Tasks**
- Support scheduling patterns (daily, weekly, monthly, custom)
- On completion, auto-generate next instance based on rule
- Store recurrence rules in standardized format (e.g., iCalendar RRULE)

### 5. **Task Delegation**
- Delegation can be to:
  - Another user (shared workspace or contact)
  - An AI agent (triggers a backend hook or action plan)
- Include acceptance workflow for tasks assigned to other humans
- Log delegation in task history

### 6. **Notifications & Reminders**
- Users can opt-in to:
  - Push notifications (mobile/web)
  - Email or in-app reminders
- Trigger types:
  - Due date approaching
  - Assigned task accepted/completed
  - Task overdue

### 7. **Task Metadata & History**
- Maintain audit log:
  - Created at/by
  - Last updated
  - Completed at
  - Assignment/delegation history
- Include `completed` and `archived` states

---

## UI Requirements

- Responsive layout for web and mobile
- Task item components:
  - Checkbox for completion
  - Inline title editing
  - Hover reveal for actions (edit, delete, comment)
- Task creation modal/dialog
- Filter/search bar with tag chips and text input
- Optional: Drag-and-drop support in board view

---

## Backend Requirements

- **Database:** PostgreSQL with SQLAlchemy ORM
- **SQLAlchemy Models:**
  - `Task` (with relationships to User, Project)
  - `Subtask` (self-referencing relationship via `parent_task_id`)
  - `Tag`, `TaskTag` (many-to-many association)
  - `Project`
- **FastAPI Routes:**
  - `GET /api/v1/tasks`, `POST /api/v1/tasks`
  - `PUT /api/v1/tasks/{task_id}`, `DELETE /api/v1/tasks/{task_id}`
  - `POST /api/v1/tasks/{task_id}/delegate`
- **Authentication:** Clerk-based user authorization and task ownership validation
- **Background Jobs:** Celery with Celery Beat for scheduled reminder notifications and due-date alerts

---

## Edge Cases
- Recurring task rescheduling: must not overwrite old instance
- Delegated task gets deleted: notify assignee and fallback
- Time zone support for due dates