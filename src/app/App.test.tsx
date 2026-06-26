import React, { type ReactElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import { startActionPlan, updateProgressStatus } from "../domain/workflow";
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

function renderInteractiveApp(runtime: ReturnType<typeof createInteractiveRuntime>) {
  runtime.resetRender();

  return withHookDispatcher(runtime, () => resolveReactNode(<App />));
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
    const html = renderToString(<App initialActionPlan={createActionPlanForUi()} />);
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
