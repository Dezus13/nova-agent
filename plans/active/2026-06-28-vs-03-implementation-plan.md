# VS-03 Implementation Plan: User Open Questions

## 1. Purpose

This document prepares implementation of VS-03 "User Open Questions" for Nova Agent.

VS-03 exists to solve one user problem:

```text
The user reaches an uncertain point in an active Action Plan and needs to save a question for external verification without treating Nova Agent as the answer.
```

VS-03 is one active vertical slice, one user problem and one solution:

- active vertical slice: User Open Questions inside the existing active Action Plan;
- user problem: uncertainty must not be lost while the user continues the plan;
- solution: create, view and update User Open Questions as user-owned questions for external verification.

This document does not revise Product Principles, MVP Work Plan, TS01-TS08, UI-01, Decision Records, domain entities, roles, states, API contracts, persistence model or product scope.

## 2. Sources Of Truth

The implementation must follow the documentation hierarchy from `AGENTS.md`.

Primary sources:

- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/техническая-архитектура.md`;
- `docs/принципы-продукта.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `docs/specs/технические/07-user-owned-workflow-operations.md`;
- `docs/specs/технические/08-api-layer-specification.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- completed VS-01 and VS-02 implementation plans in `plans/completed/`.

If this document conflicts with a higher-priority source, the higher-priority source wins.

## 3. Why VS-03 Follows VS-02

VS-01 proved the product spine:

```text
Life Situation -> Scenario -> Action Plan -> Progress -> History
```

VS-02 proved return and continuation:

```text
existing active Action Plan -> Progress Summary -> Next Step -> Step Detail -> History
```

VS-03 comes next because the user can now return to the active plan and continue work. The next missing user value is preserving uncertainty inside that active plan. Without VS-03, a user can see progress and history but cannot save a question that must be checked with an official source, institution or specialist.

VS-03 must not become Notes, Checked Source Marks, Completed Plans, Pattern B, Content Admin, Supabase or API implementation.

## 4. Reused Foundation From VS-01 And VS-02

VS-03 reuses:

- existing seed Life Situation and Scenario;
- existing published Scenario Version;
- existing local Action Plan aggregate;
- existing Action Plan Detail;
- existing Step Detail;
- existing Return Context;
- existing Progress labels as user's marks;
- existing read-only History view;
- existing boundary copy patterns;
- existing local component structure under `src/app/components/`;
- existing local workflow pattern for pure helpers and append-only History Events.

VS-03 must not duplicate seed content or create new Scenario content.

## 5. VS-03 Scope

VS-03 includes only User Open Questions inside the existing local active Action Plan.

Allowed VS-03 behavior:

- list User Open Questions inside the active Action Plan;
- create a User Open Question through an explicit user action;
- associate a User Open Question with existing versioned context when available:
  - Step context;
  - Document Requirement context;
  - Data Requirement context;
  - Source context;
  - Template Open Question context;
  - Progress context where it explains `requires_check` or `awaiting_external_response`;
- update User Open Question status according to TS07;
- edit User Open Question text while allowed by TS07 and TS08;
- create append-only History Events:
  - `user_open_question_created`;
  - `user_open_question_status_changed`;
  - `user_open_question_edited`;
- show User Open Questions as "Ваш вопрос" / user's question for external verification;
- clearly distinguish Template Open Questions from User Open Questions;
- keep History read-only.

VS-03 may use existing local state only. It must not promise reload persistence.

## 6. Explicitly Out Of Scope

The following are forbidden in VS-03:

- User Notes;
- Checked Source Marks;
- Completed Plans;
- Action Plan completion;
- Pattern B;
- deprecated or superseded Scenario Version UI;
- Content Admin;
- Supabase;
- API handlers;
- auth;
- routing library;
- state manager;
- persistence;
- document storage;
- file upload;
- official answer workflow;
- professional answer workflow;
- automatic question answering;
- automatic closing of User Open Questions;
- automatic Progress changes from User Open Question changes;
- automatic User Open Question changes from Progress changes;
- dashboard;
- filters beyond the narrow active-plan display needed for this slice;
- search;
- sorting controls;
- deadlines;
- priorities;
- assignees;
- kanban;
- CRM patterns;
- new Life Situations;
- new Scenarios;
- new Product Decisions;
- new API Decisions;
- new Data Decisions;
- new roles;
- new states;
- new entities.

If implementation pressure requires any item from this list, VS-03 work must stop until the relevant specification, decision record and active plan are updated.

## 7. User Flow

VS-03 validates this flow:

```text
existing active Action Plan
-> open Step Detail or active-plan questions area
-> see Template Open Questions as Scenario content
-> create User Open Question explicitly
-> see it as "Ваш вопрос"
-> update its status according to TS07
-> edit its text while allowed
-> see related History Events
```

The user must understand:

- Template Open Questions are content prompts;
- User Open Questions are the user's own questions;
- User Open Questions are for external verification;
- `clarified_by_user` is a user's mark, not an official answer;
- `irrelevant` is final;
- Progress does not automatically change because a User Open Question changes;
- User Open Question status does not automatically change because Progress changes.

## 8. Workflow Scope

VS-03 uses only approved TS07 User Open Question lifecycle.

Allowed statuses:

- `open`;
- `requires_check`;
- `awaiting_external_response`;
- `clarified_by_user`;
- `irrelevant`.

Allowed transitions:

```text
open -> requires_check
open -> awaiting_external_response
open -> irrelevant

