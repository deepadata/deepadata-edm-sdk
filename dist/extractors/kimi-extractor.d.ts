/**
 * Kimi K2 Extractor
 * Uses MoonshotAI's Kimi K2 model via OpenAI-compatible API
 * Supports profile-aware extraction (essential/extended/full)
 */
import OpenAI from "openai";
import type { ExtractionInput, EdmProfile } from "../schema/types.js";
import { type ExtractorCallOptions, type LlmExtractionResult } from "./llm-extractor.js";
/**
 * Extract EDM fields from content using Kimi K2
 *
 * Model defaults via model-config: EXTRACTION_MODEL / KIMI_MODEL env, then
 * the module's fallback constant (OpenRouter-aware).
 */
export declare function extractWithKimi(client: OpenAI, input: ExtractionInput, model?: string, profile?: EdmProfile, options?: ExtractorCallOptions): Promise<LlmExtractionResult>;
/**
 * Create a Kimi client using MoonshotAI's direct API
 * Falls back to OpenRouter if direct API key is not available
 */
export declare function createKimiClient(apiKey?: string): OpenAI;
/**
 * Get the model ID Kimi extraction will use when no per-request model is
 * given. Delegates to model-config (env overrides + OpenRouter-aware
 * fallback).
 */
export declare function getKimiModelId(): string;
//# sourceMappingURL=kimi-extractor.d.ts.map