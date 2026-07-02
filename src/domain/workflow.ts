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

export type HistoryEventType =
  | "action_plan_created"
  | "progress_status_changed"
  | "source_checked"
  | "user_open_question_created"
  | "user_open_question_status_changed"
  | "user_note_created";

export type Vs01ProgressUpdateStatus = "in_progress" | "requires_check";

export const USER_OPEN_QUESTION_STATUSES = [
  "open",
  "requires_check",
  "awaiting_external_response",
  "clarified_by_user",
  "irrelevant",
] as const;

export type UserOpenQuestionStatus = (typeof USER_OPEN_QUESTION_STATUSES)[number];

export type UserOpenQuestionContextType =
  | "versioned_step"
  | "versioned_document_requirement"
  | "versioned_data_requirement"
  | "versioned_source"
  | "versioned_template_open_question"
  | "progress";

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

export interface UserOpenQuestionContext {
  readonly type: UserOpenQuestionContextType;
  readonly id: string;
}

export interface UserOpenQuestion {
  readonly id: string;
  readonly actionPlanId: string;
  readonly scenarioVersionId: string;
  readonly questionText: string;
  readonly status: UserOpenQuestionStatus;
  readonly context?: UserOpenQuestionContext;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CheckedSourceMark {
  readonly id: string;
  readonly actionPlanId: string;
  readonly sourceRevisionId: string;
  readonly createdAt: string;
  readonly createdByUser: true;
}

export interface UserNote {
  readonly id: string;
  readonly actionPlanId: string;
  readonly historyEventId: string;
  readonly text: string;
  readonly createdAt: string;
  readonly createdByUser: true;
}

export interface ActionPlanCreatedHistoryPayload {
  readonly actionPlanId: string;
  readonly scenarioVersionId: string;
  readonly stableScenarioId: string;
  readonly selectedLifeSituationContext: SelectedLifeSituationContext;
}

export interface ActionPlanCreatedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "action_plan_created";
  readonly occurredAt: string;
  readonly payload: ActionPlanCreatedHistoryPayload;
}

export interface ProgressStatusChangedHistoryPayload {
  readonly actionPlanId: string;
  readonly versionedStepContextId: string;
  readonly previousStatus: ProgressStatus;
  readonly newStatus: Vs01ProgressUpdateStatus;
}

export interface ProgressStatusChangedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "progress_status_changed";
  readonly occurredAt: string;
  readonly payload: ProgressStatusChangedHistoryPayload;
}

export interface UserOpenQuestionCreatedHistoryPayload {
  readonly actionPlanId: string;
  readonly userOpenQuestionId: string;
  readonly questionText: string;
  readonly status: "open";
}

export interface UserOpenQuestionCreatedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "user_open_question_created";
  readonly occurredAt: string;
  readonly payload: UserOpenQuestionCreatedHistoryPayload;
}

export interface UserOpenQuestionStatusChangedHistoryPayload {
  readonly actionPlanId: string;
  readonly userOpenQuestionId: string;
  readonly questionText: string;
  readonly previousStatus: UserOpenQuestionStatus;
  readonly newStatus: UserOpenQuestionStatus;
}

export interface UserOpenQuestionStatusChangedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "user_open_question_status_changed";
  readonly occurredAt: string;
  readonly payload: UserOpenQuestionStatusChangedHistoryPayload;
}

export interface SourceCheckedHistoryPayload {
  readonly actionPlanId: string;
  readonly sourceRevisionId: string;
  readonly checkedSourceMarkId: string;
  readonly createdAt: string;
}

export interface SourceCheckedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "source_checked";
  readonly occurredAt: string;
  readonly payload: SourceCheckedHistoryPayload;
}

export interface UserNoteCreatedHistoryPayload {
  readonly actionPlanId: string;
  readonly userNoteId: string;
  readonly contextHistoryEventId: string;
  readonly createdAt: string;
}

export interface UserNoteCreatedHistoryEvent {
  readonly id: string;
  readonly actionPlanId: string;
  readonly eventType: "user_note_created";
  readonly occurredAt: string;
  readonly payload: UserNoteCreatedHistoryPayload;
}

export type HistoryEvent =
  | ActionPlanCreatedHistoryEvent
  | ProgressStatusChangedHistoryEvent
  | SourceCheckedHistoryEvent
  | UserNoteCreatedHistoryEvent
  | UserOpenQuestionCreatedHistoryEvent
  | UserOpenQuestionStatusChangedHistoryEvent;

