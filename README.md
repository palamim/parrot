# parrot

A CLI that looks at the last 3 days of commits across your local repos and
turns them into tweet-sized post drafts.

## What it does

1. Scans a parent folder for git repositories.
2. For each repo, pulls the commits from the last 3 days.
3. Sends the commit log to Claude (`claude-haiku-4-5`) and gets back 5 tweet-sized
   (under 280 characters) draft posts — research/tech-flavored, with concrete
   numbers when the commit log supports them.

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY
```

Optionally, set `PROJECTS_ROOT` in `.env` to the folder you want scanned by
default, so you can run the CLI without passing a path each time:

```bash
PROJECTS_ROOT=/path/to/your/projects/folder
```

## Usage

```bash
npm run dev -- /path/to/your/projects/folder
```

If no path is given, it falls back to `PROJECTS_ROOT` from `.env`, and if
that isn't set either, it scans the current directory.

Output is the raw commit list per repo, followed by the tweet drafts.

## Style guide & feedback

parrot writes from a style guide (`parrot.style.md`) that you never edit by
hand. It starts out as a generic tech/research voice with no persona baked
in, and evolves entirely from feedback you give.

After drafts are shown, parrot asks one question: what would you tell it
about this batch, to shape future drafts? Answer in plain language — "I like
the one about X, but treat trivial UI fixes as a passing mention, not a full
tweet" — or just press Enter to skip. If you answer, a second pass rewrites
`parrot.style.md` to fold your note in (keeping everything it doesn't
contradict, not just appending to a growing list), prints a one-line summary
of what changed, and uses the updated guide on every future run.

There's no set structure to learn — the file is only ever read and rewritten
by parrot itself. Skip the prompt entirely (e.g. for scripted/non-interactive
runs) with `--no-feedback`; it's also skipped automatically when
stdin/stdout isn't a TTY.

To point at a different guide (e.g. testing a second voice), set
`PARROT_STYLE_FILE` in `.env` or pass `--style <path>`:

```bash
npm run dev -- /path/to/your/projects/folder --style ~/notes/other-voice.md
```
