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
      <div className="agentic-shell-copy">
        <p className="eyebrow">Демо-режим</p>
        <h2 id="agentic-shell-title">Что вам нужно решить?</h2>
        <p className="lead">
          Опишите задачу, и Nova Agent покажет демонстрационный путь на основе
          текущего сценария.
        </p>
        <div className="agentic-boundary">
          <p>
            Это demo-only вход: пример задачи сопоставляется только на основе
            текущего демонстрационного сценария.
          </p>
          <p>Nova Agent не создаёт новые сценарии в этой версии.</p>
        </div>
      </div>

      <div className="agentic-command-panel">
        <label htmlFor="agentic-demo-prompt">Пример задачи</label>
        <input
          aria-label="Пример задачи"
          className="agentic-input"
          id="agentic-demo-prompt"
          onChange={(event) => onDemoPromptChange(event.target.value)}
          placeholder={agenticDemoExamplePrompt}
          type="text"
          value={demoPrompt}
        />
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
          <p className="eyebrow">Понял ситуацию для демо</p>
          <h3>Готов открыть демонстрационный план</h3>
          <p>
            На основе текущего демонстрационного сценария Nova Agent откроет
            готовый план.
          </p>
          <p>Nova Agent не создаёт новые сценарии в этой версии.</p>
          <button
            className="primary-action"
            onClick={onOpenWorkflow}
            type="button"
          >
            Открыть план
          </button>
        </div>
      ) : null}
    </section>
  );
}
