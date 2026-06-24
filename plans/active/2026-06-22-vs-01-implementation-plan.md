# VS-01 Implementation Plan: Minimal Product Spine

## 1. Назначение документа

Документ подготавливает реализацию VS-01 Minimal Product Spine для Nova Agent.

VS-01 должен доказать первый пользовательский путь:

```text
Life Situation
-> Scenario
-> Action Plan
-> Progress
-> History
```

Документ не является новой спецификацией, архитектурным решением или пересмотром утверждённых документов. Он не создаёт новые функции, роли, сущности, состояния, API, UI, SQL/RLS или продуктовые процессы.

Назначение документа - определить порядок реализации VS-01 через вертикальную пользовательскую ценность, чтобы код не принимал продуктовые, архитектурные, API или UI-решения по догадке.

Если при реализации VS-01 обнаружится вопрос, который меняет продуктовые границы, роли, сущности, состояния, API, UI, ownership, lifecycle, seed content или отношения между утверждёнными сущностями, реализация должна быть остановлена до фиксации решения в соответствующем документе.

## 2. Источники истины

План основан на следующих документах:

- `AGENTS.md`;
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
- `plans/active/2026-06-22-mvp-seed-content-plan.md`.

Если этот документ противоречит источнику более высокого уровня, применяется иерархия из `AGENTS.md`.

## 3. Scope VS-01

VS-01 реализует только первый demonstrable product spine из MVP Work Plan.

Scope ограничен:

- одной Life Situation;
- одним published Scenario;
- просмотром Scenario до создания плана;
- явным созданием Action Plan;
- просмотром Action Plan Detail;
- просмотром Step Detail внутри Action Plan;
- изменением Progress одного шага;
- просмотром History с событиями `action_plan_created` и `progress_status_changed`;
- boundary labels для справочной помощи, пользовательской отметки и внутренней истории.

VS-01 использует только утверждённый seed content: "Регистрация места жительства в Австрии".

VS-01 не доказывает весь MVP. После VS-01 Nova Agent становится демонстрируемым продуктом, но не завершённым MVP.

## 4. Что входит в VS-01

В VS-01 входит:

- одна Life Situation: "Регистрация места жительства в Австрии";
- один Scenario: "Регистрация места жительства в Австрии";
- один published Scenario Version для этого Scenario;
- Scenario content из Seed Content Plan: Steps, Documents/Data Requirements, Sources, Warnings, Restrictions, Applicability Conditions и Template Open Questions;
- пользовательский просмотр Life Situation;
- пользовательский просмотр Scenario до начала плана;
- Warnings и Restrictions до действия Start Action Plan;
- explicit Start Action Plan;
- создание active Action Plan для published Scenario Version;
- создание initial Progress records согласно TS05/TS07;
- History Event `action_plan_created`;
- Action Plan Detail с Progress как пользовательской отметкой;
- Step Detail для шага внутри Action Plan;
- Progress update для одного шага по допустимому TS07 переходу;
- History Event `progress_status_changed`;
- History view с internal history disclaimer;
- явное различение Scenario, Action Plan, Progress и History.

## 5. Что не входит в VS-01

В VS-01 не входит:

- User Open Questions;
- User Notes;
- Checked Source Marks;
- My Plans;
- Completed Plans;
- Pattern B;
- Deprecated/Superseded lifecycle;
- Content Admin UI;
- Multiple Scenarios;
- Additional Life Situations;
- Analytics;
- Dashboards;
- Reminders;
- Priorities;
- Deadlines;
- Assignees;
- CRM patterns;
- Task Manager patterns;
- document storage;
- upload или processing пользовательских файлов;
- official status verification;
- document verification;
- automatic application submission;
- automatic official form filling or sending;
- external integrations;
- public anonymous content read;
- auth product flow: login, signup, password reset UI;
- realtime History infrastructure;
- Content Admin access to User-Owned Data or user aggregates.

Любой элемент из этого списка может появиться только через соответствующий будущий Vertical Slice, спецификацию или отдельное плановое решение, если оно требуется утверждёнными документами.

