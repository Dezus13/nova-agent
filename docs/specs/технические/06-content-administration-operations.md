# Technical Spec 06: Content Administration Operations

## Назначение документа

Документ фиксирует модель content administration operations Nova Agent — разрешённые и запрещённые действия Content Admin над каждой Content Model entity, правила publication lifecycle, правила draft operations, правила deletion и инварианты.

Цель документа:

- определить, что такое Content Administration Operation;
- зафиксировать разрешённые операции для каждой Content Model entity;
- зафиксировать правила publication workflow;
- зафиксировать правила draft lifecycle;
- зафиксировать правила deletion и protection;
- зафиксировать запрещённые операции;
- зафиксировать инварианты, которые не должны нарушаться в реализации.

Документ не содержит SQL, RLS, API, UI, frontend code, backend code или детали Supabase-реализации.

## Источники и приоритет документов

Technical Spec 06 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/технические/02-user-owned-workflow-model.md`
6. `docs/specs/технические/03-logical-data-model.md`
7. `docs/specs/технические/04-auth-roles-and-ownership.md`
8. `docs/specs/технические/05-supabase-schema-and-rls.md`
9. `docs/specs/функции/08-администрирование-контента.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 06 не создаёт новые продуктовые функции. Он фиксирует операционную модель Content Administration в рамках уже утверждённых MVP-сущностей и инвариантов.

## Границы документа

### Что входит в документ

- определение Content Administration Operation;
- роль и границы Content Admin;
- разрешённые операции для каждой из 11 Content Model entities;
- запрещённые операции;
- publication workflow (publish, deprecate, supersede);
- draft lifecycle и draft deletion;
- Source Revision lifecycle boundary;
- операции, создающие content_publication_events;
- entity immutability rules;
- cascade rules при удалении draft;
- protection rules;
- инварианты;
- риски;
- решения перед SQL;
- критерии приёмки.

### Что не входит в документ

- SQL statements или синтаксис;
- RLS policies или syntax;
- API routes или HTTP endpoints;
- UI или frontend;
- backend code;
- Supabase-специфичные детали реализации;
- новые продуктовые функции вне утверждённых specs;
- роли вне MVP (`reviewer`, `approver`, `publisher`, `support_agent`, `moderator`, `super_admin`);
- publication states вне утверждённых (`draft`, `published`, `deprecated`, `superseded`);
- операции над User-Owned Data;
- пользовательский workflow.

## Термины и определения

### Content Administration Operation

Content Administration Operation — действие Content Admin, которое создаёт, изменяет, публикует, депрекирует, supersedes или удаляет content entity в рамках Content Model.

Content Administration Operation не создаёт, не изменяет и не читает User-Owned Data.

### Draft Content Entity

Draft Content Entity — content entity в состоянии до первого published использования.

Draft entity может изменяться Content Admin в рамках lifecycle rules.

Draft entity не является опубликованным контентом и не доступна пользователям через user-facing workflow.

### Published Content Entity

Published Content Entity — content entity, зафиксированная в опубликованной Scenario Version.

Published content entity является immutable после публикации. Изменение требует новой Scenario Version или нового entity.

### Immutable Content Entity

Immutable Content Entity — content entity, которая не может быть изменена после достижения определённого состояния.

Причины immutability:

- включение в published Scenario Version (Versioned Content Context);
- первое published reference (Warning, Restriction, Applicability Condition, Source Revision).

### Publication Reference

Publication Reference — связь content entity с опубликованной Scenario Version или Checked Source Mark.

Включение content entity в draft Scenario Version не является publication reference. Publication reference возникает только в момент перехода draft Scenario Version в `publication_state = 'published'`, или когда Checked Source Mark ссылается на Source Revision.

## Что такое Content Administration Operations

Content Administration Operations — совокупность действий, через которые Content Admin поддерживает Content Model Nova Agent в рамках утверждённых specs.

Content Administration Operations описывают операционную сторону Content Model: какие действия разрешены, в каком состоянии, с какими ограничениями.

Content Administration Operations не являются:

- управлением пользователями;
- редактированием User-Owned Data;
- редактированием пользовательского прогресса, истории, заметок, открытых вопросов или Checked Source Marks;
- консультационным workflow;
- approval или review процессом над пользовательскими данными.

## Content Admin — роль и границы

В MVP существует только одна роль для администрирования контента: `content_admin`.

### Publishing authorization в MVP

Любой account с role `content_admin` может:

- создавать и редактировать draft content;
- публиковать Scenario Version;
- депрекировать Scenario Version;
- supersede Scenario Version;
- физически удалять draft Scenario Version.

Роли `reviewer`, `approver`, `publisher` отсутствуют в MVP и не вводятся.

