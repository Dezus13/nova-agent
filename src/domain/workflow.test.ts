import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import {
  USER_OPEN_QUESTION_STATUSES,
  createCheckedSourceMark,
  createCheckedSourceMarkWithHistory,
  createUserOpenQuestion,
  createUserOpenQuestionWithHistory,
  getAllowedUserOpenQuestionStatusTransitions,
  getVs02NextStepProgress,
  getVs02ProgressSummary,
  isUserOpenQuestionStatus,
  startActionPlan,
  updateUserOpenQuestionStatus,
  updateUserOpenQuestionStatusWithHistory,
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

describe("VS-03 User Open Question domain helpers", () => {
  it("creates a User Open Question in an active Action Plan", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;

    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "  Нужно ли уточнить срок в Magistrat?  ",
      context: {
        type: "versioned_step",
        id: "step-check-registration-requirements",
      },
      operationId: "create-uoq",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    expect(question).toEqual({
      id: "user-open-question-create-uoq",
      actionPlanId: createdPlan.actionPlan.id,
      scenarioVersionId: createdPlan.actionPlan.scenarioVersionId,
      questionText: "Нужно ли уточнить срок в Magistrat?",
      status: "open",
      context: {
        type: "versioned_step",
        id: "step-check-registration-requirements",
      },
      createdAt: "2026-06-28T10:00:00.000Z",
      updatedAt: "2026-06-28T10:00:00.000Z",
    });
  });

  it("uses only TS07 User Open Question statuses", () => {
    expect(USER_OPEN_QUESTION_STATUSES).toEqual([
      "open",
      "requires_check",
      "awaiting_external_response",
      "clarified_by_user",
      "irrelevant",
    ]);

    for (const status of USER_OPEN_QUESTION_STATUSES) {
      expect(isUserOpenQuestionStatus(status)).toBe(true);
    }
    expect(isUserOpenQuestionStatus("answered")).toBe(false);
    expect(isUserOpenQuestionStatus("officially_confirmed")).toBe(false);
  });

  it("does not affect Progress records when creating a User Open Question", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const progressBefore = createdPlan.progressRecords;

    createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Welche Stelle muss ich kontaktieren?",
      operationId: "progress-independent",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    expect(createdPlan.progressRecords).toBe(progressBefore);
    expect(createdPlan.progressRecords.every((progress) => progress.status === "not_started"))
      .toBe(true);
  });

  it("creates user_open_question_created as an append-only History Event", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const historyBefore = createdPlan.historyEvents;

    const result = createUserOpenQuestionWithHistory({
      plan: createdPlan,
      questionText: "Muss ich die Quelle extern prüfen?",
      operationId: "history-independent",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });
    const historyEvent = result.plan.historyEvents[1];

    expect(createdPlan.historyEvents).toBe(historyBefore);
    expect(createdPlan.historyEvents).toHaveLength(1);
    expect(createdPlan.historyEvents[0]?.eventType).toBe("action_plan_created");
    expect(result.plan).not.toBe(createdPlan);
    expect(result.plan.actionPlan).toBe(createdPlan.actionPlan);
    expect(result.plan.progressRecords).toBe(createdPlan.progressRecords);
    expect(result.plan.historyEvents).toHaveLength(2);
    expect(result.plan.historyEvents[0]).toBe(createdPlan.historyEvents[0]);
    expect(historyEvent?.eventType).toBe("user_open_question_created");
    expect(historyEvent?.payload).toEqual({
      actionPlanId: createdPlan.actionPlan.id,
      userOpenQuestionId: result.question.id,
      questionText: "Muss ich die Quelle extern prüfen?",
      status: "open",
    });
  });

  it("does not mutate the existing Action Plan aggregate", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const actionPlanBefore = createdPlan.actionPlan;
    const progressBefore = createdPlan.progressRecords;
    const historyBefore = createdPlan.historyEvents;

    createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Kann ich diesen Schritt später klären?",
      operationId: "immutable-create",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    expect(createdPlan.actionPlan).toBe(actionPlanBefore);
    expect(createdPlan.progressRecords).toBe(progressBefore);
    expect(createdPlan.historyEvents).toBe(historyBefore);
    expect(createdPlan).toEqual({
      actionPlan: actionPlanBefore,
      progressRecords: progressBefore,
      historyEvents: historyBefore,
    });
  });

  it("rejects creation outside an active Action Plan", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const completedPlan = {
      ...createdPlan,
      actionPlan: {
        ...createdPlan.actionPlan,
        state: "completed" as const,
      },
    };

    expect(() =>
      createUserOpenQuestion({
        plan: completedPlan,
        questionText: "Kann ich diese Frage speichern?",
        operationId: "completed-plan",
        occurredAt: "2026-06-28T10:00:00.000Z",
      }),
    ).toThrow("User Open Question can only be created inside an active Action Plan.");
  });

  it("updates a User Open Question status through a TS07 transition", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Нужно ли уточнить срок?",
      operationId: "status-update",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    const updatedQuestion = updateUserOpenQuestionStatus({
      question,
      targetStatus: "requires_check",
      occurredAt: "2026-06-30T10:00:00.000Z",
    });

    expect(updatedQuestion).toEqual({
      ...question,
      status: "requires_check",
      updatedAt: "2026-06-30T10:00:00.000Z",
    });
    expect(question.status).toBe("open");
  });

  it("exposes only TS07 User Open Question status transitions", () => {
    expect(getAllowedUserOpenQuestionStatusTransitions("open")).toEqual([
      "requires_check",
      "awaiting_external_response",
      "irrelevant",
    ]);
    expect(getAllowedUserOpenQuestionStatusTransitions("requires_check")).toEqual([
      "awaiting_external_response",
      "clarified_by_user",
      "irrelevant",
    ]);
    expect(
      getAllowedUserOpenQuestionStatusTransitions("awaiting_external_response"),
    ).toEqual(["clarified_by_user", "irrelevant"]);
    expect(getAllowedUserOpenQuestionStatusTransitions("clarified_by_user")).toEqual([
      "requires_check",
    ]);
    expect(getAllowedUserOpenQuestionStatusTransitions("irrelevant")).toEqual([]);
  });

  it("rejects an invalid runtime User Open Question status", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Нужно ли уточнить статус?",
      operationId: "invalid-status",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    expect(() =>
      updateUserOpenQuestionStatus({
        question,
        targetStatus: "officially_confirmed",
        occurredAt: "2026-06-30T10:00:00.000Z",
      }),
    ).toThrow("Unknown User Open Question status: officially_confirmed.");
  });

  it("rejects forbidden TS07 transitions including transitions from irrelevant", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Нужно ли уточнить применимость?",
      operationId: "forbidden-transition",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });
    const irrelevantQuestion = updateUserOpenQuestionStatus({
      question,
      targetStatus: "irrelevant",
      occurredAt: "2026-06-30T10:00:00.000Z",
    });

    expect(() =>
      updateUserOpenQuestionStatus({
        question,
        targetStatus: "clarified_by_user",
        occurredAt: "2026-06-30T10:05:00.000Z",
      }),
    ).toThrow(
      "Transition open -> clarified_by_user is not allowed for User Open Questions.",
    );
    expect(() =>
      updateUserOpenQuestionStatus({
        question: irrelevantQuestion,
        targetStatus: "requires_check",
        occurredAt: "2026-06-30T10:10:00.000Z",
      }),
    ).toThrow(
      "Transition irrelevant -> requires_check is not allowed for User Open Questions.",
    );
  });

  it("creates user_open_question_status_changed without changing Progress, Action Plan state or question text", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const actionPlanBefore = createdPlan.actionPlan;
    const progressBefore = createdPlan.progressRecords;
    const historyBefore = createdPlan.historyEvents;
    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Сохраняется ли текст вопроса?",
      operationId: "status-side-effects",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    const result = updateUserOpenQuestionStatusWithHistory({
      plan: createdPlan,
      question,
      targetStatus: "awaiting_external_response",
      operationId: "status-side-effects",
      occurredAt: "2026-06-30T10:00:00.000Z",
    });
    const historyEvent = result.plan.historyEvents[1];

    expect(createdPlan.actionPlan).toBe(actionPlanBefore);
    expect(createdPlan.progressRecords).toBe(progressBefore);
    expect(createdPlan.historyEvents).toBe(historyBefore);
    expect(createdPlan.historyEvents).toHaveLength(1);
    expect(result.plan).not.toBe(createdPlan);
    expect(result.plan.actionPlan).toBe(actionPlanBefore);
    expect(result.plan.actionPlan.state).toBe("active");
    expect(result.plan.progressRecords).toBe(progressBefore);
    expect(result.plan.historyEvents).toHaveLength(2);
    expect(historyEvent?.eventType).toBe("user_open_question_status_changed");
    expect(historyEvent?.payload).toEqual({
      actionPlanId: createdPlan.actionPlan.id,
      userOpenQuestionId: question.id,
      questionText: "Сохраняется ли текст вопроса?",
      previousStatus: "open",
      newStatus: "awaiting_external_response",
    });
    expect(result.question.questionText).toBe(question.questionText);
    expect(question.questionText).toBe("Сохраняется ли текст вопроса?");
  });

  it("does not append History when the User Open Question status is unchanged", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const question = createUserOpenQuestion({
      plan: createdPlan,
      questionText: "Статус уже актуален?",
      operationId: "same-status-history",
      occurredAt: "2026-06-28T10:00:00.000Z",
    });

    const result = updateUserOpenQuestionStatusWithHistory({
      plan: createdPlan,
      question,
      targetStatus: "open",
      operationId: "same-status-history",
      occurredAt: "2026-06-30T10:00:00.000Z",
    });

    expect(result.question).toBe(question);
    expect(result.plan).toBe(createdPlan);
    expect(result.plan.historyEvents).toHaveLength(1);
  });
});

