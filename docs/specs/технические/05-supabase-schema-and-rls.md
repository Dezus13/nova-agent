# Technical Spec 05: Supabase Schema & RLS

## Назначение документа

Документ фиксирует первый черновик физической модели хранения и границ доступа Nova Agent для Supabase.

Цель документа — перевести Technical Specs 01-04 в спецификацию Supabase Schema & RLS на уровне:

- групп физических таблиц;
- физических таблиц;
- модели enum;
- модели foreign key;
- модели unique constraints;
- правил immutability;
- правил append-only;
- модели RLS roles;
- RLS-границ для User и Content Admin;
- концептуального плана индексов;
- порядка миграций.

Документ не содержит SQL-код, синтаксис RLS policies, migration code, API routes, UI, frontend code, backend code или реализацию запросов.

## Источники и приоритет документов

Technical Spec 05 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/технические/02-user-owned-workflow-model.md`
6. `docs/specs/технические/03-logical-data-model.md`
7. `docs/specs/технические/04-auth-roles-and-ownership.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 05 не создаёт новые продуктовые функции. Он задаёт физическую модель хранения и RLS-границы для уже утверждённых MVP-сущностей и инвариантов.

## Границы документа

Входит в документ:

- группы физических таблиц;
- таблицы Content Model;
- таблицы Versioned Content Context;
- таблицы User-Owned Data;
- таблицы roles and ownership;
- модель enum;
- модель foreign key;
- модель unique constraints;
- правила immutability и append-only;
- концептуальные RLS boundaries;
- концептуальный план индексов;
- порядок миграций;
- решения, которые должны быть закрыты перед написанием SQL.

Не входит в документ:

- SQL statements;
- синтаксис RLS policies;
- migration code;
- API routes;
- UI;
- frontend code;
- backend code;
- storage buckets;
- загрузка файлов;
- generated types;
- детали query optimization;
- seed data;
- детали реализации auth provider.

## Решения, унаследованные из TS01-TS04

Следующие решения не пересматриваются в Technical Spec 05:

- Action Plan всегда связан с конкретной Scenario Version.
- Published Scenario Version является immutable.
- Active Action Plan не обновляется автоматически после публикации новой Scenario Version.
- User-Owned Data не является частью Content Model.
- Content Admin не управляет User-Owned Data.
- User-Owned Data не ссылается напрямую на mutable live content как источник исторического смысла.
- Action Plan является root user-owned workflow.
- Progress является current state, а не History Event.
- History Event является append-only historical record, а не current state.
- User Note не является Source, документом, вопросом, дневником или хранилищем данных.
- User Open Question не является консультацией, ответом или официальным решением.
- Checked Source Mark не подтверждает актуальность Source.
- One active Action Plan per user per stable Scenario identity.
- Source Revision используется как MVP-модель исторического контекста источников.
- Scenario Version links to Source Revision.
- Checked Source Mark ссылается на Source Revision.
- MVP roles: `user` and `content_admin`.
- Один account может иметь роли `user` и `content_admin`.
- Действия выполняются в role context.
- Content Admin не имеет права чтения User-Owned Data по умолчанию.
- Content Admin не имеет права записи в User-Owned Data.
- User не может записывать Content Model.
- Published content доступен authenticated users.
- Public-read не входит в MVP.

## Группы физических таблиц

Физические таблицы MVP делятся на группы:

- Role And Ownership Tables;
- Content Model Tables;
- Versioned Content Context Tables;
- User-Owned Data Tables;
- Supporting Event And Audit Tables.

Разделение групп нужно для того, чтобы RLS-границы не смешивали Content Model и User-Owned Data.

## Таблицы, которые не создаются

В MVP не создаются отдельные таблицы для:

- пользовательских документов;
- загруженных файлов;
- сканов;
- официальной переписки;
- заполненных персональных значений;
- внешних ответов;
- профессиональных заключений;
- произвольных задач;
- подзадач вне Scenario Version;
- reminders;
- due dates;
- assignments;
- support tickets;
- moderation queues;
- specialist accounts;
- authority accounts;
- organization accounts;
- подтверждений актуальности Source;
- public anonymous access sessions.

`Content Admin Actor` не становится отдельной таблицей product entity. Доступ администратора моделируется через account role assignment.

`External Actor` не становится MVP role или таблицей authenticated account. Он может быть описан только как content context внутри Source, Template Open Question или связанных content fields.

## Role And Ownership Tables

### `app_users`

Назначение: профиль пользователя на уровне приложения и ownership anchor для User-Owned Data.

Правила:

- представляет authenticated account внутри application schema;
- владеет Action Plans и User Notes через user-owned relationships;
- сам по себе не даёт права записи в Content Model;
- не представляет Content Admin как product content entity.

### `account_roles`

Назначение: физическое представление MVP roles для authenticated accounts.

