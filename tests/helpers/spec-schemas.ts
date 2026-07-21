/**
 * Shared test helper: ajv validators compiled from the INSTALLED `edm-spec`
 * package (ADR-0030 — the published spec is the source of truth).
 *
 * Replaces the vendored copies that used to live in
 * tests/fixtures/edm-v0.8.0/: a vendored schema is a restatement that
 * silently drifts (the vendored set had already drifted from the published
 * 0.8.x line). Loading the installed package means the conformance suites
 * always validate against exactly the spec version the SDK derives its
 * version stamp and vocabularies from.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { specCompositePath, specFragmentPath } from "../../src/schema/spec-truth.js";

const require = createRequire(import.meta.url);

const loadSpecJson = (specPath: string): unknown =>
  JSON.parse(readFileSync(require.resolve(specPath), "utf8"));

/**
 * Inline every fragment $ref (the composites reference fragments by URL;
 * the trailing `fragments/<name>.json` segment names the file inside the
 * installed package).
 */
export function resolveRefs(schema: unknown): unknown {
  if (typeof schema !== "object" || schema === null) return schema;
  const obj = schema as Record<string, unknown>;
  if (typeof obj["$ref"] === "string") {
    const ref = obj["$ref"];
    const m = ref.match(/fragments\/([a-z_]+\.json)/);
    if (m && m[1]) {
      return resolveRefs(loadSpecJson(specFragmentPath(m[1].replace(/\.json$/, ""))));
    }
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = Array.isArray(v) ? v.map(resolveRefs) : resolveRefs(v);
  }
  return out;
}

export type ProfileName = "essential" | "extended" | "full";

/** Compile ajv validators for the three canonical profile composites. */
export function compileProfileValidators(): Record<ProfileName, ValidateFunction> {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validators = {} as Record<ProfileName, ValidateFunction>;
  for (const profile of ["essential", "extended", "full"] as const) {
    validators[profile] = ajv.compile(resolveRefs(loadSpecJson(specCompositePath(profile))) as object);
  }
  return validators;
}

/** Load a canonical profile example artifact from the installed spec. */
export function loadSpecExample(profile: ProfileName): Record<string, unknown> {
  return loadSpecJson(`edm-spec/examples/example-${profile}-profile.json`) as Record<string, unknown>;
}
