import type { PublishedScenarioVersion, Scenario } from "../../domain/content";
import type { ActionPlanAggregate } from "../../domain/workflow";
import { BoundaryNotice, planBoundaryCopy } from "./BoundaryNotice";
import { ProgressBadge } from "./ProgressBadge";

export function ActionPlanView({
  actionPlan,
  onOpenHistory,
  onOpenStep,
  scenario,
  scenarioVersion,
}: {
  actionPlan: ActionPlanAggregate;
  onOpenHistory: () => void;
  onOpenStep: (stepId: string) => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  const nextProgress = actionPlan.progressRecords.find(
    (progress) => progress.status !== "completed",
  );
  const nextStep = scenarioVersion.steps.find(
    (step) => step.id === nextProgress?.versionedStepContextId,
  );

  return (
    <section className="plan-view" aria-labelledby="action-plan-title">
      <header className="plan-header">
        <p className="eyebrow">Ваш план</p>
        <div className="plan-title-row">
          <h2 id="action-plan-title">{scenario.title}</h2>
          <span>Scenario Version: {actionPlan.actionPlan.scenarioVersionLabel}</span>
        </div>
        <p className="plan-context">
          Life Situation: {actionPlan.actionPlan.selectedLifeSituationContext.title}
        </p>
        <dl className="plan-summary">
          <div>
            <dt>Статус плана</dt>
            <dd>{actionPlan.actionPlan.state}</dd>
          </div>
        </dl>
        <BoundaryNotice>{planBoundaryCopy}</BoundaryNotice>
      </header>

      <section className="plan-steps-section" aria-labelledby="plan-steps-title">
        <p className="eyebrow">Progress</p>
        <h3 id="plan-steps-title">Шаги плана</h3>
        <p className="section-intro">
          Статусы ниже — ваши личные отметки в Nova Agent, а не сведения от
          государственного органа или учреждения.
        </p>
        {nextStep ? (
          <div className="next-step-panel" aria-labelledby="next-step-title">
            <p className="eyebrow">Следующий шаг</p>
            <h4 id="next-step-title">
              Step {nextStep.order}: {nextStep.title}
            </h4>
            <p>{nextStep.purpose}</p>
            <button
              className="secondary-action"
              type="button"
              onClick={() => onOpenStep(nextStep.id)}
            >
              Открыть следующий шаг
            </button>
          </div>
        ) : null}
        <div className="plan-step-list">
          {scenarioVersion.steps.map((step) => {
            const progress = actionPlan.progressRecords.find(
              (record) => record.versionedStepContextId === step.id,
            );

            if (!progress) {
              throw new Error(`Progress is missing for step ${step.id}.`);
            }

            return (
              <article className="plan-step-row" key={step.id}>
                <div>
                  <p className="step-order">Step {step.order}</p>
                  <h4>{step.title}</h4>
                  <p>{step.purpose}</p>
                </div>
                <div className="plan-step-actions">
                  <ProgressBadge progress={progress} />
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => onOpenStep(step.id)}
                  >
                    Открыть шаг
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="plan-history-link">
          <div>
            <p className="eyebrow">History</p>
            <h4>История плана</h4>
            <p>
              Просмотрите внутренние события Nova Agent, чтобы восстановить контекст
              плана.
            </p>
          </div>
          <button className="secondary-action" type="button" onClick={onOpenHistory}>
            Открыть историю
          </button>
        </div>
      </section>
    </section>
  );
}
