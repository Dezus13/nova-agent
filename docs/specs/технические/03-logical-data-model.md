# Technical Spec 03: Logical Data Model

## Назначение документа

Документ фиксирует Logical Data Model Nova Agent перед переходом к физической модели хранения.

Logical Data Model описывает:

- логические сущности MVP;
- identity сущностей;
- versioned identity и versioned content context;
- связи между сущностями;
- правила cardinality;
- правила immutability;
- правила historical context;
- границы lifecycle;
- запреты, которые нельзя нарушать в следующих technical specs.

Документ не описывает Supabase, SQL, таблицы, RLS, API, UI, код, physical table names, индексы, миграции, storage, framework-specific implementation или concrete persistence details.

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

- группы logical entities;
- root entities;
- content model entities;
- versioned content context;
- user-owned entities;
- supporting entities;
- правила logical identity;
- правила logical relationships;
- logical cardinality;
- immutability and mutability;
- historical context;
- границы deletion and replacement;
- решения, которые должны быть приняты до физической модели хранения.

Не входит в документ:

- реализация Supabase;
- SQL;
- таблицы;
- RLS;
- API;
- UI;
- код;
- physical table names;
- индексы;
- миграции;
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
- какие lifecycle-границы нельзя нарушать при дальнейшей реализации.

Logical Data Model не выбирает физический способ хранения данных.

## Чем Logical Data Model отличается от Physical Schema

Logical Data Model описывает смысл и правила данных.

Physical Schema описывает способ реализации этих правил в конкретной инфраструктуре хранения.

В этом документе запрещено принимать решения о:

- физической структуры persistence;
- реализации запросов;
- access policies;
- индексов;
- миграций;
- storage buckets;
- framework models;
- generated types;
- API contracts.

Следующие technical specs должны использовать Logical Data Model как источник истины и не должны менять её продуктовые инварианты.

## Группы сущностей

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

Scenario Version ссылается на Source Revision.

Checked Source Mark ссылается на Source Revision.

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

Action Plan принадлежит User.

Action Plan хранит stable Scenario identity.

Action Plan хранит Scenario Version.

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

Progress принадлежит Action Plan.

Progress ссылается на Versioned Step Context.

Progress is current state.

Progress не является official external status.

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

History Event принадлежит Action Plan.

History Event хранит Scenario Version context.

History Event хранит event type.

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

User Open Question принадлежит Action Plan.

User Open Question хранит Scenario Version context.

User Open Question may reference Versioned Template Open Question Context.

User Open Question may reference:

- Versioned Step Context;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context;
- Progress context, если вопрос объясняет внешнюю зависимость.

User Open Question никогда не ссылается на live Template Open Question.

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

User Note принадлежит User.

User Note принадлежит Action Plan.

User Note ссылается на History Event.

User Note не создаёт обязательный цикл History Event <-> User Note.

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

Checked Source Mark принадлежит Action Plan.

Checked Source Mark хранит Scenario Version context.

Checked Source Mark ссылается на Source Revision.

Checked Source Mark ссылается на History Event.

Checked Source Mark не обновляет Source.

Checked Source Mark не подтверждает source validity.

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

Cardinality rules, зафиксированные для MVP:

- один Scenario может иметь много Scenario Versions;
- одна Scenario Version принадлежит одной stable Scenario identity;
- одна Life Situation может ссылаться на много Scenarios;
- один Scenario может ссылаться на много Life Situations;
- одна Scenario Version может содержать много Versioned Step Contexts;
- одна Scenario Version может содержать много Versioned Document Requirement Contexts;
- одна Scenario Version может содержать много Versioned Data Requirement Contexts;
- одна Scenario Version может содержать много Versioned Source Contexts;
- одна Scenario Version может содержать много Versioned Template Open Question Contexts;
- один Source может иметь много Source Revisions;
- одна Source Revision принадлежит одному Source;
- один User может иметь много Action Plans;
- один Action Plan принадлежит одному User;
- один Action Plan принадлежит одной Scenario Version;
- один Action Plan хранит одну stable Scenario identity;
- один Action Plan сохраняет один selected Life Situation context;
- one active Action Plan per User per stable Scenario identity;
- один Action Plan может иметь много Progress records;
- один Progress принадлежит одному Action Plan;
- один Progress ссылается на один Versioned Step Context;
- один Action Plan может иметь много History Events;
- один History Event принадлежит одному Action Plan;
- один History Event имеет один History Event Type;
- один Action Plan может иметь много User Open Questions;
- один User Open Question принадлежит одному Action Plan;
- один Action Plan может иметь много User Notes;
- один User Note принадлежит одному Action Plan;
- один User Note ссылается на один History Event;
- один Action Plan может иметь много Checked Source Marks;
- один Checked Source Mark принадлежит одному Action Plan;
- один Checked Source Mark ссылается на один Source Revision.

