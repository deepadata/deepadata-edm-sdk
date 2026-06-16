/**
 * Zod → prompt field-block generator (ADR-0030, Consolidation Spec §4)
 *
 * The two extraction prompts (Full in llm-extractor.ts; Extended/Essential in
 * profile-prompts.ts) each carry a hand-written JSON skeleton whose per-field
 * `// CANONICAL: a | b | c` comments enumerate the field vocabulary. Those
 * lists are hand-kept in parallel with the zod validator, so they drift (the
 * `orphan`/`mentor` class of bug). This generator emits that skeleton FROM the
 * zod schema instead, so the enum rendered in the comment is the *same array
 * object* the validator enforces — drift becomes impossible by construction.
 *
 * Architectural rule (Consolidation Spec §3): zod is the mechanical canonical
 * source. The enum VALUES in every comment are read live from the zod node
 * (`classifyField` below), never hardcoded here. Only presentation that zod
 * does not carry — the prose guidance for free-text fields, the suffix wording,
 * the alignment — lives in this file's tables, and is the OUTPUT_CONTRACT layer
 * the spec keeps hand-written.
 *
 * Field MEMBERSHIP and ORDER per profile come from the profile's own LLM
 * extraction schema (LlmEssential/Extended/ExtractedFieldsSchema) — the exact
 * shapes the extractor validates against — so the generated block asks for
 * precisely the fields that profile extracts, in zod definition order.
 *
 * Phase A scope: this module only GENERATES the block. Wiring it into prompt
 * construction (replacing the hand-written skeletons) is Phase B.
 */
import { z } from "zod";
import {
  LlmEssentialFieldsSchema,
  LlmExtendedFieldsSchema,
  LlmExtractedFieldsSchema,
} from "../schema/edm-schema.js";

export type FieldBlockProfile = "essential" | "extended" | "full";

// ---------------------------------------------------------------------------
// Zod introspection — the canonical mechanism (§3 rule 3)
// ---------------------------------------------------------------------------

type ZodAny = z.ZodTypeAny & { _def: Record<string, unknown> };

/** Peel ZodNullable / ZodOptional / ZodDefault wrappers to the core node. */
function unwrap(node: z.ZodTypeAny): ZodAny {
  let n = node as ZodAny;
  while (
    n?._def &&
    (n._def["typeName"] === "ZodNullable" ||
      n._def["typeName"] === "ZodOptional" ||
      n._def["typeName"] === "ZodDefault")
  ) {
    n = (n._def["innerType"] as ZodAny);
  }
  return n;
}

function typeName(node: ZodAny): string {
  return node?._def?.["typeName"] as string;
}

function enumValues(node: ZodAny): readonly string[] {
  // z.enum exposes both `.options` and `._def.values`
  const opts = (node as unknown as { options?: readonly string[] }).options;
  if (opts) return opts;
  return (node._def["values"] as readonly string[]) ?? [];
}

export type FieldKind =
  | "strict-enum"
  | "canonical-enum"
  | "string"
  | "number"
  | "boolean"
  | "string-array";

export interface FieldInfo {
  kind: FieldKind;
  /** Present for strict-enum / canonical-enum — read live from the zod node. */
  enumValues?: readonly string[];
}

/**
 * Classify a zod field node into the kind the prompt comment renders.
 *
 * - z.union([z.enum([...]), z.string()])  → canonical-enum (two-tier free text)
 * - z.enum([...])                          → strict-enum
 * - z.string / z.number / z.boolean        → free text / number / boolean
 * - z.array(z.string())                    → string-array
 */
