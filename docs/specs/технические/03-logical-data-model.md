# Technical Spec 03: Logical Data Model

## Назначение документа

Документ фиксирует Logical Data Model Nova Agent перед переходом к физической модели хранения.

Logical Data Model описывает:

- логические сущности MVP;
- identity сущностей;
- versioned identity и versioned content context;
- relationships между сущностями;
- cardinality rules;
- immutability rules;
- historical context rules;
- lifecycle boundaries;
- запреты, которые нельзя нарушать в следующих technical specs.

Документ не описывает Supabase, SQL, таблицы, RLS, API, UI, код, physical table names, indexes, migrations, storage, framework-specific implementation или concrete persistence details.

## Источники и приоритет документов

Technical Spec 03 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/технические/02-user-owned-workflow-model.md`
6. `docs/specs/функции/01-жизненные-ситуации.md`
7. `docs/specs/функции/02-сценарии-действий.md`
8. `docs/specs/функции/03-шаги.md`
9. `docs/specs/функции/04-документы-и-данные.md`
10. `docs/specs/функции/05-источники-информации.md`
11. `docs/specs/функции/06-прогресс.md`
12. `docs/specs/функции/07-история-действий.md`
13. `docs/specs/функции/08-администрирование-контента.md`
14. `docs/specs/функции/09-план-действий.md`
15. `docs/specs/функции/10-открытые-вопросы.md`
16. `docs/specs/функции/11-пользовательские-заметки.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 03 не создаёт новые продуктовые функции. Он переводит утверждённые functional specs и technical specs 01-02 в логическую модель сущностей.

## Границы документа

Входит в документ:

- logical entity groups;
- root entities;
- content model entities;
- versioned content context;
- user-owned entities;
- supporting entities;
- logical identity rules;
- logical relationship rules;
- logical cardinality;
- immutability and mutability;
- historical context;
- deletion and replacement boundaries;
- решения, которые должны быть приняты до физической модели хранения.

Не входит в документ:

- Supabase implementation;
- SQL;
- таблицы;
- RLS;
- API;
- UI;
- код;
- physical table names;
- indexes;
- migrations;
- storage;
- auth implementation;
- route contracts;
- rendering rules;
- seed data;
- deployment decisions.

## Что такое Logical Data Model

Logical Data Model — это технологически нейтральное описание данных Nova Agent.

Она отвечает на вопросы:

- какие сущности существуют в MVP;
- какие сущности являются root;
- какие сущности принадлежат Content Model;
- какие сущности принадлежат User-Owned Workflow Model;
- какие сущности являются supporting;
- какие сущности имеют самостоятельную identity;
- какие сущности имеют versioned identity или versioned context;
- какие связи обязательны;
- какие связи запрещены;
- какие cardinality уже являются продуктовым инвариантом;
- какие lifecycle boundaries нельзя нарушать при дальнейшей реализации.

Logical Data Model не выбирает физический способ хранения данных.

## Чем Logical Data Model отличается от Physical Schema

Logical Data Model описывает смысл и правила данных.

Physical Schema описывает способ реализации этих правил в конкретной инфраструктуре хранения.

В этом документе запрещено принимать решения о:

- physical persistence structure;
- query implementation;
- access policies;
- indexes;
- migrations;
- storage buckets;
- framework models;
- generated types;
- API contracts.

Следующие technical specs должны использовать Logical Data Model как источник истины и не должны менять её продуктовые инварианты.

## Entity Groups

MVP-сущности делятся на пять групп:

- Root Entities;
- Content Model Entities;
- Versioned Content Context;
- User-Owned Entities;
- Supporting Entities.

Сущность может входить в несколько групп, если она выполняет разные логические роли.

Например:

- Life Situation является Root Entity и Content Model Entity;
- Scenario Version является Root Entity, Content Model Entity и Versioned Content Context boundary;
- Action Plan является Root Entity и User-Owned Entity.

