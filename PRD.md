# Product Requirements Document (PRD)

**Product Name:** MetaCortex
**Version:** 1.0  
**Prepared by:** ChatGPT (with James Gray)  
**Last Updated:** June 18, 2025

---

## 1. Overview

### 1.1 Purpose
To build a **modular, extensible web and mobile application** that serves as a **centralized digital interface for managing personal life and work**. The platform combines task management, time management, PKM, personal ERP, AI task delegation, and integrations with other apps to help users manage all aspects of their lives from a single personalized system.

### 1.2 Goals
- Launch with a robust **to-do list and notes system**
- Enable modular enable/disable for features (like plugins)
- Integrate with APIs for external data/actions (e.g., calendars, bank, Amazon)
- Allow users to **delegate tasks to AI agents or other users**
- Enable purchase/service tasks to auto-route to providers or user freelancers
- Serve as a **life OS**, adaptable for different user roles (personal, work, health, etc.)

---

## 2. Target Users

- Power users seeking a central control center
- Freelancers and entrepreneurs juggling multiple domains
- Neurodivergent users (e.g., ADHD) seeking structured support
- Productivity hackers and life optimizers
- Users who want to automate or outsource daily life tasks

---

## 3. Core Features and Modules

### ✅ Phase 1: MVP Modules

#### 3.1 Task Manager – Expanded Requirements

##### Overview
The Task Manager is the foundational module of the application. It allows users to create, organize, and track tasks with various metadata such as due dates, priorities, tags, and assignments. Tasks can be nested (subtasks), recurring, and optionally delegated to an AI agent or another user.

---

##### Features & Functional Requirements

###### 1. **Task Creation**
- Users can create a task via:
  - Floating “+” button (UI)
  - Inline entry in a list or board
  - Natural language (e.g., “Remind me to call Mom at 3pm tomorrow”)
- Required fields:
  - `Title` (string)
- Optional fields:
  - `Description` (markdown-compatible text)
  - `Due Date & Time` (datetime picker)
  - `Priority` (enum: Low, Medium, High)
  - `Tags` (multi-select from user-defined list)
  - `Project` (optional parent grouping)
  - `Status` (enum: Pending, In Progress, Completed, Blocked)
  - `Assignee` (self, another user, or “AI agent” placeholder)

###### 2. **Task Views**
- **List View**: Default interface grouped by due date or project
- **Board View (Kanban)**: Columns by status or custom field
- **Calendar View**: Tasks placed on a calendar grid (optional)
- Allow filtering by tag, project, priority, and assignee

###### 3. **Subtasks**
- Tasks can have an arbitrary number of child tasks
- Subtasks should inherit tags/project by default but allow overrides
- Completion of all subtasks should optionally auto-complete parent

###### 4. **Recurring Tasks**
- Support scheduling patterns (daily, weekly, monthly, custom)
- On completion, auto-generate next instance based on rule
- Store recurrence rules in standardized format (e.g., iCalendar RRULE)

###### 5. **Task Delegation**
- Delegation can be to:
  - Another user (shared workspace or contact)
  - An AI agent (triggers a backend hook or action plan)
- Include acceptance workflow for tasks assigned to other humans
- Log delegation in task history

###### 6. **Notifications & Reminders**
- Users can opt-in to:
  - Push notifications (mobile/web)
  - Email or in-app reminders
- Trigger types:
  - Due date approaching
  - Assigned task accepted/completed
  - Task overdue

###### 7. **Task Metadata & History**
- Maintain audit log:
  - Created at/by
  - Last updated
  - Completed at
  - Assignment/delegation history
- Include `completed` and `archived` states

---

##### UI Requirements

- Responsive layout for web and mobile
- Task item components:
  - Checkbox for completion
  - Inline title editing
  - Hover reveal for actions (edit, delete, comment)
- Task creation modal/dialog
- Filter/search bar with tag chips and text input
- Optional: Drag-and-drop support in board view

---

##### Backend Requirements

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

##### Edge Cases
- Recurring task rescheduling: must not overwrite old instance
- Delegated task gets deleted: notify assignee and fallback
- Time zone support for due dates

---

#### 3.2 Notes & Personal Knowledge Management – Expanded Requirements

##### Overview
The Notes module allows users to create, edit, and organize rich text notes for journaling, task context, documentation, or knowledge capture. It should be clean, performant, and searchable, with tagging and cross-linking capabilities.

---

##### Features & Functional Requirements

###### 1. **Note Creation & Editing**
- Users can create a note via:
  - “+ New Note” button
  - Linked from a task
  - Imported via clipboard or file (Phase 2)
- Editor should support:
  - Rich text (WYSIWYG)
  - Markdown syntax (optional toggle)
  - Headings, lists, checkboxes, code blocks, links, images
- Auto-save draft functionality every 5 seconds or on blur

###### 2. **Note Organization**
- Notes should have:
  - `Title` (editable)
  - `Body` (rich text content)
  - `Tags` (multi-select)
  - `Linked Tasks` (via `task_id`)
  - `Created At`, `Updated At`, `Pinned`, `Archived`

- Users can:
  - Sort notes by date or title
  - Filter by tag
  - Pin notes to top
  - Move notes to “Archive” (not delete)

###### 3. **Linking & Backlinking**
- Allow wiki-style linking using `[[Note Title]]`
- Render preview or clickable inline links
- Auto-create backlinks list on each note page

###### 4. **Search**
- Full-text search of title and body
- Include tag filters in search
- Highlight matches in the UI

###### 5. **Note-Task Integration**
- From task view, link to relevant notes
- From note view, show linked tasks with status

###### 6. **Version History**
- Track basic edit history:
  - Timestamps, who edited, snapshot diff
- Allow user to revert to previous version

###### 7. **Sharing (Phase 2)**
- Optional: Make notes shareable via public link or workspace-level visibility

---

##### UI Requirements

- Editor should be distraction-free, mobile-friendly
- Notes list should allow:
  - Sorting (date created, updated, title)
  - Quick filters (tag pills, pinned toggle)
- Support split view (list on left, editor on right)
- Dark mode compatible

---

##### Backend Requirements

- **SQLAlchemy Models:**
  - `Note` (with user relationship)
  - `NoteTag` (many-to-many association)
  - `NoteTaskLink` (linking notes to tasks)
  - `NoteVersion` (for version history tracking)
- **FastAPI Routes:**
  - `GET /api/v1/notes`, `POST /api/v1/notes`
  - `PUT /api/v1/notes/{note_id}`, `DELETE /api/v1/notes/{note_id}`
  - `GET /api/v1/notes/{note_id}/versions`
  - `POST /api/v1/notes/search` (full-text search endpoint)
- **Search:** PostgreSQL full-text search with GIN indexes
- **Authentication:** Clerk-based access control for private notes

---

##### Edge Cases

- Simultaneous editing: use a last-write-wins strategy for MVP
- Tag deletion: should not delete notes, only remove tag association
- Orphaned notes: allow cleanup of untagged/unlinked notes (optional)

---



---

### 🔜 Phase 2+: Expanded Modules

### **✅ 3.3 Habit Tracker – Expanded Requirements**

#### **Overview**
This module helps users build and maintain positive routines by making it easy and rewarding to track their habits. It focuses on visualization of progress, building streaks, and directly linking habits to the user's daily tasks and broader goals.

---

#### **Features & Functional Requirements**

1.  **Habit Creation & Logging**
    * Users can create custom habits to track.
    * Support for different habit types:
        * **Yes/No:** A simple daily or weekly check-off (e.g., "Meditated").
        * **Measurable:** Track a specific quantity (e.g., "Drank 8 glasses of water").
    * Users can log their habit completion on a daily or weekly basis.
    * Customizable reminders to prompt the user to complete a habit.

2.  **Gamification & Visualization**
    * The system tracks "streaks" to visually represent consecutive days of completion.
    * Dashboards and charts (e.g., calendar heatmaps, completion graphs) show progress over time.
    * Users can earn badges or other rewards for reaching milestones.

3.  **Integration with Tasks**
    * Habits can be linked to specific tasks or routines within the Task Manager. For example, a "Morning Routine" task could contain habits like "Make Bed" and "Journal."

---

#### **UI Requirements**

* A dedicated dashboard showing all tracked habits and current streaks.
* A calendar or heatmap view to visualize consistency for each habit.
* A simple, quick-action interface for logging completion (e.g., a single tap or check-in).
* Gamification elements like visually rewarding streak counters and milestone animations.

---

#### **Backend Requirements**

* **SQLAlchemy Models:** 
  * `Habit` (with type, frequency, goal, user relationship)
  * `HabitLog` (recording each completion with timestamp)
  * `HabitStreak` (for efficient streak calculation and caching)
* **FastAPI Routes:**
  * `GET /api/v1/habits`, `POST /api/v1/habits`
  * `POST /api/v1/habits/{habit_id}/check-in`
  * `GET /api/v1/habits/{habit_id}/stats`
