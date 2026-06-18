# Technical Spec 07: User-Owned Workflow Operations

## Назначение документа

Документ фиксирует модель user-owned workflow operations Nova Agent — разрешённые и запрещённые действия обычного пользователя над каждой User-Owned сущностью: Action Plan, Step Progress, User Open Question, User Note, Checked Source Mark и History Events.

Цель документа:

- определить, что такое User-Owned Workflow Operation;
- зафиксировать принятые MVP-решения по lifecycle User-Owned сущностей;
- зафиксировать разрешённые операции для каждой User-Owned сущности;
- зафиксировать lifecycle Action Plan, Step Progress и User Open Question;
- зафиксировать правила создания History Events;
- зафиксировать минимальный payload каждого типа History Event;
- зафиксировать запрещённые операции;
- зафиксировать инварианты, которые не должны нарушаться в реализации;
- предоставить основу для разработки UI Design Rules (UI-01) и API Spec (TS08).

Документ не содержит SQL, RLS, API, UI, frontend code, backend code или детали Supabase-реализации.

TS07 является операционным зеркалом TS06: TS06 описывает операции Content Admin над Content Model, TS07 описывает операции пользователя над User-Owned Data.

## Источники и приоритет документов

Technical Spec 07 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/технические/02-user-owned-workflow-model.md`
6. `docs/specs/технические/03-logical-data-model.md`
7. `docs/specs/технические/04-auth-roles-and-ownership.md`
8. `docs/specs/технические/05-supabase-schema-and-rls.md`
9. `docs/specs/технические/06-content-administration-operations.md`
10. `docs/specs/функции/06-прогресс.md`
11. `docs/specs/функции/07-история-действий.md`
12. `docs/specs/функции/09-план-действий.md`
13. `docs/specs/функции/10-открытые-вопросы.md`
14. `docs/specs/функции/11-пользовательские-заметки.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 07 не создаёт новые продуктовые функции. Он операционализирует User-Owned Workflow entities, утверждённые в TS02, и закрывает все открытые lifecycle-решения, которые TS02 оставил открытыми до Logical Data Model.

## Границы документа

### Что входит в документ

- определение User-Owned Workflow Operation;
- принятые MVP-решения по lifecycle пользовательских сущностей;
- роль пользователя и границы доступа;
- разрешённые и запрещённые операции для каждой User-Owned сущности;
- lifecycle Action Plan: stateful triggers, plan-creating actions, completion, new pass;
- полный граф переходов Step Progress;
- полный граф переходов User Open Question;
- lifecycle User Note (creation, editing, hiding/deletion);
- операции Checked Source Mark и их отношение к созданию плана;
- полный список операций, создающих History Events;
- минимальный payload каждого типа History Event;
- правила historical context и Scenario Version lock;
- уточнение RLS Pattern B для completed планов;
- инварианты;
- запрещённые операции;
- связи с TS01–TS06;
- риски;
- решения перед TS08;
- критерии приёмки.

### Что не входит в документ

- SQL statements или синтаксис;
- RLS policies или syntax;
- API routes или HTTP endpoints;
- UI или frontend;
- backend code;
- Supabase-специфичные детали реализации;
- новые продуктовые функции вне утверждённых specs;
- операции Content Admin над Content Model — это TS06;
- операции аутентификации и регистрации пользователя — это TS04;
- хранение пользовательских файлов — не входит в MVP;
- хранение заполненных персональных значений — не входит в MVP;
- официальные статусы от внешних органов — вне продукта;
- task manager функциональность: дедлайны, приоритеты, назначение исполнителей;
- автоматическая миграция активного плана на новую Scenario Version — не входит в MVP;
- конкретные австрийские административные требования — это Seed Content.

## Термины и определения

### User-Owned Workflow Operation

User-Owned Workflow Operation — действие пользователя, которое создаёт, изменяет или читает User-Owned сущность внутри своего Action Plan.

User-Owned Workflow Operation не создаёт, не изменяет и не читает Content Model. Пользователь ссылается на Content Model через Scenario Version context, но не изменяет её.

### Stateful Action

Stateful Action — действие пользователя, которое создаёт или изменяет user-owned workflow state.

Простой просмотр Scenario Version, шагов, документов, источников и Template Open Questions не является Stateful Action и не создаёт Action Plan.

### Plan-Creating Stateful Action

Plan-Creating Stateful Action — Stateful Action, которое создаёт Action Plan при первом выполнении для данного Scenario, если active план не существует.

### Current State

Current State — текущее пользовательское состояние workflow-сущности.

В MVP Current State шага — это Progress. Current State вопроса — это User Open Question status. Current State не определяется из History.

### Historical Record

Historical Record — History Event, фиксирующий, что изменилось внутри Action Plan, в каком контексте и в каком порядке.

Historical Record является append-only и не заменяет Current State.

## Что такое User-Owned Workflow Operations

User-Owned Workflow Operations — совокупность действий, через которые пользователь взаимодействует со своими данными прохождения выбранного сценария.

User-Owned Workflow Operations описывают операционную сторону User-Owned Data: какие действия разрешены, в каком состоянии сущности, с какими ограничениями.

User-Owned Workflow Operations не являются:
- управлением Content Model;
- консультационным workflow;
- официальным взаимодействием с австрийскими органами или учреждениями;
- заменой профессиональной, юридической, налоговой, медицинской или финансовой консультации;
- task manager workflow.

## Роль пользователя и границы доступа

В MVP роль обычного пользователя в системе: `user`.

### Что пользователь может делать

Пользователь может:

- создать Action Plan через Plan-Creating Stateful Action для published Scenario Version;
- создать новый Action Plan по тому же Scenario после завершения предыдущего;
- читать свои Action Plans (active и completed);
- изменять статус шагов внутри своего active Action Plan;
- завершить свой active Action Plan;
- создавать User Open Questions внутри своего active Action Plan;
- изменять состояние своих User Open Questions;
- редактировать формулировку своих User Open Questions;
- создавать User Notes, привязанные к History Event внутри своего плана;
- редактировать свои User Notes;
- скрывать или удалять свои User Notes;
- отмечать Source как checked внутри существующего active Action Plan;
- читать историю (History Events) своего Action Plan.

### Что пользователь не может делать

Пользователь не может:

- читать или изменять Action Plans другого пользователя;
- читать или изменять User Open Questions другого пользователя;
- читать или изменять User Notes другого пользователя;
- читать History Events другого пользователя;
- читать или изменять Checked Source Marks другого пользователя;
- создавать, обновлять или удалять Content Model entities (Scenario, Scenario Version, Step, Document Requirement, Data Requirement, Source, Source Revision, Template Open Question, Warning, Restriction, Applicability Condition);
- публиковать, депрекировать или supersede Scenario Version;
- управлять Template Open Questions;
- создавать Action Plan для Scenario Version с `publication_state != 'published'`;
- создавать второй active Action Plan для того же stable Scenario identity;
- переоткрывать completed Action Plan;
- создавать шаги вне структуры Scenario Version;
- редактировать или удалять History Events;
- получать роль `content_admin`.

## Принятые MVP-решения

Следующие решения приняты как окончательные для MVP. Каждое закрывает открытый вопрос из TS02 или TS03 и должно соблюдаться в UI-01, TS08 и при реализации.

**Решение 1: Checked Source Mark не является Plan-Creating Stateful Action.**
Создание Checked Source Mark допустимо только внутри уже существующего Action Plan. Это закрывает открытый вопрос из TS02 (раздел "Stateful Actions") и TS03 (раздел "Checked Source Mark Rules").

**Решение 2: Plan-Creating Stateful Actions — исчерпывающий список.**
Action Plan создаётся только через следующие действия:
- Explicit Start Plan;
- Change Step Progress Status (включая переход в `completed`);
- Create User Open Question;
- Create User Note.

Никакое другое действие не создаёт Action Plan.

**Решение 3: User Open Question status `irrelevant` является финальным состоянием.**
Переход из `irrelevant` в любое активное состояние запрещён. Если появляется новая неопределённость после перевода вопроса в `irrelevant`, пользователь создаёт новый User Open Question. Это закрывает открытый вопрос из TS02 (раздел "User Open Question State Transitions") и TS03 (раздел "Cardinality Rules").

**Решение 4: Action Plan в MVP имеет только два состояния.**
Допустимые состояния Action Plan: `active` и `completed`. Состояния `archived`, `hidden`, `deleted_by_user`, `reopened`, `restored` не входят в MVP. Это закрывает открытые решения из TS02 (раздел "Открытые решения по lifecycle Action Plan").

**Решение 5: Completed Action Plan не переоткрывается.**
Переход `completed → active` запрещён. `reopened` — не MVP state.

**Решение 6: Новый проход по сценарию создаёт новый Action Plan.**
После завершения (`completed`) Action Plan пользователь может создать новый Action Plan по тому же stable Scenario identity. Новый план создаётся только для published Scenario Version. Это закрывает открытый вопрос из TS02 (раздел "Открытые решения") и TS03 (раздел "Cardinality Rules").

**Решение 7: Один active Action Plan на User на stable Scenario identity.**
Одновременно может существовать только один `active` Action Plan на одного User для одного stable Scenario identity. Completed планы в этот лимит не входят. Uniqueness применяется по `active` планам: partial rule, не полный.

**Решение 8: RLS Pattern B распространяется на active и completed планы.**
Пользователь может читать deprecated или superseded Scenario Version, если он имеет Action Plan (в состоянии `active` или `completed`) для этой Scenario Version. Это уточняет TS05 Amendment 03, которая описывала Pattern B без явного указания на `completed` статус. Уточнение необходимо для сохранения исторического контекста завершённых планов.

## Action Plan Operations

### Plan-Creating Stateful Actions

Action Plan не создаётся от простого просмотра Scenario Version, шагов, документов, источников или Template Open Questions.

Action Plan создаётся при первом Plan-Creating Stateful Action внутри выбранного Scenario, если active план ещё не существует.

Plan-Creating Stateful Actions — исчерпывающий список:

- **Explicit Start Plan** — пользователь явно выбирает начать план для Scenario Version с `publication_state = 'published'`;
- **Change Step Progress Status** — пользователь устанавливает или изменяет статус шага; включает переход в `completed`;
- **Create User Open Question** — пользователь создаёт новый User Open Question в контексте Scenario;
- **Create User Note** — пользователь добавляет User Note.

Если active Action Plan для данного stable Scenario identity уже существует, Plan-Creating Stateful Action относится к существующему плану и не создаёт новый.

### Action Plan Creation Gate

Action Plan может быть создан только для Scenario Version с `publication_state = 'published'`.

Создание Action Plan запрещено для:

- draft Scenario Version;
- deprecated Scenario Version;
- superseded Scenario Version.

Это правило соответствует TS05 Amendment 03 (Action Plan creation gate).

Если пользователь выполняет Plan-Creating Stateful Action для non-published Scenario Version при отсутствии active плана, действие должно быть отклонено с явным указанием причины.

### One Active Plan Per Scenario Rule

В MVP допускается только один active Action Plan на User на stable Scenario identity одновременно.

Правило применяется по stable Scenario identity, не per Scenario Version. Публикация новой Scenario Version не создаёт второй active план автоматически.

Если у пользователя уже есть active Action Plan для данного stable Scenario identity, все последующие Plan-Creating Stateful Actions и другие операции относятся к существующему active плану.

Создание второго active Action Plan для того же User и того же stable Scenario identity запрещено, пока первый план находится в состоянии `active`.

Completed планы не входят в uniqueness rule. Пользователь может иметь несколько completed планов по одному Scenario и один active план одновременно.

