# VS-02 Implementation Plan: Return and Continue Context

## 1. Purpose

This document prepares implementation of VS-02 "Return and Continue Context" for Nova Agent.

VS-02 exists to let a user return to an existing active Action Plan and immediately understand:

- where they stopped;
- what the next step is;
- what the current Progress is;
- how to open Step Detail;
- how to open History.

This document does not revise Product Principles, MVP Work Plan, TS01-TS08, UI-01, Decision Records, domain entities, roles, states, API contracts, persistence model or product scope.

VS-02 is only a local continuation slice. It is not a My Plans dashboard.

## 2. Sources of Truth

The implementation must follow the documentation hierarchy from `AGENTS.md`.

Primary sources:

- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/карта-функций.md`;
- `docs/пользовательские-сценарии.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/техническая-архитектура.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `docs/specs/технические/01-content-model-and-versioning.md`;
- `docs/specs/технические/02-user-owned-workflow-model.md`;
- `docs/specs/технические/03-logical-data-model.md`;
- `docs/specs/технические/04-auth-roles-and-ownership.md`;
- `docs/specs/технические/05-supabase-schema-and-rls.md`;
- `docs/specs/технические/06-content-administration-operations.md`;
- `docs/specs/технические/07-user-owned-workflow-operations.md`;
- `docs/specs/технические/08-api-layer-specification.md`;
- `docs/decisions/2026-06-19-api-layer-pre-decisions.md`;
- `docs/decisions/2026-06-22-vs-01-technical-stack-baseline.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-22-vs-01-implementation-plan.md`;
- `plans/active/2026-06-22-mvp-seed-content-plan.md`.

If this document conflicts with a higher-priority source, the higher-priority source wins.

## 3. Non-Negotiable Decisions

- VS-02 means only Return and Continue Context.
- VS-02 does not create a My Plans dashboard.
- VS-02 does not implement Completed Plans.
- VS-02 does not implement User Open Questions.
- VS-02 does not implement User Notes.
- VS-02 does not implement Checked Source Marks.
- VS-02 does not implement Pattern B.
- VS-02 does not implement Content Admin.
- VS-02 does not add Supabase.
- VS-02 does not add API handlers.
- VS-02 does not add auth.
- VS-02 does not add persistence.
- VS-02 does not add routing library or state manager.
- VS-02 does not add new entities, roles, states or API contracts.
- The next step is determined only from Progress.
- History is never a source of truth for current Progress.
- Progress remains a user's mark, not official status.
- History remains read-only internal Nova Agent history, not an official journal.
- The product boundary remains visible: Nova Agent is reference help, not an official answer, and official sources must be checked.

## 4. VS-02 Scope

VS-02 includes only:

- return context for an existing active Action Plan;
- active plan continuation;
- progress summary for the active plan;
- clear next step inside the existing active Action Plan;
- access to Step Detail from the continuation context;
- access to read-only History from the active plan context;
- own-plan framing in the local demo context.

For the current local slice, "access to own Action Plans" from the MVP Work Plan is implemented only as access to the current local user's existing active Action Plan. It is not implemented as a full list, dashboard, archive, completed-plan center or cross-session plan store.

VS-02 Progress Summary consists only of:

- total steps;
- count of `not_started` Progress records;
- count of `in_progress` Progress records;
- count of `requires_check` Progress records.

`completed` is not used in VS-02 Progress Summary.

VS-02 must not show percentages, ratings, KPI, productivity scores or dashboard metrics.

## 5. Explicitly Out Of Scope

The following are explicitly forbidden in VS-02:

- Completed Plans;
- Dashboard;
- Filters;
- Search;
- Sorting;
- User Open Questions;
- User Notes;
- Checked Source Marks;
- Pattern B;
- Content Admin;
- Supabase;
- API handlers;
- auth;
- routing library;
- state manager;
- persistence;
- document storage;
- reload survival;
- deadlines;
- priorities;
- assignees;
- kanban;
- reminders;
- analytics;
- cross-user workflow;
- team workflow;
- admin access to user plans;
- additional Life Situations;
- additional Scenarios.

If implementation pressure requires any item from this list, VS-02 work must stop until the relevant specification, decision record and active plan are updated.

