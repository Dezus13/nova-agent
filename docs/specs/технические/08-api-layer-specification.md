# Technical Spec 08: API Layer Specification

## I. Назначение документа

Technical Spec 08 фиксирует API contract Nova Agent для MVP.

Цель документа — описать API-поверхность, которая соединяет:

- published Content Model;
- User-Owned Workflow Operations;
- Content Administration Operations;
- auth contract;
- role and ownership boundaries;
- UI visibility and boundary requirements.

TS08 является контрактной спецификацией API. Документ описывает, какие операции доступны, кто может их вызывать, какие входные данные требуются, какие ответы возвращаются, какие ошибки обязательны и какие инварианты нельзя нарушать.

TS08 не реализует API и не выбирает способ физического enforcement. Любая будущая реализация должна использовать этот документ как контракт, но не должна считать его physical storage, access policy, application server, client interface или provider implementation spec.

TS08 должен помогать разработчику или AI понять API-слой Nova Agent примерно за 10 минут:

1. Content Model читается пользователем только в published или historically allowed context.
2. User-Owned Data всегда scoped to owning User.
3. Content Admin управляет Content Model и не получает доступ к User-Owned Data.
4. User работает со своим Action Plan и не управляет Content Model.
5. API всегда сохраняет Scenario Version context.
6. API не превращает Nova Agent в task manager, official status tracker или консультационный сервис.

## II. Источники и приоритет

