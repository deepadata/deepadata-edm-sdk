/**
 * EDM Artifact Assembler v0.6.0
 * Combines LLM-extracted fields with metadata to create complete artifacts
 * Supports profile-aware extraction (essential/extended/full)
 */
import Anthropic from "@anthropic-ai/sdk";
import type { EdmArtifact, ExtractionOptions, LlmExtractedFields, EdmProfile } from "./schema/types.js";
/**
 * Extract a complete EDM artifact from content
 *
 * @param options - Extraction options including profile
 * @returns Complete EDM artifact
 */
export declare function extractFromContent(options: ExtractionOptions): Promise<EdmArtifact>;
/**
 * Extract from content with a provided Anthropic client
 */
export declare function extractFromContentWithClient(client: Anthropic, options: ExtractionOptions): Promise<EdmArtifact>;
interface AssemblyContext {
    confidence: number;
    model: string;
    profile: EdmProfile;
    provider?: 'anthropic' | 'openai' | 'kimi';
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