## Root Entities

Root Entities:

- User;
- Life Situation;
- Scenario;
- Scenario Version;
- Action Plan.

Root Entity — сущность, вокруг которой строится самостоятельная область модели.

Root Entity должна иметь stable logical identity.

Root Entity не обязательно является верхним объектом хранения в будущей реализации.

## Content Model Entities

К Content Model Entities относятся:

- Life Situation;
- Scenario;
- Scenario Version;
- Step;
- Document Requirement;
- Data Requirement;
- Source;
- Source Revision;
- Template Open Question;
- Warning;
- Restriction;
- Applicability Condition.

Content Model Entities описывают утверждённую справочную, организационную и навигационную структуру Nova Agent.

Content Model Entities управляются администратором контента.

Content Model Entities не хранят:

- пользовательский прогресс;
- пользовательскую историю;
- User Notes;
- User Open Questions;
- Checked Source Marks;
- пользовательские документы;
- заполненные персональные значения;
- официальные ответы внешних сторон.

## Versioned Content Context

Versioned Content Context — опубликованный контекст Scenario Version, на который ссылаются user-owned entities.

К Versioned Content Context относятся:

- Scenario Version Content Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Versioned Template Open Question Context;
- published Warning context;
- published Restriction context;
- published Applicability Condition context;
- Step order inside Scenario Version;
- Step dependency context inside Scenario Version;
- Life Situation context selected for Action Plan.

Versioned Content Context нужен, чтобы активный или завершённый Action Plan оставался понятным после обновления Content Model.

User-owned entities не должны ссылаться на mutable live content, если смысл пользовательского состояния зависит от контента.

## User-Owned Entities

К User-Owned Entities относятся:

- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

User-Owned Entities возникают из действий пользователя.

User-Owned Entities принадлежат пользовательскому workflow и существуют поверх конкретной Scenario Version.

User-Owned Entities не являются частью Content Model и не управляются администратором контента.

User-Owned Entities не получают content-version сами по себе, но должны сохранять Scenario Version context и, когда нужно, versioned content context.

## Supporting Entities

К Supporting Entities относятся:

- Life Situation Scenario Link;
- Scenario Version Content Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Versioned Template Open Question Context;
- History Event Type;
- Progress Status;
- User Open Question Status.

Supporting Entities не должны создавать новые продуктовые направления.

Supporting Entities существуют для сохранения связей, классификаций, состояний и исторического контекста.

## MVP Entity List

Минимальный список MVP-сущностей для первой Logical Data Model:

- User;
- Life Situation;
- Scenario;
- Scenario Version;
- Step;
- Document Requirement;
- Data Requirement;
- Source;
- Source Revision;
- Template Open Question;
- Warning;
- Restriction;
- Applicability Condition;
- Life Situation Scenario Link;
- Scenario Version Content Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Versioned Template Open Question Context;
- Action Plan;
- Progress;
- Progress Status;
- History Event;
- History Event Type;
- User Open Question;
- User Open Question Status;
- User Note;
- Checked Source Mark.

Content Admin Actor не является MVP logical data entity в этом документе.

Content Admin Actor является external actor/role concern для будущего Auth/Roles spec.

В Technical Spec 03 Content Admin Actor может упоминаться только как внешний actor, но не как Root Entity, Content Model Entity, User-Owned Entity или Supporting Entity.

## Root Entity Rules

User является root для user-owned workflow.

Life Situation является root для пользовательского входного контекста.

Scenario является stable content identity для повторно используемого пути.

Scenario Version является root для published immutable content context.

Action Plan является root user-owned workflow.

Action Plan создаётся только после stateful action и не создаётся от простого просмотра Scenario Version.

## Content Entity Rules

Life Situation должна быть связана хотя бы с одним Scenario или явно отнесена к будущему этапу.

Scenario должен быть связан хотя бы с одной Life Situation.

