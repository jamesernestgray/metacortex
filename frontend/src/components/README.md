# Components

This directory contains reusable UI components that can be used throughout the application.

## Guidelines

- Components should be pure and focused on presentation
- Each component should have its own directory with:
  - Component file (e.g., `Button.tsx`)
  - Styles file (e.g., `Button.module.css` or styled components)
  - Test file (e.g., `Button.test.tsx`)
  - Index file for exports
- Components should accept props for customization
- Use TypeScript interfaces for prop definitions

## Example Structure

```
components/
  Button/
    index.ts
    Button.tsx
    Button.test.tsx
    Button.module.css
  Card/
    index.ts
    Card.tsx
    Card.test.tsx
    Card.module.css
```