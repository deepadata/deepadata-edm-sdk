export type FieldBlockProfile = "essential" | "extended" | "full";
interface JsonSchemaNode {
    type?: string | string[];
    enum?: (string | null)[];
    "x-edm-canonical"?: string[];
    properties?: Record<string, JsonSchemaNode>;
    $ref?: string;
    [k: string]: unknown;
}
export type FieldKind = "strict-enum" | "canonical-enum" | "string" | "number" | "boolean" | "string-array";
export interface FieldInfo {
    kind: FieldKind;
    /** Present for strict-enum / canonical-enum — read live from the fragment node. */
    enumValues?: readonly string[];
}
/**
 * Classify a JSON Schema field node into the kind the prompt comment renders.
 *
 * - "x-edm-canonical": [...]  → canonical-enum (two-tier free text)
 * - "enum": [...]             → strict-enum (null stripped)
 * - type number/integer       → number
 * - type boolean              → boolean
 * - type array                → string-array
 * - otherwise (string/null)   → free text
 */
export declare function classifyField(def: JsonSchemaNode): FieldInfo;
/**
 * Generate the JSON field-block skeleton for a profile, from the edm-spec JSON
 * Schema.
 *
 * Output shape (matches the current hand-written skeletons):
 *
 *   {
 *     "experiential_stance": "",  // STRICT ENUM: ...
 *     "core": {
 *       "anchor": "",  // central theme ...
 *       ...
 *     },
 *     ...
 *   }
 */
export declare function generateFieldBlock(profile: FieldBlockProfile): string;
export {};
//# sourceMappingURL=generate-field-block.d.ts.map