# Changelog

All notable changes to deepadata-edm-sdk will be documented in this file.

### v0.8.4

- fix(schema): meta.profile namespace model — partner: prefix per ADR-0017 and EDM v0.8.0 Section 3.7.2. Canonical values (essential/extended/full) unchanged. Partner profiles declared as partner:<profile_id>. Adds isCanonicalProfile(), isPartnerProfile(), getPartnerProfileId() helpers.

### v0.8.3

- feat(schema): add gratitude and authenticity arc_types

### v0.8.2

- feat(sdk): add feedback() function and FeedbackOptions type. Closes learning loop from adapter to arc_activation_events.

### v0.8.1

- feat(sdk): add activationId to ActivateResult. Enables feedback loop via /v1/feedback endpoint.
