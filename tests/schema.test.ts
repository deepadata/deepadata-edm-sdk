/**
 * Schema Validation Tests
 */
import { describe, it, expect } from "vitest";
import {
  EdmArtifactSchema,
  CoreSchema,
  ConstellationSchema,
  GravitySchema,
  ImpulseSchema,
  MilkyWaySchema,
} from "../src/schema/edm-schema.js";

describe("CoreSchema", () => {
  it("should accept valid core domain", () => {
    const valid = {
      anchor: "grandmother",
      spark: "old photograph",
      wound: "loss",
      fuel: "love",
      bridge: "remembering",
      echo: "her laugh",
      narrative: "The photograph brought back memories of summer days.",
    };
    expect(CoreSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept null values", () => {
    const valid = {
      anchor: null,
      spark: null,
      wound: null,
      fuel: null,
      bridge: null,
      echo: null,
      narrative: null,
    };
    expect(CoreSchema.safeParse(valid).success).toBe(true);
  });

  it("should reject invalid types", () => {
    const invalid = {
      anchor: 123, // should be string or null
      spark: "valid",
      wound: null,
      fuel: null,
      bridge: null,
      echo: null,
      narrative: null,
    };
    expect(CoreSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("ConstellationSchema", () => {
  it("should accept valid constellation with required fields", () => {
    const valid = {
      emotion_primary: "joy",
      emotion_subtone: ["bittersweet", "grateful"],
      higher_order_emotion: "awe",
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
      identity_thread: "I am who I am because of her.",
      expressed_insight: "Love transcends time.",
      transformational_pivot: false,
      somatic_signature: null,
    };
    expect(ConstellationSchema.safeParse(valid).success).toBe(true);
  });

  it("should enforce emotion_primary enum", () => {
    const invalid = {
      emotion_primary: "invalid_emotion",
      emotion_subtone: [],
      transformational_pivot: false,
    };
    expect(ConstellationSchema.safeParse(invalid).success).toBe(false);
  });

  it("should limit emotion_subtone to 4 items", () => {
    const tooMany = {
      emotion_primary: "joy",
      emotion_subtone: ["one", "two", "three", "four", "five"],
      transformational_pivot: false,
    };
    expect(ConstellationSchema.safeParse(tooMany).success).toBe(false);
  });

  it("should require transformational_pivot boolean", () => {
    const missing = {
      emotion_primary: "joy",
      emotion_subtone: [],
      // transformational_pivot missing
    };
    expect(ConstellationSchema.safeParse(missing).success).toBe(false);
  });
});

describe("GravitySchema", () => {
  it("should validate numeric ranges", () => {
    const valid = {
      emotional_weight: 0.75,
      emotional_density: "high",
      valence: "positive",
      viscosity: "enduring",
      gravity_type: "symbolic resonance",
      tether_type: "person",
      recall_triggers: ["smell of bread", "old songs"],
      retrieval_keys: ["grandmother", "kitchen", "warmth"],
      nearby_themes: ["family", "tradition"],
      legacy_embed: true,
      recurrence_pattern: "cyclical",
      strength_score: 0.85,
      temporal_decay: "slow",
      resilience_markers: ["acceptance", "continuity"],
      adaptation_trajectory: "integrative",
    };
    expect(GravitySchema.safeParse(valid).success).toBe(true);
  });

  it("should reject out-of-range scores", () => {
    const invalid = {
      emotional_weight: 1.5, // must be 0-1
      strength_score: 0.5,
      recall_triggers: [],
      retrieval_keys: [],
      nearby_themes: [],
      legacy_embed: false,
      resilience_markers: ["hope"],
    };
    expect(GravitySchema.safeParse(invalid).success).toBe(false);
  });

  it("should enforce resilience_markers limits", () => {
    const tooMany = {
      emotional_weight: 0.5,
      strength_score: 0.5,
      recall_triggers: [],
      retrieval_keys: [],
      nearby_themes: [],
      legacy_embed: false,
      resilience_markers: ["one", "two", "three", "four"], // max 3
    };
    expect(GravitySchema.safeParse(tooMany).success).toBe(false);
  });
});

describe("ImpulseSchema", () => {
  it("should accept valid impulse domain", () => {
    const valid = {
      primary_energy: "curiosity",
      drive_state: "explore",
      motivational_orientation: "meaning",
      temporal_focus: "past",
      directionality: "inward",
      social_visibility: "private",
      urgency: "calm",
      risk_posture: "cautious",
      agency_level: "medium",
      regulation_state: "regulated",
      attachment_style: "secure",
      coping_style: "reframe_meaning",
    };
    expect(ImpulseSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept all null values", () => {
    const allNull = {
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
    };
    expect(ImpulseSchema.safeParse(allNull).success).toBe(true);
  });
});

describe("MilkyWaySchema", () => {
  it("should require associated_people array", () => {
    const valid = {
      event_type: "family gathering",
      location_context: "grandmother's kitchen",
      associated_people: ["Sarah", "my father"],
      visibility_context: "family_only",
      tone_shift: "loss to gratitude",
    };
    expect(MilkyWaySchema.safeParse(valid).success).toBe(true);
  });

  it("should accept empty associated_people", () => {
    const valid = {
      event_type: null,
      location_context: null,
      associated_people: [],
      visibility_context: null,
      tone_shift: null,
    };
    expect(MilkyWaySchema.safeParse(valid).success).toBe(true);
  });
});

describe("EdmArtifactSchema", () => {
  it("should require all 10 domains", () => {
    const incomplete = {
      meta: {},
      core: {},
      // missing other domains
    };
    expect(EdmArtifactSchema.safeParse(incomplete).success).toBe(false);
  });
});