Разрешённые roles:

- `user`;
- `content_admin`.

Правила:

- один account может иметь обе роли;
- role assignment не должен быть user-editable;
- role assignment не должен меняться через действия User-Owned Data;
- role assignment не должен меняться через редактирование draft Content Model;
- self-escalation до `content_admin` запрещён.

### `content_publication_events`

Назначение: supporting technical audit для admin publishing actions.

Фиксируемые события:

- scenario_version_published;
- scenario_version_deprecated;
- scenario_version_superseded.

Conceptual payload (минимальный обязательный):

- event identifier — уникальный идентификатор записи;
- event_type — тип admin action из утверждённого enum;
- admin_actor_id — кто выполнил action (FK → app_users);
- scenario_version_id — какая Scenario Version затронута (FK → scenario_versions);
- scenario_id — stable Scenario identity (FK → scenarios, для индексации);
- previous_publication_state — publication_state до action;
- new_publication_state — publication_state после action;
- successor_version_id — версия-преемник для supersede events (nullable FK → scenario_versions; NULL для publish и deprecate);
- created_at — timestamp выполнения action.

Правила:

- эта таблица фиксирует действия администратора контента, а не пользовательские History Events;
- она не должна содержать User-Owned Data;
- она не должна давать Content Admin доступ к User-Owned Data;
- она не должна мутировать published Scenario Version rows;
- admin_actor_id должен принадлежать account с ролью content_admin;
- successor_version_id обязателен только для scenario_version_superseded; для остальных событий — NULL;
- previous_publication_state должен соответствовать фактическому publication_state до transition.

Что нельзя хранить:

- идентификаторы Action Plans или Users;
- счётчики Action Plans на затронутой версии;
- Progress, History Event или любые User-Owned Data;
- персональные данные пользователей.

Точные требования к retention остаются решением перед написанием SQL.

## Content Model Tables

### `life_situations`

Представляет stable identity для Life Situation.

Правила:

- таблица Content Model;
- доступна authenticated users для чтения как published content, когда связана с published Scenario Version context;
- доступна для записи только роли `content_admin` в draft/content management context.

### `scenarios`

Представляет stable identity для Scenario.

Правила:

- stable Scenario identity используется Action Plan для группировки и uniqueness;
- Scenario не является источником historical user context;
- user-owned entities не должны зависеть только от mutable live Scenario.

### `life_situation_scenario_links`

Представляет stable content definition relationship между Life Situation и Scenario.

Правила:

- связь Content Model;
- может использоваться для построения published Scenario Version context;
- сама по себе не определяет selected Life Situation context для Action Plan.

### `scenario_versions`

Представляет draft, published, deprecated или superseded Scenario Version.

Правила:

- published rows являются immutable;
- publish/deprecate/supersede являются отдельными admin actions;
- publishing action не мигрирует active Action Plans автоматически;
- user-owned workflow должен ссылаться на Scenario Version, а не только на live Scenario;
- published content доступен для чтения authenticated users;
- public-read находится вне MVP;
- publication_state может изменяться только по утверждённому Publication State Transition Graph;
- self-transition publication_state запрещён;
- superseded является финальным состоянием Scenario Version.

### `steps`

Представляет stable identity для Step в Content Model.

Правила:

- доступна для записи только Content Admin до публикации или через новый versioned context;
- не является user-owned;
- не является единственным прямым контекстом для Progress.

### `document_requirements`

Представляет stable identity для Document Requirement.

Правила:

- описывает requirement, а не пользовательский документ;
- не хранит загруженные файлы;
- user-owned entities должны использовать versioned context, когда historical meaning зависит от requirement.

### `data_requirements`

Представляет stable identity для Data Requirement.

Правила:

- описывает required information, а не заполненные пользовательские значения;
- не хранит personal values;
- user-owned entities должны использовать versioned context, когда historical meaning зависит от requirement.

### `sources`

Представляет stable identity для Source.

Правила:

- Source относится к Content Model;
- Source не является Checked Source Mark;
- Source не обновляется пользовательским действием;
- historical source meaning сохраняется через Source Revision.

### `source_revisions`

Представляет versioned Source context.

Правила:

- один Source может иметь много Source Revisions;
- Scenario Version links to Source Revision через Versioned Source Context;
- Checked Source Mark ссылается на Source Revision;
- Source Revision, на которую ссылается published Scenario Version или Checked Source Mark, нельзя удалять способом, который разрушает historical context;
- Source Revision, не referenced ни одной published Scenario Version и ни одним Checked Source Mark, является mutable до первого publication reference;
- после первого reference published Scenario Version или Checked Source Mark — immutable;
- любое изменение published Source Revision требует создания новой Source Revision;
- editorial правки допустимы только для Source Revisions, не referenced ни одной published Scenario Version или Checked Source Mark.

