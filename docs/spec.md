# Chief of Staff Pack — Spec v0.1

**Date:** 2026-09-25
**Repo:** `rbcodelabs/chief-of-staff` (public)
**Target user:** a PM or knowledge worker who wants a chief of staff that works over their Obsidian vault.
**Host:** built for Geode / Agent Threads. It depends on Geode's shared tools, which every harness gets. It is not meant to run everywhere.

---

## 1. Outcome

A brand-new user's first-run experience goes: first run → a Chief of Staff thread opens → a 10-minute setup → first brief delivered → daily brief scheduled. They come back within the first week because the brief, the open-loop check-ins and the Friday review keep working without them.

**Activation (day 1):** `Profile.md` has `setup_completed_at` set, **and** a daily-brief schedule exists.
**Retention signal (week 1):** at least 3 briefs delivered and at least 1 check-in answered or 1 draft approved.
Everything is measured locally from vault state. There is no telemetry.

## 2. Repo layout

```
.claude-plugin/plugin.json      { "name": "chief-of-staff", "displayName": "Chief of Staff", "skills": "./skills" }
.claude-plugin/marketplace.json lets Claude Code install the repo as a single-plugin marketplace
README.md                       what it is, how to install (Geode skill source or Claude Code plugin)
docs/spec.md                    this spec, with nothing specific to one user
docs/profile-schema.md          canonical profile schema (section 4)
templates/                      Profile.md, Now.md, Autonomy.md, Setup Draft.md starters
skills/
  cos-contract/SKILL.md
  cos-setup/SKILL.md
  cos-import/SKILL.md
  cos-daily-brief/SKILL.md
  cos-open-loops/SKILL.md
  cos-meeting-prep/SKILL.md
  cos-weekly-review/SKILL.md
  cos-autonomy/SKILL.md
tests/                          structural tests: frontmatter, cross-references, templates match the schema
```

**Portability rule:** nothing is specific to one user. Examples are fictional. Every location and name comes from the user's `Profile.md`.

## 3. Files the pack writes in the user's vault

The pack keeps its own files in one folder. The folder name is configurable and defaults to `Chief of Staff/`.

| File | Purpose |
|---|---|
| `Chief of Staff/Profile.md` | Who the chief of staff works for. Every skill reads it first. |
| `Chief of Staff/Now.md` | The list of open loops: current projects, commitments and worries, each with a last-touched date. |
| `Chief of Staff/Autonomy.md` | The approval history and the current autonomy level per task type. |
| `Chief of Staff/Setup Draft.md` | The review note from setup. Kept afterwards as a record. |
| `Chief of Staff/Weekly/YYYY-Www.md` | Friday reviews. |

Project, people and meeting notes go into the user's **existing** folders when the vault has them (detected during setup). Otherwise the pack creates `Projects/`, `People/` and `Meetings/`. Briefs are appended to the daily note, which the pack creates if it's missing, using the daily-note folder and format recorded in the profile.

## 4. Profile schema (`Profile.md`)

Frontmatter holds the fields skills read by machine. The body holds context written for people.

```yaml
cos_version: 1
name: "Jordan Lee"                 # fictional example
role: "Senior PM, Payments"
timezone: "America/Chicago"
home_thread_id: "<thread id>"      # the persistent Chief of Staff thread; proposed replies go here
setup_completed_at: 2026-09-25T09:40:00-05:00
locations:
  cos_folder: "Chief of Staff"
  daily_notes: { folder: "Daily", format: "YYYY-MM-DD" }
  projects: "Projects"
  people: "People"
  meetings: "Meetings"
rituals:
  daily_brief: { enabled: true, time: "08:00", days: [1,2,3,4,5], schedule_id: "<cron id>" }
  open_loops_check: { enabled: true, time: "13:00", days: [1,2,3,4,5], schedule_id: "<cron id>", stale_after_days: 5 }
  weekly_review: { enabled: true, day: 5, time: "15:00", schedule_id: "<cron id>" }
sources:
  google_drive: true | false       # built-in Geode Google Workspace (Docs/Drive/Sheets/Slides)
  calendar: "none" | "<tool or MCP server name>"   # optional; not built in
status_update:
  audience: "my manager and the payments leads"
  format: "bullets: shipped / in progress / risks / asks"
```