export interface ActionPlanAggregate {
  readonly actionPlan: ActionPlan;
  readonly progressRecords: readonly Progress[];
  readonly historyEvents: readonly HistoryEvent[];
}

export interface Vs02ProgressSummary {
  readonly totalSteps: number;
  readonly notStartedCount: number;
  readonly inProgressCount: number;
  readonly requiresCheckCount: number;
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

export interface UpdateProgressStatusInput {
  readonly plan: ActionPlanAggregate;
  readonly progressId: string;
  readonly targetStatus: ProgressStatus;
  readonly operationId: string;
  readonly occurredAt: string;
}

export interface CreateUserOpenQuestionInput {
  readonly plan: ActionPlanAggregate;
  readonly questionText: string;
  readonly context?: UserOpenQuestionContext;
  readonly operationId: string;
  readonly occurredAt: string;
}

export type CreateUserOpenQuestionWithHistoryInput = CreateUserOpenQuestionInput;

export interface CreateUserOpenQuestionWithHistoryResult {
  readonly plan: ActionPlanAggregate;
  readonly question: UserOpenQuestion;
}

export interface UpdateUserOpenQuestionStatusInput {
  readonly question: UserOpenQuestion;
  readonly targetStatus: string;
  readonly occurredAt: string;
}

export interface UpdateUserOpenQuestionStatusWithHistoryInput
  extends UpdateUserOpenQuestionStatusInput {
  readonly plan: ActionPlanAggregate;
  readonly operationId: string;
}

export interface UpdateUserOpenQuestionStatusWithHistoryResult {
  readonly plan: ActionPlanAggregate;
  readonly question: UserOpenQuestion;
}

export interface CreateCheckedSourceMarkInput {
  readonly plan: ActionPlanAggregate;
  readonly sourceRevisionId: string;
  readonly operationId: string;
  readonly occurredAt: string;
}

export type CreateCheckedSourceMarkWithHistoryInput = CreateCheckedSourceMarkInput;

export interface CreateCheckedSourceMarkWithHistoryResult {
  readonly plan: ActionPlanAggregate;
  readonly mark: CheckedSourceMark;
}

export interface CreateUserNoteInput {
  readonly plan: ActionPlanAggregate;
  readonly historyEventId: string;
  readonly text: string;
  readonly operationId: string;
  readonly occurredAt: string;
}

export type CreateUserNoteWithHistoryInput = CreateUserNoteInput;

export interface CreateUserNoteWithHistoryResult {
  readonly plan: ActionPlanAggregate;
  readonly note: UserNote;
}

function isVs01ProgressUpdateStatus(
  status: ProgressStatus,
): status is Vs01ProgressUpdateStatus {
  return status === "in_progress" || status === "requires_check";
}

export function isUserOpenQuestionStatus(
  status: string,
): status is UserOpenQuestionStatus {
  return USER_OPEN_QUESTION_STATUSES.includes(status as UserOpenQuestionStatus);
}

export function getAllowedUserOpenQuestionStatusTransitions(
  currentStatus: UserOpenQuestionStatus,
): readonly UserOpenQuestionStatus[] {
  switch (currentStatus) {
    case "open":
      return ["requires_check", "awaiting_external_response", "irrelevant"];
    case "requires_check":
      return ["awaiting_external_response", "clarified_by_user", "irrelevant"];
    case "awaiting_external_response":
      return ["clarified_by_user", "irrelevant"];
    case "clarified_by_user":
      return ["requires_check"];
    case "irrelevant":
      return [];
  }
}

export function getVs02ProgressSummary(
  progressRecords: readonly Progress[],
): Vs02ProgressSummary {
  return progressRecords.reduce<Vs02ProgressSummary>(
    (summary, progress) => ({
      totalSteps: summary.totalSteps + 1,
      notStartedCount:
        summary.notStartedCount + (progress.status === "not_started" ? 1 : 0),
      inProgressCount:
        summary.inProgressCount + (progress.status === "in_progress" ? 1 : 0),
      requiresCheckCount:
        summary.requiresCheckCount + (progress.status === "requires_check" ? 1 : 0),
    }),
    {
      totalSteps: 0,
      notStartedCount: 0,
      inProgressCount: 0,
      requiresCheckCount: 0,
    },
  );
}

export function getVs02NextStepProgress(
  progressRecords: readonly Progress[],
): Progress | undefined {
  return (
    progressRecords.find((progress) => progress.status === "in_progress") ??
    progressRecords.find((progress) => progress.status === "requires_check") ??
    progressRecords.find((progress) => progress.status === "not_started")
  );
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
  const historyEvent: ActionPlanCreatedHistoryEvent = {
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

export function updateProgressStatus(
  input: UpdateProgressStatusInput,
): ActionPlanAggregate {
  if (input.plan.actionPlan.state !== "active") {
    throw new Error("Progress can only be updated inside an active Action Plan.");
  }

  const currentProgress = input.plan.progressRecords.find(
    (progress) => progress.id === input.progressId,
  );

  if (!currentProgress) {
    throw new Error("Progress does not belong to the Action Plan.");
  }

  if (!isVs01ProgressUpdateStatus(input.targetStatus)) {
    throw new Error(
      `Target status ${input.targetStatus} is not available in VS-01 Step 5.`,
    );
  }

  if (currentProgress.status !== "not_started") {
    throw new Error(
      `Transition ${currentProgress.status} -> ${input.targetStatus} is not available in VS-01 Step 5.`,
    );
  }

  const updatedProgress: Progress = {
    ...currentProgress,
    status: input.targetStatus,
  };
  const historyEvent: ProgressStatusChangedHistoryEvent = {
    id: `history-${input.operationId}-progress-status-changed`,
    actionPlanId: input.plan.actionPlan.id,
    eventType: "progress_status_changed",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId: input.plan.actionPlan.id,
      versionedStepContextId: currentProgress.versionedStepContextId,
      previousStatus: currentProgress.status,
      newStatus: input.targetStatus,
    },
  };

  return {
    actionPlan: input.plan.actionPlan,
    progressRecords: input.plan.progressRecords.map((progress) =>
      progress.id === currentProgress.id ? updatedProgress : progress,
    ),
    historyEvents: [...input.plan.historyEvents, historyEvent],
  };
}

export function createUserOpenQuestion(
  input: CreateUserOpenQuestionInput,
): UserOpenQuestion {
  if (input.plan.actionPlan.state !== "active") {
    throw new Error("User Open Question can only be created inside an active Action Plan.");
  }

  const questionText = input.questionText.trim();

  if (!questionText) {
    throw new Error("User Open Question text is required.");
  }

  return {
    id: `user-open-question-${input.operationId}`,
    actionPlanId: input.plan.actionPlan.id,
    scenarioVersionId: input.plan.actionPlan.scenarioVersionId,
    questionText,
    status: "open",
    context: input.context,
    createdAt: input.occurredAt,
    updatedAt: input.occurredAt,
  };
}

function appendHistoryEvent(
  plan: ActionPlanAggregate,
  historyEvent: HistoryEvent,
): ActionPlanAggregate {
  return {
    actionPlan: plan.actionPlan,
    progressRecords: plan.progressRecords,
    historyEvents: [...plan.historyEvents, historyEvent],
  };
}

export function createUserOpenQuestionWithHistory(
  input: CreateUserOpenQuestionWithHistoryInput,
): CreateUserOpenQuestionWithHistoryResult {
  const question = createUserOpenQuestion(input);
  const historyEvent: UserOpenQuestionCreatedHistoryEvent = {
    id: `history-${input.operationId}-user-open-question-created`,
    actionPlanId: input.plan.actionPlan.id,
    eventType: "user_open_question_created",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId: input.plan.actionPlan.id,
      userOpenQuestionId: question.id,
      questionText: question.questionText,
      status: "open",
    },
  };

  return {
    plan: appendHistoryEvent(input.plan, historyEvent),
    question,
  };
}

export function updateUserOpenQuestionStatus(
  input: UpdateUserOpenQuestionStatusInput,
): UserOpenQuestion {
  if (!isUserOpenQuestionStatus(input.targetStatus)) {
    throw new Error(`Unknown User Open Question status: ${input.targetStatus}.`);
  }

  if (input.targetStatus === input.question.status) {
    return input.question;
  }

  const allowedStatuses = getAllowedUserOpenQuestionStatusTransitions(
    input.question.status,
  );

  if (!allowedStatuses.includes(input.targetStatus)) {
    throw new Error(
      `Transition ${input.question.status} -> ${input.targetStatus} is not allowed for User Open Questions.`,
    );
  }

  return {
    ...input.question,
    status: input.targetStatus,
    updatedAt: input.occurredAt,
  };
}

export function updateUserOpenQuestionStatusWithHistory(
  input: UpdateUserOpenQuestionStatusWithHistoryInput,
): UpdateUserOpenQuestionStatusWithHistoryResult {
  if (input.plan.actionPlan.state !== "active") {
    throw new Error(
      "User Open Question status can only be updated inside an active Action Plan.",
    );
  }

  if (input.question.actionPlanId !== input.plan.actionPlan.id) {
    throw new Error("User Open Question does not belong to the Action Plan.");
  }

  const updatedQuestion = updateUserOpenQuestionStatus(input);

  if (updatedQuestion === input.question) {
    return {
      plan: input.plan,
      question: updatedQuestion,
    };
  }

  const historyEvent: UserOpenQuestionStatusChangedHistoryEvent = {
    id: `history-${input.operationId}-user-open-question-status-changed`,
    actionPlanId: input.plan.actionPlan.id,
    eventType: "user_open_question_status_changed",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId: input.plan.actionPlan.id,
      userOpenQuestionId: input.question.id,
      questionText: input.question.questionText,
      previousStatus: input.question.status,
      newStatus: updatedQuestion.status,
    },
  };

