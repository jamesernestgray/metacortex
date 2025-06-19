# Hooks

This directory contains custom React hooks for shared logic.

## Guidelines

- Hooks should start with "use" prefix
- Keep hooks focused on a single responsibility
- Document hook parameters and return values
- Include TypeScript types
- Test hooks using @testing-library/react-hooks

## Example Hooks

- `useAuth()` - Authentication state and methods
- `useDebounce()` - Debounce values
- `useLocalStorage()` - Persist data to localStorage
- `useApi()` - Generic API call handler with loading/error states
- `usePagination()` - Pagination logic