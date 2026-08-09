/**
 * Model configuration — the single home for every model identifier the SDK
 * uses at runtime.
 *
 * STANDING RULE (CLAUDE.md § Engineering Rules): no hardcoded model or
 * provider model-id strings anywhere outside this module. Every call site
 * resolves its model through the functions below.
 *
 * PROVIDER resolution (which provider runs extraction when none is
 * requested):
 *   1. per-request option (`provider` on the extraction call)
 *   2. `EXTRACTION_PROVIDER` env
 *   3. "anthropic" — founder decision 2026-08-04 after the 0.8.14 model
 *      bake-off: an untouched environment resolves to
 *      anthropic/claude-haiku-4-5 (zero-failure, fast non-thinking tier).
 *
 * MODEL resolution, per provider:
 *   1. per-request option (`model` on the extraction call)
 *   2. `EXTRACTION_MODEL` env — global override, applies to whichever
 *      provider is selected (set it only when you run a single provider)
 *   3. provider env — `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `KIMI_MODEL`
 *   4. the documented fallback constant in this module
 */
export type ExtractionProvider = "anthropic" | "openai" | "kimi";
/**
 * Resolve the extraction provider:
 * per-request → EXTRACTION_PROVIDER env → "anthropic".
 * Unknown values fall through to the default rather than throwing — a
 * typo'd env var must not take extraction down.
 */
export declare function resolveExtractionProvider(requested?: string): ExtractionProvider;
/**
 * The documented fallback model for a provider (resolution step 4).
 * Kimi's fallback depends on routing: OpenRouter uses vendor-prefixed ids.
 */
export declare function fallbackModel(provider: ExtractionProvider): string;
/**
 * Resolve the extraction model for a provider:
 * per-request → EXTRACTION_MODEL → provider env → fallback constant.
 */
export declare function resolveExtractionModel(provider: ExtractionProvider, requested?: string): string;
/**
 * Resolve the stance-classifier model for a provider:
 * per-request → STANCE_MODEL → fast non-thinking fallback.
 */
export declare function resolveStanceModel(provider: ExtractionProvider, requested?: string): string;
/**
 * Extra request-body fields for a provider's stance-classifier call.
 * Kimi only: thinking-class Kimi models accept Moonshot's
 * `thinking: {type: "disabled"}` extension, which skips reasoning and
 * keeps the one-word classifier at non-thinking latency. Not sent for
 * non-thinking Kimi models (moonshot-v1-*) or other providers.
 */
export declare function stanceRequestExtensions(provider: ExtractionProvider, model: string): Record<string, unknown>;
export declare function usesMaxCompletionTokens(model: string): boolean;
/**
 * Default output budget for non-thinking models. Validated against real
 * completions (2026-08-04): full-profile extractions run 600–1,200 output
 * tokens, so 2,048 leaves ~2x headroom while trimming provider-side
 * latency ceilings.
 */
export declare const DEFAULT_MAX_TOKENS = 2048;
/**
 * Default output budget for thinking models, whose reasoning tokens count
 * against max_tokens. 4096 silently truncated extraction JSON on exactly
 * the most emotionally dense inputs (archive-sample run, 2026-06-10).
 * Retained ONLY where a thinking-class model is configured.
 */
export declare const THINKING_MODEL_MAX_TOKENS = 16384;
/** True for thinking-class models (reasoning tokens count against output) */
export declare function isThinkingModel(model: string): boolean;
export declare function defaultMaxTokens(model: string): number;
//# sourceMappingURL=model-config.d.ts.map