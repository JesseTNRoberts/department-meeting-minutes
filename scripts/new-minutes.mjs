// Creates a new minutes file from the template.
// Usage: npm run new -- <type> [YYYY-MM-DD]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadMeetingTypes } from "./lib.mjs";

const [type, date = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
const ids = loadMeetingTypes().map((t) => t.id);
if (!ids.includes(type)) {
  console.error(`Usage: npm run new -- <type> [YYYY-MM-DD]\nTypes: ${ids.join(", ")}`);
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Date must be YYYY-MM-DD.");
  process.exit(1);
}
const file = path.join("minutes", type, `${date}.md`);
if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}
mkdirSync(path.dirname(file), { recursive: true });
writeFileSync(file, readFileSync("templates/minutes-template.md", "utf8"));
console.log(`Created ${file}`);
