const IMAGE_ANALYSIS_PROMPT = `
Analyze this image to extract context for an emotional memory. Return ONLY a JSON object with these fields:

{
  "location": "place or setting visible (or null)",
  "people": ["list of people/roles visible"],
  "symbols": ["symbolic objects, artifacts, or meaningful elements"],
  "eventType": "type of event if discernible (or null)",
  "temporalCues": "era, season, time indicators (or null)",
  "emotionalTone": "overall mood conveyed by the image (or null)"
}

Rules:
- Only extract what is visually evident
- Do not invent or assume
- Use lowercase except for proper names
- Keep descriptions brief (1-3 words each)
- Return valid JSON only, no commentary
`;
/**
 * Analyze an image to extract grounding context
 */
export async function analyzeImage(client, imageBase64, mediaType = "image/jpeg", model = "claude-sonnet-4-20250514") {
    const response = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: mediaType,
                            data: imageBase64,
                        },
                    },
                    {
                        type: "text",
                        text: IMAGE_ANALYSIS_PROMPT,
                    },
                ],
            },
        ],
    });
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from image analysis");
    }
    try {
        const parsed = JSON.parse(textBlock.text);
        return {
            location: parsed.location ?? null,
            people: Array.isArray(parsed.people) ? parsed.people : [],
            symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
            eventType: parsed.eventType ?? null,
            temporalCues: parsed.temporalCues ?? null,
            emotionalTone: parsed.emotionalTone ?? null,
        };
    }
    catch {
        // Return empty context on parse failure
        return {
            location: null,
            people: [],
            symbols: [],
            eventType: null,
            temporalCues: null,
            emotionalTone: null,
        };
    }
}
/**
 * Merge image context into extracted fields
 * Image provides grounding, text takes priority for interpretation
 */
export function mergeImageContext(extracted, imageContext) {
    // Only fill null fields - text takes priority
    if (!extracted.milky_way.location_context && imageContext.location) {
        extracted.milky_way.location_context = imageContext.location;
    }
    // Merge people lists
    if (imageContext.people.length > 0) {
        const existingLower = extracted.milky_way.associated_people.map((p) => p.toLowerCase());
        for (const person of imageContext.people) {
            if (!existingLower.includes(person.toLowerCase())) {
                extracted.milky_way.associated_people.push(person);
            }
        }
    }
    // Event type from image if not in text
    if (!extracted.milky_way.event_type && imageContext.eventType) {
        extracted.milky_way.event_type = imageContext.eventType;
    }
    // Symbolic anchor from image symbols
    if (!extracted.constellation.symbolic_anchor && imageContext.symbols.length > 0) {
        extracted.constellation.symbolic_anchor = imageContext.symbols[0] ?? null;
    }
}
//# sourceMappingURL=image-analyzer.js.map