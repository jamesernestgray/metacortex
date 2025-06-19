# Modularity & Customization

## Overview
Modularity is a core architectural principle of MetaCortex, designed to combat feature bloat and empower users to tailor the application to their exact needs. By allowing users to enable or disable features as if they were plugins, the platform can serve both minimalists who want a simple tool and power users seeking a comprehensive control center. This section defines the requirements for making that customization possible.

---

## Features & Functional Requirements

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

## UI Requirements

* A dedicated "Modules" or "Extensions" page in the settings area, displaying each module as a card with an enable/disable toggle.
* A user-friendly dashboard editor with a grid layout and a sidebar containing all available widgets for drag-and-drop placement.
* A simple interface for previewing and applying user role presets, with a clear warning that it may change the current layout.

---

## Backend Requirements

* The architecture should be inherently modular, using microservices or clearly separated code libraries for each module to facilitate independent development and deployment.
* A `user_module_settings` table to store the enabled/disabled state of each module for each user.
* A flexible schema for dashboards (e.g., using JSONB in PostgreSQL) to store the layout, type, and configuration of widgets for each dashboard.
* A versioned, public-facing API to support the future developer plugin system.

---

## Edge Cases

* **Module Dependencies**: If a user attempts to disable a module that another enabled module relies on (e.g., disabling Tasks when the Calendar uses it), the system must provide a clear warning and explain the consequences.
* **Data Retention Policy**: When a module is disabled, the system should inform the user that their data is being retained but will be inaccessible. An option to permanently delete all data from a disabled module should also be provided to comply with data privacy principles.
* **Preset Overwrites**: Applying a role preset should prompt the user, warning them that it will overwrite their current dashboard layouts and module settings, and offer an option to cancel.