Это решение закрывает открытый вопрос из TS04 (раздел "Решения перед Technical Spec 05"), где было оставлено открытым: "кто среди Content Admin accounts может публиковать Scenario Version" и "требуют ли content admin actions отдельного review в MVP".

Ответ для MVP: review/approval workflow не требуется. Любой `content_admin` account выполняет publishing actions самостоятельно в рамках утверждённых операций.

Если в будущем потребуется review workflow или разграничение publishing responsibilities, это требует обновления TS04 и отдельной spec.

UI confirmation перед публикацией является UX-паттерном и не является архитектурной ролью. UI confirmation не вводит роль reviewer или approver и не относится к scope TS06.

### Что Content Admin не может делать

Content Admin не может:

- читать User-Owned Data по умолчанию;
- записывать User-Owned Data;
- создавать Action Plan для User;
- обновлять Progress пользователя;
- переписывать History Event;
- создавать, редактировать или удалять User Open Question;
- создавать, редактировать, скрывать или удалять User Note;
- создавать или обновлять Checked Source Mark;
- переносить active Action Plan на новую Scenario Version;
- мутировать published Scenario Version;
- использовать User Notes как source для Content Model;
- использовать User Open Questions как consultation answers;
- выдавать себе роли через редактирование контента.

### Content Admin и User-Owned Data

Content Admin не имеет доступа к:

- Action Plans (ни индивидуальным, ни в aggregate form);
- Progress records;
- History Events пользователей;
- User Open Questions;
- User Notes;
- Checked Source Marks.

Content Admin не получает агрегаты: количество пользователей на Scenario Version, количество active Action Plans на версии, которую планируется депрекировать, или любые производные user-level метрики.

Content audit для Content Admin означает только работу с `content_publication_events` — append-only записями publication operations. `content_publication_events` не содержат User IDs обычных пользователей, Action Plan IDs или любых User-Owned Data.

Любой доступ Content Admin к User-Owned Data или агрегатам требует отдельной privacy, support и security spec вне MVP.

## Операции над Life Situation

Life Situation — root content entity, описывающая пользовательский входной контекст.

### Разрешённые операции

- Создать Life Situation entity;
- обновить название, описание и контекст Life Situation;
- добавить или удалить связь Life Situation ↔ Scenario;
- обновить ограничения и предупреждения, связанные с Life Situation как content context.

Обновление metadata Life Situation не требует создания новой Scenario Version.

### Запрещённые операции

- Удалять Life Situation, если она является единственным входным контекстом для используемого Scenario, и это нарушит navigational integrity Content Model;
- превращать Life Situation в пошаговый план или административную процедуру;
- добавлять в Life Situation пользовательские прогресс-данные или персональный контекст.

## Операции над Scenario

Scenario — stable content identity, логический контейнер для Scenario Versions.

### Разрешённые операции

- Создать Scenario entity со stable identity;
- обновить название, описание, цель и условия применимости Scenario;
- управлять связями Life Situation ↔ Scenario;
- убедиться, что Scenario связан хотя бы с одной Life Situation.

Обновление metadata Scenario не требует создания новой Scenario Version. Stable Scenario identity не изменяется.

### Запрещённые операции

- Менять stable Scenario identity;
- физически удалять Scenario, если для него существует хотя бы одна published Scenario Version — published Scenario Version сама по себе защищает Scenario от физического удаления, даже если ни один Action Plan ещё не создан;
- физически удалять Scenario, если любая его Scenario Version связана с User-Owned Data (Action Plans, Progress, History Events, User Open Questions, User Notes, Checked Source Marks).

Эти два условия независимы: наличие любой published Scenario Version достаточно для запрета удаления Scenario независимо от наличия User-Owned Data.

## Операции над Scenario Version

Scenario Version — центральная граница между Content Model и User-Owned Data. Является immutable после публикации.

### Создание draft Scenario Version

Content Admin может создать draft Scenario Version для существующего stable Scenario identity.

Ограничение: для одного stable Scenario identity допускается только один active draft Scenario Version одновременно. Это правило соответствует partial unique constraint `WHERE publication_state = 'draft'`, зафиксированному в TS05.

Создание второго draft для того же Scenario identity запрещено. Чтобы создать новый draft, существующий draft должен быть опубликован или физически удалён.

### Редактирование draft Scenario Version

Content Admin может редактировать состав draft Scenario Version:

- добавлять и удалять Versioned Step Context (связи со Steps);
- изменять порядок Steps внутри draft;
- добавлять и удалять step dependencies внутри draft;
- добавлять и удалять Versioned Document Requirement Context;
- добавлять и удалять Versioned Data Requirement Context;
- добавлять и удалять Versioned Source Context (связи с Source Revisions);
- добавлять и удалять Versioned Template Open Question Context;
- добавлять и удалять scenario_version_warning_context;
- добавлять и удалять scenario_version_restriction_context;
- добавлять и удалять scenario_version_applicability_condition_context;
- обновлять Life Situation context для draft.

Редактирование состава допустимо только пока Scenario Version находится в `publication_state = 'draft'`.

### Публикация (draft → published)

Публикация переводит Scenario Version из `publication_state = 'draft'` в `publication_state = 'published'`.

Публикация является явным admin action. Любой `content_admin` account может выполнить публикацию.

После публикации:

- все Versioned Content Context rows этой Scenario Version становятся immutable;
- Warning, Restriction и Applicability Condition entities, referenced этой Scenario Version через versioned context, становятся immutable;
- Source Revision entities, referenced этой Scenario Version через Versioned Source Context, становятся immutable;
- создаётся запись в `content_publication_events` с `event_type = 'scenario_version_published'`.

После публикации Scenario Version не может быть изменена.

### Депрекация (published → deprecated)

Депрекация переводит Scenario Version из `publication_state = 'published'` в `publication_state = 'deprecated'`.

Deprecated Scenario Version означает, что контент устарел, но остаётся доступным для пользователей с существующими Action Plans, созданными на основе этой версии.

Депрекация создаёт запись в `content_publication_events` с `event_type = 'scenario_version_deprecated'`.

После депрекации:

- deprecated Scenario Version не возвращается в `published` и не возвращается в `draft`;
- новые Action Plans не могут быть созданы на основе deprecated Scenario Version;
- существующие Action Plans, связанные с этой Scenario Version, остаются действующими.

### Замена (→ superseded)

Superseding переводит Scenario Version в `publication_state = 'superseded'`.

Допустимые исходные состояния для перехода в `superseded`:

- `published → superseded`;
- `deprecated → superseded`.

Superseding обычно выполняется одновременно с публикацией новой Scenario Version: старая версия переходит в superseded, новая публикуется.

Superseding создаёт запись в `content_publication_events` с `event_type = 'scenario_version_superseded'`. Запись содержит ссылку на successor Scenario Version (successor_version_id).

`superseded` является финальным состоянием. Переход из `superseded` в любое другое состояние запрещён.

### Физическое удаление draft Scenario Version

Физическое удаление допустимо только для `publication_state = 'draft'`.

Удаление draft — это отдельная admin операция, не относящаяся к Publication State Transition Graph.

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

- scenarios, life_situations, steps, document_requirements, data_requirements, sources, source_revisions, template_open_questions, warnings, restrictions, applicability_conditions.

Эти сущности имеют stable identity и не принадлежат одному draft. Удаляются только versioned context link rows.

Это правило соответствует TS05 Amendment 06.

### Запрещённые операции над Scenario Version

- Мутировать любой атрибут published Scenario Version;
- изменять Versioned Content Context rows published Scenario Version;
- переводить publication_state в нарушение Publication State Transition Graph;
- физически удалять Scenario Version с `publication_state != 'draft'` при наличии зависимых User-Owned Data;
- создавать второй active draft для того же stable Scenario identity;
- создавать Scenario Version без stable Scenario identity.

## Операции над Step

Step — stable content entity, описывающая этап внутри Scenario.

Важное разграничение: Step entity (stable content entity) и Versioned Step Context (связь Step с конкретной Scenario Version) — разные объекты с разными правилами.

### Разрешённые операции (entity level)

- Создать Step entity;
- обновить название, описание и тип Step entity.

Изменения Step entity проявляются только в будущих draft Scenario Versions, которые включают этот Step. Published Versioned Step Context не изменяется.

### Разрешённые операции (versioned context level)

- Добавить Versioned Step Context в draft Scenario Version;
- удалить Versioned Step Context из draft Scenario Version (underlying Step entity сохраняется);
- изменить порядок Steps внутри draft Scenario Version;
- добавить или удалить step dependency в draft Scenario Version.

### Запрещённые операции

- Изменять Versioned Step Context published Scenario Version;
- физически удалять Step entity, если это нарушит historical context активных или завершённых Action Plans;
- превращать Step в произвольную пользовательскую задачу.

## Операции над Document Requirement

Document Requirement — stable content entity, описывающая требование к документу.

### Разрешённые операции

- Создать Document Requirement entity;
- обновить описание, назначение и условия Document Requirement;
- добавить Versioned Document Requirement Context в draft Scenario Version;
- удалить Versioned Document Requirement Context из draft (underlying entity сохраняется).

### Запрещённые операции

