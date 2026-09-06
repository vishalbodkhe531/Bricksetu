# Implementation Plan: Daily Work Tracking for Marathi Worker Categories

This plan outlines the database model, service layer, and user interface for recording daily work entries tailored to each Marathi worker category in brick kiln operations.

---

## Business Requirements & Work Metrics

In brick kiln operations, work metrics and compensation structures differ significantly by worker category:

| Worker Category | Role / Marathi Name | Work Unit / Metric | Calculation Formula | Example Entry |
| :--- | :--- | :--- | :--- | :--- |
| **AALYAWALE** | **आल्यावाले** (Pathaiwala) | Raw Bricks Moulded (नग) | $\text{Qty} \times (\frac{\text{Rate per 1K}}{1000})$ | 2,500 raw bricks @ ₹450/1K = ₹1,125.00 |
| **KACHA_MAAL** | **कच्चा माल मजूर** (Raw Material Handler) | Raw Bricks Transported/Fed to Kiln (नग) | $\text{Qty} \times (\frac{\text{Rate per 1K}}{1000})$ or Daily Shift | 12,000 raw bricks @ ₹400/1K = ₹4,800.00 |
| **PAKKA_MAAL** | **पक्का माल मजूर** (Finished Goods Loader) | Burnt Bricks Loaded/Unloaded (नग) | $\text{Qty} \times (\frac{\text{Rate per 1K}}{1000})$ or Per Truck | 8,000 burnt bricks @ ₹500/1K = ₹4,000.00 |
| **BHATKAR** | **भटकर** (Kiln Firing Crew) | Firing Shifts / Days worked (Shift / दिवस) | $\text{Shifts} \times \text{Rate per Shift}$ | 1.5 shifts @ ₹600/shift = ₹900.00 |

---

## User Review Required

> [!IMPORTANT]
> **Database Schema Architecture Choice**
> We currently have a `daily_moulding_logs` table in `production.prisma`. We propose upgrading or replacing it with a unified `daily_work_logs` table in the `workers` schema to support all 4 categories, tracking quantity, unit, applied rate, and earned amount.

> [!NOTE]
> **Bulk Daily Entry Feature**
> In addition to recording work per individual worker, we propose a **Bulk Entry Form** where supervisors can select a Date & Category (e.g. *कच्चा माल मजूर* on *2026-09-05*) and enter work output for all workers in that role in a single table view.

---

## Proposed Changes

### Database Layer (`prisma/schema/workers.prisma` or `production.prisma`)

#### [NEW] `daily_work_logs` Model

Create a unified table for recording all daily worker activities:

```prisma
model daily_work_logs {
  id                  String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  business_unit_id    String       @db.Uuid
  worker_id           String       @db.Uuid
  work_date           DateTime     @db.Date
  category            String       @db.VarChar(50) // AALYAWALE, BHATKAR, KACHA_MAAL, PAKKA_MAAL
  
  // Work Output Metrics
  quantity            Decimal      @db.Decimal(10, 2) // Brick count (e.g. 2500.00) or Shift count (e.g. 1.50)
  unit                String       @db.VarChar(20)    // BRICKS, SHIFTS, DAYS
  
  // Financial Tracking (stored in paise for precision)
  rate_paise          BigInt
  earned_amount_paise BigInt
  
  // Optional Metadata
  batch_id            String?      @db.Uuid           // Optional link to production batch
  reference_no        String?      @db.VarChar(100)   // e.g. Truck No. for Pakka Maal loading
  notes               String?
  settlement_id       String?      @db.Uuid           // Link to weekly wage settlement
  
  created_at          DateTime     @default(dbgenerated("clock_timestamp()")) @db.Timestamptz(6)
  created_by          String?      @db.Uuid

  profiles            profiles     @relation(fields: [worker_id], references: [id], onDelete: Cascade)
  business_units      business_units @relation(fields: [business_unit_id], references: [id], onDelete: NoAction)
  
  @@index([worker_id, work_date], map: "idx_work_logs_worker_date")
  @@index([business_unit_id, category, work_date], map: "idx_work_logs_bu_cat_date")
  @@schema("workers")
}
```

---

### Backend Service & API Layer

#### [NEW] `features/workers/services/daily-work.service.ts`

Implement CRUD operations & calculation helpers:
* `recordDailyWork(input)`: Validates worker category, computes `earned_amount_paise` based on unit, and inserts `daily_work_logs`.
* `recordBulkDailyWork(inputList)`: Accepts an array of entries for fast supervisor data entry.
* `getDailyWorkLogs(orgId, filters)`: Retrieves logs with optional date range, category, or worker filters.
* `deleteDailyWorkLog(id)`: Removes a log entry if not yet settled.

#### [NEW] `features/workers/schemas/daily-work.schema.ts`

Zod schemas for single and bulk work entries with category-specific validation:
* **Bricks Unit**: Requires `quantity >= 1`.
* **Shifts Unit**: Requires `quantity > 0` (supports decimals like `0.5`, `1.0`, `1.5`).

---

### Frontend UI Components & Pages

#### [NEW] `features/workers/components/RecordWorkModal.tsx`

Category-adaptive modal for logging work for a single worker:
* Automatically detects the worker's category and adapts input fields:
  * **कच्चा माल मजूर**: Input *"Bricks Served (कच्चा माल नग)"* + Rate/1K.
  * **पक्का माल मजूर**: Input *"Bricks Loaded (पक्का माल नग)"* + Vehicle No. (optional).
  * **भटकर**: Input *"Shifts Worked (शिफ्ट count)"* + Rate/Shift.
  * **आल्यावाले**: Input *"Bricks Moulded (पाथाई नग)"* + Batch selector.
* Shows live auto-calculated earnings in Rupees before submission.

#### [NEW] `features/workers/components/BulkRecordWorkSheet.tsx`

Supervisor-friendly tab/sheet on `/workers` page:
* Select Date + Select Category (e.g. *कच्चा माल मजूर*).
* Renders a spreadsheet-style table with all active workers in that category.
* Input fields for each worker to enter today's output in one screen.
* Single **"Save All Entries"** action.

#### [MODIFY] `app/(dashboard)/workers/page.tsx`

* Add a **"Record Daily Work"** button next to *"Add Worker"*.
* Show recent daily work entries tab or quick summary total for today's kiln operations.

#### [MODIFY] `app/(dashboard)/workers/[id]/page.tsx`

* Display a **"Daily Work Log & Earnings"** ledger tab showing historical entries, output quantities, rates, and accumulated earnings for settlements.

---

## Verification Plan

### Automated Verification
* `npx prisma db push` or `npx prisma migrate dev` to update database schema.
* Type-check project with `npx tsc --noEmit`.

### Manual Verification
1. Open `/workers` page.
2. Select worker with category **कच्चा माल मजूर** and record 5,000 raw bricks served @ ₹400/1K $\rightarrow$ Verify earnings calculated as ₹2,000.00.
3. Select worker with category **भटकर** and record 1.5 shifts @ ₹600/shift $\rightarrow$ Verify earnings calculated as ₹900.00.
4. Check worker profile detail page to confirm ledger entry is saved under work history.

---

## Open Questions

> [!IMPORTANT]
> 1. **Batch Linking**: For *कच्चा माल मजूर* and *पक्का माल मजूर*, should selecting a Production Batch be optional or mandatory?
> 2. **Default Rate Fallback**: If a worker's rate is changed midway through the week, should daily work entries always default to the current rate defined in `rate_history` for that date?
