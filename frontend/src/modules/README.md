# Modules

This directory contains feature-specific modules that encapsulate business logic and UI for major features.

## Guidelines

- Each module represents a major feature (e.g., Tasks, Notes, Habits)
- Modules are self-contained with their own:
  - Components specific to the feature
  - Services for API calls
  - State management (hooks or context)
  - Types/interfaces
- Modules can depend on shared components and services

## Example Structure

```
modules/
  tasks/
    components/
      TaskList.tsx
      TaskItem.tsx
    services/
      taskService.ts
    hooks/
      useTasks.ts
    types/
      task.types.ts
    index.ts
  notes/
    components/
    services/
    hooks/
    types/
    index.ts
```