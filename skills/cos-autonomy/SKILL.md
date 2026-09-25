---
name: cos-autonomy
description: >-
  Autonomy levels and the approval ledger for the Chief of Staff pack. Use
  before any cos-* skill writes to the vault (to look up the level for its task
  type), whenever the user approves, edits or rejects a chief-of-staff draft
  ("looks good", "change X", "no") or reacts to something done on its own
  ("that was wrong", "undo that"), when settling activity outcomes in the
  daily brief or weekly review, when checking whether to propose a promotion
  or demotion, and when the user asks "what are you allowed to do", "just do
  meeting prep from now on", "stop doing X without asking" or "change your
  autonomy".
---

# Chief of Staff autonomy

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

How much the chief of staff does on its own, per task type, and how that changes over time.

## Step 0: contract and profile

1. Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout; its hard limits apply at every level.
2. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile), then `<cos_folder>/Autonomy.md`. If `Autonomy.md` is missing but the profile exists, recreate it from the Autonomy template in "Embedded template" at the end of this skill (all task types at L0; set `updated_at` to today, `YYYY-MM-DD`) and say so. Don't look for the pack's files on disk.

## Task types

| Task type | What it covers | Review surface (always writable) | Changes the level governs | Max level |
|---|---|---|---|---|
| `daily_brief` | The morning brief | The `## Chief of Staff Brief` section of the daily note | None: the brief only writes its own section, so it stays at L0 and is never promoted | L0 |
| `meeting_prep` | Prep notes | The thread | Creating or refreshing the prep note in the meetings folder | L2 |
| `action_items` | Post-meeting action-item pass | The thread | Adding loops to `Now.md` and open items to people notes | L2 |
| `open_loops_update` | Inferred changes to `Now.md` | The thread / the check-in | Marking loops touched, done or new from vault evidence | L2 |
| `weekly_review` | The Friday review | The weekly note | Cleaning up and reordering `Now.md` | L2 |
| `status_update_draft` | The draft status update | The weekly note, marked as a draft | Marking it "ready to paste" without asking | L1 |
| `note_filing` | Filing notes the user didn't explicitly ask for | The thread | Creating or appending project, people and import notes | L2 |

Vault-only changes the user explicitly asks for ("mark X done", "import this doc", answers to a check-in, checked items in the Setup Draft) are instructions, not autonomous work: do them at any level and don't record an outcome. A request to send, share, post or invite still produces only a draft.

## Levels

- **L0 draft:** write the draft in the thread or the review surface, add a **Pending approvals** line, and wait for approval before touching other notes.
- **L1 act and report:** make the vault-only change directly, log it in the **Activity log** with `outcome: pending`, and report it with links in the thread and the daily note.
- **L2 act and batch:** make the vault-only change directly, log it in the **Activity log** with `outcome: pending`, and report it only in the weekly review.

External effects are never above draft: nothing is sent, shared, posted, invited or deleted outside the vault at any level (see `cos-contract`). `status_update_draft` stops at L1: it can mark the draft ready to paste, but it never sends it.

## Look up a level (before any write)

1. Find the `## <task_type>` section in `Autonomy.md` and read `level` from its table.
2. If the section or value is missing or unreadable, treat it as `L0`.
3. Act as the level says. If a single run touches several task types, look each one up.

## Record an outcome (L0 drafts)

When the user responds to a draft listed under **Pending approvals** (in the home thread, or in the thread where the draft was shown):

1. Find which draft they mean. If it's ambiguous, ask.
2. Classify their response:
   - **`approved`**: "looks good", "yes", "go ahead", a thumbs-up, or they approved without changes.
   - **`approved-with-edits`**: a small tweak (a word, a line, a date, a reordering) and otherwise accepted.
   - **`rejected`**: "no", "don't", or they rewrote most of it.
3. Append the outcome to the task type's ledger (see "Update the ledger").
4. Remove the Pending approvals line.
5. Apply the draft (with edits) or discard it, as the user said.