## 6. User Flow

VS-02 validates this flow:

```text
existing active Action Plan
-> single continuation entry
-> Progress summary
-> clear next step
-> continue plan
-> Step Detail
-> History
```

The user must be able to return to the existing active Action Plan without rereading the Scenario from scratch.

VS-02 starts with exactly one continuation entry. The user opens the existing active Action Plan from that entry. After opening the Action Plan, the user can continue to:

```text
Action Plan
-> Step Detail
```

or:

```text
Action Plan
-> History
```

VS-02 must not create a separate dashboard, completed-plan list or multi-plan center.

The user should understand:

- which Scenario and Scenario Version the active plan uses;
- that the Action Plan is active;
- how many Progress records exist and what their current user marks are;
- which step is the next step;
- how to open the next Step Detail;
- how to open History;
- that Progress is a user mark;
- that History is internal Nova Agent history and not official proof.

## 7. Implementation Order

Implementation must proceed in small behavior-preserving steps:

1. Add tests for the VS-02 return context before UI implementation.
2. Reuse existing local active Action Plan data from VS-01.
3. Add a minimal continuation entry for an existing active plan.
4. Derive Progress summary from existing Progress records.
5. Derive the next step from existing Progress records.
6. Link continuation to existing Action Plan Detail and Step Detail behavior.
7. Link History access from the active plan context.
8. Assert forbidden scope in tests.
9. Update this plan and changelog after implementation.
10. Run the standard verification commands.

Do not refactor App architecture unless it is required to keep the VS-02 change clear and behavior-preserving. Any refactor must not change VS-01 behavior.

### Step 1: Progress Summary And Next Step Helper

Status: completed.

Scope:

- add domain-level Progress Summary helper;
- add domain-level Next Step helper;
- derive both helpers only from Progress records;
- keep History out of current-state calculation;
- keep UI unchanged.

Progress Summary includes only `totalSteps`, `notStartedCount`, `inProgressCount` and `requiresCheckCount`.

Next Step priority is:

1. first Progress record with `in_progress`;
2. first Progress record with `requires_check`;
3. first Progress record with `not_started`;
4. no next step if none of those statuses exist.

Step 1 does not add UI, API handlers, persistence, state manager, My Plans dashboard, Completed Plans, User Open Questions, User Notes, Checked Source Marks, Pattern B, Content Admin or document storage.

### Step 2: Return Context UI

Status: completed.

Scope:

- add one active-plan continuation entry;
- show VS-02 Progress Summary from Progress records;
- show one main next step from Progress records;
- allow opening the existing active Action Plan;
- allow opening Step Detail for the next step;
- allow opening read-only History;
- keep repository lookup through `ActionPlan.scenarioVersionId`;
- keep UI active-only and local-only.

Step 2 does not add a dashboard, completed-plan list, multiple plans management, filters, search, sorting, percentages, KPI, productivity metrics, deadlines, priorities, assignees, kanban, User Open Questions, User Notes, Checked Source Marks, Pattern B, Content Admin, Supabase, API handlers, auth, routing library, state manager, persistence or document storage.

### Step 3: Demo Flow Validation

Status: completed.

Scope:

- add one full interaction test for the VS-02 return-and-continue demo flow;
- validate `Return Context -> Progress Summary -> Next Step -> Open Active Action Plan -> Open Step Detail -> Return To Action Plan -> Open History`;
- use existing UI click handlers and existing local Action Plan behavior;
- verify the single active continuation entry, Progress Summary fields, next step from Progress records, Step Detail access and read-only History access;
- verify boundary copy for local reload limitation, Progress as user mark and History as internal non-official Nova Agent history;
- assert forbidden dashboard, completed-plan, task-manager, persistence, API, auth, Supabase, Content Admin, Pattern B, User Open Questions, User Notes and Checked Source Marks scope.

Step 3 does not add runtime functionality, workflow operations, API handlers, persistence, routing, state manager, Supabase, auth, new entities, new roles or new states.

Final audit fix:

- `ActionPlanView` uses the same VS-02 next-step helper as `ReturnContextView`;
- Action Plan Detail and Return Context now resolve the next step by the same Progress-only priority: `in_progress -> requires_check -> not_started`;
- History remains excluded from next-step calculation.