## 6. Реализационные зависимости

VS-01 зависит от уже утверждённых решений:

- TS01: Action Plan всегда связан с конкретной Scenario Version; published Scenario Version immutable.
- TS03: MVP entity list уже определён; VS-01 не добавляет logical entities.
- TS04: MVP roles ограничены `user` и `content_admin`; VS-01 использует только user-facing flow.
- TS05: physical model and RLS boundaries являются источником для реализации данных; VS-01 не описывает SQL/RLS.
- TS07: Explicit Start Plan, Progress update и History Events являются утверждёнными user-owned workflow operations.
- TS08: API contract уже содержит content read, Action Plan, Progress и History operations.
- UI-01: U-01, U-02, U-03, U-05, U-06 и U-07 являются conceptual UI scope для VS-01.
- DR-03: Action Plan creation is idempotent.
- VS-01 Technical Stack Baseline: first code commit must be scaffold-only and use the approved minimal web app baseline.
- Seed Content Plan: единственный seed content для VS-01 - "Регистрация места жительства в Австрии".

VS-01 не зависит от:

- VS-02 return flow;
- VS-03 User Open Questions;
- VS-04 Sources and Notes;
- VS-05 completion;
- VS-06 Content Admin publishing UI;
- VS-07 Content lifecycle and Pattern B.

## 7. Порядок реализации

Реализация должна идти по вертикальной ценности, а не слоями "сначала вся база, потом весь API, потом весь UI".

### 0. Scaffold Baseline

Цель: создать минимальный React + TypeScript + Vite scaffold без VS-01 бизнес-логики.

Минимальный результат:

- доступны npm scripts `dev`, `build`, `lint`, `typecheck`, `test` и `test:watch`;
- приложение собирается и проходит scaffold smoke test;
- README содержит только команды запуска и проверки;
- scaffold не содержит seed content, Action Plan logic, Progress logic, History logic, API handlers, Supabase, auth, routing library, state manager, UI kit или Content Admin.

### 1. Seed Content Availability

Цель: сделать доступным один published Scenario Version для утверждённого seed content.

Минимальный результат:

- доступна Life Situation "Регистрация места жительства в Австрии";
- доступен один связанный Scenario;
- доступен один published Scenario Version;
- Scenario Version содержит seed content из `plans/active/2026-06-22-mvp-seed-content-plan.md`;
- Scenario Version не является draft, deprecated или superseded.

Ограничение: способ загрузки seed content является реализационной деталью VS-01 и не должен создавать Content Admin UI, новый admin workflow или новые content entity types.

### 2. Content Read Flow

Цель: пользователь может пройти от Life Situation к Scenario без создания User-Owned Data.

Минимальный результат:

- пользователь видит Life Situation;
- пользователь открывает Scenario;
- Warnings, Restrictions и Applicability Conditions видны до Start Action Plan;
- Steps, Documents/Data Requirements, Sources и Template Open Questions отображаются как Scenario content;
- просмотр Scenario не создаёт Action Plan, Progress или History.

### 3. Action Plan Creation

Цель: пользователь явно начинает план по published Scenario.

Минимальный результат:

- Start Action Plan является явным действием;
- Action Plan создаётся только для published Scenario Version;
- Action Plan получает state `active`;
- Action Plan сохраняет Scenario Version и selected Life Situation context;
- создаются initial Progress records для steps Scenario Version;
- создаётся History Event `action_plan_created`;
- повторный Start Action Plan для уже существующего active плана не создаёт второй active plan.

### 4. Action Plan And Step Detail

Цель: пользователь видит свой план и может открыть шаг внутри плана.

Минимальный результат:

- Action Plan Detail показывает Scenario context, state `active`, Progress по шагам и boundary disclaimer;
- Progress отображается как "Ваша отметка", не внешний статус;
- Step Detail показывает цель шага, документы/данные, источники, ограничения и предупреждения;
- Step Detail не создаёт новые user-owned entities от просмотра;
- User Open Questions, User Notes и Checked Source Marks не доступны как VS-01 actions.

