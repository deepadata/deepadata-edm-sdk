# Changelog

All notable changes to deepadata-edm-sdk will be documented in this file.

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
