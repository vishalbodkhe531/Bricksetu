# Domain Rules

These rules keep business totals reliable across features. They apply regardless of user interface or API design.

## Access model

- V1 has Administrator application accounts only.
- Workers are personnel profiles managed by Administrators; they have no login, financial access, or data-entry access in V1.
- The future `WORKER` role must not be activated without a separate permission and workflow review.

## Production and stock

- A batch is the traceable production unit for one brick type. Daily worker output is recorded against an open batch.
- Production follows `MOULDING → DRYING → FIRING → FINISHED / DAMAGED`.
- Worker payment is based on bricks moulded at the rate effective on that work date. Later drying/firing damage does not recalculate already-earned worker wages.
- Every physical movement creates an inventory or material ledger transaction with source, date, quantity, actor, and reason where applicable.
- A stage transition, sale, or consumption must fail when it would make a lot or ledger balance negative.
- Opening balances and manual corrections are explicit adjustment transactions; they are never direct edits to a calculated balance.

## Money and ledgers

- A sale creates a customer receivable; a material purchase creates a supplier payable; an approved worker settlement creates a worker payable.
- A payment is allocated to one or more outstanding records. An advance may remain unallocated, but it must stay visible in the relevant ledger.
- A financial record cannot be marked paid by changing a free-text status alone; its payment status derives from allocations.
- General expenses are separate from material purchases and worker settlements to prevent double-counting in reports.
- Customer/supplier documents are internal records in V1. GST, tax calculations, customer invoices, and PDF generation are out of scope.

## Costing and reporting

- Batch cost includes only material consumption, worker cost, direct transport, and expenses explicitly assigned to that batch.
- Cost per 1,000 bricks uses good finished bricks as its denominator. If no good finished output exists, report the cost as unavailable rather than divide by zero.
- Sales consume finished stock lots FIFO and use the allocated lot cost for gross-margin reporting.
- Dashboard and reports are read models. They must not create, repair, or alter business records.

## Audit and correction

- Users may correct mistakes through an adjustment, reversal, or void with a mandatory reason.
- The application preserves the original record, who performed the correction, and when it occurred.
- Historical rates, posted quantities, stock movements, and payment allocations must be reproducible from stored records; do not overwrite them with current master-data values.
