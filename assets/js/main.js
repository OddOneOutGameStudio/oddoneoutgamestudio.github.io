// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Looping clips (<video class="clip">): play only while on screen,
// and not at all when the visitor prefers reduced motion.
const clips = document.querySelectorAll("video.clip");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  clips.forEach((v) => {
    v.removeAttribute("autoplay");
    v.pause();
    v.controls = true;
  });
} else if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 });
  clips.forEach((v) => io.observe(v));
}