### 5. Progress Update

Цель: пользователь меняет Progress одного шага.

Минимальный результат:

- Progress update доступен только внутри own active Action Plan;
- допустимы только TS07 Progress statuses;
- для демонстрации используется переход из `not_started` в `in_progress` или `requires_check`;
- переход в `not_started` из другого состояния недоступен;
- изменение Progress создаёт History Event `progress_status_changed`;
- Progress update не создаёт User Open Question, User Note или Checked Source Mark.

### 6. History Visibility

Цель: пользователь видит внутреннюю историю событий своего плана.

Минимальный результат:

- History view показывает `action_plan_created`;
- после Progress update History view показывает `progress_status_changed`;
- History Event не редактируется и не удаляется;
- History отображается как internal Nova Agent history, не официальный журнал;
- History не используется как source of truth для текущего Progress.

### 7. Demo Flow Validation

Цель: проверить VS-01 как единый демонстрационный проход.

Минимальный flow:

1. Открыть Life Situation "Регистрация места жительства в Австрии".
2. Открыть Scenario.
3. Убедиться, что Warnings/Restrictions видны до Start Action Plan.
4. Нажать explicit Start Action Plan.
5. Открыть Action Plan Detail.
6. Открыть Step Detail для Step 3 или Step 4 из seed content.
7. Изменить Progress одного шага на `in_progress` или `requires_check`.
8. Открыть History.
9. Убедиться, что History содержит `action_plan_created` и `progress_status_changed`.
10. Убедиться, что ни один экран не выглядит как официальный статус, task manager, CRM или document storage.

## 8. Seed Content Integration

VS-01 использует только seed content из `plans/active/2026-06-22-mvp-seed-content-plan.md`.

Интеграция seed content должна сохранить:

- одну Life Situation;
- один Scenario;
- Scenario цель, ожидаемый результат и non-guarantee statements;
- Applicability Conditions до действия;
- Warnings до действия;
- Restrictions до действия;
- 6 Steps из Seed Content Plan;
- Documents/Data Requirements как requirements, не пользовательские файлы;
- Sources с типом источника и currentness warning;
- Template Open Questions как Scenario content, не User Open Questions;
- Demo Flow Mapping из Seed Content Plan.

Запрещено при интеграции seed content:

- добавлять второй Scenario;
- добавлять дополнительные Life Situations;
- расширять Scenario до смены жилья внутри Австрии;
- добавлять Aufenthaltstitel, visas, insurance, tax или social benefits scope;
- хранить пользовательские документы;
- создавать Content Admin review/approval workflow;
- менять утверждённый текст seed content для принятия юридических или официальных решений.

## 9. UI Scope Mapping

VS-01 использует только подмножество UI-01, нужное для first demonstrable value.

| UI-01 concept | VS-01 usage | Scope note |
|---|---|---|
| U-01: Каталог жизненных ситуаций | Included | Можно показать только одну Life Situation. |
| U-02: Карточка жизненной ситуации | Included | Показывает одну связанную Scenario. |
| U-03: Просмотр сценария | Included | Read-only Scenario before plan; Warnings/Restrictions before CTA. |
| U-05: Детальный просмотр плана | Included subset | Action Plan Detail, Progress labels, History link; no UOQ actions. |
| U-06: Шаг внутри плана | Included subset | Step Detail with requirements, sources, warnings and progress control. |
| U-07: История плана | Included subset | Only `action_plan_created` and `progress_status_changed` are required. |
| U-04: Мои планы действий | Out of scope | VS-02 owns return/continue and plan list experience. |
| U-08: Открытые вопросы плана | Out of scope | VS-03 owns User Open Questions. |
| U-09: Pattern B warning | Out of scope | VS-07 owns deprecated/superseded content lifecycle. |
| A-01-A-07 admin screens | Out of scope | VS-06 owns Content Admin UI. |

UI implementation must preserve:

- context before action;
- one main next step;
- user mark labeling for Progress;
- History disclaimer;
- Source type label and currentness warning;
- no task-manager elements;
- no official status wording;
- no permanent dismissal of plan boundary disclaimer.

