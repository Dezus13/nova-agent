# Technical Spec 02: User-Owned Workflow Model

## Назначение документа

Документ фиксирует user-owned workflow model Nova Agent перед переходом к Logical Data Model.

Цель документа — определить:

- какие пользовательские сущности образуют workflow прохождения сценария;
- какие действия пользователя создают Action Plan и связанные пользовательские сущности;
- какие состояния входят в MVP;
- какие переходы состояний допустимы;
- какие события должны фиксироваться в истории;
- какие связи обязательны для сохранения контекста Scenario Version;
- какие инварианты не должны нарушаться в следующих technical specs.

Документ не описывает Supabase, SQL, таблицы, API, RLS, UI, код, инфраструктуру или физическое хранение данных.

## Источники и приоритет документов

Technical Spec 02 основан на следующих документах:

1. `docs/бизнес-контекст.md`
2. `docs/глобальная-спецификация.md`
3. `docs/техническая-архитектура.md`
4. `docs/specs/технические/01-content-model-and-versioning.md`
5. `docs/specs/функции/06-прогресс.md`
6. `docs/specs/функции/07-история-действий.md`
7. `docs/specs/функции/09-план-действий.md`
8. `docs/specs/функции/10-открытые-вопросы.md`
9. `docs/specs/функции/11-пользовательские-заметки.md`

Если этот документ противоречит документу более высокого уровня, приоритет имеет документ более высокого уровня.

Technical Spec 02 не создаёт новые продуктовые функции. Он технически уточняет user-owned workflow в рамках уже утверждённых функций MVP.

## Связь с Technical Spec 01

Technical Spec 01 зафиксировал Content Model, User-Owned Data и роль Scenario Version.

Technical Spec 02 наследует следующие правила:

- User-Owned Workflow Model живёт поверх конкретной Scenario Version.
- Action Plan всегда связан с конкретной Scenario Version.
- Action Plan не может быть создан только на основе live Scenario.
- User-owned workflow не должен ссылаться напрямую на mutable live content.
- Обновление контента не должно менять Action Plan, Progress, History, User Open Question, User Note или Checked Source Mark.
- User-owned entities не получают content-version сами по себе, но сохраняют связь со Scenario Version и versioned content context.
- Admin content не управляет user-owned workflow.

Technical Spec 02 не меняет правила версионности контента, публикации контента или immutable Scenario Version.

## Границы документа

Входит в документ:

- User-Owned Workflow Model;
- user-owned workflow entities;
- stateful actions;
- Action Plan как root user-owned workflow;
- MVP states Action Plan;
- Progress states;
- User Open Question states;
- History Event как append-only historical record;
- required MVP behavior User Note;
- Checked Source Mark как supporting workflow entity;
- обязательные и запрещённые связи;
- решения, которые нужно принять до Logical Data Model.

## Что не входит в документ

В документ не входит:

- Supabase;
- SQL;
- таблицы;
- RLS;
- API;
- UI;
- код;
- auth implementation;
- physical storage;
- exact database fields;
- content publishing workflow;
- source revision final schema;
- document upload;
- file storage;
- external integrations;
- notifications;
- reminders;
- deadlines;
- arbitrary tasks;
- task priorities;
- assigned users;
- automatic official checks;
- automatic migration of active plans to a new Scenario Version.

## Термины и определения

### User-Owned Workflow Model

User-Owned Workflow Model — пользовательский слой прохождения сценария, который возникает после stateful-действия пользователя и живёт поверх конкретной Scenario Version.

Он описывает не содержание сценария, а пользовательское состояние прохождения.

### User-Owned Workflow Entity

User-Owned Workflow Entity — сущность, которая создаётся или изменяется действием пользователя внутри Action Plan.

Такая сущность может ссылаться на Scenario Version и versioned content context, но не изменяет Content Model.

### Stateful Action

Stateful Action — действие пользователя, которое создаёт или изменяет user-owned workflow state.

Простой просмотр сценария не является stateful action.

### Current State

