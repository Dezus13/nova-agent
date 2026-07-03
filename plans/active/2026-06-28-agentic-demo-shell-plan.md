# Agentic Demo Shell Plan

## 1. Purpose

This plan prepares an Agentic Demo Shell for the current Nova Agent MVP demo.

The current demo opens directly into the fixed scenario "Регистрация места
жительства в Австрии". That proves the workflow, but it looks like a
scenario/document interface rather than an AI-product-style entry point.

The Agentic Demo Shell adds a first presentation layer:

```text
User task input
-> demo-only understood situation summary
-> existing seed Scenario / Action Plan flow
```

This plan does not revise Product Principles, MVP Work Plan, TS01-TS08, UI-01,
Decision Records, domain entities, roles, states, API contracts, persistence
model or product scope.

No application code, dependencies, env files, OpenAI integration, Supabase code,
API handlers, auth, routing or persistence are introduced by this planning step.

## 2. Sources Of Truth

The plan follows the documentation hierarchy from `AGENTS.md`.

Primary sources:

- `AGENTS.md`;
- `README.md`;
- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-28-mvp-online-demo-plan.md`;
- `plans/completed/2026-06-28-demo-polish-plan.md`;
- `plans/completed/2026-06-28-vs-04-implementation-plan.md`;
- `changelog/2026-06-28.md`;
- `src/app/App.tsx`;
- `src/app/components/`;
- `src/data/contentRepository.ts`.

If this plan conflicts with a higher-priority source, the higher-priority source
wins.

## 3. Current State

The current Vercel demo is ready:

- VS-01 completed;
- VS-02 completed;
- VS-03 completed;
- VS-04 completed;
- Demo Polish completed;
- production URL: `https://nova-agent-teal.vercel.app/`;
- app state is local-only;
- no Supabase client exists;
- no API layer exists;
- no auth exists;
- no persistence exists;
- no routing library exists;
- no OpenAI integration exists.

Current first screen behavior:

- `src/app/App.tsx` loads the default seed content flow;
- if there is no active Action Plan, the app renders the existing
  `ScenarioView`;
- the user sees the ready scenario before any task-input layer;
- `startActionPlan` and all workflow helpers already work and must remain
  unchanged.

## 4. Non-Negotiable Boundaries

The Agentic Demo Shell is demo-only.

It is not:

- real AI;
- OpenAI integration;
- real intent recognition;
- universal scenario search;
- scenario generation;
- source verification;
- official status detection;
- legal, tax or medical interpretation;
- persistence;
- routing;
- dashboard;
- CRM or task manager behavior.

The shell must not imply that Nova Agent can understand arbitrary tasks in this
phase.

The shell may say:

- "Демо-режим";
- "пример задачи";
- "Покажем существующий сценарий";
- "Nova Agent сопоставит пример задачи на основе текущего демонстрационного
  сценария";
- "Nova Agent не создаёт новые сценарии в этой версии";
- "Понял ситуацию для демо";
- "Это не AI-ответ и не официальная оценка".

The shell must not say or imply:

- "AI generated this plan";
- "OpenAI understood the request";
- "Nova Agent can solve any task";
- "officially verified";
- "approved";
- "accepted";
- "confirmed";
- "legal/tax/medical conclusion";
- "production persistence".

## 5. In Scope

Only UI/demo shell behavior is in scope.

Allowed:

- first screen before the existing scenario;
- command/input box;
- example prompt;
- CTA "Построить план";
- short "Nova Agent понял ситуацию" summary;
- deterministic transition to the existing seed workflow;
- user-facing copy;
- tests for the shell flow;
- README and changelog update;
- local smoke test;
- Vercel smoke test;
- closure.

The shell may use local React state in `App.tsx` to track:

- current typed demo prompt;
- whether the demo shell has been submitted;
- whether the understood-situation summary is visible.

The shell must route to the existing default seed scenario only.

## 6. Out Of Scope

Forbidden:

- real AI integration;
- OpenAI API;
- LLM prompts;
- streaming responses;
- AI chat;
- Supabase;
- API handlers;
- auth;
- routing library;
- persistence;
- new domain logic;
- workflow helper changes;
- content repository changes;
- scenario generation;
- multiple scenario search;
- dynamic scenario matching;
- dashboard;
- completed plans management;
- CRM behavior;
- task-manager behavior;
- document storage;
- file upload;
- legal, tax or medical conclusions;
- official status;
- official verification;
- source verification by Nova Agent;
- new entities;
- new roles;
- new states;
- new Product Decisions;
- new API Decisions;
- new Data Decisions.

If any implementation step requires an item above, stop and create a separate
specification, decision record or active plan before continuing.

## 7. Demo Mapping Rule

Agentic Demo Shell must use one deterministic mapping:

```text
Any non-empty demo prompt
-> current default seed Life Situation
-> current default seed Scenario
-> existing Action Plan flow
```

The mapping is demo-only and does not create new product logic.

The implementation must not add:

- intent classification;
- fuzzy search;
- scoring;
- semantic search;
- alternate scenarios;
- generated steps;
- generated requirements;
- generated sources.

Empty input may be handled with a gentle UI validation message, but this must
remain local UI behavior and not domain logic.

## 8. Step Plan

### Step 1: Agentic Demo Shell Plan Creation

Status: completed.

Create this active plan and update changelog only.

No application code, README, specs, Product Principles, Technical Architecture,
OpenAI, Supabase, API, auth, routing, state manager or persistence changes in
this step.

