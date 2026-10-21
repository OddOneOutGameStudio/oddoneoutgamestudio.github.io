// Odd One Out — small runtime: footer year, in-view video loops, scroll reveal, glitch bursts.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Looping clips (<video class="clip">): play only while on screen,
// and not at all when the visitor prefers reduced motion.
const clips = document.querySelectorAll("video.clip");
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
  }, { threshold: 0.2 });
  clips.forEach((v) => io.observe(v));
}

// Scroll reveal: .rv gets .in the first time it comes near the viewport.
// IntersectionObserver does the work; a cheap scroll/resize check backs it up
// so nothing stays invisible if observer callbacks are delayed.
const revealables = Array.from(document.querySelectorAll(".rv"));
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealables.forEach((el) => el.classList.add("in"));
} else {
  const pending = new Set(revealables);
  const reveal = (el) => { el.classList.add("in"); pending.delete(el); };
  const ro = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      ro.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px 12% 0px" });
  revealables.forEach((el) => ro.observe(el));

  let ticking = false;
  const sweep = () => {
    ticking = false;
    const limit = window.innerHeight * 1.12;
    pending.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit && r.bottom > 0) { reveal(el); ro.unobserve(el); }
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; setTimeout(sweep, 40); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("load", sweep);
  sweep();
}
window.__ooo = "rv3";

// Click-to-play: a <button data-embed="url"> inside a .media swaps the cover for the game's iframe,
// so a heavy browser game only loads when someone asks for it.
document.querySelectorAll("[data-embed]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const media = btn.closest(".media");
    const frame = document.createElement("iframe");
    frame.src = btn.dataset.embed;
    frame.title = btn.dataset.title || "Game";
    frame.allow = "autoplay; fullscreen; gamepad; cross-origin-isolated";
    frame.allowFullscreen = true;
    media.querySelectorAll("img, .media__badge").forEach((el) => el.remove());
    media.append(frame);
    btn.remove();
    frame.focus();
  });
});

// Glitch bursts: every few seconds one visible .glitch element flickers (RGB split),
// and any .glitch flickers on hover. Elements must carry data-text with their own text.
const glitches = Array.from(document.querySelectorAll(".glitch"));

function burst(el) {
  if (reduceMotion || el.classList.contains("is-glitching")) return;
  el.classList.add("is-glitching");
  el.addEventListener("animationend", () => el.classList.remove("is-glitching"), { once: true });
  // Safety net if animationend never fires (e.g. element hidden mid-burst)
  setTimeout(() => el.classList.remove("is-glitching"), 700);
}

function inView(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

if (!reduceMotion && glitches.length) {
  glitches.forEach((el) => {
    const host = el.closest("a, article, .player") || el;
    host.addEventListener("mouseenter", () => burst(el));
  });

  (function schedule() {
    const delay = 7000 + Math.random() * 8000;
    setTimeout(() => {
      const visible = glitches.filter(inView);
      if (visible.length) burst(visible[Math.floor(Math.random() * visible.length)]);
      schedule();
    }, delay);
  })();

  // One burst on the hero right after load so the effect is discovered immediately.
  setTimeout(() => glitches.slice(0, 1).forEach(burst), 600);
}
