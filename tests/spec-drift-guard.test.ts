/**
 * SPEC DRIFT GUARD (tidy-the-house commitment; ADR-0030, amended).
 *
 * The SDK keeps three literal restatements of the published edm-spec —
 * kept literal because their literal-union TypeScript types are public
 * API, which runtime derivation would collapse to string:
 *
 *   1. the zod schema surface (src/schema/edm-schema.ts)
 *   2. the profile field manifests (src/assembler.ts)
 *   3. the convenience enum constants (src/schema/types.ts)
 *
 * This suite loads the INSTALLED `edm-spec` package (composites +
 * fragments) and asserts each restatement matches the spec EXACTLY, in
 * BOTH directions (no missing values, no extra values). It is wired into
 * `npm test`; restatement drift fails loudly here before it can ship.
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  MetaSchema,
  ConstellationSchema,
  ConstellationEssentialSchema,
  MilkyWaySchema,
  GravitySchema,
  GravityExtendedSchema,
  ImpulseSchema,
  GovernanceSchema,
  RetentionPolicySchema,
  TelemetrySchema,
} from "../src/schema/edm-schema.js";
import {
  EMOTION_PRIMARY,
  NARRATIVE_ARC,
  RELATIONAL_DYNAMICS,
  TEMPORAL_CONTEXT,
  MEMORY_TYPE,
  NARRATIVE_ARCHETYPE,
  DRIVE_STATE,
  MOTIVATIONAL_ORIENTATION,
} from "../src/schema/types.js";
import {
  ESSENTIAL_PROFILE_FIELDS,
  EXTENDED_PROFILE_FIELDS,
  FULL_PROFILE_FIELDS,
} from "../src/assembler.js";
import {
  specProfileShape,
  specVocabOf,
  specNestedVocabOf,
} from "../src/schema/spec-truth.js";

// ---------------------------------------------------------------------------
// zod introspection: pull the literal enum options out of a field schema,
// unwrapping nullable/optional/default wrappers and unions (the two-tier
// canonical fields are z.union([z.enum([...]), z.string()])).
// ---------------------------------------------------------------------------
function zodEnumOptions(schema: z.ZodTypeAny): string[] {
  const def = schema._def as Record<string, unknown>;
  const typeName = def.typeName as string;
  switch (typeName) {
    case "ZodEnum":
      return [...(def.values as string[])];
    case "ZodNullable":
    case "ZodOptional":
    case "ZodDefault":
      return zodEnumOptions(def.innerType as z.ZodTypeAny);
    case "ZodUnion": {
      for (const option of def.options as z.ZodTypeAny[]) {
        const found = zodEnumOptions(option);
        if (found.length > 0) return found;
      }
      return [];
    }
    case "ZodArray":
      return zodEnumOptions(def.type as z.ZodTypeAny);
    default:
      return [];
  }
}

function fieldSchema(domain: z.ZodObject<z.ZodRawShape>, field: string): z.ZodTypeAny {
  const s = domain.shape[field];
  if (!s) throw new Error(`zod shape has no field "${field}"`);
  return s;
}

const sorted = (xs: readonly string[]) => [...xs].sort();

// ---------------------------------------------------------------------------
// 1. Zod enum surface ↔ spec fragment vocabularies (both directions)
// ---------------------------------------------------------------------------
const ZOD_ENUM_FIELDS: Array<[string, z.ZodObject<z.ZodRawShape>, string]> = [
  // [spec field name, zod domain schema, zod field name]
  ["visibility", MetaSchema as never, "visibility"],
  ["pii_tier", MetaSchema as never, "pii_tier"],
  ["source_type", MetaSchema as never, "source_type"],
  ["consent_basis", MetaSchema as never, "consent_basis"],
  ["profile", MetaSchema as never, "profile"],
  ["emotion_primary", ConstellationSchema as never, "emotion_primary"],
  ["narrative_arc", ConstellationSchema as never, "narrative_arc"],
  ["relational_dynamics", ConstellationSchema as never, "relational_dynamics"],
  ["temporal_context", ConstellationSchema as never, "temporal_context"],
  ["memory_type", ConstellationSchema as never, "memory_type"],
  ["media_format", ConstellationSchema as never, "media_format"],
  ["narrative_archetype", ConstellationSchema as never, "narrative_archetype"],
  ["relational_perspective", ConstellationSchema as never, "relational_perspective"],
  ["temporal_rhythm", ConstellationSchema as never, "temporal_rhythm"],
  ["arc_type", ConstellationSchema as never, "arc_type"],
  ["visibility_context", MilkyWaySchema as never, "visibility_context"],
  ["emotional_density", GravitySchema as never, "emotional_density"],
  ["valence", GravitySchema as never, "valence"],
  ["viscosity", GravitySchema as never, "viscosity"],
  ["tether_type", GravitySchema as never, "tether_type"],
  ["recurrence_pattern", GravitySchema as never, "recurrence_pattern"],
  ["temporal_decay", GravitySchema as never, "temporal_decay"],
  ["adaptation_trajectory", GravitySchema as never, "adaptation_trajectory"],
  ["drive_state", ImpulseSchema as never, "drive_state"],
  ["motivational_orientation", ImpulseSchema as never, "motivational_orientation"],
  ["temporal_focus", ImpulseSchema as never, "temporal_focus"],
  ["directionality", ImpulseSchema as never, "directionality"],
  ["social_visibility", ImpulseSchema as never, "social_visibility"],
  ["urgency", ImpulseSchema as never, "urgency"],
  ["risk_posture", ImpulseSchema as never, "risk_posture"],
  ["agency_level", ImpulseSchema as never, "agency_level"],
  ["regulation_state", ImpulseSchema as never, "regulation_state"],
  ["attachment_style", ImpulseSchema as never, "attachment_style"],
  ["coping_style", ImpulseSchema as never, "coping_style"],
  ["jurisdiction", GovernanceSchema as never, "jurisdiction"],
  ["exportability", GovernanceSchema as never, "exportability"],
  ["extraction_provider", TelemetrySchema as never, "extraction_provider"],
];

describe("drift guard: zod enums ↔ spec fragment vocabularies", () => {
  for (const [specField, domainSchema, zodField] of ZOD_ENUM_FIELDS) {
    it(`${zodField} matches spec vocabulary exactly (both directions)`, () => {
      const zodValues = zodEnumOptions(fieldSchema(domainSchema, zodField));
      expect(zodValues.length, `zod ${zodField} has no enum options`).toBeGreaterThan(0);
      expect(sorted(zodValues)).toEqual(sorted(specVocabOf(specField)));
    });
  }

  it("retention_policy nested enums match the spec", () => {
    expect(sorted(zodEnumOptions(fieldSchema(RetentionPolicySchema as never, "basis"))))
      .toEqual(sorted(specNestedVocabOf("governance", "retention_policy", "basis")));
    expect(sorted(zodEnumOptions(fieldSchema(RetentionPolicySchema as never, "on_expiry"))))
      .toEqual(sorted(specNestedVocabOf("governance", "retention_policy", "on_expiry")));
  });

  it("profile-specific LLM sub-schemas restate the same vocabularies", () => {
    expect(sorted(zodEnumOptions(fieldSchema(ConstellationEssentialSchema as never, "emotion_primary"))))
      .toEqual(sorted(specVocabOf("emotion_primary")));
    expect(sorted(zodEnumOptions(fieldSchema(ConstellationEssentialSchema as never, "narrative_arc"))))
      .toEqual(sorted(specVocabOf("narrative_arc")));
    for (const f of ["valence", "tether_type", "recurrence_pattern"] as const) {
      expect(sorted(zodEnumOptions(fieldSchema(GravityExtendedSchema as never, f))))
        .toEqual(sorted(specVocabOf(f)));
    }
  });

  it("governance.policy_labels stays a free string array (spec defines no vocabulary)", () => {
    // If the spec ever ADDS a vocabulary here, this fails and the zod
    // field must be re-tightened to match.
    expect(() => specVocabOf("policy_labels")).toThrow(/neither an enum nor an x-edm-canonical/);
    expect(zodEnumOptions(fieldSchema(GovernanceSchema as never, "policy_labels"))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Convenience constants (types.ts) ↔ spec vocabularies
// ---------------------------------------------------------------------------
describe("drift guard: types.ts convenience constants ↔ spec vocabularies", () => {
  const CASES: Array<[string, readonly string[]]> = [
    ["emotion_primary", EMOTION_PRIMARY],
    ["narrative_arc", NARRATIVE_ARC],
    ["relational_dynamics", RELATIONAL_DYNAMICS],
    ["temporal_context", TEMPORAL_CONTEXT],
    ["memory_type", MEMORY_TYPE],
    ["narrative_archetype", NARRATIVE_ARCHETYPE],
    ["drive_state", DRIVE_STATE],
    ["motivational_orientation", MOTIVATIONAL_ORIENTATION],
  ];
  for (const [specField, constant] of CASES) {
    it(`${specField} constant matches spec vocabulary exactly (both directions)`, () => {
      expect(sorted(constant)).toEqual(sorted(specVocabOf(specField)));
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Profile manifests (assembler.ts) ↔ spec composite property sets
// ---------------------------------------------------------------------------
describe("drift guard: profile manifests ↔ spec composites", () => {
  const MANIFESTS = {
    essential: ESSENTIAL_PROFILE_FIELDS,
    extended: EXTENDED_PROFILE_FIELDS,
    full: FULL_PROFILE_FIELDS,
  } as const;

  for (const profile of ["essential", "extended", "full"] as const) {
    it(`${profile} manifest domains and field sets equal the composite's (both directions)`, () => {
      const manifest = MANIFESTS[profile] as Record<string, readonly string[]>;
      const shape = specProfileShape(profile);

      expect(sorted(Object.keys(manifest))).toEqual(sorted(shape.domains));
      for (const domain of shape.domains) {
        expect(
          sorted(manifest[domain] ?? []),
          `field set mismatch in ${profile}.${domain}`
        ).toEqual(sorted(shape.fields[domain] ?? []));
      }
    });

    it(`${profile}: every spec-required field is in the manifest`, () => {
      const manifest = MANIFESTS[profile] as Record<string, readonly string[]>;
      const shape = specProfileShape(profile);
      for (const domain of shape.domains) {
        for (const required of shape.requiredFields[domain] ?? []) {
          expect(manifest[domain], `${profile}.${domain}.${required}`).toContain(required);
        }
      }
    });
  }
});
