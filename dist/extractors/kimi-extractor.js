/**
 * Kimi K2 Extractor
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import { LlmExtractedFieldsSchema, LlmEssentialFieldsSchema, LlmExtendedFieldsSchema } from "../schema/edm-schema.js";
import { EXTRACTION_SYSTEM_PROMPT, } from "./llm-extractor.js";
/**
 * Get the appropriate schema for profile-specific validation
 */
function getProfileSchema(profile) {
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
 * Default Kimi K2 model identifier
 * MoonshotAI exposes this via their OpenAI-compatible endpoint
 */
const DEFAULT_KIMI_MODEL = "kimi-k2-0711-preview";
/**
 * Kimi API base URLs
 * - Direct: api.moonshot.cn or api.moonshot.ai (requires MOONSHOT_API_KEY or KIMI_API_KEY)
 * - OpenRouter: openrouter.ai (requires OPENROUTER_API_KEY)
 * Set MOONSHOT_BASE_URL env var to override the default
 */
const DEFAULT_KIMI_BASE_URL = "https://api.moonshot.cn/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_KIMI_MODEL = "moonshotai/kimi-k2";
/**
 * Extract EDM fields from content using Kimi K2
 */
export async function extractWithKimi(client, input, model = DEFAULT_KIMI_MODEL, profile = "full") {
    const userContent = [];
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
    // Select profile-specific prompt or use full extraction prompt
    const profilePrompt = getProfilePrompt(profile);
    const systemPrompt = profilePrompt || EXTRACTION_SYSTEM_PROMPT;
    const response = await client.chat.completions.create({
        model,
        max_tokens: 4096,
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
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    }
    catch {
        throw new Error(`Failed to parse Kimi response as JSON: ${text.slice(0, 200)}...`);
    }
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
    const confidence = calculateProfileConfidence(result.data, profile);
    return {
        extracted: result.data,
        confidence,
        model,
        profile,
        notes: null,
    };
}
/**
 * Create a Kimi client using MoonshotAI's direct API
 * Falls back to OpenRouter if direct API key is not available
 */
export function createKimiClient(apiKey) {
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
    throw new Error("Kimi API key is required. Set MOONSHOT_API_KEY, KIMI_API_KEY, or OPENROUTER_API_KEY environment variable.");
}
/**
 * Get the appropriate model ID based on which client is being used
 */
export function getKimiModelId() {
    // If using OpenRouter, use their model identifier
    if (process.env["OPENROUTER_API_KEY"] && !process.env["MOONSHOT_API_KEY"] && !process.env["KIMI_API_KEY"]) {
        return OPENROUTER_KIMI_MODEL;
    }
    return DEFAULT_KIMI_MODEL;
}
//# sourceMappingURL=kimi-extractor.js.map