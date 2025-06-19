# Integrations

## Overview
Integrations are fundamental to MetaCortex's mission of being a centralized hub. Instead of replacing every tool, the platform aims to connect with the user's existing ecosystem of apps and services. This reduces context switching fatigue, automates data flow, and ensures MetaCortex acts as a true "life OS" that brings information together.

---

## Features & Functional Requirements

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

## UI Requirements

* An Integrations page designed as a gallery, with a card for each available service showing its logo, a brief description, and a "Connect" button.
* Connected services should clearly display their status and provide options to "Manage Settings" or "Disconnect."
* The platform must use clear, standardized OAuth consent screens that explicitly state what data is being requested and what permissions are being granted.

---

## Backend Requirements

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

## Edge Cases

* **API Rate Limiting**: The system must intelligently manage its API calls to third-party services to stay within their specified rate limits to avoid being blocked.
* **Authentication Failure**: If an API token expires or is revoked, the system must handle the error gracefully, pause the relevant data syncs, and notify the user to re-authenticate the connection.
* **Data Mapping**: When data from an external service does not perfectly match the MetaCortex data model, the system should have a defined strategy for mapping the data as closely as possible and logging any unmappable fields.