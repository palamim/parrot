import "dotenv/config";
import { Command } from "commander";
import { scanRecentActivity, LOOKBACK_DAYS } from "./scan.js";
import { generateTweets } from "./summarize.js";
import { startSpinner } from "./spinner.js";
import { parrotBanner } from "./parrot.js";
import { loadStyleGuide } from "./style.js";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

const program = new Command()
  .name("parrot")
  .argument("[directory]", "folder to scan for repos")
  .option("--style <path>", "path to a style guide file (see PARROT_STYLE_FILE in .env.example)")
  .parse();

const [directoryArg] = program.args;
const { style: styleArg } = program.opts<{ style?: string }>();

const parentDir = directoryArg ?? process.env.PROJECTS_ROOT ?? process.cwd();
const styleGuide = loadStyleGuide(styleArg);

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
}