Current State — текущее пользовательское состояние workflow-сущности.

В MVP текущим состоянием шага внутри плана является Progress.

### Historical Record

Historical Record — событие, которое фиксирует, что изменилось внутри плана.

В MVP historical record представлен History Event.

## User-Owned Workflow Model

User-Owned Workflow Model описывает пользовательское прохождение выбранного сценария.

Модель строится вокруг последовательности:

```text
User
↓
Action Plan
↓
Progress + User Open Questions + Checked Source Marks
↓
History Events
↓
User Notes
```

Action Plan является root user-owned workflow.

Progress показывает текущее состояние шагов внутри Action Plan.

History Event фиксирует события, которые произошли внутри Action Plan.

User Open Question фиксирует вопрос пользователя для внешней проверки.

User Note фиксирует короткий пользовательский контекст рядом с History Event.

Checked Source Mark фиксирует, что пользователь отметил источник как проверенный в рамках Action Plan.

## User-Owned Workflow Entities

К User-Owned Workflow Model относятся:

- User;
- Action Plan;
- Plan Lifecycle State;
- Progress;
- History Event;
- User Open Question;
- User Note;
- Checked Source Mark;
- User Action.

Эти сущности не являются Content Model.

Они могут ссылаться на Scenario Version и versioned content context, но не должны изменять сценарии, шаги, источники, документы, требования к данным или Template Open Questions.

## Entities Outside User-Owned Workflow Model

В User-Owned Workflow Model не входят:

- Life Situation как content entity;
- Scenario;
- Scenario Version;
- Step Template;
- Document Requirement;
- Data Requirement;
- Source;
- Source Revision или Source Snapshot;
- Template Open Question;
- Warning;
- Restriction;
- Applicability Condition;
- content publishing state;
- content administration metadata.

Эти сущности могут быть контекстом пользовательского workflow, но не становятся пользовательскими сущностями.

## Workflow Ownership Rules

User-owned workflow принадлежит пользователю.

Action Plan, Progress, History Event, User Open Question, User Note и Checked Source Mark существуют только в пользовательском контексте прохождения Scenario Version.

Admin content не управляет user-owned workflow.

Администратор контента не может:

- создавать пользовательские Action Plans;
- менять Progress пользователя;
- переписывать History Events;
- создавать, менять или закрывать User Open Questions пользователя;
- создавать, редактировать, скрывать или удалять User Notes пользователя;
- создавать или менять Checked Source Marks пользователя;
- переносить пользовательский workflow на новую Scenario Version.

## Stateful Actions

Action Plan не создаётся от простого просмотра сценария.

Пользователь может просматривать Scenario Version, шаги, документы, источники и Template Open Questions без создания Action Plan.

Action Plan создаётся при первом stateful action внутри выбранного сценария.

К stateful actions относятся:

- start plan;
- change step progress status;
- mark step completed;
- create User Open Question;
- add User Note.

`mark Source as checked` не является автоматическим plan-creating action по умолчанию.

Если Action Plan уже существует, пользователь может отметить Source как checked внутри этого плана.

Если Action Plan ещё не существует, создание Checked Source Mark может создать Action Plan только если Spec 02 явно принимает это действие как stateful action для MVP.

До такого решения отметка Source как checked допустима только внутри уже созданного Action Plan.

Stateful action должен относиться к конкретной Scenario Version.

Если Action Plan уже существует и находится в state `active`, новое stateful action должно относиться к существующему active Action Plan.

## Action Plan As Workflow Root

Action Plan является root user-owned workflow.

Action Plan связывает:

- User;
- selected Life Situation context;
- stable Scenario identity;
- Scenario Version;
- Progress;
- History Events;
- User Open Questions;
- User Notes;
- Checked Source Marks.

Action Plan не является Content Model.

Action Plan не является live Scenario.

Action Plan может хранить stable Scenario identity для группировки, uniqueness и связи с пользовательским списком планов.

Смысловой и исторический контекст Action Plan всегда берётся через Scenario Version.

