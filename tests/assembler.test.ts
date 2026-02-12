/**
 * Assembler Tests
 */
import { describe, it, expect } from "vitest";
import { createEmptyArtifact, assembleArtifact } from "../src/assembler.js";
import { validateEDM } from "../src/validator.js";
import type { LlmExtractedFields } from "../src/schema/types.js";

describe("createEmptyArtifact", () => {
  it("should create a valid artifact structure", () => {
    const artifact = createEmptyArtifact();

    // Should have all 10 domains
    expect(artifact).toHaveProperty("meta");
    expect(artifact).toHaveProperty("core");
    expect(artifact).toHaveProperty("constellation");
    expect(artifact).toHaveProperty("milky_way");
    expect(artifact).toHaveProperty("gravity");
    expect(artifact).toHaveProperty("impulse");
    expect(artifact).toHaveProperty("governance");
    expect(artifact).toHaveProperty("telemetry");
    expect(artifact).toHaveProperty("system");
    expect(artifact).toHaveProperty("crosswalks");
  });

  it("should set version to 0.5.0", () => {
    const artifact = createEmptyArtifact();
    expect(artifact.meta.version).toBe("0.5.0");
  });

  it("should have valid created_at timestamp", () => {
    const artifact = createEmptyArtifact();
    expect(() => new Date(artifact.meta.created_at)).not.toThrow();
  });

  it("should initialize arrays empty", () => {
    const artifact = createEmptyArtifact();

    expect(artifact.constellation.emotion_subtone).toEqual([]);
    expect(artifact.milky_way.associated_people).toEqual([]);
    expect(artifact.gravity.recall_triggers).toEqual([]);
    expect(artifact.gravity.retrieval_keys).toEqual([]);
    expect(artifact.gravity.nearby_themes).toEqual([]);
    expect(artifact.system.embeddings).toEqual([]);
  });

  it("should set booleans to false", () => {
    const artifact = createEmptyArtifact();

    expect(artifact.constellation.transformational_pivot).toBe(false);
    expect(artifact.gravity.legacy_embed).toBe(false);
  });

  it("should set scores to 0", () => {
    const artifact = createEmptyArtifact();

    expect(artifact.gravity.emotional_weight).toBe(0);
    expect(artifact.gravity.strength_score).toBe(0);
    expect(artifact.telemetry.entry_confidence).toBe(0);
  });
});

