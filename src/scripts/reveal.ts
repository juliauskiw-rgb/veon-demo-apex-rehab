// Adds .is-visible to [data-reveal] and .is-drawn to [data-draw] when they enter the viewport (once).
// Content stays visible without JS and with prefers-reduced-motion.
const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
const draws = document.querySelectorAll<HTMLElement>("[data-draw]");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce || !("IntersectionObserver" in window)) {
  items.forEach((el) => el.classList.add("is-visible"));
  draws.forEach((el) => el.classList.add("is-drawn"));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement;
        el.classList.add(el.hasAttribute("data-draw") ? "is-drawn" : "is-visible");
        io.unobserve(el);
      }
    }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  items.forEach((el) => io.observe(el));
  draws.forEach((el) => io.observe(el));
}
