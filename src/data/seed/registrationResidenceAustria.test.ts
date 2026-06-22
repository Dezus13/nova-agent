import { describe, expect, it } from "vitest";
import {
  findSeedScenarioById,
  findSeedScenarioVersionById,
  getSeedContentCatalog,
  listSeedLifeSituations,
} from "../contentRepository";

describe("registration residence Austria seed content", () => {
  const catalog = getSeedContentCatalog();
  const scenarioVersion = catalog.scenarioVersions[0];

  it("exposes exactly one Life Situation, one Scenario, and one published Scenario Version", () => {
    expect(listSeedLifeSituations()).toHaveLength(1);
    expect(catalog.scenarios).toHaveLength(1);
    expect(catalog.scenarioVersions).toHaveLength(1);

    expect(catalog.lifeSituations[0]?.title).toBe(
      "Регистрация места жительства в Австрии",
    );
    expect(catalog.scenarios[0]?.title).toBe("Регистрация места жительства в Австрии");
    expect(scenarioVersion?.publicationState).toBe("published");
  });

  it("links Life Situation, Scenario, and Scenario Version in both directions needed for VS-01 content read", () => {
    const lifeSituation = catalog.lifeSituations[0];
    const scenario = catalog.scenarios[0];

    expect(lifeSituation?.scenarioIds).toEqual([scenario?.id]);
    expect(scenario?.lifeSituationIds).toEqual([lifeSituation?.id]);
    expect(scenario?.versionIds).toEqual([scenarioVersion?.id]);

    expect(findSeedScenarioById(scenario?.id ?? "")).toBe(scenario);
    expect(findSeedScenarioVersionById(scenarioVersion?.id ?? "")).toBe(scenarioVersion);
  });

  it("contains the approved seed content groups without user-owned workflow entities", () => {
    expect(scenarioVersion?.steps).toHaveLength(6);
    expect(scenarioVersion?.requirements.length).toBeGreaterThanOrEqual(10);
    expect(scenarioVersion?.sources).toHaveLength(6);
    expect(scenarioVersion?.warnings).toHaveLength(5);
    expect(scenarioVersion?.restrictions).toHaveLength(6);
    expect(scenarioVersion?.applicabilityConditions).toHaveLength(5);
    expect(scenarioVersion?.templateOpenQuestions).toHaveLength(8);

    expect(scenarioVersion).not.toHaveProperty("actionPlan");
    expect(scenarioVersion).not.toHaveProperty("progress");
    expect(scenarioVersion).not.toHaveProperty("history");
    expect(scenarioVersion).not.toHaveProperty("userOpenQuestions");
    expect(scenarioVersion).not.toHaveProperty("userNotes");
    expect(scenarioVersion).not.toHaveProperty("checkedSourceMarks");
  });

  it("keeps every step connected to requirements and sources", () => {
    const requirementIds = new Set(
      scenarioVersion?.requirements.map((requirement) => requirement.id),
    );
    const sourceIds = new Set(scenarioVersion?.sources.map((source) => source.id));

    for (const step of scenarioVersion?.steps ?? []) {
      expect(step.requirementIds.length).toBeGreaterThan(0);
      expect(step.sourceIds.length).toBeGreaterThan(0);
      expect(step.requirementIds.every((requirementId) => requirementIds.has(requirementId))).toBe(
        true,
      );
      expect(step.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    }
  });

  it("labels every source as an external content source that must be checked for currentness", () => {
    for (const source of scenarioVersion?.sources ?? []) {
      expect(source.type).toBe("official");
      expect(source.checkCurrentness).toBe(true);
      expect(source.url).toMatch(/^https:\/\//);
    }
  });
});
