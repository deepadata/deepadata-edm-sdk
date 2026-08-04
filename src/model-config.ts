/**
 * Model configuration — the single home for every model identifier the SDK
 * uses at runtime.
 *
 * STANDING RULE (CLAUDE.md § Engineering Rules): no hardcoded model or
 * provider model-id strings anywhere outside this module. Every call site
 * resolves its model through the functions below.
 *
 * Resolution order, per provider:
 *   1. per-request option (`model` on the extraction call)
 *   2. `EXTRACTION_MODEL` env — global override, applies to whichever
 *      provider is selected (set it only when you run a single provider)
 *   3. provider env — `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `KIMI_MODEL`
 *   4. the documented fallback constant in this module
 */

export type ExtractionProvider = "anthropic" | "openai" | "kimi";

/**
 * Documented fallback models — step 4 of the resolution order and the ONLY
 * place model ids are allowed to live.
 *
 * - anthropic: `claude-sonnet-4-20250514`
 * - openai: `gpt-4o-mini` — cheapest vision-capable default
 * - kimi: `kimi-k2.5` — kimi-k2-0711-preview was retired by Moonshot
 *   (404s as of 2026-06). kimi-k2.5 is a thinking model; defaultMaxTokens()
 *   sizes the output budget accordingly.
 */
const FALLBACK_MODELS: Record<ExtractionProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  kimi: "kimi-k2.5",
};

const PROVIDER_MODEL_ENV: Record<ExtractionProvider, string> = {
  anthropic: "ANTHROPIC_MODEL",
  openai: "OPENAI_MODEL",
  kimi: "KIMI_MODEL",
};

/** OpenRouter routes Kimi under a vendor-prefixed id */
const OPENROUTER_KIMI_MODEL = "moonshotai/kimi-k2";

function envModel(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * True when Kimi traffic will go through OpenRouter: an OpenRouter key is
 * present and no direct Moonshot key is (mirrors createKimiClient()).
 */
function usingOpenRouterForKimi(): boolean {
  return (
    !!process.env["OPENROUTER_API_KEY"] &&
    !process.env["MOONSHOT_API_KEY"] &&
    !process.env["KIMI_API_KEY"]
  );
}

/**
 * The documented fallback model for a provider (resolution step 4).
 * Kimi's fallback depends on routing: OpenRouter uses vendor-prefixed ids.
 */
export function fallbackModel(provider: ExtractionProvider): string {
  if (provider === "kimi" && usingOpenRouterForKimi()) {
    return OPENROUTER_KIMI_MODEL;
  }
  return FALLBACK_MODELS[provider];
}

/**
 * Resolve the extraction model for a provider:
 * per-request → EXTRACTION_MODEL → provider env → fallback constant.
 */
export function resolveExtractionModel(
  provider: ExtractionProvider,
  requested?: string
): string {
  return (
    requested ??
    envModel("EXTRACTION_MODEL") ??
    envModel(PROVIDER_MODEL_ENV[provider]) ??
    fallbackModel(provider)
  );
}

// =============================================================================
// Output token budgets (model-class aware)
// =============================================================================

/** Default output budget for non-thinking models */
export const DEFAULT_MAX_TOKENS = 4096;

/**
 * Default output budget for thinking models, whose reasoning tokens count
 * against max_tokens. 4096 silently truncated extraction JSON on exactly
 * the most emotionally dense inputs (archive-sample run, 2026-06-10).
 */
export const THINKING_MODEL_MAX_TOKENS = 16_384;

/** Models that spend output tokens on reasoning before emitting JSON */
const THINKING_MODEL_RE = /k2\.[5-9]|k2\.\d{2,}|k3|thinking|reasoner|o[13](-|$)|gpt-5/i;

/** True for thinking-class models (reasoning tokens count against output) */
export function isThinkingModel(model: string): boolean {
  return THINKING_MODEL_RE.test(model);
}

export function defaultMaxTokens(model: string): number {
  return isThinkingModel(model) ? THINKING_MODEL_MAX_TOKENS : DEFAULT_MAX_TOKENS;
}
