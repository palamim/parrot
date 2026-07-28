import { execFileSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface RepoCommits {
  repo: string;
  path: string;
  commits: string[];
}

function isGitRepo(dir: string): boolean {
  return existsSync(join(dir, ".git"));
}

export function findRepos(parentDir: string): string[] {
  return readdirSync(parentDir)
    .map((name) => join(parentDir, name))
    .filter((dir) => {
      try {
        return statSync(dir).isDirectory() && isGitRepo(dir);
      } catch {
        return false;
      }
    });
}

export function getRecentCommits(repoPath: string, since: string): string[] {
  try {
    const out = execFileSync(
      "git",
      ["log", `--since=${since}`, "--pretty=format:%h %ad %s", "--date=short"],
      { cwd: repoPath, encoding: "utf-8" },
    );
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function scanRecentActivity(parentDir: string, since = "7 days ago"): RepoCommits[] {
  return findRepos(parentDir)
    .map((path) => ({
      repo: path.split("/").pop() ?? path,
      path,
      commits: getRecentCommits(path, since),
    }))
    .filter((r) => r.commits.length > 0);
}
