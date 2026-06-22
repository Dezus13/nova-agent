import type {
  LifeSituation,
  PublishedScenarioVersion,
  Scenario,
  SeedContentCatalog,
} from "../domain/content";
import { registrationResidenceAustriaSeed } from "./seed";

const seedContentCatalog = registrationResidenceAustriaSeed;

export function getSeedContentCatalog(): SeedContentCatalog {
  return seedContentCatalog;
}

export function listSeedLifeSituations(): readonly LifeSituation[] {
  return seedContentCatalog.lifeSituations;
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
