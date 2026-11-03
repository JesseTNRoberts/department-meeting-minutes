// "Add minutes" page: builds a minutes file from the form and opens GitHub's
// new-file editor with it filled in. Nothing is sent anywhere until the person
// commits on GitHub, where their own GitHub permissions apply.
(function () {
  "use strict";

  const form = document.getElementById("add-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const repo = form.dataset.repo.replace(/\/$/, "");
  const body = $("f-body");
  const fileInput = $("f-file");
  const fileStatus = $("file-status");
  const dropzone = $("dropzone");
  const errorsEl = $("form-errors");
  const previewEl = $("preview");
  const previewBtn = $("preview-btn");
  const handoff = $("handoff-notice");
  const dupNotice = $("duplicate-notice");
  const labelField = $("label-field");
  // Keep the GitHub URL comfortably under the length GitHub accepts.
  const MAX_URL = 7500;

  const localToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  $("f-date").max = localToday();
  $("f-approved").max = localToday();

  // ---------- Draft saved in this browser only ----------
  const DRAFT_KEY = "add-minutes-draft";
  const fields = Array.from(form.querySelectorAll("input[name], select[name], textarea[name]")).filter((el) => el.type !== "checkbox" && el.type !== "file");
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (saved) {
      fields.forEach((el) => { if (saved[el.name] != null) el.value = saved[el.name]; });
      showFileStatus("Restored the draft you were working on in this browser.");
    }
  } catch (e) { /* storage unavailable */ }
  let saveTimer;
  form.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(fields.map((el) => [el.name, el.value])))); } catch (e) {}
    }, 400);
  });

  // ---------- Existing minutes (to warn about duplicates) ----------
  const existing = new Set();
  const indexLink = document.querySelector("[data-search-index]");
  if (indexLink) {
    fetch(indexLink.href).then((r) => r.json()).then((list) => {
      list.forEach((e) => existing.add(e.url.replace(/^.*?\/minutes\//, "minutes/").replace(/\/$/, "")));
      checkDuplicate();
    }).catch(() => {});
  }
  function slug() {
    const label = $("f-label").value.trim().toLowerCase();
    return `${$("f-date").value}${label ? "-" + label : ""}`;
  }
  function checkDuplicate() {
    const type = $("f-type").value, date = $("f-date").value;
    const dup = type && date && existing.has(`minutes/${type}/${date}`);
    dupNotice.hidden = !dup;
    if (dup || $("f-label").value) labelField.hidden = false;
  }
  ["f-type", "f-date"].forEach((id) => $(id).addEventListener("change", checkDuplicate));

  // ---------- Converters (loaded only when needed) ----------
  const loaded = {};
  function loadScript(key) {
    if (!loaded[key]) {
      loaded[key] = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = document.querySelector(`[data-vendor="${key}"]`).href;
        s.onload = resolve;
        s.onerror = () => reject(new Error("Couldn't load the converter."));
        document.head.appendChild(s);
      });
    }
    return loaded[key];
  }
  async function htmlToMarkdown(html) {
    await loadScript("turndown");
    await loadScript("gfm");
    const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", emDelimiter: "*", codeBlockStyle: "fenced" });
    td.use(turndownPluginGfm.gfm);
    td.remove(["style", "script", "meta", "title"]);
    // The page title is the only top-level heading, so demote headings by one level.
    const shifted = html.replace(/<(\/?)h([1-5])(\s|>)/gi, (m, slash, n, after) => `<${slash}h${+n + 1}${after}`);
    const doc = new DOMParser().parseFromString(shifted, "text/html");
    // Word tables have no header row; treat the first row as one so they become Markdown tables.
    doc.querySelectorAll("table").forEach((table) => {
      table.querySelectorAll("td p, th p").forEach((p) => p.replaceWith(...p.childNodes, " "));
      const first = table.querySelector("tr");
      if (first && !table.querySelector("th")) {
        first.querySelectorAll("td").forEach((td) => {
          const th = doc.createElement("th");
          th.innerHTML = td.innerHTML;
          td.replaceWith(th);
        });
      }
    });
    return td.turndown(doc.body.innerHTML)
      .replace(/^(\s*)([-*]|\d+\.)\s{2,}/gm, "$1$2 ")
      .replace(/[ \t]+$/gm, "")
      .replace(/ /g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async function handleFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (body.value.trim() && !confirm("Replace the minutes text that's already in the box with this file?")) return;
    try {
      if (name.endsWith(".docx")) {
        showFileStatus(`Converting ${file.name}…`);
        await loadScript("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        body.value = await htmlToMarkdown(result.value);
        showFileStatus(`Converted ${file.name}. Check the text below, especially tables and anything that was in a text box.`);
      } else if (/\.(md|markdown|txt)$/.test(name)) {
        let text = await file.text();
        text = text.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, ""); // drop a header if the file has one
        body.value = text.trim();
        showFileStatus(`Loaded ${file.name}.`);
      } else if (name.endsWith(".doc")) {
        showFileStatus("Older .doc files can't be read here. In Word, use File → Save As → Word Document (.docx), then upload that.", true);
        return;
      } else if (name.endsWith(".pdf")) {
        showFileStatus("PDFs can't be converted to text here. Paste the text into the box instead, and add a link to the PDF under Linked documents.", true);
        return;
      } else {
        showFileStatus("Upload a Word (.docx), Markdown (.md) or text (.txt) file.", true);
        return;
      }
      form.dispatchEvent(new Event("input"));
    } catch (e) {
      showFileStatus(`Couldn't read ${file.name}: ${e.message}`, true);
    } finally {
      fileInput.value = "";
    }
  }
  function showFileStatus(msg, isError) {
    fileStatus.textContent = msg;
    fileStatus.classList.toggle("is-error", !!isError);
  }

  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  ["dragenter", "dragover"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, () => dropzone.classList.remove("is-over")));
  dropzone.addEventListener("drop", (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

  // Pasting from Word or Google Docs keeps headings, lists and tables.
  body.addEventListener("paste", async (e) => {
    const html = e.clipboardData && e.clipboardData.getData("text/html");
    if (!html || !/<(h\d|li|table|strong|b|em|p)\b/i.test(html)) return;
    e.preventDefault();
    const start = body.selectionStart, end = body.selectionEnd;
    let md;
    try { md = await htmlToMarkdown(html); } catch (err) { md = e.clipboardData.getData("text/plain"); }
    body.setRangeText(md, start, end, "end");
    form.dispatchEvent(new Event("input"));
  });

  // ---------- Building the file ----------
  const splitNames = (s) => s.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);
  const yamlStr = (s) => JSON.stringify(s); // JSON strings are valid YAML
  function buildFile() {
    const v = (id) => $(id).value.trim();
    const lines = ["---", "status: approved"];
    if (v("f-approved")) lines.push(`approved_on: ${v("f-approved")}`);
    for (const [key, id] of [["title", "f-title"], ["summary", "f-summary"], ["location", "f-location"], ["time", "f-time"], ["presiding", "f-presiding"], ["recorder", "f-recorder"]]) {
      if (v(id)) lines.push(`${key}: ${yamlStr(v(id))}`);
    }
    for (const [key, id] of [["attendees", "f-attendees"], ["absent", "f-absent"], ["guests", "f-guests"]]) {
      const names = splitNames($(id).value);
      if (names.length) lines.push(`${key}:`, ...names.map((n) => `  - ${yamlStr(n)}`));
    }
    const docs = $("f-documents").value.split("\n").map((l) => l.trim()).filter(Boolean);
    if (docs.length) {
      lines.push("documents:");
      for (const l of docs) {
        const i = l.lastIndexOf("|");
        const title = i > -1 ? l.slice(0, i).trim() : l;
        const url = i > -1 ? l.slice(i + 1).trim() : l;
        lines.push(`  - title: ${yamlStr(title || url)}`, `    url: ${yamlStr(url)}`);
      }
    }
    lines.push("---", "", body.value.trim(), "");
    return lines.join("\n");
  }
  const fileName = () => `${slug()}.md`;
  const folder = () => `minutes/${$("f-type").value}`;

  function validate(forGitHub) {
    const errs = [];
    const date = $("f-date").value, approved = $("f-approved").value, label = $("f-label").value.trim();
    if (!$("f-type").value) errs.push(["f-type", "Choose the meeting type."]);
    if (!date) errs.push(["f-date", "Enter the meeting date."]);
    else if (date > localToday()) errs.push(["f-date", "The meeting date can't be in the future."]);
    if (label && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(label)) errs.push(["f-label", "The label can only use lowercase letters, numbers and single dashes."]);
    if (!dupNotice.hidden && !label) errs.push(["f-label", "Minutes for this type and date already exist. Add a label, or edit the published minutes instead."]);
    if (approved && date && approved < date) errs.push(["f-approved", "The approval date is before the meeting."]);
    if (!body.value.trim()) errs.push(["f-body", "Add the text of the minutes."]);
    $("f-documents").value.split("\n").filter((l) => l.trim()).forEach((l) => {
      const url = l.slice(l.lastIndexOf("|") + 1).trim();
      if (!/^https?:\/\//.test(url)) errs.push(["f-documents", `“${l.trim()}” needs a web address starting with https://`]);
    });
    if (forGitHub && !$("f-confirm").checked) errs.push(["f-confirm", "Confirm the minutes are approved and contain nothing confidential."]);

    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (!errs.length) { errorsEl.hidden = true; return true; }
    errs.forEach(([id]) => $(id).setAttribute("aria-invalid", "true"));
    errorsEl.innerHTML = "<p>Please fix the following:</p><ul>" + errs.map(([id, m]) => `<li><a href="#${id}">${m}</a></li>`).join("") + "</ul>";
    errorsEl.hidden = false;
    errorsEl.scrollIntoView({ block: "center", behavior: "smooth" });
    return false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(true)) return;
    const content = buildFile();
    const base = `${repo}/new/main/${folder()}?filename=${encodeURIComponent(fileName())}`;
    const full = `${base}&value=${encodeURIComponent(content)}`;
    if (full.length <= MAX_URL) {
      window.open(full, "_blank", "noopener");
      showHandoff(`GitHub opened in a new tab with <strong>${folder()}/${fileName()}</strong> filled in. Click <strong>Commit changes…</strong> there to submit it. (No new tab? <a href="${full}" target="_blank" rel="noopener">Open GitHub</a>.)`);
    } else {
      // Too long to fit in a link: copy it, and open GitHub with just the file name.
      let copied = false;
      try { await navigator.clipboard.writeText(content); copied = true; } catch (err) {}
      window.open(base, "_blank", "noopener");
      showHandoff(copied
        ? `These minutes are too long to send in a link, so they've been <strong>copied</strong>. In the GitHub tab that just opened, click in the big editing box and <strong>paste</strong> (Ctrl+V, or ⌘V on a Mac), then click <strong>Commit changes…</strong>. (No new tab? <a href="${base}" target="_blank" rel="noopener">Open GitHub</a>.)`
        : `These minutes are too long to send in a link. Click <strong>Show the file</strong>, copy all of it, then paste it into the editing box in the GitHub tab (<a href="${base}" target="_blank" rel="noopener">open GitHub</a>) and click <strong>Commit changes…</strong>.`);
    }
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) {}
  });

  $("download-btn").addEventListener("click", () => {
    if (!validate(false)) return;
    const blob = new Blob([buildFile()], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showHandoff(`Downloaded <strong>${fileName()}</strong>. To submit it, open the <a href="${repo}/upload/main/${folder()}" target="_blank" rel="noopener">${folder()}</a> folder on GitHub, drag the file in, and choose <strong>Propose changes</strong>.`);
  });

  previewBtn.addEventListener("click", () => {
    const show = previewEl.hidden;
    if (show) previewEl.textContent = buildFile();
    previewEl.hidden = !show;
    previewBtn.setAttribute("aria-expanded", String(show));
    previewBtn.textContent = show ? "Hide the file" : "Show the file";
  });
  form.addEventListener("input", () => { if (!previewEl.hidden) previewEl.textContent = buildFile(); });

  function showHandoff(html) {
    handoff.innerHTML = html;
    handoff.hidden = false;
    handoff.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
})();
