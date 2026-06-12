/**
 * Conversation input handling
 *
 * Chat transcripts are a first-class extraction input. Two production
 * defects motivated this module (archive-sample evidence run, 2026-06-10):
 *
 * 1. Feeding a flattened transcript to the extraction model without
 *    framing derails it into CONTINUING the conversation instead of
 *    classifying it. frameTranscript() wraps transcripts in explicit
 *    source-material framing; extractors apply it automatically when
 *    input.inputType === "conversation".
 *
 * 2. Long threads were head+tail truncated by callers, silently dropping
 *    the middle of exactly the threads worth extracting. chunkConversation()
 *    replaces truncation with full-coverage, turn-aligned chunks following
 *    the per_session chunking convention (one /v1/extract call per chunk,
 *    chunking_strategy: "per_session").
 */
export interface ConversationMessage {
    /** Speaker role; "user" is the subject, anything else is context */
    role: "user" | "assistant" | string;
    /** Message text (already stripped of tool noise by the caller's parser) */
    text: string;
}
export interface ConversationChunk {
    /** Flattened, role-labelled text for this chunk (unframed) */
    text: string;
    /** Chunk position within the conversation (0-based) */
    index: number;
    /** Inclusive [first, last] message indices covered by this chunk */
    turnRange: [number, number];
}
export interface ChunkConversationOptions {
    /**
     * Maximum characters per chunk. Default 48,000 — sized under the
     * platform's 50,000-character /v1/extract cap with framing headroom.
     */
    maxChars?: number;
}
export declare const DEFAULT_CHUNK_MAX_CHARS = 48000;
/**
 * Flatten a conversation into role-labelled text.
 * The USER label matters: extraction prompts anchor the subject to it.
 */
export declare function flattenConversation(messages: ConversationMessage[]): string;
/**
 * Wrap transcript text in source-material framing so the extraction model
 * classifies the conversation instead of replying to it. Applied
 * automatically by extractors when ExtractionInput.inputType === "conversation".
 */
export declare function frameTranscript(text: string): string;
/**
 * Split a conversation into full-coverage, turn-aligned chunks.
 *
 * Replaces head+tail truncation: every message lands in exactly one chunk,
 * chunks never split a message except when a single message alone exceeds
 * maxChars (then that message is hard-split). Callers extract each chunk
 * as its own artifact (chunking_strategy: "per_session"), threading them
 * via meta.parent_id if desired — see extractFromConversation.
 */
export declare function chunkConversation(messages: ConversationMessage[], options?: ChunkConversationOptions): ConversationChunk[];
//# sourceMappingURL=conversation.d.ts.map