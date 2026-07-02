import type {
  LifeSituation,
  PublishedScenarioVersion,
  Requirement,
  Scenario,
  Source,
  Step,
} from "../../domain/content";
import type { CheckedSourceMark } from "../../domain/workflow";
import { LifeSituationView } from "./LifeSituationView";
import { BoundaryNotice } from "./BoundaryNotice";
import { SafetyPanel } from "./SafetyPanel";

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "Официальный источник",
  reference: "Справочный источник",
  external_verification: "Направление внешней проверки",
};

const requirementKindLabels: Record<Requirement["kind"], string> = {
  document: "Документ",
  data: "Данные",
};

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

export function RequirementsPanel({
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

export function SourcesPanel({
  checkedSourceMarks = [],
  id,
  onMarkSourceChecked,
  sources,
}: {
  checkedSourceMarks?: readonly CheckedSourceMark[];
  id: string;
  onMarkSourceChecked?: (sourceRevisionId: string) => void;
  sources: readonly Source[];
}) {
  return (
    <section className="flow-section" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">Sources</p>
      <h2 id={`${id}-title`}>Где проверить официальный источник</h2>
      <div className="source-list">
        {sources.map((source) => {
          const checkedSourceMark = checkedSourceMarks.find(
            (mark) => mark.sourceRevisionId === source.id,
          );

          return (
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
              {onMarkSourceChecked ? (
                <div className="boundary-box">
                  {checkedSourceMark ? (
                    <p>
                      <strong>Отмечено вами:</strong> вы отметили, что проверили
                      этот источник.
                    </p>
                  ) : null}
                  <p>
                    Nova Agent не проверяет источник. Это не официальный статус.
                    Это не подтверждение действия.
                  </p>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => onMarkSourceChecked(source.id)}
                  >
                    Отметить как проверено мной
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
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

function StepsPanel({
  scenarioVersion,
}: {
  scenarioVersion: PublishedScenarioVersion;
}) {
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

function StartPlanPanel({ onStartPlan }: { onStartPlan: () => void }) {
  return (
    <section className="flow-section start-plan-section" aria-labelledby="start-plan-title">
      <p className="eyebrow">Следующий шаг</p>
      <h2 id="start-plan-title">Сохранить этот путь как свой план</h2>
      <p>
        Создание плана сохранит выбранную Life Situation и текущую published Scenario
        Version. Все шаги начнутся с вашей отметки <code>not_started</code>.
      </p>
      <BoundaryNotice>
        План помогает организовать прохождение, но не подтверждает официальный статус,
        достаточность документов или результат обращения.
      </BoundaryNotice>
      <button className="primary-action" type="button" onClick={onStartPlan}>
        Начать план
      </button>
    </section>
  );
}

export function ScenarioView({
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
      <LifeSituationView lifeSituation={lifeSituation} />
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
