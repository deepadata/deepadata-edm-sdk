# Changelog

All notable changes to deepadata-edm-sdk will be documented in this file.

### v0.8.9

Extraction hardening from the 2026-06-10 archive-sample evidence run.
Emitted artifacts remain EDM v0.8.0.

**Versioning note:** this release was briefly numbered 0.9.0 and
re-versioned to 0.8.9 before publish to avoid collision with the planned
EDM spec v0.9 (the release expected to add `experiential_stance` to the
artifact body). SDK semver is independent of the EDM schema version — the
schema version an SDK build emits is declared solely by
`src/version.ts` (`EDM_SCHEMA_VERSION`, currently 0.8.0). Tradeoff
acknowledged: 0.8.9 packs feature additions into a patch-level bump;
strict semver would prefer 0.9.0 plus this decoupling note. Founder call
recorded in deepadata-com session handoff 2026-06-12.

- fix(profile filtering): `meta.parent_id` now survives profile filtering
  in ALL profiles. The published EDM v0.8.0 schemas (edm-spec `v0.8.0` tag
  and `main`, mirrored byte-identically in ddna-tools, deepadata-com
  `public/schemas/edm/v0.8.0/`, and this repo's vendored test fixtures)
  define `parent_id` in the meta block of essential, extended, AND full;
  whitepaper §5.2 No Omission requires every in-profile field to be
  present, explicit null when there is no parent. The SDK previously
  treated it as full-only and stripped it from essential/extended —
  that was wrong; `extractFromConversation` chunk threading now appears
  in the artifact body for every profile (null on the first chunk,
  first chunk's `meta.id` afterwards). PROFILES.md is silent on meta
  fields per profile, so no spec-side errata is required.
- feat(attribution guard): extraction prompts now classify a top-level
  `experiential_stance` (lived | witnessed | quoted_third_party |
  assistant_generated | hypothetical). A deterministic guard clears subject
  significance fields (wound, identity_thread, expressed_insight,
  somatic_signature, transformational_pivot, impulse domain) and floors
  weights at 0.2 when the salient material is not the subject's own
  experience. Optional cheap classifier verification pass
  (`verifyStance: "auto"` default): on gravity-bearing profiles it fires
  on high-weight (>=0.6) conversation extractions claiming
  lived/witnessed/null stance; on gravity-less profiles (essential), which
  carry no emotional_weight to gate on, it fires ONLY when extraction
  returned `experiential_stance: null` — essential is the coherence-tier
  profile for transient, typically-unsealed artifacts, the deterministic
  guard already demotes non-subject stances, and always-on verification
  would double cost/latency in the partner hot path. Callers wanting
  unconditional verification pass `verifyStance: true`. Per-profile
  coverage asserted by tests/stance-profile-coverage.test.ts. Stance
  travels in telemetry notes, never the artifact body; proposed as an EDM
  v0.9 spec field.
- feat(subject anchoring): prompts score significance relative to the
  SUBJECT, not the passage — work-thread weight calibration tightened,
  transformational_pivot requires the subject explicitly marking the
  experience as life-changing.
- feat(conversation input): `ExtractionInput.inputType: "conversation"`
  applies source-material framing inside extractors so transcripts get
  classified instead of continued (previously a caller-side wrapper).
  New `flattenConversation`, `frameTranscript`, `chunkConversation`,
  `extractFromConversation` — full-coverage, turn-aligned per_session
  chunking replaces head+tail truncation for long threads.
- feat(token budget): hardcoded `max_tokens: 4096` replaced with
  `ExtractionOptions.maxTokens` + model-aware default (16384 for thinking
  models, whose reasoning tokens count against the output budget; 4096
  silently truncated extraction on emotionally dense inputs).
- feat(output sanitation): invalid strict-enum values coerce to null and
  over-cap arrays (emotion_subtone > 4, resilience_markers > 3) truncate
  before validation — a null field beats a dropped artifact.
- fix: default Kimi model `kimi-k2-0711-preview` (retired by Moonshot,
  404s) replaced with `kimi-k2.5`.

### v0.8.6

- fix(version): single source of truth for EDM schema version in src/version.ts, with build-time coherence test against canonical spec examples. Stale 0.7.0 stamp on extracted artefacts corrected to 0.8.0 per whitepaper §11.4.
- fix(schema): version regex updated from /^0\.[5-7]\./ to /^0\.[7-8]\./ to accept v0.8.0 artefacts. TODO ADR-0021 for proper version-routed validation.
- Also includes partner profile helpers (isCanonicalProfile, isPartnerProfile, getPartnerProfileId) and partner: prefix union type validation that landed in v0.8.5 source but were not present in the published v0.8.5 package.

### v0.7.0 schema changes (captured from source comments)

- emotion_primary: added disappointment, relief, frustration; accepts free text
- narrative_arc: added loss, confrontation; accepts free text
- relational_dynamics: accepts free text
- arc_type: new field with 12 canonical values
- REMOVED: legacy_embed, alignment_delta
- emotional_weight calibration anchors added

### v0.8.5

- feat: export EdmProfile and PartnerProfileId from main index — enables downstream consumers to import types without cast pattern

### v0.8.4

- fix(schema): meta.profile namespace model — partner: prefix per ADR-0017 and EDM v0.8.0 Section 3.7.2. Canonical values (essential/extended/full) unchanged. Partner profiles declared as partner:<profile_id>. Adds isCanonicalProfile(), isPartnerProfile(), getPartnerProfileId() helpers.

### v0.8.3

- feat(schema): add gratitude and authenticity arc_types

### v0.8.2

- feat(sdk): add feedback() function and FeedbackOptions type. Closes learning loop from adapter to arc_activation_events.

### v0.8.1

- feat(sdk): add activationId to ActivateResult. Enables feedback loop via /v1/feedback endpoint.
