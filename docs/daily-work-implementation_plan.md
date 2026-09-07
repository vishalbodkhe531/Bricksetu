# Implementation Plan: Daily Work Tracking for Marathi Worker Categories (Revised)

This plan covers the database model, service layer, and UI for recording daily work
for all 4 brick kiln worker categories — now including the **Pinjri counting rule**
for कच्चा माल मजूर (Kaccha Maal), and mobile-first UI guidance so supervisors can
fill this in easily from a phone at the kiln site.

---

## What Changed in This Revision

> [!IMPORTANT]
> **New: Pinjri Counting Rule for कच्चा माल मजूर**
> When a Kaccha Maal worker moves bricks to the bhatti in **Pinjris** (drying towers,
> 22 bricks each), only **20 bricks per Pinjri** are counted toward pay. The other
> 2 bricks are an accepted wastage/offer allowance. See [Section 3](#3-the-pinjri-rule-explained)
> for the full explanation and formula.

> [!NOTE]
> The rest of the plan (schema, services, UI, verification) has been restructured
> around this rule, and made mobile-friendly throughout.

---

## 1. Business Requirements & Work Metrics

| Worker Category | Role / Marathi Name | Work Unit | Formula | Example |
| :--- | :--- | :--- | :--- | :--- |
| **AALYAWALE** | आल्यावाले (Moulder) | Raw bricks moulded (नग) | Qty × (Rate/1000) | 2,500 bricks @ ₹450/1K = ₹1,125.00 |
| **KACHA_MAAL** | कच्चा माल मजूर (Raw Material Handler) | Bricks fed to kiln — by **direct count** or by **Pinjri count** | See [Section 3](#3-the-pinjri-rule-explained) | 1 Pinjri (22 bricks) → billed as 20 bricks |
| **PAKKA_MAAL** | पक्का माल मजूर (Finished Goods Loader) | Burnt bricks loaded/unloaded (नग) | Qty × (Rate/1000) or Per Truck | 8,000 bricks @ ₹500/1K = ₹4,000.00 |
| **BHATKAR** | भटकर (Kiln Firing Crew) | Firing shifts (Shift/दिवस) | Shifts × Rate/Shift | 1.5 shifts @ ₹600/shift = ₹900.00 |

---

## 2. Database Schema Decision

> [!IMPORTANT]
> **Same decision as before, now updated:** replace/upgrade `daily_moulding_logs`
> with one unified `daily_work_logs` table in the `workers` schema, plus a new
> small settings table (`work_unit_conversions`) that stores the Pinjri
> conversion ratio so it's **configurable, not hardcoded**.

---

## 3. The Pinjri Rule, Explained

**Why this matters:** Aalyawale prepares wet bricks and stacks them into a Pinjri
(a tower of 22 bricks) to dry. Later, a Kaccha Maal worker carries Pinjris (or
loose bricks) to the bhatti. When a supervisor counts work "by the Pinjri," each
Pinjri physically holds 22 bricks, but only 20 are paid for.

```mermaid
flowchart LR
  A["आल्यावाले\nMoulds wet bricks"] --> B["Stacks into Pinjri\n(1 Pinjri = 22 bricks, physical)"]
  B --> C["कच्चा माल मजूर\nCarries Pinjri to Bhatti"]
  C --> D["Supervisor enters\nPinjri count in app"]
  D --> E["App calculates:\nPhysical = Pinjris × 22\nBillable = Pinjris × 20"]
  E --> F["Earnings = Billable bricks × (Rate ÷ 1000)"]
```

**Worked example:**

| Input | Physical Bricks (22/Pinjri) | Billable Bricks (20/Pinjri) | Rate | Earnings |
| :--- | :--- | :--- | :--- | :--- |
| 45 Pinjris | 45 × 22 = 990 | 45 × 20 = 900 | ₹400/1K | 900 × 400 ÷ 1000 = **₹360.00** |

Kaccha Maal workers can still be recorded with a **direct brick count** (e.g. for
truck-loads that aren't stacked in Pinjris) — in that mode, physical = billable,
same as today.

> [!IMPORTANT]
> **Assumption made in this plan:** the 22 → 20 ratio is stored as a **configurable
> setting per kiln (business unit)**, with 22/20 as the default, rather than a fixed
> constant in code — since this "offer" allowance may vary between kilns or change
> over time. Flagged again in [Open Questions](#6-open-questions) in case you'd
> rather hardcode it.

---

## 4. Database Layer

### [NEW] `daily_work_logs` (unified table, all 4 categories)

```prisma
model daily_work_logs {
  id                     String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  business_unit_id       String         @db.Uuid
  worker_id              String         @db.Uuid
  work_date              DateTime       @db.Date
  category               String         @db.VarChar(50) // AALYAWALE, BHATKAR, KACHA_MAAL, PAKKA_MAAL

  // How the supervisor entered this record
  entry_mode             String         @db.VarChar(20) // DIRECT_COUNT, PINJRI_COUNT, SHIFT_COUNT

  // What the supervisor actually typed
  input_quantity         Decimal        @db.Decimal(10, 2) // e.g. 45 (Pinjris) or 1000 (bricks) or 1.5 (shifts)

  // Normalized figures used everywhere downstream (reports, ledgers, settlements)
  physical_quantity      Decimal        @db.Decimal(10, 2) // actual bricks moved — for production reconciliation
  billable_quantity      Decimal        @db.Decimal(10, 2) // quantity actually paid for
  unit                   String         @db.VarChar(20)    // BRICKS, SHIFTS

  // Snapshot of the conversion used at entry time (only set when entry_mode = PINJRI_COUNT)
  conversion_physical_per_unit  Int?    // e.g. 22, frozen at time of entry
  conversion_billable_per_unit  Int?    // e.g. 20, frozen at time of entry

  // Financial tracking (stored in paise for precision)
  rate_paise             BigInt
  earned_amount_paise    BigInt

  // Optional metadata
  batch_id               String?        @db.Uuid
  reference_no           String?        @db.VarChar(100) // e.g. Truck No. for Pakka Maal
  notes                  String?
  settlement_id          String?        @db.Uuid

  created_at             DateTime       @default(dbgenerated("clock_timestamp()")) @db.Timestamptz(6)
  created_by             String?        @db.Uuid

  profiles               profiles       @relation(fields: [worker_id], references: [id], onDelete: Cascade)
  business_units         business_units @relation(fields: [business_unit_id], references: [id], onDelete: NoAction)

  @@index([worker_id, work_date], map: "idx_work_logs_worker_date")
  @@index([business_unit_id, category, work_date], map: "idx_work_logs_bu_cat_date")
  @@schema("workers")
}
```

**Why store both `physical_quantity` and `billable_quantity`?**
So the kiln owner can still reconcile *actual* bricks produced/moved (for
production reports) separately from what workers were *paid* for — the two
numbers legitimately differ under the Pinjri rule, and both are useful.

**Why snapshot the conversion factors on each row?**
If the kiln later changes the ratio (say from 22/20 to 21/19), old entries must
keep the numbers they were actually paid with — same reasoning as the existing
`rate_history` fallback question already in this plan.

### [NEW] `work_unit_conversions` (configurable Pinjri-style ratios)

```prisma
model work_unit_conversions {
  id                       String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  business_unit_id         String         @db.Uuid
  category                 String         @db.VarChar(50) // KACHA_MAAL
  unit_name                String         @db.VarChar(20) // PINJRI
  physical_count_per_unit  Int            // 22
  billable_count_per_unit  Int            // 20
  effective_from           DateTime       @db.Date
  is_active                Boolean        @default(true)
  created_at               DateTime       @default(dbgenerated("clock_timestamp()")) @db.Timestamptz(6)

  business_units           business_units @relation(fields: [business_unit_id], references: [id], onDelete: Cascade)

  @@index([business_unit_id, category, unit_name, effective_from])
  @@schema("workers")
}
```

This keeps the ratio editable from a settings screen later, without a code change,
and supports per-kiln differences if you ever run more than one bhatti.

---

## 5. Backend Service & API Layer

### [NEW] `features/workers/services/daily-work.service.ts`

* `getActiveConversion(businessUnitId, category, unitName, date)` — looks up the
  Pinjri (or other unit) conversion ratio that applies on a given date.
* `recordDailyWork(input)`:
  * If `entry_mode = PINJRI_COUNT`: fetches the active conversion, computes
    `physical_quantity = input_quantity × physical_per_unit` and
    `billable_quantity = input_quantity × billable_per_unit`, and snapshots
    both factors onto the row.
  * If `entry_mode = DIRECT_COUNT`: `physical_quantity = billable_quantity = input_quantity`.
  * If `entry_mode = SHIFT_COUNT`: uses shift formula (BHATKAR), unaffected by
    the Pinjri rule.
  * Computes `earned_amount_paise` from `billable_quantity` (never from
    `physical_quantity`) and inserts the row.
* `recordBulkDailyWork(inputList)` — same logic, applied per row, for the
  supervisor's bulk entry screen.
* `getDailyWorkLogs(orgId, filters)` — filter by date range, category, worker;
  returns both physical and billable totals for reporting.
* `deleteDailyWorkLog(id)` — blocked if the log is already linked to a
  `settlement_id`.

### [NEW] `features/workers/schemas/daily-work.schema.ts`

Zod validation, branched by `entry_mode`:

| Entry Mode | Rule |
| :--- | :--- |
| `DIRECT_COUNT` | `input_quantity >= 1` (whole bricks) |
| `PINJRI_COUNT` | `input_quantity > 0`, increments of `0.5` allowed (half-Pinjri) |
| `SHIFT_COUNT` | `input_quantity > 0`, decimals allowed (`0.5`, `1.0`, `1.5`) |

---

## 6. Frontend UI — Mobile-First

Supervisors will mostly be using a phone standing near the kiln, so both screens
below are designed **phone-first**, then scaled up for tablet/desktop.

### General mobile rules applied to both screens

- **One column, stacked fields** below 640px width; grid/table layout only on
  tablet (≥768px) and desktop.
- **Segmented pill buttons** for Category and Entry Mode instead of dropdowns —
  fewer taps, thumb-friendly.
- **Numeric keypad inputs** (`inputmode="decimal"`) with **+ / – stepper
  buttons** at least 44×44px, so supervisors rarely need to type.
- **Live calculation** — physical/billable/earnings update instantly as the
  supervisor types; no "Calculate" button needed.
- **Sticky bottom action bar** for Save/Save All, so it's always reachable by
  thumb even with the keyboard open.
- **Optional fields collapsed by default** (Batch, Vehicle No., Notes) behind an
  "Add details" toggle, to keep the primary flow to 2–3 fields.

### [NEW] `features/workers/components/RecordWorkModal.tsx`

Category-adaptive modal for a single worker:

| Category | Primary Input | Secondary Input |
| :--- | :--- | :--- |
| आल्यावाले | Bricks Moulded (नग) | Batch selector (optional) |
| **कच्चा माल मजूर** | **Toggle: [ Pinjri ] / [ Direct Bricks ]**, then quantity | Rate/1K (auto-filled, editable) |
| पक्का माल मजूर | Bricks Loaded (नग) | Vehicle No. (optional) |
| भटकर | Shifts Worked | Rate/Shift (auto-filled) |

**Kaccha Maal, Pinjri mode — what the supervisor sees:**

```
Category: कच्चा माल मजूर
[ Pinjri ●] [ Direct Bricks ○]

Number of Pinjris:      [ – ]  45  [ + ]

  = 990 bricks (physical)
  = 900 bricks (billable)

Rate: ₹400 / 1000 bricks   (edit)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Earnings:  ₹ 360.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [   Save Entry   ]
```

### [NEW] `features/workers/components/BulkRecordWorkSheet.tsx`

Supervisor picks **Date + Category**, then enters output for every active
worker in that category in one screen.

- **Desktop/tablet:** spreadsheet-style table — one row per worker, columns for
  Pinjri/Direct toggle (can be set once for the whole table, with per-row
  override), quantity, live billable bricks, live earnings.
- **Mobile:** the same data as a **swipeable card per worker** instead of a
  cramped table — one worker per screen, "Next worker →" navigation, and a
  running counter ("12 of 30 entered") plus a running earnings total pinned at
  the top.
- Single **"Save All Entries"** action in the sticky bottom bar on both layouts.

### [MODIFY] `app/(dashboard)/workers/page.tsx`

* Add a **"Record Daily Work"** button next to "Add Worker" (full-width on
  mobile, inline on desktop).
* Show a "Today's Summary" card: total entries logged, total bricks (physical vs
  billable), total earnings accrued today.

### [MODIFY] `app/(dashboard)/workers/[id]/page.tsx`

* Add a **"Daily Work Log & Earnings"** ledger tab. For Kaccha Maal workers,
  show all three figures per entry — Pinjris, physical bricks, billable
  bricks — so it's clear at a glance where the numbers came from, not just a
  final total.

---

## 7. Verification Plan

### Automated

* `npx prisma db push` or `npx prisma migrate dev` to apply schema changes.
* `npx tsc --noEmit` type-check.
* Unit test: `recordDailyWork` with `entry_mode = PINJRI_COUNT`, 45 Pinjris,
  default conversion → expect `physical_quantity = 990`, `billable_quantity = 900`,
  `earned_amount_paise` matching ₹360.00 at ₹400/1K.

### Manual

1. Open `/workers` page on a phone-sized viewport and confirm the layout is
   single-column and thumb-usable.
2. Record a Kaccha Maal worker with **45 Pinjris @ ₹400/1K** → verify the app
   shows 990 physical / 900 billable and **₹360.00** earnings.
3. Record the same worker with **Direct Bricks: 1,000 @ ₹400/1K** → verify
   ₹400.00 (no conversion applied).
4. Record a Bhatkar worker with 1.5 shifts @ ₹600/shift → verify ₹900.00.
5. Open the worker's profile ledger tab and confirm both physical and billable
   figures are visible for the Pinjri entry.

---

## 8. Open Questions

> [!IMPORTANT]
> 1. **Pinjri ratio — configurable or fixed?** This plan assumes 22 physical /
>    20 billable bricks per Pinjri, stored as an editable setting per kiln. Should
>    it instead just be a fixed constant (22/20) in code, with no settings screen?
> 2. **Partial Pinjris:** should the app allow half-Pinjri entries (e.g. 45.5),
>    or should Pinjri count always be a whole number?
> 3. **Does the Pinjri rule apply anywhere else** (e.g. पक्का माल मजूर loading
>    counts), or is it specific to कच्चा माल मजूर only?
> 4. **Batch Linking:** for कच्चा माल मजूर and पक्का माल मजूर, should selecting a
>    Production Batch be optional or mandatory?
> 5. **Default Rate Fallback:** if a worker's rate changes mid-week, should
>    entries always use the rate from `rate_history` effective on that work date?
