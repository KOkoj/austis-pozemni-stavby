(function () {
  const root = document.documentElement;
  const desktopShell = document.querySelector(".desktop-shell");
  const mobilePage = document.querySelector(".mobile-page");
  const designLines = Array.from(document.querySelectorAll(".artboard .line, .artboard .grid-line, .artboard .section-line, .artboard .footer-line"));
  const lineSections = Array.from(document.querySelectorAll(".project, .about"));
  const desktopMin = 769;
  const designWidth = 1440;

  function updateScale() {
    const width = window.innerWidth;
    const isDesktop = width >= desktopMin;
    const scale = width >= desktopMin ? Math.min(width / designWidth, 1) : 1;

    root.style.setProperty("--scale", scale.toFixed(5));
    desktopShell?.setAttribute("aria-hidden", String(!isDesktop));
    mobilePage?.setAttribute("aria-hidden", String(isDesktop));
  }

  function setLineDirection(line) {
    const { width, height } = line.getBoundingClientRect();
    const isVertical = height > width;

    line.classList.toggle("is-vertical", isVertical);
    line.classList.toggle("is-horizontal", !isVertical);
  }

  function prepareDesignLines() {
    const heroEl = document.querySelector(".artboard .hero");

    // Track per-section stagger counters so each section's lines start from 0
    const sectionCounters = new Map();
    let heroIdx = 0;

    designLines.forEach((line) => {
      line.classList.add("design-line");
      setLineDirection(line);

      if (heroEl && heroEl.contains(line)) {
        // Hero lines: tight stagger, ordered by DOM position
        line.style.setProperty("--line-delay", `${heroIdx * 55}ms`);
        line.dataset.heroLine = "1";
        heroIdx++;
      } else {
        // Non-hero lines: stagger resets to 0 within each parent section / footer
        const sectionKey = line.closest("section, footer") ?? "root";
        const idx = sectionCounters.get(sectionKey) ?? 0;
        line.style.setProperty("--line-delay", `${idx * 75}ms`);
        sectionCounters.set(sectionKey, idx + 1);
      }
    });
  }

  function revealHeroLines() {
    const heroLines = designLines.filter((l) => l.dataset.heroLine === "1");

    // Double rAF: let the browser paint the initial hidden state before triggering transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroLines.forEach((l) => l.classList.add("is-line-visible"));
      });
    });
  }

  function revealScrollLines() {
    const scrollLines = designLines.filter((l) => l.dataset.heroLine !== "1");
    const animatedItems = [...scrollLines, ...lineSections];

    if (!("IntersectionObserver" in window)) {
      animatedItems.forEach((item) => item.classList.add("is-line-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-line-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.08,
      },
    );

    animatedItems.forEach((item) => observer.observe(item));
  }

  function prepareHeroDots() {
    const dots = Array.from(document.querySelectorAll(".slide-dots button"));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        dots.forEach((item) => {
          const isActive = item === dot;

          item.classList.toggle("active", isActive);
          item.setAttribute("aria-current", String(isActive));
        });
      });
    });
  }

  updateScale();
  prepareDesignLines();
  prepareHeroDots();
  revealHeroLines();
  revealScrollLines();

  window.addEventListener("resize", updateScale, { passive: true });
  window.addEventListener("resize", () => designLines.forEach(setLineDirection), { passive: true });
})();
