// Slide deck player for decks made by tools/pptx_to_deck.py.
// Usage: <div class="deck" data-deck="assets/decks/my-game/deck.json" aria-label="Pitch deck"></div>
// Element lengths in deck.json are % of the slide width, so they map 1:1 onto cqw.

const ICONS = {
  prev: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
};

function icon(name) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function make(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function loadFonts(fonts) {
  if (!fonts.length) return;
  const families = fonts.map((f) => "family=" + encodeURIComponent(f).replace(/%20/g, "+")).join("&");
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = make("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
}

// YouTube / Google Drive links become embeddable players; anything else is a video file.
function embedUrl(src) {
  const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const drive = src.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return null;
}

function isVideoLink(href) {
  return /youtube\.com|youtu\.be|drive\.google\.com\/file|vimeo\.com/.test(href);
}

function place(node, e) {
  // maxWidth inline: pictures may be wider than the slide, whatever the page's img rules say.
  Object.assign(node.style, {
    left: `${e.x}cqw`, top: `${e.y}cqw`, width: `${e.w}cqw`, height: `${e.h}cqw`, maxWidth: "none",
  });
  const t = [];
  if (e.rot) t.push(`rotate(${e.rot}deg)`);
  if (e.flipH) t.push("scaleX(-1)");
  if (e.flipV) t.push("scaleY(-1)");
  if (t.length) node.style.transform = t.join(" ");
  if (e.opacity != null) node.style.opacity = e.opacity;
}

function renderImage(e, base) {
  const media = e.kind === "video" ? make("video") : make("img");
  if (e.kind === "video") {
    Object.assign(media, { muted: true, loop: true, playsInline: true, preload: "auto" });
    media.setAttribute("muted", "");
    media.setAttribute("aria-hidden", "true");
    media.disablePictureInPicture = true;
  } else {
    media.alt = e.alt || "";
    media.decoding = "async";
  }
  media.src = base + e.src;
  media.className = "deck__media";

  let box = media;
  if (e.crop) {
    const { l, t, r, b } = e.crop;
    box = make("div", "deck__crop");
    Object.assign(media.style, {
      width: `${100 / (1 - l - r)}%`, height: `${100 / (1 - t - b)}%`,
      left: `${(-l / (1 - l - r)) * 100}%`, top: `${(-t / (1 - t - b)) * 100}%`,
    });
    box.append(media);
  }

  if (e.link) {
    const a = make("a", "deck__link");
    a.href = e.link;
    a.target = "_blank";
    a.rel = "noopener";
    if (box === media) box.classList.add("deck__fill");
    a.append(box);
    if (isVideoLink(e.link)) {
      a.setAttribute("aria-label", "Play video (opens in a new tab)");
      const badge = make("span", "deck__play");
      badge.innerHTML = icon("play");
      a.append(badge);
    }
    box = a;
  }
  box.classList.add("deck__el");
  place(box, e);
  return box;
}

function renderShape(e) {
  const node = make("div", "deck__el deck__shape");
  place(node, e);
  if (e.fill) node.style.background = e.fill;
  if (e.stroke) node.style.border = `${e.strokeW}cqw solid ${e.stroke}`;
  if (e.geom === "ellipse") node.style.borderRadius = "50%";
  if (e.geom === "roundRect") node.style.borderRadius = "1.5cqw";
  if (!e.text) return node;

  const [t, r, b, l] = e.inset;
  node.style.padding = `${t}cqw ${r}cqw ${b}cqw ${l}cqw`;
  node.style.justifyContent = { t: "flex-start", ctr: "center", b: "flex-end" }[e.anchor] || "flex-start";
  for (const para of e.text) {
    const p = make("p");
    p.style.textAlign = { l: "left", ctr: "center", r: "right", just: "justify" }[para.align] || "left";
    if (para.lineHeight) p.style.lineHeight = String(para.lineHeight * 1.2);
    if (para.marL) p.style.marginLeft = `${para.marL}cqw`;
    if (para.indent) p.style.textIndent = `${para.indent}cqw`;
    if (para.before) p.style.marginTop = `${para.before}cqw`;
    if (para.after) p.style.marginBottom = `${para.after}cqw`;
    for (const run of para.runs) {
      const span = make("span");
      span.textContent = run.text || "​";
      span.style.fontSize = `${run.size}cqw`;
      if (run.font) span.style.fontFamily = `"${run.font}", system-ui, sans-serif`;
      if (run.color) span.style.color = run.color;
      if (run.bold) span.style.fontWeight = "700";
      if (run.italic) span.style.fontStyle = "italic";
      if (run.underline) span.style.textDecoration = "underline";
      p.append(span);
    }
    node.append(p);
  }
  return node;
}

function renderSlideVideo(src, base) {
  const wrap = make("div", "deck__video");
  const embed = embedUrl(src);
  if (embed) {
    const frame = make("iframe");
    frame.src = embed;
    frame.title = "Video";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    wrap.append(frame);
  } else {
    const video = make("video");
    Object.assign(video, { controls: true, playsInline: true, preload: "metadata" });
    video.src = /^https?:/.test(src) ? src : base + src;
    video.dataset.manual = "";
    wrap.append(video);
  }
  return wrap;
}

function renderSlide(data, base) {
  const slide = make("div", "deck__slide");
  if (data.background.color) slide.style.background = data.background.color;
  if (data.background.image) slide.style.backgroundImage = `url("${base + data.background.image}")`;
  for (const e of data.elements) {
    slide.append(e.type === "image" ? renderImage(e, base) : renderShape(e));
  }
  if (data.video) slide.append(renderSlideVideo(data.video, base));
  return slide;
}

async function initDeck(root) {
  const src = root.dataset.deck;
  const base = src.slice(0, src.lastIndexOf("/") + 1);
  const deck = await fetch(src, { cache: "no-cache" }).then((r) => r.json());
  loadFonts(deck.fonts);

  const total = deck.slides.length;
  const label = root.getAttribute("aria-label") || "Slides";
  root.setAttribute("role", "region");
  root.setAttribute("aria-roledescription", "carousel");
  root.tabIndex = 0;

  const stage = make("div", "deck__stage");
  stage.style.aspectRatio = `${deck.width} / ${deck.height}`;
  const bar = make("div", "deck__bar");
  bar.innerHTML = `
    <button type="button" class="deck__btn" data-go="-1" aria-label="Previous slide">${icon("prev")}</button>
    <span class="deck__count" aria-live="polite"></span>
    <button type="button" class="deck__btn" data-go="1" aria-label="Next slide">${icon("next")}</button>
    <span class="deck__spacer"></span>
    <button type="button" class="deck__btn" data-full aria-label="Full screen">${icon("full")}</button>`;
  root.append(stage, bar);

  const slides = new Array(total);
  const count = bar.querySelector(".deck__count");
  let current = 0;
  let visible = false;

  function ensure(i) {
    if (i < 0 || i >= total || slides[i]) return;
    slides[i] = renderSlide(deck.slides[i], base);
    slides[i].setAttribute("role", "group");
    slides[i].setAttribute("aria-roledescription", "slide");
    slides[i].setAttribute("aria-label", `${i + 1} of ${total}`);
    stage.append(slides[i]);
  }

  function syncPlayback() {
    slides.forEach((slide, i) => {
      if (!slide) return;
      slide.querySelectorAll("video").forEach((v) => {
        if (i === current && visible && !("manual" in v.dataset)) v.play().catch(() => {});
        else v.pause();
      });
    });
  }

  function show(i) {
    current = Math.max(0, Math.min(total - 1, i));
    ensure(current);
    ensure(current + 1);
    slides.forEach((slide, n) => {
      if (!slide) return;
      slide.hidden = n !== current;
    });
    count.textContent = `${current + 1} / ${total}`;
    bar.querySelector('[data-go="-1"]').disabled = current === 0;
    bar.querySelector('[data-go="1"]').disabled = current === total - 1;
    syncPlayback();
  }

  bar.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    if ("go" in btn.dataset) show(current + Number(btn.dataset.go));
    if ("full" in btn.dataset) {
      if (document.fullscreenElement) document.exitFullscreen();
      else (root.requestFullscreen || root.webkitRequestFullscreen)?.call(root);
    }
  });

  root.addEventListener("keydown", (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: total - 1 };
    if (event.key in keys && !event.target.closest("iframe, video")) {
      event.preventDefault();
      show(keys[event.key]);
    }
  });

  let startX = null;
  stage.addEventListener("pointerdown", (event) => { startX = event.clientX; });
  stage.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.2 }).observe(root);

  show(0);
}

document.querySelectorAll("[data-deck]").forEach((root) => {
  initDeck(root).catch((err) => {
    root.textContent = "Couldn’t load the slides.";
    console.error(err);
  });
});
