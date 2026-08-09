/**
 * Empty-Input Guard Tests (F2, 2026-08-05 overnight validation)
 *
 * Empty and whitespace-only inputs previously reached the provider and
 * burned a round-trip to receive a 400. The guard rejects them SDK-side
 * with a typed error before any provider client is created — no API key
 * is needed for these tests to prove no provider call happens.
 */
import { describe, it, expect } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import {
  extractFromContent,
  extractFromContentWithClient,
  EmptyInputError,
  assertExtractableInput,
} from "../src/assembler.js";
import type { ExtractionMetadata } from "../src/schema/types.js";

const metadata: ExtractionMetadata = { consentBasis: "consent" };

describe("EmptyInputError shape", () => {
  it("carries a stable name, code, and informative message", () => {
    const err = new EmptyInputError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("EmptyInputError");
    expect(err.code).toBe("EMPTY_INPUT");
    expect(err.message).toContain("empty or whitespace-only");
    expect(err.message).toContain("No provider call was made");
  });
});

describe("assertExtractableInput", () => {
  it("throws EmptyInputError on empty string", () => {
    expect(() => assertExtractableInput({ text: "" })).toThrow(EmptyInputError);
  });

  it("throws EmptyInputError on whitespace-only text (spaces, tabs, newlines)", () => {
    expect(() => assertExtractableInput({ text: "   \n\t \r\n  " })).toThrow(EmptyInputError);
  });

  it("allows non-empty text", () => {
    expect(() => assertExtractableInput({ text: "I finally told her the truth." })).not.toThrow();
  });

  it("allows image-only input (empty text, image present)", () => {
    expect(() =>
      assertExtractableInput({ text: "", image: "aGVsbG8=", imageMediaType: "image/png" })
    ).not.toThrow();
  });
});

describe("extractFromContent rejects before any provider call", () => {
  it("rejects empty text with EmptyInputError", async () => {
    await expect(
      extractFromContent({ content: { text: "" }, metadata })
    ).rejects.toBeInstanceOf(EmptyInputError);
  });

  it("rejects whitespace-only text with EmptyInputError", async () => {
    await expect(
      extractFromContent({ content: { text: " \n\t " }, metadata })
    ).rejects.toBeInstanceOf(EmptyInputError);
  });

  it("rejects with the EMPTY_INPUT code on the error", async () => {
    await expect(
      extractFromContent({ content: { text: "" }, metadata })
    ).rejects.toMatchObject({ code: "EMPTY_INPUT", name: "EmptyInputError" });
  });
});

describe("extractFromContentWithClient rejects before touching the client", () => {
  it("rejects empty text without using the provided client", async () => {
    // A hollow client proves the guard fires before any client method is
    // reached — any property access would throw a TypeError instead.
    const hollowClient = {} as Anthropic;
    await expect(
      extractFromContentWithClient(hollowClient, { content: { text: "" }, metadata })
    ).rejects.toBeInstanceOf(EmptyInputError);
  });
});
