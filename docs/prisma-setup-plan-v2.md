# BrickSetu Backend Upgrade: Prisma ORM & Clean Feature Architecture (v2)

End-to-end plan for migrating BrickSetu from ad-hoc Supabase query builders to **Prisma ORM** + **Zod Validation** + **Clean Feature-Based Architecture**. This revises the original plan with security fixes and gaps that need to be closed before implementation starts.

---

## 🔴 Critical — Read First

### 1. Rotate your Supabase database password now
A real database password was written in plaintext in the original plan document. Treat it as compromised:
- Go to Supabase Dashboard → Project Settings → Database → **Reset database password**.
- Never write credentials into plan docs, chat, tickets, or code comments. Secrets belong only in `.env` (gitignored) or a secrets manager (Vercel Env Vars, Doppler, 1Password, etc.).
- Add a pre-commit hook (e.g. `gitleaks` or `git-secrets`) to catch this automatically going forward.

### 2. Row Level Security (RLS) will stop being enforced
This is the single biggest architectural gap in the original plan. Supabase's client library authenticates as the requesting user (via JWT) and Postgres RLS policies enforce row-level access. **Prisma connects directly to Postgres as a superuser/service role and does not evaluate RLS.**

Once you switch to Prisma, if you don't explicitly re-implement authorization checks in your service layer, **any query can theoretically read/write any organization's data**. This must be designed before writing feature code, not bolted on after.

**Recommended approach:**
- Every Prisma query in every service must be scoped by `organizationId` (and where relevant, `userId`/role) — no exceptions.
- Build a lightweight authorization helper used inside services, e.g. `assertOrgAccess(user, organizationId)` and `assertRole(user, ['OWNER','MANAGER'])`.
- Consider a Prisma Client Extension (or middleware) that auto-injects `organizationId` into `where` clauses for tenant-scoped models, so a missing filter fails loudly instead of silently leaking data.
- Keep Supabase RLS enabled as a defense-in-depth backstop even if Prisma is now the primary access path — don't drop policies just because Prisma bypasses them.

---

## Proposed Changes

### 1. Environment & Connection Setup

