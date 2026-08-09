# deepadata-edm-sdk

Artifact extraction for the significance layer.

## What This Repo Is

The SDK that extracts EDM artifacts from unstructured content.
Given text (conversation, journal entry, transcript), it produces
a structured significance artifact — emotional weight, narrative
arc, identity threads, recall triggers — encoded at capture time.

- **Current version:** v0.8.15 — PUBLISHED 2026-08-09 (registry-checked), tag `v0.8.15`, `feat/sdk-0.8.15` merged to main (release commit `fd6b524`)
- **License:** UNLICENSED (commercial)
- **npm:** deepadata-edm-sdk@0.8.15 = latest; platform (deepadata-com) bumped to `^0.8.15` (its commit `58edc5b`)

## Role in the DeepaData System

```
   edm-spec (MIT, schema definition)
       ↓ defines
→ edm-sdk (extraction engine) ← YOU ARE HERE
       ↓ consumed by
   deepadata-com (platform, sealing, registry)
       ↓ also consumed by
   deepadata-adapters (Mem0, Zep, LangChain connectors)
```

The SDK is the extraction layer. It takes content in, produces
EDM artifacts out. It does not seal, sign, or certify — that
happens in deepadata-com.

## What This Repo Does

**Exported functions:**
- `extractFromContent()` — LLM-assisted extraction to EDM artifact
- `activate()` — calls /v1/activate on deepadata.com, returns field filters for significance routing
- `feedback()` — calls /v1/feedback on deepadata.com, closes learning loop

**Exported types:**
- `EdmArtifact` — the artifact shape
- `ActivateResult` — response from activate() including activation_id and field filters
- `FeedbackOptions` — options for feedback() call

**Validation:**
- `validateEDM()` — schema validation against profile (Essential/Extended/Full)
- `createStatelessArtifact()` — privacy conversion (nulls PII fields)
- Zod schemas for all 10 EDM domains

## What This Repo Does NOT Do

- Seal or sign artifacts (that's deepadata-com)
- Write to any registry (that's deepadata-com)

## Hard Constraints

| Constraint | Reason |
|---|---|
| Do not expose PARTNER profile extraction prompts (partner: prefix) via API, logs, or errors | Registry-gated per spec §3.7.6 | ADR-0003 (amended 2026-04-23), ADR-0017 |
| Do not add providers without test validation | Empirical trust — ADR-0002 |
| Interpretation only, never inference | EU AI Act compliance |

## Engineering Rules

**No hardcoded model/provider references (standing rule, 2026-08-04).**
Model identifiers (`kimi-*`, `gpt-*`, `claude-*`, `moonshot-*`, …) live
ONLY in `src/model-config.ts`. Every call site resolves through that
module. Resolution order per provider:

1. per-request option (`model` on the call)
2. `EXTRACTION_MODEL` env (global override)
3. provider env: `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `KIMI_MODEL`
4. the documented fallback constant in `src/model-config.ts`

The stance classifier has its own knob (`stanceModel` per-request /
`STANCE_MODEL` env) and does NOT inherit the extraction model. Tests may
pass explicit model ids as per-request options; runtime code may not.

**Unset profile defaults to `full` — intentional.** Founder decision
2026-08-04: "give an initial user the entire view." Not a defect; do not
re-flag or change without a founder decision.

**Interpretation vs Inference:** The SDK interprets affective
meaning implicit in narrative and symbols. It does NOT infer
latent psychological states, predict behavior, or diagnose.

## Profiles

| Profile | Fields | Use case |
|---|---|---|
| Essential | 24 | Memory platforms, agent frameworks |
| Extended | 50 | Journaling, companion AI |
| Full | 96 | Therapy/clinical, regulatory |

## Partner Profiles (v0.8.0)

`meta.profile` accepts `partner:` prefixed values per ADR-0017.
Canonical per whitepaper §3.7.2 and §3.7.6. Schema validator accepts
partner-prefixed profiles; completeness check skipped pending registry.

## Arc Types (v0.8.0)

14 canonical arc_types per edm-schema.ts:189-196. v0.8.0 added
`gratitude` and `authenticity`:

```
betrayal, liberation, grief, discovery, resistance, bond,
moral_awakening, transformation, reconciliation, reckoning,
threshold, exile,
gratitude, authenticity
```

## Pending

- (resolved 2026-08-08) 0.8.14 published; platform bumped `^0.8.14`,
  D4 warnings pass-through shipped platform-side (`2dccb3c`).
- (resolved 2026-08-09) 0.8.15 published — see Last session below.
- (resolved) the `file:../edm-spec` pin was flipped back to the npm
  semver `^0.8.3` in f801801.

## Open Items

- `activate_reason()` SDK surface: not yet implemented. Platform
  endpoint `/v1/activate_reason` exists (ADR-0018); SDK wrapper pending.

## Source of Truth

For full project context, cross-repo state, and architectural decisions:

→ **See `deepadata-com/planning/BACKLOG-2026-08-08.md` (rows) +
`planning/STATE.md` (state) + the newest `planning/findings/` doc.**
(`CLAUDE_PROJECT.md` is retired as a worklist authority per N14,
2026-08-09 park session.)

The platform repo (deepadata-com) is the source of truth for
session state, version alignment, and task tracking.

## Last session: 2026-08-09 (release day, founder-run)
**0.8.15 PUBLISHED**: F1 lenient fence parse (`7871f49`) + kimi stance
sunset moonshot-v1-32k → kimi-k2.6 (`f62f767`, ahead of the 2026-08-31
retirement) + F2 empty-input guard (`100debb` — EmptyInputError, typed
pre-provider rejection, founder chose ship-with). Suite 244/244.
Release commit `fd6b524`, tag `v0.8.15` pushed, `feat/sdk-0.8.15`
merged to main. Platform bumped `^0.8.15` (deepadata-com `58edc5b`).
This CLAUDE.md was synced to publish reality by the platform park
session (H13); stale 0.8.14-era lines corrected above.

## Prior session: 2026-08-06/07 (overnight)
0.8.15 work on branch feat/sdk-0.8.15 (off feat/sdk-0.8.14-latency),
no push/publish/version bump. Two units, both validated live:
- F1 lenient fence extraction (`parseLlmJson`, shared by all three
  extractors) — the 5 previously failing corpus runs re-ran 5/5
  clean on haiku, zod-valid (commit 7871f49).
- Kimi stance fallback moonshot-v1-32k → kimi-k2.6 with Moonshot
  `thinking:{type:"disabled"}` via `stanceRequestExtensions()`
  (moonshot-v1 retires 2026-08-31); live stance call verdict correct
  in 1,271ms (commit f62f767).
Suite 235/235, CHANGELOG under "Unreleased (0.8.15)". F2 candidate
(SDK-side guard for empty/whitespace input) left open. 0.8.14 publish
still pending founder.
