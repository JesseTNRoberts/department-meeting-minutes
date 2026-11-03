# Adding minutes

This repository is **public** and everything merged into `main` goes straight onto the website. Only add minutes **after the committee has approved them**, and never include confidential material (student records, personnel matters, closed-session discussion).

## The easiest way: the "Add minutes" page

Go to **[the Add minutes page](https://jessetnroberts.github.io/department-meeting-minutes/add/)** (the **+ Add minutes** button at the top of the site). Pick the meeting type and date, fill in the details, and either paste the minutes (formatting from Word or Google Docs is kept) or upload a Word (.docx) file. Then click **Continue to GitHub**. GitHub opens with the file ready: click **Commit changes…**, then **Propose changes**, then **Create pull request**. A reviewer merges it, and the minutes go live.

To correct minutes that are already published, use the **Edit on GitHub** link at the bottom of that meeting's page.

## Another way: straight on GitHub

1. Click the link for your meeting type below. It opens a new file on GitHub that already contains the minutes template.

   | Meeting type | Start a new file | Folder |
   |---|---|---|
   | Faculty Meeting | [Add Faculty Meeting minutes](https://github.com/JesseTNRoberts/department-meeting-minutes/new/main/minutes/faculty?filename=YYYY-MM-DD.md&value=---%0Astatus%3A%20approved%0Aapproved_on%3A%20YYYY-MM-DD%0Alocation%3A%20%0Atime%3A%203%3A00%E2%80%934%3A30%20pm%0Apresiding%3A%20%0Arecorder%3A%20%0Aattendees%3A%20%5BName%20One%2C%20Name%20Two%5D%0Aabsent%3A%20%5B%5D%0Aguests%3A%20%5B%5D%0Asummary%3A%20One%20sentence%20describing%20the%20main%20items%20covered.%0Adocuments%3A%20%5B%5D%0A%23%20%20-%20title%3A%20Agenda%0A%23%20%20%20%20url%3A%20https%3A//...%0A---%0A%0A%23%23%20Call%20to%20order%0A%0AThe%20meeting%20was%20called%20to%20order%20at%203%3A00%20pm.%0A%0A%23%23%20Approval%20of%20previous%20minutes%0A%0A%23%23%20Reports%0A%0A%23%23%20Old%20business%0A%0A%23%23%20New%20business%0A%0A%23%23%20Adjournment%0A%0AThe%20meeting%20was%20adjourned%20at%204%3A30%20pm.%0A) | `minutes/faculty/` |
   | Curriculum Committee | [Add Curriculum Committee minutes](https://github.com/JesseTNRoberts/department-meeting-minutes/new/main/minutes/curriculum?filename=YYYY-MM-DD.md&value=---%0Astatus%3A%20approved%0Aapproved_on%3A%20YYYY-MM-DD%0Alocation%3A%20%0Atime%3A%203%3A00%E2%80%934%3A30%20pm%0Apresiding%3A%20%0Arecorder%3A%20%0Aattendees%3A%20%5BName%20One%2C%20Name%20Two%5D%0Aabsent%3A%20%5B%5D%0Aguests%3A%20%5B%5D%0Asummary%3A%20One%20sentence%20describing%20the%20main%20items%20covered.%0Adocuments%3A%20%5B%5D%0A%23%20%20-%20title%3A%20Agenda%0A%23%20%20%20%20url%3A%20https%3A//...%0A---%0A%0A%23%23%20Call%20to%20order%0A%0AThe%20meeting%20was%20called%20to%20order%20at%203%3A00%20pm.%0A%0A%23%23%20Approval%20of%20previous%20minutes%0A%0A%23%23%20Reports%0A%0A%23%23%20Old%20business%0A%0A%23%23%20New%20business%0A%0A%23%23%20Adjournment%0A%0AThe%20meeting%20was%20adjourned%20at%204%3A30%20pm.%0A) | `minutes/curriculum/` |
   | Graduate Committee | [Add Graduate Committee minutes](https://github.com/JesseTNRoberts/department-meeting-minutes/new/main/minutes/graduate?filename=YYYY-MM-DD.md&value=---%0Astatus%3A%20approved%0Aapproved_on%3A%20YYYY-MM-DD%0Alocation%3A%20%0Atime%3A%203%3A00%E2%80%934%3A30%20pm%0Apresiding%3A%20%0Arecorder%3A%20%0Aattendees%3A%20%5BName%20One%2C%20Name%20Two%5D%0Aabsent%3A%20%5B%5D%0Aguests%3A%20%5B%5D%0Asummary%3A%20One%20sentence%20describing%20the%20main%20items%20covered.%0Adocuments%3A%20%5B%5D%0A%23%20%20-%20title%3A%20Agenda%0A%23%20%20%20%20url%3A%20https%3A//...%0A---%0A%0A%23%23%20Call%20to%20order%0A%0AThe%20meeting%20was%20called%20to%20order%20at%203%3A00%20pm.%0A%0A%23%23%20Approval%20of%20previous%20minutes%0A%0A%23%23%20Reports%0A%0A%23%23%20Old%20business%0A%0A%23%23%20New%20business%0A%0A%23%23%20Adjournment%0A%0AThe%20meeting%20was%20adjourned%20at%204%3A30%20pm.%0A) | `minutes/graduate/` |
   | AI Faculty Meeting | [Add AI Faculty Meeting minutes](https://github.com/JesseTNRoberts/department-meeting-minutes/new/main/minutes/ai-faculty?filename=YYYY-MM-DD.md&value=---%0Astatus%3A%20approved%0Aapproved_on%3A%20YYYY-MM-DD%0Alocation%3A%20%0Atime%3A%203%3A00%E2%80%934%3A30%20pm%0Apresiding%3A%20%0Arecorder%3A%20%0Aattendees%3A%20%5BName%20One%2C%20Name%20Two%5D%0Aabsent%3A%20%5B%5D%0Aguests%3A%20%5B%5D%0Asummary%3A%20One%20sentence%20describing%20the%20main%20items%20covered.%0Adocuments%3A%20%5B%5D%0A%23%20%20-%20title%3A%20Agenda%0A%23%20%20%20%20url%3A%20https%3A//...%0A---%0A%0A%23%23%20Call%20to%20order%0A%0AThe%20meeting%20was%20called%20to%20order%20at%203%3A00%20pm.%0A%0A%23%23%20Approval%20of%20previous%20minutes%0A%0A%23%23%20Reports%0A%0A%23%23%20Old%20business%0A%0A%23%23%20New%20business%0A%0A%23%23%20Adjournment%0A%0AThe%20meeting%20was%20adjourned%20at%204%3A30%20pm.%0A) | `minutes/ai-faculty/` |

2. Change the file name from `YYYY-MM-DD.md` to the **meeting date**, for example `2026-11-02.md`. If a committee meets twice on one day, add a short label: `2026-11-02-special.md`.
3. Fill in the header between the `---` lines (see the table below) and replace the sample headings with the minutes. Delete any line you don't need.
4. Click **Commit changes…**, choose **Create a new branch for this commit and start a pull request**, then **Propose changes** and **Create pull request**.
5. An automatic check runs on the pull request. If it fails, open **Details** to see exactly what to fix (a wrong date, a missing field, and so on), edit the file on the same branch, and the check runs again.
6. A reviewer approves and merges the pull request. The website updates a minute or two later.

You can also go to the folder on GitHub, click **Add file → Create new file**, and paste in [the template](templates/minutes-template.md). To fix published minutes, open the file on GitHub, click the pencil icon, and follow steps 4–6.

## Header fields

| Field | Required | What to put |
|---|---|---|
| `status` | Yes | Always `approved`. |
| `approved_on` | Recommended | Date the minutes were approved, `YYYY-MM-DD`. Delete the line if unknown. |
| `title` | No | Leave it out to use "Meeting type — date". Use it for special sessions. |
| `summary` | Recommended | One sentence. Shown in the list and used by search. |
| `location`, `time`, `presiding`, `recorder` | No | Plain text. |
| `attendees`, `absent`, `guests` | No | A list of names: `[A. Lee, B. Ortiz]`. |
| `documents` | No | Links to the agenda, slides or signed copy, each with a `title` and `url`. |

The meeting **type** comes from the folder and the **date** from the file name, so don't add them to the header.

## Writing the minutes

Minutes are written in [Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax): `## Heading`, `- bullet`, `**bold**`, and tables all work. To bring in minutes from Word or Google Docs, paste the text and add `##` before each section heading.

**Motions** read well like this:

```markdown
**Motion:** Approve the revised CS 2110 syllabus. Moved by A. Lee, seconded by B. Ortiz.
**Vote:** 12 in favor, 0 opposed, 1 abstaining. **Carried.**
```

## Working on your own computer (optional)

```sh
npm install
npm run new -- faculty 2026-11-02   # creates minutes/faculty/2026-11-02.md from the template
npm run validate                    # runs the same checks as the pull request
npm start                           # preview the site at http://localhost:8080
```