## 10. API Scope Mapping

VS-01 uses only API operations already defined in TS08. This plan does not create new API endpoints or change API semantics.

| TS08 API area | VS-01 usage |
|---|---|
| `GET /api/life-situations` | Read the visible Life Situation catalog. |
| `GET /api/life-situations/{life_situation_id}` | Read one Life Situation detail. |
| `GET /api/life-situations/{life_situation_id}/scenarios` | Read the linked Scenario summary. |
| `GET /api/scenario-versions/{scenario_version_id}` | Read published Scenario Version content. |
| `GET /api/scenario-versions/{scenario_version_id}/steps/{versioned_step_context_id}` | Read Step Detail before or inside plan context. |
| `POST /api/me/action-plans` | Explicit Start Action Plan using DR-03 idempotency. |
| `GET /api/me/action-plans/{action_plan_id}` | Read own Action Plan Detail. |
| `PATCH /api/me/action-plans/{action_plan_id}/progress/{progress_id}` | Update one Progress status in active plan. |
| `GET /api/me/action-plans/{action_plan_id}/history` | Read own History Events. |

The following TS08 API areas are not used in VS-01:

- User Open Question API;
- User Note API;
- Checked Source Mark API;
- Content Admin API;
- completed Action Plan behavior beyond read-only constraints;
- Pattern B access for deprecated or superseded Scenario Versions;
- list own Action Plans as a "My Plans" center.

## 11. Data Scope Mapping

VS-01 uses only already approved data concepts.

### Content Model Data

Required content data:

- one Life Situation;
- one Scenario stable identity;
- one published Scenario Version;
- Versioned Step Contexts for the 6 seed steps;
- Versioned Document Requirement Contexts and Data Requirement Contexts from Seed Content Plan;
- Source Revisions from Seed Content Plan;
- Versioned Source Contexts;
- Versioned Template Open Question Contexts;
- Warnings, Restrictions and Applicability Conditions.

Content data must remain Content Model data. It must not contain user Progress, History, User Notes, User Open Questions, Checked Source Marks, uploaded files or filled personal values.

### User-Owned Data

Required user-owned data:

- one active Action Plan per user per stable Scenario identity;
- Progress records for Scenario Version steps;
- History Events for `action_plan_created` and `progress_status_changed`.

VS-01 does not require:

- completed Action Plan state in the demo flow;
- User Open Question records;
- User Note records;
- Checked Source Mark records;
- content publication events in user-facing flow;
- Pattern B records or deprecated/superseded Scenario Versions.

### State And Event Scope

Allowed states/events for the VS-01 demonstration:

- Scenario Version publication state: `published`;
- Action Plan state: `active`;
- Progress initial state: `not_started`;
- Progress demo target state: `in_progress` or `requires_check`;
- History Event types: `action_plan_created`, `progress_status_changed`.

This does not add new states. It narrows the VS-01 demonstration to a subset of states already approved in TS05, TS07 and TS08.

## 12. Definition Of Done

VS-01 is done when:

- one seed Life Situation is visible to a user;
- one published Scenario is visible through that Life Situation;
- Scenario view shows Warnings and Restrictions before Start Action Plan;
- reading Scenario does not create User-Owned Data;
- explicit Start Action Plan creates or returns the active Action Plan according to DR-03;
- Action Plan is linked to the selected Life Situation context and the published Scenario Version;
- initial Progress records exist for Scenario steps;
- `action_plan_created` is visible in History;
- user can open Action Plan Detail;
- user can open Step Detail inside the Action Plan;
- user can update Progress for one step;
- Progress update creates `progress_status_changed`;
- History view shows both required events;
- Progress is labelled as user's mark;
- History is labelled as internal Nova Agent history;
- no User Open Question, User Note or Checked Source Mark operation is available;
- no My Plans center, completed plan flow, Pattern B, Content Admin UI or multi-scenario catalog is implemented as part of VS-01;
- no product boundary language implies legal, tax, medical, financial, official or professional advice;
- no task-manager, CRM, dashboard, analytics, reminder, deadline, priority or assignee pattern appears.

