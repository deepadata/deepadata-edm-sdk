/**
 * Kimi K2 Extractor for EDM v0.4.0
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Shares system prompt and validation with other extractors
 */
import OpenAI from "openai";
import type { ExtractionInput } from "../schema/types.js";
import { type LlmExtractionResult } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using Kimi K2
 */
export declare function extractWithKimi(client: OpenAI, input: ExtractionInput, model?: string): Promise<LlmExtractionResult>;
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