### New Pass: создание нового плана после завершения

После перевода Action Plan в `completed` пользователь может создать новый active Action Plan по тому же stable Scenario identity.

Правила нового прохода:

- новый Action Plan создаётся только для Scenario Version с `publication_state = 'published'`;
- если Scenario Version, использованная в предыдущем плане, deprecated или superseded, новый план создаётся по актуальной published Scenario Version;
- старый completed план сохраняет свою Scenario Version и весь исторический контекст без изменений;
- история старого плана не переносится в новый план;
- completed план не переоткрывается — это создание новой сущности;
- если для данного Scenario нет published Scenario Version, новый план создать невозможно.

### Чтение собственных планов

Пользователь может читать:

- список своих Action Plans для данного stable Scenario identity (active и completed);
- детали конкретного Action Plan: Progress, History Events, User Open Questions, User Notes, Checked Source Marks;
- исторический контекст completed плана — доступ к deprecated/superseded Scenario Version обеспечивается через RLS Pattern B (Решение 8).

Пользователь не может читать Action Plans другого пользователя.

### Завершение Action Plan

Завершение Action Plan — явное пользовательское действие.

Завершение переводит Action Plan из `active` в `completed`.

Завершение означает только пользовательскую отметку внутри Nova Agent. Завершение не означает:

- что внешний орган принял документы;
- что заявление подано;
- что официальный ответ получен;
- что требование применимо к пользователю;
- что результат внешнего процесса достигнут.

Завершение создаёт History Event с `event_type = 'action_plan_completed'`.

### Запрещённые операции с Action Plan

- Создать Action Plan для Scenario Version с `publication_state != 'published'`;
- создать второй active Action Plan для того же stable Scenario identity;
- переоткрыть completed Action Plan;
- архивировать, скрыть или удалить Action Plan;
- создавать шаги вне структуры Scenario Version;
- читать Action Plans другого пользователя;
- автоматически переносить план на новую Scenario Version.

## Step Progress Operations

### Создание Progress при создании Action Plan

При создании Action Plan создаются Progress records для всех Versioned Step Context records внутри выбранной Scenario Version.

Initial status каждого Progress record: `not_started`.

History Event для каждого individual initial `not_started` record не создаётся. Создание Action Plan создаёт один `action_plan_created` History Event, а не per-step progress events.

Это решение принято в TS05 и не является открытым вопросом перед TS08.

### Разрешённые переходы статусов

Progress — текущее состояние пользователя по конкретному шагу внутри Action Plan.

В MVP используются только следующие статусы Progress:

- `not_started`;
- `in_progress`;
- `awaiting_external_response`;
- `completed`;
- `requires_check`.

Эти статусы являются пользовательскими отметками внутри Nova Agent. Они не означают, что внешний орган, учреждение или специалист принял действие, документ, заявление или решение.

Полный граф допустимых переходов MVP:

```
not_started → in_progress
not_started → requires_check
not_started → awaiting_external_response
not_started → completed

in_progress → requires_check
in_progress → awaiting_external_response
in_progress → completed

requires_check → in_progress
requires_check → awaiting_external_response
requires_check → completed

awaiting_external_response → in_progress
awaiting_external_response → requires_check
awaiting_external_response → completed

completed → in_progress
completed → requires_check
completed → awaiting_external_response
```

### Запрещённые переходы

Возврат Progress в `not_started` из любого другого состояния запрещён в MVP. Пользователь не может сбросить прогресс шага. Это решение закрывает открытый вопрос из TS02 (раздел "Progress State Transitions").

Все переходы Progress — только явные пользовательские действия. Автоматические переходы запрещены.

Запрещены статусы Progress, выглядящие как официальное решение: `approved`, `rejected`, `accepted_by_authority`, `submitted_to_authority`, `documents_verified`, `documents_sufficient`, `ready_to_submit`, `automatically_checked`, `verified_by_nova_agent`.

Запрещены task-manager статусы: `priority`, `urgent`, `assigned`, `overdue`, `blocked_by_team`, `in_review`, `in_work_by_assignee`.

### History Event при изменении Progress

Каждое изменение Progress создаёт History Event с `event_type = 'progress_status_changed'`.

Progress является source of truth для текущего состояния шага. History Event фиксирует путь к этому состоянию, но не заменяет Progress.

### Связь Progress и User Open Question

Progress может быть связан с User Open Question, если вопрос объясняет причину статуса `requires_check` или `awaiting_external_response`.

Изменение Progress не закрывает User Open Question автоматически.

Изменение User Open Question не меняет Progress автоматически.

### Запрещённые операции с Progress

- Вернуть Progress в `not_started`;
- изменить Progress автоматически (без явного пользовательского действия);
- определять текущий статус шага из History вместо Progress state;
- хранить Progress в Scenario, Step Template или любой Content Model entity;
- использовать Progress как официальное подтверждение внешнего процесса.

## User Open Question Operations

### Создание User Open Question

Пользователь создаёт User Open Question явным действием внутри active Action Plan или как Plan-Creating Stateful Action (если план ещё не существует).

User Open Question создаётся только пользовательским действием. Автоматическое создание запрещено.

User Open Question не является копией Template Open Question. Если вопрос возник на основе Template Open Question, связь идёт через versioned Template Open Question context внутри Scenario Version — не через ссылку на live Template Open Question.

Создание User Open Question создаёт History Event с `event_type = 'user_open_question_created'`.

### Допустимые контексты привязки

User Open Question может быть связан с:

- Versioned Step Context внутри Scenario Version плана;
- Versioned Document Requirement Context;
- Versioned Data Requirement Context;
- Versioned Source Context (через Source Revision);
- Versioned Template Open Question Context — если вопрос создан на основе шаблонного;
- Progress state — если вопрос объясняет причину статуса `requires_check` или `awaiting_external_response`.

