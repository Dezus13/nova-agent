# MVP Online Demo Plan

## 1. Purpose

This plan prepares Nova Agent for an online demo without turning the MVP into
production SaaS.

The online demo has two phases:

1. Vercel Static Demo.
2. Supabase Minimal Persistence Foundation.

This document is an implementation plan only. It does not revise Product
Principles, MVP Work Plan, TS01-TS08, UI-01, Decision Records, domain entities,
roles, states, API contracts, persistence model or product scope.

No application code, dependencies, env files, Supabase code or Vercel config are
introduced by this planning step.

## 2. Sources of Truth

- `AGENTS.md`;
- `README.md`;
- `package.json`;
- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/техническая-архитектура.md`;
- `docs/карта-функций.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/specs/технические/01-content-model-and-versioning.md`;
- `docs/specs/технические/02-user-owned-workflow-model.md`;
- `docs/specs/технические/03-logical-data-model.md`;
- `docs/specs/технические/04-auth-roles-and-ownership.md`;
- `docs/specs/технические/05-supabase-schema-and-rls.md`;
- `docs/specs/технические/06-content-administration-operations.md`;
- `docs/specs/технические/07-user-owned-workflow-operations.md`;
- `docs/specs/технические/08-api-layer-specification.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/completed/`;
- `changelog/2026-06-28.md`;
- `src/domain/workflow.ts`;
- `src/data/contentRepository.ts`;
- `src/app/App.tsx`.

If this plan conflicts with a higher-priority source, the higher-priority source
wins.

## 3. Current State

The current app is local-only:

- seed content is read through `src/data/contentRepository.ts`;
- user-owned workflow state lives in React `useState` inside `src/app/App.tsx`;
- Action Plan, Progress, History Events, User Open Questions, Checked Source
  Marks and User Notes are local runtime state;
- no Supabase client exists;
- no API layer exists;
- no auth exists;
- no persistence exists;
- no routing library exists;
- no env usage exists;
- no Vercel config exists.

Current package scripts:

- `npm run dev`;
- `npm run build`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`;
- `npm run test:watch`.

Current build baseline:

- framework: Vite + React + TypeScript;
- production build command: `npm run build`;
- Vite default output directory: `dist`.

## 4. Non-Negotiable Boundaries

The online demo must preserve existing MVP boundaries:

- Nova Agent remains informational and organizational guidance;
- Nova Agent does not become an official authority tracker;
- Nova Agent does not provide legal, tax, medical or financial advice;
- Progress remains a user mark, not an official status;
- History remains internal Nova Agent history, not an official journal;
- History is not source of truth for current state;
- User Notes are not document storage;
- Checked Source Marks are not Nova Agent verification;
- User Open Questions remain questions for external verification;
- Content Admin must not access User-Owned Data;
- User-Owned Data must remain scoped to the owning user before real
  persistence is implemented.

## 5. Phase 1 - Vercel Static Demo

Goal: deploy the current Vite app on Vercel as a static demo.

Vercel settings to use:

- Framework: Vite;
- Build command: `npm run build`;
- Output directory: `dist`;
- Install command: default `npm install`;
- Env vars: none for static demo;
- Routing/fallback: default static `index.html` is enough because the app does
  not use a routing library.

Phase 1 must not add:

- Vercel config unless a later audit proves the default Vite setup is
  insufficient;
- env files;
- Supabase;
- API handlers;
- auth;
- persistence;
- routing library.

### Vercel Smoke Test

After deploy, verify on the deployment URL:

- app opens;
- user can start Action Plan;
- user can change Progress;
- user can open History;
- user can create User Open Question;
- user can mark source as checked by user;
- user can add User Note.

### Static Demo Limitation

The static demo intentionally remains local-only:

- reload loses state;
- this is acceptable only for the static online demo;
- this is not production persistence;
- the UI and demo notes must not imply reload survival.

## 6. Phase 2 - Supabase Minimal Persistence Foundation

Goal: prepare minimal persistence foundation without turning Nova Agent into full
SaaS.

The first persisted data should be only user-owned workflow data required to
resume the current MVP flow:

- active Action Plan;
- Progress records;
- History Events;
- User Open Questions;
- Checked Source Marks;
- User Notes.

The first persistence phase must not store:

- completed plans;
- content admin drafts;
- document uploads;
- files;
- official answers;
- external authority status;
- analytics or dashboard metrics.

Persistence invariants:

- Progress remains source of truth for current step state;
- History remains append-only context, not source of truth;
- History payload must stay short and structural, not free-text storage;
- User Notes are not document storage;
- Checked Source Marks are not Nova Agent verification;
- no official, legal, tax or medical claims are introduced;
- Content Model and User-Owned Data stay separated;
- Content Admin does not gain access to User-Owned Data.

## 7. Auth / Ownership Decision Gate

Supabase implementation must not begin until a separate decision gate is closed.

The decision gate must define:

- demo auth approach;
- user ownership model;
- minimum RLS boundary;
- whether the demo uses real login, anonymous session or single-user demo mode;
- how to avoid shared public data leaks;
- how TS08 authenticated user-owned data expectations are satisfied or
  intentionally narrowed for a demo-only phase.

This is a blocker before Supabase code because:

- TS08 expects authenticated user-owned data;
- online demo speed pushes toward minimal auth;
- shared public data would violate ownership and privacy boundaries;
- RLS without a clear ownership anchor creates false safety.

Possible outcomes:

- choose real Supabase Auth for the persistence demo;
- choose anonymous session with explicit ownership mapping;
- choose single-user demo mode with no public write access and no claim of
  multi-user isolation;
- defer Supabase persistence until auth/ownership is specified.

The chosen outcome must be documented before code.

## 8. Out of Scope

Do not include now:

- full auth product flow;
- multi-user account UX;
- dashboard;
- completed plans persistence or UI;
- document storage;
- admin panel;
- production-perfect RLS;
- complex backend;
- file upload;
- legal, tax or medical claims;
- official authority tracker;
- CRM or task-manager behavior;
- Content Admin;
- Pattern B implementation;
- analytics or productivity metrics;
- env file creation during the planning step;
- dependency changes during the planning step.

## 9. Step Plan

### Step 1: Create Online Demo Plan

Status: in progress.

Create this active plan and update changelog only.

No code, dependencies, env files, Supabase code, Vercel config or docs/specs
changes.

### Step 2: Vercel Static Deploy Readiness

Confirm Vite defaults are enough for Vercel:

- build command;
- output directory;
- no env vars;
- no routing fallback config needed;
- deploy checklist.

Run local checks before deploy:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

### Step 3: Vercel Smoke Test

Deploy static demo and run smoke checklist on deployment URL:

- current static demo URL: `https://nova-agent-demo.vercel.app/`;
- app opens;
- start Action Plan;
- update Progress;
- open History;
- create User Open Question;
- mark source as checked by user;
- add User Note.

Record:

- deployment URL;
- limitations;
- reload state loss;
- no persistence claim.

### Step 4: Supabase Auth/Ownership Decision

Close the decision gate before Supabase code:

- real login vs anonymous session vs single-user demo mode;
- ownership anchor;
- minimum RLS model;
- how to avoid shared data leaks;
- whether any TS08 narrowing is demo-only and temporary.

If this decision is not closed, stop before Supabase implementation.

### Step 5: Supabase Schema/Migration Plan

Plan the minimal schema implementation using TS03, TS05, TS07 and TS08.

Initial candidate tables:

- `app_users` or demo ownership equivalent;
- `action_plans`;
- `progress_records`;
- `history_events`;
- `user_open_questions`;
- `checked_source_marks`;
- `user_notes`.

This step should define migration order and constraints, not write production
code inside this planning step.

### Step 6: Repository Boundary Plan

Plan how local app state moves behind a repository boundary.

The boundary must separate:

- domain pure helpers;
- content repository;
- user-owned workflow repository;
- UI orchestration.

The plan must avoid pushing Supabase calls directly into view components.

### Step 7: Supabase Minimal Persistence Step 1

Persist active Action Plan, Progress records and History Events.

Required invariants:

- Progress remains current state;
- History remains append-only;
- Action Plan remains tied to Scenario Version;
- no completed plans;
- no document storage.

