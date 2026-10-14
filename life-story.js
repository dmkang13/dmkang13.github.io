const story = [
  { topic: "Baby pictures", folder: "baby-pictures", color: "peach" },
  { topic: "Texas", folder: "texas", color: "gold" },
  { topic: "Music", folder: "music", color: "sage" },
  { topic: "Korea", folder: "korea", color: "blue" },
  { topic: "High school", folder: "high-school", color: "plum" },
  { topic: "College", folder: "college", color: "coral" },
  { topic: "Post Grad - Austin", folder: "post-grad-austin", color: "austin" },
  { topic: "Post Grad - Houston", folder: "post-grad-houston", color: "houston" },
];

const extensions = ["jpg", "jpeg", "png", "webp", "avif", "svg"];
const photosPerSet = 3;
const photoCacheKey = Date.now().toString(36);
const deck = document.querySelector(".story-deck");
const progressEl = document.querySelector("[data-progress]");
const deckControls = document.querySelector(".deck-controls");
const overviewDialog = document.querySelector("[data-overview-dialog]");
const overviewGrid = document.querySelector(".overview-grid");
const viewer = document.querySelector("[data-photo-viewer]");
const viewerImage = document.querySelector("[data-viewer-image]");
const viewerTitle = document.querySelector("[data-viewer-title]");
const viewerCount = document.querySelector("[data-viewer-count]");
let slides = [];
let current = 0;
let viewerPhotos = [];
let viewerIndex = 0;
let pointerStart = null;
let carouselTimer = null;

function titleSlide() {
  const section = document.createElement("section");
  section.className = "slide title-slide is-active";
  section.dataset.label = "Dale's Life Story";
  section.dataset.kind = "title";
  section.setAttribute("aria-hidden", "false");
  section.innerHTML = `
    <div class="memory-orbit" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="title-copy">
      <p class="eyebrow">Pictures from along the way</p>
      <h1>Dale's<br /><em>Life Story</em></h1>
      <button class="begin-button" type="button" data-next>Start at the beginning <span>→</span></button>
    </div>
    <p class="title-note">People, places · many good stories</p>`;
  return section;
}

function carouselSlide(topic) {
  const section = document.createElement("section");
  section.className = `slide carousel-slide theme-${topic.color}`;
  section.dataset.label = topic.topic;
  section.dataset.kind = "carousel";
  section.dataset.folder = topic.folder;
  section.dataset.cursor = "0";
  section.setAttribute("aria-hidden", "true");
  section.innerHTML = `
    <div class="carousel-heading">
      <h2>${topic.topic}</h2>
      <p class="photo-status sr-only" aria-live="polite">Looking for photos…</p>
      <div class="carousel-actions">
        <button class="shuffle-button" type="button" data-shuffle-back aria-keyshortcuts="A" title="Previous photo set (A)" disabled>
          <span aria-hidden="true">←</span> Back
        </button>
        <button class="shuffle-button" type="button" data-shuffle aria-keyshortcuts="S" title="Next photo set (S)" disabled>
          Shuffle <span aria-hidden="true">↻</span>
        </button>
        <span class="shuffle-timer" aria-hidden="true"><i></i></span>
      </div>
    </div>
    <div class="carousel-grid is-loading" aria-label="Photos from ${topic.topic}"></div>`;
  return section;
}

function closingSlide() {
  const section = document.createElement("section");
  section.className = "slide closing-slide";
  section.dataset.kind = "closing";
  section.setAttribute("aria-hidden", "true");
  section.innerHTML = `
    <div class="closing-lines" aria-hidden="true"></div>
    <div>
      <p class="eyebrow">For now</p>
      <h2>To be<br /><em>continued.</em></h2>
      <p>Every good life story leaves room for the next picture.</p>
      <button class="begin-button" type="button" data-restart>Back to the beginning <span>↺</span></button>
    </div>`;
  return section;
}

function buildDeck() {
  deck.appendChild(titleSlide());
  story.forEach((topic) => deck.appendChild(carouselSlide(topic)));
  deck.appendChild(closingSlide());
  slides = [...document.querySelectorAll(".slide")];
}

function tryImage(folder, number, extensionIndex = 0) {
  return new Promise((resolve) => {
    if (extensionIndex >= extensions.length) {
      resolve(null);
      return;
    }
    const path = `photos/life-story/${folder}/${number}.${extensions[extensionIndex]}?v=${photoCacheKey}`;
    const image = new Image();
    image.onload = () => resolve(path);
    image.onerror = () => resolve(tryImage(folder, number, extensionIndex + 1));
    image.src = path;
  });
}

async function discoverPhotos(folder) {
  const found = [];
  let consecutiveMisses = 0;
  for (let number = 1; number <= 60; number += 1) {
    const path = await tryImage(folder, number);
    if (path) {
      found.push(path);
      consecutiveMisses = 0;
    } else {
      consecutiveMisses += 1;
    }
    if (found.length && consecutiveMisses >= 3) break;
    if (!found.length && consecutiveMisses >= 6) break;
  }
  return found;
}