### `template_open_questions`

Представляет Template Open Question в Content Model.

Правила:

- не является User Open Question;
- доступен для записи только Content Admin в content context;
- user-created questions не должны ссылаться на live Template Open Question как historical context.

### `warnings`

Представляет content warnings.

Правила:

- warning context, использованный published Scenario Version, должен быть immutable после публикации;
- Warning row, referenced by any published scenario_version_warning_context, является immutable;
- изменение Warning после первого published использования требует создания нового Warning entity;
- draft Warning, не referenced ни одной published Scenario Version, остаётся mutable;
- Warning не имеет отдельного revision layer; новый Warning entity является самостоятельным объектом с новым identity;
- warning ничего не решает о конкретном user.

### `restrictions`

Представляет content restrictions.

Правила:

- restriction context, использованный published Scenario Version, должен быть immutable после публикации;
- Restriction row, referenced by any published scenario_version_restriction_context, является immutable;
- изменение Restriction после первого published использования требует создания нового Restriction entity;
- draft Restriction, не referenced ни одной published Scenario Version, остаётся mutable;
- Restriction не имеет отдельного revision layer; новый Restriction entity является самостоятельным объектом с новым identity;
- restriction не становится user-specific official decision.

### `applicability_conditions`

Представляет content applicability conditions.

Правила:

- applicability condition, использованный published Scenario Version, должен быть immutable после публикации;
- Applicability Condition row, referenced by any published scenario_version_applicability_condition_context, является immutable;
- изменение Applicability Condition после первого published использования требует создания нового Applicability Condition entity;
- draft Applicability Condition, не referenced ни одной published Scenario Version, остаётся mutable;
- Applicability Condition не имеет отдельного revision layer; новый entity является самостоятельным объектом с новым identity;
- он не хранит user-filled eligibility values.

## Publication State Transition Rules

publication_state Scenario Version может изменяться только по следующему утверждённому графу переходов.

Разрешённые переходы:

- draft → published;
- published → deprecated;
- published → superseded;
- deprecated → superseded.

Запрещённые переходы:

- published → draft;
- deprecated → draft;
- deprecated → published;
- superseded → published;
- superseded → deprecated;
- superseded → draft;
- draft → deprecated;
- draft → superseded;
- любой self-transition (same state → same state).

superseded является финальным состоянием. Переход из superseded в любое другое состояние запрещён.

Физическое удаление draft Scenario Version является отдельной admin операцией и не относится к transition graph. Правила удаления — в разделе Draft Scenario Version Deletion.

Enforcement: переход publication_state должен быть защищён на database level. Механизм enforcement (trigger или check constraint) определяется при написании SQL.

## Draft Scenario Version Deletion

Физическое удаление Scenario Version допустимо только для publication_state = 'draft'.

Удаление draft является отдельной admin операцией, не относящейся к Publication State Transition Graph.

При удалении draft Scenario Version удаляются (cascade):

- scenario_version_life_situation_contexts для этого draft;
- scenario_version_step_contexts для этого draft;
- scenario_version_step_dependencies для этого draft;
- scenario_version_document_requirement_contexts для этого draft;
- scenario_version_data_requirement_contexts для этого draft;
- scenario_version_source_contexts для этого draft;
- scenario_version_template_open_question_contexts для этого draft;
- scenario_version_warning_contexts для этого draft;
- scenario_version_restriction_contexts для этого draft;
- scenario_version_applicability_condition_contexts для этого draft.

При удалении draft Scenario Version не удаляются:

- steps, document_requirements, data_requirements, sources, source_revisions, template_open_questions, warnings, restrictions, applicability_conditions, life_situations, scenarios.

Эти сущности имеют stable identity и не принадлежат одному draft. Удаляются только versioned context link rows.

Физическое удаление Scenario Version с publication_state != 'draft' запрещено, если от неё зависят Action Plans, Progress, History Events, User Open Questions, User Notes или Checked Source Marks. Это правило сохраняет historical context активных и завершённых планов.

Точный механизм физического удаления draft Scenario Version (cascade delete или explicit multi-step delete) остаётся решением перед написанием SQL.

## Versioned Content Context Tables

Таблицы Versioned Content Context сохраняют точный published context, используемый Action Plans, Progress, History Events, User Open Questions, User Notes и Checked Source Marks.

### `scenario_version_life_situation_contexts`

Представляет Life Situation context, доступный внутри Scenario Version.

Правила:

- Action Plan сохраняет selected Life Situation context через эту таблицу или эквивалентную immutable context reference;
- selected Life Situation context не должен пересчитываться из mutable live links.

### `scenario_version_step_contexts`

Представляет Step context внутри Scenario Version.

Правила:

- Progress ссылается на этот context;
- initial Progress records создаются для каждой строки этой таблицы внутри выбранной Scenario Version;
- context является immutable после публикации Scenario Version.

