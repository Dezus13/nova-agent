export const agenticDemoExamplePrompt =
  "Мне нужно зарегистрировать место жительства в Австрии";

export function AgenticDemoShell({
  demoPrompt,
  hasSubmittedDemoPrompt,
  onDemoPromptChange,
  onExamplePromptSelect,
  onOpenWorkflow,
  onSubmitDemoPrompt,
}: {
  demoPrompt: string;
  hasSubmittedDemoPrompt: boolean;
  onDemoPromptChange: (prompt: string) => void;
  onExamplePromptSelect: () => void;
  onOpenWorkflow: () => void;
  onSubmitDemoPrompt: () => void;
}) {
  return (
    <section className="agentic-shell" aria-labelledby="agentic-shell-title">
      <div className="agentic-hero">
        <div className="agentic-shell-copy">
          <p className="eyebrow">Демо-режим</p>
          <p className="agentic-product-name">Nova Agent</p>
          <h2 id="agentic-shell-title">AI-ассистент для жизненных ситуаций</h2>
          <p className="lead">
            Расскажите, что нужно решить. Nova Agent разложит ситуацию на
            понятный план действий.
          </p>
        </div>

        <div className="agentic-boundary" aria-label="Ограничения демо">
          <p className="agentic-boundary-title">Честные границы демо</p>
          <p>Ответ строится на текущем демонстрационном сценарии.</p>
          <p>Nova Agent не создаёт новые сценарии в этой версии.</p>
          <p>Без real AI/OpenAI в этой версии.</p>
          <p>Не является юридическим, медицинским или налоговым консультантом.</p>
        </div>
      </div>

      <div className="agentic-command-panel">
        <div>
          <p className="eyebrow">Что вам нужно решить?</p>
          <label htmlFor="agentic-demo-prompt">Жизненная задача</label>
        </div>
        <textarea
          aria-label="Жизненная задача"
          className="agentic-input"
          id="agentic-demo-prompt"
          onChange={(event) => onDemoPromptChange(event.target.value)}
          placeholder="Например: мне нужно оформить документы после рождения детей"
          rows={4}
          value={demoPrompt}
        />
        <p className="agentic-input-note">
          Пример задачи для текущего demo-сценария:
        </p>
        <button
          className="secondary-action agentic-example"
          onClick={onExamplePromptSelect}
          type="button"
        >
          {agenticDemoExamplePrompt}
        </button>
        <button
          className="primary-action"
          onClick={onSubmitDemoPrompt}
          type="button"
        >
          Построить план
        </button>
      </div>

      {hasSubmittedDemoPrompt ? (
        <div className="agentic-summary" role="status">
          <p className="eyebrow">AI-like demo response</p>
          <h3>Понял ситуацию для демо</h3>
          <p>
            Вы хотите разобраться с жизненной задачей и увидеть понятную
            последовательность действий.
          </p>
          <div className="agentic-response-grid">
            <div>
              <span>Основа ответа</span>
              <strong>Текущий демонстрационный сценарий</strong>
            </div>
            <div>
              <span>Следующий шаг</span>
              <strong>Открыть существующий Action Plan</strong>
            </div>
          </div>
          <p>
            На основе текущего демонстрационного сценария Nova Agent откроет
            готовый план действий.
          </p>
          <p>
            Nova Agent не создаёт новые сценарии в этой версии и не подтверждает
            официальный статус.
          </p>
          <button
            className="primary-action"
            onClick={onOpenWorkflow}
            type="button"
          >
            Открыть план действий
          </button>
        </div>
      ) : null}
    </section>
  );
}
