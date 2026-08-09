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
/**
 * Parse an LLM text response as JSON, tolerating markdown wrapping.
 * Throws (the original JSON.parse error) when no JSON object can be
 * recovered anywhere in the text; callers wrap with their provider-
 * specific message.
 */
export declare function parseLlmJson(raw: string): unknown;
//# sourceMappingURL=json-recovery.d.ts.map