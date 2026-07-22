/**
 * Build-time spec-data generator (serverless-regression fix, 2026-07-23).
 *
 * Reads the INSTALLED `edm-spec` package and emits src/generated/spec-data.ts:
 * the spec version plus the full composite profile schemas and domain
 * fragments as TypeScript literals. Everything the SDK used to read from
 * edm-spec at RUNTIME (version.ts createRequire, spec-truth.ts /
 * generate-field-block.ts readFileSync) now compiles in at BUILD time, so
 * serverless bundlers (Vercel/webpack, esbuild) can ship the SDK without
 * node_modules present at runtime.
 *
 * ADR-0030 unchanged: the spec is still the source of truth — the derivation
 * simply moves from import-time to build-time. `npm run build` regenerates
 * before tsc, and tests/spec-data-sync.test.ts fails loudly if the committed
 * output ever drifts from the installed spec.
 *
 * Determinism: JSON is re-serialized with 2-space indent from parsed objects,
 * preserving key order from the spec files (field ORDER is meaningful to the
 * field-block generator).
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const specPkg = require("edm-spec/package.json");
const specVersion = specPkg.version;
if (typeof specVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(specVersion)) {
  throw new Error(
    `edm-spec package version missing or malformed: ${JSON.stringify(specVersion)}`
  );
}
const [major, minor] = specVersion.split(".");
const versionLine = `${major}.${minor}`;

const specRoot = dirname(require.resolve("edm-spec/package.json"));
const schemaDir = join(specRoot, "schema");
const fragmentsDir = join(schemaDir, "fragments");

const loadJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const PROFILES = ["essential", "extended", "full"];
const composites = {};
for (const profile of PROFILES) {
  composites[profile] = loadJson(
    join(schemaDir, `edm.v${versionLine}.${profile}.schema.json`)
  );
}

const fragments = {};
for (const file of readdirSync(fragmentsDir).sort()) {
  if (!file.endsWith(".json")) continue;
  fragments[file.replace(/\.json$/, "")] = loadJson(join(fragmentsDir, file));
}
if (Object.keys(fragments).length === 0) {
  throw new Error(`no fragments found in ${fragmentsDir}`);
}

const emit = (v) => JSON.stringify(v, null, 2);

const banner = `/**
 * AUTO-GENERATED from edm-spec@${specVersion} — DO NOT EDIT.
 *
 * Regenerate: npm run generate:spec   (runs automatically in npm run build)
 * Sync guard: tests/spec-data-sync.test.ts fails if this file drifts from
 * the installed edm-spec package.
 *
 * This file exists so the SDK carries the spec's mechanical truth as
 * compiled literals instead of runtime fs/require reads of node_modules —
 * a requirement for serverless bundlers (see 0.8.12 release notes).
 */
/* eslint-disable */
`;

const body = `${banner}
/** Version of the edm-spec package this file was generated from. */
export const EDM_SPEC_VERSION = ${emit(specVersion)};

/** Composite profile schemas (edm.v${versionLine}.*.schema.json), verbatim. */
export const SPEC_COMPOSITES: Record<
  "essential" | "extended" | "full",
  Record<string, unknown>
> = ${emit(composites)};

/** Domain fragment schemas (schema/fragments/*.json), verbatim, keyed by name. */
export const SPEC_FRAGMENTS: Record<string, Record<string, unknown>> = ${emit(fragments)};
`;

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "generated");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "spec-data.ts");
writeFileSync(outFile, body, "utf8");
console.log(
  `generated ${outFile} from edm-spec@${specVersion} ` +
    `(${PROFILES.length} composites, ${Object.keys(fragments).length} fragments)`
);
