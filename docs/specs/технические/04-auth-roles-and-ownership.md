# Technical Spec 04: Auth, Roles & Ownership

## Назначение документа

Документ фиксирует модель actors, roles, ownership, permissions и privacy boundaries Nova Agent перед переходом к следующей technical spec.

Цель документа:

- определить actor types MVP;
- определить MVP roles;
- отделить actors от roles;
- зафиксировать ownership Content Model и User-Owned Data;
- зафиксировать access rules для User и Content Admin;
- запретить доступные ошибки проектирования перед физической моделью доступа;
- зафиксировать security invariants, которые должны соблюдаться в следующих technical specs.

Документ не выбирает техническую реализацию доступа, хранения, запросов, интерфейса или кода.

## Источники и приоритет документов

Technical Spec 04 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/технические/02-user-owned-workflow-model.md`
6. `docs/specs/технические/03-logical-data-model.md`
7. `docs/specs/функции/08-администрирование-контента.md`
8. `docs/specs/функции/09-план-действий.md`
9. `docs/specs/функции/10-открытые-вопросы.md`
10. `docs/specs/функции/11-пользовательские-заметки.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 04 не создаёт новые продуктовые функции и не расширяет MVP. Он уточняет правила доступа и владения для уже утверждённых сущностей.

## Границы документа

Входит в документ:

- actor types;
- MVP roles;
- roles excluded from MVP;
- definitions of Actor, Role, Ownership and Permission;
- ownership model;
- ownership boundaries;
- privacy boundaries;
- access rules for User;
- access rules for Content Admin;
- forbidden access patterns;
- security invariants;
- role assignment principles;
- content publishing authorization boundaries;
- user-owned data protection rules;
- решения, которые нужно принять до Technical Spec 05.

## Что не входит в документ

В документ не входит:

- Supabase;
- SQL;
- RLS;
- API;
- UI;
- код;
- таблицы;
- индексы;
- migrations;
- storage;
- physical auth provider;
- session model;
- password model;
- token model;
- route contracts;
- concrete access policy syntax;
- implementation of delete, hide or restore;
- support workflow;
- user management console;
- moderation workflow;
- analytics or profiling.

## Термины и определения

### Actor

Actor — участник продуктовой модели или внешняя сторона, которая имеет значение для сценария Nova Agent.

Actor может быть человеком внутри продукта, ролью администрирования или внешней стороной.

Actor не обязательно является ролью доступа в системе.

### Role

Role — набор разрешённых действий внутри Nova Agent.

Role определяет, какие действия может выполнять account в рамках продукта.

Role не должна автоматически давать ownership над данными.

### Ownership

Ownership — логическое владение данными или областью модели.

Ownership отвечает на вопрос, кому принадлежат данные и кто несёт продуктовую границу управления этими данными.

Ownership не равен техническому хранению и не выбирает physical implementation.

### Permission

Permission — разрешённое действие над определённой группой данных или сущностей.

Permission должен быть scoped by role, ownership and entity type.

Permission не должен обходить Scenario Version, Content Model boundaries или User-Owned Data boundaries.

## Actor Types

В Nova Agent существуют следующие actor types:

- User;
- Content Admin;
- External Actors.

## User Actor

User — человек, который живёт в Австрии, переезжает в Австрию или планирует переезд и использует Nova Agent для понимания жизненной или административной ситуации.

User работает с published content, выбирает Scenario Version, создаёт Action Plan через stateful action и управляет собственным user-owned workflow.

User не управляет Content Model.

## Content Admin Actor

Content Admin — actor, который поддерживает продуктовую Content Model.

Content Admin управляет только администрируемым содержанием:

- Life Situations;
- Scenarios;
- Scenario draft content;
- Scenario Versions through publishing boundaries;
- Steps;
- Document Requirements;
- Data Requirements;
- Sources;
- Source Revisions;
- Template Open Questions;
- Warnings;
- Restrictions;
- Applicability Conditions;
- content relationships.

Content Admin не является Root Entity, Content Model Entity, User-Owned Entity или Supporting Entity в Logical Data Model.

Content Admin является actor/role concern.

## External Actors

External Actors — органы, учреждения, специалисты, официальные источники, работодатели, страховые организации и другие внешние стороны, которые могут быть упомянуты в сценариях как место внешней проверки или источник внешнего решения.

External Actors не являются MVP roles в Nova Agent.

External Actors не получают доступ к Nova Agent в MVP.

External Actors не создают и не изменяют User-Owned Data внутри Nova Agent.

## MVP Roles

В MVP существуют только две roles:

- `user`;
- `content_admin`.

`user` даёт доступ к пользовательскому прохождению утверждённых Scenario Versions и собственным User-Owned Data.

