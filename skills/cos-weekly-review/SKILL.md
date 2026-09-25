---
name: cos-weekly-review
description: >-
  Write the Chief of Staff Friday review to <cos_folder>/Weekly/YYYY-Www.md:
  what moved, what slipped, what's next, what the chief of staff did on its
  own this week, a ready-to-paste draft status update in the audience and
  format from the profile, and any autonomy promotion proposals that are due.
  Use when the scheduled "Chief of Staff — Weekly Review" ritual fires, or
  when the user asks for "my weekly review", "wrap up the week", "draft my
  status update" or "what happened this week".
---

# Chief of Staff weekly review

Follow `cos-contract` throughout. Autonomy task types: `weekly_review` (the review and any cleanup of `Now.md`) and `status_update_draft` (the status update, max L1).

## Step 1: read

1. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). Stop and offer `cos-setup` if it's missing.
2. Compute today and the ISO week (`YYYY-Www`, e.g. `2026-W39`) in the profile's `timezone`. The review window is Monday of this ISO week through today.
3. Read `<cos_folder>/Now.md`, `<cos_folder>/Autonomy.md`, and last week's review in `<cos_folder>/Weekly/` if it exists (for "what's next" continuity).

## Step 2: gather the week

- **Daily notes** in the window: the `## Chief of Staff Brief` sections and anything the user wrote.
- **Meeting notes** in `locations.meetings` dated in the window: decisions and action items.
- **Project notes** modified in the window.
- **`Now.md`:** loops marked done or dropped in the window; loops touched in the window; loops whose `due` date passed in the window and are still open; stale loops.
- **`Autonomy.md`:** Activity log entries in the window (L1 and L2), the Pending approvals list, and the ledger for promotion checks.

Only report what you found. If a source was empty or unreadable, say so in one line.

## Step 3: write the review

Path: `<cos_folder>/Weekly/YYYY-Www.md`. If it already exists (re-run), replace only the sections below and keep anything the user added.

```
# Week YYYY-Www

## What moved
- [[Projects/Checkout Redesign]]: beta reached 10% of traffic
## What slipped
- Vendor contract: due Wednesday, still open
## What's next
1. ...
## Done on my own
- <L2 activity this week, then L1 activity> — [[link]]
## Status update (draft)
<see step 4>
## Autonomy proposals
<see step 5>
```

(Example lines are fictional.) "What's next" comes from the Priorities list, open loops with due dates next week, and anything the user said they'd do.

The weekly note is this task's review surface, so write it at any level. Cleanup of `Now.md` (clearing **Done** entries older than two weeks, reordering Priorities to match what the week showed) follows the `weekly_review` level: at L0 list the proposed cleanup under **What needs you** and wait; at L1 do it and report; at L2 do it and list it under **Done on my own**. Clearing Activity log entries older than four weeks that already appeared in a weekly review is housekeeping and always allowed.

## Step 4: draft the status update

Write it for `status_update.audience` in `status_update.format` from the profile (e.g. "bullets: shipped / in progress / risks / asks"). Draw only on what the week's notes show. Keep it ready to paste: no internal links, no private worries unless the user flagged them as shareable, names as the audience would know them.

- **L0** (default): put it under **Status update (draft)** marked `> Draft for your review. Reply "looks good" or tell me what to change.`, and add a **Pending approvals** line. When the user replies, record the outcome (see `cos-autonomy`) and update the text.
- **L1** (the maximum): put it under **Status update (draft)** marked `> Ready to paste.` and report it; no approval step.

**Never send it**, post it, or share it, whatever the level. It is text for the user to copy.

## Step 5: autonomy proposals

Run the promotion and demotion checks from `cos-autonomy` for every task type. List each due proposal in plain language under **Autonomy proposals**, e.g. "You've approved my last 10 meeting-prep notes. Want me to just write them from now on?" If none are due, write "None this week." Don't change any level here; only the user's yes does that.

## Step 6: report

Post the contract's "What I did / What needs you" summary with a link to the weekly note. If this is a scheduled run and something needs the user (a status draft to review or a proposal), set a proposed reply on the home thread with `threads_set_proposed_reply` (`threadId: home_thread_id`), for example:

```
Weekly review (cos-weekly-review) is in [[Chief of Staff/Weekly/2026-W39]]. Status update: looks good. Proposals: <yes/no for each>.
```

If you are the home thread, ask directly instead. Also add a one-line pointer to the weekly note in today's daily note under `## Chief of Staff Brief`.