Все ссылки идут через versioned content context, не через live mutable content entities.

### Lifecycle: полный граф переходов состояний

В MVP User Open Question использует следующие состояния:

- `open` — вопрос зафиксирован, ещё не классифицирован;
- `requires_check` — пользователь считает вопрос требующим внешней проверки;
- `awaiting_external_response` — пользователь считает вопрос зависимым от ответа органа, учреждения или специалиста;
- `clarified_by_user` — пользователь считает вопрос выясненным (личная отметка, не официальный ответ);
- `irrelevant` — пользователь считает вопрос неприменимым в текущем контексте.

Ни одно из этих состояний не является официальным ответом, профессиональным решением или подтверждением Nova Agent.

Полный граф допустимых переходов MVP:

```
open → requires_check
open → awaiting_external_response
open → irrelevant

requires_check → awaiting_external_response
requires_check → clarified_by_user
requires_check → irrelevant

awaiting_external_response → clarified_by_user
awaiting_external_response → irrelevant

clarified_by_user → requires_check
```

Переход `clarified_by_user → requires_check` допустим, если пользователь считал вопрос выясненным, но позже столкнулся с новой неопределённостью по тому же вопросу.

Каждый переход состояния создаёт History Event с `event_type = 'user_open_question_status_changed'`.

### `irrelevant` как финальное состояние

`irrelevant` является финальным состоянием User Open Question в MVP.

Переход из `irrelevant` в любое активное состояние (`open`, `requires_check`, `awaiting_external_response`, `clarified_by_user`) запрещён.

Важное разграничение: `clarified_by_user` и `irrelevant` — разные конечные состояния с разной семантикой.

- `clarified_by_user` означает "я считаю, что выяснил это". Переход `clarified_by_user → requires_check` допустим, если позже возникла новая неопределённость по тому же вопросу.
- `irrelevant` означает "это ко мне не применимо". Из `irrelevant` возврат невозможен.

Если после перевода вопроса в `irrelevant` появляется новая неопределённость, пользователь создаёт **новый** User Open Question. Старый вопрос в состоянии `irrelevant` сохраняется в истории плана без изменений. Между старым и новым вопросом нет структурной связи на уровне данных — только временна́я близость событий в истории.

Это решение закрывает открытый вопрос из TS02 (раздел "User Open Question State Transitions") и TS03 (раздел "Cardinality Rules").

### Редактирование User Open Question

Пользователь может изменить формулировку или контекст привязки своего User Open Question в допустимых пределах.

Редактирование формулировки создаёт History Event с `event_type = 'user_open_question_edited'`.

Редактирование не должно:

- менять Scenario Version, с которой связан вопрос;
- переходить в состояния в нарушение lifecycle graph;
- создавать официальный факт или ответ специалиста.

### Запрещённые операции с User Open Question

- Переходить из `irrelevant` в любое активное состояние;
- автоматически закрывать User Open Question;
- автоматически изменять состояние User Open Question при изменении Progress;
- ссылаться на live Template Open Question вместо versioned context;
- трактовать `clarified_by_user` как официальный ответ или решение Nova Agent;
- создавать User Open Question вне Action Plan;
- читать User Open Questions другого пользователя.

## User Note Operations

### Создание User Note

User Note создаётся пользователем явным действием.

Создание User Note является Plan-Creating Stateful Action — если Action Plan не существует, создание User Note создаёт план.

Создание User Note создаёт History Event с `event_type = 'user_note_created'`.

`user_note_created` является аудит-событием, фиксирующим факт создания заметки. User Note FK указывает на context History Event — тот, к которому пользователь добавляет заметку, — а не на `user_note_created`. `user_note_created` не заменяет context event как FK-цель.

### Обязательная привязка к History Event

User Note не существует без привязки к History Event.

User Note получает контекст Scenario Version через History Event и Action Plan.

**FK-направление:** User Note FK указывает на context History Event — тот, к которому пользователь добавляет заметку. TS05 зафиксировал: один History Event может иметь несколько User Notes (cardinality N:1 от User Note к History Event). Это решение принято в TS05 и не является открытым вопросом перед TS08.

Допустимые context History Events, на которые может указывать User Note FK:

- `progress_status_changed` — заметка к изменению статуса шага;
- `user_open_question_created` — заметка к созданию вопроса;
- `user_open_question_status_changed` — заметка к изменению состояния вопроса;
- `user_open_question_edited` — заметка к редактированию вопроса;
- `source_checked` — заметка к отметке источника;
- `action_plan_created` — заметка к созданию плана;
- `action_plan_completed` — заметка к завершению плана.

`user_note_created` не входит в этот список: он является аудит-событием и не служит FK-целью.

Пример: пользователь изменил Progress → создан `progress_status_changed`. Пользователь добавил User Note к этому событию → User Note FK → `progress_status_changed` (context event). Дополнительно создаётся `user_note_created` аудит-событие. User Note не указывает FK на `user_note_created`.

History Event не обязан иметь обязательную обратную ссылку на User Note. Logical Data Model не должна создавать обязательный цикл History Event ↔ User Note.

### Lifecycle: created, edited, hidden/deleted

В MVP User Note поддерживает следующий lifecycle:

- `created` — заметка создана пользователем;
- `edited_by_user` — заметка отредактирована пользователем;
- `hidden_by_user` или `deleted_by_user` — заметка скрыта или удалена пользователем.

Каждая операция с lifecycle создаёт отдельный History Event:

- редактирование User Note → `event_type = 'user_note_edited'`;
- скрытие User Note → `event_type = 'user_note_hidden'`;
- удаление User Note → `event_type = 'user_note_deleted'`.

Скрытие или удаление User Note не удаляет History Event, к которому заметка была привязана.

Скрытие или удаление User Note не изменяет Progress, не закрывает User Open Question и не изменяет состояние Action Plan.