- Изменять Versioned Document Requirement Context published Scenario Version;
- физически удалять Document Requirement entity, если это нарушит historical context;
- превращать Document Requirement в пользовательский файл или заполненное значение.

## Операции над Data Requirement

Data Requirement — stable content entity, описывающая требование к данным.

### Разрешённые операции

- Создать Data Requirement entity;
- обновить описание, назначение и условия Data Requirement;
- добавить Versioned Data Requirement Context в draft Scenario Version;
- удалить Versioned Data Requirement Context из draft (underlying entity сохраняется).

### Запрещённые операции

- Изменять Versioned Data Requirement Context published Scenario Version;
- физически удалять Data Requirement entity, если это нарушит historical context;
- превращать Data Requirement в заполненное пользовательское значение.

## Операции над Source

Source — stable content entity, описывающая место или направление проверки информации.

### Разрешённые операции

- Создать Source entity;
- обновить metadata Source (название, тип, описание) как атрибуты Source entity;
- создать новую Source Revision для существующего Source;
- добавить Versioned Source Context (ссылку на Source Revision) в draft Scenario Version;
- удалить Versioned Source Context из draft Scenario Version (underlying Source и Source Revision сохраняются).

### Запрещённые операции

- Физически удалять Source entity, если хотя бы одна Source Revision этого Source referenced published Scenario Version или Checked Source Mark;
- превращать Source в пользовательскую заметку или официальное подтверждение актуальности;
- делать Source самостоятельным подтверждением достоверности информации.

## Операции над Source Revision

Source Revision — versioned content entity, фиксирующая исторический контекст Source.

### Mutable boundary

Source Revision остаётся mutable до первого publication reference.

Включение Source Revision в draft Scenario Version не является publication reference. Source Revision остаётся mutable, пока draft Scenario Version не опубликована.

Publication reference возникает в один из двух моментов:

- draft Scenario Version, включающая эту Source Revision, переходит в `publication_state = 'published'`;
- Checked Source Mark ссылается на эту Source Revision.

После первого publication reference Source Revision становится immutable навсегда.

Это правило соответствует TS05 Amendment 04.

### Разрешённые операции

- Создать новую Source Revision для существующего Source;
- редактировать содержание Source Revision, пока она не referenced published Scenario Version или Checked Source Mark (mutable phase);
- добавить Versioned Source Context в draft Scenario Version;
- удалить Versioned Source Context из draft Scenario Version (underlying Source Revision сохраняется).

### Запрещённые операции

- Изменять Source Revision entity, referenced published Scenario Version;
- изменять Source Revision entity, referenced Checked Source Mark;
- физически удалять Source Revision, referenced published Scenario Version или Checked Source Mark;
- превращать Source Revision в пользовательскую заметку или official validation.

## Операции над Template Open Question

Template Open Question — stable content entity, описывающая вопрос для внешней проверки на уровне шаблона.

### Разрешённые операции

- Создать Template Open Question entity;
- обновить текст и описание Template Open Question entity;
- добавить Versioned Template Open Question Context в draft Scenario Version;
- удалить Versioned Template Open Question Context из draft (underlying entity сохраняется).

### Запрещённые операции

- Изменять Versioned Template Open Question Context published Scenario Version;
- физически удалять Template Open Question entity, если это нарушит historical context;
- превращать Template Open Question в User Open Question или консультационный ответ.

### Entity-level immutability Template Open Question

Template Open Question entity **не получает entity-level immutability** по правилу Warning / Restriction / Applicability Condition.

Template Open Question entity может редактироваться для будущих draft Scenario Versions. Immutable после публикации является только Versioned Template Open Question Context как часть published Scenario Version. Published Scenario Versions продолжают ссылаться на свой versioned context и не меняются при редактировании Template Open Question entity.

## Операции над Warning

Warning — content entity с entity-level immutability после первого published использования.

### Mutable Warning

Warning entity mutable до тех пор, пока она не referenced ни одной published Scenario Version.

Content Admin может редактировать Warning entity, пока она не опубликована.

### Immutable Warning

После первого использования Warning entity в published Scenario Version — Warning entity становится immutable.

Это правило соответствует TS05 Amendment 01.

### Паттерн замены immutable Warning

Если необходимо изменить Warning entity, referenced published Scenario Version:

1. Создать новый Warning entity с новым содержанием;
2. создать новую Scenario Version;
3. включить новый Warning entity в новую Scenario Version;
4. опубликовать новую Scenario Version.

Прямое редактирование immutable Warning entity запрещено.

### Разрешённые операции

