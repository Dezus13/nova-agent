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

## Границы ownership

Границы ownership:

- Content Admin управляет Content Model, но не user-owned workflow.
- User управляет собственным user-owned workflow, но не Content Model.
- Action Plan всегда принадлежит User.
- Progress принадлежит Action Plan и через него owning User.
- History Event принадлежит Action Plan и через него owning User.
- User Open Question принадлежит Action Plan и через него owning User.
- User Note принадлежит User и Action Plan.
- Checked Source Mark принадлежит Action Plan и через него owning User.
- Scenario Version является общим content context, а не user-owned state.
- Published Scenario Version является immutable.

User-Owned Data может ссылаться на Scenario Version и versioned content context, но эта ссылка не передаёт ownership над Content Model.

Content Admin может обновлять Content Model только через правила версионности, не изменяя User-Owned Data.

## Privacy-границы

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

Дополнительная обработка User-Owned Data для analytics, profiling, support, moderation, поиска по данным разных пользователей, export или shared access требует отдельных specs.

## Правила доступа для User

User может:

- читать published Content Model;
- просматривать published Scenario Version без создания Action Plan;
- создавать Action Plan через stateful action;
- читать собственные Action Plans;
- обновлять lifecycle собственного Action Plan в рамках утверждённых MVP states;
- создавать и обновлять собственный Progress;
- создавать и обновлять собственные User Open Questions;
- создавать, редактировать, скрывать и удалять собственные User Notes;
- создавать собственные Checked Source Marks внутри собственного Action Plan;
- читать собственные History Events;
- создавать History Events через утверждённые пользовательские действия;
- завершать собственный Action Plan.

User не может:

- записывать Content Model;
- публиковать Scenario Version;
- мутировать published Scenario Version;
- обновлять Source или Source Revision;
- создавать Template Open Question;
- редактировать Action Plan другого User;
- читать User-Owned Data другого User;
- редактировать Progress другого User;
- редактировать History Events другого User;
- редактировать User Open Questions другого User;
- редактировать User Notes другого User;
- редактировать Checked Source Marks другого User;
- повышать собственную role;
- действовать как Content Admin без назначенной роли `content_admin`.

Права на edit, hide и delete для User Note не выбирают физическую реализацию.

User Note hide/delete не должны разрушать historical context.

## Правила доступа для Content Admin

Content Admin может:

- читать Content Model;
- создавать и обновлять content drafts;
- управлять Life Situations;
- управлять Scenarios до публикации;
- управлять Steps до публикации;
- управлять Document Requirements до публикации;
- управлять Data Requirements до публикации;
- управлять Sources и Source Revisions;
- управлять Template Open Questions;
- управлять Warnings;
- управлять Restrictions;
- управлять Applicability Conditions;
- управлять content relationships;
- готовить контент к публикации;
- публиковать или supersede контент только в рамках утверждённых publishing boundaries.

Content Admin не может:

- создавать Action Plan для User;
- читать User-Owned Data по умолчанию;
- записывать User-Owned Data;
- менять Progress пользователя;
- переписывать History Event;
- создавать, редактировать, закрывать или удалять User Open Question;
- создавать, редактировать, скрывать или удалять User Note;
- создавать или обновлять Checked Source Mark;
- переносить active Action Plan на новую Scenario Version;
- использовать User Note как Source;
- использовать User Open Question как consultation answer;
- действовать как specialist, authority или support role;
- принимать официальные решения за User;
- подтверждать, что внешнее требование выполнено для User.

Content Admin не имеет права записи в User-Owned Data.

Content Admin не имеет права чтения User-Owned Data по умолчанию.

Любое будущее исключение для права чтения Content Admin должно требовать отдельных privacy, support и security specs до реализации.

## Account с несколькими MVP roles

Решение для MVP: один account может иметь роли `user` и `content_admin`.

Причина:

- Content Admin может также использовать Nova Agent как обычный user.
- Запрет на user-facing workflows для content admin создал бы искусственное разделение account.
- Ключевая security boundary — не эксклюзивность account, а action-scoped permissions и ownership.

Следствия:

- Когда account действует как `user`, он может получать доступ только к собственным User-Owned Data.
- Когда account действует как `content_admin`, он может управлять только Content Model.
- Роль `content_admin` не даёт доступ к User-Owned Data других пользователей.
- User-Owned Data, созданные dual-role account, остаются данными этого account как User, а не данными роли Content Admin.
- Content publishing actions не должны мутировать собственные Action Plans этого account.
- Role context должен быть достаточно явным в будущих specs, чтобы предотвратить случайное смешение привилегий.

Это решение не вводит роли `super_admin`, support, moderation или organization roles.

## Запрещённые паттерны доступа

Запрещённые паттерны доступа:

- User -> запись в Content Model.
- User -> мутация published Scenario Version.
- User -> User-Owned Data другого User.
- User -> self-escalation роли.
- Content Admin -> запись в User-Owned Data.
- Content Admin -> default read User-Owned Data.
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
- Любой actor -> mutable live content как источник исторического пользовательского контекста.

## Security-инварианты

Security-инварианты:

- Content Admin не имеет права записи в User-Owned Data.
- Content Admin не имеет права чтения User-Owned Data по умолчанию.
- User не имеет права записи в Content Model.
- Published Scenario Version является immutable.
- Role escalation запрещён.
- User-Owned Data scoped to owning User.
- User-Owned Data должны сохранять контекст Scenario Version.
- User-Owned Data не должны ссылаться на mutable live content как источник исторического смысла.
- User Note является приватным user-owned workflow context, а не Content Model.
- User Open Question является user-owned workflow context, а не Template Open Question.
- History Event является append-only по смыслу и не может быть переписан из-за изменений роли.
- Checked Source Mark является user-owned mark, а не подтверждением валидности Source.
- External Actors не являются MVP roles.
- Dual-role account не должен смешивать user-owned permissions и content-admin permissions.
- Будущая реализация должна enforce ownership checks перед любым user-owned action.

## Принципы назначения ролей

Принципы назначения ролей:

- Каждый authenticated account с product access может иметь роль `user`.
- Роль `content_admin` должна назначаться через контролируемый административный процесс, определённый в будущей spec.
- User не может выдать себе `content_admin`.
- Действия user-owned workflow не могут менять role assignment.
- Действия Content Model не могут менять role assignment.
- Role assignment не является частью Content Model.
- Role assignment не является частью User-Owned Workflow Model.
- Role assignment должен быть auditable в будущих specs, если admin operations станут операционно чувствительными.
- Удаление роли `content_admin` не должно удалять content history.
- Удаление `user` access само по себе не должно переписывать historical user-owned workflow.

Этот документ не выбирает, как роли хранятся или технически enforce.

## Границы авторизации публикации контента

Content publishing является действием Content Model.

Только роль Content Admin может быть авторизована на подготовку, публикацию, deprecate или supersede контента в рамках утверждённых specs.

Content publishing должен соблюдать:

- published Scenario Version immutability;
- Source Revision historical context;
- Scenario Version links to versioned content context;
- active Action Plan stability;
- отсутствие автоматической мутации User-Owned Data.

Публикация новой Scenario Version не должна:

- migrate active Action Plans automatically;
- change Progress;
- rewrite History Events;
- edit User Open Questions;
- edit User Notes;
- change Checked Source Marks;
- создавать пользовательские действия от имени User.

Этот документ не определяет review workflow, approval workflow или реализацию публикации.

## Правила защиты User-Owned Data

Правила защиты User-Owned Data:

- User-Owned Data могут быть созданы только действием owning User или поведением продукта, явно вызванным этим действием User.
- Просмотр контента не создаёт User-Owned Data.
- Первое stateful action создаёт Action Plan, если он ещё не существует.
- User-Owned Data не могут изменяться Content Admin.
- Content update не может менять User-Owned Data.
- User-Owned Data должны сохранять historical context после content update.
- User-Owned Data нельзя использовать как source of truth для Content Model.
- User Note нельзя использовать как Source, документ, консультацию, официальный факт или data store.
- User Open Question нельзя использовать как professional answer или official decision.
- History Event нельзя удалять или переписывать как side effect изменений роли.
- Checked Source Mark не может обновлять Source или Source Revision.

