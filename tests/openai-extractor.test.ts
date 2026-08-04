/**
 * OpenAI extractor API-surface tests
 *
 * gpt-5.x-class models reject max_tokens with a hard 400 and accept only
 * max_completion_tokens (and only the default temperature). The extractor
 * must pick the right parameter per model class so gpt-5.4-mini works
 * through the SDK path.
 */
import { describe, it, expect } from "vitest";
import type OpenAI from "openai";
import { extractWithOpenAI } from "../src/extractors/openai-extractor.js";
import {
  usesMaxCompletionTokens,
  DEFAULT_MAX_TOKENS,
  THINKING_MODEL_MAX_TOKENS,
} from "../src/model-config.js";

/** A full-profile extraction payload that passes LlmExtractedFieldsSchema */
const fullExtraction = {
  core: {
    anchor: "dad's toolbox",
    spark: "finding the cassette",
    wound: null,
    fuel: "curiosity",
    bridge: "replaying old tape",
    echo: "smell of oil",
    narrative:
      "On a summer afternoon the subject opened the toolbox again. The hinges creaked the way they always had. Years later that sound still brings the workshop back.",
  },
  constellation: {
    emotion_primary: "tenderness",
    emotion_subtone: ["warm", "bittersweet"],
    higher_order_emotion: null,
    meta_emotional_state: null,
    interpersonal_affect: null,
    narrative_arc: "reflection",
    relational_dynamics: "parent_child",
    temporal_context: "childhood",
    memory_type: "legacy_artifact",
    media_format: "text",
    narrative_archetype: null,
    symbolic_anchor: "toolbox",
    relational_perspective: "family",
    temporal_rhythm: null,
    identity_thread: null,
    expressed_insight: null,
    transformational_pivot: false,
    somatic_signature: null,
    arc_type: "bond",
  },
  milky_way: {
    event_type: null,
    location_context: "workshop",
    associated_people: ["Dad"],
    visibility_context: "private",
    tone_shift: null,
  },
  gravity: {
    emotional_weight: 0.6,
    emotional_density: "medium",
    valence: "positive",
    viscosity: "medium",
    gravity_type: "symbolic resonance",
    tether_type: "object",
    recall_triggers: ["oil", "creak"],
    retrieval_keys: ["toolbox", "workshop"],
    nearby_themes: ["inheritance"],
    recurrence_pattern: "isolated",
    strength_score: 0.7,
    temporal_decay: "slow",
    resilience_markers: ["continuity"],
    adaptation_trajectory: "stable",
  },
  impulse: {
    primary_energy: "curiosity",
    drive_state: "explore",
    motivational_orientation: "meaning",
    temporal_focus: "past",
    directionality: "inward",
    social_visibility: "private",
    urgency: "calm",
    risk_posture: "balanced",
    agency_level: "medium",
    regulation_state: "regulated",
    attachment_style: null,
    coping_style: null,
  },
};

/** An essential-profile payload: core (6 fields, no narrative) + constellation (3) */
const essentialExtraction = {
  core: {
    anchor: "dad's toolbox",
    spark: "finding the cassette",
    wound: null,
    fuel: null,
    bridge: null,
    echo: "smell of oil",
  },
  constellation: {
    emotion_primary: "tenderness",
    emotion_subtone: ["warm"],
    narrative_arc: "reflection",
  },
  experiential_stance: "lived",
};

type CapturedParams = Record<string, unknown>;

function fakeClient(
  capture: { params?: CapturedParams },
  payload: unknown = fullExtraction
): OpenAI {
  return {
    chat: {
      completions: {
        create: async (params: CapturedParams) => {
          capture.params = params;
          return { choices: [{ message: { content: JSON.stringify(payload) } }] };
        },
      },
    },
  } as unknown as OpenAI;
}

const input = { text: "A memory about dad's toolbox." };

describe("usesMaxCompletionTokens", () => {
  it("classifies the reasoning-era API surface", () => {
    expect(usesMaxCompletionTokens("gpt-5.4-mini")).toBe(true);
    expect(usesMaxCompletionTokens("gpt-5")).toBe(true);
    expect(usesMaxCompletionTokens("o3-mini")).toBe(true);
    expect(usesMaxCompletionTokens("gpt-4o-mini")).toBe(false);
  });
});

describe("extractWithOpenAI parameter selection", () => {
  it("sends max_tokens + temperature for non-reasoning models", async () => {
    const capture: { params?: CapturedParams } = {};
    const result = await extractWithOpenAI(fakeClient(capture), input, "gpt-4o-mini");
    expect(capture.params!["max_tokens"]).toBe(DEFAULT_MAX_TOKENS);
    expect(capture.params!["temperature"]).toBe(0);
    expect(capture.params!["max_completion_tokens"]).toBeUndefined();
    expect(result.model).toBe("gpt-4o-mini");
  });

  it("sends max_completion_tokens and no temperature for gpt-5.x-class models", async () => {
    const capture: { params?: CapturedParams } = {};
    const result = await extractWithOpenAI(fakeClient(capture), input, "gpt-5.4-mini");
    // gpt-5.x is thinking-class: reasoning tokens count against the budget
    expect(capture.params!["max_completion_tokens"]).toBe(THINKING_MODEL_MAX_TOKENS);
    expect(capture.params!["max_tokens"]).toBeUndefined();
    expect(capture.params!["temperature"]).toBeUndefined();
    expect(result.model).toBe("gpt-5.4-mini");
  });

  it("validates light-profile output against the profile's own schema (0.8.14 fix)", async () => {
    // Before the fix this rejected essential output with "Required" errors
    // for full-schema fields the essential prompt never asks for.
    const capture: { params?: CapturedParams } = {};
    const result = await extractWithOpenAI(
      fakeClient(capture, essentialExtraction),
      input,
      "gpt-4o-mini",
      0,
      "essential"
    );
    expect(result.profile).toBe("essential");
    const core = (result.extracted as Record<string, Record<string, unknown>>)["core"];
    expect(core!["anchor"]).toBe("dad's toolbox");
  });

  it("honors an explicit per-request output budget on the reasoning surface", async () => {
    const capture: { params?: CapturedParams } = {};
    await extractWithOpenAI(fakeClient(capture), input, "gpt-5.4-mini", 0, "full", {
      maxTokens: 9000,
    });
    expect(capture.params!["max_completion_tokens"]).toBe(9000);
  });
});