Body sections: **Working context**, **Key people** (links to people notes), **Current priorities**, **Preferences** (tone, length, what to leave alone).

The field-by-field reference, plus the formats of `Now.md`, `Autonomy.md` and `Setup Draft.md`, is in [`profile-schema.md`](profile-schema.md).

## 5. The behavior contract (`cos-contract`)

This skill is always active. Its description tells the model to apply it whenever a `cos-*` skill runs or the user addresses their chief of staff.

- **Core rule:** *Can this be undone, or reviewed before it affects anyone else?* Yes → act and report. No → draft and wait.
- **Hard limits, whatever the autonomy level:** never send, share, post, invite or delete anything outside the vault. Anything that reaches another person is always a draft for the user.
- **Reading comes first:** read `Profile.md` before acting. If it's missing, offer `cos-setup` and don't guess.
- **Reporting:** every run ends with a short "what I did / what needs you" summary, in the thread and in the daily note where relevant.
- **Honesty:** say "I don't know" or "I couldn't reach X". Never invent meetings, people or status.
- **Autonomy lookup:** before writing, check `Autonomy.md` for this task type's level (see section 7).

## 6. Setup (`cos-setup`), which is the first-run experience

Runs in the persistent **Chief of Staff** thread. It uses one question per turn and a warm, brief tone, and aims to finish in about 10 minutes.

1. **Welcome and consent.** Explain in one paragraph what it will do and that nothing gets written until the user approves a draft. Record `home_thread_id` (`threads_get_current`).
2. **Read the vault's structure (read-only).** Find existing daily, meetings, people and projects folders and the daily-note format. Say what was found in one line. If the vault is empty, say so and move on without making a fuss about it.
3. **Calendar, if connected.** If a calendar tool is available, start from this week's meetings ("You have a 1:1 with Priya and a roadmap review Thursday. Tell me about those."). Otherwise skip this step.
4. **The interview**, one topic per turn:
   - role and team;
   - current projects (3–6);
   - key people and how they relate to each project;
   - open loops (commitments, waiting-on items, worries);
   - recurring rituals and who status updates go to;
   - preferences.

   Throughout, **note every document the user mentions** and where it lives. That list becomes the import list.
5. **Write `Setup Draft.md`**, the one review note. It has checkbox sections for Profile, Projects, People, Open loops and "Documents to import", each item one line. Tell the user to edit, uncheck, or say "go".
6. **On "go":** write `Profile.md`, `Now.md`, `Autonomy.md` (all task types at L0) and the checked project and people notes, linked to each other. Report what was created, with links.
7. **Targeted import.** Run `cos-import` for each checked document, one at a time (section 8).
8. **First brief now.** Run `cos-daily-brief` immediately so the user sees the result on day 1.
9. **Offer the rituals.** Ask "Want this every weekday at 8?" and offer the check-in and the Friday review. On yes, call `CronCreate` for each (see section 9) and store the `schedule_id`s in the profile. Set `setup_completed_at`.
10. **Close.** Explain in three lines what happens tomorrow and how to talk to the chief of staff (this thread).

Setup can be re-run: `cos-setup` on an existing profile offers to update sections rather than start over.

## 7. Autonomy (`cos-autonomy`)

**Task types:** `daily_brief`, `meeting_prep`, `action_items`, `open_loops_update`, `weekly_review`, `status_update_draft`, `note_filing`.

**Levels:**
- **L0 draft:** write a draft in the thread or a review section, then wait for approval before touching other notes.
- **L1 act and report:** make vault-only changes directly, and report with links in the thread and daily note.
- **L2 act and batch:** make vault-only changes, reported only in the weekly review.

External effects are **never** above draft (contract hard limit). `status_update_draft` has a maximum of L1: it can write the draft into the weekly note, but it never sends it.

**Ledger (`Autonomy.md`):** a table per task type with `level`, `streak`, and the `last 10 outcomes` (`approved` / `approved-with-edits` / `rejected`). The user's response classifies each outcome: "looks good" or no changes counts as `approved`, a small tweak as `approved-with-edits`, and "no" or a rewrite as `rejected`.