- Создать новый Warning entity;
- редактировать Warning entity, не referenced published Scenario Version;
- добавить scenario_version_warning_context в draft Scenario Version;
- удалить scenario_version_warning_context из draft (underlying Warning entity сохраняется).

### Запрещённые операции

- Изменять Warning entity, referenced published Scenario Version;
- изменять scenario_version_warning_context published Scenario Version;
- физически удалять Warning entity, referenced published Scenario Version.

## Операции над Restriction

Restriction — content entity с entity-level immutability после первого published использования.

Правила аналогичны Warning (раздел "Операции над Warning").

### Разрешённые операции

- Создать новый Restriction entity;
- редактировать Restriction entity, не referenced published Scenario Version;
- добавить scenario_version_restriction_context в draft Scenario Version;
- удалить scenario_version_restriction_context из draft (underlying Restriction entity сохраняется).

### Запрещённые операции

- Изменять Restriction entity, referenced published Scenario Version;
- изменять scenario_version_restriction_context published Scenario Version;
- физически удалять Restriction entity, referenced published Scenario Version.

### Паттерн замены immutable Restriction

Создать новый Restriction entity → включить в новую Scenario Version → опубликовать.

## Операции над Applicability Condition

Applicability Condition — content entity с entity-level immutability после первого published использования.

Правила аналогичны Warning и Restriction.

### Разрешённые операции

- Создать новый Applicability Condition entity;
- редактировать Applicability Condition entity, не referenced published Scenario Version;
- добавить scenario_version_applicability_condition_context в draft Scenario Version;
- удалить scenario_version_applicability_condition_context из draft (underlying entity сохраняется).

### Запрещённые операции

- Изменять Applicability Condition entity, referenced published Scenario Version;
- изменять scenario_version_applicability_condition_context published Scenario Version;
- физически удалять Applicability Condition entity, referenced published Scenario Version.

### Паттерн замены immutable Applicability Condition

Создать новый Applicability Condition entity → включить в новую Scenario Version → опубликовать.

## Publication State Transition Rules

publication_state Scenario Version изменяется только по утверждённому графу переходов из TS05.

Разрешённые переходы:

- `draft → published`;
- `published → deprecated`;
- `published → superseded`;
- `deprecated → superseded`.

Запрещённые переходы:

- `published → draft`;
- `deprecated → draft`;
- `deprecated → published`;
- `superseded → published`;
- `superseded → deprecated`;
- `superseded → draft`;
- `draft → deprecated`;
- `draft → superseded`;
- любой self-transition (same state → same state).

`superseded` является финальным состоянием. Переход из `superseded` в любое другое состояние запрещён.

Физическое удаление draft Scenario Version является отдельной admin операцией и не относится к transition graph. Правила удаления — в разделе "Физическое удаление draft Scenario Version".

Enforcement publication_state transitions на database level остаётся решением перед написанием SQL.

## Операции, требующие создания новой Scenario Version

Следующие изменения требуют создания новой Scenario Version:

- добавление, удаление или изменение порядка Steps;
- изменение step dependencies;
- добавление или удаление Document Requirement;
- добавление или удаление Data Requirement;
- изменение Source Revision reference;
- замена immutable Warning entity — через новый Warning entity и включение в новую Scenario Version;
- замена immutable Restriction entity;
- замена immutable Applicability Condition entity;
- добавление или удаление Template Open Question;
- изменение Life Situation context linkage, если это влияет на Action Plan selected context.

Следующие изменения не требуют новой Scenario Version:

- обновление metadata Scenario (название, описание);
- обновление metadata Life Situation;
- создание новой Source Revision без включения в Scenario Version;
- редактирование Warning / Restriction / AC entity, не referenced published.

## Content Publication Events

Content publication events — append-only записи publication operations, доступные Content Admin для content audit.

### Когда создаются events

- Публикация Scenario Version (`draft → published`): создаёт event с `event_type = 'scenario_version_published'`;
- Депрекация Scenario Version (`published → deprecated`): создаёт event с `event_type = 'scenario_version_deprecated'`;
- Superseding Scenario Version (`→ superseded`): создаёт event с `event_type = 'scenario_version_superseded'`.

### Conceptual payload

Каждый event содержит:

- event identifier;
- event_type;
- admin_actor_id (Content Admin, выполнивший операцию; должен иметь role `content_admin`);
- scenario_version_id (affected Scenario Version);
- scenario_id (stable Scenario identity);
- previous_publication_state;
- new_publication_state;
- successor_version_id (nullable; заполняется только для supersede events);
- created_at.

### Когда events не создаются

- CRUD operations над draft content entities (Steps, Document Requirements, Data Requirements, Sources, Source Revisions, Template Open Questions, Warnings, Restrictions, Applicability Conditions);
- физическое удаление draft Scenario Version;
- обновление Life Situation или Scenario metadata;
- редактирование Warning / Restriction / AC entity до публикации;
- создание или редактирование Source Revision.

