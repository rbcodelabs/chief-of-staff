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

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

Two modes: **Check in** (usually a scheduled run) and **Apply answers** (in the home thread, after the user replies). Autonomy task type: `open_loops_update`.

## Step 0: contract and profile (both modes)

1. Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout.
2. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). Stop and offer `cos-setup` if it's missing.
3. Work out today (and its weekday, 0 = Sunday) in the profile's `timezone` yourself, from the date and time in your context (see `cos-contract`, "Dates and times"; never run a shell command for it).
4. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`.
5. Call `threads_get_current` to learn whether you are the home thread (`id == home_thread_id`) and whether you were started by a schedule.

## Mode A: check in

### A0. Skip the weekly-review day

A thread holds only one proposed reply, and the weekly review sets one on Fridays (or whichever day the profile says). If this is a **scheduled** run, `rituals.weekly_review.enabled` is true, and today's weekday (0 = Sunday) equals `rituals.weekly_review.day`, don't post a check-in: report "Skipping today's check-in; the weekly review will ask instead" and stop (archive the thread per `cos-contract`). The weekly review folds any stale loops and unanswered check-in questions into its own message. When the user asks for a check-in directly, run it anyway.

### A1. Find stale loops

Parse every unchecked loop line in `Now.md` (grammar: `- [ ] <what> — <status> — touched YYYY-MM-DD[ — due YYYY-MM-DD][ — [[link]]]`). A loop is **stale** when today minus `touched` is more than `rituals.open_loops_check.stale_after_days` (default 5).

Before asking, look for evidence the loop moved since `touched`: search the vault (`vault_search`, backlinks on the linked note, recent daily and meeting notes) for the loop's subject.

- **Evidence found, `open_loops_update` at L1 or above:** update `touched` to the evidence date, log it in the Activity log with `outcome: pending`, and don't ask about it.
- **Evidence found, at L0:** don't edit. It becomes an **evidence-based** question: "Looks like this moved on <date> ([[evidence]]). Mark it touched?"
- **No evidence:** a **plain** question.

Pick **at most 3 questions in total**, evidence-based ones included: overdue `due` dates first, then the longest untouched.

If nothing is stale, report "No loops have gone quiet" and stop. Don't set a proposed reply.

### A2. Post the check-in

Each loop gets exactly one question, e.g. *"The hiring plan hasn't come up in 6 days. Still active, blocked, or drop it?"*

Build **one** message the user can approve or edit in one click; all questions go in it. Pre-fill each answer:

- **Evidence-based question:** pre-fill the answer the evidence supports (e.g. `touched 2026-09-24`) and mark it `(from [[evidence]])`.
- **Plain question:** pre-fill the loop's current status (`still active`, `still waiting` or `still blocked`), marked `(default)`.

```
Open-loops check-in (cos-open-loops). Edit my answers, then send:
1. Hiring plan: 6 days quiet. Still active, blocked, or drop it? → still active (default)
2. Vendor contract: looks like it moved on 2026-09-24 ([[Meetings/2026-09-24 Vendor sync]]). Mark it touched? → touched 2026-09-24 (from evidence)
3. Legal review (waiting on Avery): 8 days quiet. Still waiting, chase, or drop it? → still waiting (default)
```

These are status answers the user can send as-is; never pre-fill anything that grants permission (a promotion, an approval, or sending something).

Deliver it:

- **Scheduled / other thread:** `threads_set_proposed_reply` with `threadId: home_thread_id` and the text above. It cannot target the current thread, which is why the home thread id is stored in the profile.
- **You are the home thread:** ask the same questions directly in the conversation instead.
- **Home thread unreachable** (empty id, call fails): report "I couldn't reach the Chief of Staff thread", add the questions to today's daily note under `## Chief of Staff Updates` as `### HH:MM Check-in`, and stop.

Record the check-in under **Pending approvals** in `Autonomy.md`: `- YYYY-MM-DD open_loops_update — check-in: <loop names> — awaiting`.

### A3. Report

Post the contract's summary in the thread you're running in: which loops you asked about, anything you marked touched (L1+), and "answers go to the Chief of Staff thread". A scheduled run whose check-in was delivered as a proposed reply has handed off to the home thread, so archive this thread afterwards (see `cos-contract`, section 6).

## Mode B: apply answers (home thread)

When the user sends a check-in answer (the message starts with "Open-loops check-in", or clearly answers one), apply each answer to `Now.md`. These are the user's own instructions, so write them directly at any autonomy level:

| Answer | Change to the loop line |
|---|---|
| still active / yes / continuing | `touched <today>` |
| touched D (accepting evidence) | `touched D` |
| blocked (on X) | status `blocked`, `touched <today>`, add "on X" to the text |
| waiting / still waiting | status `waiting`, `touched <today>` |
| done | `- [x] <what> — done <today>`, move to **Done** |
| drop / dropped | `- [x] <what> — dropped <today>`, move to **Done** |
| new date: D | set `due D`, `touched <today>` |
| chase | `touched <today>`; draft (never send) a short nudge to the person and show it in the thread |
| anything unclear | leave it and ask one follow-up question |

Then:

1. Set `updated_at` in `Now.md` frontmatter to today (`YYYY-MM-DD`).
2. Remove the **Pending approvals** line for this check-in.
3. **Record at most one outcome per check-in, and only if it had evidence-based questions.** Kept `(default)` answers say nothing about your judgment, so never record them. Across the evidence-based questions: if the user reversed any (e.g. "no, it didn't move"), record one `rejected`; otherwise if they changed any, one `approved-with-edits`; otherwise one `approved`. Record it for `open_loops_update` as described in `cos-autonomy`.
4. Reply with the summary: what changed, with a link to `[[<cos_folder>/Now]]`.

## Other requests

- "Add a loop: X" → add a line in the right section with `— active — touched <today>` (the user's instruction).
- "Mark X done" → as in the table above.
- "What am I waiting on?" → list the **Waiting on** section with days since touched; no writes.
