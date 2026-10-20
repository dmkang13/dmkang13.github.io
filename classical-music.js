const slides = [...document.querySelectorAll(".slide")];
const currentEl = document.querySelector("[data-current]");
const totalEl = document.querySelector("[data-total]");
const progressEl = document.querySelector("[data-progress]");
const mediaDialog = document.querySelector("[data-media]");
const player = document.querySelector("[data-player]");
const mediaTitle = document.querySelector("[data-media-title]");
const youtubeLink = document.querySelector("[data-youtube]");
const overviewDialog = document.querySelector("[data-overview-dialog]");
const overviewGrid = document.querySelector(".overview-grid");
let current = 0;
let presentationContent = {};

function parseSlideMarkdown(markdown) {
  const content = {};
  let slideId = "";
  let field = "";

  markdown.split(/\r?\n/).forEach((line) => {
    const slideMatch = line.match(/^##\s+(slide-\d+)(?:\s+.+)?$/i);
    if (slideMatch) {
      slideId = slideMatch[1].toLowerCase();
      content[slideId] = content[slideId] || {};
      field = "";
      return;
    }

    const fieldMatch = line.match(/^###\s+([a-z0-9-]+)\s*$/i);
    if (fieldMatch && slideId) {
      field = fieldMatch[1].toLowerCase();
      content[slideId][field] = "";
      return;
    }

    if (slideId && field) content[slideId][field] += `${line}\n`;
  });

  Object.values(content).forEach((slide) => {
    Object.keys(slide).forEach((key) => { slide[key] = slide[key].trim(); });
  });
  return content;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function plainText(value) {
  return value.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();
}

function contentLines(value) {
  return value.split(/\r?\n/).map((line) => line.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
}

function contentRows(value) {
  return contentLines(value).map((line) => line.split("|").map((cell) => cell.trim()));
}

function setRich(root, selector, value) {
  if (value === undefined) return;
  const element = root.querySelector(selector);
  if (element) element.innerHTML = inlineMarkdown(value);
}

function setText(root, selector, value) {
  if (value === undefined) return;
  const element = root.querySelector(selector);
  if (element) element.textContent = plainText(value);
}

function setButtonLabel(root, selector, value) {
  if (value === undefined) return;
  const button = root.querySelector(selector);
  const label = button?.querySelector("span:not(.play)");
  if (label) label.textContent = plainText(value);
}

function setLeadingButtonText(root, selector, value) {
  if (value === undefined) return;
  const button = root.querySelector(selector);
  if (!button) return;
  const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.textContent = `${plainText(value)} `;
}

function applyList(root, selector, value, columns = 1) {
  if (value === undefined) return;
  const rows = contentRows(value);
  const elements = [...root.querySelectorAll(selector)];
  elements.forEach((element, index) => {
    const row = rows[index];
    element.hidden = !row;
    if (!row) return;
    if (columns === 1) {
      element.innerHTML = inlineMarkdown(row[0]);
      return;
    }
    [...element.children].slice(0, columns).forEach((child, column) => {
      child.textContent = row[column] || "";
    });
  });
}

function youtubeId(value) {
  if (!value) return "";
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
      return embedIndex >= 0 ? parts[embedIndex + 1] || "" : "";
    }
  } catch {
    return "";
  }
  return "";
}

function applyVideoSettings(track, url, start, end) {
  if (!track) return;
  const id = youtubeId(url);
  if (id) track.dataset.video = id;
  else delete track.dataset.video;
  if (start !== undefined && start !== "") track.dataset.start = String(Math.max(0, Number(start) || 0));
  else delete track.dataset.start;
  if (end !== undefined && end !== "") track.dataset.end = String(Math.max(0, Number(end) || 0));
  else delete track.dataset.end;
}

function applyVideoField(track, value) {
  if (value === undefined) return;
  const [url = "", start = "", end = ""] = contentRows(value)[0] || [];
  applyVideoSettings(track, url, start, end);
}

function applyTracks(slide, value) {
  if (value === undefined) return;
  const rows = contentRows(value);
  const tracks = [...slide.querySelectorAll(".program-list .track, .era-copy > .track")];
  tracks.forEach((track, index) => {
    const row = rows[index];
    track.hidden = !row;
    if (!row) return;
    const [composer = "", work = "", time = "", url = "", start = "", end = ""] = row;
    track.querySelector("b").textContent = composer;
    track.querySelector("i").textContent = work;
    track.querySelector("small").textContent = time;
    track.dataset.title = [composer, work].filter(Boolean).join(" · ");
    applyVideoSettings(track, url, start, end);
  });
}

function applyVoicePhrases(slide, value) {
  if (value === undefined) return;
  const rows = contentRows(value);
  [...slide.querySelectorAll(".voice-phrases span")].forEach((phrase, index) => {
    const row = rows[index];
    phrase.hidden = !row;
    if (!row) return;
    phrase.querySelector("b").textContent = row[0] || "";
    const textNode = [...phrase.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = ` ${row[1] || ""}`;
  });
}

function applySlideContent(slide, content) {
  if (!content) return;
  if (content.label !== undefined) slide.dataset.label = plainText(content.label);

  if (slide.id === "slide-1") {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h1", content.title);
    setLeadingButtonText(slide, ".start-button", content.start);
    setText(slide, ".opening-question", content.question);
  } else if (slide.classList.contains("personal-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    applyList(slide, ".personal-photo figcaption", content["photo-labels"]);
  } else if (slide.classList.contains("map-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    applyList(slide, ".era-map li", content.eras, 3);
  } else if (slide.classList.contains("era-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    applyTracks(slide, content.tracks);
    setRich(slide, ".margin-note", content.note);
  } else if (slide.classList.contains("program-slide")) {
    setText(slide, ".program-head .kicker", content.kicker);
    setRich(slide, ".program-head h2", content.title);
    setRich(slide, ".program-head > p:last-child", content.subtitle);
    applyTracks(slide, content.tracks);
    applyList(slide, ".fact-stack span", content["era-notes"] ?? content.facts);
  } else if (slide.classList.contains("film-scene-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setRich(slide, ".subtitle", content.subtitle);
    setButtonLabel(slide, ".watch-button", content.watch);
  } else if (slide.classList.contains("listening-activity-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setButtonLabel(slide, ".watch-button", content.watch);
    applyList(slide, ".three-words span", content.prompts);
  } else if (slide.classList.contains("voice-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setButtonLabel(slide, ".watch-button", content.watch);
    applyVoicePhrases(slide, content.phrases);
  } else if (slide.classList.contains("interstellar-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setButtonLabel(slide, ".watch-button", content.watch);
    applyList(slide, ".interstellar-prompts span", content.prompts);
  } else if (slide.classList.contains("closing-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setText(slide, ".closing-copy > p:last-of-type", content.question);
  } else if (slide.classList.contains("break-slide")) {
    setText(slide, ".kicker", content.kicker);
    setRich(slide, "h2", content.title);
    setRich(slide, ".prompt-quote", content.quote);
    setButtonLabel(slide, ".watch-button", content.watch);
    setText(slide, ".reveal-note", content.reveal);
    applyList(slide, ".story-prompts span", content.prompts);
  }

  const firstTrack = slide.querySelector(".track");
  if (firstTrack && content["media-title"] !== undefined) firstTrack.dataset.title = plainText(content["media-title"]);
  applyVideoField(firstTrack, content.video);
}

function refreshOverviewLabels() {
  [...overviewGrid.querySelectorAll("button span")].forEach((label, index) => {
    label.textContent = slides[index].dataset.label;
  });
}

async function loadPresentationContent() {
  try {
    const response = await fetch("classical-music-content.md", { cache: "no-store" });
    if (!response.ok) throw new Error(`Content request failed with ${response.status}`);
    presentationContent = parseSlideMarkdown(await response.text());
    slides.forEach((slide) => applySlideContent(slide, presentationContent[slide.id]));
    refreshOverviewLabels();
  } catch (error) {
    console.warn("Using the HTML fallback because slide content could not be loaded.", error);
  }
}

totalEl.textContent = String(slides.length).padStart(2, "0");

function indexFromHash() {
  const match = window.location.hash.match(/slide-(\d+)/);
  return match ? Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1) : 0;
}

function showSlide(index, updateHash = true) {
  current = Math.min(Math.max(index, 0), slides.length - 1);
  slides.forEach((slide, i) => {
    const active = i === current;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });
  currentEl.textContent = String(current + 1).padStart(2, "0");
  progressEl.style.width = `${((current + 1) / slides.length) * 100}%`;
  document.title = `${slides[current].dataset.label} — Classical Music Passion Talk`;
  if (updateHash) history.replaceState(null, "", `#slide-${current + 1}`);
}

function closeMedia() {
  player.src = "about:blank";
  if (mediaDialog.open) mediaDialog.close();
}

function openTrack(button) {
  const { video, start, end, title } = button.dataset;
  const params = new URLSearchParams({ autoplay: "1", rel: "0", modestbranding: "1" });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  player.src = `https://www.youtube-nocookie.com/embed/${video}?${params}`;
  mediaTitle.textContent = title;
  youtubeLink.href = `https://www.youtube.com/watch?v=${video}${start ? `&t=${start}s` : ""}`;
  mediaDialog.showModal();
}

slides.forEach((slide, index) => {
  const item = document.createElement("button");
  item.type = "button";
  item.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><span>${slide.dataset.label}</span>`;
  item.addEventListener("click", () => {
    overviewDialog.close();
    showSlide(index);
  });
  overviewGrid.appendChild(item);
});

document.querySelectorAll(".track").forEach((button) => button.addEventListener("click", () => openTrack(button)));
document.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => showSlide(current + 1)));
document.querySelectorAll("[data-prev]").forEach((button) => button.addEventListener("click", () => showSlide(current - 1)));
document.querySelector("[data-close-media]").addEventListener("click", closeMedia);
document.querySelector("[data-overview]").addEventListener("click", () => overviewDialog.showModal());
document.querySelector("[data-close-overview]").addEventListener("click", () => overviewDialog.close());
mediaDialog.addEventListener("click", (event) => {
  if (event.target === mediaDialog) closeMedia();
});

document.addEventListener("keydown", (event) => {
  if (mediaDialog.open) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMedia();
    }
    return;
  }
  if (overviewDialog.open) return;
  if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    showSlide(current + 1);
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    showSlide(current - 1);
  } else if (event.key === "Home") {
    event.preventDefault();
    showSlide(0);
  } else if (event.key === "End") {
    event.preventDefault();
    showSlide(slides.length - 1);
  }
});

window.addEventListener("hashchange", () => showSlide(indexFromHash(), false));

async function initializePresentation() {
  await loadPresentationContent();
  showSlide(indexFromHash(), false);
}

initializePresentation();