## 13. Риски

### Scope creep into VS-02/VS-03/VS-04

Risk: implementation adds My Plans, User Open Questions, User Notes or Checked Source Marks because TS08 contains those contracts.

Control: VS-01 uses only the mappings in sections 9-11. Excluded TS08 areas remain for later slices.

### Reference catalog drift

Risk: implementation stops at Scenario browsing and does not create Action Plan, Progress or History.

Control: VS-01 is not complete until `action_plan_created` and `progress_status_changed` are visible in History.

### Product boundary loss

Risk: Progress or History copy sounds like official registration status.

Control: Progress must be labelled as user's mark; History must be labelled as internal Nova Agent history.

### Task Manager drift

Risk: step list gains deadlines, priorities, reminders, assignees or kanban-like states.

Control: those patterns are explicitly out of scope and forbidden by UI-01 and MVP Work Plan.

### Seed content mutation

Risk: implementation edits seed content to fit UI or data convenience.

Control: seed content source of truth is `plans/active/2026-06-22-mvp-seed-content-plan.md`; content changes require a document update and audit.

### Hidden API expansion

Risk: implementation adds helper endpoints or response states that create product behavior outside TS08.

Control: VS-01 may use only TS08 operations listed in section 10. Any new endpoint or state requires TS08 update before implementation.

### Data boundary confusion

Risk: Documents/Data Requirements become stored user documents or filled personal values.

Control: VS-01 stores requirements as Content Model data only; user document storage and filled personal values remain out of scope.

## 14. Open Questions Registry

No blocking product, architecture, data, role, lifecycle, API, UI or seed-content question remains open for VS-01 implementation planning.

| Question | Status | Owner document | Notes |
|---|---|---|---|
| What is the first scenario for VS-01? | Closed | `plans/active/2026-06-22-mvp-seed-content-plan.md` | Use only "Регистрация места жительства в Австрии". |
| Does VS-01 need new product functions? | Closed | This document / MVP Work Plan | No. VS-01 uses approved MVP Core only. |
| Does VS-01 need new roles, entities or states? | Closed | TS03, TS04, TS07, TS08 | No. Use approved entities, roles and states only. |
| Does VS-01 create new API? | Closed | TS08 | No. Use existing TS08 API contract subset. |
| Does VS-01 include Content Admin UI? | Out of scope | MVP Work Plan | Content Admin UI belongs to VS-06. |
| Does VS-01 include User Open Questions? | Out of scope | MVP Work Plan | Writable User Open Questions belong to VS-03. Template Open Questions remain Scenario content. |
| Does VS-01 include User Notes or Checked Source Marks? | Out of scope | MVP Work Plan | They belong to VS-04. |
| Does VS-01 include Pattern B or deprecated/superseded lifecycle? | Out of scope | MVP Work Plan | They belong to VS-07. |
| Which technical stack baseline should the first scaffold use? | Closed | `docs/decisions/2026-06-22-vs-01-technical-stack-baseline.md` | Use the approved minimal web app baseline; first code commit must be scaffold-only. |
| Which implementation details may be decided during code? | Constrained | This document / TS08 | Only framework, serialization, file organization or physical enforcement details that do not change product, API, UI, data model, roles, states or seed content. |

If a new question affects product boundaries, architecture, data, roles, permissions, lifecycle, API, UI, user scenarios or seed content, it is not a code-level detail and must be documented before implementation continues.

## 15. Completion Criteria

This implementation plan is complete when:

- it defines VS-01 through vertical user value, not implementation layers;
- it maps VS-01 to the approved MVP Core;
- it names the only allowed seed scenario;
- it lists included and excluded scope explicitly;
- it maps UI scope only to approved UI-01 concepts;
- it maps API scope only to approved TS08 operations;
- it maps data scope only to approved TS03/TS05/TS07 entities, states and event types;
- it does not create new functions;
- it does not create new roles;
- it does not create new entities;
- it does not create new states;
- it does not create new API;
- it does not revise TS01-TS08;
- it does not revise UI-01;
- it does not revise DR-01-DR-09;
- it does not revise MVP Work Plan;
- it does not revise MVP Seed Content Plan;
- it records open questions according to `docs/принципы-продукта.md`;
- it is ready for audit before VS-01 code implementation begins.