## 8. Dependencies

VS-02 depends on completed VS-01 functionality:

- seed content availability;
- Content Read Flow;
- Action Plan creation;
- Action Plan Detail;
- Step Detail;
- Progress update;
- History visibility;
- VS-01 cleanup component structure;
- repository lookup from Action Plan Scenario Version ID.

VS-02 also depends on:

- TS04 ownership and privacy boundaries;
- TS07 Action Plan read rules;
- TS07 Progress as the source of truth;
- TS07 History append-only rule;
- TS08 own Action Plan read semantics;
- UI-01 U-04 and U-05 concepts;
- Product Principles: one next step, context before action, no task-manager drift.

## 9. UI Scope

VS-02 uses a narrow subset of UI-01:

- U-04 concept: access to own Action Plans, narrowed to the existing active plan only;
- U-05 concept: active Action Plan detail and current Progress;
- U-06 concept: Step Detail opened from the plan context;
- U-07 concept: read-only History opened from the plan context.

VS-02 must not implement full U-04 "Мои планы действий" behavior. It must not show completed plans, filters, search, sorting, dashboard metrics, task-manager controls or arbitrary task management.

The UI must keep:

- Scenario and Scenario Version context;
- Action Plan active state;
- Progress marked as "Ваша отметка";
- a single clear next step;
- boundary copy that Nova Agent is reference help and not an official answer;
- History boundary copy that it is internal Nova Agent history, not an official journal.

## 10. Workflow Scope

VS-02 does not add workflow operations.

VS-02 may read and display:

- existing active Action Plan;
- existing Progress records;
- existing History Events;
- existing Scenario Version context.

VS-02 must not create:

- Action Plan from passive viewing;
- Progress records beyond the existing VS-01 creation flow;
- History Events from passive return or passive viewing;
- User Open Questions;
- User Notes;
- Checked Source Marks;
- completed plan records;
- Pattern B access records.

The current state of a step is read from Progress only. History may explain what happened, but it must not determine current Progress.

## 11. Repository Usage

VS-02 must use the existing local seed content and repository pattern.

The content lookup should remain:

```text
ActionPlan
-> scenarioVersionId
-> contentRepository
-> ScenarioVersion
```

The implementation must not return to selecting Scenario content by "first element" or other implicit ordering.

Expected reusable modules:

- `src/data/contentRepository.ts`;
- `src/domain/workflow.ts`;
- `src/app/components/ActionPlanView.tsx`;
- `src/app/components/StepDetailView.tsx`;
- `src/app/components/HistoryView.tsx`;
- `src/app/components/ProgressBadge.tsx`;
- `src/app/components/BoundaryNotice.tsx`.

Local limitation:

- VS-02 remains a local continuation slice.
- Reload survival is absent.
- Persistence is absent.
- Auth is absent.
- Supabase is absent.
- API handlers are absent.

This is a conscious VS-02 limitation. It is acceptable only because VS-02 validates return context behavior inside the local vertical-slice scaffold, not production persistence or multi-user enforcement.

## 12. Testing Strategy

Tests must cover:

- existing active Action Plan continuation context;
- single continuation entry as the start of VS-02;
- progress summary derived from Progress records;
- next step derived from Progress records;
- opening Step Detail from the continuation context;
- opening History from the continuation context;
- Progress still shown as "Ваша отметка";
- History still read-only and internally scoped;
- Progress Summary includes only total steps, `not_started`, `in_progress` and `requires_check`;
- Progress Summary does not show percentages, ratings, KPI, productivity scores or dashboard metrics;
- no completed plans;
- no dashboard;
- no filters, search or sorting;
- no deadlines;
- no priorities;
- no assignees;
- no kanban;
- no document storage;
- no productivity metrics;
- no User Open Questions;
- no User Notes;
- no Checked Source Marks;
- no Pattern B;
- no Content Admin;
- no Supabase, API handlers, auth, routing library or state manager.

The current test-only React internal dispatcher workaround from VS-01 remains a temporary compromise. Before or during VS-02 implementation, the team should consider whether normal DOM interaction testing setup is needed. If the workaround remains in use, the implementation must not add runtime code for it and must not treat it as a permanent testing strategy.