  return {
    plan: appendHistoryEvent(input.plan, historyEvent),
    question: updatedQuestion,
  };
}

export function createCheckedSourceMark(
  input: CreateCheckedSourceMarkInput,
): CheckedSourceMark {
  if (input.plan.actionPlan.state !== "active") {
    throw new Error("Checked Source Mark can only be created inside an active Action Plan.");
  }

  const sourceRevisionId = input.sourceRevisionId.trim();

  if (!sourceRevisionId) {
    throw new Error("Source Revision identity is required for a Checked Source Mark.");
  }

  return {
    id: `checked-source-mark-${input.operationId}`,
    actionPlanId: input.plan.actionPlan.id,
    sourceRevisionId,
    createdAt: input.occurredAt,
    createdByUser: true,
  };
}

export function createCheckedSourceMarkWithHistory(
  input: CreateCheckedSourceMarkWithHistoryInput,
): CreateCheckedSourceMarkWithHistoryResult {
  const mark = createCheckedSourceMark(input);
  const historyEvent: SourceCheckedHistoryEvent = {
    id: `history-${input.operationId}-source-checked`,
    actionPlanId: input.plan.actionPlan.id,
    eventType: "source_checked",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId: input.plan.actionPlan.id,
      sourceRevisionId: mark.sourceRevisionId,
      checkedSourceMarkId: mark.id,
      createdAt: mark.createdAt,
    },
  };

  return {
    plan: appendHistoryEvent(input.plan, historyEvent),
    mark,
  };
}

