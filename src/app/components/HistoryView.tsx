import type { PublishedScenarioVersion, Scenario } from "../../domain/content";
import type { ActionPlanAggregate, HistoryEvent } from "../../domain/workflow";
import {
  BoundaryNotice,
  historyBoundaryCopy,
  planBoundaryCopy,
} from "./BoundaryNotice";
import { progressStatusLabels } from "./ProgressBadge";

function formatHistoryTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function HistoryEventItem({
  event,
  scenario,
  scenarioVersion,
}: {
  event: HistoryEvent;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  if (event.eventType === "action_plan_created") {
    return (
      <li className="history-event">
        <div className="history-event-heading">
          <div>
            <p className="eyebrow">Создание плана</p>
            <h3>План создан</h3>
          </div>
          <time dateTime={event.occurredAt}>
            {formatHistoryTimestamp(event.occurredAt)}
          </time>
        </div>
        <p>{`Создан ваш план для Scenario «${scenario.title}» на основе Scenario Version ${scenarioVersion.versionLabel}.`}</p>
      </li>
    );
  }

  if (event.eventType === "user_open_question_created") {
    return (
      <li className="history-event">
        <div className="history-event-heading">
          <div>
            <p className="eyebrow">Ваш вопрос</p>
            <h3>Открытый вопрос добавлен</h3>
          </div>
          <time dateTime={event.occurredAt}>
            {formatHistoryTimestamp(event.occurredAt)}
          </time>
        </div>
        <p>{`Внутренняя запись Nova Agent: добавлен ваш вопрос для внешней проверки — «${event.payload.questionText}».`}</p>
        <p className="history-event-context">
          Это не официальный ответ, не официальный статус и не консультация.
          Проверьте вопрос через официальный или другой надёжный источник.
        </p>
      </li>
    );
  }

  if (event.eventType === "user_open_question_status_changed") {
    return (
      <li className="history-event">
        <div className="history-event-heading">
          <div>
            <p className="eyebrow">Изменение вашего вопроса</p>
            <h3>Статус вопроса изменён</h3>
          </div>
          <time dateTime={event.occurredAt}>
            {formatHistoryTimestamp(event.occurredAt)}
          </time>
        </div>
        <p>{`Ваша отметка по вопросу изменилась: «${event.payload.previousStatus}» → «${event.payload.newStatus}».`}</p>
        <p className="history-event-context">
          <strong>Связанный вопрос:</strong> {event.payload.questionText}
        </p>
        <p className="history-event-context">
          Это внутренняя история Nova Agent, а не официальный журнал,
          официальный статус или подтверждение внешнего действия.
        </p>
      </li>
    );
  }

  const step = scenarioVersion.steps.find(
    (candidate) => candidate.id === event.payload.versionedStepContextId,
  );

  if (!step) {
    throw new Error("History Event references an unavailable Scenario step.");
  }

  const transitionLabel = `Ваша отметка изменилась: «${progressStatusLabels[event.payload.previousStatus]}» → «${progressStatusLabels[event.payload.newStatus]}».`;
  const stepLabel = `Step ${step.order}: ${step.title}`;

  return (
    <li className="history-event">
      <div className="history-event-heading">
        <div>
          <p className="eyebrow">Изменение вашей отметки</p>
          <h3>Отметка шага изменена</h3>
        </div>
        <time dateTime={event.occurredAt}>
          {formatHistoryTimestamp(event.occurredAt)}
        </time>
      </div>
      <p>{transitionLabel}</p>
      <p className="history-event-context">
        <strong>Связанный шаг:</strong> {stepLabel}
      </p>
    </li>
  );
}

export function HistoryView({
  actionPlan,
  onBack,
  scenario,
  scenarioVersion,
}: {
  actionPlan: ActionPlanAggregate;
  onBack: () => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  const chronologicalEvents = [...actionPlan.historyEvents].sort((left, right) =>
    left.occurredAt.localeCompare(right.occurredAt),
  );

  return (
    <section className="plan-view" aria-labelledby="history-title">
      <header className="history-header">
        <p className="eyebrow">Ваш план · History</p>
        <h2 id="history-title">История плана</h2>
        <p>{`${scenario.title} · Scenario Version ${actionPlan.actionPlan.scenarioVersionLabel}`}</p>
        <BoundaryNotice className="history-boundary">{historyBoundaryCopy}</BoundaryNotice>
      </header>

      <section className="history-section" aria-labelledby="history-events-title">
        <p className="eyebrow">Хронология</p>
        <h3 id="history-events-title">События в порядке создания</h3>
        <ol className="history-list">
          {chronologicalEvents.map((event) => (
            <HistoryEventItem
              event={event}
              key={event.id}
              scenario={scenario}
              scenarioVersion={scenarioVersion}
            />
          ))}
        </ol>
      </section>

      <BoundaryNotice>{planBoundaryCopy}</BoundaryNotice>
      <button className="secondary-action" type="button" onClick={onBack}>
        Вернуться к плану
      </button>
    </section>
  );
}
