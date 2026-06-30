import { useState } from "react";
import {
  createUserOpenQuestion,
  startActionPlan,
  type ActionPlanAggregate,
  type UserOpenQuestion,
  type UserOpenQuestionStatus,
  type Vs01ProgressUpdateStatus,
  updateUserOpenQuestionStatus,
  updateProgressStatus,
} from "../domain/workflow";
import {
  findSeedContentFlowByScenarioVersionId,
  getDefaultSeedContentFlow,
  type SeedContentFlow,
} from "../data/contentRepository";
import { ActionPlanView } from "./components/ActionPlanView";
import { HistoryView } from "./components/HistoryView";
import { ReturnContextView } from "./components/ReturnContextView";
import { ScenarioView } from "./components/ScenarioView";
import { StepDetailView } from "./components/StepDetailView";
import "./App.css";

function getContentFlowForPlan(actionPlan: ActionPlanAggregate): SeedContentFlow {
  const contentFlow = findSeedContentFlowByScenarioVersionId({
    lifeSituationId: actionPlan.actionPlan.selectedLifeSituationContext.id,
    scenarioVersionId: actionPlan.actionPlan.scenarioVersionId,
  });

  if (!contentFlow) {
    throw new Error("Action Plan content context is unavailable.");
  }

  return contentFlow;
}

export function App({
  initialActionPlan = null,
  initialHistoryOpen = false,
  initialPlanOpen = false,
  initialSelectedStepId = null,
  initialUserOpenQuestions = [],
}: {
  initialActionPlan?: ActionPlanAggregate | null;
  initialHistoryOpen?: boolean;
  initialPlanOpen?: boolean;
  initialSelectedStepId?: string | null;
  initialUserOpenQuestions?: readonly UserOpenQuestion[];
}) {
  const defaultContentFlow = getDefaultSeedContentFlow();
  const [activePlan, setActivePlan] = useState<ActionPlanAggregate | null>(
    initialActionPlan,
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialSelectedStepId,
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(initialHistoryOpen);
  const [isPlanOpen, setIsPlanOpen] = useState(initialPlanOpen);
  const [userOpenQuestions, setUserOpenQuestions] = useState<
    readonly UserOpenQuestion[]
  >(initialUserOpenQuestions);
  const [newUserOpenQuestionText, setNewUserOpenQuestionText] = useState("");

  function handleStartPlan() {
    const result = startActionPlan({
      ownerId: "local-user",
      intent: "start_plan",
      lifeSituation: defaultContentFlow.lifeSituation,
      scenario: defaultContentFlow.scenario,
      scenarioVersion: defaultContentFlow.scenarioVersion,
      existingPlans: activePlan ? [activePlan] : [],
      operationId: `local-${defaultContentFlow.scenario.id}`,
      occurredAt: new Date().toISOString(),
    });

    setActivePlan(result.plan);
    setUserOpenQuestions([]);
    setNewUserOpenQuestionText("");
    setSelectedStepId(null);
    setIsHistoryOpen(false);
    setIsPlanOpen(false);
  }

  function handleUpdateProgress(
    progressId: string,
    targetStatus: Vs01ProgressUpdateStatus,
  ) {
    if (!activePlan) {
      throw new Error("An active Action Plan is required to update Progress.");
    }

    const occurredAt = new Date().toISOString();
    const updatedPlan = updateProgressStatus({
      plan: activePlan,
      progressId,
      targetStatus,
      operationId: `${progressId}-${targetStatus}-${occurredAt}`,
      occurredAt,
    });

    setActivePlan(updatedPlan);
  }

  function handleAddUserOpenQuestion() {
    if (!activePlan) {
      throw new Error("An active Action Plan is required to add a User Open Question.");
    }

    if (!newUserOpenQuestionText.trim()) {
      return;
    }

    const occurredAt = new Date().toISOString();
    const question = createUserOpenQuestion({
      plan: activePlan,
      questionText: newUserOpenQuestionText,
      operationId: `${activePlan.actionPlan.id}-${userOpenQuestions.length + 1}`,
      occurredAt,
    });

    setUserOpenQuestions((currentQuestions) => [...currentQuestions, question]);
    setNewUserOpenQuestionText("");
  }

  function handleUpdateUserOpenQuestionStatus(
    questionId: string,
    targetStatus: UserOpenQuestionStatus,
  ) {
    const occurredAt = new Date().toISOString();

    setUserOpenQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? updateUserOpenQuestionStatus({
              question,
              targetStatus,
              occurredAt,
            })
          : question,
      ),
    );
  }

  const contentFlow = activePlan
    ? getContentFlowForPlan(activePlan)
    : defaultContentFlow;
  const selectedStep = contentFlow.scenarioVersion.steps.find(
    (step) => step.id === selectedStepId,
  );
  const selectedProgress = activePlan?.progressRecords.find(
    (progress) => progress.versionedStepContextId === selectedStepId,
  );
  const activePlanUserOpenQuestions = activePlan
    ? userOpenQuestions.filter(
        (question) => question.actionPlanId === activePlan.actionPlan.id,
      )
    : [];

  if (activePlan && selectedStepId && (!selectedStep || !selectedProgress)) {
    throw new Error("Selected step is not available in the active Action Plan.");
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Nova Agent</p>
        <h1>Регистрация места жительства в Австрии</h1>
        <p>
          Справочная структура для подготовки: путь, требования и источники
          проверки до внешнего обращения.
        </p>
      </header>

      {!activePlan ? (
        <ScenarioView
          lifeSituation={contentFlow.lifeSituation}
          onStartPlan={handleStartPlan}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
        />
      ) : isHistoryOpen ? (
        <HistoryView
          actionPlan={activePlan}
          onBack={() => setIsHistoryOpen(false)}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
        />
      ) : selectedStep && selectedProgress ? (
        <StepDetailView
          actionPlan={activePlan}
          onBack={() => setSelectedStepId(null)}
          onUpdateProgress={handleUpdateProgress}
          progress={selectedProgress}
          scenarioVersion={contentFlow.scenarioVersion}
          step={selectedStep}
        />
      ) : !isPlanOpen ? (
        <ReturnContextView
          actionPlan={activePlan}
          onContinuePlan={() => setIsPlanOpen(true)}
          onOpenHistory={() => {
            setSelectedStepId(null);
            setIsHistoryOpen(true);
            setIsPlanOpen(true);
          }}
          onOpenStep={(stepId) => {
            setIsHistoryOpen(false);
            setSelectedStepId(stepId);
            setIsPlanOpen(true);
          }}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
        />
      ) : (
        <ActionPlanView
          actionPlan={activePlan}
          newUserOpenQuestionText={newUserOpenQuestionText}
          onAddUserOpenQuestion={handleAddUserOpenQuestion}
          onNewUserOpenQuestionTextChange={setNewUserOpenQuestionText}
          onUpdateUserOpenQuestionStatus={handleUpdateUserOpenQuestionStatus}
          onOpenHistory={() => {
            setSelectedStepId(null);
            setIsHistoryOpen(true);
            setIsPlanOpen(true);
          }}
          onOpenStep={(stepId) => {
            setIsHistoryOpen(false);
            setSelectedStepId(stepId);
            setIsPlanOpen(true);
          }}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
          userOpenQuestions={activePlanUserOpenQuestions}
        />
      )}
    </main>
  );
}
