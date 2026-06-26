import type {
  LifeSituation,
  PublishedScenarioVersion,
  Scenario,
  SeedContentCatalog,
} from "../domain/content";
import { registrationResidenceAustriaSeed } from "./seed";

const seedContentCatalog = registrationResidenceAustriaSeed;
const defaultLifeSituationId = "life-situation-registration-residence-austria";
const defaultScenarioVersionId = "scenario-version-registration-residence-austria-v1";

export interface SeedContentFlow {
  readonly lifeSituation: LifeSituation;
  readonly scenario: Scenario;
  readonly scenarioVersion: PublishedScenarioVersion;
}

export function getSeedContentCatalog(): SeedContentCatalog {
  return seedContentCatalog;
}

export function listSeedLifeSituations(): readonly LifeSituation[] {
  return seedContentCatalog.lifeSituations;
}

export function findSeedLifeSituationById(
  lifeSituationId: string,
): LifeSituation | undefined {
  return seedContentCatalog.lifeSituations.find(
    (lifeSituation) => lifeSituation.id === lifeSituationId,
  );
}

export function findSeedScenarioById(scenarioId: string): Scenario | undefined {
  return seedContentCatalog.scenarios.find((scenario) => scenario.id === scenarioId);
}

export function findSeedScenarioVersionById(
  scenarioVersionId: string,
): PublishedScenarioVersion | undefined {
  return seedContentCatalog.scenarioVersions.find(
    (scenarioVersion) => scenarioVersion.id === scenarioVersionId,
  );
}

export function getDefaultSeedContentFlow(): SeedContentFlow {
  const contentFlow = findSeedContentFlowByScenarioVersionId({
    lifeSituationId: defaultLifeSituationId,
    scenarioVersionId: defaultScenarioVersionId,
  });

  if (!contentFlow) {
    throw new Error("VS-01 seed content is incomplete.");
  }

  return contentFlow;
}

export function findSeedContentFlowByScenarioVersionId({
  lifeSituationId,
  scenarioVersionId,
}: {
  lifeSituationId: string;
  scenarioVersionId: string;
}): SeedContentFlow | undefined {
  const scenarioVersion = findSeedScenarioVersionById(scenarioVersionId);
  const scenario = scenarioVersion
    ? findSeedScenarioById(scenarioVersion.scenarioId)
    : undefined;
  const lifeSituation = findSeedLifeSituationById(lifeSituationId);

  if (!lifeSituation || !scenario || !scenarioVersion) {
    return undefined;
  }

  if (!lifeSituation.scenarioIds.includes(scenario.id)) {
    return undefined;
  }

  return { lifeSituation, scenario, scenarioVersion };
}
