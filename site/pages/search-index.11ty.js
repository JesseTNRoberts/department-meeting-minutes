// Plain-text index used by the search box (loaded only when someone searches).
const strip = (html = "") =>
  String(html).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

export const data = { permalink: "/search-index.json", eleventyExcludeFromCollections: true };

export async function render({ collections }) {
  const entries = collections.minutes.map((item) => {
    const d = item.data;
    const parts = [d.title, d.summary, d.location, d.presiding, d.recorder, ...(d.attendees || []), ...(d.guests || []), strip(item.content)];
    return { url: item.url, text: parts.filter(Boolean).join(" ").toLowerCase() };
  });
  return JSON.stringify(entries);
}
