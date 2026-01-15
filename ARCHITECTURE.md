# Architecture

This document describes the architecture of the deepadata-edm-sdk.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        deepadata-edm-sdk                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────────────┐ │
│  │    Input     │───▶│   Extractor   │───▶│      Assembler       │ │
│  │  (text/img)  │    │   (Claude)    │    │   (10 domains)       │ │
│  └──────────────┘    └───────────────┘    └──────────────────────┘ │
│                              │                       │              │
│                              ▼                       ▼              │
│                      ┌───────────────┐    ┌──────────────────────┐ │
│                      │   Validator   │    │    Stateless Mode    │ │
│                      │   (Zod)       │    │    (privacy)         │ │
│                      └───────────────┘    └──────────────────────┘ │
│                              │                       │              │
│                              └───────────┬───────────┘              │
│                                          ▼                          │
│                              ┌──────────────────────┐               │
│                              │    EDM Artifact      │               │
│                              │    (v0.4.0)          │               │
│                              └──────────────────────┘               │
│                                          │                          │
│                                          ▼                          │
│                              ┌──────────────────────┐               │
│                              │  ddna-tools (seal)   │               │
│                              │    (external)        │               │
│                              └──────────────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── schema/
│   ├── edm-schema.ts          # Zod schemas for all 10 domains
│   └── types.ts               # TypeScript type exports
├── extractors/
│   ├── llm-extractor.ts       # Claude API integration + system prompt
│   ├── domain-extractors.ts   # Non-LLM domain population
│   └── image-analyzer.ts      # Image context extraction
├── assembler.ts               # Artifact assembly from components
├── stateless.ts               # Privacy-preserving transformations
├── validator.ts               # Schema and completeness validation
└── index.ts                   # Public API exports
```

## Component Details

### Schema Layer (`src/schema/`)

#### edm-schema.ts

Zod schemas generated from the canonical EDM v0.4.0 JSON schema. Each domain has a dedicated schema:

```typescript
// Domain schemas
export const MetaSchema = z.object({ ... });
export const CoreSchema = z.object({ ... });
export const ConstellationSchema = z.object({ ... });
// ... all 10 domains

// Composite schema
export const EdmArtifactSchema = z.object({
  meta: MetaSchema,
  core: CoreSchema,
  // ... all domains
});
```

Schema features:
- Strict enum validation for categorical fields
- Range constraints (0.0-1.0) for scores
- Array length limits (e.g., emotion_subtone max 4)
- Nullable types where optional
- Pattern validation for IDs and versions

#### types.ts

TypeScript types inferred from Zod schemas:

```typescript
export type Meta = z.infer<typeof MetaSchema>;
export type EdmArtifact = z.infer<typeof EdmArtifactSchema>;
// ...
```

Plus input/output types for the API:
- `ExtractionInput` - Content to process
- `ExtractionMetadata` - Governance and identity options
- `ExtractionOptions` - Combined extraction configuration
- `ValidationResult` - Schema validation output

### Extractor Layer (`src/extractors/`)

#### llm-extractor.ts

Interfaces with Claude to extract 5 LLM-populated domains:
- core
- constellation
- milky_way
- gravity
- impulse

Key components:

**System Prompt**: The extraction prompt enforces:
- Normalization rules (lowercase, short phrases)
- Null preference for uncertain fields
- Schema structure with all required fields
- Text + image fusion rules

**extractWithLlm()**: Main extraction function
```typescript
async function extractWithLlm(
  client: Anthropic,
  input: ExtractionInput,
  model: string
): Promise<LlmExtractionResult>
```

**Confidence Calculation**: Based on field population rates across domains, weighted by domain importance.

#### domain-extractors.ts

Populates non-LLM domains from metadata and extraction context:

| Function | Domain | Source |
|----------|--------|--------|
| `createMeta()` | meta | ExtractionMetadata |
| `createGovernance()` | governance | ExtractionMetadata |
| `createTelemetry()` | telemetry | Extraction result |
| `createSystem()` | system | Empty (downstream) |
| `createCrosswalks()` | crosswalks | LLM-extracted fields |

Crosswalk mappings:
- emotion_primary → Plutchik primary emotion
- memory_type → HMD v2 memory classification

#### image-analyzer.ts

Optional standalone image analysis:
- Extracts location, people, symbols, event type
- Merges with text-extracted fields (text takes priority)
- Used when deeper image context needed beyond fusion

### Assembler (`src/assembler.ts`)

Combines all components into a complete artifact:

```typescript
export async function extractFromContent(
  options: ExtractionOptions
): Promise<EdmArtifact>
```

Pipeline:
1. Create Anthropic client
2. Call `extractWithLlm()` for 5 domains
3. Call domain extractors for 5 domains
4. Assemble into `EdmArtifact`
5. Return validated artifact

Also exports:
- `extractFromContentWithClient()` - Use existing client
- `assembleArtifact()` - Manual assembly from components
- `createEmptyArtifact()` - Empty structure for manual population

### Stateless Mode (`src/stateless.ts`)

Privacy-preserving transformations for session use:

```typescript
export function createStatelessArtifact(
  artifact: EdmArtifact
): EdmArtifact
```

Nullifies identifying fields:
- `meta.owner_user_id` → null
- `meta.parent_id` → null
- `milky_way.associated_people` → []
- `milky_way.location_context` → null
- `gravity.recall_triggers` → []
- `gravity.retrieval_keys` → []

Preserves emotional structure:
- All emotion fields retained
- Themes and patterns preserved
- Scores unchanged

### Validator (`src/validator.ts`)

Multi-level validation:

```typescript
// Full artifact validation
export function validateEDM(artifact: unknown): ValidationResult

