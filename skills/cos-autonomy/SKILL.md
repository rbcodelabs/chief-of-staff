---
name: cos-autonomy
description: >-
  Autonomy levels and the approval ledger for the Chief of Staff pack. Use
  before any cos-* skill writes to the vault (to look up the level for its task
  type), whenever the user approves, edits or rejects a chief-of-staff draft
  ("looks good", "change X", "no"), when checking whether to propose a
  promotion or demotion (weekly review), and when the user asks "what are you
  allowed to do", "just do meeting prep from now on", "stop doing X without
  asking" or "change your autonomy".
---

# Chief of Staff autonomy

How much the chief of staff does on its own, per task type, and how that changes over time. Follow `cos-contract` throughout; its hard limits apply at every level.

Read `Chief of Staff/Profile.md` first (see the contract for finding a moved profile), then `<cos_folder>/Autonomy.md`. If `Autonomy.md` is missing but the profile exists, recreate it from the pack's `templates/Autonomy.md` (all task types at L0) and say so.

## Task types

| Task type | What it covers | Review surface (always writable) | Changes the level governs | Max level |
|---|---|---|---|---|
| `daily_brief` | The morning brief | The `## Chief of Staff Brief` section of the daily note | Follow-up edits the brief suggests beyond itself | L2 |
| `meeting_prep` | Prep notes | The thread | Creating or refreshing the prep note in the meetings folder | L2 |
| `action_items` | Post-meeting action-item pass | The thread | Adding loops to `Now.md` and open items to people notes | L2 |
| `open_loops_update` | Inferred changes to `Now.md` | The thread / the check-in | Marking loops touched, done or new from vault evidence | L2 |
| `weekly_review` | The Friday review | The weekly note | Cleaning up and reordering `Now.md` | L2 |
| `status_update_draft` | The draft status update | The weekly note, marked as a draft | Marking it "ready to paste" without asking | L1 |
| `note_filing` | Filing notes the user didn't explicitly ask for | The thread | Creating or appending project, people and import notes | L2 |

Changes the user explicitly asks for ("mark X done", "import this doc", answers to a check-in, checked items in the Setup Draft) are instructions, not autonomous work. Do them at any level.

## Levels

- **L0 draft:** write the draft in the thread or the review surface, add a **Pending approvals** line, and wait for approval before touching other notes.
- **L1 act and report:** make the vault-only change directly, log it in the **Activity log**, and report it with links in the thread and the daily note.
- **L2 act and batch:** make the vault-only change directly, log it in the **Activity log**, and report it only in the weekly review.

External effects are never above draft: nothing is sent, shared, posted, invited or deleted outside the vault at any level (see `cos-contract`). `status_update_draft` stops at L1: it can mark the draft ready to paste, but it never sends it.

## Look up a level (before any write)

1. Find the `## <task_type>` section in `Autonomy.md` and read `level` from its table.
2. If the section or value is missing or unreadable, treat it as `L0`.
3. Act as the level says. If a single run touches several task types, look each one up.

## Record an outcome

When the user responds to a draft (in the home thread, or in the thread where the draft was shown):

1. Find which draft they mean from **Pending approvals**. If it's ambiguous, ask.
2. Classify their response:
   - **`approved`**: "looks good", "yes", "go ahead", a thumbs-up, or they approved without changes.
   - **`approved-with-edits`**: a small tweak (a word, a line, a date, a reordering) and otherwise accepted.
   - **`rejected`**: "no", "don't", or they rewrote most of it.
3. In the task type's table: append the outcome to `last 10 outcomes` (drop the oldest beyond 10). Update `streak`: add 1 for `approved`/`approved-with-edits`, reset to 0 for `rejected`.
4. Remove the Pending approvals line and update `updated_at`.
5. Apply the draft (with edits) or discard it, as the user said.
6. Run the checks below.

## Promotion

Propose moving up one level when **all** of these hold:

- the task type has 10 outcomes in `last 10 outcomes`;
- all 10 are `approved` or `approved-with-edits`;
- at most 2 are `approved-with-edits`;
- the task type is below its max level.

Propose in plain language, naming what would change, e.g.:

> You've approved my last 10 meeting-prep notes. Want me to just write them from now on? I'll still link each one in your daily note.

For L1 → L2: "Want me to stop reporting these daily and just list them in the Friday review?"

Ask in the conversation if you're in the home thread; otherwise include it in the weekly review's **Autonomy proposals** (and in a proposed reply on the home thread). **Only the user's yes changes the level.**

## Demotion

A `rejected` outcome while the task type is at L1 or L2 → propose dropping back one level, e.g. "That one missed. Want me to go back to drafting meeting prep for you to approve?" On yes, drop the level.

## Changing a level

On the user's yes (or whenever they ask directly, e.g. "just do meeting prep from now on", "stop filing notes without asking"):

1. Set the new `level` (never above the max; if they ask for more, explain the limit).
2. Reset `streak` to 0 and `last 10 outcomes` to `—`, so the next proposal needs a fresh 10.
3. Add a **Change log** line: `- YYYY-MM-DD <task_type> L0 → L1 — <reason, e.g. "you approved the last 10">`.
4. Confirm in one line what will happen differently.

If the user declines a promotion, reset `last 10 outcomes` to `—` (so you don't ask again until 10 more) and log "promotion declined" in the Change log.

## Report

When asked "what are you allowed to do?", list each task type with its level in one line each, plus the hard limits from `cos-contract` in one sentence.
