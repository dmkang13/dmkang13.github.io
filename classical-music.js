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

window.addEventListener("hashchange", () => showSlide(indexFromHash(), false));
showSlide(indexFromHash(), false);
