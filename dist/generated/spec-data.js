/**
 * AUTO-GENERATED from edm-spec@0.8.3 — DO NOT EDIT.
 *
 * Regenerate: npm run generate:spec   (runs automatically in npm run build)
 * Sync guard: tests/spec-data-sync.test.ts fails if this file drifts from
 * the installed edm-spec package.
 *
 * This file exists so the SDK carries the spec's mechanical truth as
 * compiled literals instead of runtime fs/require reads of node_modules —
 * a requirement for serverless bundlers (see 0.8.12 release notes).
 */
/* eslint-disable */
/** Version of the edm-spec package this file was generated from. */
export const EDM_SPEC_VERSION = "0.8.3";
/** Composite profile schemas (edm.v0.8.*.schema.json), verbatim. */
export const SPEC_COMPOSITES = {
    "essential": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://deepadata.com/schemas/edm/v0.8.0/edm.essential.schema.json",
        "title": "EDM v0.8.0 Essential Profile",
        "description": "Lightweight profile for basic emotional context capture. 5 domains, 24 fields. Suitable for journaling apps, companion AI, and scenarios requiring minimal memory footprint.",
        "type": "object",
        "required": [
            "meta",
            "core",
            "constellation",
            "governance",
            "telemetry"
        ],
        "additionalProperties": false,
        "properties": {
            "meta": {
                "description": "Identity, provenance, and consent metadata. Essential profile requires minimal governance fields.",
                "type": "object",
                "required": [
                    "version",
                    "profile",
                    "created_at",
                    "visibility",
                    "pii_tier",
                    "consent_basis"
                ],
                "additionalProperties": false,
                "properties": {
                    "id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Unique identifier for the EDM artifact.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "version": {
                        "type": "string",
                        "description": "EDM schema version.",
                        "pattern": "^0\\.8\\.[0-9]+$"
                    },
                    "profile": {
                        "oneOf": [
                            {
                                "type": "string",
                                "enum": [
                                    "essential",
                                    "extended",
                                    "full"
                                ],
                                "description": "Canonical extraction profile"
                            },
                            {
                                "type": "string",
                                "pattern": "^partner:.+$",
                                "description": "Partner profile ID with namespace prefix per EDM v0.8.0 Section 3.7.2 and ADR-0017 — e.g. partner:com.deepadata.journaling.v1"
                            }
                        ]
                    },
                    "created_at": {
                        "type": "string",
                        "description": "Artifact extraction timestamp.",
                        "format": "date-time"
                    },
                    "updated_at": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Optional post-extraction update timestamp.",
                        "format": "date-time"
                    },
                    "locale": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Linguistic and cultural context.",
                        "pattern": "^[a-z]{2}(-[a-z]{2})?$"
                    },
                    "owner_user_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Artifact owner identifier."
                    },
                    "parent_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Parent artifact link.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "visibility": {
                        "type": "string",
                        "enum": [
                            "private",
                            "shared",
                            "public"
                        ],
                        "description": "Artifact visibility scope."
                    },
                    "pii_tier": {
                        "type": "string",
                        "enum": [
                            "none",
                            "low",
                            "moderate",
                            "high",
                            "extreme"
                        ],
                        "description": "PII classification level."
                    },
                    "consent_basis": {
                        "type": "string",
                        "enum": [
                            "consent",
                            "contract",
                            "legitimate_interest",
                            "none"
                        ],
                        "description": "Legal basis for processing."
                    }
                }
            },
            "core": {
                "description": "Essential emotional primitives. 6 fields for Essential profile (narrative excluded).",
                "type": "object",
                "required": [
                    "anchor",
                    "spark",
                    "wound",
                    "fuel",
                    "bridge",
                    "echo"
                ],
                "additionalProperties": false,
                "properties": {
                    "anchor": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Central person, object, or theme."
                    },
                    "spark": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Trigger of emotional response."
                    },
                    "wound": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Emotional pain or vulnerability."
                    },
                    "fuel": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "What energized the experience."
                    },
                    "bridge": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Connection between past and present."
                    },
                    "echo": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "What continues to resonate."
                    }
                }
            },
            "constellation": {
                "description": "Emotional classification. Essential profile requires primary emotion, subtones, and narrative arc.",
                "type": "object",
                "required": [
                    "emotion_primary",
                    "emotion_subtone",
                    "narrative_arc"
                ],
                "additionalProperties": false,
                "properties": {
                    "emotion_primary": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Dominant emotional quality.",
                        "x_constraints": "Canonical values: joy, sadness, fear, anger, wonder, peace, tenderness, reverence, pride, anxiety, gratitude, longing, hope, shame, disappointment, relief, frustration. Free text accepted."
                    },
                    "emotion_subtone": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "minItems": 0,
                        "maxItems": 4,
                        "description": "Secondary emotional nuances."
                    },
                    "narrative_arc": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Story trajectory.",
                        "x_constraints": "Canonical values: overcoming, transformation, connection, reflection, closure, loss, confrontation. Free text accepted."
                    }
                }
            },
            "governance": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/governance.json"
            },
            "telemetry": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/telemetry.json"
            }
        },
        "definitions": {
            "profile_info": {
                "name": "essential",
                "domains": [
                    "meta",
                    "core",
                    "constellation",
                    "governance",
                    "telemetry"
                ],
                "field_count": 24,
                "use_cases": [
                    "journaling",
                    "companion_ai",
                    "lightweight_memory"
                ]
            }
        }
    },
    "extended": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://deepadata.com/schemas/edm/v0.8.0/edm.extended.schema.json",
        "title": "EDM v0.8.0 Extended Profile",
        "description": "Mid-tier profile for rich emotional context with contextual and gravity domains. 7 domains, 50 fields. Suitable for therapy apps, memory platforms, and scenarios requiring relational context.",
        "type": "object",
        "required": [
            "meta",
            "core",
            "constellation",
            "milky_way",
            "gravity",
            "governance",
            "telemetry"
        ],
        "additionalProperties": false,
        "properties": {
            "meta": {
                "description": "Identity, provenance, and consent metadata. Extended profile includes optional source tracking.",
                "type": "object",
                "required": [
                    "version",
                    "profile",
                    "created_at",
                    "visibility",
                    "pii_tier",
                    "consent_basis"
                ],
                "additionalProperties": false,
                "properties": {
                    "id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Unique identifier for the EDM artifact.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "version": {
                        "type": "string",
                        "description": "EDM schema version.",
                        "pattern": "^0\\.8\\.[0-9]+$"
                    },
                    "profile": {
                        "oneOf": [
                            {
                                "type": "string",
                                "enum": [
                                    "essential",
                                    "extended",
                                    "full"
                                ],
                                "description": "Canonical extraction profile"
                            },
                            {
                                "type": "string",
                                "pattern": "^partner:.+$",
                                "description": "Partner profile ID with namespace prefix per EDM v0.8.0 Section 3.7.2 and ADR-0017 — e.g. partner:com.deepadata.journaling.v1"
                            }
                        ]
                    },
                    "created_at": {
                        "type": "string",
                        "description": "Artifact extraction timestamp.",
                        "format": "date-time"
                    },
                    "updated_at": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Optional post-extraction update timestamp.",
                        "format": "date-time"
                    },
                    "locale": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Linguistic and cultural context.",
                        "pattern": "^[a-z]{2}(-[a-z]{2})?$"
                    },
                    "owner_user_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Artifact owner identifier."
                    },
                    "parent_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Parent artifact link.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "visibility": {
                        "type": "string",
                        "enum": [
                            "private",
                            "shared",
                            "public"
                        ],
                        "description": "Artifact visibility scope."
                    },
                    "pii_tier": {
                        "type": "string",
                        "enum": [
                            "none",
                            "low",
                            "moderate",
                            "high",
                            "extreme"
                        ],
                        "description": "PII classification level."
                    },
                    "source_type": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "text",
                            "audio",
                            "image",
                            "video",
                            "mixed",
                            null
                        ],
                        "description": "Source medium."
                    },
                    "source_context": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Optional input scenario description."
                    },
                    "consent_basis": {
                        "type": "string",
                        "enum": [
                            "consent",
                            "contract",
                            "legitimate_interest",
                            "none"
                        ],
                        "description": "Legal basis for processing."
                    },
                    "consent_scope": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Consent scope description."
                    },
                    "tags": {
                        "type": [
                            "array",
                            "null"
                        ],
                        "items": {
                            "type": "string"
                        },
                        "description": "User-defined labels."
                    }
                }
            },
            "core": {
                "description": "Emotional primitives with narrative. 7 fields for Extended profile.",
                "type": "object",
                "required": [
                    "anchor",
                    "spark",
                    "wound",
                    "fuel",
                    "bridge",
                    "echo"
                ],
                "additionalProperties": false,
                "properties": {
                    "anchor": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Central person, object, or theme."
                    },
                    "spark": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Trigger of emotional response."
                    },
                    "wound": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Emotional pain or vulnerability."
                    },
                    "fuel": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "What energized the experience."
                    },
                    "bridge": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Connection between past and present."
                    },
                    "echo": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "What continues to resonate."
                    },
                    "narrative": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Compressed account of the experience."
                    }
                }
            },
            "constellation": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/constellation.json"
            },
            "milky_way": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/milky_way.json"
            },
            "gravity": {
                "description": "Emotional weight and binding. Extended profile uses core gravity fields.",
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "emotional_weight": {
                        "type": [
                            "number",
                            "null"
                        ],
                        "description": "Felt intensity (0.0-1.0)."
                    },
                    "valence": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "positive",
                            "negative",
                            "mixed",
                            null
                        ],
                        "description": "Emotional direction."
                    },
                    "tether_type": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "person",
                            "symbol",
                            "event",
                            "place",
                            "ritual",
                            "object",
                            "tradition",
                            "identity",
                            null
                        ],
                        "description": "Emotional anchor type."
                    },
                    "recurrence_pattern": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "cyclical",
                            "isolated",
                            "chronic",
                            "emerging",
                            null
                        ],
                        "description": "Temporal recurrence structure."
                    },
                    "strength_score": {
                        "type": [
                            "number",
                            "null"
                        ],
                        "description": "Binding strength (0.0-1.0)."
                    }
                }
            },
            "governance": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/governance.json"
            },
            "telemetry": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/telemetry.json"
            }
        },
        "definitions": {
            "profile_info": {
                "name": "extended",
                "domains": [
                    "meta",
                    "core",
                    "constellation",
                    "milky_way",
                    "gravity",
                    "governance",
                    "telemetry"
                ],
                "field_count": 50,
                "use_cases": [
                    "therapy_apps",
                    "memory_platforms",
                    "relational_context"
                ]
            }
        }
    },
    "full": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "https://deepadata.com/schemas/edm/v0.8.0/edm.full.schema.json",
        "title": "EDM v0.8.0 Full Profile",
        "description": "Complete profile for maximum emotional fidelity. 10 domains, 91 fields. Suitable for clinical applications, research, and scenarios requiring full affective context with interoperability crosswalks.",
        "type": "object",
        "required": [
            "meta",
            "core",
            "constellation",
            "milky_way",
            "gravity",
            "impulse",
            "governance",
            "telemetry",
            "system",
            "crosswalks"
        ],
        "additionalProperties": false,
        "properties": {
            "meta": {
                "description": "Full identity, provenance, and consent metadata with all tracking fields.",
                "type": "object",
                "required": [
                    "version",
                    "profile",
                    "created_at",
                    "visibility",
                    "pii_tier",
                    "consent_basis"
                ],
                "additionalProperties": false,
                "properties": {
                    "id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Unique identifier for the EDM artifact.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "version": {
                        "type": "string",
                        "description": "EDM schema version.",
                        "pattern": "^0\\.8\\.[0-9]+$"
                    },
                    "profile": {
                        "oneOf": [
                            {
                                "type": "string",
                                "enum": [
                                    "essential",
                                    "extended",
                                    "full"
                                ],
                                "description": "Canonical extraction profile"
                            },
                            {
                                "type": "string",
                                "pattern": "^partner:.+$",
                                "description": "Partner profile ID with namespace prefix per EDM v0.8.0 Section 3.7.2 and ADR-0017 — e.g. partner:com.deepadata.journaling.v1"
                            }
                        ]
                    },
                    "created_at": {
                        "type": "string",
                        "description": "Artifact extraction timestamp.",
                        "format": "date-time"
                    },
                    "source_timestamp": {
                        "description": "The timestamp of the original source content, distinct from created_at which marks extraction time",
                        "type": [
                            "string",
                            "null"
                        ],
                        "x_constraints": "ISO-8601 UTC timestamp"
                    },
                    "updated_at": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Post-extraction update timestamp.",
                        "format": "date-time"
                    },
                    "locale": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Linguistic and cultural context.",
                        "pattern": "^[a-z]{2}(-[a-z]{2})?$"
                    },
                    "owner_user_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Artifact owner identifier."
                    },
                    "parent_id": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Parent artifact link.",
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
                    },
                    "visibility": {
                        "type": "string",
                        "enum": [
                            "private",
                            "shared",
                            "public"
                        ],
                        "description": "Artifact visibility scope."
                    },
                    "pii_tier": {
                        "type": "string",
                        "enum": [
                            "none",
                            "low",
                            "moderate",
                            "high",
                            "extreme"
                        ],
                        "description": "PII classification level."
                    },
                    "source_type": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "text",
                            "audio",
                            "image",
                            "video",
                            "mixed",
                            null
                        ],
                        "description": "Source medium."
                    },
                    "source_context": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Input scenario description."
                    },
                    "consent_basis": {
                        "type": "string",
                        "enum": [
                            "consent",
                            "contract",
                            "legitimate_interest",
                            "none"
                        ],
                        "description": "Legal basis for processing."
                    },
                    "consent_scope": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Consent scope description."
                    },
                    "consent_revoked_at": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Consent revocation timestamp.",
                        "format": "date-time"
                    },
                    "tags": {
                        "type": [
                            "array",
                            "null"
                        ],
                        "items": {
                            "type": "string"
                        },
                        "description": "User-defined labels."
                    }
                }
            },
            "core": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/core.json"
            },
            "constellation": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/constellation.json"
            },
            "milky_way": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/milky_way.json"
            },
            "gravity": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/gravity.json"
            },
            "impulse": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/impulse.json"
            },
            "governance": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/governance.json"
            },
            "telemetry": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/telemetry.json"
            },
            "system": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/system.json"
            },
            "crosswalks": {
                "$ref": "https://deepadata.com/schemas/edm/v0.8.0/fragments/crosswalks.json"
            }
        },
        "definitions": {
            "profile_info": {
                "name": "full",
                "domains": [
                    "meta",
                    "core",
                    "constellation",
                    "milky_way",
                    "gravity",
                    "impulse",
                    "governance",
                    "telemetry",
                    "system",
                    "crosswalks"
                ],
                "field_count": 91,
                "use_cases": [
                    "clinical_applications",
                    "research",
                    "full_affective_context",
                    "interoperability"
                ]
            }
        }
    }
};
/** Domain fragment schemas (schema/fragments/*.json), verbatim, keyed by name. */
export const SPEC_FRAGMENTS = {
    "constellation": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM CONSTELLATION Domain",
        "type": "object",
        "properties": {
            "emotion_primary": {
                "description": "The dominant emotional quality expressed in the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "joy",
                    "sadness",
                    "fear",
                    "anger",
                    "wonder",
                    "peace",
                    "tenderness",
                    "reverence",
                    "pride",
                    "anxiety",
                    "gratitude",
                    "longing",
                    "hope",
                    "shame",
                    "disappointment",
                    "relief",
                    "frustration"
                ],
                "x_constraints": "Canonical values: joy, sadness, fear, anger, wonder, peace, tenderness, reverence, pride, anxiety, gratitude, longing, hope, shame, disappointment, relief, frustration. Free text accepted."
            },
            "emotion_subtone": {
                "description": "Secondary emotional nuances that add depth to the primary emotion",
                "type": "array",
                "x_constraints": "0–4 items (e.g., \"bittersweet\", \"grateful\", \"nostalgic\")",
                "items": {
                    "type": "string"
                },
                "minItems": 0,
                "maxItems": 4
            },
            "higher_order_emotion": {
                "description": "Complex or layered emotional state",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"awe\", \"bittersweetness\", \"pride\", \"moral elevation\")"
            },
            "meta_emotional_state": {
                "description": "How the person relates to their own emotional state",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"acceptance\", \"resistance\", \"curiosity\", \"confusion\")"
            },
            "interpersonal_affect": {
                "description": "Emotional posture in relational context",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"warmth\", \"defensiveness\", \"openness\")"
            },
            "narrative_arc": {
                "description": "The underlying trajectory or story movement represented by the moment",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "overcoming",
                    "transformation",
                    "connection",
                    "reflection",
                    "closure",
                    "loss",
                    "confrontation"
                ],
                "x_constraints": "Canonical values: overcoming, transformation, connection, reflection, closure, loss, confrontation. Free text accepted."
            },
            "relational_dynamics": {
                "description": "The dominant relational configuration influencing the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "parent_child",
                    "grandparent_grandchild",
                    "romantic_partnership",
                    "couple",
                    "sibling_bond",
                    "family",
                    "friendship",
                    "friend",
                    "companionship",
                    "colleague",
                    "mentorship",
                    "reunion",
                    "community_ritual",
                    "grief",
                    "self_reflection",
                    "professional",
                    "therapeutic",
                    "service",
                    "adversarial"
                ],
                "x_constraints": "Canonical values: parent_child, grandparent_grandchild, romantic_partnership, couple, sibling_bond, family, friendship, friend, companionship, colleague, mentorship, reunion, community_ritual, grief, self_reflection, professional, therapeutic, service, adversarial. Free text accepted."
            },
            "temporal_context": {
                "description": "The life-stage or temporal frame associated with the experience",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "childhood",
                    "early_adulthood",
                    "midlife",
                    "late_life",
                    "recent",
                    "future",
                    "timeless",
                    null
                ],
                "x_constraints": "childhood, early_adulthood, midlife, late_life, recent, future, timeless"
            },
            "memory_type": {
                "description": "The class of memory the experience represents within personal identity",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "legacy_artifact",
                    "fleeting_moment",
                    "milestone",
                    "reflection",
                    "formative_experience",
                    null
                ],
                "x_constraints": "legacy_artifact, fleeting_moment, milestone, reflection, formative_experience"
            },
            "media_format": {
                "description": "The format through which the experience is captured or expressed",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "photo",
                    "video",
                    "audio",
                    "text",
                    "photo_with_story",
                    null
                ],
                "x_constraints": "photo, video, audio, text, photo_with_story"
            },
            "narrative_archetype": {
                "description": "The archetypal identity the subject embodies — which of the 12 canonical identity archetypes the subject expresses, not a structural role or story function (ADR-0030)",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "hero",
                    "caregiver",
                    "seeker",
                    "sage",
                    "lover",
                    "outlaw",
                    "innocent",
                    "magician",
                    "creator",
                    "everyman",
                    "jester",
                    "ruler",
                    null
                ],
                "x_constraints": "hero, caregiver, seeker, sage, lover, outlaw, innocent, magician, creator, everyman, jester, ruler"
            },
            "symbolic_anchor": {
                "description": "A symbolic or material object, place, or element that concentrates meaning",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"rocking chair\", \"wedding ring\", \"grandmother's kitchen\")"
            },
            "relational_perspective": {
                "description": "The perspective through which the experience is narrated or understood",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "self",
                    "partner",
                    "family",
                    "friends",
                    "community",
                    "humanity",
                    null
                ],
                "x_constraints": "self, partner, family, friends, community, humanity"
            },
            "temporal_rhythm": {
                "description": "The perceived temporal movement or cadence of the emotional event",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "still",
                    "sudden",
                    "rising",
                    "fading",
                    "recurring",
                    "spiraling",
                    "dragging",
                    "suspended",
                    "looping",
                    "cyclic",
                    null
                ],
                "x_constraints": "still, sudden, rising, fading, recurring, spiraling, dragging, suspended, looping, cyclic"
            },
            "identity_thread": {
                "description": "A succinct expression of how the experience connects to personal identity",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Short sentence"
            },
            "expressed_insight": {
                "description": "The explicit realization or conclusion stated by the subject",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Short sentence. Extracted, not inferred"
            },
            "transformational_pivot": {
                "description": "Marks experiences the subject explicitly identifies as life-changing or trajectory-altering at time of extraction",
                "type": "boolean",
                "x_constraints": "true or false"
            },
            "somatic_signature": {
                "description": "Bodily or interoceptive sensations explicitly described by the subject as part of the emotional experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Short phrases extracted from stated physical sensations only; NULL when not mentioned"
            },
            "arc_type": {
                "description": "The structural emotional arc pattern of the experience, encoded at capture time",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "betrayal",
                    "liberation",
                    "grief",
                    "discovery",
                    "resistance",
                    "bond",
                    "moral_awakening",
                    "transformation",
                    "reconciliation",
                    "reckoning",
                    "threshold",
                    "exile",
                    "gratitude",
                    "authenticity"
                ],
                "x_constraints": "betrayal, liberation, grief, discovery, resistance, bond, moral_awakening, transformation, reconciliation, reckoning, threshold, exile, gratitude, authenticity — or free text if no canonical value fits"
            }
        },
        "additionalProperties": false,
        "required": [
            "emotion_primary",
            "emotion_subtone",
            "narrative_arc"
        ]
    },
    "core": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM CORE Domain",
        "type": "object",
        "properties": {
            "anchor": {
                "description": "Central person, object, or theme of the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"grandmother\", \"dad's toolbox\", \"childhood home\")"
            },
            "spark": {
                "description": "What triggered or initiated the emotional response",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"finding old photos\", \"first snow\", \"phone call\")"
            },
            "wound": {
                "description": "Emotional pain, loss, or vulnerability present in the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"abandonment\", \"regret\", \"distance\", \"grief\")"
            },
            "fuel": {
                "description": "What energized or motivated the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"love\", \"shared laughter\", \"curiosity\", \"hope\")"
            },
            "bridge": {
                "description": "Connection or shift between past and present understanding",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"forgiveness\", \"acceptance\", \"returning home\")"
            },
            "echo": {
                "description": "What continues to resonate or recur from the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "1–5 words (e.g., \"her laugh\", \"smell of rain\", \"city lights\")"
            },
            "narrative": {
                "description": "A compressed, faithful account of the experience as described by the source, preserving emotional sequence, temporal markers, and stated context without interpretation",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "3–5 sentences"
            }
        },
        "additionalProperties": false,
        "required": [
            "anchor",
            "spark",
            "wound",
            "fuel",
            "bridge",
            "echo"
        ]
    },
    "crosswalks": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM CROSSWALKS Domain",
        "type": "object",
        "properties": {
            "plutchik_primary": {
                "description": "Mapping hook to Plutchik's primary emotion taxonomy",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text or null"
            },
            "geneva_emotion_wheel": {
                "description": "Mapping hook to a Geneva Emotion Wheel category",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text or null"
            },
            "DSM5_specifiers": {
                "description": "Optional label referencing DSM-5 affective or clinical specifiers",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text or null"
            },
            "ISO_27557_labels": {
                "description": "Alignment point for emerging or future ISO standards relating to emotional or affective data classification",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text or null"
            }
        },
        "additionalProperties": false
    },
    "extensions": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM EXTENSIONS Domain",
        "description": "Optional partner-namespaced semantic enrichments. Each key is a partner or platform identifier. Values are partner-defined objects. Extensions containing semantic enrichment are included in the seal hash when present at seal time. Operational or pipeline metadata belongs in the system domain, not here.",
        "type": "object",
        "additionalProperties": {
            "type": "object"
        }
    },
    "governance": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM GOVERNANCE Domain",
        "type": "object",
        "properties": {
            "jurisdiction": {
                "description": "The regulatory regime governing this artifact",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "GDPR",
                    "CCPA",
                    "HIPAA",
                    "PIPEDA",
                    "LGPD",
                    "None",
                    "Mixed",
                    null
                ]
            },
            "retention_policy": {
                "type": [
                    "object",
                    "null"
                ],
                "properties": {
                    "basis": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "user_defined",
                            "legal",
                            "business_need",
                            null
                        ]
                    },
                    "ttl_days": {
                        "type": [
                            "number",
                            "null"
                        ]
                    },
                    "on_expiry": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "enum": [
                            "soft_delete",
                            "hard_delete",
                            "anonymize",
                            null
                        ]
                    }
                },
                "additionalProperties": false
            },
            "subject_rights": {
                "type": [
                    "object",
                    "null"
                ],
                "properties": {
                    "portable": {
                        "type": [
                            "boolean",
                            "null"
                        ]
                    },
                    "erasable": {
                        "type": [
                            "boolean",
                            "null"
                        ]
                    },
                    "explainable": {
                        "type": [
                            "boolean",
                            "null"
                        ]
                    }
                },
                "additionalProperties": false
            },
            "exportability": {
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "allowed",
                    "restricted",
                    "forbidden",
                    null
                ]
            },
            "k_anonymity": {
                "type": [
                    "object",
                    "null"
                ],
                "properties": {
                    "k": {
                        "type": [
                            "number",
                            "null"
                        ]
                    },
                    "groups": {
                        "type": [
                            "array",
                            "null"
                        ],
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            },
            "policy_labels": {
                "type": [
                    "array",
                    "null"
                ],
                "items": {
                    "type": "string"
                }
            },
            "masking_rules": {
                "type": [
                    "array",
                    "null"
                ],
                "items": {
                    "type": "string"
                }
            }
        },
        "additionalProperties": false,
        "required": [
            "jurisdiction",
            "retention_policy",
            "subject_rights"
        ]
    },
    "gravity": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM GRAVITY Domain",
        "type": "object",
        "properties": {
            "emotional_weight": {
                "description": "The felt intensity of the emotional experience",
                "type": [
                    "number",
                    "null"
                ],
                "x_constraints": "0.0–1.0"
            },
            "emotional_density": {
                "description": "How concentrated or layered the emotional content is",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "low",
                    "medium",
                    "high",
                    null
                ],
                "x_constraints": "low, medium, high"
            },
            "valence": {
                "description": "The qualitative direction of the emotional experience",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "positive",
                    "negative",
                    "mixed",
                    null
                ],
                "x_constraints": "positive, negative, mixed"
            },
            "viscosity": {
                "description": "The perceived \"stickiness\" or persistence of the emotion",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "low",
                    "medium",
                    "high",
                    "enduring",
                    "fluid",
                    null
                ],
                "x_constraints": "low, medium, high, enduring, fluid"
            },
            "gravity_type": {
                "description": "Category or nature of the emotional pull",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"symbolic resonance\", \"relational bond\", \"identity anchor\")"
            },
            "tether_type": {
                "description": "The type of element to which the experience is emotionally anchored",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "person",
                    "symbol",
                    "event",
                    "place",
                    "ritual",
                    "object",
                    "tradition",
                    "identity",
                    "self"
                ],
                "x_constraints": "Canonical: person, symbol, event, place, ritual, object, tradition, identity, self. Free text accepted."
            },
            "recall_triggers": {
                "description": "Sensory or symbolic cues that reactivate the memory",
                "type": [
                    "array",
                    "null"
                ],
                "x_constraints": "Short phrases, lowercase (e.g., \"smell of bread\", \"old songs\", \"rain sounds\")",
                "items": {
                    "type": "string"
                }
            },
            "retrieval_keys": {
                "description": "Compact hooks for memory retrieval",
                "type": [
                    "array",
                    "null"
                ],
                "x_constraints": "3–6 tokens (e.g., \"grandmother\", \"kitchen\", \"warmth\", \"tradition\")",
                "items": {
                    "type": "string"
                }
            },
            "nearby_themes": {
                "description": "Adjacent themes or motifs connected to the experience",
                "type": [
                    "array",
                    "null"
                ],
                "x_constraints": "Concepts or emotions (e.g., \"family\", \"tradition\", \"loss\", \"continuity\")",
                "items": {
                    "type": "string"
                }
            },
            "recurrence_pattern": {
                "description": "The temporal recurrence structure extracted from the experience's context, framing, and temporal markers",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "cyclical",
                    "isolated",
                    "chronic",
                    "emerging"
                ],
                "x_constraints": "Canonical: cyclical, isolated, chronic, emerging. Free text accepted. NULL when pattern cannot be determined."
            },
            "strength_score": {
                "description": "The binding strength of the emotion within the broader emotional network",
                "type": [
                    "number",
                    "null"
                ],
                "x_constraints": "0.0–1.0"
            },
            "temporal_decay": {
                "description": "How quickly the emotional intensity is expected to diminish over time",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "fast",
                    "moderate",
                    "slow",
                    null
                ],
                "x_constraints": "fast, moderate, slow"
            },
            "resilience_markers": {
                "description": "Indicators of stabilizing or constructive emotional processing",
                "type": [
                    "array",
                    "null"
                ],
                "x_constraints": "1–3 items (e.g., \"acceptance\", \"optimism\", \"continuity\")",
                "items": {
                    "type": "string"
                },
                "minItems": 1,
                "maxItems": 3
            },
            "adaptation_trajectory": {
                "description": "How the emotional state is evolving across time",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "improving",
                    "stable",
                    "declining",
                    "integrative",
                    "emerging",
                    null
                ],
                "x_constraints": "improving, stable, declining, integrative, emerging"
            }
        },
        "additionalProperties": false
    },
    "impulse": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM IMPULSE Domain",
        "type": "object",
        "properties": {
            "primary_energy": {
                "description": "Dominant emotional or motivational energy in the moment",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Lowercase (e.g., \"curiosity\", \"fear\", \"compassion\", \"longing\")"
            },
            "drive_state": {
                "description": "The behavioral direction or movement expressed through the emotional response",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "explore",
                    "approach",
                    "avoid",
                    "repair",
                    "persevere",
                    "share",
                    "confront",
                    "protect",
                    "process",
                    null
                ],
                "x_constraints": "explore, approach, avoid, repair, persevere, share, confront, protect, process"
            },
            "motivational_orientation": {
                "description": "The foundational motivational domain guiding the individual's internal stance",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "belonging",
                    "safety",
                    "mastery",
                    "meaning",
                    "autonomy",
                    "authenticity",
                    null
                ],
                "x_constraints": "belonging, safety, mastery, meaning, autonomy, authenticity"
            },
            "temporal_focus": {
                "description": "The temporal direction toward which the motivational energy is oriented",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "past",
                    "present",
                    "future",
                    null
                ],
                "x_constraints": "past, present, future"
            },
            "directionality": {
                "description": "Whether the impulse is self-directed, relational, or expansive beyond self",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "inward",
                    "outward",
                    "transcendent",
                    null
                ],
                "x_constraints": "inward, outward, transcendent"
            },
            "social_visibility": {
                "description": "The social scope within which the impulse is expressed",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "private",
                    "relational",
                    "collective",
                    null
                ],
                "x_constraints": "private, relational, collective"
            },
            "urgency": {
                "description": "The intensity or immediacy of the motivational state",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "calm",
                    "elevated",
                    "pressing",
                    "acute",
                    null
                ],
                "x_constraints": "calm, elevated, pressing, acute"
            },
            "risk_posture": {
                "description": "The stance toward uncertainty or potential risk embedded in the moment",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "cautious",
                    "balanced",
                    "bold",
                    null
                ],
                "x_constraints": "cautious, balanced, bold"
            },
            "agency_level": {
                "description": "The perceived ability to act or influence the situation",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "low",
                    "medium",
                    "high",
                    null
                ],
                "x_constraints": "low, medium, high"
            },
            "regulation_state": {
                "description": "The stability or turbulence of emotional self-regulation",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "regulated",
                    "wavering",
                    "dysregulated",
                    null
                ],
                "x_constraints": "regulated, wavering, dysregulated"
            },
            "attachment_style": {
                "description": "The relational attachment pattern influencing the emotional expression",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "secure",
                    "anxious",
                    "avoidant",
                    "disorganized",
                    null
                ],
                "x_constraints": "secure, anxious, avoidant, disorganized"
            },
            "coping_style": {
                "description": "The primary strategy used to manage or integrate the emotional experience",
                "type": [
                    "string",
                    "null"
                ],
                "x-edm-canonical": [
                    "reframe_meaning",
                    "seek_support",
                    "distract",
                    "ritualize",
                    "confront",
                    "detach",
                    "process"
                ],
                "x_constraints": "Canonical: reframe_meaning, seek_support, distract, ritualize, confront, detach, process. Free text accepted."
            }
        },
        "additionalProperties": false
    },
    "meta": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM META Domain",
        "type": "object",
        "properties": {
            "id": {
                "description": "Unique identifier for the EDM artifact. Required for provenance, linking, auditing, and .ddna envelope binding",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "UUID v4. Immutable"
            },
            "version": {
                "description": "Declares which EDM schema this artifact conforms to and enables safe validation and migration",
                "type": "string",
                "x_constraints": "MUST match the v0.8 line (e.g. \"0.8.2\")."
            },
            "created_at": {
                "description": "Marks when the artifact was extracted. Anchors temporal provenance",
                "type": "string",
                "x_constraints": "ISO-8601 UTC timestamp. Required"
            },
            "source_timestamp": {
                "description": "The timestamp of the original source content, distinct from created_at which marks extraction time",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "ISO-8601 UTC timestamp"
            },
            "updated_at": {
                "description": "Optional timestamp for post-extraction updates. Never replaces created_at",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "ISO-8601 UTC timestamp"
            },
            "locale": {
                "description": "Linguistic and cultural context of the source content",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "BCP-47 language tag (e.g., \"en-au\", \"en-us\"), lowercase"
            },
            "owner_user_id": {
                "description": "The artifact owner identifier. VitaPass enables cross-vendor identity resolution; vendor-specific IDs limit portability. MUST be null in stateless mode",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "VitaPass (recommended), UUID, or free-text; null for stateless"
            },
            "parent_id": {
                "description": "Links this artifact to its parent in multi-step extractions or threaded sequences",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "UUID."
            },
            "visibility": {
                "description": "Determines who may view or process the artifact",
                "type": "string",
                "enum": [
                    "private",
                    "shared",
                    "public"
                ],
                "x_constraints": "private, shared, public"
            },
            "pii_tier": {
                "description": "Classification of personal or sensitive content. Controls retention, masking, and export rules",
                "type": "string",
                "enum": [
                    "none",
                    "low",
                    "moderate",
                    "high",
                    "extreme"
                ],
                "x_constraints": "none, low, moderate, high, extreme"
            },
            "source_type": {
                "description": "The medium from which the artifact was extracted",
                "type": "string",
                "enum": [
                    "text",
                    "audio",
                    "image",
                    "video",
                    "mixed"
                ],
                "x_constraints": "text, audio, image, video, mixed"
            },
            "source_context": {
                "description": "Optional narrative describing the input scenario",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free-text (e.g., \"therapy session\", \"journaling\", \"voice memo\")"
            },
            "consent_basis": {
                "description": "Legal basis for storing and processing emotional data",
                "type": "string",
                "enum": [
                    "consent",
                    "contract",
                    "legitimate_interest",
                    "none"
                ],
                "x_constraints": "consent, contract, legitimate_interest, none"
            },
            "consent_scope": {
                "description": "What the user consented to",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free-text (e.g., \"memory storage\", \"reflection\", \"therapeutic use\")"
            },
            "consent_revoked_at": {
                "description": "If populated, the artifact becomes non-retrievable and non-exportable, except minimal audit form",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "ISO-8601 UTC timestamp"
            },
            "tags": {
                "description": "Optional user-defined labels for organizing or filtering artifacts",
                "type": "array",
                "x_constraints": "Short tokens, lowercase recommended",
                "items": {
                    "type": "string"
                }
            },
            "profile": {
                "description": "Implementation profile declaration. Canonical profile (essential/extended/full) or partner profile ID with 'partner:' prefix per EDM v0.8.0 Section 3.7.2 and ADR-0017. Determines minimum required fields.",
                "oneOf": [
                    {
                        "type": "string",
                        "enum": [
                            "essential",
                            "extended",
                            "full"
                        ]
                    },
                    {
                        "type": "string",
                        "pattern": "^partner:.+$"
                    }
                ],
                "x-edm-canonical": [
                    "essential",
                    "extended",
                    "full"
                ],
                "x_constraints": "essential, extended, full, or partner:<id> per ADR-0017. Required for v0.8.0 conformance"
            }
        },
        "additionalProperties": false,
        "required": [
            "version",
            "created_at",
            "visibility",
            "pii_tier",
            "source_type",
            "consent_basis",
            "tags"
        ]
    },
    "milky_way": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM MILKY_WAY Domain",
        "type": "object",
        "properties": {
            "event_type": {
                "description": "Type of event or situation",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"family gathering\", \"farewell\", \"birthday\", \"reunion\")"
            },
            "location_context": {
                "description": "Place or spatial context of the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"grandmother's kitchen\", \"beach\", \"hospital\")"
            },
            "associated_people": {
                "description": "Individuals referenced in or connected to the experience",
                "type": "array",
                "x_constraints": "Names or roles, properly cased (e.g., \"Sarah\", \"my father\", \"the nurse\")",
                "items": {
                    "type": "string"
                }
            },
            "visibility_context": {
                "description": "Defines the intended visibility or sharing scope of the moment",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "private",
                    "family_only",
                    "shared_publicly",
                    null
                ],
                "x_constraints": "private, family_only, shared_publicly"
            },
            "tone_shift": {
                "description": "Directional emotional change during the experience",
                "type": [
                    "string",
                    "null"
                ],
                "x_constraints": "Free text (e.g., \"loss to gratitude\", \"fear to relief\", \"joy to sadness\")"
            }
        },
        "additionalProperties": false
    },
    "system": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM SYSTEM Domain",
        "type": "object",
        "properties": {
            "embeddings": {
                "description": "Embedding references associated with this artifact. Platform-managed. Not populated at extraction time. Excluded from seal hash.",
                "type": [
                    "array",
                    "null"
                ],
                "items": {
                    "type": "object",
                    "properties": {
                        "provider": {
                            "type": "string"
                        },
                        "sector": {
                            "type": "string"
                        },
                        "dim": {
                            "type": "number"
                        },
                        "quantized": {
                            "type": "boolean"
                        },
                        "vector_ref": {
                            "type": "string"
                        }
                    }
                }
            },
            "indices": {
                "type": [
                    "object",
                    "null"
                ],
                "properties": {
                    "waypoint_ids": {
                        "description": "Identifiers for retrieval waypoints",
                        "type": [
                            "array",
                            "null"
                        ],
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "additionalProperties": false
            }
        },
        "additionalProperties": false
    },
    "telemetry": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "EDM TELEMETRY Domain",
        "type": "object",
        "properties": {
            "entry_confidence": {
                "description": "Confidence score for extraction accuracy",
                "type": [
                    "number",
                    "null"
                ]
            },
            "extraction_model": {
                "description": "Model identifier used for extraction",
                "type": [
                    "string",
                    "null"
                ]
            },
            "extraction_provider": {
                "description": "Provider of the extraction model",
                "type": [
                    "string",
                    "null"
                ],
                "enum": [
                    "anthropic",
                    "openai",
                    "kimi",
                    null
                ]
            },
            "extraction_notes": {
                "description": "Optional notes about extraction quality",
                "type": [
                    "string",
                    "null"
                ]
            }
        },
        "additionalProperties": false,
        "required": [
            "entry_confidence",
            "extraction_model"
        ]
    }
};
//# sourceMappingURL=spec-data.js.map