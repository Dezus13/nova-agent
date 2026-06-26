# Nova Agent

Nova Agent helps people navigate administrative, household, and organizational
processes connected with life in Austria.

The product is an informational and organizational guide. It helps a user
understand a life situation, inspect an applicable scenario, start an Action
Plan, mark their own progress, and review internal history. Nova Agent does not
replace official authorities, institutions, lawyers, tax advisors, doctors, or
other specialists.

## Problem

Many Austrian administrative processes are multi-step and depend on context:
city, residence status, housing situation, employment, insurance, family status,
documents, and current official requirements.

Nova Agent reduces uncertainty by keeping the path, steps, requirements,
official sources, user progress, and internal history in one structured flow.

## Architecture

Current VS-01 implementation is a local React + TypeScript vertical slice:

- `src/domain/` contains typed domain models and pure workflow helpers.
- `src/data/` contains the local seed content repository.
- `src/app/` contains the React application shell and view components.
- No Supabase, API handlers, auth, routing library, state manager, dashboard, or
  document storage is implemented in VS-01.

The implemented VS-01 spine is:

```text
Life Situation
-> Scenario
-> Action Plan
-> Progress
-> History
```

## Run

```bash
npm run dev
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For watch mode:

```bash
npm run test:watch
```

## Repository Structure

```text
src/
  app/
    components/
  data/
    seed/
  domain/
docs/
  specs/
  decisions/
plans/
  active/
  completed/
changelog/
```

## Main Documents

- `AGENTS.md`
- `docs/бизнес-контекст.md`
- `docs/глобальная-спецификация.md`
- `docs/принципы-продукта.md`
- `docs/roadmap.md`
- `docs/техническая-архитектура.md`
- `docs/specs/ui/01-ui-design-rules.md`
- `docs/specs/технические/`
- `plans/active/2026-06-21-mvp-work-plan.md`
- `plans/active/2026-06-22-vs-01-implementation-plan.md`
