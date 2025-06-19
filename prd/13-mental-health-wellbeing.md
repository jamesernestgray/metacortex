# Mental Health & Wellbeing Module

## Overview
This module provides a private, secure, and supportive space for users to engage in self-reflection and track their emotional wellbeing. It combines journaling, mood logging, and mindfulness tools, with a strong emphasis on user privacy and data security.

---

## Features & Functional Requirements

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

## UI Requirements

* A calm, minimalist, and non-intrusive design.
* A quick and easy "daily check-in" prompt.
* A distraction-free editor for journaling.
* Clear and simple data visualizations for mood trends.
* A persistent, but not alarming, button to access crisis support resources.

---

## Backend Requirements

* **End-to-End Encryption (E2EE)**: The backend must be designed to be zero-knowledge. Journal and mood data must be encrypted on the client before being sent to the server. The server should never have access to the decryption keys.
* Tables: `mood_logs` (storing only encrypted blobs), `journal_entries` (encrypted blobs).
* A robust key management system for user-managed E2EE keys (e.g., a recovery phrase).
* API endpoints should only handle opaque, encrypted data.

---

## Edge Cases

* **Data Recovery**: The user must be clearly informed that if they lose their encryption key/password, their encrypted data will be irrecoverable. The system cannot offer a traditional "forgot password" reset for this data.
* **Disclaimer**: The application must display prominent disclaimers stating that it is a self-help tool and not a substitute for professional medical advice or therapy.
* **Secure Syncing**: Syncing encrypted data across a user's devices must be handled carefully to ensure the E2EE promise is maintained.