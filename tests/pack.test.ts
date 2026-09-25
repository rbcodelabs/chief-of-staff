import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = join(import.meta.dirname, "..");

const EXPECTED_SKILLS = [
  "cos-autonomy",
  "cos-contract",
  "cos-daily-brief",
  "cos-import",
  "cos-meeting-prep",
  "cos-open-loops",
  "cos-setup",
  "cos-weekly-review",
];

const EXPECTED_TASK_TYPES = [
  "action_items",
  "daily_brief",
  "meeting_prep",
  "note_filing",
  "open_loops_update",
  "status_update_draft",
  "weekly_review",
];

const TEMPLATES = ["Profile.md", "Now.md", "Autonomy.md", "Setup Draft.md"];

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function skillDirs(): string[] {
  return readdirSync(join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Returns the raw frontmatter block (without the --- fences), or null. */
function frontmatter(text: string): string | null {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text);
  return match ? match[1] : null;
}

/** Reads a scalar or folded/literal block value for a top-level frontmatter key. */
function frontmatterValue(block: string, key: string): string | null {
  const lines = block.split("\n");
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (index === -1) return null;
  const inline = lines[index].slice(key.length + 1).trim();
  if (!/^[>|][+-]?$/.test(inline)) return inline.replace(/^["']|["']$/g, "");
  const body: string[] = [];
  for (const line of lines.slice(index + 1)) {
    if (line.trim() !== "" && !/^\s/.test(line)) break;
    body.push(line.trim());
  }
  return body.join(" ").trim();
}

/**
 * Extracts dotted key paths from a small YAML subset: block mappings by
 * indentation plus single-line flow mappings like `{ a: 1, b: 2 }`.
 * Values are ignored; that is all the schema comparison needs.
 */
function yamlKeyPaths(yaml: string): string[] {
  const paths: string[] = [];
  const stack: Array<{ indent: number; key: string }> = [];
  for (const rawLine of yaml.split("\n")) {
    const line = rawLine.replace(/\s+#.*$/, "");
    const match = /^(\s*)([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(line);
    if (!match) continue;
    const indent = match[1].length;
    const key = match[2];
    const value = match[3].trim();
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
    const path = [...stack.map((entry) => entry.key), key].join(".");
    paths.push(path);
    if (value === "") {
      stack.push({ indent, key });
    } else if (value.startsWith("{")) {
      for (const inner of value.matchAll(/([A-Za-z_][A-Za-z0-9_]*):/g)) {
        paths.push(`${path}.${inner[1]}`);
      }
    }
  }
  return paths.sort();
}

/** The first ```yaml block under the `## \`<file>\`` heading of profile-schema.md. */
function schemaYamlFor(file: string): string {
  const schema = read("docs/profile-schema.md");
  const heading = `## \`${file}\``;
  const start = schema.indexOf(heading);
  assert.notEqual(start, -1, `profile-schema.md has no section ${heading}`);
  const next = schema.indexOf("\n## ", start + heading.length);
  const section = schema.slice(start, next === -1 ? undefined : next);
  const block = /```yaml\n([\s\S]*?)```/.exec(section);
  assert.ok(block, `profile-schema.md section ${heading} has no yaml block`);
  return block[1];
}

function filesBelow(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules", ".claude"].includes(entry.name)) return [];
    const child = join(dir, entry.name);
    return entry.isDirectory() ? filesBelow(child) : [child];
  });
}

test("skills folder holds exactly the eight cos-* skills", () => {
  assert.deepEqual(skillDirs(), EXPECTED_SKILLS);
});

for (const id of EXPECTED_SKILLS) {
  test(`${id}: SKILL.md has frontmatter name == folder and a description`, () => {
    const path = join("skills", id, "SKILL.md");
    assert.ok(existsSync(join(root, path)), `${path} is missing`);
    const block = frontmatter(read(path));
    assert.ok(block, `${path} has no YAML frontmatter`);
    assert.equal(frontmatterValue(block, "name"), id);
    const description = frontmatterValue(block, "description");
    assert.ok(description && description.length >= 40, `${path} needs a trigger-rich description`);
    const allowed = new Set(["name", "description", "license", "metadata", "allowed-tools", "compatibility"]);
    for (const key of yamlKeyPaths(block).filter((k) => !k.includes("."))) {
      assert.ok(allowed.has(key), `${path} has non-standard frontmatter key "${key}"`);
    }
  });

  test(`${id}: reads Profile.md and follows cos-contract`, () => {
    const body = read(join("skills", id, "SKILL.md"));
    assert.match(body, /Chief of Staff\/Profile\.md/, `${id} must read <cos_folder>/Profile.md`);
    if (id !== "cos-contract") {
      assert.match(body, /`cos-contract`/, `${id} must reference cos-contract`);
    }
  });
}

test("plugin.json is valid and points at the skills directory", () => {
  const manifest = JSON.parse(read(".claude-plugin/plugin.json")) as Record<string, unknown>;
  assert.equal(manifest.name, "chief-of-staff");
  assert.equal(manifest.displayName, "Chief of Staff");
  assert.equal(typeof manifest.description, "string");
  assert.ok((manifest.description as string).length > 0);
  assert.equal(typeof manifest.skills, "string");
  const skillsDir = join(root, manifest.skills as string);
  assert.ok(existsSync(skillsDir) && statSync(skillsDir).isDirectory(), "skills path must be a directory");
  for (const id of EXPECTED_SKILLS) {
    assert.ok(existsSync(join(skillsDir, id, "SKILL.md")), `${id} not found via plugin.json skills path`);
  }
});

test("marketplace.json lists this plugin from the repo root", () => {
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json")) as {
    name: string;
    plugins: Array<{ name: string; source: string }>;
  };
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, "chief-of-staff");
  assert.equal(marketplace.plugins[0].source, "./");
});

test("every cos-* skill referenced from a SKILL.md exists", () => {
  const known = new Set(skillDirs());
  for (const id of known) {
    const body = read(join("skills", id, "SKILL.md"));
    for (const match of body.matchAll(/\bcos-[a-z]+(?:-[a-z]+)*/g)) {
      assert.ok(known.has(match[0]), `skills/${id}/SKILL.md references unknown skill ${match[0]}`);
    }
  }
});

for (const file of TEMPLATES) {
  test(`templates/${file}: frontmatter keys match docs/profile-schema.md`, () => {
    const block = frontmatter(read(join("templates", file)));
    assert.ok(block, `templates/${file} has no frontmatter`);
    assert.deepEqual(yamlKeyPaths(block), yamlKeyPaths(schemaYamlFor(file)));
  });
}

test("templates/Profile.md has the schema's body sections in order", () => {
  const body = read("templates/Profile.md");
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, ["Working context", "Key people", "Current priorities", "Preferences"]);
});

test("templates/Now.md has the schema's sections in order", () => {
  const body = read("templates/Now.md");
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, ["Priorities", "Projects", "Commitments", "Waiting on", "Worries", "Done"]);
});

