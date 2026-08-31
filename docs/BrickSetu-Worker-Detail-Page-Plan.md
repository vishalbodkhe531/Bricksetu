# BrickSetu — Worker Detail Page Plan

Covers what the Worker Detail page should show, what's editable, profile photo/document handling, and the data layer this needs. Each item is tagged **Core** (directly implied by what you asked for) or **Suggested** (my addition — take or leave).

---

## 1. Page Purpose

Right now "Details" from the Worker Roster likely goes nowhere or shows a bare record. This page should do two jobs at once: give a **scannable summary** at the top (the "brief data" you mentioned) and hold the **full record** below it in organized sections — not one long form.

---

## 2. Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back        [Photo] Ramesh Kumar · WRK-001   [Edit]    │
│               ● Active · Moulder · +91 98765 43210        │
├─────────────────────────────────────────────────────────┤
│ [Rate/1K] [Total Bricks] [Pending Due] [Advances] [Tenure]│  ← KPI summary row
├─────────────────────────────────────────────────────────┤
│ Overview │ Rate History │ Advances │ Production │         │  ← sectioned tabs
│ Settlements │ Documents │ Notes                           │
├─────────────────────────────────────────────────────────┤
│ [ active tab content ]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Header / Identity Block — **Core**

- Profile photo — circular avatar, falls back to initials on a neutral background if no photo is set (consistent with the avatar pattern already planned for the top-bar user pill).
- Name, worker code, status badge (Active / Inactive).
- Phone number, shown with tap-to-call on mobile.
- **Edit** button — opens the edit modal (Section 6). Placed top-right, consistently with how other detail views should work across the app.
- Back button to the Worker Roster.

**Suggested addition:** a **Designation/Role** field next to status (e.g. Moulder, Kiln Fireman, Loader, Cartman) — brick kiln labor isn't one undifferentiated role, and showing it here makes the roster and detail page far more useful at a glance. Worth confirming whether your business already tracks this informally before adding it as a real field.

---

## 4. KPI Summary Row — **Core**

The "brief data" at a glance, pulled from existing data (rate, production, settlements, advances) rather than new fields:

| Card | Source |
|---|---|
| Current Rate (₹/1K) | Latest rate history entry |
| Total Bricks (lifetime or period-toggle) | Sum of moulding logs |
| Pending Due | Unsettled work minus advances, same calculation already used on the roster |
| Outstanding Advances | Sum of unadjusted advances |
| Tenure | Today − date joined |

Right-align and use tabular/mono figures for the numeric ones, per the design system plan already in place.

---

## 5. Sectioned Content

### 5.1 Overview — **Core + Suggested fields**

