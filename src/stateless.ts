/**
 * Stateless Mode for EDM v0.4.0
 * Creates privacy-preserving versions of artifacts for session use
 *
 * Stateless artifacts:
 * - Remove owner identification
 * - Null out sensitive contextual fields
 * - Preserve emotional structure for session continuity
 */
import type { EdmArtifact, MilkyWay, Gravity } from "./schema/types.js";

/**
 * Create a stateless version of an EDM artifact
 * Removes identifying information while preserving emotional structure
 */
export function createStatelessArtifact(artifact: EdmArtifact): EdmArtifact {
  return {
    ...artifact,
    meta: {
      ...artifact.meta,
      owner_user_id: null, // Required null in stateless mode
      parent_id: null, // Break threading chain
      tags: [], // Remove user-defined tags
    },
    milky_way: nullifyMilkyWay(artifact.milky_way),
    gravity: nullifyGravity(artifact.gravity),
    // Governance: strengthen privacy settings
    governance: {
      ...artifact.governance,
      exportability: "restricted",
    },
    // System: clear any waypoints
    system: {
      embeddings: [],
      indices: {
        waypoint_ids: [],
        sector_weights: artifact.system.indices.sector_weights,
      },
    },
  };
}

/**
 * Null out identifying fields in milky_way domain
 */
function nullifyMilkyWay(milkyWay: MilkyWay): MilkyWay {
  return {
    event_type: milkyWay.event_type, // Keep - categorical, not identifying
    location_context: null, // Null - could be identifying
    associated_people: [], // Clear - directly identifying
    visibility_context: milkyWay.visibility_context, // Keep - categorical
    tone_shift: milkyWay.tone_shift, // Keep - emotional, not identifying
  };
}

/**
 * Null out identifying fields in gravity domain
 */
function nullifyGravity(gravity: Gravity): Gravity {
  return {
    ...gravity,
    // Keep emotional structure
    emotional_weight: gravity.emotional_weight,
    emotional_density: gravity.emotional_density,
    valence: gravity.valence,
    viscosity: gravity.viscosity,
    gravity_type: gravity.gravity_type,
    tether_type: gravity.tether_type,
    legacy_embed: gravity.legacy_embed,
    recurrence_pattern: gravity.recurrence_pattern,
    strength_score: gravity.strength_score,
    temporal_decay: gravity.temporal_decay,
    resilience_markers: gravity.resilience_markers,
    adaptation_trajectory: gravity.adaptation_trajectory,
    // Null out potentially identifying retrieval fields
    recall_triggers: [], // Could contain identifying details
    retrieval_keys: [], // Could contain identifying details
    nearby_themes: gravity.nearby_themes, // Keep - abstract themes
  };
}

/**
 * Check if an artifact is in stateless mode
 */
export function isStateless(artifact: EdmArtifact): boolean {
  return (
    artifact.meta.owner_user_id === null &&
    artifact.milky_way.associated_people.length === 0 &&
    artifact.milky_way.location_context === null &&
    artifact.gravity.recall_triggers.length === 0 &&
    artifact.gravity.retrieval_keys.length === 0
  );
}

/**
 * Validate stateless compliance
 */
export interface StatelessValidation {
  compliant: boolean;
  violations: string[];
}

export function validateStateless(artifact: EdmArtifact): StatelessValidation {
  const violations: string[] = [];

  if (artifact.meta.owner_user_id !== null) {
    violations.push("meta.owner_user_id must be null in stateless mode");
  }

  if (artifact.milky_way.associated_people.length > 0) {
    violations.push("milky_way.associated_people must be empty in stateless mode");
  }

  if (artifact.milky_way.location_context !== null) {
    violations.push("milky_way.location_context must be null in stateless mode");
  }

  if (artifact.gravity.recall_triggers.length > 0) {
    violations.push("gravity.recall_triggers must be empty in stateless mode");
  }

  if (artifact.gravity.retrieval_keys.length > 0) {
    violations.push("gravity.retrieval_keys must be empty in stateless mode");
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}
