import { useState } from "react";
import {
  createCheckedSourceMarkWithHistory,
  createUserNoteWithHistory,
  createUserOpenQuestionWithHistory,
  startActionPlan,
  type ActionPlanAggregate,
  type CheckedSourceMark,
  type UserNote,
  type UserOpenQuestion,
  type UserOpenQuestionStatus,
  type Vs01ProgressUpdateStatus,
  updateUserOpenQuestionStatusWithHistory,
  updateProgressStatus,
} from "../domain/workflow";
import {
  findSeedContentFlowByScenarioVersionId,
  getDefaultSeedContentFlow,
  type SeedContentFlow,
} from "../data/contentRepository";
import { ActionPlanView } from "./components/ActionPlanView";
import {
  AgenticDemoShell,
  agenticDemoExamplePrompt,
} from "./components/AgenticDemoShell";
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
  initialCheckedSourceMarks = [],
  initialHistoryOpen = false,
  initialPlanOpen = false,
  initialSelectedStepId = null,
  initialUserNotes = [],
  initialUserOpenQuestions = [],
}: {
  initialActionPlan?: ActionPlanAggregate | null;
  initialCheckedSourceMarks?: readonly CheckedSourceMark[];
  initialHistoryOpen?: boolean;
  initialPlanOpen?: boolean;
  initialSelectedStepId?: string | null;
  initialUserNotes?: readonly UserNote[];
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
  const [checkedSourceMarks, setCheckedSourceMarks] = useState<
    readonly CheckedSourceMark[]
  >(initialCheckedSourceMarks);
  const [userNotes, setUserNotes] = useState<readonly UserNote[]>(initialUserNotes);
  const [newUserNoteTextByHistoryEventId, setNewUserNoteTextByHistoryEventId] =
    useState<Record<string, string>>({});
  const [demoPrompt, setDemoPrompt] = useState("");
  const [hasSubmittedDemoPrompt, setHasSubmittedDemoPrompt] = useState(false);
  const [isDemoWorkflowOpen, setIsDemoWorkflowOpen] = useState(
    Boolean(initialActionPlan),
  );

  function handleExamplePromptSelect() {
    setDemoPrompt(agenticDemoExamplePrompt);
    setHasSubmittedDemoPrompt(false);
  }

  function handleSubmitDemoPrompt() {
    if (!demoPrompt.trim()) {
      setHasSubmittedDemoPrompt(false);
      return;
    }

    setHasSubmittedDemoPrompt(true);
  }

  function handleOpenDemoWorkflow() {
    setIsDemoWorkflowOpen(true);
  }

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
    setCheckedSourceMarks([]);
    setUserNotes([]);
    setNewUserNoteTextByHistoryEventId({});
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
    const result = createUserOpenQuestionWithHistory({
      plan: activePlan,
      questionText: newUserOpenQuestionText,
      operationId: `${activePlan.actionPlan.id}-${userOpenQuestions.length + 1}`,
      occurredAt,
    });

    setActivePlan(result.plan);
    setUserOpenQuestions((currentQuestions) => [
      ...currentQuestions,
      result.question,
    ]);
    setNewUserOpenQuestionText("");
  }

  function handleUpdateUserOpenQuestionStatus(
    questionId: string,
    targetStatus: UserOpenQuestionStatus,
  ) {
    if (!activePlan) {
      throw new Error(
        "An active Action Plan is required to update a User Open Question.",
      );
    }

    const currentQuestion = userOpenQuestions.find(
      (question) =>
        question.id === questionId &&
        question.actionPlanId === activePlan.actionPlan.id,
    );

    if (!currentQuestion) {
      throw new Error("User Open Question is not available in the active plan.");
    }

    const occurredAt = new Date().toISOString();
    const result = updateUserOpenQuestionStatusWithHistory({
      plan: activePlan,
      question: currentQuestion,
      targetStatus,
      operationId: `${questionId}-${targetStatus}-${occurredAt}`,
      occurredAt,
    });

    setUserOpenQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? result.question : question,
      ),
    );
    setActivePlan(result.plan);
  }

  function handleMarkSourceChecked(sourceRevisionId: string) {
    if (!activePlan) {
      throw new Error("An active Action Plan is required to mark a source as checked.");
    }

    setCheckedSourceMarks((currentMarks) => {
      const existingMark = currentMarks.find(
        (mark) =>
          mark.actionPlanId === activePlan.actionPlan.id &&
          mark.sourceRevisionId === sourceRevisionId,
      );

      if (existingMark) {
        return currentMarks;
      }

      const occurredAt = new Date().toISOString();
      const result = createCheckedSourceMarkWithHistory({
        plan: activePlan,
        sourceRevisionId,
        operationId: `${activePlan.actionPlan.id}-${sourceRevisionId}-${currentMarks.length + 1}`,
        occurredAt,
      });

      setActivePlan(result.plan);

      return [...currentMarks, result.mark];
    });
  }

  function handleNewUserNoteTextChange(historyEventId: string, noteText: string) {
    setNewUserNoteTextByHistoryEventId((currentTextById) => ({
      ...currentTextById,
      [historyEventId]: noteText,
    }));
  }

  function handleAddUserNote(historyEventId: string) {
    if (!activePlan) {
      throw new Error("An active Action Plan is required to add a User Note.");
    }

    const noteText = newUserNoteTextByHistoryEventId[historyEventId] ?? "";

    if (!noteText.trim()) {
      return;
    }

    const occurredAt = new Date().toISOString();
    const result = createUserNoteWithHistory({
      plan: activePlan,
      historyEventId,
      text: noteText,
      operationId: `${activePlan.actionPlan.id}-${historyEventId}-${userNotes.length + 1}`,
      occurredAt,
    });

    setActivePlan(result.plan);
    setUserNotes((currentNotes) => [...currentNotes, result.note]);
    setNewUserNoteTextByHistoryEventId((currentTextById) => ({
      ...currentTextById,
      [historyEventId]: "",
    }));
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
  const activePlanCheckedSourceMarks = activePlan
    ? checkedSourceMarks.filter(
        (mark) => mark.actionPlanId === activePlan.actionPlan.id,
      )
    : [];
  const activePlanUserNotes = activePlan
    ? userNotes.filter((note) => note.actionPlanId === activePlan.actionPlan.id)
    : [];

  if (activePlan && selectedStepId && (!selectedStep || !selectedProgress)) {
    throw new Error("Selected step is not available in the active Action Plan.");
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Nova Agent demo</p>
        <h1>Понятный план действий для жизни в Австрии</h1>
        <p>
          Демонстрационный сценарий: регистрация места жительства. Nova Agent
          помогает увидеть путь, требования, источники проверки и ваш собственный
          контекст до внешнего обращения.
        </p>
      </header>

      {!activePlan && !isDemoWorkflowOpen ? (
        <AgenticDemoShell
          demoPrompt={demoPrompt}
          hasSubmittedDemoPrompt={hasSubmittedDemoPrompt}
          onDemoPromptChange={(prompt) => {
            setDemoPrompt(prompt);
            setHasSubmittedDemoPrompt(false);
          }}
          onExamplePromptSelect={handleExamplePromptSelect}
          onOpenWorkflow={handleOpenDemoWorkflow}
          onSubmitDemoPrompt={handleSubmitDemoPrompt}
        />
      ) : !activePlan ? (
        <ScenarioView
          lifeSituation={contentFlow.lifeSituation}
          onStartPlan={handleStartPlan}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
        />
      ) : isHistoryOpen ? (
        <HistoryView
          actionPlan={activePlan}
          newUserNoteTextByHistoryEventId={newUserNoteTextByHistoryEventId}
          onAddUserNote={handleAddUserNote}
          onBack={() => setIsHistoryOpen(false)}
          onNewUserNoteTextChange={handleNewUserNoteTextChange}
          scenario={contentFlow.scenario}
          scenarioVersion={contentFlow.scenarioVersion}
          userNotes={activePlanUserNotes}
        />
      ) : selectedStep && selectedProgress ? (
        <StepDetailView
          actionPlan={activePlan}
          checkedSourceMarks={activePlanCheckedSourceMarks}
          onBack={() => setSelectedStepId(null)}
          onMarkSourceChecked={handleMarkSourceChecked}
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
