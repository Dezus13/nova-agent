# Decision Record: API Layer Pre-Decisions

## Назначение документа

Этот документ фиксирует архитектурные решения, принятые перед написанием TS08 (API Layer Specification).

Каждое решение закрывает открытый вопрос, явно переданный в TS08 из TS05, TS06, TS07 или UI-01.

Документ является обязательным источником истины для TS08 и последующей реализации. Он не заменяет TS01–TS07 и UI-01, а дополняет их — фиксирует то, что эти документы оставили открытым.

Документ не содержит SQL, RLS, API endpoints, frontend code, backend code.

Документ не вводит новые сущности, роли, состояния или функции.

## Источники

Решения основаны на:

- `docs/specs/технические/01-content-model-and-versioning.md`
- `docs/specs/технические/02-user-owned-workflow-model.md`
- `docs/specs/технические/03-logical-data-model.md`
- `docs/specs/технические/04-auth-roles-and-ownership.md`
- `docs/specs/технические/05-supabase-schema-and-rls.md`
- `docs/specs/технические/06-content-administration-operations.md`
- `docs/specs/технические/07-user-owned-workflow-operations.md`
- `docs/specs/ui/01-ui-design-rules.md`

Если этот документ противоречит источнику более высокого уровня в иерархии `AGENTS.md`, приоритет имеет документ более высокого уровня.

Если этот документ явно закрывает вопрос, переданный из TS05–TS07 в TS08, данное решение обязательно в пределах TS08.

---

## DR-01: Checked Source Mark uniqueness и идемпотентность создания

**Дата:** 2026-06-19

**Решение:**

Checked Source Mark является уникальным per Action Plan и Source Revision. Один Action Plan может иметь не более одного Checked Source Mark для конкретной Source Revision.

Создание Checked Source Mark является идемпотентной операцией: если Checked Source Mark для данного Action Plan и Source Revision уже существует, повторная попытка создания возвращает существующую запись без создания новой.

**Основание:**

Семантика "я проверил этот источник" является бинарной в MVP — проверено или нет. Множественные marks для одного источника в одном плане не несут продуктовой ценности и создают неоднозначность в UI (какую дату отображать в "Вы отметили этот источник [дата]"?). Если пользователь хочет зафиксировать контекст повторной проверки, это может быть сделано через User Note к событию `source_checked`.

**Закрывает открытый вопрос из:**

- TS05 (Unique Constraint Model): "является ли Checked Source Mark уникальным per Action Plan and Source Revision или повторные source checks создают несколько marks."
- TS07 (Решения перед TS08, п. 7): "Checked Source Mark uniqueness."

**Следствие для TS08:**

Если Checked Source Mark для данного Action Plan + Source Revision уже существует, API возвращает `200 OK` с существующей записью. Если не существует — `201 Created` с новой записью.

---

## DR-02: Pattern B — scope и условие проверки

**Дата:** 2026-06-19

**Решение:**

Pattern B применяется к Action Plans в состоянии `active` и `completed`.

Проверка Pattern B выполняется по конкретной Scenario Version ID, не по stable Scenario identity.

Пользователь, имеющий Action Plan (`active` или `completed`) связанный с конкретной Scenario Version, может читать эту Scenario Version даже если её `publication_state` равен `deprecated` или `superseded`.

Пользователь без Action Plan к конкретной Scenario Version не может читать эту версию при `publication_state = 'deprecated'` или `'superseded'`.

**Основание:**

TS07 Решение 8 и Инвариант 16 явно распространили Pattern B на completed планы. TS05 Amendment 03 описал Pattern B без явного упоминания `completed` — TS07 уточнил. Проверка по конкретной Scenario Version ID необходима: пользователь с планом к V1 не должен получать доступ к deprecated V2, если у него нет плана к V2.

**Закрывает открытый вопрос из:**

- TS05 Amendment 03 (Pattern B без явного указания на `completed`).
- TS07 Решение 8: "Pattern B распространяется на active и completed планы."
- TS07 (Решения перед TS08, п. 6): "Физическое уточнение Pattern B в RLS."

**Следствие для TS08:**

API при запросе deprecated или superseded Scenario Version проверяет: существует ли у пользователя Action Plan с `status IN ('active', 'completed')` и `scenario_version_id = <запрошенная version>`. Если условие выполнено — возвращает контент и флаг `pattern_b: true` для формирования UI-предупреждения. Если условие не выполнено — возвращает 404.

---

## DR-03: Идемпотентность создания Action Plan

**Дата:** 2026-06-19

**Решение:**

Создание Action Plan является идемпотентной операцией.

Если пользователь выполняет Plan-Creating Stateful Action, а active Action Plan для данного пользователя и stable Scenario identity уже существует (в том числе вследствие параллельного запроса), API возвращает существующий план без создания нового.

