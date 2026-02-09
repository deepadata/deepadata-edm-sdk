# deepadata-edm-sdk

SDK for assembling EDM v0.4.0 artifacts from user content. LLM-assisted extraction with interpretation constraints (not inference). Supports text + image input, stateless mode, and integrates with deepadata-ddna-tools for sealing.

## Installation

```bash
npm install deepadata-edm-sdk
```

## Quick Start

```typescript
import { extractFromContent, createStatelessArtifact, validateEDM } from 'deepadata-edm-sdk';

// Set your Anthropic API key
process.env.ANTHROPIC_API_KEY = 'your-api-key';

// Extract EDM artifact from content
const artifact = await extractFromContent({
  content: {
    text: "Looking at this old photograph brings back so many memories of summer afternoons at grandmother's house...",
  },
  metadata: {
    subjectId: "vp-01HZ3GKWP7XTJY9QN4RD",
    jurisdiction: "GDPR",
    consentBasis: "consent",
  },
});

// Validate the artifact
const validation = validateEDM(artifact);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// For session use: create privacy-preserving stateless version
const stateless = createStatelessArtifact(artifact);

// The artifact is now ready for sealing with ddna-tools
console.log(JSON.stringify(artifact, null, 2));
```

## Features

- **LLM-Assisted Extraction**: Uses Claude to extract emotional data from text and images
- **EDM v0.4.0 Compliant**: Full support for all 10 EDM domains
- **Text + Image Fusion**: Combines text narrative with image context
- **Stateless Mode**: Privacy-preserving mode for session use
- **Schema Validation**: Comprehensive Zod-based validation
- **Crosswalk Mapping**: Automatic mapping to Plutchik and HMD taxonomies

## API Reference

### Extraction

#### `extractFromContent(options)`

Extract a complete EDM artifact from content.

```typescript
const artifact = await extractFromContent({
  content: {
    text: "User's narrative...",
    image: "base64-encoded-image", // optional
    imageMediaType: "image/jpeg",  // optional
  },
  metadata: {
    subjectId: "vp-01HZ3GKWP7XTJY9QN4RD",      // optional, null in stateless
    jurisdiction: "GDPR",          // optional
    consentBasis: "consent",       // required
    locale: "en-us",               // optional
    visibility: "private",         // optional
    piiTier: "moderate",           // optional
    tags: ["family", "memory"],    // optional
  },
  model: "claude-sonnet-4-20250514", // optional
});
```

#### `extractFromContentWithClient(client, options)`

Same as above but with a provided Anthropic client.

### Stateless Mode

#### `createStatelessArtifact(artifact)`

Create a privacy-preserving version for session use.

```typescript
const stateless = createStatelessArtifact(artifact);
// - owner_user_id: null
// - associated_people: []
// - location_context: null
// - recall_triggers: []
// - retrieval_keys: []
// - exportability: "restricted"
```

#### `isStateless(artifact)`

Check if an artifact is in stateless mode.

#### `validateStateless(artifact)`

Validate stateless compliance with detailed violations.

### Validation

#### `validateEDM(artifact)`

Validate against the complete EDM v0.4.0 schema.

```typescript
const result = validateEDM(artifact);
// { valid: boolean, errors: ValidationError[] }
```

#### `validateDomain(domain, data)`

Validate a specific domain.

```typescript
const result = validateDomain("constellation", artifact.constellation);
```

#### `validateCompleteness(artifact)`

Check field population and completeness.

```typescript
const result = validateCompleteness(artifact);
// { complete: boolean, missingFields: string[], populationRate: number }
```

### Helpers

#### `createEmptyArtifact()`

Create an empty artifact structure for manual population.

#### `createAnthropicClient(apiKey?)`

Create an Anthropic client (uses `ANTHROPIC_API_KEY` env var if not provided).

## EDM v0.4.0 Domains

The SDK supports all 10 EDM domains:

| Domain | Description | Extraction |
|--------|-------------|------------|
| **meta** | Identity, provenance, consent | From metadata |
| **core** | Anchor, spark, wound, fuel, bridge, echo, narrative | LLM |
| **constellation** | Emotional classification, archetypes | LLM |
| **milky_way** | Contextual grounding (people, place, event) | LLM |
| **gravity** | Salience, weight, retrieval keys | LLM |
| **impulse** | Motivational state, drive, coping | LLM |
| **governance** | Jurisdiction, retention, rights | From metadata |
| **telemetry** | Extraction confidence, model ID | Auto-populated |
| **system** | Embeddings, indices (downstream) | Empty |
| **crosswalks** | External taxonomy mappings | Auto-mapped |

## Integration with ddna-tools

After extraction, seal the artifact for portability:

```typescript
import { seal } from 'deepadata-ddna-tools';

const envelope = await seal(artifact, privateKey, did);
// Result: signed .ddna envelope
```

## Interpretation Boundary

This SDK performs **extraction, not inference**. The LLM extracts what is explicitly stated or clearly implied in the source content. It does not:

- Infer psychological states beyond stated emotions
- Diagnose conditions or suggest treatments
- Make predictions about future behavior
- Generate content not grounded in the input

See [docs/EXTRACTION_VS_INFERENCE.md](docs/EXTRACTION_VS_INFERENCE.md) for details.

## EU AI Act Compliance

This SDK is designed for compliance with the EU AI Act. Emotional data extraction with interpretation constraints is considered lower risk than emotion inference systems. See [docs/EU_AI_ACT_COMPLIANCE.md](docs/EU_AI_ACT_COMPLIANCE.md).

## Schema Version

This SDK implements EDM v0.4.0. Key changes from v0.3:

- Removed 6 fields (session_id, affective_clarity, active_motivational_state, media_context, memory_layers, tether_target)
- Split META domain: 6 fields moved to new GOVERNANCE domain
- Added somatic_signature field
- Field renames: archetype_energy→narrative_archetype, meaning_inference→expressed_insight, transcendent_moment→transformational_pivot

## License

MIT
