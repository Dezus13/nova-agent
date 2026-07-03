# Nova Agent

Nova Agent is an informational and organizational guide for administrative,
household and life-in-Austria processes.

It helps a user understand a life situation, inspect an applicable scenario,
start an Action Plan, mark their own progress, keep return context, review
internal history, track open questions, mark sources they checked themselves and
add short user-owned notes.

The current demo starts with an Agentic Demo Shell: a demo-only first layer where
the user enters a sample task, sees a short demo summary and then opens the
existing scenario workflow.

Nova Agent does not replace official authorities, institutions, lawyers, tax
advisors, doctors, insurance consultants or other specialists.

## Online Demo

The current MVP demo is available at:

<https://nova-agent-teal.vercel.app/>

The Vercel deployment works as a static Vite demo. State is local-only, so data
can be lost after reload.

## Agentic Demo Shell

The demo now begins with an AI-product-style first screen.

The shell is demo-only:

- the user enters or selects a sample task;
- Nova Agent shows a demo-only summary;
- the app then opens the existing workflow;
- the mapping is deterministic:

```text
any non-empty prompt
-> current seed scenario
-> existing Action Plan flow
```

The shell is based on the current demonstration scenario. Nova Agent does not
create new scenarios in this version.

Not implemented in this demo shell:

- real AI;
- OpenAI API;
- real intent recognition;
- universal scenario search;
- scenario generation;
- production assistant behavior.

## What Works In The Demo

The demo currently includes:

- Agentic Demo Shell;
- Life Situation;
- Scenario;
- Action Plan;
- Progress;
- Return Context;
- History;
- User Open Questions;
- Checked Source Marks;
- User Notes.

Current implementation state:

- VS-01 completed;
- VS-02 completed;
- VS-03 completed;
- VS-04 completed;
- Demo Polish Step 1 completed;
- Agentic Demo Shell Step 1 completed;
- Vercel deploy works.

## Product Boundaries

Nova Agent provides reference and organizational support. It does not provide
official or professional conclusions.

Important boundaries:

- Nova Agent does not give an official status;
- Nova Agent does not confirm that an action was completed;
- Nova Agent does not verify a source;
- User Notes are not documents, sources or Nova Agent answers;
- Nova Agent is not a legal, tax or medical advisor.

## Demo Limitations

This is an MVP demo, not production SaaS.

Current limitations:

- state is local-only;
- data can be lost after reload;
- Supabase is not connected yet;
- auth is not implemented yet;
- persistence is not implemented yet.

## Run Locally

```bash
npm install
npm run dev
```

## Build And Test

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For test watch mode:

```bash
npm run test:watch
```

## Next Stage

The next planned work is Agentic Demo Shell smoke validation and online-demo
foundation work:

- finish Agentic Demo Shell smoke-test and closure steps;
- keep the Vercel static demo aligned with README instructions;
- prepare Supabase minimal persistence only after the Auth / Ownership Decision
  Gate from the MVP Online Demo Plan.

OpenAI, Supabase, auth, API handlers, routing, state manager and persistence are
not part of the current static demo.

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
- `plans/active/2026-06-28-mvp-online-demo-plan.md`
- `plans/active/2026-06-28-agentic-demo-shell-plan.md`
- `plans/completed/2026-06-28-demo-polish-plan.md`
- `plans/completed/`
