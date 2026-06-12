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
import { EXPERIENTIAL_STANCE } from "../schema/types.js";
/** Stances whose material must not populate subject significance fields */
const NON_SUBJECT_STANCES = new Set([
    "quoted_third_party",
    "assistant_generated",
    "hypothetical",
]);
export function isNonSubjectStance(stance) {
    return stance !== null && NON_SUBJECT_STANCES.has(stance);
}
function parseStance(value) {
    if (typeof value !== "string")
        return null;
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
    return EXPERIENTIAL_STANCE.includes(normalized) ? normalized : null;
}
/** Read and remove the top-level experiential_stance key from extracted fields */
export function takeStance(extracted) {
    const stance = parseStance(extracted["experiential_stance"]);
    delete extracted["experiential_stance"];
    return stance;
}
/**
 * Deterministic demotion: clear subject-significance fields when the
 * emotionally salient material is not the subject's own experience.
 * Mutates `extracted` in place; returns the list of fields touched.
 *
 * Kept fields (anchor, spark, narrative, milky_way) still describe the
 * content; the cleared set is exactly the fields that assert something
 * about the SUBJECT's inner life.
 */
export function applyStanceGuard(extracted, stance) {
    if (!isNonSubjectStance(stance))
        return [];
    const cleared = [];
    const clearString = (domain, field) => {
        const d = extracted[domain];
        if (d && d[field] != null) {
            d[field] = null;
            cleared.push(`${domain}.${field}`);
        }
    };
    clearString("core", "wound");
    clearString("constellation", "identity_thread");
    clearString("constellation", "expressed_insight");
    clearString("constellation", "somatic_signature");
    const constellation = extracted["constellation"];
    if (constellation && constellation["transformational_pivot"] === true) {
        constellation["transformational_pivot"] = false;
        cleared.push("constellation.transformational_pivot");
    }
    const gravity = extracted["gravity"];
    if (gravity) {
        for (const field of ["emotional_weight", "strength_score"]) {
            const v = gravity[field];
            if (typeof v === "number" && v > 0.2) {
                gravity[field] = 0.2;
                cleared.push(`gravity.${field}`);
            }
        }
    }
    // Impulse fields assert the subject's motivational state — for material
    // the subject didn't live, they describe the story's narrator instead.
    const impulse = extracted["impulse"];
    if (impulse) {
        for (const [field, value] of Object.entries(impulse)) {
            if (value != null) {
                impulse[field] = null;
                cleared.push(`impulse.${field}`);
            }
        }
    }
    return cleared;
}
// =============================================================================
// Classifier pass
// =============================================================================
const STANCE_CLASSIFIER_PROMPT = `You classify the experiential stance of source material relative to a SUBJECT. In chat transcripts the SUBJECT is the USER speaker; the ASSISTANT is an AI.

Given source material and a summary that was extracted from it, decide whose experience the emotionally significant material is:
- "lived" — the subject's own first-hand experience
- "witnessed" — events the subject personally witnessed or is directly affected by (a loved one's death, a family crisis)
- "quoted_third_party" — someone else's story that the subject quoted, pasted, or retold without being a participant (an article, test data, a stranger's anecdote)
- "assistant_generated" — fiction, examples, or anecdotes produced by the AI assistant rather than reported by the subject
- "hypothetical" — imagined scenarios, drafts about invented people, role-play

Watch for: the subject pasting text for a task (translation, classification, summarising) — that content is quoted_third_party even if emotionally intense. An anecdote that first appears in an ASSISTANT message is assistant_generated unless the subject confirms it happened.

Answer with EXACTLY one word: lived, witnessed, quoted_third_party, assistant_generated, or hypothetical.`;
/** How much source material the classifier sees (head slice) */
const CLASSIFIER_SOURCE_CHARS = 12_000;
function buildClassifierUserContent(input) {
    return (`SOURCE MATERIAL (may be truncated):\n${input.sourceText.slice(0, CLASSIFIER_SOURCE_CHARS)}\n\n` +
        `EXTRACTED SUMMARY:\n${input.extractedSummary}\n\n` +
        `Whose experience is the emotionally significant material? One word.`);
}
/**
 * Classify stance with an OpenAI-compatible client (Kimi/OpenAI).
 * max_tokens leaves headroom for thinking models that spend output
 * tokens on reasoning before the one-word answer.
 */
export async function classifyStanceOpenAI(client, model, input) {
    const response = await client.chat.completions.create({
        model,
        max_tokens: 1024,
        temperature: 0,
        messages: [
            { role: "system", content: STANCE_CLASSIFIER_PROMPT },
            { role: "user", content: buildClassifierUserContent(input) },
        ],
    });
    return parseStance(response.choices[0]?.message?.content?.trim().split(/\s+/).pop());
}
/** Classify stance with an Anthropic client */
export async function classifyStanceAnthropic(client, model, input) {
    const response = await client.messages.create({
        model,
        max_tokens: 64,
        system: STANCE_CLASSIFIER_PROMPT,
        messages: [{ role: "user", content: buildClassifierUserContent(input) }],
    });
    const block = response.content.find((b) => b.type === "text");
    return parseStance(block && block.type === "text" ? block.text.trim().split(/\s+/).pop() : null);
}
/** Conservatism order — higher index wins a disagreement */
const CONSERVATISM = {
    lived: 0,
    witnessed: 1,
    hypothetical: 2,
    quoted_third_party: 3,
    assistant_generated: 4,
};
/**
 * Resolve a disagreement between the extraction's claimed stance and the
 * classifier's verdict: the more conservative (less subject-attributing)
 * stance wins. Returns the stance to adopt.
 */
export function resolveStance(claimed, classified) {
    if (classified === null)
        return claimed;
    if (claimed === null)
        return classified;
    return CONSERVATISM[classified] > CONSERVATISM[claimed] ? classified : claimed;
}
//# sourceMappingURL=stance-guard.js.map