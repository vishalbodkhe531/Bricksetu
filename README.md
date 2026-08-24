# BrickSetu

BrickSetu is a responsive management system for a brick-kiln business. It will replace notebook-based records for production, inventory, workers, materials, suppliers, sales, payments, expenses, transport, and reporting.

## Current status

This repository is in its foundation stage. The existing React/Vite starter is intentionally untouched, and no backend, database schema, or product feature has been implemented yet.

## Technology direction

- Frontend: React, TypeScript, Vite
- Backend: Node.js, TypeScript, Fastify, REST API
- Database: PostgreSQL with PL/pgSQL for transactional business operations
- Architecture: feature-based in both frontend and backend

## Documentation

- [Product plan](PLAN.md)
- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Backend standards](docs/backend.md)
- [Database and PL/pgSQL standards](docs/database.md)
- [Domain rules](docs/domain-rules.md)
- [API standards](docs/api-standards.md)
- [Development workflow](docs/development-workflow.md)

## Repository guidance

Future contributors and coding agents must read [`.agents/AGENTS.md`](.agents/AGENTS.md) and the [agent-guidance index](.agents/README.md) before making changes. Together they form the repository's implementation rulebook.
