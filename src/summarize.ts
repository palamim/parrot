import Anthropic from "@anthropic-ai/sdk";
import { LOOKBACK_DAYS, type RepoCommits } from "./scan.js";

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

// Frozen mechanics — format only, nothing about tone or voice. Those are
// taste calls that belong in the style guide below, which a separate curator
// step maintains from user feedback (see curator.ts). Don't fold voice
// opinions in here, even ones that seem universal — someone else's taste
// may disagree, and this is the one place that can't hear feedback.
const MECHANICS_INSTRUCTION = `Write 5 tweet-sized (under 280 characters, prefix included) posts. No hashtags, no emoji, no quotation marks around the tweet. Every post must be grounded in something the commit log actually shows — don't invent details it doesn't support. Start each tweet with the name of the repo it's about, formatted as "reponame: ", using the repo names exactly as given in the commit log headers.`;

// Bootstrap voice — a starting opinion, not a rule. Used only until the
// curator has produced a real style guide from feedback (see curator.ts /
// style.ts), and fully replaced (not merged) once one exists.
export const DEFAULT_VOICE = `Write for a tech/research-oriented X audience, inspired by this work. Prefer concrete numbers (counts, sizes, percentages) when the log supports them; otherwise write a punchy technical or research-flavored observation. Avoid narrating the work as an announcement ("shipped X", "built Y this week") — extract the underlying claim instead. Match how elaborate or dramatic each post sounds to the actual size of the change: small, low-stakes changes should read as plain, low-key observations, not major launches.`;

export async function generateTweets(
  activity: RepoCommits[],
  styleGuide?: string | null,
): Promise<string[]> {
  const commitLog = activity
    .map(({ repo, commits }) => `## ${repo}\n${commits.join("\n\n")}`)
    .join("\n\n");

  const styleSection = styleGuide
    ? `Voice and topic guidance, accumulated from your past feedback — follow it as the primary instruction for tone and what to post about, overriding any default assumptions:\n\n${styleGuide}`
    : DEFAULT_VOICE;

  const instruction = `Here is git commit history from the last ${LOOKBACK_DAYS} days across several repos, including each commit's full message and diffstat (files changed, insertions/deletions):\n\n${commitLog}\n\n${styleSection}\n\n${MECHANICS_INSTRUCTION}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    output_config: {
      format: { type: "json_schema", schema: TWEET_SCHEMA },
    },
    messages: [{ role: "user", content: instruction }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return [];
  const parsed = JSON.parse(block.text) as { tweets: string[] };
  return parsed.tweets;
}
