# Demo Polish Plan

## 1. Purpose

This plan prepares the current Nova Agent MVP demo for a clearer product
presentation.

Demo Polish exists only to make the already working MVP easier to understand in
a live or Vercel demo.

Demo Polish is not:

- a new product slice;
- a new feature;
- a redesign of the architecture;
- Supabase work;
- auth work;
- persistence work;
- a routing, API or state-management change.

This plan must preserve the completed VS-01, VS-02, VS-03 and VS-04 product
logic.

## 2. Sources Of Truth

The plan follows the documentation hierarchy from `AGENTS.md`.

Primary sources:

- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-28-mvp-online-demo-plan.md`;
- `plans/completed/2026-06-28-vs-04-implementation-plan.md`;
- `README.md`;
- `changelog/2026-06-28.md`.

If this plan conflicts with a higher-priority source, the higher-priority source
wins.

## 3. Current Demo State

The app already demonstrates the local MVP flow:

```text
Life Situation
-> Scenario
-> Action Plan
-> Return Context
-> Progress
-> User Open Questions
-> Checked Source Marks
-> User Notes
-> History
```

The current demo remains local-only:

- seed content is loaded from the local content repository;
- user-owned workflow state is held in React local state;
- there is no Supabase client;
- there is no API layer;
- there is no auth;
- there is no persistence;
- there is no routing library;
- reload can lose state.

This local-only limitation is acceptable for the static demo only if it remains
visible in demo instructions and does not become a persistence claim.

## 4. Non-Negotiable Boundaries

Demo Polish must not weaken product boundaries.

Boundary copy may be visually softened, grouped or made easier to scan, but the
meaning must remain:

- Nova Agent does not provide an official status;
- Nova Agent does not confirm that an action was completed;
- Nova Agent does not verify a source;
- Progress remains the user's mark;
- History remains internal Nova Agent history, not an official journal;
- User Notes are not documents, sources or Nova Agent answers;
- Checked Source Marks are user-owned marks, not source verification;
- User Open Questions are user-owned questions for external verification;
- demo state is local-only until a later persistence plan changes that.

If preserving the meaning requires keeping the copy explicit, explicit copy wins
over visual minimalism.

## 5. In Scope

Only visual, copy and layout polish is in scope.

Allowed:

- improve the first screen so the demo feels like a product entry point;
- make the demo flow easier to understand;
- improve cards, spacing, headings and CTA hierarchy;
- make warnings and restrictions visually calmer while keeping them visible
  before relevant actions;
- visually separate History Events from User Notes forms;
- make Sources and Checked Source Marks easier to scan;
- replace technical labels with user-facing labels without changing meaning;
- hide or rephrase enum-like labels for users while keeping tests and domain
  values unchanged;
- improve mobile and desktop layout;
- update README demo instructions;
- add local and Vercel smoke test instructions.

Examples of safe polish:

- CSS spacing, typography, visual grouping and component layout;
- clearer section headings;
- less technical visible labels;
- better button hierarchy;
- README wording that reflects the current VS-04 local MVP state.

## 6. Out Of Scope

Forbidden:

- new features;
- workflow helper changes;
- domain logic changes;
- Progress source-of-truth changes;
- History append-only or read-only semantic changes;
- User Open Question behavior changes;
- Checked Source Mark behavior changes;
- User Note behavior changes;
- Supabase;
- API handlers;
- auth;
- routing library;
- state manager;
- persistence;
- dashboard;
- completed plans management;
- Content Admin;
- document storage;
- CRM behavior;
- task-manager behavior;
- deadlines;
- priorities;
- assignees;
- kanban;
- new entities;
- new roles;
- new states;
- new Product Decisions;
- new API Decisions;
- new Data Decisions.

If a polish change requires any item above, stop and create a separate plan or
decision record before implementation.

## 7. Step Plan

### Step 1: Demo Polish Plan Creation

Status: in progress.

Create this active plan and update changelog only.

No application code, README, specs, Product Principles, Technical Architecture,
Supabase, API, auth, persistence or Vercel config changes in this step.

### Step 2: UI Visual Polish Only

Status: completed.

Improve the current UI without changing product behavior.

Allowed targets:

- first screen;
- section hierarchy;
- cards;
- spacing;
- headings;
- CTA hierarchy;
- warning and restriction treatment;
- Sources and Checked Source Marks presentation;
- History and User Notes visual separation;
- mobile and desktop layout.

Required checks:

- existing tests still pass;
- product boundary copy remains present;
- Progress, History, UOQ, CSM and User Note behavior is unchanged;
- no forbidden product scope appears.

Step 2 implementation note:

- polished the first screen into a clearer product/demo entry point;
- replaced technical visible labels with user-facing labels while preserving
  domain values and product meaning;
- improved card spacing, button treatment, warnings/restrictions, sources,
  Checked Source Marks, History Events and User Note visual separation;
- kept boundary copy visible near risky actions;
- did not change workflow helpers, domain logic, Progress source of truth,
  History semantics, UOQ behavior, CSM behavior or User Note behavior.

### Step 3: README And Demo Instructions Update

Status: completed.

Update README as a developer/demo entry point.

README should explain:

- what Nova Agent is;
- current local MVP demo state;
- how to run the app;
- how to run checks;
- how to deploy or inspect the static Vercel demo;
- reload loses state until persistence work is implemented.

README must not become a replacement for Product Specs.

Step 3 implementation note:

- updated README to describe Nova Agent, the online Vercel demo URL, current
  VS-01 through VS-04 completion state, Demo Polish Step 1 completion and the
  current MVP demo feature set;
- documented local run commands and build/test commands from `package.json`;
- documented demo limitations: local-only state, reload state loss, no
  Supabase, no auth and no persistence;
- preserved product boundaries around official status, action confirmation,
  source verification, User Notes and legal/tax/medical advice;
- did not change application code, specs, Product Principles, Technical
  Architecture, package configuration, Supabase, API, auth, routing, state
  manager or persistence behavior.

### Step 4: Local Demo Smoke Test

Run the local demo flow after UI polish:

- open app locally;
- start Action Plan;
- change Progress;
- open History;
- create User Open Question;
- mark source as checked by user;
- add User Note;
- confirm boundary copy remains visible;
- confirm reload state loss is understood for local/static demo.

Required commands:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

### Step 5: Vercel Demo Smoke Test

Run the same smoke flow on the Vercel deployment URL.

Confirm:

- app opens on the deployed URL;
- static demo does not require env vars;
- no backend, API, auth or Supabase behavior is implied;
- reload loses state as expected for the static demo;
- demo instructions match observed behavior.

### Step 6: Demo Polish Closure

Close this plan only after:

- UI polish is complete;
- README/demo instructions are updated;
- local smoke test is complete;
- Vercel smoke test is complete or explicitly deferred with reason;
- tests and build pass;
- scope audit confirms no product logic change;
- changelog is updated.

Move this plan to `plans/completed/` only when fully closed.

## 8. Testing Strategy

Demo Polish must keep the existing automated baseline green:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

Testing must verify that visual changes did not alter:

- Progress rules;
- next-step rules;
- History append-only/read-only behavior;
- User Open Question behavior;
- Checked Source Mark behavior;
- User Note behavior;
- local-only persistence limitation.

The existing React internal dispatcher workaround remains test-only. Demo Polish
must not expand it into runtime code or treat it as a permanent testing
strategy.

## 9. Completion Criteria

Demo Polish is complete when:

- UI looks like a coherent MVP demo, not a raw developer prototype;
- product logic is unchanged;
- all automated checks pass;
- README explains the current demo state;
- local demo smoke test passes;
- Vercel demo is ready to show by link or the remaining deploy step is clearly
  documented;
- local-only reload limitation is explicit;
- no Supabase, API, auth, routing, state manager, persistence, dashboard,
  completed plans management, Content Admin or document storage is added.

## 10. Risks

### Risk 1: Product Logic Drift

Visual polish can accidentally change workflow behavior.

Control: do not touch domain helpers or workflow rules in polish steps.

### Risk 2: Boundary Copy Becomes Too Subtle

Making the UI calmer can weaken important product boundaries.

Control: boundary meaning must remain visible near risky actions.

### Risk 3: Dashboard Drift

Improving the first screen or return context can accidentally become a dashboard.

Control: keep the demo focused on one active Action Plan and the existing flow.

### Risk 4: Task Manager Drift

Better cards and CTAs can make the Action Plan feel like generic task
management.

Control: do not add deadlines, priorities, assignees, kanban or arbitrary tasks.

### Risk 5: Persistence Expectation Drift

An online static demo can look persistent.

Control: README and UI/demo notes must state that reload can lose state until
the persistence phase is implemented.

### Risk 6: README Drift

README currently risks lagging behind the implemented VS-04 demo.

Control: update README in a dedicated polish step without moving Product Specs
into README.

## 11. Commit Discipline

Keep Demo Polish commits small and reviewed.

Recommended commit groups:

- plan creation;
- UI visual polish;
- README/demo instructions;
- smoke validation;
- closure.

Do not combine polish with Supabase, auth, API, persistence, routing or product
logic changes.
