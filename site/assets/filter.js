// Filters the list of minutes in the page by type, date and search words.
// The full list is already in the HTML, so the page still works without JavaScript.
(function () {
  "use strict";

  document.querySelectorAll("[data-browser]").forEach(setUp);
  setUpNavPicker();

  // On phones the meeting-type links become one dropdown (see style.css).
  function setUpNavPicker() {
    const picker = document.querySelector("[data-nav-picker]");
    const links = document.querySelectorAll(".nav a");
    if (!picker || !links.length) return;
    const select = picker.querySelector("select");
    let current = false;
    links.forEach((a) => {
      const opt = new Option(a.textContent.trim() === "All" ? "All meeting types" : a.textContent.trim(), a.href);
      if (a.getAttribute("aria-current") === "page") { opt.selected = true; current = true; }
      select.add(opt);
    });
    if (!current) select.add(new Option("Choose a meeting type…", "", true, true), 0);
    select.addEventListener("change", () => { if (select.value) location.href = select.value; });
    picker.hidden = false;
    document.documentElement.classList.add("has-nav-picker");
  }

  function setUp(browser) {
    const form = browser.querySelector("[data-filters]");
    const results = browser.querySelector("[data-results]");
    if (!form || !results) return;

    const items = Array.from(browser.querySelectorAll(".minutes-item"));
    const groups = Array.from(browser.querySelectorAll("[data-year-group]"));
    const countEl = browser.querySelector("[data-count]");
    const emptyEl = browser.querySelector("[data-empty]");
    const indexLink = document.querySelector("[data-search-index]");
    const total = items.length;

    // Text used for searching before the full-text index has loaded.
    const textByUrl = new Map(items.map((li) => [li.dataset.url, li.textContent.toLowerCase()]));
    let indexState = "idle";

    function loadIndex() {
      if (indexState !== "idle" || !indexLink) return;
      indexState = "loading";
      fetch(indexLink.href)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((entries) => {
          for (const e of entries) {
            if (textByUrl.has(e.url)) textByUrl.set(e.url, textByUrl.get(e.url) + " " + e.text);
          }
          indexState = "done";
          apply(false);
        })
        .catch(() => (indexState = "failed"));
    }

    function readForm() {
      const fd = new FormData(form);
      return {
        q: (fd.get("q") || "").trim(),
        types: fd.getAll("type"),
        year: fd.get("year") || "",
        from: fd.get("from") || "",
        to: fd.get("to") || "",
        sort: fd.get("sort") || "desc",
      };
    }

    function writeForm(s) {
      form.q.value = s.q;
      form.querySelectorAll('input[name="type"]').forEach((cb) => (cb.checked = s.types.includes(cb.value)));
      form.year.value = Array.from(form.year.options).some((o) => o.value === s.year) ? s.year : "";
      form.from.value = s.from;
      form.to.value = s.to;
      form.sort.value = s.sort === "asc" ? "asc" : "desc";
    }

    function stateFromUrl() {
      const p = new URLSearchParams(location.search);
      const isDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : "");
      return {
        q: p.get("q") || "",
        types: p.getAll("type").flatMap((t) => t.split(",")).filter(Boolean),
        year: p.get("year") || "",
        from: isDate(p.get("from")),
        to: isDate(p.get("to")),
        sort: p.get("sort") || "desc",
      };
    }

    function updateUrl(s) {
      const p = new URLSearchParams();
      if (s.q) p.set("q", s.q);
      if (s.types.length) p.set("type", s.types.join(","));
      if (s.year) p.set("year", s.year);
      if (s.from) p.set("from", s.from);
      if (s.to) p.set("to", s.to);
      if (s.sort === "asc") p.set("sort", "asc");
      const qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    }

    function apply(syncUrl = true) {
      const s = readForm();
      const terms = s.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length) loadIndex();

      let shown = 0;
      for (const li of items) {
        const d = li.dataset.date;
        const ok =
          (!s.types.length || s.types.includes(li.dataset.type)) &&
          (!s.year || d.startsWith(s.year + "-")) &&
          (!s.from || d >= s.from) &&
          (!s.to || d <= s.to) &&
          terms.every((t) => textByUrl.get(li.dataset.url).includes(t));
        li.hidden = !ok;
        if (ok) shown++;
      }

      // Order year groups and the meetings inside them.
      const dir = s.sort === "asc" ? 1 : -1;
      groups
        .slice()
        .sort((a, b) => dir * a.dataset.yearGroup.localeCompare(b.dataset.yearGroup))
        .forEach((g) => {
          const list = g.querySelector("ol");
          Array.from(list.children)
            .sort((a, b) => dir * a.dataset.date.localeCompare(b.dataset.date))
            .forEach((li) => list.appendChild(li));
          g.hidden = !g.querySelector(".minutes-item:not([hidden])");
          results.appendChild(g);
        });

      const filtered = shown !== total;
      countEl.textContent = filtered
        ? `Showing ${shown} of ${total} meeting${total === 1 ? "" : "s"}`
        : `${total} meeting${total === 1 ? "" : "s"}`;
      if (emptyEl) emptyEl.hidden = shown > 0;
      browser.classList.toggle("is-filtered", filtered || s.sort === "asc");
      if (syncUrl) updateUrl(s);
    }

    let timer;
    form.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(apply, e.target.name === "q" ? 150 : 0);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      apply();
    });
    browser.querySelectorAll("[data-clear]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        writeForm({ q: "", types: [], year: "", from: "", to: "", sort: "desc" });
        apply();
      })
    );

    writeForm(stateFromUrl());
    apply(false);
    browser.classList.add("is-enhanced");
  }
})();
