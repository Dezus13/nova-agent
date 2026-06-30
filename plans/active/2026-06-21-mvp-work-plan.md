# MVP Work Plan

## 1. Назначение документа

Этот документ преобразует утверждённую архитектуру Nova Agent в порядок реализации MVP через Vertical Slices.

Документ не является новой спецификацией, не создаёт новые функции, роли, сущности, состояния или API и не пересматривает решения TS01-TS08, UI-01, DR-01-DR-09 или `docs/принципы-продукта.md`.

Главный принцип плана:

```text
Сначала пользовательская ценность, потом полнота системы.
```

## 2. Источники истины

План основан на следующих источниках:

- `AGENTS.md`;
- `docs/бизнес-контекст.md`;
- `docs/глобальная-спецификация.md`;
- `docs/карта-функций.md`;
- `docs/пользовательские-сценарии.md`;
- `docs/принципы-продукта.md`;
- `docs/roadmap.md`;
- `docs/техническая-архитектура.md`;
- `docs/decisions/2026-06-19-api-layer-pre-decisions.md`;
- `docs/specs/функции/*`;
- `docs/specs/технические/01-content-model-and-versioning.md`;
- `docs/specs/технические/02-user-owned-workflow-model.md`;
- `docs/specs/технические/03-logical-data-model.md`;
- `docs/specs/технические/04-auth-roles-and-ownership.md`;
- `docs/specs/технические/05-supabase-schema-and-rls.md`;
- `docs/specs/технические/06-content-administration-operations.md`;
- `docs/specs/технические/07-user-owned-workflow-operations.md`;
- `docs/specs/технические/08-api-layer-specification.md`;
- `docs/specs/ui/01-ui-design-rules.md`;
- `plans/active/2026-06-18-mvp-implementation-preparation.md`.

Если этот план противоречит источнику более высокого уровня, применяется иерархия из `AGENTS.md`.

## 3. Non-Negotiable Product Identity

Nova Agent помогает пользователю понять жизненную или административную ситуацию, увидеть применимый путь, подготовить документы и вопросы, отметить собственный прогресс и восстановить контекст после перерыва.

Nova Agent не является:

- государственным сервисом;
- юридическим консультантом;
- налоговым консультантом;
- медицинским консультантом;
- CRM;
- Task Manager;
- системой хранения документов;
- системой подачи заявлений;
- системой принятия решений за пользователя.

Для всех Vertical Slices обязательны следующие правила:

- контекст, ограничения и предупреждения показываются до действия;
- у пользователя должен быть один понятный главный следующий шаг;
- Progress является пользовательской отметкой, а не внешним статусом;
- History является внутренней историей Nova Agent, а не официальным журналом;
- User Open Question является вопросом для внешней проверки, а не ответом;
- User Note является коротким пользовательским контекстом, а не документом, источником или хранилищем персональных данных;
- Content Admin не видит User-Owned Data и user aggregates;
- MVP не расширяется скрыто через удобные task-manager, CRM, advisor или document-storage паттерны.

## 4. Non-Negotiable Decisions

Следующие решения закрыты и не пересматриваются в этом плане:

- TS01: Scenario Version защищает опубликованный контент и исторический контекст активных планов.
- TS02: Action Plan имеет MVP states `active` и `completed`; Progress, User Open Question, User Note и History остаются user-owned workflow.
- TS03: MVP entity list и relationships утверждены; план не добавляет новые logical entities.
- TS04: MVP roles ограничены `user` и `content_admin`; External Actors не получают доступ к Nova Agent.
- TS05: Supabase schema and RLS specification является источником для physical model, но этот план не описывает SQL или RLS.
- TS06: Content Admin управляет только Content Model и не получает доступ к User-Owned Data.
- TS07: User-Owned workflow operations, lifecycle decisions, state transitions and forbidden operations утверждены.
- TS08: API inventory, auth contract, boundary fields, pagination, polling History strategy and forbidden API patterns утверждены.
- UI-01: conceptual screens, visibility rules, UI invariants and forbidden UI patterns утверждены.
- DR-01: Checked Source Mark unique per Action Plan + Source Revision and idempotent.
- DR-02: Pattern B applies only by exact Scenario Version and existing active/completed Action Plan.
- DR-03: Action Plan creation is idempotent.
- DR-04: Life Situation не получает отдельный lifecycle state в MVP.
- DR-05: Scenario stable identity не получает отдельный lifecycle state в MVP.
- DR-06: `content_publication_events` являются достаточным Content Admin audit trail в MVP.
- DR-07: User Note behavior in completed Action Plan утверждено.
- DR-08: User Open Question writes in completed Action Plan не входят в MVP.
- DR-09: TS08 describes API auth contract, not auth product flow.
- `docs/принципы-продукта.md`: открытые вопросы должны быть закрыты, явно отложены с владельцем документа или вынесены за MVP scope.

