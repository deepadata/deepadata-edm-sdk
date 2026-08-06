/**
 * Regression tests for finding F1 (0.8.14 overnight validation,
 * 2026-08-05): markdown-annotated / unterminated code fences around the
 * model's JSON broke the strict fence-stripper on 5/60 corpus runs, all
 * large technical documents. Shapes below reproduce the observed
 * failures: preamble above the fence (17.txt emitted a heading line),
 * missing closing fence, and combinations.
 */
import { describe, it, expect } from "vitest";
import { parseLlmJson } from "../src/extractors/json-recovery.js";

/** A representative extraction payload; braces/quotes in values on purpose */
const payload = {
  core: {
    anchor: "terminal log review",
    narrative: 'The doc says {"level":"warn"} and closes with ``` markers.',
  },
  gravity: { emotional_weight: 0.4 },
};
const payloadJson = JSON.stringify(payload, null, 2);

describe("parseLlmJson — pre-0.8.15 behavior preserved", () => {
  it("parses bare JSON", () => {
    expect(parseLlmJson(payloadJson)).toEqual(payload);
  });

  it("parses a well-formed ```json fence", () => {
    expect(parseLlmJson("```json\n" + payloadJson + "\n```")).toEqual(payload);
  });

  it("parses a bare ``` fence", () => {
    expect(parseLlmJson("```\n" + payloadJson + "\n```")).toEqual(payload);
  });

  it("parses with surrounding whitespace", () => {
    expect(parseLlmJson("\n\n  ```json\n" + payloadJson + "\n```  \n")).toEqual(payload);
  });
});

describe("parseLlmJson — F1 failing shapes", () => {
  it("recovers when a markdown preamble precedes the fence (17.txt shape)", () => {
    const text =
      "# Emotional Memory Extraction — Technical Document Analysis\n\n" +
      "```json\n" + payloadJson + "\n```";
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("recovers when the closing fence is missing", () => {
    const text = "```json\n" + payloadJson;
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("recovers preamble + unterminated fence combined", () => {
    const text = "Here is the extraction:\n\n```json\n" + payloadJson;
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("recovers an annotated fence the strict regex rejects", () => {
    const text = "```json markdown\n" + payloadJson + "\n```";
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("recovers when commentary follows the closing fence", () => {
    const text =
      "```json\n" + payloadJson + "\n```\n\nThis extraction reflects the document's tone.";
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("skips non-JSON brace groups in the preamble", () => {
    const text =
      "Analysis {see summary below} follows:\n\n```json\n" + payloadJson + "\n```";
    expect(parseLlmJson(text)).toEqual(payload);
  });

  it("respects braces and escaped quotes inside string values", () => {
    const tricky = { core: { narrative: 'He said \\"go\\" — then {paused}… }}{{' } };
    const text = "Preamble\n```json\n" + JSON.stringify(tricky);
    expect(parseLlmJson(text)).toEqual(tricky);
  });
});

describe("parseLlmJson — genuine failures still throw", () => {
  it("throws on text with no JSON object", () => {
    expect(() => parseLlmJson("I could not produce an extraction.")).toThrow();
  });

  it("throws on a truncated (never-balanced) object", () => {
    expect(() => parseLlmJson('```json\n{"core": {"anchor": "cut off')).toThrow();
  });

  it("throws on empty input", () => {
    expect(() => parseLlmJson("")).toThrow();
  });
});
