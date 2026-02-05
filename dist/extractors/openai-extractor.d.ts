/**
 * OpenAI Extractor for EDM v0.4.0
 * Uses OpenAI GPT models to extract emotional data from content
 * Shares system prompt and validation with the Anthropic extractor
 */
import OpenAI from "openai";
import type { ExtractionInput } from "../schema/types.js";
import { type LlmExtractionResult } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using OpenAI
 */
export declare function extractWithOpenAI(client: OpenAI, input: ExtractionInput, model?: string): Promise<LlmExtractionResult>;
/**
 * Create an OpenAI client
 */
export declare function createOpenAIClient(apiKey?: string): OpenAI;
//# sourceMappingURL=openai-extractor.d.ts.map