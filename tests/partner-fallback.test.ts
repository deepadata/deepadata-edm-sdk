/**
 * D2 — partner-profile fallback direction (partner-profiles 2026-08-02)
 *
 * Unresolved partner profiles (`partner:<id>`) must route through ONE
 * base surface pending registry lookup (ADR-0012). The chosen direction
 * is EXTENDED: prompt, output schema, field filter, and confidence all
 * agree. Before this fix the prompt and output schema fell back to FULL
 * while filtering fell back to EXTENDED — a partner extract paid
 * full-prompt inference for fields the filter then dropped.
 *
 * D3 — the profile prefix guards are part of the public API surface.
 */
import { describe, it, expect } from "vitest";
import {
  getProfilePrompt,
  EXTENDED_PROFILE_PROMPT,
  ESSENTIAL_PROFILE_PROMPT,
  calculateProfileConfidence,
} from "../src/extractors/profile-prompts.js";
import { getProfileSchema } from "../src/extractors/llm-extractor.js";
import { LlmExtendedFieldsSchema, LlmExtractedFieldsSchema } from "../src/schema/edm-schema.js";
import { getProfileFields, EXTENDED_PROFILE_FIELDS } from "../src/assembler.js";
import {
  isCanonicalProfile,
  isPartnerProfile,
  getPartnerProfileId,
} from "../src/index.js";

const PARTNER = "partner:com.deepadata.journaling.v1" as const;

describe("D2: partner profiles use the extended base on every surface", () => {
  it("prompt: extended (not the full EXTRACTION_SYSTEM_PROMPT fallback)", () => {
    expect(getProfilePrompt(PARTNER)).toBe(EXTENDED_PROFILE_PROMPT);
    // canonical profiles unchanged
    expect(getProfilePrompt("essential")).toBe(ESSENTIAL_PROFILE_PROMPT);
    expect(getProfilePrompt("extended")).toBe(EXTENDED_PROFILE_PROMPT);
    expect(getProfilePrompt("full")).toBeNull();
  });

  it("output schema: extended (not full)", () => {
    expect(getProfileSchema(PARTNER)).toBe(LlmExtendedFieldsSchema);
    expect(getProfileSchema("full")).toBe(LlmExtractedFieldsSchema);
  });

  it("field filter: extended base (pre-existing, now symmetric)", () => {
    expect(getProfileFields(PARTNER)).toBe(EXTENDED_PROFILE_FIELDS);
  });

  it("confidence: scored against the extended required set", () => {
    // An extraction populating every extended-required field scores 1.0
    // under the partner profile too (falls back to the extended list).
    const populated = {
      core: { anchor: "a", spark: "b", narrative: "n" },
      constellation: {
        emotion_primary: "joy",
        emotion_subtone: ["light"],
        narrative_arc: "connection",
        relational_dynamics: "friendship",
        temporal_context: "recent",
        memory_type: "reflection",
      },
      milky_way: { event_type: "reunion" },
      gravity: {
        emotional_weight: 0.5,
        valence: "positive",
        tether_type: "person",
        recurrence_pattern: "isolated",
        strength_score: 0.4,
      },
    } as unknown as Record<string, Record<string, unknown>>;
    expect(calculateProfileConfidence(populated, PARTNER)).toBe(
      calculateProfileConfidence(populated, "extended")
    );
  });
});

describe("D4: partner completeness-skip surfaces as a validateEDM warning", () => {
  it("valid partner artifact carries a partner_profile warning", async () => {
    const { validateEDM } = await import("../src/index.js");
    const artifact = {
      meta: { profile: PARTNER },
      core: { anchor: "a" },
    };
    const result = validateEDM(artifact);
    expect(result.valid).toBe(true);
    expect(result.warnings).toBeDefined();
    expect(result.warnings![0]!.code).toBe("partner_profile");
    expect(result.warnings![0]!.path).toBe("meta.profile");
    expect(result.warnings![0]!.message).toContain("completeness validation skipped");
  });

  it("canonical profiles produce no warnings key", async () => {
    const { validateEDM } = await import("../src/index.js");
    const result = validateEDM({ meta: { profile: "full" } });
    expect(result.warnings).toBeUndefined();
  });
});

describe("D3: prefix guards are exported from the public index", () => {
  it("exports working isCanonicalProfile / isPartnerProfile / getPartnerProfileId", () => {
    expect(isCanonicalProfile("extended")).toBe(true);
    expect(isCanonicalProfile(PARTNER)).toBe(false);
    expect(isPartnerProfile(PARTNER)).toBe(true);
    expect(isPartnerProfile("full")).toBe(false);
    expect(getPartnerProfileId(PARTNER)).toBe("com.deepadata.journaling.v1");
    expect(getPartnerProfileId("full")).toBeNull();
  });
});
