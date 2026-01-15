# EU AI Act Compliance

This document outlines how the deepadata-edm-sdk is designed for compliance with the EU AI Act (Regulation 2024/1689) and related regulations governing emotional data processing.

## Regulatory Context

### EU AI Act Classification

The EU AI Act categorizes AI systems by risk level:

1. **Prohibited** - Unacceptable risk (e.g., social scoring, manipulation)
2. **High-Risk** - Significant potential impact (e.g., employment decisions)
3. **Limited Risk** - Transparency obligations (e.g., chatbots)
4. **Minimal Risk** - No specific requirements

### Emotion Recognition Systems

Article 6(1)(b) and Annex III classify "emotion recognition systems" as **high-risk** when used in:
- Employment contexts
- Educational settings
- Law enforcement
- Border management

**Important distinction**: The regulation targets systems that **infer** emotional states to make decisions affecting individuals. Systems that **structure** user-provided emotional content for the user's benefit operate differently.

## How This SDK Differs From High-Risk Systems

### 1. User-Initiated, User-Controlled

| High-Risk System | deepadata-edm-sdk |
|-----------------|-------------------|
| Observes subjects without awareness | Processes content user actively provides |
| Makes predictions about subjects | Structures what user has expressed |
| Used by third parties on subjects | Used by subjects on their own data |
| Output feeds into decisions about subject | Output is returned to subject |

### 2. Extraction vs. Inference

| High-Risk System | deepadata-edm-sdk |
|-----------------|-------------------|
| Infers hidden emotional states | Extracts stated emotional content |
| Predicts future behavior | Documents described experiences |
| Claims knowledge about subject | Structures subject's own claims |
| Operates beyond verifiable bounds | Bounded by input content |

### 3. Purpose and Effect

| High-Risk System | deepadata-edm-sdk |
|-----------------|-------------------|
| Used to make decisions about people | Used by people to structure their memories |
| May disadvantage subjects | Benefits subjects through organization |
| Asymmetric (org vs. individual) | Symmetric (individual's own tool) |

## Compliance Features

### Transparency (Article 13)

The SDK provides:

- **Extraction model disclosure**: `telemetry.extraction_model` identifies the LLM used
- **Confidence scoring**: `telemetry.entry_confidence` indicates extraction reliability
- **Processing notes**: `telemetry.extraction_notes` documents quality factors
- **Schema versioning**: `meta.version` tracks EDM specification version

### Human Oversight (Article 14)

The SDK supports:

- **Validation before use**: `validateEDM()` enables human review
- **Completeness check**: `validateCompleteness()` highlights missing data
- **Manual override**: `createEmptyArtifact()` allows full manual control
- **No autonomous action**: SDK produces data; decisions remain with humans

### Data Governance (Article 10)

The SDK enforces:

- **Consent tracking**: `meta.consent_basis` documents legal basis
- **Jurisdiction awareness**: `governance.jurisdiction` adapts to regulations
- **Subject rights**: `governance.subject_rights` ensures portability/erasure
- **Retention policies**: `governance.retention_policy` enforces data lifecycle

### Risk Mitigation (Article 9)

The SDK implements:

- **Null preference**: Returns null rather than uncertain classifications
- **Conservative defaults**: Chooses less severe interpretations when ambiguous
- **Schema constraints**: Zod validation prevents invalid emotional attributions
- **Stateless mode**: `createStatelessArtifact()` enables privacy-preserving use

## GDPR Alignment

### Lawful Basis (Article 6)

The SDK requires explicit `consent_basis`:
- `consent` - Explicit user consent
- `contract` - Necessary for contract performance
- `legitimate_interest` - Carefully balanced processing
- `none` - For research/aggregated use only

### Special Category Data (Article 9)

Emotional data may qualify as special category data. The SDK:

- Defaults to `pii_tier: "moderate"` recognizing sensitivity
- Supports `pii_tier: "high"` / `"extreme"` for heightened protection
- Enables `stateless` mode to minimize identifiability
- Tracks `policy_labels` for sensitive categories

### Subject Rights (Articles 15-22)

The SDK enforces:

| Right | Implementation |
|-------|----------------|
| Access | Artifacts exportable via `.ddna` format |
| Rectification | Artifacts can be updated (`updated_at`) |
| Erasure | `consent_revoked_at` disables processing |
| Portability | Standard format, `exportability` control |
| Objection | Consent revocation supported |

## Recommended Deployment Practices

### 1. User Consent Flow

```typescript
// Before extraction, obtain clear consent
const consent = await getUserConsent({
  purpose: "Structure your memories for personal reflection",
  dataTypes: ["emotional content", "people mentioned", "locations"],
  retention: "Until you request deletion",
  rights: ["access", "correction", "deletion", "export"],
});

if (consent.granted) {
  const artifact = await extractFromContent({
    content: userContent,
    metadata: {
      consentBasis: "consent",
      // ...
    },
  });
}
```

### 2. Transparency in UI

Display to users:
- What model extracted their data
- What fields were populated vs. left null
- How to access, correct, or delete their artifacts

### 3. Retention Enforcement

```typescript
// Set appropriate retention
const artifact = await extractFromContent({
  // ...
  metadata: {
    // ...
  },
});

// Update governance with retention policy
artifact.governance.retention_policy = {
  basis: "user_defined",
  ttl_days: 365,
  on_expiry: "hard_delete",
};
```

### 4. Stateless for Sessions

```typescript
// For real-time use without persistent storage
const sessionArtifact = createStatelessArtifact(
  await extractFromContent(options)
);
// No owner_user_id, no identifying context retained
```

## Documentation for Audits

Maintain records of:

1. **Schema version** deployed and when
2. **Model versions** used for extraction
3. **Consent mechanisms** and user flows
4. **Retention schedules** and deletion logs
5. **Access requests** and responses
6. **Stateless vs. identified** processing ratios

## Summary

The deepadata-edm-sdk is designed for regulatory compliance through:

- Clear distinction from high-risk emotion inference systems
- Transparent processing with audit trails
- User control and subject rights enforcement
- Conservative extraction with null preference
- Privacy-preserving stateless mode

When deployed with appropriate consent flows and user controls, the SDK supports compliant emotional data processing under EU AI Act and GDPR frameworks.

---

*This document provides guidance but does not constitute legal advice. Consult qualified legal counsel for compliance determinations specific to your deployment context.*
