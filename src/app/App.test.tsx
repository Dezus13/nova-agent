import React, { type ReactElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import {
  createUserOpenQuestion,
  startActionPlan,
  updateProgressStatus,
  type ActionPlanAggregate,
  type CheckedSourceMark,
  type UserNote,
  type UserOpenQuestion,
} from "../domain/workflow";
import { App } from "./App";
import { agenticDemoExamplePrompt } from "./components/AgenticDemoShell";

type HookDispatcher = {
  useEffect(
    effect: () => (() => void) | undefined,
    deps?: readonly unknown[],
  ): void;
  useRef<Value>(initialValue: Value): { current: Value };
  useState<State>(
    initialState: State | (() => State),
  ): [State, (nextState: State | ((previousState: State) => State)) => void];
};

type ReactClientInternals = {
  H: HookDispatcher | null;
};

type ReactWithClientInternals = typeof React & {
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?:
    | ReactClientInternals
    | undefined;
};

type HostNode = {
  children: TestTree[];
  props: Record<string, unknown>;
  type: string;
};

type TestTree = HostNode | number | string;

type TestSpeechRecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type TestSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: TestSpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  abort?: () => void;
  start: () => void;
  stop?: () => void;
};

type TestSpeechRecognitionConstructor = new () => TestSpeechRecognition;

type TestSpeechRecognitionGlobal = typeof globalThis & {
  SpeechRecognition?: TestSpeechRecognitionConstructor;
  webkitSpeechRecognition?: TestSpeechRecognitionConstructor;
};

function speechRecognitionGlobal() {
  return globalThis as TestSpeechRecognitionGlobal;
}

function createInteractiveRuntime() {
  const stateSlots: unknown[] = [];
  let stateSlotIndex = 0;

  const dispatcher: HookDispatcher = {
    useEffect(effect: () => (() => void) | undefined, deps?: readonly unknown[]) {
      const slotIndex = stateSlotIndex;
      stateSlotIndex += 1;
      const previousEffect = stateSlots[slotIndex] as
        | { cleanup?: () => void; deps?: readonly unknown[] }
        | undefined;
      const shouldRunEffect =
        !previousEffect ||
        !deps ||
        !previousEffect.deps ||
        deps.length !== previousEffect.deps.length ||
        deps.some((dependency, index) => dependency !== previousEffect.deps?.[index]);

      if (!shouldRunEffect) {
        return;
      }

      previousEffect?.cleanup?.();
      stateSlots[slotIndex] = {
        cleanup: effect(),
        deps,
      };
    },
    useRef<Value>(initialValue: Value) {
      const slotIndex = stateSlotIndex;
      stateSlotIndex += 1;

      if (!(slotIndex in stateSlots)) {
        stateSlots[slotIndex] = { current: initialValue };
      }

      return stateSlots[slotIndex] as { current: Value };
    },
    useState<State>(initialState: State | (() => State)) {
      const slotIndex = stateSlotIndex;
      stateSlotIndex += 1;

      if (!(slotIndex in stateSlots)) {
        stateSlots[slotIndex] =
          typeof initialState === "function"
            ? (initialState as () => State)()
            : initialState;
      }

      const setState = (nextState: State | ((previousState: State) => State)) => {
        const previousState = stateSlots[slotIndex] as State;
        stateSlots[slotIndex] =
          typeof nextState === "function"
            ? (nextState as (previousState: State) => State)(previousState)
            : nextState;
      };

      return [stateSlots[slotIndex] as State, setState];
    },
  };

  return {
    dispatcher,
    getState<State>(slotIndex: number) {
      return stateSlots[slotIndex] as State;
    },
    cleanupEffects() {
      for (const slot of stateSlots) {
        const effectSlot = slot as { cleanup?: () => void } | undefined;

        effectSlot?.cleanup?.();
      }
    },
    resetRender() {
      stateSlotIndex = 0;
    },
  };
}

function withHookDispatcher<Result>(
  runtime: ReturnType<typeof createInteractiveRuntime>,
  callback: () => Result,
): Result {
  const reactInternals = (React as ReactWithClientInternals)
    .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  if (!reactInternals) {
    throw new Error("React client internals are not available for interaction tests.");
  }

  const previousDispatcher = reactInternals.H;
  reactInternals.H = runtime.dispatcher;

  try {
    return callback();
  } finally {
    reactInternals.H = previousDispatcher;
  }
}

function resolveReactNode(node: ReactNode): TestTree[] {
  if (node === null || node === undefined || typeof node === "boolean") {
    return [];
  }

  if (typeof node === "string" || typeof node === "number") {
    return [node];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child) => resolveReactNode(child));
  }

  if (!React.isValidElement(node)) {
    return [];
  }

  const element = node as ReactElement<Record<string, unknown>>;
  const props = element.props;

  if (typeof element.type === "function") {
    const Component = element.type as (componentProps: Record<string, unknown>) => ReactNode;
    return resolveReactNode(Component(props));
  }

  const children = resolveReactNode(props.children as ReactNode);

  if (typeof element.type !== "string") {
    return children;
  }

  return [
    {
      children,
      props,
      type: element.type,
    },
  ];
}

function renderInteractiveApp(
  runtime: ReturnType<typeof createInteractiveRuntime>,
  props: React.ComponentProps<typeof App> = {},
) {
  runtime.resetRender();

  return withHookDispatcher(runtime, () => resolveReactNode(<App {...props} />));
}

function getTextContent(tree: readonly TestTree[]): string {
  return tree
    .map((node) => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }

      return getTextContent(node.children);
    })
    .join(" ");
}

function findHostNode(
  tree: readonly TestTree[],
  predicate: (node: HostNode) => boolean,
): HostNode | null {
  for (const node of tree) {
    if (typeof node === "string" || typeof node === "number") {
      continue;
    }

    const childMatch = findHostNode(node.children, predicate);

    if (childMatch) {
      return childMatch;
    }

    if (predicate(node)) {
      return node;
    }
  }

  return null;
}

function findButtonByText(tree: readonly TestTree[], label: string): HostNode | null {
  return findHostNode(
    tree,
    (node) => node.type === "button" && getTextContent(node.children).includes(label),
  );
}

function clickButton(tree: readonly TestTree[], label: string) {
  const button = findButtonByText(tree, label);

  expect(button).not.toBeNull();
  expect(typeof button?.props.onClick).toBe("function");

  (button?.props.onClick as () => void)();
}

function findTextAreaByLabel(tree: readonly TestTree[], label: string): HostNode | null {
  return findHostNode(
    tree,
    (node) => node.type === "textarea" && node.props["aria-label"] === label,
  );
}

function changeTextArea(tree: readonly TestTree[], label: string, value: string) {
  const textArea = findTextAreaByLabel(tree, label);

  expect(textArea).not.toBeNull();
  expect(typeof textArea?.props.onChange).toBe("function");

  (textArea?.props.onChange as (event: { target: { value: string } }) => void)({
    target: { value },
  });
}

function openScenarioFromAgenticShell(
  runtime: ReturnType<typeof createInteractiveRuntime>,
) {
  let tree = renderInteractiveApp(runtime);

  changeTextArea(tree, "Жизненная задача", agenticDemoExamplePrompt);
  tree = renderInteractiveApp(runtime);
  clickButton(tree, "Построить план");
  tree = renderInteractiveApp(runtime);
  clickButton(tree, "Открыть план");

  return renderInteractiveApp(runtime);
}

function findSelectById(tree: readonly TestTree[], id: string): HostNode | null {
  return findHostNode(
    tree,
    (node) => node.type === "select" && node.props.id === id,
  );
}

function changeSelect(tree: readonly TestTree[], id: string, value: string) {
  const select = findSelectById(tree, id);

  expect(select).not.toBeNull();
  expect(typeof select?.props.onChange).toBe("function");

  (select?.props.onChange as (event: { target: { value: string } }) => void)({
    target: { value },
  });
}

function expectVs02ForbiddenScopeAbsent(text: string) {
  for (const forbiddenText of [
    "Dashboard",
    "dashboard",
    "Completed Plans",
    "completedCount",
    "completed",
    "User Open Questions",
    "User Notes",
    "Checked Source Marks",
    "Pattern B",
    "Content Admin",
    "Supabase",
    "API handlers",
    "auth",
    "routing library",
    "state manager",
    "persistence",
    "document storage",
    "deadlines",
    "priorities",
    "assignees",
    "kanban",
    "productivity dashboard",
    "productivity metrics",
    "percentages",
    "percent",
    "%",
    "KPI",
  ]) {
    expect(text).not.toContain(forbiddenText);
  }
}