### `scenario_version_step_dependencies`

Представляет published step order и dependency context внутри Scenario Version.

Правила:

- не создаёт task-manager dependencies;
- не допускает произвольные user-created steps;
- является immutable после публикации Scenario Version.

### `scenario_version_document_requirement_contexts`

Представляет Document Requirement context внутри Scenario Version.

Правила:

- не хранит пользовательские документы;
- User Open Question может ссылаться на этот context;
- является immutable после публикации Scenario Version.

### `scenario_version_data_requirement_contexts`

Представляет Data Requirement context внутри Scenario Version.

Правила:

- не хранит filled personal values;
- User Open Question может ссылаться на этот context;
- является immutable после публикации Scenario Version.

### `scenario_version_source_contexts`

Представляет Source Revision context внутри Scenario Version.

Правила:

- links Scenario Version to Source Revision;
- User Open Question может ссылаться на этот context;
- Checked Source Mark ссылается на Source Revision и сохраняет контекст Scenario Version;
- является immutable после публикации Scenario Version.

### `scenario_version_template_open_question_contexts`

Представляет Template Open Question context внутри Scenario Version.

Правила:

- User Open Question, созданный на основе template context, ссылается на эту таблицу;
- User Open Question никогда не ссылается на live Template Open Question как historical context;
- является immutable после публикации Scenario Version.

### `scenario_version_warning_contexts`

Представляет Warning context внутри Scenario Version.

### `scenario_version_restriction_contexts`

Представляет Restriction context внутри Scenario Version.

### `scenario_version_applicability_condition_contexts`

Представляет Applicability Condition context внутри Scenario Version.

## User-Owned Data Tables

### `action_plans`

Представляет root user-owned workflow.

Обязательные связи:

- User;
- stable Scenario identity;
- Scenario Version;
- selected Life Situation context.

Правила:

- создаётся только первым stateful action;
- просмотр Scenario Version не создаёт Action Plan;
- status ограничен MVP states Action Plan;
- one active Action Plan per user per stable Scenario identity;
- Action Plan не ссылается только на live Scenario;
- content update не меняет Action Plan автоматически;
- Action Plan может быть создан только для Scenario Version с publication_state = 'published';
- создание Action Plan для deprecated или superseded Scenario Version запрещено.

Initial Progress Strategy:

- при создании Action Plan создаются Progress records для всех Versioned Step Context records внутри Scenario Version;
- initial status — `not_started`;
- History Event не создаётся для каждого initial `not_started` record, если этот record не является отдельным пользовательским действием;
- создание Action Plan создаёт событие создания Action Plan, а не per-step progress events.

### `progress_records`

Представляет current Progress state для Step внутри Action Plan.

Обязательные связи:

- Action Plan;
- Versioned Step Context.

Правила:

- Progress unique by Action Plan and Versioned Step Context;
- status должен быть одним из утверждённых Progress statuses;
- Progress является current state;
- Progress не является History Event;
- Progress не является official external status;
- каждое user-driven изменение Progress status создаёт History Event.

### `history_events`

Представляет append-only historical record внутри Action Plan.

Минимальный payload:

- `event_type`;
- `action_plan_id`;
- `scenario_version_id`;
- `actor_user_id`;
- `affected_entity_type`;
- `affected_entity_id`;
- `previous_value`;
- `new_value`;
- `short_context_label`;
- `created_at`.

Правила payload:

- `previous_value` и `new_value` должны быть короткими структурными значениями, а не free text storage;
- payload не должен хранить файлы, документы, переписку или лишние персональные данные;
- payload не должен хранить official answers или professional conclusions;
- payload не должен становиться источником current state;
- History Event является append-only по смыслу;
- Content Admin не может переписывать user-owned History Events.

### `user_open_questions`

Представляет User Open Question внутри Action Plan.

Обязательные связи:

- Action Plan;
- Scenario Version.

Опциональные связи с versioned context:

- Versioned Template Open Question Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Progress context, if it explains external dependency.

Правила:

- никогда не ссылается на live Template Open Question как historical context;
- никогда не хранит professional answer или official decision;
- status должен быть одним из утверждённых User Open Question statuses;
- изменения state создают History Event.

### `user_notes`

Представляет короткую user-owned note, связанную с History Event.

Обязательные связи:

- User;
- Action Plan;
- History Event.

Правила cardinality:

- один History Event может иметь несколько User Notes;
- каждая User Note принадлежит одному User, одному Action Plan и одному History Event;
- User Note должна ссылаться на History Event из того же Action Plan;
- обязательного обратного цикла History Event -> User Note нет.

Правила lifecycle:

- User может создавать, редактировать, скрывать и удалять собственные User Notes;
- физическая реализация soft delete, hard delete, hide и restore здесь не финализируется;
- hide/delete не должны разрушать контекст History Event;
- действия edit/hide/delete создают History Event.

