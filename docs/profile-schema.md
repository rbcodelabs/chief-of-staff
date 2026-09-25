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

Followed by three shared sections: **Pending approvals** (drafts waiting for the user), **Activity log** (vault changes the pack made on its own), and **Change log** (level changes and why).

## `Setup Draft.md`

The one review note written during setup, kept afterwards as a record.

```yaml
cos_version: 1
status: draft                  # draft | applied
created_at: 2026-09-25T09:30:00-05:00
applied_at: ""                 # set when the user says "go"
```

Body: checkbox sections **Profile**, **Projects**, **People**, **Open loops** and **Documents to import**. Each item is one line. Unchecked items are skipped when the draft is applied.

## `Weekly/YYYY-Www.md`

Friday reviews, named by ISO week (e.g. `Weekly/2026-W39.md`). Written by `cos-weekly-review`; no frontmatter is required. Sections: **What moved**, **What slipped**, **What's next**, **Done on my own**, **Status update (draft)**, **Autonomy proposals**.