function visibleBatch(slide) {
  const photos = slide.photos || [];
  if (photos.length <= photosPerSet) return photos;
  const cursor = Number(slide.dataset.cursor);
  return Array.from({ length: photosPerSet }, (_, index) => photos[(cursor + index) % photos.length]);
}

function updateCarouselControls(slide) {
  const canCycle = (slide.photos?.length || 0) > photosPerSet;
  const backButton = slide.querySelector("[data-shuffle-back]");
  const nextButton = slide.querySelector("[data-shuffle]");
  backButton.disabled = !canCycle || slide.historyIndex <= 0;
  nextButton.disabled = !canCycle;
}

function createPhotoCard(slide, path, index, batch) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "photo-card";
  button.style.setProperty("--rotation", "0deg");
  button.setAttribute("aria-label", `Open photo ${index + 1} of ${batch.length}`);
  button.innerHTML = `<img src="${path}" alt="${slide.dataset.label}, photo ${index + 1}" /><span>${String(index + 1).padStart(2, "0")}</span>`;
  button.addEventListener("click", () => openViewer(slide, batch, index));
  return button;
}

function renderCarousel(slide) {
  const grid = slide.querySelector(".carousel-grid");
  const batch = visibleBatch(slide);
  grid.innerHTML = "";
  grid.dataset.count = String(batch.length);
  batch.forEach((path, index) => grid.appendChild(createPhotoCard(slide, path, index, batch)));
}

function assignGatherOffsets(grid) {
  const gridRect = grid.getBoundingClientRect();
  const centerX = gridRect.left + gridRect.width / 2;
  const centerY = gridRect.top + gridRect.height / 2;
  grid.querySelectorAll(".photo-card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--gather-x", `${centerX - (rect.left + rect.width / 2)}px`);
    card.style.setProperty("--gather-y", `${centerY - (rect.top + rect.height / 2)}px`);
  });
}

function resetCarouselTimer(slide) {
  window.clearTimeout(carouselTimer);
  carouselTimer = null;
  document.querySelectorAll(".shuffle-timer").forEach((timer) => timer.classList.remove("is-running"));
  if (!slide || slide.dataset.kind !== "carousel" || !(slide.photos?.length > photosPerSet)) return;
  const timer = slide.querySelector(".shuffle-timer");
  void timer.offsetWidth;
  timer.classList.add("is-running");
  carouselTimer = window.setTimeout(() => shuffleCarousel(slide, 1), 30000);
}

function shuffleCarousel(slide, direction = 1) {
  if (slide.dataset.animating === "true" || !(slide.photos?.length > photosPerSet)) return;
  if (direction < 0 && slide.historyIndex <= 0) return;
  const grid = slide.querySelector(".carousel-grid");
  const cards = [...grid.querySelectorAll(".photo-card")];
  if (!cards.length) return;
  slide.dataset.animating = "true";
  assignGatherOffsets(grid);
  grid.classList.add("is-gathering");

  window.setTimeout(() => {
    const photoCount = slide.photos.length;
    const currentCursor = Number(slide.dataset.cursor);
    if (direction < 0) {
      slide.historyIndex -= 1;
      slide.dataset.cursor = String(slide.carouselHistory[slide.historyIndex]);
    } else if (slide.historyIndex < slide.carouselHistory.length - 1) {
      slide.historyIndex += 1;
      slide.dataset.cursor = String(slide.carouselHistory[slide.historyIndex]);
    } else {
      const nextCursor = (currentCursor + photosPerSet) % photoCount;
      slide.carouselHistory.push(nextCursor);
      slide.historyIndex += 1;
      slide.dataset.cursor = String(nextCursor);
    }
    renderCarousel(slide);
    updateCarouselControls(slide);
    grid.classList.remove("is-gathering");
    assignGatherOffsets(grid);
    grid.classList.add("is-spreading");
    window.setTimeout(() => {
      grid.classList.remove("is-spreading");
      slide.dataset.animating = "false";
    }, 720);
  }, 560);

  resetCarouselTimer(slide);
}

async function loadCarousel(slide) {
  if (slide.dataset.loaded === "true") return;
  slide.dataset.loaded = "true";
  const grid = slide.querySelector(".carousel-grid");
  const status = slide.querySelector(".photo-status");
  const photos = await discoverPhotos(slide.dataset.folder);
  slide.photos = photos;
  slide.carouselHistory = [0];
  slide.historyIndex = 0;
  grid.classList.remove("is-loading");

  if (!photos.length) {
    grid.classList.add("is-empty");
    grid.innerHTML = `<div class="empty-photo"><span>＋</span><b>Add photos here</b><code>photos/life-story/${slide.dataset.folder}/</code><small>Name them 1.jpg, 2.jpg, 3.jpg…</small></div>`;
    status.textContent = "Ready for photos";
    updateCarouselControls(slide);
    return;
  }

  renderCarousel(slide);
  status.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"} · three shown at a time`;
  updateCarouselControls(slide);
  resetCarouselTimer(slide);
}