## 5. MVP Core

Минимальное ядро Nova Agent:

```text
Life Situation
→ Scenario
→ Action Plan
→ Progress
→ History
```

Это ядро доказывает, что Nova Agent не является справочником. Пользователь не только читает информацию, но и получает сохранённый процесс с собственным прогрессом и восстановимой историей.

Steps, Documents/Data, Sources, Warnings, Restrictions, Applicability Conditions and Template Open Questions являются обязательным содержимым Scenario and Action Plan, но не заменяют само ядро.

## 6. First Demonstrable Value

После VS-01 Nova Agent считается демонстрируемым продуктом.

Первая демонстрация должна показать:

- пользователь выбирает Life Situation в австрийском контексте;
- пользователь видит Scenario до действия;
- ограничения и предупреждения видны до создания плана;
- пользователь явно создаёт Action Plan;
- пользователь меняет Progress одного шага;
- пользователь видит History событий;
- пользователь понимает, что Nova Agent не даёт официальный ответ и не выполняет внешние действия.

Рекомендуемый первый сценарий для демонстрации: регистрация места жительства в Австрии.

## 7. User Value Slices

### VS-01 Minimal Product Spine

**Status:** Completed.

**Пользовательская ценность:** пользователь впервые видит путь от жизненной ситуации к сохранённому процессу, прогрессу и истории.

**Что входит:**

- одна Life Situation;
- один published Scenario;
- Scenario содержит Steps, Documents/Data, Sources, Warnings and Restrictions;
- просмотр Scenario до создания плана;
- explicit Start Action Plan;
- Action Plan detail;
- Step detail внутри Action Plan;
- Progress change для одного шага;
- History с событиями `action_plan_created` and `progress_status_changed`;
- boundary labels for informational help, user mark and internal history.

**Что не входит:**

- User Open Questions as writable feature;
- User Notes;
- Checked Source Marks;
- completed Action Plan;
- Pattern B;
- deprecated or superseded Scenario Versions;
- separate "My Plans" center;
- Content Admin screens;
- multiple scenarios or expanded catalog;
- filters, analytics dashboards, priorities, deadlines, reminders, assignees or kanban.

**Зависимости:**

- TS01-TS08;
- UI-01 U-01, U-02, U-03, U-05, U-06, U-07 concepts;
- DR-03 for idempotent Action Plan creation;
- product principles: context before action, one next step, no task-manager drift.

**Критерий завершения:** пользовательский flow `Life Situation → Scenario → Action Plan → Progress → History` проходит как единая демонстрация и сохраняет продуктовую границу Nova Agent.

### VS-02 Return And Continue Context

**Status:** Completed.

**Пользовательская ценность:** пользователь возвращается к незавершённому процессу и быстро понимает, где остановился.

**Что входит:**

- access to own Action Plans;
- active plan continuation;
- progress summary;
- History access from plan context;
- clear next step inside existing Action Plan.

**Что не входит:**

- task dashboard;
- priorities, due dates, reminders, assignees or kanban;
- cross-user or team workflow;
- admin access to user plans.

**Зависимости:**

- VS-01;
- TS04 ownership and privacy;
- TS07 Action Plan read rules;
- UI-01 U-04 and U-05 concepts.

**Критерий завершения:** пользователь может открыть существующий active Action Plan и восстановить следующий шаг без повторного чтения Scenario from scratch.

**Следующий этап:** VS-03 User Open Questions.

### VS-03 User Open Questions

**Status:** Completed.

**Пользовательская ценность:** пользователь фиксирует неопределённость как вопрос для внешней проверки, не получая от Nova Agent официального ответа.

**Что входит:**

- list User Open Questions inside own Action Plan;
- create User Open Question;
- update User Open Question status according to TS07;
- edit User Open Question text while allowed;
- History events for User Open Question changes;
- labels that distinguish Template Open Questions and User Open Questions.

**Что не входит:**

- professional answer workflow;
- official decision workflow;
- automatic closing of questions;
- User Open Question writes in completed Action Plan;
- Content Admin access to User Open Questions.

**Зависимости:**

- VS-01;
- TS07 User Open Question lifecycle;
- DR-08 completed plan behavior;
- UI-01 U-08 and Template OQ vs User OQ separation.

**Критерий завершения:** пользователь может создать, увидеть and update a User Open Question in an active Action Plan, and every change remains marked as user's question for external verification.

**Следующий этап:** VS-04 Sources And Notes.

### VS-04 Sources And Notes

**Пользовательская ценность:** пользователь фиксирует, что источник был проверен, и добавляет короткий контекст к собственным событиям без превращения Nova Agent в document storage.

