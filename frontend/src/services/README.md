# Services

This directory contains API services and external integrations.

## Guidelines

- Services handle all HTTP requests to the backend API
- Each service should be a class or module with methods for different operations
- Use axios or fetch for HTTP requests
- Handle errors consistently
- Include TypeScript types for requests and responses

## Example Structure

```
services/
  api/
    index.ts          # Base API configuration
    auth.service.ts   # Authentication API calls
    task.service.ts   # Task-related API calls
  external/
    clerk.service.ts  # Clerk integration
    plaid.service.ts  # Plaid integration
```