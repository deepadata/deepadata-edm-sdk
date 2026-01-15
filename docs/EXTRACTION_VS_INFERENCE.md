# Extraction vs. Inference: The Interpretation Boundary

This document explains the critical distinction between **extraction** and **inference** in the context of emotional data processing, and why the deepadata-edm-sdk operates strictly within extraction boundaries.

## The Fundamental Distinction

### Extraction (What This SDK Does)

Extraction identifies and structures information that is **explicitly present or clearly implied** in the source content. The LLM acts as a sophisticated parser, not a psychologist.

**Examples of extraction:**

| Input | Output | Why This Is Extraction |
|-------|--------|------------------------|
| "I felt so happy when I saw her smile" | `emotion_primary: "joy"` | Emotion explicitly stated |
| "The smell of fresh bread always reminds me of grandmother's kitchen" | `recall_triggers: ["smell of bread"]` | Trigger explicitly described |
| "Looking at the old photograph" | `media_format: "photo"` | Medium explicitly mentioned |
| "I was 8 years old when this happened" | `temporal_context: "childhood"` | Age explicitly stated |

### Inference (What This SDK Does NOT Do)

Inference involves **deriving unstated conclusions** about psychological states, traits, or predictions. This crosses into territory that requires clinical expertise and consent for psychological assessment.

**Examples of inference (NOT performed):**

| Input | Problematic Output | Why This Would Be Inference |
|-------|-------------------|----------------------------|
| "I often cancel plans at the last minute" | `attachment_style: "avoidant"` | Behavior doesn't prove attachment style |
| "I felt sad when she left" | `diagnosis: "depression"` | Single emotion doesn't indicate disorder |
| "I keep old letters in a box" | `hoarding_tendency: true` | Keeping mementos is not pathological |
| "I miss my grandmother" | `grief_stage: "depression"` | Missing someone isn't a clinical stage |

## How The SDK Enforces The Boundary

### 1. Prompt Constraints

The LLM system prompt explicitly instructs:

```
- No invention. If not supported by input, use null.
- If motivation is ambiguous, choose the most conservative option or return null.
```

### 2. Schema Design

Fields are designed to capture **observable** or **stated** information:

- `emotion_primary`: What emotion was **expressed**
- `expressed_insight`: What insight the subject **stated** (not what we infer they learned)
- `somatic_signature`: Physical sensations **explicitly described**

### 3. Null Preference

When information isn't clearly present, the SDK returns `null` rather than guessing:

```typescript
// GOOD: Returning null when uncertain
{
  "attachment_style": null,  // Not clearly evident
  "coping_style": null       // Ambiguous from input
}

// BAD: Guessing based on limited evidence
{
  "attachment_style": "anxious",  // Inferred from tone
  "coping_style": "avoidant"      // Assumed from behavior
}
```

## Field-by-Field Extraction Guidance

### CORE Domain

| Field | Extraction Approach |
|-------|---------------------|
| `anchor` | Central subject mentioned in narrative |
| `spark` | Event/stimulus described as triggering the memory |
| `wound` | Pain/loss explicitly mentioned or strongly implied |
| `fuel` | Energy source described (e.g., "motivated by") |
| `bridge` | Connection stated between past and present |
| `echo` | What the subject says "still resonates" |
| `narrative` | Compressed, faithful summary without embellishment |

### CONSTELLATION Domain

| Field | Extraction Approach |
|-------|---------------------|
| `emotion_primary` | Dominant emotion expressed (stated or clearly shown) |
| `emotion_subtone` | Additional emotions mentioned |
| `narrative_archetype` | Role the subject describes playing, not what we assign |
| `transformational_pivot` | Only `true` if subject explicitly identifies as life-changing |
| `expressed_insight` | Verbatim or near-verbatim insight stated by subject |

### IMPULSE Domain

| Field | Extraction Approach |
|-------|---------------------|
| `drive_state` | Action orientation described ("I wanted to...") |
| `temporal_focus` | Where attention is described as directed |
| `attachment_style` | Only if clearly evident from described relationships |
| `coping_style` | Only if coping mechanism is explicitly described |

## Conservative Defaults

When uncertain, the SDK applies conservative interpretation:

1. **Prefer null** over uncertain classification
2. **Choose less severe** options when ambiguous
3. **Shorter phrases** to avoid adding meaning
4. **Quoted content** when extracting insights

## Why This Matters

### Legal Compliance

The EU AI Act and similar regulations treat emotion **inference** systems as high-risk, requiring:
- Risk assessments
- Human oversight
- Transparency about automated decision-making

Emotion **extraction** (classification of stated content) carries lower regulatory burden when:
- No psychological predictions are made
- No automated decisions based on emotional state
- User maintains control over their data

### Ethical Responsibility

Emotion inference can:
- Pathologize normal emotional experiences
- Create false psychological profiles
- Enable discrimination based on predicted traits

By staying within extraction boundaries, we:
- Respect user autonomy
- Avoid amateur psychology
- Create useful metadata without overreach

### Data Quality

Extraction produces:
- **Verifiable** claims (can check against source)
- **Reproducible** results (another LLM would extract similarly)
- **Bounded** confidence (we know what we don't know)

Inference produces:
- **Unfalsifiable** claims (can't prove psychological state)
- **Model-dependent** results (different models, different conclusions)
- **Unbounded** uncertainty (unknown unknowns)

## Summary

| Dimension | Extraction | Inference |
|-----------|------------|-----------|
| Source | Stated or clearly implied | Derived from patterns |
| Verification | Can check against input | Cannot verify |
| Expertise | Information structuring | Psychological interpretation |
| Risk level | Lower | Higher |
| Regulatory | Simpler compliance | Complex requirements |
| Default | Null when uncertain | Makes predictions |

The deepadata-edm-sdk is designed, tested, and documented to operate exclusively within extraction boundaries. When in doubt, we return `null`.
