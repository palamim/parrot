import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Command } from "commander";
import { scanRecentActivity, LOOKBACK_DAYS } from "./scan.js";
import { generateTweets, DEFAULT_VOICE } from "./summarize.js";
import { updateStyleGuide } from "./curator.js";
import { startSpinner } from "./spinner.js";
import { parrotBanner } from "./parrot.js";
import { loadStyleGuide, saveStyleGuide } from "./style.js";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

const program = new Command()
  .name("parrot")
  .argument("[directory]", "folder to scan for repos")
  .option("--style <path>", "path to a style guide file (see PARROT_STYLE_FILE in .env.example)")
  .option("--no-feedback", "skip the end-of-run feedback prompt")
  .parse();

const [directoryArg] = program.args;
const { style: styleArg, feedback: feedbackEnabled } = program.opts<{
  style?: string;
  feedback: boolean;
}>();

const parentDir = directoryArg ?? process.env.PROJECTS_ROOT ?? process.cwd();
const styleGuide = loadStyleGuide(styleArg);

async function collectFeedback(tweets: string[]): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let note: string;
  try {
    note = (
      await rl.question(
        `\n${DIM}Anything to tell parrot about this batch, to shape future drafts? (Enter to skip)${RESET}\n> `,
      )
    ).trim();
  } finally {
    rl.close();
  }
  if (!note) return;

  const stopSpinner = startSpinner("Updating style guide");
  try {
    const { styleGuide: updated, summary } = await updateStyleGuide(
      styleGuide ?? DEFAULT_VOICE,
      tweets,
      note,
    );
    saveStyleGuide(updated, styleArg);
    stopSpinner();
    console.log(`${DIM}Updated parrot.style.md — ${summary}${RESET}`);
  } catch (err) {
    stopSpinner();
    console.log(`${DIM}Couldn't update the style guide: ${(err as Error).message}${RESET}`);
  }
}

console.log(parrotBanner());

const activity = scanRecentActivity(parentDir);

if (activity.length === 0) {
  console.log(`No commits from the last ${LOOKBACK_DAYS} days found under ${parentDir}`);
} else {
  const totalCommits = activity.reduce((sum, { commits }) => sum + commits.length, 0);
  console.log(
    `${DIM}Reading ${activity.length} repos, ${totalCommits} commits from the last ${LOOKBACK_DAYS} days:${RESET}`,
  );
  for (const { repo, commits } of activity) {
    console.log(`  ${BOLD}${repo}${RESET} ${DIM}(${commits.length} commits)${RESET}`);
  }
  if (styleGuide) {
    console.log(`${DIM}Using style guide${RESET}`);
  }

  console.log(`\n${GREEN}--- tweet drafts ---${RESET}`);
  const stopSpinner = startSpinner("Parroting");
  const tweets = await generateTweets(activity, styleGuide);
  stopSpinner();
  tweets.forEach((tweet, i) => console.log(`\n${BOLD}${i + 1}.${RESET} ${tweet}`));

  if (feedbackEnabled && tweets.length > 0 && process.stdin.isTTY && process.stdout.isTTY) {
    await collectFeedback(tweets);
  }
}