* **Background Jobs:** Celery tasks scheduled with Celery Beat for:
  * Daily habit reset processing
  * Reminder notifications
  * Streak calculation and caching
* **Authentication:** Clerk-based user identification for habit ownership

---

#### **Edge Cases**

* **Rest Days**: Allow users to configure "rest days" for a habit that won't break a streak (e.g., not exercising on a Sunday).
* **Time zones**: Ensure a "day" is calculated based on the user's local time zone.
* **Retroactive Logging**: Allow users to fill in missed logs for the past few days to maintain accuracy.

### **✅ 3.4 Personal ERP & Workflows – Expanded Requirements**

#### **Overview**
This module acts as the high-level command center for the user's "life OS." It allows for the creation of distinct operational dashboards for different life roles and the automation of multi-step processes through a powerful workflow engine.

---

#### **Features & Functional Requirements**

1.  **Role-Based Dashboards**
    * Users can create and customize dashboards for different roles like "Work," "Side Hustle," or "Home".
    * Dashboards are composed of widgets from other modules (e.g., a task list from a specific project, a financial budget status, a habit tracker).

2.  **Workflow Automation**
    * A visual workflow builder where users can create "if this, then that" rules.
    * Workflows can have dependencies, chaining actions together (e.g., When Task A is completed, create Task B and start a focus timer).
    * Triggers can originate from within the app (e.g., task completion, note creation) or from external integrations (e.g., a new email, a calendar event starting).

3.  **Time-blocking Integration**
    * Workflows can interact with the Time Management module to automatically find and schedule time blocks for tasks or routines on the user's calendar.

---

#### **UI Requirements**

* A drag-and-drop interface for creating and customizing dashboards.
* A visual, node-based editor for building workflows.
* A gallery of pre-built workflow templates for common use cases (e.g., "Weekly Review," "New Project Setup").

---

#### **Backend Requirements**

* Tables: `dashboards`, `widgets`, `workflows` (storing trigger/action logic).
* A robust rules engine to process and execute workflows in the background.
* Secure integration with automation services like Zapier or IFTTT to enable external triggers and actions.

---

#### **Edge Cases**

* **Infinite Loops**: The workflow engine must have safeguards to detect and prevent workflows that would trigger themselves endlessly.
* **Error Handling**: If a step in a workflow fails (e.g., an external API is down), the system should notify the user and provide options to retry or fix the workflow.
* **Permissions**: Ensure workflows do not bypass the user's data permissions (e.g., a workflow shared by another user cannot access private data).

### **✅ 3.5 Financial Management – Expanded Requirements**

#### **Overview**
This module provides a unified view of the user's complete financial picture. By securely integrating with financial institutions, it automates expense tracking, budgeting, and goal setting, empowering users to make informed financial decisions.

---

#### **Features & Functional Requirements**

1.  **Account Aggregation**
    * Securely connect and sync data from checking, savings, credit card, loan, and investment accounts using services like Plaid or Yodlee.
    * Provide a real-time overview of all account balances and net worth.

2.  **Budgeting & Expense Tracking**
    * Users can create monthly budgets for various spending categories (e.g., Groceries, Transport, Entertainment).
    * Transactions are automatically downloaded and categorized, with tools for manual correction.
    * Visualizations show spending progress against budget limits.

3.  **Financial Goals & Alerts**
    * Set up and track progress toward specific financial goals.
    * Configure alerts for events like low balances, large transactions, or upcoming bill due dates.
    * Basic forecasting tools to project savings growth or debt payoff timelines.

---

#### **UI Requirements**

* A main financial dashboard summarizing net worth, cash flow, and budget performance.
* A filterable and searchable list of all transactions.
* Interactive charts and graphs to visualize spending by category, income vs. expenses, and net worth over time.
* A simple interface for creating budgets and savings goals.

---

#### **Backend Requirements**

* **SQLAlchemy Models:** 
  * `FinancialAccount` (encrypted account details)
  * `Transaction` (with automatic categorization)
  * `Budget` (monthly/category-based)
  * `FinancialGoal` (savings targets and progress)
* **FastAPI Routes:**
  * `POST /api/v1/financial/accounts/connect` (Plaid integration)
  * `GET /api/v1/financial/transactions` (with filtering)
  * `POST /api/v1/financial/budgets`
  * `GET /api/v1/financial/dashboard` (aggregated data)
* **Security:** 
  * Field-level encryption using SQLAlchemy hybrid properties
  * Clerk authentication with additional financial data access permissions
* **Background Jobs:** Celery tasks for:
  * Daily transaction sync from Plaid
  * Automatic transaction categorization
  * Budget alert processing
* **ML Integration:** Transaction categorization using scikit-learn models

---

#### **Edge Cases**

* **Data Synchronization Errors**: Handle cases where a bank's connection is temporarily unavailable or requires re-authentication.
* **Transaction Splitting**: Allow a single transaction to be split across multiple budget categories (e.g., a Target purchase).
* **Data Security**: Security is paramount. Adhere to strict security protocols, including regular audits and never storing raw bank credentials.

### **✅ 3.6 AI Assistant / Agent – Expanded Requirements**

#### **Overview**
The AI Assistant acts as an intelligent layer on top of the entire operating system. It works proactively to reduce cognitive load, automate complex tasks, summarize information, and provide a natural language interface for managing one's life.

---

#### **Features & Functional Requirements**

1.  **Intelligent Task Management**
    * The AI can perform task triage, suggesting priorities based on due dates, context, and user behavior.
    * It can parse natural language input to create fully detailed tasks (e.g., "Remind me to call Mom at 3pm tomorrow" creates a task with a title, assignee, and due date).

2.  **Autonomous Task Execution**
    * Users can delegate simple digital tasks for the AI to execute autonomously (e.g., "Find and book a flight to NYC next Tuesday").
    * All AI-proposed actions (like booking a flight or sending an email) require explicit user confirmation.

3.  **Context-Aware Summarization & Reminders**
    * The AI can provide context-aware reminders ("You have a meeting with Jane in 30 minutes. Here are your notes that mention her.").
    * It can generate summaries of notes, projects, or daily schedules upon request.

4.  **Natural Language Interface**
    * Users can interact with the entire application through a chat-based or voice-activated command bar.

---

#### **UI Requirements**

* A universal command bar or chat interface for interacting with the AI.
* Proactive notifications that present AI suggestions with simple "Accept/Decline" actions.
* A clear "confirmation step" UI for any action that modifies data or interacts with external services.

---

#### **Backend Requirements**

* **AI Integration:** OpenAI GPT-4 API with async client for FastAPI
* **Vector Database:** Pinecone for storing embeddings of user data
* **SQLAlchemy Models:**
  * `AIConversation` (storing chat history)
  * `AIAction` (logging AI-executed actions)
  * `AIContext` (managing user data access permissions)
* **FastAPI Routes:**
  * `POST /api/v1/ai/chat` (main conversational interface)
  * `POST /api/v1/ai/actions/{action_type}` (specific AI actions)
  * `GET /api/v1/ai/suggestions` (proactive AI suggestions)
* **Action Framework:** Celery tasks for sandboxed AI action execution
* **Authentication:** Clerk-based access control with per-user AI usage limits
* **Privacy:** Row-level security using SQLAlchemy filters based on user context

---

#### **Edge Cases**

* **AI Hallucination**: The system must have grounding mechanisms to prevent the AI from fabricating information, relying on the vector search of the user's actual data.
* **Failed Actions**: If an autonomous action fails, the AI should report the failure clearly to the user with an explanation.
* **Ambiguous Commands**: When faced with an ambiguous command, the AI should ask clarifying questions rather than guessing.

### **✅ 3.7 Marketplace & Service Routing – Expanded Requirements**

#### **Overview**
The Marketplace module extends the platform's capabilities into the real world by enabling users to seamlessly outsource tasks. It connects users with external service providers and creates an internal ecosystem for users to help one another.

---

#### **Features & Functional Requirements**

1.  **Service & Product Integration**
    * For relevant tasks (e.g., "Buy lightbulbs"), the system can link directly to affiliate services or products on sites like Amazon or Instacart.

2.  **External Provider Discovery**
    * Users can discover and route tasks to providers on freelancer platforms like Fiverr for digital tasks or local service platforms for physical tasks.
    * Integration allows for semi-automated creation of job posts on these platforms.

3.  **Internal User-to-User Marketplace**
    * An internal marketplace where users can post tasks they are willing to pay for other users to complete.
    * Users can create profiles showcasing skills they offer.
    * The system includes ratings, reviews, and a simple escrow-based payment system to facilitate trust.

---

#### **UI Requirements**

* An "Outsource" or "Delegate" option on tasks that opens a routing menu.
* An integrated view to browse and filter service providers or marketplace listings.
* A simple wizard for posting a task to the internal marketplace.
* User profiles with ratings, completed tasks, and skills.

---

#### **Backend Requirements**

* API integrations with affiliate programs and service provider platforms (e.g., Fiverr, Instacart, Amazon).
* A full marketplace backend system: `listings`, `bids`, `user_profiles`, `ratings`, `escrow_payments`.
* A secure payment gateway integration (e.g., Stripe Connect) to handle transactions between users.

