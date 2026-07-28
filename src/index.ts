import "dotenv/config";
import { scanRecentActivity } from "./scan.js";
import { generateTweets } from "./summarize.js";
import { startSpinner } from "./spinner.js";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

const parentDir = process.argv[2] ?? process.cwd();

const activity = scanRecentActivity(parentDir);

if (activity.length === 0) {
  console.log(`No commits from the last 7 days found under ${parentDir}`);
} else {
  for (const { repo, commits } of activity) {
    console.log(`\n${BOLD}${repo}${RESET} ${DIM}(${commits.length} commits)${RESET}`);
    for (const block of commits) {
      console.log(
        block
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n"),
      );
    }
  }

  console.log(`\n${GREEN}--- tweet drafts ---${RESET}`);
  const stopSpinner = startSpinner("Parroting");
  const tweets = await generateTweets(activity);
  stopSpinner();
  tweets.forEach((tweet, i) => console.log(`\n${BOLD}${i + 1}.${RESET} ${tweet}`));
}
