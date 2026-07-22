/**
 * Serverless-bundling regression gate (0.8.12, after the 0.8.11 outage).
 *
 * Proves the PACKED package survives what Vercel does to it:
 *   1. npm pack → the real tarball a consumer installs
 *   2. install it (plus registry deps) in a scratch dir
 *   3. esbuild --bundle a consumer entrypoint into a single file
 *   4. run the bundle from a directory WITH NO node_modules
 *   5. assert: module loads, version reads, profile shapes read,
 *      field-block generation works
 *
 * Any module-scope require of edm-spec, or runtime fs read of spec files,
 * fails step 4 exactly the way the 0.8.11 lambdas failed in production.
 *
 * Usage: npm run bundle-test   (requires network for the scratch install)
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, cwd) =>
  execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });

const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const specVersion = JSON.parse(
  readFileSync(join(repoRoot, "node_modules", "edm-spec", "package.json"), "utf8")
).version;

console.log(`[bundle-test] packing ${pkg.name}@${pkg.version} ...`);
const scratch = mkdtempSync(join(tmpdir(), "edm-sdk-bundle-test-"));
try {
  // 1. pack
  const tarName = run(`npm pack --silent --pack-destination "${scratch}"`, repoRoot).trim();
  const tarball = join(scratch, tarName.split(/\r?\n/).pop());

  // 2. install the tarball in a scratch consumer
  const consumer = join(scratch, "consumer");
  mkdirSync(consumer);
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "bundle-test-consumer", private: true, type: "module" }));
  console.log(`[bundle-test] installing tarball into scratch consumer ...`);
  run(`npm install --silent --no-audit --no-fund "${tarball}"`, consumer);

  // 3. esbuild-bundle an entrypoint that exercises the regression surface
  // Public API only (the platform's own consumption surface): module load →
  // version stamp → profile-shape read (validateEDMWithProfile walks
  // specProfileShape → generated spec data) → vocabulary constant.
  writeFileSync(
    join(consumer, "entry.mjs"),
    `import {
  createEmptyArtifact,
  validateEDMWithProfile,
  NARRATIVE_ARCHETYPE,
  getProfileFields,
} from "deepadata-edm-sdk";

const artifact = createEmptyArtifact();
const validation = validateEDMWithProfile(artifact);
const out = {
  version: artifact.meta.version,
  archetypes: NARRATIVE_ARCHETYPE.length,
  fullFields: Object.values(getProfileFields("full")).flat().length,
  validationRan: typeof validation.valid === "boolean",
  profileChecked: typeof validation.profileResult?.conformant === "boolean",
};
console.log(JSON.stringify(out));
`
  );
  console.log(`[bundle-test] bundling with esbuild ...`);
  run(
    `npx --yes esbuild entry.mjs --bundle --platform=node --format=esm ` +
      `--outfile=bundle.mjs --log-level=warning ` +
      `--banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"`,
    consumer
  );

  // 4. run the bundle from a bare dir with NO node_modules anywhere above tmp
  const bare = join(scratch, "bare-runtime");
  mkdirSync(bare);
  cpSync(join(consumer, "bundle.mjs"), join(bare, "bundle.mjs"));
  console.log(`[bundle-test] running bundle from bare dir (no node_modules) ...`);
  const output = run(`node bundle.mjs`, bare).trim();
  const result = JSON.parse(output.split(/\r?\n/).pop());

  // 5. assertions
  const fail = (msg) => {
    console.error(`[bundle-test] FAIL: ${msg}\n  got: ${output}`);
    process.exit(1);
  };
  if (result.version !== specVersion)
    fail(`version "${result.version}" != installed edm-spec ${specVersion}`);
  if (result.archetypes !== 12) fail(`narrative_archetype count ${result.archetypes} != 12`);
  if (!(result.fullFields > 50)) fail(`fullFields ${result.fullFields} <= 50`);
  if (!result.validationRan) fail(`validateEDMWithProfile did not run`);
  if (!result.profileChecked) fail(`profile conformance (spec-truth path) did not run`);

  console.log(
    `[bundle-test] PASS — version=${result.version} archetypes=${result.archetypes} ` +
      `fullFields=${result.fullFields} validation+profile ran ` +
      `(bundle executed with no node_modules present)`
  );
} finally {
  try {
    rmSync(scratch, { recursive: true, force: true });
  } catch {
    /* scratch cleanup is best-effort on Windows */
  }
}
