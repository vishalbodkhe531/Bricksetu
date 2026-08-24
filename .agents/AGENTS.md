# BrickSetu Architecture Rules

## Architecture

BrickSetu uses Feature-Based Architecture.

Business functionality must be organized by feature/domain,
not by technical layer alone.

## Features

Core features include:

- auth
- dashboard
- workers
- production
- inventory
- materials
- suppliers
- customers
- sales
- payments
- expenses
- settlements
- reports

## Rules

1. New business functionality must belong to an appropriate feature.
2. Do not create global folders for feature-specific components.
3. Keep feature-specific components, hooks, services, schemas,
   types and utilities inside the feature.
4. Shared code belongs only in shared/common directories.
5. Do not duplicate business logic.
6. Business calculations must be centralized.
7. Backend and frontend should follow the same domain boundaries.
8. Do not modify unrelated features.
9. Before creating a new feature, check whether an existing feature
   already owns the responsibility.
10. Keep dependencies between features explicit and minimal.