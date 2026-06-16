/**
 * Phase A snapshot proof (ADR-0030, Consolidation Spec §4 step 3).
 *
 * Compares generateFieldBlock(profile) against the CURRENT hand-written JSON
 * skeleton extracted live from the shipping prompt constants. The hand-written
 * text is the baseline; the generator must conform to it. Two comparisons:
 *
 *   1. exact      — byte-for-byte (the §4 goal).
 *   2. normalized — trailing space stripped + internal space runs collapsed,
 *                   so comment-alignment differences fall away and only
 *                   CONTENT/STRUCTURE differences remain.
 *
 * Where these diverge, the divergence is a finding about the current
 * skeletons, not a generator bug — see the field-block report.
 */
import { describe, it, expect } from "vitest";
import { generateFieldBlock, type FieldBlockProfile } from "../src/extractors/generate-field-block.js";
import { EXTRACTION_SYSTEM_PROMPT } from "../src/extractors/llm-extractor.js";
import { ESSENTIAL_PROFILE_PROMPT, EXTENDED_PROFILE_PROMPT } from "../src/extractors/profile-prompts.js";

/**
 * Extract the first top-level `{ ... }` JSON skeleton from a prompt string:
 * the run of lines from a line that is exactly `{` to the first subsequent
 * line that is exactly `}` (the only column-0 brace pair in each prompt).
 */
function extractSkeleton(prompt: string): string {
  const lines = prompt.split(/\r?\n/);
  const start = lines.findIndex((l) => l === "{");
  if (start === -1) throw new Error("no skeleton open brace found");
  const rel = lines.slice(start + 1).findIndex((l) => l === "}");
  if (rel === -1) throw new Error("no skeleton close brace found");
  return lines.slice(start, start + rel + 2).join("\n");
}

function normalize(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.replace(/\s+$/, "").replace(/ {2,}/g, " "));
}

const CURRENT: Record<FieldBlockProfile, string> = {
  essential: extractSkeleton(ESSENTIAL_PROFILE_PROMPT),
  extended: extractSkeleton(EXTENDED_PROFILE_PROMPT),
  full: extractSkeleton(EXTRACTION_SYSTEM_PROMPT),
};

describe("generateFieldBlock — byte-match against current hand-written skeletons", () => {
  for (const profile of ["essential", "extended", "full"] as const) {
    it(`${profile}: exact byte-match`, () => {
      expect(generateFieldBlock(profile)).toBe(CURRENT[profile]);
    });

    it(`${profile}: normalized (content/structure) match`, () => {
      expect(normalize(generateFieldBlock(profile))).toEqual(normalize(CURRENT[profile]));
    });
  }
});