TS08 основан на следующих источниках:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/карта-функций.md`
4. `docs/пользовательские-сценарии.md`
5. `docs/roadmap.md`
6. `docs/техническая-архитектура.md`
7. `docs/specs/технические/01-content-model-and-versioning.md`
8. `docs/specs/технические/02-user-owned-workflow-model.md`
9. `docs/specs/технические/03-logical-data-model.md`
10. `docs/specs/технические/04-auth-roles-and-ownership.md`
11. `docs/specs/технические/05-supabase-schema-and-rls.md`
12. `docs/specs/технические/06-content-administration-operations.md`
13. `docs/specs/технические/07-user-owned-workflow-operations.md`
14. `docs/specs/ui/01-ui-design-rules.md`
15. `docs/decisions/2026-06-19-api-layer-pre-decisions.md`
16. `AGENTS.md`

Если TS08 противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня согласно `AGENTS.md`.

TS08 обязан использовать уже принятые решения и не имеет права их пересматривать:

- DR-01–DR-09 из `docs/decisions/2026-06-19-api-layer-pre-decisions.md`;
- TS05 Amendments 01–06;
- TS07 MVP Decisions 01–08.

Decision Record закрывает открытые вопросы перед TS08, но не заменяет TS01–TS07 и UI-01. В пересекающемся scope после создания TS08 приоритет имеет TS08 как API contract, если он не противоречит документам более высокого уровня.

## III. Что входит / Что не входит

### Входит в TS08

- API principles;
- auth contract;
- role and ownership enforcement на уровне API boundary;
- common request and response rules;
- error contract;
- pagination, filtering and sorting contract;
- user content read API;
- Action Plan API;
- Progress API;
- User Open Question API;
- User Note API;
- Checked Source Mark API;
- History API;
- Content Admin API;
- Pattern B access rules;
- UI boundary response requirements;
- API invariants;
- forbidden API patterns;
- risks;
- decisions deferred to implementation;
- acceptance criteria.

### Не входит в TS08

- database definition or query language;
- row-level access policy syntax;
- physical storage structures;
- database-side automation mechanisms;
- database change scripts;
- provider-specific implementation snippets;
- application server implementation snippets;
- client UI implementation snippets;
- generated type definitions;
- component framework details;
- request handler internals;
- runtime platform details;
- operational telemetry;
- product usage metrics;
- asynchronous user messaging;
- reminders;
- new roles;
- new entities;
- new states;
- auth provider configuration;
- login/signup/password reset flows;
- public anonymous access;
- file storage;
- user document upload;
- official answer storage;
- professional consultation workflow;
- support or moderation workflow.

Если для реализации API потребуется выбрать physical storage, access policy, database-side automation, change script, request handler, framework or provider detail, это решение должно быть вынесено в implementation planning, а не добавлено в TS08.

## IV. API Layer Principles

### Principle 1. API mirrors approved operations

API может содержать только операции, утверждённые в TS06, TS07 и UI-01.

API не должен создавать скрытые product capabilities. Если операции нет в TS06 или TS07, она не входит в MVP API.

### Principle 2. Scenario Version is the user-facing historical boundary

Любой user-owned response, смысл которого зависит от контента, должен возвращать Scenario Version context или ссылку на него.

Action Plan, Progress, History Event, User Open Question, User Note и Checked Source Mark не должны опираться только на mutable live Scenario.

### Principle 3. Content Model and User-Owned Data are separate

Content Model API и User-Owned API не должны смешиваться.

User не может писать Content Model.

Content Admin не может читать или писать User-Owned Data.

### Principle 4. Viewing content is not a stateful action

Чтение Life Situation, Scenario Version, steps, requirements, sources, warnings, restrictions, applicability conditions и Template Open Questions не создаёт Action Plan, Progress, History Event, User Open Question, User Note или Checked Source Mark.

### Principle 5. API preserves product boundaries

API responses must carry enough semantic fields for UI-01 boundary rules:

- product boundary disclaimer;
- source type;
- user mark labels;
- Pattern B version warning signal;
- history disclaimer;
- distinction between Template Open Question and User Open Question;
- distinction between Source and Checked Source Mark.

### Principle 6. API does not produce official decisions

API must not return fields, statuses or error semantics that imply:

- official approval;
- official rejection;
- authority submission;
- document verification;
- professional answer;
- Nova Agent validation;
- result guarantee.

### Principle 7. API does not become task management

API must not include:

- arbitrary user-created steps;
- subtasks;
- priorities;
- due dates;
- reminders;
- assignees;
- kanban states;
- team workflow;
- service-level tracking for user tasks.

## V. Authentication Contract

### Auth model

TS08 describes auth contract only.

The API expects authenticated requests to include a Bearer JWT.

The API does not define:

- login endpoint;
- signup endpoint;
- password reset endpoint;
- OAuth provider setup;
- email verification flow;
- auth UI screens;
- session storage;
- token storage;
- token generation.

### Required token claims

The token must provide:

- `user_id` — stable authenticated account identifier used as the API actor;
- role claim or equivalent role context for `content_admin`;
- token validity metadata sufficient for expiration handling.

The exact provider-specific claim names are deferred to implementation. TS08 only requires that API can derive:

- authenticated user identity;
- whether the actor has `content_admin`;
- whether the actor can act as ordinary `user`.

### Role interpretation

MVP roles are only:

- `user`;
- `content_admin`.

Every authenticated account with product access may act as `user`.

`content_admin` is explicit. It must not be self-assigned through API operations.

A dual-role account can act in user context or content admin context, but API permissions must remain action-scoped:

- user-context operations access only own User-Owned Data;
- content-admin operations access only Content Model and content publication events;
- `content_admin` role never grants read or write access to User-Owned Data.

### Token expiration and refresh semantics

If token is missing, invalid or expired, API returns `401 Unauthorized`.

Token refresh mechanism is outside TS08. API may use a stable error code that tells the client the token is expired, but API does not provide a refresh endpoint in MVP.

## VI. Role and Ownership Enforcement

### User API boundary

User may:

- read accessible published or historically accessible content;
- read own Action Plans;
- create Action Plan through approved Plan-Creating Stateful Actions;
- update own active Progress through approved transitions;
- read own History Events;
- create own User Open Questions in active plans;
- update own User Open Questions in active plans;
- create own User Notes;
- edit own User Notes only where allowed by plan state;
- hide or delete own User Notes where allowed by DR-07;
- create own Checked Source Marks inside existing active Action Plans.

User may not:

- read another User's User-Owned Data;
- write another User's User-Owned Data;
- write Content Model;
- perform Content Admin operations;
- publish, deprecate or supersede Scenario Versions;
- mutate published Scenario Versions;
- self-escalate role;
- create arbitrary steps, deadlines, priorities or assignments.

### Content Admin API boundary

Content Admin may:

- read Content Model;
- create and edit draft content entities;
- manage Scenario Version draft context;
- publish Scenario Version;
- deprecate Scenario Version;
- supersede Scenario Version;
- delete draft Scenario Version as an admin content operation;
- read content publication events.

Content Admin may not:

- read User-Owned Data;
- write User-Owned Data;
- read aggregates derived from User-Owned Data;
- create Action Plan for User;
- update Progress;
- rewrite History Event;
- manage User Open Questions;
- manage User Notes;
- manage Checked Source Marks;
- migrate active Action Plans to new Scenario Version;
- act as support, moderator, authority or specialist.

### External Actor boundary

External Actors may appear only as content context:

- official source;
- institution;
- authority;
- specialist;
- direction for external verification.

External Actors have no authenticated MVP API role.

## VII. Common Resource Rules

### Resource identity

API resource identifiers are opaque to clients.

UI may display stable names, titles and labels, but should not display raw IDs as user-facing content.

### Content resources

Content resources include:

- Life Situation;
- Scenario;
- Scenario Version;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Source Revision;
- Versioned Template Open Question Context;
- Warning;
- Restriction;
- Applicability Condition;
- content publication event.

Content resources are not User-Owned Data.

### User-owned resources

User-owned resources include:

- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

User-owned resources always belong to an owning User through Action Plan or direct user ownership.

### Resource state vocabulary

API may expose only states and statuses already approved:

- Scenario Version publication state: `draft`, `published`, `deprecated`, `superseded`;
- Action Plan state: `active`, `completed`;
- Progress status: `not_started`, `in_progress`, `awaiting_external_response`, `completed`, `requires_check`;
- User Open Question status: `open`, `requires_check`, `awaiting_external_response`, `clarified_by_user`, `irrelevant`;
- User Note lifecycle state: `created`, `edited_by_user`, `hidden_by_user`, `deleted_by_user`;
- History Event type: the TS05/TS07 MVP event type set;
- Content publication event type: `scenario_version_published`, `scenario_version_deprecated`, `scenario_version_superseded`.

API must not add states through response or error design.

### Historical context

Responses for user-owned resources must preserve enough context to avoid mutable live content ambiguity:

- Action Plan response includes stable Scenario identity, Scenario Version and selected Life Situation context.
- Progress response includes Action Plan and versioned step context.
- History Event response includes Action Plan, Scenario Version, event type and affected context.
- User Open Question response includes Action Plan, Scenario Version and optional versioned context.
- User Note response includes Action Plan and context History Event.
- Checked Source Mark response includes Action Plan, Scenario Version, Source Revision and History Event.

## VIII. Common Request Rules

### Request authentication

All MVP API requests require authentication.

Public anonymous read is outside MVP.

### Role context

Requests that perform Content Admin operations must be evaluated in `content_admin` role context.

Requests that perform user-owned operations must be evaluated in `user` role context.

Dual-role account must not combine both contexts within a single operation.

### Mutation intent

Mutation requests must make user intent explicit.

The following actions may create Action Plan if no active plan exists:

- explicit start plan;
- change step progress status;
- create User Open Question;
- create User Note.

Checked Source Mark creation is not a Plan-Creating Stateful Action.

All four Plan-Creating Stateful Actions use the same idempotent plan creation flow:

1. The request identifies a published Scenario Version, selected Life Situation context and explicit user intent.
2. API checks whether an active Action Plan already exists for the same User and stable Scenario identity.
3. If an active Action Plan exists, API uses that plan and does not create another one.
4. If no active Action Plan exists, API creates Action Plan idempotently according to DR-03, creates initial Progress records according to TS05 and creates `action_plan_created` History Event.
5. API then performs the primary action that triggered the flow: start plan, progress status change, User Open Question creation or User Note creation.
6. The mutation response must make clear whether the Action Plan was existing or newly created.

This shared flow does not make every mutation idempotent. Idempotency applies to Action Plan creation itself and to operation contracts that explicitly require idempotency.

### Idempotency

Action Plan creation is idempotent according to DR-03.

Checked Source Mark creation is idempotent according to DR-01.

Read operations are idempotent.

Other mutations are not automatically idempotent unless explicitly stated in the operation contract.

### Validation order

For any mutation, API must conceptually validate:

1. authentication;
2. role permission;
3. ownership;
4. target resource existence and visibility;
5. Scenario Version context;
6. lifecycle state restrictions;
7. operation-specific request validity.

This order is conceptual. Implementation details are outside TS08.

## IX. Common Response Rules

### Response envelope

Every successful API response should be contractually understandable as:

- primary data;
- metadata;
- boundary signals;
- optional warnings.

The exact serialization format is deferred to implementation, but the semantic fields must be stable.

### Metadata

Responses may include:

- `request_id`;
- pagination metadata where applicable;
- role context used;
- version warning signal where applicable;
- read-only reason where applicable.

### Boundary signals

Responses used by user-facing UI must include enough information to communicate:

- Nova Agent is справочная and organizational help;
- Progress is user's mark;
- User Open Question is user's question for external verification;
- User Note is user's note;
- Checked Source Mark is user's mark, not Nova Agent verification;
- History is internal event history, not official journal;
- Source type is official, reference, or direction for external verification.

### Hidden and deleted User Notes

When a User Note is hidden or deleted, API must not expose hidden/deleted note text in normal read responses.

History must still remain understandable:

- History Event remains visible.
- User Note may appear as a redacted note placeholder with lifecycle state.
- The response must preserve that a note existed without exposing removed text.

The physical representation of hide/delete is outside TS08.

### Read-only indicators

For completed Action Plan, API must return read-only indicators for operations that are not allowed:

- Progress change is read-only;
- Action Plan reopen is unavailable;
- User Open Question write operations are unavailable;
- User Note edit is unavailable;
- User Note hide/delete remains available according to DR-07.

## X. Error Contract

### Error response semantics

Every error response must include:

- stable error code;
- human-readable short message;
- optional field-level validation details;
- optional operation-specific reason;
- request identifier if available.

Messages must not imply official, legal, tax, medical or financial judgment.

### Required HTTP-level outcomes

TS08 uses HTTP status semantics as API contract:

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded and returned existing or updated resource |
| `201 Created` | Request created a new resource |
| `400 Bad Request` | Request shape or field values are invalid |
| `401 Unauthorized` | Missing, invalid or expired authentication |
| `403 Forbidden` | Authenticated actor is not allowed to perform operation |
| `404 Not Found` | Resource does not exist or is intentionally not visible to actor |
| `409 Conflict` | Request conflicts with lifecycle rules and cannot be resolved idempotently |
| `422 Unprocessable Entity` | Request is semantically invalid for the target resource |

`500` class errors are implementation failures and not used to express domain rules.

### Required domain error codes

API must define stable domain error codes for:

- `auth_required`;
- `token_invalid`;
- `token_expired`;
- `role_required`;
- `ownership_required`;
- `resource_not_found`;
- `content_not_visible`;
- `draft_not_visible_to_user`;
- `pattern_b_access_required`;
- `action_plan_creation_requires_published_version`;
- `active_action_plan_already_exists`;
- `completed_action_plan_read_only`;
- `action_plan_reopen_forbidden`;
- `progress_transition_forbidden`;
- `progress_not_started_reset_forbidden`;
- `user_open_question_transition_forbidden`;
- `user_open_question_irrelevant_is_final`;
- `user_open_question_completed_plan_write_forbidden`;
- `user_note_context_event_required`;
- `user_note_context_event_scope_mismatch`;
- `user_note_completed_plan_edit_forbidden`;
- `checked_source_mark_requires_existing_active_plan`;
- `checked_source_mark_not_verification`;
- `history_event_append_only`;
- `content_admin_user_owned_access_forbidden`;
- `user_content_admin_operation_forbidden`;
- `published_content_immutable`;
- `publication_transition_forbidden`;
- `draft_scenario_version_required_for_delete`;
- `new_role_forbidden`;
- `new_state_forbidden`;
- `task_manager_pattern_forbidden`.

### Error visibility

For resources hidden by ownership or Pattern B rules, API should return `404 Not Found` rather than reveal existence.

For authenticated owner attempting a forbidden lifecycle action on visible own resource, API should return `403 Forbidden` or `422 Unprocessable Entity` with explicit domain reason.

### Operational wording

TS08 does not define uptime, latency targets or runtime operations.

UI loading and retry behavior may use stable error categories, but runtime platform concerns are outside TS08.

## XI. Pagination, Filtering, Sorting

### Pagination strategy

List endpoints must support cursor pagination.

Cursor pagination is required for:

- Action Plan lists;
- History Event lists;
- User Open Question lists;
- User Note lists where exposed separately;
- content publication events;
- admin content lists that may grow over time.

Offset pagination is not required for MVP.

### Pagination response metadata

Paginated responses must include:

- requested limit;
- next cursor if more data exists;
- previous cursor only if supported by implementation;
- stable sort field used;
- whether the result set is complete.

### Default ordering

Default ordering:

- History Events: newest first for list views, with optional oldest first for timeline reconstruction;
- Action Plans: newest updated or created first;
- User Open Questions: active statuses before `irrelevant`, then newest first;
- content publication events: newest first;
- content admin lists: deterministic title/name order unless workflow requires recent drafts first.

### Filtering

Allowed filters are contract-level and must not create new features.

User filters:

- Action Plan by state `active` or `completed`;
- Action Plan by stable Scenario identity;
- Progress by Action Plan;
- User Open Question by Action Plan and status;
- History Event by Action Plan and event type;
- Checked Source Mark by Action Plan and Source Revision.

Content filters:

- Life Situation visibility for user catalog;
- Scenario by Life Situation;
- Scenario Version by publication state for Content Admin;
- published Scenario Version for User;
- deprecated/superseded Scenario Version only through Pattern B.

### Sorting restrictions

API must not introduce task-manager sorting:

- priority;
- due date;
- urgency;
- assignee;
- overdue.

## XII. User Content Read API

User Content Read API supports U-01, U-02, U-03, U-06 and U-09 from UI-01.

Reading content does not create User-Owned Data.

### List Life Situations

| Contract | Rule |
|---|---|
| Operation | List Life Situations visible to User |
| Method and route | `GET /api/life-situations` |
| Role | `user` |
| Returns | Life Situations linked to at least one Scenario with at least one published Scenario Version |
| Must not return | Life Situations without user-visible published Scenario Version |
| DR link | DR-04 |

Response must include:

- Life Situation identity;
- title;
- short description;
- user-facing applicability summary if available;
- count or summary of visible related Scenarios if needed by UI;
- boundary text indicating content is informational.

### Get Life Situation

| Contract | Rule |
|---|---|
| Operation | Get user-visible Life Situation detail |
| Method and route | `GET /api/life-situations/{life_situation_id}` |
| Role | `user` |
| Returns | Life Situation and visible Scenario summaries |
| Must not return | Draft-only Scenarios or admin-only metadata |

Response must include visible Scenario summaries only when each Scenario has a published Scenario Version.

### List Scenarios For Life Situation

| Contract | Rule |
|---|---|
| Operation | List user-visible Scenarios for Life Situation |
| Method and route | `GET /api/life-situations/{life_situation_id}/scenarios` |
| Role | `user` |
| Returns | Stable Scenario summaries with current published Scenario Version summary |
| Must not return | Scenario without published Scenario Version |
| DR link | DR-05 |

If user has an active Action Plan for a Scenario, response should include `has_active_plan: true` and active plan reference for "continue plan" UI.

### Get Published Scenario Version

| Contract | Rule |
|---|---|
| Operation | Read Scenario Version content |
| Method and route | `GET /api/scenario-versions/{scenario_version_id}` |
| Role | `user` |
| Allowed | `publication_state = published` |
| Pattern B | Also allowed for `deprecated` or `superseded` only when Pattern B condition is met |

Response must include:

- stable Scenario identity;
- Scenario Version identity;
- publication state;
- Pattern B flag;
- version warning when Pattern B applies;
- selected or available Life Situation context;
- warnings before actions;
- restrictions before actions;
- applicability conditions;
- Template Open Questions separated from User Open Questions;
- Versioned Step Context list;
- Document Requirement context;
- Data Requirement context;
- Source Revision context with source type;
- boundary disclaimer.

### Get Scenario Version Step

| Contract | Rule |
|---|---|
| Operation | Read one versioned step context |
| Method and route | `GET /api/scenario-versions/{scenario_version_id}/steps/{versioned_step_context_id}` |
| Role | `user` |
| Allowed | Published or Pattern B accessible Scenario Version |

Response must include:

- step purpose;
- expected result;
- requirements;
- sources;
- warnings and restrictions before action signals;
- Template Open Questions;
- no Progress unless called through Action Plan detail endpoint.

## XIII. Action Plan API

### List Own Action Plans

| Contract | Rule |
|---|---|
| Operation | List own Action Plans |
| Method and route | `GET /api/me/action-plans` |
| Role | `user` |
| Ownership | Own plans only |
| Pagination | Required |

Allowed filters:

- state `active` or `completed`;
- stable Scenario identity.

Response must include:

- Action Plan identity;
- stable Scenario identity and title;
- Scenario Version identity;
- selected Life Situation context;
- state;
- created timestamp;
- completion timestamp if completed;
- progress summary;
- Pattern B flag if Scenario Version is deprecated or superseded;
- boundary disclaimer.

### Get Own Action Plan

| Contract | Rule |
|---|---|
| Operation | Read own Action Plan detail |
| Method and route | `GET /api/me/action-plans/{action_plan_id}` |
| Role | `user` |
| Ownership | Own plan only |

Response must include:

- Action Plan identity and state;
- stable Scenario identity;
- Scenario Version identity and publication state;
- selected Life Situation context;
- Pattern B flag and version warning if applicable;
- Progress records;
- visible User Open Question summary;
- History summary or link;
- Checked Source Marks;
- completed plan read-only map;
- boundary disclaimer.

### Explicit Start Plan

| Contract | Rule |
|---|---|
| Operation | Start Action Plan explicitly |
| Method and route | `POST /api/me/action-plans` |
| Role | `user` |
| Plan-creating | Yes |
| Idempotency | Required by DR-03 |

Request must include:

- Scenario Version identity;
- selected Life Situation context;
- explicit action intent `start_plan`.

Rules:

- Scenario Version must be `published`.
- Explicit Start Plan uses the shared idempotent plan creation flow.
- If active Action Plan already exists for same User and stable Scenario identity, return existing plan with `200 OK`.
- If new Action Plan is created, return `201 Created`.
- Initial Progress records are created according to TS05; no per-step initial History Events are returned as separate user actions.
- Response includes `action_plan_created` History Event.

Forbidden:

- starting plan for draft, deprecated or superseded Scenario Version;
- starting second active plan for same stable Scenario identity;
- starting plan as Content Admin for another User.

### Complete Action Plan

| Contract | Rule |
|---|---|
| Operation | Complete own active Action Plan |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/complete` |
| Role | `user` |
| Ownership | Own active plan |