Cardinality, не зафиксированная в этом документе:

- может ли один History Event иметь несколько User Notes;
- может ли один User Note ссылаться на дополнительный workflow context кроме History Event и Action Plan;
- существует ли initial Progress для каждого Versioned Step Context при создании Action Plan;
- может ли после completed Action Plan следовать другой Action Plan для той же stable Scenario identity;
- может ли User Open Question возвращаться из `irrelevant` в active state.

## Immutability And Mutability

Immutable после публикации:

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

Append-only по смыслу:

- History Event.

Mutable в рамках lifecycle rules:

- draft Content Model entities before publication;
- live Scenario metadata before new publication;
- Source through new Source Revision;
- Action Plan current lifecycle state;
- Progress current state;
- User Open Question current state;
- User Note в рамках утверждённого MVP lifecycle, если edit/hide/delete сохраняет контекст History Event и не разрушает historical meaning;
- Checked Source Mark только через lifecycle rules, которые не меняют Source validity.

Content update должен создавать новый versioned context, а не мутировать historical context, используемый active или completed user workflow.

## Historical Context Rules

Historical context должен сохраняться для:

- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

Action Plan сохраняет Scenario Version и selected Life Situation context.

Progress сохраняет смысл через Action Plan и Versioned Step Context.

History Event сохраняет Scenario Version, event type и минимальный affected context.

User Open Question сохраняет Scenario Version и optional versioned content context.

User Note сохраняет context через History Event и Action Plan.

Checked Source Mark сохраняет Scenario Version и Source Revision.

Обновление Content Model не должно:

- автоматически мигрировать active Action Plan;
- менять Progress;
- переписывать History Event;
- удалять User Open Question;
- редактировать User Note;
- менять смысл Checked Source Mark;
- скрывать, что user действовал в рамках более старой Scenario Version.

## Lifecycle Boundaries

Утверждённые states Action Plan для MVP:

- `active`;
- `completed`.

Не утверждены как MVP states Action Plan:

- `archived`;
- `hidden`;
- `deleted_by_user`;
- `reopened`;
- `restored`.

Утверждённые statuses Progress:

- `not_started`;
- `in_progress`;
- `awaiting_external_response`;
- `completed`;
- `requires_check`.

Утверждённые statuses User Open Question:

- `open`;
- `requires_check`;
- `awaiting_external_response`;
- `clarified_by_user`;
- `irrelevant`.

Checked Source Mark не имеет official verification status.

Утверждённые lifecycle states User Note для MVP:

- `created`;
- `edited_by_user`;
- `hidden_by_user`;
- `deleted_by_user`.

`hidden_by_user` и `deleted_by_user` являются пользовательскими lifecycle states только если они не уничтожают historical context.

Физическая реализация delete/hide откладывается до Supabase, RLS и privacy spec.

## Правила удаления и замены

Логическое удаление или замена никогда не должны удалять historical context, необходимый active или completed user workflow.

Published Scenario Version нельзя удалить, если от неё зависит Action Plan, History Event, User Open Question, User Note, Progress или Checked Source Mark.

Source Revision, на которую ссылается Scenario Version или Checked Source Mark, нельзя удалять способом, который разрушает historical context.

Template Open Question может быть заменён в новой Scenario Version, но существующие User Open Questions остаются связанными со своим исходным versioned context.

Document Requirement и Data Requirement после публикации можно менять только через новый versioned context.

User-owned entities нельзя удалять способом, который переписывает смысл History Event.

## Решения перед Supabase Schema

Перед работой над physical schema проект должен решить:

- создаются ли initial Progress records при создании Action Plan или только при первом изменении статуса;
- может ли completed Action Plan быть reopened;
- может ли completed Action Plan быть archived;
- может ли Action Plan быть hidden;
- может ли Action Plan иметь user-visible deletion;
- может ли hidden или archived Action Plan быть restored;
- может ли пользователь создать новый Action Plan после завершения предыдущего для того же stable Scenario identity;
- может ли Progress вернуться в `not_started`;
- точный минимальный payload History Event для каждого MVP event type;
- всегда ли каждый state transition создаёт History Event;
- физическое представление lifecycle редактирования User Note без потери контекста History Event;
- физическое представление hide/delete lifecycle User Note без разрушения historical context;
- может ли один History Event иметь несколько User Notes;
- максимальный допустимый размер User Note;
- может ли User Open Question переходить из `irrelevant` обратно в active states;
- точные пользовательские действия, которые меняют состояние User Open Question;
- может ли Checked Source Mark когда-либо быть plan-creating stateful action;
- точное представление selected Life Situation context;
- точное представление ссылок на versioned content context.

Эти решения не должны менять инварианты Technical Specs 01-03.

## Отложено до Technical Spec 04

Technical Spec 04 может определить перевод в physical persistence после принятия этой логической модели.

До Technical Spec 04 отложены:

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

Technical Spec 04 не должен вводить новые продуктовые сущности или менять logical cardinality без обновления этого документа.

## Отложено до Technical Spec 05

Technical Spec 05 может определить application, interaction или presentation rules после принятия решений по logical и physical data.

До Technical Spec 05 отложены:

- how users see older Scenario Versions;
- how users see that an Action Plan is based on a previous Scenario Version;
- how content admins review affected links before publishing;
- how warnings and boundaries are presented;
- how user actions trigger logical entity creation;
- how validation messages explain forbidden actions;
- how historical context is displayed without rewriting it;
- how UI prevents task-manager and official-status interpretations.

Technical Spec 05 не должен менять logical ownership, identity, historical context или cardinality rules.

## Предварительная карта связей

Логическая карта:

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

Эта карта является логической и не определяет физическую структуру.

## Риски неправильной Logical Data Model

Главные риски:

- Action Plan ссылается на live Scenario вместо Scenario Version.
- User-owned entities ссылаются на mutable live content.
- Обновление Source меняет смысл Checked Source Mark.
- Scenario Version остаётся изменяемой после публикации.
- History Event становится источником current state.
- Progress вычисляется из истории вместо хранения current state.
- User Note и History Event образуют обязательный цикл.
- User Open Question ссылается на live Template Open Question.
- User Note становится Source, документом, дневником или хранилищем данных.
- Document Requirement становится загруженным пользовательским документом.
- Data Requirement становится заполненным пользовательским значением.
- Checked Source Mark становится официальной проверкой источника.
- Action Plan превращается в task manager.
- Content admin может изменять user-owned workflow.
- Уникальность one active plan применяется per Scenario Version и создаёт дублирующиеся active plans после новой публикации.

## Критерии приёмки

Technical Spec 03 готов, если:

- Logical Data Model определена как логическая, а не physical schema;
- Root Entities перечислены;
- Content Model Entities перечислены;
- Versioned Content Context определён;
- User-Owned Entities перечислены;
- Supporting Entities перечислены;
- правило one active Action Plan зафиксировано per User per stable Scenario identity;
- Source Revision выбран как MVP-модель historical context источников;
- Scenario Version ссылается на Source Revision;
- Checked Source Mark ссылается на Source Revision;
- правила Action Plan определены;
- правила Progress определены;
- правила History Event определены;
- правила User Open Question определены;
- правила User Note определены;
- правила Checked Source Mark определены;
- Identity Rules определены;
- Versioned Identity Rules определены;
- Mandatory Relationships перечислены;
- Forbidden Relationships перечислены;
- Cardinality Rules перечислены;
- Immutability And Mutability определены;
- Historical Context Rules определены;
- Decisions Before Supabase Schema перечислены;
- Deferred To Technical Spec 04 перечислены;
- Deferred To Technical Spec 05 перечислены;
- документ не описывает SQL, RLS, API, UI, код, physical table names, индексы, миграции или storage.