// Single domain validation
export function validateDomain(domain: DomainName, data: unknown): ValidationResult

// Completeness check
export function validateCompleteness(artifact: EdmArtifact): CompletenessResult
```

Validation features:
- Zod schema validation with detailed errors
- Path-based error reporting
- Required field tracking
- Population rate calculation

## Data Flow

### Extraction Flow

```
User Content (text + image)
         │
         ▼
┌─────────────────────────┐
│   LLM Extraction        │
│   (Claude + prompt)     │
├─────────────────────────┤
│ Outputs:                │
│ - core domain           │
│ - constellation domain  │
│ - milky_way domain      │
│ - gravity domain        │
│ - impulse domain        │
│ - confidence score      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Domain Extractors     │
├─────────────────────────┤
│ Adds:                   │
│ - meta (from metadata)  │
│ - governance (from meta)│
│ - telemetry (from conf) │
│ - system (empty)        │
│ - crosswalks (mapped)   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Schema Validation     │
│   (Zod)                 │
└─────────────────────────┘
         │
         ▼
    EdmArtifact (v0.4.0)
```

### Stateless Flow

```
EdmArtifact (identified)
         │
         ▼
┌─────────────────────────┐
│   Stateless Transform   │
├─────────────────────────┤
│ Nullifies:              │
│ - owner_user_id         │
│ - parent_id             │
│ - associated_people     │
│ - location_context      │
│ - recall_triggers       │
│ - retrieval_keys        │
├─────────────────────────┤
│ Preserves:              │
│ - Emotional structure   │
│ - Themes                │
│ - Scores                │
│ - Archetypes            │
└─────────────────────────┘
         │
         ▼
    EdmArtifact (stateless)
```

## Extension Points

### Custom LLM Models

```typescript
const artifact = await extractFromContent({
  content: { text: "..." },
  metadata: { consentBasis: "consent" },
  model: "claude-opus-4-20250514", // Custom model
});
```

### Custom Anthropic Client

```typescript
const client = new Anthropic({
  apiKey: "custom-key",
  baseURL: "custom-endpoint",
});

const artifact = await extractFromContentWithClient(client, options);
```

### Manual Domain Assembly

```typescript
const extracted = await extractWithLlm(client, content);
const artifact = assembleArtifact(extracted, metadata, context);
```

### Custom Crosswalk Mappings

Extend `createCrosswalks()` in domain-extractors.ts to add:
- Geneva Emotion Wheel mapping
- DSM-5 specifier mapping
- ISO 27557 labels

## Dependencies

### Runtime
- `@anthropic-ai/sdk` - LLM API access
- `zod` - Schema validation

### Development
- `typescript` - Type system
- `vitest` - Testing
- `tsx` - TypeScript execution

### Optional Peer
- `deepadata-ddna-tools` - Artifact sealing
