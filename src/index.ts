import "dotenv/config";
import { scanRecentActivity } from "./scan.js";
import { generateTweets } from "./summarize.js";
import { startSpinner } from "./spinner.js";
import { parrotBanner } from "./parrot.js";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

const parentDir = process.argv[2] ?? process.env.PROJECTS_ROOT ?? process.cwd();

console.log(parrotBanner());

const activity = scanRecentActivity(parentDir);

if (activity.length === 0) {
  console.log(`No commits from the last 7 days found under ${parentDir}`);
} else {
  const totalCommits = activity.reduce((sum, { commits }) => sum + commits.length, 0);
  console.log(
    `${DIM}Reading ${activity.length} repos, ${totalCommits} commits from the last 7 days:${RESET}`,
  );
  for (const { repo, commits } of activity) {
    console.log(`  ${BOLD}${repo}${RESET} ${DIM}(${commits.length} commits)${RESET}`);
  }

  console.log(`\n${GREEN}--- tweet drafts ---${RESET}`);
  const stopSpinner = startSpinner("Parroting");
  const tweets = await generateTweets(activity);
  stopSpinner();
  tweets.forEach((tweet, i) => console.log(`\n${BOLD}${i + 1}.${RESET} ${tweet}`));
}