Scenario содержит логический путь: цель, применимость, ограничения, предупреждения, шаги, документы, данные, источники и Template Open Questions.

Step не существует как самостоятельный пользовательский путь вне Scenario.

Document Requirement не является пользовательским документом.

Data Requirement не является заполненным пользовательским значением.

Source не является пользовательской заметкой, пользовательской проверкой или официальным подтверждением актуальности.

Template Open Question не является User Open Question.

Warning, Restriction и Applicability Condition являются content context, а не решением о конкретном пользователе.

## Source Revision Decision

Для MVP принимается решение: исторический контекст источников фиксируется через Source Revision.

Source Revision является Content Model Entity и Versioned Content Context element.

Scenario Version links to Source Revision.

Checked Source Mark references Source Revision.

Source Revision нужен, чтобы:

- сохранить, какой Source context был опубликован в Scenario Version;
- сохранить, какой Source context пользователь отметил как checked;
- не менять смысл Checked Source Mark после обновления Source;
- не превращать Checked Source Mark в изменение Source;
- не делать Nova Agent подтверждением актуальности Source.

Source Snapshot как основная MVP-модель не используется.

Допустимо хранить минимальный published Source context внутри Scenario Version только как производный контекст Source Revision, если это потребуется в следующей spec, но source-of-context для MVP остаётся Source Revision.

## Scenario Version Rules

Scenario Version является центральной границей между Content Model и User-Owned Entities.

Scenario Version принадлежит одному stable Scenario identity.

Scenario Version фиксирует published content context:

- steps;
- step order;
- step dependencies;
- Document Requirements;
- Data Requirements;
- Source Revisions;
- Template Open Questions;
- Warnings;
- Restrictions;
- Applicability Conditions;
- relevant Life Situation context, если он влияет на Action Plan.

Published Scenario Version является immutable.

Published Scenario Version никогда не мутируется.

Если опубликованный content нужно изменить, создаётся новая Scenario Version или новая revision связанного контентного элемента, сохраняющая historical context.

Нельзя заменять дочерний элемент внутри уже опубликованной Scenario Version.

## Action Plan Rules

Action Plan является root user-owned workflow.

Action Plan belongs to User.

Action Plan stores stable Scenario identity.

Action Plan stores Scenario Version.

Action Plan preserves selected Life Situation context.

Action Plan не ссылается только на live Scenario.

Stable Scenario identity используется для группировки, uniqueness и списка пользовательских планов.

Смысловой и исторический контекст Action Plan всегда берётся через Scenario Version.

Обновление Content Model не меняет Action Plan автоматически.

Активный Action Plan не переходит на новую Scenario Version автоматически.

## One Active Plan Rule

Для MVP принимается решение: one active Action Plan per user per stable Scenario identity.

Правило применяется не per Scenario Version.

Следствие:

- один User не может иметь два active Action Plans для одного stable Scenario identity;
- публикация новой Scenario Version не создаёт пользователю новый active Action Plan;
- active Action Plan остаётся связанным с исходной Scenario Version;
- создание нового active Action Plan по тому же stable Scenario identity возможно только после отдельного решения о повторном прохождении, archive, hide, delete или reopen.

Это правило не утверждает поведение повторного прохождения completed Action Plan.

## Progress Rules

Progress belongs to Action Plan.

Progress references Versioned Step Context.

Progress is current state.

Progress is not official external status.

Progress не является History Event.

Progress не хранится в Scenario, Step или Content Model.

Progress может иметь только утверждённые MVP statuses:

- `not_started`;
- `in_progress`;
- `awaiting_external_response`;
- `completed`;
- `requires_check`.

History Event может фиксировать изменение Progress, но не является источником текущего Progress.

Initial Progress strategy остаётся решением перед физической моделью хранения:

- создавать Progress states при создании Action Plan;
- или создавать Progress только при первом изменении состояния.

## History Event Rules