**Основание:**

TS05 фиксирует partial unique constraint "один active Action Plan на User и stable Scenario identity." При параллельных запросах нарушение constraint должно обрабатываться как graceful идемпотентность: пользователь хочет план, а не ошибку. `409 Conflict` в этом случае неверно передаёт семантику пользователю.

**Закрывает открытый вопрос из:**

- TS07 (Решения перед TS08, п. 5): "Обработка race condition при создании плана."

**Следствие для TS08:**

При нарушении unique constraint при создании плана: API выполняет SELECT существующего active плана и возвращает `200 OK` с этим планом. Не `201`, не `409`.

---

## DR-04: Life Situation lifecycle state

**Дата:** 2026-06-19

**Решение:**

Life Situation не получает явный lifecycle state (`active` / `hidden` / `archived`) в MVP.

Видимость Life Situation для пользователя определяется API-фильтром: пользователю показываются только те Life Situations, с которыми связана хотя бы одна published Scenario Version. Life Situation без связанных published Scenario Versions не появляется в пользовательском каталоге.

**Основание:**

TS06 определяет операции над Life Situation как: создать, обновить metadata, управлять связями с Scenario. Нет publish/deprecate операций. Visibility уже контролируется через Scenario Version publication state. Добавление явного lifecycle state Life Situation требует изменения Content Model, отдельной spec и changelog-записи без продуктовой необходимости в MVP.

**Закрывает открытый вопрос из:**

- TS06 (Решения перед SQL, п. 4): "Lifecycle state для Life Situation entity: нужен ли явный state (active/hidden)."

**Следствие для TS08:**

Admin API не содержит endpoints для hide/publish Life Situation. User API фильтрует Life Situations по наличию linked published Scenario Version.

---

## DR-05: Scenario stable identity lifecycle state

**Дата:** 2026-06-19

**Решение:**

Scenario stable identity не получает явный lifecycle state (`active` / `archived`) в MVP.

Видимость Scenario для пользователя определяется через publication state его Scenario Versions. Scenario без published Scenario Version не появляется в пользовательском каталоге как точка создания нового плана.

**Основание:**

TS06 запрещает физическое удаление Scenario при наличии published Scenario Version или связанных User-Owned Data. Видимость Scenario уже достаточно управляется через publication state Scenario Versions. Явный lifecycle state stable identity потребует изменения Content Model без продуктовой необходимости в MVP.

**Закрывает открытый вопрос из:**

- TS06 (Решения перед SQL, п. 5): "Lifecycle state для Scenario entity: нужен ли явный state (active/archived)."

**Следствие для TS08:**

Admin API не содержит endpoint для archive/restore Scenario stable identity. User API показывает Scenario только при наличии published Scenario Version.

---

## DR-06: Content Admin audit trail

**Дата:** 2026-06-19

**Решение:**

`content_publication_events` являются достаточным audit trail для Content Admin в MVP.

Отдельный audit trail для CRUD-операций Content Admin над draft content entities (создание, редактирование, удаление Life Situations, Steps, Sources, Template OQ и т.д.) не входит в MVP.

**Основание:**

В MVP любой `content_admin` может публиковать независимо — review/approval workflow исключён (TS06). Черновые изменения не user-facing и не требуют attribution в MVP. Момент публикации — единственный audit-значимый момент. Расширение audit trail потребует новой схемы и API endpoints без соответствующей продуктовой необходимости.

**Условие пересмотра:** если в production среде одновременно работают несколько Content Admin с конфликтующими черновыми изменениями, это решение должно быть пересмотрено через отдельную spec.

**Закрывает открытый вопрос из:**

- TS06 (Решения перед SQL, п. 8): "Audit trail для Content Admin CRUD operations над draft content entities."

**Следствие для TS08:**

Admin API не содержит endpoints для просмотра CRUD audit trail черновых операций. `content_publication_events` читаются через отдельный read endpoint.

---

## DR-07: User Note в completed Action Plan

**Дата:** 2026-06-19

**Решение:**

В completed Action Plan операции с User Note разграничены по типу:

| Операция | Разрешена в completed плане |
|---|---|
| Редактирование текста (edit) | Запрещено |
| Скрытие (hide) | Разрешено |
| Удаление (delete) | Разрешено |

**Основание:**

Completed Action Plan является историческим контекстом. Изменение текста User Note ретроактивно меняет запись — несовместимо с принципом "completed = read-only historical record" (UI-01 Инвариант 18, аналог неизменяемости Progress в completed плане).

Hide и delete являются privacy-правом пользователя, не связанным с состоянием плана. Пользователь должен иметь возможность убрать собственный текст в любой момент. History Events `user_note_hidden` / `user_note_deleted` сохраняются — audit trail не нарушается.

