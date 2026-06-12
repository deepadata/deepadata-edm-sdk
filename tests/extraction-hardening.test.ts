/**
 * Tests for the 2026-06 extraction hardening:
 * - conversation framing + per_session chunking (replaces head+tail truncation)
 * - output sanitation (strict-enum coercion, array caps)
 * - experiential-stance attribution guard
 */
import { describe, it, expect } from "vitest";
import {
  chunkConversation,
  flattenConversation,
  frameTranscript,
  type ConversationMessage,
} from "../src/conversation.js";
import { sanitizeLlmOutput } from "../src/extractors/output-sanitizer.js";
import {
  applyStanceGuard,
  takeStance,
  resolveStance,
  isNonSubjectStance,
} from "../src/extractors/stance-guard.js";
import { defaultMaxTokens, DEFAULT_MAX_TOKENS, THINKING_MODEL_MAX_TOKENS } from "../src/extractors/llm-extractor.js";
import { LlmExtendedFieldsSchema } from "../src/schema/edm-schema.js";

const msg = (role: string, text: string): ConversationMessage => ({ role, text });

describe("conversation framing", () => {
  it("labels the user as USER and wraps in source-material framing", () => {
    const flat = flattenConversation([msg("user", "hello"), msg("assistant", "hi")]);
    expect(flat).toBe("USER: hello\n\nASSISTANT: hi");
    const framed = frameTranscript(flat);
    expect(framed).toContain("source material only");
    expect(framed).toContain("<transcript>");
    expect(framed).toContain("treating the USER as the subject");
  });
});

describe("chunkConversation (per_session)", () => {
  it("returns one chunk for a short conversation", () => {
    const chunks = chunkConversation([msg("user", "a"), msg("assistant", "b")]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.turnRange).toEqual([0, 1]);
  });

  it("covers every message exactly once with turn-aligned chunks", () => {
    const messages = Array.from({ length: 40 }, (_, i) => msg(i % 2 ? "assistant" : "user", "x".repeat(500)));
    const chunks = chunkConversation(messages, { maxChars: 2000 });
    expect(chunks.length).toBeGreaterThan(1);
    // ranges tile [0, 39] with no gaps or overlaps
    let next = 0;
    for (const c of chunks) {
      expect(c.turnRange[0]).toBe(next);
      next = c.turnRange[1] + 1;
    }
    expect(next).toBe(40);
    // no chunk exceeds the cap
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(2000);
  });

  it("hard-splits a single oversize message instead of dropping it", () => {
    const messages = [msg("user", "short"), msg("assistant", "y".repeat(5000)), msg("user", "tail")];
    const chunks = chunkConversation(messages, { maxChars: 2000 });
    const joined = chunks.map((c) => c.text).join("");
    expect(joined).toContain("short");
    expect(joined).toContain("tail");
    expect(joined.match(/y/g)!.length).toBe(5000);
  });
});

describe("sanitizeLlmOutput", () => {
  it("coerces invalid strict-enum values to null and truncates over-cap arrays", () => {
    const parsed = {
      constellation: {
        narrative_archetype: "observer",
        temporal_context: "midlife",
        emotion_subtone: ["a", "b", "c", "d", "e", "f"],
      },
      gravity: { valence: "positive", emotional_weight: 1.4 },
    };
    const notes = sanitizeLlmOutput(parsed);
    expect(parsed.constellation.narrative_archetype).toBeNull();
    expect(parsed.constellation.temporal_context).toBe("midlife");
    expect(parsed.constellation.emotion_subtone).toHaveLength(4);
    expect(parsed.gravity.valence).toBe("positive");
    expect(parsed.gravity.emotional_weight).toBe(1);
    expect(notes.map((n) => n.path)).toEqual(
      expect.arrayContaining(["constellation.narrative_archetype", "constellation.emotion_subtone", "gravity.emotional_weight"])
    );
  });

  it("normalizes stance spelling and nulls unknown stances", () => {
    const a: Record<string, unknown> = { experiential_stance: "Quoted Third-Party" };
    sanitizeLlmOutput(a);
    expect(a.experiential_stance).toBe("quoted_third_party");
    const b: Record<string, unknown> = { experiential_stance: "somebody_elses" };
    sanitizeLlmOutput(b);
    expect(b.experiential_stance).toBeNull();
  });

  it("leaves free-text-tolerant fields untouched", () => {
    const parsed = { constellation: { arc_type: "creative_breakthrough" }, gravity: { tether_type: "memory_palace" } };
    sanitizeLlmOutput(parsed);
    expect(parsed.constellation.arc_type).toBe("creative_breakthrough");
    expect(parsed.gravity.tether_type).toBe("memory_palace");
  });
});

