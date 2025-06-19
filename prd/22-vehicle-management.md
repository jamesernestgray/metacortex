# Vehicle Management Module

## Overview
Functioning as a "digital glovebox," this module helps users manage the maintenance, documentation, and expenses associated with their vehicles. It centralizes all vehicle-related information, making ownership less stressful.

---

## Features & Functional Requirements

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

## UI Requirements

* A dashboard listing all user vehicles, with at-a-glance status indicators for upcoming service.
* A detailed profile page for each vehicle showing a timeline of its service history.
* A simple, quick-entry form for logging fuel fill-ups and other common expenses.
* A document viewer for easy access to insurance and registration on a mobile device.

---

## Backend Requirements

* Tables: `vehicles`, `service_records`, `vehicle_documents`, `vehicle_expense_logs`.
* A notification system tied to date or user-updated mileage for maintenance reminders.
* Blob storage for receipts and document photos.

---

## Edge Cases

* **Selling a Vehicle**: The system should allow a user to archive a sold vehicle, preserving its records without cluttering the main view.
* **International Use**: Accommodate different units for distance (miles/kilometers), currency, and fuel volume (gallons/liters).
* **Future Integration**: Potential future integration with OBD-II devices to automatically track mileage and engine diagnostics.