import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the VS-01 content read flow from the seed content", () => {
    const html = renderToString(<App />);

    expect(html).toContain("Nova Agent");
    expect(html).toContain("Life Situation");
    expect(html).toContain("Scenario");
    expect(html).toContain("Scenario Version");
    expect(html).toContain("v1");
    expect(html).toContain("Steps");
    expect(html).toContain("Documents / Data Requirements");
    expect(html).toContain("Sources");
    expect(html).toContain("Template Open Questions");
    expect(html).toContain("Регистрация места жительства в Австрии");
    expect(html).toContain("Официальный источник");
  });

  it("shows warnings and restrictions before the scenario steps", () => {
    const html = renderToString(<App />);

    expect(html.indexOf("Warnings / Restrictions")).toBeLessThan(
      html.indexOf("Шаги сценария"),
    );
    expect(html.indexOf("Предупреждение")).toBeLessThan(html.indexOf("Шаги сценария"));
    expect(html.indexOf("Ограничение")).toBeLessThan(html.indexOf("Шаги сценария"));
  });

  it("keeps the screen read-only without user-owned workflow areas", () => {
    const html = renderToString(<App />);

    expect(html).not.toContain("Action Plan");
    expect(html).not.toContain("Progress");
    expect(html).not.toContain("History");
    expect(html).not.toContain("User Open Questions");
    expect(html).not.toContain("User Notes");
    expect(html).not.toContain("Checked Source Marks");
    expect(html).not.toContain("My Plans");
    expect(html).not.toContain("Completed Plans");
    expect(html).not.toContain("Supabase");
  });
});
