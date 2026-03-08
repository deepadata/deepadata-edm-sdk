/**
 * Kimi K2 Extractor for EDM v0.6.0
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import type { ExtractionInput, EdmProfile } from "../schema/types.js";
import { type LlmExtractionResult } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using Kimi K2
 */
export declare function extractWithKimi(client: OpenAI, input: ExtractionInput, model?: string, profile?: EdmProfile): Promise<LlmExtractionResult>;
/**
 * Create a Kimi client using MoonshotAI's direct API
 * Falls back to OpenRouter if direct API key is not available
 */
export declare function createKimiClient(apiKey?: string): OpenAI;
/**
 * Get the appropriate model ID based on which client is being used
 */
export declare function getKimiModelId(): string;
//# sourceMappingURL=kimi-extractor.d.ts.map