Privacy-правила:

- User Note является privacy-sensitive;
- User Note должна оставаться коротким supporting context;
- User Note не должна становиться документом, source, open question, дневником или хранилищем данных.

### `checked_source_marks`

Представляет user-owned mark о том, что Source Revision был проверен внутри Action Plan.

Обязательные связи:

- Action Plan;
- Scenario Version;
- Source Revision;
- History Event.

Правила:

- Checked Source Mark не обновляет Source;
- Checked Source Mark не подтверждает Source validity;
- Checked Source Mark не означает, что Nova Agent проверил Source;
- Checked Source Mark не имеет статусов `verified`, `valid`, `accepted` или `up_to_date`;
- content update не меняет существующий Checked Source Mark.

## Enum Model

Физические enum-like values, необходимые для MVP:

- account role: `user`, `content_admin`;
- publication state Scenario Version: `draft`, `published`, `deprecated`, `superseded`;
- state Action Plan: `active`, `completed`;
- status Progress: `not_started`, `in_progress`, `awaiting_external_response`, `completed`, `requires_check`;
- status User Open Question: `open`, `requires_check`, `awaiting_external_response`, `clarified_by_user`, `irrelevant`;
- lifecycle state User Note: `created`, `edited_by_user`, `hidden_by_user`, `deleted_by_user`;
- type History Event: `action_plan_created`, `action_plan_completed`, `progress_status_changed`, `source_checked`, `user_open_question_created`, `user_open_question_status_changed`, `user_open_question_edited`, `user_note_created`, `user_note_edited`, `user_note_hidden`, `user_note_deleted`;
- affected entity type для History Event: Action Plan, Progress, User Open Question, User Note, Checked Source Mark или versioned content context;
- type content publication event: `scenario_version_published`, `scenario_version_deprecated`, `scenario_version_superseded`.

Не добавлять enum values, которые подразумевают official validation, task management, support workflow или external authority decision.

## Foreign Key Model

Обязательные foreign key relationships:

- account_roles -> app_users;
- content_publication_events -> app_users как admin actor;
- content_publication_events -> scenarios как stable Scenario identity;
- content_publication_events -> scenario_versions как affected version;
- content_publication_events -> scenario_versions как successor version (nullable);
- life_situation_scenario_links -> life_situations;
- life_situation_scenario_links -> scenarios;
- scenario_versions -> scenarios;
- steps -> scenarios;
- document_requirements -> scenarios when the requirement is scenario-wide content definition context;
- document_requirements -> steps when the requirement is step-specific content definition context;
- data_requirements -> scenarios when the requirement is scenario-wide content definition context;
- data_requirements -> steps when the requirement is step-specific content definition context;
- source_revisions -> sources;
- scenario_version_life_situation_contexts -> scenario_versions;
- scenario_version_life_situation_contexts -> life_situations;
- scenario_version_step_contexts -> scenario_versions;
- scenario_version_step_contexts -> steps;
- scenario_version_step_dependencies -> scenario_versions;
- scenario_version_step_dependencies -> scenario_version_step_contexts;
- scenario_version_document_requirement_contexts -> scenario_versions;
- scenario_version_document_requirement_contexts -> document_requirements;
- scenario_version_data_requirement_contexts -> scenario_versions;
- scenario_version_data_requirement_contexts -> data_requirements;
- scenario_version_source_contexts -> scenario_versions;
- scenario_version_source_contexts -> source_revisions;
- scenario_version_template_open_question_contexts -> scenario_versions;
- scenario_version_template_open_question_contexts -> template_open_questions;
- scenario_version_warning_contexts -> scenario_versions;
- scenario_version_warning_contexts -> warnings;
- scenario_version_restriction_contexts -> scenario_versions;
- scenario_version_restriction_contexts -> restrictions;
- scenario_version_applicability_condition_contexts -> scenario_versions;
- scenario_version_applicability_condition_contexts -> applicability_conditions;
- action_plans -> app_users;
- action_plans -> scenarios как stable Scenario identity;
- action_plans -> scenario_versions;
- action_plans -> scenario_version_life_situation_contexts;
- progress_records -> action_plans;
- progress_records -> scenario_version_step_contexts;
- history_events -> action_plans;
- history_events -> scenario_versions;
- history_events -> app_users как actor user;
- user_open_questions -> action_plans;
- user_open_questions -> scenario_versions;
- user_open_questions -> versioned content context tables, если есть optional context;
- user_notes -> app_users;
- user_notes -> action_plans;
- user_notes -> history_events;
- checked_source_marks -> action_plans;
- checked_source_marks -> scenario_versions;
- checked_source_marks -> source_revisions;
- checked_source_marks -> history_events.

