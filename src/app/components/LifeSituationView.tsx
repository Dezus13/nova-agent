import type { LifeSituation } from "../../domain/content";

export function LifeSituationView({
  lifeSituation,
}: {
  lifeSituation: LifeSituation;
}) {
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
