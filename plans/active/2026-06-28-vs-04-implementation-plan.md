# VS-04 Implementation Plan: Sources And Notes

## 1. Purpose

This document prepares implementation of VS-04 "Sources And Notes" for Nova Agent.

VS-04 exists to solve one user problem:

```text
The user works inside an existing active Action Plan and needs to remember which official or reference source they checked and what short context they want to keep next to their own workflow history.
```

VS-04 is one active vertical slice:

- active vertical slice: Sources And Notes inside an existing active Action Plan;
- user problem: checked sources and short personal context must not be lost while continuing the plan;
- solution: Checked Source Marks and User Notes with strict boundary labels, History context and no official meaning.

This document does not revise Product Principles, MVP Work Plan, TS01-TS08, UI-01, Decision Records, domain entities, roles, states, API contracts, persistence model or product scope.

## 2. Sources Of Truth

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
- `plans/active/2026-06-21-mvp-work-plan.md`;
- completed VS-01, VS-02 and VS-03 implementation plans in `plans/completed/`.

If this document conflicts with a higher-priority source, the higher-priority source wins.

## 3. Non-Negotiable Boundaries

### Checked Source Marks

Checked Source Mark means only:

```text
The user marked that they checked the source themselves.
```

Checked Source Mark does not mean:

- Nova Agent checked or verified the source;
- the source is officially confirmed;
- an action was completed;
- an authority accepted a document;
- information is legally, medically, financially or tax confirmed;
- the source is current, valid, accepted, up to date or officially confirmed.

Required boundary copy:

- "Отмечено вами";
- "Nova Agent не проверяет источник";
- "Это не официальный статус".

Implementation must preserve DR-01:

- one Checked Source Mark per Action Plan and Source Revision;
- creating the same mark again returns the existing mark;
- repeated source checks do not create duplicate marks.

Checked Source Mark is not a Plan-Creating Stateful Action. It exists only inside an existing active Action Plan.

### User Notes

User Note means only:

```text
A short note written by the user to preserve their own context next to a workflow History Event.
```

User Note is not:

- an official document;
- a Source;
- a User Open Question;
- an answer from Nova Agent;
- professional advice;
- document storage;
- a diary;
- a personal data store.

Required boundary copy:

- "Ваша заметка";
- "Не официальный документ";
- "Не источник";
- "Не ответ Nova Agent".

User Note must reference a context History Event from the same Action Plan.

`user_note_created` is an audit History Event and must not become the context event for the note itself.

### History

History may record VS-04 events but never becomes the source of truth for current state.

History remains:

- append-only;
- read-only;
- internal Nova Agent history;
- not an official journal;
- not a source of truth for current Checked Source Mark or User Note state;
- not confirmation of any external action.

## 4. In Scope

VS-04 includes only user-owned Sources And Notes behavior inside an existing active Action Plan.

In scope:

- local Checked Source Mark typed model and pure helper;
- list Checked Source Marks inside the active Action Plan context;
- create Checked Source Mark for a Source Revision reachable from the Action Plan Scenario Version;
- idempotent Checked Source Mark behavior;
- append-only `source_checked` History Event;
- local User Note typed model and pure helper;
- create/read User Note attached to an existing context History Event;
- User Note lifecycle only if implemented as explicitly scoped sub-steps:
  - edit;
  - hide/archive;
  - delete;
- append-only User Note History Events:
  - `user_note_created`;
  - `user_note_edited`;
  - `user_note_hidden`;
  - `user_note_deleted`;
- existing active Action Plan only;
- existing seed content and existing source context only;
- existing local state only;
- strict boundary labels for Checked Source Marks, User Notes and History.

## 5. Out Of Scope

The following are forbidden in VS-04:

- source verification by Nova Agent;
- official source approval;
- official status tracking;
- legal, tax, medical or financial advice;
- user document storage;
- file upload;
- scans, forms, official letters or document archive behavior;
- notes app;
- diary;
- CRM;
- task manager;
- authority tracker;
- arbitrary user-created tasks;
- deadlines;
- priorities;
- assignees;
- kanban;
- Completed Plans;
- Dashboard;
- Pattern B;
- Content Admin;
- Content Admin access to User Notes or Checked Source Marks;
- Supabase;
- API handlers;
- auth;
- routing library;
- state manager;
- persistence;
- document storage;
- new Life Situations;
- new Scenarios;
- new Product Decisions;
- new API Decisions;
- new Data Decisions;
- new roles;
- new states;
- new entities outside the already approved User Note and Checked Source Mark.

If implementation pressure requires any item from this list, VS-04 work must stop until the relevant specification, decision record and active plan are updated.

## 6. Step Plan

Implementation must proceed in small vertical steps.

### Step 1: Checked Source Mark Domain Model And Helper

Status: completed.

Scope:

- add local typed Checked Source Mark model;
- add pure helper for creating a mark inside an existing active Action Plan;
- enforce Source Revision identity;
- defer full duplicate/idempotency enforcement until Checked Source Marks are part of the local aggregate/list state;
- reject creation without existing active Action Plan;
- keep Progress, User Open Questions and User Notes unchanged.