Rules:

- Only active Action Plan can be completed.
- Completion creates `action_plan_completed` History Event.
- Completion does not mean external process completed.
- Completed Action Plan cannot be reopened.

Response must include:

- updated Action Plan state `completed`;
- created History Event;
- read-only operation map.

### New Pass After Completion

| Contract | Rule |
|---|---|
| Operation | Start new pass for same stable Scenario identity |
| Method and route | Same as explicit start plan |
| Role | `user` |
| Allowed | Only if no active plan exists for same stable Scenario identity |

Rules:

- Completed plans do not block new active plan creation.
- New plan must use a currently published Scenario Version.
- Completed plan is not reopened.
- History is not copied from old plan.

## XIV. Progress API

### Update Progress Status

| Contract | Rule |
|---|---|
| Operation | Update own Progress status |
| Method and route | `PATCH /api/me/action-plans/{action_plan_id}/progress/{progress_id}` |
| Role | `user` |
| Ownership | Own active plan |
| Plan-creating | Yes, only when invoked from Scenario Version context before plan exists |

For existing Action Plan:

- Action Plan must be active.
- Progress must belong to Action Plan.
- Progress must refer to Versioned Step Context in the Action Plan Scenario Version.
- Target status must be an allowed transition from TS07.
- Target status must not be `not_started` unless the current status is initial `not_started` and no transition is being made.
- Every user-driven change creates `progress_status_changed` History Event.