---

#### **Edge Cases**

* **Dispute Resolution**: A clear process and support system must be in place to handle disputes between users in the internal marketplace.
* **Service Quality**: The platform is not responsible for the quality of external providers, but it should curate its integrations and remove partners with poor performance.
* **Liability**: Clear terms of service are needed to define the platform's liability (or lack thereof) for services rendered between users.

---

## 4. Expanded Life Modules

### **🕒 Time Management – Expanded Requirements**

#### **Overview**
This module aims to unify a user's various calendars and scheduling commitments into a single, intelligent interface. It moves beyond simple event tracking to offer proactive time-blocking, schedule optimization, and tools for focused work, directly integrating with the Task Manager to turn intentions into scheduled actions.

---

#### **Features & Functional Requirements**

1.  **Unified Calendar View**
    * Sync with external calendar providers (Google, Apple, Outlook) for two-way updates.
    * Display events from all connected calendars in a single interface (Day, Week, Month views).
    * Allow color-coding or labeling for events from different source calendars.

2.  **Automatic Time-Blocking**
    * Users can drag tasks from the Task Manager directly onto the calendar to create a time-blocked event.
    * An "Auto-schedule" feature that suggests open time slots for a given task based on its estimated duration and the user's existing schedule.
    * Link scheduled blocks back to the original task for status updates.

3.  **Schedule Optimization & Conflict Resolution**
    * The system will flag double-booked events or scheduling conflicts.
    * AI-powered suggestions to resolve conflicts by proposing alternative times.

4.  **Focus & Pomodoro Mode**
    * A built-in timer for focus sessions (e.g., Pomodoro technique) that can be linked to a specific task.
    * During a focus session, the option to mute notifications from the app.
    * Log completed focus sessions in the task's history or a separate productivity log.

---

#### **UI Requirements**

* A responsive calendar grid that is clear on both desktop and mobile.
* Drag-and-drop interface for moving tasks onto the calendar and rescheduling events.
* A dedicated, minimalist UI for the focus/Pomodoro timer, accessible from the main dashboard or a task view.
* Clear visual differentiation for events, tasks, and time blocks.

---

#### **Backend Requirements**

* Robust and secure synchronization services for each calendar API (Google, Microsoft Graph, CalDAV).
* A scheduler algorithm to analyze free time and suggest optimal slots.
* Tables: `calendar_integrations`, `time_blocks`, `focus_sessions`.
* API endpoints for `GET /calendar/events`, `POST /calendar/timeblock`, `POST /calendar/sync`.

---

#### **Edge Cases**

* **Time Zone Handling**: All events and due dates must be stored in UTC and converted to the user's local time zone on the frontend to prevent mismatches.
* **Recurring Event Edits**: Differentiate between editing a single instance and editing the entire series of a recurring event from a synced calendar.
* **Sync Latency**: Implement webhooks for real-time updates where possible and fall back to periodic polling, with clear UI indicators for the last sync time.

### **🥦 Health, Diet & Fitness – Expanded Requirements**

#### **Overview**
This module serves as a personal health dashboard, consolidating data from various fitness trackers and manual inputs. It enables users to monitor key health metrics, track progress toward goals, and manage health-related tasks like medication and appointments in one secure place.

---

#### **Features & Functional Requirements**

1.  **Metric Tracking & Logging**
    * Manual entry forms for:
        * Meals, calories, water intake.
        * Exercise type, duration, and intensity.
        * Health metrics like blood pressure, sleep hours, mood, and symptoms.
    * Automated data syncing from connected health services (Apple Health, Fitbit, etc.).

2.  **Medication & Appointment Management**
    * Schedule medication reminders, which create recurring tasks in the Task Manager.
    * Log medical appointments, link relevant notes, and set reminders.

3.  **Goal Setting & Progress Visualization**
    * Allow users to set specific health goals (e.g., "lose 10 lbs," "run 3 times a week," "drink 8 glasses of water daily").
    * Display progress against goals using charts and dashboards.

---

#### **UI Requirements**

* A customizable health dashboard with widgets for different metrics (e.g., steps today, sleep analysis, calorie trend).
* Simple, quick-entry forms for logging meals, water, and exercise.
* Data visualization through line graphs, bar charts, and progress rings.

---

#### **Backend Requirements**

* HIPAA-compliant data storage considerations (encryption at rest and in transit) for sensitive health information.
* Integration services for health APIs (Apple HealthKit, Google Fit, Fitbit, WHOOP, MyFitnessPal).
* Tables: `health_metrics` (a flexible table for various data types), `food_log`, `medication_schedule`, `appointments`.

---

#### **Edge Cases**

* **Data Duplication**: When syncing from multiple sources (e.g., phone and watch), the system must deduplicate entries for the same activity (e.g., a single walk tracked by both).
* **User Consent**: Implement a granular consent management screen for users to approve exactly what health data the application can read and write.
* **Manual Override**: Allow users to manually correct or delete incorrect data synced from an external device.

### **🧑‍🤝‍🧑 Social & Relationship Management – Expanded Requirements**

#### **Overview**
Functioning as a "Personal CRM," this module helps users cultivate their personal and professional networks. It moves beyond a simple address book to track interactions, set reminders for follow-ups, and remember important personal details, ensuring users can maintain meaningful connections.

---

#### **Features & Functional Requirements**

1.  **Contact Management**
    * Create contact profiles with fields for relationship type, company, and custom notes.
    * Import contacts from Google or Outlook.

2.  **Interaction Logging**
    * Manually log interactions like calls, messages, emails, and in-person meetings for each contact.
    * Include a date and a summary for each logged interaction.

3.  **Relationship Nudges**
    * Set reminders to reconnect with specific contacts at custom intervals (e.g., "every 3 months").
    * Automatic reminders for birthdays, anniversaries, and other significant life events.

4.  **Event & Social Planning**
    * Link contacts to planned events or tasks.
    * Optionally sync with social media to track recent activity or updates.

---

#### **UI Requirements**

* A filterable and searchable contact list view.
* A detailed contact page showing their information, a timeline of past interactions, and upcoming reminders.
* A dedicated dashboard showing upcoming birthdays and reminders to reconnect.

---

#### **Backend Requirements**

* Tables: `contacts`, `contact_interactions`, `contact_reminders`.
* A service to run daily checks for upcoming events and trigger notifications.
* API integration for contact import.

---

#### **Edge Cases**

* **Duplicate Contacts**: Provide a tool to merge duplicate contact entries.
* **Privacy**: All notes and interaction logs must be private to the user account by default, with no option for public sharing.
* **Outdated Information**: Offer a way to easily mark a contact as inactive or update their details.

### **🧳 Travel & Itinerary Management – Expanded Requirements**

#### **Overview**
This module streamlines trip planning by consolidating all travel-related information into a single, cohesive, and accessible itinerary. It aims to reduce the complexity of managing flights, accommodations, and activities, while also providing tools for packing and document storage.

---

#### **Features & Functional Requirements**

1.  **Itinerary Consolidation**
    * Organize flights, hotel stays, car rentals, and other reservations into a chronological itinerary for each trip.
    * Support manual entry for all reservation types.
    * (Phase 2) Implement an email parsing service that automatically detects and imports booking confirmations from a connected email account.

2.  **Integrations**
    * Connect with mapping services like Google Maps to display all itinerary locations on an interactive map.
    * Allow importing data from services like TripIt or synchronizing events to the user's main calendar.

3.  **Planning & Documentation Tools**
    * Create and manage packing lists using customizable templates.
    * Provide a secure, encrypted vault for storing digital copies of travel documents like passports, visas, and tickets.
    * Allow itineraries to be shared with other users (e.g., family members) with view-only permissions.

4.  **Alerts & Notifications**
    * Send alerts for check-in times, flight delays, or gate changes (requires integration with flight tracking services).
    * Remind users about upcoming reservations or activities.

---

#### **UI Requirements**

* A main dashboard listing all upcoming, current, and past trips.
* A detailed trip view that includes a timeline/list view of the itinerary and an embedded map.
* A user-friendly checklist interface for packing lists.
* A secure interface for uploading and viewing sensitive documents.

---

#### **Backend Requirements**

* Tables: `trips`, `reservations` (e.g., flights, hotels, activities), `packing_list_items`, `secure_documents`.
* An integration service for an optional email parser (IMAP) and flight status APIs.
* Secure blob storage with encryption at rest for user-uploaded documents.
* API endpoints: `GET /trips`, `POST /trips/:id/reservation`, `GET /trips/:id/documents`.

---

#### **Edge Cases**

* **Offline Access**: The mobile app should cache itinerary and document data for offline access when the user is traveling without reliable internet.
* **Complex Itineraries**: The system must handle multi-city trips with layovers and complex connections.
* **Cancellation Handling**: The UI should allow users to easily mark a reservation as canceled and have it update the itinerary accordingly.

