import type { PublishedScenarioVersion, Scenario } from "../../domain/content";
import {
  getVs02NextStepProgress,
  getVs02ProgressSummary,
  type ActionPlanAggregate,
} from "../../domain/workflow";
import { BoundaryNotice, historyBoundaryCopy, planBoundaryCopy } from "./BoundaryNotice";
import { ProgressBadge } from "./ProgressBadge";

export function ReturnContextView({
  actionPlan,
  onContinuePlan,
  onOpenHistory,
  onOpenStep,
  scenario,
  scenarioVersion,
}: {
  actionPlan: ActionPlanAggregate;
  onContinuePlan: () => void;
  onOpenHistory: () => void;
  onOpenStep: (stepId: string) => void;
  scenario: Scenario;
  scenarioVersion: PublishedScenarioVersion;
}) {
  const summary = getVs02ProgressSummary(actionPlan.progressRecords);
  const nextProgress = getVs02NextStepProgress(actionPlan.progressRecords);
  const nextStep = scenarioVersion.steps.find(
    (step) => step.id === nextProgress?.versionedStepContextId,
  );

  return (
    <section className="flow-section" aria-labelledby="return-context-title">
      <header>
        <p className="eyebrow">Возврат к плану</p>
        <h2 id="return-context-title">Продолжить активный план</h2>
        <p className="lead">
          Есть существующий активный план. Это локальный контекст текущей
          демонстрации: после перезагрузки страницы сохранение плана не обещается.
        </p>
        <div className="plan-title-row">
          <h3>{scenario.title}</h3>
          <span>Версия сценария: {actionPlan.actionPlan.scenarioVersionLabel}</span>
        </div>
        <p className="plan-context">
          Жизненная ситуация: {actionPlan.actionPlan.selectedLifeSituationContext.title}
        </p>
      </header>

      <dl className="definition-grid" aria-label="Active Action Plan context">
        <div>
          <dt>Состояние плана</dt>
          <dd>{actionPlan.actionPlan.state}</dd>
        </div>
        <div>
          <dt>Как выбирается следующий шаг</dt>
          <dd>Следующий шаг рассчитывается только по вашим отметкам Progress.</dd>
        </div>
      </dl>

      <section aria-labelledby="return-summary-title">
        <p className="eyebrow">Сводка прогресса</p>
        <h3 id="return-summary-title">Ваши отметки по активному плану</h3>
        <dl className="definition-grid">
          <div>
            <dt>Всего шагов</dt>
            <dd>{summary.totalSteps}</dd>
          </div>
          <div>
            <dt>Не начато</dt>
            <dd>{summary.notStartedCount}</dd>
          </div>
          <div>
            <dt>В процессе</dt>
            <dd>{summary.inProgressCount}</dd>
          </div>
          <div>
            <dt>Требует проверки</dt>
            <dd>{summary.requiresCheckCount}</dd>
          </div>
        </dl>
        <p>Сводка показывает только количество шагов по вашим отметкам.</p>
      </section>

      {nextStep && nextProgress ? (
        <section className="next-step-panel" aria-labelledby="return-next-step-title">
          <p className="eyebrow">Главный следующий шаг</p>
          <h3 id="return-next-step-title">
            Step {nextStep.order}: {nextStep.title}
          </h3>
          <p>{nextStep.purpose}</p>
          <ProgressBadge progress={nextProgress} />
          <div className="progress-action-buttons">
            <button
              className="secondary-action"
              type="button"
              onClick={() => onOpenStep(nextStep.id)}
            >
              Открыть детали шага
            </button>
            <button className="secondary-action" type="button" onClick={onContinuePlan}>
              Продолжить план
            </button>
          </div>
        </section>
      ) : (
        <section className="next-step-panel" aria-labelledby="return-next-step-title">
          <p className="eyebrow">Главный следующий шаг</p>
          <h3 id="return-next-step-title">Следующий шаг не найден</h3>
          <p>
            В ваших отметках нет шага в процессе, шага на проверке или не начатого
            шага для продолжения.
          </p>
          <button className="secondary-action" type="button" onClick={onContinuePlan}>
            Открыть план
          </button>
        </section>
      )}

      <div className="plan-history-link">
        <div>
          <p className="eyebrow">История</p>
          <h3>Внутренний журнал Nova Agent</h3>
          <p>
            История помогает восстановить контекст, но не является источником текущего
            состояния Progress и не подтверждает внешние действия.
          </p>
        </div>
        <button className="secondary-action" type="button" onClick={onOpenHistory}>
          Открыть историю
        </button>
      </div>

      <BoundaryNotice>{historyBoundaryCopy}</BoundaryNotice>
      <BoundaryNotice>{planBoundaryCopy}</BoundaryNotice>
    </section>
  );
}
