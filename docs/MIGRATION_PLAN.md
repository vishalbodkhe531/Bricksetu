# BrickSetu Migration Plan: React/Fastify to Next.js App Router (Revised)

**Source:** `BrickSetu-old` (React + Vite SPA + Fastify + PostgreSQL)  
**Target:** `brick-setu` (Next.js 16, App Router, feature-based architecture)  
**Scope:** 100% functional and data parity, modernized UI (shadcn + Tailwind + Light/Dark theme), no Docker in this phase.

---

## 0. Key Architectural Decisions

1. **Mutation Architecture**: Use **Server Actions** (`features/<name>/actions.ts`) for internal data mutations and form submissions. Keep REST Route Handlers (`app/api/v1/...`) for reports/CSV exports and authentication endpoints.
2. **Server Runtime**: Node.js runtime (`export const runtime = "nodejs"`) across database handlers to ensure full compatibility with `pg`.
3. **Database Connection & Transactions**: Singleton `pg.Pool` on `globalThis` to prevent connection exhaustion during Next.js dev hot-reloads. Atomic multi-step operations use `withTransaction(fn)` helper.
4. **Auth Enforcement**:
   - `middleware.ts` for fast Edge cookie-presence check & route protection.
   - `requireSession()` / `withAuth()` server helper for authoritative database-backed session validation in Server Actions & API handlers.
5. **Dynamic Data Rendering**: Mark live operational routes (`dashboard`, `inventory`, `reports`) with `export const dynamic = "force-dynamic"` to ensure real-time Kiln metrics.

---

## 1. Technical Risk & Parity Mitigations

1. **Connection pool singleton**: Guard `pg.Pool` on `globalThis` to preserve connection limits.
2. **Transaction isolation**: Multi-step ops (FIFO stock deduction, weekly settlement approval, payment allocation) run inside `BEGIN/COMMIT/ROLLBACK` via `withTransaction(fn)`.
3. **Input validation**: Feature Zod schemas in `features/<name>/schema.ts` shared between client forms and server actions.
4. **Data-parity verification**: Verify batch costing, operating profit, and settlement calculations against `BrickSetu-old` query outputs.

---

## 2. Directory & App Router Structure

```text
brick-setu/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── workers/page.tsx
│   │   ├── production/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── materials/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── transport/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── v1/
│   │       ├── auth/
│   │       └── reports/[reportType]/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── workers/
│   ├── production/
│   ├── inventory/
│   ├── materials/
│   ├── sales/
│   ├── payments/
│   ├── transport/
│   ├── reports/
│   └── settings/
├── components/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── db/
│   │   ├── pool.ts
│   │   └── transaction.ts
│   ├── auth/
│   │   ├── session.ts
│   │   └── require-session.ts
│   └── validation/
├── middleware.ts
└── docs/
```

---

## 3. Build & Execution Roadmap

### Phase 1 — Foundation Infrastructure
- Create singleton DB pool (`lib/db/pool.ts`) and transaction helper (`lib/db/transaction.ts`).
- Create auth session helper (`lib/auth/session.ts`) and `middleware.ts`.
- Set up global Tailwind CSS design tokens, Theme Provider (`components/theme-provider.tsx`), and App Shell (`Sidebar`, `Header`, `MobileNav`).
- Set up shared data table components (`components/ui/data-table`).

### Phase 2 — Master Data & Authentication
- Auth login/logout flow & session cookie management.
- Settings module: Brick types, Brick grades, Expense categories, Admin users, Opening Balances wizard.

### Phase 3 — Core Kiln Operations (Dependency Order)
1. **Workers & Wages**: Worker registry, rate history, advance recording, weekly settlement generation & approval.
2. **Materials & Suppliers**: Supplier directory, material catalog, purchases log, batch material consumption.
3. **Production & Kiln Batches**: Batch setup, daily moulding log per worker, stage transitions (`MOULDING` → `DRYING` → `FIRING` → `FINISHED`).
4. **Finished Stock & Inventory**: Stock breakdown by type/grade, immutable stock ledger, manual stock adjustment with audit log.
5. **Sales & Customers**: Customer directory, sales orders, FIFO stock deduction.
6. **Payments & Financial Allocations**: Financial transactions, unallocated payment tracking, charge allocation.
7. **Transport & Vehicles**: Vehicle registry, delivery trip log, driver pay calculation.

### Phase 4 — Aggregation & Analytics
- **Reports**: Production & damage, stock movement, weekly payments, material consumption, party ledgers, transport costs, batch costing, operating profit (with CSV export & print support).
- **Dashboard**: KPI metrics cards, stock alerts, quick transaction launcher.

### Phase 5 — Quality Check & Verification
- TypeScript build check (`npm run build`).
- Verify light/dark theme consistency and mobile responsiveness (1440px, 768px, 375px).
