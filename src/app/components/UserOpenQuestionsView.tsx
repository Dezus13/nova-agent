import type { UserOpenQuestion } from "../../domain/workflow";

const userOpenQuestionBoundaryCopy =
  "Nova Agent не отвечает на этот вопрос. Проверьте информацию через официальный или другой надёжный источник.";

export function UserOpenQuestionsView({
  userOpenQuestions,
}: {
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
          {userOpenQuestions.map((question) => (
            <article className="plan-step-row" key={question.id}>
              <div>
                <p className="step-order">Ваш вопрос</p>
                <h4>{question.questionText}</h4>
                <p>{userOpenQuestionBoundaryCopy}</p>
              </div>
              <dl className="progress-mark" aria-label="User Open Question status">
                <dt>Статус</dt>
                <dd>
                  <strong>{question.status}</strong>
                </dd>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