Action Plan не создаёт новый сценарий, новые шаги или новые content requirements.

Action Plan не должен ссылаться только на live Scenario.

Нельзя использовать прямую ссылку на mutable live Scenario как источник пользовательского контекста.

Action Plan всегда связан с конкретной Scenario Version и selected Life Situation context.

Selected Life Situation context нужен, чтобы сохранить пользовательский входной контекст, потому что один Scenario может быть связан с несколькими Life Situations.

Точный способ сохранения selected Life Situation context должен быть выбран в Logical Data Model.

## Action Plan MVP States

В MVP у Action Plan есть только следующие утверждённые состояния:

- `active`;
- `completed`.

`active` означает, что пользователь начал прохождение Scenario Version и план ещё не завершён.

`completed` означает, что пользователь явно завершил прохождение плана или отметил все применимые для себя шаги как выполненные.

Завершение плана является пользовательской отметкой внутри Nova Agent.

Завершение плана не означает:

- что внешний орган принял документы;
- что заявление подано;
- что официальный ответ получен;
- что требование применимо к пользователю;
- что результат внешнего процесса достигнут;
- что специалист подтвердил правильность действий.

`not_created` не является persisted state. Если пользователь только просматривает сценарий, Action Plan не существует.

## Action Plan Open Lifecycle Decisions

Следующие состояния не являются утверждёнными MVP states:

- `archived`;
- `hidden`;
- `deleted_by_user`;
- `reopened`;
- `restored`.

Эти состояния могут быть добавлены только после отдельного решения до Logical Data Model.

Перед Logical Data Model нужно решить:

- может ли пользователь архивировать завершённый план;
- может ли пользователь скрыть активный или завершённый план;
- существует ли user-visible deletion для Action Plan;
- может ли пользователь восстановить hidden или archived plan;
- может ли completed plan быть reopened;
- может ли пользователь создать новый plan после completion по тому же Scenario.

## One Active Plan Per Scenario Rule

В MVP по одному Scenario допускается только один active Action Plan на пользователя.

Если у пользователя уже есть active Action Plan по выбранному Scenario, дальнейшие stateful actions должны относиться к существующему active Action Plan.

Создание второго active Action Plan по тому же Scenario для того же пользователя не входит в MVP.

Перед Logical Data Model нужно уточнить, применяется ли это правило по stable Scenario identity или по Scenario Version.

До принятия этого решения нельзя проектировать повторное прохождение завершённого сценария как утверждённое MVP-поведение.

## Progress Model

Progress — текущее пользовательское состояние шага внутри Action Plan.

Progress принадлежит Action Plan и относится к versioned step context внутри Scenario Version.

Progress не является:

- Content Model;
- Step Template;
- History Event;
- User Open Question;
- официальным статусом внешнего процесса;
- подтверждением внешней стороны;
- task-manager workflow.

Progress является source of truth для текущего состояния шага внутри Action Plan.

History Event может фиксировать изменение Progress, но не заменяет Progress.

## Progress States

В MVP используются только следующие Progress states:

- `not_started`;
- `in_progress`;
- `awaiting_external_response`;
- `completed`;
- `requires_check`.

Эти состояния являются пользовательскими отметками внутри Nova Agent.

Они не означают, что внешний орган, учреждение или специалист принял действие, документ, заявление или решение.

Запрещены состояния, которые выглядят как официальное решение или автоматический вывод Nova Agent:

- `approved`;
- `rejected`;
- `accepted_by_authority`;
- `submitted_to_authority`;
- `documents_verified`;
- `documents_sufficient`;
- `ready_to_submit`;
- `automatically_checked`;
- `verified_by_nova_agent`.

Запрещены task-manager states:

- `priority`;
- `urgent`;
- `assigned`;
- `overdue`;
- `blocked_by_team`;
- `in_review`;
- `in_work_by_assignee`.

## Progress State Transitions

Progress state changes must be user actions.

Допустимые переходы MVP:

- `not_started` -> `in_progress`;
- `not_started` -> `requires_check`;
- `not_started` -> `awaiting_external_response`;
- `not_started` -> `completed`;
- `in_progress` -> `requires_check`;
- `in_progress` -> `awaiting_external_response`;
- `in_progress` -> `completed`;
- `requires_check` -> `in_progress`;
- `requires_check` -> `awaiting_external_response`;
- `requires_check` -> `completed`;
- `awaiting_external_response` -> `in_progress`;
- `awaiting_external_response` -> `requires_check`;
- `awaiting_external_response` -> `completed`;
- `completed` -> `in_progress`;
- `completed` -> `requires_check`;
- `completed` -> `awaiting_external_response`.

Возврат в `not_started` не утверждён как MVP transition.

Перед Logical Data Model нужно решить, допустим ли reset to `not_started` как explicit user correction.

Каждое изменение Progress должно создавать History Event.

## Progress And External Dependencies

Состояния `requires_check` и `awaiting_external_response` показывают внешнюю зависимость.

Они не означают, что Nova Agent получил внешний ответ, проверил требование или подтвердил результат.

Progress может быть связан с User Open Question, если вопрос объясняет причину состояния:

- `requires_check`;
- `awaiting_external_response`.

Изменение Progress не закрывает User Open Question автоматически.

Закрытие или изменение User Open Question не меняет Progress автоматически.

## History Event Model

History Event — append-only historical record внутри Action Plan.

History Event отвечает на вопрос: что произошло в пользовательском workflow и в каком контексте.

History Event не является:

- current state;
- Progress;
- User Note;
- User Open Question;
- Source;
- официальным журналом взаимодействия с органом, учреждением или специалистом;
- доказательством внешнего действия;
- хранилищем пользовательских документов или структурированных персональных данных.

History Event должен сохранять контекст Scenario Version.

History Event не должен переписываться после обновления контента.

## History Event Types

`event_type` обязателен концептуально.

Минимальный набор event types MVP:

- `action_plan_created`;
- `action_plan_completed`;
- `progress_status_changed`;
- `source_checked`;
- `user_open_question_created`;
- `user_open_question_status_changed`;
- `user_open_question_edited`;
- `user_note_created`.

Следующие event types зависят от open lifecycle decisions и не являются обязательными MVP types, пока решение не принято:

- `action_plan_archived`;
- `action_plan_hidden`;
- `action_plan_reopened`;
- `user_note_edited`;
- `user_note_hidden`;
- `user_note_deleted`;
- `user_note_restored`.

Перед Logical Data Model нужно утвердить полный enum History Event types.

## History Event Immutability

History Event является append-only record.

После создания History Event не должен изменяться задним числом.

Content update не должен переписывать History Event.

Изменение History Event не должно пересчитывать Progress.

Удаление или скрытие User Note не должно удалять History Event, к которому заметка была привязана.

## History Event Payload Boundaries

History Event должен иметь минимальный payload, достаточный для восстановления контекста события.

Payload может фиксировать:

- тип события;
- Action Plan context;
- Scenario Version context;
- affected workflow entity;
- previous state и new state, если событие связано с изменением состояния;
- versioned step context, если событие связано с шагом;
- source context, если событие связано с проверкой источника;
- User Open Question context, если событие связано с вопросом;
- User Note context, если событие связано с созданием заметки.

Payload не должен превращать History в:

- документальное хранилище;
- официальный журнал;
- хранилище внешних ответов;
- хранилище пользовательских файлов;
- хранилище заполненных персональных значений;
- профессиональное заключение.

Точный состав payload должен быть принят до Logical Data Model.

## User Open Question Model

User Open Question — пользовательский вопрос для внешней проверки внутри Action Plan.

User Open Question принадлежит Action Plan и Scenario Version.

User Open Question может быть связан с:

- versioned Template Open Question context внутри Scenario Version;
- versioned Step context внутри Scenario Version;
- versioned Document Requirement context внутри Scenario Version;
- versioned Data Requirement context внутри Scenario Version;
- versioned Source context внутри Scenario Version;
- Progress state, если вопрос объясняет внешнюю зависимость.