### **📚 Education & Learning – Expanded Requirements**

#### **Overview**
This module acts as a personal learning hub, enabling users to track and organize their educational journey across various platforms and mediums. It connects learning activities to goals and incorporates retention tools to make knowledge stick.

---

#### **Features & Functional Requirements**

1.  **Learning Material Tracker**
    * Users can add and categorize learning resources, such as courses, books, articles, podcasts, and videos.
    * Track progress for each item (e.g., percentage complete, pages read, episodes watched).
    * Integrate with platforms like Coursera, Udemy, and Kindle to sync progress where APIs are available.

2.  **Spaced Repetition System (SRS)**
    * An built-in, Anki-style tool for creating digital flashcards.
    * Flashcards can be linked to specific notes or learning materials.
    * The system uses a spaced repetition algorithm to schedule card reviews for optimal retention.

3.  **Goal & Note Integration**
    * Users can create specific learning goals (e.g., "Learn Python for data analysis").
    * Learning materials and notes from the PKM module can be linked directly to these goals to track progress.

---

#### **UI Requirements**

* A dashboard or "Library" view that displays all learning items, filterable by status (In Progress, Completed, To-Do).
* A clean, simple interface for creating and reviewing flashcards.
* Visual progress indicators (e.g., progress bars) on learning items and goals.
* A web clipper browser extension to easily add articles and videos to the learning queue.

---

#### **Backend Requirements**

* Tables: `learning_items`, `learning_progress`, `flashcards`, `review_schedule`, `learning_goals`.
* Implementation of a spaced repetition algorithm (e.g., SM-2).
* A flexible metadata service to handle different types of learning resources (e.g., ISBN for books, URL for articles).
* API endpoints: `GET /learning/items`, `POST /flashcards`, `GET /reviews/today`.

---

#### **Edge Cases**

* **Diverse Media**: The system must gracefully handle links to external, non-standard content without breaking.
* **API Limitations**: For services without robust APIs (like Kindle), the system may rely on user-initiated imports or manual tracking.
* **Flashcard Export**: Allow users to export their flashcard decks in a common format (e.g., CSV or Anki-compatible package) to avoid data lock-in.

### **🧠 Mental Health & Wellbeing – Expanded Requirements**

#### **Overview**
This module provides a private, secure, and supportive space for users to engage in self-reflection and track their emotional wellbeing. It combines journaling, mood logging, and mindfulness tools, with a strong emphasis on user privacy and data security.

---

#### **Features & Functional Requirements**

1.  **Logging and Journaling**
    * Daily mood logging with a simple-to-use scale (e.g., emojis, 1-5 rating).
    * A dedicated space for gratitude journaling and recording daily affirmations.
    * Free-form reflection logs, with optional guided prompts to encourage introspection.
    * All entries must be end-to-end encrypted.

2.  **Mindfulness & Support**
    * Integration with mindfulness apps (e.g., Calm, Headspace) to log meditation sessions, or a simple built-in meditation timer.
    * A clearly accessible section with links and contact information for crisis support resources (e.g., suicide prevention hotlines).

3.  **Trend Analysis**
    * Users can view their mood history in simple charts to identify patterns over time.
    * (Phase 2+) The system can optionally and privately correlate mood data with other tracked metrics (e.g., sleep, exercise) to offer personal insights, performed entirely on the client-side.

---

#### **UI Requirements**

* A calm, minimalist, and non-intrusive design.
* A quick and easy "daily check-in" prompt.
* A distraction-free editor for journaling.
* Clear and simple data visualizations for mood trends.
* A persistent, but not alarming, button to access crisis support resources.

---

#### **Backend Requirements**

* **End-to-End Encryption (E2EE)**: The backend must be designed to be zero-knowledge. Journal and mood data must be encrypted on the client before being sent to the server. The server should never have access to the decryption keys.
* Tables: `mood_logs` (storing only encrypted blobs), `journal_entries` (encrypted blobs).
* A robust key management system for user-managed E2EE keys (e.g., a recovery phrase).
* API endpoints should only handle opaque, encrypted data.

---

#### **Edge Cases**

* **Data Recovery**: The user must be clearly informed that if they lose their encryption key/password, their encrypted data will be irrecoverable. The system cannot offer a traditional "forgot password" reset for this data.
* **Disclaimer**: The application must display prominent disclaimers stating that it is a self-help tool and not a substitute for professional medical advice or therapy.
* **Secure Syncing**: Syncing encrypted data across a user's devices must be handled carefully to ensure the E2EE promise is maintained.

### **💼 Career & Professional Growth – Expanded Requirements**

#### **Overview**
This module is designed to help users proactively manage their professional lives. It functions as a central hub for tracking career development activities, from job searching and networking to goal setting and performance management, consolidating all relevant information in one place.

---

#### **Features & Functional Requirements**

1.  **Job Application Tracking**
    * Users can track job applications through a pipeline (e.g., Applied, Interview, Offer, Rejected).
    * Log networking activities and interviews for each application.
    * Store and manage multiple versions of resumes and cover letters for different applications.

2.  **Professional Development**
    * Set and monitor progress toward long-term career goals.
    * Track performance review cycles and outcomes.
    * Keep organized notes from mentorship sessions or professional development courses.

3.  **Networking & Integration**
    * Maintain a list of professional contacts with notes on interactions.
    * Optionally sync with LinkedIn to keep professional profiles and network information updated.

---

#### **UI Requirements**

* A Kanban board or list view to visualize the job application pipeline.
* A dashboard displaying key career metrics (e.g., applications sent, interviews scheduled, networking outreach).
* A secure document library for managing and comparing resume versions.
* An interface for setting goals with clear progress indicators.

---

#### **Backend Requirements**

* Tables: `job_applications`, `career_goals`, `resume_versions`, `mentorship_notes`.
* Secure storage for user-uploaded documents (resumes, cover letters).
* An integration service for the LinkedIn API for profile and network syncing.
* API endpoints: `GET /career/applications`, `POST /career/goals`, `PUT /resumes/:id`.

---

#### **Edge Cases**

* **Data Privacy**: The module must ensure the privacy of a user's job search, especially from their current employer.
* **Document Formats**: The system should support common document formats like PDF and DOCX for resumes.
* **Archiving**: Users should be able to archive old job searches to keep the main dashboard focused and uncluttered.

### **🏡 Home Maintenance – Expanded Requirements**

#### **Overview**
This module acts as a digital command center for managing a household. It helps users track routine chores, log important maintenance for appliances and home systems, manage vendor contacts, and maintain a home inventory.

---

#### **Features & Functional Requirements**

1.  **Task & Chore Management**
    * Create chore calendars and assign tasks to different members of a household.
    * Set up reminders and alerts for recurring home maintenance tasks (e.g., "Change HVAC filter every 3 months").

2.  **Asset & Service Logging**
    * Log service history, repairs, and costs for major appliances and home systems.
    * Store digital copies of warranties, manuals, and receipts for easy access.

3.  **Home Inventory & Contacts**
    * Build and maintain a home inventory, categorized by room or item type.
    * Keep a dedicated contact list for trusted service vendors (plumbers, electricians, etc.).

---

#### **UI Requirements**

* A shared calendar view for household chores and maintenance schedules.
* A dashboard that surfaces upcoming and overdue maintenance alerts.
* An "Assets" section where each appliance has its own page with a detailed service log.
* A searchable vendor list and a browseable home inventory.

---

#### **Backend Requirements**

* Tables: `home_tasks`, `home_assets` (appliances), `asset_service_logs`, `vendor_contacts`, `inventory_items`.
* A notification service to power the maintenance alerts.
* Blob storage for user-uploaded files like receipts and warranty documents.
* Support for multi-user access (family/household sharing).
* API endpoints: `GET /home/tasks`, `POST /home/assets`, `GET /assets/:id/log`.

---

#### **Edge Cases**

* **Multiple Properties**: The system should optionally support management of more than one property for users who are landlords or own a vacation home.
* **Shared Access Control**: Implement simple permissions for shared households (e.g., Admin vs. Member).
* **Initial Setup**: Provide templates or guides to help users perform an initial home inventory, which can be a daunting task.

### **🛡 Personal Safety & Security – Expanded Requirements**

#### **Overview**
This module is dedicated to enhancing user safety and securing their most critical information. It provides tools for emergency preparedness, secure data storage, and proactive safety measures, all within a highly protected environment.

---

#### **Features & Functional Requirements**

1.  **Emergency Preparedness**
    * Store and manage a list of emergency contacts for quick access in a crisis.
    * Create a simple emergency plan that can be shared with contacts.
    * A "Safety Check-in" feature that notifies emergency contacts if a user fails to confirm their safety by a specified time.

2.  **Encrypted Document Vault**
    * An end-to-end encrypted (E2EE) vault for storing highly sensitive documents like passports, birth certificates, and social security cards.
    * The service provider must have zero knowledge of the encrypted contents.

3.  **Alerts & Information**
    * Integrate with public alert systems to notify the user of local safety events, such as severe weather or police activity.
    * Allow users to store critical medical information (allergies, blood type) for emergency situations.

