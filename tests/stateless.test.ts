/**
 * Stateless Mode Tests
 */
import { describe, it, expect } from "vitest";
import { createStatelessArtifact, isStateless, validateStateless } from "../src/stateless.js";
import { createEmptyArtifact } from "../src/assembler.js";
import type { EdmArtifact } from "../src/schema/types.js";

function createTestArtifact(): EdmArtifact {
  const artifact = createEmptyArtifact();
  // Populate with identifying information
  artifact.meta.owner_user_id = "user-123";
  artifact.meta.parent_id = "parent-456";
  artifact.meta.tags = ["personal", "family"];
  artifact.milky_way.associated_people = ["Sarah", "John"];
  artifact.milky_way.location_context = "123 Main Street";
  artifact.gravity.recall_triggers = ["smell of her perfume", "the old oak tree"];
  artifact.gravity.retrieval_keys = ["grandmother", "kitchen", "1985"];
  artifact.gravity.nearby_themes = ["family", "tradition", "loss"];
  return artifact;
}

describe("createStatelessArtifact", () => {
  it("should null out owner_user_id", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.meta.owner_user_id).toBeNull();
  });

  it("should null out parent_id", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.meta.parent_id).toBeNull();
  });

  it("should clear tags", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.meta.tags).toEqual([]);
  });

  it("should clear associated_people", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.milky_way.associated_people).toEqual([]);
  });

  it("should null out location_context", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.milky_way.location_context).toBeNull();
  });

  it("should clear recall_triggers", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.gravity.recall_triggers).toEqual([]);
  });

  it("should clear retrieval_keys", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.gravity.retrieval_keys).toEqual([]);
  });

  it("should preserve nearby_themes", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(stateless.gravity.nearby_themes).toEqual(["family", "tradition", "loss"]);
  });

  it("should preserve emotional structure", () => {
    const original = createTestArtifact();
    original.gravity.emotional_weight = 0.85;
    original.gravity.valence = "positive";
    original.gravity.viscosity = "enduring";

    const stateless = createStatelessArtifact(original);

    expect(stateless.gravity.emotional_weight).toBe(0.85);
    expect(stateless.gravity.valence).toBe("positive");
    expect(stateless.gravity.viscosity).toBe("enduring");
  });

  it("should restrict exportability", () => {
    const original = createTestArtifact();
    original.governance.exportability = "allowed";

    const stateless = createStatelessArtifact(original);
    expect(stateless.governance.exportability).toBe("restricted");
  });

  it("should clear embeddings and waypoints", () => {
    const original = createTestArtifact();
    original.system.embeddings = [
      {
        provider: "test",
        sector: "episodic",
        dim: 768,
        quantized: false,
        vector_ref: "ref-123",
      },
    ];
    original.system.indices.waypoint_ids = ["wp-1", "wp-2"];

    const stateless = createStatelessArtifact(original);

    expect(stateless.system.embeddings).toEqual([]);
    expect(stateless.system.indices.waypoint_ids).toEqual([]);
  });

  it("should not modify original artifact", () => {
    const original = createTestArtifact();
    const originalOwnerId = original.meta.owner_user_id;

    createStatelessArtifact(original);

    expect(original.meta.owner_user_id).toBe(originalOwnerId);
  });
});

describe("isStateless", () => {
  it("should return true for properly stateless artifact", () => {
    const original = createTestArtifact();
    const stateless = createStatelessArtifact(original);
    expect(isStateless(stateless)).toBe(true);
  });

  it("should return false if owner_user_id present", () => {
    const stateless = createStatelessArtifact(createTestArtifact());
    stateless.meta.owner_user_id = "should-not-be-here";
    expect(isStateless(stateless)).toBe(false);
  });

  it("should return false if associated_people present", () => {
    const stateless = createStatelessArtifact(createTestArtifact());
    stateless.milky_way.associated_people = ["someone"];
    expect(isStateless(stateless)).toBe(false);
  });

  it("should return false if location_context present", () => {
    const stateless = createStatelessArtifact(createTestArtifact());
    stateless.milky_way.location_context = "somewhere";
    expect(isStateless(stateless)).toBe(false);
  });
});

describe("validateStateless", () => {
  it("should pass for compliant artifact", () => {
    const stateless = createStatelessArtifact(createTestArtifact());
    const result = validateStateless(stateless);
    expect(result.compliant).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("should report all violations", () => {
    const artifact = createTestArtifact(); // Not stateless
    const result = validateStateless(artifact);

    expect(result.compliant).toBe(false);
    expect(result.violations).toContain("meta.owner_user_id must be null in stateless mode");
    expect(result.violations).toContain("milky_way.associated_people must be empty in stateless mode");
    expect(result.violations).toContain("milky_way.location_context must be null in stateless mode");
    expect(result.violations).toContain("gravity.recall_triggers must be empty in stateless mode");
    expect(result.violations).toContain("gravity.retrieval_keys must be empty in stateless mode");
  });
});