For plan-creating progress action:

- Request must identify published Scenario Version, selected Life Situation context and target Versioned Step Context.
- Scenario Version must be published.
- If active plan exists, apply operation to existing plan.
- If no active plan exists, use the shared idempotent plan creation flow and then apply progress change.
- The progress change creates `progress_status_changed` History Event after the Action Plan and initial Progress records exist.

Response must include:

- updated Progress;
- Action Plan reference;
- created History Event;
- current Progress status label as user's mark;
- boundary text that Progress is not official status.

Forbidden:

- Progress change in completed Action Plan;
- automatic Progress change;
- Progress transition to `not_started`;
- Progress change by Content Admin.

## XV. User Open Question API

### List User Open Questions

| Contract | Rule |
|---|---|
| Operation | List own User Open Questions in plan |
| Method and route | `GET /api/me/action-plans/{action_plan_id}/open-questions` |
| Role | `user` |
| Ownership | Own plan |
| Pagination | Required |

Allowed filters:

- status;
- versioned step context;
- versioned source context;
- versioned requirement context.

Response must distinguish:

- Template Open Question as content;
- User Open Question as user-owned question.

### Create User Open Question

| Contract | Rule |
|---|---|
| Operation | Create User Open Question |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/open-questions` or plan-creating equivalent from Scenario Version context |
| Role | `user` |
| Plan-creating | Yes |

Rules:

- If Action Plan exists, it must be active.
- If Action Plan does not exist, request must include published Scenario Version and selected Life Situation context.
- If no active plan exists, API uses the shared idempotent plan creation flow and then creates the User Open Question.
- User Open Question must be question text for external verification, not official answer.
- Optional context must be versioned context from the plan Scenario Version.
- Creation creates `user_open_question_created` History Event.

Response must include:

- created User Open Question;
- created or existing Action Plan reference;
- created History Event;
- boundary label "your question for external verification".

### Update User Open Question Status

| Contract | Rule |
|---|---|
| Operation | Update UOQ status |
| Method and route | `PATCH /api/me/action-plans/{action_plan_id}/open-questions/{user_open_question_id}/status` |
| Role | `user` |
| Ownership | Own active plan |

Rules:

- Action Plan must be active.
- Status transition must follow TS07.
- `irrelevant` is final.
- No transition from `irrelevant` is allowed.
- Status change creates `user_open_question_status_changed` History Event.
- Status change does not automatically change Progress.

Forbidden:

- write operations in completed Action Plan according to DR-08;
- automatic status change;
- status that implies professional answer or official decision.

### Edit User Open Question Text

| Contract | Rule |
|---|---|
| Operation | Edit UOQ text |
| Method and route | `PATCH /api/me/action-plans/{action_plan_id}/open-questions/{user_open_question_id}` |
| Role | `user` |
| Ownership | Own active plan |

Rules:

- Action Plan must be active.
- Editing creates `user_open_question_edited` History Event.
- Edit must not convert question into official answer or professional conclusion.

Completed plan behavior:

- forbidden by DR-08;
- return `403 Forbidden` with `user_open_question_completed_plan_write_forbidden`.

## XVI. User Note API

### Create User Note

| Contract | Rule |
|---|---|
| Operation | Create User Note |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/notes` or plan-creating equivalent from Scenario Version context |
| Role | `user` |
| Plan-creating | Yes |

