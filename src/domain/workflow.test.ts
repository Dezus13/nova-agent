import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import {
  getVs02NextStepProgress,
  getVs02ProgressSummary,
  startActionPlan,
  updateProgressStatus,
  type Progress,
  type StartActionPlanInput,
} from "./workflow";

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

describe("updateProgressStatus", () => {
  it.each(["in_progress", "requires_check"] as const)(
    "updates one not_started Progress to %s and keeps the Action Plan active",
    (targetStatus) => {
      const createdPlan = startActionPlan(getStartInput()).plan;
      const targetProgress = createdPlan.progressRecords[2];

      if (!targetProgress) {
        throw new Error("Expected a target Progress record.");
      }

      const updatedPlan = updateProgressStatus({
        plan: createdPlan,
        progressId: targetProgress.id,
        targetStatus,
        operationId: `update-${targetStatus}`,
        occurredAt: "2026-06-26T10:00:00.000Z",
      });

      expect(updatedPlan.actionPlan).toBe(createdPlan.actionPlan);
      expect(updatedPlan.actionPlan.state).toBe("active");
      expect(updatedPlan.progressRecords[2]?.status).toBe(targetStatus);
      expect(
        updatedPlan.progressRecords.filter(
          (progress) => progress.status === "not_started",
        ),
      ).toHaveLength(createdPlan.progressRecords.length - 1);
      for (const [index, progress] of updatedPlan.progressRecords.entries()) {
        if (index !== 2) {
          expect(progress).toBe(createdPlan.progressRecords[index]);
        }
      }
      expect(createdPlan.progressRecords[2]?.status).toBe("not_started");
    },
  );

  it.each(["completed", "awaiting_external_response"] as const)(
    "rejects not_started -> %s without changing Progress or History",
    (targetStatus) => {
      const createdPlan = startActionPlan(getStartInput()).plan;
      const targetProgress = createdPlan.progressRecords[0];

      if (!targetProgress) {
        throw new Error("Expected a target Progress record.");
      }

      expect(() =>
        updateProgressStatus({
          plan: createdPlan,
          progressId: targetProgress.id,
          targetStatus,
          operationId: `rejected-${targetStatus}`,
          occurredAt: "2026-06-26T10:00:00.000Z",
        }),
      ).toThrow(`Target status ${targetStatus} is not available in VS-01 Step 5.`);

      expect(targetProgress.status).toBe("not_started");
      expect(createdPlan.progressRecords[0]).toBe(targetProgress);
      expect(createdPlan.historyEvents).toHaveLength(1);
      expect(
        createdPlan.historyEvents.some(
          (event) => event.eventType === "progress_status_changed",
        ),
      ).toBe(false);
    },
  );

  it("appends one progress_status_changed History Event with transition context", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const targetProgress = createdPlan.progressRecords[0];

    if (!targetProgress) {
      throw new Error("Expected a target Progress record.");
    }

    const updatedPlan = updateProgressStatus({
      plan: createdPlan,
      progressId: targetProgress.id,
      targetStatus: "in_progress",
      operationId: "update-history",
      occurredAt: "2026-06-26T10:00:00.000Z",
    });
    const historyEvent = updatedPlan.historyEvents[1];

    expect(updatedPlan.historyEvents).toHaveLength(2);
    expect(historyEvent?.eventType).toBe("progress_status_changed");
    expect(historyEvent?.payload).toEqual({
      actionPlanId: createdPlan.actionPlan.id,
      versionedStepContextId: targetProgress.versionedStepContextId,
      previousStatus: "not_started",
      newStatus: "in_progress",
    });
    expect(createdPlan.historyEvents).toHaveLength(1);
  });

  it("rejects a second VS-01 transition from an already changed Progress", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const targetProgress = createdPlan.progressRecords[0];

    if (!targetProgress) {
      throw new Error("Expected a target Progress record.");
    }

    const updatedPlan = updateProgressStatus({
      plan: createdPlan,
      progressId: targetProgress.id,
      targetStatus: "in_progress",
      operationId: "first-update",
      occurredAt: "2026-06-26T10:00:00.000Z",
    });

    expect(() =>
      updateProgressStatus({
        plan: updatedPlan,
        progressId: targetProgress.id,
        targetStatus: "requires_check",
        operationId: "second-update",
        occurredAt: "2026-06-26T10:05:00.000Z",
      }),
    ).toThrow("is not available in VS-01 Step 5");
  });
});

describe("VS-02 progress read helpers", () => {
  function createProgressRecords(statuses: readonly Progress["status"][]): Progress[] {
    return statuses.map((status, index) => ({
      id: `progress-${index + 1}`,
      actionPlanId: "action-plan-test-operation",
      versionedStepContextId: `step-${index + 1}`,
      status,
    }));
  }

  it("summarizes only total, not_started, in_progress and requires_check counts", () => {
    const summary = getVs02ProgressSummary(
      createProgressRecords([
        "not_started",
        "in_progress",
        "requires_check",
        "completed",
        "awaiting_external_response",
      ]),
    );

    expect(summary).toEqual({
      totalSteps: 5,
      notStartedCount: 1,
      inProgressCount: 1,
      requiresCheckCount: 1,
    });
  });

  it("does not expose completed, percentage, KPI or productivity fields", () => {
    const summary = getVs02ProgressSummary(
      createProgressRecords(["not_started", "completed"]),
    );

    expect(summary).not.toHaveProperty("completedCount");
    expect(summary).not.toHaveProperty("completedPercentage");
    expect(summary).not.toHaveProperty("percentage");
    expect(summary).not.toHaveProperty("kpi");
    expect(summary).not.toHaveProperty("productivityScore");
    expect(summary).not.toHaveProperty("dashboardMetrics");
  });

  it("selects in_progress before requires_check", () => {
    const progressRecords = createProgressRecords([
      "requires_check",
      "not_started",
      "in_progress",
    ]);

    expect(getVs02NextStepProgress(progressRecords)).toBe(progressRecords[2]);
  });

  it("selects requires_check before not_started when no in_progress exists", () => {
    const progressRecords = createProgressRecords([
      "not_started",
      "requires_check",
      "not_started",
    ]);

    expect(getVs02NextStepProgress(progressRecords)).toBe(progressRecords[1]);
  });

  it("selects the first not_started when no in_progress or requires_check exists", () => {
    const progressRecords = createProgressRecords([
      "completed",
      "not_started",
      "not_started",
    ]);

    expect(getVs02NextStepProgress(progressRecords)).toBe(progressRecords[1]);
  });

  it("uses only Progress records and does not derive next step from History", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const changedProgress = createdPlan.progressRecords[2];

    if (!changedProgress) {
      throw new Error("Expected a Progress record to change.");
    }

    const updatedPlan = updateProgressStatus({
      plan: createdPlan,
      progressId: changedProgress.id,
      targetStatus: "in_progress",
      operationId: "history-does-not-drive-next-step",
      occurredAt: "2026-06-27T10:00:00.000Z",
    });

    expect(updatedPlan.historyEvents).toHaveLength(2);
    expect(getVs02NextStepProgress(createdPlan.progressRecords)).toBe(
      createdPlan.progressRecords[0],
    );
  });

  it("returns no next step when Progress records are empty", () => {
    expect(getVs02NextStepProgress([])).toBeUndefined();
  });

  it("returns no next step when no VS-02 next-step statuses are present", () => {
    expect(
      getVs02NextStepProgress(
        createProgressRecords(["completed", "awaiting_external_response"]),
      ),
    ).toBeUndefined();
  });
});