requires_check -> awaiting_external_response
requires_check -> clarified_by_user
requires_check -> irrelevant

awaiting_external_response -> clarified_by_user
awaiting_external_response -> irrelevant

clarified_by_user -> requires_check
```

Forbidden transitions:

- any transition out of `irrelevant`;
- automatic transitions;
- statuses that imply official answer, professional answer or Nova Agent decision.

Current state of a User Open Question is its status. History explains what happened but is not the source of truth.

## 9. Vertical Implementation Order

Implementation must proceed in small vertical steps:

### Step 1: Domain Model And Helpers

Status: completed.

Scope:

- add local typed User Open Question model using TS07 statuses;
- add pure helper for creating a User Open Question in an active Action Plan;
- keep Progress independent from User Open Questions;
- keep History unchanged in this first domain pass;
- keep the existing Action Plan aggregate unchanged.

No UI, API, Supabase, auth, persistence or routing in this step.

Step 1 implementation note:

- the first domain pass added the local typed User Open Question model and a pure create helper only;
- it intentionally does not mutate Progress, History or the existing Action Plan aggregate;
- status-transition helpers, text-edit helpers and UOQ History Event creation remain in the later VS-03 implementation steps where they are verified with their own behavior.

### Step 2: User Open Question UI In Active Plan Context

Status: completed.

Scope:

- show existing User Open Questions inside the active Action Plan context;
- show each User Open Question as "Ваш вопрос";
- show boundary copy that the question is for external verification and not an answer;
- distinguish Template Open Questions from User Open Questions;
- keep context before action;
- show an empty-state message when no User Open Questions exist.

No create, edit, delete, status update, History mutation, User Notes, Checked Source Marks, dashboard, search, sorting or completed-plan behavior in this step.

### Step 3: User Open Question Status Update

Scope:

- allow only TS07 status transitions;
- keep `irrelevant` final;
- keep `clarified_by_user` visibly marked as user's personal mark, not official answer;
- create `user_open_question_status_changed`;
- keep Progress unchanged.

No automatic closing and no Progress coupling.

### Step 4: User Open Question Text Edit

Scope:

- edit User Open Question text while allowed;
- preserve Action Plan and Scenario Version context;
- create `user_open_question_edited`;
- keep the question user-owned and externally verifiable.

No User Notes and no document-storage behavior.

### Step 5: History Visibility For UOQ Events

Scope:

- extend read-only History display to existing UOQ events;
- show event type, timestamp and related context;
- keep History append-only and non-official.

No History edit/delete/filter/search/sorting.

### Step 6: Demo Flow Validation

Scope:

- add one full interaction test for VS-03:
  `Return Context -> Action Plan -> Step Detail -> Template OQ -> Create User OQ -> Update Status -> Edit Text -> History`;
- assert forbidden scope remains absent.

No new product features beyond VS-03.

## 10. UI Scope

VS-03 uses only the relevant parts of UI-01:

- U-05: Action Plan Detail may show a short User Open Question summary or entry point;
- U-06: Step Detail may show Template Open Questions before User Open Question controls;
- U-07: History may show UOQ History Events read-only;
- U-08: User Open Questions list and allowed actions inside own active Action Plan.

UI must preserve:

- context before action;
- one main next step;
- Progress as "Ваша отметка";
- User Open Question as "Ваш вопрос";
- History as internal, read-only and non-official;
- no task-manager drift;
- no official answer wording.

## 11. Testing Strategy

Tests must cover:

- creating User Open Question inside an existing active Action Plan;
- created User Open Question starts with approved TS07 status;
- created question stores only user-owned context and references versioned content context where applicable;
- creating question creates exactly one `user_open_question_created` History Event;
- allowed status transitions;
- forbidden status transitions;
- `irrelevant` is final;
- `clarified_by_user -> requires_check` is allowed;
- status changes create `user_open_question_status_changed`;
- status changes do not update Progress automatically;
- Progress changes do not update User Open Question automatically;
- editing text creates `user_open_question_edited`;
- Template Open Questions and User Open Questions are visually distinct;
- UI labels User Open Questions as "Ваш вопрос";
- UI boundary copy says questions require external verification and are not official answers;
- History displays UOQ events read-only;
- forbidden scope remains absent:
  - User Notes;
  - Checked Source Marks;
  - Completed Plans;
  - Pattern B;
  - Content Admin;
  - Supabase;
  - API handlers;
  - auth;
  - routing library;
  - state manager;
  - persistence;
  - document storage;
  - dashboard;
  - deadlines;
  - priorities;
  - assignees;
  - kanban.

Required checks after each implementation step:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

## 12. Definition Of Done

VS-03 is complete when:

- the user can create a User Open Question inside the existing active Action Plan;
- the user can see User Open Questions in the plan context;
- the user can distinguish Template Open Questions from User Open Questions;
- the user can update User Open Question status only through TS07 transitions;
- `irrelevant` is final;
- `clarified_by_user` remains a user's mark, not official answer;
- the user can edit User Open Question text while allowed;
- UOQ create, status update and edit produce append-only History Events;
- History remains read-only and non-official;
- Progress remains independent from UOQ status;
- no User Notes, Checked Source Marks, Completed Plans, Pattern B, Content Admin, Supabase, API handlers, auth, routing library, state manager, persistence or document storage are added;
- all standard verification commands pass;
- demo flow validation passes as one user-facing flow.

## 13. Known Limitations

VS-03 remains a local vertical slice:

- local React state is lost after reload;
- persistence is absent;
- auth is absent;
- Supabase is absent;
- API handlers are absent;
- concurrency enforcement is absent;
- the current React internal dispatcher workaround remains a temporary test-only compromise and is not a permanent testing strategy.

These limitations are acceptable only because VS-03 validates the local MVP user flow before infrastructure work. The UI must not imply production persistence or official external verification.

## 14. Risks

### Risk: User Open Question becomes an answer

User Open Questions must remain questions for external verification.

Control: label every UOQ as "Ваш вопрос" and avoid wording that implies Nova Agent has answered it.

### Risk: `clarified_by_user` sounds official

The status could be misread as professional confirmation.

Control: show it as a personal user mark, not official answer or specialist decision.

### Risk: `irrelevant` is reopened

Reopening `irrelevant` would violate TS07.

Control: runtime helper and tests must reject every transition out of `irrelevant`.

### Risk: UOQ changes mutate Progress

That would violate TS07 separation.

Control: tests must assert Progress remains unchanged after UOQ status changes.

### Risk: VS-04 features leak into VS-03

Notes and Checked Source Marks are tempting adjacent features.

Control: keep User Notes and Checked Source Marks explicitly out of scope and covered by forbidden-scope tests.

### Risk: Dashboard or task-manager drift

A list of questions can drift into a productivity or ticket dashboard.

Control: no deadlines, priorities, assignees, kanban, productivity metrics, search or sorting controls in VS-03.

## 15. Self-Audit

- MVP Work Plan alignment: VS-03 remains User Open Questions only.
- Product Principles alignment: questions reduce uncertainty without Nova Agent making decisions.
- UI-01 alignment: U-08 is used only inside own active Action Plan context; Template OQ and User OQ are separated.
- TS07 alignment: UOQ lifecycle and History Events follow the approved graph.
- TS08 alignment: API semantics are referenced without adding API handlers or new contracts.
- Technical Architecture alignment: UOQ remains user-owned workflow data connected to Action Plan and Scenario Version context.
- Scope creep check: no new Product Decisions, API Decisions, Data Decisions, roles, states, entities, Supabase, auth, persistence, Content Admin, User Notes, Checked Source Marks or Pattern B are introduced.