`content_admin` даёт доступ к управлению Content Model в рамках утверждённых specs.

Ни одна MVP role не даёт права выполнять действия от имени внешних органов, учреждений или специалистов.

## Roles Excluded From MVP

Следующие roles не входят в MVP:

- `super_admin`;
- `support_agent`;
- `moderator`;
- `specialist`;
- `authority`;
- `organization_admin`;
- `family_member`;
- `trusted_person`;
- `auditor`.

Эти roles запрещено добавлять скрыто через Technical Spec 04.

Добавление любой из этих roles требует отдельной продуктовой спецификации, оценки privacy and responsibility risks, обновления roadmap и активного плана.

## Actor Vs Role

Actor описывает участника продуктовой модели.

Role описывает разрешения внутри Nova Agent.

Один actor type может соответствовать role, если он действует внутри Nova Agent.

External Actor может существовать как контекст сценария без role.

Пример:

- Content Admin является actor type и может иметь role `content_admin`;
- User является actor type и может иметь role `user`;
- specialist может быть External Actor в направлении внешней проверки, но не является MVP role.

## Ownership Model

Nova Agent разделяет ownership на две основные области:

- Content Model;
- User-Owned Data.

Content Model описывает утверждённую справочную, организационную и навигационную структуру продукта.

User-Owned Data описывает пользовательское прохождение конкретной Scenario Version.

Эти области не должны смешиваться.

## Content Model Ownership

Content Model принадлежит продуктовой модели Nova Agent и управляется Content Admin в рамках утверждённых specs.

Content Model включает:

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
- content relationships;
- publication metadata.

Content Model не принадлежит конкретному User.

Content Model не хранит персональный прогресс, историю, пользовательские заметки или пользовательские вопросы.

## User-Owned Data Ownership

User-Owned Data принадлежит конкретному User.

К User-Owned Data относятся:

- Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

User-Owned Data существует поверх конкретной Scenario Version.

User-Owned Data не является частью Content Model.

User-Owned Data не управляется Content Admin.

## Ownership Boundaries

Ownership boundaries:

- Content Admin управляет Content Model, но не user-owned workflow.
- User управляет собственным user-owned workflow, но не Content Model.
- Action Plan always belongs to User.
- Progress belongs to Action Plan and therefore to the owning User.
- History Event belongs to Action Plan and therefore to the owning User.
- User Open Question belongs to Action Plan and therefore to the owning User.
- User Note belongs to User and Action Plan.
- Checked Source Mark belongs to Action Plan and therefore to the owning User.
- Scenario Version is shared content context, not user-owned state.
- Published Scenario Version is immutable.

User-Owned Data может ссылаться на Scenario Version and versioned content context, но эта ссылка не передаёт ownership над Content Model.

Content Admin может обновлять Content Model только через правила версионности, не изменяя User-Owned Data.

## Privacy Boundaries

User-Owned Data может содержать чувствительный пользовательский контекст.

Privacy-sensitive entities:

- Action Plan;
- selected Life Situation context inside Action Plan;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark.

User Note является наиболее рискованной сущностью, потому что содержит свободный пользовательский текст.

User Open Question может раскрывать личную ситуацию пользователя, даже если он не хранит официальный ответ.

History Event должен оставаться минимальным historical record, а не подробным хранилищем персональных данных.

Content Admin не должен использовать User-Owned Data как материал для обновления Content Model.

Additional processing of User-Owned Data for analytics, profiling, support, moderation, search across users, export or shared access requires separate specs.

## Access Rules For User

User can:

- read published Content Model;
- view published Scenario Version without creating Action Plan;
- create Action Plan through stateful action;
- read own Action Plans;
- update own Action Plan lifecycle within approved MVP states;
- create and update own Progress;
- create and update own User Open Questions;
- create, edit, hide and delete own User Notes;
- create own Checked Source Marks inside own Action Plan;
- read own History Events;
- create History Events through approved user actions;
- complete own Action Plan.

User cannot:

- write Content Model;
- publish Scenario Version;
- mutate published Scenario Version;
- update Source or Source Revision;
- create Template Open Question;
- edit another User's Action Plan;
- read another User's User-Owned Data;
- edit another User's Progress;
- edit another User's History Events;
- edit another User's User Open Questions;
- edit another User's User Notes;
- edit another User's Checked Source Marks;
- escalate own role;
- act as Content Admin without assigned `content_admin` role.

User Note edit, hide and delete rights do not choose physical implementation.

User Note hide/delete must not destroy historical context.

## Access Rules For Content Admin

Content Admin can:

