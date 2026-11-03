// Shared helpers used by the site build and the validation script.
import { readFileSync } from "node:fs";
import path from "node:path";

export const MINUTES_DIR = "minutes";
// File names are YYYY-MM-DD.md, or YYYY-MM-DD-label.md when a type has
// more than one meeting on the same day (e.g. 2026-11-02-special.md).
export const FILE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:-([a-z0-9]+(?:-[a-z0-9]+)*))?\.md$/;

export function loadMeetingTypes(root = process.cwd()) {
  return JSON.parse(readFileSync(path.join(root, "site/_data/meetingTypes.json"), "utf8"));
}

export function isRealDate(y, m, d) {
  const dt = new Date(Date.UTC(+y, +m - 1, +d));
  return dt.getUTCFullYear() === +y && dt.getUTCMonth() === +m - 1 && dt.getUTCDate() === +d;
}

/** Work out type, date and label from a path like ./minutes/faculty/2026-11-02.md */
export function parseMinutesPath(inputPath) {
  const parts = path.normalize(inputPath).split(path.sep).filter((p) => p && p !== ".");
  const i = parts.indexOf(MINUTES_DIR);
  if (i === -1 || parts.length !== i + 3) return null;
  const type = parts[i + 1];
  const match = FILE_PATTERN.exec(parts[i + 2]);
  if (!match) return { type, file: parts[i + 2], date: null, label: null };
  const [, y, m, d, label] = match;
  return { type, file: parts[i + 2], date: `${y}-${m}-${d}`, year: y, label: label || null };
}

export function formatDate(iso, style = "long") {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  const opts =
    style === "short"
      ? { year: "numeric", month: "short", day: "numeric" }
      : { weekday: style === "full" ? "long" : undefined, year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Front-matter values like `2026-11-02` are parsed by YAML as Date objects. */
export function toIsoDate(value) {
  if (value instanceof Date && !isNaN(value)) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return null;
}