History Event belongs to Action Plan.

History Event stores Scenario Version context.

History Event stores event type.

History Event is historical record, not current state.

History Event is append-only by meaning.

History Event не переписывается после обновления Content Model.

History Event не пересчитывает Progress.

History Event не является официальным журналом взаимодействия с органом, учреждением или специалистом.

History Event payload должен быть минимальным и достаточным для восстановления смысла события.

Минимальный logical event type set для MVP:

- `action_plan_created`;
- `action_plan_completed`;
- `progress_status_changed`;
- `source_checked`;
- `user_open_question_created`;
- `user_open_question_status_changed`;
- `user_open_question_edited`;
- `user_note_created`;
- `user_note_edited`;
- `user_note_hidden`;
- `user_note_deleted`.

Event types для Action Plan archive, Action Plan hidden, Action Plan delete, restore или reopen не утверждаются, пока не утверждены соответствующие lifecycle decisions.

User Note hidden/delete event types допустимы только в рамках User Note lifecycle и не должны уничтожать historical context.

## User Open Question Rules

User Open Question belongs to Action Plan.

User Open Question stores Scenario Version context.

User Open Question may reference Versioned Template Open Question Context.

User Open Question may reference:

- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Progress context, если вопрос объясняет внешнюю зависимость.

User Open Question never references live Template Open Question.

User Open Question не ссылается на mutable live Step, Document Requirement, Data Requirement или Source.

User Open Question не является консультацией, ответом, официальным решением, Source, User Note или Progress.

User Open Question может иметь только утверждённые MVP statuses:

- `open`;
- `requires_check`;
- `awaiting_external_response`;
- `clarified_by_user`;
- `irrelevant`.

Возврат из `irrelevant` в активное состояние не утверждён и должен быть решён до физической модели хранения, если он нужен MVP.

## User Note Rules

User Note belongs to User.

User Note belongs to Action Plan.

User Note references History Event.

User Note does not create mandatory cycle History Event <-> User Note.

History Event не обязан иметь обязательную обратную ссылку на User Note.

User Note получает Scenario Version context через History Event и Action Plan.

User Note не является:

- Source;
- Document Requirement;
- Data Requirement;
- User Open Question;
- History Event;
- консультацией;
- официальным фактом;
- дневником;
- хранилищем данных;
- пользовательским документом.

Создание User Note создаёт History Event.

User Note lifecycle в MVP допускает:

- `created`;
- `edited_by_user`;
- `hidden_by_user` или `deleted_by_user` как пользовательское действие, если это не уничтожает historical context.

Создание, редактирование, скрытие или удаление User Note должно сохранять связь с History Event.

Создание, редактирование, скрытие или удаление User Note должно фиксироваться как History Event.

Logical Data Model не выбирает физическую реализацию delete/hide.

Физический способ удаления или скрытия остаётся для Supabase, RLS и privacy spec.

User Note lifecycle не должен уничтожать исходный historical context.

## Checked Source Mark Rules

Checked Source Mark belongs to Action Plan.

Checked Source Mark stores Scenario Version context.

Checked Source Mark references Source Revision.

Checked Source Mark references History Event.

Checked Source Mark does not update Source.

Checked Source Mark does not confirm source validity.

Checked Source Mark не является:

- Source;
- Source Revision;
- official verification;
- automatic check;
- proof that external content is current;
- evidence of external action.

Checked Source Mark не получает statuses:

- `verified`;
- `valid`;
- `accepted`;
- `up_to_date`;
- `officially_confirmed`.

Checked Source Mark создаётся только внутри существующего Action Plan, если отдельное решение не утвердит его как plan-creating stateful action.

## Identity Rules

Каждая MVP-сущность должна иметь logical identity, если на неё могут ссылаться другие сущности или если она участвует в historical context.

Stable logical identity required:

- User;
- Life Situation;
- Scenario;
- Scenario Version;
- Step;
- Document Requirement;
- Data Requirement;
- Source;
- Source Revision;
- Template Open Question;
- Warning;
- Restriction;
- Applicability Condition;
- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

Supporting identities required:

- Life Situation Scenario Link;
- Scenario Version Content Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Versioned Template Open Question Context.

Logical identity не определяет physical identifier format.

## Versioned Identity Rules

Scenario Version имеет самостоятельную versioned identity.

Source Revision имеет самостоятельную versioned identity.

Versioned Step Context, Versioned Document Requirement Context, Versioned Data Requirement Context, Versioned Source Context и Versioned Template Open Question Context должны иметь identity, достаточную для ссылок из user-owned entities.

Для MVP допустима модель, где versioned content context наследует immutable context Scenario Version, если следующая spec сможет сохранить точную ссылку на published context.

Запрещено моделировать user-owned state через ссылку только на mutable live content identity.

User-Owned Entities не получают content-version, но обязаны ссылаться на Scenario Version и versioned content context, если их смысл зависит от контента.

## Mandatory Relationships

Обязательные logical relationships:

Content definition relationships:

- Life Situation <-> Scenario через Life Situation Scenario Link;
- Scenario -> Scenario Version;
- Step -> stable Scenario identity;
- Document Requirement -> stable Scenario identity, если requirement относится ко всему Scenario;
- Document Requirement -> stable Step identity, если requirement относится к конкретному Step;
- Data Requirement -> stable Scenario identity, если requirement относится ко всему Scenario;
- Data Requirement -> stable Step identity, если requirement относится к конкретному Step;
- Source -> Source Revision;
- Template Open Question -> stable Scenario identity, если question относится ко всему Scenario;
- Template Open Question -> stable Step identity, если question относится к Step;
- Template Open Question -> stable Document Requirement identity, если question относится к Document Requirement;
- Template Open Question -> stable Data Requirement identity, если question относится к Data Requirement;
- Template Open Question -> stable Source identity, если question относится к Source.

Versioned context relationships:

- Scenario Version -> Scenario Version Content Context;
- Scenario Version -> Versioned Step Context;
- Scenario Version -> Versioned Document Requirement Context;
- Scenario Version -> Versioned Data Requirement Context;
- Scenario Version -> Versioned Source Context;
- Scenario Version -> Versioned Template Open Question Context;
- Scenario Version -> Source Revision через Versioned Source Context;
- Versioned Step Context -> stable Step identity;
- Versioned Document Requirement Context -> stable Document Requirement identity;
- Versioned Data Requirement Context -> stable Data Requirement identity;
- Versioned Source Context -> Source Revision;
- Versioned Template Open Question Context -> stable Template Open Question identity.

User-owned workflow relationships:

- Action Plan -> User;
- Action Plan -> stable Scenario identity;
- Action Plan -> Scenario Version;
- Action Plan -> selected Life Situation context;
- Progress -> Action Plan;
- Progress -> Versioned Step Context;
- History Event -> Action Plan;
- History Event -> Scenario Version;
- History Event -> History Event Type;
- User Open Question -> Action Plan;
- User Open Question -> Scenario Version;
- User Note -> User;
- User Note -> Action Plan;
- User Note -> History Event;
- Checked Source Mark -> Action Plan;
- Checked Source Mark -> Scenario Version;
- Checked Source Mark -> Source Revision;
- Checked Source Mark -> History Event.

Optional contextual links:

- Progress -> User Open Question, если question объясняет external dependency;
- User Open Question -> Versioned Template Open Question Context, если создан на основе template question;
- User Open Question -> Versioned Step Context, если связан с шагом;
- User Open Question -> Versioned Document Requirement Context, если связан с document requirement;
- User Open Question -> Versioned Data Requirement Context, если связан с data requirement;
- User Open Question -> Versioned Source Context, если связан с source context;
- History Event -> Versioned Step Context, если event связан с шагом;
- History Event -> Source Revision, если event связан с source check;
- User Note -> User Open Question context через связанный History Event, если note относится к question;
- User Note -> Checked Source Mark context через связанный History Event, если note относится к source check;
- User Note -> Progress context через связанный History Event, если note относится к progress change.

