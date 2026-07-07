# Voice-First AI Demo Layer Plan

## 1. Problem

The current Nova Agent production demo works and the AI Demo Presentation Layer
is completed.

Production demo:

`https://nova-agent-demo.vercel.app/`

The remaining presentation problem is perception: the first screen still feels
too close to a website/form for a demo conversation with Magomed.

The product direction for the demo is voice-first:

- less "website/form";
- more "I am talking to an AI assistant";
- voice-first assistant feeling before the existing Action Plan workflow;
- text input stays as fallback;
- existing Action Plan workflow stays unchanged.

This plan defines a presentation-only stage. It does not implement real AI,
voice processing, backend services, persistence or new product logic.

## 2. Product Goal

Make the first screen feel like Nova Agent is a voice-first assistant for life
situations.

The user should immediately understand:

- Nova Agent is the assistant;
- the user can say or write what they need to solve;
- the demo will show an assistant-style response;
- the existing Action Plan workflow opens after that response.

The goal is presentation and demo clarity, not a new capability layer.

## 3. Sources Of Truth

This plan follows the project documentation hierarchy from `AGENTS.md`.

Primary sources checked for this planning step:

- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-21-mvp-work-plan.md`;
- `plans/active/2026-06-28-mvp-online-demo-plan.md`;
- `plans/completed/2026-06-28-ai-demo-presentation-layer-plan.md`;
- `changelog/2026-06-28.md`.

If this plan conflicts with a higher-priority source, the higher-priority
source wins.

## 4. Desired First Screen

The first screen should feel like an assistant surface rather than a form page.

Direction:

- brand: `Nova Agent`;
- headline: `Скажите, что нужно решить`;
- large voice/orb element as the primary visual focus;
- primary CTA for the voice-first demo mode;
- text fallback: `или напишите задачу`;
- assistant-style response after the user provides a non-empty task;
- CTA: `Открыть план действий`;
- transition to the existing Action Plan workflow.

The screen should stay focused. It must not become a generic landing page,
dashboard or feature tour.

## 5. Truth Boundaries

The UI must stay honest about what exists today.

Required boundary meanings:

- demo-only;
- no real AI / OpenAI integration;
- based on the current demonstration scenario;
- Nova Agent does not create new scenarios in this version;
- not a legal, medical or tax advisor;
- no official status;
- no external action confirmation;
- the user prompt starts the demo flow only.

Required safe copy examples:

- `Демо-режим`;
- `На основе текущего демонстрационного сценария`;
- `Nova Agent не создаёт новые сценарии в этой версии`;
- `Без real AI/OpenAI в этой версии`;
- `Не является юридическим, медицинским или налоговым консультантом`;
- `Голосовой слой в этом этапе является демонстрационным`;
- `Текстовый ввод доступен как fallback`.

Forbidden copy meanings:

- Nova Agent really listened and understood speech with production reliability;
- OpenAI processed the request;
- a new scenario was generated;
- Nova Agent verified the situation;
- Nova Agent completed an external action;
- the result is an official status;
- the response is legal, medical or tax advice.

## 6. Voice Decision

This stage has two possible implementation directions.

### Option A: Voice-First Visual Demo

Description:

- large voice/orb UI;
- CTA such as `Начать голосовой демо-режим`;
- assistant-like visual state;
- text fallback remains available;
- honest note that this is a demo interaction;
- no microphone permission;
- no speech recognition;
- no backend;
- no OpenAI.

Advantages:

- safest for current MVP;
- avoids browser permission friction during a live demo;
- avoids fake production voice expectations;
- works consistently on desktop and mobile;
- keeps deterministic mapping to the current seed scenario;
- does not require package, browser API or testing strategy changes.

Risks:

- if copy is careless, users may still assume real voice input exists;
- the visual voice/orb must not look like an active microphone when no listening
  is implemented.

Controls:

- use clear `Демо-режим` boundary copy;
- do not show a fake recording timer, waveform or listening state;
- keep text fallback visible;
- describe the voice layer as demo presentation, not production voice input.

### Option B: Browser Speech Recognition

Description:

- use browser Web Speech API when available;
- no backend;
- no OpenAI;
- fallback to text input when unavailable or denied;
- never promise stable production voice capability.

Advantages:

- closer to a real voice-first interaction;
- may be impressive in supported browsers;
- can remain local-only and deterministic if carefully scoped.

Risks:

- browser support varies;
- permissions can fail during demo;
- tests become more complex;
- microphone UI creates stronger expectation of real voice capability;
- may distract from the core product flow;
- can look broken if the browser blocks speech recognition.

Controls required before Option B:

- explicit browser-support audit;
- test strategy for unsupported browser states;
- fallback UX;
- no claim of production voice reliability;
- no new dependencies unless separately approved;
- no backend or OpenAI integration.

### Recommendation For Current MVP

Recommended option: **Option A: Voice-First Visual Demo**.

Why:

- the immediate problem is presentation for a live demo, not real voice
  capability;
- Option A removes the website/form feeling without adding browser permission
  risk;
- Option A keeps the demo deterministic and aligned with the current seed
  scenario;
- Option A avoids overpromising Magomed that production voice input already
  exists;
- Option B should be a later explicitly gated slice if real browser speech
  input becomes necessary.

Option B is not blocked forever. It should not be implemented in this stage
unless a later audit explicitly approves browser speech recognition scope,
fallback behavior and tests.

## 7. Implementation Scope

Allowed implementation scope for the later UI step:

- first-screen UI / presentation layer only;
- voice-first visual treatment;
- assistant-like response presentation;
- text fallback;
- CTA to the existing Action Plan workflow;
- tests for the new first-screen behavior;
- changelog / active plan progress updates.

Existing workflow must remain unchanged:

- current seed scenario;
- existing Action Plan flow;
- Progress behavior;
- History behavior;
- User Open Questions behavior;
- Checked Source Marks behavior;
- User Notes behavior.

No domain model, workflow helper, content repository or package configuration
changes are expected for Option A.

## 8. Acceptance Criteria

The later implementation is acceptable only if:

- the first screen no longer feels like a standard website/form;
- the screen clearly feels voice-first / assistant-like;
- text fallback works;
- empty input does not open the workflow;
- non-empty user input still shows an assistant-like demo response;
- CTA opens the existing Action Plan workflow;
- the existing workflow remains available after the transition;
- demo-only boundaries stay visible;
- no fake voice claim is introduced;
- no real AI/OpenAI claim is introduced;
- no official status or external action confirmation is implied;
- no domain logic changes are made.

## 9. Forbidden Scope

Do not add:

- OpenAI API;
- real AI calls;
- backend API;
- Supabase;
- auth;
- persistence;
- routing changes;
- new scenario generator;
- scenario search;
- multiple scenario matching;
- real external actions;
- official verification;
- source verification by Nova Agent;
- document upload;
- document storage;
- dashboard;
- CRM/task-manager behavior;
- Content Admin behavior.

Do not change:

- `src/domain/*`;
- workflow helpers;
- Action Plan logic;
- Progress logic;
- History semantics;
- User Open Questions behavior;
- Checked Source Marks behavior;
- User Notes behavior;
- content repository;
- `package.json` without separate approval;
- specs, Product Principles, Technical Architecture or AGENTS.md unless a later
  planning audit explicitly requires it.

## 10. Validation

After implementation, run:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.

Smoke validation:

- local smoke;
- production deploy only after local validation and explicit instruction;
- production smoke on `https://nova-agent-demo.vercel.app/`.

Smoke must verify:

- first screen looks voice-first;
- text fallback is visible;
- boundaries are visible;
- non-empty input shows assistant-style demo response;
- `Открыть план действий` opens the existing workflow;
- existing workflow still exposes Life Situation, Scenario, Action Plan / Steps,
  Progress, History, User Open Questions, Checked Source Marks and User Notes.

## 11. Risks

### Fake Voice Expectation

Risk: the UI may imply that Nova Agent is actually listening through a
microphone.

Control: Option A must not show fake recording, fake waveform, fake listening
timer or permission state.

### Fake AI Expectation

Risk: an assistant-like screen may make the demo look like real AI or OpenAI.

Control: visible copy must say demo-only, current demonstration scenario and no
real AI/OpenAI in this version.

### Browser Speech Recognition Compatibility

Risk: Option B could fail in the browser used for the live demo.

Control: do not implement Option B in this stage; require a separate gated audit
if it becomes necessary.

### Overpromising Magomed

Risk: the demo may imply production voice, universal understanding or scenario
generation.

Control: use deterministic flow language and keep "Nova Agent does not create
new scenarios in this version" visible.

### Generic Landing Page Drift

Risk: presentation polish could turn the first screen into a marketing page.

Control: keep one primary interaction and move quickly to the assistant response
and existing Action Plan workflow.

## 12. Step Plan

1. Voice-First AI Demo Layer plan creation. Completed.
2. UI implementation with Option A. Implemented for audit:
   - first screen changed from website/form feel to voice-first assistant feel;
   - voice/orb visual element added as presentation only;
   - `Демо голосового режима` CTA shows assistant-style demo response;
   - text fallback remains available;
   - no microphone permission, speech recognition, recording timer, listening
     state or fake waveform added;
   - existing Action Plan workflow remains unchanged.
3. Local smoke validation. Completed.
4. Production deploy after explicit instruction. Completed.
5. Production smoke validation. Completed.
6. Closure. Completed.

## 13. Completion Criteria

This stage can be closed when:

- the plan is completed;
- the first screen feels voice-first / assistant-like;
- text fallback works;
- existing workflow remains unchanged;
- local checks pass;
- local smoke passes;
- production deploy is completed after explicit instruction;
- production smoke passes on `https://nova-agent-demo.vercel.app/`;
- no OpenAI, backend API, Supabase, auth, persistence or domain logic changes
  are added.

## 14. Progress

### Step 1: UI Implementation — COMPLETED

Voice-first first screen implemented. Tests updated. Local and production smoke
PASSED. Production deployed to `https://nova-agent-demo.vercel.app/`.

### Step 2: Mobile Overflow Fix — COMPLETED

Production visual smoke (headless Playwright, 390×844) found horizontal overflow
of 24px on the first screen: `.agentic-command-panel` width 400px on a 390px
viewport.

Root cause: `width: 100%` uses `box-sizing: content-box` by default, so padding
(18px × 2) and border (1px × 2) added to the content width, pushing total to
400px.

Fix: added `box-sizing: border-box` to `.agentic-command-panel` and
`.agentic-summary` in `src/app/App.css`.

Local smoke after fix (headless Playwright, 390×844):
- `scrollWidth 390 = clientWidth 390`, `maxScrollX 0`;
- no overflow offenders;
- desktop and mobile layout unchanged;
- voice CTA, text fallback and workflow reachable.

### Closure — COMPLETED

Voice-First AI Demo Layer is completed.

Production deploy PASSED:

- project: `nova-agent-demo`;
- production deployment:
  `https://nova-agent-demo-efo1d2kvl-usman20us-projects.vercel.app`;
- final production URL:
  `https://nova-agent-demo.vercel.app/`;
- Vercel status: READY.

Production visual smoke PASSED:

- desktop viewport `1440x900`: PASSED;
- mobile viewport `390x844`: PASSED;
- first screen shows Nova Agent, `Скажите, что нужно решить`, central voice/orb,
  `Демо голосового режима`, text fallback, textarea and `Построить план`;
- first screen no longer feels like a generic website/form;
- voice CTA shows assistant-like demo response;
- `Открыть план действий` opens the existing workflow;
- existing workflow verified: Life Situation, Scenario, Steps / active plan,
  Progress, History, User Open Questions, Checked Source Marks and User Notes.

Mobile overflow fix verified on production:

- first screen: `documentElement 390/390`, `body 390/390`;
- response state: `documentElement 390/390`, `body 390/390`;
- workflow after opening plan: `documentElement 390/390`, `body 390/390`;
- overflow offenders count: `0`;
- `.agentic-command-panel` stays inside the viewport;
- `.agentic-summary` stays inside the viewport.

Screenshots were produced during smoke in `/tmp/nova-agent-production-smoke/`
and were not added to the repository.

Final boundaries:

- no real AI/OpenAI added;
- no real microphone permission added;
- no browser speech recognition added;
- no Supabase/API/auth/persistence added;
- no scenario generator added;
- no source verification added;
- no document upload added;
- no domain logic changes.
