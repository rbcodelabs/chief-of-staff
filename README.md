# Chief of Staff

A skill pack that gives you a chief of staff working over your Obsidian vault. It learns what you're working on in a 10-minute interview, keeps a list of your open loops, writes you a short brief every morning, checks in on things that go quiet, preps your meetings, and drafts your Friday review and status update. Everything it knows lives in plain Markdown notes in your vault, and nothing leaves the vault: anything meant for another person is always a draft for you to send.

## Who it's for

PMs and other knowledge workers who keep their work in Obsidian and want help staying on top of projects, people and commitments without handing an agent the keys to their email or calendar.

It's built for **Geode / Agent Threads**, the Obsidian plugin that runs agent threads inside your vault. It relies on Agent Threads' shared tools (scheduling, cross-thread proposed replies, vault tools, and the built-in Google Workspace Drive/Docs tools). It isn't meant to run everywhere.

## Day 1

1. **A Chief of Staff thread opens** (automatically on first run, or via the "Set up Chief of Staff" command).
2. **Setup, about 10 minutes, one question at a time.** It looks at how your vault is organized (read-only), then asks about your role, current projects, key people, open loops, recurring rituals and preferences. If a calendar tool is connected, it starts from this week's meetings.
3. **You review one draft.** Everything it heard goes into `Chief of Staff/Setup Draft.md` as checkboxes. Edit or uncheck, then say **go**. Nothing else is written before that.
4. **It writes your notes**: `Profile.md`, `Now.md` (open loops), `Autonomy.md`, plus project and people notes in your existing folders.
5. **It imports the documents you mentioned**, one at a time, extracting decisions, dates, owners and open questions.
6. **Your first brief** lands in today's daily note right away.
7. **It offers the rituals**: a weekday brief at 8, an open-loops check-in at 1, and a Friday review at 3. You pick.

After that, talk to it in the Chief of Staff thread: "prep me for my 1:1", "import this doc", "what's on my plate?"

## Skills

| Skill | What it does |
|---|---|
| `cos-contract` | The always-on behavior contract: read the profile first, act on what can be undone, draft what can't, never send anything, report every run. |
| `cos-setup` | The first-run interview and re-runnable profile update. |
| `cos-import` | Extracts one document (Drive/Docs, vault note or pasted text) into a project note. |
| `cos-daily-brief` | The morning brief in your daily note. |
| `cos-open-loops` | Finds loops that went quiet and asks about up to three as a one-click proposed reply. |
| `cos-meeting-prep` | Prep notes before meetings; action items into your loops after. |
| `cos-weekly-review` | The Friday review with a ready-to-paste draft status update. |
| `cos-autonomy` | Per-task autonomy levels that grow only when you say yes. |

## Autonomy, briefly

Every task type starts at **L0 (draft and wait)**. After ten approvals in a row (with at most two small edits) it asks whether it can move to **L1 (act and report)**, and later **L2 (act and batch into the weekly review)**. At L1 and L2, anything you keep counts as an approval, anything you edit counts as approved with edits, and anything you revert counts as a rejection, which prompts it to propose dropping back a level. Only your yes changes a level. The daily brief only writes its own section, so it stays at L0. Sending, sharing, posting, inviting or deleting anything outside the vault is never allowed at any level.

## Install

### Agent Threads (Geode)

- **Automatic:** new installs of Agent Threads add this pack and start the Chief of Staff thread on first run.
- **Manual:** Settings → Skill sources → add `https://github.com/rbcodelabs/chief-of-staff`. Then run the **Set up Chief of Staff** command, or start a thread and say "set up my chief of staff".

### Claude Code plugin

This repo is also a single-plugin marketplace:

```
/plugin marketplace add rbcodelabs/chief-of-staff
/plugin install chief-of-staff@chief-of-staff
```

Scheduling (`CronCreate`), proposed replies (`threads_set_proposed_reply`) and the vault tools come from Agent Threads, so outside it the rituals and check-ins won't run; the interview, import, prep and review skills still work on demand.

## What it writes in your vault

| File | Purpose |
|---|---|
| `Chief of Staff/Profile.md` | Who it works for. Every skill reads it first. |
| `Chief of Staff/Now.md` | Open loops, each with a last-touched date. |
| `Chief of Staff/Autonomy.md` | Approval history and autonomy level per task type. |
| `Chief of Staff/Setup Draft.md` | The setup review note, kept as a record. |
| `Chief of Staff/Weekly/YYYY-Www.md` | Friday reviews. |

