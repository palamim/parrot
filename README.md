# parrot

A CLI that looks at the last 7 days of commits across your local repos and
turns them into tweet-sized post drafts.

## What it does

1. Scans a parent folder for git repositories.
2. For each repo, pulls the commits from the last 7 days.
3. Sends the commit log to Claude (`claude-opus-5`) and gets back 5 tweet-sized
   (under 280 characters) draft posts — research/tech-flavored, with concrete
   numbers when the commit log supports them.

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY
```

## Usage

```bash
npm run dev -- /path/to/your/projects/folder
```

If no path is given, it scans the current directory.

Output is the raw commit list per repo, followed by the tweet drafts.