---

#### **UI Requirements**

* A dedicated, high-security section of the application requiring separate authentication (e.g., PIN, biometrics).
* A prominent "Emergency Mode" button that displays critical information and contacts on a single screen.
* A simple, non-intrusive interface for setting and responding to safety check-in timers.
* A secure file manager for uploading and organizing documents in the E2EE vault.

---

#### **Backend Requirements**

* **End-to-End Encryption**: The backend must be architected so that it cannot decrypt user data in the vault, per the PRD's security principles. Encryption and decryption must happen exclusively on the client-side.
* Tables: `emergency_contacts`, `secure_vault_items` (storing only encrypted metadata and file pointers), `safety_check_ins`.
* A highly reliable, priority notification service for dispatching safety check-in alerts.
* Integration with a national or regional emergency alert system API.

---

#### **Edge Cases**

* **E2EE Key Recovery**: The user must be explicitly warned that losing their master password/key will result in permanent loss of all data in the vault. A user-managed recovery phrase is the only possible recovery method.
* **False Alarms**: The safety check-in feature must have options to easily extend or cancel the timer to prevent accidental emergency notifications.
* **Emergency Access by Proxy**: Consider a secure "dead man's switch" mechanism where a trusted contact can request access if the primary user is unresponsive, requiring a multi-day waiting period and user notification to prevent abuse.

### **🐾 Pet Care – Expanded Requirements**

#### **Overview**
This module provides a comprehensive solution for pet owners to manage all aspects of their pet's life and wellbeing. It serves as a centralized health record, scheduler, and historical log, ensuring critical care information is always organized and accessible.

---

#### **Features & Functional Requirements**

1.  **Health & Wellness Tracking**
    * Maintain detailed health and vaccination records for each pet.
    * Schedule and log medications with reminder notifications.
    * Track key health metrics like weight, diet, and symptoms over time.

2.  **Scheduling & Reminders**
    * Set reminders for daily feeding, grooming, and activity routines.
    * Schedule appointments for vet visits or professional grooming and log them in the service history.

3.  **Care Delegation & History**
    * Create detailed service logs for every vet visit, grooming session, or other professional care.
    * Delegate tasks like pet-sitting or dog walking to other users or external providers.
    * Create individual profiles for multiple pets, each with their own specific records and schedules.

---

#### **UI Requirements**

* A dedicated profile page for each pet, featuring a photo, breed, age, and other essential details.
* A health dashboard that visually flags upcoming vaccinations and appointments.
* A calendar view for all scheduled pet-related activities.
* A simple "Care Log" interface for quick entry of notes related to feeding, behavior, or health issues.

---

#### **Backend Requirements**

* Tables: `pets`, `pet_health_records`, `pet_medication_schedule`, `pet_care_tasks`, `pet_service_history`.
* A notification service for sending reminders for medication, feeding, and appointments.
* Functionality to link pet care tasks to other MetaCortex users for delegation.
* Storage for documents like vaccination certificates or lab results.

---

#### **Edge Cases**

* **Multi-Pet Management**: The UI must make it easy to switch between different pet profiles without confusion.
* **Shared Ownership**: The system should allow pet profiles to be shared with co-owners or family members with defined permissions (e.g., view-only vs. editor).
* **Archiving Records**: Provide a way to archive the profile of a deceased pet, preserving the records without cluttering the active interface.

### **👪 Parenting & Family Management – Expanded Requirements**

#### **Overview**
This module is designed to be the central organizing hub for modern families. It provides tools to manage the complexities of household chores, children's schedules and development, and overall family coordination to reduce stress and improve communication.

---

#### **Features & Functional Requirements**

1.  **Chore and Reward Systems**
    * Create and manage dynamic chore charts for children.
    * Implement a customizable rewards system linked to chore completion.
    * Assign tasks to different family members with due dates and recurring schedules.

2.  **Child Development & Schooling**
    * Track and celebrate key developmental milestones for each child.
    * Schedule and manage homework assignments and project deadlines.
    * Keep a centralized list of important contacts (e.g., schools, doctors, emergency contacts).

3.  **Family Coordination**
    * Utilize shared family calendars to coordinate appointments, practices, and events.
    * Support complex scheduling needs, such as shared custody arrangements.

---

#### **UI Requirements**

* An interactive and visually engaging chore chart, potentially with different themes for younger children.
* A private, timeline-based view for logging and viewing child milestones.
* A color-coded family calendar that clearly distinguishes each member's schedule.
* A parent-facing dashboard to get a quick overview of pending chores, rewards, and the day's schedule.

---

#### **Backend Requirements**

* Tables: `family_members`, `chores`, `chore_assignments`, `rewards`, `child_milestones`, `family_calendar_events`.
* A role-based permission system (e.g., Parent/Admin, Child/User) to control access to different features.
* A robust notification engine to send reminders for chores, events, and homework.

---

#### **Edge Cases**

* **Complex Schedules**: The calendar must gracefully handle complex recurring events, such as custody schedules that change weekly or for holidays.
* **Age-Appropriate UI**: If children are expected to interact directly with the app, the UI for their features must be simple, secure, and age-appropriate.
* **Co-Parenting Privacy**: In shared custody situations, there must be granular privacy controls to determine what information is visible to each co-parent.

### **🫶 Volunteering & Community Engagement – Expanded Requirements**

#### **Overview**
This module empowers users to track and grow their positive impact on their communities. It provides a structured way to log volunteer efforts, manage commitments across various organizations, and discover new ways to contribute.

---

#### **Features & Functional Requirements**

1.  **Contribution Tracking**
    * Log volunteer hours, the organization served, and the specific role or tasks performed.
    * Store contact information for volunteer coordinators and key personnel at each organization.
    * Upload and store documents like certificates of service or appreciation letters.

2.  **Discovery & Opportunities**
    * Discover local and remote volunteering opportunities based on user interests and location.
    * Integrate with third-party platforms (e.g., VolunteerMatch, Idealist) to pull in listings.

3.  **Profile & Reporting**
    * Generate simple reports summarizing volunteer hours, suitable for resumes, applications, or tax purposes.
    * Optionally share a summary of contributions and total hours on a public-facing user profile.

---

#### **UI Requirements**

* A personal dashboard visualizing total volunteer hours, broken down by organization and time period.
* A simple logbook interface for quickly adding new volunteer sessions.
* An integrated search and filter interface to browse and discover new volunteer opportunities.
* A clear and simple toggle in the settings to enable or disable the public contributions profile.

---

#### **Backend Requirements**

* Tables: `volunteer_logs`, `organizations`, `volunteer_contacts`, `public_profile_settings`.
* Integration with one or more third-party volunteer opportunity APIs.
* A service to generate PDF or CSV reports of a user's volunteering history.
* An API endpoint to serve public profile data if a user has opted in.

---

#### **Edge Cases**

* **Hour Verification**: While the system will be based on self-reporting, consider a future feature for volunteer coordinators to optionally verify hours.
* **Recurring Commitments**: The system should make it easy to log hours for a recurring commitment (e.g., "every Saturday at the food bank") without repetitive manual entry.
* **Public Profile Privacy**: The public profile feature must be "off" by default and give the user full control over what specific information (e.g., total hours vs. specific organizations) is shared.

### **🎨 Creative Projects & Hobbies – Expanded Requirements**

#### **Overview**
This module provides a dedicated space for users to manage their creative endeavors and hobbies. It moves beyond generic task management to offer specialized tools for tracking creative projects—like writing a novel, producing music, or painting—from initial idea to final product.

---

#### **Features & Functional Requirements**

1.  **Project Scoping & Management**
    * Create distinct projects for different creative works (e.g., a book, an album, a craft project).
    * Set specific goals, deadlines, and milestones for each project.
    * Use templates for common creative projects (e.g., NaNoWriMo novel structure, album tracklist).

2.  **Inspiration & Resource Hub**
    * Create digital mood boards by linking to notes, saving images, and bookmarking web pages.
    * Manage an inventory of physical supplies or digital assets (e.g., paint colors, software plugins, yarn).

3.  **Progress & Practice Logging**
    * Log practice sessions, word counts, hours spent, or other relevant metrics.
    * Upload progress photos or audio clips to a project timeline.

4.  **Portfolio & Gallery**
    * A dedicated space to showcase completed work.
    * Option to write descriptions or "artist's statements" for each finished piece.

---

#### **UI Requirements**

* A main dashboard showing all creative projects and their current status.
* Project-specific views that could include a Kanban board for stages, a timeline for progress, and an inventory list.
* A visual, grid-based gallery for mood boards and finished portfolios.
* Simple logging forms for tracking time or other metrics.

---

#### **Backend Requirements**

* Tables: `creative_projects`, `project_milestones`, `resource_inventory`, `progress_logs`.
* Blob storage for high-resolution images and other media files.
* A flexible metadata system to accommodate the different needs of various hobbies.

---

#### **Edge Cases**

