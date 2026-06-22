export type PublicationState = "published";

export type RequirementKind = "document" | "data";

export type SourceType = "official" | "reference" | "external_verification";

export type ContentReference =
  | { type: "step"; id: string }
  | { type: "document_requirement"; id: string }
  | { type: "data_requirement"; id: string }
  | { type: "template_open_question"; id: string }
  | { type: "scenario_version"; id: string };

export interface LifeSituation {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly userPhrase: string;
  readonly supportBoundary: string;
  readonly scenarioIds: readonly string[];
}

export interface Scenario {
  readonly id: string;
  readonly title: string;
  readonly lifeSituationIds: readonly string[];
  readonly versionIds: readonly string[];
}

export interface ApplicabilityCondition {
  readonly id: string;
  readonly text: string;
}

export interface Warning {
  readonly id: string;
  readonly text: string;
}

export interface Restriction {
  readonly id: string;
  readonly text: string;
}

export interface Requirement {
  readonly id: string;
  readonly kind: RequirementKind;
  readonly title: string;
  readonly description: string;
  readonly usedInStepIds: readonly string[];
  readonly verificationNote?: string;
}

export interface Source {
  readonly id: string;
  readonly type: SourceType;
  readonly title: string;
  readonly url: string;
  readonly usage: string;
  readonly checkCurrentness: boolean;
}

export interface TemplateOpenQuestion {
  readonly id: string;
  readonly text: string;
  readonly relatedSourceIds?: readonly string[];
}

export interface Step {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly purpose: string;
  readonly userShouldUnderstand: string;
  readonly requirementIds: readonly string[];
  readonly sourceIds: readonly string[];
  readonly warningIds: readonly string[];
  readonly restrictionIds: readonly string[];
}

export interface PublishedScenarioVersion {
  readonly id: string;
  readonly scenarioId: string;
  readonly publicationState: PublicationState;
  readonly versionLabel: string;
  readonly title: string;
  readonly goal: string;
  readonly expectedOutcome: string;
  readonly nonGuarantees: readonly string[];
  readonly applicabilityConditions: readonly ApplicabilityCondition[];
  readonly warnings: readonly Warning[];
  readonly restrictions: readonly Restriction[];
  readonly steps: readonly Step[];
  readonly requirements: readonly Requirement[];
  readonly sources: readonly Source[];
  readonly templateOpenQuestions: readonly TemplateOpenQuestion[];
}

export interface SeedContentCatalog {
  readonly lifeSituations: readonly LifeSituation[];
  readonly scenarios: readonly Scenario[];
  readonly scenarioVersions: readonly PublishedScenarioVersion[];
}