### Step 8: Supabase Minimal Persistence Step 2

Persist User Open Questions, Checked Source Marks and User Notes.

Required invariants:

- UOQ remains user's question for external verification;
- Checked Source Mark remains user's mark, not source verification;
- User Note remains short user context, not document storage;
- no User Note lifecycle expansion unless separately planned.

### Step 9: Online Demo Final Smoke Test

Validate deployed demo after persistence work:

- start or return to active Action Plan;
- update Progress;
- create/read History Events;
- create/update User Open Question;
- create Checked Source Mark;
- create User Note;
- reload and confirm expected persisted state only;
- confirm forbidden scope is absent.

### Step 10: Closure

Close the Online Demo plan only after:

- Vercel static demo is validated;
- auth/ownership decision is closed;
- minimal persistence scope is implemented or explicitly deferred;
- risks and limitations are documented;
- changelog is updated;
- plan is moved to `plans/completed` if fully closed.

## 10. Split Option

If Supabase foundation becomes too large, split the work:

- Online Demo Phase A: Vercel static demo;
- Online Demo Phase B: Supabase foundation.

The split is recommended if the auth/ownership decision requires new technical
decision records or if minimal RLS cannot be safely scoped in one plan.

## 11. Testing Strategy

Testing rules:

- keep existing tests passing;
- keep `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and
  `git diff --check` green for implementation steps;
- add smoke checklist for Vercel deploy;
- add persistence tests only after a repository boundary exists;
- do not rely on a Supabase production database in unit tests;
- use repository fakes or test doubles for persistence behavior;
- do not expand the React internal dispatcher workaround as a permanent testing
  strategy;
- before persistent UI changes, consider normal DOM interaction test setup.

## 12. Risks

### Risk 1: Local State Migration

Current user-owned data lives in React local state. Moving too quickly to
Supabase can tangle UI orchestration with persistence.

Control: introduce a repository boundary plan before Supabase code.

### Risk 2: Async Repository Layer

Supabase calls introduce loading, error and retry states.

Control: keep the first persistence scope narrow and avoid product UI expansion.

### Risk 3: Auth/RLS Ambiguity

Minimal auth can conflict with TS08 authenticated user-owned data expectations.

Control: close Auth / Ownership Decision Gate before implementation.

### Risk 4: Data Ownership Leak

Shared public demo data could expose User-Owned Data across visitors.

Control: require an ownership anchor or explicitly single-user non-public demo
mode before persistence.

### Risk 5: History Source-Of-Truth Drift

Persistence can tempt reconstruction of current state from History.

Control: Progress and UOQ status remain current state; History remains context.

### Risk 6: Document Storage Drift

User Notes and History payloads could become free-text or file storage.

Control: keep notes short and structural boundaries visible; no uploads.

### Risk 7: Source Verification Drift

Checked Source Marks can be misread as Nova Agent validation.

Control: preserve "marked by user" semantics and boundary copy.

### Risk 8: User Note Privacy

Persisting notes increases privacy responsibility.

Control: keep note lifecycle and retention decisions explicit before expanding.

### Risk 9: Reload Expectation Mismatch

Static Vercel demo may look online but still lose state on reload.

Control: label static demo limitations and avoid persistence claims.

### Risk 10: Environment Variable Leakage

Supabase URLs and keys must not be committed through env files.

Control: no env files in the planning step; later use deployment environment
settings and documented variable names only.

## 13. Completion Criteria

This plan is complete when:

- Vercel static demo readiness is documented and validated;
- Vercel smoke test is completed;
- Supabase auth/ownership decision is explicitly closed or Supabase work is
  deferred;
- minimal persistence scope is implemented or split into a follow-up plan;
- no product boundaries are violated;
- no full SaaS scope appears;
- changelog is updated;
- final audit confirms readiness for the next MVP step.

## 14. Commit Discipline

Each implementation step should be committed separately after audit.

Commit messages should identify whether the change is:

- docs/planning;
- Vercel static demo readiness;
- Supabase decision;
- repository boundary;
- persistence foundation;
- smoke validation;
- closure.

Do not combine deploy configuration, persistence code, schema decisions and UI
changes in one commit.
