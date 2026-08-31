# Task: Separate Read Queries from Server Actions Across `features/`

## Objective

Every `features/<name>/actions.ts` file currently has `'use server'` at the top, which turns **every exported function in the file** into a network-invokable Server Action — including functions that only read data and are never triggered by a client form or button. This task splits each feature into:

- `features/<name>/queries.ts` — plain async functions, no `'use server'`, called directly by Server Components during render. Throw on error; let the page or an `error.tsx` boundary handle it.
- `features/<name>/actions.ts` — `'use server'` retained, only for functions a client actually triggers (form submit, button click). Return `ActionResult<T>`, never throw.

No behavior should change. This is a structural split, not a rewrite of query logic — reuse the existing SQL/SP calls as-is, just relocate and retype them, and apply `safeBigInt`/`safeParsePaise` wherever numeric values currently pass through unconverted (this refactor is also the fix point for those remaining BigInt bugs).

---

## The Test

For every exported function currently in an `actions.ts` file, ask:

> **Is this called from a Server Component during page render, with no client-side trigger, and does it only return data without writing anything?**

- **Yes → move to `queries.ts`.** Plain function. No `ActionResult` wrapper. No `'use server'`. Throws on failure.
- **No (a form submits it, a button click triggers it, or it writes/mutates data) → stays in `actions.ts`.** Keep `'use server'`, keep `ActionResult<T>` return type, keep try/catch with `formatPgError`.

If a mutation's result needs to be read back afterward (e.g. after creating a payment, refresh the payments list), the action should call the corresponding query function internally and include the fresh data in its `ActionResult`, rather than duplicating the query.

---

## File Structure Per Feature

```
features/<name>/
  queries.ts   // reads — plain functions, imported directly by Server Components
  actions.ts   // 'use server' — writes, or reads explicitly triggered by the client
  schema.ts    // Zod schemas (already planned)
  components/
```

---

## Refactor Template

```ts
// features/<name>/queries.ts — no 'use server'
import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/validation/schemas';

export type SomeData = { /* ... */ };

export async function getSomething(): Promise<SomeData> {
  const user = await requireSession();
  const res = await query('SELECT ...', [user.business_unit_id]);
  return {
    // map every numeric/aggregate field through safeBigInt / safeParsePaise here
  };
}
```

```ts
// app/(dashboard)/<name>/page.tsx
import { getSomething } from '@/features/<name>/queries';

export const dynamic = 'force-dynamic'; // for any frequently-changing data
export default async function Page() {
  const data = await getSomething();
  return <SomeView data={data} />;
}
```

```ts
// features/<name>/actions.ts — 'use server' stays, only for real mutations
'use server';
import { ActionResult, formatPgError } from '@/lib/utils';
import { requireSession } from '@/lib/auth/require-session';
import { someSchema } from './schema';
import { revalidatePath } from 'next/cache';

export async function createSomethingAction(formData: FormData): Promise<ActionResult<void>> {
  try {
    const user = await requireSession();
    const parsed = someSchema.parse(Object.fromEntries(formData));
    await query('INSERT INTO ...', [/* ... */]);
    revalidatePath('/<name>');
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: formatPgError(err) };
  }
}
```

---

## Per-Feature Audit Checklist

Go file by file. For each, list every exported function, classify it, and move as needed.

| Feature | Likely misplaced reads (move to `queries.ts`) | Confirmed mutations (stay in `actions.ts`) | Notes |
|---|---|---|---|
| `auth` | `getCurrentUserAction` / `me` check | `loginAction`, `logoutAction` | The "who is logged in" read is called constantly (layout, header) — must not be a network-hop Server Action. |
| `dashboard` | `getDashboardSummaryAction` | — (no mutations expected here) | Already fixed as an example — verify it matches the template. |
| `inventory` | `getStockSummaryAction`, `getStockLotsAction`, `getStockLedgerAction` | `postStockAdjustmentAction` | Ledger is likely paginated — query function should accept page/cursor params. |
| `materials` | `getMaterialsAction`, `getSuppliersAction`, `getPurchasesAction` | `createSupplierAction`, `createMaterialAction`, `createPurchaseAction`, `consumeMaterialAction` | |
| `payments` | `getPaymentsAction`, `getUnpaidChargesAction` | `createPaymentAction`, `allocatePaymentAction` | Confirm the payment-number-sequence fix lives inside the create action's SQL, not in a query. |
| `production` | `getBatchesAction`, `getBatchDetailAction` | `recordMouldingLogAction`, `transitionStageAction` | `getBatchDetailAction` is the one flagged for the raw `BigInt()` bug — fixing its location and its numeric handling happen together. |
| `reports` | Case-by-case — see note below | Case-by-case | Decide per report type: filter-driven page read vs. explicit "Generate/Export" trigger. |
| `sales` | `getCustomersAction`, `getSalesAction` | `postSaleAction`, `createCustomerAction` (if it mutates) | |
| `settings` | `getBrickTypesAction`, `getBrickGradesAction`, `getExpenseCategoriesAction` | `createBrickTypeAction`, `createBrickGradeAction`, `createExpenseCategoryAction`, `createAdminUserAction`, opening balance action | |
| `transport` | `getVehiclesAction`, `getTripsAction` | `createVehicleAction`, `logTripAction` | |
| `workers` | `getWorkersAction`, `getWorkerDetailAction`, `getUnsettledWorkAction` | `createWorkerAction`, rate update action, `generateSettlementAction`, `approveSettlementAction`, `voidSettlementAction` | `getUnsettledWorkAction` is the one flagged for `BigInt()` reduction — same fix-in-place-while-moving logic as production. |

### Reports — special case

Reports are read-only by nature but are usually driven by a filter form (date range, report type). Two valid patterns — pick per report, don't force one rule:
- **URL search-params driven**: filters live in the query string, the page reads `searchParams` and calls a `queries.ts` function directly on render. No action needed. Preferred when the report just displays on screen.
- **Explicit trigger**: if there's a "Generate" or "Export CSV" button that should not fire on every keystroke/filter change, keep it as an `actions.ts` entry returning `ActionResult<ReportData>` (for on-screen generate) or route through `app/api/v1/reports/[reportType]/route.ts` (for CSV download, which needs a fetchable URL, not a Server Action).

---

## Guardrails

- **Never import `queries.ts` into a `'use client'` component.** It contains server-only code (`pg` pool access) with no `'use server'` boundary — it must only be called from Server Components, other server-side files, or from within `actions.ts`.
- **Every numeric/aggregate field returned from a query must go through `safeBigInt` or `safeParsePaise`** — no raw `parseInt`, `Number()`, or passthrough of a Postgres numeric string.
- **Every mutation still needs `revalidatePath` (or `revalidateTag`)** for the page(s) it affects — this was flagged as missing outside of `inventory` in the earlier audit; confirm it's present on all of them now.
- **Parameterize `ActionResult<T>` on every action** — no bare `ActionResult` without a type argument.
- **ID/path parameters passed into either a query or an action must be validated as UUIDs via Zod** before hitting the database.

---

## Definition of Done

1. `grep -rl "'use server'" features/` shows only files that contain at least one real mutation.
2. Every function exported from an `actions.ts` file is called from a form action, `startTransition`, or equivalent client trigger somewhere in the codebase — none are called directly from a Server Component's render path.
3. Every function exported from a `queries.ts` file has zero `ActionResult` wrapping and is called only from server-side code.
4. `npx tsc --noEmit` passes.
5. Manually re-verify the dashboard, batch detail, and unsettled-work pages (the three flagged for the original `BigInt()` bug) render correct numeric values, not `NaN` or thrown errors.
