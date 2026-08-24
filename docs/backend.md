# Backend Standards

## Stack and responsibility

The backend will be a Node.js TypeScript service using Fastify and PostgreSQL. It exposes a versioned REST API for the React client.

- Fastify owns HTTP concerns: routing, request validation, authentication, authorization, response serialization, request IDs, and error mapping.
- Feature services own use-case orchestration and permission checks.
- Repositories own parameterized read queries and simple feature-owned persistence.
- PostgreSQL constraints and PL/pgSQL functions own data integrity and state-changing financial or inventory workflows.
- The backend never exposes database errors, stack traces, passwords, session tokens, or personal data in logs.

## Future feature shape

```text
features/<feature>/
  <feature>.routes.ts       # route registration
  <feature>.handler.ts      # HTTP-to-use-case mapping
  <feature>.service.ts      # application use cases
  <feature>.repository.ts   # feature-owned read/simple persistence queries
  <feature>.schema.ts       # request/response validation schemas
  <feature>.types.ts        # feature-local types
  <feature>.test.ts         # focused feature tests
  index.ts                  # deliberate public exports only
```

Use this shape only when a file has a real responsibility. Small features may combine a handler and service until separation makes the code clearer.

## API rules

- Mount all routes under `/api/v1`.
- Use plural resources, meaningful IDs, ISO-8601 timestamps, and `date` values for business dates.
- Validate every request at the boundary. Reject unknown/invalid fields where practical.
- Use a consistent success envelope and the error format defined in [api-standards.md](api-standards.md).
- Protect every non-auth route. V1 permits authenticated Administrators only; worker profiles are not application accounts yet.
- Use HttpOnly, Secure, SameSite=Lax session cookies for browser sessions. Do not store authentication tokens in local storage.
- Add authorization in the backend even when the frontend hides an action.

## Transaction rules

- Every operation that posts stock, allocates a payment, generates/voids a settlement, consumes material, or changes a batch stage runs in one PostgreSQL transaction.
- The service calls the owning PL/pgSQL function for the authoritative write. It must not duplicate its calculation in TypeScript.
- Functions that consume balance or stock must lock the affected rows before validating availability.
- Do not use read-modify-write patterns for stock or balances outside a database transaction.
- Posted records are corrected by void/reversal or a reasoned adjustment, not destructive update/delete endpoints.

## Operational standards

- Load configuration exclusively from validated environment variables; commit an `.env.example`, never real secrets.
- Use structured logs with a request ID and feature name. Redact credentials and PII.
- Add health and readiness endpoints only when the backend is bootstrapped; they must not expose internal configuration.
- Keep database SQL parameterized. No string-built SQL, including dynamic filtering or ordering.
- Write unit tests for services and integration tests against PostgreSQL for every transactional workflow.
