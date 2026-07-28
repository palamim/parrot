import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const STYLE_GUIDE_SCHEMA = {
  type: "object",
  properties: {
    styleGuide: { type: "string" },
    summary: { type: "string" },
  },
  required: ["styleGuide", "summary"],
  additionalProperties: false,
} as const;

const CURATOR_SYSTEM_PROMPT = `You maintain the style guide for a tool that turns a developer's recent git commit history into tweet-sized post drafts. The style guide is the only thing that varies between runs — it captures voice, tone, calibration, and what kinds of changes are worth posting about. The tool's mechanical constraints (length, format, "no hashtags") are fixed elsewhere and are not your concern.

The user never edits this file by hand — you are its sole author. Each time you're called you receive the current style guide (empty if none exists yet), the batch of draft tweets the user just reviewed, and free-form feedback the user gave about that batch.

Rewrite the whole style guide from scratch each time — never just append the new note. Merge it coherently with what's already there: keep prior guidance the new feedback doesn't touch, and let the new feedback win where it contradicts something existing. Write it as direct instructions to the drafting model ("Keep it understated when...", not "The user prefers..."). Favor a few sharp, example-grounded rules over a long list of vague ones, and keep the whole thing concise.

Also write a one-line, plain-English summary of what changed this time, for the user to glance at.`;

export async function updateStyleGuide(
  currentStyleGuide: string | null,
  tweets: string[],
  feedback: string,
): Promise<{ styleGuide: string; summary: string }> {
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: CURATOR_SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: STYLE_GUIDE_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `Current style guide:\n${currentStyleGuide ?? "(none yet)"}\n\nDraft tweets from this run:\n${tweets.map((tweet, i) => `${i + 1}. ${tweet}`).join("\n")}\n\nUser feedback on this batch:\n${feedback}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("curator response contained no text content");
  }
  return JSON.parse(block.text) as { styleGuide: string; summary: string };
}
