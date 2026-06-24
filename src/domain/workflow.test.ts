import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import { startActionPlan, type StartActionPlanInput } from "./workflow";

function getStartInput(
  existingPlans: StartActionPlanInput["existingPlans"] = [],
): StartActionPlanInput {
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

  return {
    ownerId: "local-user",
    intent: "start_plan",
    lifeSituation,
    scenario,
    scenarioVersion,
    existingPlans,
    operationId: "test-operation",
    occurredAt: "2026-06-24T10:00:00.000Z",
  };
}

describe("startActionPlan", () => {
  it("creates one active Action Plan for the published Scenario Version", () => {
    const result = startActionPlan(getStartInput());

    expect(result.created).toBe(true);
    expect(result.plan.actionPlan).toMatchObject({
      ownerId: "local-user",
      state: "active",
      stableScenarioId: "scenario-registration-residence-austria",
      scenarioVersionId: "scenario-version-registration-residence-austria-v1",
      scenarioVersionLabel: "v1",
    });
    expect(result.plan.actionPlan.selectedLifeSituationContext).toEqual({
      id: "life-situation-registration-residence-austria",
      title: "Регистрация места жительства в Австрии",
    });
  });

  it("creates a not_started Progress record for every Scenario step", () => {
    const input = getStartInput();
    const result = startActionPlan(input);

    expect(result.plan.progressRecords).toHaveLength(input.scenarioVersion.steps.length);
    expect(result.plan.progressRecords.every((record) => record.status === "not_started")).toBe(
      true,
    );
    expect(
      result.plan.progressRecords.map((record) => record.versionedStepContextId),
    ).toEqual(input.scenarioVersion.steps.map((step) => step.id));
  });

  it("creates exactly one action_plan_created History Event", () => {
    const result = startActionPlan(getStartInput());

    expect(result.plan.historyEvents).toHaveLength(1);
    expect(result.plan.historyEvents[0]?.eventType).toBe("action_plan_created");
    expect(result.plan.historyEvents[0]?.payload).toMatchObject({
      scenarioVersionId: "scenario-version-registration-residence-austria-v1",
      stableScenarioId: "scenario-registration-residence-austria",
    });
  });

  it("returns the existing active plan without creating duplicates", () => {
    const firstResult = startActionPlan(getStartInput());
    const repeatedResult = startActionPlan(getStartInput([firstResult.plan]));

    expect(repeatedResult.created).toBe(false);
    expect(repeatedResult.plan).toBe(firstResult.plan);
    expect(repeatedResult.plan.progressRecords).toHaveLength(
      firstResult.plan.progressRecords.length,
    );
    expect(repeatedResult.plan.historyEvents).toHaveLength(1);
  });
});
