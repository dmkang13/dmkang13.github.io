const toggles = document.querySelectorAll(".role-toggle");

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const role = toggle.closest(".role");
    const details = role.querySelector(".role-details");
    const icon = toggle.querySelector(".role-icon");
    const expanded = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!expanded));
    details.hidden = expanded;
    role.classList.toggle("open", !expanded);
    icon.textContent = expanded ? "＋" : "−";
  });
});
