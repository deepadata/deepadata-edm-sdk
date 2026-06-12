/**
 * Executable conformance guarantee for the extraction-hardening release:
 *
 * (a) Artifacts emitted by extractFromContent / extractFromConversation
 *     contain NO experiential_stance key anywhere — stance is consumed by
 *     the attribution guard and recorded only in telemetry notes.
 * (b) Emitted artifacts validate unchanged against the published EDM
 *     v0.8.0 JSON schemas (fixtures vendored from the reference schema
 *     set, including the 2026-06-12 nullable-enum conformance fix).
 *
 * LLM calls are mocked; everything downstream of the model response is
 * the real production path (sanitizer -> zod -> stance guard -> assembly).
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

// ── Mock the Kimi extractor module (client + extraction call) ──────────
const mockExtraction = {
  extracted: {} as Record<string, unknown>,
  confidence: 0.8,
  model: "kimi-k2.5",
  profile: "extended" as const,
  notes: null as string | null,
};

vi.mock("../src/extractors/kimi-extractor.js", () => ({
  createKimiClient: vi.fn(() => ({})),
  getKimiModelId: vi.fn(() => "kimi-k2.5"),
  extractWithKimi: vi.fn(async () => ({
    ...mockExtraction,
    // deep-clone so the guard's mutations don't leak between tests
    extracted: JSON.parse(JSON.stringify(mockExtraction.extracted)),
  })),
}));

import { extractFromContent, extractFromConversation } from "../src/assembler.js";

// ── Published-schema validator (mirrors ddna-tools bundled validation) ─
const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "edm-v0.8.0");

function resolveRefs(schema: unknown): unknown {
  if (typeof schema !== "object" || schema === null) return schema;
  const obj = schema as Record<string, unknown>;
  if (typeof obj["$ref"] === "string") {
    const ref = obj["$ref"];
    const fragmentName = ref.includes("/fragments/")
      ? ref.split("/fragments/")[1]
      : ref.startsWith("fragments/")
        ? ref.slice("fragments/".length)
        : null;
    if (fragmentName) {
      const fragment = JSON.parse(readFileSync(join(FIXTURES, "fragments", fragmentName), "utf8"));
      return resolveRefs(fragment);
    }
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = Array.isArray(v) ? v.map(resolveRefs) : resolveRefs(v);
  }
  return out;
}

let validators: Record<string, ReturnType<Ajv["compile"]>>;

beforeAll(() => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  validators = {};
  for (const profile of ["essential", "extended", "full"] as const) {
    const raw = JSON.parse(readFileSync(join(FIXTURES, `edm.${profile}.schema.json`), "utf8"));
    validators[profile] = ajv.compile(resolveRefs(raw) as object);
  }
  expect(readdirSync(join(FIXTURES, "fragments")).length).toBeGreaterThan(0);
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

// ── Extraction payloads the mocked model "returns" ──────────────────────
const extendedExtraction = (stance: string | null) => ({
  core: {
    anchor: "a stranger's story",
    spark: "pasted test data",
    wound: "her mother's death",
    fuel: "curiosity",
    bridge: "rereading the thread",
    echo: "the closing line",
    narrative:
      "On a winter evening the subject pasted a long story into the chat. The room smelled of coffee. Years later the words still surface when the rain starts.",
  },
  constellation: {
    emotion_primary: "sadness",
    emotion_subtone: ["heavy", "tender"],
    higher_order_emotion: null,
    meta_emotional_state: null,
    interpersonal_affect: null,
    narrative_arc: "loss",
    relational_dynamics: "grief",
    temporal_context: null,
    memory_type: null,
    media_format: "text",
    narrative_archetype: null,
    symbolic_anchor: null,
    relational_perspective: "self",
    temporal_rhythm: null,
    identity_thread: "the caretaker of stories",
    expressed_insight: "grief travels",
    transformational_pivot: true,
    somatic_signature: "tight chest",
    arc_type: "grief",
  },
  milky_way: {
    event_type: "remembrance",
    location_context: null,
    associated_people: ["Tanqueray"],
    visibility_context: "private",
    tone_shift: null,
  },
  gravity: {
    emotional_weight: 0.9,
    valence: "negative",
    tether_type: "person",
    recurrence_pattern: null,
    strength_score: 0.8,
  },
  experiential_stance: stance,
});

const metadata = { consentBasis: "consent" as const, visibility: "private" as const, piiTier: "moderate" as const };

describe("artifact conformance (no stance leakage, v0.8.0 schema)", () => {
  it("extractFromContent emits no experiential_stance key anywhere and validates against the published extended schema", async () => {
    for (const stance of ["lived", "quoted_third_party", null]) {
      mockExtraction.extracted = extendedExtraction(stance);
      const artifact = await extractFromContent({
        content: { text: "USER: here is a story...", inputType: "conversation" },
        metadata,
        provider: "kimi",
        profile: "extended",
        verifyStance: false,
      });

      expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);

      const valid = validators["extended"]!(artifact);
      if (!valid) console.error(JSON.stringify(validators["extended"]!.errors, null, 2));
      expect(valid).toBe(true);
    }
  });

  it("the guard's demotions still produce schema-valid artifacts (explicit nulls accepted per whitepaper §5.2 No Omission)", async () => {
    mockExtraction.extracted = extendedExtraction("assistant_generated");
    const artifact = (await extractFromContent({
      content: { text: "USER: write me a funny anecdote", inputType: "conversation" },
      metadata,
      provider: "kimi",
      profile: "extended",
      verifyStance: false,
    })) as Record<string, Record<string, unknown>>;

    // demoted fields are explicit nulls, not omissions
    expect(artifact.core!.wound).toBeNull();
    expect(artifact.constellation!.identity_thread).toBeNull();
    expect(artifact.constellation!.transformational_pivot).toBe(false);
    expect(artifact.gravity!.emotional_weight).toBe(0.2);
    expect("wound" in artifact.core!).toBe(true);

    // stance is recorded in telemetry notes, nowhere else
    const notes = artifact.telemetry?.extraction_notes;
    expect(findKeyDeep(artifact, "experiential_stance")).toEqual([]);
    if (typeof notes === "string") {
      expect(notes).toContain("experiential_stance=assistant_generated");
    }

    const valid = validators["extended"]!(artifact);
    if (!valid) console.error(JSON.stringify(validators["extended"]!.errors, null, 2));
    expect(valid).toBe(true);
  });

  it("extractFromConversation chunks emit stance-free, schema-valid artifacts; profile invariants strip parent_id from extended", async () => {
    mockExtraction.extracted = extendedExtraction("witnessed");
    const messages = Array.from({ length: 12 }, (_, i) => ({
      role: i % 2 ? "assistant" : "user",
      text: `turn ${i} ` + "x".repeat(400),
    }));

    const results = await extractFromConversation({
      messages,
      chunking: { maxChars: 1500 },
      metadata,
      provider: "kimi",
      profile: "extended",
      verifyStance: false,
    });

    expect(results.length).toBeGreaterThan(1);
    for (const [i, r] of results.entries()) {
      expect(findKeyDeep(r.artifact, "experiential_stance")).toEqual([]);
      const valid = validators["extended"]!(r.artifact);
      if (!valid) console.error(JSON.stringify(validators["extended"]!.errors, null, 2));
      expect(valid).toBe(true);
      // meta.parent_id is a FULL-profile field: extended artifacts must
      // omit it (Profile Invariants: out-of-profile fields MUST be
      // omitted). Chunk linkage lives in the returned chunk metadata.
      const meta = r.artifact["meta"] as Record<string, unknown>;
      expect("parent_id" in meta).toBe(false);
      expect(r.chunk.index).toBe(i);
      expect(r.chunk.turnRange[1]).toBeGreaterThanOrEqual(r.chunk.turnRange[0]);
    }
    // full coverage: chunk turn ranges tile the conversation
    expect(results[0]!.chunk.turnRange[0]).toBe(0);
    expect(results[results.length - 1]!.chunk.turnRange[1]).toBe(messages.length - 1);
  });
});