Rules:

- User Note FK must reference a context History Event.
- Context History Event must belong to same Action Plan.
- `user_note_created` is an audit event for note creation, not the context History Event for the note.
- User Note must not point its FK to its own `user_note_created` audit event.
- If Action Plan does not exist, API uses the shared idempotent plan creation flow first.
- When Create User Note itself creates Action Plan, the `action_plan_created` History Event from the shared flow is created before the note and may be used as the context History Event for the note.
- API must not invent a separate unsupported History Event type only to host the note.
- After the note is attached to its context History Event, User Note creation creates `user_note_created` audit History Event.
- User Note text must be short supporting context, not document, source, open question, diary or personal data store.

Response must include:

- created User Note;
- context History Event;
- `user_note_created` History Event;
- user note label.

### Edit User Note

| Contract | Rule |
|---|---|
| Operation | Edit User Note text |
| Method and route | `PATCH /api/me/action-plans/{action_plan_id}/notes/{user_note_id}` |
| Role | `user` |
| Ownership | Own note |

Rules:

- In active Action Plan, edit is allowed.
- Edit creates `user_note_edited` History Event.
- Context History Event remains unchanged.
- User Note must remain in same Action Plan.

Completed plan behavior:

- edit is forbidden by DR-07;
- return `403 Forbidden` with `user_note_completed_plan_edit_forbidden`.

### Hide User Note