User Open Question не должен ссылаться на mutable live Document Requirement, Data Requirement, Source или Step.

Если User Open Question связан с требованием, источником или шагом, связь должна сохранять versioned context inside Scenario Version.

User Open Question не является:

- консультацией;
- ответом;
- официальным решением;
- источником факта;
- Progress;
- History Event;
- User Note;
- task.

User Open Question не должен ссылаться на live Template Open Question.

Обновление Template Open Question в новой Scenario Version не меняет User Open Question в active Action Plan.

## User Open Question States

В MVP User Open Question использует следующие состояния:

- `open`;
- `requires_check`;
- `awaiting_external_response`;
- `clarified_by_user`;
- `irrelevant`.

`open` означает, что вопрос существует и ещё не закрыт пользователем.

`requires_check` означает, что пользователь считает вопрос требующим внешней проверки.

`awaiting_external_response` означает, что пользователь считает вопрос зависимым от ответа органа, учреждения или специалиста.

`clarified_by_user` означает только пользовательскую отметку о том, что он считает вопрос выясненным.

`irrelevant` означает пользовательскую отметку, что вопрос больше не применим в текущем контексте плана.

Ни одно из этих состояний не является официальным ответом или профессиональным решением.

## User Open Question State Transitions

Допустимые переходы MVP:

- `open` -> `requires_check`;
- `open` -> `awaiting_external_response`;
- `open` -> `irrelevant`;
- `requires_check` -> `awaiting_external_response`;
- `requires_check` -> `clarified_by_user`;
- `requires_check` -> `irrelevant`;
- `awaiting_external_response` -> `clarified_by_user`;
- `awaiting_external_response` -> `irrelevant`;
- `clarified_by_user` -> `requires_check`, если появилась новая неопределённость.

User Open Question не должен переходить между состояниями автоматически.

Изменение состояния User Open Question должно быть пользовательским действием.

Возврат из `irrelevant` в активное состояние не утверждён.

Перед Logical Data Model нужно решить, разрешён ли переход:

- `irrelevant` -> `open`;
- `irrelevant` -> `requires_check`.

## User Open Question And Progress

User Open Question может объяснять, почему Progress находится в состоянии:

- `requires_check`;
- `awaiting_external_response`.

User Open Question не является Progress.

Progress не является User Open Question.

Изменение Progress не закрывает User Open Question автоматически.

Изменение User Open Question не меняет Progress автоматически.

History Event может фиксировать изменение User Open Question как событие.

Изменение History Event не должно менять User Open Question автоматически.

## User Note Model

User Note — короткая пользовательская запись для восстановления контекста рядом с событием внутри Action Plan.

User Note принадлежит User и Action Plan.

User Note указывает на History Event.

Через History Event и Action Plan User Note получает контекст Scenario Version.

User Note не является:

- источником информации;
- документом;
- требованием к данным;
- открытым вопросом;
- History Event;
- консультацией;
- официальным фактом;
- ответом специалиста;
- дневником;
- хранилищем файлов;
- хранилищем структурированных персональных данных.

## User Note Required MVP Behavior

В MVP обязательно:

- User Note создаётся пользователем;
- User Note связана с Action Plan;
- User Note связана с History Event;
- User Note не существует вне Action Plan;
- User Note не существует вне History Event;
- создание User Note создаёт History Event;
- User Note не редактируется администратором контента;
- User Note не изменяется автоматически;
- content update не меняет User Note.

User Note должна оставаться коротким supporting context.

User Note не должна превращаться в личный дневник или хранилище пользовательских данных.

## User Note Open Lifecycle Decisions

Следующие lifecycle decisions не утверждены этим документом как обязательное MVP-поведение:

- разрешено ли редактирование User Note;
- разрешено ли скрытие User Note;
- разрешено ли удаление User Note;
- является ли удаление физическим удалением, скрытием или user-visible deletion mark;
- можно ли восстановить скрытую User Note;
- может ли одно History Event иметь несколько User Notes;
- какой максимальный объём User Note допустим;
- какой audit trail нужен при редактировании User Note.