Required checks after implementation:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

## 13. Risks

### Risk: My Plans becomes a dashboard

VS-02 touches U-04 concepts, so it can easily drift into a dashboard, archive or task manager.

Control: implement only active-plan continuation, no filters, no search, no sorting, no metrics dashboard and no completed plans.

### Risk: Completed Plans leak into VS-02

UI-01 and TS08 describe completed plans at broader MVP level.

Control: VS-02 uses only existing active Action Plan. Completed plan read-only behavior belongs to a later slice.

### Risk: History becomes source of truth

History contains events that can explain context, but TS07 says Progress is the source of truth.

Control: next step and summary are derived from Progress records only.

### Risk: Local limitation is mistaken for production behavior

The local slice does not survive reload and does not enforce persistence, auth, Supabase or concurrency.

Control: keep the local limitation visible in this plan and do not imply production persistence.

### Risk: Task-manager drift

Progress summary and next-step UI can start to look like a generic task dashboard.

Control: no deadlines, priorities, assignees, kanban, reminders, arbitrary tasks or completion dashboard.

### Risk: VS-03/VS-04 features appear early

Action Plan screens already mention History and future open questions in higher-level specs.

Control: no User Open Questions, User Notes or Checked Source Marks in VS-02.

## 14. Completion Criteria

VS-02 is complete when the user can follow this path:

```text
existing active Action Plan
-> see Progress summary
-> understand the next step
-> continue the plan
-> open Step Detail
-> open History
```

Completion requires:

- the user sees only the existing local active Action Plan;
- the user sees Scenario and Scenario Version context;
- the user sees Action Plan state `active`;
- the user sees Progress summary derived from Progress records;
- the next step is derived from Progress records;
- History is not used as source of truth;
- Progress remains labelled as "Ваша отметка";
- History remains read-only internal Nova Agent history;
- Step Detail remains available from the active plan context;
- History remains available from the active plan context;
- no passive viewing creates new user-owned data;
- no Completed Plans, dashboard, filters, search or sorting are implemented;
- no User Open Questions, User Notes, Checked Source Marks, Pattern B or Content Admin are implemented;
- no Supabase, API handlers, auth, routing library, state manager, persistence or document storage are added;
- no product boundary language implies official status, official answer or professional advice;
- all standard verification commands pass.

## Self-Audit

- MVP Work Plan alignment: VS-02 remains Return and Continue Context only.
- UI-01 alignment: U-04 is used as a narrow active-plan continuation concept; U-05/U-06/U-07 boundaries remain intact.
- TS07 alignment: Progress remains source of truth; History remains append-only and read-only; user sees only own local plan context.
- TS08 alignment: own Action Plan read semantics guide the local implementation without adding API handlers or contracts.
- Product Principles alignment: the plan preserves one next step, context restoration, no task-manager drift and visible product boundaries.
- Scope creep check: no new entities, roles, states, API, persistence, Supabase, auth, Content Admin, Pattern B, User Open Questions, User Notes or Checked Source Marks are introduced.

## Closure

Status: completed.

VS-02 is officially completed. All VS-02 goals were achieved:

- the user can return to the existing local active Action Plan;
- the user sees Progress Summary for the active plan;
- the user sees one next step derived only from Progress;
- the user can continue to Action Plan Detail;
- the user can open Step Detail;
- the user can open read-only History;
- Return Context and Action Plan Detail use the same next-step helper;
- History remains excluded from current-state calculation.

Scope was preserved:

- no dashboard;
- no Completed Plans;
- no User Open Questions;
- no User Notes;
- no Checked Source Marks;
- no Pattern B;
- no Content Admin;
- no Supabase;
- no API handlers;
- no auth;
- no routing library;
- no state manager;
- no persistence;
- no document storage;
- no new entities, roles, states or API contracts.

Known limitations:

- VS-02 remains local-only;
- local React state is lost after reload;
- persistence is absent;
- auth is absent;
- Supabase is absent;
- the React internal dispatcher workaround remains a temporary test-only compromise and is not a permanent testing strategy.
