/**
 * LLM output sanitation
 *
 * Runs between JSON.parse and zod validation in every extractor. Two
 * failure modes from the 2026-06-10 archive-sample run motivate it:
 *
 * - emotion_subtone with >4 items on emotionally rich threads (model
 *   enthusiasm exceeds the spec cap) — hard-failed validation/sealing.
 * - Free-text values in STRICT ENUM fields (e.g. narrative_archetype:
 *   "observer") — hard-failed validation/sealing.
 *
 * Policy: prefer a null/clamped field over a dropped artifact. Strict-enum
 * coercion to null matches the prompts' own instruction ("pick ONE or
 * null"); array caps match the JSON schema. Free-text-tolerant fields
 * (emotion_primary, narrative_arc, arc_type, relational_dynamics,
 * tether_type, recurrence_pattern, coping_style) are NOT touched.
 */
export interface SanitationNote {
    path: string;
    action: "coerced_to_null" | "truncated" | "clamped";
    original: unknown;
}
export declare function sanitizeLlmOutput(parsed: unknown): SanitationNote[];
/** Render sanitation notes for telemetry.extraction_notes */
export declare function formatSanitationNotes(notes: SanitationNote[]): string | null;
//# sourceMappingURL=output-sanitizer.d.ts.map