* **Project Variety**: The system must be flexible enough to handle the different workflows of a writer versus a painter versus a musician.
* **Large Files**: Manage storage and performance implications of users uploading large audio, video, or image files.
* **Collaboration**: For future phases, consider how to handle creative projects with more than one contributor.

### **⚖️ Legal, Civic & Estate Management – Expanded Requirements**

#### **Overview**
This module acts as a highly secure digital vault and organizer for a user's most critical legal documents, civic responsibilities, and long-term estate information. It emphasizes security, privacy, and preparedness for life's major formalities.

---

#### **Features & Functional Requirements**

1.  **Secure Document Vault**
    * End-to-end encrypted (E2EE) storage for critical legal documents like wills, trusts, deeds, and power of attorney.
    * Ability to add metadata, notes, and physical location information to each document.

2.  **Deadline & Obligation Tracking**
    * Set reminders for important deadlines such as tax filing dates or property tax payments.
    * Track civic duties like jury duty summons and store voter registration details.

3.  **Key Contacts Directory**
    * A secure list of professional contacts (lawyers, accountants, executors) with relevant details.

4.  **Digital Legacy Planning**
    * (Optional/Advanced) A mechanism to securely store information needed to manage or close digital accounts, with a highly secure process for transferring to an executor.

---

#### **UI Requirements**

* A high-security section of the app requiring separate authentication (PIN, biometrics).
* A clean, searchable list of all stored documents with clear labels.
* A calendar or timeline view for upcoming deadlines.
* Prominent disclaimers and help text explaining the importance of E2EE and password management.

---

#### **Backend Requirements**

* **Zero-Knowledge Architecture**: The backend must not be able to decrypt any user-uploaded documents or notes. E2EE is mandatory.
* Tables: `legal_documents` (storing encrypted blobs), `key_contacts`, `civic_deadlines`.
* A highly reliable notification system for critical deadlines.

---

#### **Edge Cases**

* **Succession Planning**: Designing a secure, verifiable "dead man's switch" to grant access to a designated executor is extremely complex and carries significant security risks.
* **E2EE Key Loss**: The user must be made to understand that losing their master key means their data is permanently irrecoverable.
* **Jurisdictional Differences**: Tax and legal deadlines vary significantly by location; the system would need to allow for fully custom reminders.

### **🚗 Vehicle Management – Expanded Requirements**

#### **Overview**
Functioning as a "digital glovebox," this module helps users manage the maintenance, documentation, and expenses associated with their vehicles. It centralizes all vehicle-related information, making ownership less stressful.

---

#### **Features & Functional Requirements**

1.  **Vehicle Profiles**
    * Create and manage profiles for multiple vehicles (cars, motorcycles, etc.), including VIN, make, model, and year.
    * Upload a photo for each vehicle for easy identification.

2.  **Maintenance & Service Log**
    * Log all service records, including date, cost, location, and work performed. Upload receipts for each entry.
    * Set reminders for scheduled maintenance (e.g., oil changes, inspections) based on time or mileage intervals.

3.  **Document & Expense Tracking**
    * Store digital copies of important documents like insurance cards, registration, and titles.
    * Track all vehicle-related expenses, including fuel, insurance payments, and repairs, for budgeting purposes.

---

#### **UI Requirements**

* A dashboard listing all user vehicles, with at-a-glance status indicators for upcoming service.
* A detailed profile page for each vehicle showing a timeline of its service history.
* A simple, quick-entry form for logging fuel fill-ups and other common expenses.
* A document viewer for easy access to insurance and registration on a mobile device.

---

#### **Backend Requirements**

* Tables: `vehicles`, `service_records`, `vehicle_documents`, `vehicle_expense_logs`.
* A notification system tied to date or user-updated mileage for maintenance reminders.
* Blob storage for receipts and document photos.

---

#### **Edge Cases**

* **Selling a Vehicle**: The system should allow a user to archive a sold vehicle, preserving its records without cluttering the main view.
* **International Use**: Accommodate different units for distance (miles/kilometers), currency, and fuel volume (gallons/liters).
* **Future Integration**: Potential future integration with OBD-II devices to automatically track mileage and engine diagnostics.

### **🎉 Major Event Planning – Expanded Requirements**

#### **Overview**
This module provides a specialized project management suite for planning significant, multi-faceted personal events like weddings, milestone birthday parties, or large family reunions. It organizes the four key areas of event planning: guests, budget, vendors, and tasks.

---

#### **Features & Functional Requirements**