### Append-only правило

content_publication_events rows не изменяются и не удаляются после создания.

Возврат к предыдущему publication_state физически невозможен и не создаёт reverse event.

### Что не хранится в content_publication_events

- User IDs обычных пользователей;
- Action Plan IDs;
- Progress records;
- History Events пользователей;
- User Notes;
- User Open Questions;
- Checked Source Marks;
- количество affected пользователей или Action Plans;
- персональные данные.

## Entity Immutability Rules

### Scenario Version и Versioned Content Context

После публикации Scenario Version:

- Scenario Version row — immutable;
- все Versioned Content Context rows этой Scenario Version — immutable;
- Versioned Step Context — immutable;
- Versioned Document Requirement Context — immutable;
- Versioned Data Requirement Context — immutable;
- Versioned Source Context — immutable;
- Versioned Template Open Question Context — immutable.

Published content context нельзя изменять или удалять, если от него зависят Action Plans, History Events, User Open Questions, User Notes, Checked Source Marks.

### Warning / Restriction / Applicability Condition

Warning, Restriction и Applicability Condition entity rows становятся immutable после первого использования в published Scenario Version.

Изменение immutable entity требует создания нового entity и новой Scenario Version.

Это правило соответствует TS05 Amendment 01.

### Source Revision

Source Revision становится immutable после первого publication reference:

- draft Scenario Version с этой Source Revision переходит в `published`;
- или Checked Source Mark ссылается на эту Source Revision.

Включение Source Revision в draft Scenario Version не является publication reference. Source Revision остаётся mutable, пока draft не опубликован.

Это правило соответствует TS05 Amendment 04.

## Cascade Rules при удалении draft Scenario Version

Физическое удаление draft Scenario Version удаляет (cascade) только versioned context link rows:

- scenario_version_life_situation_contexts;
- scenario_version_step_contexts;
- scenario_version_step_dependencies;
- scenario_version_document_requirement_contexts;
- scenario_version_data_requirement_contexts;
- scenario_version_source_contexts;
- scenario_version_template_open_question_contexts;
- scenario_version_warning_contexts;
- scenario_version_restriction_contexts;
- scenario_version_applicability_condition_contexts.

Underlying content entities не удаляются:

- scenarios, life_situations, steps, document_requirements, data_requirements, sources, source_revisions, template_open_questions, warnings, restrictions, applicability_conditions.

Underlying entities имеют stable identity и могут быть referenced другими Scenario Versions.

## Protection Rules

### Защита non-draft Scenario Version

Физическое удаление Scenario Version с `publication_state != 'draft'` запрещено, если от неё зависят:

- Action Plans;
- Progress records;
- History Events;
- User Open Questions;
- User Notes;
- Checked Source Marks.

Это правило сохраняет historical context активных и завершённых планов. Правило соответствует TS05 Amendment 06.

### Защита underlying content entities

Step entity не должна физически удаляться, если это нарушит исторический контекст Action Plans, связанных с published Scenario Version, включающей этот Step.

Source Revision entity не должна физически удаляться, если referenced published Scenario Version или Checked Source Mark.

Warning, Restriction и Applicability Condition entity не должны физически удаляться, если referenced published Scenario Version.

Document Requirement и Data Requirement entities не должны физически удаляться, если это нарушит historical context.

Template Open Question entity не должна физически удаляться, если referenced published Scenario Version.

## Инварианты

Следующие инварианты не должны нарушаться в реализации:

1. Published Scenario Version является immutable. Никакой атрибут, никакой Versioned Content Context published Scenario Version не может быть изменён.

2. Для одного stable Scenario identity существует не более одного active draft Scenario Version одновременно.

3. Warning, Restriction и Applicability Condition entity становятся immutable после первого использования в published Scenario Version. Изменение требует нового entity и новой Scenario Version.

4. Source Revision становится immutable после первого publication reference. Включение в draft Scenario Version не является publication reference.

5. Publication State Transition Graph ограничен 4 разрешёнными переходами. Все прочие переходы и self-transitions запрещены.

6. `superseded` является финальным состоянием. Переход из `superseded` запрещён.

7. content_publication_events являются append-only. Строки не изменяются и не удаляются.

8. Физическое удаление Scenario Version допустимо только для `publication_state = 'draft'`.

9. При удалении draft удаляются только versioned context link rows. Underlying content entities не затрагиваются.

10. Content Admin не имеет доступа к User-Owned Data ни в индивидуальном, ни в aggregate form.

