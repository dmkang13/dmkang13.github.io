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
const mentiDialog = document.querySelector("[data-menti-dialog]");
const mentiStage = document.querySelector("[data-menti-stage]");
const mentiForm = document.querySelector("[data-menti-form]");
const mentiQuestion = mentiDialog.querySelector("[data-menti-question]");
const mentiType = mentiDialog.querySelector("[data-menti-type]");
const mentiCode = document.querySelector("[data-copy-menti-code]");
const mentiHelp = document.querySelector("[data-menti-help]");
const mentiResults = document.querySelector("[data-menti-results]");
const mentiStatus = document.querySelector("[data-menti-status]");
const mentiJoinLinks = [...mentiDialog.querySelectorAll("[data-menti-join], [data-menti-join-button]")];
const MENTI_STORAGE_KEY = "classical-music-menti";
let current = 0;

function loadMentiSettings() {
  try {
    return JSON.parse(localStorage.getItem(MENTI_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

let mentiSettings = loadMentiSettings();

function safeWebUrl(value, fallback = "") {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function renderMentiSettings() {
  const joinUrl = safeWebUrl(mentiSettings.joinUrl, "https://www.menti.com/");
  const resultsUrl = safeWebUrl(mentiSettings.resultsUrl);
  const code = String(mentiSettings.code || "").replace(/\D/g, "").slice(0, 8);
  const configured = Boolean(code || mentiSettings.joinUrl);

  mentiJoinLinks.forEach((link) => { link.href = joinUrl; });
  mentiCode.textContent = code ? code.replace(/(\d{4})(?=\d)/, "$1 ") : "Set join code";
  mentiCode.disabled = !code;
  mentiHelp.textContent = configured
    ? "Open the participation link on a second device. Responses appear in the presenter view."
    : "Presenter: add the participation link and code once, then every Menti cue in the talk will use them.";
  mentiResults.hidden = !resultsUrl;
  if (resultsUrl) mentiResults.href = resultsUrl;
  mentiStatus.textContent = configured ? "live" : "setup";
  mentiStatus.classList.toggle("is-live", configured);
}

function showMentiSettings() {
  mentiForm.elements.code.value = mentiSettings.code || "";
  mentiForm.elements.joinUrl.value = mentiSettings.joinUrl || "";
  mentiForm.elements.resultsUrl.value = mentiSettings.resultsUrl || "";
  mentiStage.hidden = true;
  mentiForm.hidden = false;
  requestAnimationFrame(() => mentiForm.elements.code.focus());
}

function hideMentiSettings() {
  mentiForm.hidden = true;
  mentiStage.hidden = false;
}

function openMenti(trigger) {
  mentiQuestion.textContent = trigger.dataset.mentiQuestion || "Join the live conversation";
  mentiType.textContent = trigger.dataset.mentiType || "Audience participation";
  hideMentiSettings();
  mentiDialog.showModal();
  if (!mentiSettings.code && !mentiSettings.joinUrl) showMentiSettings();
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
  const { video, start = "0", end, title } = button.dataset;
  const params = new URLSearchParams({ autoplay: "1", start, rel: "0", modestbranding: "1" });
  if (end) params.set("end", end);
  player.src = `https://www.youtube-nocookie.com/embed/${video}?${params}`;
  mediaTitle.textContent = title;
  youtubeLink.href = `https://www.youtube.com/watch?v=${video}&t=${start}s`;
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
document.querySelectorAll("[data-open-menti]").forEach((button) => button.addEventListener("click", () => openMenti(button)));
document.querySelector("[data-close-menti]").addEventListener("click", () => mentiDialog.close());
document.querySelector("[data-menti-settings]").addEventListener("click", showMentiSettings);
document.querySelector("[data-cancel-menti-settings]").addEventListener("click", hideMentiSettings);

mentiForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(mentiForm);
  mentiSettings = {
    code: String(data.get("code") || "").replace(/\D/g, "").slice(0, 8),
    joinUrl: safeWebUrl(String(data.get("joinUrl") || "")),
    resultsUrl: safeWebUrl(String(data.get("resultsUrl") || "")),
  };
  localStorage.setItem(MENTI_STORAGE_KEY, JSON.stringify(mentiSettings));
  renderMentiSettings();
  hideMentiSettings();
});

mentiCode.addEventListener("click", async () => {
  if (!mentiSettings.code) return;
  try {
    await navigator.clipboard.writeText(mentiSettings.code);
    const original = mentiCode.textContent;
    mentiCode.textContent = "Copied";
    window.setTimeout(() => { mentiCode.textContent = original; }, 1200);
  } catch {
    mentiHelp.textContent = `Join code: ${mentiSettings.code}`;
  }
});

mediaDialog.addEventListener("click", (event) => {
  if (event.target === mediaDialog) closeMedia();
});

mentiDialog.addEventListener("click", (event) => {
  if (event.target === mentiDialog) mentiDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (mediaDialog.open) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMedia();
    }
    return;
  }
  if (mentiDialog.open || overviewDialog.open) return;
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
  } else if (event.key.toLowerCase() === "m") {
    event.preventDefault();
    openMenti(document.querySelector("[data-open-menti]"));
  } else if (event.key === "Escape") {
    overviewDialog.showModal();
  }
});

window.addEventListener("hashchange", () => showSlide(indexFromHash(), false));
renderMentiSettings();
showSlide(indexFromHash(), false);
