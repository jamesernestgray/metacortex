# Critical Backend Features for MVP

**From:** Tech Lead  
**To:** Backend Engineer  
**Date:** 2025-06-19T22:55:18Z  
**Priority:** High  
**Response Required By:** 2025-06-20

## Context

Architecture validation revealed several critical backend features missing for Phase 1 MVP completion.

## Request/Information

Please prioritize implementation of the following features:

### 1. Recurring Tasks Implementation
- The database model exists but lacks implementation logic
- Need RRULE parsing and next occurrence calculation
- API endpoints for managing recurring patterns

### 2. Task Delegation Endpoints
- `POST /api/v1/tasks/{task_id}/delegate`
- Support delegation to users and AI agents
- Include acceptance workflow for human delegates

### 3. Subtasks Support
- Self-referential relationship already in model
- Need API endpoints for nested task operations
- Consider performance implications of deep nesting

### 4. Full-text Search for Notes
- Implement PostgreSQL full-text search
- Add GIN indexes for performance
- Create search endpoint: `POST /api/v1/notes/search`

## Expected Outcome

1. Technical approach for each feature
2. Estimated timelines
3. Any database migration requirements
4. API design proposals

Please coordinate with Frontend Engineer on API contracts.

## Attachments/References
- Architecture validation report: `/docs/architecture-validation-report.md`
- Current gap analysis in the report