function createActionPlanForUi() {
  const lifeSituation = listSeedLifeSituations()[0];
  const scenario = lifeSituation
    ? findSeedScenarioById(lifeSituation.scenarioIds[0] ?? "")
    : undefined;
  const scenarioVersion = scenario
    ? findSeedScenarioVersionById(scenario.versionIds[0] ?? "")
    : undefined;

  if (!lifeSituation || !scenario || !scenarioVersion) {
    throw new Error("VS-01 seed content is incomplete.");
  }

  return startActionPlan({
    ownerId: "local-user",
    intent: "start_plan",
    lifeSituation,
    scenario,
    scenarioVersion,
    existingPlans: [],
    operationId: "ui-test",
    occurredAt: "2026-06-24T10:00:00.000Z",
  }).plan;
}

function createUpdatedActionPlanForUi() {
  const plan = createActionPlanForUi();
  const progress = plan.progressRecords[2];

  if (!progress) {
    throw new Error("Expected a Progress record for the UI test.");
  }

  return updateProgressStatus({
    plan,
    progressId: progress.id,
    targetStatus: "in_progress",
    operationId: "ui-progress-update",
    occurredAt: "2026-06-26T10:00:00.000Z",
  });
}

function createReturnContextActionPlanForUi() {
  const plan = createActionPlanForUi();

  return {
    ...plan,
    progressRecords: plan.progressRecords.map((progress, index) => {
      if (index === 1) {
        return { ...progress, status: "requires_check" as const };
      }

      if (index === 2) {
        return { ...progress, status: "in_progress" as const };
      }

      return progress;
    }),
  };
}

function createVs02DemoActionPlanForUi() {
  const plan = createActionPlanForUi();
  const firstProgress = plan.progressRecords[0];

  if (!firstProgress) {
    throw new Error("Expected a first Progress record for the VS-02 demo test.");
  }

  const updatedPlan = updateProgressStatus({
    plan,
    progressId: firstProgress.id,
    targetStatus: "in_progress",
    operationId: "vs-02-demo-progress-update",
    occurredAt: "2026-06-28T10:00:00.000Z",
  });

  return {
    ...updatedPlan,
    progressRecords: updatedPlan.progressRecords.map((progress, index) => {
      if (index === 1) {
        return { ...progress, status: "requires_check" as const };
      }

      return progress;
    }),
  };
}

function createUserOpenQuestionsForUi(
  actionPlan: ActionPlanAggregate,
): UserOpenQuestion[] {
  const firstQuestion = createUserOpenQuestion({
    plan: actionPlan,
    questionText: "Нужно ли уточнить срок регистрации в Magistrat?",
    context: {
      type: "versioned_step",
      id: "step-check-registration-requirements",
    },
    operationId: "ui-question-one",
    occurredAt: "2026-06-30T10:00:00.000Z",
  });
  const secondQuestion = createUserOpenQuestion({
    plan: actionPlan,
    questionText: "Подходит ли мой договор жилья для Anmeldung?",
    context: {
      type: "versioned_document_requirement",
      id: "document-requirement-meldezettel",
    },
    operationId: "ui-question-two",
    occurredAt: "2026-06-30T10:05:00.000Z",
  });

  return [
    firstQuestion,
    {
      ...secondQuestion,
      status: "requires_check",
    },
  ];
}

afterEach(() => {
  delete speechRecognitionGlobal().SpeechRecognition;
  delete speechRecognitionGlobal().webkitSpeechRecognition;
});

