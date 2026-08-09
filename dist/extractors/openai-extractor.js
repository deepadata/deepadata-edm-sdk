/**
 * OpenAI Extractor
 * Uses OpenAI GPT models to extract emotional data from content
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import { EXTRACTION_SYSTEM_PROMPT, defaultMaxTokens, prepareInputText, getProfileSchema, } from "./llm-extractor.js";
import { getProfilePrompt, calculateProfileConfidence } from "./profile-prompts.js";
import { sanitizeLlmOutput } from "./output-sanitizer.js";
import { parseLlmJson } from "./json-recovery.js";
import { resolveExtractionModel, usesMaxCompletionTokens } from "../model-config.js";
/**
 * Extract EDM fields from content using OpenAI
 *
 * Model defaults via model-config: EXTRACTION_MODEL / OPENAI_MODEL env,
 * then the module's fallback constant.
 */
export async function extractWithOpenAI(client, input, model, temperature = 0, profile = "full", options = {}) {
    const resolvedModel = resolveExtractionModel("openai", model);
    const userContent = [];
    // Add text content (conversation inputs get source-material framing)
    const inputText = prepareInputText(input);
    if (inputText) {
        userContent.push({
            type: "text",
            text: inputText,
        });
    }
    // Add image if provided (OpenAI uses image_url with data URI)
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
    const params = {
        model: resolvedModel,
        response_format: { type: "json_object" },
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
    };
    const outputBudget = options.maxTokens ?? defaultMaxTokens(resolvedModel);
    if (usesMaxCompletionTokens(resolvedModel)) {
        // gpt-5.x-class / o-series: max_tokens is a hard 400; only the default
        // temperature is accepted, so no override is sent.
        params.max_completion_tokens = outputBudget;
    }
    else {
        params.max_tokens = outputBudget;
        params.temperature = temperature;
    }
    const response = await client.chat.completions.create(params);
    // Extract text response
    const text = response.choices[0]?.message?.content;
    if (!text) {
        throw new Error("No text response from OpenAI");
    }
    // Parse JSON response — tolerant of markdown fencing (F1, 0.8.15)
    let parsed;
    try {
        parsed = parseLlmJson(text);
    }
    catch {
        throw new Error(`Failed to parse OpenAI response as JSON: ${text.slice(0, 200)}...`);
    }
    // Sanitize before validation: clamp array caps, coerce invalid
    // strict-enum values to null (prefer a null field over a dropped artifact)
    sanitizeLlmOutput(parsed);
    // Validate against profile-specific schema (0.8.14 fix: light profiles
    // used to be checked against full-schema field requirements and always
    // failed with "Required" errors for fields they don't prompt for)
    const schema = getProfileSchema(profile);
    const result = schema.safeParse(parsed);
    if (!result.success) {
        const errorDetails = result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
        throw new Error(`OpenAI response failed schema validation: ${errorDetails}`);
    }
    // Calculate profile-aware confidence
    const confidence = calculateProfileConfidence(result.data, profile);
    return {
        extracted: result.data,
        confidence,
        model: resolvedModel,
        profile,
        notes: null,
    };
}
/**
 * Create an OpenAI client
 */
export function createOpenAIClient(apiKey) {
    const key = apiKey ?? process.env["OPENAI_API_KEY"];
    if (!key) {
        throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey directly.");
    }
    return new OpenAI({ apiKey: key });
}
//# sourceMappingURL=openai-extractor.js.map