describe("experiential_stance schema", () => {
  it("validates extraction output carrying a stance", () => {
    const minimalExtended = {
      core: { anchor: "a", spark: "b", wound: null, fuel: null, bridge: null, echo: null, narrative: "n" },
      constellation: {
        emotion_primary: "joy", emotion_subtone: ["light"], higher_order_emotion: null,
        meta_emotional_state: null, interpersonal_affect: null, narrative_arc: "connection",
        relational_dynamics: null, temporal_context: null, memory_type: null, media_format: null,
        narrative_archetype: null, symbolic_anchor: null, relational_perspective: null,
        temporal_rhythm: null, identity_thread: null, expressed_insight: null,
        transformational_pivot: false, somatic_signature: null,
      },
      milky_way: { event_type: null, location_context: null, associated_people: [], visibility_context: null, tone_shift: null },
      gravity: { emotional_weight: 0.3, valence: null, tether_type: null, recurrence_pattern: null, strength_score: 0.2 },
      experiential_stance: "lived",
    };
    const result = LlmExtendedFieldsSchema.safeParse(minimalExtended);
    expect(result.success).toBe(true);
  });
});

describe("applyStanceGuard", () => {
  const makeExtracted = () => ({
    core: { anchor: "a stranger's story", wound: "her mother's death", narrative: "..." },
    constellation: {
      identity_thread: "playful spouse",
      expressed_insight: "love endures",
      somatic_signature: "tight chest",
      transformational_pivot: true,
    },
    gravity: { emotional_weight: 0.9, strength_score: 0.8 },
    impulse: { drive_state: "process", urgency: "acute" },
  });

  it("clears subject significance fields for non-subject stances", () => {
    for (const stance of ["quoted_third_party", "assistant_generated", "hypothetical"] as const) {
      const extracted = makeExtracted();
      const cleared = applyStanceGuard(extracted as unknown as Record<string, unknown>, stance);
      expect(extracted.core.wound).toBeNull();
      expect(extracted.constellation.identity_thread).toBeNull();
      expect(extracted.constellation.expressed_insight).toBeNull();
      expect(extracted.constellation.somatic_signature).toBeNull();
      expect(extracted.constellation.transformational_pivot).toBe(false);
      expect(extracted.gravity.emotional_weight).toBe(0.2);
      expect(extracted.gravity.strength_score).toBe(0.2);
      expect(extracted.impulse.drive_state).toBeNull();
      expect(cleared.length).toBeGreaterThan(0);
      // descriptive fields survive
      expect(extracted.core.anchor).toBe("a stranger's story");
    }
  });

  it("does not touch lived or witnessed material", () => {
    for (const stance of ["lived", "witnessed", null] as const) {
      const extracted = makeExtracted();
      const cleared = applyStanceGuard(extracted as unknown as Record<string, unknown>, stance);
      expect(cleared).toEqual([]);
      expect(extracted.gravity.emotional_weight).toBe(0.9);
      expect(extracted.constellation.transformational_pivot).toBe(true);
    }
  });
});

describe("takeStance / resolveStance", () => {
  it("removes the stance key from extracted fields", () => {
    const extracted: Record<string, unknown> = { experiential_stance: "witnessed", core: {} };
    expect(takeStance(extracted)).toBe("witnessed");
    expect("experiential_stance" in extracted).toBe(false);
  });

  it("adopts the more conservative stance on disagreement", () => {
    expect(resolveStance("lived", "quoted_third_party")).toBe("quoted_third_party");
    expect(resolveStance("quoted_third_party", "lived")).toBe("quoted_third_party");
    expect(resolveStance("lived", null)).toBe("lived");
    expect(resolveStance(null, "assistant_generated")).toBe("assistant_generated");
    expect(isNonSubjectStance("witnessed")).toBe(false);
    expect(isNonSubjectStance("assistant_generated")).toBe(true);
  });
});

describe("defaultMaxTokens", () => {
  it("gives thinking models a larger output budget", () => {
    expect(defaultMaxTokens("kimi-k2.5")).toBe(THINKING_MODEL_MAX_TOKENS);
    expect(defaultMaxTokens("kimi-k2.6")).toBe(THINKING_MODEL_MAX_TOKENS);
    expect(defaultMaxTokens("kimi-k2-0905")).toBe(DEFAULT_MAX_TOKENS);
    expect(defaultMaxTokens("claude-sonnet-4-20250514")).toBe(DEFAULT_MAX_TOKENS);
    expect(defaultMaxTokens("gpt-4o-mini")).toBe(DEFAULT_MAX_TOKENS);
  });
});
