/**
 * OpenAI Extractor
 * Uses OpenAI GPT models to extract emotional data from content
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import type { ExtractionInput, EdmProfile } from "../schema/types.js";
import { type LlmExtractionResult } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using OpenAI
 */
export declare function extractWithOpenAI(client: OpenAI, input: ExtractionInput, model?: string, temperature?: number, profile?: EdmProfile): Promise<LlmExtractionResult>;
/**
 * Create an OpenAI client
 */
export declare function createOpenAIClient(apiKey?: string): OpenAI;
//# sourceMappingURL=openai-extractor.d.ts.map