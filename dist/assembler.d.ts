/**
 * EDM Artifact Assembler
 * Combines LLM-extracted fields with metadata to create complete artifacts
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EdmArtifact, ExtractionOptions, LlmExtractedFields } from "./schema/types.js";
/**
 * Extract a complete EDM artifact from content
 */
export declare function extractFromContent(options: ExtractionOptions): Promise<EdmArtifact>;
/**
 * Extract from content with a provided Anthropic client
 */
export declare function extractFromContentWithClient(client: Anthropic, options: ExtractionOptions): Promise<EdmArtifact>;
interface AssemblyContext {
    confidence: number;
    model: string;
    notes: string | null;
    hasText: boolean;
    hasImage: boolean;
}
/**
 * Assemble a complete EDM artifact from extracted fields and metadata
 */
export declare function assembleArtifact(extracted: LlmExtractedFields, metadata: ExtractionOptions["metadata"], context: AssemblyContext): EdmArtifact;
/**
 * Create an empty EDM artifact structure (for manual population)
 */
export declare function createEmptyArtifact(): EdmArtifact;
export {};
//# sourceMappingURL=assembler.d.ts.map