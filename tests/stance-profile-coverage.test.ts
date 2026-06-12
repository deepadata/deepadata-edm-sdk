/**
 * Per-profile coverage of the attribution guard:
 * - the stance key is extracted and CONSUMED in every profile
 *   (essential, extended, full, partner routed through its base)
 * - applyStanceGuard degrades gracefully when cleared-fields don't exist
 *   in the profile (essential has no gravity, no impulse, 3-field
 *   constellation)
 * - verifyStance:"auto" on gravity-less profiles (essential) fires ONLY
 *   when extraction returned experiential_stance === null — NOT on
 *   lived/witnessed claims (essential is the coherence tier for transient,
 *   typically-unsealed artifacts; the deterministic guard covers
 *   non-subject stances; always-on verification doubles cost in the
 *   partner hot path). Gravity-bearing profiles keep the weight>=0.6 gate.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const mockExtraction = {
  extracted: {} as Record<string, unknown>,
  confidence: 0.8,
  model: "kimi-k2.5",
  profile: "extended" as string,
  notes: null as string | null,
};

vi.mock("../src/extractors/kimi-extractor.js", () => ({
  createKimiClient: vi.fn(() => ({})),
  getKimiModelId: vi.fn(() => "kimi-k2.5"),
  extractWithKimi: vi.fn(async () => ({
    ...mockExtraction,
    extracted: JSON.parse(JSON.stringify(mockExtraction.extracted)),
  })),
}));

// Spy on the classifier so auto-trigger behaviour is observable without a network call
const { classifySpy } = vi.hoisted(() => ({
  classifySpy: vi.fn(async () => "assistant_generated" as const),
}));
vi.mock("../src/extractors/stance-guard.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/extractors/stance-guard.js")>();
  return { ...actual, classifyStanceOpenAI: classifySpy };
});

import { extractFromContent } from "../src/assembler.js";
import { applyStanceGuard } from "../src/extractors/stance-guard.js";

// ── Published v0.8.0 schema validators (same fixtures as conformance test) ─
const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "edm-v0.8.0");

function resolveRefs(schema: unknown): unknown {
  if (typeof schema !== "object" || schema === null) return schema;
  const obj = schema as Record<string, unknown>;
  if (typeof obj["$ref"] === "string") {
    const ref = obj["$ref"];
    const name = ref.includes("/fragments/") ? ref.split("/fragments/")[1] : ref.startsWith("fragments/") ? ref.slice(10) : null;
    if (name) return resolveRefs(JSON.parse(readFileSync(join(FIXTURES, "fragments", name), "utf8")));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = Array.isArray(v) ? v.map(resolveRefs) : resolveRefs(v);
  return out;
}

let validators: Record<string, ReturnType<Ajv["compile"]>>;
beforeAll(() => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  validators = {};
  for (const p of ["essential", "extended", "full"] as const) {
    validators[p] = ajv.compile(resolveRefs(JSON.parse(readFileSync(join(FIXTURES, `edm.${p}.schema.json`), "utf8"))) as object);
  }
});

beforeEach(() => {
  classifySpy.mockClear();
});

function findKeyDeep(obj: unknown, key: string, path = "$"): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  const hits: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === key) hits.push(`${path}.${k}`);
    hits.push(...findKeyDeep(v, key, `${path}.${k}`));
  }
  return hits;
}

// ── Profile-shaped extraction payloads ──────────────────────────────────
const essentialExtraction = (stance: string | null) => ({
  core: { anchor: "a pasted story", spark: "a request", wound: "her loss", fuel: null, bridge: null, echo: "the last line" },
  constellation: { emotion_primary: "sadness", emotion_subtone: ["heavy"], narrative_arc: "loss" },
  experiential_stance: stance,
});

const extendedExtraction = (stance: string | null) => ({
  ...JSON.parse(JSON.stringify(essentialExtraction(stance))),
  core: {
    anchor: "a pasted story", spark: "a request", wound: "her loss", fuel: null, bridge: null, echo: "the last line",
    narrative: "On a winter evening the subject pasted a story. The smell of coffee hung in the air. Years later it still echoes.",
  },
  constellation: {
    emotion_primary: "sadness", emotion_subtone: ["heavy"], higher_order_emotion: null, meta_emotional_state: null,
    interpersonal_affect: null, narrative_arc: "loss", relational_dynamics: "grief", temporal_context: null,
    memory_type: null, media_format: "text", narrative_archetype: null, symbolic_anchor: null,
    relational_perspective: "self", temporal_rhythm: null, identity_thread: "the storyteller",
    expressed_insight: "grief travels", transformational_pivot: true, somatic_signature: "tight chest", arc_type: "grief",
  },
  milky_way: { event_type: null, location_context: null, associated_people: [], visibility_context: "private", tone_shift: null },
  gravity: { emotional_weight: 0.9, valence: "negative", tether_type: "person", recurrence_pattern: null, strength_score: 0.8 },
});

const fullExtraction = (stance: string | null) => ({
  ...JSON.parse(JSON.stringify(extendedExtraction(stance))),
  gravity: {
    emotional_weight: 0.9, emotional_density: "high", valence: "negative", viscosity: "enduring", gravity_type: null,
    tether_type: "person", recall_triggers: ["rain"], retrieval_keys: ["story"], nearby_themes: [],
    recurrence_pattern: null, strength_score: 0.8, temporal_decay: "slow", resilience_markers: null, adaptation_trajectory: null,
  },
  impulse: {
    primary_energy: "compassion", drive_state: "process", motivational_orientation: "meaning", temporal_focus: "past",
    directionality: "inward", social_visibility: "private", urgency: "calm", risk_posture: null,
    agency_level: "medium", regulation_state: "regulated", attachment_style: null, coping_style: "process",
  },
});

const metadata = { consentBasis: "consent" as const, visibility: "private" as const, piiTier: "moderate" as const };

async function run(profile: string, extracted: Record<string, unknown>, opts: Record<string, unknown> = {}) {
  mockExtraction.extracted = extracted;
  mockExtraction.profile = profile;
  return (await extractFromContent({
    content: { text: "USER: here is a story...", inputType: "conversation" },
    metadata,
    provider: "kimi",
    profile: profile as never,
    verifyStance: false,
    ...opts,
  })) as Record<string, Record<string, unknown>>;
}

describe("attribution guard per profile", () => {
  it("essential: stance consumed, wound cleared, no gravity/impulse to demote — graceful", async () => {
    const artifact = await run("essential", essentialExtraction("quoted_third_party"));
    expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);
    expect(artifact.core!.wound).toBeNull();
    expect("gravity" in artifact).toBe(false);
    expect("impulse" in artifact).toBe(false);
    const valid = validators["essential"]!(artifact);
    if (!valid) console.error(JSON.stringify(validators["essential"]!.errors, null, 2));
    expect(valid).toBe(true);
  });

  it("extended: stance consumed, constellation + gravity demoted", async () => {
    const artifact = await run("extended", extendedExtraction("assistant_generated"));
    expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);
    expect(artifact.core!.wound).toBeNull();
    expect(artifact.constellation!.identity_thread).toBeNull();
    expect(artifact.constellation!.transformational_pivot).toBe(false);
    expect(artifact.gravity!.emotional_weight).toBe(0.2);
    const valid = validators["extended"]!(artifact);
    if (!valid) console.error(JSON.stringify(validators["extended"]!.errors, null, 2));
    expect(valid).toBe(true);
  });

  it("full: stance consumed, impulse domain cleared as well", async () => {
    const artifact = await run("full", fullExtraction("hypothetical"));
    expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);
    expect(artifact.core!.wound).toBeNull();
    expect(artifact.gravity!.emotional_weight).toBe(0.2);
    for (const v of Object.values(artifact.impulse!)) expect(v).toBeNull();
    const valid = validators["full"]!(artifact);
    if (!valid) console.error(JSON.stringify(validators["full"]!.errors, null, 2));
    expect(valid).toBe(true);
  });

  it("partner profile inherits the guard via base-profile routing", async () => {
    const artifact = await run("partner:com.deepadata.wiki.v1", extendedExtraction("assistant_generated"));
    expect((artifact.meta as Record<string, unknown>).profile).toBe("partner:com.deepadata.wiki.v1");
    expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);
    expect(artifact.core!.wound).toBeNull();
    expect(artifact.constellation!.identity_thread).toBeNull();
    expect(artifact.gravity!.emotional_weight).toBe(0.2);
    // partner meta.profile is not in the published-schema enum, so schema
    // validation is intentionally out of scope here (ADR-0017 territory)
  });

  it("lived stance leaves every profile untouched", async () => {
    for (const [profile, extraction] of [
      ["essential", essentialExtraction("lived")],
      ["extended", extendedExtraction("lived")],
      ["full", fullExtraction("lived")],
    ] as const) {
      const artifact = await run(profile, extraction as Record<string, unknown>);
      expect(artifact.core!.wound).toBe("her loss");
      if (artifact.gravity) expect(artifact.gravity.emotional_weight).toBe(0.9);
    }
  });
});

describe("verifyStance auto trigger", () => {
  it("essential (gravity-less): fires ONLY on null stance, applies the classifier override", async () => {
    const artifact = await run("essential", essentialExtraction(null), { verifyStance: "auto" });
    expect(classifySpy).toHaveBeenCalledTimes(1);
    // classifier said assistant_generated -> more conservative -> guard fires
    expect(artifact.core!.wound).toBeNull();
  });

  it("essential (gravity-less): does NOT fire on lived or witnessed claims", async () => {
    for (const stance of ["lived", "witnessed"] as const) {
      const artifact = await run("essential", essentialExtraction(stance), { verifyStance: "auto" });
      expect(classifySpy).not.toHaveBeenCalled();
      // lived/witnessed are subject stances — guard leaves wound intact
      expect(artifact.core!.wound).toBe("her loss");
    }
  });

  it("essential: verifyStance:true still verifies unconditionally, overriding the narrowed auto gate", async () => {
    await run("essential", essentialExtraction("lived"), { verifyStance: true });
    expect(classifySpy).toHaveBeenCalledTimes(1);
  });

  it("does not fire on memory (non-conversation) input even with null stance", async () => {
    mockExtraction.extracted = essentialExtraction(null);
    mockExtraction.profile = "essential";
    await extractFromContent({
      content: { text: "a first-person memory" },
      metadata,
      provider: "kimi",
      profile: "essential",
      verifyStance: "auto",
    });
    expect(classifySpy).not.toHaveBeenCalled();
  });

  it("does not fire on low-weight extended extractions, fires on high-weight", async () => {
    const low = extendedExtraction("lived");
    (low.gravity as Record<string, unknown>).emotional_weight = 0.3;
    await run("extended", low, { verifyStance: "auto" });
    expect(classifySpy).not.toHaveBeenCalled();

    await run("extended", extendedExtraction("lived"), { verifyStance: "auto" });
    expect(classifySpy).toHaveBeenCalledTimes(1);
  });
});

describe("applyStanceGuard graceful degradation (direct)", () => {
  it("handles payloads missing entire domains without throwing", () => {
    const bare: Record<string, unknown> = { core: { anchor: "x" } };
    expect(applyStanceGuard(bare, "quoted_third_party")).toEqual([]);
    const coreOnly: Record<string, unknown> = { core: { wound: "y" } };
    expect(applyStanceGuard(coreOnly, "assistant_generated")).toEqual(["core.wound"]);
  });
});
