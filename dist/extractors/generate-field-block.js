/**
 * JSON-Schema → prompt field-block generator (ADR-0030, amended — Step 6).
 *
 * Reads the PUBLISHED edm-spec package (the source of truth, ADR-0030 amended)
 * rather than walking the SDK's own zod validator. The two extraction prompts
 * (Full in llm-extractor.ts; Extended/Essential in profile-prompts.ts) each
 * carry a hand-written JSON skeleton whose per-field `// CANONICAL:` / `// STRICT
 * ENUM:` comments enumerate the field vocabulary. This generator emits that
 * skeleton FROM the spec's JSON Schema fragments, so the vocabulary rendered in
 * each comment is the one the spec enforces — drift between prompt, validator,
 * and spec becomes impossible by construction.
 *
 * Phase A walked the local zod schema; this is the spec-sourced port. The OUTPUT
 * FORMAT is unchanged — byte-for-byte identical to what Phase A emitted (and
 * therefore to the hand-written skeletons it reproduces). Only the INPUT source
 * moved: zod nodes → edm-spec JSON Schema.
 *
 * Classification maps directly from JSON Schema to the kinds the prompt renders:
 *   - "x-edm-canonical": [...]  → canonical-enum (two-tier; free text accepted)
 *   - "enum": [...]             → strict-enum    (validator rejects non-members)
 *   - bare "type" string/number/boolean/array → free text / number / boolean / array
 *
 * Field MEMBERSHIP and ORDER per profile come from the composite profile schemas
 * (edm-spec/schema/edm.v0.8.{essential,extended,full}.schema.json): which
 * representational domains a profile includes, and — for inline domains — which
 * fields, in which order. This is the role the SDK's LlmEssential/LlmExtended/
 * LlmExtractedFields zod schemas used to play.
 *
 * Field DEFINITIONS (classification + canonical value lists) are always read from
 * the fragments, never from the composite's inline copies, so the canonical
 * vocabulary rendered in each comment is the one the fragment enforces.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const loadJson = (specPath) => JSON.parse(readFileSync(require.resolve(specPath), "utf8"));
// ---------------------------------------------------------------------------
// Profile / domain wiring
// ---------------------------------------------------------------------------
/** The LLM-extracted representational domains, in canonical (zod definition) order. */
const LLM_DOMAINS = ["core", "constellation", "milky_way", "gravity", "impulse"];
const FRAGMENT_SPEC = {
    core: "edm-spec/schema/fragments/core.json",
    constellation: "edm-spec/schema/fragments/constellation.json",
    milky_way: "edm-spec/schema/fragments/milky_way.json",
    gravity: "edm-spec/schema/fragments/gravity.json",
    impulse: "edm-spec/schema/fragments/impulse.json",
};
const COMPOSITE_SPEC = {
    essential: "edm-spec/schema/edm.v0.8.essential.schema.json",
    extended: "edm-spec/schema/edm.v0.8.extended.schema.json",
    full: "edm-spec/schema/edm.v0.8.full.schema.json",
};
const loadFragment = (domain) => loadJson(FRAGMENT_SPEC[domain]);
/**
 * experiential_stance is a top-level extraction-only field — never sealed into
 * the artifact body, so it appears in no fragment or composite schema. The SDK
 * carries it as ExperientialStanceSchema (z.enum). Mirror it here as a strict
 * enum so the generated block asks for it exactly as the current prompts do.
 */
