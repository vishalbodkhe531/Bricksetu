# BrickSetu API Endpoints Specification

## Overview
All API routes are served under `/api/v1/*` using Next.js App Router Route Handlers. Requests and responses use standard JSON (`Content-Type: application/json`).

## Response Standard

### Success Response (HTTP 200/201)
```json
{
  "data": { ... }
}
```

### Error Response (HTTP 400/401/403/404/500)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error explanation",
    "details": []
  }
}
```

## API Route Reference

### Auth & User Routes
- `POST /api/v1/auth/login`: Authenticates username & password. Sets `bricksetu_session` cookie.
- `POST /api/v1/auth/logout`: Clears session token and cookie.
- `GET /api/v1/auth/me`: Returns profile of currently logged-in user.
- `GET /api/v1/users`: Lists admin users for current business unit.
- `POST /api/v1/users`: Creates a new admin user account.

### Worker & Settlement Routes
- `GET /api/v1/workers`: Lists all workers.
- `POST /api/v1/workers`: Registers a new worker.
- `GET /api/v1/workers/[id]`: Returns detailed worker profile, rate history, and ledger.
- `POST /api/v1/workers/[id]/rates`: Updates worker rate-per-1000 history.
- `GET /api/v1/settlements`: Lists weekly worker settlements.
- `GET /api/v1/settlements/unsettled-work`: Lists unbilled moulding logs for date range.
- `POST /api/v1/settlements/generate`: Generates draft weekly settlement.
- `GET /api/v1/settlements/[id]`: Returns settlement details.
- `POST /api/v1/settlements/[id]/approve`: Approves a draft settlement.
- `POST /api/v1/settlements/[id]/void`: Voids a settlement.

### Production & Inventory Routes
- `GET /api/v1/batches`: Lists kiln batches.
- `POST /api/v1/batches`: Creates new batch.
- `GET /api/v1/batches/[id]`: Returns batch detail, material usage, moulding logs, and stage transitions.
- `POST /api/v1/production/moulding-logs`: Records worker moulding output.
- `POST /api/v1/batches/[id]/transitions`: Moves batch stage (`MOULDING` → `DRYING` → `FIRING` → `FINISHED`).
- `GET /api/v1/stock/summary`: Finished stock summary by type & grade.
- `GET /api/v1/stock/lots`: Active stock lot listing.
- `GET /api/v1/stock/ledger`: Immutable stock ledger.
- `POST /api/v1/stock/adjustments`: Manual stock correction with audit log.

### Material & Purchase Routes
- `GET /api/v1/materials`: Catalog of raw materials.
- `POST /api/v1/materials`: Creates material entry.
- `GET /api/v1/suppliers`: Supplier directory.
- `POST /api/v1/suppliers`: Registers new supplier.
- `GET /api/v1/purchases`: Material purchases list.
- `POST /api/v1/purchases`: Records material purchase order.
- `POST /api/v1/materials/consume`: Records material usage against a batch.

### Sales & Customer Routes
- `GET /api/v1/customers`: Customer directory.
- `POST /api/v1/customers`: Registers customer.
- `GET /api/v1/sales`: Finished brick sales list.
- `POST /api/v1/sales`: Creates brick sale order with FIFO stock deduction.

### Payments & Expense Routes
- `GET /api/v1/payments`: Financial transactions list.
- `POST /api/v1/payments`: Logs incoming/outgoing payment.
- `GET /api/v1/payments/unpaid-charges`: Unpaid sales, purchases, settlements list.
- `POST /api/v1/payments/[id]/allocations`: Allocates payment to unpaid charge.
- `GET /api/v1/expenses`: General expense transactions list.
- `POST /api/v1/expenses`: Records new general operational expense.

### Transport Routes
- `GET /api/v1/transport/vehicles`: Vehicle directory.
- `POST /api/v1/transport/vehicles`: Adds new vehicle.
- `GET /api/v1/transport/trips`: Transport trips log.
- `POST /api/v1/transport/trips`: Logs a delivery trip.

### Opening Balances & Reports Routes
- `POST /api/v1/opening-balances`: Configures opening balances wizard.
- `GET /api/v1/reports/[reportType]`: Fetches operational report data (`production-damage`, `stock-movement`, `weekly-payments`, `material-consumption`, `party-ledgers`, `transport-cost`, `batch-costing`, `operating-profit`).
