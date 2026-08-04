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
 * Default extraction provider (resolution step 3). With no per-request
 * provider and no EXTRACTION_PROVIDER env, extraction runs on
 * anthropic/claude-haiku-4-5.
 */
const DEFAULT_EXTRACTION_PROVIDER: ExtractionProvider = "anthropic";

function isProvider(value: string | undefined): value is ExtractionProvider {
  return value === "anthropic" || value === "openai" || value === "kimi";
}

/**
 * Resolve the extraction provider:
 * per-request → EXTRACTION_PROVIDER env → "anthropic".
 * Unknown values fall through to the default rather than throwing — a
 * typo'd env var must not take extraction down.
 */
export function resolveExtractionProvider(requested?: string): ExtractionProvider {
  if (isProvider(requested)) return requested;
  const fromEnv = process.env["EXTRACTION_PROVIDER"]?.trim().toLowerCase();
  if (isProvider(fromEnv)) return fromEnv;
  return DEFAULT_EXTRACTION_PROVIDER;
}

/**
 * Documented fallback models — step 4 of the resolution order and the ONLY
 * place model ids are allowed to live.
 *
 * - anthropic: `claude-haiku-4-5` — claude-sonnet-4-20250514 was retired
 *   by Anthropic (404 confirmed 2026-08-04); haiku-4-5 is the fast
 *   non-thinking tier that fits the extraction latency budget.
 * - openai: `gpt-4o-mini` — cheapest vision-capable default
 * - kimi: `kimi-k2.5` — kimi-k2-0711-preview was retired by Moonshot
 *   (404s as of 2026-06). kimi-k2.5 is a thinking model; defaultMaxTokens()
 *   sizes the output budget accordingly.
 */
const FALLBACK_MODELS: Record<ExtractionProvider, string> = {
  anthropic: "claude-haiku-4-5",
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
// Stance classifier models
// =============================================================================

/**
 * Stance-classifier fallbacks. The classifier is a cheap second call that
 * answers with one word — it does NOT inherit the extraction model
 * (a thinking-class extraction model would double latency for nothing).
 * Resolution: per-request `stanceModel` → `STANCE_MODEL` env → the fast
 * non-thinking default below. EXTRACTION_MODEL deliberately does not apply.
 *
 * - kimi: `moonshot-v1-32k` — non-thinking Moonshot tier; 32k context
 *   comfortably fits the classifier's 12K-char source slice. OpenRouter
 *   routing falls back to the vendor-prefixed non-thinking k2 id.
 */
const STANCE_FALLBACK_MODELS: Record<ExtractionProvider, string> = {
  anthropic: "claude-haiku-4-5",
  openai: "gpt-4o-mini",
  kimi: "moonshot-v1-32k",
};

/**
 * Resolve the stance-classifier model for a provider:
 * per-request → STANCE_MODEL → fast non-thinking fallback.
 */
export function resolveStanceModel(
  provider: ExtractionProvider,
  requested?: string
): string {
  const resolved = requested ?? envModel("STANCE_MODEL");
  if (resolved) return resolved;
  if (provider === "kimi" && usingOpenRouterForKimi()) {
    return OPENROUTER_KIMI_MODEL;
  }
  return STANCE_FALLBACK_MODELS[provider];
}

// =============================================================================
// Provider API-surface quirks (model-class aware)
// =============================================================================

/**
 * OpenAI models on the reasoning-era chat API surface (gpt-5.x class and
 * o-series): they reject `max_tokens` with a hard 400 and accept only
 * `max_completion_tokens`; they also accept only the default temperature
 * (any explicit override 400s).
 */
const OPENAI_REASONING_SURFACE_RE = /^(gpt-5|o[0-9])/i;

export function usesMaxCompletionTokens(model: string): boolean {
  return OPENAI_REASONING_SURFACE_RE.test(model);
}

// =============================================================================
// Output token budgets (model-class aware)
// =============================================================================

/**
 * Default output budget for non-thinking models. Validated against real
 * completions (2026-08-04): full-profile extractions run 600–1,200 output
 * tokens, so 2,048 leaves ~2x headroom while trimming provider-side
 * latency ceilings.
 */
export const DEFAULT_MAX_TOKENS = 2048;

/**
 * Default output budget for thinking models, whose reasoning tokens count
 * against max_tokens. 4096 silently truncated extraction JSON on exactly
 * the most emotionally dense inputs (archive-sample run, 2026-06-10).
 * Retained ONLY where a thinking-class model is configured.
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