Физический способ реализации hide/delete (soft delete, flag, physical removal) остаётся решением перед написанием SQL.

### Запрещённые операции с User Note

- Создать User Note без привязки к History Event;
- создать User Note вне Action Plan;
- редактировать или удалять User Note от имени Content Admin;
- автоматически изменять или удалять User Note при обновлении Scenario Version;
- использовать User Note как источник информации или официальный факт;
- использовать User Note для автоматического закрытия User Open Questions;
- использовать User Note для автоматического изменения Progress;
- читать User Notes другого пользователя.

### Privacy-ограничения

User Note содержит произвольный текст пользователя и создаёт риск хранения персональных данных.

User Note не должна использоваться для:

- хранения пользовательских файлов, вложений, сканов, форм, официальной переписки;
- профилирования пользователя;
- автоматического принятия решений на основе содержания;
- поиска, индексирования или анализа содержания без отдельной privacy spec.

## Checked Source Mark Operations

### Создание Checked Source Mark

Пользователь создаёт Checked Source Mark явным действием отметки Source как проверенного.

Checked Source Mark создаётся только внутри уже существующего active Action Plan.

Создание Checked Source Mark создаёт History Event с `event_type = 'source_checked'`.

### Checked Source Mark не является Plan-Creating Stateful Action

Checked Source Mark **не является** Plan-Creating Stateful Action.

Если Action Plan не существует, попытка создать Checked Source Mark должна быть отклонена. Пользователь должен сначала создать Action Plan через один из утверждённых Plan-Creating Stateful Actions.

Это решение закрывает открытый вопрос из TS02 (раздел "Stateful Actions") и TS03 (раздел "Checked Source Mark Rules").

### Привязка к Source Revision context

Checked Source Mark привязан к конкретному Source Revision через Versioned Source Context внутри Scenario Version Action Plan.

Checked Source Mark не привязывается к live mutable Source entity.

### Checked Source Mark не подтверждает источник

Checked Source Mark является пользовательской отметкой, что источник был просмотрен в рамках прохождения плана.

Checked Source Mark не означает:

- что источник актуален на момент проверки;
- что информация источника применима к конкретному пользователю;
- что Nova Agent подтвердил содержание источника;
- что внешняя проверка официально завершена.

Запрещены статусы Checked Source Mark: `verified`, `valid`, `accepted`, `up_to_date`, `officially_confirmed`.

### Append-only инвариант

Checked Source Mark является неизменяемой записью в рамках MVP.

После создания Checked Source Mark не изменяется.

Content update не меняет смысл уже созданного Checked Source Mark.

### Запрещённые операции с Checked Source Mark

- Создать Checked Source Mark без существующего Action Plan;
- изменять или удалять Checked Source Mark после создания;
- трактовать Checked Source Mark как верификацию или официальное подтверждение источника;
- изменять Source Revision через Checked Source Mark;
- читать Checked Source Marks другого пользователя.

## History Event Operations

### Операции, создающие History Event

History Events создаются как системный результат пользовательских действий. Пользователь не создаёт History Event напрямую.

Минимальный обязательный набор event types MVP:

| Действие пользователя | event_type |
|---|---|
| Создание Action Plan | `action_plan_created` |
| Завершение Action Plan | `action_plan_completed` |
| Изменение статуса шага (Progress) | `progress_status_changed` |
| Создание Checked Source Mark | `source_checked` |
| Создание User Open Question | `user_open_question_created` |
| Изменение состояния User Open Question | `user_open_question_status_changed` |
| Редактирование формулировки User Open Question | `user_open_question_edited` |
| Создание User Note | `user_note_created` |
| Редактирование User Note | `user_note_edited` |
| Скрытие User Note | `user_note_hidden` |
| Удаление User Note | `user_note_deleted` |

Контентные операции Content Admin не создают History Events в пользовательском плане. Обновление Scenario Version не создаёт History Event в Action Plans, созданных на основе предыдущих версий.

### Минимальный payload по типам событий

Payload History Event должен быть минимальным и достаточным для восстановления контекста события после обновления Content Model.

Payload не должен превращать History Events в хранилище персональных данных, официальный журнал взаимодействия с органами или хранилище пользовательских файлов.

| event_type | Минимальный payload |
|---|---|
| `action_plan_created` | action_plan context, scenario_version context, stable_scenario_identity, selected_life_situation_context |
| `action_plan_completed` | action_plan context, scenario_version context |
| `progress_status_changed` | action_plan context, versioned_step_context, previous_status, new_status |
| `source_checked` | action_plan context, scenario_version context, versioned_source_context (через source_revision) |
| `user_open_question_created` | action_plan context, question context, optional versioned content context |
| `user_open_question_status_changed` | action_plan context, question context, previous_status, new_status |
| `user_open_question_edited` | action_plan context, question context |
| `user_note_created` | action_plan context, note context |
| `user_note_edited` | action_plan context, note context |
| `user_note_hidden` | action_plan context, note context |
| `user_note_deleted` | action_plan context, note context |

### Append-only инвариант

History Event является append-only записью.

После создания History Event не изменяется и не удаляется.

Content update не переписывает History Events.

Изменение History Event не пересчитывает Progress.

Удаление или скрытие User Note не удаляет History Event, к которому заметка привязана.

### Запрещённые операции с History Events

- Редактировать History Events;
- удалять History Events;
- использовать History как источник текущего состояния вместо Progress;
- создавать History Events из контентных операций Content Admin;
- трактовать History как официальный журнал взаимодействия с внешней стороной.

## Historical Context Rules

### Scenario Version Lock

Action Plan всегда связан с конкретной Scenario Version, выбранной в момент создания плана.

Обновление Content Model не меняет Scenario Version, с которой связан active Action Plan.

Активный план не переходит на новую Scenario Version автоматически после публикации нового контента.