describe("VS-04 Checked Source Mark domain helper", () => {
  it("creates a Checked Source Mark for an existing active Action Plan", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;

    const mark = createCheckedSourceMark({
      plan: createdPlan,
      sourceRevisionId: "source-oesterreich-anmeldung",
      operationId: "create-csm",
      occurredAt: "2026-07-02T10:00:00.000Z",
    });

    expect(mark).toEqual({
      id: "checked-source-mark-create-csm",
      actionPlanId: createdPlan.actionPlan.id,
      sourceRevisionId: "source-oesterreich-anmeldung",
      createdAt: "2026-07-02T10:00:00.000Z",
      createdByUser: true,
    });
  });

  it("records a user-owned source check without Nova Agent verification fields", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;

    const mark = createCheckedSourceMark({
      plan: createdPlan,
      sourceRevisionId: " source-oesterreich-anmeldung ",
      operationId: "user-owned-check",
      occurredAt: "2026-07-02T10:00:00.000Z",
    });

    expect(mark.createdByUser).toBe(true);
    expect(mark.sourceRevisionId).toBe("source-oesterreich-anmeldung");
    expect(mark).not.toHaveProperty("verified");
    expect(mark).not.toHaveProperty("verifiedByNovaAgent");
    expect(mark).not.toHaveProperty("officiallyConfirmed");
    expect(mark).not.toHaveProperty("officialStatus");
    expect(mark).not.toHaveProperty("actionCompleted");
    expect(mark).not.toHaveProperty("acceptedByAuthority");
    expect(mark).not.toHaveProperty("legalConfirmation");
    expect(mark).not.toHaveProperty("medicalConfirmation");
    expect(mark).not.toHaveProperty("taxConfirmation");
  });

  it("does not change Progress, History, Action Plan state or existing aggregate in-place", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const actionPlanBefore = createdPlan.actionPlan;
    const progressBefore = createdPlan.progressRecords;
    const historyBefore = createdPlan.historyEvents;

    createCheckedSourceMark({
      plan: createdPlan,
      sourceRevisionId: "source-oesterreich-anmeldung",
      operationId: "no-side-effects",
      occurredAt: "2026-07-02T10:00:00.000Z",
    });

    expect(createdPlan.actionPlan).toBe(actionPlanBefore);
    expect(createdPlan.actionPlan.state).toBe("active");
    expect(createdPlan.progressRecords).toBe(progressBefore);
    expect(createdPlan.progressRecords.every((progress) => progress.status === "not_started"))
      .toBe(true);
    expect(createdPlan.historyEvents).toBe(historyBefore);
    expect(createdPlan.historyEvents).toHaveLength(1);
    expect(createdPlan).toEqual({
      actionPlan: actionPlanBefore,
      progressRecords: progressBefore,
      historyEvents: historyBefore,
    });
  });

  it("does not create User Notes or History Events in Step 1", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;

    const mark = createCheckedSourceMark({
      plan: createdPlan,
      sourceRevisionId: "source-oesterreich-anmeldung",
      operationId: "no-notes",
      occurredAt: "2026-07-02T10:00:00.000Z",
    });

    expect(mark).not.toHaveProperty("userNoteId");
    expect(mark).not.toHaveProperty("noteText");
    expect(mark).not.toHaveProperty("historyEventId");
    expect(createdPlan.historyEvents).toHaveLength(1);
    expect(createdPlan.historyEvents.map((event) => event.eventType)).not.toContain(
      "source_checked",
    );
  });

  it("rejects creation outside an active Action Plan", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const completedPlan = {
      ...createdPlan,
      actionPlan: {
        ...createdPlan.actionPlan,
        state: "completed" as const,
      },
    };

    expect(() =>
      createCheckedSourceMark({
        plan: completedPlan,
        sourceRevisionId: "source-oesterreich-anmeldung",
        operationId: "completed-csm",
        occurredAt: "2026-07-02T10:00:00.000Z",
      }),
    ).toThrow("Checked Source Mark can only be created inside an active Action Plan.");
  });

  it("creates source_checked as an append-only History Event without workflow side effects", () => {
    const createdPlan = startActionPlan(getStartInput()).plan;
    const actionPlanBefore = createdPlan.actionPlan;
    const progressBefore = createdPlan.progressRecords;
    const historyBefore = createdPlan.historyEvents;

    const result = createCheckedSourceMarkWithHistory({
      plan: createdPlan,
      sourceRevisionId: "source-oesterreich-anmeldung",
      operationId: "source-history",
      occurredAt: "2026-07-02T11:00:00.000Z",
    });

    expect(result.mark).toEqual({
      id: "checked-source-mark-source-history",
      actionPlanId: createdPlan.actionPlan.id,
      sourceRevisionId: "source-oesterreich-anmeldung",
      createdAt: "2026-07-02T11:00:00.000Z",
      createdByUser: true,
    });
    expect(result.plan.actionPlan).toBe(actionPlanBefore);
    expect(result.plan.actionPlan.state).toBe("active");
    expect(result.plan.progressRecords).toBe(progressBefore);
    expect(result.plan.progressRecords.every((progress) => progress.status === "not_started"))
      .toBe(true);
    expect(result.plan.historyEvents).not.toBe(historyBefore);
    expect(result.plan.historyEvents.map((event) => event.eventType)).toEqual([
      "action_plan_created",
      "source_checked",
    ]);
    expect(result.plan.historyEvents[1]).toEqual({
      id: "history-source-history-source-checked",
      actionPlanId: createdPlan.actionPlan.id,
      eventType: "source_checked",
      occurredAt: "2026-07-02T11:00:00.000Z",
      payload: {
        actionPlanId: createdPlan.actionPlan.id,
        sourceRevisionId: "source-oesterreich-anmeldung",
        checkedSourceMarkId: "checked-source-mark-source-history",
        createdAt: "2026-07-02T11:00:00.000Z",
      },
    });
    expect(result.mark).not.toHaveProperty("userNoteId");
    expect(result.mark).not.toHaveProperty("verifiedByNovaAgent");
    expect(result.mark).not.toHaveProperty("officialStatus");
    expect(createdPlan.actionPlan).toBe(actionPlanBefore);
    expect(createdPlan.progressRecords).toBe(progressBefore);
    expect(createdPlan.historyEvents).toBe(historyBefore);
  });
});
