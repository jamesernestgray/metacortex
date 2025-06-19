# Social & Relationship Management Module

## Overview
Functioning as a "Personal CRM," this module helps users cultivate their personal and professional networks. It moves beyond a simple address book to track interactions, set reminders for follow-ups, and remember important personal details, ensuring users can maintain meaningful connections.

---

## Features & Functional Requirements

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

## UI Requirements

* A filterable and searchable contact list view.
* A detailed contact page showing their information, a timeline of past interactions, and upcoming reminders.
* A dedicated dashboard showing upcoming birthdays and reminders to reconnect.

---

## Backend Requirements

* Tables: `contacts`, `contact_interactions`, `contact_reminders`.
* A service to run daily checks for upcoming events and trigger notifications.
* API integration for contact import.

---

## Edge Cases

* **Duplicate Contacts**: Provide a tool to merge duplicate contact entries.
* **Privacy**: All notes and interaction logs must be private to the user account by default, with no option for public sharing.
* **Outdated Information**: Offer a way to easily mark a contact as inactive or update their details.