import type { Progress, ProgressStatus } from "../../domain/workflow";

export const progressStatusLabels: Record<ProgressStatus, string> = {
  not_started: "Не начато",
  in_progress: "В процессе",
  awaiting_external_response: "Ожидает внешнего ответа",
  completed: "Выполнено",
  requires_check: "Требует проверки",
};

export function ProgressBadge({ progress }: { progress: Progress }) {
  return (
    <p className="progress-mark">
      <span>Ваша отметка</span>
      <strong>{progressStatusLabels[progress.status]}</strong>
    </p>
  );
}
