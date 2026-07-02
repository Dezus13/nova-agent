import React, { type ReactElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
  type UserOpenQuestion,
} from "../domain/workflow";
import { App } from "./App";

type HookDispatcher = {
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

function createInteractiveRuntime() {
  const stateSlots: unknown[] = [];
  let stateSlotIndex = 0;

  const dispatcher: HookDispatcher = {
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

describe("App", () => {
  it("passes the full VS-01 demo flow through user actions", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime);
    let text = getTextContent(tree);

    const safetyPosition = text.indexOf("Warnings / Restrictions");
    const startPlanPosition = text.indexOf("Начать план");

    expect(text).toContain("Life Situation");
    expect(text).toContain("Scenario");
    expect(text).toContain("Регистрация места жительства в Австрии");
    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(startPlanPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(startPlanPosition);

    clickButton(tree, "Начать план");
    tree = renderInteractiveApp(runtime);
    text = getTextContent(tree);

    expect(text).toContain("Return Context");
    expect(text).toContain("Продолжить активный план");
    expect(text).toContain("Progress Summary");
    expect(text).toContain("Главный следующий шаг");

    clickButton(tree, "Продолжить active plan");
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
    const html = renderToString(<App />);

    expect(html).toContain("Nova Agent");
    expect(html).toContain("Life Situation");
    expect(html).toContain("Scenario");
    expect(html).toContain("Scenario Version");
    expect(html).toContain("v1");
    expect(html).toContain("Steps");
    expect(html).toContain("Documents / Data Requirements");
    expect(html).toContain("Sources");
    expect(html).toContain("Template Open Questions");
    expect(html).toContain("Регистрация места жительства в Австрии");
    expect(html).toContain("Официальный источник");
    expect(html).toContain("Начать план");
  });

  it("shows safety before the Scenario goal, steps, and Start Plan CTA", () => {
    const html = renderToString(<App />);
    const safetyPosition = html.indexOf("Warnings / Restrictions");
    const scenarioGoalPosition = html.indexOf(
      "Помочь пользователю подготовиться к Anmeldung",
    );
    const stepsPosition = html.indexOf("Шаги сценария");
    const startPlanPosition = html.indexOf("Начать план");

    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(scenarioGoalPosition).toBeGreaterThanOrEqual(0);
    expect(stepsPosition).toBeGreaterThanOrEqual(0);
    expect(startPlanPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(scenarioGoalPosition);
    expect(scenarioGoalPosition).toBeLessThan(stepsPosition);
    expect(stepsPosition).toBeLessThan(startPlanPosition);
    expect(html.indexOf("Предупреждение")).toBeLessThan(stepsPosition);
    expect(html.indexOf("Ограничение")).toBeLessThan(stepsPosition);
    expect(html.indexOf("Где проверить официальный источник")).toBeLessThan(
      startPlanPosition,
    );
  });

  it("shows Action Plan Detail with the next step and user-marked progress", () => {
    const html = renderToString(
      <App initialActionPlan={createActionPlanForUi()} initialPlanOpen />,
    );
    const scenarioPosition = html.indexOf("Ваш план");
    const versionPosition = html.indexOf("Scenario Version:");
    const statePosition = html.indexOf("Статус плана");
    const boundaryPosition = html.indexOf(
      "Nova Agent — справочная и организационная помощь",
    );
    const stepsPosition = html.indexOf("Шаги плана");

    expect(html).toContain("Ваш план");
    expect(html).toContain("Шаги плана");
    expect(html).toContain("Следующий шаг");
    expect(html).toContain("active");
    expect(html).toContain("Scenario Version");
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

    expect(html).toContain("Return Context");
    expect(html).toContain("Продолжить активный план");
    expect(html).toContain("Есть существующий active Action Plan");
    expect(html).toContain("Scenario Version:");
    expect(html).toContain("v1");
    expect(html).toContain("Состояние плана");
    expect(html).toContain("active");
    expect(html).toContain("Progress Summary");
    expect(html).toContain("Total steps");
    expect(html).toContain("not_started");
    expect(html).toContain("in_progress");
    expect(html).toContain("requires_check");
    expect(html).toContain("<dd>6</dd>");
    expect(html).toContain("<dd>4</dd>");
    expect(html).toContain("<dd>1</dd>");
    expect(html.match(/Продолжить active plan/g)).toHaveLength(1);
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

    clickButton(tree, "Открыть Step Detail");
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
      returnText.indexOf("Открыть Step Detail"),
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
    expect(html).not.toContain("Ответ Nova Agent");
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
    expect(html).toContain("open");
    expect(html).toContain("requires_check");
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
    expect(html).not.toContain("Ответ Nova Agent");
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
    expect(text).toContain("open");
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
    expect(text).not.toContain("Ответ Nova Agent");
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
    expect(text).toContain("requires_check");
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
    expect(text).not.toContain("Ответ Nova Agent");
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
    expect(text).not.toContain("Ответ Nova Agent");
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
    expect(text).toContain("open");
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
    expect(text).toContain("requires_check");
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
    expect(text).not.toContain("Ответ Nova Agent");
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

  it("marks an existing source as checked by the user without workflow side effects", () => {
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
    ).toEqual(["action_plan_created"]);
    expect(actionPlan.actionPlan).toBe(actionPlanBefore);
    expect(actionPlan.progressRecords).toBe(progressBefore);
    expect(actionPlan.historyEvents).toBe(historyBefore);
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("source_checked");

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
    expect(text).not.toContain("source_checked");
    expect(text).not.toContain("Источник отмечен");
    expect(text).not.toContain("User Notes");
    expect(text).not.toContain("Checked Source Marks");
  });

  it("opens History from the active-plan continuation entry", () => {
    const runtime = createInteractiveRuntime();
    let tree = renderInteractiveApp(runtime, {
      initialActionPlan: createReturnContextActionPlanForUi(),
    });

    clickButton(tree, "Открыть History");
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

    expect(text).toContain("Return Context");
    expect(text).toContain("Есть существующий active Action Plan");
    expect(text.match(/Есть существующий active Action Plan/g)).toHaveLength(1);
    expect(text.match(/Продолжить active plan/g)).toHaveLength(1);
    expect(text).toContain("после перезагрузки страницы сохранение плана не обещается");
    expect(text).toContain("Progress Summary");
    expect(text).toContain("Total steps");
    expect(text).toContain("not_started");
    expect(text).toContain("in_progress");
    expect(text).toContain("requires_check");
    expect(text).toContain("6");
    expect(text).toContain("4");
    expect(text).toContain("1");
    expect(text).toContain("Главный следующий шаг");
    expect(text).toMatch(/Step\s+1/);
    expect(text).toContain("Проверить, нужно ли регистрировать адрес");
    expect(text).toContain("Ваша отметка");
    expect(text).toContain("В процессе");
    expect(text).toContain("Следующий шаг рассчитывается только по Progress records");
    expect(text).toContain("не является source of truth для текущего Progress");
    expect(text).toContain("Внутренний журнал Nova Agent");
    expect(text).toContain("Не является официальным журналом");
    expect(text).toContain("Nova Agent — справочная");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Продолжить active plan");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Ваш план");
    expect(text).toContain("Статус плана");
    expect(text).toContain("active");
    expect(text).toContain("Шаги плана");
    expect(text).toContain("Следующий шаг");
    expect(text).toContain("Progress");
    expect(text).toContain("Ваша отметка");
    expectVs02ForbiddenScopeAbsent(text);

    clickButton(tree, "Открыть следующий шаг");
    tree = renderInteractiveApp(runtime, {
      initialActionPlan: createVs02DemoActionPlanForUi(),
    });
    text = getTextContent(tree);

    expect(text).toContain("Текущее состояние шага");
    expect(text).toContain("Проверить, нужно ли регистрировать адрес");
    expect(text).toContain("Warnings / Restrictions");
    expect(text).toContain("Documents / Data Requirements");
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
    const safetyPosition = html.indexOf("Warnings / Restrictions");
    const purposePosition = html.indexOf("Подготовить базовую форму регистрации");
    const applicabilityPosition = html.indexOf("Applicability Conditions");
    const requirementsPosition = html.indexOf("Documents / Data Requirements");
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
    expect(html).toContain("Scenario Version v1");
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
