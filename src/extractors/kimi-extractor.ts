/**
 * Kimi K2 Extractor
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions.js";
import type { LlmExtractedFields, ExtractionInput, EdmProfile } from "../schema/types.js";
import { LlmExtractedFieldsSchema, LlmEssentialFieldsSchema, LlmExtendedFieldsSchema } from "../schema/edm-schema.js";
import {
  EXTRACTION_SYSTEM_PROMPT,
  defaultMaxTokens,
  prepareInputText,
  type ExtractorCallOptions,
  type LlmExtractionResult,
} from "./llm-extractor.js";
import { sanitizeLlmOutput } from "./output-sanitizer.js";
import { resolveExtractionModel } from "../model-config.js";

/**
 * Get the appropriate schema for profile-specific validation
 */
function getProfileSchema(profile: EdmProfile) {
  switch (profile) {
    case "essential":
      return LlmEssentialFieldsSchema;
    case "extended":
      return LlmExtendedFieldsSchema;
    case "full":
    default:
      return LlmExtractedFieldsSchema;
  }
}
import { getProfilePrompt, calculateProfileConfidence } from "./profile-prompts.js";

/**
 * Kimi API base URLs
 * - Direct: api.moonshot.cn or api.moonshot.ai (requires MOONSHOT_API_KEY or KIMI_API_KEY)
 * - OpenRouter: openrouter.ai (requires OPENROUTER_API_KEY)
 * Set MOONSHOT_BASE_URL env var to override the default
 * Model ids (including the OpenRouter-prefixed Kimi id) live in model-config.
 */
const DEFAULT_KIMI_BASE_URL = "https://api.moonshot.cn/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Extract EDM fields from content using Kimi K2
 *
 * Model defaults via model-config: EXTRACTION_MODEL / KIMI_MODEL env, then
 * the module's fallback constant (OpenRouter-aware).
 */
export async function extractWithKimi(
  client: OpenAI,
  input: ExtractionInput,
  model?: string,
  profile: EdmProfile = "full",
  options: ExtractorCallOptions = {}
): Promise<LlmExtractionResult> {
  const resolvedModel = resolveExtractionModel("kimi", model);
  const userContent: ChatCompletionContentPart[] = [];

  // Add text content (conversation inputs get source-material framing)
  const text = prepareInputText(input);
  if (text) {
    userContent.push({
      type: "text",
      text,
    });
  }

  // Add image if provided (OpenAI-compatible format)
  if (input.image) {
    const mediaType = input.imageMediaType ?? "image/jpeg";
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:${mediaType};base64,${input.image}`,
      },
    });
  }

  // Select profile-specific prompt or use full extraction prompt
  const profilePrompt = getProfilePrompt(profile);
  const systemPrompt = profilePrompt || EXTRACTION_SYSTEM_PROMPT;

  const response = await client.chat.completions.create({
    model: resolvedModel,
    max_tokens: options.maxTokens ?? defaultMaxTokens(resolvedModel),
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  // Extract text response
  const responseText = response.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error("No text response from Kimi K2");
  }

  // Parse JSON response (strip markdown code fences if present)
  let jsonText = responseText.trim();
  const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch?.[1]) {
    jsonText = fenceMatch[1].trim();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse Kimi response as JSON: ${responseText.slice(0, 200)}...`);
  }

  // Sanitize before validation: clamp array caps, coerce invalid
  // strict-enum values to null (prefer a null field over a dropped artifact)
  sanitizeLlmOutput(parsed);

  // Validate against profile-specific schema
  const schema = getProfileSchema(profile);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Kimi response failed schema validation: ${errorDetails}`);
  }

  // Calculate profile-aware confidence
  const confidence = calculateProfileConfidence(
    result.data as unknown as Record<string, Record<string, unknown>>,
    profile
  );

  return {
    extracted: result.data as LlmExtractedFields,
    confidence,
    model: resolvedModel,
    profile,
    notes: null,
  };
}

/**
 * Create a Kimi client using MoonshotAI's direct API
 * Falls back to OpenRouter if direct API key is not available
 */
export function createKimiClient(apiKey?: string): OpenAI {
  // Try direct MoonshotAI API first
  const directKey = apiKey ?? process.env["MOONSHOT_API_KEY"] ?? process.env["KIMI_API_KEY"];
  if (directKey) {
    const baseURL = process.env["MOONSHOT_BASE_URL"] ?? DEFAULT_KIMI_BASE_URL;
    return new OpenAI({
      apiKey: directKey,
      baseURL,
    });
  }

  // Fall back to OpenRouter
  const openRouterKey = process.env["OPENROUTER_API_KEY"];
  if (openRouterKey) {
    return new OpenAI({
      apiKey: openRouterKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "https://deepadata.com",
        "X-Title": "DeepaData EDM Extraction",
      },
    });
  }

  throw new Error(
    "Kimi API key is required. Set MOONSHOT_API_KEY, KIMI_API_KEY, or OPENROUTER_API_KEY environment variable."
  );
}

/**
 * Get the model ID Kimi extraction will use when no per-request model is
 * given. Delegates to model-config (env overrides + OpenRouter-aware
 * fallback).
 */
export function getKimiModelId(): string {
  return resolveExtractionModel("kimi");
}
