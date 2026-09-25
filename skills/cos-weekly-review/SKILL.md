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
3. Work out today, the current time and the ISO week (`YYYY-Www`, e.g. `2026-W39`) in the profile's `timezone` yourself, from the date and time in your context (see `cos-contract`, "Dates and times"). Never run a shell command for this; this ritual runs unattended and a permission prompt stalls it.
4. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`. Find the most recent earlier review by running `vault_list` on `<cos_folder>/Weekly` and picking the latest `YYYY-Www.md` before this week's; Read it. An empty or failed listing means there is no earlier review. Don't use shell commands (see `cos-contract`, "Tools: no shell, ever").
5. **Review window:** from the day after the previous weekly review's date through today, so weekend and late-week activity is never missed. If there is no previous review, use the last 7 days.

## Step 1: settle L2 activity

For each **Activity log** line at L2 with `outcome: pending` dated before today, settle it as described in `cos-autonomy` ("Settle activity outcomes") and update the ledger. Also settle any L1 lines still pending (for example if no brief ran).

## Step 2: gather the window

- **Daily notes** in the window: Read each one at its known path (a failed Read means there's no note that day). Take the `## Chief of Staff Brief` and `## Chief of Staff Updates` sections and anything the user wrote.
- **Meeting notes** dated in the window: `vault_list` `locations.meetings`, then Read those whose names carry a date in the window. Take decisions and action items.
- **Project notes** touched in the window: `vault_list` `locations.projects`, then use `vault_search` and the daily and meeting notes above to see which projects came up.
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
- Vendor contract: due 2026-09-23, still open
## What's next
- Due today: Send the Q4 hiring plan to Sam
1. ...
## Done on my own
- <L2 activity in the window, then L1 activity> — [[link]] — <outcome>
## Status update (draft)
<see step 4>
## Autonomy proposals
<see step 5>
```

(Example lines are fictional.) "What's next" comes from the Priorities list, open loops due today or next week, and anything the user said they'd do.

**Slipped means overdue, and nothing else.** Compare each `due` date with today exactly (see `cos-contract`, "Dates and times"). Only an open loop whose `due` date is *before* today goes under **What slipped**. A loop due today has not slipped: list it first under **What's next** as "Due today: …". A loop due later isn't slipped either.

The weekly note is this task's review surface, so write it at any level. Cleanup of `Now.md` (clearing **Done** entries older than two weeks, reordering Priorities to match what the week showed) follows the `weekly_review` level: at L0 list the proposed cleanup under **What needs you** and wait; at L1 do it and report; at L2 do it and list it under **Done on my own**. Log L1/L2 cleanup in the Activity log with `outcome: pending`. Clearing settled Activity log entries older than four weeks that already appeared in a weekly review is housekeeping and always allowed.

## Step 4: draft the status update

Write it for `status_update.audience` in `status_update.format` from the profile (e.g. "bullets: shipped / in progress / risks / asks"). Draw only on what the window's notes show.

**Each status line restates only what `Now.md` or a note records.** Don't infer a state that isn't written down (not started, on track, delayed, blocked). For a waiting-on item or any loop with no newer record, write "waiting on <X> (no update since <touched date>)".

- Bad: "Legal review hasn't started." (The notes only say you're waiting on it.)
- Good: "Waiting on legal review (no update since 2026-09-20)."

**Use the `Now.md` status words exactly**: `active`, `blocked`, `waiting`, `done`, `dropped`. A loop recorded as `waiting` is "waiting"; don't rephrase it as "active — waiting on" or "in progress". Don't mix two statuses on one line, and don't invent new ones ("stalled", "at risk").

- Bad: "Legal review: active — waiting on legal."
- Good: "Legal review: waiting (no update since 2026-09-20)."

Keep it ready to paste: no internal links, no private worries unless the user flagged them as shareable, names as the audience would know them.

**Put each item in the right category.** When the format has an **Asks** section (or similar: needs, requests), it holds only things the user needs *from others*: a decision, a review, resources, an unblock. The user's own commitments ("send the Q4 hiring plan to Sam") go under in progress or next, never under Asks. If there's nothing the user needs from anyone, leave Asks out or write "None".

- **L0** (default): put it under **Status update (draft)** marked `> Draft for your review. Reply "looks good" or tell me what to change.`, and add a **Pending approvals** line. When the user replies, record the outcome (see `cos-autonomy`) and update the text.
- **L1** (the maximum): put it under **Status update (draft)** marked `> Ready to paste.`, log it in the Activity log with `outcome: pending`, and report it; no approval step.

**Never send it**, post it, or share it, whatever the level. It is text for the user to copy.

## Step 5: autonomy proposals

Run the promotion and demotion checks from `cos-autonomy` for every task type. List each due proposal in plain language under **Autonomy proposals**, e.g. "You've approved my last 10 meeting-prep notes. Want me to just write them from now on?" If none are due, write "None this week." Don't change any level here; only the user's yes does that.

## Step 6: report

Post the contract's "What I did / What needs you" summary with a link to the weekly note. Add a one-line pointer to the weekly note in today's daily note under `## Chief of Staff Updates` as `### HH:MM cos-weekly-review`, where `HH:MM` is the actual time you write it, not the ritual's scheduled time (or `### cos-weekly-review` if you don't know the time). Add it at the **end** of the daily note as `cos-contract` §5 describes. If `## Chief of Staff Updates` exists, append to the end of that section; otherwise append the heading and entry after everything else in the note. Never insert it inside or above the `## Chief of Staff Brief` section or its `### Update HH:MM` subsections. The `Weekly/` folder is created implicitly by writing the note; never create it separately.

If something needs the user (a status draft at L0, a proposal, stale loops, or an unanswered check-in) and you are **not** the home thread, set one proposed reply on the home thread with `threads_set_proposed_reply` (`threadId: home_thread_id`). The open-loops ritual skips this day, so fold its questions in here: any still-unanswered check-in questions from **Pending approvals**, plus up to 3 stale loops if there was no check-in this week. Leave every verdict for the user to fill in; never pre-fill consent:

```
Weekly review (cos-weekly-review) is in [[Chief of Staff/Weekly/2026-W39]].
Status update: <looks good / change …>
Proposals: <answer each: yes / no>
Open loops (edit, then send):
1. Hiring plan: 6 days quiet. Still active, blocked, or drop it? → still active (default)
```

**When no proposals are due, leave the `Proposals:` line out of the proposed reply entirely.** Likewise, leave out the `Status update:` line at L1 and the `Open loops` block when there are none. **Add NO note, parenthetical or sentence about missing proposals or check-ins in the proposed reply**: not "Proposals: none", not "(No autonomy proposals or open-loop check-ins this week)", nothing. A missing line says it all. "None this week." belongs only in the weekly note. Only open-loop status answers get defaults, as in `cos-open-loops`. If you are the home thread, ask directly instead.

If this is a scheduled run and nothing needs the user, archive this thread with `threads_archive` (see `cos-contract`, section 6).
