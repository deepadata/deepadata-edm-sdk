/**
 * Tolerant JSON recovery for LLM text responses.
 *
 * Finding F1 (0.8.14 overnight validation, 2026-08-05): on large technical
 * documents the model sometimes wraps its JSON in markdown the strict
 * fence-stripper can't unwrap — a preamble line above the fence, an
 * annotated fence, or a missing closing fence — and JSON.parse then fails
 * on the raw text (5/60 corpus runs). The memory/narrative/conversation
 * input class was unaffected.
 *
 * Recovery order:
 * 1. Strict fence fast-path (the pre-0.8.15 behavior): the whole response
 *    is a single well-formed ```json fence.
 * 2. Direct parse of the trimmed text (bare JSON, no fences).
 * 3. Outermost-object recovery: scan for the first `{` that opens a
 *    brace-balanced, parseable JSON object, ignoring braces inside string
 *    literals. Fence state is irrelevant to this pass, so every observed
 *    F1 shape reduces to it.
 */
const STRICT_FENCE_RE = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
/**
 * Parse an LLM text response as JSON, tolerating markdown wrapping.
 * Throws (the original JSON.parse error) when no JSON object can be
 * recovered anywhere in the text; callers wrap with their provider-
 * specific message.
 */
export function parseLlmJson(raw) {
    const trimmed = raw.trim();
    const fenceMatch = trimmed.match(STRICT_FENCE_RE);
    const candidate = fenceMatch?.[1] ? fenceMatch[1].trim() : trimmed;
    try {
        return JSON.parse(candidate);
    }
    catch (parseError) {
        const recovered = recoverOutermostJsonObject(trimmed);
        if (recovered !== undefined)
            return recovered;
        throw parseError;
    }
}
/**
 * Find and parse the outermost JSON object embedded in `text`.
 * Tries each `{` in order as a candidate start; a candidate ends at the
 * brace that balances it (string literals and escapes respected). Returns
 * the first candidate that parses; `undefined` when none does.
 */
function recoverOutermostJsonObject(text) {
    for (let start = text.indexOf("{"); start !== -1; start = text.indexOf("{", start + 1)) {
        const end = findBalancedEnd(text, start);
        if (end === -1)
            continue;
        try {
            return JSON.parse(text.slice(start, end + 1));
        }
        catch {
            // Not valid JSON from this brace (e.g. `{see note}` in a preamble) —
            // keep scanning for a later candidate.
        }
    }
    return undefined;
}
/**
 * Index of the brace that balances the `{` at `start`, or -1 if the text
 * ends before balance is reached. Braces inside JSON string literals
 * (including escaped quotes) do not count.
 */
function findBalancedEnd(text, start) {
    let depth = 0;
    let inString = false;
    for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (inString) {
            if (ch === "\\")
                i++;
            else if (ch === '"')
                inString = false;
        }
        else if (ch === '"') {
            inString = true;
        }
        else if (ch === "{") {
            depth++;
        }
        else if (ch === "}") {
            depth--;
            if (depth === 0)
                return i;
        }
    }
    return -1;
}
//# sourceMappingURL=json-recovery.js.map