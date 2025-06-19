# Types

This directory contains TypeScript type definitions and interfaces.

## Guidelines

- Organize types by domain or feature
- Use interfaces for object shapes
- Use types for unions, primitives, and utility types
- Export all types through index files
- Follow naming conventions:
  - Interfaces: `IUser`, `ITask`
  - Types: `TaskStatus`, `ApiResponse<T>`
  - Enums: `TaskPriority`

## Example Structure

```
types/
  api.types.ts      # API request/response types
  auth.types.ts     # Authentication types
  task.types.ts     # Task domain types
  common.types.ts   # Shared types
  index.ts          # Barrel export
```