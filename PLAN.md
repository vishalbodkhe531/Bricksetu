# Brick Kiln Management System — Full V1 Plan

## Summary

Build a mobile-friendly responsive web application that replaces notebook-based operations: production, stock, workers, materials, suppliers, transport, sales, payments, expenses, ledgers, reports, and batch costing.

The app will have an Admin portal only in V1. Workers are managed as personnel records; they do not log in or enter data themselves.

## Implementation

- Create a TypeScript monorepo:
  - React + Vite frontend with large mobile-friendly forms and dashboard.
  - Node.js + TypeScript REST API.
  - PostgreSQL database with migrations, Docker local setup, validation, audit logging, and automated backups in production.
  - Use INR, Asia/Kolkata dates, integer brick quantities, and paise for all money calculations.

- Add secure Admin authentication:
  - No self-registration; an existing Admin creates additional Admin accounts.
  - Worker profiles include contact details, status, joining date, payment type, and dated rate-per-1,000-bricks history.
  - Keep a `WORKER` application role reserved for a future worker portal, but do not issue worker accounts in V1.

- Build master-data setup:
  - One seeded business unit (“Main Kiln”), with `business_unit_id` on operational records for future multi-kiln support.
  - Configurable brick types and grades, material units and reorder levels, payment methods, expense categories, customers, suppliers, vehicles, and workers.
  - Opening-balance wizard for finished brick stock, materials, customer receivables, and supplier payables before go-live.

- Implement the production and inventory flow as an immutable transaction ledger:
  - Admin creates a batch and records each worker’s daily moulding output; worker pay is calculated from total bricks made, not later damage.
  - Batch stages: `MOULDING → DRYING → FIRING → FINISHED / DAMAGED`.
  - Stage transitions cannot move more stock than exists. Firing creates finished stock by brick type/grade and separately records damaged bricks.
  - Material purchases create material-stock lots; material consumption uses FIFO lots and is attached to a batch.
  - Sales deduct finished lots by FIFO. Manual corrections require a reason, create an adjustment transaction, and are audit logged—never silently edit history.

- Implement finance, payment, and costing:
  - Purchases, sales, worker settlements, transport charges, and expenses create internal financial charges.
  - Incoming and outgoing payments are allocated to the relevant sale, purchase, or worker settlement; unallocated advances remain visible until allocated.
  - Customer, supplier, and worker ledgers derive their balances from those records rather than maintaining editable balance fields.
  - Generate weekly worker settlements from approved daily work records, prevent duplicate inclusion, and support draft, approved, partially paid, paid, and void statuses.
  - Associate material usage, worker cost, direct transport, and batch expenses with each batch. Calculate batch cost and cost per 1,000 good bricks.
  - Dashboard profit is shown as operating profit; batch-linked sales also show gross margin based on FIFO stock cost.

- Deliver the Admin interface:
  - Dashboard: today/week/month production, finished stock, sales, receivables, payables, expenses, worker dues, low-stock and overdue-payment alerts.
  - Quick daily-entry workflow for production, material purchase, sale, payment, expense, and transport trip.
  - Screens for batches, stock ledger, workers and weekly settlements, materials/suppliers, customers/sales, vehicles/trips, expenses, payments, and settings.
  - Reports with date, unit, worker, material, customer, supplier, batch, and brick-type filters:
    - daily/monthly production and damage;
    - stock movement and closing stock;
    - weekly worker payment;
    - material purchase/consumption/remaining stock;
    - sales, receivables, payables, and party ledgers;
    - transport cost;
    - batch cost, cost per 1,000 bricks, and profit.
  - Support CSV export and print-friendly report pages. Do not generate invoices, PDFs, GST calculations, WhatsApp messages, or external integrations in V1.

- Expose typed internal REST resource groups:
  - `/auth`, `/users`, `/workers`, `/batches`, `/production`, `/stock`, `/materials`, `/purchases`, `/suppliers`, `/customers`, `/sales`, `/payments`, `/settlements`, `/expenses`, `/transport`, `/reports`, and `/settings`.
  - Transaction actions include batch stage transition, stock adjustment, settlement generation/approval/voiding, and payment allocation.
  - Use database transactions and server-side authorization for every stock or financial mutation.

## Test Plan

- Verify worker pay uses the applicable historical rate and weekly settlements neither omit nor duplicate work records.
- Verify every production, stage transition, sale, purchase, consumption, payment, void, and adjustment produces correct stock and ledger balances.
- Reject negative stock, invalid batch transitions, oversold stock, invalid payment allocations, and deletion of posted financial/stock records.
- Verify FIFO material and finished-stock costing, batch cost per 1,000 bricks, and report totals.
- Test Admin-only access, audit records, responsive mobile forms, filters, exports, opening balances, and concurrent submissions.

## Assumptions and Defaults

- One active kiln/location will operate initially, but all records are structured for future multi-unit support.
- Production uses the stage-based kiln flow above; this is chosen as the default because the production-flow choice was not specified.
- The system is a responsive online web app in V1; offline/PWA sync is deferred.
- Customer and supplier activity remains internal records only: no GST, invoices, or printable bills in this release.
- English is the initial interface language; Indian currency and local business dates are used throughout.