- read Content Model;
- create and update content drafts;
- manage Life Situations;
- manage Scenarios before publication;
- manage Steps before publication;
- manage Document Requirements before publication;
- manage Data Requirements before publication;
- manage Sources and Source Revisions;
- manage Template Open Questions;
- manage Warnings;
- manage Restrictions;
- manage Applicability Conditions;
- manage content relationships;
- prepare content for publication;
- publish or supersede content only within approved publishing boundaries.

Content Admin cannot:

- create Action Plan for User;
- read User-Owned Data by default;
- write User-Owned Data;
- change User Progress;
- rewrite History Event;
- create, edit, close or delete User Open Question;
- create, edit, hide or delete User Note;
- create or update Checked Source Mark;
- move active Action Plan to a new Scenario Version;
- use User Note as Source;
- use User Open Question as consultation answer;
- act as specialist, authority or support role;
- make official decisions for User;
- confirm that external requirement is fulfilled for User.

Content Admin has no write access to User-Owned Data.

Content Admin has no default read access to User-Owned Data.

Any future exception to Content Admin read access must require separate privacy, support and security specs before implementation.

## Account With Multiple MVP Roles

Decision for MVP: one account may have both `user` and `content_admin` roles.

Reason:

- Content Admin may also need to use Nova Agent as a normal user.
- Preventing a content admin from using user-facing workflows would create an artificial account split.
- The key security boundary is not account exclusivity, but action-scoped permissions and ownership.

Consequences:

- When account acts as `user`, it can access only its own User-Owned Data.
- When account acts as `content_admin`, it can manage Content Model only.
- `content_admin` role does not grant access to other users' User-Owned Data.
- User-Owned Data created by a dual-role account remains owned by that account as a User, not by Content Admin role.
- Content publishing actions must not be able to mutate the account's own Action Plans.
- Role context must be explicit enough in future specs to prevent accidental privilege mixing.

This decision does not introduce `super_admin`, support, moderation or organization roles.

## Forbidden Access Patterns

Forbidden access patterns:

- User -> Content Model write.
- User -> published Scenario Version mutation.
- User -> another User's User-Owned Data.
- User -> role self-escalation.
- Content Admin -> User-Owned Data write.
- Content Admin -> default User-Owned Data read.
- Content Admin -> User Note as content source.
- Content Admin -> User Open Question as consultation answer.
- Content Admin -> Progress mutation.
- Content Admin -> History Event rewrite.
- Content Admin -> active Action Plan migration.
- Content Admin -> Checked Source Mark mutation.
- External Actor -> authenticated MVP access.
- External Actor -> User-Owned Data access.
- Role -> ownership bypass.
- Permission -> Scenario Version context bypass.
- Any actor -> mutable live content as source of historical user context.

## Security Invariants

Security invariants:

- Content Admin has no write access to User-Owned Data.
- Content Admin has no default read access to User-Owned Data.
- User has no write access to Content Model.
- Published Scenario Version is immutable.
- Role escalation is forbidden.
- User-Owned Data is scoped to owning User.
- User-Owned Data must preserve Scenario Version context.
- User-Owned Data must not reference mutable live content as source of historical meaning.
- User Note is private user-owned workflow context, not Content Model.
- User Open Question is user-owned workflow context, not Template Open Question.
- History Event is append-only by meaning and cannot be rewritten by role changes.
- Checked Source Mark is user-owned mark, not Source validity confirmation.
- External Actors are not MVP roles.
- A dual-role account must not mix user-owned permissions with content-admin permissions.
- Future implementation must enforce ownership checks before any user-owned action.

## Role Assignment Principles

Role assignment principles:

- Every authenticated account with product access may have `user` role.
- `content_admin` role must be assigned through a controlled administrative process defined in a future spec.
- A User cannot grant itself `content_admin`.
- User-owned workflow actions cannot change role assignment.
- Content Model actions cannot change role assignment.
- Role assignment is not part of Content Model.
- Role assignment is not part of User-Owned Workflow Model.
- Role assignment must be auditable in future specs if admin operations become operationally sensitive.
- Removing `content_admin` role must not delete content history.
- Removing `user` access must not rewrite historical user-owned workflow by itself.

This document does not choose how roles are stored or technically enforced.

## Content Publishing Authorization Boundaries

Content publishing is a Content Model action.

Only Content Admin role may be authorized to prepare, publish, deprecate or supersede content within approved specs.

Content publishing must respect:

- published Scenario Version immutability;
- Source Revision historical context;
- Scenario Version links to versioned content context;
- active Action Plan stability;
- no automatic mutation of User-Owned Data.

Publishing a new Scenario Version must not:

- migrate active Action Plans automatically;
- change Progress;
- rewrite History Events;
- edit User Open Questions;
- edit User Notes;
- change Checked Source Marks;
- create user actions on behalf of User.

This document does not define review workflow, approval workflow or publication implementation.

## User-Owned Data Protection Rules

User-Owned Data protection rules:

- User-Owned Data can be created only by the owning User's action or by product behavior explicitly caused by that User action.
- Viewing content does not create User-Owned Data.
- First stateful action creates Action Plan if one does not already exist.
- User-Owned Data cannot be changed by Content Admin.
- Content update cannot change User-Owned Data.
- User-Owned Data must preserve historical context after content update.
- User-Owned Data cannot be used as Content Model source of truth.
- User Note cannot be used as Source, document, consultation, official fact or data store.
- User Open Question cannot be used as professional answer or official decision.
- History Event cannot be deleted or rewritten as a side effect of role changes.
- Checked Source Mark cannot update Source or Source Revision.

User has the right to create, edit, hide and delete own User Notes within the approved lifecycle.

The following decisions are not chosen in this document:

- soft delete;
- hard delete;
- hide implementation;
- restore implementation;
- physical retention model for hidden or deleted User Notes.

Any User Note edit, hide or delete must preserve History Event context and must not rewrite historical meaning.

## External Actor Boundaries

External Actors may be referenced in content as:

- official source;
- institution;
- authority;
- specialist;
- direction for external verification.

External Actors do not:

- authenticate into Nova Agent in MVP;
- create User-Owned Data;
- answer User Open Questions inside Nova Agent;
- confirm Progress;
- validate documents;
- publish content;
- receive access to User Notes or Action Plans.

## Decisions Required Before Technical Spec 05

Before Technical Spec 05, the project must decide:

- exact physical representation of account-role assignment;
- whether `user` role is implicit for every account or explicitly assigned;
- how dual-role account actions are separated by role context;
- whether published content is readable before account creation;
- whether draft content is visible only to Content Admin;
- who can publish Scenario Version among Content Admin accounts;
- who can deprecate or supersede content;
- whether content admin actions require separate review in MVP;
- how role changes preserve historical content and user-owned context;
- exact ownership check rules for every User-Owned Entity;
- exact privacy handling for User Notes and User Open Questions;
- exact handling of User Note hide/delete without losing History Event context;
- whether role assignment changes need an admin action history;
- whether content publishing needs an admin action history;
- how to prevent self-escalation.

## Deferred To Technical Spec 05

Technical Spec 05 may define:

- physical representation of roles;
- physical enforcement of access rules;
- physical enforcement of ownership rules;
- physical representation of account-role relationship;
- physical representation of dual-role account behavior;
- physical representation of content admin actions;
- physical representation of User Note hide/delete;
- physical protection of immutable published content;
- physical protection of append-only History Events;
- physical protection of User-Owned Data from Content Admin access;
- physical prevention of role escalation.

Technical Spec 05 must not weaken the invariants of this document.

## Risks

Main risks:

- Content Admin gets access to User Notes by default.
- Content Admin starts using User-Owned Data as content feedback.
- Content Admin becomes support, moderator or super admin.
- User can write Content Model.
- User can access another user's Action Plan.
- Role assignment allows self-escalation.
- Published Scenario Version becomes mutable through admin permissions.
- Dual-role account mixes Content Admin permissions with personal user workflow.
- User Note hide/delete destroys History Event context.
- User Open Question becomes a consultation answer.
- External Actor becomes hidden MVP role.
- Future implementation grants broad administrative access for convenience.

## Acceptance Criteria

Technical Spec 04 is acceptable if:

- Actor Types are defined: User, Content Admin and External Actors.
- MVP roles are defined: `user` and `content_admin`.
- Excluded roles are listed and explicitly outside MVP.
- Actor, Role, Ownership and Permission are defined separately.
- Content Model ownership is defined.
- User-Owned Data ownership is defined.
- Ownership boundaries are defined.
- Privacy boundaries are defined.
- User access rules are defined.
- Content Admin access rules are defined.
- Content Admin has no write access to User-Owned Data.
- Content Admin has no default read access to User-Owned Data.
- User has no write access to Content Model.
- Published Scenario Version is immutable.
- Role escalation is forbidden.
- Dual-role account decision is documented.
- User Note create/edit/hide/delete rights are documented without choosing physical implementation.
- Forbidden access patterns are listed.
- Security invariants are listed.
- Role Assignment Principles are defined.
- Content Publishing Authorization Boundaries are defined.
- User-Owned Data Protection Rules are defined.
- Decisions Required Before Technical Spec 05 are listed.
- Deferred To Technical Spec 05 is listed.
- Document does not describe forbidden implementation details.