User имеет право создавать, редактировать, скрывать и удалять собственные User Notes в рамках утверждённого lifecycle.

Следующие решения в этом документе не выбираются:

- soft delete;
- hard delete;
- hide implementation;
- restore implementation;
- physical retention model for hidden or deleted User Notes.

Любое edit, hide или delete действие для User Note должно сохранять контекст History Event и не должно переписывать historical meaning.

## External Actor Boundaries

External Actors могут упоминаться в контенте как:

- official source;
- institution;
- authority;
- specialist;
- direction for external verification.

External Actors не:

- проходят аутентификацию в Nova Agent в MVP;
- создают User-Owned Data;
- отвечают на User Open Questions внутри Nova Agent;
- подтверждают Progress;
- валидируют документы;
- публикуют контент;
- получают доступ к User Notes или Action Plans.

## Решения перед Technical Spec 05

Перед Technical Spec 05 проект должен решить:

- точное физическое представление account-role assignment;
- является ли роль `user` implicit для каждого account или назначается явно;
- как действия dual-role account разделяются по role context;
- доступен ли published content до создания account;
- виден ли draft content только Content Admin;
- кто среди Content Admin accounts может публиковать Scenario Version;
- кто может deprecate или supersede контент;
- требуют ли content admin actions отдельного review в MVP;
- как изменения роли сохраняют historical content и user-owned context;
- точные правила ownership check для каждой User-Owned Entity;
- точная privacy-обработка User Notes и User Open Questions;
- точная обработка User Note hide/delete без потери контекста History Event;
- нужна ли история admin actions для изменений role assignment;
- нужна ли история admin actions для content publishing;
- как предотвратить self-escalation.

## Отложено до Technical Spec 05

Technical Spec 05 может определить:

- физическое представление roles;
- физическое enforcement правил доступа;
- физическое enforcement ownership rules;
- физическое представление account-role relationship;
- физическое представление поведения dual-role account;
- физическое представление content admin actions;
- физическое представление User Note hide/delete;
- физическую защиту immutable published content;
- физическую защиту append-only History Events;
- физическую защиту User-Owned Data от доступа Content Admin;
- физическое предотвращение role escalation.

Technical Spec 05 не должен ослаблять инварианты этого документа.

## Риски

Главные риски:

- Content Admin получает доступ к User Notes по умолчанию.
- Content Admin начинает использовать User-Owned Data как content feedback.
- Content Admin превращается в support, moderator или super admin.
- User может записывать Content Model.
- User может получить доступ к Action Plan другого User.
- Role assignment допускает self-escalation.
- Published Scenario Version становится mutable через admin permissions.
- Dual-role account смешивает Content Admin permissions с personal user workflow.
- User Note hide/delete разрушает контекст History Event.
- User Open Question становится консультационным ответом.
- External Actor становится скрытой MVP role.
- Будущая реализация выдаёт широкий административный доступ ради удобства.

## Критерии приёмки

Technical Spec 04 приемлем, если:

- Actor Types определены: User, Content Admin и External Actors.
- MVP roles определены: `user` и `content_admin`.
- Excluded roles перечислены и явно находятся вне MVP.
- Actor, Role, Ownership и Permission определены отдельно.
- Ownership Content Model определён.
- Ownership User-Owned Data определён.
- Ownership boundaries определены.
- Privacy boundaries определены.
- Правила доступа User определены.
- Правила доступа Content Admin определены.
- Content Admin не имеет права записи в User-Owned Data.
- Content Admin не имеет права чтения User-Owned Data по умолчанию.
- User не имеет права записи в Content Model.
- Published Scenario Version является immutable.
- Role escalation запрещён.
- Решение о dual-role account задокументировано.
- Права User Note create/edit/hide/delete задокументированы без выбора физической реализации.
- Forbidden access patterns перечислены.
- Security invariants перечислены.
- Role Assignment Principles определены.
- Content Publishing Authorization Boundaries определены.
- User-Owned Data Protection Rules определены.
- Decisions Required Before Technical Spec 05 перечислены.
- Deferred To Technical Spec 05 перечислены.
- Документ не описывает запрещённые детали реализации.
