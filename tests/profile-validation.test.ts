/**
 * Profile-aware validateEDM (defect fix, 2026-07-22).
 *
 * validateEDM used to value-check essential/extended domains against the
 * FULL domain zod schemas, whose required keys (meta.source_type,
 * core.narrative, governance.exportability, telemetry.extraction_notes)
 * do not exist at those profiles — an essential artifact could never
 * pass, and the platform had to route around the SDK. This suite proves
 * the SDK now validates against the DECLARED profile's surface:
 *
 *   - the spec's own canonical example artifacts (installed edm-spec
 *     package) validate for all three profiles
 *   - structurally broken and value-broken artifacts still fail
 *   - partner profiles skip completeness (ADR-0012) but fail on
 *     malformed canonical values
 */
import { describe, it, expect } from "vitest";
import { validateEDM, validateEDMWithProfile, validateProfileConformance } from "../src/validator.js";
import { createEmptyArtifact } from "../src/assembler.js";
import { EDM_SCHEMA_VERSION } from "../src/version.js";
import { loadSpecExample } from "./helpers/spec-schemas.js";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe("validateEDM — spec examples validate per declared profile", () => {
  for (const profile of ["essential", "extended", "full"] as const) {
    it(`the spec ${profile} example artifact is valid`, () => {
      const example = loadSpecExample(profile);
      const result = validateEDM(example);
      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    });
  }

  it("the spec examples stamp the derived EDM_SCHEMA_VERSION", () => {
    for (const profile of ["essential", "extended", "full"] as const) {
      const meta = loadSpecExample(profile).meta as { version: string };
      expect(meta.version).toBe(EDM_SCHEMA_VERSION);
    }
  });
});

describe("validateEDM — broken artifacts still fail", () => {
  it("essential with an out-of-profile domain fails (extra_domain)", () => {
    const bad = loadSpecExample("essential");
    bad.impulse = { drive_state: "explore" };
    const result = validateEDM(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "extra_domain" && e.path === "impulse")).toBe(true);
  });

  it("essential with an out-of-profile field fails (extra_field)", () => {
    const bad = loadSpecExample("essential");
    (bad.core as Record<string, unknown>).narrative = "not allowed at essential";
    const result = validateEDM(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "extra_field" && e.path === "core.narrative")).toBe(true);
  });

  it("essential missing a spec-required field fails (missing_field)", () => {
    const bad = loadSpecExample("essential");
    delete (bad.core as Record<string, unknown>).echo;
    const result = validateEDM(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_field" && e.path === "core.echo")).toBe(true);
  });

  it("essential omitting a spec-OPTIONAL field still validates (spec required-ness, not manifest)", () => {
    const ok = loadSpecExample("essential");
    delete (ok.governance as Record<string, unknown>).jurisdiction; // required -> fails
    const missingRequired = validateEDM(ok);
    expect(missingRequired.valid).toBe(false);

    const ok2 = loadSpecExample("essential");
    delete (ok2.telemetry as Record<string, unknown>).extraction_provider; // optional -> passes
    expect(validateEDM(ok2).valid).toBe(true);
  });

  it("essential with a malformed value fails via the profile-narrowed zod surface", () => {
    const bad = loadSpecExample("essential");
    (bad.constellation as Record<string, unknown>).emotion_subtone = "not-an-array";
    const result = validateEDM(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.startsWith("constellation.emotion_subtone"))).toBe(true);
  });

  it("extended with an out-of-range value fails", () => {
    const bad = loadSpecExample("extended");
    (bad.gravity as Record<string, unknown>).emotional_weight = 2.0;
    const result = validateEDM(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.startsWith("gravity.emotional_weight"))).toBe(true);
  });

  it("full artifact from createEmptyArtifact remains valid", () => {
    const artifact = createEmptyArtifact();
    artifact.gravity.resilience_markers = ["hope"];
    const result = validateEDM(artifact);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateEDM — partner profiles", () => {
  it("skips structural completeness but validates canonical values", () => {
    const artifact = loadSpecExample("extended");
    (artifact.meta as Record<string, unknown>).profile = "partner:com.deepadata.journaling.v1";
    expect(validateEDM(artifact).valid).toBe(true);

    const conformance = validateProfileConformance(artifact);
    expect(conformance.conformant).toBe(true);
    expect(conformance.warnings?.[0]?.type).toBe("partner_profile");

    (artifact.gravity as Record<string, unknown>).emotional_weight = "very heavy";
    const result = validateEDM(artifact);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.startsWith("gravity.emotional_weight"))).toBe(true);
  });
});

describe("validateEDMWithProfile", () => {
  it("reports the declared profile alongside validity", () => {
    const example = loadSpecExample("essential");
    const result = validateEDMWithProfile(example);
    expect(result.valid).toBe(true);
    expect(result.profileResult.profile).toBe("essential");
  });
});
