/**
 * Single source of truth for the EDM schema version emitted by this SDK.
 *
 * DERIVED (never restated): the version comes from the installed `edm-spec`
 * package (ADR-0030, amended: the published spec is canonical; the SDK
 * consumes it like any other user of the open code). Bumping the `edm-spec`
 * dependency updates every stamp — no literal EDM version strings belong
 * anywhere else in runtime code.
 *
 * Per whitepaper §11.4: declared version governs interpretation.
 * Stale values cause downstream readers to misinterpret artefacts.
 */
import { createRequire } from "node:module";
// createRequire, not `import ... from "edm-spec/package.json"`: JSON module
// imports under Node ESM need import attributes (unavailable on Node 18,
// this package's floor), while require() of JSON works everywhere.
const require = createRequire(import.meta.url);
const specPkg = require("edm-spec/package.json");
const specVersion = typeof specPkg.version === "string" ? specPkg.version : undefined;
if (!specVersion || !/^\d+\.\d+\.\d+$/.test(specVersion)) {
    throw new Error(`edm-spec package version missing or malformed: ${JSON.stringify(specPkg.version)}`);
}
/**
 * The EDM schema version stamped into every emitted artifact's
 * `meta.version`, e.g. "0.8.3". Always the installed edm-spec version.
 */
export const EDM_SCHEMA_VERSION = specVersion;
const [major, minor] = EDM_SCHEMA_VERSION.split(".");
/** The version line, e.g. "0.8". */
export const EDM_VERSION_LINE = `${major}.${minor}`;
/**
 * The version segment used in the spec's schema filenames and $id URLs.
 * The edm-spec convention pins these at the patch-zero of the line
 * (e.g. "v0.8.0" while the spec is at 0.8.3).
 */
export const EDM_SCHEMA_URL_VERSION = `v${EDM_VERSION_LINE}.0`;
/** Human label, e.g. "v0.8.3". */
export const EDM_VERSION_LABEL = `v${EDM_SCHEMA_VERSION}`;
//# sourceMappingURL=version.js.map