Project, people and meeting notes go into your existing folders when you have them. Briefs are appended to your daily note. The folder name is configurable. See [`docs/profile-schema.md`](docs/profile-schema.md) for formats and [`docs/spec.md`](docs/spec.md) for the full spec. Starter files are in [`templates/`](templates/).

There's no telemetry. Everything is measured from your own vault.

## Development

```
npm test
```

Structural tests (Node's built-in test runner, no dependencies) check skill frontmatter, cross-references between skills, that templates match the schema, that autonomy task types agree, and that no personal data slipped in. They also check that no skill tells the model to run shell commands, and that date fields use the documented formats.

## Changelog

### 0.1.4

Fixes from a fourth live QA pass. The host now removes Bash from Chief of Staff threads, so the pack must never need it.

- **Templates are embedded.** `cos-setup` (Setup Draft, Profile, Now, Autonomy) and `cos-autonomy` (Autonomy) carry exact copies of the starter files inline, so they never list or read the pack's install folder. `templates/` stays the canonical copy, and a test checks the inline copies match it byte for byte.
- **No scratchpad tool calls.** No no-op or echo commands; the model reasons in its reply. If a tool is unavailable, it says so and carries on with the rest.
- **The weekly review treats "due today" as next, not slipped.** Status lines use the `Now.md` status words exactly (e.g. "waiting", not "active — waiting on").
- **Heading times** come from the most recent context line and are never guessed forward. If unsure, the time is left out.

### 0.1.3

Fixes from a third live QA pass in Agent Threads:

- **Listing uses `vault_list`.** Claude Code sessions in the host have no Glob or Grep tool, so the 0.1.2 instructions sent the model back to `ls`/`find`. Every listing step now uses the host's read-only `vault_list` tool. `vault_search` finds notes by content, and Read checks known paths (a failed Read means the note is missing). Nothing mentions Glob or Grep anymore.
- **Updates never split the brief.** `## Chief of Staff Updates` always sits at the end of the daily note, after the whole brief section. Skills append to it, or add it at the end when missing. A re-run brief goes before it.
- **The setup closing is complete sentences**, with no dangling lead-ins.
- **Status-update Asks** hold only what the user needs from others. The user's own commitments go under in progress or next.

### 0.1.2

Fixes from a second live QA pass in Agent Threads:

- **No shell at all.** Shell commands were previously banned only for dates. Now the model uses Glob, Read, Write and the vault tools (`vault_search` and others) for listing, reading and creating files. Folders are created implicitly when the first note is written, and empty folders are never created.
- **Timezone from session context.** Setup reads the IANA timezone from the session context. If it isn't there, setup asks the user to confirm a best guess in the draft, and never runs a command to find it.
- **No fabricated times.** When the exact time isn't known, timestamps are date-only, and headings leave the time out.
- **One question per message in setup.** Status updates are now their own interview turn, and the draft hand-off ends with exactly one question.
- **Weekly review proposed reply** adds no note about missing proposals or check-ins.
- **The user's words are kept exactly**: capitalization, names, and no invented parties. Dates are compared exactly, so "due today" is never "overdue", and the first brief flags items due today.

Fixes found in a live first-run QA in Agent Threads:

- **No shell commands for dates.** Skills work out dates, weekdays, ISO weeks and timezone offsets from the current date and time in context. Previously an unattended weekly review stalled on a shell permission prompt.
- **Setup's closing line names the next real run** (e.g. "Monday at 8:00" when setup finishes on a Friday) instead of always saying "tomorrow".
- **Setup Draft `applied_at`** records the actual time of "go", not a copy of `created_at`.
- **`updated_at` is always a date** (`YYYY-MM-DD`). Timestamps (`created_at`, `applied_at`, `setup_completed_at`) are ISO-8601 with offset.
- **Daily-note update headings use the actual run time**, not the scheduled time.
- **The weekly review's proposed reply leaves out `Proposals:`** when none are due.
- **Status updates restate only what's recorded.** Unknowns read "waiting on X (no update since DATE)" rather than an invented state.
- **Setup asks strictly one question per message**, with a bad/good example in the skill.

### 0.1.0

First release: eight `cos-*` skills, vault templates, profile schema, and structural tests.

## License

MIT
