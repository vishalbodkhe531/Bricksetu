# BrickSetu Documentation

This directory is the source of truth for technical decisions made before implementation. Update the relevant document whenever a decision changes.

| Document | Purpose |
| --- | --- |
| [architecture.md](architecture.md) | Feature boundaries, dependency rules, and future repository layout. |
| [backend.md](backend.md) | Node.js/TypeScript API conventions and backend responsibilities. |
| [database.md](database.md) | PostgreSQL, SQL migration, and PL/pgSQL rules. |
| [domain-rules.md](domain-rules.md) | Non-negotiable inventory, payment, wage, and audit rules. |
| [api-standards.md](api-standards.md) | REST contract, error, pagination, and mutation conventions. |
| [development-workflow.md](development-workflow.md) | Definition of done and the safe feature-delivery workflow. |

The product scope is maintained in the repository-level [PLAN.md](../PLAN.md). These documents define *how* that scope will be implemented; they do not add application code.