Если редактирование, скрытие или удаление User Note будет разрешено, каждое такое действие должно создавать History Event и не должно удалять исходный исторический контекст.

## User Note And History Event Direction

User Note указывает на History Event.

History Event не обязан иметь обязательную обратную ссылку на User Note.

Logical Data Model не должен создавать обязательную циклическую зависимость History Event <-> User Note.

Создание User Note создаёт History Event.

Если будут утверждены редактирование, скрытие или удаление User Note, эти действия также должны фиксироваться как History Events.

Удаление или скрытие User Note не должно удалять History Event.

## Checked Source Mark Model

Checked Source Mark — supporting workflow entity внутри Action Plan.

Checked Source Mark фиксирует, что пользователь отметил Source как проверенный в контексте конкретного Action Plan.

Checked Source Mark должен сохранять:

- Action Plan context;
- Scenario Version context;
- Source revision или source snapshot context;
- History Event context.

Checked Source Mark не является:

- Source;
- изменением Source;
- подтверждением актуальности Source;
- официальным фактом;
- результатом проверки Nova Agent;
- доказательством внешнего действия.

Минимальный lifecycle Checked Source Mark:

- `created`;
- `recorded`.

Не вводятся статусы:

- `verified`;
- `valid`;
- `accepted`;
- `up_to_date`;
- `officially_confirmed`.

Content update не должен менять смысл уже созданного Checked Source Mark.

## Current State Vs Historical Record

Progress является current state шага внутри Action Plan.

History Event является historical record.

User Open Question имеет current state вопроса.

Action Plan имеет current state плана.

User Note является supporting context рядом с History Event, но не заменяет событие.

Current state и historical record нельзя смешивать:

- History Event не определяет текущий Progress;
- Progress не является журналом событий;
- User Note не является History Event;
- User Open Question не является Progress;
- Checked Source Mark не является Source.

## Actions That Create Entities

Следующие user actions могут создавать Action Plan, если он ещё не существует:

- start plan;
- change step progress status;
- mark step completed;
- create User Open Question;
- add User Note.

`mark Source as checked` не создаёт Action Plan автоматически по умолчанию.

Checked Source Mark создаётся только внутри уже существующего Action Plan, если отдельное решение в этом документе не утвердит его как plan-creating stateful action.

Следующие user actions создают User Open Question:

- create User Open Question inside Action Plan;
- create User Open Question while viewing Scenario Version, if this action first creates Action Plan.

Следующие user actions создают User Note:

- add User Note to History Event;
- add User Note in step, question or checked source context, if a History Event exists or is created for that action.

Следующие user actions создают Checked Source Mark:

- mark Source as checked inside Action Plan.

Progress может создаваться:

- при первом изменении статуса шага;
- при создании Action Plan, если следующие specs решат создавать initial progress states.

Initial progress creation strategy должна быть решена до Logical Data Model.

## Actions That Create History Events

History Event должен создаваться для следующих user actions:

- Action Plan created;
- Action Plan completed;
- Progress status changed;
- Source checked;
- User Open Question created;
- User Open Question status changed;
- User Open Question edited;
- User Note created.

History Event должен создаваться для следующих действий, если они будут утверждены:

- Action Plan archived;
- Action Plan hidden;
- Action Plan reopened;
- User Note edited;
- User Note hidden;
- User Note deleted;
- User Note restored.

Content update не создаёт History Event в пользовательском плане автоматически.

Admin content action не создаёт user-owned History Event.

## Mandatory Relationships

Обязательные связи:

- Action Plan -> User;
- Action Plan -> selected Life Situation context;
- Action Plan -> stable Scenario identity;
- Action Plan -> Scenario Version;
- Progress -> Action Plan;
- Progress -> versioned step context;
- History Event -> Action Plan;
- History Event -> Scenario Version;
- History Event -> User или actor context;
- History Event -> event type;
- User Open Question -> Action Plan;
- User Open Question -> Scenario Version;
- User Note -> User;
- User Note -> Action Plan;
- User Note -> History Event;
- Checked Source Mark -> Action Plan;
- Checked Source Mark -> Scenario Version;
- Checked Source Mark -> source revision или source snapshot context;
- Checked Source Mark -> History Event.

Если пользовательская сущность зависит от content context, связь должна идти через Scenario Version или versioned content context.

Stable Scenario identity может использоваться для группировки и uniqueness, но не заменяет Scenario Version как источник смыслового и исторического контекста.

## Forbidden Relationships

Запрещённые связи:

- Action Plan -> live Scenario only;
- Action Plan -> mutable live content without Scenario Version;
- Progress -> live Step Template only;
- User Open Question -> live Template Open Question;
- User-Owned Workflow Entity -> mutable live content without Scenario Version context;
- mandatory cycle History Event <-> User Note;
- User Note -> Source as source of truth;
- User Note -> Document Requirement as user document;
- User Open Question -> professional answer;
- Progress -> official external status;
- Checked Source Mark -> Source mutation;
- History Event -> current state authority;
- Admin Content -> user-owned workflow write access.

## Scenario Version Context Requirements

Every Action Plan must preserve Scenario Version context.

Every Progress state must be interpretable in the context of the Scenario Version used by the Action Plan.

Every History Event must preserve Scenario Version context.

Every User Open Question must preserve Scenario Version context.

Every User Note must preserve Scenario Version context through History Event and Action Plan.

Every Checked Source Mark must preserve Scenario Version and source revision or source snapshot context.

User-owned workflow must not bypass Scenario Version by linking only to mutable live content.

## Privacy And Minimal Data Constraints

User-owned workflow data must be minimal.

Action Plan stores only the user context needed to restore workflow state.

Progress stores only user progress status and related context.

History Event stores only minimal event context.

User Open Question stores only a question for external verification, not an answer.

User Note stores only short supporting context near an event.

Checked Source Mark stores only the user mark that a source was checked in the plan context.

User-owned workflow must not store:

- user files;
- uploaded documents;
- scans;
- attachments;
- filled official forms;
- structured personal values;
- official correspondence;
- official answers as product-confirmed facts;
- professional conclusions.

## Forbidden Task Manager Patterns

User-owned workflow must not become a task manager.

Forbidden patterns:

- arbitrary user-created steps;
- subtasks outside Scenario Version;
- priorities;
- due dates;
- reminders;
- assignees;
- team workflow;
- task ownership transfer;
- blocked-by-team states;
- kanban-like workflow states.

Action Plan remains a user-owned instance of Scenario Version, not an open-ended task system.

## Forbidden Official Status Patterns

Nova Agent must not represent user-owned workflow states as official external statuses.

Forbidden patterns:

- approved;
- rejected;
- submitted to authority;
- accepted by authority;
- documents verified;
- documents sufficient;
- decision received;
- ready to submit;
- verified by Nova Agent;
- automatically determined;
- official answer received as product fact.

External outcomes remain outside Nova Agent.

User may record limited personal context, but Nova Agent must not turn it into an official fact.

## Invariants

The following invariants must not be violated:

- User-Owned Workflow Model lives on top of a specific Scenario Version.
- Action Plan is the root user-owned workflow.
- Viewing a scenario does not create Action Plan.
- The first stateful action creates Action Plan.
- Action Plan is always linked to User, Scenario Version and selected Life Situation context.
- Action Plan does not link only to live Scenario.
- User-owned workflow does not link directly to mutable live content.
- Content update does not change Action Plan, Progress, History, User Open Question, User Note or Checked Source Mark.
- Progress is the current state of a step inside Action Plan.
- History Event is an append-only historical record, not current state.
- User Open Question is not consultation, answer or official decision.
- User Note is not Source, Document, Open Question, diary or data storage.
- Checked Source Mark is a user-owned mark inside Action Plan, not confirmation of source actuality.
- Admin content does not manage user-owned workflow.
- One user cannot have more than one active Action Plan per Scenario in MVP.
- Action Plan completion does not mean completion of an external process.
- User Open Question state changes do not automatically change Progress.
- Progress changes do not automatically close User Open Question.
- History Event changes do not recalculate Progress.
- User Note does not create a mandatory cycle with History Event.

