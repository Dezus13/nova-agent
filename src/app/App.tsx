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

function StartPlanPanel({
  activePlan,
  onStartPlan,
}: {
  activePlan: ActionPlanAggregate | null;
  onStartPlan: () => void;
}) {
  if (activePlan) {
    return (
      <section
        className="flow-section plan-confirmation"
        aria-labelledby="plan-confirmation-title"
        aria-live="polite"
      >
        <p className="eyebrow">Action Plan</p>
        <h2 id="plan-confirmation-title">План создан</h2>
        <dl className="plan-summary">
          <div>
            <dt>Статус</dt>
            <dd>{activePlan.actionPlan.state}</dd>
          </div>
          <div>
            <dt>Scenario Version</dt>
            <dd>{activePlan.actionPlan.scenarioVersionLabel}</dd>
          </div>
          <div>
            <dt>Steps</dt>
            <dd>{activePlan.progressRecords.length}</dd>
          </div>
          <div>
            <dt>Progress records</dt>
            <dd>{activePlan.progressRecords.length}</dd>
          </div>
        </dl>
        <p className="plan-boundary">
          Это ваш сохранённый план в Nova Agent, а не официальный статус. Требования и
          результат внешнего процесса проверяйте в официальном источнике.
        </p>
      </section>
    );
  }

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

export function App({
  initialActionPlan = null,
}: {
  initialActionPlan?: ActionPlanAggregate | null;
}) {
  const { lifeSituation, scenario, scenarioVersion } = getFirstContentFlow();
  const [activePlan, setActivePlan] = useState<ActionPlanAggregate | null>(
    initialActionPlan,
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
      <StartPlanPanel activePlan={activePlan} onStartPlan={handleStartPlan} />
    </main>
  );
}