**Закрывает открытый вопрос из:**

- TS07 (Решения перед TS08, п. 2): физическая изменяемость в completed плане.
- UI-01 (Part XII): "Изменяемость Notes/UOQ в completed плане."

**Следствие для TS08:**

Запрос на edit текста User Note в контексте completed плана → `403 Forbidden` с явным пояснением. Запросы на hide и delete User Note → разрешены в completed плане.

---

## DR-08: User Open Question в completed Action Plan

**Дата:** 2026-06-19

**Решение:**

В completed Action Plan User Open Question доступен только для чтения.

Изменение статуса UOQ и редактирование текста UOQ в completed Action Plan запрещены.

Post-completion UOQ resolution (возможность закрыть открытый вопрос после завершения плана) не входит в MVP. Это кандидат для V1.

**Основание:**

Изменение статуса UOQ создаёт History Event — это означало бы расширение истории completed плана после события `action_plan_completed`. Это нарушает семантику completed плана как закрытого контекста. Post-completion resolution имеет продуктовую ценность, но требует отдельного продуктового решения: что происходит с `action_plan_completed` как финальным событием, если история продолжается после него?

**Закрывает открытый вопрос из:**

- TS07 (Решения перед TS08): изменяемость User-Owned Data в completed плане.
- UI-01 (Part XII): "Изменяемость Notes/UOQ в completed плане."

**Следствие для TS08:**

Все write-операции на UOQ в контексте completed плана → `403 Forbidden`. Post-completion UOQ resolution → не входит в TS08; V1 candidate.

---

## DR-09: Auth contract scope в TS08

**Дата:** 2026-06-19

**Решение:**

TS08 описывает auth contract на уровне API, а не auth flow.

В scope TS08 входит:

- как API аутентифицирует входящие запросы (Bearer JWT);
- какие JWT claims API ожидает (`user_id`, role claim);
- как role определяется из token (explicit `content_admin` vs implicit `user`);
- семантика token refresh на уровне API contract.

Вне scope TS08:

- login, signup, password reset UI flows;
- OAuth provider configuration;
- email verification flow;
- auth UI screens.

**Основание:**

TS04 явно исключил из scope: physical auth provider, session model, password model, token model. Nova Agent использует Supabase Auth как инфраструктурный провайдер — детали этого провайдера не являются частью API spec. TS08 описывает только контракт, который API layer требует от auth token, а не механизм его получения.

**Закрывает открытый вопрос из:**

- UI-01 (Part XII): "Auth flow UI зависит от TS08 auth endpoints."

**Следствие для TS08:**

TS08 содержит один раздел "Auth contract" — не отдельный auth spec. Login/signup/password reset endpoints отсутствуют в API inventory TS08.

---

## Статус решений

| Decision | Дата | Статус | Передан в |
|---|---|---|---|
| DR-01: CSM uniqueness и idempotency | 2026-06-19 | ✓ Принято | TS08 |
| DR-02: Pattern B scope и условие | 2026-06-19 | ✓ Принято | TS08 |
| DR-03: Plan creation idempotency | 2026-06-19 | ✓ Принято | TS08 |
| DR-04: Life Situation lifecycle | 2026-06-19 | ✓ Принято | TS08 |
| DR-05: Scenario stable identity lifecycle | 2026-06-19 | ✓ Принято | TS08 |
| DR-06: Content Admin audit trail | 2026-06-19 | ✓ Принято | TS08 |
| DR-07: User Note в completed плане | 2026-06-19 | ✓ Принято | TS08 |
| DR-08: UOQ в completed плане | 2026-06-19 | ✓ Принято | TS08 |
| DR-09: Auth contract scope | 2026-06-19 | ✓ Принято | TS08 |

## Открытые вопросы, не закрытые этим документом

Следующие вопросы остаются открытыми и должны быть решены в рамках TS08:

- Pagination / infinite scroll strategy.
- Optimistic UI patterns (API response design).
- Real-time vs. polling для обновления History.
- Конкретные error codes и SLA.
- Routing strategy (route contracts).
- Physical implementation details: типы constraints, cascade delete mechanism, trigger types.

## Критерии приёмки

- [ ] Все 9 решений перечислены с явным обоснованием.
- [ ] Каждое решение указывает, какой открытый вопрос оно закрывает.
- [ ] Каждое решение имеет явное следствие для TS08.
- [ ] Документ не содержит SQL, RLS, API endpoints, код.
- [ ] Документ не вводит новые сущности, роли, состояния.
- [ ] Документ не противоречит TS01–TS07 и UI-01.
- [ ] Active plan и changelog обновлены.
