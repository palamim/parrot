import Anthropic from "@anthropic-ai/sdk";
import type { RepoCommits } from "./scan.js";

const client = new Anthropic();

const TWEET_SCHEMA = {
  type: "object",
  properties: {
    tweets: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["tweets"],
  additionalProperties: false,
} as const;

export async function generateTweets(
  activity: RepoCommits[],
  styleGuide?: string | null,
): Promise<string[]> {
  const commitLog = activity
    .map(({ repo, commits }) => `## ${repo}\n${commits.join("\n\n")}`)
    .join("\n\n");

  const instruction = styleGuide
    ? `Here is a style guide. Follow it as the primary instruction for voice and for what to post about — it overrides any default assumptions about tone or framing:\n\n${styleGuide}\n\nHere is git commit history from the last 7 days across several repos, including each commit's full message and diffstat (files changed, insertions/deletions). Use it only as raw material for claims — every post must be grounded in something the log actually shows, but do not narrate the work ("shipped X", "built Y this week"). Extract the underlying claim or observation instead, in the voice above:\n\n${commitLog}\n\nWrite 5 tweet-sized (under 280 characters) posts. No hashtags, no emoji, no quotation marks around the tweet.`
    : `Here is git commit history from the last 7 days across several repos, including each commit's full message and diffstat (files changed, insertions/deletions):\n\n${commitLog}\n\nWrite 5 tweet-sized (under 280 characters) posts for a tech/research-oriented X audience, inspired by this work. Prefer concrete numbers (counts, sizes, percentages) when the log supports them; otherwise write a punchy technical or research-flavored observation. No hashtags, no emoji, no quotation marks around the tweet.`;

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 2048,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: TWEET_SCHEMA },
    },
    messages: [{ role: "user", content: instruction }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return [];
  const parsed = JSON.parse(block.text) as { tweets: string[] };
  return parsed.tweets;
}