В live Content Model сущность может быть связана со stable content identity.

В published Scenario Version пользовательский и исторический смысл всегда должен идти через versioned context.

Нельзя оставлять альтернативную связь там, где для Logical Data Model нужны отдельные content definition, versioned context или optional contextual relationships.

## Forbidden Relationships

Запрещённые logical relationships:

- user-owned entity -> mutable live content without Scenario Version context;
- Action Plan -> live Scenario only;
- Progress -> live Step only;
- User Open Question -> live Template Open Question;
- User Open Question -> mutable live Step without Scenario Version context;
- User Open Question -> mutable live Document Requirement without Scenario Version context;
- User Open Question -> mutable live Data Requirement without Scenario Version context;
- User Open Question -> mutable live Source without Scenario Version context;
- Checked Source Mark -> Source mutation;
- Checked Source Mark -> source validity confirmation;
- User Note -> Source as source of truth;
- User Note -> Document Requirement as user document;
- mandatory History Event <-> User Note cycle;
- History Event -> current state authority;
- Progress -> official external status;
- Template Open Question -> User-Owned Data;
- external Content Admin Actor mutating user-owned workflow.

## Cardinality Rules

Cardinality rules fixed for MVP:

- one Scenario can have many Scenario Versions;
- one Scenario Version belongs to one stable Scenario identity;
- one Life Situation can link to many Scenarios;
- one Scenario can link to many Life Situations;
- one Scenario Version can contain many Versioned Step Contexts;
- one Scenario Version can contain many Versioned Document Requirement Contexts;
- one Scenario Version can contain many Versioned Data Requirement Contexts;
- one Scenario Version can contain many Versioned Source Contexts;
- one Scenario Version can contain many Versioned Template Open Question Contexts;
- one Source can have many Source Revisions;
- one Source Revision belongs to one Source;
- one User can have many Action Plans;
- one Action Plan belongs to one User;
- one Action Plan belongs to one Scenario Version;
- one Action Plan stores one stable Scenario identity;
- one Action Plan preserves one selected Life Situation context;
- one active Action Plan per User per stable Scenario identity;
- one Action Plan can have many Progress records;
- one Progress belongs to one Action Plan;
- one Progress references one Versioned Step Context;
- one Action Plan can have many History Events;
- one History Event belongs to one Action Plan;
- one History Event has one History Event Type;
- one Action Plan can have many User Open Questions;
- one User Open Question belongs to one Action Plan;
- one Action Plan can have many User Notes;
- one User Note belongs to one Action Plan;
- one User Note references one History Event;
- one Action Plan can have many Checked Source Marks;
- one Checked Source Mark belongs to one Action Plan;
- one Checked Source Mark references one Source Revision.

Cardinality not fixed in this document:

- whether one History Event can have multiple User Notes;
- whether one User Note can reference additional workflow context besides History Event and Action Plan;
- whether initial Progress exists for every Versioned Step Context at Action Plan creation;
- whether completed Action Plan can be followed by another Action Plan for same stable Scenario identity;
- whether User Open Question can return from `irrelevant` to an active state.

## Immutability And Mutability

Immutable after publication:

- Scenario Version;
- Scenario Version Content Context;
- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Versioned Template Open Question Context;
- Source Revision referenced by a published Scenario Version;
- published Warning context;
- published Restriction context;
- published Applicability Condition context.

Append-only by meaning:

- History Event.

Mutable within lifecycle rules:

- draft Content Model entities before publication;
- live Scenario metadata before new publication;
- Source through new Source Revision;
- Action Plan current lifecycle state;
- Progress current state;
- User Open Question current state;
- User Note within approved MVP lifecycle, if edit/hide/delete preserves History Event context and does not destroy historical meaning;
- Checked Source Mark only through lifecycle rules that do not change Source validity.

Content update must create new versioned context, not mutate historical context used by active or completed user workflow.

## Historical Context Rules

Historical context must be preserved for:

- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

Action Plan preserves Scenario Version and selected Life Situation context.

Progress preserves meaning through Action Plan and Versioned Step Context.

History Event preserves Scenario Version, event type and minimal affected context.

User Open Question preserves Scenario Version and optional versioned content context.

User Note preserves context through History Event and Action Plan.

Checked Source Mark preserves Scenario Version and Source Revision.

Updating Content Model must not:

- migrate active Action Plan automatically;
- change Progress;
- rewrite History Event;
- delete User Open Question;
- edit User Note;
- change Checked Source Mark meaning;
- hide that user acted under an older Scenario Version.

## Lifecycle Boundaries

Approved Action Plan states for MVP:

- `active`;
- `completed`.

Not approved as MVP Action Plan states:

- `archived`;
- `hidden`;
- `deleted_by_user`;
- `reopened`;
- `restored`.

Approved Progress statuses:

- `not_started`;
- `in_progress`;
- `awaiting_external_response`;
- `completed`;
- `requires_check`.

Approved User Open Question statuses:

- `open`;
- `requires_check`;
- `awaiting_external_response`;
- `clarified_by_user`;
- `irrelevant`.

Checked Source Mark has no official verification status.

Approved User Note lifecycle states for MVP:

- `created`;
- `edited_by_user`;
- `hidden_by_user`;
- `deleted_by_user`.

`hidden_by_user` и `deleted_by_user` являются пользовательскими lifecycle states только если они не уничтожают historical context.

Physical delete/hide implementation is deferred to Supabase, RLS and privacy spec.

## Deletion And Replacement Rules

Logical deletion or replacement must never remove historical context required by active or completed user workflow.

Published Scenario Version cannot be deleted if an Action Plan, History Event, User Open Question, User Note, Progress or Checked Source Mark depends on it.

Source Revision referenced by Scenario Version or Checked Source Mark cannot be removed in a way that breaks historical context.

Template Open Question can be replaced in a new Scenario Version, but existing User Open Questions remain linked to their original versioned context.

Document Requirement and Data Requirement can be changed only through new versioned context after publication.

User-owned entities cannot be deleted in a way that rewrites History Event meaning.

## Decisions Before Supabase Schema

Before physical schema work, the project must decide:

- whether initial Progress records are created at Action Plan creation or only on first status change;
- whether completed Action Plan can be reopened;
- whether completed Action Plan can be archived;
- whether Action Plan can be hidden;
- whether Action Plan can have user-visible deletion;
- whether hidden or archived Action Plan can be restored;
- whether a user can create a new Action Plan after completing a previous one for the same stable Scenario identity;
- whether Progress can reset to `not_started`;
- exact minimal History Event payload for every MVP event type;
- whether every state transition always creates History Event;
- physical representation of User Note edit lifecycle without losing History Event context;
- physical representation of User Note hide/delete lifecycle without destroying historical context;
- whether one History Event can have multiple User Notes;
- maximum allowed size of User Note;
- whether User Open Question can transition from `irrelevant` back to active states;
- exact user actions that change User Open Question state;
- whether Checked Source Mark can ever be plan-creating stateful action;
- exact representation of selected Life Situation context;
- exact representation of versioned content context references.

These decisions must not change the invariants of Technical Specs 01-03.

## Deferred To Technical Spec 04

Technical Spec 04 may define physical persistence translation after this logical model is accepted.

Deferred to Technical Spec 04:

