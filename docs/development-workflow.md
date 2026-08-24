# Development Workflow

## Before changing a feature

1. Read [architecture.md](architecture.md), [domain-rules.md](domain-rules.md), and the relevant `.agents` guidance.
2. Identify the single feature that owns the requested behavior.
3. Inspect existing contracts, migrations, and tests before introducing a new abstraction.
4. Write down any cross-feature interaction and confirm the owner of each state change.

## Delivery order

For a new business capability, work in this order:

1. Update the domain/API documentation if the public behavior changes.
2. Add an append-only database migration, constraints, indexes, and PL/pgSQL functions where required.
3. Add backend validation, service orchestration, routes, and tests.
4. Add frontend feature state, API client, responsive UI, and tests.
5. Verify calculated values, permission boundaries, empty/error states, and audit history.

Do not build a frontend form that relies on a backend contract or database behavior that has not been defined.

## Definition of done

A feature change is complete only when:

- feature ownership and dependencies remain clear;
- all input is validated at the API boundary and critical integrity is enforced by PostgreSQL;
- stock/money/settlement mutations are transactional and auditable;
- affected tests pass, including database integration tests for transactional workflows;
- mobile and desktop layouts handle loading, empty, validation, and failure states;
- relevant documentation, API contracts, migrations, and release notes are updated.

## Change safety

- Prefer small, focused commits and avoid mixing unrelated cleanup with a feature change.
- Do not rewrite history, edit applied migrations, or bulk-format unrelated files.
- Never add production credentials, database dumps, or generated build output to source control.
- When a requirement conflicts with these documents, record and resolve the conflict before implementing it.
