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

test("status_update_draft is capped at L1 and every other task type at L2", () => {
  const skill = read("skills/cos-autonomy/SKILL.md");
  for (const type of EXPECTED_TASK_TYPES) {
    const row = new RegExp(`^\\| \`${type}\` \\|.*\\| (L[0-2]) \\|$`, "m").exec(skill);
    assert.ok(row, `no task-type row for ${type}`);
    assert.equal(row[1], type === "status_update_draft" ? "L1" : "L2");
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
