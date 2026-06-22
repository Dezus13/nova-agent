# Decision Record: VS-01 Technical Stack Baseline

## Назначение документа

Этот документ фиксирует минимальный technical stack baseline перед первым code scaffold commit для VS-01.

Цель решения - не позволить первому кодовому commit стать скрытым архитектурным решением.

Документ не является product spec, implementation spec, API spec, UI spec или database spec. Он не меняет продуктовые решения, API semantics, data model, roles, states, UI scope или MVP scope.

## Источники

Решение основано на:

- `AGENTS.md`;
- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/принципы-продукта.md`;
- `docs/техническая-архитектура.md`;
- `docs/specs/технические/05-supabase-schema-and-rls.md`;
- `docs/specs/технические/08-api-layer-specification.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-22-mvp-seed-content-plan.md`;
- `plans/active/2026-06-22-vs-01-implementation-plan.md`.

If this document conflicts with a higher-level source of truth, the higher-level document wins.

## Repository Baseline

At the time of this decision, the repository is documentation-only:

- no `package.json`;
- no `src/` or `app/`;
- no frontend framework;
- no backend/API implementation structure;
- no Supabase migrations or database implementation structure;
- no test structure;
- no build, lint, typecheck or test commands;
- `README.md` exists but does not define startup commands.

The first code commit must be scaffold-only.

## Decision

VS-01 will use a minimal web app baseline for the first scaffold.

### Frontend / App Framework

Recommended baseline: React + TypeScript with Vite.

Reason:

- supports a small user-facing web app without committing to server-side rendering, route handlers or auth product flow;
- keeps the first scaffold lightweight enough for VS-01 demo flow;
- works well with typed local fixtures for the first vertical slice;
- allows later integration with TS08 API contracts without changing VS-01 product scope.

This recommendation does not create UI scope beyond UI-01 and VS-01 Implementation Plan.

### Package Manager

Recommended baseline: npm.

Reason:

- smallest default choice for a new Node-based scaffold;
- does not require an additional package-manager decision or workspace setup;
- enough for VS-01 commands and dependency management.

### Runtime / Build Baseline

Recommended baseline:

- Node.js LTS runtime for local development and scripts;
- Vite dev server for local app execution;
- Vite production build for build verification;
- TypeScript for typed source and typed seed content representation.

The exact pinned Node.js version can be recorded in the scaffold commit if a version file is added. That pin must not change product scope.

### Test / Lint / Typecheck Baseline

The first scaffold should define a minimal command set:

- `npm run dev`;
- `npm run build`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`.

Recommended minimal tooling:

- TypeScript compiler for `typecheck`;
- ESLint for `lint`;
- Vitest for unit/domain tests.

End-to-end or browser screenshot tests may be added later when the UI flow exists. They are not required for the first scaffold commit.

## VS-01 Seed Content Strategy

For the first demo flow, VS-01 should use local typed fixtures / seed data representation.

This means:

- seed content is represented in source as typed local data for the approved scenario "Регистрация места жительства в Австрии";
- fixtures follow `plans/active/2026-06-22-mvp-seed-content-plan.md`;
- fixtures must preserve Warnings, Restrictions, Applicability Conditions, Steps, Documents/Data Requirements, Sources and Template Open Questions;
- Content Admin UI is not introduced;
- full database integration is not mandatory for the first scaffold if it increases scope;
- Supabase migrations and RLS policies remain outside the first scaffold.

Local fixtures are an implementation bridge for VS-01 demo flow. They do not create a new content workflow, new entity type, new API semantics or a replacement for TS05.

## Source Structure Baseline

The first scaffold should keep structure small and explicit:

- app/source: `src/`;
- app entry and route composition: `src/app/`;
- UI components for VS-01 screens: `src/ui/`;
- domain types and domain operations: `src/domain/`;
- data access boundary and local repositories: `src/data/`;
- seed content fixtures: `src/data/seed/`;
- tests: `src/test/` or colocated `*.test.ts` files.

The exact file split may be adjusted during scaffold, but it must preserve the boundaries:

- UI does not own seed content;
- domain/data modules do not create UI scope;
- seed fixtures do not become Content Admin workflow;
- user-owned data for the demo remains separate from content fixtures.

## First Scaffold Out Of Scope

The first scaffold must not include:

- Supabase migrations;
- RLS policies;
- auth flow;
- login/signup/password reset UI;
- Content Admin;
- User Open Questions;
- User Notes;
- Checked Source Marks;
- My Plans;
- Completed Plans;
- Pattern B;
- document storage;
- file upload or processing;
- dashboards;
- analytics;
- reminders;
- deadlines;
- priorities;
- assignees;
- CRM or task-manager patterns.

## Allowed Implementation Choices During Scaffold

The scaffold may choose:

- exact Vite template shape;
- exact TypeScript config details;
- exact ESLint config details;
- exact Vitest config details;
- exact source file names inside the approved structure;
- exact local fixture serialization.

These choices are allowed only if they do not change product behavior, API semantics, data model, roles, states, UI scope, seed content scope or MVP scope.

## Open Questions Registry

| Question | Status | Owner document | Notes |
|---|---|---|---|
| Is the repository currently documentation-only? | Closed | This document | Yes. No application scaffold exists at decision time. |
| What should the first code commit contain? | Closed | This document | Scaffold only. No VS-01 feature completion in the first code commit. |
| Which app baseline should VS-01 scaffold use? | Closed | This document | React + TypeScript with Vite. |
| Which package manager should the scaffold use? | Closed | This document | npm. |
| Is full Supabase integration required in the first scaffold? | Closed | This document / TS05 | No. Local typed fixtures may be used first; migrations/RLS are out of the first scaffold. |
| Does this decision create product/API/UI/data changes? | Closed | This document | No. It constrains implementation only. |

## Self-Audit

1. New product functions: none.
2. New roles: none.
3. New entities: none.
4. New states: none.
5. New API: none.
6. Product scope: unchanged.
7. UI scope: unchanged; UI-01 remains source of truth.
8. Data model: unchanged; TS03/TS05 remain source of truth.
9. Document depth: baseline decision only, not a full implementation spec.
10. Next commit readiness: the next code commit can be scaffold-only.
