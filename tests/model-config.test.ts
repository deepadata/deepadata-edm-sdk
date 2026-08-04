/**
 * Model-config resolution tests
 *
 * The standing rule (CLAUDE.md § Engineering Rules): model ids live ONLY in
 * src/model-config.ts. Resolution per provider:
 *   per-request → EXTRACTION_MODEL → provider env → fallback constant.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveExtractionProvider,
  resolveExtractionModel,
  resolveStanceModel,
  fallbackModel,
  isThinkingModel,
  defaultMaxTokens,
  DEFAULT_MAX_TOKENS,
  THINKING_MODEL_MAX_TOKENS,
  type ExtractionProvider,
} from "../src/model-config.js";

const MODEL_ENV_KEYS = [
  "EXTRACTION_PROVIDER",
  "EXTRACTION_MODEL",
  "STANCE_MODEL",
  "ANTHROPIC_MODEL",
  "OPENAI_MODEL",
  "KIMI_MODEL",
  "OPENROUTER_API_KEY",
  "MOONSHOT_API_KEY",
  "KIMI_API_KEY",
] as const;

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};
  for (const key of MODEL_ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of MODEL_ENV_KEYS) {
    const value = savedEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const PROVIDERS: ExtractionProvider[] = ["anthropic", "openai", "kimi"];

describe("resolveExtractionProvider", () => {
  it("defaults to anthropic with nothing set (founder decision 2026-08-04)", () => {
    expect(resolveExtractionProvider()).toBe("anthropic");
    // and the resolved default model is the haiku fallback
    expect(resolveExtractionModel(resolveExtractionProvider())).toBe("claude-haiku-4-5");
  });

  it("per-request provider wins over env", () => {
    process.env["EXTRACTION_PROVIDER"] = "openai";
    expect(resolveExtractionProvider("kimi")).toBe("kimi");
  });

  it("EXTRACTION_PROVIDER env wins over the default", () => {
    process.env["EXTRACTION_PROVIDER"] = "kimi";
    expect(resolveExtractionProvider()).toBe("kimi");
  });

  it("unknown values fall through to the default instead of throwing", () => {
    process.env["EXTRACTION_PROVIDER"] = "watsonx";
    expect(resolveExtractionProvider()).toBe("anthropic");
    expect(resolveExtractionProvider("bogus")).toBe("anthropic");
  });
});

describe("resolveExtractionModel", () => {
  it("per-request model wins over everything", () => {
    process.env["EXTRACTION_MODEL"] = "env-global";
    process.env["ANTHROPIC_MODEL"] = "env-anthropic";
    expect(resolveExtractionModel("anthropic", "per-request")).toBe("per-request");
  });

  it("EXTRACTION_MODEL outranks the provider env", () => {
    process.env["EXTRACTION_MODEL"] = "env-global";
    process.env["OPENAI_MODEL"] = "env-openai";
    expect(resolveExtractionModel("openai")).toBe("env-global");
  });

  it("provider env outranks the fallback constant", () => {
    process.env["ANTHROPIC_MODEL"] = "env-anthropic";
    process.env["OPENAI_MODEL"] = "env-openai";
    process.env["KIMI_MODEL"] = "env-kimi";
    expect(resolveExtractionModel("anthropic")).toBe("env-anthropic");
    expect(resolveExtractionModel("openai")).toBe("env-openai");
    expect(resolveExtractionModel("kimi")).toBe("env-kimi");
  });

  it("each provider env only affects its own provider", () => {
    process.env["ANTHROPIC_MODEL"] = "env-anthropic";
    expect(resolveExtractionModel("openai")).toBe(fallbackModel("openai"));
    expect(resolveExtractionModel("kimi")).toBe(fallbackModel("kimi"));
  });

  it("falls back to the documented constant with nothing set", () => {
    for (const provider of PROVIDERS) {
      expect(resolveExtractionModel(provider)).toBe(fallbackModel(provider));
      expect(resolveExtractionModel(provider).length).toBeGreaterThan(0);
    }
  });

  it("ignores blank env values", () => {
    process.env["EXTRACTION_MODEL"] = "  ";
    process.env["ANTHROPIC_MODEL"] = "";
    expect(resolveExtractionModel("anthropic")).toBe(fallbackModel("anthropic"));
  });
});

describe("fallbackModel — kimi OpenRouter routing", () => {
  it("uses the vendor-prefixed id when only an OpenRouter key is present", () => {
    process.env["OPENROUTER_API_KEY"] = "or-key";
    expect(fallbackModel("kimi")).toBe("moonshotai/kimi-k2");
  });

  it("uses the direct Moonshot id when a direct key is present", () => {
    process.env["OPENROUTER_API_KEY"] = "or-key";
    process.env["MOONSHOT_API_KEY"] = "ms-key";
    expect(fallbackModel("kimi")).not.toContain("/");
  });
});

describe("resolveStanceModel", () => {
  it("per-request stanceModel wins over STANCE_MODEL env", () => {
    process.env["STANCE_MODEL"] = "env-stance";
    expect(resolveStanceModel("anthropic", "per-request")).toBe("per-request");
  });

  it("STANCE_MODEL env wins over the fallback", () => {
    process.env["STANCE_MODEL"] = "env-stance";
    for (const provider of PROVIDERS) {
      expect(resolveStanceModel(provider)).toBe("env-stance");
    }
  });

  it("does NOT inherit EXTRACTION_MODEL or the extraction fallback", () => {
    process.env["EXTRACTION_MODEL"] = "big-thinking-model";
    for (const provider of PROVIDERS) {
      expect(resolveStanceModel(provider)).not.toBe("big-thinking-model");
    }
  });

  it("defaults to a fast non-thinking model per provider", () => {
    for (const provider of PROVIDERS) {
      const model = resolveStanceModel(provider);
      expect(isThinkingModel(model), `${provider} stance default ${model}`).toBe(false);
    }
  });

  it("kimi stance fallback follows OpenRouter routing", () => {
    process.env["OPENROUTER_API_KEY"] = "or-key";
    expect(resolveStanceModel("kimi")).toBe("moonshotai/kimi-k2");
  });
});

describe("thinking-model budgets", () => {
  it("classifies thinking models", () => {
    expect(isThinkingModel("kimi-k2.5")).toBe(true);
    expect(isThinkingModel("gpt-5.4-mini")).toBe(true);
    expect(isThinkingModel("gpt-4o-mini")).toBe(false);
    expect(isThinkingModel("claude-haiku-4-5")).toBe(false);
  });

  it("sizes budgets by model class", () => {
    expect(defaultMaxTokens("kimi-k2.5")).toBe(THINKING_MODEL_MAX_TOKENS);
    expect(defaultMaxTokens("claude-haiku-4-5")).toBe(DEFAULT_MAX_TOKENS);
  });
});
