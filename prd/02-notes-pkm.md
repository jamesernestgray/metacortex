# Notes & Personal Knowledge Management Module

## Overview
The Notes module allows users to create, edit, and organize rich text notes for journaling, task context, documentation, or knowledge capture. It should be clean, performant, and searchable, with tagging and cross-linking capabilities.

---

## Features & Functional Requirements

### 1. **Note Creation & Editing**
- Users can create a note via:
  - "+ New Note" button
  - Linked from a task
  - Imported via clipboard or file (Phase 2)
- Editor should support:
  - Rich text (WYSIWYG)
  - Markdown syntax (optional toggle)
  - Headings, lists, checkboxes, code blocks, links, images
- Auto-save draft functionality every 5 seconds or on blur

### 2. **Note Organization**
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
  - Move notes to "Archive" (not delete)

### 3. **Linking & Backlinking**
- Allow wiki-style linking using `[[Note Title]]`
- Render preview or clickable inline links
- Auto-create backlinks list on each note page

### 4. **Search**
- Full-text search of title and body
- Include tag filters in search
- Highlight matches in the UI

### 5. **Note-Task Integration**
- From task view, link to relevant notes
- From note view, show linked tasks with status

### 6. **Version History**
- Track basic edit history:
  - Timestamps, who edited, snapshot diff
- Allow user to revert to previous version

### 7. **Sharing (Phase 2)**
- Optional: Make notes shareable via public link or workspace-level visibility

---

## UI Requirements

- Editor should be distraction-free, mobile-friendly
- Notes list should allow:
  - Sorting (date created, updated, title)
  - Quick filters (tag pills, pinned toggle)
- Support split view (list on left, editor on right)
- Dark mode compatible

---

## Backend Requirements

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

## Edge Cases

- Simultaneous editing: use a last-write-wins strategy for MVP
- Tag deletion: should not delete notes, only remove tag association
- Orphaned notes: allow cleanup of untagged/unlinked notes (optional)