# Habit Tracker Module

## Overview
This module helps users build and maintain positive routines by making it easy and rewarding to track their habits. It focuses on visualization of progress, building streaks, and directly linking habits to the user's daily tasks and broader goals.

---

## Features & Functional Requirements

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

## UI Requirements

* A dedicated dashboard showing all tracked habits and current streaks.
* A calendar or heatmap view to visualize consistency for each habit.
* A simple, quick-action interface for logging completion (e.g., a single tap or check-in).
* Gamification elements like visually rewarding streak counters and milestone animations.

---

## Backend Requirements

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

## Edge Cases

* **Rest Days**: Allow users to configure "rest days" for a habit that won't break a streak (e.g., not exercising on a Sunday).
* **Time zones**: Ensure a "day" is calculated based on the user's local time zone.
* **Retroactive Logging**: Allow users to fill in missed logs for the past few days to maintain accuracy.