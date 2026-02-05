import type { Meta, Governance, Telemetry, System, Crosswalks, ExtractionMetadata, LlmExtractedFields } from "../schema/types.js";
export declare function createMeta(metadata: ExtractionMetadata, sourceType: Meta["source_type"]): Meta;
export declare function createGovernance(metadata: ExtractionMetadata): Governance;
export declare function createTelemetry(confidence: number, model: string, notes: string | null): Telemetry;
export declare function createSystem(): System;
export declare function createCrosswalks(extracted: LlmExtractedFields): Crosswalks;
export declare function detectSourceType(hasText: boolean, hasImage: boolean): Meta["source_type"];
//# sourceMappingURL=domain-extractors.d.ts.map