const EXPERIENTIAL_STANCE_DEF = {
    enum: ["lived", "witnessed", "quoted_third_party", "assistant_generated", "hypothetical"],
};
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
export function classifyField(def) {
    const canonical = def["x-edm-canonical"];
    if (Array.isArray(canonical)) {
        return { kind: "canonical-enum", enumValues: canonical };
    }
    if (Array.isArray(def.enum)) {
        // JSON Schema enums carry a trailing `null` for nullable fields; zod models
        // nullability with `.nullable()` and keeps it out of the enum, so strip it.
        return { kind: "strict-enum", enumValues: def.enum.filter((v) => v !== null) };
    }
    const types = Array.isArray(def.type) ? def.type : [def.type];
    if (types.includes("number") || types.includes("integer"))
        return { kind: "number" };
    if (types.includes("boolean"))
        return { kind: "boolean" };
    if (types.includes("array"))
        return { kind: "string-array" };
    return { kind: "string" };
}
// ---------------------------------------------------------------------------
// Presentation layer (OUTPUT_CONTRACT — hand-written, §4)
//
// Canonical comment conventions follow the Full prompt (the richest of the
// three current skeletons): STRICT/CANONICAL prefixes with explicit suffixes
// and per-field prose guidance for free-text fields. Enum VALUES are NEVER in
// these tables — they come from the fragment.
// ---------------------------------------------------------------------------
const STRICT_SUFFIX = " (pick ONE or null)";
const CANONICAL_SUFFIX = " (free text accepted if none fits)";
/** Per-field suffix overrides for strict enums (keyed `domain.field`). */
const SUFFIX_OVERRIDE = {
    "constellation.narrative_archetype": " (pick ONE or null; lowercase)",
};
/** Extra prose appended after a canonical-enum comment. */
const CANONICAL_TRAILING = {
    "constellation.arc_type": ". gratitude = moments of thankfulness, appreciation, acknowledging blessing; authenticity = feeling fully oneself, self-alignment, identity congruence",
};
/** Prose guidance for non-enum (free text / number / boolean / array) fields. */
const GUIDANCE = {
    // core
    "core.anchor": 'central theme (e.g., "dad\'s toolbox", "nana\'s traditions")',
    "core.spark": 'what triggered the memory (e.g., "finding the cassette", "first snow")',
    "core.wound": "The specific vulnerability, loss, or pain present — NOT generic labels like 'loss' or 'grief' but what exactly was lost or why it hurts. Examples: 'unlived travel dream', 'war silence never spoken', 'father died before I knew him', 'shame of not fitting in'. If no wound is present, use null.",
    "core.fuel": 'what energized the experience (e.g., "shared laughter", "curiosity")',
    "core.bridge": 'connection between past and present (e.g., "replaying old tape", "returning to the porch")',
    "core.echo": 'what still resonates (e.g., "her laugh", "smell of oil", "city lights on water")',
    "core.narrative": "3–5 sentences. REQUIRED: include ALL of the following — ≥1 concrete sensory detail (sight, sound, smell, texture), ≥1 temporal cue that anchors the memory in time, ≥1 symbolic callback that connects past to present. Write from the subject's perspective. Do not compress or summarise — give the memory space to breathe. Faithful and specific. Never generic.",
    // constellation
    "constellation.emotion_subtone": "2–4 short words (e.g., bittersweet, grateful) — free text array",
    "constellation.higher_order_emotion": "free text: e.g., awe, forgiveness, pride, moral_elevation (or null)",
    "constellation.meta_emotional_state": "free text: e.g., acceptance, confusion, curiosity (or null)",
    "constellation.interpersonal_affect": "free text: e.g., warmth, openness, defensiveness (or null)",
    "constellation.symbolic_anchor": "concrete object/place/ritual (or null)",
    "constellation.identity_thread": "short sentence",
    "constellation.expressed_insight": "brief insight explicitly stated by subject (extracted, not inferred)",
    "constellation.transformational_pivot": "true if subject explicitly identifies this as life-changing",
    "constellation.somatic_signature": 'bodily sensations explicitly described (e.g., "chest tightness", "warmth spreading") or null',
    // milky_way
    "milky_way.event_type": "e.g., family gathering, farewell, birthday (or null)",
    "milky_way.location_context": "place from text or image (or null)",
    "milky_way.associated_people": "names or roles (proper case allowed)",
    "milky_way.tone_shift": "e.g., loss to gratitude (or null)",
    // gravity
    "gravity.emotional_weight": "0.0–1.0 (felt intensity IN THE MOMENT). Calibration: 0.9+ life-altering irreversible moments; 0.7-0.9 significant personal events with strong emotional response; 0.4-0.7 meaningful but routine emotional experiences; 0.1-0.4 mild passing emotional content",
    "gravity.gravity_type": "short phrase (e.g., symbolic resonance)",
    "gravity.recall_triggers": "sensory or symbolic cues (lowercase tokens)",
    "gravity.retrieval_keys": "compact hooks (3–6 tokens recommended)",
    "gravity.nearby_themes": "adjacent concepts",
    "gravity.strength_score": "0.0–1.0 (how BOUND/STUCK this memory is)",
    "gravity.resilience_markers": "1–3 (e.g., acceptance, optimism, continuity)",
    // impulse
    "impulse.primary_energy": "free text: e.g., curiosity, fear, compassion (or null; lowercase)",
    // top-level
    experiential_stance: "", // enum-driven; guidance unused
};
const PLACEHOLDER = {
    "strict-enum": '""',
    "canonical-enum": '""',
    string: '""',
    number: "0.0",
    boolean: "false",
    "string-array": "[]",
};
/** Build the `// ...` comment text for a field, or null if it has none. */
function commentFor(key, info) {
    if (info.kind === "strict-enum") {
        const suffix = SUFFIX_OVERRIDE[key] ?? STRICT_SUFFIX;
        return `STRICT ENUM: ${(info.enumValues ?? []).join(" | ")}${suffix}`;
    }
    if (info.kind === "canonical-enum") {
        const trailing = CANONICAL_TRAILING[key] ?? "";
        return `CANONICAL: ${(info.enumValues ?? []).join(" | ")}${CANONICAL_SUFFIX}${trailing}`;
    }
    const g = GUIDANCE[key];
    return g && g.length > 0 ? g : null;
}
/** Join lines, aligning each block's `//` to (max content length) + 1 space. */
function renderBlock(lines) {
    const maxLen = lines.reduce((m, l) => Math.max(m, l.content.length), 0);
    return lines.map((l) => {
        if (l.comment === null)
            return l.content;
        const pad = " ".repeat(maxLen - l.content.length + 1);
        return `${l.content}${pad}// ${l.comment}`;
    });
}
/**
 * Resolve a profile domain to its ordered `[fieldName, def]` pairs.
 * Field names/order: inline composite properties when present, else fragment
 * order. Field defs: always the fragment (source of truth), falling back to the
 * inline composite copy only if the fragment lacks the field.
 */
