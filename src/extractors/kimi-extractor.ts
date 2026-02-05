/**
 * Kimi K2 Extractor for EDM v0.4.0
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Shares system prompt and validation with other extractors
 */
import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions.js";
import type { LlmExtractedFields, ExtractionInput } from "../schema/types.js";
import { LlmExtractedFieldsSchema } from "../schema/edm-schema.js";
import {
  EXTRACTION_SYSTEM_PROMPT,
  calculateConfidence,
  type LlmExtractionResult,
} from "./llm-extractor.js";

/**
 * Default Kimi K2 model identifier
 * MoonshotAI exposes this via their OpenAI-compatible endpoint
 */
const DEFAULT_KIMI_MODEL = "kimi-k2-0711-preview";

/**
 * Kimi API base URLs
 * - Direct: api.moonshot.cn (requires MOONSHOT_API_KEY or KIMI_API_KEY)
 * - OpenRouter: openrouter.ai (requires OPENROUTER_API_KEY)
 */
const KIMI_BASE_URL = "https://api.moonshot.cn/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_KIMI_MODEL = "moonshotai/kimi-k2";

/**
 * Extract EDM fields from content using Kimi K2
 */
export async function extractWithKimi(
  client: OpenAI,
  input: ExtractionInput,
  model: string = DEFAULT_KIMI_MODEL
): Promise<LlmExtractionResult> {
  const userContent: ChatCompletionContentPart[] = [];

  // Add text content
  if (input.text) {
    userContent.push({
      type: "text",
      text: input.text,
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

  const response = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: EXTRACTION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  // Extract text response
  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No text response from Kimi K2");
  }

  // Parse JSON response (strip markdown code fences if present)
  let jsonText = text.trim();
  const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch?.[1]) {
    jsonText = fenceMatch[1].trim();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse Kimi response as JSON: ${text.slice(0, 200)}...`);
  }

  // Validate against schema
  const result = LlmExtractedFieldsSchema.safeParse(parsed);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Kimi response failed schema validation: ${errorDetails}`);
  }

  // Calculate confidence based on field population
  const confidence = calculateConfidence(result.data);

  return {
    extracted: result.data,
    confidence,
    model,
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
    return new OpenAI({
      apiKey: directKey,
      baseURL: KIMI_BASE_URL,
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
 * Get the appropriate model ID based on which client is being used
 */
export function getKimiModelId(): string {
  // If using OpenRouter, use their model identifier
  if (process.env["OPENROUTER_API_KEY"] && !process.env["MOONSHOT_API_KEY"] && !process.env["KIMI_API_KEY"]) {
    return OPENROUTER_KIMI_MODEL;
  }
  return DEFAULT_KIMI_MODEL;
}
