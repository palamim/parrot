import "dotenv/config";
import { scanRecentActivity } from "./scan.js";
import { generateTweets } from "./summarize.js";

const parentDir = process.argv[2] ?? process.cwd();

const activity = scanRecentActivity(parentDir);

if (activity.length === 0) {
  console.log(`No commits from the last 7 days found under ${parentDir}`);
} else {
  for (const { repo, commits } of activity) {
    console.log(`\n${repo} (${commits.length} commits)`);
    for (const line of commits) {
      console.log(`  ${line}`);
    }
  }

  console.log("\n--- tweet drafts ---");
  const tweets = await generateTweets(activity);
  tweets.forEach((tweet, i) => console.log(`\n${i + 1}. ${tweet}`));
}