11. Content Admin не может создавать Action Plans, изменять Progress, переписывать History Events, управлять User Open Questions, User Notes, Checked Source Marks.

12. Обновление Content Model не автоматически изменяет User-Owned Data.

13. Active Action Plan не переходит на новую Scenario Version автоматически.

14. Review/approval workflow не входит в MVP. Любой `content_admin` account может publish, deprecate и supersede без дополнительного review.

15. Один account может иметь роли `user` и `content_admin`. Роль `content_admin` не даёт доступа к User-Owned Data этого account как `user`.

## Запрещённые операции

### Мутация published content

- Мутировать любой атрибут published Scenario Version;
- изменять Versioned Content Context rows published Scenario Version;
- изменять Warning entity, referenced published Scenario Version;
- изменять Restriction entity, referenced published Scenario Version;
- изменять Applicability Condition entity, referenced published Scenario Version;
- изменять Source Revision entity, referenced published Scenario Version или Checked Source Mark.

### Нарушения Publication State Transition Graph

- `published → draft`;
- `deprecated → draft`;
- `deprecated → published`;
- `superseded → любое состояние`;
- `draft → deprecated`;
- `draft → superseded`;
- любой self-transition.

### Нарушения deletion rules

- Физически удалять Scenario Version с `publication_state != 'draft'` при наличии User-Owned Data зависимостей;
- удалять underlying content entities при удалении draft Scenario Version;
- удалять Source Revision, referenced published Scenario Version или Checked Source Mark;
- удалять Warning / Restriction / AC entity, referenced published Scenario Version.

### Нарушения draft uniqueness

- Создавать второй active draft Scenario Version для одного stable Scenario identity.

### Доступ к User-Owned Data

- Читать Action Plans;
- читать Progress;
- читать History Events пользователей;
- читать User Open Questions;
- читать User Notes;
- читать Checked Source Marks;
- получать агрегаты пользователей на Scenario Version.

### Операции, требующие отдельной spec

- Вводить review/approval workflow;
- вводить роли `reviewer`, `approver`, `publisher`;
- вводить publication states вне `draft`, `published`, `deprecated`, `superseded`;
- вводить новые content entity types вне утверждённого MVP entity list из TS03 (Life Situation, Scenario, Step, Document Requirement, Data Requirement, Source, Source Revision, Template Open Question, Warning, Restriction, Applicability Condition);
- вводить automatic migration active Action Plans на новую Scenario Version;
- вводить bulk publishing operations;
- вводить import/export content operations;
- вводить automatic deprecation по дате или event-trigger.

## Связи с TS01–TS05

### TS01 (Content Model & Versioning)

TS06 наследует:

- Published Scenario Version immutable;
- Content Admin не управляет User-Owned Data;
- Изменение Content Model не автоматически изменяет User-Owned Data;
- Опубликованный контент, referenced активными планами, не должен удаляться так, чтобы был потерян исторический контекст.

### TS02 (User-Owned Workflow Model)

TS06 подтверждает:

- Admin content не создаёт user-owned History Events;
- Content update не создаёт History Event в пользовательском плане;
- Content Admin не редактирует User Notes, User Open Questions, Checked Source Marks.

### TS03 (Logical Data Model)

TS06 наследует:

- Cardinality: один Scenario → много Scenario Versions;
- Source Revision как MVP-модель исторического контекста источников;
- Stable Scenario identity для grouping и uniqueness;
- Published Scenario Version нельзя удалить, если от неё зависят User-Owned Entities.

### TS04 (Auth, Roles & Ownership)

TS06 наследует:

- MVP roles: только `user` и `content_admin`;
- Content Admin не имеет права чтения User-Owned Data по умолчанию;
- Content Admin не имеет права записи в User-Owned Data.

TS06 закрывает открытый вопрос TS04: review/approval workflow не входит в MVP; любой `content_admin` может publish, deprecate, supersede.

### TS05 (Supabase Schema & RLS)

TS06 использует и ссылается на:

- Publication State Transition Rules (Amendment 02);
- Draft Scenario Version Deletion rules с explicit cascade list (Amendment 06);
- content_publication_events conceptual payload (Amendment 05);
- Warning/Restriction/AC entity immutability (Amendment 01);
- Source Revision mutable boundary (Amendment 04);
- Один draft per stable Scenario identity через partial unique constraint (Amendment 03).

TS06 не определяет физический enforcement этих правил — это остаётся задачей SQL-спецификации.

## Риски

**Риск 1: "Minor edit" паттерн для published content**

Наиболее вероятный риск: появится паттерн "небольшого исправления опечатки" внутри published Scenario Version. Любое такое исключение нарушает immutability invariant. Правило без исключений: любое изменение контента published Scenario Version = новая Scenario Version.

