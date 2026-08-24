# Feature Development Playbook

## Establish ownership

Identify one owner feature before writing code. If a requirement spans features, list each responsibility and keep each mutation in the owning feature. For example, sales owns a sale, inventory owns its stock allocation, and payments owns payment allocation.

## Define the contract first

Before a UI is built, define the input, output, validation rules, permissions, state transitions, and failure cases. Update `docs/api-standards.md` and the relevant domain documentation if the change establishes a reusable rule.

## Build from the database outward

For state-changing work:

1. Create an append-only SQL migration with constraints and indexes.
2. Add or update the owner feature's PL/pgSQL function when integrity must be atomic.
3. Add backend schemas, service orchestration, route handler, and integration tests.
4. Add the feature-local frontend API client, state, form, and responsive UI.

For read-only work, start with the feature-owned query/API contract, then build the UI.

## Keep the feature self-contained

Use a feature-local `api`, `components`, `hooks`, `schemas`, `types`, and `tests` directory only when the feature needs it. Do not create root-level `components`, `hooks`, `services`, or `utils` folders for feature code.

## Verify business safety

Every feature that affects stock, wages, payments, settlements, material costs, or reports must verify:

- validation and authorization;
- transaction/rollback behavior;
- audit event creation;
- correction/void behavior;
- empty, loading, and error states;
- mobile usability; and
- no double counting or negative balance.
