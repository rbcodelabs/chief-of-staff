---
name: cos-setup
description: >-
  First-run setup interview for the Chief of Staff pack. Use when a new Chief
  of Staff thread starts, when the user says "set up my chief of staff",
  "get started", "onboard me", "continue setup", "update my profile", or "redo
  setup", or when any cos-* skill finds no Profile.md. Asks one question per
  turn, writes only a Setup Draft for review, and on "go" creates the profile,
  open-loops list, autonomy ledger, project and people notes, imports checked
  documents, delivers the first daily brief and offers to schedule the
  rituals. Resumes an interrupted setup; re-running on a finished profile
  updates sections instead of starting over.
---

# Chief of Staff setup

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

The first-run experience. It runs in the persistent **Chief of Staff** thread, which becomes the home thread. Target: about 10 minutes.

## Rules for this skill

- **One question per turn.** Each message ends with exactly one question mark. Ask, then stop and wait. Never stack a second question, even a small one in parentheses or a trailing "anything else?". Save a follow-up for its own turn.
  - Bad: "Who matters most across those projects? (Anyone else, or is that the full cast?)"
  - Good: "Who matters most across those projects, and how does each connect to them?" Then, next turn if needed: "Anyone else I should know about?"
- **Warm and brief.** Two to four sentences per turn. Reflect back what you heard in a few words, then ask the next thing.
- **Write nothing but `Setup Draft.md` until the user says "go".** Before "go", reading is fine; writing any other note, calling `CronCreate`, or importing anything is not.
- **Keep a running import list.** Every time the user mentions a document (a PRD, a plan, a spreadsheet, a doc in Drive, a note in the vault), note its name, where it lives, and which project it belongs to. Don't fetch it yet.
- **Use the user's words.** Project and people names go into notes exactly as the user says them.
- If the user wants to skip a step, skip it. If they want to stop, tell them setup can be resumed any time by asking to "continue setup" and stop without writing anything further.

## Step 0: contract, then where are we?

Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout. Its "no profile → offer setup" rule is what brought you here, so don't loop back.

Read `Chief of Staff/Profile.md` (or search for a note with `cos_version` in its frontmatter, per `cos-contract`) and `<cos_folder>/Setup Draft.md`. Check these cases **in this order** and take the first that matches:

1. **`Setup Draft.md` exists with `status: draft`:** a previous setup was interrupted before "go". Offer to pick up from it: "I found the draft from last time. Want to review it and say go, or start fresh?" On review, continue at step 5 (show the draft and wait for "go"). On fresh, rename it to `Setup Draft YYYY-MM-DD.md` and go to step 1.
2. **No profile:** start at step 1.
3. **Profile exists but `setup_completed_at` is empty:** setup stopped after "go". Resume at the first unfinished step:
   - checked documents in `Setup Draft.md` without an `## Imported:` section or import note in their project → step 7;
   - no `## Chief of Staff Brief` in any daily note → step 8;
   - otherwise → step 9.
   Say in one line where you're picking up.
4. **Profile exists and `setup_completed_at` is set:** don't start over. Summarize the profile in three lines, then ask one question: "What do you want to update: profile details, projects, people, open loops, rituals, or something else?" Run only the matching interview topics from step 4, write the changes into a fresh `Setup Draft.md` (renaming the old one to `Setup Draft YYYY-MM-DD.md`), and on "go" apply only those sections. Re-offer rituals (step 9) only if the user asked about them or a ritual has no `schedule_id`.

## Step 1: welcome and consent

Call `threads_get_current` and note its `id` (the home thread). Don't write it anywhere yet.

Send one paragraph, then one question:

> Hi, I'm your chief of staff. I'll learn what you're working on, keep a list of your open loops, write you a short brief each morning, check in on things that go quiet, prep your meetings and draft your Friday review. Apart from one draft note for you to review, nothing gets written in your vault until you say "go", and I never send anything to anyone. This takes about 10 minutes.
>
> Ready to start?

## Step 2: read the vault's structure (read-only)

Look, don't write:

1. List the top-level folders of the vault with your file-listing tools.
2. Find the daily-note setup: read `.obsidian/daily-notes.json` (keys `folder`, `format`, `template`) and, if present, `.obsidian/plugins/periodic-notes/data.json`. If neither exists, look for a folder of date-named notes and infer the format (e.g. `2026-09-24.md` → `YYYY-MM-DD`). Default: folder `Daily`, format `YYYY-MM-DD`.
3. Find existing folders for **meetings**, **people** and **projects**: match names case-insensitively (e.g. `Meetings`, `Meeting Notes`, `1-1s`; `People`, `Contacts`; `Projects`, `Work`). Prefer an existing folder over creating a new one. If several candidates fit, pick the one with the most notes and mention the choice.
4. Work out the user's likely timezone from what you already have: the date/time and zone in your session context, or offsets in tool results (see `cos-contract`, "Dates and times"; never run a shell command for it). Don't ask about it as its own question; it goes into the draft for the user to confirm. If nothing tells you, put "timezone: ? (tell me yours)" in the draft.

