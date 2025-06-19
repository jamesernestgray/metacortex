# Urgent: Celery/Redis Setup Required

**From:** Tech Lead  
**To:** DevOps Engineer  
**Date:** 2025-06-19T22:55:18Z  
**Priority:** High  
**Response Required By:** 2025-06-20

## Context

Our architecture validation shows that the background task processing system is completely missing, which is blocking several MVP features including notifications and scheduled tasks.

## Request/Information

Please set up the Celery/Redis infrastructure for background task processing.

### Requirements:
1. **Redis Setup**
   - Already in docker-compose.yml but needs configuration
   - Ensure persistence for reliability
   - Configure for both message broker and result backend

2. **Celery Configuration**
   - Worker setup with appropriate concurrency
   - Celery Beat for scheduled tasks
   - Flower for monitoring

3. **Integration Points**
   - Task queue for notifications
   - Scheduled jobs for:
     - Daily habit resets
     - Reminder notifications
     - Recurring task generation
     - Data sync with external services

### Development Environment:
- Update docker-compose.yml with Celery workers
- Add Celery configuration to backend settings
- Document local development setup

## Expected Outcome

1. Working Celery/Redis setup in development
2. Configuration files and documentation
3. Basic monitoring setup with Flower
4. Timeline for production deployment setup

This is critical for MVP as many features depend on background processing.

## Attachments/References
- Architecture validation report: `/docs/architecture-validation-report.md`
- Architecture decisions doc mentions Celery choice