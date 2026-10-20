const timeline = document.querySelector("[data-timeline]");
const year = document.querySelector("[data-year]");

if (year) year.textContent = new Date().getFullYear();

if (timeline) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timeline.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(timeline);
  } else {
    timeline.classList.add("is-visible");
  }
}