Весь смысловой и исторический контекст Action Plan берётся через зафиксированную Scenario Version.

Progress, History Events, User Open Questions, User Notes, Checked Source Marks сохраняют связь с Scenario Version через Action Plan.

### Pattern B для active и completed планов

Пользователь может читать deprecated или superseded Scenario Version, если он имеет Action Plan (в состоянии `active` или `completed`) для этой Scenario Version.

Это уточняет RLS Pattern B из TS05 Amendment 03, распространяя его явно на `completed` планы.

Обоснование: пользователь с completed планом должен иметь возможность просматривать исторический контекст своего прохождения, даже если Scenario Version была deprecated или superseded после завершения плана.

Пользователь без Action Plan (active или completed) для данной deprecated/superseded Scenario Version читать её не может.

### Защита historical context от изменения контента

Обновление Scenario Version администратором не изменяет:

- Progress активных или completed планов;
- History Events;
- User Open Questions;
- User Notes;
- Checked Source Marks;
- смысл событий истории, зафиксированных в контексте предыдущей Scenario Version.

Новая Scenario Version создаёт новый контекст для новых Action Plans. Старые планы остаются в исходном Scenario Version контексте.

## Инварианты

Следующие инварианты не должны нарушаться в реализации:

1. **Action Plan Creation Gate.** Action Plan создаётся только для `publication_state = 'published'` Scenario Version. (TS05 Amendment 03)

2. **Plan-Creating Stateful Actions — исчерпывающий список.** Action Plan создаётся только через: Explicit Start Plan, Change Step Progress Status, Create User Open Question, Create User Note.

3. **One Active Plan Rule.** Один User — один active Action Plan на stable Scenario identity. Completed планы в этот лимит не входят.

4. **Version Lock.** Action Plan всегда связан с Scenario Version в момент создания. Обновление контента не меняет эту связь.

5. **History Append-Only.** History Events не редактируются и не удаляются никогда.

6. **Progress Is Source Of Truth.** Progress является единственным источником истины о текущем состоянии шага. History Events не заменяют Progress.

7. **No `not_started` Return.** Возврат Progress в `not_started` из любого другого состояния запрещён в MVP.

8. **No Automatic Transitions.** Все переходы состояний — только явные пользовательские действия. Автоматические переходы запрещены.

9. **`irrelevant` Is Final.** User Open Question в состоянии `irrelevant` не может перейти в активное состояние. Новая неопределённость = новый User Open Question.

10. **`clarified_by_user` Can Return.** User Open Question в состоянии `clarified_by_user` может перейти в `requires_check`, если возникла новая неопределённость. Это единственный допустимый возврат из terminal-like состояния.

11. **Action Plan States MVP-Only.** Допустимые состояния Action Plan: `active` и `completed`. Состояния `archived`, `hidden`, `deleted_by_user`, `reopened`, `restored` запрещены в MVP.

12. **No `reopened`.** Completed Action Plan не переоткрывается. `completed → active` запрещён.

13. **New Pass = New Entity.** Повторное прохождение Scenario создаёт новый Action Plan — отдельную сущность. Старый completed план не изменяется.

14. **Checked Source Mark Not Plan-Creating.** Checked Source Mark создаётся только внутри существующего Action Plan.

15. **Note Requires History Event.** User Note не существует без привязки к History Event.

16. **Pattern B Includes Completed Plans.** Пользователь с completed Action Plan может читать deprecated/superseded Scenario Version этого плана.

17. **Privacy Isolation.** Пользователь имеет доступ только к своим User-Owned Data. Чтение или запись чужих данных запрещены.

18. **No User Data In Content Model.** Progress, History Events, User Notes, User Open Questions, Checked Source Marks не хранятся в Scenario, Step Template, Document Requirement, Source или любой Content Model entity.

19. **Content Admin Cannot Access User-Owned Data.** Content Admin не имеет доступа к User-Owned Data пользователя. (Симметричный инвариант TS06.)

20. **User Cannot Access Content Admin Operations.** Пользователь не может создавать, изменять или удалять Content Model entities и не может публиковать Scenario Versions.

21. **Progress Does Not Confirm External Result.** Любой статус Progress — пользовательская отметка внутри Nova Agent. Не является подтверждением от органа, учреждения или специалиста.

22. **Source Mark Does Not Endorse Source.** Checked Source Mark не подтверждает актуальность, применимость или официальный статус источника.

23. **Context History Event Scope.** Context History Event у User Note должен принадлежать тому же Action Plan, что и User Note. User Note не может ссылаться на History Event из другого Action Plan.

## Запрещённые операции

### Нарушения правил создания Action Plan

- Создать Action Plan для Scenario Version с `publication_state != 'published'`;
- создать Checked Source Mark как Plan-Creating Stateful Action;
- создать второй active Action Plan для того же User и того же stable Scenario identity.

### Нарушения lifecycle Action Plan

- Переоткрыть completed Action Plan (`completed → active`);
- архивировать, скрыть или удалить Action Plan;
- автоматически перенести Action Plan на новую Scenario Version.

### Нарушения Progress

- Вернуть Progress в `not_started`;
- изменить Progress автоматически;
- использовать Progress statuses вне утверждённого MVP набора;
- определять текущий статус из History вместо Progress state.

### Нарушения User Open Question lifecycle

- Перейти из `irrelevant` в любое активное состояние;
- автоматически закрыть User Open Question;
- автоматически изменить User Open Question при изменении Progress;
- ссылаться на live Template Open Question вместо versioned context.

### Нарушения History Event

- Редактировать или удалять History Events;
- использовать History как источник текущего состояния;
- создавать History Events из контентных операций.

### Нарушения User Note

- Создать User Note без привязки к History Event;
- редактировать или удалять User Notes от имени Content Admin;
- автоматически изменять или удалять User Notes при обновлении контента.

### Нарушения Checked Source Mark

