import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import { startActionPlan } from "../domain/workflow";
import { App } from "./App";

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

describe("App", () => {
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

    expect(html).toContain("Подготовить Meldezettel и подпись Unterkunftgeber");
    expect(safetyPosition).toBeGreaterThanOrEqual(0);
    expect(purposePosition).toBeGreaterThanOrEqual(0);
    expect(applicabilityPosition).toBeGreaterThanOrEqual(0);
    expect(requirementsPosition).toBeGreaterThanOrEqual(0);
    expect(sourcesPosition).toBeGreaterThanOrEqual(0);
    expect(progressPosition).toBeGreaterThanOrEqual(0);
    expect(safetyPosition).toBeLessThan(purposePosition);
    expect(purposePosition).toBeLessThan(applicabilityPosition);
    expect(applicabilityPosition).toBeLessThan(requirementsPosition);
    expect(requirementsPosition).toBeLessThan(sourcesPosition);
    expect(sourcesPosition).toBeLessThan(progressPosition);
    expect(html).toContain("Ваша отметка");
    expect(html).toContain("Не начато");
    expect(html).toContain(
      "Nova Agent — справочная и организационная помощь. Продукт не является государственным органом, специалистом или консультантом.",
    );
    expect(html).toContain(
      "Nova Agent не подтверждает документы, сроки, применимость требований или результаты официального процесса.",
    );
    expect(html).toContain("Вернуться к плану");
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
    ];

    for (const html of screens) {
      expect(html).not.toContain("Изменить Progress");
      expect(html).not.toContain("Progress update");
      expect(html).not.toContain("Завершить шаг");
      expect(html).not.toContain("История плана");
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
