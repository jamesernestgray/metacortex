# UX/UI Principles

## Overview
The following principles are the foundation of the MetaCortex user experience. They serve as a guide for all design and development decisions to ensure the application is intuitive, powerful, accessible, and consistent across all platforms.

---

## 1. Minimalist by default, customizable by power users
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

## 2. Command bar (universal quick action/search)
The command bar is a central interaction model designed for speed and efficiency. It provides a single point of entry for navigation, search, and actions.

* **Core Functionality:** Accessible via a keyboard shortcut (e.g., `Cmd/Ctrl + K`), the command bar allows users to perform most actions without leaving the keyboard.
* **Universal Search:** Instantly search across all modules—tasks, notes, projects, contacts, calendar events, etc.—from one interface.
* **Quick Actions:** Execute commands through natural language, such as "new task," "delegate 'Call plumber' to AI," "go to calendar," or "toggle dark mode."
* **Context-Aware Suggestions:** The command bar will intelligently suggest relevant actions based on the user's current view. For example, if viewing a note, it will suggest "link to task" or "add tag."

---

## 3. Accessibility-first
Accessibility is a non-negotiable requirement, ensuring the application is usable by people with a wide range of abilities. The platform will be designed and built in accordance with modern accessibility standards.

* **WCAG Compliance:** The application will target compliance with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
* **Specific Implementations:**
    * **Screen Reader Support:** All interactive elements, icons, and images will have proper ARIA labels and semantic HTML to be fully understandable by screen readers.
    * **Keyboard Navigation:** Every action and piece of content must be navigable and operable using only a keyboard. Focus states will be highly visible.
    * **Color & Contrast:** All color combinations for text and UI elements will meet minimum contrast ratios. A high-contrast theme will also be available.
    * **Readability:** Text will be scalable, and layouts will be responsive to ensure content remains readable when zoomed.

---

## 4. Mobile and desktop parity
The mobile application will be a first-class citizen, not a limited "lite" version of the desktop experience. Users should be able to perform any core function on any device.

* **Consistent Capabilities:** All core features developed for the web/desktop application will be simultaneously planned and implemented for the mobile app whenever feasible.
* **Adaptive UX:** While maintaining feature parity, the user experience will be adapted to the specific platform. For example, hover-based interactions on desktop will be translated to touch-friendly patterns like long-presses on mobile.
* **Offline Functionality:** The mobile app will be designed for robust offline use. Users can create, view, and edit items like tasks and notes while offline, with changes syncing automatically and intelligently once a connection is re-established.

---

## 5. Light/dark theme support
To accommodate user preference and reduce eye strain in different lighting conditions, the application will fully support both light and dark themes.

* **Implementation:** Users can manually select their preferred theme or set it to sync automatically with their operating system's appearance setting.
* **Theming Engine:** The styling will be built on a system of design tokens (variables for colors, spacing, etc.) to ensure that all components, including those from future modules, adhere to the selected theme.