function domainFields(compositeProp, fragment) {
    const fragProps = fragment.properties ?? {};
    const inlineProps = compositeProp?.properties;
    const names = inlineProps ? Object.keys(inlineProps) : Object.keys(fragProps);
    return names.map((name) => [name, fragProps[name] ?? inlineProps?.[name] ?? {}]);
}
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
export function generateFieldBlock(profile) {
    const compositeSpec = COMPOSITE_SPEC[profile];
    if (!compositeSpec) {
        throw new Error(`unknown profile "${profile}" (expected one of: ${Object.keys(COMPOSITE_SPEC).join(", ")})`);
    }
    const composite = loadJson(compositeSpec);
    const props = composite.properties ?? {};
    // Representational domains present in this profile, in canonical order.
    const domains = LLM_DOMAINS.filter((d) => props[d]);
    // Top-level: the experiential_stance scalar renders first and inline; domains
    // render as nested blocks. (Mirrors the SDK's [...scalars, ...domains] order.)
    const topLevelCount = 1 + domains.length;
    let topIdx = 0;
    const out = ["{"];
    // experiential_stance (scalar)
    {
        const isLastTop = topIdx === topLevelCount - 1;
        const topComma = isLastTop ? "" : ",";
        const info = classifyField(EXPERIENTIAL_STANCE_DEF);
        const comment = commentFor("experiential_stance", info);
        const [rendered] = renderBlock([
            { content: `  "experiential_stance": ${PLACEHOLDER[info.kind]}${topComma}`, comment },
        ]);
        out.push(rendered);
        topIdx++;
    }
    for (const domain of domains) {
        const isLastTop = topIdx === topLevelCount - 1;
        const topComma = isLastTop ? "" : ",";
        const fragment = loadFragment(domain);
        const fields = domainFields(props[domain], fragment);
        out.push(`  "${domain}": {`);
        const lines = fields.map(([field, def], idx) => {
            const isLastField = idx === fields.length - 1;
            const comma = isLastField ? "" : ",";
            const info = classifyField(def);
            const comment = commentFor(`${domain}.${field}`, info);
            return { content: `    "${field}": ${PLACEHOLDER[info.kind]}${comma}`, comment };
        });
        out.push(...renderBlock(lines));
        out.push(`  }${topComma}`);
        topIdx++;
    }
    out.push("}");
    return out.join("\n");
}
//# sourceMappingURL=generate-field-block.js.map