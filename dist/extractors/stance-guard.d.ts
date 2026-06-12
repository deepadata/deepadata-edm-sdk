/**
 * Experiential-stance attribution guard
 *
 * The worst defect found in the 2026-06-10 archive-sample evidence run:
 * extraction cannot tell whose story it is. An assistant-invented anecdote
 * was encoded as the subject's own marital ritual; a pasted stranger's
 * story became the subject's heaviest grief (weight 0.9). A provenance
 * guard is a launch gate for the significance layer.
 *
 * Three layers of defence:
 * 1. Prompt — extraction prompts require a top-level experiential_stance
 *    classification and forbid encoding non-lived material into subject
 *    significance fields.
 * 2. Deterministic guard (this module) — if the model still returns a
 *    non-subject stance with populated significance fields, those fields
 *    are cleared and weights floored. Free; always on.
 * 3. Optional classifier pass — a cheap second LLM call that re-derives
 *    stance from the source material and overrides the extraction's claim
 *    when the classifier is MORE conservative. Triggered for high-weight
 *    conversation extractions (the exact regime where the defect bit).
 *
 * experiential_stance is proposed for EDM v0.9 (see deepadata-com
 * planning/proposals/2026-06-12-experiential-stance-v0.9.md). Until the
 * spec lands it travels in the extraction result + telemetry notes, never
 * in the sealed artifact body, so artifacts stay v0.8.0-conformant.
 */
import type OpenAI from "openai";
import type Anthropic from "@anthropic-ai/sdk";
import type { ExperientialStance } from "../schema/types.js";
export interface StanceGuardResult {
    /** Final stance after guard (and classifier, when run) */
    stance: ExperientialStance | null;
    /** Stance claimed by the extraction model, before any override */
    claimedStance: ExperientialStance | null;
    /** True when subject significance fields were cleared/floored */
    demoted: boolean;
    /** Field paths cleared or floored by the guard */
    fieldsCleared: string[];
    /** Set when the classifier pass ran and disagreed with the claim */
    classifierOverride: ExperientialStance | null;
}
export declare function isNonSubjectStance(stance: ExperientialStance | null): boolean;
/** Read and remove the top-level experiential_stance key from extracted fields */
export declare function takeStance(extracted: Record<string, unknown>): ExperientialStance | null;
/**
 * Deterministic demotion: clear subject-significance fields when the
 * emotionally salient material is not the subject's own experience.
 * Mutates `extracted` in place; returns the list of fields touched.
 *
 * Kept fields (anchor, spark, narrative, milky_way) still describe the
 * content; the cleared set is exactly the fields that assert something
 * about the SUBJECT's inner life.
 */
export declare function applyStanceGuard(extracted: Record<string, unknown>, stance: ExperientialStance | null): string[];
export interface StanceClassifierInput {
    /** The original (unframed) source text given to extraction */
    sourceText: string;
    /** The extracted narrative or field summary under suspicion */
    extractedSummary: string;
}
/**
 * Classify stance with an OpenAI-compatible client (Kimi/OpenAI).
 * max_tokens leaves headroom for thinking models that spend output
 * tokens on reasoning before the one-word answer.
 */
export declare function classifyStanceOpenAI(client: OpenAI, model: string, input: StanceClassifierInput): Promise<ExperientialStance | null>;
/** Classify stance with an Anthropic client */
export declare function classifyStanceAnthropic(client: Anthropic, model: string, input: StanceClassifierInput): Promise<ExperientialStance | null>;
/**
 * Resolve a disagreement between the extraction's claimed stance and the
 * classifier's verdict: the more conservative (less subject-attributing)
 * stance wins. Returns the stance to adopt.
 */
export declare function resolveStance(claimed: ExperientialStance | null, classified: ExperientialStance | null): ExperientialStance | null;
//# sourceMappingURL=stance-guard.d.ts.map