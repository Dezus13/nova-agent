import { useEffect, useRef, useState } from "react";

export const agenticDemoExamplePrompt =
  "Мне нужно зарегистрировать место жительства в Австрии";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onstart: (() => void) | null;
  abort?: () => void;
  start: () => void;
  stop?: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type VoiceInputState =
  | "denied"
  | "error"
  | "idle"
  | "listening"
  | "requesting"
  | "result"
  | "unsupported";

function getSpeechRecognitionConstructor() {
  const speechGlobal = globalThis as typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

  return speechGlobal.SpeechRecognition ?? speechGlobal.webkitSpeechRecognition;
}

function getVoiceStatusMessage(
  voiceInputState: VoiceInputState,
  voiceInputError: string | null,
) {
  const errorLabel = voiceInputError
    ? `Ошибка голосового ввода: ${voiceInputError}.`
    : "Ошибка голосового ввода.";

  switch (voiceInputState) {
    case "requesting":
      return "Браузер может запросить доступ к микрофону.";
    case "listening":
      return "Слушаю... скажите, что нужно решить.";
    case "result":
      return "Распознанный текст добавлен в задачу.";
    case "unsupported":
      return "Голосовой ввод недоступен в этом браузере. Напишите задачу вручную.";
    case "denied":
      return `${errorLabel} Доступ к микрофону не получен. Можно написать задачу вручную.`;
    case "error":
      if (voiceInputError === "audio-capture") {
        return `${errorLabel} Проверьте доступ Chrome к микрофону. Можно написать задачу вручную.`;
      }

      return `${errorLabel} Не удалось распознать речь. Можно попробовать ещё раз или написать задачу вручную.`;
    case "idle":
      return "Голосовой ввод работает в браузере, если он поддерживается.";
  }
}

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
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [voiceInputState, setVoiceInputState] =
    useState<VoiceInputState>("idle");
  const [voiceInputError, setVoiceInputError] = useState<string | null>(null);
  const shouldShowDemoResponse =
    hasSubmittedDemoPrompt || voiceInputState === "result";

  const resetVoiceInputState = () => {
    setVoiceInputState("idle");
    setVoiceInputError(null);
  };

  const detachRecognitionCallbacks = (recognition: BrowserSpeechRecognition) => {
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.onstart = null;
  };

  const clearActiveRecognition = (recognition: BrowserSpeechRecognition) => {
    if (recognitionRef.current !== recognition) {
      return false;
    }

    recognitionRef.current = null;
    detachRecognitionCallbacks(recognition);
    return true;
  };

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;

      if (!recognition) {
        return;
      }

      recognitionRef.current = null;
      detachRecognitionCallbacks(recognition);

      if (recognition.abort) {
        recognition.abort();
        return;
      }

      recognition.stop?.();
    };
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      return;
    }

    setVoiceInputError(null);
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      setVoiceInputState("unsupported");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = globalThis.navigator?.language || "ru-RU";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      setVoiceInputState("listening");
    };
    recognition.onresult = (event) => {
      if (!clearActiveRecognition(recognition)) {
        return;
      }

      const transcript = event.results[0]?.[0]?.transcript.trim() ?? "";

      if (!transcript) {
        setVoiceInputError("empty-transcript");
        setVoiceInputState("error");
        return;
      }

      onDemoPromptChange(transcript);
      setVoiceInputState("result");
    };
    recognition.onerror = (event) => {
      if (!clearActiveRecognition(recognition)) {
        return;
      }

      const errorCode = event.error || "unknown";
      setVoiceInputError(errorCode);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceInputState("denied");
        return;
      }

      setVoiceInputState("error");
    };
    recognition.onend = () => {
      if (!clearActiveRecognition(recognition)) {
        return;
      }

      setVoiceInputError("ended-without-result");
      setVoiceInputState("error");
    };

    recognitionRef.current = recognition;
    setVoiceInputState("requesting");

    try {
      recognition.start();
    } catch {
      clearActiveRecognition(recognition);
      setVoiceInputError("start-failed");
      setVoiceInputState("denied");
    }
  };

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
            onClick={startVoiceInput}
            type="button"
          >
            Говорить
          </button>
          <p className="agentic-voice-kicker">Демо голосового режима</p>
          <p>{getVoiceStatusMessage(voiceInputState, voiceInputError)}</p>
        </div>
      </div>

      <div className="agentic-boundary" aria-label="Ограничения демо">
        <p className="agentic-boundary-title">Демо-режим</p>
        <p>Голос используется только для ввода текста в этом демо.</p>
        <p>Голосовой ввод работает в браузере, если он поддерживается.</p>
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
            resetVoiceInputState();
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
            resetVoiceInputState();
            onExamplePromptSelect();
          }}
          type="button"
        >
          {agenticDemoExamplePrompt}
        </button>
        <button
          className="primary-action"
          onClick={() => {
            resetVoiceInputState();
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
            Это демонстрационный ответ: без real AI/OpenAI, без подтверждения
            официального статуса и без внешних действий.
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