Правила cross-table consistency:

- Scenario Version у Action Plan должна принадлежать сохранённой stable Scenario identity.
- Versioned Step Context у Progress должен принадлежать Scenario Version этого Action Plan.
- Versioned context у User Open Question должен принадлежать его Scenario Version.
- History Event у User Note должен принадлежать тому же Action Plan, что и User Note.
- Source Revision у Checked Source Mark должна быть достижима из Scenario Version этого Action Plan через Versioned Source Context.
- History Event у Checked Source Mark должен принадлежать тому же Action Plan.

## Unique Constraint Model

Обязательная уникальность:

- один role assignment на account и role;
- один version identifier Scenario Version на Scenario;
- один identifier Source Revision на Source;
- один Versioned Step Context на Scenario Version и Step context identity;
- один Versioned Document Requirement Context на Scenario Version и Document Requirement context identity;
- один Versioned Data Requirement Context на Scenario Version и Data Requirement context identity;
- один Versioned Source Context на Scenario Version и Source Revision context identity;
- один Versioned Template Open Question Context на Scenario Version и Template Open Question context identity;
- один active Action Plan на User и stable Scenario identity;
- один Progress record на Action Plan и Versioned Step Context;
- один draft Scenario Version на stable Scenario identity (partial unique constraint WHERE publication_state = 'draft').

Ещё нужно решить:

- является ли Checked Source Mark уникальным per Action Plan and Source Revision или повторные source checks создают несколько marks;
- блокирует ли completed Action Plan другой Action Plan для той же stable Scenario identity;
- точную уникальность selected Life Situation context, когда одна Scenario Version доступна через несколько Life Situation links.

## Immutability Rules

Следующие records являются immutable после публикации или после использования в historical context:

- published Scenario Version rows;
- versioned content context rows belonging to a published Scenario Version;
- Source Revision rows referenced by a published Scenario Version;
- Source Revision rows referenced by Checked Source Mark;
- History Event rows after creation;
- content context referenced by Action Plan, Progress, User Open Question, User Note or Checked Source Mark;
- Warning rows referenced by any published scenario_version_warning_context;
- Restriction rows referenced by any published scenario_version_restriction_context;
- Applicability Condition rows referenced by any published scenario_version_applicability_condition_context.

Source Revision rows not yet referenced by any published Scenario Version or Checked Source Mark remain mutable until first publication reference.

Правила replacement:

- published Scenario Version не мутируется;
- замена контента требует новой Scenario Version, новой Source Revision или superseding relationship;
- дочерний контент внутри published Scenario Version не заменяется in place;
- deprecate и supersede меняют publication lifecycle без мутации published historical context;
- Warning, Restriction и Applicability Condition становятся immutable после первого использования в published Scenario Version; изменение требует создания нового entity и новой Scenario Version;
- publication_state Scenario Version не может переходить в состояния, нарушающие утверждённый Publication State Transition Graph; published Scenario Version не возвращается в draft.

## Append-Only Rules

Append-only по смыслу:

- History Event.

Append-like historical behavior:

- Source Revision;
- Scenario Version;
- content publication events.

Правила:

- History Event нельзя редактировать так, чтобы переписать прошлый смысл;
- History Event нельзя удалять как side effect User Note hide/delete;
- User Note edit/hide/delete создаёт дополнительный History Event;
- Content Admin не может переписывать user-owned History Events;
- изменения роли не должны переписывать user-owned History Events;
- content_publication_events rows не изменяются и не удаляются после создания;
- возврат к предыдущему publication_state физически невозможен и не создаёт reverse event в content_publication_events.

## RLS Role Model

RLS должна различать:

- authenticated account;
- `user` role context;
- `content_admin` role context;
- ownership of User-Owned Data;
- published versus draft content.

Правила role model:

- каждый доступ к User-Owned Data должен быть scoped to owning User;
- роль `content_admin` не обходит ownership User-Owned Data;
- роль `user` не даёт права записи в Content Model;
- dual-role accounts не должны смешивать content-admin permissions с personal user workflow permissions;
- public anonymous access находится вне MVP.

## RLS-границы для User

Authenticated User может:

- читать published Content Model;
- читать Scenario Version с publication_state = 'published' без дополнительных ограничений;
- читать Scenario Version с publication_state IN ('deprecated', 'superseded') только если у пользователя существует Action Plan, ссылающийся на эту Scenario Version;
- читать versioned content context опубликованной или исторически доступной Scenario Version;
- читать собственные Action Plans;
- создавать Action Plan через stateful user action;
- обновлять собственный Action Plan в рамках MVP lifecycle;
- читать собственные Progress records;
- обновлять собственный Progress status через утверждённые transitions;
- читать собственные History Events;
- создавать History Events, вызванные утверждёнными user actions;
- читать собственные User Open Questions;
- создавать и обновлять собственные User Open Questions;
- читать собственные User Notes;
- создавать, редактировать, скрывать и удалять собственные User Notes в рамках утверждённого lifecycle;
- читать собственные Checked Source Marks;
- создавать Checked Source Marks внутри собственного Action Plan.

