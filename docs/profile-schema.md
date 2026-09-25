# Profile and pack-file schema (v1)

This is the canonical schema for the files the Chief of Staff pack writes in a user's vault. Every skill reads `<cos_folder>/Profile.md` first; the other files are described after it. The starters in `templates/` must carry exactly the frontmatter keys listed here (the test suite enforces this).

All paths are **vault-relative**. The examples use a fictional user, Jordan Lee.

## `Profile.md`

Frontmatter holds the fields that skills read by machine. The body holds context written for people.

```yaml
cos_version: 1
name: "Jordan Lee"                 # fictional example
role: "Senior PM, Payments"
timezone: "America/Chicago"        # IANA zone; "today" and all ritual times use it
home_thread_id: "<thread id>"      # the persistent Chief of Staff thread; proposed replies go here
setup_completed_at: 2026-09-25T09:40:00-05:00   # empty until setup finishes
locations:
  cos_folder: "Chief of Staff"
  daily_notes: { folder: "Daily", format: "YYYY-MM-DD" }
  projects: "Projects"
  people: "People"
  meetings: "Meetings"
rituals:
  daily_brief: { enabled: true, time: "08:00", days: [1,2,3,4,5], schedule_id: "<cron id>" }
  open_loops_check: { enabled: true, time: "13:00", days: [1,2,3,4,5], schedule_id: "<cron id>", stale_after_days: 5 }
  weekly_review: { enabled: true, day: 5, time: "15:00", schedule_id: "<cron id>" }
sources:
  google_drive: true | false       # built-in Geode Google Workspace (Docs/Drive/Sheets/Slides)
  calendar: "none" | "<tool or MCP server name>"   # optional; not built in
status_update:
  audience: "my manager and the payments leads"
  format: "bullets: shipped / in progress / risks / asks"
```

**Date and time formats (all pack files):** `updated_at`, `touched` and `due` are dates, `YYYY-MM-DD`. `created_at`, `applied_at` and `setup_completed_at` are timestamps, ISO-8601 with offset (e.g. `2026-09-25T09:40:00-05:00`), recorded when the event actually happens. Empty (`""`) means "not yet". Skills work dates out from the current date and time in their context and never run shell commands to do it.

Field notes:

- **`home_thread_id`** is the id returned by `threads_get_current` in the thread where setup ran. Scheduled rituals run in their own threads and cannot set a proposed reply on themselves, so they target this id.
- **`setup_completed_at`** is an ISO-8601 timestamp with offset. Together with a non-empty `rituals.daily_brief.schedule_id` it is the day-1 activation signal.
- **`daily_notes.format`** uses Moment.js tokens (the same tokens Obsidian's Daily Notes uses). A format may contain `/` to express sub-folders, for example `YYYY/MM/YYYY-MM-DD`.
- **Days** use `0` = Sunday through `6` = Saturday, the same numbering as `CronCreate`'s `daysOfWeek`. `weekly_review.day: 5` is Friday.
- **Times** are `HH:MM`, 24-hour, in `timezone`.
- **`schedule_id`** is the id returned by `CronCreate`. Empty means not scheduled.
- **`stale_after_days`** is how many calendar days a loop can go untouched before it counts as stale.
- **`sources.calendar`** is `"none"` or the name of a calendar tool or MCP server the user connected. The pack never assumes one exists.

Body sections, in this order:

- **Working context**: team, scope, how work flows.
- **Key people**: one line each, linking to the person's note, e.g. `[[People/Sam Rivera]] — manager; weekly 1:1`.
- **Current priorities**: the few things that matter this quarter.
- **Preferences**: tone, length, what to leave alone.

## `Now.md`

The list of open loops. Skills parse the loop lines, so keep the grammar.

```yaml
cos_version: 1
updated_at: 2026-09-25
```

Body sections, in this order: **Priorities** (a numbered list; the first three feed the daily brief), **Projects**, **Commitments**, **Waiting on**, **Worries**, **Done**.

Loop line grammar:

```
- [ ] <what> — <status> — touched YYYY-MM-DD[ — due YYYY-MM-DD][ — [[link]]]
```

- `<status>` is one of `active`, `blocked`, `waiting`.
- `touched` is the last date there was evidence of progress or the user confirmed the loop.
- A loop is **stale** when today minus `touched` is greater than `rituals.open_loops_check.stale_after_days`.
- Finished or dropped loops become `- [x] ... — done YYYY-MM-DD` (or `— dropped YYYY-MM-DD`) and move to **Done**. The weekly review clears Done entries older than two weeks.

## `Autonomy.md`

The approval ledger and current autonomy level per task type (see the `cos-autonomy` skill).

```yaml
cos_version: 1
updated_at: 2026-09-25
```

Body: one `## <task_type>` section per task type, each holding a one-row table:

```
| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |
```

- `level` is `L0`, `L1` or `L2`.
- `streak` is the count of consecutive `approved` / `approved-with-edits` outcomes since the last `rejected` outcome or level change.
- `last 10 outcomes` is a comma-separated list, oldest first, of `approved`, `approved-with-edits`, `rejected`, or `—` when empty.

`daily_brief` has a max level of L0: the brief only writes its own section, so it has nothing to promote and records no outcomes. `status_update_draft` has a max of L1; every other task type, L2.

Followed by three shared sections:

- **Pending approvals**: L0 drafts waiting for the user, `- YYYY-MM-DD <task_type> — <what> — [[link]] — awaiting`. Removed once the user answers and the outcome is recorded.
- **Activity log**: vault changes the pack made on its own at L1 or L2, `- YYYY-MM-DD <task_type> (L1|L2) — <what> — [[link]] — outcome: <pending|approved|approved-with-edits|rejected|skipped>`. Entries start `pending`. The next daily brief settles L1 entries and the next weekly review settles L2 entries: a change kept as written is `approved`, one the user edited is `approved-with-edits`, and one the user reverted (or called wrong) is `rejected`. `skipped` means the outcome couldn't be told and isn't counted. A user reaction in a thread settles an entry immediately.
- **Change log**: level changes and why.

## `Setup Draft.md`

The one review note written during setup, kept afterwards as a record.

```yaml
cos_version: 1
status: draft                  # draft | applied
created_at: 2026-09-25T09:30:00-05:00
applied_at: ""                 # the actual time the user said "go"; never a copy of created_at
```

Body: checkbox sections **Profile**, **Projects**, **People**, **Open loops** and **Documents to import**. Each item is one line and starts checked (`- [x]`); the user unchecks what they don't want. Only checked items are applied on "go". At most 3 documents are checked for import during setup; the rest are listed unchecked with "(later)".

## Daily note sections

- `## Chief of Staff Brief`: written only by `cos-daily-brief`. A re-run on the same day adds `### Update HH:MM` under it. The most recent daily note with this heading marks the "last brief".
- `## Chief of Staff Updates`: reports from every other skill, each as `### HH:MM <skill>`.

Meeting notes whose action items have been processed end their `## Action items` section with `Processed into loops on YYYY-MM-DD.`

## `Weekly/YYYY-Www.md`

Friday reviews, named by ISO week (e.g. `Weekly/2026-W39.md`). Written by `cos-weekly-review`; no frontmatter is required. Each covers the window since the previous review (or the last 7 days for the first one). Sections: **What moved**, **What slipped**, **What's next**, **Done on my own**, **Status update (draft)**, **Autonomy proposals**.
