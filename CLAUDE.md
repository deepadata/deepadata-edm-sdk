# deepadata-edm-sdk

Artifact extraction for the significance layer.

## What This Repo Is

The SDK that extracts EDM artifacts from unstructured content.
Given text (conversation, journal entry, transcript), it produces
a structured significance artifact — emotional weight, narrative
arc, identity threads, recall triggers — encoded at capture time.

- **Current version:** v0.8.5
- **License:** UNLICENSED (commercial)
- **npm:** deepadata-edm-sdk@0.8.5 published

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
- Expose extraction prompts publicly (commercial IP)

## Hard Constraints

| Constraint | Reason |
|---|---|
| Do not expose EXTRACTION_SYSTEM_PROMPT | Commercial IP — ADR-0003 |
| Do not add providers without test validation | Empirical trust — ADR-0002 |
| Interpretation only, never inference | EU AI Act compliance |

**Interpretation vs Inference:** The SDK interprets affective
meaning implicit in narrative and symbols. It does NOT infer
latent psychological states, predict behavior, or diagnose.

## Profiles

| Profile | Fields | Use case |
|---|---|---|
| Essential | 24 | Memory platforms, agent frameworks |
| Extended | 50 | Journaling, companion AI |
| Full | 96 | Therapy/clinical, regulatory |

## Source of Truth

For full project context, cross-repo state, and architectural decisions:

→ **See `deepadata-com/planning/CLAUDE_PROJECT.md`**

The platform repo (deepadata-com) is the source of truth for
session state, version alignment, and task tracking.