No UI, API, Supabase, auth, persistence, routing or document storage in this step.

Step 1 implementation note:

- added the local typed Checked Source Mark model with `sourceRevisionId`, using the existing seed Source identifier as the local Source Revision-compatible identifier;
- added a pure create helper for active Action Plans only;
- the helper does not mutate the existing Action Plan aggregate, does not change Progress, does not append History and does not create User Notes;
- source verification, official status fields and History Events remain out of scope for this step;
- duplicate prevention/idempotency is intentionally left for the later step that introduces Checked Source Mark list state, because the current Action Plan aggregate does not yet contain Checked Source Marks.

### Step 2: Checked Source Mark Read/Create UI Near Existing Sources

Status: completed.

Scope:

- show Source type and source currentness warning near existing sources;
- show Checked Source Mark as "Отмечено вами";
- show boundary copy: "Nova Agent не проверяет источник" and "Это не официальный статус";
- add explicit user action to mark an available Source Revision as checked;
- do not show duplicate mark creation as a new event if mark already exists.

No source verification wording, no official status wording and no Action Plan creation from source marks.

Step 2 implementation note:

- added local React state for Checked Source Marks inside the existing active Action Plan UI;
- displayed the user action next to existing step sources only, not in read-only Scenario browsing;
- used `createCheckedSourceMark` and a simple local Action Plan + Source Revision check to avoid duplicate marks;
- displayed the required boundary copy: "Отмечено вами", "Nova Agent не проверяет источник", "Это не официальный статус" and "Это не подтверждение действия";
- kept Progress, History, Action Plan state, User Open Questions and User Notes unchanged;
- did not add `source_checked`, source verification, official status, uploads, document storage, Supabase, API handlers, auth, routing, state manager or persistence.

### Step 3: Checked Source Mark History Event

Status: completed.

Scope:

- append `source_checked` History Event only when a new Checked Source Mark is created;
- do not append another `source_checked` event for an idempotent repeated mark;
- display the event through the existing read-only History UI if needed;
- keep History internal, append-only and non-official.

No separate Source History and no editable History.

Step 3 implementation note:

- added `source_checked` to the local History Event type union with minimal payload: Action Plan, Source Revision-compatible identifier, Checked Source Mark id and creation time;
- added `createCheckedSourceMarkWithHistory` so creating a new Checked Source Mark appends one internal History Event while preserving the pure `createCheckedSourceMark` helper;
- updated local App orchestration so a repeated Action Plan + Source Revision mark returns the existing local mark state and does not append another `source_checked` event;
- extended the existing read-only History UI to display the event as "Источник отмечен вами" with boundary copy: "Nova Agent не проверяет источник", "Это не официальный статус" and "Это не подтверждение действия";
- kept Progress, Action Plan state, User Open Questions and User Notes unchanged;
- did not add source verification, official status, uploads, document storage, Supabase, API handlers, auth, routing, state manager or persistence.

### Step 4: User Note Domain Model And Helper

Status: planned.

Scope:

- add local typed User Note model using approved lifecycle states;
- add pure helper for creating a note attached to a context History Event;
- enforce same Action Plan scope for note and context History Event;
- reject notes without a valid context History Event;
- keep User Note text as short supporting context.

No UI, API, Supabase, auth, persistence, routing or document storage in this step.

### Step 5: User Note Create/Read UI In Active Action Plan Context

Status: planned.

Scope:

- allow creating a short User Note only from an existing History context inside the active Action Plan;
- show the note next to its context History Event;
- label notes as "Ваша заметка";
- show boundary copy: "Не официальный документ", "Не источник", "Не ответ Nova Agent";
- display hidden/deleted note states only if a lifecycle step has already introduced them.

No User Note as a standalone notes app, no note list dashboard and no document-like UI.

### Step 6: User Note Lifecycle

Status: planned but risk-gated.

Scope, if kept in VS-04:

- edit User Note text in active Action Plan only;
- hide/archive User Note according to TS07, TS08 and DR-07;
- delete User Note according to TS07, TS08 and DR-07;
- keep context History Event unchanged;
- never expose hidden/deleted note text in normal reads.

This step must be split into smaller sub-steps if implementation becomes large or ambiguous.

If the lifecycle step threatens VS-04 scope, it must be deferred to a later vertical slice or a later VS-04 sub-step before code is written.

### Step 7: User Note History Events

Status: planned.

Scope:

- append `user_note_created` when a User Note is created;
- append `user_note_edited` when a User Note is edited;
- append `user_note_hidden` when a User Note is hidden;
- append `user_note_deleted` when a User Note is deleted;
- keep History read-only, internal and non-official.

History explains what happened but does not become the mutable source of truth for the note.

### Step 8: Demo Flow Validation

Status: planned.

Scope:

- add one full interaction test for the VS-04 flow;
- validate Checked Source Mark creation/idempotency;
- validate `source_checked`;
- validate User Note creation attached to a context History Event;
- validate User Note boundary copy;
- validate User Note lifecycle only if Step 6 was implemented;
- validate History boundary copy;
- validate absence of forbidden scope.

### Step 9: Closure

Status: planned.

Scope:

- mark all VS-04 steps completed;
- move the implementation plan to `plans/completed/`;
- update the MVP Work Plan to mark VS-04 completed and identify VS-05 as next;
- update changelog;
- do not change application behavior in closure.

## 7. Testing Strategy

VS-04 tests must cover:

- Checked Source Mark creation inside existing active Action Plan;
- rejection when no active Action Plan exists;
- idempotent mark creation for same Action Plan and Source Revision;
- no duplicate Checked Source Marks;
- no duplicate `source_checked` History Events for idempotent repeat;
- Checked Source Mark does not change Progress;
- Checked Source Mark does not create an Action Plan;
- Checked Source Mark does not change Source or Source Revision;
- Checked Source Mark is not displayed as Nova Agent verification;
- User Note creation with valid context History Event;
- User Note rejection without context History Event;
- User Note rejection when context event belongs to another Action Plan;
- User Note is displayed as "Ваша заметка";
- User Note is not displayed as Source, official document, answer or advice;
- User Note lifecycle behavior only for steps that implement it;
- User Note History Events;
- History remains append-only and read-only;
- History is not source of truth;
- no User Notes or Checked Source Marks are visible to Content Admin;
- absence of dashboard, Completed Plans, Pattern B, Content Admin UI, Supabase, API handlers, auth, routing, state manager, persistence and document storage.

Every implementation step must run:

```text
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Documentation-only closure steps may run `git diff --check` unless code changes are included.

## 8. Local Limitations

VS-04 remains a local MVP vertical slice.

Known limitations:

- local React state is lost after reload;
- no persistence;
- no auth;
- no Supabase;
- no API handlers;
- no backend concurrency enforcement;
- idempotency is local only;
- no document storage;
- no physical privacy model for hidden/deleted notes;
- React internal dispatcher workaround in tests remains test-only and is not a permanent testing strategy.

These limitations are acceptable for VS-04 only because the slice validates product behavior locally before backend implementation.

## 9. Completion Criteria

VS-04 is complete when a user can, inside an existing active Action Plan:

```text
see existing Sources
-> mark a Source Revision as checked
-> see the mark as "Отмечено вами"
-> understand Nova Agent did not verify the source
-> see `source_checked` in internal History
-> create a short User Note attached to a context History Event
-> see the note as "Ваша заметка"
-> understand the note is not a document, source or Nova Agent answer
-> see User Note History Events
```

Completion also requires:

- Checked Source Mark idempotency;
- no Action Plan creation from Checked Source Mark;
- User Note context History Event enforcement;
- History append-only and read-only behavior;
- no source verification language;
- no official status language;
- no document storage behavior;
- no task-manager, CRM, advisor or authority-tracker drift;
- all checks pass;
- final VS-04 demo flow validation passes;
- changelog updated;
- implementation plan moved to `plans/completed/` during closure.

## 10. Risks

### Risk 1: Checked Source Mark becomes source verification

If UI says "verified", "valid", "accepted", "up to date" or "officially confirmed", Nova Agent creates a false authority signal.

Mitigation: use only "Отмечено вами", "Nova Agent не проверяет источник" and "Это не официальный статус".

### Risk 2: User Note becomes document storage

Free text can drift into document archive, diary or personal data storage.

Mitigation: keep notes short, contextual, attached to History Events and labeled as "Ваша заметка". Do not add file upload, document fields or standalone note dashboards.

### Risk 3: User Note lifecycle is too large

Edit, hide and delete can expand VS-04 beyond a narrow vertical slice.

Mitigation: Step 6 is risk-gated. Split it into sub-steps or defer it if implementation becomes ambiguous.

### Risk 4: History becomes current state

History may look like the source of truth for notes or checked sources.

Mitigation: domain helpers keep current records separate. History remains append-only context only.

### Risk 5: Completed Plans leak into VS-04

DR-07 defines completed-plan note behavior, but this VS-04 plan is active-only.

Mitigation: implement only existing active Action Plan behavior unless a later plan explicitly expands completed read-only behavior.

### Risk 6: Test workaround becomes runtime contract

Existing React internal dispatcher workaround is test-only.

Mitigation: do not expand it into app code or navigation contract. Revisit normal DOM interaction test setup before larger UI flows.

## 11. Commit Discipline

VS-04 must be committed in small reviewed steps.

Rules:

- no `git add .`;
- commit only files relevant to the current step;
- no commit before final audit says `READY FOR COMMIT: YES`;
- no push without explicit user permission;
- changelog must be updated for every completed step;
- implementation plan must be updated after every completed step;
- closure must be a separate documentation-only step.

Recommended commit message for this planning step:

```text
docs: add VS-04 implementation plan
```
