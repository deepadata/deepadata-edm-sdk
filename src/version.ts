/**
 * Single source of truth for the EDM schema version emitted by this SDK.
 *
 * DERIVED (never restated): the version comes from the installed `edm-spec`
 * package (ADR-0030, amended: the published spec is canonical; the SDK
 * consumes it like any other user of the open code). Bumping the `edm-spec`
 * dependency updates every stamp — no literal EDM version strings belong
 * anywhere else in runtime code.
 *
 * The derivation happens at BUILD time (scripts/generate-spec-data.mjs →
 * src/generated/spec-data.ts), never at runtime: a module-scope require of
 * the spec package breaks under serverless bundlers that ship no
 * node_modules (the 0.8.11 production regression). The sync guard test
 * fails the build if the generated value drifts from the installed spec.
 *
 * Per whitepaper §11.4: declared version governs interpretation.
 * Stale values cause downstream readers to misinterpret artefacts.
 */
import { EDM_SPEC_VERSION } from "./generated/spec-data.js";

/**
 * The EDM schema version stamped into every emitted artifact's
 * `meta.version`, e.g. "0.8.3". Always the installed edm-spec version.
 */
export const EDM_SCHEMA_VERSION: string = EDM_SPEC_VERSION;

const [major, minor] = EDM_SCHEMA_VERSION.split(".");

/** The version line, e.g. "0.8". */
export const EDM_VERSION_LINE: string = `${major}.${minor}`;

/**
 * The version segment used in the spec's schema filenames and $id URLs.
 * The edm-spec convention pins these at the patch-zero of the line
 * (e.g. "v0.8.0" while the spec is at 0.8.3).
 */
export const EDM_SCHEMA_URL_VERSION: string = `v${EDM_VERSION_LINE}.0`;

/** Human label, e.g. "v0.8.3". */
export const EDM_VERSION_LABEL: string = `v${EDM_SCHEMA_VERSION}`;