1.  **Guest Management**
    * Import contacts from the main app or a CSV file.
    * Track invitation status (Sent, Opened, RSVP'd), meal choices, and +1s.
    * Group guests into households or tables.

2.  **Budget & Expense Tracking**
    * Set an overall event budget and allocate funds to different categories (e.g., venue, catering, entertainment).
    * Track deposits and final payments to vendors.

3.  **Vendor & Task Management**
    * Maintain a directory of all event vendors with contact info, contracts, and payment schedules.
    * Use pre-built checklist templates or create custom task lists with timelines and assignments.

4.  **Day-Of Tools**
    * Create and share a "day-of" timeline for the wedding party or key helpers.
    * Use a simple drag-and-drop tool to create seating charts.

---

#### **UI Requirements**

* A central dashboard for each event showing a summary of RSVPs, budget status, and upcoming tasks.
* A filterable, spreadsheet-like view for the guest list.
* Visual charts and graphs to illustrate budget allocation and spending.
* A Kanban board or checklist view for tasks.

---

#### **Backend Requirements**

* Tables: `events`, `event_guests`, `event_budget_items`, `event_vendors`, `event_tasks`, `seating_charts`.
* Ability to link contacts and tasks from other modules.
* A service to generate sharable, view-only versions of timelines or itineraries.

---

#### **Edge Cases**

* **Collaboration**: The module must support real-time collaboration between two or more planners (e.g., a couple).
* **Complex RSVPs**: Handle guests who RSVP for only some parts of a multi-part event (e.g., ceremony but not reception).
* **Templating**: Creating robust and useful templates for a wide variety of major events is key to user adoption.

### **🕊️ Spirituality & Faith – Expanded Requirements**

#### **Overview**
This module offers a private, personal space for users to manage and engage with their spiritual or religious life. It is designed to be flexible and non-denominational, providing tools for practice, study, and community connection, distinct from general wellness.

---

#### **Features & Functional Requirements**

1.  **Practice & Reflection Log**
    * Log personal spiritual practices like prayer, meditation, or other rituals.
    * A dedicated, secure journal for scripture study, spiritual reflection, or recording moments of insight.

2.  **Community & Observance Calendar**
    * Track important religious holidays, festivals, and special observance days.
    * Schedule and receive reminders for community events, services, or group meetings.

3.  **Donation & Content Management**
    * Privately track charitable giving or tithing for personal records or tax purposes.
    * Create a personal library of links to inspirational texts, talks, music, or other relevant content.

---

#### **UI Requirements**

* A calm, minimalist, and configurable interface to respect diverse user preferences.
* A calendar view that integrates personal and community-level events.
* A secure and distraction-free editor for journaling and study.
* A simple ledger for tracking donations.

---

#### **Backend Requirements**

* Tables: `spiritual_practices_log`, `study_journal_entries`, `community_events`, `donation_records`.
* All user-entered journal and reflection data should be treated as highly sensitive and private, ideally with end-to-end encryption.
* A flexible event system to handle various recurring patterns for holidays.

---

#### **Edge Cases**

* **Inclusivity**: The module's language and features must be designed to be inclusive and adaptable to a wide variety of faiths, spiritualities, and secular philosophies.
* **Privacy**: Users must have absolute confidence in the privacy of their reflection logs and personal practice data.
* **Community vs. Personal**: Clearly delineate between personal logs and shared community events.

### **🌳 Genealogy & Family History – Expanded Requirements**

#### **Overview**
This module empowers users to act as their family's historian by providing tools to build, document, and explore their heritage. It serves as a centralized workspace for genealogical research and for preserving family stories for future generations.

---

#### **Features & Functional Requirements**

1.  **Family Tree Builder**
    * An interactive visual tool to build a family tree, defining relationships between individuals (parent, child, spouse).
    * Support for adding vital information (birth/death dates and places) for each person.

2.  **Ancestor Profiles & Story Curation**
    * A dedicated profile for each ancestor to store photos, biographical stories, and key life events.
    * A rich text editor to write and organize family stories, connecting them to the relevant people.

3.  **Source & Document Management**
    * Upload historical documents (census records, birth certificates, letters) and link them as sources to specific facts or events.
    * Transcribe documents and add citations.

4.  **Research & Collaboration Tools**
    * A research log to track goals, correspondence with archives, and to-do lists.
    * (Phase 2) Import/Export standard GEDCOM files to interact with other genealogy software.

---

#### **UI Requirements**

* A navigable, visually appealing family tree interface that can handle large trees.
* Clean and organized profile pages for each individual.
* A document viewer with side-by-side transcription capabilities.
* A dedicated section for managing research logs and to-do lists.

---

#### **Backend Requirements**

* Tables: `individuals`, `family_relationships`, `historical_documents`, `document_sources`, `research_logs`.
* A graph database could be considered for efficiently managing complex family relationships.
* Blob storage for a potentially large number of historical documents and photos.

---

#### **Edge Cases**

* **Data Privacy**: The system must strictly manage the privacy of living individuals in the tree, making them visible only to the user or invited collaborators.
* **Conflicting Information**: Allow users to document conflicting sources for the same fact (e.g., two different birth dates).
* **Complex Families**: The data model must support complex family structures, including adoptions, multiple marriages, and unknown parents.

---

### **5. Modularity & Customization – Expanded Requirements**

#### **Overview**
Modularity is a core architectural principle of MetaCortex, designed to combat feature bloat and empower users to tailor the application to their exact needs. By allowing users to enable or disable features as if they were plugins, the platform can serve both minimalists who want a simple tool and power users seeking a comprehensive control center. This section defines the requirements for making that customization possible.

---

#### **Features & Functional Requirements**

1.  **Module Management**
    * Users can enable or disable any non-essential module (e.g., Finance, Pet Care, Health) from a central settings panel.
    * When a module is disabled, it is completely hidden from the user interface, including navigation menus and dashboard widget options.
    * Disabling a module does not delete the user's data associated with it, allowing for seamless re-enabling in the future.

2.  **User Role Presets**
    * The platform will offer pre-configured templates that enable a specific set of modules and dashboard layouts tailored to common user roles like "Parent," "Freelancer," or "Student".
    * Users can apply a preset during onboarding or from the settings menu to quickly configure their workspace.
    * Applying a preset is a starting point; users can customize further by enabling/disabling other modules.

3.  **Customizable Dashboards**
    * Users can create multiple, custom dashboards.
    * The widget library for dashboards will only show widgets from modules the user has currently enabled.
    * A drag-and-drop interface allows users to arrange and resize widgets on a grid to build their ideal view.

4.  **Developer Extensibility (Phase 2+)**
    * The system will be built with a plugin-like architecture to allow third-party developers to create and distribute their own modules in the future.
    * This requires a well-documented public API, development guidelines, and a review process for extensions.

---

#### **UI Requirements**

* A dedicated "Modules" or "Extensions" page in the settings area, displaying each module as a card with an enable/disable toggle.
* A user-friendly dashboard editor with a grid layout and a sidebar containing all available widgets for drag-and-drop placement.
* A simple interface for previewing and applying user role presets, with a clear warning that it may change the current layout.

---

#### **Backend Requirements**

* The architecture should be inherently modular, using microservices or clearly separated code libraries for each module to facilitate independent development and deployment.
* A `user_module_settings` table to store the enabled/disabled state of each module for each user.
* A flexible schema for dashboards (e.g., using JSONB in PostgreSQL) to store the layout, type, and configuration of widgets for each dashboard.
* A versioned, public-facing API to support the future developer plugin system.

---

#### **Edge Cases**

* **Module Dependencies**: If a user attempts to disable a module that another enabled module relies on (e.g., disabling Tasks when the Calendar uses it), the system must provide a clear warning and explain the consequences.
* **Data Retention Policy**: When a module is disabled, the system should inform the user that their data is being retained but will be inaccessible. An option to permanently delete all data from a disabled module should also be provided to comply with data privacy principles.
* **Preset Overwrites**: Applying a role preset should prompt the user, warning them that it will overwrite their current dashboard layouts and module settings, and offer an option to cancel.

### **6. Integrations – Expanded Requirements**

#### **Overview**
Integrations are fundamental to MetaCortex's mission of being a centralized hub. Instead of replacing every tool, the platform aims to connect with the user's existing ecosystem of apps and services. This reduces context switching fatigue, automates data flow, and ensures MetaCortex acts as a true "life OS" that brings information together.

---

#### **Features & Functional Requirements**

1.  **Centralized Connection Management**
    * A single "Integrations" page in the settings where users can view, connect, disconnect, and manage permissions for all third-party applications.
    * Each integration must use a secure authorization method, primarily OAuth2, to ensure the user's credentials are not stored on MetaCortex servers.

2.  **Productivity & Automation Integrations**
    * **Calendars:** Two-way synchronization with Google Calendar, Outlook, and Apple Calendar. Events from external calendars appear in MetaCortex, and tasks with due dates can be pushed out.
    * **Automation Platforms:** Native integration with Zapier and IFTTT to allow for a virtually unlimited range of custom workflows.
    * **Task/Note Apps:** Provide import/export or sync functionality with popular tools like Notion, Trello, and Todoist to help new users migrate or to work in parallel.

3.  **Data-Specific Integrations**
    * **Finance:** Connect with financial data aggregators like Plaid to pull in transaction and balance data for the Financial Management module. This is a read-only connection.
    * **Health:** Integrate with platforms like Apple Health, Fitbit, and MyFitnessPal to automatically populate the Health, Diet & Fitness module with activity, sleep, and nutrition data.
    * **Shopping & Services:** Link with services like Amazon and Instacart for affiliate product suggestions or to streamline task delegation.
    * **Learning:** Connect with Kindle (for highlights), Coursera (for course progress), and YouTube (for watch history) to populate the Education & Learning module.

---

#### **UI Requirements**

* An Integrations page designed as a gallery, with a card for each available service showing its logo, a brief description, and a "Connect" button.
* Connected services should clearly display their status and provide options to "Manage Settings" or "Disconnect."
* The platform must use clear, standardized OAuth consent screens that explicitly state what data is being requested and what permissions are being granted.

---

#### **Backend Requirements**

* **SQLAlchemy Models:**
  * `Integration` (available integrations catalog)
  * `UserIntegration` (user-specific integration settings)
  * `IntegrationToken` (encrypted OAuth tokens and API keys)
* **FastAPI Routes:**
  * `GET /api/v1/integrations` (list available integrations)
  * `POST /api/v1/integrations/{integration_id}/connect`
  * `DELETE /api/v1/integrations/{integration_id}/disconnect`
  * `POST /api/v1/integrations/{integration_id}/sync`
* **Security:** 
  * Encrypted token storage using SQLAlchemy hybrid properties
  * Clerk webhooks for user deletion to clean up integration data
* **Architecture:** Adapter pattern with separate modules per integration
* **Background Jobs:** Celery tasks for:
  * Scheduled data synchronization
  * Rate limit management with Redis-based counters
  * OAuth token refresh handling

---

#### **Edge Cases**

* **API Rate Limiting**: The system must intelligently manage its API calls to third-party services to stay within their specified rate limits to avoid being blocked.
* **Authentication Failure**: If an API token expires or is revoked, the system must handle the error gracefully, pause the relevant data syncs, and notify the user to re-authenticate the connection.
* **Data Mapping**: When data from an external service does not perfectly match the MetaCortex data model, the system should have a defined strategy for mapping the data as closely as possible and logging any unmappable fields.

### **7. Technical Requirements – Expanded Requirements**

#### **Overview**
The technical architecture of MetaCortex is designed to support its core product principles: modularity, security, and long-term extensibility. The chosen stack and architectural patterns aim to provide a scalable and reliable foundation, enabling a responsive user experience while allowing for the continuous addition of new features and integrations.

---

### **7.1 Stack – Detailed Breakdown**

#### **Frontend (Web)**
* **Framework:** React.
    * **Justification:** React's component-based model is a natural fit for MetaCortex's modular design, allowing UI elements from different modules to be composed seamlessly into dashboards. Its large ecosystem and community support ensure access to a wide range of libraries and talent.
* **State Management:** A predictable, centralized state management solution like Redux Toolkit or Zustand will be used to manage complex application state, especially for user settings, notifications, and cross-module data.
* **Styling:** A solution that supports theming and customization, such as CSS-in-JS (e.g., Styled Components) or a utility-first framework (e.g., Tailwind CSS), will be implemented to support light/dark modes and user personalization.

#### **Frontend (Mobile)**
* **Framework:** React Native.
    * **Justification:** This choice enables significant code sharing (components, business logic) with the web application, accelerating development and ensuring feature parity across platforms. It also provides full access to native device capabilities required for features like push notifications and Health/HealthKit integrations.

#### **Backend**
* **Framework:** FastAPI (Python)
    * **Justification:** FastAPI provides high performance with automatic data validation and API documentation through OpenAPI/Swagger. Its Python foundation enables seamless integration with AI/ML libraries for the AI Assistant module. The framework's async support and dependency injection system align well with the modular architecture requirements.
    * **Key Features:** Automatic request/response validation with Pydantic, built-in API documentation, async/await support, and excellent performance benchmarks.

#### **Database**
* **Primary Database:** PostgreSQL.
    * **Justification:** PostgreSQL's reliability, powerful indexing, and support for extensions like PostGIS (for future location features) and full-text search make it a robust choice. Its relational nature is ideal for the highly structured data in the app (tasks, notes, financial transactions, etc.).
* **ORM (Object-Relational Mapper):** SQLAlchemy with async support.
    * **Justification:** SQLAlchemy is the most mature and feature-rich ORM for Python, with excellent PostgreSQL support. Its async capabilities (via asyncpg) align with FastAPI's async nature, enabling high-performance database operations. The ORM provides powerful query building, relationship management, and migration support through Alembic.

#### **AI Infrastructure**
* **LLM Provider:** OpenAI GPT-4 is the specified model for advanced natural language understanding and generation.
* **Vector Database:** A vector DB such as Pinecone is required.
    * **Implementation:** This will be used to store vector embeddings of the user's notes, tasks, and other personal data. When a user queries the AI Assistant, the query is first used to perform a semantic search on this vector DB to retrieve relevant context. This context is then passed to the LLM, resulting in highly personalized and accurate responses while preventing the AI from accessing irrelevant data.

#### **Authentication**
* **Strategy:** Implement OAuth2 for third-party logins (Google, Apple), passwordless magic links, and support for multi-factor authentication (2FA).
* **Implementation:** Clerk will be used as the managed authentication service.
    * **Justification:** Clerk provides a modern, developer-friendly authentication solution with excellent support for both React and FastAPI. It offers built-in user management UI components, webhook support for backend synchronization, comprehensive security features including 2FA, and seamless OAuth provider integration. Clerk's SDK reduces authentication complexity while maintaining security best practices.

---

### **7.2 Architecture – Detailed Breakdown**

#### **Modular Plugin System**
* **Description:** This is the core architectural concept. Each module (e.g., "Finance," "Health") will be developed as a self-contained package. This package will include its own API routes, database schema (migrations), and frontend components. The core application will act as a shell that dynamically loads and integrates these modules based on each user's settings, ensuring disabled modules consume no resources.

#### **Microservice-Compatible Backend**
* **Description:** While likely starting as a "modular monolith" for development simplicity, the backend will be designed to be microservice-compatible. Code will be strictly separated by domain (e.g., `task-service`, `auth-service`, `notifications-service`). This clear separation of concerns ensures that if a specific domain experiences high load (e.g., AI processing), it can be broken out into its own independently scalable microservice without requiring a full application rewrite.

#### **Background Task Queue**
* **System:** Celery with Redis as the message broker.
    * **Justification:** Celery is the de facto standard for Python task queues, with mature ecosystem support and excellent FastAPI integration. Redis provides fast, reliable message brokering and result storage. This combination is battle-tested and scales well.
* **Use Cases:** This is critical for offloading any long-running or asynchronous operations from the main application thread to maintain UI responsiveness. Key uses include:
    * Sending email and push notifications.
    * Processing data syncs with third-party APIs.
    * Generating AI summaries or performing other AI-related computations.
    * Running scheduled jobs with Celery Beat, like daily financial data aggregation or habit streak calculations.
    * Monitoring via Flower for task visibility and debugging.

#### **API-First Design**
* **Description:** The entire backend will be built as a set of well-documented REST APIs using FastAPI's automatic OpenAPI documentation. The web and mobile applications are the primary "clients" of this API. This approach enforces a clean separation between the frontend and backend, allows for independent development cycles, and makes it straightforward to add new clients (e.g., a desktop app, third-party integrations) in the future.
* **Implementation:** FastAPI automatically generates interactive API documentation (Swagger UI and ReDoc), ensuring the API is self-documenting. All endpoints will follow RESTful conventions with consistent URL patterns (/api/v1/resource), standard HTTP methods, and Pydantic models for request/response validation.

---

### **8. UX/UI Principles – Expanded Requirements**

#### **Overview**
The following principles are the foundation of the MetaCortex user experience. They serve as a guide for all design and development decisions to ensure the application is intuitive, powerful, accessible, and consistent across all platforms.

---

#### **1. Minimalist by default, customizable by power users**
This principle addresses the risk of feature bloat by ensuring the application is approachable for new users while offering the depth required by power users.

* **Minimalist Default Experience:**
    * **Onboarding:** A new user's initial view will be clean and focused, starting with only the core Task and Notes modules enabled.
    * **Interface:** The default UI will prioritize clear typography, generous whitespace, and a limited color palette to reduce cognitive load and create a calm, focused environment.
    * **Progressive Disclosure:** Advanced features and options will be kept out of the main interface, accessible through context menus or settings panels, so they don't overwhelm new users.

* **Power User Customization:**
    * **Information Density:** Users will have settings to control information density, such as a "compact mode" to see more tasks or notes on the screen at once.
    * **Custom Dashboards:** Power users can build information-rich dashboards with widgets from any enabled module, arranging them to suit their unique workflow.
    * **Advanced Controls:** Features like complex filtering, custom field creation, and detailed workflow automation will be available for users who want to move beyond the basics.

---

#### **2. Command bar (universal quick action/search)**
The command bar is a central interaction model designed for speed and efficiency. It provides a single point of entry for navigation, search, and actions.

* **Core Functionality:** Accessible via a keyboard shortcut (e.g., `Cmd/Ctrl + K`), the command bar allows users to perform most actions without leaving the keyboard.
* **Universal Search:** Instantly search across all modules—tasks, notes, projects, contacts, calendar events, etc.—from one interface.
* **Quick Actions:** Execute commands through natural language, such as "new task," "delegate 'Call plumber' to AI," "go to calendar," or "toggle dark mode."
* **Context-Aware Suggestions:** The command bar will intelligently suggest relevant actions based on the user's current view. For example, if viewing a note, it will suggest "link to task" or "add tag."

---

#### **3. Accessibility-first**
Accessibility is a non-negotiable requirement, ensuring the application is usable by people with a wide range of abilities. The platform will be designed and built in accordance with modern accessibility standards.

* **WCAG Compliance:** The application will target compliance with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
* **Specific Implementations:**
    * **Screen Reader Support:** All interactive elements, icons, and images will have proper ARIA labels and semantic HTML to be fully understandable by screen readers.
    * **Keyboard Navigation:** Every action and piece of content must be navigable and operable using only a keyboard. Focus states will be highly visible.
    * **Color & Contrast:** All color combinations for text and UI elements will meet minimum contrast ratios. A high-contrast theme will also be available.
    * **Readability:** Text will be scalable, and layouts will be responsive to ensure content remains readable when zoomed.

---

#### **4. Mobile and desktop parity**
The mobile application will be a first-class citizen, not a limited "lite" version of the desktop experience. Users should be able to perform any core function on any device.

* **Consistent Capabilities:** All core features developed for the web/desktop application will be simultaneously planned and implemented for the mobile app whenever feasible.
* **Adaptive UX:** While maintaining feature parity, the user experience will be adapted to the specific platform. For example, hover-based interactions on desktop will be translated to touch-friendly patterns like long-presses on mobile.
* **Offline Functionality:** The mobile app will be designed for robust offline use. Users can create, view, and edit items like tasks and notes while offline, with changes syncing automatically and intelligently once a connection is re-established.

---

#### **5. Light/dark theme support**
To accommodate user preference and reduce eye strain in different lighting conditions, the application will fully support both light and dark themes.

* **Implementation:** Users can manually select their preferred theme or set it to sync automatically with their operating system's appearance setting.
* **Theming Engine:** The styling will be built on a system of design tokens (variables for colors, spacing, etc.) to ensure that all components, including those from future modules, adhere to the selected theme.

---

## 9. Security & Privacy

- End-to-end encryption for notes and sensitive data
- Secure API token storage
- Exportable personal data (GDPR-friendly)
- Fine-grained privacy settings per module/task

---

## 10. Monetization Strategy

- **Freemium**: Core task/note features free
- **Subscriptions**: Unlock finance, health, AI agents, integrations
- **Marketplace Revenue**: Commission/affiliate on routed tasks
- **Power Features**: AI credits, workflow packs, smart templates

---

## 11. Timeline (High-Level Estimates)

| Phase | Feature                                | Estimate       |
|-------|----------------------------------------|----------------|
| 1     | Tasks + Notes MVP                      | 3–4 months     |
| 2     | Modular System, Habit Tracker          | 2 months       |
| 3     | Finance + ERP Dashboard                | 2–3 months     |
| 4     | AI Agent + Delegation                  | 2 months       |
| 5     | Marketplace + Service Routing          | 1–2 months     |
| 6     | Additional life modules (health, etc.) | Rolling launch |

---

## 12. Key Metrics (KPIs)

- Daily active users
- Task completion rates
- AI/task delegation counts
- Feature/module adoption rates
- Revenue per user
- Retention and user engagement trends

---

## 13. Risks & Mitigations

| Risk                              | Mitigation                                          |
|----------------------------------|------------------------------------------------------|
| Feature bloat                    | Modular architecture + customizable UI              |
| Privacy/safety concerns          | Encryption, user data control, clear policies        |
| AI task execution unreliability  | Limited scope + user verification loop               |
| Context switching fatigue        | Integrations with user's existing tools              |
| High development cost            | Incremental rollout with a strong MVP foundation     |

---

