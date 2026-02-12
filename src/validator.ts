/**
 * EDM Artifact Validator
 * Schema validation with detailed error reporting
 */
import { ZodError } from "zod";
import { EdmArtifactSchema } from "./schema/edm-schema.js";
import type { EdmArtifact, ValidationResult, ValidationError } from "./schema/types.js";

/**
 * Validate an EDM artifact against the v0.5.0 schema
 */
export function validateEDM(artifact: unknown): ValidationResult {
  const result = EdmArtifactSchema.safeParse(artifact);

  if (result.success) {
    return {
      valid: true,
      errors: [],
    };
  }

  return {
    valid: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Validate and return typed artifact or throw
 */
export function validateEDMStrict(artifact: unknown): EdmArtifact {
  return EdmArtifactSchema.parse(artifact);
}

/**
 * Format Zod errors into ValidationError array
 */
function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Validate specific domain
 */
export type DomainName =
  | "meta"
  | "core"
  | "constellation"
  | "milky_way"
  | "gravity"
  | "impulse"
  | "governance"
  | "telemetry"
  | "system"
  | "crosswalks";

import {
  MetaSchema,
  CoreSchema,
  ConstellationSchema,
  MilkyWaySchema,
  GravitySchema,
  ImpulseSchema,
  GovernanceSchema,
  TelemetrySchema,
  SystemSchema,
  CrosswalksSchema,
} from "./schema/edm-schema.js";

const domainSchemas = {
  meta: MetaSchema,
  core: CoreSchema,
  constellation: ConstellationSchema,
  milky_way: MilkyWaySchema,
  gravity: GravitySchema,
  impulse: ImpulseSchema,
  governance: GovernanceSchema,
  telemetry: TelemetrySchema,
  system: SystemSchema,
  crosswalks: CrosswalksSchema,
} as const;

export function validateDomain(domain: DomainName, data: unknown): ValidationResult {
  const schema = domainSchemas[domain];
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      valid: true,
      errors: [],
    };
  }

  return {
    valid: false,
    errors: formatZodErrors(result.error).map((err) => ({
      ...err,
      path: `${domain}.${err.path}`,
    })),
  };
}

/**
 * Validate artifact completeness (non-null required fields)
 */
export interface CompletenessResult {
  complete: boolean;
  missingFields: string[];
  populationRate: number;
}

export function validateCompleteness(artifact: EdmArtifact): CompletenessResult {
  const missingFields: string[] = [];
  let totalFields = 0;
  let populatedFields = 0;

  // Check required fields across domains
  const requiredPaths = [
    "meta.version",
    "meta.created_at",
    "meta.visibility",
    "meta.pii_tier",
    "meta.source_type",
    "meta.consent_basis",
    "constellation.emotion_subtone",
    "constellation.transformational_pivot",
    "milky_way.associated_people",
    "gravity.emotional_weight",
    "gravity.recall_triggers",
    "gravity.retrieval_keys",
    "gravity.nearby_themes",
    "gravity.legacy_embed",
    "gravity.strength_score",
    "gravity.resilience_markers",
    "governance.subject_rights",
    "governance.exportability",
    "governance.policy_labels",
    "governance.masking_rules",
    "telemetry.entry_confidence",
    "system.embeddings",
    "system.indices",
  ];

  for (const path of requiredPaths) {
    totalFields++;
    const value = getNestedValue(artifact, path);
    if (value === null || value === undefined) {
      missingFields.push(path);
    } else {
      populatedFields++;
    }
  }

  // Also count optional field population
  const optionalPaths = [
    "core.anchor",
    "core.spark",
    "core.wound",
    "core.fuel",
    "core.bridge",
    "core.echo",
    "core.narrative",
    "constellation.emotion_primary",
    "constellation.narrative_arc",
    "constellation.relational_dynamics",
    "constellation.temporal_context",
    "constellation.memory_type",
    "constellation.narrative_archetype",
    "milky_way.event_type",
    "milky_way.location_context",
    "impulse.primary_energy",
    "impulse.drive_state",
    "impulse.motivational_orientation",
  ];

  for (const path of optionalPaths) {
    totalFields++;
    const value = getNestedValue(artifact, path);
    if (value !== null && value !== undefined && value !== "") {
      populatedFields++;
    }
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
    populationRate: Math.round((populatedFields / totalFields) * 100) / 100,
  };
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}
