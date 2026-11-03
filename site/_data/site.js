// Site-wide settings. Edit the text below; SITE_URL is set automatically by the deploy workflow.
export default {
  title: "Department Meeting Minutes",
  department: "Department",
  description: "Approved public minutes of department meetings, organized by meeting type and date.",
  // Shown in the footer if filled in, e.g. "dept-office@university.edu"
  contact: "",
  repo: "https://github.com/JesseTNRoberts/department-meeting-minutes",
  url: (process.env.SITE_URL || "https://jessetnroberts.github.io/department-meeting-minutes").replace(/\/$/, ""),
};
