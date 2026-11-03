// Every file in minutes/<type>/ gets its type and date from where it lives
// and what it is called, so authors don't have to repeat them.
import { parseMinutesPath, formatDate, loadMeetingTypes } from "../scripts/lib.mjs";

const typeById = Object.fromEntries(loadMeetingTypes().map((t) => [t.id, t]));
const info = (data) => parseMinutesPath(data.page.inputPath) || {};

export default {
  layout: "layouts/meeting.njk",
  tags: [],
  eleventyComputed: {
    meetingType: (data) => info(data).type,
    meetingDate: (data) => info(data).date,
    meetingYear: (data) => info(data).year,
    meetingLabel: (data) => info(data).label,
    title: (data) => {
      if (data.title) return data.title;
      const { type, date } = info(data);
      return `${typeById[type]?.name || type} — ${formatDate(date)}`;
    },
    permalink: (data) => {
      const { type, date, label } = info(data);
      if (!type || !date) return false; // badly named files are reported by the validator, not published
      return `/minutes/${type}/${date}${label ? `-${label}` : ""}/`;
    },
  },
};