- physical representation of logical entities;
- physical representation of relationships;
- physical representation of enum-like statuses;
- physical constraints for mandatory relationships;
- physical uniqueness enforcement for one active Action Plan per User per stable Scenario identity;
- physical protection of immutable published context;
- physical protection of append-only History Events;
- access and ownership enforcement;
- migration strategy from drafts to persisted model;
- seed or fixture strategy if needed.

Technical Spec 04 must not introduce new product entities or change logical cardinality without updating this document.

## Deferred To Technical Spec 05

Technical Spec 05 may define application, interaction or presentation rules after logical and physical data decisions are accepted.

Deferred to Technical Spec 05:

- how users see older Scenario Versions;
- how users see that an Action Plan is based on a previous Scenario Version;
- how content admins review affected links before publishing;
- how warnings and boundaries are presented;
- how user actions trigger logical entity creation;
- how validation messages explain forbidden actions;
- how historical context is displayed without rewriting it;
- how UI prevents task-manager and official-status interpretations.

Technical Spec 05 must not change logical ownership, identity, historical context or cardinality rules.

## Preliminary Relationship Map

Logical map:

```text
User
  -> Action Plan
      -> stable Scenario identity
      -> Scenario Version
      -> selected Life Situation context
      -> Progress
          -> Versioned Step Context
      -> History Event
          -> History Event Type
      -> User Open Question
          -> optional Versioned Template Open Question Context
          -> optional Versioned Step / Document / Data / Source Context
      -> User Note
          -> History Event
      -> Checked Source Mark
          -> Source Revision
          -> History Event

Life Situation
  <-> Life Situation Scenario Link
  <-> Scenario
      -> Scenario Version
          -> Scenario Version Content Context
          -> Versioned Step Context
          -> Versioned Document Requirement Context
          -> Versioned Data Requirement Context
          -> Versioned Source Context
              -> Source Revision
                  -> Source
          -> Versioned Template Open Question Context
          -> Warning / Restriction / Applicability Condition context
```

This map is logical and does not define physical structure.

## Risks Of Incorrect Logical Data Model

Main risks:

- Action Plan links to live Scenario instead of Scenario Version.
- User-owned entities link to mutable live content.
- Source update changes meaning of Checked Source Mark.
- Scenario Version is mutable after publication.
- History Event becomes current state source.
- Progress is derived from history instead of storing current state.
- User Note and History Event form mandatory cycle.
- User Open Question links to live Template Open Question.
- User Note becomes Source, document, diary or data storage.
- Document Requirement becomes uploaded user document.
- Data Requirement becomes filled user value.
- Checked Source Mark becomes official source validation.
- Action Plan becomes task manager.
- Content admin can mutate user-owned workflow.
- One active plan uniqueness is applied per Scenario Version and creates duplicated active plans after new publication.

## Acceptance Criteria

Technical Spec 03 is ready if:

- Logical Data Model is defined as logical, not physical schema;
- Root Entities are listed;
- Content Model Entities are listed;
- Versioned Content Context is defined;
- User-Owned Entities are listed;
- Supporting Entities are listed;
- one active Action Plan rule is fixed per User per stable Scenario identity;
- Source Revision is selected as MVP source historical context model;
- Scenario Version links to Source Revision;
- Checked Source Mark references Source Revision;
- Action Plan rules are defined;
- Progress rules are defined;
- History Event rules are defined;
- User Open Question rules are defined;
- User Note rules are defined;
- Checked Source Mark rules are defined;
- Identity Rules are defined;
- Versioned Identity Rules are defined;
- Mandatory Relationships are listed;
- Forbidden Relationships are listed;
- Cardinality Rules are listed;
- Immutability And Mutability are defined;
- Historical Context Rules are defined;
- Decisions Before Supabase Schema are listed;
- Deferred To Technical Spec 04 is listed;
- Deferred To Technical Spec 05 is listed;
- document does not describe SQL, RLS, API, UI, code, physical table names, indexes, migrations or storage.