**Риск 2: Смешение entity mutability с Versioned Context immutability**

Step entity mutable как stable content entity (изменения затронут следующие draft Scenario Versions). Versioned Step Context published Scenario Version — immutable. Реализация может ошибочно запретить редактирование Step entity вообще, или — наоборот — мутировать published Versioned Step Context.

**Риск 3: Неверная интерпретация Source Revision mutable boundary**

Реализация может заблокировать редактирование Source Revision в момент включения в draft Scenario Version. Правило явное: draft reference ≠ publication reference. Source Revision остаётся mutable до публикации draft.

**Риск 4: Доступ к User-Owned Data через content audit**

Может появиться запрос "показать Content Admin, сколько пользователей affected при депрекации". Это чтение User-Owned Data в aggregate и запрещено. content_publication_events не содержат user-level data и не должны содержать.

**Риск 5: Введение approval workflow через реализацию**

Без явного запрета разработчик может добавить таблицу publish requests или draft approvals. Это вводит неутверждённую роль. TS06 явно запрещает review/approval workflow без отдельной spec.

**Риск 6: Неполное cascade при удалении draft**

При удалении draft Scenario Version реализация может пропустить один из 10 типов versioned context rows. TS06 содержит explicit полный список.

**Риск 7: Lifecycle states вне утверждённых**

Реализация может добавить publication_state `archived` или `hidden` для Scenario Version. Допустимы только `draft`, `published`, `deprecated`, `superseded`.

**Риск 8: Создание Action Plan на основе deprecated Scenario Version**

Content Admin может депрекировать версию, предполагая что пользователи сразу переходят на новую. Поведение MVP: deprecated Scenario Version недоступна для создания новых Action Plans, но существующие Action Plans продолжают работать. Это Product behavior, зафиксированный в TS05 Amendment 03 (Pattern B access). TS06 не изменяет этого поведения.

## Решения перед SQL

Следующие вопросы остаются открытыми и должны быть решены до написания SQL:

1. Точный механизм физического удаления draft Scenario Version: cascade delete на database level или explicit multi-step delete в application logic (унаследовано из TS05 Amendment 06).

2. Физическая реализация partial unique constraint для одного draft Scenario Version per stable Scenario identity: partial unique index или trigger-based constraint (унаследовано из TS05).

3. Физический механизм enforcement Publication State Transition Graph: trigger BEFORE UPDATE на `scenario_versions.publication_state` или check constraint (унаследовано из TS05).

4. Lifecycle state для Life Situation entity: нужен ли явный state (active/hidden) для Life Situation в MVP, или Life Situation управляется только через связи со Scenario без publication state.

5. Lifecycle state для Scenario entity (stable identity): нужен ли явный state (active/archived) для stable Scenario identity в MVP.

6. Step entity deletion protection mechanism: запрет физического удаления или soft-delete для Steps, referenced published Scenario Version.

7. Точное разграничение: что изменяется через обновление Source entity metadata (название, тип) без новой Source Revision, и что требует создания новой Source Revision.

8. Audit trail для Content Admin CRUD operations над draft content entities: нужны ли записи аудита помимо content_publication_events.

## Критерии приёмки

Technical Spec 06 готов, если:

- Content Administration Operation определена как операция над Content Model;
- граница между Content Model и User-Owned Data зафиксирована;
- review/approval workflow явно исключён из MVP с указанием, что это закрывает open question TS04;
- разрешённые операции описаны для каждой из 11 Content Model entities;
- запрещённые операции описаны явно и полно;
- Publication State Transition Rules воспроизведены с явной ссылкой на TS05;
- правила draft deletion зафиксированы с explicit списком cascade rows и запретом удаления underlying entities;
- правило "один draft per stable Scenario identity" зафиксировано с ссылкой на TS05 partial unique constraint;
- Source Revision mutable boundary зафиксирована с явной фразой "draft reference не является publication reference";
- Content Admin no access to User-Owned Data зафиксирован с explicit списком недоступных entities и запретом агрегатов;
- content audit определён как работа только с content_publication_events;
- content_publication_events описаны с правилами когда создаются, conceptual payload и append-only правилом;
- entity immutability rules зафиксированы для Warning/Restriction/AC, Source Revision, Versioned Content Context;
- паттерн замены immutable entity описан явно;
- protection rules для non-draft Scenario Version при наличии User-Owned Data dependencies зафиксированы;
- инварианты перечислены;
- риски перечислены;
- решения перед SQL перечислены;
- документ не содержит SQL, RLS, API, UI, Supabase implementation details;
- документ не вводит новые роли;
- документ не вводит новые publication states.