Authenticated User не может:

- записывать Content Model;
- мутировать published Scenario Version;
- обновлять Source или Source Revision;
- создавать Template Open Question как content;
- читать User-Owned Data другого User;
- обновлять User-Owned Data другого User;
- назначать себе `content_admin`;
- создавать произвольные steps или task-manager records;
- создавать public content вне роли Content Admin.

## RLS-границы для Content Admin

Content Admin может:

- читать Content Model;
- создавать и редактировать draft content;
- управлять draft Life Situations, Scenarios, Steps, Document Requirements, Data Requirements, Sources, Source Revisions, Template Open Questions, Warnings, Restrictions и Applicability Conditions;
- создавать draft Scenario Version context;
- публиковать Scenario Version через admin publishing action;
- deprecate или supersede Scenario Version через admin publishing action;
- читать content publication events, необходимые для content audit.

Content Admin не может:

- читать User-Owned Data по умолчанию;
- записывать User-Owned Data;
- создавать Action Plan для User;
- обновлять Progress;
- переписывать History Event;
- создавать, редактировать, закрывать или удалять User Open Question;
- создавать, редактировать, скрывать или удалять User Note;
- создавать или обновлять Checked Source Mark;
- мигрировать active Action Plan на новую Scenario Version;
- мутировать published Scenario Version rows;
- использовать User Notes как source для Content Model;
- использовать User Open Questions как consultation answers;
- выдавать себе roles через редактирование контента.

## Запрещённые RLS-паттерны

Запрещённые паттерны:

- широкие права admin на чтение всех User-Owned Data;
- широкие права admin на запись во все таблицы;
- role check без ownership check для User-Owned Data;
- ownership check без Scenario Version context для user-owned historical data;
- update Content Admin на published Scenario Version rows;
- insert или update User в таблицы Content Model;
- read User-Owned Data только на основе stable Scenario identity;
- связь User Open Question с live Template Open Question;
- связь Progress только с live Step;
- Checked Source Mark обновляет Source или Source Revision;
- delete User Note удаляет контекст History Event;
- role self-escalation через account_roles;
- создание Action Plan для Scenario Version с publication_state != 'published';
- чтение deprecated или superseded Scenario Version пользователем без существующего Action Plan на этой версии;
- физическое удаление Scenario Version с publication_state != 'draft';
- физическое удаление published, deprecated или superseded Scenario Version, если от неё зависят User-Owned Data.

## Conceptual Index Plan

Индексы должны поддерживать:

- чтение published Scenario Versions по Scenario;
- чтение published content, доступного authenticated users;
- чтение versioned content context по Scenario Version;
- поиск Source Revisions, использованных Scenario Version;
- поиск Source Revisions, использованных Checked Source Marks;
- enforcement правила one active Action Plan per User and stable Scenario identity;
- чтение Action Plans по User;
- чтение Progress records по Action Plan;
- enforcement уникальности Progress по Action Plan и Versioned Step Context;
- чтение History Events по Action Plan и `created_at`;
- чтение User Open Questions по Action Plan и status;
- чтение User Notes по Action Plan и History Event;
- чтение Checked Source Marks по Action Plan и Source Revision;
- проверку account roles по account и role;
- чтение content_publication_events по scenario_version_id и created_at;
- проверку существования Action Plan по User и Scenario Version для RLS доступа к deprecated/superseded Scenario Versions.

Индексы не должны использоваться как замена RLS ownership checks.

## Порядок миграций

Будущие миграции должны концептуально идти в таком порядке:

1. Enum-like values и supporting role/status models.
2. Таблицы application user и account roles.
3. Stable Content Model tables.
4. Поддержка Source Revision.
5. Поддержка Scenario Version и publication state.
6. Таблицы Versioned Content Context.
7. Поддержка content publication events.
8. Таблицы User-Owned Data.
9. Foreign key и cross-context consistency constraints.
10. Unique constraints.
11. Защита immutability и append-only.
12. Включение RLS и role/ownership boundaries.
13. Финальная проверка по acceptance criteria TS01-TS05.

Этот порядок является концептуальным и не определяет migration code.

## Решения перед написанием SQL

Перед написанием SQL проект должен решить:

- точную реализацию role assignment bootstrapping;
- является ли роль `user` implicit или явно хранится для каждого authenticated account;
- точное физическое представление role context для dual-role accounts;
- точная retention policy для content_publication_events (период хранения, archival rules);
- точный механизм enforcement immutability Warning, Restriction и Applicability Condition entity rows после publication reference (trigger BEFORE UPDATE или RLS-based check);
- точный механизм enforcement Publication State Transition Rules (trigger BEFORE UPDATE на scenario_versions.publication_state или check constraint);
- точная реализация RLS для deprecated/superseded Scenario Version read access (отдельная policy с условием EXISTS (action_plans) или каскадный доступ через join с versioned context tables);
- точная физическая реализация partial unique constraint для одного draft Scenario Version per stable Scenario identity;
- механизм физического удаления draft Scenario Version (cascade delete или explicit multi-step delete);
- обработка race condition при одновременном удалении draft Scenario Version и попытке публикации;
- точную физическую реализацию User Note hide/delete без разрушения контекста History Event;
- максимальную длину User Note;
- максимальную длину и разрешённые типы значений для `previous_value` и `new_value` History Event;
- nullable rules для `affected_entity_type` и `affected_entity_id` по каждому History Event type;
- является ли Checked Source Mark уникальным per Action Plan and Source Revision;
- создают ли repeated source checks новые History Events без нового Checked Source Mark;
- позволяет ли completed Action Plan создать новый Action Plan для той же stable Scenario identity;
- может ли Progress вернуться в `not_started`;
- может ли User Open Question переходить из `irrelevant` обратно в active states;
- точное представление selected Life Situation context, когда несколько Life Situations связаны с одним Scenario.

## Отложено за пределы TS05

За пределы этой spec отложены:

- public-read content;
- anonymous browsing;
- file storage;
- загруженные пользовательские документы;
- хранение официальной переписки;
- хранение personal values;
- API contract;
- UI rules;
- frontend implementation;
- backend services;
- notifications;
- reminders;
- arbitrary task manager;
- support, moderation или specialist workflows;
- organization accounts;
- analytics across User-Owned Data;
- внешние интеграции.

## Риски

Главные риски:

- Published Scenario Version становится mutable через admin updates.
- Content Admin получает широкий доступ к User-Owned Data.
- Dual-role account допускает утечку User-Owned Data в context `content_admin`.
- User-owned records ссылаются на mutable live content вместо Scenario Version context.
- Initial Progress creation создаёт шумные History Events для каждой строки `not_started`.
- Payload History Event превращается в free-text или personal-data storage.
- User Note hide/delete разрушает historical context.
- Checked Source Mark превращается в source validation.
- Source Revision обходится, из-за чего source history меняется после content update.
- Уникальность one active Action Plan enforced per Scenario Version вместо stable Scenario identity.
- RLS проверяет role, но не ownership.
- Content publication action автоматически мигрирует active Action Plans.
- Warning, Restriction или Applicability Condition мутируется после published использования в отсутствие database-level enforcement.
- Forbidden state transition проходит через application bug в отсутствие database-level protection.
- User теряет read access к deprecated Scenario Version из-за неверной RLS реализации для исторически существующих Action Plans.

## Критерии приёмки

Technical Spec 05 приемлем, если:

- Physical Table Groups определены.
- Tables Not Created перечислены.
- Content Model Tables определены.
- Versioned Content Context Tables определены.
- User-Owned Data Tables определены.
- Role And Ownership Tables определены.
- Enum Model определена.
- Foreign Key Model определена.
- Unique Constraint Model определена.
- Immutability Rules определены.
- Append-Only Rules определены.
- RLS Role Model определена.
- RLS Boundaries For User определены.
- RLS Boundaries For Content Admin определены.
- Forbidden RLS Patterns определены.
- Conceptual Index Plan определён.
- Migration Order определён без migration code.
- Initial Progress Strategy зафиксирована.
- History Event Minimal Payload зафиксирован.
- User Note Cardinality зафиксирована.
- Dual-role Account rules зафиксированы.
- Published Content Read Boundary зафиксирована.
- Admin Publishing Authority зафиксирована.
- Правило one active Action Plan зафиксировано per user and stable Scenario identity.
- Source Revision используется для historical source context.
- Checked Source Mark ссылается на Source Revision и не валидирует Source.
- Content Admin не имеет права чтения по умолчанию или права записи в User-Owned Data.
- User не может записывать Content Model.
- Published Scenario Version rows являются immutable.
- History Events являются append-only по смыслу.
- User Notes hide/delete не разрушает контекст History Event.
- Decisions Required Before Writing SQL перечислены.
- Deferred Beyond TS05 перечислены.
- Publication State Transition Rules определены.
- Draft Scenario Version Deletion правила определены.
- Warning, Restriction и Applicability Condition entity immutability определена.
- Content Publication Events conceptual payload определён.
- Deprecated/superseded Scenario Version access model (два read pattern для User) определена.
- Action Plan creation gate (только для publication_state = 'published') определён.
- Документ не содержит SQL-код, синтаксис RLS policies, migration code, API routes, UI, frontend code или backend code.