Say what you found in **one line**, e.g. "Found daily notes in `Journal/Daily` (YYYY-MM-DD), meetings in `Meetings`, and people in `People`. No projects folder yet, so I'll make `Projects/`." If the vault is empty, say "Your vault is empty, so I'll set up simple folders for you." and move on.

## Step 3: calendar, if connected

Check your available tools for a calendar tool (any tool or MCP server whose name or description mentions calendar, e.g. Google Calendar or Outlook). Google Workspace's Drive/Docs tools are not a calendar.

- **A calendar tool exists:** read this week's meetings (read-only). Start the interview from them: "You have a 1:1 with Priya and a roadmap review Thursday. Tell me about those." Remember the tool/server name for `sources.calendar`. Use what the user says to seed projects and people.
- **No calendar tool, or the call fails:** skip this step silently (if it failed, mention "I couldn't reach your calendar" once). Set `sources.calendar: "none"`.

## Step 4: the interview (one topic per turn)

Ask about each topic in its own turn, in this order. Follow up once if an answer is thin; otherwise move on.

1. **Role and team.** "What's your role, and who's on your team?" If you don't know their name, ask for it in the next turn.
2. **Current projects (3–6).** "What are the 3 to 6 things you're driving right now?" For each, capture a one-line goal.
3. **Key people.** "Who matters most across those projects, and how does each person connect to them?" Capture name, relationship (manager, partner, report, stakeholder) and projects.
4. **Open loops.** "What's on your mind: things you've promised, things you're waiting on, and anything you're worried about?"
5. **Rituals and status updates.** "Which recurring meetings or updates do you have, and who do your status updates go to? What format do they like?" This fills `status_update.audience` and `status_update.format`.
6. **Preferences.** "How do you like things written, and is there anything I should leave alone?"

Throughout, add every document the user mentions to the import list: name, location (Drive title or link, vault path, or "they'll paste it"), and project. Check whether Google Workspace tools are available (for example `search_files` / `read_file_content` for Drive, `read_doc` for Docs) and note it; don't fetch yet.

## Step 5: write `Setup Draft.md` (the only write before "go")

Write `<cos_folder>/Setup Draft.md` (default `Chief of Staff/Setup Draft.md`). Start from the pack's `templates/Setup Draft.md` (two folders above this skill: `../../templates/`); if you can't read it, use this shape:

- Frontmatter: `cos_version: 1`, `status: draft`, `created_at: <the current time, ISO-8601 with offset>`, `applied_at: ""` (filled in at "go").
- Checkbox sections, **one line per item**, every item checked (`- [x]`) by default so the user only unchecks what they don't want:
  - **Profile**: name, role and team, timezone (the detected one, marked "detected, change if wrong"), detected folders, status-update audience and format, preferences.
  - **Projects**: `name — one-line goal — key people`.
  - **People**: `name — relationship — projects`.
  - **Open loops**: `what — status — commitment / waiting on / worry[, due date]`.
  - **Documents to import**: `document — where it lives — project`. Check at most **3** (the most important, in the user's order); list the rest unchecked with "(later)".

Then tell the user, in two sentences: "I've put everything in [[<cos_folder>/Setup Draft]]. Edit anything, uncheck what you don't want, then say **go**." (Use the real folder in the link.)

Wait. If the user asks for changes in chat, update the draft and wait again.

## Step 6: on "go", write the notes

Call `threads_get_current` again (your memory of step 1 may not survive a long conversation) and use its `id` as `home_thread_id`; keep its `cwd` and project for scheduling in step 9.

Re-read `Setup Draft.md` (the user may have edited it) and use only **checked** (`- [x]`) items. Then write:

1. **`<cos_folder>/Profile.md`** from `templates/Profile.md`: fill `name`, `role`, `timezone` (as confirmed in the draft), `home_thread_id`, `locations` (from step 2), `sources` (`google_drive: true` only if Google Workspace tools are available and the user uses Drive; `calendar` from step 3), `status_update`. Leave `setup_completed_at` empty and rituals disabled for now. Fill the body sections: Working context, Key people (linking to people notes), Current priorities, Preferences.
2. **`<cos_folder>/Now.md`** from `templates/Now.md`: projects under **Projects**, commitments under **Commitments**, waiting-on items under **Waiting on**, worries under **Worries**, each `— active — touched <today>` (or `waiting`/`blocked` as the user said), plus a numbered **Priorities** list in the order the user gave. Set `updated_at` to today (`YYYY-MM-DD`).
3. **`<cos_folder>/Autonomy.md`** from `templates/Autonomy.md`: every task type at `L0`, streak 0, no outcomes. Set `updated_at` to today (`YYYY-MM-DD`).
4. **Project notes** in `locations.projects`: one per checked project, `<Project name>.md`, with the goal, a **People** list linking to people notes, and an **Open loops** list linking back to `[[<cos_folder>/Now]]`. If a note with that name already exists, append a `## Chief of Staff` section instead of overwriting.
5. **People notes** in `locations.people`: one per checked person, `<Full name>.md`, with relationship and links to their projects. Same rule for existing notes.
6. Update `Setup Draft.md` frontmatter: `status: applied`, and `applied_at` set to the actual time the user said "go" (ISO-8601 with offset). It is always later than `created_at`; never copy `created_at` into it.

Create missing folders only for what you are writing. Report what was created as a short list of links.

## Step 7: targeted import

For each **checked** item under **Documents to import** (at most 3), run `cos-import`, **one document at a time**, and show its 3-line summary before starting the next. If the user wants to skip the rest, stop. Then mention any "(later)" documents: "I also noted <n> more documents; say 'import <name>' whenever you want them." Never crawl folders or import anything that isn't on the checked list.

## Step 8: first brief, now

Run `cos-daily-brief` immediately so the user sees one on day 1. Tell them where it went (a link to today's daily note).

## Step 9: offer the rituals

Ask one at a time:

1. "Want a brief like this every weekday at 8?" (adjust the time if they say so)
2. "Want me to check in on anything that goes quiet, weekdays around 1pm?"
3. "And a Friday review at 3pm with a draft status update?"

For each yes, schedule it (idempotently):

1. Call `CronList`. If an item with the same name already exists, use `CronUpdate` on its id instead of creating a duplicate.
2. Otherwise call `CronCreate` with:

| Ritual | `name` | `scheduleType` | `daysOfWeek` | `timeOfDay` |
|---|---|---|---|---|
| Daily brief | `Chief of Staff — Daily Brief` | `weekly` | `[1,2,3,4,5]` | `08:00` |
| Open loops | `Chief of Staff — Open Loops` | `weekly` | `[1,2,3,4,5]` | `13:00` |
| Weekly review | `Chief of Staff — Weekly Review` | `weekly` | `[5]` | `15:00` |

   Pass `cwd` and, if the home thread belongs to a project, `projectId` from step 6, so the ritual threads run in the same place and project. Use the user's times and days if they changed them. The prompt names the skill and the profile, for example:

   > Run the cos-daily-brief skill. The Chief of Staff profile is at `Chief of Staff/Profile.md`. Follow cos-contract.

   (`cos-open-loops` and `cos-weekly-review` for the other two, with the real `cos_folder`.)
3. Store each returned id as `schedule_id` in the matching `rituals.*` entry, set `enabled: true`, and the chosen `time`/`days`/`day`. The profile keeps the times in the user's `timezone`.

**Timezones.** `CronCreate` times are in the machine's local time. If the profile's `timezone` differs from the machine's, convert each time before scheduling. If the conversion crosses midnight, shift every `daysOfWeek` entry by one day in the same direction (e.g. 08:00 Monday–Friday in the user's zone might become 23:00 Sunday–Thursday on the machine). Tell the user, and warn that the two zones may switch daylight saving time on different dates, so the ritual can drift by an hour for part of the year until it's rescheduled.

For each no, leave the ritual `enabled: false` and tell them they can ask for it later.

Finally set `setup_completed_at` to the current time (ISO-8601 with offset) in `Profile.md`, even if they declined every ritual.

## Step 10: close

Three lines. First work out the **next actual run** of the daily brief from today's weekday and the ritual's `days` and `time` (see `cos-contract`, "Dates and times"). Say "tomorrow" only when the next run really is tomorrow; otherwise name the day. For example, when setup finishes on a Friday and the brief runs Monday to Friday:

> Your next brief lands Monday at 8:00 in that day's daily note, under "Chief of Staff Brief".
> If something goes quiet, I'll ask about it here, and your answer is one click.
> Talk to me in this thread any time: "prep me for my 1:1", "import this doc", "what's on my plate?"

(Adjust to the rituals they actually turned on. If they declined the brief, drop the first line.)