## Settle activity outcomes (L1 and L2)

At L1 and L2 there is no draft to approve, so outcomes come from what the user does with the change afterwards. Each **Activity log** line ends in `outcome: pending` until it is settled:

- **L1 entries** are settled by the next `cos-daily-brief` after the entry's date.
- **L2 entries** are settled by the next `cos-weekly-review` after the entry's date.
- **Any entry** is settled immediately when the user reacts to it in a thread.

To settle an entry, re-read the note it links and compare it with what the entry says you wrote:

| What you find | Outcome |
|---|---|
| Your change is still there as written, and the user said nothing against it | `approved` |
| Your change is still there but the user edited it (wording, dates, items added or removed) | `approved-with-edits` |
| The user reverted or deleted your change, or said "that was wrong" / "undo that" | `rejected` |
| You can't tell (the note was restructured, or the link is gone) | `skipped` (not added to the ledger) |

Replace `pending` with the outcome on the log line, append it to the task type's ledger (except `skipped`), and run the checks below. A `rejected` outcome always leads to a demotion proposal.

## Update the ledger

In the task type's table: append the outcome to `last 10 outcomes` (drop the oldest beyond 10). Update `streak`: add 1 for `approved`/`approved-with-edits`, reset to 0 for `rejected`. Set `updated_at` to today (`YYYY-MM-DD`). Then run the promotion and demotion checks. Never record outcomes for `daily_brief`.

## Promotion

Propose moving up one level when **all** of these hold:

- the task type has 10 outcomes in `last 10 outcomes`;
- all 10 are `approved` or `approved-with-edits`;
- at most 2 are `approved-with-edits`;
- the task type is below its max level.

Propose in plain language, naming what would change, e.g.:

> You've approved my last 10 meeting-prep notes. Want me to just write them from now on? I'll still link each one in your daily note.

For L1 → L2: "Want me to stop reporting these daily and just list them in the Friday review?"

Ask in the conversation if you're in the home thread; otherwise include it in the weekly review's **Autonomy proposals**. Never pre-fill the answer. **Only the user's yes changes the level.**

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

## Embedded template

An exact copy of the pack's Autonomy template, for recreating a missing `Autonomy.md`. Copy the contents (without the fence), set `updated_at` to today (`YYYY-MM-DD`), and write it with Write.

### Autonomy template (`Autonomy.md`)

<!-- embedded-template: Autonomy.md -->
````markdown
---
cos_version: 1
updated_at: ""
---

# Autonomy

How much your chief of staff does on its own, per task type. Everything starts at L0.

- **L0 draft**: drafts for you, waits for approval before touching other notes.
- **L1 act and report**: makes vault-only changes and reports them with links.
- **L2 act and batch**: makes vault-only changes and reports them in the weekly review.

Anything that would reach another person is always a draft, whatever the level. Only your "yes" changes a level; ask any time to change one. The daily brief only writes its own section, so it stays at L0.

## daily_brief

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## meeting_prep

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## action_items

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## open_loops_update

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## weekly_review

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## status_update_draft

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## note_filing

| level | streak | last 10 outcomes |
|---|---|---|
| L0 | 0 | — |

## Pending approvals

<!-- One line per draft waiting for you. e.g.
- 2026-09-26 meeting_prep — prep for roadmap review — [[Meetings/2026-09-26 Roadmap review]] — awaiting
-->

## Activity log

<!-- Vault changes made without asking (L1/L2). Each starts as "outcome: pending" and is settled by the next brief (L1) or weekly review (L2): kept as written = approved, edited by you = approved-with-edits, reverted or "that was wrong" = rejected. e.g.
- 2026-09-26 open_loops_update (L1) — marked "Draft launch FAQ" done — [[Chief of Staff/Now]] — outcome: pending
-->

## Change log

<!-- Level changes and why. e.g.
- 2026-10-10 meeting_prep L0 → L1 — you approved the last 10 prep notes
-->
````