**Core (already implied by the app's data model):**
- Worker code, phone number, current rate, status, date joined.

**Suggested additions** — genuinely useful for a labor-heavy operation like this, not just filler:

| Field | Why |
|---|---|
| Date of birth / age | Standard for a worker record; useful for eligibility/compliance recordkeeping. |
| Gender | Standard field, useful for reporting. |
| Current address | Where the worker is staying now (often kiln-site housing). |
| Native/permanent address | Brick kiln labor is frequently seasonal and migrant — this is genuinely different from current address and worth tracking separately. |
| ID proof type + number (Aadhar, Voter ID, etc.) | Standard compliance recordkeeping for labor management. |
| Emergency contact (name, relation, phone) | Standard for on-site labor safety. |
| Bank account / UPI ID | Since wage payments and settlements already exist in the app, having payout details on the worker record avoids re-collecting this every settlement. |

> Not legal advice — just noting these are common practical fields for Indian brick-kiln labor recordkeeping. Confirm with whatever compliance process you already follow before treating any of these as mandatory.

### 5.2 Rate History — **Core**
Table: Effective Date, Rate (₹/1K), Changed By, Note. Already planned as a dialog in the original migration doc — surface it here as a tab instead of (or in addition to) a modal, since it's core to a worker's record.

### 5.3 Wage Advances — **Core**
Table: Date, Amount, Reason, Status (Pending / Adjusted), Adjusted Against (which settlement). "Give Advance" action available from this tab.

### 5.4 Production Contribution — **Suggested**
Table or simple trend: Date, Batch, Bricks Moulded, Amount Earned. Not explicitly requested, but since moulding logs already tie to `worker_id`, this is a natural, low-cost addition — shows what the worker actually produced, not just what they're owed.

### 5.5 Settlement History — **Core**
Table: Week Period, Gross Earnings, Advances Deducted, Net Paid, Status (Draft / Approved / Void), Approved By. Links out to the full settlement detail.

### 5.6 Documents — **Suggested**
Upload/view Aadhar or ID proof scan, address proof, photo. Useful for the same compliance-recordkeeping reason as the ID fields above. Skip this section entirely if it's not something you need to track digitally.

### 5.7 Notes — **Suggested**
Free-text admin notes, timestamped and attributed to whoever wrote them (a small append-only log, not a single editable text field) — useful for things like "prefers cash advances on Fridays" or "flagged for late attendance" without needing a dedicated field for every possible note.

---

## 6. Edit Functionality — **Core**

**Use a modal/drawer, not a separate page** — consistent with the rate-history and advance dialogs already planned elsewhere in the app.

**Editable in the main Edit modal:** name, phone, photo, address, ID proof, emergency contact, bank/UPI details, designation, status.

**Deliberately NOT editable from this modal:**
- **Current rate.** Rate changes must go through the existing rate-history mechanism (add a new dated entry), never an in-place overwrite — otherwise you lose the audit trail the Rate History tab depends on.
- **Deleting the worker.** Settlements and advances reference `worker_id`; hard delete would break that. Use a **Deactivate** action (soft delete via a status flag) instead, with a confirmation dialog if the worker has unsettled dues.

---

## 7. Profile Photo & Document Uploads

This needs a storage decision the earlier plans didn't cover, since they were scoped to "Postgres only" for data. Recommendation: use **Supabase Storage** for photos/documents specifically — it's a separate concern from Auth/RLS/PostgREST-for-data, so it doesn't conflict with the earlier "hosted Postgres only" decision. A private bucket (`worker-photos`, `worker-documents`) with signed URLs generated server-side keeps this consistent with your existing session-based auth rather than adopting Supabase Auth.

If you'd rather not add Supabase Storage as a dependency at all, the fallback is a local `/uploads` directory on the VPS — simpler, but no CDN and something to manage manually as it grows. Worth a quick decision before building this section.

---

## 8. Data Layer

Following the queries/actions split from the earlier refactor plan:

**New/extended schema (proposal):**
- `core.workers` — add `photo_url`, `date_of_birth`, `gender`, `address`, `native_address`, `id_proof_type`, `id_proof_number`, `emergency_contact_name`, `emergency_contact_phone`, `bank_account_number`, `bank_ifsc`, `upi_id`, `designation`, `date_joined`, `is_active`.
- `core.worker_notes` (new) — `id`, `worker_id`, `note`, `created_by`, `created_at`.
- `core.worker_documents` (new, if Section 5.6 is in scope) — `id`, `worker_id`, `document_type`, `file_url`, `uploaded_at`, `uploaded_by`.

**`features/workers/queries.ts`** (reads, per the earlier queries/actions split):
- `getWorkerDetail(id)` — worker record + latest rate + KPI aggregates.
- `getWorkerRateHistory(id)`, `getWorkerAdvances(id)`, `getWorkerSettlements(id)`, `getWorkerProductionLog(id)`, `getWorkerNotes(id)`.

**`features/workers/actions.ts`** (mutations, `'use server'`, `ActionResult<T>`, Zod-validated, `revalidatePath`):
- `updateWorkerAction` — the Edit modal's fields only, excludes rate and status changes handled below.
- `uploadWorkerPhotoAction`
- `deactivateWorkerAction` / `reactivateWorkerAction` — with the unsettled-dues confirmation check
- `addWorkerNoteAction`
- (Existing) `createWorkerAction`, rate-add action, advance action, settlement actions — unchanged, just now also invalidate this detail page's path.

All `id` params validated as UUIDs via Zod, per the earlier guardrails.

---

## 9. Responsive Behavior

Consistent with the design system plan: KPI cards go to a 2-column grid (or horizontal scroll) on mobile, tabs scroll horizontally instead of wrapping, header stacks (photo + name above status/phone), Edit button remains reachable without scrolling.

---

## 10. Ideas Worth Considering (Not Core Scope)

- **Printable worker ID card** — photo, code, QR code — useful if workers need a physical ID for site access. Easy to add later once the profile fields above exist; not needed for the first version.
- **WhatsApp quick-message shortcut** next to the phone number, since that's a common contact channel for this kind of labor management.
- **Family/linked workers** — brick kiln labor often works in family units. If pay or advances are ever tracked per family rather than strictly per individual, that's a payment-model question worth a separate conversation — not something to fold into this page's schema without confirming how your business actually handles it.
- **Attendance tracking** — not in the current feature scope at all; flagging only as a natural extension if it ever becomes relevant.

---

## 11. Implementation Checklist

1. Confirm which **Suggested** fields/sections you actually want (Section 3, 5.1, 5.6, 5.7) — trims the schema work up front.
2. Decide the photo/document storage approach (Section 7).
3. Migration: extend `core.workers`, add `worker_notes` (and `worker_documents` if in scope).
4. `features/workers/queries.ts` — detail + KPI + sub-tables.
5. `features/workers/actions.ts` — edit, photo upload, deactivate/reactivate, add note.
6. `app/(dashboard)/workers/[id]/page.tsx` — Server Component, calls the queries directly.
7. Edit modal component + photo upload component, styled per the existing design system plan.
8. Wire "Details" button on the Worker Roster to this route.