export function classifyField(node: z.ZodTypeAny): FieldInfo {
  const core = unwrap(node);
  const tn = typeName(core);

  if (tn === "ZodUnion") {
    const options = (core._def["options"] as z.ZodTypeAny[]) ?? [];
    for (const opt of options) {
      const u = unwrap(opt);
      if (typeName(u) === "ZodEnum") {
        return { kind: "canonical-enum", enumValues: enumValues(u) };
      }
    }
    // union without an enum option → treat as free text
    return { kind: "string" };
  }
  if (tn === "ZodEnum") return { kind: "strict-enum", enumValues: enumValues(core) };
  if (tn === "ZodNumber") return { kind: "number" };
  if (tn === "ZodBoolean") return { kind: "boolean" };
  if (tn === "ZodArray") {
    const el = unwrap(core._def["type"] as z.ZodTypeAny);
    if (typeName(el) === "ZodString") return { kind: "string-array" };
    return { kind: "string-array" };
  }
  return { kind: "string" };
}

// ---------------------------------------------------------------------------
// Presentation layer (OUTPUT_CONTRACT — hand-written, §4)
//
// Canonical comment conventions follow the Full prompt (the richest of the
// three current skeletons): STRICT/CANONICAL prefixes with explicit suffixes
// and per-field prose guidance for free-text fields. Enum VALUES are NEVER in
// these tables — they come from the zod node.
// ---------------------------------------------------------------------------

const STRICT_SUFFIX = " (pick ONE or null)";
const CANONICAL_SUFFIX = " (free text accepted if none fits)";

/** Per-field suffix overrides for strict enums (keyed `domain.field`). */
const SUFFIX_OVERRIDE: Record<string, string> = {
  "constellation.narrative_archetype": " (pick ONE or null; lowercase)",
};

/** Extra prose appended after a canonical-enum comment. */
const CANONICAL_TRAILING: Record<string, string> = {
  "constellation.arc_type":
    ". gratitude = moments of thankfulness, appreciation, acknowledging blessing; authenticity = feeling fully oneself, self-alignment, identity congruence",
};

