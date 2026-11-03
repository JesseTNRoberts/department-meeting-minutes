// Checks every file in minutes/ before the site is built or a pull request is merged.
// Run with: npm run validate
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { MINUTES_DIR, FILE_PATTERN, loadMeetingTypes, isRealDate, toIsoDate } from "./lib.mjs";

const types = loadMeetingTypes();
const typeIds = new Set(types.map((t) => t.id));
const KNOWN_FIELDS = new Set([
  "title", "status", "approved_on", "summary", "location", "time", "presiding",
  "recorder", "attendees", "absent", "guests", "documents",
]);
const LIST_FIELDS = ["attendees", "absent", "guests"];
const TEXT_FIELDS = ["title", "summary", "location", "time", "presiding", "recorder"];

const inCI = !!process.env.GITHUB_ACTIONS;
let errors = 0;
let warnings = 0;
let checked = 0;

function report(level, file, message) {
  if (level === "error") errors++;
  else warnings++;
  if (inCI) console.log(`::${level} file=${file}::${message}`);
  else console.log(`${level === "error" ? "✗" : "!"} ${file}: ${message}`);
}

// Meeting type config
const seen = new Set();
for (const t of types) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id || "")) report("error", "site/_data/meetingTypes.json", `Type id "${t.id}" must be lowercase letters, numbers and dashes.`);
  if (!t.name) report("error", "site/_data/meetingTypes.json", `Type "${t.id}" needs a name.`);
  if (seen.has(t.id)) report("error", "site/_data/meetingTypes.json", `Type id "${t.id}" is listed twice.`);
  seen.add(t.id);
}

const today = new Date().toISOString().slice(0, 10);
const typeList = [...typeIds].join(", ");

for (const entry of readdirSync(MINUTES_DIR)) {
  const entryPath = path.join(MINUTES_DIR, entry);
  if (statSync(entryPath).isFile()) {
    if (entry.endsWith(".md")) report("error", entryPath, `Minutes must go in a meeting-type folder: minutes/<type>/YYYY-MM-DD.md (types: ${typeList}).`);
    continue; // e.g. minutes.11tydata.js
  }
  if (!typeIds.has(entry)) {
    report("error", entryPath, `"${entry}" is not a meeting type. Use one of: ${typeList} — or add it to site/_data/meetingTypes.json.`);
    continue;
  }
  for (const file of readdirSync(entryPath)) {
    const filePath = path.join(entryPath, file);
    if (statSync(filePath).isDirectory()) {
      report("error", filePath, "Folders inside a meeting type aren't supported. Put the minutes file directly in the type folder.");
      continue;
    }
    if (file === ".gitkeep") continue;
    if (!file.endsWith(".md")) {
      report("warning", filePath, "Only .md files are published. Link other documents (PDFs, slides) from the minutes instead.");
      continue;
    }
    checked++;
    const m = FILE_PATTERN.exec(file);
    if (!m) {
      report("error", filePath, "File name must be the meeting date, YYYY-MM-DD.md (or YYYY-MM-DD-label.md for a second meeting that day), all lowercase.");
      continue;
    }
    const [, y, mo, d] = m;
    const date = `${y}-${mo}-${d}`;
    if (!isRealDate(y, mo, d)) report("error", filePath, `${date} is not a real date.`);
    else if (date > today) report("error", filePath, `Meeting date ${date} is in the future. Minutes are published after the meeting is held and approved.`);

    let fm;
    try {
      fm = matter(readFileSync(filePath, "utf8"));
    } catch (e) {
      report("error", filePath, `The header between the --- lines couldn't be read: ${e.reason || e.message}`);
      continue;
    }
    // Treat fields left blank (e.g. "location:") as not filled in.
    const data = Object.fromEntries(Object.entries(fm.data).filter(([, v]) => v !== null && v !== ""));

    if (data.status !== "approved") {
      report("error", filePath, `"status: approved" is required. This repository is public, so only approved minutes may be added (found: ${JSON.stringify(data.status ?? null)}).`);
    }
    if (data.approved_on !== undefined) {
      const iso = toIsoDate(data.approved_on);
      if (!iso) report("error", filePath, "approved_on must be a date written as YYYY-MM-DD.");
      else if (iso < date) report("error", filePath, `approved_on (${iso}) is before the meeting itself (${date}).`);
    }
    if ("date" in data || "type" in data) {
      report("warning", filePath, "date and type come from the file name and folder; remove them from the header.");
    }
    for (const f of TEXT_FIELDS) {
      if (data[f] !== undefined && typeof data[f] !== "string") report("error", filePath, `${f} must be text.`);
    }
    for (const f of LIST_FIELDS) {
      if (data[f] !== undefined && !(Array.isArray(data[f]) && data[f].every((x) => typeof x === "string"))) {
        report("error", filePath, `${f} must be a list of names, e.g. [A. Lee, B. Ortiz].`);
      }
    }
    if (data.documents !== undefined) {
      const ok = Array.isArray(data.documents) && data.documents.every((x) => x && typeof x.title === "string" && typeof x.url === "string");
      if (!ok) report("error", filePath, "documents must be a list of items, each with a title and a url.");
    }
    for (const key of Object.keys(data)) {
      if (!KNOWN_FIELDS.has(key) && key !== "date" && key !== "type") report("warning", filePath, `Unknown header field "${key}" will be ignored (check the spelling).`);
    }
    if (!fm.content.trim()) report("error", filePath, "The minutes have a header but no text.");
  }
}

console.log(`\nChecked ${checked} minutes file${checked === 1 ? "" : "s"}: ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}.`);
process.exit(errors ? 1 : 0);
