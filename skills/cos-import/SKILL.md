---
name: cos-import
description: >-
  Import one document into the Chief of Staff's project notes by extracting
  key decisions, dates, owners and open questions (never copying it
  wholesale). Use when the user says "import this doc", "pull in the PRD",
  "read this plan into my project", pastes a document, shares a Google Drive or
  Docs link or title, or points at a vault note; and during cos-setup for each
  checked item under "Documents to import". Handles exactly one document per
  run. Never crawls folders.
---

# Chief of Staff import

> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.

Turn one document into a short, linked extract in the right project note.

## Step 0: contract and profile

1. Invoke the `cos-contract` skill (if it isn't already loaded) and follow it throughout.
2. Read `Chief of Staff/Profile.md` (see the contract for finding a moved profile); stop and offer `cos-setup` if it's missing.

## Input

- **One document reference**: a Google Drive or Docs link, a document title, a vault path, or pasted text.
- **The project it belongs to.** If the user didn't say, ask ("Which project is this for?") and list the project notes in `locations.projects` (found with `vault_list`).

If you're given several documents, handle the first one, report, and ask before moving to the next. Never search a Drive folder or vault folder and import everything in it.

## Step 1: fetch

Pick the path by reference type:

| Reference | How to fetch |
|---|---|
| Drive or Docs link / title | Only if `sources.google_drive` is `true` **and** Google Workspace tools are available: find it (e.g. `search_files` by title, or `get_file_metadata` for a link), then read it with the matching reader: `read_doc` for Google Docs, `get_values` (after `get_spreadsheet` to list the sheets) for Google Sheets, `read_presentation` for Google Slides, `read_file_content` for other Drive files. Read-only. |
| Vault path | Read the note (a failed Read means it doesn't exist; try `vault_search` for the title). |
| Pasted text | Use it as given. |

If the Google tools aren't available, `google_drive` is `false`, or the fetch fails, say so plainly ("I couldn't reach Google Drive") and ask the user to paste the content. Never guess at a document's contents from its title.

If several files match a title, list up to five (title, last modified) and ask which one.

## Step 2: extract

Pull out only:

- **Decisions**: what was decided, by whom if stated, when.
- **Dates**: deadlines, milestones, launch dates.
- **Owners**: who owns what.
- **Open questions**: unresolved issues, risks, asks.

Rules:

- **Never copy the document wholesale.** Short quotes (one sentence) are fine where exact wording matters; otherwise summarize in the user's terms.
- Only extract what the document says. Mark anything unclear as "unclear in source".
- Link people to their notes in `locations.people` when a note exists (e.g. `[[People/Sam Rivera]]`). Don't create new people notes here; list unknown names under open questions for the user instead.

## Step 3: file it

Autonomy task type: `note_filing` when the import was inferred by you; an import the user explicitly asked for (including a checked item in the Setup Draft) is the user's instruction and can be written directly.

Default location: append a section to the project note `<locations.projects>/<Project>.md`:

```
## Imported: <Document title> (YYYY-MM-DD)
Source: <Drive link, vault [[link]], or "pasted by you on YYYY-MM-DD">

**Decisions**
- ...
**Dates**
- ...
**Owners**
- ...
**Open questions**
- ...
```

If the extract is longer than about 20 lines, or the user asked for a separate note, create `<locations.projects>/<Project> — <Document title>.md` with the same content and add a one-line link to it from the project note instead.

If the document raises new open loops (a commitment, a dated deliverable, an unanswered question the user owns), propose adding them to `Now.md`; add them directly only if `open_loops_update` is L1 or higher (see `cos-autonomy`), logging each in the Activity log with `outcome: pending`. An import you filed on your own initiative at L1+ (`note_filing`) is logged the same way.

## Step 4: report (3 lines)

```
Imported "<title>" → [[<where it went>]]
Extracted: <n> decisions, <n> dates, <n> owners, <n> open questions
Needs you: <proposed loops or questions, or "nothing">
```

Then stop. If there are more documents queued (e.g. during setup), the caller runs this skill again for the next one.
