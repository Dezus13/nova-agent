# AI Demo Presentation Layer Plan

## 1. Problem

The current Nova Agent production demo works and the Agentic Demo Shell is
closed as completed.

Production demo:

`https://nova-agent-demo.vercel.app/`

The remaining presentation problem is perception: the first screen and demo flow
still feel closer to a website/form than to an AI assistant product.

This plan defines a small presentation-only layer that makes the current demo
feel more like an AI / agentic assistant while preserving the existing product
truth:

- no real AI;
- no OpenAI API;
- no new scenario generation;
- no new workflow/domain logic;
- deterministic mapping to the current seed scenario.

## 2. Goal

Create an AI-feel presentation layer on top of the existing demo flow.

The user should immediately understand that Nova Agent is positioned as an AI
assistant / agentic assistant for structuring a life task, while the demo remains
honest about its current limitations.

The desired experience:

```text
User enters life task
-> Nova Agent shows demo-mode understanding
-> Nova Agent shows a short AI-like response
-> user opens the existing Action Plan workflow
```

The goal is presentation polish and expectation-setting, not new product logic.

## 3. Sources Of Truth

This plan follows the documentation hierarchy from `AGENTS.md`.

Primary sources:

- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-28-mvp-online-demo-plan.md`;
- `plans/completed/2026-06-28-agentic-demo-shell-plan.md`;
- `plans/completed/2026-06-28-demo-polish-plan.md`;
- `changelog/2026-06-28.md`.

If this plan conflicts with a higher-priority source, the higher-priority
source wins.

## 4. User-Facing Experience

The first screen should feel like an assistant, not a generic form.

Required experience direction:

- headline that clearly presents Nova Agent as an AI assistant / agentic
  assistant for life-in-Austria tasks;
- large input / command area for the user's life task;
- example prompt for the current demo scenario;
- visible demo-mode cue before or near the input;
- short assistant-style response after a non-empty prompt;
- clear CTA from the response to the existing Action Plan workflow.

The assistant-style response may include:

- acknowledgement that Nova Agent understood the task for demo purposes;
- a short structured interpretation of the user's task;
- what the current demo plan will help with;
- reminder that the flow is based on the current demonstration scenario;
- CTA to open the existing plan.

The response must not look like a legal, tax, medical, official or professional
assessment.

## 5. Required Copy Boundaries

The UI must preserve honest limitations.

Required boundary meanings:

- demo-only;
- based on the current demonstration scenario;
- Nova Agent does not create new scenarios in this version;
- no real AI / OpenAI integration in this version;
- not a legal, tax or medical advisor;
- not an official status;
- not confirmation of an external action;
- prompt only starts the demo flow.

Allowed copy examples:

- "Демо-режим";
- "AI-like demo response";
- "На основе текущего демонстрационного сценария";
- "Nova Agent не создаёт новые сценарии в этой версии";
- "В этой версии нет real AI / OpenAI integration";
- "Это не официальный статус и не профессиональная консультация";
- "Ваш запрос запускает демонстрационный flow".

Forbidden copy meanings:

- "Nova Agent generated a new scenario";
- "OpenAI understood your request";
- "AI verified your situation";
- "officially verified";
- "approved";
- "accepted";
- "confirmed";
- "legal/tax/medical conclusion";
- "saved to your account";
- "production persistence".

## 6. Implementation Scope

Only UI / presentation layer changes are allowed in the implementation phase.

Allowed implementation areas for a later step:

- `src/app/App.tsx`;
- `src/app/App.css`;
- `src/app/App.test.tsx`;
- existing app components;
- optionally a small presentation component if it keeps the structure clearer;
- this active plan;
- `changelog/2026-06-28.md`;
- README only if a later README/demo-instructions step is explicitly requested.

The implementation must use the existing workflow and current seed scenario.

The implementation must not change:

- `src/domain/*`;
- workflow helpers;
- content repository;
- Progress logic;
- History semantics;
- User Open Questions behavior;
- Checked Source Marks behavior;
- User Notes behavior;
- product ownership assumptions.

## 7. Acceptance Criteria

The demo presentation layer is acceptable when:

- the first screen feels like an AI assistant / agentic assistant demo;
- the user can enter a non-empty life-task prompt;
- empty input does not open the workflow;
- non-empty input shows an AI-like demo response;
- the response clearly says the demo is based on the current demonstration
  scenario;
- the response clearly says Nova Agent does not create new scenarios in this
  version;
- the user can open the existing workflow from the response;
- the existing VS-01 through VS-04 workflow remains available;
- no real AI, OpenAI API, Supabase, auth, routing, persistence or new domain
  logic is introduced;
- the UI does not imply official status, external action completion or
  professional advice.

## 8. Forbidden Scope

Do not add:

- OpenAI API;
- real AI calls;
- backend API;
- Supabase;
- auth;
- persistence;
- routing changes;
- state manager;
- new domain logic;
- workflow helper changes;
- content repository changes;
- real intent recognition;
- scenario search;
- scenario generator;
- multiple scenario matching;
- real source verification;
- document upload;
- document storage;
- dashboard;
- completed plans management;
- Content Admin;
- CRM or task-manager behavior;
- legal, tax or medical conclusions;
- official status or authority tracking.

If any implementation attempt needs one of these, stop and create a separate
specification, decision record or plan before continuing.

## 9. Validation

After implementation, run:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

Smoke validation must cover both local and production demo:

- production URL opens;
- first screen feels like an AI assistant demo;
- non-empty prompt shows AI-like demo response;
- boundary copy is visible;
- "Open plan" / equivalent CTA opens the existing workflow;
- existing workflow remains accessible:
  - Life Situation;
  - Scenario;
  - Action Plan / Steps;
  - Progress;
  - History;
  - User Open Questions;
  - Checked Source Marks;
  - User Notes;
- no OpenAI, Supabase, auth, routing, persistence or new domain behavior is
  visible or implied.

## 10. Step Plan

### Step 1: Plan Creation

Status: in progress.

Create this active plan and update changelog only.

No application code, README, specs, Product Principles, Technical Architecture,
OpenAI, Supabase, API, auth, routing, state manager, persistence or new feature
work in this step.

### Step 2: UI Presentation Layer

Status: pending.

Implement visual/copy/presentation changes only.

Expected focus:

- assistant-like first screen;
- larger life-task input area;
- AI-like demo response block;
- clearer transition to existing workflow;
- visible demo-only boundary copy.

### Step 3: README / Demo Instructions

Status: pending.

Update README only if needed after implementation to avoid overpromising real
AI, OpenAI integration or scenario generation.

### Step 4: Local Smoke Validation

Status: pending.

Run automated checks and local smoke flow.

### Step 5: Production Smoke Validation

Status: pending.

Validate the production demo URL after deployment:

`https://nova-agent-demo.vercel.app/`

### Step 6: Closure

Status: pending.

Close the plan only after implementation, README/docs update if needed, local
smoke, production smoke, changelog update and scope audit are complete.

Move this plan to `plans/completed/` only when fully closed.

## 11. Risks

### Risk 1: Fake AI Expectation

An AI-like response can make users believe real AI is running.

Control: the UI must say demo-only, current demonstration scenario and no new
scenarios in this version.

### Risk 2: Product Overpromise

Assistant-style copy can sound like Nova Agent provides professional judgment.

Control: keep legal/tax/medical/official boundaries visible near the response
and CTA.

### Risk 3: Scenario Generation Drift

The input box can imply universal scenario generation.

Control: keep deterministic mapping to the current seed scenario and do not edit
content repository or domain workflow helpers.

### Risk 4: Backend / Persistence Drift

An AI-feel UI can make the demo look production-ready.

Control: keep local-only and no-persistence limitations in README/demo
instructions when relevant.

### Risk 5: Visual Polish Becomes Product Scope

Presentation improvements can accidentally become dashboard, task manager or
CRM behavior.

Control: no plans list, no deadlines, no assignees, no kanban, no CRM records,
no completed plans management.

## 12. Commit Discipline

Keep commits small:

- plan creation;
- UI presentation layer;
- README/demo instructions if needed;
- smoke validation;
- closure.

Do not combine this work with OpenAI, Supabase, auth, API, routing, persistence,
domain logic, content repository changes or product-scope expansion.
