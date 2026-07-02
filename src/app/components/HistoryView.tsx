import type { PublishedScenarioVersion, Scenario } from "../../domain/content";
import type {
  ActionPlanAggregate,
  HistoryEvent,
  UserNote,
} from "../../domain/workflow";
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
  newUserNoteText,
  notes,
  onAddUserNote,
  onNewUserNoteTextChange,
  scenario,
  scenarioVersion,
}: {
  event: HistoryEvent;
  newUserNoteText: string;
  notes: readonly UserNote[];
  onAddUserNote: (historyEventId: string) => void;
  onNewUserNoteTextChange: (historyEventId: string, noteText: string) => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  const userNoteContext = (
    <section className="user-note-context" aria-labelledby={`notes-${event.id}`}>
      <div>
        <p className="eyebrow">Заметки к событию</p>
        <h4 id={`notes-${event.id}`}>Ваши заметки</h4>
        <p className="history-event-context">
          Не официальный документ. Не источник. Не ответ Nova Agent.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="history-event-context">Заметок к этому событию пока нет.</p>
      ) : (
        <ul className="user-note-list">
          {notes.map((note) => (
            <li className="user-note-item" key={note.id}>
              <p className="step-order">Ваша заметка</p>
              <p>{note.text}</p>
              <p className="history-event-context">
                Не официальный документ. Не источник. Не ответ Nova Agent.
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="user-note-form">
        <label htmlFor={`new-user-note-${event.id}`}>Короткая заметка</label>
        <textarea
          aria-label="Новая заметка"
          id={`new-user-note-${event.id}`}
          onChange={(changeEvent) =>
            onNewUserNoteTextChange(event.id, changeEvent.target.value)
          }
          rows={3}
          value={newUserNoteText}
        />
        <button
          className="secondary-action"
          type="button"
          onClick={() => onAddUserNote(event.id)}
        >
          Добавить заметку
        </button>
      </div>
    </section>
  );

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
        {userNoteContext}
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
        {userNoteContext}
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
        {userNoteContext}
      </li>
    );
  }

  if (event.eventType === "source_checked") {
    const source = scenarioVersion.sources.find(
      (candidate) => candidate.id === event.payload.sourceRevisionId,
    );

    return (
      <li className="history-event">
        <div className="history-event-heading">
          <div>
            <p className="eyebrow">Отметка источника</p>
            <h3>Источник отмечен вами</h3>
          </div>
          <time dateTime={event.occurredAt}>
            {formatHistoryTimestamp(event.occurredAt)}
          </time>
        </div>
        <p>
          Внутренняя запись Nova Agent: вы отметили, что проверили источник
          {source ? ` «${source.title}»` : ""}.
        </p>
        <p className="history-event-context">
          Nova Agent не проверяет источник. Это не официальный статус. Это не
          подтверждение действия.
        </p>
        {userNoteContext}
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
    {userNoteContext}
  </li>
  );
}

export function HistoryView({
  actionPlan,
  newUserNoteTextByHistoryEventId,
  onAddUserNote,
  onBack,
  onNewUserNoteTextChange,
  scenario,
  scenarioVersion,
  userNotes,
}: {
  actionPlan: ActionPlanAggregate;
  newUserNoteTextByHistoryEventId: Readonly<Record<string, string>>;
  onAddUserNote: (historyEventId: string) => void;
  onBack: () => void;
  onNewUserNoteTextChange: (historyEventId: string, noteText: string) => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
  userNotes: readonly UserNote[];
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
              newUserNoteText={newUserNoteTextByHistoryEventId[event.id] ?? ""}
              notes={userNotes.filter((note) => note.historyEventId === event.id)}
              onAddUserNote={onAddUserNote}
              onNewUserNoteTextChange={onNewUserNoteTextChange}
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
