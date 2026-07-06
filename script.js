(function () {
  const root = document.documentElement;
  const desktopShell = document.querySelector(".desktop-shell");
  const mobilePage = document.querySelector(".mobile-page");
  const designLines = Array.from(document.querySelectorAll(".artboard .line, .artboard .grid-line, .artboard .section-line, .artboard .footer-line"));
  const lineSections = Array.from(document.querySelectorAll(".project, .about"));
  const desktopMin = 1025;
  const designWidth = 1440;
  const maxDesktopWidth = 1920;

  function getDesignHeroHeight() {
    const headerOffset = parseFloat(getComputedStyle(root).getPropertyValue("--header-offset")) || 50;
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
      const scaleByWidth = Math.min(layoutWidth / designWidth, 1);
      const viewportMargin = 24;
      const scaleByHeight = (height - viewportMargin) / getDesignHeroHeight();
      scale = Math.min(scaleByWidth, scaleByHeight);
      scale = Math.min(Math.max(scale, 0.5), 1);
    }

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

  const bodyDataset = document.body?.dataset ?? {};
  const hasHeroVideoOverride = Object.prototype.hasOwnProperty.call(bodyDataset, "heroVideo");
  const heroSlide = {
    src: bodyDataset.heroImage || "assets/hero-section-bg.png",
    video: hasHeroVideoOverride ? bodyDataset.heroVideo : "assets/hf_20260610_082828_ad428852-aa92-4020-a9a1-d9139a428e20.mp4",
    name: bodyDataset.heroName || "Chata Seibert",
  };

  const referenceProjects = [
    {
      title: "Chata Seibert",
      type: "Rekreační stavba",
      description:
        "Generální dodávka kompletní rekonstrukce horské chaty v Krkonoších — od logistiky montáží v náročném terénu po předání v sezónním provozu.",
      location: "Krkonoše",
      timeline: "2024 – 2025",
      status: null,
      scope: [
        "generální dodávka stavby",
        "koordinace subdodavatelů",
        "řízení harmonogramu a návazností",
      ],
      leftImg: "assets/image 3.png",
      rightImg: "assets/hero 2.png",
      rightAlt: "Chata Seibert — pohled na realizaci",
    },
    {
      title: "Vraňany Farma Hanč",
      type: "Zemědělský areál",
      description:
        "Výstavba provozních objektů a technického zázemí farmy. Jeden smluvní partner pro celý areál — včetně inženýrských sítí a zpevněných ploch.",
      location: "Vraňany",
      timeline: "2023 – 2024",
      status: null,
      scope: [
        "pozemní stavby areálu",
        "inženýrské sítě a zpevněné plochy",
        "generální řízení realizace",
      ],
      leftImg: "assets/image 4.png",
      rightImg: "assets/hero 1.png",
      rightAlt: "Vraňany Farma Hanč — pohled na areál",
    },
    {
      title: "Rodinný dům Roztoky",
      type: "Novostavba RD",
      description:
        "Novostavba rodinného domu na klíč v rámci generální dodávky. Investor jedná s jedním partnerem a má průběžný reporting i pevný harmonogram.",
      location: "Roztoky",
      timeline: "říjen 2025 – prosinec 2026",
      status: "Probíhá",
      scope: [
        "generální dodávka stavby",
        "koordinace subdodavatelů",
        "řízení harmonogramu a návazností",
      ],
      leftImg: "assets/image 3.png",
      rightImg: "assets/hero 2.png",
      rightAlt: "Rodinný dům Roztoky — vizualizace novostavby",
    },
    {
      title: "Novo Plaza",
      type: "Komerční development",
      description:
        "Realizace komerčního objektu v rámci developerského projektu. Řídíme termíny, náklady i návaznost na další fáze celého záměru.",
      location: "Praha",
      timeline: "2025 – 2026",
      status: "Probíhá",
      scope: [
        "generální dodávka stavby",
        "komerční pozemní stavba",
        "reporting pro investora",
      ],
      leftImg: "assets/image 7.png",
      rightImg: "assets/hero 3.png",
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

  function whenVideoBuffered(video, timeoutMs = 10000) {
    return new Promise((resolve) => {
      const finish = () => resolve();

      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        finish();
        return;
      }

      const timer = window.setTimeout(finish, timeoutMs);

      const onReady = () => {
        if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          return;
        }

        window.clearTimeout(timer);
        video.removeEventListener("canplaythrough", onReady);
        video.removeEventListener("canplay", onReady);
        finish();
      };

      video.addEventListener("canplaythrough", onReady);
      video.addEventListener("canplay", onReady);
    });
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

    const SESSION_KEY = "austis-hero-played";
    const hasPlayedHero = !!sessionStorage.getItem(SESSION_KEY);
    if (!hasPlayedHero) {
      sessionStorage.setItem(SESSION_KEY, "1");
    }

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
      const logoImages = Array.from(document.querySelectorAll(".logo-img"));

      // Repeat visits render the settled hero straight from CSS via
      // html.hero-precommit (set synchronously before first paint), so the
      // still image is never gated behind JS/network timing here.
      if (hasPlayedHero) {
        return;
      }

      await whenWindowLoaded();
      await whenFontsReady();

      await Promise.all([
        ...heroPairs.flatMap(({ video, still }) => [
          video.getAttribute("src") ? whenVideoBuffered(video) : Promise.resolve(),
          whenImageReady(still),
        ]),
        ...logoImages.map(whenImageReady),
      ]);

      await nextPaint();
    }

    function setupHeroPlayback({ section, video, still }) {
      const hasVideoSource = Boolean(video.getAttribute("src"));

      if (!hasVideoSource) {
        return function startStaticHero() {
          still.classList.add("is-active", "is-settled");
          section.classList.add("hero-is-settled");
          heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
          startHeroLines();
        };
      }

      if (prefersReducedMotion) {
        markHeroReady(section, video);
        still.classList.add("is-active", "is-settled");
        section.classList.add("hero-is-settled");
        heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
        return;
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
          void beginChoreo().then(startChoreoLoop);
        },
        { once: true },
      );

      video.addEventListener("ended", trySettle);

      return async function startPlayback() {
        video.pause();
        video.currentTime = 0;

        await nextPaint();

        const playPromise = video.play();

        if (playPromise?.catch) {
          await playPromise.catch(() => {
            runTimedChoreoFallback();
          });
        }
      };
    }

    const starters = hasPlayedHero ? [] : heroPairs.map((pair) => setupHeroPlayback(pair));

    void waitForHeroAssets().then(async () => {
      heroPairs.forEach(({ section, video, still }, index) => {
        markHeroReady(section, video);

        if (hasPlayedHero) {
          still.classList.add("is-active", "is-settled");
          section.classList.add("hero-is-settled");
          heroChoreoStages.forEach(({ name }) => applyHeroChoreoStage(section, name));
        } else {
          void starters[index]?.();
        }
      });

      if (hasPlayedHero) {
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

    if (mobileVideo && heroSlide.video) {
      mobileVideo.src = heroSlide.video;
      mobileVideo.poster = heroSlide.src;
    } else if (mobileVideo) {
      mobileVideo.removeAttribute("src");
      mobileVideo.poster = heroSlide.src;
      mobileVideo.load();
    }

    if (mobileStill) {
      mobileStill.src = heroSlide.src;
    }

    if (heroVideo && heroSlide.video) {
      heroVideo.src = heroSlide.video;
      heroVideo.poster = heroSlide.src;
      heroVideo.setAttribute("aria-label", heroSlide.name);
    } else if (heroVideo) {
      heroVideo.removeAttribute("src");
      heroVideo.poster = heroSlide.src;
      heroVideo.setAttribute("aria-label", heroSlide.name);
      heroVideo.load();
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
    const projectStatTimeline = document.querySelector(".project-stat-timeline");
    const projectScope = document.querySelector(".project-scope");
    const projectNext = document.querySelector(".project-next");
    const mobileTitle = document.querySelector("#mobile-project-title");
    const mobileDesc = document.querySelector(".mobile-project-desc");
    const mobileStatType = document.querySelector(".mobile-project-stat-type");
    const mobileStatLocation = document.querySelector(".mobile-project-stat-location");
    const mobileStatTimeline = document.querySelector(".mobile-project-stat-timeline");
    const mobileScope = document.querySelector(".mobile-project-scope");
    const mobileNext = document.querySelector(".mobile-project-next");
    const referenceLinks = Array.from(document.querySelectorAll('a[href="#reference"], a[href="#reference-mobile"]'));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let isUpdating = false;

    function buildTitle(project) {
      if (!project.status) {
        return project.title;
      }

      return `${project.title} <span class="project-status">${project.status}</span>`;
    }

    function renderScope(listElement, items) {
      if (!listElement) {
        return;
      }

      listElement.replaceChildren(
        ...items.map((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          return li;
        }),
      );
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

      if (projectStatTimeline) {
        projectStatTimeline.textContent = project.timeline;
      }

      renderScope(projectScope, project.scope);

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

      if (mobileStatTimeline) {
        mobileStatTimeline.textContent = project.timeline;
      }

      renderScope(mobileScope, project.scope);

      if (mobileProjectSection) {
        mobileProjectSection.style.backgroundImage = [
          "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75))",
          `url("${project.rightImg}")`,
        ].join(", ");
        mobileProjectSection.style.backgroundSize = "cover";
        mobileProjectSection.style.backgroundPosition = "center";
      }

      const nextProject = referenceProjects[(index + 1) % referenceProjects.length];
      const nextLabel = nextProject ? `Zobrazit další referenci: ${nextProject.title}` : "Zobrazit další referenci";

      projectNext?.setAttribute("aria-label", nextLabel);
      mobileNext?.setAttribute("aria-label", nextLabel);
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

    function showNextReference() {
      showReference((activeIndex + 1) % referenceProjects.length);
    }

    projectNext?.addEventListener("click", showNextReference);
    mobileNext?.addEventListener("click", showNextReference);

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

  updateScale();
  prepareDesignLines();
  const heroApi = prepareHeroDots();
  initHeroVideo(revealHeroLines);
  prepareReferenceCarousel(heroApi);
  prepareNavState();
  revealScrollLines();
  initResponsibilityScrollReveal();
  initScrollNavShell();

  window.addEventListener("resize", updateScale, { passive: true });
  window.addEventListener("resize", () => designLines.forEach(setLineDirection), { passive: true });
})();
