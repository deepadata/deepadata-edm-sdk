/**
 * OpenAI Extractor for EDM v0.4.0
 * Uses OpenAI GPT models to extract emotional data from content
 * Shares system prompt and validation with the Anthropic extractor
 */
import OpenAI from "openai";
import { LlmExtractedFieldsSchema } from "../schema/edm-schema.js";
import { EXTRACTION_SYSTEM_PROMPT, calculateConfidence, } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using OpenAI
 */
export async function extractWithOpenAI(client, input, model = "gpt-4o") {
    const userContent = [];
    // Add text content
    if (input.text) {
        userContent.push({
            type: "text",
            text: input.text,
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
        throw new Error("No text response from OpenAI");
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
        throw new Error(`Failed to parse OpenAI response as JSON: ${text.slice(0, 200)}...`);
    }
    // Validate against schema
    const result = LlmExtractedFieldsSchema.safeParse(parsed);
    if (!result.success) {
        const errorDetails = result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
        throw new Error(`OpenAI response failed schema validation: ${errorDetails}`);
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