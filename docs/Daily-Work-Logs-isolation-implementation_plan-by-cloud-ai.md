# Review + Hardened Implementation Plan
## Kachha Maal → Aalyawale & Bhatkar Auto-Cross-Logging

> This document reviews the original plan, lists concrete risks, and replaces it with an
> end-to-end plan that's safe to hand to an engineer (or a coding agent). I don't have
> access to your actual repo/schema, so where I reference existing fields (`aalyawala_id`,
> `rate_history`, `profiles`) I'm assuming they already exist as the original plan implies —
> confirm these before starting Phase 1.

---

## 1. What's already solid

- The 4-role model (`KACHA_MAAL`, `AALYAWALE`, `BHATKAR`, `PAKKA_MAAL`) is clear.
- Fixed-rate-for-Aalyawala/Bhatkar vs dynamic-rate-for-Kachha-Maal is the right business rule and is stated unambiguously.
- Recognizing that deletes need to cascade across linked logs shows the right instinct — it just needs to be extended to edits and made transactional.

## 2. Critical gaps in the current draft

| # | Gap | Why it matters |
|---|-----|-----------------|
| 1 | **No `$transaction` around the 3 inserts** | Partial writes = silently wrong ledgers. This is money — it must be all-or-nothing. |
| 2 | **No linking column actually added to the schema** | The plan *talks about* a `batch_id`/`group_id` but the "Database Schema Updates" section never adds it. Without it, cascade delete has nothing to key off. |
| 3 | **No edit/update cascade** | Only delete is handled. Editing the Kachha Maal quantity or rate must recompute and update the two derived logs in the same transaction. |
| 4 | **No guard against editing/deleting auto-generated logs directly** | If a user opens the Aalyawala's ledger and deletes their auto-generated row, the group becomes inconsistent (Kachha Maal log now has no matching Aalyawala earning). Auto-generated rows need to be **read-only** from anywhere except the primary entry's edit/delete flow. |
| 5 | **Rate is fetched, not validated for existence** | What happens if Aalyawala/Bhatkar has no active rate configured yet? The plan doesn't define this failure mode — it needs to be a hard validation error *before* any row is written, not a `null`/`0` rate silently saved. |
| 6 | **Client-submitted rate trust boundary is undefined** | Only the Kachha Maal rate should ever come from the client. The Aalyawala/Bhatkar rates must always be re-resolved server-side from `rate_history`, never accepted from the request body — otherwise a modified request could set arbitrary "fixed" rates. |
| 7 | **No server-side isolation enforcement** | "Ledger only shows own logs" is described as a UI behavior. It must be enforced in the query/service layer (filtered by the authenticated user's linked worker id + role), so a crafted API request can't pull another worker's earnings. |
| 8 | **Hard delete on financial records** | Deleting a daily work log destroys the audit trail. For money-adjacent data, soft-delete (`deleted_at`) + a visible "voided" state is the safer default. |
| 9 | **No RBAC statement for who can create Kachha Maal cross-logs** | The verification plan says "log in as Admin/Owner" but nothing in the service layer enforces this. |
| 10 | **Float/precision risk** | Rate × quantity math for real money should use `Decimal`/`Decimal.js` consistently, not JS `number`, to avoid rounding drift across 3 linked rows. |
| 11 | **Bulk entry N+1 risk** | `BulkRecordWorkSheet` doing a per-row rate lookup in a loop will be slow and can hit DB connection limits on large sheets. Rates should be prefetched in bulk. |
| 12 | **No idempotency on submit** | A double-click or retry on `recordDailyWork` could create duplicate batches. Needs a client-generated idempotency key or a debounce + server dedupe check. |
| 13 | **Same worker in multiple roles isn't guarded** | Nothing stops selecting the same person as both Aalyawala and Bhatkar (or as the Kachha Maal worker themselves). |
| 14 | **Migration approach unspecified** | `prisma db push` is fine for local iteration but production needs a tracked `prisma migrate dev` migration file with a name, so it's reviewable and reversible. |

---

## 3. Recommended schema

Minimal-change approach: keep the flat `daily_work_logs` table, add explicit linkage + provenance columns rather than inventing a separate "batch" table (that's a fine future refactor if more role-compositions get added later, but it's not needed yet).

```prisma
model daily_work_logs {
  id                String    @id @default(uuid()) @db.Uuid

  category          WorkerCategory   // KACHA_MAAL | AALYAWALE | BHATKAR | PAKKA_MAAL
  worker_id         String    @db.Uuid

  rate              Decimal   @db.Decimal(10, 2)
  physical_qty      Decimal   @db.Decimal(10, 2)
  billable_qty      Decimal   @db.Decimal(10, 2)
  earned_amount     Decimal   @db.Decimal(10, 2)

  // --- Cross-logging linkage (NEW) ---
  batch_id          String?   @db.Uuid   // shared across the 3 rows generated from one Kachha Maal entry
  is_primary        Boolean   @default(true)   // true only for the Kachha Maal row the user directly created
  is_auto_generated Boolean   @default(false)  // true for the derived Aalyawala/Bhatkar rows

  aalyawala_id      String?   @db.Uuid
  bhatkar_id        String?   @db.Uuid   // NEW field from the original plan

  // --- Audit / soft delete (NEW) ---
  created_by        String    @db.Uuid
  updated_by        String?   @db.Uuid
  deleted_at        DateTime?
  deleted_by        String?   @db.Uuid

  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  worker            profiles  @relation("daily_work_worker",    fields: [worker_id],    references: [id])
  aalyawala         profiles? @relation("daily_work_aalyawala", fields: [aalyawala_id], references: [id], onDelete: SetNull, onUpdate: NoAction)
  bhatkar           profiles? @relation("daily_work_bhatkar",   fields: [bhatkar_id],   references: [id], onDelete: SetNull, onUpdate: NoAction)

  @@index([batch_id])
  @@index([worker_id, category, deleted_at])
  @@index([bhatkar_id])
  @@index([aalyawala_id])
}
```

And on `profiles`:

```prisma
model profiles {
  // ...existing fields
  bhatkar_work_logs   daily_work_logs[] @relation("daily_work_bhatkar")
  aalyawala_work_logs daily_work_logs[] @relation("daily_work_aalyawala")
}
```

**Why `SetNull` on the worker-reference relations but soft-delete on the log itself:** if a Bhatkar's *profile* is later deleted, you still want the historical earnings row to exist (the rupee amount is already snapshotted into `earned_amount`/`rate`) — you just lose the live FK, which is fine. But if a *log row* is deleted because a data-entry mistake needs correcting, you want a reversible, audited trail — hence `deleted_at` rather than a hard `DELETE`.

---

## 4. Recommended service-layer pattern

### 4.1 Validation (Zod) — server-side, not just dropdown filtering

```ts
export const dailyWorkInputSchema = z.object({
  category: z.enum(['KACHA_MAAL', 'AALYAWALE', 'BHATKAR', 'PAKKA_MAAL']),
  worker_id: z.string().uuid(),
  aalyawala_id: z.string().uuid().optional(),
  bhatkar_id: z.string().uuid().optional(),
  rate: z.number().positive(),          // only meaningful/used for KACHA_MAAL & PAKKA_MAAL
  physical_qty: z.number().positive(),
  billable_qty: z.number().positive(),
  date: z.coerce.date(),
}).superRefine((data, ctx) => {
  if (data.category === 'KACHA_MAAL') {
    if (!data.aalyawala_id) {
      ctx.addIssue({ code: 'custom', path: ['aalyawala_id'], message: 'Aalyawala is required for Kachha Maal entries' });
    }
    if (!data.bhatkar_id) {
      ctx.addIssue({ code: 'custom', path: ['bhatkar_id'], message: 'Bhatkar is required for Kachha Maal entries' });
    }
    if (data.aalyawala_id && data.worker_id === data.aalyawala_id) {
      ctx.addIssue({ code: 'custom', path: ['aalyawala_id'], message: 'A worker cannot be their own Aalyawala' });
    }
    if (data.bhatkar_id && data.worker_id === data.bhatkar_id) {
      ctx.addIssue({ code: 'custom', path: ['bhatkar_id'], message: 'A worker cannot be their own Bhatkar' });
    }
    if (data.aalyawala_id && data.bhatkar_id && data.aalyawala_id === data.bhatkar_id) {
      ctx.addIssue({ code: 'custom', path: ['bhatkar_id'], message: 'Aalyawala and Bhatkar must be different workers' });
    }
  }
});
```

### 4.2 `recordDailyWork` — transactional, rate-locked, RBAC-checked

```ts
export async function recordDailyWork(input: unknown, ctx: AuthContext) {
  requireRole(ctx, ['ADMIN', 'OWNER']);           // RBAC — defense in depth, not just UI-hidden buttons
  const data = dailyWorkInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    if (data.category !== 'KACHA_MAAL') {
      return tx.daily_work_logs.create({ data: buildLogData(data, ctx) });
    }

    const [aalyawala, bhatkar] = await Promise.all([
      tx.profiles.findFirstOrThrow({
        where: { id: data.aalyawala_id, category: 'AALYAWALE', is_active: true },
      }).catch(() => { throw new ValidationError('Selected Aalyawala is not active or not found'); }),
      tx.profiles.findFirstOrThrow({
        where: { id: data.bhatkar_id, category: 'BHATKAR', is_active: true },
      }).catch(() => { throw new ValidationError('Selected Bhatkar is not active or not found'); }),
    ]);

    // Server-side rate resolution — NEVER trust a rate from the client for these two roles
    const [aalyawalaRate, bhatkarRate] = await Promise.all([
      getActiveFixedRate(tx, aalyawala.id),
      getActiveFixedRate(tx, bhatkar.id),
    ]);

    if (aalyawalaRate == null) throw new ValidationError(`No active rate configured for Aalyawala "${aalyawala.name}"`);
    if (bhatkarRate == null) throw new ValidationError(`No active rate configured for Bhatkar "${bhatkar.name}"`);

    const batchId = randomUUID();
    const qty = new Decimal(data.billable_qty);

    const kachhaMaalLog = await tx.daily_work_logs.create({
      data: buildLogData(data, ctx, {
        batch_id: batchId, is_primary: true, is_auto_generated: false,
        aalyawala_id: aalyawala.id, bhatkar_id: bhatkar.id,
      }),
    });

    const aalyawalaLog = await tx.daily_work_logs.create({
      data: buildLogData(
        { ...data, category: 'AALYAWALE', worker_id: aalyawala.id, rate: aalyawalaRate },
        ctx,
        { batch_id: batchId, is_primary: false, is_auto_generated: true, earned_amount: qty.mul(aalyawalaRate) },
      ),
    });

    const bhatkarLog = await tx.daily_work_logs.create({
      data: buildLogData(
        { ...data, category: 'BHATKAR', worker_id: bhatkar.id, rate: bhatkarRate },
        ctx,
        { batch_id: batchId, is_primary: false, is_auto_generated: true, earned_amount: qty.mul(bhatkarRate) },
      ),
    });

    return { kachhaMaalLog, aalyawalaLog, bhatkarLog };
  });
}
```

### 4.3 Edit — must recompute the whole batch, not just the row touched

```ts
export async function updateDailyWorkLog(logId: string, input: unknown, ctx: AuthContext) {
  requireRole(ctx, ['ADMIN', 'OWNER']);
  const data = dailyWorkUpdateSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.daily_work_logs.findUniqueOrThrow({ where: { id: logId } });

    if (existing.is_auto_generated) {
      throw new ForbiddenError('This log was auto-generated. Edit the linked Kachha Maal entry instead.');
    }

    if (!existing.batch_id) {
      return tx.daily_work_logs.update({ where: { id: logId }, data: buildLogData(data, ctx) });
    }

    // Re-resolve current fixed rates in case they changed since original entry — decide with
    // the business whether edits should use the ORIGINAL locked rate or the CURRENT rate.
    // Recommended default: keep the originally-locked rate unless aalyawala/bhatkar changed.
    const linked = await tx.daily_work_logs.findMany({ where: { batch_id: existing.batch_id } });
    const qty = new Decimal(data.billable_qty ?? existing.billable_qty);

    await tx.daily_work_logs.update({ where: { id: existing.id }, data: buildLogData(data, ctx) });

    for (const row of linked.filter(r => r.id !== existing.id)) {
      await tx.daily_work_logs.update({
        where: { id: row.id },
        data: { billable_qty: qty, earned_amount: qty.mul(row.rate), updated_by: ctx.userId },
      });
    }
  });
}
```

### 4.4 Delete — soft delete, batch-aware, blocks direct deletion of derived rows

```ts
export async function deleteDailyWorkLog(logId: string, ctx: AuthContext) {
  requireRole(ctx, ['ADMIN', 'OWNER']);

  return prisma.$transaction(async (tx) => {
    const log = await tx.daily_work_logs.findUniqueOrThrow({ where: { id: logId } });

    if (log.is_auto_generated) {
      throw new ForbiddenError('Delete the linked Kachha Maal entry to remove this group.');
    }

    const where = log.batch_id ? { batch_id: log.batch_id } : { id: logId };
    await tx.daily_work_logs.updateMany({
      where,
      data: { deleted_at: new Date(), deleted_by: ctx.userId },
    });
  });
}
```

### 4.5 Isolation at the query layer, not just the UI

```ts
export async function getWorkerLedger(workerId: string, ctx: AuthContext) {
  // If the caller is a worker-scoped account, force worker_id to their own — never trust
  // a worker_id passed from the client for a non-admin caller.
  const scopedWorkerId = ctx.role === 'WORKER' ? ctx.linkedWorkerId : workerId;

  return prisma.daily_work_logs.findMany({
    where: { worker_id: scopedWorkerId, deleted_at: null },
    orderBy: { date: 'desc' },
  });
}
```

---

## 5. Security hardening checklist (the "extra secure" options you asked about)

- [ ] **RBAC on every mutating endpoint**, checked server-side (`requireRole`), not inferred from hidden UI buttons.
- [ ] **Rate trust boundary**: Aalyawala/Bhatkar rates always re-fetched from `rate_history` server-side; client can never set them.
- [ ] **Row-level isolation** enforced in the query layer using the authenticated session's linked worker id, so a crafted request to `/api/workers/{other-worker-id}/ledger` can't leak data.
- [ ] **Soft delete** (`deleted_at`) instead of hard delete for all financial log rows; add a "restore" admin action instead of relying on backups.
- [ ] **Idempotency key** on `recordDailyWork` (client generates a UUID per submit; server rejects a repeat within a short window) to prevent duplicate batches from double-clicks or retried requests.
- [ ] **Decimal-safe math** everywhere (`Decimal.js` or Prisma `Decimal`), never floating-point `number` for rate × qty.
- [ ] **Audit trail** — `created_by`/`updated_by`/`deleted_by` on every row is enough for this scale; if you need finer granularity later, add a generic `audit_logs` table capturing before/after JSON diffs on financial tables.
- [ ] **Same-worker guard** — reject a request where `worker_id`, `aalyawala_id`, `bhatkar_id` aren't all distinct.
- [ ] **Migration review** — use named `prisma migrate dev --name add_bhatkar_cross_logging` so the SQL is reviewable in PR, not just `db push`.

---

## 6. End-to-end build plan

### Phase 0 — Confirm assumptions (½ day)
- Verify `aalyawala_id`, `rate_history` table, and existing `AALYAWALE` cross-logging code actually work the way this plan assumes (the original doc implies Aalyawala logging already exists and only Bhatkar is new — confirm that).
- Decide the two open business questions in §7 with the stakeholder before writing code.

### Phase 1 — Schema & migration
- Add `bhatkar_id`, `batch_id`, `is_primary`, `is_auto_generated`, `deleted_at`, `deleted_by`, `created_by`, `updated_by` to `daily_work_logs`.
- Add the `bhatkar_work_logs` relation to `profiles`.
- Generate a named migration, review the SQL diff, run it in a staging DB first.

### Phase 2 — Backend service layer
- Implement `getActiveFixedRate(tx, workerId)` helper (single source of truth for rate resolution, used by both create and edit).
- Implement transactional `recordDailyWork`, `updateDailyWorkLog`, `deleteDailyWorkLog` as in §4.
- Add RBAC guard + isolation-aware ledger query function.
- Add idempotency key handling on the create endpoint.

### Phase 3 — Bulk entry
- Prefetch all distinct Aalyawala/Bhatkar rates in one query (`findMany({ where: { id: { in: [...] } } })`) before looping rows — avoid N+1.
- Chunk the transaction (e.g. 25 rows per `$transaction`) so one giant sheet doesn't hold a single DB transaction open too long.
- Same idempotency-key protection as single entry.

### Phase 4 — Frontend
- `RecordWorkModal.tsx` / `EmbeddedRecordWorkForm.tsx`: add Bhatkar selector (filtered to active `BHATKAR` workers), live 3-way earnings preview, disable submit until both selections resolve a valid rate (surface "no active rate configured" inline, not as a silent failure).
- `BulkRecordWorkSheet.tsx`: same selector, applied per-row or as a sheet-wide default with per-row override.
- Ledger table (`workers/[id]/page.tsx`): add Aalyawala/Bhatkar name columns; for auto-generated rows, visually mark them (e.g. a small "auto" badge) and disable direct edit/delete — route those actions to the primary entry instead.

### Phase 5 — Testing
- Unit: `getActiveFixedRate` fallback/error paths.
- Integration (real test DB): creating a Kachha Maal entry produces exactly 3 correctly-linked, correctly-computed rows; editing the primary updates both linked rows; deleting the primary soft-deletes all 3; deleting an auto-generated row directly is rejected; duplicate submit with same idempotency key doesn't duplicate.
- Isolation test: a worker-scoped session cannot fetch another worker's ledger via direct API call.

### Phase 6 — Rollout
- Deploy schema migration during low-traffic window.
- Backfill: existing Kachha Maal entries created before this feature won't have `batch_id`/`bhatkar_id` — decide whether to leave them as historical single-role logs (recommended) rather than trying to retroactively synthesize Aalyawala/Bhatkar earnings for past work.
- Monitor first week of real entries manually against the old manual process before fully trusting automation.

---

## 7. Open business questions to settle before coding

1. **On edit, do linked logs use the rate that was locked at original entry time, or the worker's *current* fixed rate?** (Recommended: keep the originally locked rate unless the Aalyawala/Bhatkar selection itself is changed — protects against retroactively changing someone's rate history.)
2. **Can `billable_qty` differ between the Kachha Maal, Aalyawala, and Bhatkar legs of the same batch** (e.g. wastage/loss factors), or is it always identical across all three? The current plan assumes identical — confirm.
3. **Should `PAKKA_MAAL` ever need similar cross-logging in the future?** If yes, the `batch_id`/`is_primary`/`is_auto_generated` pattern above already generalizes; if the answer is "maybe," it's worth keeping the design role-agnostic rather than hardcoding `KACHA_MAAL` checks throughout.

---

*I based this entirely on the plan document you provided — I don't have access to the actual `brick-setu` repo, so field names like `profiles`, `rate_history`, and the exact shape of `dailyWorkInputSchema` are assumptions carried over from your original doc. If you share the actual `workers.prisma` and `daily-work.service.ts`, I can turn §3–§4 into an exact diff against your real code.*