function indexFromHash() {
  const match = window.location.hash.match(/slide-(\d+)/);
  return match ? Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1) : 0;
}

function showSlide(index, updateHash = true) {
  window.clearTimeout(carouselTimer);
  carouselTimer = null;
  current = Math.min(Math.max(index, 0), slides.length - 1);
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === current;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });
  const activeSlide = slides[current];
  if (activeSlide.dataset.kind === "carousel") {
    activeSlide.querySelector(".carousel-heading").prepend(deckControls);
  } else {
    progressEl.before(deckControls);
  }
  progressEl.style.width = `${((current + 1) / slides.length) * 100}%`;
  document.title = `${activeSlide.dataset.label} — Dale's Life Story`;
  if (activeSlide.dataset.kind === "carousel") {
    loadCarousel(activeSlide).then(() => resetCarouselTimer(activeSlide));
  }
  if (updateHash) history.replaceState(null, "", `#slide-${current + 1}`);
}

function buildOverview() {
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `overview-item overview-${slide.dataset.kind}`;
    button.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><span>${slide.dataset.label}</span>`;
    button.addEventListener("click", () => {
      overviewDialog.close();
      showSlide(index);
    });
    overviewGrid.appendChild(button);
  });
}

function openViewer(slide, photos, index) {
  window.clearTimeout(carouselTimer);
  viewerPhotos = photos;
  viewerIndex = index;
  viewer.dataset.place = slide.dataset.label;
  updateViewer();
  viewer.showModal();
}

function updateViewer() {
  viewerImage.src = viewerPhotos[viewerIndex];
  viewerImage.alt = `${viewer.dataset.place}, photo ${viewerIndex + 1}`;
  viewerTitle.textContent = viewer.dataset.place;
  viewerCount.textContent = `${viewerIndex + 1} / ${viewerPhotos.length}`;
  document.querySelector("[data-viewer-prev]").disabled = viewerPhotos.length < 2;
  document.querySelector("[data-viewer-next]").disabled = viewerPhotos.length < 2;
}

function moveViewer(direction) {
  viewerIndex = (viewerIndex + direction + viewerPhotos.length) % viewerPhotos.length;
  updateViewer();
}

buildDeck();
buildOverview();

document.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => showSlide(current + 1)));
document.querySelector("[data-prev]").addEventListener("click", () => showSlide(current - 1));
document.querySelector("[data-restart]").addEventListener("click", () => showSlide(0));
document.querySelector("[data-overview]").addEventListener("click", () => overviewDialog.showModal());
document.querySelector("[data-close-overview]").addEventListener("click", () => overviewDialog.close());
document.querySelector("[data-close-viewer]").addEventListener("click", () => {
  viewer.close();
  resetCarouselTimer(slides[current]);
});
document.querySelector("[data-viewer-prev]").addEventListener("click", () => moveViewer(-1));
document.querySelector("[data-viewer-next]").addEventListener("click", () => moveViewer(1));
document.querySelectorAll("[data-shuffle]").forEach((button) => {
  button.addEventListener("click", () => shuffleCarousel(button.closest(".carousel-slide"), 1));
});
document.querySelectorAll("[data-shuffle-back]").forEach((button) => {
  button.addEventListener("click", () => shuffleCarousel(button.closest(".carousel-slide"), -1));
});

document.querySelector("[data-fullscreen]").addEventListener("click", async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
  else await document.exitFullscreen?.();
});

document.addEventListener("fullscreenchange", () => {
  const button = document.querySelector("[data-fullscreen]");
  button.firstChild.textContent = document.fullscreenElement ? "Exit " : "Present ";
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) window.clearTimeout(carouselTimer);
  else resetCarouselTimer(slides[current]);
});

document.addEventListener("keydown", (event) => {
  if (viewer.open) {
    if (event.key === "ArrowRight") moveViewer(1);
    if (event.key === "ArrowLeft") moveViewer(-1);
    return;
  }
  if (overviewDialog.open) return;
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if (isTyping) return;

  const shortcut = event.key.toLowerCase();
  const activeSlide = slides[current];
  const canUseCarouselShortcut = activeSlide.dataset.kind === "carousel"
    && !event.metaKey
    && !event.ctrlKey
    && !event.altKey
    && !event.repeat;
  if (canUseCarouselShortcut && shortcut === "s") {
    event.preventDefault();
    shuffleCarousel(activeSlide, 1);
    return;
  }
  if (canUseCarouselShortcut && shortcut === "a") {
    event.preventDefault();
    shuffleCarousel(activeSlide, -1);
    return;
  }

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
  } else if (event.key === "Escape") {
    overviewDialog.showModal();
  }
});

deck.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse") pointerStart = event.clientX;
});
deck.addEventListener("pointerup", (event) => {
  if (pointerStart === null) return;
  const distance = event.clientX - pointerStart;
  pointerStart = null;
  if (Math.abs(distance) > 55) showSlide(current + (distance < 0 ? 1 : -1));
});

window.addEventListener("hashchange", () => showSlide(indexFromHash(), false));
showSlide(indexFromHash(), false);
