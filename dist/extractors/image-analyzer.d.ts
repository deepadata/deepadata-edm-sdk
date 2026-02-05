/**
 * Image Context Analyzer for EDM v0.4.0
 * Extracts grounding context from images to supplement text extraction
 */
import Anthropic from "@anthropic-ai/sdk";
export interface ImageContext {
    /** Detected location or setting */
    location: string | null;
    /** Identified people or roles */
    people: string[];
    /** Symbolic objects or elements */
    symbols: string[];
    /** Event type detected */
    eventType: string | null;
    /** Temporal cues (era, season, time of day) */
    temporalCues: string | null;
    /** Overall emotional tone */
    emotionalTone: string | null;
}
/**
 * Analyze an image to extract grounding context
 */
export declare function analyzeImage(client: Anthropic, imageBase64: string, mediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp", model?: string): Promise<ImageContext>;
/**
 * Merge image context into extracted fields
 * Image provides grounding, text takes priority for interpretation
 */
export declare function mergeImageContext(extracted: {
    milky_way: {
        location_context: string | null;
        associated_people: string[];
        event_type: string | null;
    };
    constellation: {
        symbolic_anchor: string | null;
    };
}, imageContext: ImageContext): void;
//# sourceMappingURL=image-analyzer.d.ts.map