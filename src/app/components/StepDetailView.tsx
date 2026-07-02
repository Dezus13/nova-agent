import type { PublishedScenarioVersion, Step } from "../../domain/content";
import type {
  ActionPlanAggregate,
  CheckedSourceMark,
  Progress,
  Vs01ProgressUpdateStatus,
} from "../../domain/workflow";
import { BoundaryNotice, planBoundaryCopy } from "./BoundaryNotice";
import { ProgressBadge } from "./ProgressBadge";
import { RequirementsPanel, SourcesPanel } from "./ScenarioView";
import { ContentList } from "./SafetyPanel";

export function StepDetailView({
  actionPlan,
  onBack,
  onMarkSourceChecked,
  onUpdateProgress,
  progress,
  scenarioVersion,
  step,
  checkedSourceMarks,
}: {
  actionPlan: ActionPlanAggregate;
  checkedSourceMarks: readonly CheckedSourceMark[];
  onBack: () => void;
  onMarkSourceChecked: (sourceRevisionId: string) => void;
  onUpdateProgress: (
    progressId: string,
    targetStatus: Vs01ProgressUpdateStatus,
  ) => void;
  progress: Progress;
  scenarioVersion: PublishedScenarioVersion;
  step: Step;
}) {
  const requirements = scenarioVersion.requirements.filter((requirement) =>
    step.requirementIds.includes(requirement.id),
  );
  const sources = scenarioVersion.sources.filter((source) =>
    step.sourceIds.includes(source.id),
  );
  const warnings = scenarioVersion.warnings.filter((warning) =>
    step.warningIds.includes(warning.id),
  );
  const restrictions = scenarioVersion.restrictions.filter((restriction) =>
    step.restrictionIds.includes(restriction.id),
  );

  return (
    <section className="plan-view" aria-labelledby="step-detail-title">
      <header className="step-detail-header">
        <p className="eyebrow">
          Ваш план · Step {step.order} · {actionPlan.actionPlan.scenarioVersionLabel}
        </p>
        <h2 id="step-detail-title">{step.title}</h2>
      </header>

      <section className="step-detail-safety" aria-labelledby="step-safety-title">
        <p className="eyebrow">Warnings / Restrictions</p>
        <h3 id="step-safety-title">Важно до действий по шагу</h3>
        <div className="safety-grid">
          <ContentList
            className="warning-panel"
            items={warnings}
            prefix="Предупреждение"
            title="Warnings"
          />
          <ContentList
            className="restriction-panel"
            items={restrictions}
            prefix="Ограничение"
            title="Restrictions"
          />
        </div>
      </section>

      <section className="step-context-section" aria-labelledby="step-purpose-title">
        <p className="eyebrow">Цель шага</p>
        <h3 id="step-purpose-title">{step.purpose}</h3>
        <p>{step.userShouldUnderstand}</p>
      </section>

      <section className="step-context-section" aria-labelledby="step-applicability-title">
        <p className="eyebrow">Applicability Conditions</p>
        <h3 id="step-applicability-title">Проверьте применимость сценария</h3>
        <ul className="check-list">
          {scenarioVersion.applicabilityConditions.map((condition) => (
            <li key={condition.id}>
              <strong>Условие применимости:</strong> {condition.text}
            </li>
          ))}
        </ul>
      </section>

      <RequirementsPanel
        id="plan-step-requirements"
        requirements={requirements}
        title="Documents / Data Requirements"
      />
      <SourcesPanel
        checkedSourceMarks={checkedSourceMarks}
        id="plan-step-sources"
        onMarkSourceChecked={onMarkSourceChecked}
        sources={sources}
      />

      <section className="step-progress-section" aria-labelledby="step-progress-title">
        <p className="eyebrow">Progress</p>
        <h3 id="step-progress-title">Текущее состояние шага</h3>
        <ProgressBadge progress={progress} />
        <p>
          Эта отметка не подтверждает выполнение требования, принятие документов или
          результат внешней регистрации.
        </p>
        {progress.status === "not_started" ? (
          <div className="progress-actions" aria-label="Изменить вашу отметку">
            <p>Выберите только то состояние, которое соответствует вашему контексту.</p>
            <div className="progress-action-buttons">
              <button
                className="secondary-action"
                type="button"
                onClick={() => onUpdateProgress(progress.id, "in_progress")}
              >
                Отметить: В процессе
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={() => onUpdateProgress(progress.id, "requires_check")}
              >
                Отметить: Требует проверки
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <BoundaryNotice>{planBoundaryCopy}</BoundaryNotice>
      <button className="secondary-action" type="button" onClick={onBack}>
        Вернуться к плану
      </button>
    </section>
  );
}