**Что входит:**

- list and create Checked Source Mark inside existing active Action Plan;
- idempotent Checked Source Mark behavior;
- User Note attached to context History Event;
- User Note edit, hide and delete according to TS07 and DR-07;
- History events for source check and note changes.

**Что не входит:**

- source verification by Nova Agent;
- repeated Checked Source Marks for the same Source Revision;
- User Note as document, source, diary or personal data store;
- creating Action Plan from Checked Source Mark;
- Content Admin access to User Notes or Checked Source Marks.

**Зависимости:**

- VS-01;
- VS-02 for stronger return context;
- TS07 Checked Source Mark and User Note operations;
- DR-01 and DR-07;
- UI-01 Source and User Note representation rules.

**Критерий завершения:** source check and note actions preserve History context, do not create official meaning and do not introduce document storage.

### VS-05 Completion And Completed Read-Only

**Пользовательская ценность:** пользователь может закрыть собственный процесс без превращения completion в официальный результат.

**Что входит:**

- complete own active Action Plan;
- History event for completion;
- completed Action Plan read-only behavior;
- completed plan access to existing Progress, History, User Notes and User Open Questions according to TS07, DR-07 and DR-08;
- no reopen behavior.

**Что не входит:**

- reopening completed plan;
- changing Progress in completed plan;
- writing User Open Questions in completed plan;
- treating completed plan as external process completion;
- automatic migration to new Scenario Version.

**Зависимости:**

- VS-01;
- VS-03 if completed User Open Question behavior is demonstrated;
- VS-04 if completed User Note behavior is demonstrated;
- TS07 Action Plan lifecycle;
- DR-07 and DR-08.

**Критерий завершения:** completed Action Plan remains readable as user context, but no forbidden write operation becomes available.

## 8. MVP Completeness Slices

### VS-06 Minimal Content Admin Publishing Flow

**Пользовательская ценность:** пользователь видит поддерживаемый структурный контент, а не hardcoded demo content.

После VS-06 Nova Agent считается MVP для проверки пользовательской ценности.

**Что входит:**

- Content Admin can maintain approved Content Model entities needed for MVP content;
- create draft Scenario Version;
- manage versioned Scenario context;
- publish Scenario Version;
- published content becomes user-visible according to existing visibility rules;
- content publication event exists for publication actions.

**Что не входит:**

- Content Admin dashboard for user analytics;
- Content Admin access to Action Plans, Progress, History, User Open Questions, User Notes or Checked Source Marks;
- review or approval workflow;
- new admin roles;
- CRUD audit trail beyond `content_publication_events`;
- hidden expansion of content entity types.

**Зависимости:**

- TS01, TS03, TS05 and TS06;
- TS08 Content Admin API contract;
- UI-01 A-01-A-07 concepts as scope boundaries;
- DR-04, DR-05 and DR-06.

**Критерий завершения:** Content Admin can publish the limited MVP scenario content required by user-facing slices without accessing User-Owned Data or expanding product scope.

### VS-07 Content Lifecycle And Pattern B

**Пользовательская ценность:** existing Action Plans remain understandable when content changes.

VS-07 завершает MVP lifecycle completeness.

**Что входит:**

- deprecate Scenario Version;
- supersede Scenario Version;
- Pattern B read access for users with active or completed Action Plan linked to exact Scenario Version;
- warning signal when Pattern B applies;
- no new plan creation from deprecated or superseded Scenario Version.

**Что не входит:**

- automatic migration of active Action Plan to a new Scenario Version;
- creating new Action Plan from deprecated or superseded content;
- exposing deprecated or superseded content without Pattern B condition;
- user-owned History Events from admin content changes;
- affected user counts or aggregates for Content Admin.

**Зависимости:**

- VS-06;
- DR-02;
- TS06 publication lifecycle;
- TS07 historical context rules;
- TS08 Pattern B access rules;
- UI-01 U-09.

**Критерий завершения:** old plan context remains readable only for its owner under Pattern B, while current users cannot start new plans from deprecated or superseded Scenario Versions.

## 9. Slice Dependencies

Recommended order:

```text
VS-01 → VS-02 → VS-03 → VS-04 → VS-05 → VS-06 → VS-07
```

Dependency rules:

- VS-01 must be first because it demonstrates the product spine.
- VS-02 depends on existing Action Plan and History from VS-01.
- VS-03 depends on active Action Plan and History.
- VS-04 depends on active Action Plan, Source context and History.
- VS-05 depends on Action Plan lifecycle, Progress, History and completed-plan rules.
- VS-06 may be prepared in parallel as content support, but must not displace user-facing value slices.
- VS-07 depends on published content lifecycle and Pattern B.

