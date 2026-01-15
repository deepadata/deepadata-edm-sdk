/**
 * Validator Tests
 */
import { describe, it, expect } from "vitest";
import { validateEDM, validateDomain, validateCompleteness } from "../src/validator.js";
import { createEmptyArtifact } from "../src/assembler.js";

describe("validateEDM", () => {
  it("should validate a complete artifact", () => {
    const artifact = createEmptyArtifact();
    // Add required array fields
    artifact.gravity.resilience_markers = ["hope"];
    const result = validateEDM(artifact);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should reject invalid artifact", () => {
    const invalid = { not: "valid" };
    const result = validateEDM(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should provide detailed error paths", () => {
    const invalid = {
      meta: {
        version: "invalid", // Should match pattern
      },
    };
    const result = validateEDM(invalid);
    expect(result.valid).toBe(false);
    // Should have errors about missing required fields and invalid version
    expect(result.errors.some((e) => e.path.includes("version") || e.path === "")).toBe(true);
  });
});

describe("validateDomain", () => {
  it("should validate core domain", () => {
    const validCore = {
      anchor: "grandmother",
      spark: "photograph",
      wound: null,
      fuel: "love",
      bridge: null,
      echo: "her voice",
      narrative: "A simple memory of childhood days.",
    };
    const result = validateDomain("core", validCore);
    expect(result.valid).toBe(true);
  });

  it("should reject invalid core domain", () => {
    const invalidCore = {
      anchor: 123, // Should be string or null
    };
    const result = validateDomain("core", invalidCore);
    expect(result.valid).toBe(false);
  });

  it("should validate constellation domain", () => {
    const validConstellation = {
      emotion_primary: "joy",
      emotion_subtone: ["grateful"],
      higher_order_emotion: null,
      meta_emotional_state: null,
      interpersonal_affect: null,
      narrative_arc: null,
      relational_dynamics: null,
      temporal_context: null,
      memory_type: null,
      media_format: null,
      narrative_archetype: null,
      symbolic_anchor: null,
      relational_perspective: null,
      temporal_rhythm: null,
      identity_thread: null,
      expressed_insight: null,
      transformational_pivot: false,
      somatic_signature: null,
    };
    const result = validateDomain("constellation", validConstellation);
    expect(result.valid).toBe(true);
  });

  it("should validate gravity domain", () => {
    const validGravity = {
      emotional_weight: 0.7,
      emotional_density: "high",
      valence: "positive",
      viscosity: null,
      gravity_type: null,
      tether_type: null,
      recall_triggers: ["music"],
      retrieval_keys: ["home"],
      nearby_themes: ["family"],
      legacy_embed: true,
      recurrence_pattern: null,
      strength_score: 0.8,
      temporal_decay: null,
      resilience_markers: ["hope"],
      adaptation_trajectory: null,
    };
    const result = validateDomain("gravity", validGravity);
    expect(result.valid).toBe(true);
  });

  it("should validate governance domain", () => {
    const validGovernance = {
      jurisdiction: "GDPR",
      retention_policy: {
        basis: "user_defined",
        ttl_days: 365,
        on_expiry: "soft_delete",
      },
      subject_rights: {
        portable: true,
        erasable: true,
        explainable: true,
      },
      exportability: "allowed",
      k_anonymity: {
        k: 5,
        groups: ["region"],
      },
      policy_labels: ["sensitive"],
      masking_rules: [],
    };
    const result = validateDomain("governance", validGovernance);
    expect(result.valid).toBe(true);
  });
});

describe("validateCompleteness", () => {
  it("should report missing required fields", () => {
    const artifact = createEmptyArtifact();
    // Remove a required value
    artifact.meta.version = undefined as unknown as string;
    const result = validateCompleteness(artifact);
    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain("meta.version");
  });

  it("should calculate population rate", () => {
    const artifact = createEmptyArtifact();
    artifact.gravity.resilience_markers = ["hope"];
    artifact.core.anchor = "test";
    artifact.core.spark = "trigger";
    artifact.constellation.emotion_primary = "joy";

    const result = validateCompleteness(artifact);
    expect(result.populationRate).toBeGreaterThan(0);
    expect(result.populationRate).toBeLessThanOrEqual(1);
  });

  it("should handle complete artifact", () => {
    const artifact = createEmptyArtifact();
    artifact.gravity.resilience_markers = ["hope"];

    const result = validateCompleteness(artifact);
    // May still have missing optional fields, but required should be present
    expect(typeof result.populationRate).toBe("number");
  });
});