export function createUserNote(input: CreateUserNoteInput): UserNote {
  if (input.plan.actionPlan.state !== "active") {
    throw new Error("User Note can only be created inside an active Action Plan.");
  }

  const historyEventId = input.historyEventId.trim();

  if (!historyEventId) {
    throw new Error("User Note requires a context History Event.");
  }

  const contextHistoryEvent = input.plan.historyEvents.find(
    (event) =>
      event.id === historyEventId &&
      event.actionPlanId === input.plan.actionPlan.id,
  );

  if (!contextHistoryEvent) {
    throw new Error("User Note context History Event must belong to the Action Plan.");
  }

  if (contextHistoryEvent.eventType === "user_note_created") {
    throw new Error("User Note cannot use user_note_created as its context History Event.");
  }

  const text = input.text.trim();

  if (!text) {
    throw new Error("User Note text is required.");
  }

  return {
    id: `user-note-${input.operationId}`,
    actionPlanId: input.plan.actionPlan.id,
    historyEventId,
    text,
    createdAt: input.occurredAt,
    createdByUser: true,
  };
}

export function createUserNoteWithHistory(
  input: CreateUserNoteWithHistoryInput,
): CreateUserNoteWithHistoryResult {
  const note = createUserNote(input);
  const historyEvent: UserNoteCreatedHistoryEvent = {
    id: `history-${input.operationId}-user-note-created`,
    actionPlanId: input.plan.actionPlan.id,
    eventType: "user_note_created",
    occurredAt: input.occurredAt,
    payload: {
      actionPlanId: input.plan.actionPlan.id,
      userNoteId: note.id,
      contextHistoryEventId: note.historyEventId,
      createdAt: note.createdAt,
    },
  };

  return {
    plan: appendHistoryEvent(input.plan, historyEvent),
    note,
  };
}