## 10. Explicitly Out Of Scope

The following are outside MVP:

- document storage;
- upload or processing of user files;
- storing filled personal values as user document data;
- integrations with authorities;
- automatic application submission;
- automatic official form filling or sending;
- official status verification;
- document verification;
- professional answers;
- legal advisor workflows;
- tax advisor workflows;
- medical advisor workflows;
- financial advisor workflows;
- reminders;
- deadlines;
- priorities;
- assignees;
- kanban;
- CRM workflows;
- analytics dashboards;
- affected user counts for Content Admin;
- additional roles;
- SuperAdmin;
- Moderator;
- External Actor authenticated access;
- corporate accounts;
- public anonymous content read;
- marketplace of specialists;
- realtime History infrastructure;
- automatic migration of active Action Plan to new Scenario Version;
- reopening completed Action Plan;
- new functions not present in approved specifications.

## 11. MVP Success Criteria

Nova Agent is successful as MVP when:

- VS-01 demonstrates the full product spine from Life Situation to History;
- after VS-01 Nova Agent is demonstrable as a product;
- after VS-06 Nova Agent is usable for checking user value with maintained MVP content;
- VS-07 completes lifecycle completeness for content changes and historical access;
- user can understand the situation, constraints and next step before taking action;
- user can create or continue Action Plan;
- user can mark Progress without implying external confirmation;
- History preserves context without becoming an official journal;
- User Open Questions remain questions for external verification;
- Sources remain external verification context, not Nova Agent verification;
- Content Admin supports content without seeing User-Owned Data;
- no out-of-scope pattern appears in product behavior.

## 12. Risk Controls

### Scope creep

Risk: MVP Work Plan becomes a list of all possible features.

Control: every slice must have a user value, minimal result, explicit exclusions and completion criterion.

### Task Manager drift

Risk: Progress and plans become generic task management.

Control: no deadlines, priorities, assignees, reminders, kanban or arbitrary user-created tasks.

### CRM drift

Risk: Content Admin becomes a dashboard over users.

Control: Content Admin has no User-Owned Data access and no user aggregates.

### Reference catalog drift

Risk: product stops at content browsing.

Control: VS-01 must include Action Plan, Progress and History.

### Product boundary loss

Risk: Nova Agent appears to provide official or professional decisions.

Control: boundary labels and source/user mark distinctions from UI-01 and TS08 are mandatory.

### Context after action

Risk: user acts before seeing constraints and consequences.

Control: warnings, restrictions and applicability conditions appear before action controls.

### Technical completeness before user value

Risk: implementation starts with full admin, lifecycle or backend completeness.

Control: VS-01-VS-05 are User Value Slices; VS-06-VS-07 are MVP Completeness Slices.

## 13. Open Questions Registry

No blocking architecture, data, role, permission, lifecycle, API, UI or product-boundary question remains open before creating this MVP Work Plan.

Known non-blocking items:

| Question | Status | Owner document | Notes |
|---|---|---|---|
| Exact first seed content for registration-of-address demo | Closed for first seed plan | `plans/active/2026-06-22-mvp-seed-content-plan.md` | First seed content is defined for VS-01; implementation details remain outside this plan. |
| README navigation polish after structure stabilizes | Open | `plans/active/2026-06-18-mvp-implementation-preparation.md` | Documentation navigation task, not MVP scope. |
| Implementation details deferred by TS08 | Deferred | Future implementation planning within approved specs | Must not change product/API decisions. |

Any newly discovered question that affects architecture, data, roles, permissions, lifecycle, API, user scenarios or product boundaries must be closed in the relevant specification, explicitly deferred with an owner document, or marked out of MVP scope before implementation continues.

## 14. Completion Criteria

This MVP Work Plan is complete when:

- all Vertical Slices VS-01-VS-07 are listed with user value, inclusions, exclusions, dependencies and completion criteria;
- VS-01 is clearly marked as first demonstrable value;
- VS-06 is clearly marked as MVP for checking user value;
- VS-07 is clearly marked as lifecycle completeness;
- no section creates new functions, roles, entities, states or API;
- non-negotiable decisions from TS01-TS08, UI-01 and DR-01-DR-09 are not reopened;
- out-of-scope boundaries are explicit;
- open questions are registered according to `docs/принципы-продукта.md`.

MVP implementation is not complete until the accepted slices have been implemented and verified in a later implementation phase. This document only defines the order and boundaries.

## 15. Changelog Requirements

Any future change to this plan must update:

- the relevant active plan status;
- `changelog/YYYY-MM-DD.md`;
- linked specifications only if the change discovers a real contradiction or missing approved requirement.

Changelog entries must describe changed documents and must not record implementation work unless implementation was actually performed.
