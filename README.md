# Department Meeting Minutes

Approved public minutes of department meetings, published at
**https://jessetnroberts.github.io/department-meeting-minutes/**.

On the site you can browse minutes by meeting type, and filter by type, year, date range and words in the text. Filtered views have their own web address, so you can share a link to, say, "Curriculum Committee, 2026". The site also has an [Atom feed](https://jessetnroberts.github.io/department-meeting-minutes/feed.xml) of new minutes.

**To add minutes**, use the [Add minutes page](https://jessetnroberts.github.io/department-meeting-minutes/add/) on the site, or see [CONTRIBUTING.md](CONTRIBUTING.md).

## How it works

```
minutes/
  faculty/2026-11-02.md       ← one Markdown file per meeting, named by date
  curriculum/2026-10-07.md
  graduate/…
site/_data/meetingTypes.json  ← the list of meeting types
site/_data/site.js            ← site title, department name, contact email
templates/minutes-template.md ← starting point for new minutes
```

- Every pull request is checked automatically (`.github/workflows/check.yml`, using `scripts/validate.mjs`). The check confirms the folder is a known meeting type, the file name is a real past date, `status: approved` is set, and the header fields are well formed.
- Every push to `main` rebuilds the site with [Eleventy](https://www.11ty.dev/) and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## Maintainer setup (one time)

1. **Pages:** Settings → Pages → Source: **GitHub Actions**.
2. **Collaborators:** Settings → Collaborators and teams. Give secretaries and chairs the **Write** role.
3. **Protect `main`:** Settings → Rules → Rulesets → New branch ruleset targeting `main`. Turn on:
   - Require a pull request before merging (1 approval)
   - Require status checks to pass → add **check**
   - Block force pushes

   With this on, nothing reaches the public site until someone has reviewed it.
4. **Reviewers (optional):** fill in `.github/CODEOWNERS` so each committee's chair reviews that committee's minutes.
5. **Branding:** set the department name and contact email in `site/_data/site.js`.

## Adding or renaming a meeting type

Add an entry to `site/_data/meetingTypes.json` (`id` is the folder name, lowercase with dashes), create the folder `minutes/<id>/` with a `.gitkeep` file in it, and add a row for it to the table in CONTRIBUTING.md (copy an existing row and change the folder name in its link). Don't change the `id` of a type that already has minutes: that would break existing links.

## Local preview

```sh
npm install
npm start        # http://localhost:8080
```
