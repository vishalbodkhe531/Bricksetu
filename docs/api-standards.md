# API Standards

## Versioning and resources

All HTTP endpoints live beneath `/api/v1`. Use resource-oriented, plural paths such as `/workers`, `/batches`, `/sales`, and `/payments`.

Use explicit action endpoints only for genuine workflows that are not ordinary resource replacement, for example:

- `POST /batches/:batchId/transitions`
- `POST /settlements/generate`
- `POST /settlements/:settlementId/approve`
- `POST /payments/:paymentId/allocations`
- `POST /stock-adjustments`

Do not use `GET` for state changes or create catch-all action endpoints such as `/do-action`.

## Response contract

Successful responses return:

```json
{ "data": {}, "meta": {} }
```

List endpoints use `meta` for pagination and filter context. Use cursor pagination by default for transaction/ledger lists; small controlled lookup lists may return all active records.

Errors return:

```json
{
  "error": {
    "code": "STOCK_INSUFFICIENT",
    "message": "The requested quantity exceeds available stock.",
    "details": []
  },
  "requestId": "..."
}
```

Error codes are stable, machine-readable constants. Messages are safe for users; validation details identify fields without exposing internal SQL or stack traces.

## HTTP semantics

- `201` for a created resource, `200` for a successful action/read, and `204` only for a safe, body-less archive action.
- `400` for malformed input, `401` for no session, `403` for forbidden actions, `404` for unavailable resources, `409` for a valid request that conflicts with business state, and `422` for valid syntax that fails domain validation.
- Never use destructive `DELETE` for posted business records. Archive master records or call an explicit void/reversal workflow.

## Contract discipline

- Keep request and response schemas with the owning backend feature and generate or share TypeScript types for the frontend.
- Expose only fields needed by the caller; do not return password hashes, internal audit metadata, or unrelated party information.
- Dates use `YYYY-MM-DD`; timestamps use UTC ISO-8601; money is returned as integer paise with a separately formatted UI value.
- Filtering, sorting, and date-range semantics must be documented for every report/list endpoint and covered by tests.
