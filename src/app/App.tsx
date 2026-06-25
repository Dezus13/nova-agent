import { useState } from "react";
import type {
  LifeSituation,
  PublishedScenarioVersion,
  Requirement,
  Restriction,
  Scenario,
  Source,
  Step,
  Warning,
} from "../domain/content";
import {
  startActionPlan,
  type ActionPlanAggregate,
  type Progress,
  type ProgressStatus,
} from "../domain/workflow";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  listSeedLifeSituations,
} from "../data/contentRepository";
import "./App.css";

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "Официальный источник",
  reference: "Справочный источник",
  external_verification: "Направление внешней проверки",
};

const requirementKindLabels: Record<Requirement["kind"], string> = {
  document: "Документ",
  data: "Данные",
};

const progressStatusLabels: Record<ProgressStatus, string> = {
  not_started: "Не начато",
  in_progress: "В процессе",
  awaiting_external_response: "Ожидает внешнего ответа",
  completed: "Выполнено",
  requires_check: "Требует проверки",
};

const planBoundaryCopy =
  "Nova Agent — справочная и организационная помощь. Продукт не является государственным органом, специалистом или консультантом. Все отметки прогресса отражают только ваши собственные записи. Nova Agent не подтверждает документы, сроки, применимость требований или результаты официального процесса.";

function getFirstContentFlow(): {
  lifeSituation: LifeSituation;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
} {
  const lifeSituation = listSeedLifeSituations()[0];
  const scenarioId = lifeSituation?.scenarioIds[0];
  const scenario = scenarioId ? findSeedScenarioById(scenarioId) : undefined;
  const scenarioVersionId = scenario?.versionIds[0];
  const scenarioVersion = scenarioVersionId
    ? findSeedScenarioVersionById(scenarioVersionId)
    : undefined;

  if (!lifeSituation || !scenario || !scenarioVersion) {
    throw new Error("VS-01 seed content is incomplete.");
  }

  return { lifeSituation, scenario, scenarioVersion };
}

