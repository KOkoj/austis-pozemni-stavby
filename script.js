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
  // Global ease-back so 100% browser zoom matches the preferred ~90% look.
  const comfortScale = 0.9;

  function updateScale() {
    const width = window.innerWidth;
    const isDesktop = width >= desktopMin;
    const layoutWidth = Math.min(width, maxDesktopWidth);
    let scale = 1;

    if (isDesktop) {
      const scaleByWidth = (layoutWidth + widthCropAllowance) / designWidth;
      scale = Math.min(scaleByWidth, maxScale) * comfortScale;
      scale = Math.min(Math.max(scale, 0.5), maxScale);
    }

    const next = scale.toFixed(5);
    if (root.style.getPropertyValue("--scale") !== next) {
      root.style.setProperty("--scale", next);
    }
    root.classList.add("is-layout-ready");
    desktopShell?.setAttribute("aria-hidden", String(!isDesktop));
    mobilePage?.setAttribute("aria-hidden", String(isDesktop));
    desktopShell?.toggleAttribute("inert", !isDesktop);
    mobilePage?.toggleAttribute("inert", isDesktop);
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

    sections.forEach(({ reveal }) => reveal());
  }

  function initMidpageScrollReveal() {
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

    targets.forEach(reveal);
  }

  const bodyDataset = document.body?.dataset ?? {};
  const heroSlide = {
    src: bodyDataset.heroImage || "assets/photos/agrotechnology-park-liberec-4.webp",
    video: "",
    name: bodyDataset.heroName || "AUSTIS Pozemní stavby",
  };

  const referenceProjects = [
    {
      title: "Chata Seibert",
      type: "Rekreační stavba",
      description: "Rekonstrukce horské chaty v Krkonoších.",
      location: "Krkonoše",
      timeline: "2024 – 2025",
      status: null,
      detailHref: "projekty.html#seibert",
      leftImg: "assets/photos/seibertovy-vyhledy-2.webp",
      rightImg: "assets/photos/seibertovy-vyhledy-2.webp",
      rightAlt: "Chata Seibert",
    },
    {
      title: "Vraňany Farma Hanč",
      type: "Zemědělský areál",
      description: "Výstavba provozních objektů a zázemí farmy.",
      location: "Vraňany",
      timeline: "2023 – 2024",
      status: null,
      detailHref: "projekty.html#vranany",
      leftImg: "assets/photos/jahodarna-vranany-2.webp",
      rightImg: "assets/photos/jahodarna-vranany-2.webp",
      rightAlt: "Vraňany Farma Hanč",
    },
    {
      title: "Rodinný dům Roztoky",
      type: "Novostavba RD",
      description: "Novostavba rodinného domu na klíč.",
      location: "Roztoky",
      timeline: "2025 – 2026",
      status: "Probíhá",
      detailHref: "projekty.html#roztoky",
      leftImg: "assets/photos/rd-roztoky-1.webp",
      rightImg: "assets/photos/rd-roztoky-1.webp",
      rightAlt: "Rodinný dům Roztoky",
    },
    {
      title: "Novo Plaza",
      type: "Komerční development",
      description: "Komerční objekt v rámci developerského projektu.",
      location: "Praha",
      timeline: "2025 – 2026",
      status: "Probíhá",
      detailHref: "projekty.html#novodvorska",
      leftImg: "assets/photos/oc-novodvorska-1.webp",
      rightImg: "assets/photos/oc-novodvorska-1.webp",
      rightAlt: "OC Novodvorská Plaza",
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

    const skipHeroChoreo = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const staticChoreoDuration = 2.35;
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

      // Paint the still as soon as possible; do not wait for window load or video.
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
          const settleStatic = () => {
            still.classList.add("is-active", "is-settled");
            section.classList.add("hero-is-settled");
            heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
            startHeroLines();
          };

          if (prefersReducedMotion || skipHeroChoreo) {
            settleStatic();
            return;
          }

          const duration = staticChoreoDuration;
          still.classList.add("is-active");
          primeHeroChoreo(section, duration);

          let startedAt = null;
          const tick = (timestamp) => {
            if (startedAt === null) {
              startedAt = timestamp;
            }

            const elapsed = (timestamp - startedAt) / 1000;
            syncHeroChoreo(section, elapsed, duration);

            if (elapsed >= duration * 0.12) {
              startHeroLines();
            }

            if (elapsed >= duration) {
              still.classList.add("is-settled");
              finishHeroChoreo(section, duration);
              return;
            }

            requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
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
    if (!projectSection && !document.querySelector(".mobile-project")) {
      return;
    }
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
    const mq = window.matchMedia("(max-width: 1024px)");
    const observers = [];
    let resizeTimer = 0;

    const applyVisibility = (scrollNav, show) => {
      scrollNav.classList.toggle("is-visible", show);
      scrollNav.setAttribute("aria-hidden", String(!show));
      if (!show) {
        scrollNav.classList.remove("is-menu-open");
      }
    };

    const shouldShowScrollNav = (triggerEl, delayPx) => {
      if (window.scrollY <= 1) {
        return false;
      }

      const style = window.getComputedStyle(triggerEl);
      if (style.display === "none") {
        return false;
      }

      const rect = triggerEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return false;
      }

      return rect.bottom <= -delayPx;
    };

    const bind = () => {
      observers.splice(0).forEach((observer) => observer.disconnect());

      const isMobile = mq.matches;
      const delayPx = isMobile ? 12 : Math.round(window.innerHeight * 0.45);
      const scrollNavConfigs = isMobile
        ? [
            { shell: ".home-scroll-nav", trigger: ".mobile-header" },
            { shell: ".subpage-scroll-nav", trigger: ".mobile-header" },
          ]
        : [
            { shell: ".home-scroll-nav", trigger: ".artboard .header" },
            { shell: ".subpage-scroll-nav", trigger: ".subpage-header-outer" },
          ];

      document.querySelectorAll(".scroll-nav-shell").forEach((shell) => {
        applyVisibility(shell, false);
      });

      scrollNavConfigs.forEach(({ shell, trigger }) => {
        const scrollNav = document.querySelector(shell);
        const triggerEl = document.querySelector(trigger);

        if (!scrollNav || !triggerEl) {
          return;
        }

        applyVisibility(scrollNav, shouldShowScrollNav(triggerEl, delayPx));

        const observer = new IntersectionObserver(
          () => {
            applyVisibility(scrollNav, shouldShowScrollNav(triggerEl, delayPx));
          },
          {
            threshold: 0,
            rootMargin: `${delayPx}px 0px 0px 0px`,
          },
        );

        observer.observe(triggerEl);
        observers.push(observer);
      });
    };

    bind();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", bind);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(bind);
    }

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(bind, 80);
      },
      { passive: true },
    );
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
    const select = document.getElementById("typ-realizace") || document.getElementById("service");
    if (!select) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requested = params.get("typ") || params.get("service");
    if (!requested) {
      return;
    }

    const mapped = {
      "generalni-dodavka": "",
      "pozemni-stavby": "novostavba",
      rekonstrukce: "rekonstrukce",
      novostavba: "novostavba",
    };
    const value = Object.prototype.hasOwnProperty.call(mapped, requested) ? mapped[requested] : requested;
    if (!value) {
      return;
    }

    const option = Array.from(select.options).find((item) => item.value === value);
    if (option) {
      select.value = value;
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
    let touchStartX = 0;

    function parseGallery(el) {
      const raw = el.getAttribute("data-gallery");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            return parsed.map((shot) => ({
              src: shot.src || shot.full || "",
              alt: shot.alt || "",
              w: Number(shot.w) || 0,
              h: Number(shot.h) || 0,
            }));
          }
        } catch (error) {
          /* fall through to DOM shots */
        }
      }

      return Array.from(el.querySelectorAll(".ref-shot")).map((shot) => {
        const img = shot.querySelector("img");
        return {
          src: shot.dataset.full || img?.getAttribute("src") || "",
          alt: img?.getAttribute("alt") || "",
          w: Number(shot.dataset.w || img?.getAttribute("width")) || 0,
          h: Number(shot.dataset.h || img?.getAttribute("height")) || 0,
        };
      }).filter((shot) => shot.src);
    }

    function render() {
      const shot = currentShots[currentIndex];

      if (!shot) {
        return;
      }

      imgEl.setAttribute("src", shot.src);
      imgEl.setAttribute("alt", shot.alt);
      captionEl.textContent = shot.alt;
      counterEl.textContent = `${currentIndex + 1} / ${currentShots.length}`;
      imgEl.style.setProperty("--native-w", shot.w ? `${shot.w}px` : "100%");
      imgEl.style.setProperty("--native-h", shot.h ? `${shot.h}px` : "calc(100vh - 168px)");

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
      document.body.appendChild(lightbox);
      document.body.classList.add("lightbox-open");
      document.documentElement.classList.add("lightbox-open");
      syncPageScrollLock();

      if (typeof lightbox.showModal === "function") {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.classList.add("is-open");
      }

      const focusTarget = currentShots.length > 1 ? nextBtn : lightbox.querySelector(".lightbox-close");
      focusTarget.focus({ preventScroll: true });
    }

    function finishClose() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      document.documentElement.classList.remove("lightbox-open");
      syncPageScrollLock();
      imgEl.removeAttribute("src");

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus({ preventScroll: true });
      }

      lastFocused = null;
    }

    function requestClose() {
      if (lightbox.open) {
        lightbox.close();
        return;
      }

      finishClose();
    }

    galleries.forEach((gallery) => {
      const shots = parseGallery(gallery);
      if (!shots.length) {
        return;
      }

      const opener = () => open(shots, 0);
      gallery.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          return;
        }
        opener();
      });
      gallery.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          opener();
        }
      });
    });

    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));
    closeEls.forEach((el) => el.addEventListener("click", requestClose));
    lightbox.addEventListener("close", finishClose);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === lightbox.querySelector(".lightbox-backdrop")) {
        requestClose();
      }
    });
    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
      const endX = event.changedTouches[0]?.clientX || 0;
      const delta = endX - touchStartX;
      if (Math.abs(delta) < 48) {
        return;
      }
      step(delta < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      const isShown = lightbox.open || lightbox.classList.contains("is-open");

      if (!isShown) {
        return;
      }

      if (event.key === "Escape") {
        requestClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        step(-1);
      } else if (event.key === "ArrowRight") {
        step(1);
      }
    });
  }


  function foldSearchText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  const siteSearchIndex = [
    { title: "Domov", hint: "Generální dodávky novostaveb a rekonstrukcí", href: "index.html", keywords: "domov domu homepage uvod novostavby rekonstrukce" },
    { title: "Služby", hint: "Generální dodávka a pozemní stavby", href: "sluzby.html", keywords: "sluzby dodavka rekonstrukce" },
    { title: "Generální dodávka", hint: "Novostavby a rekonstrukce", href: "sluzby.html#generalni-dodavka", keywords: "generalni dodavka smlouva" },
    { title: "Pozemní stavby", hint: "Novostavby a rekonstrukce", href: "sluzby.html#pozemni-stavby", keywords: "novostavba pozemni rekonstrukce" },
    { title: "Realizace", hint: "Dokončené i probíhající stavby", href: "projekty.html", keywords: "realizace reference seibert vranany liberec botanicka roztoky" },
    { title: "Vybrané realizace", hint: "Chata Seibert, Vraňany, Liberec", href: "index.html#vybrane-realizace", keywords: "vybrane realizace" },
    { title: "Chata Seibert", hint: "Pec pod Sněžkou — v realizaci", href: "projekty.html#seibert", keywords: "seibert chata pec snezka" },
    { title: "Rodinný dům Roztoky", hint: "Novostavba rodinného domu", href: "projekty.html#roztoky", keywords: "roztoky rodinny dum" },
    { title: "Retail Park Příbram", hint: "Úpravy dispozic, fasád a střech", href: "projekty.html#pribram", keywords: "pribram retail park" },
    { title: "Agrotechnology park Liberec", hint: "Haly A, B a C v Liberci – Doubí", href: "projekty.html#liberec-b", keywords: "liberec agrotechnology hala park doubí" },
    { title: "OC Novodvorská Plaza", hint: "Rekonstrukce obchodního centra", href: "projekty.html#novodvorska", keywords: "novodvorska plaza oc praha" },
    { title: "Vraňany Farma Hanč", hint: "Polyfunkční objekt s prodejnou a kavárnou", href: "projekty.html#vranany", keywords: "vranany farma hanc jahodarna" },
    { title: "Jižní vstup do Botanické zahrady", hint: "Praha 7", href: "projekty.html#botanicka", keywords: "botanicka zahrada vstup" },
    { title: "Bytový dům U Vinice", hint: "Praha 7", href: "projekty.html#vinice", keywords: "vinice bytovy dum" },
    { title: "Bytový dům Hlučkova", hint: "Praha", href: "projekty.html#hluckova", keywords: "hluckova bytovy dum" },
    { title: "O společnosti", hint: "Skupina AUSTIS", href: "o-spolecnosti.html", keywords: "spolecnost skupina austis zázemí" },
    { title: "Kariéra v AUSTIS", hint: "Otevřené pozice skupiny AUSTIS", href: "https://austis-as.vercel.app/austis-kariera", keywords: "kariera prace pozice stavbyvedouci" },
    { title: "Kontakt", hint: "zakazky@austis.cz", href: "kontakt.html", keywords: "adresa telefon email slivenec zakazky" },
    { title: "Časté otázky", hint: "Konzultace, nabídka, regiony", href: "kontakt.html#faq", keywords: "faq otazky caste" },
    { title: "Poptat spolupráci", hint: "Formulář poptávky", href: "poptavka.html#poptavka-form", keywords: "poptavka formular nabidka" },
  ].map((item) => ({ ...item, haystack: foldSearchText(`${item.title} ${item.hint} ${item.keywords}`) }));

  const searchFavorites = [
    { title: "Služby", hint: "Generální dodávka a pozemní stavby", href: "sluzby.html" },
    { title: "Realizace", hint: "Dokončené i probíhající stavby", href: "projekty.html" },
    { title: "O společnosti", hint: "Skupina AUSTIS", href: "o-spolecnosti.html" },
    { title: "Kontakt", hint: "zakazky@austis.cz", href: "kontakt.html" },
    { title: "Poptat spolupráci", hint: "Formulář poptávky", href: "poptavka.html#poptavka-form" },
  ];

  function escapeSearchHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightSearchMatch(text, needle) {
    const source = String(text || "");
    if (!needle) {
      return escapeSearchHtml(source);
    }

    const foldedNeedle = foldSearchText(needle).replace(/ /g, "");
    if (!foldedNeedle) {
      return escapeSearchHtml(source);
    }

    let folded = "";
    const map = [];
    for (let i = 0; i < source.length; i += 1) {
      const piece = source[i]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      for (let p = 0; p < piece.length; p += 1) {
        if (/[a-z0-9]/.test(piece[p])) {
          folded += piece[p];
          map.push(i);
        }
      }
    }

    const startFolded = folded.indexOf(foldedNeedle);
    if (startFolded < 0) {
      return escapeSearchHtml(source);
    }

    const start = map[startFolded];
    const end = map[startFolded + foldedNeedle.length - 1] + 1;
    return (
      escapeSearchHtml(source.slice(0, start)) +
      `<mark>${escapeSearchHtml(source.slice(start, end))}</mark>` +
      escapeSearchHtml(source.slice(end))
    );
  }

  function initSiteSearch() {
    const toggles = Array.from(document.querySelectorAll(".hero-search-toggle"));
    if (!toggles.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const closeMs = reduceMotion ? 0 : 220;

    const overlay = document.createElement("div");
    overlay.id = "site-search-overlay";
    overlay.className = "site-search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "site-search-title");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-lenis-prevent", "");
    overlay.innerHTML =
      '<div class="site-search-backdrop" data-search-close="true"></div>' +
      '<div class="site-search-panel">' +
      '<form class="site-search-form" role="search">' +
      '<h2 id="site-search-title" class="visually-hidden">Hledat na webu</h2>' +
      '<label class="site-search-field">' +
      '<span class="hero-search-ico" aria-hidden="true"></span>' +
      '<input id="site-search-input" type="search" name="q" placeholder="Hledat…" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" aria-label="Hledat na webu" aria-autocomplete="list" aria-controls="site-search-list" />' +
      "</label>" +
      '<div class="site-search-results" id="site-search-results">' +
      '<p class="site-search-kicker">Oblíbené</p>' +
      '<div class="site-search-list" id="site-search-list" role="listbox" aria-label="Výsledky hledání"></div>' +
      "</div>" +
      "</form>" +
      '<button type="button" class="site-search-close" data-search-close="true" aria-label="Zavřít hledání">' +
      '<span aria-hidden="true">&times;</span>' +
      "</button>" +
      "</div>";
    document.body.appendChild(overlay);

    const form = overlay.querySelector(".site-search-form");
    const input = overlay.querySelector("#site-search-input");
    const panel = overlay.querySelector(".site-search-results");
    const list = overlay.querySelector(".site-search-list");
    const kicker = overlay.querySelector(".site-search-kicker");
    let lastFocus = null;
    let activeIndex = -1;
    let visibleItems = [];
    let lockedScrollY = 0;
    let closeTimer = 0;
    let openFrame = 0;

    const isVisible = () => overlay.classList.contains("is-open") || overlay.classList.contains("is-closing");

    const getFocusable = () =>
      Array.from(
        overlay.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => {
        if (el.hasAttribute("hidden") || el.closest("[hidden]")) {
          return false;
        }
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

    const setExpanded = (open) => {
      toggles.forEach((btn) => btn.setAttribute("aria-expanded", open ? "true" : "false"));
    };

    const setPageInert = (inert) => {
      Array.from(document.body.children).forEach((el) => {
        if (el === overlay || el.tagName === "SCRIPT") {
          return;
        }
        if (inert) {
          el.setAttribute("inert", "");
        } else {
          el.removeAttribute("inert");
        }
      });
    };

    const resultLinks = () => Array.from(list.querySelectorAll(".hero-search-result"));

    const highlight = () => {
      const links = resultLinks();
      links.forEach((el, index) => {
        const on = index === activeIndex;
        el.classList.toggle("is-active", on);
        if (on) {
          el.id = el.id || `search-opt-${index}`;
          input.setAttribute("aria-activedescendant", el.id);
        }
      });
      if (activeIndex < 0) {
        input.removeAttribute("aria-activedescendant");
      } else {
        links[activeIndex]?.scrollIntoView({ block: "nearest" });
      }
    };

    const renderItems = (items, needle, heading) => {
      visibleItems = items;
      activeIndex = items.length ? 0 : -1;
      kicker.hidden = !heading;
      kicker.textContent = heading || "";
      panel.hidden = false;

      if (!items.length) {
        list.innerHTML =
          '<div class="hero-search-empty"><strong>Nic nenalezeno</strong><span>Zkuste jiné slovo — třeba liberec, služby nebo poptávka.</span></div>';
        input.removeAttribute("aria-activedescendant");
        return;
      }

      list.innerHTML = items
        .map((item, index) => {
          const title = highlightSearchMatch(item.title, needle);
          const hint = highlightSearchMatch(item.hint, needle);
          const extra = item.external ? ' target="_blank" rel="noopener"' : "";
          return `<a class="hero-search-result" id="search-opt-${index}" role="option" href="${item.href}"${extra}><strong>${title}</strong><span>${hint}</span></a>`;
        })
        .join("");
      highlight();
    };

    const render = (query) => {
      const needle = foldSearchText(query);
      const compact = needle.replace(/ /g, "");

      if (compact.length < 2) {
        renderItems(searchFavorites, "", "Oblíbené");
        return;
      }

      const matches = siteSearchIndex.filter((item) => item.haystack.includes(needle)).slice(0, 5);
      renderItems(matches, needle, "");
    };

    const finishClose = () => {
      overlay.classList.remove("is-closing");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("search-overlay-open");
      document.body.style.top = "";
      window.scrollTo(0, lockedScrollY);
      setExpanded(false);
      setPageInert(false);
      input.value = "";
      renderItems(searchFavorites, "", "Oblíbené");
      syncPageScrollLock();
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    };

    const close = () => {
      if (!overlay.classList.contains("is-open")) {
        return;
      }
      window.clearTimeout(closeTimer);
      overlay.classList.remove("is-open");
      overlay.classList.add("is-closing");
      overlay.setAttribute("aria-hidden", "true");
      closeTimer = window.setTimeout(finishClose, closeMs);
    };

    const open = (from) => {
      if (overlay.classList.contains("is-open")) {
        return;
      }
      window.clearTimeout(closeTimer);
      lastFocus = from || document.activeElement;
      if (document.body.classList.contains("mobile-menu-open")) {
        document.querySelectorAll(".mobile-menu-toggle").forEach((toggle) => {
          if (toggle.getAttribute("aria-expanded") === "true") {
            toggle.click();
          }
        });
      }
      lockedScrollY = window.scrollY;
      document.body.style.top = `-${lockedScrollY}px`;
      overlay.classList.remove("is-closing");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("search-overlay-open");
      setExpanded(true);
      setPageInert(true);
      input.value = "";
      renderItems(searchFavorites, "", "Oblíbené");
      syncPageScrollLock();
      window.cancelAnimationFrame(openFrame);
      openFrame = window.requestAnimationFrame(() => {
        void overlay.offsetWidth;
        overlay.classList.add("is-open");
        input.focus();
      });
    };

    const goToActive = () => {
      const links = resultLinks();
      const target = links[activeIndex] || links[0];
      if (target) {
        target.click();
      }
    };

    toggles.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (overlay.classList.contains("is-open")) {
          close();
        } else {
          open(btn);
        }
      });
    });

    overlay.querySelectorAll("[data-search-close]").forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        close();
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (visibleItems.length) {
        goToActive();
      }
    });

    input.addEventListener("input", () => {
      render(input.value);
    });

    document.addEventListener("keydown", (event) => {
      if (!isVisible() || overlay.classList.contains("is-closing")) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "Tab") {
        const nodes = getFocusable();
        if (!nodes.length) {
          event.preventDefault();
          input.focus();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (!visibleItems.length) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % visibleItems.length;
        highlight();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = (activeIndex - 1 + visibleItems.length) % visibleItems.length;
        highlight();
      } else if (event.key === "Enter" && document.activeElement === input) {
        event.preventDefault();
        goToActive();
      }
    });
  }

  let lenis = null;

  function initSmoothScroll() {
    if (typeof Lenis !== "function") return;
    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    window.austisLenis = lenis;
    document.addEventListener("click", onSmoothAnchorClick, true);
  }

  function syncPageScrollLock() {
    if (!lenis) return;
    const locked =
      document.body.classList.contains("lightbox-open") ||
      document.body.classList.contains("mobile-menu-open") ||
      document.body.classList.contains("search-overlay-open");
    if (locked) lenis.stop();
    else lenis.start();
  }

  function onSmoothAnchorClick(event) {
    if (!lenis || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    let url;
    try { url = new URL(link.href, window.location.href); } catch { return; }
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (id && !target) return;
    event.preventDefault();
    if (window.location.hash !== url.hash) history.pushState(null, "", url.hash);
    if (document.body.classList.contains("mobile-menu-open")) lenis.start();
    lenis.scrollTo(target || 0);
  }

  function initMobileMenu() {
    const header = document.querySelector(".mobile-header");
    const panel = document.querySelector("#mobile-nav-panel");
    const toggles = [...document.querySelectorAll(".mobile-menu-toggle")];
    if (!panel || !toggles.length) return;
    const setOpen = (open) => {
      header?.classList.toggle("is-menu-open", open);
      document.querySelectorAll(".scroll-nav-shell").forEach((shell) => {
        shell.classList.toggle("is-menu-open", open && shell.classList.contains("is-visible"));
      });
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("mobile-menu-open", open);
      syncPageScrollLock();
      toggles.forEach((toggle) => {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
      });
    };
    toggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        setOpen(!panel.classList.contains("is-open"));
      });
    });
    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initFaq() {
    const items = Array.from(document.querySelectorAll(".faq-item"));
    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      const panel = item.querySelector(".faq-panel");
      if (!trigger || !panel) {
        return;
      }

      const setOpen = (open) => {
        item.classList.toggle("is-open", open);
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        panel.toggleAttribute("hidden", !open);
        panel.setAttribute("aria-hidden", open ? "false" : "true");
      };

      trigger.addEventListener("click", () => {
        setOpen(!item.classList.contains("is-open"));
      });
    });
  }

  function initInquiryForm() {
    const form = document.querySelector(".inquiry-form");
    if (!form) return;
    const status = form.querySelector(".inquiry-status");
    const steps = Array.from(form.querySelectorAll(".inquiry-step"));
    const navItems = Array.from(form.querySelectorAll(".inquiry-steps li"));
    const nextBtn = form.querySelector("[data-inquiry-next]");
    const backBtn = form.querySelector("[data-inquiry-back]");
    const submitBtn = form.querySelector(".inquiry-submit-btn");
    const stepButtons = Array.from(form.querySelectorAll("[data-step-target]"));
    let current = 1;

    const showStatus = (kind, message) => {
      if (!status) return;
      status.hidden = false;
      status.classList.toggle("is-success", kind === "success");
      status.classList.toggle("is-error", kind === "error");
      status.textContent = message;
    };

    const requiredFor = (stepEl) => {
      const checks = [];
      stepEl.querySelectorAll("[required]").forEach((field) => {
        if (field.type === "checkbox") {
          checks.push([field.checked, field, "Potvrďte souhlas se zpracováním osobních údajů."]);
        } else if (field.type === "email") {
          const value = field.value.trim();
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          checks.push([ok, field, value ? "Zadejte platný e-mail." : "Vyplňte prosím všechna povinná pole."]);
        } else {
          checks.push([Boolean(field.value.trim()), field, "Vyplňte prosím všechna povinná pole."]);
        }
      });
      return checks;
    };

    const validateStep = (stepEl) => {
      form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
      const failed = requiredFor(stepEl).filter(([ok]) => !ok);
      if (!failed.length) {
        if (status) status.hidden = true;
        return true;
      }
      failed.forEach(([, field]) => field?.closest(".inquiry-field, .inquiry-consent")?.classList.add("is-invalid"));
      failed[0][1]?.focus();
      showStatus("error", failed[0][2]);
      return false;
    };

    const goTo = (step, { validate = true } = {}) => {
      const next = Math.min(Math.max(step, 1), steps.length);
      if (next > current && validate) {
        const currentEl = steps.find((el) => Number(el.dataset.step) === current);
        if (currentEl && !validateStep(currentEl)) {
          return;
        }
      }
      current = next;
      steps.forEach((el) => {
        const on = Number(el.dataset.step) === current;
        el.classList.toggle("is-active", on);
        el.hidden = !on;
      });
      navItems.forEach((item, index) => {
        const n = index + 1;
        item.classList.toggle("is-active", n === current);
        item.classList.toggle("is-done", n < current);
        const btn = item.querySelector("[data-step-target]");
        if (btn) {
          if (n === current) btn.setAttribute("aria-current", "step");
          else btn.removeAttribute("aria-current");
        }
      });
      if (backBtn) backBtn.hidden = current === 1;
      if (nextBtn) nextBtn.hidden = current === steps.length;
      if (submitBtn) submitBtn.hidden = current !== steps.length;
      form.querySelector(".inquiry-steps")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const first = steps.find((el) => Number(el.dataset.step) === current)?.querySelector("input, select, textarea");
      first?.focus({ preventScroll: true });
    };

    nextBtn?.addEventListener("click", () => goTo(current + 1));
    backBtn?.addEventListener("click", () => goTo(current - 1, { validate: false }));
    stepButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-step-target"));
        if (!target || target === current) return;
        if (target < current) {
          goTo(target, { validate: false });
          return;
        }
        goTo(target);
      });
    });
    goTo(1, { validate: false });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const last = steps[steps.length - 1];
      if (last && !validateStep(last)) {
        goTo(steps.length, { validate: false });
        return;
      }
      form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const company = String(data.get("company") || "").trim();
      const typRealizace = String(data.get("typ-realizace") || data.get("service") || "").trim();
      const typStavby = String(data.get("typ-stavby") || data.get("project-type") || "").trim();
      const location = String(data.get("location") || "").trim();
      const termin = String(data.get("termin") || "").trim();
      const message = String(data.get("message") || "").trim();
      const consent = Boolean(form.querySelector("[name='consent']")?.checked);
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const failMessage = "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu, případně nám napište na zakazky@austis.cz nebo zavolejte na +420 721 071 189.";
      const checks = [
        [name, form.querySelector("#name")],
        [emailOk, form.querySelector("#email")],
        [message, form.querySelector("#message")],
        [consent, form.querySelector("[name='consent']")],
      ];
      const invalid = checks.filter(([ok]) => !ok).map(([, field]) => field);
      if (invalid.length) {
        invalid.forEach((field) => field?.closest(".inquiry-field, .inquiry-consent")?.classList.add("is-invalid"));
        const firstInvalidStep = Number(invalid[0]?.closest(".inquiry-step")?.dataset.step) || 3;
        goTo(firstInvalidStep, { validate: false });
        invalid[0]?.focus();
        showStatus("error", email && !emailOk ? "Zadejte platný e-mail." : "Vyplňte prosím všechna povinná pole.");
        return;
      }
      const realizaceLabel = form.querySelector("#typ-realizace")?.selectedOptions?.[0]?.textContent?.trim() || typRealizace;
      const typeLabel = form.querySelector("#typ-stavby")?.selectedOptions?.[0]?.textContent?.trim() || typStavby;
      const body = [
        `Jméno: ${name}`,
        company ? `Společnost: ${company}` : "",
        `E-mail: ${email}`,
        phone ? `Telefon: ${phone}` : "",
        realizaceLabel && realizaceLabel !== "Vyberte typ realizace" ? `Typ realizace: ${realizaceLabel}` : "",
        typeLabel && typeLabel !== "Vyberte typ" ? `Typ stavby: ${typeLabel}` : "",
        location ? `Lokalita: ${location}` : "",
        termin ? `Předpokládaný termín: ${termin}` : "",
        "",
        message,
      ].filter(Boolean).join("\n");
      const href = `mailto:zakazky@austis.cz?subject=${encodeURIComponent("Poptávka z webu AUSTIS Pozemní stavby")}&body=${encodeURIComponent(body)}`;
      try {
        window.location.href = href;
      } catch (error) {
        showStatus("error", failMessage);
      }
    });
  }

  function isShown(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  function initHeroParallax() {
    const stacks = Array.from(document.querySelectorAll(".hero-bg-stack, .mobile-hero-bg-stack"));
    if (!stacks.length) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 1024px)");
    const layers = stacks.map((stack) => {
      let layer = stack.querySelector(":scope > .hero-parallax-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "hero-parallax-layer";
        layer.setAttribute("aria-hidden", "true");
        while (stack.firstChild) {
          layer.appendChild(stack.firstChild);
        }
        stack.appendChild(layer);
      }
      return {
        stack,
        layer,
        hero: stack.closest(".hero, .mobile-hero") || stack,
      };
    });

    let frame = 0;
    let listening = false;

    function resetLayers() {
      layers.forEach(({ layer }) => {
        layer.style.transform = "";
        layer.style.willChange = "";
      });
    }

    function paint() {
      frame = 0;
      if (motionQuery.matches) {
        resetLayers();
        return;
      }

      const mobile = mobileQuery.matches;
      const factor = mobile ? 0.08 : 0.12;
      const scaleTo = mobile ? 1.06 : 1.075;
      const artboardScale = mobile
        ? 1
        : Number.parseFloat(getComputedStyle(root).getPropertyValue("--scale")) || 1;

      layers.forEach(({ layer, hero }) => {
        if (!isShown(hero) && !isShown(layer)) {
          layer.style.willChange = "";
          return;
        }

        const rect = hero.getBoundingClientRect();
        const height = rect.height || 1;
        const traveled = Math.min(Math.max(-rect.top, 0), height);
        const progress = traveled / height;
        const scale = 1 + (scaleTo - 1) * progress;
        const coverPx = ((scale - 1) / 2) * height;
        const y = Math.min((traveled * factor) / artboardScale, coverPx / artboardScale);
        layer.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        layer.style.willChange = progress > 0 && progress < 1 ? "transform" : "";
      });
    }

    function requestPaint() {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(paint);
    }

    function start() {
      if (listening || motionQuery.matches) {
        paint();
        return;
      }
      listening = true;
      if (window.austisLenis && typeof window.austisLenis.on === "function") {
        window.austisLenis.on("scroll", requestPaint);
      }
      window.addEventListener("scroll", requestPaint, { passive: true });
      window.addEventListener("resize", requestPaint, { passive: true });
      paint();
    }

    function stop() {
      if (!listening) {
        paint();
        return;
      }
      listening = false;
      if (window.austisLenis && typeof window.austisLenis.off === "function") {
        window.austisLenis.off("scroll", requestPaint);
      }
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      resetLayers();
    }

    function syncMotion(event) {
      if ((event && event.matches) || motionQuery.matches) {
        stop();
      } else {
        start();
      }
    }

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", syncMotion);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(syncMotion);
    }

    syncMotion();
  }

  function initMediaParallax() {
    const images = Array.from(document.querySelectorAll(".gd-split figure > img")).filter((img) => {
      const src = img.getAttribute("src") || "";
      return !src.endsWith(".svg");
    });
    if (!images.length) {
      return;
    }

    const items = images.map((img) => ({
      img,
      frame: img.closest(".gd-split figure") || img.parentElement,
    }));

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 1024px)");
    const OVERSIZE = 0.18;
    let frame = 0;
    let listening = false;

    function resetImages() {
      document.documentElement.classList.remove("has-media-parallax");
      items.forEach(({ img }) => {
        img.style.transform = "";
        img.style.willChange = "";
      });
    }

    function paint() {
      frame = 0;
      if (motionQuery.matches) {
        resetImages();
        return;
      }

      const viewH = window.innerHeight || 1;
      const travel = mobileQuery.matches ? 0.08 : 0.12;

      items.forEach(({ img, frame: box }) => {
        if (!isShown(box) && !isShown(img)) {
          img.style.willChange = "";
          return;
        }

        const rect = box.getBoundingClientRect();
        if (rect.bottom < -40 || rect.top > viewH + 40) {
          img.style.willChange = "";
          return;
        }

        const height = box.offsetHeight || rect.height || 1;
        const maxShift = height * OVERSIZE * 0.42;
        const centerDelta = viewH / 2 - (rect.top + rect.height / 2);
        const k = (travel * height) / (viewH + height);
        const y = Math.max(-maxShift, Math.min(maxShift, centerDelta * k));
        img.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        img.style.willChange = "transform";
      });
    }

    function requestPaint() {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(paint);
    }

    function start() {
      if (motionQuery.matches) {
        resetImages();
        return;
      }
      document.documentElement.classList.add("has-media-parallax");
      if (!listening) {
        listening = true;
        if (window.austisLenis && typeof window.austisLenis.on === "function") {
          window.austisLenis.on("scroll", requestPaint);
        }
        window.addEventListener("scroll", requestPaint, { passive: true });
        window.addEventListener("resize", requestPaint, { passive: true });
      }
      paint();
    }

    function stop() {
      listening = false;
      if (window.austisLenis && typeof window.austisLenis.off === "function") {
        window.austisLenis.off("scroll", requestPaint);
      }
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      resetImages();
    }

    function syncMotion(event) {
      if ((event && event.matches) || motionQuery.matches) {
        stop();
      } else {
        start();
      }
    }

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", syncMotion);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(syncMotion);
    }

    syncMotion();
  }

  function initBackToTop() {
    if (document.querySelector(".back-to-top")) {
      return;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Zpět nahoru");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 6.2 5.6 12.6l1.4 1.4L12 9l5 5 1.4-1.4z"/></svg>';
    document.body.appendChild(btn);

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;

    function pageY() {
      if (window.austisLenis && typeof window.austisLenis.scroll === "number") {
        return window.austisLenis.scroll;
      }
      return window.scrollY || 0;
    }

    function paint() {
      frame = 0;
      const show = pageY() > 300;
      if (show === visible) {
        return;
      }
      visible = show;
      btn.classList.toggle("is-visible", show);
    }

    function requestPaint() {
      if (!frame) {
        frame = window.requestAnimationFrame(paint);
      }
    }

    btn.addEventListener("click", () => {
      if (window.austisLenis && typeof window.austisLenis.scrollTo === "function") {
        window.austisLenis.scrollTo(0, { immediate: reduceQuery.matches });
      } else {
        window.scrollTo({ top: 0, behavior: reduceQuery.matches ? "auto" : "smooth" });
      }
    });

    if (window.austisLenis && typeof window.austisLenis.on === "function") {
      window.austisLenis.on("scroll", requestPaint);
    }
    window.addEventListener("scroll", requestPaint, { passive: true });
    paint();
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
  initSmoothScroll();
  initMobileMenu();
  initSiteSearch();
  initFaq();
  initInquiryForm();
  initHeroParallax();
  initMediaParallax();
  initBackToTop();

  window.addEventListener("resize", updateScale, { passive: true });
  window.addEventListener("resize", () => designLines.forEach(setLineDirection), { passive: true });
})();
