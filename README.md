# DeepaData EDM SDK

The significance layer for AI memory.

EDM artifacts encode what mattered at capture time — emotional weight, recall triggers, identity thread, arc type — so every memory architecture gets a richer signal to retrieve against.

## Why EDM

Most memory systems score relevance at retrieval time. EDM encodes significance at capture time.

The difference: a raw conversation chunk tells your retrieval system what was said. An EDM artifact tells it what mattered — and why it might matter again.

**What this enables:**
- Retrieve by emotional significance, not just semantic similarity
- Surface moments that keyword and vector search miss entirely
- Give memory platforms five retrieval axes instead of one
- Portable, governed artifacts that travel with the person across platforms

The spec is MIT licensed and published on Zenodo. The SDK is the extraction layer.

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

- **LLM-Assisted Extraction**: Uses Claude, OpenAI, or Kimi to extract emotional data from text and images
- **EDM v0.6.0 Compliant**: Full support for all 10 EDM domains
- **Profile Support**: Essential (~20 fields), Extended (~45 fields), or Full (all fields)
- **Text + Image Fusion**: Combines text narrative with image context
- **Stateless Mode**: Privacy-preserving mode for session use
- **Schema Validation**: Comprehensive Zod-based validation
- **Crosswalk Mapping**: Automatic mapping to Plutchik and HMD taxonomies

## Profiles

EDM v0.6.0 introduces profile-aware extraction. Choose the profile that matches your use case:

| Profile | Fields | Use Case |
|---------|--------|----------|
| **essential** | ~20 | Memory platforms, agent frameworks, AI assistants |
| **extended** | ~45 | Journaling apps, companion AI, workplace wellness |
| **full** | 96 | Therapy tools, clinical applications, research |

```typescript
// Essential profile - minimal extraction
const artifact = await extractFromContent({
  content: { text: "..." },
  metadata: { consentBasis: "consent" },
  profile: "essential",
});

// Extended profile - balanced extraction
const artifact = await extractFromContent({
  content: { text: "..." },
  metadata: { consentBasis: "consent" },
  profile: "extended",
});

// Full profile - all fields (default)
const artifact = await extractFromContent({
  content: { text: "..." },
  metadata: { consentBasis: "consent" },
  profile: "full",
});
```

See [examples/](examples/) for complete profile artifacts.

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
  provider: "anthropic",             // optional: "anthropic" | "openai" | "kimi"
  profile: "full",                   // optional: "essential" | "extended" | "full"
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

Validate against the complete EDM v0.6.0 schema.

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

## EDM v0.6.0 Domains

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

This SDK implements EDM v0.6.0. Key changes from v0.5:

- Added `meta.profile` field for conformance level declaration
- Profile-aware extraction with tailored system prompts
- Profile-aware confidence scoring
- Three conformance profiles: essential (24 fields), extended (50 fields), full (96 fields)
- Added Kimi K2 extractor support via MoonshotAI API

## Works With Your Memory Stack

EDM artifacts are format-agnostic episodic memory records. The structured fields integrate naturally with the retrieval infrastructure you already use:

- **Embedding-based retrieval** — embed core.narrative for semantic similarity search against any vector store
- **Temporal knowledge graphs** — map associated_people and tether_type as graph nodes and edges; temporal_context and recurrence_pattern as edge properties
- **Lexical search (BM25)** — recall_triggers and retrieval_keys are designed for activation-path matching against conversation fragments
- **Hybrid retrieval** — combine any of the above; EDM fields give each axis a significance-weighted signal rather than raw text

EDM encodes the episodic layer. The retrieval architecture is yours.

See deepadata.com/docs for integration guides.

## License

MIT
