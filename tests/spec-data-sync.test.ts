/**
 * Sync guard for src/generated/spec-data.ts (the build-time spec derivation).
 *
 * The generated file carries the installed edm-spec's version, composites,
 * and fragments as compiled literals so the SDK never touches the filesystem
 * at runtime (serverless-regression fix, 0.8.12). This test re-reads the
 * INSTALLED edm-spec package directly (fs is fine in tests) and asserts the
 * generated module matches it exactly — so bumping the edm-spec dependency
 * without running `npm run generate:spec` (or `npm run build`) fails loudly.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EDM_SPEC_VERSION,
  SPEC_COMPOSITES,
  SPEC_FRAGMENTS,
} from "../src/generated/spec-data.js";

const require = createRequire(import.meta.url);
const specPkg = require("edm-spec/package.json") as { version: string };
const specRoot = dirname(require.resolve("edm-spec/package.json"));
const schemaDir = join(specRoot, "schema");
const fragmentsDir = join(schemaDir, "fragments");
const loadJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));

const [major, minor] = specPkg.version.split(".");
const line = `${major}.${minor}`;

describe("generated spec data ≡ installed edm-spec", () => {
  it("version matches the installed edm-spec package", () => {
    expect(EDM_SPEC_VERSION).toBe(specPkg.version);
  });

  it.each(["essential", "extended", "full"] as const)(
    "composite %s matches the installed schema file",
    (profile) => {
      const fromDisk = loadJson(join(schemaDir, `edm.v${line}.${profile}.schema.json`));
      expect(SPEC_COMPOSITES[profile]).toEqual(fromDisk);
    }
  );

  it("fragment set matches the installed fragments directory exactly", () => {
    const onDisk = readdirSync(fragmentsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(Object.keys(SPEC_FRAGMENTS).sort()).toEqual(onDisk);
  });

  it("every fragment matches its installed file byte-content", () => {
    for (const name of Object.keys(SPEC_FRAGMENTS)) {
      const fromDisk = loadJson(join(fragmentsDir, `${name}.json`));
      expect(SPEC_FRAGMENTS[name], `fragment ${name}`).toEqual(fromDisk);
    }
  });
});

describe("no runtime edm-spec / filesystem access in src", () => {
  // The 0.8.11 regression class: any import of node:fs / node:module or any
  // import/require of edm-spec in runtime code is untraceable or unresolvable
  // under serverless bundlers. Spec content must come from generated data.
  const BANNED = [
    /from\s+["']node:fs["']/,
    /from\s+["']fs["']/,
    /from\s+["']node:module["']/,
    /from\s+["']edm-spec/,
    /require\(["']edm-spec/,
  ];

  it("no src file imports fs, node:module, or edm-spec", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(p);
        } else if (entry.name.endsWith(".ts")) {
          const text = readFileSync(p, "utf8");
          if (BANNED.some((re) => re.test(text))) offenders.push(p);
        }
      }
    };
    walk(join(dirname(fileURLToPath(import.meta.url)), "..", "src"));
    expect(offenders).toEqual([]);
  });
});