| Contract | Rule |
|---|---|
| Operation | Hide User Note |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/notes/{user_note_id}/hide` |
| Role | `user` |
| Ownership | Own note |

Rules:

- Hide is allowed in active and completed Action Plans according to DR-07.
- Hide creates `user_note_hidden` History Event.
- Hidden note text is not exposed in normal reads.
- Historical context remains visible through placeholder and History Events.

### Delete User Note

| Contract | Rule |
|---|---|
| Operation | Delete User Note from user-visible content |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/notes/{user_note_id}/delete` |
| Role | `user` |
| Ownership | Own note |

Rules:

- Delete is allowed in active and completed Action Plans according to DR-07.
- Delete creates `user_note_deleted` History Event.
- Delete must not delete or rewrite History Events.
- Deleted note text is not exposed in normal reads.
- Physical delete versus soft delete is outside TS08.

## XVII. Checked Source Mark API

### List Checked Source Marks

| Contract | Rule |
|---|---|
| Operation | List own Checked Source Marks in Action Plan |
| Method and route | `GET /api/me/action-plans/{action_plan_id}/checked-sources` |
| Role | `user` |
| Ownership | Own plan |

Response must include:

- Checked Source Mark identity;
- Action Plan;
- Scenario Version;
- Source Revision;
- History Event;
- mark label "you marked this source";
- no verification language.

### Create Checked Source Mark

| Contract | Rule |
|---|---|
| Operation | Mark Source Revision as checked |
| Method and route | `POST /api/me/action-plans/{action_plan_id}/checked-sources` |
| Role | `user` |
| Plan-creating | No |
| Idempotency | Required by DR-01 |

Request must include:

- Source Revision identity;
- optional versioned source context identity.

Rules:

- Action Plan must already exist.
- Action Plan must be active.
- Source Revision must be reachable from Action Plan Scenario Version through versioned source context.
- Checked Source Mark is unique per Action Plan and Source Revision.
- If mark already exists, return `200 OK` with existing mark.
- If mark is created, return `201 Created` and create `source_checked` History Event.
- Repeated source check does not create another Checked Source Mark.

Forbidden:

- creating Checked Source Mark without existing Action Plan;
- creating Checked Source Mark in completed Action Plan;
- treating mark as Source verification;
- changing Source or Source Revision through mark.

## XVIII. History API

### List History Events

| Contract | Rule |
|---|---|
| Operation | List History Events for own Action Plan |
| Method and route | `GET /api/me/action-plans/{action_plan_id}/history` |
| Role | `user` |
| Ownership | Own plan |
| Pagination | Required |

Response must include:

- History Event identity;
- event type;
- Action Plan;
- Scenario Version;
- affected entity type;
- affected entity reference;
- previous and new short values where applicable;
- short context label;
- created timestamp;
- attached visible User Notes or note placeholders;
- history disclaimer.

Rules:

- History Events are append-only.
- API has no update or delete History Event operation.
- History Events are not current state.
- History Events are not official journal.

### History update strategy

MVP API uses polling/refetch contract for History updates.

Realtime subscription contract is deferred beyond TS08.

Clients may refresh History after mutations using:

- returned created History Event in mutation response;
- paginated History list;
- cursor since last known History Event if implementation supports it.

This decision avoids introducing subscription infrastructure or runtime operations concerns into TS08.

## XIX. Content Admin API

Content Admin API supports A-01–A-07 from UI-01 and TS06 operations.

Content Admin API must not expose User-Owned Data or aggregates derived from User-Owned Data.

Generic admin route wording in this section is a placeholder for TS06 operation groups. It does not authorize arbitrary admin operations.

Every concrete Content Admin operation must correspond to a TS06-approved operation, must stay within Content Model scope and must not expand Content Admin access beyond TS06, UI-01 and this TS08 contract.

### Admin list and read content entities

| Contract | Rule |
|---|---|
| Operation | Read Content Model entities |
| Method and route | `GET /api/admin/content/...` |
| Role | `content_admin` |
| Scope | Content Model only |

Allowed content entity groups:

- Life Situations;
- Scenarios;
- Scenario Versions;
- Steps;
- Document Requirements;
- Data Requirements;
- Sources;
- Source Revisions;
- Template Open Questions;
- Warnings;
- Restrictions;
- Applicability Conditions;
- versioned context links.

Admin reads may include draft, published, deprecated and superseded Scenario Versions.

### Admin create and update draft content

| Contract | Rule |
|---|---|
| Operation | Create or update draft content |
| Method and route | `POST/PATCH /api/admin/content/...` |
| Role | `content_admin` |
| Scope | Draft or mutable content only |

Rules:

- Content Admin can create and update draft content entities according to TS06.
- API must prevent mutation of immutable published context.
- API must not use User-Owned Data as source for content.
- API must not expose affected user counts.

### Admin create draft Scenario Version

| Contract | Rule |
|---|---|
| Operation | Create draft Scenario Version |
| Method and route | `POST /api/admin/scenarios/{scenario_id}/versions` |
| Role | `content_admin` |

Rules:

- Only one draft Scenario Version per stable Scenario identity is allowed.
- Creating a second active draft for same Scenario is forbidden.
- Draft is not user-visible.

### Admin edit draft Scenario Version context

| Contract | Rule |
|---|---|
| Operation | Edit draft Scenario Version context |
| Method and route | `PATCH /api/admin/scenario-versions/{scenario_version_id}` and child context routes |
| Role | `content_admin` |

Allowed only while Scenario Version is `draft`.

May manage:

- versioned step context;
- step order;
- step dependencies;
- document requirement context;
- data requirement context;
- source context;
- template open question context;
- warning context;
- restriction context;
- applicability condition context;
- life situation context.

### Admin publish Scenario Version

| Contract | Rule |
|---|---|
| Operation | Publish Scenario Version |
| Method and route | `POST /api/admin/scenario-versions/{scenario_version_id}/publish` |
| Role | `content_admin` |

Rules:

- Allowed transition: `draft` to `published`.
- Creates content publication event `scenario_version_published`.
- Published Scenario Version and versioned context become immutable.
- Publishing does not migrate Action Plans.
- Publishing does not create user-owned History Events.

### Admin deprecate Scenario Version

| Contract | Rule |
|---|---|
| Operation | Deprecate Scenario Version |
| Method and route | `POST /api/admin/scenario-versions/{scenario_version_id}/deprecate` |
| Role | `content_admin` |

Rules:

- Allowed transition: `published` to `deprecated`.
- Creates content publication event `scenario_version_deprecated`.
- Deprecated Scenario Version is not available for new Action Plan creation.
- Existing active and completed Action Plans retain access through Pattern B.

### Admin supersede Scenario Version

| Contract | Rule |
|---|---|
| Operation | Supersede Scenario Version |
| Method and route | `POST /api/admin/scenario-versions/{scenario_version_id}/supersede` |
| Role | `content_admin` |

Rules:

- Allowed transitions: `published` to `superseded`, `deprecated` to `superseded`.
- Requires successor Scenario Version reference in content publication event.
- Creates content publication event `scenario_version_superseded`.
- Superseded is final.
- Existing active and completed Action Plans retain access through Pattern B.

### Admin delete draft Scenario Version

| Contract | Rule |
|---|---|
| Operation | Delete draft Scenario Version |
| Method and route | `DELETE /api/admin/scenario-versions/{scenario_version_id}` |
| Role | `content_admin` |

Rules:

- Allowed only for `draft`.
- Deletes the draft Scenario Version and only its draft versioned context rows.
- Underlying content entities are not deleted through this operation.
- Non-draft Scenario Versions must not be deleted through this operation.
- No User-Owned Data is read or changed.

TS08 does not specify cascade implementation.

### Admin read content publication events

| Contract | Rule |
|---|---|
| Operation | Read content publication events |
| Method and route | `GET /api/admin/content-publication-events` |
| Role | `content_admin` |
| Pagination | Required |

Response must include only content publication audit data:

- event type;
- admin actor reference;
- Scenario identity;
- Scenario Version identity;
- previous publication state;
- new publication state;
- successor version reference where applicable;
- created timestamp.

Must not include:

- ordinary User IDs;
- Action Plan IDs;
- Progress;
- History Events;
- User Open Questions;
- User Notes;
- Checked Source Marks;
- affected user counts;
- aggregate user metrics.

## XX. Pattern B Access Rules

Pattern B controls read access to deprecated or superseded Scenario Versions for historical user context.

### Pattern B condition

User may read a Scenario Version with `publication_state = deprecated` or `superseded` only if:

- authenticated actor is the owning User;
- the User has an Action Plan in state `active` or `completed`;
- that Action Plan points to the exact requested Scenario Version identity.

Pattern B is checked by concrete Scenario Version identity, not by stable Scenario identity.

### Pattern B response

When Pattern B grants access, API response must include:

- `pattern_b: true`;
- version warning signal;
- Scenario Version publication state;
- message that content reflects the version used by the user's plan;
- no suggestion that deprecated/superseded content is current for new plans.

### Pattern B denial

If Pattern B condition is not met:

- API returns `404 Not Found`;
- API must not reveal that deprecated or superseded Scenario Version exists.

### Pattern B and new plan creation

Pattern B read access does not allow new Action Plan creation.

New Action Plan can be created only from published Scenario Version.

## XXI. UI Boundary Requirements

API responses must support UI-01 boundary obligations.

### Required boundary fields by resource

| Resource | Required boundary meaning |
|---|---|
| Scenario Version | Informational scenario, not official instruction |
| Warning / Restriction | Show before action controls |
| Source Revision | Source type and check-currentness warning where applicable |
| Action Plan | User's process context, not official decision |
| Progress | User's mark, not external confirmation |
| User Open Question | User's question for external verification, not answer |
| User Note | User's note, not source or official record |
| Checked Source Mark | User marked source, Nova Agent did not verify it |
| History Event | Internal Nova Agent event, not official journal |

### Boundary text strategy

API may return stable boundary keys rather than full final UI copy.

The required contract is semantic:

- UI must be able to show boundary warnings consistently.
- UI must distinguish content-owned and user-owned data.
- UI must know which actions are available or read-only.

Final wording may be controlled by client-facing copy, but API must provide enough state and semantic flags.

### Optimistic UI support

Mutation responses must return enough data for UI to update optimistically without inventing state:

- updated primary resource;
- created History Event if operation creates one;
- updated Action Plan summary when relevant;
- read-only operation map when state changes to completed;
- idempotency indicator when existing resource is returned.

If a mutation fails, error response must include stable error code and no partial success ambiguity.

## XXII. API Invariants

1. API never creates User-Owned Data from content viewing.
2. API creates Action Plan only through approved Plan-Creating Stateful Actions.
3. API creates Action Plan only for published Scenario Version.
4. API creation of Action Plan is idempotent.
5. API never creates Checked Source Mark as plan-creating action.
6. API creation of Checked Source Mark is idempotent per Action Plan and Source Revision.
7. API never allows second active Action Plan for same User and stable Scenario identity.
8. API allows new pass after completion only as a new Action Plan.
9. API never reopens completed Action Plan.
10. API never migrates active Action Plan to new Scenario Version automatically.
11. API never updates Progress in completed Action Plan.
12. API never allows Progress transition to `not_started`.
13. API never changes Progress automatically.
14. API never treats Progress as official external status.
15. API never allows UOQ transition out of `irrelevant`.
16. API never writes UOQ in completed Action Plan.
17. API never treats UOQ as answer, consultation or official decision.
18. API allows User Note edit only where DR-07 permits.
19. API allows User Note hide/delete in completed plan according to DR-07.
20. API never exposes hidden/deleted User Note text in normal reads.
21. API never rewrites or deletes History Events through User Note operations.
22. API has no History Event update/delete operation.
23. API keeps Content Admin away from User-Owned Data and user aggregates.
24. API keeps User away from Content Admin operations.
25. API never exposes draft Scenario Versions to User.
26. API applies Pattern B to active and completed plans by exact Scenario Version identity.
27. API returns Pattern B warning signal when Pattern B applies.
28. API does not add new MVP roles, states, entities or task-manager constructs.

