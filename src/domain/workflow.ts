import type {
  LifeSituation,
  PublishedScenarioVersion,
  Scenario,
} from "./content";

export type ActionPlanState = "active" | "completed";

export type ProgressStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_external_response"
  | "completed"
  | "requires_check";

export type HistoryEventType = "action_plan_created";

export interface SelectedLifeSituationContext {
  readonly id: string;
  readonly title: string;
}

export interface ActionPlan {
  readonly id: string;
  readonly ownerId: string;
  readonly stableScenarioId: string;
  readonly scenarioVersionId: string;
  readonly scenarioVersionLabel: string;
  readonly selectedLifeSituationContext: SelectedLifeSituationContext;
  readonly state: ActionPlanState;
  readonly createdAt: string;
}

export interface Progress {
  readonly id: string;
  readonly actionPlanId: string;
  readonly versionedStepContextId: string;
  readonly status: ProgressStatus;
}

export interface ActionPlanCreatedHistoryPayload {
  readonly actionPlanId: string;
  readonly scenarioVersionId: string;
  readonly stableScenarioId: string;
  readonly selectedLifeSituationContext: SelectedLifeSituationContext;
}

export interface HistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: HistoryEventType;
  readonly occurredAt: string;
  readonly payload: ActionPlanCreatedHistoryPayload;
}

export interface ActionPlanAggregate {
  readonly actionPlan: ActionPlan;
  readonly progressRecords: readonly Progress[];
  readonly historyEvents: readonly HistoryEvent[];
}

export interface StartActionPlanInput {
  readonly ownerId: string;
  readonly intent: "start_plan";
  readonly lifeSituation: LifeSituation;
  readonly scenario: Scenario;
  readonly scenarioVersion: PublishedScenarioVersion;
  readonly existingPlans: readonly ActionPlanAggregate[];
  readonly operationId: string;
  readonly occurredAt: string;
}

export interface StartActionPlanResult {
  readonly plan: ActionPlanAggregate;
  readonly created: boolean;
}

export function startActionPlan(input: StartActionPlanInput): StartActionPlanResult {
  const existingPlan = input.existingPlans.find(
    ({ actionPlan }) =>
      actionPlan.ownerId === input.ownerId &&
      actionPlan.stableScenarioId === input.scenario.id &&
      actionPlan.state === "active",
  );

  if (existingPlan) {
    return { plan: existingPlan, created: false };
  }

  if (input.scenarioVersion.publicationState !== "published") {
    throw new Error("Action Plan can only be created for a published Scenario Version.");
  }

  if (input.scenarioVersion.scenarioId !== input.scenario.id) {
    throw new Error("Scenario Version does not belong to the selected Scenario.");
  }

  if (!input.lifeSituation.scenarioIds.includes(input.scenario.id)) {
    throw new Error("Scenario is not linked to the selected Life Situation.");
  }

  const actionPlanId = `action-plan-${input.operationId}`;
  const selectedLifeSituationContext = {
    id: input.lifeSituation.id,
    title: input.lifeSituation.title,
  };
  const actionPlan: ActionPlan = {
    id: actionPlanId,
    ownerId: input.ownerId,
    stableScenarioId: input.scenario.id,
    scenarioVersionId: input.scenarioVersion.id,
    scenarioVersionLabel: input.scenarioVersion.versionLabel,
    selectedLifeSituationContext,
    state: "active",
    createdAt: input.occurredAt,
  };
  const progressRecords = input.scenarioVersion.steps.map((step) => ({
    id: `progress-${input.operationId}-${step.id}`,
    actionPlanId,
    versionedStepContextId: step.id,
    status: "not_started" as const,
  }));
  const historyEvent: HistoryEvent = {
    id: `history-${input.operationId}-action-plan-created`,
    actionPlanId,
    eventType: "action_plan_created",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId,
      scenarioVersionId: input.scenarioVersion.id,
      stableScenarioId: input.scenario.id,
      selectedLifeSituationContext,
    },
  };

  return {
    created: true,
    plan: {
      actionPlan,
      progressRecords,
      historyEvents: [historyEvent],
    },
  };
}
