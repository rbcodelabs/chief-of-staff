---
name: cos-daily-brief
description: >-
  Write the Chief of Staff daily brief into today's daily note under
  "## Chief of Staff Brief": today's meetings (only if a calendar tool is
  connected), top 3 priorities, stale open loops, what the chief of staff did
  on its own since the last brief, and a closing question. Use when the
  scheduled "Chief of Staff — Daily Brief" ritual fires, at the end of
  cos-setup, or when the user asks "what's on my plate", "brief me", "morning
  brief" or "what should I focus on today".
---

# Chief of Staff daily brief

Follow `cos-contract` throughout. Autonomy task type: `daily_brief`.

## Step 1: read

1. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). If it's missing, stop and offer `cos-setup`.
2. Compute today's date in the profile's `timezone`.
3. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`.
4. Find today's daily note: `<locations.daily_notes.folder>/<today formatted with locations.daily_notes.format>.md`. Also find the most recent earlier daily note that contains a `## Chief of Staff Brief` section; its date is the "last brief" date (if none, use yesterday).

## Step 2: gather

**Meetings (only when a calendar is connected).** If `sources.calendar` is not `"none"` and a matching calendar tool is available, read today's events (read-only). If `sources.calendar` names a tool that isn't available or the call fails, write "I couldn't reach <name> today" instead of a meetings list. If `sources.calendar` is `"none"`, **omit the meetings section entirely** (don't mention calendars). For each meeting, check `locations.meetings` for a prep note for today (`YYYY-MM-DD <title>.md` or a note linking the meeting): link it as "prep done", otherwise add "prep offered: reply 'prep <meeting>'". Never list a meeting that didn't come from the calendar.

**Top 3 priorities.** The first three items of **Priorities** in `Now.md`. If fewer than three exist, show what's there; if none, say "No priorities set; want to pick some?"

**Stale loops.** Every unchecked loop line in `Now.md` whose `touched` date is more than `rituals.open_loops_check.stale_after_days` days before today (default 5 if absent). Show up to five, oldest first, with days since touched. Also flag loops with a `due` date today or already past.

**Done on my own.** Lines in the **Activity log** of `Autonomy.md` dated after the last brief. Include only L1 items (L2 items are reported in the weekly review). Also list anything waiting in **Pending approvals**.

## Step 3: write

Create today's daily note if it's missing: if `.obsidian/daily-notes.json` names a `template`, start from that template's contents; otherwise create an empty note. Create the folder path if the format implies sub-folders.

Append (don't overwrite existing content). If a `## Chief of Staff Brief` section already exists today, add a new `### Update HH:MM` under it instead of a second section.

```
## Chief of Staff Brief

**Today's meetings**
- 10:00 Roadmap review — [[Meetings/2026-09-26 Roadmap review|prep done]]
- 14:00 1:1 with Priya — prep offered: reply "prep 1:1 with Priya"

**Top priorities**
1. ...
2. ...
3. ...

**Gone quiet**
- Hiring plan — 6 days since touched
- Vendor contract — due yesterday

**Done on my own since <last brief date>**
- ... — [[link]]
**Waiting for you**
- Meeting prep for roadmap review — [[link]]

What can I take off your plate today? Reply in our Chief of Staff thread.
```

Leave out any section that has nothing in it, except the closing line, which always appears. (The example names are fictional.)

The brief section itself is the review surface for this task, so write it at any autonomy level. Anything beyond the brief (for example marking a loop touched because today's notes show progress) is an `open_loops_update` and follows that task type's level: at L0, mention it under **Waiting for you** instead of changing `Now.md`.

## Step 4: report

In the thread, post the contract's "What I did / What needs you" summary with a link to the daily note. If this run is in a scheduled thread and something needs the user, don't set a proposed reply for the brief itself; the closing line in the note is enough.
