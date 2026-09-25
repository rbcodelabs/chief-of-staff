---
name: cos-weekly-review
description: >-
  Write the Chief of Staff Friday review to <cos_folder>/Weekly/YYYY-Www.md:
  what moved, what slipped, what's next, what the chief of staff did on its
  own since the last review, a ready-to-paste draft status update in the
  audience and format from the profile, and any autonomy promotion proposals
  that are due. Use when the scheduled "Chief of Staff — Weekly Review" ritual
  fires, or when the user asks for "my weekly review", "wrap up the week",
  "draft my status update" or "what happened this week".
---

# Chief of Staff weekly review

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

Autonomy task types: `weekly_review` (the review and any cleanup of `Now.md`) and `status_update_draft` (the status update, max L1).

## Step 0: contract and profile

1. Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout.
2. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). Stop and offer `cos-setup` if it's missing.
3. Compute today and the ISO week (`YYYY-Www`, e.g. `2026-W39`) in the profile's `timezone`.
4. Read `<cos_folder>/Now.md`, `<cos_folder>/Autonomy.md`, and the most recent earlier review in `<cos_folder>/Weekly/` if one exists.
5. **Review window:** from the day after the previous weekly review's date through today, so weekend and late-week activity is never missed. If there is no previous review, use the last 7 days.

## Step 1: settle L2 activity

For each **Activity log** line at L2 with `outcome: pending` dated before today, settle it as described in `cos-autonomy` ("Settle activity outcomes") and update the ledger. Also settle any L1 lines still pending (for example if no brief ran).

## Step 2: gather the window

- **Daily notes** in the window: the `## Chief of Staff Brief` and `## Chief of Staff Updates` sections and anything the user wrote.
- **Meeting notes** in `locations.meetings` dated in the window: decisions and action items.
- **Project notes** modified in the window.
- **`Now.md`:** loops marked done or dropped in the window; loops touched in the window; loops whose `due` date passed in the window and are still open; stale loops.
- **`Autonomy.md`:** Activity log entries in the window (L1 and L2) with their outcomes, the Pending approvals list (including any **unanswered open-loops check-in**), and the ledger for promotion checks.

Only report what you found. If a source was empty or unreadable, say so in one line.

## Step 3: write the review

Path: `<cos_folder>/Weekly/YYYY-Www.md`. If it already exists (re-run), replace only the sections below and keep anything the user added.

```
# Week YYYY-Www

Window: YYYY-MM-DD to YYYY-MM-DD

## What moved
- [[Projects/Checkout Redesign]]: beta reached 10% of traffic
## What slipped
- Vendor contract: due Wednesday, still open
## What's next
1. ...
## Done on my own
- <L2 activity in the window, then L1 activity> — [[link]] — <outcome>
## Status update (draft)
<see step 4>
## Autonomy proposals
<see step 5>
```

(Example lines are fictional.) "What's next" comes from the Priorities list, open loops with due dates next week, and anything the user said they'd do.

The weekly note is this task's review surface, so write it at any level. Cleanup of `Now.md` (clearing **Done** entries older than two weeks, reordering Priorities to match what the week showed) follows the `weekly_review` level: at L0 list the proposed cleanup under **What needs you** and wait; at L1 do it and report; at L2 do it and list it under **Done on my own**. Log L1/L2 cleanup in the Activity log with `outcome: pending`. Clearing settled Activity log entries older than four weeks that already appeared in a weekly review is housekeeping and always allowed.

## Step 4: draft the status update

Write it for `status_update.audience` in `status_update.format` from the profile (e.g. "bullets: shipped / in progress / risks / asks"). Draw only on what the window's notes show. Keep it ready to paste: no internal links, no private worries unless the user flagged them as shareable, names as the audience would know them.

- **L0** (default): put it under **Status update (draft)** marked `> Draft for your review. Reply "looks good" or tell me what to change.`, and add a **Pending approvals** line. When the user replies, record the outcome (see `cos-autonomy`) and update the text.
- **L1** (the maximum): put it under **Status update (draft)** marked `> Ready to paste.`, log it in the Activity log with `outcome: pending`, and report it; no approval step.

**Never send it**, post it, or share it, whatever the level. It is text for the user to copy.

## Step 5: autonomy proposals

Run the promotion and demotion checks from `cos-autonomy` for every task type. List each due proposal in plain language under **Autonomy proposals**, e.g. "You've approved my last 10 meeting-prep notes. Want me to just write them from now on?" If none are due, write "None this week." Don't change any level here; only the user's yes does that.

## Step 6: report

Post the contract's "What I did / What needs you" summary with a link to the weekly note. Add a one-line pointer to the weekly note in today's daily note under `## Chief of Staff Updates` as `### HH:MM cos-weekly-review`.

If something needs the user (a status draft at L0, a proposal, stale loops, or an unanswered check-in) and you are **not** the home thread, set one proposed reply on the home thread with `threads_set_proposed_reply` (`threadId: home_thread_id`). The open-loops ritual skips this day, so fold its questions in here: any still-unanswered check-in questions from **Pending approvals**, plus up to 3 stale loops if there was no check-in this week. Leave every verdict for the user to fill in; never pre-fill consent:

```
Weekly review (cos-weekly-review) is in [[Chief of Staff/Weekly/2026-W39]].
Status update: <looks good / change …>
Proposals: <answer each: yes / no>
Open loops (edit, then send):
1. Hiring plan: 6 days quiet. Still active, blocked, or drop it? → still active (default)
```

Omit any line that doesn't apply (e.g. no `Status update:` line at L1, no `Proposals:` line when none are due). Only open-loop status answers get defaults, as in `cos-open-loops`. If you are the home thread, ask directly instead.

If this is a scheduled run and nothing needs the user, archive this thread with `threads_archive` (see `cos-contract`, section 6).
