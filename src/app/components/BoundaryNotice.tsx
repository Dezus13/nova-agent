import type { ReactNode } from "react";

export const planBoundaryCopy =
  "Nova Agent — справочная и организационная помощь. Продукт не является государственным органом, специалистом или консультантом. Все отметки прогресса отражают только ваши собственные записи. Nova Agent не подтверждает документы, сроки, применимость требований или результаты официального процесса.";

export const historyBoundaryCopy =
  "История — внутренние события Nova Agent. Не является официальным журналом взаимодействия с органами, учреждениями или специалистами. Записи не подтверждают, что действие выполнено пользователем или принято внешней стороной.";

export function BoundaryNotice({
  children,
  className = "plan-boundary",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={className}>{children}</p>;
}