- Создать Checked Source Mark вне существующего Action Plan;
- изменять или удалять Checked Source Mark после создания;
- трактовать Checked Source Mark как официальную верификацию источника.

### Нарушения privacy и изоляции

- Читать или записывать User-Owned Data другого пользователя;
- пользователю получить доступ к Content Admin операциям;
- Content Admin получить доступ к User-Owned Data.

### Операции, требующие отдельной spec

- Вводить `archived`, `hidden`, `deleted_by_user`, `reopened`, `restored` для Action Plan;
- вводить `not_started` как допустимый целевой статус Progress;
- вводить переходы из `irrelevant` User Open Question;
- вводить хранение пользовательских файлов;
- вводить хранение заполненных персональных значений;
- вводить автоматическую миграцию плана на новую Scenario Version;
- вводить официальные статусы от внешних органов.

## Связи с TS01–TS06

### TS01 (Content Model & Versioning)

TS07 наследует:

- User-Owned Data не является частью Content Model;
- Content Admin не управляет User-Owned Data;
- Изменение Content Model не автоматически изменяет User-Owned Data;
- Action Plan всегда связан с конкретной Scenario Version;
- Published Scenario Version является immutable.

### TS02 (User-Owned Workflow Model)

TS07 операционализирует TS02 и закрывает все открытые lifecycle-решения, оставленные TS02 до Logical Data Model:

| Открытый вопрос TS02 | Решение в TS07 |
|---|---|
| Является ли `mark Source as checked` plan-creating action? | Нет (Решение 1) |
| Допустим ли переход `irrelevant → активное`? | Нет, `irrelevant` финальный (Решение 3) |
| Допустимы ли `archived`, `hidden`, `deleted_by_user`, `reopened`, `restored`? | Нет (Решение 4) |
| Может ли пользователь создать новый план после completion? | Да, как новый Action Plan (Решение 6) |
| Применяется ли one-active-plan rule по Scenario или Scenario Version? | По stable Scenario identity (Решение 7) |
| Допустим ли возврат Progress в `not_started`? | Нет (Инвариант 7) |
| Разрешено ли редактирование User Note? | Да, создаёт History Event (Инвариант TS03, подтверждён TS07) |
| Может ли edited/hidden/deleted User Note иметь History Event? | Да (event_types: user_note_edited, user_note_hidden, user_note_deleted) |

### TS03 (Logical Data Model)

TS07 согласован с TS03:

- Action Plan → User, stable Scenario identity, Scenario Version;
- Progress → Action Plan, Versioned Step Context;
- History Event → Action Plan, Scenario Version, event_type;
- User Open Question → Action Plan, Scenario Version, optional versioned context;
- User Note → User, Action Plan, History Event;
- Checked Source Mark → Action Plan, Scenario Version, Source Revision, History Event.

TS07 закрывает открытые cardinality вопросы TS03:

- "может ли User Open Question возвращаться из `irrelevant`" — нет;
- "может ли после completed Action Plan следовать другой Action Plan для той же stable Scenario identity" — да.

### TS04 (Auth, Roles & Ownership)

TS07 наследует:

- MVP roles: только `user` и `content_admin`;
- Пользователь владеет только своими User-Owned Data;
- Privacy isolation: пользователь не читает чужие данные;
- Content Admin не имеет доступа к User-Owned Data по умолчанию.

TS07 зеркалит TS06 со стороны пользователя: если TS06 фиксирует "Content Admin не может управлять User-Owned Data", TS07 фиксирует "User не может управлять Content Model".

### TS05 (Supabase Schema & RLS)

TS07 использует и уточняет:

- Action Plan Creation Gate (Amendment 03): только для published Scenario Version;
- RLS Pattern B (Amendment 03): уточнено — применяется к active И completed планам;
- Source Revision как контекст Checked Source Mark;
- Publication State Transition Graph (Amendment 02): пользователь не участвует в переходах publication_state.

Уточнение Pattern B является семантическим уточнением TS05 Amendment 03. Физический enforcement этого уточнения должен быть учтён при написании SQL.

### TS06 (Content Administration Operations)

TS07 является операционным зеркалом TS06.

TS06 описывает: что Content Admin может делать с Content Model.
TS07 описывает: что User может делать с User-Owned Data.

Ключевая симметрия:

- TS06: Content Admin не имеет доступа к User-Owned Data → TS07: User не имеет доступа к Content Model;
- TS06: publication operations создают `content_publication_events` → TS07: workflow operations создают History Events;
- TS06: published content immutable → TS07: History Events append-only.

## Риски

**Риск 1: Action Plan создан для non-published Scenario Version.**
Нарушение Action Plan Creation Gate (TS05 Amendment 03). Пользователь работает с черновым или устаревшим контентом. Критичность: высокая.

**Риск 2: Два active плана по одному Scenario.**
Нарушение one-active-plan rule. Прогресс дублируется, история раздваивается. Критичность: высокая.

**Риск 3: History Event редактирован или удалён.**
Нарушение append-only инварианта. Потеря исторического контекста. Критичность: высокая.

**Риск 4: Текущий Progress определяется из History вместо Progress state.**
Нарушение "Progress is source of truth". Архитектурная нестабильность. Критичность: высокая.

**Риск 5: Progress возвращается в `not_started`.**
Нарушение запрета возврата. Потеря прогресса пользователя. Критичность: средняя.

**Риск 6: `irrelevant` User Open Question реактивируется вместо создания нового вопроса.**
Нарушение "irrelevant is final". Нарушение принятого MVP-решения. Критичность: средняя.

**Риск 7: Pattern B ограничена только active планами.**
Пользователь с completed планом теряет доступ к Scenario Version своего исторического прохождения. Критичность: высокая.

**Риск 8: Checked Source Mark создаёт Action Plan.**
Нарушение Решения 1. Пользователь не осознаёт, что просмотр источника неявно начал план. Критичность: средняя.