test("templates/Setup Draft.md has the setup checkbox sections", () => {
  const body = read("templates/Setup Draft.md");
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, ["Profile", "Projects", "People", "Open loops", "Documents to import"]);
});

test("autonomy task types agree between cos-autonomy and templates/Autonomy.md", () => {
  const skill = read("skills/cos-autonomy/SKILL.md");
  const start = skill.indexOf("## Task types");
  assert.notEqual(start, -1, "cos-autonomy needs a '## Task types' section");
  const end = skill.indexOf("\n## ", start + 1);
  const section = skill.slice(start, end === -1 ? undefined : end);
  const fromSkill = [...section.matchAll(/^\| `([a-z_]+)` \|/gm)].map((match) => match[1]).sort();

  const template = read("templates/Autonomy.md");
  const fromTemplate = [...template.matchAll(/^## ([a-z_]+)$/gm)].map((match) => match[1]).sort();

  assert.deepEqual(fromSkill, EXPECTED_TASK_TYPES);
  assert.deepEqual(fromTemplate, EXPECTED_TASK_TYPES);

  for (const type of EXPECTED_TASK_TYPES) {
    const tableRow = new RegExp(`## ${type}\\n\\n\\| level \\| streak \\| last 10 outcomes \\|\\n\\|---\\|---\\|---\\|\\n\\| L0 \\| 0 \\| — \\|`);
    assert.match(template, tableRow, `${type} must start at L0 with an empty ledger`);
  }
});

test("max levels: daily_brief L0, status_update_draft L1, every other task type L2", () => {
  const skill = read("skills/cos-autonomy/SKILL.md");
  const expectedMax: Record<string, string> = { daily_brief: "L0", status_update_draft: "L1" };
  for (const type of EXPECTED_TASK_TYPES) {
    const row = new RegExp(`^\\| \`${type}\` \\|.*\\| (L[0-2]) \\|$`, "m").exec(skill);
    assert.ok(row, `no task-type row for ${type}`);
    assert.equal(row[1], expectedMax[type] ?? "L2", `max level for ${type}`);
  }
});

test("templates/Setup Draft.md items all start checked", () => {
  const draft = read("templates/Setup Draft.md");
  assert.doesNotMatch(draft, /- \[ \]/, "Setup Draft items must default to checked (- [x])");
  assert.match(draft, /- \[x\]/);
});

test("L1/L2 activity is logged pending and settled by the brief and weekly review", () => {
  assert.match(read("skills/cos-autonomy/SKILL.md"), /## Settle activity outcomes/);
  assert.match(read("templates/Autonomy.md"), /outcome: pending/);
  assert.match(read("docs/profile-schema.md"), /outcome: <pending\|approved\|approved-with-edits\|rejected\|skipped>/);
  assert.match(read("skills/cos-daily-brief/SKILL.md"), /Settle activity outcomes/);
  assert.match(read("skills/cos-weekly-review/SKILL.md"), /Settle activity outcomes/);
});

test("proposed replies never pre-fill consent", () => {
  for (const id of ["cos-weekly-review", "cos-open-loops"]) {
    const body = read(join("skills", id, "SKILL.md"));
    assert.doesNotMatch(body, /Proposals:\s*(?:yes|no)\b/i, `${id} pre-fills a proposal answer`);
    assert.doesNotMatch(body, /Status update:\s*looks good/i, `${id} pre-fills the status-update verdict`);
    assert.doesNotMatch(body, /→\s*(?:\*\*)?yes\b/i, `${id} pre-fills a yes`);
  }
  const weekly = read("skills/cos-weekly-review/SKILL.md");
  assert.ok(weekly.includes("Proposals: <answer each: yes / no>"));
  assert.ok(weekly.includes("Status update: <looks good / change …>"));
});

test("every skill starts from the contract and repeats the hard limit", () => {
  const hardLimit =
    "> **Hard limit:** never send, share, post, invite or delete anything outside the vault. Anything meant for another person is a draft for the user.";
  for (const id of EXPECTED_SKILLS) {
    const body = read(join("skills", id, "SKILL.md"));
    const heading = body.indexOf("\n# ");
    assert.ok(heading !== -1 && body.indexOf(hardLimit) > heading, `${id} must state the hard limit`);
    assert.ok(body.indexOf(hardLimit) < body.indexOf("\n## "), `${id} must state the hard limit before its first section`);
    if (id !== "cos-contract") {
      assert.ok(body.includes("Invoke the `cos-contract` skill"), `${id} must invoke cos-contract first`);
    }
  }
});

test("cos-setup's CronCreate table uses valid scheduleType and daysOfWeek", () => {
  const setup = read("skills/cos-setup/SKILL.md");
  const rows = [...setup.matchAll(/^\| [^|]+ \| `(Chief of Staff — [^`]+)` \| `([^`]+)` \| `\[([^\]]*)\]` \| `([^`]+)` \|$/gm)];
  assert.equal(rows.length, 3, "expected three ritual rows");
  for (const [, name, scheduleType, days, time] of rows) {
    assert.ok(["interval", "daily", "weekly"].includes(scheduleType), `${name}: bad scheduleType ${scheduleType}`);
    const values = days.split(",").map((d) => Number(d.trim()));
    assert.ok(values.length > 0, `${name}: empty daysOfWeek`);
    for (const day of values) {
      assert.ok(Number.isInteger(day) && day >= 0 && day <= 6, `${name}: day ${day} out of 0–6`);
    }
    assert.match(time, /^([01]\d|2[0-3]):[0-5]\d$/, `${name}: bad timeOfDay`);
  }
});

test("cos-setup schedules the rituals with the spec's names and writes only the draft before go", () => {
  const setup = read("skills/cos-setup/SKILL.md");
  for (const name of [
    "Chief of Staff — Daily Brief",
    "Chief of Staff — Open Loops",
    "Chief of Staff — Weekly Review",
  ]) {
    assert.ok(setup.includes(name), `cos-setup must use schedule name "${name}"`);
  }
  for (const tool of ["CronCreate", "CronList", "threads_get_current"]) {
    assert.ok(setup.includes(tool), `cos-setup must reference ${tool}`);
  }
  assert.match(setup, /Write nothing but `Setup Draft\.md` until the user says "go"/);
  assert.match(setup, /One question per turn/);
});

test("scheduled rituals reach the user through the home thread", () => {
  for (const id of ["cos-open-loops", "cos-weekly-review", "cos-contract"]) {
    const body = read(join("skills", id, "SKILL.md"));
    assert.match(body, /threads_set_proposed_reply/, `${id} must use threads_set_proposed_reply`);
    assert.match(body, /home_thread_id/, `${id} must target home_thread_id`);
  }
});

test("no personal data or machine-specific paths in the pack", () => {
  // Patterns are assembled from pieces so this file does not match itself.
  const forbidden: Array<[string, RegExp]> = [
    ["personal username", new RegExp(["rick", "bowman"].join(""), "i")],
    ["personal first name", new RegExp(`\\b${"Ri" + "ck"}\\b`)],
    ["personal email domain", new RegExp(["rbcodelabs", "\\.com"].join(""), "i")],
    ["absolute user path", new RegExp(["/Us", "ers/"].join(""))],
    ["absolute home path", new RegExp(["/ho", "me/[a-z]"].join(""))],
  ];
  const offenders: string[] = [];
  for (const file of filesBelow(root)) {
    const text = readFileSync(file, "utf8");
    for (const [label, pattern] of forbidden) {
      if (pattern.test(text)) offenders.push(`${relative(root, file)}: ${label}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("no skill instructs running Bash, shell or date commands", () => {
  // Unattended rituals stall on a shell permission prompt, so shell use may
  // only ever be mentioned as a prohibition.
  const mention =
    /\b(?:bash|shell|terminal|command line)\b|`(?:date|ls|find|mkdir|readlink|cat)\b|\bdate \+|\bIntl\./i;
  const outright =
    /`date\s+[+-]|\bdate \+%|\bIntl\.DateTimeFormat|\bnpx\b|\bnode -e\b|\bmkdir -p\b|\breadlink\s+[-/]|\bls\s+-[a-zA-Z]|\bfind\s+[.~/]|\bcat\s+[<"'`/~.\w-]+\.(?:md|json)\b/;
  const negation = /\b(?:never|don't|do not|no)\b/i;
  const offenders: string[] = [];
  for (const id of EXPECTED_SKILLS) {
    const lines = read(join("skills", id, "SKILL.md")).split("\n");
    lines.forEach((line, index) => {
      if (outright.test(line) || (mention.test(line) && !negation.test(line))) {
        offenders.push(`${id}:${index + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /### Dates and times: work them out yourself/);
  assert.match(contract, /### Tools: no shell, ever/);
  assert.match(contract, /never run a Bash, shell or terminal command for anything/);
  for (const tool of ["`vault_list`", "Read", "Write", "`vault_search`"]) {
    assert.ok(contract.includes(tool), `cos-contract must direct the model to ${tool}`);
  }
  assert.ok(contract.includes("`mcp__claude_threads__vault_list`"), "cos-contract must name vault_list's host-prefixed form");
  assert.match(contract, /A failed Read means the note doesn't exist/);
});

test("listing uses vault_list first; Glob only as the contract's fallback; no Grep", () => {
  // vault_list is the host listing tool. Glob is allowed only as the contract's
  // stated fallback when vault_list is unavailable; Grep is never a listed tool.
  const offenders: string[] = [];
  const files = [
    ...EXPECTED_SKILLS.map((id) => join("skills", id, "SKILL.md")),
    "docs/profile-schema.md",
    ...TEMPLATES.map((file) => join("templates", file)),
  ];
  for (const file of files) {
    read(file)
      .split("\n")
      .forEach((line, index) => {
        const where = `${file}:${index + 1}`;
        if (/\bgrep\b/i.test(line) && !/no shell/i.test(line)) offenders.push(`${where} (grep)`);
        if (/\bGrep\b/.test(line)) offenders.push(`${where} (Grep tool)`);
        if (/\bglob\b/i.test(line)) {
          const isContractFallback = file === "skills/cos-contract/SKILL.md" && line.includes("vault_list") && /fallback/i.test(line);
          if (!isContractFallback) offenders.push(`${where} (Glob outside the contract fallback)`);
        }
      });
  }
  assert.deepEqual(offenders, []);
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /Glob is an acceptable fallback for listing/);
  assert.doesNotMatch(contract, /there is no glob or grep tool/i);
  assert.ok(contract.indexOf("`vault_list` first") !== -1, "vault_list must stay the first choice");
  for (const id of ["cos-setup", "cos-daily-brief", "cos-weekly-review", "cos-open-loops", "cos-meeting-prep"]) {
    assert.ok(read(join("skills", id, "SKILL.md")).includes("`vault_list`"), `${id} must list folders with vault_list`);
  }
});

test("Chief of Staff Updates always goes at the end of the daily note, after the brief", () => {
  assert.match(
    read("skills/cos-contract/SKILL.md"),
    /\*\*`## Chief of Staff Updates` always sits at the END of the daily note, after the entire brief section\*\*/,
  );
  assert.match(read("skills/cos-contract/SKILL.md"), /Never insert anything inside or before the `## Chief of Staff Brief` section/);
  const weekly = read("skills/cos-weekly-review/SKILL.md");
  assert.match(weekly, /Add it at the \*\*end\*\* of the daily note/);
  assert.match(weekly, /Never insert it inside or above the `## Chief of Staff Brief` section/);
  assert.match(read("skills/cos-daily-brief/SKILL.md"), /`## Chief of Staff Updates` \(written by other skills\) stays last/);
  assert.match(read("skills/cos-open-loops/SKILL.md"), /always goes at the end of the note, after the whole brief/);
  assert.match(read("docs/profile-schema.md"), /always comes last in the note, after the whole brief section/);
});

test("setup closing is complete sentences; status Asks are only needs from others", () => {
  assert.match(read("skills/cos-setup/SKILL.md"), /Every line is a complete sentence that stands on its own\. Never write a lead-in that ends in a colon/);
  assert.match(read("skills/cos-weekly-review/SKILL.md"), /holds only things the user needs \*from others\*/);
  assert.match(read("skills/cos-weekly-review/SKILL.md"), /never under Asks/);
});

test("folders are created implicitly, never empty", () => {
  assert.match(read("skills/cos-contract/SKILL.md"), /\*\*Folders are created implicitly\*\*.*Never create an empty folder/);
  assert.match(read("skills/cos-setup/SKILL.md"), /never create an empty folder/);
  assert.match(read("docs/profile-schema.md"), /never creates an empty folder/);
});

test("timezone comes from session context and times are never fabricated", () => {
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /IANA timezone/);
  assert.match(contract, /\*\*Never fabricate a time\.\*\*.*date only/);
  assert.match(read("skills/cos-setup/SKILL.md"), /\*\*Timezone:\*\* read it from your session context/);
  assert.match(read("docs/profile-schema.md"), /timestamp is date-only/);
});

test("every scripted question in cos-setup asks exactly one thing", () => {
  const setup = read("skills/cos-setup/SKILL.md");
  const offenders: string[] = [];
  for (const line of setup.split("\n")) {
    if (/^\s*- Bad:/.test(line)) continue; // the deliberate counter-example
    const scripted = line.startsWith(">") ? [line] : [...line.matchAll(/"([^"]*\?[^"]*)"/g)].map((m) => m[1]);
    for (const text of scripted) {
      if ((text.match(/\?/g) ?? []).length > 1) offenders.push(text.trim());
    }
  }
  assert.deepEqual(offenders, []);
  const handoff = /"(I've put everything in [^"]*)"/.exec(setup);
  assert.ok(handoff, "cos-setup needs a scripted draft hand-off message");
  assert.equal((handoff[1].match(/\?/g) ?? []).length, 1, "the hand-off must end with exactly one question");
  assert.ok(handoff[1].trim().endsWith("?"), "the hand-off must end with its question");
});

test("user's words, exact dates, and due-today handling", () => {
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /\*\*Keep the user's words\.\*\*/);
  assert.match(contract, /including capitalization/);
  assert.match(contract, /Never add parties, owners or details the user didn't name/);
  assert.match(contract, /A `due` date equal to today is "due today", not "overdue"/);
  const brief = read("skills/cos-daily-brief/SKILL.md");
  assert.match(brief, /Flag every loop due today as "due today", including in the very first brief/);
  assert.match(brief, /A loop due today is never "overdue"/);
});

test("weekly review adds no note about missing proposals or check-ins", () => {
  assert.match(
    read("skills/cos-weekly-review/SKILL.md"),
    /\*\*Add NO note, parenthetical or sentence about missing proposals or check-ins in the proposed reply\*\*/,
  );
});

test("date fields are YYYY-MM-DD and timestamps are ISO-8601 with offset", () => {
  const date = /^\d{4}-\d{2}-\d{2}$/;
  const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
  const valueOf = (yaml: string, key: string) => {
    const match = new RegExp(`^${key}:\\s*(.*?)\\s*(?:#.*)?$`, "m").exec(yaml);
    return match ? match[1].replace(/^"(.*)"$/, "$1") : null;
  };
  for (const file of ["Now.md", "Autonomy.md"]) {
    assert.match(valueOf(schemaYamlFor(file), "updated_at") ?? "", date, `schema ${file} updated_at`);
    const template = frontmatter(read(join("templates", file))) ?? "";
    assert.equal(valueOf(template, "updated_at"), "", `templates/${file} updated_at starts empty`);
  }
  assert.match(valueOf(schemaYamlFor("Profile.md"), "setup_completed_at") ?? "", timestamp);
  assert.match(valueOf(schemaYamlFor("Setup Draft.md"), "created_at") ?? "", timestamp);

  for (const id of EXPECTED_SKILLS) {
    for (const line of read(join("skills", id, "SKILL.md")).split("\n")) {
      if (line.includes("`updated_at`")) {
        assert.ok(line.includes("YYYY-MM-DD"), `${id}: every updated_at instruction must say YYYY-MM-DD: ${line.trim()}`);
      }
    }
  }
  assert.match(read("skills/cos-setup/SKILL.md"), /`applied_at` set to the actual time the user said "go"/);
});

test("reports and headings use the actual time, not the scheduled time", () => {
  assert.match(read("skills/cos-contract/SKILL.md"), /`HH:MM` in a heading is the actual time/);
  assert.match(read("skills/cos-weekly-review/SKILL.md"), /actual time you write it, not the ritual's scheduled time/);
});

test("cos-setup names the next real run instead of always saying tomorrow", () => {
  const setup = read("skills/cos-setup/SKILL.md");
  assert.doesNotMatch(setup, /^> Tomorrow/m);
  assert.match(setup, /next actual run/);
});

test("cos-setup's one-question rule carries a bad/good example", () => {
  const setup = read("skills/cos-setup/SKILL.md");
  assert.match(setup, /exactly one question mark/);
  assert.match(setup, /- Bad: .*\?.*\?/);
  assert.match(setup, /- Good: /);
});

test("weekly review omits an empty Proposals line and restates only recorded status", () => {
  const weekly = read("skills/cos-weekly-review/SKILL.md");
  assert.match(weekly, /When no proposals are due, leave the `Proposals:` line out of the proposed reply entirely/);
  assert.match(weekly, /no update since/);
  assert.match(read("skills/cos-contract/SKILL.md"), /Status lines restate only what is recorded/);
});

test("versions agree across plugin.json, marketplace.json, package.json and the changelog", () => {
  const plugin = JSON.parse(read(".claude-plugin/plugin.json")) as { version: string };
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json")) as { plugins: Array<{ version?: string }> };
  const pkg = JSON.parse(read("package.json")) as { version: string };
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
  assert.equal(marketplace.plugins[0].version, plugin.version);
  assert.equal(pkg.version, plugin.version);
  assert.ok(read("README.md").includes(`### ${plugin.version}`), "README changelog needs an entry for the current version");
});

/** Embedded template blocks: `<!-- embedded-template: X -->` then a ````markdown fence. */
function embeddedTemplates(skillPath: string): Map<string, string> {
  const blocks = new Map<string, string>();
  for (const match of read(skillPath).matchAll(/<!-- embedded-template: (.+?) -->\n````markdown\n([\s\S]*?)````\n/g)) {
    blocks.set(match[1], match[2]);
  }
  return blocks;
}

test("skills that write pack files embed the templates byte-for-byte", () => {
  const expected: Record<string, string[]> = {
    "cos-setup": ["Setup Draft.md", "Profile.md", "Now.md", "Autonomy.md"],
    "cos-autonomy": ["Autonomy.md"],
  };
  for (const [id, files] of Object.entries(expected)) {
    const blocks = embeddedTemplates(join("skills", id, "SKILL.md"));
    assert.deepEqual([...blocks.keys()].sort(), [...files].sort(), `${id} embedded templates`);
    for (const file of files) {
      assert.equal(blocks.get(file), read(join("templates", file)), `${id}: embedded ${file} must match templates/${file} exactly`);
    }
  }
  for (const id of EXPECTED_SKILLS.filter((skill) => !(skill in expected))) {
    assert.equal(embeddedTemplates(join("skills", id, "SKILL.md")).size, 0, `${id} should not embed templates`);
  }
});

test("no skill reads or lists the pack's templates directory", () => {
  for (const id of EXPECTED_SKILLS) {
    const body = read(join("skills", id, "SKILL.md"));
    assert.doesNotMatch(body, /templates\//, `${id} refers to the templates directory`);
    assert.doesNotMatch(body, /\.\.\/\.\.\//, `${id} refers to a path outside its skill folder`);
  }
  assert.match(read("skills/cos-contract/SKILL.md"), /never list or read the pack's install folder/);
});

test("contract forbids scratchpad tool calls and continues when a tool is unavailable", () => {
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /\*\*Never use a tool as a scratchpad\*\*: no no-op or echo commands/);
  assert.match(contract, /Reason in your reply\./);
  assert.match(contract, /\*\*If a tool you need is unavailable\*\*, say so .* carry on with the tools you do have/);
});

test("heading times come from the most recent context line and are never guessed later", () => {
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /\*\*Take heading times from the most recent context line\.\*\*/);
  assert.match(contract, /Never estimate how much time has passed and write a later time/);
  assert.match(contract, /If you're not sure the time is still accurate, omit it/);
});

test("weekly review: due today is not slipped, and status words match Now.md exactly", () => {
  const weekly = read("skills/cos-weekly-review/SKILL.md");
  assert.match(weekly, /\*\*Slipped means overdue, and nothing else\.\*\*/);
  assert.match(weekly, /A loop due today has not slipped: list it first under \*\*What's next\*\* as "Due today: …"/);
  assert.match(weekly, /\*\*Use the `Now\.md` status words exactly\*\*: `active`, `blocked`, `waiting`, `done`, `dropped`/);
  const slipped = /## What slipped\n([\s\S]*?)\n## /.exec(weekly);
  assert.ok(slipped && !/due today/i.test(slipped[1]), "the example What slipped section must not contain a due-today item");
});

test("user-specific template fields are placeholders, never example values", () => {
  // A concrete example in a template gets copied into the user's profile.
  const userSpecific = new Set(["name", "role", "timezone", "status_update.audience", "status_update.format"]);
  const placeholder = /^(?:""|"<[^"<>]+>")$/;
  const offenders: string[] = [];
  for (const file of TEMPLATES) {
    const block = frontmatter(read(join("templates", file))) ?? "";
    const stack: Array<{ indent: number; key: string }> = [];
    for (const line of block.split("\n")) {
      const match = /^(\s*)([A-Za-z_]+):\s*(.*)$/.exec(line);
      if (!match) continue;
      const indent = match[1].length;
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop();
      const path = [...stack.map((entry) => entry.key), match[2]].join(".");
      if (match[3] === "") stack.push({ indent, key: match[2] });
      else if (userSpecific.has(path) && !placeholder.test(match[3].trim())) offenders.push(`templates/${file}: ${path} = ${match[3]}`);
    }
  }
  assert.deepEqual(offenders, []);
  assert.match(read("templates/Profile.md"), /^ {2}format: "<[^"]+>"$/m, "status_update.format must be a placeholder");
  // The fictional example lives only in the schema doc (and HTML comments).
  const example = "bullets: shipped / in progress / risks / asks";
  assert.ok(read("docs/profile-schema.md").includes(example));
  for (const id of EXPECTED_SKILLS) {
    const withoutComments = read(join("skills", id, "SKILL.md")).replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(!withoutComments.includes(example), `${id} carries the example status format outside a comment`);
  }
  assert.match(read("skills/cos-setup/SKILL.md"), /\*\*Replace every `<…>` placeholder with the user's own words from the approved draft\*\*, or with `""`/);
});

test("existing notes are changed with Edit, never rewritten with a whole-file Write", () => {
  const contract = read("skills/cos-contract/SKILL.md");
  assert.match(contract, /\*\*Once a note exists, change it only with Edit, never with a whole-file Write\.\*\*/);
  assert.match(contract, /Don't fall back to Write\./);
  for (const id of ["cos-daily-brief", "cos-weekly-review", "cos-open-loops", "cos-meeting-prep", "cos-setup"]) {
    const body = read(join("skills", id, "SKILL.md"));
    assert.match(body, /never (?:rewrite [^.]*with a whole-file Write|a whole-file Write)|\(never a whole-file Write\)/i, `${id} must forbid whole-file rewrites`);
  }
  for (const id of EXPECTED_SKILLS) {
    assert.doesNotMatch(read(join("skills", id, "SKILL.md")), /rewrite the whole note/i, `${id} suggests rewriting a whole note`);
  }
});
