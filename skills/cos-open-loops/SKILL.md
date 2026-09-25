---
name: cos-open-loops
description: >-
  Review the Chief of Staff open-loops list (Now.md), check in on up to 3
  stale loops with one question each as a proposed reply in the user's home
  Chief of Staff thread, and apply the user's answers back to Now.md. Use when
  the scheduled "Chief of Staff — Open Loops" ritual fires, when the user asks
  "what's gone quiet", "check my open loops", "what am I waiting on", or says
  "add a loop" / "mark X done", and when the user replies to an open-loops
  check-in in the home thread.
---

# Chief of Staff open loops

Two modes: **Check in** (usually a scheduled run) and **Apply answers** (in the home thread, after the user replies). Follow `cos-contract` throughout. Autonomy task type: `open_loops_update`.

## Step 1: read (both modes)

1. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). Stop and offer `cos-setup` if it's missing.
2. Compute today in the profile's `timezone`.
3. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`.
4. Call `threads_get_current` to learn whether you are the home thread (`id == home_thread_id`).

## Mode A: check in

### A1. Find stale loops

Parse every unchecked loop line in `Now.md` (grammar: `- [ ] <what> — <status> — touched YYYY-MM-DD[ — due YYYY-MM-DD][ — [[link]]]`). A loop is **stale** when today minus `touched` is more than `rituals.open_loops_check.stale_after_days` (default 5).

Before asking, look for evidence the loop moved since `touched`: search the vault (`vault_search`, backlinks on the linked note, recent daily and meeting notes) for the loop's subject.

- **Evidence found:** that's an `open_loops_update`. At L1 or above, update `touched` to the evidence date, log it in the Activity log, and don't ask about it. At L0, don't edit; include it in the check-in as "Looks like this moved on <date> ([[evidence]]). Mark it touched?"
- **No evidence:** it's a check-in candidate.

Pick **at most 3** candidates: overdue `due` dates first, then the longest untouched.

If nothing is stale, report "No loops have gone quiet" and stop. Don't set a proposed reply.

### A2. Post the check-in

Each loop gets exactly one question, e.g. *"The hiring plan hasn't come up in 6 days. Still active, blocked, or drop it?"*

Build **one** message the user can approve or edit in one click. A thread holds a single proposed reply, so all (up to 3) questions go in one message. Pre-fill each answer with your best guess from the evidence; default to `still active` when you have none. Format:

```
Open-loops check-in (cos-open-loops). Edit my answers, then send:
1. Hiring plan: 6 days quiet. Still active, blocked, or drop it? → still active
2. Vendor contract: due yesterday. Done, new date, or drop it? → new date: <fill in>
3. Legal review (waiting on Avery): 8 days quiet. Still waiting, chase, or drop it? → still waiting
```

Deliver it:

- **Scheduled / other thread:** `threads_set_proposed_reply` with `threadId: home_thread_id` and the text above. It cannot target the current thread, which is why the home thread id is stored in the profile.
- **You are the home thread:** ask the same questions directly in the conversation instead.
- **Home thread unreachable** (empty id, call fails): report "I couldn't reach the Chief of Staff thread", add the questions to today's daily note under `## Chief of Staff Brief` as `### Check-in`, and stop.

Record the check-in under **Pending approvals** in `Autonomy.md`: `- YYYY-MM-DD open_loops_update — check-in: <loop names> — awaiting`.

### A3. Report

Post the contract's summary in the thread you're running in: which loops you asked about, anything you marked touched (L1+), and "answers go to the Chief of Staff thread".

## Mode B: apply answers (home thread)

When the user sends a check-in answer (the message starts with "Open-loops check-in", or clearly answers one), apply each answer to `Now.md`. These are the user's own instructions, so write them directly at any autonomy level:

| Answer | Change to the loop line |
|---|---|
| still active / yes / continuing | `touched <today>` |
| blocked (on X) | status `blocked`, `touched <today>`, add "on X" to the text |
| waiting / still waiting | status `waiting`, `touched <today>` |
| done | `- [x] <what> — done <today>`, move to **Done** |
| drop / dropped | `- [x] <what> — dropped <today>`, move to **Done** |
| new date: D | set `due D`, `touched <today>` |
| chase | `touched <today>`; draft (never send) a short nudge to the person and show it in the thread |
| anything unclear | leave it and ask one follow-up question |

Then:

1. Update `updated_at` in `Now.md` frontmatter.
2. Mark the **Pending approvals** line for this check-in resolved (remove it), and record an `open_loops_update` outcome for any pre-filled guess the user kept (`approved`), tweaked (`approved-with-edits`) or reversed (`rejected`), as described in `cos-autonomy`.
3. Reply with the summary: what changed, with a link to `[[<cos_folder>/Now]]`.

## Other requests

- "Add a loop: X" → add a line in the right section with `— active — touched <today>` (the user's instruction).
- "Mark X done" → as in the table above.
- "What am I waiting on?" → list the **Waiting on** section with days since touched; no writes.
