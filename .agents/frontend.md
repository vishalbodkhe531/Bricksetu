# Frontend Agent Rules

## Architecture

- Keep React application bootstrap, route composition, global providers, and global styles under `frontend/src/app`.
- Keep each business screen and its private components, hooks, schemas, types, and API calls under `frontend/src/features/<feature>`.
- Use `frontend/src/shared` only for design-system components, generic API client infrastructure, formatting helpers, and types used by multiple features.
- A route composes a feature; it must not contain the feature's business calculations.

## UX rules

- The application is responsive and optimized for Android-sized screens first, while remaining efficient on desktop.
- Daily operational forms must minimise typing, use clear labels, show units, and provide immediate validation feedback.
- Display all money in INR only after formatting integer paise received from the API. Never calculate authoritative totals in the browser.
- Show loading, empty, success, validation-error, network-error, and permission-denied states deliberately.
- Do not hide a destructive or irreversible operation behind an ambiguous label. Corrections must require a reason and a confirmation.

## Data rules

- Use typed API contracts and feature-local query/mutation hooks.
- Treat server responses as the source of truth after a mutation; refresh or update cached read models from the response.
- Do not duplicate backend business rules in form code. Client validation exists for usability, not as the source of integrity.
