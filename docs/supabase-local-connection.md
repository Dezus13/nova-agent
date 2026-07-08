# Supabase Local Connection Readiness

## Purpose

This document explains how Nova Agent can be prepared for a future local-to-Supabase connection without adding runtime Supabase integration yet.

Current status:

- the application is still demo/local-only;
- Supabase is not connected in runtime code;
- no Supabase client package is added;
- no auth, API, backend, migrations or persistence logic is implemented by this document.

## Local App And Remote Database

The local app runs from this repository with the existing npm scripts:

```bash
npm install
npm run dev
```

The future Supabase database should live in a remote Supabase project. Local development should read the public Supabase connection values from a local environment file.

## Environment Files

The repository contains:

```text
.env.example
```

`.env.example` is only a template. It must not contain real project keys.

For local development, copy it to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill `.env.local` with values from the Supabase project settings:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`.env.local` is local-only and must not be committed.

The current `.gitignore` ignores `.env.*` and explicitly allows `.env.example`, so `.env.local` is kept out of Git while the safe template remains trackable.

Do not store a Supabase service role key in this frontend repository. Service role keys are server-only secrets and must never be exposed through Vite, browser code or GitHub.

## Required Variables

Future runtime integration should use only these public frontend variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

These variables are not used by the current app yet. They are documented now only for submission readiness and future Supabase setup.

## First Table To Document

The first table needed by Nova Agent is:

```text
action_plans
```

Reason:

`action_plans` is the central user-owned workflow record. It anchors the scenario, active plan state, and later connects Progress, History, User Open Questions, Checked Source Marks and User Notes.

Minimal readiness structure:

```sql
create table action_plans (
  id uuid primary key,
  owner_user_id uuid null,
  scenario_key text not null,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Column notes:

- `id`: unique Action Plan identifier.
- `owner_user_id`: nullable for the current demo; later can reference `auth.users(id)` or the app ownership table after the auth/ownership decision is closed.
- `scenario_key`: stable key for the current scenario.
- `title`: user-facing plan title.
- `status`: current Action Plan state, initially `active`.
- `created_at`: creation timestamp.
- `updated_at`: latest update timestamp.

This table is for documentation/readiness only in the current step. It is not a migration, not a runtime persistence implementation and not a replacement for the full Supabase Schema and RLS specification in `docs/specs/технические/05-supabase-schema-and-rls.md`.

Later persistence work can connect related user-owned records to `action_plans`, including:

- Progress records;
- History Events;
- User Open Questions;
- Checked Source Marks;
- User Notes.

## Boundaries

This readiness step must not add:

- real keys;
- `.env.local`;
- service role keys;
- Supabase runtime client;
- auth;
- persistence logic;
- backend API;
- migrations;
- document upload or storage.

Nova Agent remains a demo/local-only app until a separate Supabase runtime integration step is planned, audited and implemented.
