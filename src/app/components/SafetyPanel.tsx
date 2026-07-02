import type {
  PublishedScenarioVersion,
  Restriction,
  Warning,
} from "../../domain/content";

export function ContentList({
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

export function SafetyPanel({
  scenarioVersion,
}: {
  scenarioVersion: PublishedScenarioVersion;
}) {
  return (
    <section className="safety-section" aria-labelledby="safety-title">
      <p className="eyebrow">Предупреждения и ограничения</p>
      <h2 id="safety-title">Важно до дальнейших действий</h2>
      <div className="safety-grid">
        <ContentList
          className="warning-panel"
          items={scenarioVersion.warnings}
          prefix="Предупреждение"
          title="Предупреждения"
        />
        <ContentList
          className="restriction-panel"
          items={scenarioVersion.restrictions}
          prefix="Ограничение"
          title="Ограничения"
        />
      </div>
    </section>
  );
}
