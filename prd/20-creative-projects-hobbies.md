# Creative Projects & Hobbies Module

## Overview
This module provides a dedicated space for users to manage their creative endeavors and hobbies. It moves beyond generic task management to offer specialized tools for tracking creative projects—like writing a novel, producing music, or painting—from initial idea to final product.

---

## Features & Functional Requirements

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

## UI Requirements

* A main dashboard showing all creative projects and their current status.
* Project-specific views that could include a Kanban board for stages, a timeline for progress, and an inventory list.
* A visual, grid-based gallery for mood boards and finished portfolios.
* Simple logging forms for tracking time or other metrics.

---

## Backend Requirements

* Tables: `creative_projects`, `project_milestones`, `resource_inventory`, `progress_logs`.
* Blob storage for high-resolution images and other media files.
* A flexible metadata system to accommodate the different needs of various hobbies.

---

## Edge Cases

* **Project Variety**: The system must be flexible enough to handle the different workflows of a writer versus a painter versus a musician.
* **Large Files**: Manage storage and performance implications of users uploading large audio, video, or image files.
* **Collaboration**: For future phases, consider how to handle creative projects with more than one contributor.