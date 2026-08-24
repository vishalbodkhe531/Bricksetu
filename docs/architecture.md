# Architecture

## Principle

BrickSetu uses a feature-based architecture. A feature owns one business capability end-to-end: its user interface, API routes, application logic, database access, tests, and documentation. Technical layers exist inside a feature; they are not the primary way the system is organised.

## Feature map

| Feature | Owns |
| --- | --- |
| `auth` | Administrator identity, login, sessions, access control. |
| `dashboard` | Read-only operational summaries and alerts. |
| `workers` | Worker profiles and rate history. |
| `production` | Batches, daily output, drying, firing, and damage. |
| `inventory` | Brick stock ledger, stock lots, movements, and adjustments. |
| `materials` | Material catalogue, purchases, material lots, and consumption. |
| `suppliers` | Supplier profiles and purchase-facing views. |
| `customers` | Customer profiles and sales-facing views. |
| `sales` | Brick sales and stock allocation. |
| `payments` | Incoming/outgoing payments and allocations. |
| `expenses` | Non-purchase operating expenses. |
| `settlements` | Weekly worker settlement generation and payment state. |
| `transport` | Vehicles, trips, and direct transport costs. |
| `reports` | Filtered exports and printable reporting views. |
| `settings` | Business unit, brick types, grades, payment methods, and other controlled configuration. |

`inventory`, `payments`, and `reports` are cross-cutting business capabilities, but they remain explicit features. No other feature may alter their records directly.

## Future layout

```text
frontend/src/
  app/                 # application bootstrap, route composition, providers
  features/<feature>/  # a business capability and its private UI/API state
  shared/              # genuinely reusable UI, client, utilities, and types

backend/src/
  app/                 # server bootstrap, configuration, framework plugins
  features/<feature>/  # routes, handlers, services, repositories, schemas, tests
  shared/              # database client, logging, errors, authorization primitives
  database/            # migration runner integration only; SQL remains under backend/db

backend/db/
  migrations/          # ordered, append-only SQL migrations
  functions/           # reviewed PL/pgSQL function source, grouped by owner feature
  seeds/               # non-production bootstrap/reference data
```

The layout is a target structure for implementation; do not create empty feature folders merely to mirror this document.

## Dependency rules

- `app` may compose features and shared code. It must not contain business rules.
- A feature may depend on `shared`, but must not reach into another feature's private files.
- Cross-feature work uses a documented public service/query contract. Never import another feature's repository or write its tables directly.
- `shared` is for stable reuse across at least two features. Do not turn it into a catch-all `utils` folder.
- UI components, hooks, schemas, types, API calls, and helpers that are only useful to one feature stay in that feature.
- Dashboard and reports read feature-owned data; they do not become owners of operational records.
- A feature may only change records it owns, except through a reviewed database function owned by the affected transactional feature.

## State-changing operations

Production, stock, money, and settlement operations are transactional workflows, not ordinary CRUD. Their invariants are enforced in PostgreSQL/PL/pgSQL and invoked by the owning backend feature. A frontend must never calculate or mutate authoritative balances locally.
