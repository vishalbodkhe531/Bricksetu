# Backend Agent Rules

## Feature structure

Each backend feature owns its route registration, request/response schema, handler, service, repository/query code, tests, and deliberate public exports. Do not put domain behavior in Fastify plugins, global middleware, or a generic service folder.

## Request lifecycle

Route → schema validation → authentication/authorization → handler → feature service → repository or PL/pgSQL function → standard response/error mapping.

Handlers remain thin. Services orchestrate a use case. Repositories use parameterized SQL. PL/pgSQL owns integrity-critical posted workflows.

## Safety

- Authenticate all routes except explicit authentication/bootstrap endpoints.
- V1 authorizes Administrators only; never trust hidden frontend controls.
- Return stable API error codes rather than raw database exceptions.
- Use one database transaction per business mutation and preserve the request's actor ID for audit records.
- Never calculate money using floating point or write balances/stock through an unguarded update query.
- Log request IDs and feature context, but redact passwords, cookies, tokens, and personal data.