function ContentList({
  items,
  title,
  className,
  prefix,
}: {
  items: readonly (Warning | Restriction)[];
  title: string;
  className: string;
  prefix: string;
}) {
  return (
    <section className={className} aria-labelledby={`${className}-title`}>
      <h3 id={`${className}-title`}>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{prefix}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LifeSituationPanel({ lifeSituation }: { lifeSituation: LifeSituation }) {
  return (
    <section className="flow-section" aria-labelledby="life-situation-title">
      <p className="eyebrow">Life Situation</p>
      <h2 id="life-situation-title">{lifeSituation.title}</h2>
      <p className="lead">{lifeSituation.summary}</p>
      <dl className="definition-grid">
        <div>
          <dt>Формулировка пользователя</dt>
          <dd>{lifeSituation.userPhrase}</dd>
        </div>
        <div>
          <dt>Граница помощи</dt>
          <dd>{lifeSituation.supportBoundary}</dd>
        </div>
      </dl>
    </section>
  );
}

function ScenarioPanel({
  scenario,
  scenarioVersion,
}: {
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  return (
    <section className="flow-section" aria-labelledby="scenario-title">
      <p className="eyebrow">Scenario</p>
      <h2 id="scenario-title">{scenario.title}</h2>
      <div className="scenario-meta">
        <span>Scenario Version: {scenarioVersion.versionLabel}</span>
        <span>Опубликованное содержание</span>
      </div>
      <p className="lead">{scenarioVersion.goal}</p>
      <p>{scenarioVersion.expectedOutcome}</p>
      <div className="boundary-box">
        <strong>Границы продукта:</strong> справочная помощь; не официальный ответ;
        проверьте официальный источник.
      </div>
      <ul className="compact-list" aria-label="Что сценарий не обещает">
        {scenarioVersion.nonGuarantees.map((nonGuarantee) => (
          <li key={nonGuarantee}>{nonGuarantee}</li>
        ))}
      </ul>
    </section>
  );
}

function ApplicabilityPanel({
  scenarioVersion,
}: {
  scenarioVersion: PublishedScenarioVersion;
}) {
  return (
    <section className="flow-section" aria-labelledby="applicability-title">
      <p className="eyebrow">Applicability Conditions</p>
      <h2 id="applicability-title">Кому подходит сценарий</h2>
      <ul className="check-list">
        {scenarioVersion.applicabilityConditions.map((condition) => (
          <li key={condition.id}>
            <strong>Условие применимости:</strong> {condition.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SafetyPanel({ scenarioVersion }: { scenarioVersion: PublishedScenarioVersion }) {
  return (
    <section className="safety-section" aria-labelledby="safety-title">
      <p className="eyebrow">Warnings / Restrictions</p>
      <h2 id="safety-title">Важно до дальнейших действий</h2>
      <div className="safety-grid">
        <ContentList
          className="warning-panel"
          items={scenarioVersion.warnings}
          prefix="Предупреждение"
          title="Warnings"
        />
        <ContentList
          className="restriction-panel"
          items={scenarioVersion.restrictions}
          prefix="Ограничение"
          title="Restrictions"
        />
      </div>
    </section>
  );
}

function TemplateOpenQuestionsPanel({
  scenarioVersion,
}: {
  scenarioVersion: PublishedScenarioVersion;
}) {
  return (
    <section className="flow-section" aria-labelledby="template-questions-title">
      <p className="eyebrow">Template Open Questions</p>
      <h2 id="template-questions-title">Вопросы для внешней проверки</h2>
      <ol className="numbered-list">
        {scenarioVersion.templateOpenQuestions.map((question) => (
          <li key={question.id}>{question.text}</li>
        ))}
      </ol>
    </section>
  );
}

function RequirementsPanel({
  id,
  requirements,
  title,
}: {
  id: string;
  requirements: readonly Requirement[];
  title: string;
}) {
  return (
    <section className="flow-section" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">Documents / Data Requirements</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="requirement-grid">
        {requirements.map((requirement) => (
          <article className="requirement-card" key={requirement.id}>
            <p className="tag">{requirementKindLabels[requirement.kind]}</p>
            <h3>{requirement.title}</h3>
            <p>{requirement.description}</p>
            {requirement.verificationNote ? (
              <p className="verification-note">{requirement.verificationNote}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SourcesPanel({ id, sources }: { id: string; sources: readonly Source[] }) {
  return (
    <section className="flow-section" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">Sources</p>
      <h2 id={`${id}-title`}>Где проверить официальный источник</h2>
      <div className="source-list">
        {sources.map((source) => (
          <article className="source-card" key={source.id}>
            <p className="tag">{sourceTypeLabels[source.type]}</p>
            <h3>
              <a href={source.url} rel="noreferrer" target="_blank">
                {source.title}
              </a>
            </h3>
            <p>{source.usage}</p>
            {source.checkCurrentness ? (
              <p className="verification-note">Проверьте актуальность требований.</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function StepCard({
  scenarioVersion,
  step,
}: {
  scenarioVersion: PublishedScenarioVersion;
  step: Step;
}) {
  const requirements = scenarioVersion.requirements.filter((requirement) =>
    step.requirementIds.includes(requirement.id),
  );
  const sources = scenarioVersion.sources.filter((source) => step.sourceIds.includes(source.id));
  const warnings = scenarioVersion.warnings.filter((warning) =>
    step.warningIds.includes(warning.id),
  );
  const restrictions = scenarioVersion.restrictions.filter((restriction) =>
    step.restrictionIds.includes(restriction.id),
  );

  return (
    <article className="step-card">
      <p className="step-order">Step {step.order}</p>
      <h3>{step.title}</h3>
      <p>{step.purpose}</p>
      <p>{step.userShouldUnderstand}</p>
      {warnings.length > 0 || restrictions.length > 0 ? (
        <div className="inline-safety">
          {warnings.map((warning) => (
            <p key={warning.id}>
              <strong>Предупреждение:</strong> {warning.text}
            </p>
          ))}
          {restrictions.map((restriction) => (
            <p key={restriction.id}>
              <strong>Ограничение:</strong> {restriction.text}
            </p>
          ))}
        </div>
      ) : null}
      <RequirementsPanel
        id={`step-${step.order}-requirements`}
        requirements={requirements}
        title="Что подготовить к шагу"
      />
      <SourcesPanel id={`step-${step.order}-sources`} sources={sources} />
    </article>
  );
}

function StepsPanel({ scenarioVersion }: { scenarioVersion: PublishedScenarioVersion }) {
  return (
    <section className="flow-section" aria-labelledby="steps-title">
      <p className="eyebrow">Steps</p>
      <h2 id="steps-title">Шаги сценария</h2>
      <div className="step-list">
        {scenarioVersion.steps.map((step) => (
          <StepCard key={step.id} scenarioVersion={scenarioVersion} step={step} />
        ))}
      </div>
    </section>
  );
}

function ProgressMark({ progress }: { progress: Progress }) {
  return (
    <p className="progress-mark">
      <span>Ваша отметка</span>
      <strong>{progressStatusLabels[progress.status]}</strong>
    </p>
  );
}

function ActionPlanDetail({
  actionPlan,
  onOpenStep,
  scenario,
  scenarioVersion,
}: {
  actionPlan: ActionPlanAggregate;
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
        <p className="plan-boundary">{planBoundaryCopy}</p>
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
                  <ProgressMark progress={progress} />
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
      </section>
    </section>
  );
}

function StepDetail({
  actionPlan,
  onBack,
  progress,
  scenarioVersion,
  step,
}: {
  actionPlan: ActionPlanAggregate;
  onBack: () => void;
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
      <SourcesPanel id="plan-step-sources" sources={sources} />

      <section className="step-progress-section" aria-labelledby="step-progress-title">
        <p className="eyebrow">Progress</p>
        <h3 id="step-progress-title">Текущее состояние шага</h3>
        <ProgressMark progress={progress} />
        <p>
          Эта отметка не подтверждает выполнение требования, принятие документов или
          результат внешней регистрации.
        </p>
      </section>

      <p className="plan-boundary">{planBoundaryCopy}</p>
      <button className="secondary-action" type="button" onClick={onBack}>
        Вернуться к плану
      </button>
    </section>
  );
}

function StartPlanPanel({ onStartPlan }: { onStartPlan: () => void }) {
  return (
    <section className="flow-section start-plan-section" aria-labelledby="start-plan-title">
      <p className="eyebrow">Следующий шаг</p>
      <h2 id="start-plan-title">Сохранить этот путь как свой план</h2>
      <p>
        Создание плана сохранит выбранную Life Situation и текущую published Scenario
        Version. Все шаги начнутся с вашей отметки <code>not_started</code>.
      </p>
      <p className="plan-boundary">
        План помогает организовать прохождение, но не подтверждает официальный статус,
        достаточность документов или результат обращения.
      </p>
      <button className="primary-action" type="button" onClick={onStartPlan}>
        Начать план
      </button>
    </section>
  );
}

function ScenarioReadView({
  lifeSituation,
  onStartPlan,
  scenario,
  scenarioVersion,
}: {
  lifeSituation: LifeSituation;
  onStartPlan: () => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  return (
    <>
      <LifeSituationPanel lifeSituation={lifeSituation} />
      <SafetyPanel scenarioVersion={scenarioVersion} />
      <ScenarioPanel scenario={scenario} scenarioVersion={scenarioVersion} />
      <ApplicabilityPanel scenarioVersion={scenarioVersion} />
      <TemplateOpenQuestionsPanel scenarioVersion={scenarioVersion} />
      <StepsPanel scenarioVersion={scenarioVersion} />
      <RequirementsPanel
        id="scenario-requirements"
        requirements={scenarioVersion.requirements}
        title="Что нужно подготовить"
      />
      <SourcesPanel id="scenario-sources" sources={scenarioVersion.sources} />
      <StartPlanPanel onStartPlan={onStartPlan} />
    </>
  );
}

export function App({
  initialActionPlan = null,
  initialSelectedStepId = null,
}: {
  initialActionPlan?: ActionPlanAggregate | null;
  initialSelectedStepId?: string | null;
}) {
  const { lifeSituation, scenario, scenarioVersion } = getFirstContentFlow();
  const [activePlan, setActivePlan] = useState<ActionPlanAggregate | null>(
    initialActionPlan,
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialSelectedStepId,
  );

  function handleStartPlan() {
    const result = startActionPlan({
      ownerId: "local-user",
      intent: "start_plan",
      lifeSituation,
      scenario,
      scenarioVersion,
      existingPlans: activePlan ? [activePlan] : [],
      operationId: `local-${scenario.id}`,
      occurredAt: new Date().toISOString(),
    });

    setActivePlan(result.plan);
    setSelectedStepId(null);
  }

  const selectedStep = scenarioVersion.steps.find(
    (step) => step.id === selectedStepId,
  );
  const selectedProgress = activePlan?.progressRecords.find(
    (progress) => progress.versionedStepContextId === selectedStepId,
  );

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
        <ScenarioReadView
          lifeSituation={lifeSituation}
          onStartPlan={handleStartPlan}
          scenario={scenario}
          scenarioVersion={scenarioVersion}
        />
      ) : selectedStep && selectedProgress ? (
        <StepDetail
          actionPlan={activePlan}
          onBack={() => setSelectedStepId(null)}
          progress={selectedProgress}
          scenarioVersion={scenarioVersion}
          step={selectedStep}
        />
      ) : (
        <ActionPlanDetail
          actionPlan={activePlan}
          onOpenStep={setSelectedStepId}
          scenario={scenario}
          scenarioVersion={scenarioVersion}
        />
      )}
    </main>
  );
}