**Риск 9: Checked Source Mark трактуется как верификация источника.**
Nova Agent обещает то, чего не может гарантировать. Критичность: средняя.

**Риск 10: User-owned data хранится в Content Model.**
Обновление Scenario Version сбрасывает прогресс. Нарушение разделения модели. Критичность: критическая.

**Риск 11: User Note создаётся без привязки к History Event.**
User Note превращается в произвольный блокнот вне пользовательского workflow. Критичность: средняя.

**Риск 12: User Note хранит чувствительные персональные данные.**
Пользователь может ввести паспортные данные, номера документов, банковские реквизиты в произвольное поле. Privacy-риск. Требует предупреждений на уровне UI-01. Критичность: средняя.

**Риск 13: `clarified_by_user` трактуется как официальный ответ.**
Nova Agent не должен подтверждать получение официального ответа от органа. Критичность: средняя.

**Риск 14: Content Admin изменяет User-Owned Data.**
Нарушение privacy инварианта из TS04/TS06. Критичность: высокая.

**Риск 15: Active план автоматически переходит на новую Scenario Version.**
Ретроактивное изменение пользовательского контекста. Критичность: высокая.

**Риск 16: Смешение Progress статуса шага и состояния Action Plan.**
`completed` используется и как статус шага (Progress), и как состояние плана (Action Plan). Реализация может перепутать эти уровни. TS07 всегда различает: Progress `completed` — шаг пройден пользователем; Action Plan `completed` — план завершён. Критичность: средняя.

## Решения перед TS08

### Уже принятые решения (закрыты в TS05)

Следующие вопросы, открытые в TS03, были закрыты в TS05. Они не требуют решения перед TS08 и не являются открытыми вопросами в TS07.

- **Cardinality User Note — History Event:** один History Event может иметь несколько User Notes (TS05). FK User Note → context History Event. Cardinality N:1 от User Note к History Event. Закрыто в TS05.
- **Initial Progress Strategy:** при создании Action Plan создаются Progress records для всех Versioned Step Context records с `status = 'not_started'`. Отдельный History Event на каждый initial `not_started` не создаётся. Закрыто в TS05.

### Открытые вопросы

Следующие вопросы остаются открытыми и должны быть решены до написания API Spec (TS08):

1. **Физическая реализация partial unique constraint** для одного active Action Plan на User на stable Scenario identity: partial unique index или trigger-based constraint.

2. **Физическая реализация hide/delete User Note:** soft-delete через флаг, физическое удаление с сохранением History Event, или другой механизм. Влияет на схему таблиц и RLS.

3. **Максимально допустимый объём User Note:** должен быть согласован между UI-01 и физической схемой до написания SQL.

4. **Enforcement Action Plan Creation Gate:** проверка `publication_state = 'published'` на уровне application logic или database constraint/trigger.

5. **Обработка race condition при создании плана:** как обеспечить атомарность при двух параллельных Plan-Creating Stateful Actions для одного User и одного Scenario.

6. **Физическое уточнение Pattern B в RLS:** текущая TS05 Amendment 03 описывает Pattern B без явного разграничения `active`/`completed`. Реализация SQL RLS должна явно включать оба состояния.

7. **Checked Source Mark uniqueness:** нужно решить, является ли Checked Source Mark уникальным per Action Plan + Source Revision (один mark на источник в плане) или повторные проверки источника создают несколько Checked Source Marks. Вопрос открыт в TS05. Влияет на uniqueness constraints схемы. Не смешивать с MVP decisions TS07.

## Критерии приёмки

Technical Spec 07 готов, если:

- User-Owned Workflow Operation определена как операция пользователя над User-Owned Data;
- TS07 явно отделён от Content Model operations (TS06);
- все 8 MVP-решений зафиксированы с явным указанием, какой открытый вопрос TS02/TS03 они закрывают;
- Plan-Creating Stateful Actions перечислены как исчерпывающий список;
- Checked Source Mark явно исключён из Plan-Creating Stateful Actions;
- Action Plan Creation Gate зафиксирован с явной ссылкой на TS05 Amendment 03;
- One Active Plan Rule описана: по stable Scenario identity, только active планы;
- механизм нового прохода (new pass = new Action Plan) описан явно;
- полный граф переходов Step Progress зафиксирован; запрет возврата в `not_started` явный;
- полный граф переходов User Open Question зафиксирован;
- `irrelevant` явно зафиксирован как финальное состояние с механизмом замены (новый вопрос);
- `clarified_by_user → requires_check` явно разрешён и семантически отделён от `irrelevant`;
- User Note lifecycle описан с тремя фазами: created, edited, hidden/deleted;
- каждая операция User Note lifecycle создаёт соответствующий History Event;
- минимальный payload по всем 11 event_types зафиксирован в таблице;
- History Events append-only инвариант явный;
- Pattern B уточнена: применяется к active и completed планам;
- Scenario Version Lock зафиксирован;
- инварианты перечислены (23 инварианта);
- запрещённые операции перечислены по группам;
- Риск 16 (смешение Progress `completed` и Action Plan `completed`) явно описан;
- риски перечислены;
- связи с TS01–TS06 описаны;
- User Note FK direction явно описан: FK → context History Event, не → `user_note_created`;
- cardinality User Note — History Event зафиксирован как N:1 (TS05 уже принял решение);
- initial Progress strategy зафиксирована: все records создаются при создании плана (TS05 уже принял решение);
- Checked Source Mark uniqueness вынесен как открытый вопрос перед TS08;
- уже принятые в TS05 вопросы не находятся в разделе "Открытые вопросы";
- решения перед TS08 перечислены;
- документ не содержит SQL, RLS, API, UI, Supabase implementation details;
- документ не вводит новые продуктовые функции вне утверждённых specs;
- документ не противоречит TS01–TS06, функциональным specs и AGENTS.md.
