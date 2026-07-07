# Browser Voice Input Demo Plan

## Status

- Status: Active plan.
- Created: 2026-06-28.
- Current production demo: [https://nova-agent-demo.vercel.app/](https://nova-agent-demo.vercel.app/).
- Previous completed layer: Voice-First AI Demo Layer.

This plan starts the next demo step only. It does not implement code, add dependencies, change production, or close the plan.

## Problem

The current production demo now looks voice-first, but the voice CTA is still a visual demo interaction. A user can reasonably expect the voice button to capture speech, while the previous layer intentionally avoided microphone access, browser speech recognition, fake listening state, and fake recording.

For the next demo, Nova Agent needs real browser-side speech-to-text input while preserving the same product truth:

- the prompt starts the existing demo flow;
- the current seed scenario remains the only scenario;
- Nova Agent does not create new scenarios in this version;
- this is not real AI or OpenAI integration.

## Goal

Add a browser voice input demo:

1. User presses a voice button.
2. If the browser supports speech recognition, the browser asks for microphone permission.
3. User speaks a task.
4. Recognized text is copied into the existing task textarea.
5. Nova Agent shows the existing assistant-like demo response for non-empty input.
6. User can open the existing Action Plan workflow.

This is speech-to-text input only. It is not intent recognition, scenario generation, backend AI, external action execution, official verification, or persistence.

## Technical Approach

Use the browser Web Speech API with feature detection:

```ts
const SpeechRecognitionConstructor =
  window.SpeechRecognition ?? window.webkitSpeechRecognition;
```

Implementation guidance for the later code step:

- create the recognition object only after a user gesture on the voice CTA;
- request microphone permission only when the browser supports speech recognition;
- use a one-shot recognition flow for the MVP demo;
- fill the existing manual task field with the final transcript;
- reuse the existing non-empty prompt flow to show the assistant-like demo response;
- keep text fallback available at all times;
- do not add packages or change `package.json`;
- do not add backend calls, Supabase, API handlers, auth, persistence, routing, or new domain logic.

Feasibility recommendation: proceed with Web Speech API as a guarded browser-side demo, with Chrome-first manual smoke and honest fallback for unsupported browsers. The implementation should avoid claiming universal support or offline/local-only speech recognition.

## Browser Support Notes

Web Speech API support is not universal. `SpeechRecognition` is a limited-availability browser API and may require the prefixed `webkitSpeechRecognition` constructor in Chromium-based browsers. Some implementations, including Chrome, may use a server-based speech service, so the demo must not claim offline, private, local-only, or production-grade voice capability.

Demo copy should say that voice input works in supported browsers and is used only to fill the task text in this demo.

## UX States

### 1. Idle

User sees the voice CTA.

Suggested button copy:

- `Говорить`

Supporting copy:

- `Голосовой ввод работает в браузере, если он поддерживается.`

### 2. Requesting Permission

Shown immediately after the user starts voice input, before or while the browser permission prompt appears.

Required copy:

- `Браузер может запросить доступ к микрофону`

### 3. Listening

Shown only while the browser speech recognition session is active.

Required copy:

- `Слушаю... скажите, что нужно решить`

Do not add fake timers, fake waveform, or fake recording indicators. The state must reflect the real browser recognition session.

### 4. Result Received

The recognized transcript appears in the manual task textarea.

Expected behavior:

- transcript fills the existing task field;
- if transcript is non-empty, the existing assistant-like demo response can be shown;
- user can still edit the text before opening the plan if the implementation chooses to keep that step explicit.

### 5. Unsupported Browser

Shown when neither `SpeechRecognition` nor `webkitSpeechRecognition` is available.

Required copy:

- `Голосовой ввод недоступен в этом браузере. Напишите задачу вручную.`

### 6. Permission Denied / Error

Shown if microphone permission is denied, the recognition session fails, or no speech result is produced.

Required copy:

- `Доступ к микрофону не получен. Можно написать задачу вручную.`

## Truth Boundaries

The previous visual-only boundary:

- `Голос не записывается в этой версии`

must be removed or replaced during implementation because it will no longer be true once browser speech recognition is added.

Allowed replacement copy:

- `Голос используется только для ввода текста в этом демо.`
- `Голосовой ввод работает в браузере, если он поддерживается.`
- `Распознавание выполняется средствами браузера.`

Boundaries that must remain visible:

- demo-only;
- no real AI/OpenAI;
- based on the current demonstration scenario;
- Nova Agent does not create new scenarios in this version;
- not legal, medical, or tax advice;
- no official status;
- no external action confirmation;
- no document upload or document storage;
- no production persistence.

## Implementation Scope

Allowed later implementation scope:

- update `src/app/components/AgenticDemoShell.tsx`;
- update `src/app/App.css` only if needed for voice states;
- update `src/app/App.test.tsx` for voice input behavior and fallback states;
- update this plan and `changelog/2026-06-28.md`.

The implementation must keep the existing workflow unchanged:

- Life Situation;
- Scenario;
- Action Plan / Steps;
- Progress;
- Return Context;
- History;
- User Open Questions;
- Checked Source Marks;
- User Notes.

## Acceptance Criteria

- Voice button requests microphone access only after user action and only in supported browsers.
- Unsupported browsers show the manual-input fallback.
- Permission denied or recognition error shows the manual-input fallback.
- Recognized speech fills the existing textarea/task field.
- User can build/open the plan from recognized text.
- Empty or missing transcript does not open the workflow.
- Assistant-like response remains demo-only and based on the current demonstration scenario.
- Existing workflow opens through the same current Action Plan flow.
- No fake voice claims are present.
- No claims of real AI/OpenAI, real intent recognition, scenario generation, official status, or external action execution are present.
- No package, backend, Supabase, auth, routing, persistence, or domain logic changes are introduced.

## Forbidden Scope

Do not add:

- OpenAI API;
- real AI calls;
- backend API;
- Supabase;
- auth;
- persistence;
- routing changes;
- state manager;
- scenario generator;
- universal scenario search;
- real source verification;
- official status tracking;
- external action execution;
- document upload;
- document storage;
- dashboard;
- CRM or task-manager behavior;
- production account or multi-user behavior.

Do not change:

- domain logic;
- workflow helpers;
- content repository;
- Action Plan state;
- Progress source of truth;
- History append-only/read-only semantics;
- User Open Questions behavior;
- Checked Source Marks behavior;
- User Notes behavior.

## Testing Strategy

Automated tests should mock the browser speech recognition constructor and cover:

- supported browser starts recognition after user click;
- requesting permission/listening copy appears during recognition;
- transcript result fills the textarea;
- transcript result can show the assistant-like demo response;
- unsupported browser shows fallback;
- permission denied/error shows fallback;
- empty transcript does not open the workflow;
- existing workflow remains reachable;
- no real AI/OpenAI/backend/Supabase/auth/persistence copy or code path is introduced.

Manual smoke should cover:

- Chrome desktop voice input;
- unsupported-browser fallback if available;
- permission denied fallback;
- mobile browser behavior;
- local demo;
- production demo after deploy.

## Validation

After implementation, run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Then run local manual smoke and production smoke before closure.

## Risks

- Browser support is limited and inconsistent across desktop/mobile browsers.
- Chrome and some browsers may use server-based speech recognition, so copy must not imply offline/local-only recognition.
- Microphone permission may be denied or unavailable.
- Mobile browsers may behave differently or block recognition.
- Recognition language, accents, and noisy environments may produce incorrect text.
- Users may infer real AI if the response copy is too confident.
- Users may infer scenario generation if the flow does not clearly say it uses the current demonstration scenario.
- Browser APIs can be hard to test without mocks.

Controls:

- feature detection before enabling voice input;
- honest unsupported/permission fallback;
- visible demo-only boundaries;
- text fallback always available;
- no package or backend changes;
- test with mocked recognition events;
- keep the existing deterministic Action Plan workflow unchanged.

## Step Plan

1. Browser Voice Input Demo Plan creation. Completed.
2. UI implementation with Web Speech API feature detection and fallback. Completed in Step 1.
3. Local automated checks and manual smoke. Completed: local real Chrome voice smoke passed.
4. Production deploy.
5. Production smoke.
6. Closure.

## Step 1 Implementation Notes

- Added browser-side speech-to-text demo behavior to the existing Agentic Demo Shell.
- Used feature detection for `SpeechRecognition` / `webkitSpeechRecognition`.
- Added UI states for unsupported browser, requesting permission, listening, result received, permission denied and no-speech/error fallback.
- Replaced the visual-only voice boundary `Голос не записывается в этой версии` with honest browser voice input copy:
  - `Голос используется только для ввода текста в этом демо.`
  - `Голосовой ввод работает в браузере, если он поддерживается.`
- Kept the existing deterministic demo flow: recognized or typed non-empty text opens the existing assistant-like response and current Action Plan workflow.
- Added tests for unsupported browser fallback, supported speech recognition mock result, permission denied fallback, no-speech fallback, manual input and existing workflow reachability.
- Did not add OpenAI API, backend API, Supabase, auth, persistence, package changes, scenario generation, official verification, external actions or domain/workflow logic changes.

## Step 1 Robustness Fix Notes

- Fixed the active recognition lifecycle by storing the current browser speech recognition instance in a React ref.
- Prevented repeated voice clicks from starting parallel recognition sessions while one session is active.
- Added unmount cleanup that removes recognition callbacks and calls `abort()` when available, with `stop()` as fallback.
- Guarded recognition callbacks so stale sessions cannot update UI state after cleanup or after another session has cleared the active ref.
- Added tests for repeated voice click prevention and unmount cleanup.
- Kept the scope limited to the Agentic Demo Shell and tests; domain/workflow logic, package configuration, backend/API/Supabase/auth/persistence and production deployment were not changed.

## Step 1 Diagnostic Fix Notes

- Added user-visible speech recognition error codes so manual Chrome smoke can identify why voice input fails.
- `not-allowed` and `service-not-allowed` now show the concrete error code together with the microphone-denied fallback.
- `audio-capture` now shows the concrete error code and asks the user to check Chrome microphone access.
- Other errors such as `no-speech`, `network` or unknown errors show the concrete error code with the manual-input fallback.
- Added tests for `not-allowed`, `audio-capture` and `no-speech` diagnostic copy while preserving manual fallback.
- Did not change domain/workflow logic, package configuration, backend/API/Supabase/auth/persistence, scenario generation, official verification or production deployment behavior.

## Step 2 Local Real Chrome Voice Smoke

- Local real Chrome voice smoke: PASSED.
- User manually verified that clicking `Говорить` starts browser speech recognition.
- Speech recognition produced transcript: `ich muss Antrag stellen für neugeborene Kinder`.
- Transcript filled the task textarea automatically.
- Demo assistant response appeared after recognized speech.
- Manual fallback remains available.
- Production deploy and production smoke are still pending.
- Did not change application code, domain/workflow logic, package configuration, backend/API/Supabase/auth/persistence or production deployment behavior.