## XXIII. Forbidden API Patterns

Forbidden API patterns:

- endpoint for arbitrary user steps;
- endpoint for task priority;
- endpoint for due date or reminder;
- endpoint for assignee or team workflow;
- endpoint for official submission;
- endpoint for document verification;
- endpoint for professional answer;
- endpoint for external authority decision;
- endpoint for user document upload in MVP;
- endpoint for public anonymous content read in MVP;
- endpoint for Content Admin to read Action Plans;
- endpoint for Content Admin to read User Notes;
- endpoint for Content Admin to read user aggregates;
- endpoint for User to publish content;
- endpoint for User to write Content Model;
- endpoint for role self-escalation;
- endpoint for login/signup/password reset in TS08;
- endpoint that mutates published Scenario Version content in place;
- endpoint that reopens completed Action Plan;
- endpoint that hides, archives or deletes Action Plan in MVP;
- endpoint that changes History Events after creation;
- endpoint that treats Checked Source Mark as verification.

## XXIV. Risks

### R-01. API scope drift into implementation

Risk: TS08 or later work may absorb physical storage, access policy or application implementation decisions.

Mitigation: TS08 explicitly defers physical enforcement and implementation details to implementation planning or later implementation specs.

### R-02. Pattern B implemented too broadly

Risk: User with plan for one Scenario Version may gain access to another deprecated/superseded version of same stable Scenario.

Mitigation: Pattern B checks exact Scenario Version identity.

### R-03. Pattern B excludes completed plans

Risk: completed plans lose historical context.

Mitigation: DR-02 and TS07 require active and completed plans.

### R-04. Completed plan becomes writable

Risk: Progress or UOQ changes after completion rewrite historical meaning.

Mitigation: Progress and UOQ writes are forbidden in completed plans; User Note edit is forbidden; only User Note hide/delete remains allowed.

### R-05. User Note privacy leaks

Risk: hidden/deleted User Note text remains exposed in history responses.

Mitigation: normal reads return redacted placeholders and lifecycle state, not text.

### R-06. Content Admin access expands

Risk: admin dashboard asks for affected user count or user examples.

Mitigation: Content Admin API has no User-Owned Data or aggregate endpoints.

### R-07. Task manager drift

Risk: API adds deadlines, priorities or arbitrary tasks for convenience.

Mitigation: forbidden API patterns explicitly ban task-manager constructs.

### R-08. Official status drift

Risk: API error or status language implies official submission, approval or verification.

Mitigation: error contract and boundary fields prohibit official-status vocabulary.

### R-09. Auth flow confusion

Risk: API spec becomes auth product spec.

Mitigation: TS08 only defines token contract and 401 semantics; auth flows are outside scope.

### R-10. Idempotency not honored

Risk: parallel plan creation or repeated source mark creates duplicates.

Mitigation: DR-01 and DR-03 are API contract requirements.

## XXV. Decisions Deferred To Implementation

The following decisions remain outside TS08 and must not be solved in this document:

- physical representation of persisted structures and constraints;
- row-level access policy syntax;
- physical enforcement mechanism choices;
- database change order implementation;
- draft Scenario Version deletion implementation;
- physical implementation of User Note hide/delete;
- physical retention model for hidden/deleted User Notes;
- exact provider-specific JWT claim names;
- exact role assignment bootstrap;
- exact application server framework;
- exact serialization format;
- exact generated types;
- exact client data fetching library;
- runtime topology;
- operational telemetry;
- product usage metrics;
- realtime infrastructure.

The following product/API questions are closed by TS08:

- pagination strategy: cursor pagination;
- optimistic response strategy: mutation returns changed resource and created History Event when applicable;
- history update strategy: polling/refetch for MVP, realtime deferred;
- routing strategy: resource-oriented route contract in sections XII–XIX;
- auth endpoint question: login/signup/password reset endpoints are outside API inventory;
- Pattern B response: explicit flag and warning signal;
- Hidden User Note in History: redacted placeholder, no hidden/deleted text;
- Checked Source Mark uniqueness: unique per Action Plan and Source Revision with idempotent create;
- completed plan Notes/UOQ mutability: DR-07 and DR-08 applied.

## XXVI. Acceptance Criteria

TS08 is acceptable if:

- document is clearly an API Contract Specification;
- document avoids database definition/query language, row-level policy syntax, physical storage structures, database-side automation details and database change scripts;
- document avoids provider-specific snippets, application server snippets, client UI snippets, generated type definitions, component framework details and request handler internals;
- document avoids runtime platform details, operational telemetry, product usage metrics and asynchronous user messaging;
- document introduces no new roles, entities or states;
- DR-01–DR-09 are reflected and not reopened;
- TS05 Amendments 01–06 are respected and not reimplemented as physical access/storage details;
- TS07 MVP Decisions 01–08 are reflected and not reopened;
- Pattern B includes active and completed plans;
- Pattern B checks exact Scenario Version identity;
- Action Plan creation is idempotent;
- Checked Source Mark creation is idempotent and not plan-creating;
- completed plan restrictions follow DR-07 and DR-08;
- Content Admin has no User-Owned Data access;
- User has no Content Admin operation access;
- History Events are append-only and have no update/delete API;
- API does not turn Nova Agent into task manager;
- API carries enough boundary signals for UI-01;
- user content read API does not create user-owned state;
- Content Admin API covers TS06 operations without user aggregates;
- User-owned API covers TS07 operations without new lifecycle states;
- decisions deferred to implementation are clearly separated from API decisions;
- active plan and changelog are updated after TS08 creation.
