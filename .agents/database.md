# Database Agent Rules

## Migration discipline

- Add a new numbered SQL migration for every schema or stored-function change.
- Never alter a migration that could have been applied elsewhere.
- Add indexes for foreign keys and frequently filtered transaction dates where query plans justify them.
- Test migrations on a clean database and against realistic existing data before release.

## PL/pgSQL discipline

- Use PL/pgSQL for multi-record stock, payment, settlement, and batch workflows.
- Validate input, lock affected rows, verify invariants, write all dependent records, and create an audit event in the same workflow.
- Raise deliberate domain errors; the backend maps them to stable API error codes.
- Keep complex business operations out of triggers. Triggers may handle timestamps and narrowly scoped audit mechanics only.

## Data integrity

- Money is `bigint` paise; brick quantity is an integer; material quantity is fixed-scale `numeric`.
- Never permit negative available stock or an allocation beyond the outstanding/available amount.
- Posted ledger rows are immutable. Correction means a reversal, void, or adjustment with an actor and reason.
- Use parameterized SQL from Node.js and least-privilege database roles. Avoid `SECURITY DEFINER` functions unless explicitly reviewed.
