(function () {
  const root = document.documentElement;
  const desktopShell = document.querySelector(".desktop-shell");
  const mobilePage = document.querySelector(".mobile-page");
  const designLines = Array.from(document.querySelectorAll(".artboard .line, .artboard .grid-line, .artboard .section-line, .artboard .footer-line"));
  const lineSections = Array.from(document.querySelectorAll(".project, .about"));
  const desktopMin = 1025;
  const designWidth = 1440;
  const maxDesktopWidth = 2200;
  // The 1440px artboard centers its content within ~180px side margins. Allowing the
  // scaled artboard to run this many px past the viewport (cropping only those decorative
  // outer margins, split across both sides) keeps body text readable on smaller laptops
  // instead of shrinking the whole design down to fit the full 1440px width.
  const widthCropAllowance = 260;
  // Allow the design to scale ABOVE 1 on roomy viewports so the (natively small) text
  // grows to a comfortable reading size. Capped so it never becomes oversized.
  const maxScale = 1.32;

  function getDesignHeroHeight() {
    const headerOffset = parseFloat(getComputedStyle(root).getPropertyValue("--header-offset")) || 15;
    // Keep in sync with --hero-panel-bottom in styles.css.
    return headerOffset + 448 + 223;
  }

  function updateScale() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isDesktop = width >= desktopMin;
    const layoutWidth = Math.min(width, maxDesktopWidth);
    let scale = 1;

    if (isDesktop) {
      const scaleByWidth = (layoutWidth + widthCropAllowance) / designWidth;
      const viewportMargin = 24;
      const scaleByHeight = (height - viewportMargin) / getDesignHeroHeight();
      scale = Math.min(scaleByWidth, scaleByHeight, maxScale);
      scale = Math.min(Math.max(scale, 0.5), maxScale);
    }

    const next = scale.toFixed(5);
    if (root.style.getPropertyValue("--scale") !== next) {
      root.style.setProperty("--scale", next);
    }
    root.classList.add("is-layout-ready");
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
    const scrollLines = designLines.filter(
      (l) => l.dataset.heroLine !== "1" && !l.closest(".responsibility"),
    );
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

  const responsibilitySection = document.querySelector(".artboard .responsibility");
  const mobileResponsibilitySection = document.querySelector(".mobile-responsibility");
  const responsibilityLines = designLines.filter(
    (line) => line.dataset.heroLine !== "1" && line.closest(".responsibility"),
  );
  let desktopResponsibilityRevealed = false;
  let mobileResponsibilityRevealed = false;

  function revealDesktopResponsibility() {
    if (!responsibilitySection || desktopResponsibilityRevealed) {
      return;
    }

    desktopResponsibilityRevealed = true;
    responsibilitySection.classList.add("is-section-visible");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        responsibilityLines.forEach((line) => line.classList.add("is-line-visible"));
      });
    });
  }

  function revealMobileResponsibility() {
    if (!mobileResponsibilitySection || mobileResponsibilityRevealed) {
      return;
    }

    mobileResponsibilityRevealed = true;
    mobileResponsibilitySection.classList.add("is-section-visible");
  }

  function initResponsibilityScrollReveal() {
    const sections = [
      { el: responsibilitySection, reveal: revealDesktopResponsibility },
      { el: mobileResponsibilitySection, reveal: revealMobileResponsibility },
    ].filter(({ el }) => el);

    if (!sections.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      sections.forEach(({ reveal }) => reveal());
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const match = sections.find(({ el }) => el === entry.target);
          match?.reveal();
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.05,
      },
    );

    sections.forEach(({ el }) => observer.observe(el));
  }

  function initMidpageScrollReveal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [
      document.querySelector(".artboard .services"),
      document.querySelector(".artboard .project"),
      document.querySelector(".artboard .about"),
      document.querySelector(".mobile-services"),
      document.querySelector(".mobile-project"),
      document.querySelector(".mobile-about"),
    ].filter(Boolean);

    if (!targets.length) {
      return;
    }

    function reveal(el) {
      el.classList.add("is-section-visible");
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08,
      },
    );

    targets.forEach((el) => observer.observe(el));
  }

  const bodyDataset = document.body?.dataset ?? {};
  const hasHeroVideoOverride = Object.prototype.hasOwnProperty.call(bodyDataset, "heroVideo");
  const heroSlide = {
    src: bodyDataset.heroImage || "assets/hero-section-bg.jpg",
    video: hasHeroVideoOverride
      ? bodyDataset.heroVideo
      : "assets/hero-seibert.mp4",
    name: bodyDataset.heroName || "Chata Seibert",
  };

  const referenceProjects = [
    {
      title: "Chata Seibert",
      type: "Rekreační stavba",
      description: "Kompletní rekonstrukce horské chaty v Krkonoších.",
      location: "Krkonoše",
      timeline: "2024 – 2025",
      status: null,
      detailHref: "projekty.html#ref-1",
      leftImg: "pexels-ivan-s-4458205 (1).jpg",
      rightImg: "assets/hero 2.png",
      rightAlt: "Chata Seibert — pohled na realizaci",
    },
    {
      title: "Vraňany Farma Hanč",
      type: "Zemědělský areál",
      description: "Výstavba provozních objektů a zázemí farmy.",
      location: "Vraňany",
      timeline: "2023 – 2024",
      status: null,
      detailHref: "projekty.html#ref-2",
      leftImg: "assets/sluzby-generalni-dodavka.png",
      rightImg: "assets/hero 1.png",
      rightAlt: "Vraňany Farma Hanč — pohled na areál",
    },
    {
      title: "Rodinný dům Roztoky",
      type: "Novostavba RD",
      description: "Novostavba rodinného domu na klíč.",
      location: "Roztoky",
      timeline: "2025 – 2026",
      status: "Probíhá",
      detailHref: "projekty.html#ref-3",
      leftImg: "pexels-thirdman-8482551 1.png",
      rightImg: "assets/hero 3.png",
      rightAlt: "Rodinný dům Roztoky — vizualizace novostavby",
    },
    {
      title: "Novo Plaza",
      type: "Komerční development",
      description: "Komerční objekt v rámci developerského projektu.",
      location: "Praha",
      timeline: "2025 – 2026",
      status: "Probíhá",
      detailHref: "projekty.html#ref-4",
      leftImg: "assets/sluzby-pozemni-stavby.png",
      rightImg: "assets/image 7.png",
      rightAlt: "Novo Plaza — komerční objekt",
    },
  ];

  const heroChoreoStages = [
    { name: "lines", at: 0 },
    { name: "header", at: 0.06 },
    { name: "label", at: 0.22 },
    { name: "copy", at: 0.34 },
    { name: "copy-detail", at: 0.5 },
    { name: "emphasis", at: 0.8 },
    { name: "settled", at: 0.96 },
  ];

  function applyHeroChoreoStage(section, stageName) {
    const className = `hero-stage-${stageName}`;

    if (section.classList.contains(className)) {
      return;
    }

    section.classList.add(className);
  }

  function syncHeroChoreo(section, currentTime, duration) {
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const progress = Math.min(currentTime / duration, 1);

    section.style.setProperty("--hero-t", currentTime.toFixed(3));
    section.style.setProperty("--hero-progress", progress.toFixed(4));

    heroChoreoStages.forEach(({ name, at }) => {
      if (progress >= at) {
        applyHeroChoreoStage(section, name);
      }
    });
  }

  function primeHeroChoreo(section, duration) {
    section.classList.add("hero-is-choreo");

    if (Number.isFinite(duration) && duration > 0) {
      section.style.setProperty("--hero-duration", `${duration.toFixed(3)}s`);
    }
  }

  function finishHeroChoreo(section, duration) {
    section.classList.add("hero-is-settled");
    syncHeroChoreo(section, duration, duration);
  }

  function nextPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }

  function whenWindowLoaded() {
    if (document.readyState === "complete") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener("load", resolve, { once: true });
    });
  }

  function whenFontsReady() {
    if (document.fonts?.ready) {
      return document.fonts.ready.catch(() => {});
    }

    return Promise.resolve();
  }

  function whenImageReady(img) {
    if (!img) {
      return Promise.resolve();
    }

    if (img.complete && img.naturalWidth > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }

  function whenVideoCanPlay(video, timeoutMs = 5000) {
    return new Promise((resolve) => {
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        resolve(true);
        return;
      }

      let done = false;
      const finish = (ok) => {
        if (done) {
          return;
        }
        done = true;
        window.clearTimeout(timer);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
        resolve(ok);
      };

      const onReady = () => finish(true);
      const onError = () => finish(false);
      const timer = window.setTimeout(() => finish(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA), timeoutMs);

      video.addEventListener("canplay", onReady);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", onError);
    });
  }

  function whenVideoBuffered(video, timeoutMs = 10000) {
    return whenVideoCanPlay(video, timeoutMs);
  }

  function initHeroVideo(onHeroLinesReady) {
    const heroPairs = [
      {
        section: document.querySelector(".hero"),
        video: document.querySelector(".hero-bg-video"),
        still: document.querySelector(".hero-bg-still"),
      },
      {
        section: document.querySelector(".mobile-hero"),
        video: document.querySelector(".mobile-hero-video"),
        still: document.querySelector(".mobile-hero-still"),
      },
    ].filter(({ section, video, still }) => section && video && still);

    const skipHeroChoreo = (() => {
      try {
        const nav = performance.getEntriesByType("navigation")[0];
        return Boolean(nav && nav.type === "reload");
      } catch (e) {
        return false;
      }
    })();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blendCrossfadeMs = 720;
    const blendLeadSeconds = blendCrossfadeMs / 1000;
    let heroLinesStarted = false;

    function getPlaybackDuration(duration) {
      if (!Number.isFinite(duration) || duration <= blendLeadSeconds) {
        return 5.085 - blendLeadSeconds;
      }

      return duration - blendLeadSeconds;
    }

    function shouldSettleAtTime(currentTime, duration) {
      return currentTime >= getPlaybackDuration(duration);
    }

    if (!heroPairs.length) {
      return;
    }

    function startHeroLines() {
      if (heroLinesStarted || prefersReducedMotion) {
        return;
      }

      heroLinesStarted = true;
      onHeroLinesReady?.();
    }

    function settleOnStill(video, still, section, stopChoreoLoop) {
      const duration = Number.isFinite(video.duration) ? video.duration : 5.085;

      stopChoreoLoop?.();
      section.style.setProperty("--hero-blend-ms", `${blendCrossfadeMs}ms`);

      requestAnimationFrame(() => {
        section.classList.add("hero-is-blending");
        still.classList.add("is-settled");
        video.classList.add("is-blending-out");
        finishHeroChoreo(section, duration);
      });

      window.setTimeout(() => {
        if (!video.paused) {
          video.pause();
        }

        section.classList.remove("hero-is-blending");
      }, blendCrossfadeMs);
    }

    function markHeroReady(section, video) {
      section.classList.add("hero-is-ready");
      video.classList.add("is-active");

      if (Number.isFinite(video.duration)) {
        section.style.setProperty("--hero-duration", `${getPlaybackDuration(video.duration).toFixed(3)}s`);
      }
    }

    async function waitForHeroAssets() {
      // Hard reloads render the settled hero from CSS via html.hero-precommit
      // (set synchronously before first paint). Page-to-page navigations play.
      if (skipHeroChoreo) {
        return;
      }

      // Paint the still as soon as possible — do not wait for window load or video.
      await Promise.all([
        whenFontsReady(),
        ...heroPairs.map(({ still }) => whenImageReady(still)),
      ]);

      await nextPaint();
    }

    function attachHeroVideoSource(video) {
      if (video.getAttribute("src")) {
        return true;
      }

      const src = video.dataset.src || "";
      if (!src) {
        return false;
      }

      video.src = src;
      video.load();
      return true;
    }

    function setupHeroPlayback({ section, video, still }) {
      const isDesktopHero = section.classList.contains("hero");
      const wantsVideo =
        isDesktopHero &&
        !prefersReducedMotion &&
        Boolean(video.dataset.src || video.getAttribute("src"));

      if (!wantsVideo) {
        return function startStaticHero() {
          still.classList.add("is-active", "is-settled");
          section.classList.add("hero-is-settled");
          heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
          startHeroLines();
        };
      }

      let settled = false;
      let choreoPrimed = false;
      let choreoLoopId = 0;

      const stopChoreoLoop = () => {
        if (choreoLoopId) {
          cancelAnimationFrame(choreoLoopId);
          choreoLoopId = 0;
        }
      };

      function runTimedChoreoFallback() {
        if (settled || choreoPrimed) {
          return;
        }

        const duration = Number.isFinite(video.duration) ? video.duration : 5.085;
        let startedAt = null;

        void beginChoreo();

        const tick = (timestamp) => {
          if (settled) {
            return;
          }

          if (startedAt === null) {
            startedAt = timestamp;
          }

          const elapsed = (timestamp - startedAt) / 1000;

          syncHeroChoreo(section, elapsed, duration);

          if (shouldSettleAtTime(elapsed, duration)) {
            trySettle();
            return;
          }

          choreoLoopId = requestAnimationFrame(tick);
        };

        choreoLoopId = requestAnimationFrame(tick);
      }

      async function beginChoreo() {
        if (choreoPrimed || settled) {
          return;
        }

        choreoPrimed = true;
        const duration = Number.isFinite(video.duration) ? video.duration : 5.085;

        await nextPaint();

        primeHeroChoreo(section, duration);
        applyHeroChoreoStage(section, "lines");
        startHeroLines();
      }

      function startChoreoLoop() {
        stopChoreoLoop();

        const tick = () => {
          if (settled || video.paused || video.ended) {
            return;
          }

          if (!Number.isFinite(video.duration)) {
            choreoLoopId = requestAnimationFrame(tick);
            return;
          }

          syncHeroChoreo(section, video.currentTime, video.duration);

          if (shouldSettleAtTime(video.currentTime, video.duration)) {
            trySettle();
            return;
          }

          choreoLoopId = requestAnimationFrame(tick);
        };

        choreoLoopId = requestAnimationFrame(tick);
      }

      function trySettle() {
        if (settled) {
          return;
        }

        settled = true;
        settleOnStill(video, still, section, stopChoreoLoop);
      }

      video.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(video.duration)) {
          section.style.setProperty("--hero-duration", `${getPlaybackDuration(video.duration).toFixed(3)}s`);
        }
      });

      video.addEventListener(
        "playing",
        () => {
          still.classList.remove("is-active");
          void beginChoreo().then(startChoreoLoop);
        },
        { once: true },
      );

      video.addEventListener("ended", trySettle);

      return async function startPlayback() {
        // Keep the compressed still visible until the video actually plays.
        still.classList.add("is-active");
        attachHeroVideoSource(video);

        const ready = await whenVideoCanPlay(video, 4500);
        if (!ready) {
          still.classList.add("is-settled");
          section.classList.add("hero-is-settled");
          heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
          startHeroLines();
          return;
        }

        video.pause();
        try {
          video.currentTime = 0;
        } catch (e) {
          /* ignore seek errors on early media */
        }

        await nextPaint();

        markHeroReady(section, video);

        const playPromise = video.play();

        if (playPromise?.catch) {
          await playPromise.catch(() => {
            still.classList.add("is-active");
            runTimedChoreoFallback();
          });
        }
      };
    }

    const starters = skipHeroChoreo ? [] : heroPairs.map((pair) => setupHeroPlayback(pair));

    void waitForHeroAssets().then(async () => {
      heroPairs.forEach(({ section, video, still }, index) => {
        if (skipHeroChoreo) {
          markHeroReady(section, video);
          still.classList.add("is-active", "is-settled");
          section.classList.add("hero-is-settled");
          heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
          return;
        }

        // Reveal UI immediately on the still; video starts when buffered enough.
        section.classList.add("hero-is-ready");
        still.classList.add("is-active");
        void starters[index]?.();
      });

      if (skipHeroChoreo) {
        onHeroLinesReady?.();
      }
    });
  }

  function prepareHeroDots() {
    const heroVideo = document.querySelector(".hero-bg-video");
    const heroStill = document.querySelector(".hero-bg-still");
    const slideLabel = document.querySelector(".slide-label");
    const mobileVideo = document.querySelector(".mobile-hero-video");
    const mobileStill = document.querySelector(".mobile-hero-still");
    let pendingReferenceIndex = null;

    // Mobile stays still-only for load speed. Desktop video is attached lazily.
    if (mobileVideo) {
      mobileVideo.removeAttribute("src");
      delete mobileVideo.dataset.src;
      mobileVideo.poster = heroSlide.src;
      mobileVideo.load();
    }

    if (mobileStill) {
      mobileStill.src = heroSlide.src;
    }

    if (heroVideo) {
      heroVideo.removeAttribute("src");
      if (heroSlide.video) {
        heroVideo.dataset.src = heroSlide.video;
      } else {
        delete heroVideo.dataset.src;
      }
      heroVideo.poster = heroSlide.src;
      heroVideo.preload = "none";
      heroVideo.setAttribute("aria-label", heroSlide.name);
    }

    if (heroStill) {
      heroStill.src = heroSlide.src;
      heroStill.alt = heroSlide.name;
    }

    if (slideLabel) {
      slideLabel.textContent = heroSlide.name;
    }

    return {
      getActiveIndex: () => 0,
      queueReferenceIndex: (index) => {
        pendingReferenceIndex = index;
      },
      consumeReferenceIndex: () => {
        const index = pendingReferenceIndex;
        pendingReferenceIndex = null;
        return index;
      },
    };
  }

  function prepareReferenceCarousel(heroApi) {
    const projectSection = document.querySelector(".project");
    const mobileProjectSection = document.querySelector(".mobile-project");
    const leftImg = document.querySelector(".project-left-img");
    const rightImg = document.querySelector(".project-right-img");
    const projectCopy = document.querySelector(".project-copy");
    const projectTitle = document.querySelector("#project-title");
    const projectDesc = document.querySelector(".project-desc");
    const projectStatType = document.querySelector(".project-stat-type");
    const projectStatLocation = document.querySelector(".project-stat-location");
    const projectMore = document.querySelector(".project-more");
    const mobileTitle = document.querySelector("#mobile-project-title");
    const mobileDesc = document.querySelector(".mobile-project-desc");
    const mobileStatType = document.querySelector(".mobile-project-stat-type");
    const mobileStatLocation = document.querySelector(".mobile-project-stat-location");
    const mobileMore = document.querySelector(".mobile-project-more");
    const mobileProjectPhoto = document.querySelector(".mobile-project-photo");
    const referenceLinks = Array.from(document.querySelectorAll('a[href="#projekty"], a[href="#projekty-mobile"]'));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let isUpdating = false;

    function buildTitle(project) {
      if (!project.status) {
        return project.title;
      }

      return `${project.title} <span class="project-status">${project.status}</span>`;
    }

    function applyProjectContent(project, index) {
      activeIndex = index;

      if (projectTitle) {
        projectTitle.innerHTML = buildTitle(project);
      }

      if (projectDesc) {
        projectDesc.textContent = project.description;
      }

      if (projectStatType) {
        projectStatType.textContent = project.type;
      }

      if (projectStatLocation) {
        projectStatLocation.textContent = project.location;
      }

      if (projectMore && project.detailHref) {
        projectMore.setAttribute("href", project.detailHref);
      }

      if (mobileTitle) {
        mobileTitle.innerHTML = buildTitle(project);
      }

      if (mobileDesc) {
        mobileDesc.textContent = project.description;
      }

      if (mobileStatType) {
        mobileStatType.textContent = project.type;
      }

      if (mobileStatLocation) {
        mobileStatLocation.textContent = project.location;
      }

      if (mobileMore && project.detailHref) {
        mobileMore.setAttribute("href", project.detailHref);
      }

      if (mobileProjectPhoto) {
        mobileProjectPhoto.src = project.rightImg;
        mobileProjectPhoto.alt = project.rightAlt || "";
      }
    }

    function swapImages(project, animate) {
      if (!leftImg || !rightImg) {
        return Promise.resolve();
      }

      if (!animate) {
        leftImg.src = project.leftImg;
        rightImg.src = project.rightImg;
        rightImg.alt = project.rightAlt;
        return Promise.resolve();
      }

      leftImg.classList.add("is-fading");
      rightImg.classList.add("is-fading");

      return new Promise((resolve) => {
        const preloadLeft = new Image();
        const preloadRight = new Image();
        let leftLoaded = false;
        let rightLoaded = false;

        function finishIfReady() {
          if (!leftLoaded || !rightLoaded) {
            return;
          }

          leftImg.src = project.leftImg;
          rightImg.src = project.rightImg;
          rightImg.alt = project.rightAlt;
          leftImg.classList.remove("is-fading");
          rightImg.classList.remove("is-fading");
          resolve();
        }

        preloadLeft.onload = () => {
          leftLoaded = true;
          finishIfReady();
        };

        preloadRight.onload = () => {
          rightLoaded = true;
          finishIfReady();
        };

        preloadLeft.src = project.leftImg;
        preloadRight.src = project.rightImg;
      });
    }

    function showReference(index, options = {}) {
      const project = referenceProjects[index];

      if (!project || index === activeIndex || isUpdating) {
        return;
      }

      isUpdating = true;
      projectCopy?.classList.add("is-updating");
      mobileProjectSection?.classList.add("is-updating");

      const animate = !prefersReducedMotion && options.animate !== false;

      swapImages(project, animate).then(() => {
        applyProjectContent(project, index);
        projectCopy?.classList.remove("is-updating");
        mobileProjectSection?.classList.remove("is-updating");
        isUpdating = false;
      });
    }

    referenceLinks.forEach((link) => {
      link.addEventListener("click", () => {
        heroApi?.queueReferenceIndex(heroApi.getActiveIndex());
      });
    });

    if ("IntersectionObserver" in window && projectSection) {
      const referenceObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const queuedIndex = heroApi?.consumeReferenceIndex();

            if (typeof queuedIndex === "number" && queuedIndex !== activeIndex) {
              showReference(queuedIndex, { animate: false });
            }
          });
        },
        {
          threshold: 0.2,
        },
      );

      referenceObserver.observe(projectSection);
    }

    referenceProjects.forEach(({ leftImg: leftSrc, rightImg: rightSrc }) => {
      [leftSrc, rightSrc].forEach((src) => {
        const preload = new Image();
        preload.src = src;
      });
    });

    applyProjectContent(referenceProjects[0], 0);
  }

  function prepareNavState() {
    const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
    const sectionMap = new Map(
      navLinks
        .map((link) => [link.hash.slice(1), link])
        .filter(([id]) => Boolean(id)),
    );
    const sections = Array.from(sectionMap.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function setActiveNav(id) {
      navLinks.forEach((link) => {
        const isActive = link.hash === `#${id}`;

        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setActiveNav(link.hash.slice(1)));
    });

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveNav(visible.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.02, 0.15, 0.32],
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Desktop: fixed scroll nav appears once the page header leaves the viewport
  function initScrollNavShell() {
    const scrollNavConfigs = [
      { shell: ".home-scroll-nav", trigger: ".artboard .header" },
      { shell: ".subpage-scroll-nav", trigger: ".subpage-header-outer" },
    ];

    scrollNavConfigs.forEach(({ shell, trigger }) => {
      const scrollNav = document.querySelector(shell);
      const triggerEl = document.querySelector(trigger);

      if (!scrollNav || !triggerEl) {
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          const show = !entry.isIntersecting;

          scrollNav.classList.toggle("is-visible", show);
          scrollNav.setAttribute("aria-hidden", String(!show));
        },
        { threshold: 0.05 },
      );

      observer.observe(triggerEl);
    });
  }

  function initInquiryHashScroll() {
    const target = document.getElementById("poptavka-form");
    if (!target) {
      return;
    }

    const scrollToForm = (behavior = "smooth") => {
      target.scrollIntoView({ behavior, block: "start" });
    };

    const focusForm = () => {
      const delay = document.documentElement.classList.contains("hero-precommit") ? 0 : 180;
      window.setTimeout(() => scrollToForm(delay ? "smooth" : "auto"), delay);
    };

    if (window.location.hash === "#poptavka-form") {
      focusForm();
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#poptavka-form") {
        scrollToForm("smooth");
      }
    });

    document.querySelectorAll('a[href="#poptavka-form"], a[href*="#poptavka-form"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href") || "";
        const isSamePage =
          href === "#poptavka-form" ||
          (href.endsWith("#poptavka-form") && link.pathname === window.location.pathname);

        if (isSamePage) {
          event.preventDefault();
          history.pushState(null, "", "#poptavka-form");
          scrollToForm("smooth");
        }
      });
    });
  }

  function initServicePrefill() {
    const select = document.getElementById("service");
    if (!select) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (!service) {
      return;
    }

    const option = Array.from(select.options).find((item) => item.value === service);
    if (option) {
      select.value = service;
    }
  }

  function initLightbox() {
    const galleries = Array.from(document.querySelectorAll("[data-lightbox]"));
    const lightbox = document.getElementById("lightbox");

    if (!galleries.length || !lightbox) {
      return;
    }

    const imgEl = lightbox.querySelector(".lightbox-img");
    const captionEl = lightbox.querySelector(".lightbox-caption");
    const counterEl = lightbox.querySelector(".lightbox-counter");
    const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
    const nextBtn = lightbox.querySelector("[data-lightbox-next]");
    const closeEls = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));

    let currentShots = [];
    let currentIndex = 0;
    let lastFocused = null;

    function render() {
      const shot = currentShots[currentIndex];

      if (!shot) {
        return;
      }

      const full = shot.dataset.full || shot.querySelector("img")?.getAttribute("src") || "";
      const label = shot.querySelector("img")?.getAttribute("alt") || "";

      imgEl.setAttribute("src", full);
      imgEl.setAttribute("alt", label);
      captionEl.textContent = label;
      counterEl.textContent = `${currentIndex + 1} / ${currentShots.length}`;

      const multiple = currentShots.length > 1;
      prevBtn.hidden = !multiple;
      nextBtn.hidden = !multiple;
    }

    function step(delta) {
      if (!currentShots.length) {
        return;
      }

      currentIndex = (currentIndex + delta + currentShots.length) % currentShots.length;
      render();
    }

    function open(shots, index) {
      currentShots = shots;
      currentIndex = index;
      lastFocused = document.activeElement;
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      nextBtn.focus({ preventScroll: true });
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      imgEl.setAttribute("src", "");

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus({ preventScroll: true });
      }
    }

    galleries.forEach((gallery) => {
      const shots = Array.from(gallery.querySelectorAll(".ref-shot"));

      shots.forEach((shot, index) => {
        shot.addEventListener("click", () => open(shots, index));
      });
    });

    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    closeEls.forEach((el) => el.addEventListener("click", close));

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        step(-1);
      } else if (event.key === "ArrowRight") {
        step(1);
      }
    });
  }

  updateScale();
  prepareDesignLines();
  const heroApi = prepareHeroDots();
  initHeroVideo(revealHeroLines);
  prepareReferenceCarousel(heroApi);
  prepareNavState();
  revealScrollLines();
  initResponsibilityScrollReveal();
  initMidpageScrollReveal();
  initScrollNavShell();
  initLightbox();
  initInquiryHashScroll();
  initServicePrefill();

  window.addEventListener("resize", updateScale, { passive: true });
  window.addEventListener("resize", () => designLines.forEach(setLineDirection), { passive: true });
})();
