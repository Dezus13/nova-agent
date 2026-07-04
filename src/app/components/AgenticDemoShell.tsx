import { useState } from "react";

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
  const [hasStartedVoiceDemo, setHasStartedVoiceDemo] = useState(false);
  const shouldShowDemoResponse = hasSubmittedDemoPrompt || hasStartedVoiceDemo;

  return (
    <section className="agentic-shell" aria-labelledby="agentic-shell-title">
      <div className="agentic-hero">
        <div className="agentic-shell-copy agentic-voice-intro">
          <p className="agentic-product-name">Nova Agent</p>
          <p className="agentic-assistant-label">
            AI-ассистент для жизненных ситуаций
          </p>
          <h2 id="agentic-shell-title">Скажите, что нужно решить</h2>
          <p className="lead">
            Nova Agent разложит жизненную ситуацию на понятный план действий.
          </p>
        </div>

        <div className="agentic-voice-stage" aria-label="Voice-first demo layer">
          <div className="agentic-orb" aria-hidden="true">
            <span />
          </div>
          <button
            className="primary-action agentic-voice-action"
            onClick={() => setHasStartedVoiceDemo(true)}
            type="button"
          >
            Демо голосового режима
          </button>
          <p>
            Голосовой режим показан как demo interaction. Голос не записывается
            в этой версии.
          </p>
        </div>
      </div>

      <div className="agentic-boundary" aria-label="Ограничения демо">
        <p className="agentic-boundary-title">Демо-режим</p>
        <p>Голос не записывается в этой версии.</p>
        <p>Ответ строится на текущем демонстрационном сценарии.</p>
        <p>Без real AI/OpenAI.</p>
        <p>Nova Agent не создаёт новые сценарии в этой версии.</p>
        <p>Не является юридическим, медицинским или налоговым консультантом.</p>
      </div>

      <div className="agentic-command-panel">
        <div>
          <p className="eyebrow">или напишите задачу вручную</p>
          <label htmlFor="agentic-demo-prompt">Жизненная задача</label>
        </div>
        <textarea
          aria-label="Жизненная задача"
          className="agentic-input"
          id="agentic-demo-prompt"
          onChange={(event) => {
            setHasStartedVoiceDemo(false);
            onDemoPromptChange(event.target.value);
          }}
          placeholder="Например: мне нужно оформить документы после рождения детей"
          rows={4}
          value={demoPrompt}
        />
        <p className="agentic-input-note">
          Пример задачи для текущего demo-сценария:
        </p>
        <button
          className="secondary-action agentic-example"
          onClick={() => {
            setHasStartedVoiceDemo(false);
            onExamplePromptSelect();
          }}
          type="button"
        >
          {agenticDemoExamplePrompt}
        </button>
        <button
          className="primary-action"
          onClick={() => {
            setHasStartedVoiceDemo(false);
            onSubmitDemoPrompt();
          }}
          type="button"
        >
          Построить план
        </button>
      </div>

      {shouldShowDemoResponse ? (
        <div className="agentic-summary" role="status">
          <p className="eyebrow">demo assistant response</p>
          <h3>Я понял ситуацию для демо</h3>
          <p>
            Сейчас открою понятный план действий на основе текущего
            демонстрационного сценария.
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
            Это демонстрационный ответ: без real AI/OpenAI, без записи голоса и
            без подтверждения официального статуса.
          </p>
          <p>
            Nova Agent не создаёт новые сценарии в этой версии и не выполняет
            внешние действия.
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
