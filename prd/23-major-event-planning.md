# Major Event Planning Module

## Overview
This module provides a specialized project management suite for planning significant, multi-faceted personal events like weddings, milestone birthday parties, or large family reunions. It organizes the four key areas of event planning: guests, budget, vendors, and tasks.

---

## Features & Functional Requirements

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

## UI Requirements

* A central dashboard for each event showing a summary of RSVPs, budget status, and upcoming tasks.
* A filterable, spreadsheet-like view for the guest list.
* Visual charts and graphs to illustrate budget allocation and spending.
* A Kanban board or checklist view for tasks.

---

## Backend Requirements

* Tables: `events`, `event_guests`, `event_budget_items`, `event_vendors`, `event_tasks`, `seating_charts`.
* Ability to link contacts and tasks from other modules.
* A service to generate sharable, view-only versions of timelines or itineraries.

---

## Edge Cases

* **Collaboration**: The module must support real-time collaboration between two or more planners (e.g., a couple).
* **Complex RSVPs**: Handle guests who RSVP for only some parts of a multi-part event (e.g., ceremony but not reception).
* **Templating**: Creating robust and useful templates for a wide variety of major events is key to user adoption.