describe("assembleArtifact", () => {
  const createMockExtracted = (): LlmExtractedFields => ({
    core: {
      anchor: "grandmother",
      spark: "old photograph",
      wound: "loss",
      fuel: "love",
      bridge: "remembering",
      echo: "her laugh",
      narrative: "Looking at the photograph brought back memories of summer afternoons.",
    },
    constellation: {
      emotion_primary: "joy",
      emotion_subtone: ["bittersweet", "grateful"],
      higher_order_emotion: "nostalgia",
      meta_emotional_state: "acceptance",
      interpersonal_affect: "warmth",
      narrative_arc: "connection",
      relational_dynamics: "parent_child",
      temporal_context: "childhood",
      memory_type: "legacy_artifact",
      media_format: "photo",
      narrative_archetype: "caregiver",
      symbolic_anchor: "rocking chair",
      relational_perspective: "family",
      temporal_rhythm: "recurring",
      identity_thread: "I carry her wisdom with me.",
      expressed_insight: "Love endures beyond physical presence.",
      transformational_pivot: false,
      somatic_signature: "warmth in chest",
    },
    milky_way: {
      event_type: "family gathering",
      location_context: "grandmother's kitchen",
      associated_people: ["grandmother", "mother"],
      visibility_context: "family_only",
      tone_shift: "loss to gratitude",
    },
    gravity: {
      emotional_weight: 0.85,
      emotional_density: "high",
      valence: "positive",
      viscosity: "enduring",
      gravity_type: "symbolic resonance",
      tether_type: "person",
      recall_triggers: ["smell of bread", "old songs"],
      retrieval_keys: ["grandmother", "kitchen", "warmth"],
      nearby_themes: ["family", "tradition", "legacy"],
      legacy_embed: true,
      recurrence_pattern: "cyclical",
      strength_score: 0.9,
      temporal_decay: "slow",
      resilience_markers: ["acceptance", "continuity"],
      adaptation_trajectory: "integrative",
    },
    impulse: {
      primary_energy: "compassion",
      drive_state: "approach",
      motivational_orientation: "belonging",
      temporal_focus: "past",
      directionality: "inward",
      social_visibility: "relational",
      urgency: "calm",
      risk_posture: "balanced",
      agency_level: "medium",
      regulation_state: "regulated",
      attachment_style: "secure",
      coping_style: "reframe_meaning",
    },
  });

  it("should assemble complete artifact", () => {
    const extracted = createMockExtracted();
    const metadata = {
      subjectId: "user-123",
      jurisdiction: "GDPR" as const,
      consentBasis: "consent" as const,
    };
    const context = {
      confidence: 0.85,
      model: "claude-sonnet-4-20250514",
      notes: null,
      hasText: true,
      hasImage: true,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    // Check LLM-extracted fields are preserved
    expect(artifact.core.anchor).toBe("grandmother");
    expect(artifact.constellation.emotion_primary).toBe("joy");
    expect(artifact.milky_way.associated_people).toEqual(["grandmother", "mother"]);
    expect(artifact.gravity.emotional_weight).toBe(0.85);
    expect(artifact.impulse.primary_energy).toBe("compassion");
  });

  it("should populate meta from metadata", () => {
    const extracted = createMockExtracted();
    const metadata = {
      subjectId: "user-123",
      jurisdiction: "GDPR" as const,
      consentBasis: "consent" as const,
      locale: "en-us",
    };
    const context = {
      confidence: 0.85,
      model: "claude-sonnet-4-20250514",
      notes: null,
      hasText: true,
      hasImage: false,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    expect(artifact.meta.owner_user_id).toBe("user-123");
    expect(artifact.meta.locale).toBe("en-us");
    expect(artifact.meta.source_type).toBe("text");
  });

  it("should populate governance from metadata", () => {
    const extracted = createMockExtracted();
    const metadata = {
      jurisdiction: "GDPR" as const,
      consentBasis: "consent" as const,
    };
    const context = {
      confidence: 0.85,
      model: "test",
      notes: null,
      hasText: true,
      hasImage: false,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    expect(artifact.governance.jurisdiction).toBe("GDPR");
    expect(artifact.governance.subject_rights.portable).toBe(true);
    expect(artifact.governance.subject_rights.explainable).toBe(true);
  });

  it("should populate telemetry from context", () => {
    const extracted = createMockExtracted();
    const metadata = { consentBasis: "consent" as const };
    const context = {
      confidence: 0.92,
      model: "claude-sonnet-4-20250514",
      notes: "High quality input",
      hasText: true,
      hasImage: false,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    expect(artifact.telemetry.entry_confidence).toBe(0.92);
    expect(artifact.telemetry.extraction_model).toBe("claude-sonnet-4-20250514");
    expect(artifact.telemetry.extraction_notes).toBe("High quality input");
  });

  it("should create crosswalks from extracted data", () => {
    const extracted = createMockExtracted();
    const metadata = { consentBasis: "consent" as const };
    const context = {
      confidence: 0.85,
      model: "test",
      notes: null,
      hasText: true,
      hasImage: false,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    expect(artifact.crosswalks.plutchik_primary).toBe("joy");
    expect(artifact.crosswalks.HMD_v2_memory_type).toBe("autobiographical");
  });

  it("should detect mixed source type", () => {
    const extracted = createMockExtracted();
    const metadata = { consentBasis: "consent" as const };
    const context = {
      confidence: 0.85,
      model: "test",
      notes: null,
      hasText: true,
      hasImage: true,
    };

    const artifact = assembleArtifact(extracted, metadata, context);

    expect(artifact.meta.source_type).toBe("mixed");
  });

  it("should produce schema-valid artifact", () => {
    const extracted = createMockExtracted();
    const metadata = { consentBasis: "consent" as const };
    const context = {
      confidence: 0.85,
      model: "test",
      notes: null,
      hasText: true,
      hasImage: false,
    };

    const artifact = assembleArtifact(extracted, metadata, context);
    const validation = validateEDM(artifact);

    expect(validation.valid).toBe(true);
  });
});
