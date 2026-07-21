/**
 * Spec truth loader (ADR-0030, amended).
 *
 * Reads the INSTALLED `edm-spec` package — composite profile schemas and
 * domain fragments — and derives, at runtime:
 *
 *   - which domains a profile contains, and which are required
 *     (composite top-level `properties` / `required`)
 *   - which fields belong to each domain of a profile, and which are
 *     required (inline composite properties when present, else the
 *     $ref'd fragment; same rule for `required`)
 *   - the canonical vocabulary of a field (`enum`, nulls stripped, or
 *     `x-edm-canonical` for two-tier free-text fields)
 *
 * These are DERIVED surfaces: they can never drift from the spec because
 * they ARE the spec. The SDK's literal restatements (the zod schema in
 * edm-schema.ts, the profile manifests in assembler.ts, the convenience
 * constants in types.ts — kept literal because their TypeScript
 * literal-union types are public API) are GUARDED against these loaders by
 * tests/spec-drift-guard.test.ts, which is wired into `npm test` and fails
 * loudly on any mismatch in either direction.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { EDM_VERSION_LINE } from "../version.js";
const require = createRequire(import.meta.url);
const loadJson = (specPath) => JSON.parse(readFileSync(require.resolve(specPath), "utf8"));
/**
 * Composite schema path inside the installed spec for a profile. The
 * filename version segment is the LINE (edm.v0.8.*) — derived from the
 * installed version, not restated.
 */
export function specCompositePath(profile) {
    return `edm-spec/schema/edm.v${EDM_VERSION_LINE}.${profile}.schema.json`;
}
export function specFragmentPath(domain) {
    return `edm-spec/schema/fragments/${domain}.json`;
}
const compositeCache = new Map();
const fragmentCache = new Map();
export function loadComposite(profile) {
    let c = compositeCache.get(profile);
    if (!c) {
        c = loadJson(specCompositePath(profile));
        compositeCache.set(profile, c);
    }
    return c;
}
export function loadFragment(domain) {
    let f = fragmentCache.get(domain);
    if (!f) {
        f = loadJson(specFragmentPath(domain));
        fragmentCache.set(domain, f);
    }
    return f;
}
/**
 * Resolve a composite's domain node: inline node when it carries its own
 * `properties`, else the $ref'd fragment (fragment name taken from the
 * $ref URL's trailing `fragments/<name>.json` segment).
 */
function resolveDomainNode(domain, node) {
    if (node.properties)
        return node;
    if (typeof node.$ref === "string") {
        const m = node.$ref.match(/fragments\/([a-z_]+)\.json/);
        if (m && m[1])
            return loadFragment(m[1]);
    }
    // Last resort: fragment named after the domain.
    return loadFragment(domain);
}
const shapeCache = new Map();
/**
 * The spec's shape for a canonical profile: domain membership, field
 * membership, and required-ness — the mechanical truth the validator and
 * the drift guard consume.
 */
export function specProfileShape(profile) {
    let shape = shapeCache.get(profile);
    if (shape)
        return shape;
    const composite = loadComposite(profile);
    const props = composite.properties ?? {};
    const domains = Object.keys(props);
    const fields = {};
    const requiredFields = {};
    for (const domain of domains) {
        const nodeRaw = props[domain];
        if (!nodeRaw)
            continue;
        const node = resolveDomainNode(domain, nodeRaw);
        fields[domain] = Object.keys(node.properties ?? {});
        // Required-ness: the inline composite node's `required` wins when the
        // node is inline; a $ref'd domain takes the fragment's `required`.
        requiredFields[domain] = (nodeRaw.properties ? nodeRaw.required : node.required) ?? [];
    }
    shape = {
        domains,
        requiredDomains: composite.required ?? [],
        fields,
        requiredFields,
    };
    shapeCache.set(profile, shape);
    return shape;
}
/**
 * Canonical vocabulary of a field, searched across all fragments:
 * hard-enum fields contribute `enum` (nulls stripped); two-tier free-text
 * fields contribute `x-edm-canonical`. Throws when the field exists but
 * has neither, or is not found at all — a missing vocabulary is a wiring
 * error, never a silent empty list.
 */
export function specVocabOf(field) {
    const FRAGMENTS = [
        "meta",
        "core",
        "constellation",
        "milky_way",
        "gravity",
        "impulse",
        "governance",
        "telemetry",
        "system",
        "crosswalks",
    ];
    for (const fragName of FRAGMENTS) {
        const frag = loadFragment(fragName);
        const def = frag.properties?.[field];
        if (!def)
            continue;
        const values = def.enum ?? def["x-edm-canonical"] ?? firstOneOfEnum(def);
        if (!values) {
            throw new Error(`spec-truth: field "${field}" found in fragment "${fragName}" but has ` +
                `neither an enum nor an x-edm-canonical vocabulary`);
        }
        return values.filter((v) => typeof v === "string");
    }
    throw new Error(`spec-truth: field "${field}" not found in any spec fragment`);
}
/** meta.profile models its enum inside oneOf — surface it. */
function firstOneOfEnum(def) {
    if (!Array.isArray(def.oneOf))
        return undefined;
    for (const branch of def.oneOf) {
        if (Array.isArray(branch.enum))
            return branch.enum;
    }
    return undefined;
}
/**
 * Vocabulary of a NESTED field (e.g. governance.retention_policy.basis),
 * addressed as "<fragment>.<field>.<nested>".
 */
export function specNestedVocabOf(fragment, field, nested) {
    const frag = loadFragment(fragment);
    const def = frag.properties?.[field]?.properties?.[nested];
    const values = def?.enum ?? def?.["x-edm-canonical"];
    if (!values) {
        throw new Error(`spec-truth: no vocabulary at ${fragment}.${field}.${nested}`);
    }
    return values.filter((v) => typeof v === "string");
}
//# sourceMappingURL=spec-truth.js.map