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

Every task type starts at **L0 (draft and wait)**. After ten approvals in a row (with at most two small edits) it asks whether it can move to **L1 (act and report)**, and later **L2 (act and batch into the weekly review)**. A rejection proposes dropping back. Only your yes changes a level. Sending, sharing, posting, inviting or deleting anything outside the vault is never allowed at any level.

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

Structural tests (Node's built-in test runner, no dependencies) check skill frontmatter, cross-references between skills, that templates match the schema, that autonomy task types agree, and that no personal data slipped in.

## License

MIT
