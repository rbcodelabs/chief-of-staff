---
name: cos-daily-brief
description: >-
  Write the Chief of Staff daily brief into today's daily note under
  "## Chief of Staff Brief": today's meetings (only if a calendar tool is
  connected), top 3 priorities, stale open loops, what the chief of staff did
  on its own since the last brief, meeting notes ready for an action-items
  pass, and a closing question. Use when the scheduled "Chief of Staff — Daily
  Brief" ritual fires, at the end of cos-setup, or when the user asks "what's
  on my plate", "brief me", "morning brief" or "what should I focus on today".
---

# Chief of Staff daily brief

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

Autonomy task type: `daily_brief`. The brief only writes its own section of the daily note, so it runs the same at every level and is never promoted (see `cos-autonomy`).

## Step 0: contract and profile

1. Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout.
2. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). If it's missing, stop and offer `cos-setup`.
3. Work out today's date in the profile's `timezone` yourself, from the date and time in your context (see `cos-contract`, "Dates and times"; never run a shell command for it).
4. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`.
5. Find today's daily note: Read `<locations.daily_notes.folder>/<today formatted with locations.daily_notes.format>.md` (a failed Read means it doesn't exist yet). Find the "last brief": `vault_list` the daily-notes folder (with `recursive: true` if the format has sub-folders), then Read the most recent earlier notes, newest first, until one contains a `## Chief of Staff Brief` heading. Its date is the "last brief" date; if you find none within the last 14 days, use yesterday. Don't use shell commands (see `cos-contract`, "Tools: no shell, ever"). Only this skill writes that heading, so other skills' reports (under `## Chief of Staff Updates`) never count as a brief.

## Step 1: settle yesterday's L1 activity

For each **Activity log** line in `Autonomy.md` at L1 with `outcome: pending` and a date before today, settle it as described in `cos-autonomy` ("Settle activity outcomes"): compare the linked note with what the entry says you wrote, record `approved`, `approved-with-edits`, `rejected` or `skipped`, and update the ledger. Note any promotion or demotion proposal that becomes due.

## Step 2: gather

**Meetings (only when a calendar is connected).** If `sources.calendar` is not `"none"` and a matching calendar tool is available, read today's events (read-only). If `sources.calendar` names a tool that isn't available or the call fails, write "I couldn't reach <name> today" instead of a meetings list. If `sources.calendar` is `"none"`, **omit the meetings section entirely** (don't mention calendars). For each meeting, look for a prep note for today in `locations.meetings` (`vault_list` the folder once and match `YYYY-MM-DD <title>.md`, or `vault_search` for the meeting title): link it as "prep done", otherwise add "prep offered: reply 'prep <meeting>'". Never list a meeting that didn't come from the calendar.

**Top 3 priorities.** The first three items of **Priorities** in `Now.md`. If fewer than three exist, show what's there; if none, say "No priorities set; want to pick some?"

**Stale loops.** Every unchecked loop line in `Now.md` whose `touched` date is more than `rituals.open_loops_check.stale_after_days` days before today (default 5 if absent). Show up to five, oldest first, with days since touched.

**Due dates.** Compare each open loop's `due` date with today exactly (see `cos-contract`, "Dates and times"). Flag every loop due today as "due today", including in the very first brief after setup. Flag only loops whose `due` date is before today as "overdue". A loop due today is never "overdue".

**Done on my own.** **Activity log** lines at L1 dated after the last brief (L2 items are reported in the weekly review), with their settled outcomes.

**Waiting for you.** Everything under **Pending approvals**, plus any promotion or demotion proposal that became due in step 1 (as a question, never pre-answered).

**Meeting notes ready for action items.** `vault_list` `locations.meetings` and Read the notes dated since the last brief. Offer the ones that have content under `## Notes` or `## Action items` and no `Processed into loops on` line. Offer each one: "reply 'action items <meeting>'" (the pass itself is in `cos-meeting-prep`, step 5).

## Step 3: write

Create today's daily note if it's missing: if `.obsidian/daily-notes.json` names a `template`, start from that template's contents; otherwise create an empty note. Write it with the Write tool; any folders in the path (including sub-folders the format implies) are created implicitly. No shell commands.

Add to the note without overwriting existing content. Read the whole note first, then place the brief so that `## Chief of Staff Updates` (written by other skills) stays last:

- **No brief yet today:** if `## Chief of Staff Updates` exists, put `## Chief of Staff Brief` immediately before it; otherwise append the brief at the end of the note.
- **Brief already there** (for example the brief was re-run): add a `### Update HH:MM` subsection at the end of the brief section, still before any `## Chief of Staff Updates`. Never add a second `## Chief of Staff Brief` heading.

```
## Chief of Staff Brief

**Today's meetings**
- 10:00 Roadmap review — [[Meetings/2026-09-26 Roadmap review|prep done]]
- 14:00 1:1 with Priya — prep offered: reply "prep 1:1 with Priya"

**Top priorities**
1. ...
2. ...
3. ...

**Due**
- Send the Q4 hiring plan to Sam — due today
- Vendor contract — overdue (due 2026-09-24)

**Gone quiet**
- Hiring plan — 6 days since touched

**Done on my own since <last brief date>**
- ... — [[link]]
**Waiting for you**
- Meeting prep for roadmap review — [[link]]
- Action items from [[Meetings/2026-09-25 Pricing sync]]: reply "action items pricing sync"

What can I take off your plate today? Reply in our Chief of Staff thread.
```

Leave out any section that has nothing in it, except the closing line, which always appears. (The example names are fictional.)

The brief never edits `Now.md` or other notes. If today's notes suggest a loop moved, list it under **Waiting for you** for `cos-open-loops` to handle.

## Step 4: report

In the thread, post the contract's "What I did / What needs you" summary with a link to the daily note. Don't set a proposed reply for the brief; the closing line in the note is enough. If this is a scheduled run and nothing needs the user, archive this thread with `threads_archive` (see `cos-contract`, section 6).