### Step 2: Agentic Demo Shell UI

Status: completed.

Add the first demo shell screen before the existing scenario.

Allowed implementation targets:

- `src/app/App.tsx`;
- a small new component such as `src/app/components/AgenticDemoShell.tsx`;
- `src/app/App.css`;
- `src/app/App.test.tsx`;
- `plans/active/2026-06-28-agentic-demo-shell-plan.md`;
- `changelog/2026-06-28.md`.

Required UI:

- question: "Что вам нужно решить?";
- input or command box;
- example prompt;
- CTA: "Построить план";
- demo-only summary: "Понял ситуацию для демо";
- boundary summary: "На основе текущего демонстрационного сценария Nova Agent
  откроет готовый план.";
- boundary summary: "Nova Agent не создаёт новые сценарии в этой версии.";
- transition to the current existing scenario / Action Plan flow.

Required boundary copy:

- "Демо-режим";
- "Это не real AI и не OpenAI integration";
- "Nova Agent показывает существующий demo-сценарий";
- "Nova Agent не даёт официальный статус и не заменяет специалиста".

No domain helpers, content repository, workflow behavior, Progress, History,
UOQ, CSM or User Note behavior may change.

Implementation note:

- Added a UI-only Agentic Demo Shell before the existing `ScenarioView`;
- any non-empty prompt stays mapped to the current seed scenario and existing
  Action Plan flow;
- empty input does not open the workflow;
- the shell uses local UI state only;
- domain helpers, content repository, Progress, History, UOQ, Checked Source
  Marks and User Note behavior were not changed;
- no OpenAI API, Supabase, auth, routing, state manager or persistence was
  added.

### Step 3: README / Demo Instructions Update

Update README only if needed to explain the new shell honestly.

README must say:

- Agentic Demo Shell is demo-only;
- the shell maps to the existing registration scenario;
- there is no real AI integration;
- there is no OpenAI API;
- state remains local-only;
- reload can lose state.

### Step 4: Local Smoke Test

Run:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

Smoke flow:

- open first screen;
- enter or select example prompt;
- click "Построить план";
- see "Понял ситуацию" demo summary;
- continue to existing scenario;
- start Action Plan;
- change Progress;
- open History;
- create User Open Question;
- mark source as checked by user;
- add User Note.

### Step 5: Vercel Smoke Test

After deployment, verify:

- production URL opens;
- Agentic Demo Shell appears first;
- CTA transitions to the existing flow;
- old VS-01 through VS-04 behavior still works;
- shell copy does not imply real AI, OpenAI, persistence or official status.

### Step 6: Closure

Close this plan only after:

- Agentic Demo Shell UI is implemented;
- README is updated if needed;
- local smoke passes;
- Vercel smoke passes;
- product logic is unchanged;
- changelog is updated.

Move this plan to `plans/completed/` only when fully closed.

## 9. Testing Strategy

Tests must verify:

- shell is the first visible screen when there is no active Action Plan;
- example prompt can populate or guide the input;
- user can submit the shell through the CTA;
- "Понял ситуацию" demo summary appears;
- transition opens the existing scenario / existing workflow;
- existing Action Plan creation still uses existing `startActionPlan`;
- Progress behavior is unchanged;
- History behavior is unchanged;
- UOQ behavior is unchanged;
- CSM behavior is unchanged;
- User Note behavior is unchanged;
- no OpenAI, Supabase, API, auth, routing, persistence, dashboard or document
  storage appears.

Existing VS-01 through VS-04 interaction tests must remain meaningful and should
be adjusted only for the new first-screen transition.

## 10. Completion Criteria

Agentic Demo Shell is complete when:

- the first screen feels like an AI-product demo entry point;
- the shell stays explicitly demo-only;
- transition to the existing seed scenario is deterministic;
- no domain logic changes were made;
- no new product capability was introduced;
- all automated checks pass;
- local smoke passes;
- Vercel smoke passes;
- README and changelog reflect the shell honestly;
- no Supabase, API, auth, routing, state manager, persistence, dashboard,
  completed plans management, Content Admin or document storage is added.

## 11. Risks

### Risk 1: AI Expectation Drift

The shell can make users believe Nova Agent already uses real AI.

Control: visible demo-only copy and no OpenAI/API claims.

### Risk 2: Product Overpromise

"Понял ситуацию" may sound like a professional or official conclusion.

Control: summary must say it is a demo mapping to an existing scenario, not an
official assessment.

### Risk 3: Scenario Search Drift

Input box can create pressure for search or scenario matching.

Control: one deterministic mapping to the existing seed scenario only.

### Risk 4: Domain Logic Drift

Shell implementation can accidentally change workflow helpers.

Control: do not edit domain helpers, content repository or workflow rules.

### Risk 5: Dashboard Or Task Manager Drift

Improving the first screen can become a dashboard or task manager entry.

Control: no lists of plans, no completed plans management, no deadlines,
priorities, assignees or kanban.

### Risk 6: Persistence Expectation Drift

An agentic shell can make the demo feel more production-like.

Control: keep local-only and reload-loss limitations visible in README and smoke
checks.

## 12. Commit Discipline

Keep commits small:

- plan creation;
- shell UI;
- README/demo instructions if needed;
- smoke validation;
- closure.

Do not combine Agentic Demo Shell work with OpenAI, Supabase, auth, API,
routing, persistence, domain logic or product scope changes.
