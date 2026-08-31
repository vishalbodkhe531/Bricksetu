# BrickSetu Environment Variables & Configuration Guide

## Overview
This document defines all environment variables required by `brick-setu`. Server secrets MUST NOT be exposed to client-side code (never prefix database credentials with `NEXT_PUBLIC_`).

## Required Environment Variables

### Database Configuration (Server-Only)
- `DATABASE_URL`: Full PostgreSQL connection URL (e.g., `postgresql://postgres:postgres@localhost:5432/bricksetu`)
- `PGHOST`: PostgreSQL host (default: `localhost`)
- `PGPORT`: PostgreSQL port (default: `5432`)
- `PGUSER`: PostgreSQL user (default: `postgres`)
- `PGPASSWORD`: PostgreSQL password
- `PGDATABASE`: Database name (default: `bricksetu`)

### Authentication & Session (Server-Only)
- `SESSION_SECRET`: Secret string used for cookie signing and cryptographic operations (minimum 32 characters).

### Application Environment (Server-Only)
- `NODE_ENV`: Application mode (`development`, `production`, `test`).

### Client Public Configuration (Public)
- `NEXT_PUBLIC_APP_NAME`: Application title (default: `BrickSetu`).
- `NEXT_PUBLIC_API_BASE_URL`: Base API URL path (default: `/api/v1`).

## Local Setup (`.env.local`)
Create a `.env.local` file in the root of `brick-setu` with your local database credentials:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bricksetu
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=bricksetu
SESSION_SECRET=bricksetu-super-secret-key-at-least-32-chars-long
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=BrickSetu
NEXT_PUBLIC_API_BASE_URL=/api/v1
```
