# BrickSetu Next.js Architecture Specification

## Overview
BrickSetu is built on Next.js 16 App Router using a Feature-Based Modular Architecture. It integrates fullstack functionality by pairing Next.js Client and Server components with server-side PostgreSQL database connections and PL/pgSQL stored procedures.

## Core Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Base UI / shadcn components
- **Icons**: Lucide React
- **Database**: PostgreSQL with `pg` connection pool
- **Session Management**: Cookie-based server session (`bricksetu_session`) in `app_auth.sessions`
- **Validation**: Zod schema validation

## Directory Structure

```text
brick-setu/
├── app/                  # App Router pages, nested layouts, and API Route Handlers
├── features/             # Feature modules (Components, hooks, services, types per domain)
├── components/           # Generic shared UI controls (shadcn components, dialogs, buttons)
├── lib/                  # Database pool, auth helpers, API clients, utilities
├── types/                # Shared TypeScript interfaces & domain data models
└── docs/                 # Application architecture and feature documentation
```

## Layer Architecture

### 1. Presentation Layer (`app/` & `features/`)
- **Server Components**: Default for static wrappers, shell layouts, and server data prefetching.
- **Client Components**: Used for interactive forms, modals, tables with filters, and stateful widgets.
- **Feature Modules**: Each module (e.g., `features/workers`, `features/production`) houses domain-specific components, custom hooks, and API call helpers.

### 2. API & Data Access Layer (`app/api/v1/` & `lib/db/`)
- Next.js Route Handlers (`route.ts`) expose `/api/v1/*` endpoints matching existing REST API contracts.
- Database access is handled via `lib/db/pool.ts`, which maintains a pooled client connection to PostgreSQL.
- Transactions and atomic updates leverage existing PostgreSQL functions (`app_auth`, `core`, `production`, `inventory`, `finance`).

### 3. Authentication & RBAC Layer (`lib/auth/`)
- `getSessionUser()` checks the incoming HTTP request cookies for `bricksetu_session`.
- Validates token against `app_auth.sessions` and returns authenticated user metadata (`id`, `business_unit_id`, `role`).
- API routes and Server Components check auth status before performing operations.
