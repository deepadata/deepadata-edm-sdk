/**
 * Zod → prompt field-block generator (ADR-0030, Consolidation Spec §4)
 *
 * The two extraction prompts (Full in llm-extractor.ts; Extended/Essential in
 * profile-prompts.ts) each carry a hand-written JSON skeleton whose per-field
 * `// CANONICAL: a | b | c` comments enumerate the field vocabulary. Those
 * lists are hand-kept in parallel with the zod validator, so they drift (the
 * `orphan`/`mentor` class of bug). This generator emits that skeleton FROM the
 * zod schema instead, so the enum rendered in the comment is the *same array
 * object* the validator enforces — drift becomes impossible by construction.
 *
 * Architectural rule (Consolidation Spec §3): zod is the mechanical canonical
 * source. The enum VALUES in every comment are read live from the zod node
 * (`classifyField` below), never hardcoded here. Only presentation that zod
 * does not carry — the prose guidance for free-text fields, the suffix wording,
 * the alignment — lives in this file's tables, and is the OUTPUT_CONTRACT layer
 * the spec keeps hand-written.
 *
 * Field MEMBERSHIP and ORDER per profile come from the profile's own LLM
 * extraction schema (LlmEssential/Extended/ExtractedFieldsSchema) — the exact
 * shapes the extractor validates against — so the generated block asks for
 * precisely the fields that profile extracts, in zod definition order.
 *
 * Phase A scope: this module only GENERATES the block. Wiring it into prompt
 * construction (replacing the hand-written skeletons) is Phase B.
 */
import { z } from "zod";
export type FieldBlockProfile = "essential" | "extended" | "full";
export type FieldKind = "strict-enum" | "canonical-enum" | "string" | "number" | "boolean" | "string-array";
export interface FieldInfo {
    kind: FieldKind;
    /** Present for strict-enum / canonical-enum — read live from the zod node. */
    enumValues?: readonly string[];
}
/**
 * Classify a zod field node into the kind the prompt comment renders.
 *
 * - z.union([z.enum([...]), z.string()])  → canonical-enum (two-tier free text)
 * - z.enum([...])                          → strict-enum
 * - z.string / z.number / z.boolean        → free text / number / boolean
 * - z.array(z.string())                    → string-array
 */
export declare function classifyField(node: z.ZodTypeAny): FieldInfo;
/**
 * Generate the JSON field-block skeleton for a profile, from the zod schema.
 *
 * Output shape (matches the current hand-written skeletons):
 *
 *   {
 *     "experiential_stance": "",  // STRICT ENUM: ...
 *     "core": {
 *       "anchor": "",  // central theme ...
 *       ...
 *     },
 *     ...
 *   }
 */
export declare function generateFieldBlock(profile: FieldBlockProfile): string;
//# sourceMappingURL=generate-field-block.d.ts.map