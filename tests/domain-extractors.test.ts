/**
 * Domain Extractors Tests
 */
import { describe, it, expect } from "vitest";
import {
  createMeta,
  createGovernance,
  createTelemetry,
  createSystem,
  createCrosswalks,
  detectSourceType,
} from "../src/extractors/domain-extractors.js";
import type { ExtractionMetadata, LlmExtractedFields } from "../src/schema/types.js";

describe("createMeta", () => {
  it("should create meta with required fields", () => {
    const metadata: ExtractionMetadata = {
      consentBasis: "consent",
    };
    const meta = createMeta(metadata, "text");

    expect(meta.version).toBe("0.4.0");
    expect(meta.consent_basis).toBe("consent");
    expect(meta.source_type).toBe("text");
    expect(meta.visibility).toBe("private");
    expect(meta.pii_tier).toBe("moderate");
    expect(meta.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("should use provided metadata values", () => {
    const metadata: ExtractionMetadata = {
      subjectId: "auraid-123",
      jurisdiction: "GDPR",
      consentBasis: "consent",
      locale: "en-us",
      visibility: "shared",
      piiTier: "high",
      tags: ["important"],
    };
    const meta = createMeta(metadata, "mixed");

    expect(meta.owner_user_id).toBe("auraid-123");
    expect(meta.locale).toBe("en-us");
    expect(meta.visibility).toBe("shared");
    expect(meta.pii_tier).toBe("high");
    expect(meta.tags).toEqual(["important"]);
    expect(meta.source_type).toBe("mixed");
  });

  it("should generate valid created_at timestamp", () => {
    const metadata: ExtractionMetadata = { consentBasis: "consent" };
    const meta = createMeta(metadata, "text");

    expect(() => new Date(meta.created_at)).not.toThrow();
  });
});

describe("createGovernance", () => {
  it("should set GDPR subject rights", () => {
    const metadata: ExtractionMetadata = {
      jurisdiction: "GDPR",
      consentBasis: "consent",
    };
    const governance = createGovernance(metadata);

    expect(governance.jurisdiction).toBe("GDPR");
    expect(governance.subject_rights.portable).toBe(true);
    expect(governance.subject_rights.erasable).toBe(true);
    expect(governance.subject_rights.explainable).toBe(true);
  });

  it("should set CCPA subject rights", () => {
    const metadata: ExtractionMetadata = {
      jurisdiction: "CCPA",
      consentBasis: "consent",
    };
    const governance = createGovernance(metadata);

    expect(governance.subject_rights.portable).toBe(true);
    expect(governance.subject_rights.erasable).toBe(true);
    expect(governance.subject_rights.explainable).toBe(false);
  });

  it("should set policy_labels based on piiTier", () => {
    const highPii: ExtractionMetadata = {
      consentBasis: "consent",
      piiTier: "high",
    };
    expect(createGovernance(highPii).policy_labels).toContain("sensitive");

    const noPii: ExtractionMetadata = {
      consentBasis: "consent",
      piiTier: "none",
    };
    expect(createGovernance(noPii).policy_labels).toContain("none");
  });

  it("should default exportability to allowed", () => {
    const metadata: ExtractionMetadata = { consentBasis: "consent" };
    const governance = createGovernance(metadata);
    expect(governance.exportability).toBe("allowed");
  });
});

describe("createTelemetry", () => {
  it("should create telemetry with provided values", () => {
    const telemetry = createTelemetry(0.85, "claude-sonnet-4-20250514", "High quality extraction");

    expect(telemetry.entry_confidence).toBe(0.85);
    expect(telemetry.extraction_model).toBe("claude-sonnet-4-20250514");
    expect(telemetry.extraction_notes).toBe("High quality extraction");
    expect(telemetry.alignment_delta).toBeNull();
  });

  it("should accept null notes", () => {
    const telemetry = createTelemetry(0.5, "test-model", null);
    expect(telemetry.extraction_notes).toBeNull();
  });
});

describe("createSystem", () => {
  it("should create empty system structure", () => {
    const system = createSystem();

    expect(system.embeddings).toEqual([]);
    expect(system.indices.waypoint_ids).toEqual([]);
    expect(system.indices.sector_weights).toEqual({
      episodic: 0,
      semantic: 0,
      procedural: 0,
      emotional: 0,
      reflective: 0,
    });
  });
});

describe("createCrosswalks", () => {
  const createExtracted = (overrides: Partial<LlmExtractedFields["constellation"]> = {}): LlmExtractedFields => ({
    core: {
      anchor: null,
      spark: null,
      wound: null,
      fuel: null,
      bridge: null,
      echo: null,
      narrative: null,
    },
    constellation: {
      emotion_primary: null,
      emotion_subtone: [],
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
      ...overrides,
    },
    milky_way: {
      event_type: null,
      location_context: null,
      associated_people: [],
      visibility_context: null,
      tone_shift: null,
    },
    gravity: {
      emotional_weight: 0,
      emotional_density: null,
      valence: null,
      viscosity: null,
      gravity_type: null,
      tether_type: null,
      recall_triggers: [],
      retrieval_keys: [],
      nearby_themes: [],
      legacy_embed: false,
      recurrence_pattern: null,
      strength_score: 0,
      temporal_decay: null,
      resilience_markers: [],
      adaptation_trajectory: null,
    },
    impulse: {
      primary_energy: null,
      drive_state: null,
      motivational_orientation: null,
      temporal_focus: null,
      directionality: null,
      social_visibility: null,
      urgency: null,
      risk_posture: null,
      agency_level: null,
      regulation_state: null,
      attachment_style: null,
      coping_style: null,
    },
  });

  it("should map joy to Plutchik joy", () => {
    const extracted = createExtracted({ emotion_primary: "joy" });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.plutchik_primary).toBe("joy");
  });

  it("should map wonder to Plutchik surprise", () => {
    const extracted = createExtracted({ emotion_primary: "wonder" });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.plutchik_primary).toBe("surprise");
  });

  it("should map peace to Plutchik trust", () => {
    const extracted = createExtracted({ emotion_primary: "peace" });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.plutchik_primary).toBe("trust");
  });

  it("should map legacy_artifact to HMD autobiographical", () => {
    const extracted = createExtracted({ memory_type: "legacy_artifact" });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.HMD_v2_memory_type).toBe("autobiographical");
  });

  it("should map milestone to HMD flashbulb", () => {
    const extracted = createExtracted({ memory_type: "milestone" });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.HMD_v2_memory_type).toBe("flashbulb");
  });

  it("should return null for unmapped emotions", () => {
    const extracted = createExtracted({ emotion_primary: null });
    const crosswalks = createCrosswalks(extracted);
    expect(crosswalks.plutchik_primary).toBeNull();
  });
});

describe("detectSourceType", () => {
  it("should return text for text-only", () => {
    expect(detectSourceType(true, false)).toBe("text");
  });

  it("should return image for image-only", () => {
    expect(detectSourceType(false, true)).toBe("image");
  });

  it("should return mixed for both", () => {
    expect(detectSourceType(true, true)).toBe("mixed");
  });

  it("should return text for neither", () => {
    expect(detectSourceType(false, false)).toBe("text");
  });
});