- Confirm exact pooled vs. direct connection strings from **Supabase Dashboard → Project Settings → Database → Connection String → Prisma tab** — don't hand-assemble them. Supabase typically exposes the transaction pooler on a different port (commonly `6543`) than the direct connection (`5432`); verify this in your dashboard rather than assuming.
- `.env` variables:
  - `DATABASE_URL` — pooled connection, used by the app at runtime.
  - `DIRECT_URL` — direct connection, used only by `prisma migrate` / `db pull` (DDL operations don't work well through a transaction pooler).
- Add `.env.example` with placeholder values (no real secrets) so the shape is documented for other developers.
- Validate env vars at boot with a small Zod schema (e.g. `lib/env.ts`) so missing/malformed config fails fast at startup instead of causing cryptic runtime errors.
- Confirm `.env*` is in `.gitignore` (except `.env.example`).

### 2. Prisma Setup & Dependencies

- Install `@prisma/client` and `prisma` CLI as dev dependency.
- Create `prisma/schema.prisma` — start from **introspection**, not a hand-written schema (see Migration Strategy below).
- Create singleton `lib/prisma.ts` to avoid connection exhaustion in Next.js dev mode (hot reload creates new clients otherwise):

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Schema-level best practices to apply while building it:**
- Use `Decimal` (not `Float`) for all money/rate fields (wage rates, payments, order amounts) — floating point causes real rounding errors in financial data.
- Use `@map` / `@@map` (as originally planned) to keep snake_case in Postgres and camelCase in TS.
- Add explicit `@@index` on foreign keys and common filter columns (e.g. `organizationId`, date-range fields used in attendance/production/report queries).
- Decide now whether deletions should be soft (`deletedAt DateTime?`) or hard, especially for `Worker`, `SalesOrder`, `Payment` — financial/audit history usually wants soft deletes.
- Use `@default(now())` / `@updatedAt` consistently for `createdAt`/`updatedAt`.
- For `AuditLog`, consider populating it via a Prisma Client Extension that hooks into mutating queries, rather than manually calling it from every service method (easy to forget otherwise).

### 3. Migration Strategy (this replaces the open question in the original plan)

Do **not** hand-write the schema and push it — your Supabase DB already has production data and structure.

1. Run `npx prisma db pull` against `DIRECT_URL` to introspect the existing schema into `schema.prisma`.
2. Manually clean up the introspected result: add enums (Prisma doesn't always introspect these cleanly depending on how they're defined in Postgres), relations, `@map` names, and any missing indexes.
3. Run `npx prisma format` and `npx prisma validate`.
4. Create a **baseline migration** so future changes are tracked (`npx prisma migrate resolve --applied <initial-baseline>` pattern), rather than starting `migrate dev` against a database Prisma doesn't yet "know" the history of.
5. Test the full flow against a **staging Supabase project** (or a branch DB if you use Supabase branching) — never run first-time migration commands against production.
6. Take a manual DB backup/snapshot immediately before any schema change touches production, even a "safe" one.

### 4. Centralized Utilities & Response Formatting

- `utils/api-response.ts`: `successResponse(data, message, statusCode)`, `errorResponse(message, error, statusCode)`.
- Centralized error mapping: Prisma `P2002` → 409 Conflict, `P2025` → 404 Not Found, Zod errors → 400 with field-level details, unknown errors → 500 (never leak raw DB error messages to the client).
- Add structured logging (e.g. `pino`) so errors in production are traceable — plain `console.log` won't scale once this is multi-feature.
- Consider wiring up an error-tracking service (Sentry or similar) at the same time, since you're already touching the global error handler.

### 5. Feature-Based Backend Restructuring

Each feature in `features/[feature]/` follows a 4-tier structure:
1. `[feature].schema.ts` — Zod validation for input DTOs, query filters, route params.
2. `[feature].service.ts` — business logic + Prisma queries, **always org-scoped** (see RLS note above).
3. `[feature].controller.ts` — extracts auth user/params, calls service, returns structured JSON.
4. `[feature].types.ts` — shared TS interfaces for API handlers and hooks.

**Feature list (unchanged from original, migrating one at a time):**
- `features/workers` — worker CRUD, wage rates, advances, settlements.
- `features/production` — batches & brick types.
- `features/inventory` — raw materials, transactions, aggregated stock calc.
- `features/sales` & `features/customers` — orders, order items, customer records.
- `features/payments` — payment entries, customer summaries.
- `features/materials`, `features/transport`, `features/settings` — convert to same pattern.
- `features/reports` & `features/dashboard` — aggregation-heavy, see performance note below.

**Additions to the original plan:**
- Avoid duplicating validation logic between Zod and Prisma models — consider `zod-prisma-types` (or similar) to generate base Zod schemas from `schema.prisma`, then extend per-endpoint.
- Wrap multi-step writes in `prisma.$transaction` — e.g. creating a `SalesOrder` + `SalesOrderItem`s + decrementing inventory must be atomic, or you risk partial writes (order created but stock not deducted).
- For `reports`/`dashboard`, use `prisma.$transaction([...])` (the array form, which runs queries in parallel, not sequentially) or `Promise.all` for independent read queries — confirm this is what "parallelized" meant in the original plan, since the two APIs behave differently.

### 6. Serverless Connection Management

Since this is a Next.js app (likely deployed on Vercel), each serverless function invocation can spin up its own DB connection. Postgres has a hard connection limit, and this is a common production incident source with Prisma + serverless:
- Confirm `DATABASE_URL` goes through Supabase's connection pooler (pgbouncer), not the direct connection, for all runtime queries.
- If traffic grows, evaluate Prisma Accelerate or an external pooler for additional headroom — decide this before launch, not after a connection-exhaustion outage.
- Set a sane `connection_limit` on the pooled URL if using pgbouncer in transaction mode.

### 7. API Route Handlers

Refactor `app/api/**` routes to thin delegates to controllers (as originally planned) — no business logic in route files:
- `app/api/workers/route.ts`, `app/api/workers/[id]/route.ts`, `app/api/workers/advances/route.ts`, `app/api/workers/settlements/route.ts`
- `app/api/production/route.ts`, `app/api/inventory/route.ts`
- `app/api/customers/route.ts`, `app/api/sales-orders/route.ts`, `app/api/payments/route.ts`
- `app/api/materials/route.ts`, `app/api/transport/route.ts`, `app/api/settings/route.ts`
- `app/api/reports/[reportType]/route.ts`, `app/api/dashboard/summary/route.ts`

### 8. Testing Strategy (not in original plan)

- **Unit tests** per service (mock Prisma Client via `jest-mock-extended` or similar) — cover business logic, especially settlement/payment calculations.
- **Integration tests** against a real test database (Docker Postgres or a dedicated Supabase test project) for at least the critical write paths: sales order creation, settlement creation, inventory transactions.
- **Authorization tests** specifically — since RLS no longer protects you, write tests that assert cross-org access is rejected at the service layer.

### 9. Rollout Strategy (not in original plan)

Migrate feature-by-feature rather than a big-bang cutover:
1. Pick the lowest-risk feature first (e.g. `settings` or `materials`) to validate the whole pipeline end-to-end.
2. Run old (Supabase client) and new (Prisma) code paths side by side behind a feature flag if feasible, or merge feature-by-feature with fast rollback (git revert) as the safety net if not.
3. Migrate `sales`/`payments`/`workers` (financial/PII-sensitive) last, once the pattern is proven on lower-stakes features.
4. Monitor Prisma query logs and Postgres connection counts closely for the first 48 hours after each feature goes live.

---

## Verification Plan

### Automated Checks
1. `npx prisma validate` — schema correctness.
2. `npx prisma generate` — client types build.
3. `npx tsc --noEmit` — type safety across controllers/services/schemas.
4. `npm run build` (`next build`) — all routes build without errors.
5. **(New)** `npm test` — unit + integration suite, including authorization tests.
6. **(New)** Manual smoke test of one full flow per migrated feature against staging before merging to main.

---

## Open Questions (revised)

1. **Migration approach**: Confirmed — use `npx prisma db pull` to introspect the existing live schema first (see Migration Strategy). Please confirm you have a **staging Supabase project** to test against before this touches production.
2. **Database credentials**: Do **not** paste credentials into chat, docs, or tickets going forward. Rotate the password that was previously exposed, then store the new connection strings only in `.env` / your deployment platform's secret manager.
3. **RLS strategy**: Confirm whether you want RLS policies kept as a backstop (recommended) or removed once Prisma-side authorization is fully in place.
4. **Soft vs. hard deletes**: Which entities need soft-delete/audit history (likely `Worker`, `SalesOrder`, `Payment`) vs. which are fine with hard deletes (e.g. `RawMaterial` if unused)?
5. **Rollout pacing**: Feature-by-feature over how many weeks, and do you have a staging environment for the phased cutover, or is main → production direct?

---

## Suggested Phase Order

| Phase | Scope | Key Risk Addressed |
|---|---|---|
| 0 | Rotate password, set up `.env`/secrets, staging project | Credential exposure |
| 1 | `db pull`, schema cleanup, baseline migration on staging | Schema drift, data loss |
| 2 | `lib/prisma.ts`, `api-response.ts`, env validation, auth helper | Foundation + RLS gap |
| 3 | Migrate `settings`/`materials` (low risk) end-to-end incl. tests | Validate full pattern |
| 4 | Migrate `production`, `inventory` | Core operational data |
| 5 | Migrate `workers` (rates, advances, settlements) | Financial calculations |
| 6 | Migrate `sales`, `customers`, `payments` | Highest-sensitivity data, last |
| 7 | Migrate `reports`, `dashboard` | Aggregation performance |
| 8 | Full regression test, remove old Supabase-query code paths | Cleanup |