/** Prose guidance for non-enum (free text / number / boolean / array) fields. */
const GUIDANCE: Record<string, string> = {
  // core
  "core.anchor": 'central theme (e.g., "dad\'s toolbox", "nana\'s traditions")',
  "core.spark": 'what triggered the memory (e.g., "finding the cassette", "first snow")',
  "core.wound":
    "The specific vulnerability, loss, or pain present — NOT generic labels like 'loss' or 'grief' but what exactly was lost or why it hurts. Examples: 'unlived travel dream', 'war silence never spoken', 'father died before I knew him', 'shame of not fitting in'. If no wound is present, use null.",
  "core.fuel": 'what energized the experience (e.g., "shared laughter", "curiosity")',
  "core.bridge":
    'connection between past and present (e.g., "replaying old tape", "returning to the porch")',
  "core.echo": 'what still resonates (e.g., "her laugh", "smell of oil", "city lights on water")',
  "core.narrative":
    "3–5 sentences. REQUIRED: include ALL of the following — ≥1 concrete sensory detail (sight, sound, smell, texture), ≥1 temporal cue that anchors the memory in time, ≥1 symbolic callback that connects past to present. Write from the subject's perspective. Do not compress or summarise — give the memory space to breathe. Faithful and specific. Never generic.",
  // constellation
  "constellation.emotion_subtone": "2–4 short words (e.g., bittersweet, grateful) — free text array",
  "constellation.higher_order_emotion": "free text: e.g., awe, forgiveness, pride, moral_elevation (or null)",
  "constellation.meta_emotional_state": "free text: e.g., acceptance, confusion, curiosity (or null)",
  "constellation.interpersonal_affect": "free text: e.g., warmth, openness, defensiveness (or null)",
  "constellation.symbolic_anchor": "concrete object/place/ritual (or null)",
  "constellation.identity_thread": "short sentence",
  "constellation.expressed_insight": "brief insight explicitly stated by subject (extracted, not inferred)",
  "constellation.transformational_pivot": "true if subject explicitly identifies this as life-changing",
  "constellation.somatic_signature":
    'bodily sensations explicitly described (e.g., "chest tightness", "warmth spreading") or null',
  // milky_way
  "milky_way.event_type": "e.g., family gathering, farewell, birthday (or null)",
  "milky_way.location_context": "place from text or image (or null)",
  "milky_way.associated_people": "names or roles (proper case allowed)",
  "milky_way.tone_shift": "e.g., loss to gratitude (or null)",
  // gravity
  "gravity.emotional_weight":
    "0.0–1.0 (felt intensity IN THE MOMENT). Calibration: 0.9+ life-altering irreversible moments; 0.7-0.9 significant personal events with strong emotional response; 0.4-0.7 meaningful but routine emotional experiences; 0.1-0.4 mild passing emotional content",
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

const PLACEHOLDER: Record<FieldKind, string> = {
  "strict-enum": '""',
  "canonical-enum": '""',
  string: '""',
  number: "0.0",
  boolean: "false",
  "string-array": "[]",
};

/** Build the `// ...` comment text for a field, or null if it has none. */
function commentFor(key: string, info: FieldInfo): string | null {
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

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

interface Line {
  /** code portion: `  "field": value,` (indent + key + placeholder + comma) */
  content: string;
  /** comment text without the leading `// `, or null */
  comment: string | null;
}

/** Join lines, aligning each block's `//` to (max content length) + 1 space. */
function renderBlock(lines: Line[]): string[] {
  const maxLen = lines.reduce((m, l) => Math.max(m, l.content.length), 0);
  return lines.map((l) => {
    if (l.comment === null) return l.content;
    const pad = " ".repeat(maxLen - l.content.length + 1);
    return `${l.content}${pad}// ${l.comment}`;
  });
}

const PROFILE_SCHEMA: Record<FieldBlockProfile, z.ZodObject<z.ZodRawShape>> = {
  essential: LlmEssentialFieldsSchema as unknown as z.ZodObject<z.ZodRawShape>,
  extended: LlmExtendedFieldsSchema as unknown as z.ZodObject<z.ZodRawShape>,
  full: LlmExtractedFieldsSchema as unknown as z.ZodObject<z.ZodRawShape>,
};

/**
 * Generate the JSON field-block skeleton for a profile, from the zod schema.
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
export function generateFieldBlock(profile: FieldBlockProfile): string {
  const schema = PROFILE_SCHEMA[profile];
  const shape = schema.shape as z.ZodRawShape;
  const entries = Object.entries(shape);

  // Top-level scalar keys (experiential_stance) render first and inline;
  // domain keys (ZodObject) render as nested blocks, in zod definition order.
  const scalars = entries.filter(([, node]) => typeName(unwrap(node)) !== "ZodObject");
  const domains = entries.filter(([, node]) => typeName(unwrap(node)) === "ZodObject");
  const topLevel = [...scalars, ...domains];

  const out: string[] = ["{"];

  topLevel.forEach(([key, node], topIdx) => {
    const isLastTop = topIdx === topLevel.length - 1;
    const topComma = isLastTop ? "" : ",";

    if (typeName(unwrap(node)) !== "ZodObject") {
      // scalar top-level field (experiential_stance)
      const info = classifyField(node);
      const comment = commentFor(key, info);
      const [rendered] = renderBlock([
        { content: `  "${key}": ${PLACEHOLDER[info.kind]}${topComma}`, comment },
      ]);
      out.push(rendered as string);
      return;
    }

    // domain block
    out.push(`  "${key}": {`);
    const domainShape = (unwrap(node) as unknown as z.ZodObject<z.ZodRawShape>).shape;
    const fields = Object.entries(domainShape);
    const lines: Line[] = fields.map(([field, fnode], idx) => {
      const isLastField = idx === fields.length - 1;
      const comma = isLastField ? "" : ",";
      const info = classifyField(fnode);
      const comment = commentFor(`${key}.${field}`, info);
      return { content: `    "${field}": ${PLACEHOLDER[info.kind]}${comma}`, comment };
    });
    out.push(...renderBlock(lines));
    out.push(`  }${topComma}`);
  });

  out.push("}");
  return out.join("\n");
}
