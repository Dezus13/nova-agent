import {
  getAllowedUserOpenQuestionStatusTransitions,
  type UserOpenQuestion,
  type UserOpenQuestionStatus,
} from "../../domain/workflow";

const userOpenQuestionBoundaryCopy =
  "Nova Agent не отвечает на этот вопрос. Проверьте информацию через официальный или другой надёжный источник.";

export function UserOpenQuestionsView({
  newQuestionText,
  onAddQuestion,
  onNewQuestionTextChange,
  onUpdateQuestionStatus,
  userOpenQuestions,
}: {
  newQuestionText: string;
  onAddQuestion: () => void;
  onNewQuestionTextChange: (questionText: string) => void;
  onUpdateQuestionStatus: (
    questionId: string,
    targetStatus: UserOpenQuestionStatus,
  ) => void;
  userOpenQuestions: readonly UserOpenQuestion[];
}) {
  return (
    <section className="plan-steps-section" aria-labelledby="user-open-questions-title">
      <p className="eyebrow">Открытые вопросы</p>
      <h3 id="user-open-questions-title">Ваши открытые вопросы</h3>
      <p className="section-intro">
        Это ваши вопросы для внешней проверки. Они не являются ответами Nova Agent
        или официальным статусом.
      </p>

      {userOpenQuestions.length === 0 ? (
        <p>У вас пока нет открытых вопросов.</p>
      ) : (
        <div className="plan-step-list">
          {userOpenQuestions.map((question, index) => {
            const allowedStatuses = getAllowedUserOpenQuestionStatusTransitions(
              question.status,
            );
            const statusOptions = [question.status, ...allowedStatuses];
            const statusControlId = `user-open-question-status-${index + 1}`;

            return (
              <article className="plan-step-row" key={question.id}>
                <div>
                  <p className="step-order">Ваш вопрос</p>
                  <h4>{question.questionText}</h4>
                  <p>{userOpenQuestionBoundaryCopy}</p>
                </div>
                <div className="plan-step-actions">
                  <dl className="progress-mark" aria-label="User Open Question status">
                    <dt>Статус</dt>
                    <dd>
                      <span>Ваша отметка</span>
                      <strong>{question.status}</strong>
                    </dd>
                  </dl>
                  <label htmlFor={statusControlId}>Изменить статус вопроса</label>
                  <select
                    disabled={allowedStatuses.length === 0}
                    id={statusControlId}
                    onChange={(event) =>
                      onUpdateQuestionStatus(
                        question.id,
                        event.target.value as UserOpenQuestionStatus,
                      )
                    }
                    value={question.status}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="progress-actions">
        <label htmlFor="new-user-open-question">Новый вопрос</label>
        <textarea
          aria-label="Новый открытый вопрос"
          id="new-user-open-question"
          onChange={(event) => onNewQuestionTextChange(event.target.value)}
          rows={3}
          value={newQuestionText}
        />
        <button className="secondary-action" type="button" onClick={onAddQuestion}>
          Добавить вопрос
        </button>
      </div>
    </section>
  );
}