Self-audit result:

1. New functions: none.
2. New roles: none.
3. New entities: none.
4. New states: none.
5. New API: none; only TS08 subset is mapped.
6. TS01-TS08: not revised.
7. UI-01: not revised.
8. DR-01-DR-09: not revised.
9. MVP Work Plan: not revised.
10. Seed Content Plan: not revised.

## 16. Implementation Status

### 2026-06-22 — Step 1: Seed Content Availability

Status: completed.

Implemented:

- local typed Content Model definitions for VS-01 seed content;
- local seed fixture for one Life Situation, one Scenario and one published Scenario Version;
- seed Scenario Version content from `plans/active/2026-06-22-mvp-seed-content-plan.md`: Applicability Conditions, Warnings, Restrictions, 6 Steps, Documents/Data Requirements, Sources and Template Open Questions;
- local repository boundary for reading seed content;
- tests that verify content counts, published state, content links and absence of user-owned workflow entities.

Out of scope preserved:

- no Action Plan, Progress, History, User Open Questions, User Notes or Checked Source Marks implemented in this step;
- no Content Admin UI, Supabase, API handlers, auth, routing library, state manager, dashboard or document storage added;
- TS01-TS08, UI-01, Product Principles and MVP Scope were not changed.

Verification:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`.

### 2026-06-23 — Step 2: Content Read Flow

Status: completed.

Implemented:

- read-only React content flow for the existing seed Life Situation "Регистрация места жительства в Австрии";
- Scenario and Scenario Version display using the existing local `contentRepository`;
- visible Applicability Conditions, Warnings and Restrictions before scenario steps;
- read-only Steps with related Documents/Data Requirements and Sources;
- scenario-level Documents/Data Requirements, Sources and Template Open Questions as content-owned information;
- product boundary copy: справочная помощь, not official answer, check official source;
- focused tests for content flow rendering, Warnings/Restrictions ordering and absence of user-owned workflow areas.

Out of scope preserved:

- no Action Plan, Progress, History, User Open Questions, User Notes or Checked Source Marks implemented in this step;
- no My Plans, Completed Plans, Pattern B, Content Admin UI, Supabase, API handlers, auth, routing library, state manager, dashboard or document storage added;
- no new Life Situations, Scenarios, Scenario Versions, entities, roles, states or API added;
- seed content was used through the existing repository boundary and was not changed.

Verification:

- `npm run build`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`.

### 2026-06-24 — Step 3: Action Plan Creation

Status: completed.

Implemented:

- local typed models for Action Plan, Progress and History Event;
- pure Explicit Start Plan helper for the existing published Scenario Version;
- active Action Plan creation with stable Scenario identity, Scenario Version and selected Life Situation context;
- initial `not_started` Progress records for every Scenario Version step;
- exactly one `action_plan_created` History Event without per-step initial events;
- idempotent repeated start behavior that returns the existing active plan;
- CTA `Начать план` after Warnings, Restrictions and all read-only Scenario content;
- minimal creation confirmation with plan state, Scenario Version, step/progress count and non-official-status boundary copy;
- focused tests for creation, initial Progress, History Event, idempotency, UI ordering and absence of later workflow controls.

Out of scope preserved:

- no Action Plan Detail, Step Detail, Progress update UI or History view implemented;
- no User Open Questions, User Notes, Checked Source Marks, My Plans or Completed Plans implemented;
- no Pattern B, Content Admin UI, Supabase, API handlers, auth, routing library, state manager, dashboard or document storage added;
- no new Life Situations, Scenarios, Scenario Versions, roles, API operations or product states added;
- TS01-TS08, UI-01, Product Principles and seed content were not changed.

Verification:

- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check`.