**Promotion:** when the last 10 outcomes include 10 `approved` or `approved-with-edits`, with at most 2 `approved-with-edits`, propose moving up one level in plain language, e.g. "You've approved my last 10 meeting-prep notes. Want me to just write them from now on?" Only the user's yes changes the level.
**Demotion:** a `rejected` outcome at L1 or above → propose dropping back one level. The user can change any level at any time by asking.

## 8. Import (`cos-import`)

- Input: one document reference (a Drive/Docs link or title, a pasted text, or a vault path) and the project it belongs to.
- It fetches the document with the Google Workspace tools if `sources.google_drive` is true. If the tools aren't available, it asks the user to paste the content.
- It **extracts** key decisions, dates, owners and open questions into a note (or a section of the project note) that links back to the source. It never copies the whole document wholesale.
- After each document it reports a 3-line summary: what was extracted and where it went.
- One document at a time, and never a bulk crawl.

## 9. Rituals

All rituals are scheduled with Geode `CronCreate`. Each prompt names the skill and says the profile is at `<cos_folder>/Profile.md`. Schedule names are `Chief of Staff — Daily Brief`, `Chief of Staff — Open Loops`, `Chief of Staff — Weekly Review`.

**`cos-daily-brief`** is appended to today's daily note under `## Chief of Staff Brief`:
- today's meetings (only when a calendar tool is connected; each meeting links to prep offered or done);
- top 3 priorities from `Now.md`;
- stale loops (untouched longer than `stale_after_days`);
- what the pack did on its own since the last brief;
- a closing line: *"What can I take off your plate today?"*, answered in the home thread.

**`cos-open-loops`** reviews `Now.md`. For up to 3 stale loops it posts a one-question check-in, e.g. *"The hiring plan hasn't come up in 6 days. Still active, blocked, or drop it?"*, as a **proposed reply** on the home thread (`threads_set_proposed_reply`). The user approves or edits the answer in one click, and the home thread applies it to `Now.md`. The scheduled thread can't set a proposed reply on itself, which is why it targets `home_thread_id`.

**`cos-meeting-prep`** takes a meeting (from the calendar, or named by the user) and writes a prep note in the meetings folder: attendees linked to people notes, related project and open loops, last notes with these people, and suggested agenda or questions. After the meeting it offers the **action items** pass: pull action items out of the meeting note into `Now.md` and people notes.

**`cos-weekly-review`** writes `Weekly/YYYY-Www.md` covering what moved, what slipped and what's next. It includes a **draft status update** in the format and for the audience set in the profile, ready to paste, plus the autonomy promotion proposals that are due.

## 10. Host first-run changes (Agent Threads plugin)

These changes live in the Agent Threads plugin, not in this repo. They are recorded here so the pack and the host agree on the first-run flow.

Replace the static welcome flow for **brand-new installs** only (same `hasSeenWelcome` gate, and upgrading users are untouched):

1. Open the Chat and Agents List panels as today.
2. Add the skill source `https://github.com/rbcodelabs/chief-of-staff` unless it's already present. This goes through the existing GitHub skill-source path (managed clone, reusing the helpers behind `AddSkillSourceModal`).
3. Create a persistent thread titled **Chief of Staff** whose first prompt starts `cos-setup`, and open it in Chat.
4. **Fallback:** if the clone fails (offline), the harness isn't ready, or the thread can't start, write and open the existing static guide, and add a line pointing to the new command.
5. Add a command, **"Set up Chief of Staff"**, that does steps 2–3 on demand. Existing users can use it any time, and it's idempotent: it reopens the existing Chief of Staff thread if there is one.
6. Add a setting, **"Offer Chief of Staff on first run"** (default on), so the first run can go back to the static guide.

Tests: unit tests for the first-run decision logic (new vs upgrading, source present or absent, clone failure → fallback) and for the command's idempotency. Update screenshots where the first-run UI changes.

## 11. Out of scope for v0.1

- A built-in Calendar connection. Calendar is used only when a calendar tool is connected.
- Any telemetry.