## Decisions Required Before Logical Data Model

Before Logical Data Model, the project must decide:

- whether one active plan rule applies by Scenario or by Scenario Version;
- whether completed Action Plan can be reopened;
- whether completed Action Plan can be archived;
- whether Action Plan can be hidden;
- whether Action Plan can have user-visible deletion;
- whether hidden or archived Action Plan can be restored;
- whether a user can create a new Action Plan after completing a previous one for the same Scenario;
- whether Progress can reset to `not_started`;
- whether initial Progress states are created when Action Plan is created or only after first status change;
- full History Event type enum for MVP;
- minimal History Event payload for each event type;
- whether every state transition always creates History Event;
- whether User Note can be edited;
- whether User Note can be hidden;
- whether User Note can be deleted;
- whether one History Event can have multiple User Notes;
- maximum allowed size of User Note;
- whether User Open Question can transition from `irrelevant` back to an active state;
- exact user actions that change User Open Question state;
- how Checked Source Mark relates to History Event;
- how selected Life Situation context is preserved.

## Questions Deferred To Technical Spec 03

Technical Spec 03 should decide Logical Data Model details after this workflow model is accepted.

Deferred questions:

- logical entity attributes;
- logical relationship cardinality;
- logical identity strategy;
- exact enum naming;
- exact required or optional fields;
- uniqueness constraints;
- ordering rules;
- representation of hidden, deleted or archived states if approved;
- source revision or source snapshot logical model;
- versioned content reference representation;
- logical separation between content-owned and user-owned groups.

Technical Spec 03 must not use these deferred questions to change the lifecycle decisions made in Technical Spec 02.

## Risks Of Incorrect Implementation

Main risks:

- Action Plan becomes a task manager.
- User creates arbitrary steps outside Scenario Version.
- Progress becomes an official external status.
- History Event becomes the source of current state.
- History Event is edited or deleted in a way that rewrites past context.
- User Note becomes a diary or data storage.
- User Open Question becomes consultation or answer.
- Checked Source Mark becomes confirmation of source actuality.
- Content update changes active user workflow.
- New Scenario Version automatically migrates active Action Plan.
- Admin content edits user-owned workflow.
- User Open Question links to live Template Open Question.
- User-owned workflow links to mutable live content.
- Action Plan completion is interpreted as completion of an external process.
- History Event and User Note form a mandatory cyclic dependency.

## Acceptance Criteria

Technical Spec 02 is ready if:

- User-Owned Workflow Model is defined as living on top of a specific Scenario Version;
- Action Plan is defined as root user-owned workflow;
- viewing a scenario does not create Action Plan;
- first stateful action creates Action Plan;
- Action Plan is always linked to User, Scenario Version and selected Life Situation context;
- Action Plan does not link only to live Scenario;
- user-owned workflow does not link directly to mutable live content;
- content update does not change Action Plan, Progress, History, User Open Question, User Note or Checked Source Mark;
- Action Plan MVP states are limited to `active` and `completed`;
- `archived`, `hidden`, `deleted_by_user`, `reopened` and `restored` are not presented as approved MVP states;
- Progress states use only the approved MVP set;
- User Open Question states use only the approved MVP set;
- User Note hidden/delete behavior is marked as open lifecycle decision;
- History Event is append-only historical record;
- `event_type` is conceptually required for History Event;
- Checked Source Mark is described as supporting workflow entity, not source verification;
- mandatory relationships are listed;
- forbidden relationships are listed;
- decisions before Logical Data Model are listed;
- document does not describe Supabase, SQL, tables, API, RLS, UI or code.
