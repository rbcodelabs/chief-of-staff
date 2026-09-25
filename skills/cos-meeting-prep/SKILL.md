---
name: cos-meeting-prep
description: >-
  Prepare for a meeting and follow up afterwards. Writes a prep note in the
  meetings folder (attendees linked to people notes, related projects and open
  loops, last notes with these people, suggested agenda and questions), then
  after the meeting offers an action-items pass into Now.md and people notes.
  Use when the user says "prep me for…", "get me ready for my 1:1 with…",
  "what do I need for the roadmap review", replies "prep <meeting>" to a daily
  brief, or says "pull the action items from…" / "the meeting's done".
---

# Chief of Staff meeting prep

Follow `cos-contract` throughout. Autonomy task types: `meeting_prep` (the prep note) and `action_items` (the follow-up pass).

## Step 1: read

1. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile). Stop and offer `cos-setup` if it's missing.
2. Read `<cos_folder>/Now.md` and `<cos_folder>/Autonomy.md`; note the levels for `meeting_prep` and `action_items`.

## Step 2: identify the meeting

- **Named by the user** ("my 1:1 with Priya tomorrow"): use what they said. If date, time or attendees are missing and matter, ask one question.
- **From the calendar:** only if `sources.calendar` is not `"none"` and the tool is available. Read the event (title, time, attendees, description) read-only. If the calendar is unreachable, say so and ask the user who's attending.
- Never invent attendees or agenda items that didn't come from the calendar, the user or the vault.

## Step 3: gather context

For each attendee:
- Find their note in `locations.people` (match full name, then first name + context). Link it. If there's no note, list them as "no note yet" (creating people notes is `note_filing`; propose it, and only create at L1+).
- Read their note for relationship, projects and anything flagged to raise.

Then:
- **Related projects:** projects linked from the attendees' notes, named in the meeting title/description, or listed in the profile's priorities.
- **Related open loops:** lines in `Now.md` that mention the attendees or those projects, with status and days since touched. Waiting-on items owned by an attendee go first.
- **Last notes with these people:** the most recent 2–3 notes in `locations.meetings` that link an attendee (use `vault_get_backlinks` on the person note, or `vault_search` by name), with a one-line recap of each and any unfinished action items.

## Step 4: draft the prep

Prep note path: `<locations.meetings>/YYYY-MM-DD <Meeting title>.md`.

```
# <Meeting title>
Date: YYYY-MM-DD HH:MM · Attendees: [[People/Priya Shah]], [[People/Sam Rivera]]

## Prep
**Context**: <one or two lines: why this meeting, what's changed>
**Related projects**: [[Projects/Checkout Redesign]]
**Open loops**
- Waiting on Priya: fraud-rule review (8 days)
**Last time**
- [[Meetings/2026-09-19 1-1 Priya]]: agreed to split the rollout; Priya owed a rules estimate
**Suggested agenda**
1. ...
**Questions to ask**
- ...

## Notes

## Action items
```

(Names are illustrative.) Keep it to what fits on one screen.

Write it according to the `meeting_prep` level:

- **L0:** show the prep in the thread and ask "Want me to save this to [[<path>]]?" Add a **Pending approvals** line in `Autonomy.md`. On the user's verdict, record the outcome (see `cos-autonomy`) and save (with their edits) or discard.
- **L1:** write the note, log it in the Activity log, and report with a link.
- **L2:** write the note and log it; mention it only in the weekly review.

If a note for this meeting already exists, add or refresh the `## Prep` section only; never touch the user's own notes in it.

Agendas and questions are for the user. If they want to send an agenda to attendees, give them the text to copy; never send it.

## Step 5: after the meeting (action items)

When the user says the meeting is done, or asks to pull action items (or when the next brief notices a meeting note with content under **Notes** or **Action items** that hasn't been processed), offer the pass: "Want me to pull the action items from [[<meeting note>]]?"

On yes, read the meeting note and extract action items: owner, what, due date if stated.

- **The user's own items** → new loop lines in `Now.md` under **Commitments** (`— active — touched <today>[ — due D] — [[meeting note]]`).
- **Items others owe the user** → `Now.md` **Waiting on**, and a line under `## Open items` in that person's note.
- Mark the meeting note's action items with the loops they became.

Apply according to the `action_items` level: at L0 list the proposed changes in the thread and wait (Pending approvals line, record outcome on the verdict); at L1 apply and report with links; at L2 apply and log for the weekly review.

Follow-up emails or messages to attendees are drafts in the thread, never sent.

## Step 6: report

Post the contract's "What I did / What needs you" summary.