describe("App", () => {
  it("shows the Agentic Demo Shell before the existing workflow", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    expect(text).toContain("Nova Agent");
    expect(text).toContain("Скажите, что нужно решить");
    expect(text).toContain("AI-ассистент для жизненных ситуаций");
    expect(text).toContain(
      "Nova Agent разложит жизненную ситуацию на понятный план действий.",
    );
    expect(text).toContain("Демо голосового режима");
    expect(text).toContain("Говорить");
    expect(text).toContain("или напишите задачу вручную");
    expect(findTextAreaByLabel(tree, "Жизненная задача")).not.toBeNull();
    expect(text).toContain(agenticDemoExamplePrompt);
    expect(text).toContain("Построить план");
    expect(text).toContain("Демо-режим");
    expect(text).toContain("Жизненная задача");
    expect(text).toContain("Голос используется только для ввода текста в этом демо.");
    expect(text).toContain(
      "Голосовой ввод работает в браузере, если он поддерживается.",
    );
    expect(text).not.toContain("Голос не записывается в этой версии");
    expect(text).toContain("текущем демонстрационном сценарии");
    expect(text).toContain("Nova Agent не создаёт новые сценарии в этой версии");
    expect(text).toContain("Без real AI/OpenAI");
    expect(text).toContain(
      "Не является юридическим, медицинским или налоговым консультантом.",
    );
    expect(text).not.toContain("слушает");
    expect(text).not.toContain("идёт запись");
    expect(text).not.toContain("микрофон включён");
    expect(text).not.toContain("Начать план");
    expect(text).not.toContain("Supabase");
    expect(text).not.toContain("API");
    expect(text).not.toContain("auth");
    expect(text).not.toContain("persistence");

    clickButton(tree, "Построить план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Скажите, что нужно решить");
    expect(text).not.toContain("Я понял ситуацию для демо");
    expect(text).not.toContain("Начать план");

    clickButton(tree, agenticDemoExamplePrompt);
    tree = renderInteractiveApp(runtime);

    expect(findTextAreaByLabel(tree, "Жизненная задача")?.props.value).toBe(
      agenticDemoExamplePrompt,
    );

    clickButton(tree, "Построить план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Я понял ситуацию для демо");
    expect(text).toContain("demo assistant response");
    expect(text).toContain(
      "Сейчас открою понятный план действий на основе текущего демонстрационного сценария.",
    );
    expect(text).toContain(
      "Это демонстрационный ответ: без real AI/OpenAI, без подтверждения официального статуса и без внешних действий.",
    );
    expect(text).toContain("Nova Agent не создаёт новые сценарии в этой версии");
    expect(text).toContain("Открыть план действий");
    expect(text).not.toContain("Начать план");

    clickButton(tree, "Открыть план действий");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Life Situation");
    expect(text).toContain("Сценарий");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(text).toContain("Начать план");
  });

  it("shows unsupported-browser fallback while manual input still works", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    expect(text).toContain("Демо голосового режима");
    expect(text).toContain("Говорить");
    expect(text).toContain("Голос используется только для ввода текста в этом демо.");
    expect(text).not.toContain("Голос не записывается в этой версии");

    clickButton(tree, "Говорить");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain(
      "Голосовой ввод недоступен в этом браузере. Напишите задачу вручную.",
    );
    expect(text).not.toContain("Я понял ситуацию для демо");
    expect(text).not.toContain("Открыть план действий");

    changeTextArea(tree, "Жизненная задача", agenticDemoExamplePrompt);
    tree = renderInteractiveApp(runtime);
    clickButton(tree, "Построить план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Я понял ситуацию для демо");
    expect(text).toContain(
      "Сейчас открою понятный план действий на основе текущего демонстрационного сценария.",
    );
    expect(text).toContain(
      "Это демонстрационный ответ: без real AI/OpenAI, без подтверждения официального статуса и без внешних действий.",
    );
    expect(text).toContain(
      "Nova Agent не создаёт новые сценарии в этой версии и не выполняет внешние действия.",
    );
    expect(text).toContain("Открыть план действий");
    expect(text).not.toContain("Начать план");
    expect(text).not.toContain("OpenAI API");
    expect(text).not.toContain("идёт запись");

    clickButton(tree, "Открыть план действий");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Life Situation");
    expect(text).toContain("Сценарий");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(text).toContain("Начать план");
  });

  it("uses browser speech recognition to fill the task input and open workflow", () => {
    const recognitionInstances: TestSpeechRecognition[] = [];
    let startCallCount = 0;

    speechRecognitionGlobal().webkitSpeechRecognition = class
      implements TestSpeechRecognition
    {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onresult: ((event: TestSpeechRecognitionEvent) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        recognitionInstances.push(this);
      }

      start() {
        startCallCount += 1;
      }
    };

    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    clickButton(tree, "Говорить");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(recognitionInstances).toHaveLength(1);
    expect(startCallCount).toBe(1);
    expect(recognitionInstances[0]?.continuous).toBe(false);
    expect(recognitionInstances[0]?.interimResults).toBe(false);
    expect(recognitionInstances[0]?.maxAlternatives).toBe(1);
    expect(text).toContain("Браузер может запросить доступ к микрофону.");

    recognitionInstances[0]?.onstart?.();
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Слушаю... скажите, что нужно решить.");

    recognitionInstances[0]?.onresult?.({
      results: [[{ transcript: "Мне нужно зарегистрироваться по адресу" }]],
    });
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(findTextAreaByLabel(tree, "Жизненная задача")?.props.value).toBe(
      "Мне нужно зарегистрироваться по адресу",
    );
    expect(text).toContain("Распознанный текст добавлен в задачу.");
    expect(text).toContain("Я понял ситуацию для демо");
    expect(text).toContain("Открыть план действий");
    expect(text).not.toContain("OpenAI API");

    clickButton(tree, "Открыть план действий");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Life Situation");
    expect(text).toContain("Сценарий");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(text).toContain("Начать план");
  });

  it("does not start a second speech recognition session while one is active", () => {
    const recognitionInstances: TestSpeechRecognition[] = [];
    let startCallCount = 0;

    speechRecognitionGlobal().webkitSpeechRecognition = class
      implements TestSpeechRecognition
    {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onresult: ((event: TestSpeechRecognitionEvent) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        recognitionInstances.push(this);
      }

      start() {
        startCallCount += 1;
      }
    };

    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);

    clickButton(tree, "Говорить");
    tree = renderInteractiveApp(runtime);
    clickButton(tree, "Говорить");

    expect(recognitionInstances).toHaveLength(1);
    expect(startCallCount).toBe(1);
  });

  it("aborts active speech recognition and removes callbacks on unmount", () => {
    const recognitionInstances: TestSpeechRecognition[] = [];
    let abortCallCount = 0;

    speechRecognitionGlobal().SpeechRecognition = class
      implements TestSpeechRecognition
    {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onresult: ((event: TestSpeechRecognitionEvent) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        recognitionInstances.push(this);
      }

      abort() {
        abortCallCount += 1;
      }

      start() {}
    };

    const runtime = createInteractiveRuntime();
    const tree = renderInteractiveApp(runtime);

    clickButton(tree, "Говорить");
    runtime.cleanupEffects();

    expect(abortCallCount).toBe(1);
    expect(recognitionInstances[0]?.onend).toBeNull();
    expect(recognitionInstances[0]?.onerror).toBeNull();
    expect(recognitionInstances[0]?.onresult).toBeNull();
    expect(recognitionInstances[0]?.onstart).toBeNull();
    expect(() => {
      recognitionInstances[0]?.onresult?.({
        results: [[{ transcript: "Поздний результат после unmount" }]],
      });
    }).not.toThrow();
  });

  it("shows permission denied fallback while manual input still works", () => {
    const recognitionInstances: TestSpeechRecognition[] = [];

    speechRecognitionGlobal().SpeechRecognition = class
      implements TestSpeechRecognition
    {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onresult: ((event: TestSpeechRecognitionEvent) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        recognitionInstances.push(this);
      }

      start() {}
    };

    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    clickButton(tree, "Говорить");
    recognitionInstances[0]?.onerror?.({ error: "not-allowed" });
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain(
      "Доступ к микрофону не получен. Можно написать задачу вручную.",
    );
    expect(text).not.toContain("Я понял ситуацию для демо");

    changeTextArea(tree, "Жизненная задача", agenticDemoExamplePrompt);
    tree = renderInteractiveApp(runtime);
    clickButton(tree, "Построить план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Я понял ситуацию для демо");
    expect(text).toContain("Открыть план действий");
  });

  it("shows a soft fallback when speech is not recognized", () => {
    const recognitionInstances: TestSpeechRecognition[] = [];

    speechRecognitionGlobal().SpeechRecognition = class
      implements TestSpeechRecognition
    {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      onresult: ((event: TestSpeechRecognitionEvent) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        recognitionInstances.push(this);
      }

      start() {}
    };

    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    clickButton(tree, "Говорить");
    recognitionInstances[0]?.onerror?.({ error: "no-speech" });
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain(
      "Не удалось распознать речь. Можно попробовать ещё раз или написать задачу вручную.",
    );
    expect(text).not.toContain("Я понял ситуацию для демо");
    expect(text).not.toContain("Открыть план действий");
  });

  it("passes the full VS-01 demo flow through user actions", () => {
    const runtime = createInteractiveRuntime();
    let tree = openScenarioFromAgenticShell(runtime);
    let text = getTextContent(tree);

    const safetyPosition = text.indexOf("Предупреждения и ограничения");
    const startPlanPosition = text.indexOf("Начать план");

    expect(text).toContain("Life Situation");
    expect(text).toContain("Сценарий");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(startPlanPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(startPlanPosition);

    clickButton(tree, "Начать план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Возврат к плану");
    expect(text).toContain("Продолжить активный план");
    expect(text).toContain("Сводка прогресса");
    expect(text).toContain("Главный следующий шаг");

    clickButton(tree, "Продолжить план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Статус плана");
    expect(text).toContain("active");
    expect(text).toContain("Шаги плана");

    clickButton(tree, "Открыть следующий шаг");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Текущее состояние шага");
    expect(text).toContain("Ваша отметка");
    expect(text).toContain("Отметить: В процессе");

    clickButton(tree, "Отметить: В процессе");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Ваша отметка");
    expect(text).toContain("В процессе");

    clickButton(tree, "Вернуться к плану");
    tree = renderInteractiveApp(runtime);
    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("План создан");
    expect(text).toContain("Отметка шага изменена");
    expect(text).toContain("Изменение вашей отметки");
    expect(text).toContain("внутренние события Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).toContain("не подтверждают, что действие выполнено пользователем");
  });

  it("renders the VS-01 content read flow from the seed content", () => {
    const runtime = createInteractiveRuntime();
    const text = getTextContent(openScenarioFromAgenticShell(runtime));

    expect(text).toContain("Nova Agent");
    expect(text).toContain("Life Situation");
    expect(text).toContain("Сценарий");
    expect(text).toContain("Версия сценария");
    expect(text).toContain("v1");
    expect(text).toContain("Путь пользователя");
    expect(text).toContain("Документы и данные");
    expect(text).toContain("Источники");
    expect(text).toContain("Вопросы для проверки");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(text).toContain("Официальный источник");
    expect(text).toContain("Начать план");
  });

  it("shows safety before the Scenario goal, steps, and Start Plan CTA", () => {
    const runtime = createInteractiveRuntime();
    const text = getTextContent(openScenarioFromAgenticShell(runtime));
    const safetyPosition = text.indexOf("Предупреждения и ограничения");
    const scenarioGoalPosition = text.indexOf(
      "Помочь пользователю подготовиться к Anmeldung",
    );
    const stepsPosition = text.indexOf("Шаги сценария");
    const startPlanPosition = text.indexOf("Начать план");

    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(scenarioGoalPosition).toBeGreaterThanOrEqual(0);
    expect(stepsPosition).toBeGreaterThanOrEqual(0);
    expect(startPlanPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(scenarioGoalPosition);
    expect(scenarioGoalPosition).toBeLessThan(stepsPosition);
    expect(stepsPosition).toBeLessThan(startPlanPosition);
    expect(text.indexOf("Предупреждение")).toBeLessThan(stepsPosition);
    expect(text.indexOf("Ограничение")).toBeLessThan(stepsPosition);
    expect(text.indexOf("Где проверить официальный источник")).toBeLessThan(
      startPlanPosition,
    );
  });

  it("shows Action Plan Detail with the next step and user-marked progress", () => {
    const html = renderToString(
      <App initialActionPlan={createActionPlanForUi()} initialPlanOpen />,
    );
    const scenarioPosition = html.indexOf("Ваш план");
    const versionPosition = html.indexOf("Версия сценария:");
    const statePosition = html.indexOf("Статус плана");
    const boundaryPosition = html.indexOf(
      "Nova Agent — справочная и организационная помощь",
    );
    const stepsPosition = html.indexOf("Шаги плана");

    expect(html).toContain("Ваш план");
    expect(html).toContain("Шаги плана");
    expect(html).toContain("Следующий шаг");
    expect(html).toContain("active");
    expect(html).toContain("Версия сценария");
    expect(html).toContain("v1");
    expect(html).toContain("Проверить, нужно ли регистрировать адрес");
    expect(html).toContain("Получить подтверждение и сохранить собственный контекст");
    expect(html.match(/Ваша отметка/g)).toHaveLength(6);
    expect(html.match(/Не начато/g)).toHaveLength(6);
    expect(html).toContain(
      "Nova Agent не подтверждает документы, сроки, применимость требований или результаты официального процесса.",
    );
    expect(scenarioPosition).toBeGreaterThanOrEqual(0);
    expect(versionPosition).toBeGreaterThanOrEqual(0);
    expect(statePosition).toBeGreaterThanOrEqual(0);
    expect(boundaryPosition).toBeGreaterThanOrEqual(0);
    expect(stepsPosition).toBeGreaterThanOrEqual(0);
    expect(scenarioPosition).toBeLessThan(versionPosition);
    expect(versionPosition).toBeLessThan(statePosition);
    expect(statePosition).toBeLessThan(boundaryPosition);
    expect(boundaryPosition).toBeLessThan(stepsPosition);
    expect(html).toContain("Открыть историю");
    expect(html).not.toContain("Начать план");
  });

  it("shows a single active-plan continuation entry with VS-02 summary", () => {
    const html = renderToString(
      <App initialActionPlan={createReturnContextActionPlanForUi()} />,
    );

    expect(html).toContain("Возврат к плану");
    expect(html).toContain("Продолжить активный план");
    expect(html).toContain("Есть существующий активный план");
    expect(html).toContain("Версия сценария:");
    expect(html).toContain("v1");
    expect(html).toContain("Состояние плана");
    expect(html).toContain("active");
    expect(html).toContain("Сводка прогресса");
    expect(html).toContain("Всего шагов");
    expect(html).toContain("Не начато");
    expect(html).toContain("В процессе");
    expect(html).toContain("Требует проверки");
    expect(html).toContain("<dd>6</dd>");
    expect(html).toContain("<dd>4</dd>");
    expect(html).toContain("<dd>1</dd>");
    expect(html.match(/Продолжить план/g)).toHaveLength(1);
    expect(html).not.toContain("completed");
    expect(html).not.toContain("%");
    expect(html).not.toContain("KPI");
    expect(html).not.toContain("productivity");
    expect(html).not.toContain("Dashboard");
    expect(html).not.toContain("Search");
    expect(html).not.toContain("Filter");
    expect(html).not.toContain("Sorting");
    expect(html).not.toContain("Completed Plans");
  });

  it("derives the return-context next step from Progress before opening Step Detail", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: createReturnContextActionPlanForUi(),
    });
    let text = getTextContent(tree);

    expect(text).toContain("Главный следующий шаг");
    expect(text).toContain("Step");
    expect(text).toContain("3");
    expect(text).toContain("Подготовить Meldezettel и подпись Unterkunftgeber");
    expect(text).toContain("Ваша отметка");
    expect(text).toContain("В процессе");
    expect(text).not.toContain("History Event");

    clickButton(tree, "Открыть детали шага");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createReturnContextActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Текущее состояние шага");
    expect(text).toContain("Подготовить Meldezettel и подпись Unterkunftgeber");
    expect(text).toContain("В процессе");
  });

  it("uses the same VS-02 next step in Return Context and Action Plan Detail", () => {
    const actionPlan = createReturnContextActionPlanForUi();
    const returnRuntime = createInteractiveRuntime();
    const actionPlanRuntime = createInteractiveRuntime();
    const returnText = getTextContent(
      renderInteractiveApp(returnRuntime, { initialActionPlan: actionPlan }),
    );
    const actionPlanText = getTextContent(
      renderInteractiveApp(actionPlanRuntime, {
        initialActionPlan: actionPlan,
        initialPlanOpen: true,
      }),
    );
    const returnNextStepText = returnText.slice(
      returnText.indexOf("Главный следующий шаг"),
      returnText.indexOf("Открыть детали шага"),
    );
    const actionPlanNextStepText = actionPlanText.slice(
      actionPlanText.indexOf("Следующий шаг"),
      actionPlanText.indexOf("Открыть следующий шаг"),
    );

    expect(returnNextStepText).toContain("Step");
    expect(returnNextStepText).toContain("3");
    expect(returnNextStepText).toContain(
      "Подготовить Meldezettel и подпись Unterkunftgeber",
    );
    expect(returnNextStepText).not.toContain("Проверить, нужно ли регистрировать адрес");
    expect(returnNextStepText).not.toContain("Найти zuständige Meldebehörde");

    expect(actionPlanNextStepText).toContain("Step");
    expect(actionPlanNextStepText).toContain("3");
    expect(actionPlanNextStepText).toContain(
      "Подготовить Meldezettel и подпись Unterkunftgeber",
    );
    expect(actionPlanNextStepText).not.toContain(
      "Проверить, нужно ли регистрировать адрес",
    );
    expect(actionPlanNextStepText).not.toContain("Найти zuständige Meldebehörde");
  });

  it("shows an empty User Open Questions section inside Action Plan Detail", () => {
    const html = renderToString(
      <App initialActionPlan={createActionPlanForUi()} initialPlanOpen />,
    );

    expect(html).toContain("Ваши открытые вопросы");
    expect(html).toContain("У вас пока нет открытых вопросов.");
    expect(html).toContain(
      "Это ваши вопросы для внешней проверки. Они не являются ответами Nova Agent или официальным статусом.",
    );
    expect(html).not.toContain("Редактировать вопрос");
    expect(html).not.toContain("Удалить вопрос");
    expect(html).not.toContain("User Notes");
    expect(html).not.toContain("Checked Source Marks");
    expect(html).not.toContain("AI suggestions");
    expect(html).not.toContain("Официальный ответ Nova Agent");
  });

  it("shows User Open Questions as read-only user questions with status and boundary copy", () => {
    const actionPlan = createActionPlanForUi();
    const userOpenQuestions = createUserOpenQuestionsForUi(actionPlan);
    const firstQuestion = userOpenQuestions[0];

    if (!firstQuestion) {
      throw new Error("Expected a User Open Question fixture.");
    }

    const html = renderToString(
      <App
        initialActionPlan={actionPlan}
        initialPlanOpen
        initialUserOpenQuestions={[
          ...userOpenQuestions,
          {
            ...firstQuestion,
            id: "user-open-question-other-plan",
            actionPlanId: "action-plan-other",
            questionText: "Этот вопрос относится к другому плану.",
          },
        ]}
      />,
    );

    expect(html).toContain("Ваши открытые вопросы");
    expect(html.match(/Ваш вопрос/g)).toHaveLength(2);
    expect(html).toContain("Нужно ли уточнить срок регистрации в Magistrat?");
    expect(html).toContain("Подходит ли мой договор жилья для Anmeldung?");
    expect(html).not.toContain("Этот вопрос относится к другому плану.");
    expect(html).toContain("Статус");
    expect(html).toContain("Открыт");
    expect(html).toContain("Требует проверки");
    expect(html.match(/Nova Agent не отвечает на этот вопрос/g)).toHaveLength(2);
    expect(html).toContain(
      "Проверьте информацию через официальный или другой надёжный источник.",
    );
    expect(html).not.toContain("user-open-question-ui-question-one");
    expect(html).not.toContain("action-plan-ui-test");
    expect(html).not.toContain("scenario-version-registration-residence-austria-v1");
    expect(html).not.toContain("2026-06-30T10:00:00.000Z");
    expect(html).not.toContain("versioned_step");
    expect(html).not.toContain("versioned_document_requirement");
    expect(html).not.toContain("Редактировать вопрос");
    expect(html).not.toContain("Удалить вопрос");
    expect(html).not.toContain("Progress update");
    expect(html).not.toContain("User Notes");
    expect(html).not.toContain("Checked Source Marks");
    expect(html).not.toContain("AI suggestions");
    expect(html).not.toContain("Официальный ответ Nova Agent");
    expect(html).not.toContain("Официальный статус вопроса");
  });

  it("creates a User Open Question and appends internal History without Progress or Action Plan state side effects", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    const actionPlanBefore = actionPlan.actionPlan;
    const progressBefore = actionPlan.progressRecords;
    const historyBefore = actionPlan.historyEvents;
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    let text = getTextContent(tree);

    expect(text).toContain("У вас пока нет открытых вопросов.");
    expect(text).toContain("Добавить вопрос");

    changeTextArea(
      tree,
      "Новый открытый вопрос",
      "  Нужно ли уточнить срок регистрации лично?  ",
    );
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });

    expect(findTextAreaByLabel(tree, "Новый открытый вопрос")?.props.value).toBe(
      "  Нужно ли уточнить срок регистрации лично?  ",
    );

    clickButton(tree, "Добавить вопрос");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    text = getTextContent(tree);

    expect(text).toContain("Ваш вопрос");
    expect(text).toContain("Нужно ли уточнить срок регистрации лично?");
    expect(text).toContain("Статус");
    expect(text).toContain("Открыт");
    expect(text).toContain(
      "Nova Agent не отвечает на этот вопрос. Проверьте информацию через официальный или другой надёжный источник.",
    );
    expect(text).not.toContain("У вас пока нет открытых вопросов.");
    expect(findTextAreaByLabel(tree, "Новый открытый вопрос")?.props.value).toBe("");
    expect(actionPlan.actionPlan).toBe(actionPlanBefore);
    expect(actionPlan.progressRecords).toBe(progressBefore);
    expect(actionPlan.historyEvents).toBe(historyBefore);
    expect(actionPlan.progressRecords.every((progress) => progress.status === "not_started"))
      .toBe(true);
    expect(actionPlan.historyEvents).toHaveLength(1);
    expect(actionPlan.historyEvents[0]?.eventType).toBe("action_plan_created");
    expect(text).not.toContain("Редактировать вопрос");
    expect(text).not.toContain("Удалить вопрос");
    expect(text).not.toContain("Официальный ответ Nova Agent");
    expect(text).not.toContain("AI suggestions");

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("План создан");
    expect(text).toContain("Открытый вопрос добавлен");
    expect(text).toContain("Внутренняя запись Nova Agent");
    expect(text).toContain("Нужно ли уточнить срок регистрации лично?");
    expect(text).toContain("не официальный ответ");
    expect(text).toContain("не консультация");
    expect(text).toContain("внутренние события Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).not.toContain("Официальный ответ");
    expect(text).not.toContain("Официальный журнал вопроса");
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("Checked Source Marks");
  });

  it("updates a User Open Question status and appends internal History without workflow side effects", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    const [question] = createUserOpenQuestionsForUi(actionPlan);

    if (!question) {
      throw new Error("Expected a User Open Question fixture.");
    }

    const actionPlanBefore = actionPlan.actionPlan;
    const progressBefore = actionPlan.progressRecords;
    const historyBefore = actionPlan.historyEvents;
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialUserOpenQuestions: [question],
    });

    expect(findSelectById(tree, "user-open-question-status-1")?.props.value).toBe(
      "open",
    );

    changeSelect(tree, "user-open-question-status-1", "requires_check");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialUserOpenQuestions: [question],
    });
    const text = getTextContent(tree);

    expect(findSelectById(tree, "user-open-question-status-1")?.props.value).toBe(
      "requires_check",
    );
    expect(text).toContain("Нужно ли уточнить срок регистрации в Magistrat?");
    expect(text).toContain("Требует проверки");
    expect(text).toContain("Ваша отметка");
    expect(actionPlan.actionPlan).toBe(actionPlanBefore);
    expect(actionPlan.progressRecords).toBe(progressBefore);
    expect(actionPlan.historyEvents).toBe(historyBefore);
    expect(actionPlan.progressRecords.every((progress) => progress.status === "not_started"))
      .toBe(true);
    expect(actionPlan.historyEvents).toHaveLength(1);
    expect(actionPlan.historyEvents[0]?.eventType).toBe("action_plan_created");
    expect(text).not.toContain("Редактировать вопрос");
    expect(text).not.toContain("Удалить вопрос");
    expect(text).not.toContain("Официальный ответ Nova Agent");
    expect(text).not.toContain("AI suggestions");

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialUserOpenQuestions: [question],
    });
    const historyText = getTextContent(tree);

    expect(historyText).toContain("История плана");
    expect(historyText).toContain("План создан");
    expect(historyText).toContain("Статус вопроса изменён");
    expect(historyText).toContain("Ваша отметка по вопросу изменилась");
    expect(historyText).toContain("open");
    expect(historyText).toContain("requires_check");
    expect(historyText).toContain("Связанный вопрос:");
    expect(historyText).toContain("Нужно ли уточнить срок регистрации в Magistrat?");
    expect(historyText).toContain("внутренняя история Nova Agent");
    expect(historyText).toContain("не официальный журнал");
    expect(historyText).toContain("подтверждение внешнего действия");
    expect(historyText).not.toContain("Официальный ответ");
    expect(historyText).not.toContain("Консультация Nova Agent");
    expect(historyText).not.toContain("User Notes");
    expect(historyText).not.toContain("Checked Source Marks");
  });

  it("shows User Open Question History Events in chronological append-only order", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });

    changeTextArea(
      tree,
      "Новый открытый вопрос",
      "Нужно ли проверить оригинал документа?",
    );
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    clickButton(tree, "Добавить вопрос");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    changeSelect(tree, "user-open-question-status-1", "requires_check");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });

    const text = getTextContent(tree);
    const planCreatedPosition = text.indexOf("План создан");
    const questionCreatedPosition = text.indexOf("Открытый вопрос добавлен");
    const questionStatusChangedPosition = text.indexOf("Статус вопроса изменён");

    expect(planCreatedPosition).toBeGreaterThanOrEqual(0);
    expect(questionCreatedPosition).toBeGreaterThanOrEqual(0);
    expect(questionStatusChangedPosition).toBeGreaterThanOrEqual(0);
    expect(planCreatedPosition).toBeLessThan(questionCreatedPosition);
    expect(questionCreatedPosition).toBeLessThan(questionStatusChangedPosition);
    expect(text).toContain("Нужно ли проверить оригинал документа?");
    expect(text).toContain("Внутренняя запись Nova Agent");
    expect(text).toContain("внутренняя история Nova Agent");
    expect(text).toContain("не официальный журнал");
    expect(text).toContain("официальный статус");
    expect(text).not.toContain("Редактировать событие");
    expect(text).not.toContain("Удалить событие");
    expect(text).not.toContain("Официальный ответ Nova Agent");
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("Checked Source Marks");
  });

  it("passes the full VS-03 User Open Question demo flow through user actions", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    let text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Статус плана");
    expect(text).toContain("active");
    expect(text).toContain("Ваши открытые вопросы");
    expect(text).toContain("У вас пока нет открытых вопросов.");
    expect(text.match(/Не начато/g)).toHaveLength(6);

    changeTextArea(
      tree,
      "Новый открытый вопрос",
      "  Нужно ли проверить перевод справки у официального источника?  ",
    );
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    clickButton(tree, "Добавить вопрос");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    text = getTextContent(tree);

    expect(text).toContain("Ваш вопрос");
    expect(text).toContain(
      "Нужно ли проверить перевод справки у официального источника?",
    );
    expect(text).toContain("Открыт");
    expect(findTextAreaByLabel(tree, "Новый открытый вопрос")?.props.value).toBe("");

    changeSelect(tree, "user-open-question-status-1", "requires_check");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    text = getTextContent(tree);

    expect(findSelectById(tree, "user-open-question-status-1")?.props.value).toBe(
      "requires_check",
    );
    expect(text).toContain("Требует проверки");
    expect(text).toContain("Ваша отметка");
    expect(text.match(/Не начато/g)).toHaveLength(6);

    const activePlanAfterQuestionFlow =
      runtime.getState<ActionPlanAggregate | null>(0);

    expect(activePlanAfterQuestionFlow?.actionPlan.state).toBe("active");
    expect(
      activePlanAfterQuestionFlow?.progressRecords.every(
        (progress) => progress.status === "not_started",
      ),
    ).toBe(true);
    expect(
      activePlanAfterQuestionFlow?.historyEvents.map((event) => event.eventType),
    ).toEqual([
      "action_plan_created",
      "user_open_question_created",
      "user_open_question_status_changed",
    ]);

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
    });
    text = getTextContent(tree);

    const planCreatedPosition = text.indexOf("План создан");
    const questionCreatedPosition = text.indexOf("Открытый вопрос добавлен");
    const questionStatusChangedPosition = text.indexOf("Статус вопроса изменён");

    expect(planCreatedPosition).toBeGreaterThanOrEqual(0);
    expect(questionCreatedPosition).toBeGreaterThanOrEqual(0);
    expect(questionStatusChangedPosition).toBeGreaterThanOrEqual(0);
    expect(planCreatedPosition).toBeLessThan(questionCreatedPosition);
    expect(questionCreatedPosition).toBeLessThan(questionStatusChangedPosition);
    expect(text).toContain("История плана");
    expect(text).toContain("Внутренняя запись Nova Agent");
    expect(text).toContain("внутренняя история Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).toContain("официальный статус");
    expect(text).toContain("подтверждение внешнего действия");
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("Checked Source Marks");
    expect(text).not.toContain("Официальный ответ Nova Agent");
    expect(text).not.toContain("AI suggestions");
    expect(text).not.toContain("Редактировать вопрос");
    expect(text).not.toContain("Удалить вопрос");
    expect(text).not.toContain("Dashboard");
    expect(text).not.toContain("Completed Plans");
    expect(text).not.toContain("Supabase");
    expect(text).not.toContain("API handlers");
    expect(text).not.toContain("auth");
    expect(text).not.toContain("routing library");
    expect(text).not.toContain("state manager");
    expect(text).not.toContain("persistence");
  });

  it("marks an existing source as checked by the user and records internal History once", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    const actionPlanBefore = actionPlan.actionPlan;
    const progressBefore = actionPlan.progressRecords;
    const historyBefore = actionPlan.historyEvents;
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialSelectedStepId: "step-check-registration-need",
    });
    let text = getTextContent(tree);

    expect(text).toContain("Где проверить официальный источник");
    expect(text).toContain(
      'oesterreich.gv.at: Anmeldung eines neuen Hauptwohnsitzes oder "Nebenwohnsitzes"',
    );
    expect(text).toContain("Отметить как проверено мной");
    expect(text).toContain("Nova Agent не проверяет источник");
    expect(text).toContain("Это не официальный статус");
    expect(text).toContain("Это не подтверждение действия");
    expect(text).not.toContain("Проверено Nova Agent");
    expect(text).not.toContain("Официально подтверждено");
    expect(text).not.toContain("Подтверждено органом");

    clickButton(tree, "Отметить как проверено мной");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialSelectedStepId: "step-check-registration-need",
    });
    text = getTextContent(tree);

    expect(text.match(/Отмечено вами/g)).toHaveLength(1);
    expect(text).toContain("вы отметили, что проверили этот источник");

    clickButton(tree, "Отметить как проверено мной");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialSelectedStepId: "step-check-registration-need",
    });
    text = getTextContent(tree);

    const checkedSourceMarks = runtime.getState<readonly CheckedSourceMark[]>(6);
    const activePlanAfterMark = runtime.getState<ActionPlanAggregate | null>(0);
    const userOpenQuestionsAfterMark =
      runtime.getState<readonly UserOpenQuestion[]>(4);

    expect(text.match(/Отмечено вами/g)).toHaveLength(1);
    expect(checkedSourceMarks).toHaveLength(1);
    expect(checkedSourceMarks[0]).toMatchObject({
      actionPlanId: actionPlan.actionPlan.id,
      createdByUser: true,
      sourceRevisionId: "source-oesterreich-anmeldung",
    });
    expect(checkedSourceMarks[0]).not.toHaveProperty("verifiedByNovaAgent");
    expect(checkedSourceMarks[0]).not.toHaveProperty("officialStatus");
    expect(checkedSourceMarks[0]).not.toHaveProperty("accepted");
    expect(activePlanAfterMark?.actionPlan.state).toBe("active");
    expect(
      activePlanAfterMark?.progressRecords.every(
        (progress) => progress.status === "not_started",
      ),
    ).toBe(true);
    expect(
      activePlanAfterMark?.historyEvents.map((event) => event.eventType),
    ).toEqual(["action_plan_created", "source_checked"]);
    expect(activePlanAfterMark?.historyEvents[1]).toMatchObject({
      eventType: "source_checked",
      payload: {
        actionPlanId: actionPlan.actionPlan.id,
        checkedSourceMarkId: checkedSourceMarks[0]?.id,
        sourceRevisionId: "source-oesterreich-anmeldung",
      },
    });
    expect(userOpenQuestionsAfterMark).toHaveLength(0);
    expect(actionPlan.actionPlan).toBe(actionPlanBefore);
    expect(actionPlan.progressRecords).toBe(progressBefore);
    expect(actionPlan.historyEvents).toBe(historyBefore);
    expect(text).not.toContain("User Notes");

    clickButton(tree, "Вернуться к плану");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialSelectedStepId: "step-check-registration-need",
    });
    text = getTextContent(tree);

    expect(text).toContain("Статус плана");
    expect(text).toContain("active");
    expect(text.match(/Не начато/g)).toHaveLength(6);

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialPlanOpen: true,
      initialSelectedStepId: "step-check-registration-need",
    });
    text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("План создан");
    expect(text).toContain("Источник отмечен вами");
    expect(text).toContain("Внутренняя запись Nova Agent");
    expect(text).toContain("Nova Agent не проверяет источник");
    expect(text).toContain("Это не официальный статус");
    expect(text).toContain("Это не подтверждение действия");
    expect(text).not.toContain("Проверено Nova Agent");
    expect(text).not.toContain("Официально подтверждено");
    expect(text).not.toContain("Подтверждено органом");
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("Checked Source Marks");
  });

  it("opens History from the active-plan continuation entry", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: createReturnContextActionPlanForUi(),
    });

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createReturnContextActionPlanForUi(),
    });
    const text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("План создан");
    expect(text).toContain("внутренние события Nova Agent");
    expect(text).toContain("Не является официальным журналом");
  });

  it("passes the full VS-02 return and continue demo flow through user actions", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    let text = getTextContent(tree);

    expect(text).toContain("Возврат к плану");
    expect(text).toContain("Есть существующий активный план");
    expect(text.match(/Есть существующий активный план/g)).toHaveLength(1);
    expect(text.match(/Продолжить план/g)).toHaveLength(1);
    expect(text).toContain("после перезагрузки страницы сохранение плана не обещается");
    expect(text).toContain("Сводка прогресса");
    expect(text).toContain("Всего шагов");
    expect(text).toContain("Не начато");
    expect(text).toContain("В процессе");
    expect(text).toContain("Требует проверки");
    expect(text).toContain("6");
    expect(text).toContain("4");
    expect(text).toContain("1");
    expect(text).toContain("Главный следующий шаг");
    expect(text).toMatch(/Step\s+1/);
    expect(text).toContain("Проверить, нужно ли регистрировать адрес");
    expect(text).toContain("Ваша отметка");
    expect(text).toContain("В процессе");
    expect(text).toContain("Следующий шаг рассчитывается только по вашим отметкам Progress");
    expect(text).toContain("не является источником текущего состояния Progress");
    expect(text).toContain("Внутренний журнал Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).toContain("Nova Agent — справочная");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Продолжить план");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Статус плана");
    expect(text).toContain("active");
    expect(text).toContain("Шаги плана");
    expect(text).toContain("Следующий шаг");
    expect(text).toContain("Ваш прогресс");
    expect(text).toContain("Ваша отметка");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Открыть следующий шаг");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Текущее состояние шага");
    expect(text).toContain("Проверить, нужно ли регистрировать адрес");
    expect(text).toContain("Предупреждения и ограничения");
    expect(text).toContain("Документы и данные");
    expect(text).toContain("Где проверить официальный источник");
    expect(text).toContain("Ваша отметка");
    expect(text).toContain("В процессе");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Вернуться к плану");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Шаги плана");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("События в порядке создания");
    expect(text).toContain("План создан");
    expect(text).toContain("Отметка шага изменена");
    expect(text).toContain("Изменение вашей отметки");
    expect(text).toContain("Связанный шаг:");
    expect(text).toContain("внутренние события Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).toContain("не подтверждают, что действие выполнено пользователем");
    expect(text).toContain("Nova Agent — справочная");
    expect(text).not.toContain("Редактировать событие");
    expect(text).not.toContain("Удалить событие");
    expect(text).not.toContain("Поиск");
    expect(text).not.toContain("Фильтр");
    expect(text).not.toContain("Сортировать");
    expectVs02ForbiddenScopeAbsent(text);
  });

  it("shows Step Detail context before the read-only Progress mark", () => {
    const html = renderToString(
      <App
        initialActionPlan={createActionPlanForUi()}
        initialSelectedStepId="step-prepare-meldezettel"
      />,
    );
    const safetyPosition = html.indexOf("Предупреждения и ограничения");
    const purposePosition = html.indexOf("Подготовить базовую форму регистрации");
    const applicabilityPosition = html.indexOf("Условия применимости");
    const requirementsPosition = html.indexOf("Документы и данные");
    const sourcesPosition = html.indexOf("Где проверить официальный источник");
    const progressPosition = html.indexOf("Текущее состояние шага");
    const progressActionPosition = html.indexOf("Отметить: В процессе");

    expect(html).toContain("Подготовить Meldezettel и подпись Unterkunftgeber");
    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(purposePosition).toBeGreaterThanOrEqual(0);
    expect(applicabilityPosition).toBeGreaterThanOrEqual(0);
    expect(requirementsPosition).toBeGreaterThanOrEqual(0);
    expect(sourcesPosition).toBeGreaterThanOrEqual(0);
    expect(progressPosition).toBeGreaterThanOrEqual(0);
    expect(progressActionPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(purposePosition);
    expect(purposePosition).toBeLessThan(applicabilityPosition);
    expect(applicabilityPosition).toBeLessThan(requirementsPosition);
    expect(requirementsPosition).toBeLessThan(sourcesPosition);
    expect(sourcesPosition).toBeLessThan(progressPosition);
    expect(progressPosition).toBeLessThan(progressActionPosition);
    expect(html).toContain("Ваша отметка");
    expect(html).toContain("Не начато");
    expect(html).toContain("Отметить: В процессе");
    expect(html).toContain("Отметить: Требует проверки");
    expect(html).toContain(
      "Nova Agent — справочная и организационная помощь. Продукт не является государственным органом, специалистом или консультантом.",
    );
    expect(html).toContain(
      "Nova Agent не подтверждает документы, сроки, применимость требований или результаты официального процесса.",
    );
    expect(html).toContain("Вернуться к плану");
  });

  it("renders an updated user mark without exposing History inside Step Detail", () => {
    const html = renderToString(
      <App
        initialActionPlan={createUpdatedActionPlanForUi()}
        initialSelectedStepId="step-prepare-meldezettel"
      />,
    );

    expect(html).toContain("Ваша отметка");
    expect(html).toContain("В процессе");
    expect(html).not.toContain("Отметить: В процессе");
    expect(html).not.toContain("Отметить: Требует проверки");
    expect(html).not.toContain("progress_status_changed");
    expect(html).not.toContain("История плана");
  });

  it("shows action_plan_created in a read-only internal History view", () => {
    const html = renderToString(
      <App initialActionPlan={createActionPlanForUi()} initialHistoryOpen />,
    );

    expect(html).toContain("История плана");
    expect(html).toContain("События в порядке создания");
    expect(html).toContain("План создан");
    expect(html).toContain("Создание плана");
    expect(html).toContain("версии v1");
    expect(html).toContain('dateTime="2026-06-24T10:00:00.000Z"');
    expect(html).toContain(
      "История — внутренние события Nova Agent. Не является официальным журналом взаимодействия с органами, учреждениями или специалистами.",
    );
    expect(html).toContain(
      "Записи не подтверждают, что действие выполнено пользователем или принято внешней стороной.",
    );
    expect(html).toContain("Вернуться к плану");
    expect(html).not.toContain("Редактировать событие");
    expect(html).not.toContain("Удалить событие");
    expect(html).not.toContain("Поиск");
    expect(html).not.toContain("Фильтр");
    expect(html).not.toContain("Сортировать");
  });

  it("creates and reads a User Note beside an existing History context without workflow side effects", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    const actionPlanBefore = actionPlan.actionPlan;
    const progressBefore = actionPlan.progressRecords;
    const historyBefore = actionPlan.historyEvents;
    const [question] = createUserOpenQuestionsForUi(actionPlan);
    const checkedSourceMark: CheckedSourceMark = {
      id: "checked-source-mark-note-ui",
      actionPlanId: actionPlan.actionPlan.id,
      sourceRevisionId: "source-oesterreich-anmeldung",
      createdAt: "2026-07-02T13:00:00.000Z",
      createdByUser: true,
    };

    if (!question) {
      throw new Error("Expected a User Open Question fixture.");
    }

    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialCheckedSourceMarks: [checkedSourceMark],
      initialHistoryOpen: true,
      initialUserOpenQuestions: [question],
    });
    let text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("План создан");
    expect(text).toContain("Ваши заметки");
    expect(text).toContain("Заметок к этому событию пока нет.");
    expect(text).toContain("Добавить заметку");
    expect(text).toContain("Не официальный документ");
    expect(text).toContain("Не источник");
    expect(text).toContain("Не ответ Nova Agent");

    changeTextArea(
      tree,
      "Новая заметка",
      "  Проверить, что взял подтверждение записи.  ",
    );
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialCheckedSourceMarks: [checkedSourceMark],
      initialHistoryOpen: true,
      initialUserOpenQuestions: [question],
    });

    expect(findTextAreaByLabel(tree, "Новая заметка")?.props.value).toBe(
      "  Проверить, что взял подтверждение записи.  ",
    );

    clickButton(tree, "Добавить заметку");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: actionPlan,
      initialCheckedSourceMarks: [checkedSourceMark],
      initialHistoryOpen: true,
      initialUserOpenQuestions: [question],
    });
    text = getTextContent(tree);

    const activePlanAfterNote = runtime.getState<ActionPlanAggregate | null>(0);
    const userOpenQuestionsAfterNote =
      runtime.getState<readonly UserOpenQuestion[]>(4);
    const checkedSourceMarksAfterNote =
      runtime.getState<readonly CheckedSourceMark[]>(6);
    const userNotesAfterNote = runtime.getState<readonly UserNote[]>(7);

    expect(text).toContain("Ваша заметка");
    expect(text).toContain("Проверить, что взял подтверждение записи.");
    expect(text).toContain("Не официальный документ");
    expect(text).toContain("Не источник");
    expect(text).toContain("Не ответ Nova Agent");
    expect(findTextAreaByLabel(tree, "Новая заметка")?.props.value).toBe("");
    expect(userNotesAfterNote).toHaveLength(1);
    expect(userNotesAfterNote[0]).toMatchObject({
      actionPlanId: actionPlan.actionPlan.id,
      createdByUser: true,
      historyEventId: actionPlan.historyEvents[0]?.id,
      text: "Проверить, что взял подтверждение записи.",
    });
    expect(activePlanAfterNote?.actionPlan).toBe(actionPlanBefore);
    expect(activePlanAfterNote?.actionPlan.state).toBe("active");
    expect(activePlanAfterNote?.progressRecords).toBe(progressBefore);
    expect(
      activePlanAfterNote?.progressRecords.every(
        (progress) => progress.status === "not_started",
      ),
    ).toBe(true);
    expect(activePlanAfterNote?.historyEvents).not.toBe(historyBefore);
    expect(activePlanAfterNote?.historyEvents.map((event) => event.eventType)).toEqual([
      "action_plan_created",
      "user_note_created",
    ]);
    expect(activePlanAfterNote?.historyEvents[1]).toMatchObject({
      eventType: "user_note_created",
      payload: {
        actionPlanId: actionPlan.actionPlan.id,
        contextHistoryEventId: actionPlan.historyEvents[0]?.id,
        userNoteId: userNotesAfterNote[0]?.id,
      },
    });
    expect(userOpenQuestionsAfterNote).toHaveLength(1);
    expect(userOpenQuestionsAfterNote[0]).toBe(question);
    expect(checkedSourceMarksAfterNote).toHaveLength(1);
    expect(checkedSourceMarksAfterNote[0]).toBe(checkedSourceMark);
    expect(actionPlan.actionPlan).toBe(actionPlanBefore);
    expect(actionPlan.progressRecords).toBe(progressBefore);
    expect(actionPlan.historyEvents).toBe(historyBefore);
    expect(text).toContain("Заметка добавлена вами");
    expect(text).toContain(
      "Внутренняя запись Nova Agent: вы добавили собственную заметку к существующему событию истории.",
    );
    expect(text.match(/Добавить заметку/g)).toHaveLength(1);
    expect(text).not.toContain("user_note_created");
    expect(text).not.toContain("Редактировать заметку");
    expect(text).not.toContain("Скрыть заметку");
    expect(text).not.toContain("Удалить заметку");
    expect(text).not.toContain("Официальный ответ Nova Agent");
    expect(text).not.toContain("Ответ от Nova Agent");
    expect(text).not.toContain("Источник заметки");
    expect(text).not.toContain("Официальный документ пользователя");
    expect(text).not.toContain("AI answer");
    expect(text).not.toContain("legal/tax/medical advice");
  });

  it("passes the full VS-04 Sources And Notes demo flow through user actions", () => {
    const runtime = createInteractiveRuntime();
    const actionPlan = createActionPlanForUi();
    let tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    let text = getTextContent(tree);

    expect(text).toContain("Возврат к плану");
    expect(text).toContain("Есть существующий активный план");

    clickButton(tree, "Продолжить план");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Статус плана");
    expect(text).toContain("active");

    clickButton(tree, "Открыть следующий шаг");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    text = getTextContent(tree);

    expect(text).toContain("Где проверить официальный источник");
    expect(text).toContain("Отметить как проверено мной");

    clickButton(tree, "Отметить как проверено мной");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    text = getTextContent(tree);

    const activePlanAfterSourceMark = runtime.getState<ActionPlanAggregate | null>(0);
    const userOpenQuestionsAfterSourceMark =
      runtime.getState<readonly UserOpenQuestion[]>(4);
    const checkedSourceMarksAfterSourceMark =
      runtime.getState<readonly CheckedSourceMark[]>(6);

    expect(text).toContain("Отмечено вами");
    expect(text).toContain("Nova Agent не проверяет источник");
    expect(text).toContain("Это не официальный статус");
    expect(text).toContain("Это не подтверждение действия");
    expect(activePlanAfterSourceMark?.actionPlan.state).toBe("active");
    expect(
      activePlanAfterSourceMark?.progressRecords.every(
        (progress) => progress.status === "not_started",
      ),
    ).toBe(true);
    expect(
      activePlanAfterSourceMark?.historyEvents.map((event) => event.eventType),
    ).toEqual(["action_plan_created", "source_checked"]);
    expect(userOpenQuestionsAfterSourceMark).toHaveLength(0);
    expect(checkedSourceMarksAfterSourceMark).toHaveLength(1);

    clickButton(tree, "Вернуться к плану");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    clickButton(tree, "Открыть историю");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    text = getTextContent(tree);

    expect(text).toContain("История плана");
    expect(text).toContain("Источник отмечен вами");
    expect(text).toContain("Внутренняя запись Nova Agent");
    expect(text).toContain("Nova Agent не проверяет источник");
    expect(text).toContain("Это не официальный статус");
    expect(text).toContain("Это не подтверждение действия");

    changeTextArea(
      tree,
      "Новая заметка",
      "  Проверить сохранённый источник перед визитом.  ",
    );
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });

    expect(findTextAreaByLabel(tree, "Новая заметка")?.props.value).toBe(
      "  Проверить сохранённый источник перед визитом.  ",
    );

    clickButton(tree, "Добавить заметку");
    tree = renderInteractiveApp(runtime, { initialActionPlan: actionPlan });
    text = getTextContent(tree);

    const activePlanAfterNote = runtime.getState<ActionPlanAggregate | null>(0);
    const userOpenQuestionsAfterNote =
      runtime.getState<readonly UserOpenQuestion[]>(4);
    const checkedSourceMarksAfterNote =
      runtime.getState<readonly CheckedSourceMark[]>(6);
    const userNotesAfterNote = runtime.getState<readonly UserNote[]>(7);

    expect(text).toContain("Ваша заметка");
    expect(text).toContain("Проверить сохранённый источник перед визитом.");
    expect(text).toContain("Не официальный документ");
    expect(text).toContain("Не источник");
    expect(text).toContain("Не ответ Nova Agent");
    expect(text).toContain("Заметка добавлена вами");
    expect(text).toContain(
      "Внутренняя запись Nova Agent: вы добавили собственную заметку к существующему событию истории.",
    );
    expect(findTextAreaByLabel(tree, "Новая заметка")?.props.value).toBe("");
    expect(userNotesAfterNote).toHaveLength(1);
    expect(userNotesAfterNote[0]).toMatchObject({
      actionPlanId: actionPlan.actionPlan.id,
      createdByUser: true,
      historyEventId: actionPlan.historyEvents[0]?.id,
      text: "Проверить сохранённый источник перед визитом.",
    });
    expect(activePlanAfterNote?.actionPlan.state).toBe("active");
    expect(
      activePlanAfterNote?.progressRecords.every(
        (progress) => progress.status === "not_started",
      ),
    ).toBe(true);
    expect(
      activePlanAfterNote?.historyEvents.map((event) => event.eventType),
    ).toEqual(["action_plan_created", "source_checked", "user_note_created"]);
    expect(activePlanAfterNote?.historyEvents[2]).toMatchObject({
      eventType: "user_note_created",
      payload: {
        actionPlanId: actionPlan.actionPlan.id,
        contextHistoryEventId: actionPlan.historyEvents[0]?.id,
        userNoteId: userNotesAfterNote[0]?.id,
      },
    });
    expect(userOpenQuestionsAfterNote).toHaveLength(0);
    expect(checkedSourceMarksAfterNote).toHaveLength(1);
    expect(text.match(/Добавить заметку/g)).toHaveLength(2);

    const userNoteCreatedSection = text.slice(text.indexOf("Заметка добавлена вами"));

    expect(userNoteCreatedSection).not.toContain("Добавить заметку");
    expect(text).not.toContain("Редактировать заметку");
    expect(text).not.toContain("Скрыть заметку");
    expect(text).not.toContain("Архивировать заметку");
    expect(text).not.toContain("Удалить заметку");
    expect(text).not.toContain("Проверено Nova Agent");
    expect(text).not.toContain("Официально подтверждено");
    expect(text).not.toContain("Официальный статус источника");
    expect(text).not.toContain("document storage");
    expect(text).not.toContain("source records");
    expect(text).not.toContain("document records");
    expect(text).not.toContain("AI answer");
    expect(text).not.toContain("Supabase");
    expect(text).not.toContain("API handlers");
    expect(text).not.toContain("auth");
    expect(text).not.toContain("routing library");
    expect(text).not.toContain("state manager");
    expect(text).not.toContain("persistence");
    expect(text).not.toContain("Dashboard");
    expect(text).not.toContain("Completed Plans");
    expect(text).not.toContain("Pattern B");
    expect(text).not.toContain("Content Admin");
  });

  it("shows progress history after plan creation with the linked step context", () => {
    const updatedPlan = createUpdatedActionPlanForUi();
    const planWithUnorderedHistory = {
      ...updatedPlan,
      historyEvents: [...updatedPlan.historyEvents].reverse(),
    };
    const html = renderToString(
      <App
        initialActionPlan={planWithUnorderedHistory}
        initialHistoryOpen
      />,
    );
    const planCreatedPosition = html.indexOf("План создан");
    const progressChangedPosition = html.indexOf("Отметка шага изменена");

    expect(planCreatedPosition).toBeGreaterThanOrEqual(0);
    expect(progressChangedPosition).toBeGreaterThanOrEqual(0);
    expect(planCreatedPosition).toBeLessThan(progressChangedPosition);
    expect(html).toContain("Изменение вашей отметки");
    expect(html).toContain("Не начато");
    expect(html).toContain("В процессе");
    expect(html).toContain("Связанный шаг:");
    expect(html).toContain("Step 3: Подготовить Meldezettel и подпись Unterkunftgeber");
    expect(html).toContain('dateTime="2026-06-26T10:00:00.000Z"');
  });

  it("does not expose later workflow controls or views", () => {
    const screens = [
      renderToString(<App />),
      renderToString(<App initialActionPlan={createActionPlanForUi()} />),
      renderToString(
        <App
          initialActionPlan={createActionPlanForUi()}
          initialSelectedStepId="step-prepare-meldezettel"
        />,
      ),
      renderToString(
        <App initialActionPlan={createUpdatedActionPlanForUi()} initialHistoryOpen />,
      ),
    ];

    for (const html of screens) {
      expect(html).not.toContain("Изменить Progress");
      expect(html).not.toContain("Progress update");
      expect(html).not.toContain("Завершить шаг");
      expect(html).not.toContain("History view");
      expect(html).not.toContain("User Open Questions");
      expect(html).not.toContain("User Notes");
      expect(html).not.toContain("Checked Source Marks");
      expect(html).not.toContain("UOQ");
      expect(html).not.toContain("CSM");
      expect(html).not.toContain("My Plans");
      expect(html).not.toContain("Completed Plans");
      expect(html).not.toContain("Supabase");
    }
  });
});
