#!/usr/bin/env python3
"""Render site pages from the 23 Oct 2026 accepted client texts."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_V = "20261103d"
# Hero may only use Liberec 4/5 from the approved set. Never use v4b-titulni-1.
HERO_IMG = "assets/photos/agrotechnology-park-liberec-4.webp"
PHOTO = {
    "liberec_hero": HERO_IMG,
    "liberec_1": "assets/photos/agrotechnology-park-liberec-1.webp",
    "liberec_2": "assets/photos/agrotechnology-park-liberec-2.webp",
    "liberec_3": "assets/photos/agrotechnology-park-liberec-3.webp",
    "seibert": "assets/photos/seibertovy-vyhledy-2.webp",
    "vranany": "assets/photos/jahodarna-vranany-2.webp",
    "botanicka": "assets/photos/botanicka-zahrada-3.webp",
    "roztoky": "assets/photos/rd-roztoky-1.webp",
    "novodvorska": "assets/photos/oc-novodvorska-1.webp",
    "vinice": "assets/photos/bd-u-vinice-1.webp",
    "hluckova": "assets/photos/bd-hluckova-1.webp",
    "pribram": "assets/photos/retail-park-pribram-1.webp",
    "slivenec": "assets/photos/sidlo-austis-slivenec-1.webp",
}
HQ_PHOTO = PHOTO["slivenec"]
PHONE = "+420 721 071 189"
PHONE_TEL = "+420721071189"
EMAIL = "zakazky@austis.cz"
ICO = "07093322"
DIC = "CZ07093322"
ICO_HREF = "https://or.justice.cz/ias/ui/rejstrik-$firma?ico=07093322"
DIC_HREF = "https://adisspr.mfcr.cz/dpr/adis/idpr_pub/dph_reg/dph_reg.faces"
CANON = "https://aps.austis.cz"

ENTER_BOOT = """    <script>
      (function () {
        try {
          var fromAS = false;
          try {
            fromAS = new URLSearchParams(window.location.search).get("from") === "austis-as";
          } catch (e) {}
          if (!fromAS) return;

          var reduce = false;
          try {
            reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          } catch (e) {}

          var stripped = false;
          function stripFromParam() {
            if (stripped) return;
            try {
              var url = new URL(window.location.href);
              if (url.searchParams.get("from") !== "austis-as") return;
              url.searchParams.delete("from");
              var query = url.searchParams.toString();
              var next = url.pathname + (query ? "?" + query : "") + url.hash;
              history.replaceState(history.state, document.title, next);
              stripped = true;
            } catch (e) {}
          }

          window.addEventListener("pageshow", function (event) {
            if (event.persisted) {
              document.documentElement.classList.remove("as-enter", "as-enter-out");
              stripFromParam();
            }
          });

          if (reduce) {
            stripFromParam();
            return;
          }

          document.documentElement.classList.add("as-enter");

          var played = false;
          function playEnter() {
            if (played) return;
            played = true;
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () {
                document.documentElement.classList.add("as-enter-out");
                window.setTimeout(function () {
                  document.documentElement.classList.remove("as-enter", "as-enter-out");
                  stripFromParam();
                }, 650);
              });
            });
          }

          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", playEnter);
          } else {
            playEnter();
          }
        } catch (e) {}
      })();
    </script>
    <style>
      html.as-enter {
        background: #ffffff !important;
      }
      html.as-enter body {
        background: #ffffff;
      }
      html.as-enter::before {
        content: "AUSTIS\\A pozemní stavby";
        white-space: pre;
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        color: #1e1e1e;
        font-family: "Neue Haas Grotesk Text Pro", "Helvetica Neue", Arial, sans-serif;
        font-size: clamp(36px, 4.2vw, 52px);
        font-weight: 500;
        letter-spacing: 0;
        line-height: 1.15;
        text-align: center;
        pointer-events: auto;
        opacity: 1;
        transition: opacity 600ms ease;
      }
      html.as-enter-out::before {
        opacity: 0;
      }
      html.as-enter .desktop-shell,
      html.as-enter .mobile-hero {
        transform: translateY(12px);
        transition: transform 600ms ease;
      }
      html.as-enter-out .desktop-shell,
      html.as-enter-out .mobile-hero {
        transform: translateY(0);
      }
    </style>
"""

SCALE_SCRIPT = """    <script>
      (function () {
        try {
          document.documentElement.classList.add("hero-precommit");
        } catch (e) {}
        try {
          var desktopMin = 1025;
          var designWidth = 1440;
          var maxDesktopWidth = 2200;
          var widthCropAllowance = 260;
          var maxScale = 1.32;
          var comfortScale = 0.9;
          var width = window.innerWidth;
          var scale = 1;
          if (width >= desktopMin) {
            var layoutWidth = Math.min(width, maxDesktopWidth);
            var scaleByWidth = (layoutWidth + widthCropAllowance) / designWidth;
            scale = Math.min(scaleByWidth, maxScale) * comfortScale;
            scale = Math.min(Math.max(scale, 0.5), maxScale);
          }
          document.documentElement.style.setProperty("--scale", scale.toFixed(5));
          document.documentElement.classList.add("is-layout-ready");
        } catch (e) {
          document.documentElement.classList.add("is-layout-ready");
        }
      })();
    </script>"""

ORG_JSONLD = f"""    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": ["Organization", "GeneralContractor"],
      "name": "AUSTIS Pozemní stavby s.r.o.",
      "url": "{CANON}",
      "email": "{EMAIL}",
      "telephone": "{PHONE}",
      "vatID": "{DIC}",
      "identifier": "{ICO}",
      "address": {{
        "@type": "PostalAddress",
        "streetAddress": "K Austisu 680",
        "addressLocality": "Praha 5 – Slivenec",
        "postalCode": "154 00",
        "addressCountry": "CZ"
      }}
    }}
    </script>"""


def breadcrumb(name, path):
    return f"""    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{
          "@type": "ListItem",
          "position": 1,
          "name": "Domů",
          "item": "{CANON}/"
        }},
        {{
          "@type": "ListItem",
          "position": 2,
          "name": "{name}",
          "item": "{CANON}{path}"
        }}
      ]
    }}
    </script>"""


def nav_links(active):
    items = [
        ("sluzby.html", "Služby", "sluzby"),
        ("projekty.html", "Realizace", "projekty"),
        ("o-spolecnosti.html", "O společnosti", "o-spolecnosti"),
        ("kontakt.html", "Kontakt", "kontakt"),
    ]
    out = []
    for href, label, key in items:
        current = ' class="active" aria-current="page"' if key == active else ""
        out.append(f'                <a{current} href="{href}">{label}</a>')
    return "\n".join(out)


def cta_btn(active=False, href="poptavka.html#poptavka-form"):
    cls = ' class="btn btn-red active"' if active else ' class="btn btn-red"'
    current = ' aria-current="page"' if active else ""
    return f'<a{cls} href="{href}"{current}><span class="btn-label">Poptat spolupráci</span></a>'


def head(title, description, path, extra="", og_image=HERO_IMG):
    url = CANON + path
    og_img = f"{CANON}/{og_image}"
    return f"""<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="{url}" />
    <link rel="icon" href="logo.svg" type="image/svg+xml" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{url}" />
    <meta property="og:locale" content="cs_CZ" />
    <meta property="og:site_name" content="AUSTIS Pozemní stavby" />
    <meta property="og:image" content="{og_img}" />
    <meta name="twitter:card" content="summary_large_image" />
{ORG_JSONLD}
{extra}
    <meta name="description" content="{description}" />
    <title>{title}</title>
{ENTER_BOOT}
{SCALE_SCRIPT}
    <link rel="preload" as="image" href="{HERO_IMG}" fetchpriority="high" />
    <link rel="stylesheet" href="styles.css?v={ASSET_V}" />
    <link rel="stylesheet" href="lenis.css?v=1.3.26" />
  </head>"""


HERO_CTA_HREF = "poptavka.html#poptavka-form"
HERO_CTA_LABEL = "Poptat<br />spolupráci"
HERO_CTA_ARIA = "Poptat spolupráci"

HOME_ACTIONS = f"""            <div class="hero-copy">
              <div class="hero-copy-main">
                <p class="hero-copy-eyebrow">AUSTIS Pozemní stavby</p>
                <h1>Generální dodávky<br /> novostaveb a&nbsp;rekonstrukcí</h1>
              </div>
              <a class="hero-jump" href="{HERO_CTA_HREF}" aria-label="{HERO_CTA_ARIA}">
                <span class="hero-jump-mark" aria-hidden="true"><span class="hero-action-arrow"></span></span>
                <span class="hero-jump-label">{HERO_CTA_LABEL}</span>
              </a>
            </div>"""

HOME_MOBILE = f"""          <div class="mobile-hero-panel">
            <p class="hero-copy-eyebrow">AUSTIS Pozemní stavby</p>
            <h1 class="mobile-hero-title">Generální dodávky novostaveb a&nbsp;rekonstrukcí</h1>
            <div class="mobile-hero-actions">
              <a class="mobile-text-link" href="{HERO_CTA_HREF}">{HERO_CTA_ARIA}</a>
            </div>
          </div>"""


def chrome_start(active, aria, hero_name, h1, lead, jump_href, jump_aria, jump_label, extra_hero="", cta_active=False, home=False):
    links = nav_links(active)
    cta = cta_btn(cta_active)
    body_class = (
        "home-page austis-home flow-subpage subpage-body"
        if home
        else f"subpage-body flow-subpage austis-page {active}-page"
    )
    if home:
        desktop_copy = HOME_ACTIONS
        mobile_panel = HOME_MOBILE
    else:
        desktop_copy = f"""            <div class="hero-copy">
              <div class="hero-copy-main">
                <h1>{h1}</h1>
                <p class="hero-copy-lead">{lead}</p>
              </div>
              <a class="hero-jump" href="{HERO_CTA_HREF}" aria-label="{HERO_CTA_ARIA}">
                <span class="hero-jump-mark" aria-hidden="true"><span class="hero-action-arrow"></span></span>
                <span class="hero-jump-label">{HERO_CTA_LABEL}</span>
              </a>
            </div>"""
        mobile_panel = f"""          <div class="mobile-hero-panel">
            <h1 class="mobile-hero-title">{h1}</h1>
            <p>{lead}</p>
            <div class="mobile-hero-actions">
              <a class="mobile-text-link" href="{HERO_CTA_HREF}">{HERO_CTA_ARIA}</a>
            </div>
          </div>"""
    return f"""
  <body
    class="{body_class}"
    data-hero-image="{HERO_IMG}"
    data-hero-video=""
    data-hero-name="{hero_name}"
  >
        <div class="page-rails" aria-hidden="true">
      <span class="page-rail page-rail-left"></span>
      <span class="page-rail page-rail-right"></span>
    </div>
<main class="subpage-site">
      <div class="scroll-nav-shell home-scroll-nav" aria-hidden="true">
        <div class="scroll-nav-bar">
          <div class="scroll-nav-inner">
            <a class="logo scroll-nav-logo" href="index.html" aria-label="AUSTIS Pozemní stavby">
              <span class="logo-mark"><img class="logo-img" src="assets/SVG/austis%20type.svg" alt="" /></span>
            </a>
            <header class="subpage-header">
              <nav class="subpage-nav" aria-label="Hlavní navigace">
{links}
              </nav>
              {cta}
            </header>
            <button type="button" class="mobile-menu-toggle scroll-nav-menu-toggle" aria-expanded="false" aria-controls="mobile-nav-panel" aria-label="Otevřít menu">
              <span class="mobile-menu-toggle-bars" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="desktop-shell" aria-label="{aria}">
        <div class="artboard">
          <section class="hero hero-is-choreo hero-is-static hero-is-ready hero-is-settled">
            <div class="hero-bg-stack">
              <img
                class="hero-bg hero-bg-still is-active is-settled"
                src="{HERO_IMG}"
                alt="{hero_name}"
                fetchpriority="high"
                decoding="async"
              />
            </div>
            <div class="hero-side"></div>
            <div class="line line-nav"></div>
            <div class="line line-hero-image-top"></div>
            <div class="line line-hero-top"></div>
            <div class="line line-hero-mid"></div>
            <div class="line line-hero-right"></div>
            <div class="line line-hero-bottom"></div>
            <div class="hero-tail-blur" aria-hidden="true"></div>
            <div class="line line-hero-left" aria-hidden="true"></div>
            <header class="header">
              <a class="logo" href="index.html" aria-label="AUSTIS Pozemní stavby">
                <span class="logo-mark"><img class="logo-img" src="logo.svg" alt="AUSTIS Pozemní stavby" /></span>
              </a>
              <nav class="nav" aria-label="Hlavní navigace">
{links}
              </nav>
              {cta}
              <form class="hero-search" role="search">
                <label class="hero-search-field">
                  <span class="hero-search-ico" aria-hidden="true"></span>
                  <input type="search" name="q" placeholder="Hledat…" autocomplete="off" enterkeyhint="search" aria-label="Hledat na webu" />
                </label>
                <div class="hero-search-results" hidden role="listbox" aria-label="Výsledky hledání"></div>
              </form>
            </header>
            <div class="slide-dots" aria-label="Sídlo">
              <strong class="slide-label">K Austisu 680, Praha 5 – Slivenec</strong>
            </div>
{desktop_copy}
          </section>
        </div>
      </div>

      <div class="mobile-nav-panel" id="mobile-nav-panel">
        <nav class="mobile-nav" aria-label="Hlavní navigace">
{links}
        </nav>
        <a class="btn btn-red mobile-nav-cta" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat spolupráci</span></a>
      </div>
      <div class="mobile-page" aria-label="{aria} mobile">
        <header class="mobile-header">
          <div class="mobile-header-row">
            <button type="button" class="mobile-menu-toggle" aria-expanded="false" aria-controls="mobile-nav-panel" aria-label="Otevřít menu">
              <span class="mobile-menu-toggle-bars" aria-hidden="true"></span>
            </button>
            <a class="logo" href="index.html" aria-label="AUSTIS Pozemní stavby">
              <span class="logo-mark"><img class="logo-img" src="logo.svg" alt="AUSTIS Pozemní stavby" /></span>
            </a>
            {cta}
          </div>
          <nav class="mobile-nav" aria-label="Hlavní navigace">
{links}
          </nav>
        </header>
        <section class="mobile-hero hero-is-choreo hero-is-static hero-is-ready hero-is-settled">
          <div class="mobile-hero-bg-stack" aria-hidden="true">
            <img
              class="mobile-hero-bg mobile-hero-still is-active is-settled"
              src="{HERO_IMG}"
              alt=""
              aria-hidden="true"
              fetchpriority="high"
              decoding="async"
            />
          </div>
          <span class="mobile-hero-label">K Austisu 680, Praha 5 – Slivenec</span>
{mobile_panel}
        </section>
      </div>
"""


def footer():
    return f"""      <footer class="footer site-footer" id="paticka">
        <div class="footer-line footer-left"></div>
        <div class="footer-line footer-top"></div>
        <div class="footer-line footer-right"></div>
        <section>
          <h2>Společnost</h2>
          <p><strong>AUSTIS Pozemní stavby s.r.o.</strong></p>
          <p>Generální dodávky novostaveb a rekonstrukcí</p>
        </section>
        <section>
          <h2>Kontakt</h2>
          <p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
          <p>K Austisu 680, 154 00 Praha 5 – Slivenec</p>
          <p class="highlight">IČ: <a href="{ICO_HREF}">{ICO}</a> · DIČ: <a href="{DIC_HREF}">{DIC}</a></p>
        </section>
        <section>
          <h2>Odkazy</h2>
          <ul class="footer-links">
            <li><a href="sluzby.html">Služby</a></li>
            <li><a href="projekty.html">Realizace</a></li>
            <li><a href="o-spolecnosti.html">O společnosti</a></li>
            <li><a href="kontakt.html">Kontakt</a></li>
            <li><a href="kontakt.html#faq">Časté otázky</a></li>
            <li><a href="o-spolecnosti.html#kariera">Kariéra</a></li>
          </ul>
          <p class="footer-cta-wrap">{cta_btn()}</p>
        </section>
        <small>© 2026 AUSTIS Pozemní stavby s.r.o. · <a href="osobni-udaje.html">Informace o zpracování osobních údajů</a></small>
      </footer>
    </main>
    <script src="lenis.min.js?v=1.3.26"></script>
    <script src="script.js?v={ASSET_V}"></script>
  </body>
</html>
"""


def page_end():
    return footer()


IN_PROGRESS = [
    {
        "id": "seibert",
        "title": "Chata Seibert",
        "desc": "Nástavba, přístavba a celkové stavební úpravy původního rekreačního objektu.",
        "place": "Pec pod Sněžkou",
        "period_label": "Plánované období realizace",
        "period": "květen 2025 – listopad 2027",
        "role": "Generální dodavatel",
        "status": "V realizaci",
        "photo": PHOTO["seibert"],
        "w": 1000,
        "h": 750,
        "small": True,
        "vizualizace": True,
    },
    {
        "id": "roztoky",
        "title": "Rodinný dům Roztoky",
        "desc": "Novostavba rodinného domu.",
        "place": "Roztoky",
        "period_label": "Plánované období realizace",
        "period": "říjen 2025 – prosinec 2026",
        "role": "Generální dodavatel",
        "status": "V realizaci",
        "photo": PHOTO["roztoky"],
        "w": 544,
        "h": 302,
        "small": True,
        "vizualizace": True,
    },
]

DONE = [
    {
        "id": "pribram",
        "title": "Retail Park Příbram",
        "desc": "Úpravy dispozic, technologií, fasád, střech a zpevněných ploch.",
        "place": "Příbram",
        "period": "březen 2024 – červenec 2025",
        "photo": PHOTO["pribram"],
        "w": 800,
        "h": 533,
        "small": True,
    },
    {
        "id": "tmobile-strecha",
        "title": "T-Mobile rekonstrukce střechy a teras",
        "desc": "Obnova střešního pláště a teras.",
        "place": "Praha",
        "period": "březen 2023 – prosinec 2024",
    },
    {
        "id": "liberec-c",
        "title": "Agrotechnology park Liberec hala C",
        "desc": "Výstavba výrobně administrativní a skladové haly s infrastrukturou.",
        "place": "Liberec – Doubí",
        "period": "duben 2021 – květen 2023",
        "photo": PHOTO["liberec_2"],
        "w": 1000,
        "h": 749,
        "small": True,
        "vizualizace": True,
    },
    {
        "id": "liberec-b",
        "title": "Agrotechnology park Liberec hala B",
        "desc": "Výstavba výrobně administrativní a skladové haly s infrastrukturou.",
        "place": "Liberec – Doubí",
        "period": "duben 2021 – prosinec 2023",
        "photo": PHOTO["liberec_1"],
        "w": 1000,
        "h": 749,
        "small": True,
        "vizualizace": True,
        "status": "Dokončeno",
    },
    {
        "id": "liberec-a",
        "title": "Agrotechnology park Liberec hala A",
        "desc": "Výstavba výrobně administrativní a skladové haly s infrastrukturou.",
        "place": "Liberec – Doubí",
        "period": "duben 2021 – listopad 2021",
        "photo": PHOTO["liberec_3"],
        "w": 1000,
        "h": 749,
        "small": True,
        "vizualizace": True,
    },
    {
        "id": "novodvorska",
        "title": "OC Novodvorská Plaza",
        "desc": "Rekonstrukce obchodního centra včetně eskalátoru, sociálního zázemí a fasády.",
        "place": "Praha 4",
        "period": "srpen 2020 – prosinec 2020",
        "photo": PHOTO["novodvorska"],
        "w": 544,
        "h": 725,
        "small": True,
    },
    {
        "id": "olympia-teplice",
        "title": "OC Olympia Teplice",
        "desc": "Obnova podhledů, dveří, fasády a venkovních ploch.",
        "place": "Teplice",
        "period": "březen 2020 – říjen 2020",
    },
    {
        "id": "vranany",
        "title": "Vraňany Farma Hanč",
        "desc": "Novostavba polyfunkčního objektu s prodejnou, kavárnou, bistrem a bytem pro soukromého investora.",
        "place": "Vraňany",
        "period": "únor 2020 – duben 2021",
        "role": "Generální dodavatel",
        "status": "Dokončeno",
        "photo": PHOTO["vranany"],
        "w": 1920,
        "h": 1080,
        "vizualizace": True,
    },
    {
        "id": "botanicka",
        "title": "Jižní vstup do Botanické zahrady",
        "desc": "Vybudování nového jižního vstupu do Botanické zahrady hl. m. Prahy.",
        "place": "Praha 7",
        "period": "červenec 2019 – červen 2020",
        "photo": PHOTO["botanicka"],
        "w": 1919,
        "h": 1280,
        "vizualizace": True,
    },
    {
        "id": "vinice",
        "title": "Bytový dům U Vinice",
        "desc": "Novostavba bytového domu.",
        "place": "Praha 7",
        "period": "červenec 2019 – červen 2020",
        "photo": PHOTO["vinice"],
        "w": 544,
        "h": 264,
        "small": True,
    },
    {
        "id": "hluckova",
        "title": "Bytový dům Hlučkova",
        "desc": "Novostavba bytového domu.",
        "place": "Praha",
        "photo": PHOTO["hluckova"],
        "w": 909,
        "h": 523,
        "small": True,
    },
    {
        "id": "tmobile-opravy",
        "title": "T-Mobile opravy střechy a teras",
        "desc": "Rekonstrukce střešního pláště prvního nadzemního podlaží a vybraných teras.",
        "place": "Praha 4",
        "period": "květen 2019 – červenec 2019",
    },
    {
        "id": "olympia-mb",
        "title": "OC Olympia Mladá Boleslav",
        "desc": "Modernizace obchodního centra včetně nájemních jednotek, vstupu a fasád.",
        "place": "Mladá Boleslav",
        "period": "říjen 2018 – srpen 2019",
    },
    {
        "id": "nebusice",
        "title": "Rodinný dům Nebušice",
        "desc": "Rekonstrukce rodinného domu.",
        "place": "Praha 6",
        "period": "srpen 2018 – listopad 2019",
    },
    {
        "id": "lidl-as",
        "title": "Lidl Aš",
        "desc": "Rozšíření prodejny a parkoviště za provozu.",
        "place": "Aš, Karlovarský kraj",
        "period": "září 2018 – prosinec 2018",
    },
    {
        "id": "lidl-chodov",
        "title": "Lidl Chodov",
        "desc": "Přístavba pekárny a výkupu lahví za provozu prodejny.",
        "place": "Chodov, Karlovarský kraj",
        "period": "září 2018 – listopad 2018",
    },
    {
        "id": "radejovice",
        "title": "Mostní konstrukce Radějovice Babice",
        "desc": "Sanace, zesílení a odvodnění mostních konstrukcí.",
        "place": "Radějovice – Babice",
        "period": "červen 2018 – říjen 2018",
    },
]

# Matej: publish only projects that have a real photo from the approved set.
IN_PROGRESS = [p for p in IN_PROGRESS if p.get("photo")]
DONE = [p for p in DONE if p.get("photo")]


def photo_alt(item):
    title = item["title"]
    return f"Vizualizace: {title}" if item.get("vizualizace") else title


def media_img(item):
    dims = ""
    if item.get("w") and item.get("h"):
        dims = f' width="{item["w"]}" height="{item["h"]}"'
    caption = '<span class="media-caption">Vizualizace</span>' if item.get("vizualizace") else ""
    return f'<img src="{item["photo"]}" alt="{photo_alt(item)}"{dims} loading="lazy" decoding="async" />{caption}'


def media_classes(item, base):
    classes = [base]
    if item.get("small"):
        classes.append("is-small-slot")
    if item.get("vizualizace"):
        classes.append("is-viz")
    return " ".join(classes)


def project_card(item, period_label=None):
    photo = item.get("photo")
    media = (
        f'<div class="{media_classes(item, "realizace-media")}">{media_img(item)}</div>'
        if photo
        else '<div class="realizace-media is-empty" aria-hidden="true"></div>'
    )
    role = f'<div><dt>Role</dt><dd>{item["role"]}</dd></div>' if item.get("role") else ""
    label = period_label or item.get("period_label") or "Období realizace"
    period = (
        f'<div><dt>{label}</dt><dd>{item["period"]}</dd></div>'
        if item.get("period")
        else ""
    )
    return f"""        <article class="realizace-card" id="{item["id"]}">
          {media}
          <div class="realizace-body">
            <h3>{item["title"]}</h3>
            <p>{item["desc"]}</p>
            <dl>
              <div><dt>Místo</dt><dd>{item["place"]}</dd></div>
              {period}
              {role}
            </dl>
          </div>
        </article>"""


def picked_card(item, href):
    photo = item.get("photo")
    media = (
        f'<div class="{media_classes(item, "picked-media")}">{media_img(item)}</div>'
        if photo
        else '<div class="picked-media"><div class="picked-empty" aria-hidden="true"></div></div>'
    )
    return f"""            <article class="picked-card">
              {media}
              <div class="picked-body">
                <h3>{item["title"]}</h3>
                <p>{item["desc"]}</p>
                <p class="picked-status">{item["status"]}</p>
                <a class="picked-link" href="{href}">Více o realizaci</a>
              </div>
            </article>"""


FAQ = [
    (
        "Jak probíhá první konzultace",
        "Před konzultací si prostudujeme váš projekt a dostupné informace. Při jednání probereme váš záměr, rozsah a termíny. Konzultace může proběhnout u vás, v našem sídle nebo online.",
    ),
    (
        "Jak rychle dostanu cenovou nabídku",
        "Termín přípravy nabídky domluvíme po upřesnění zadání a případné prohlídce. Závisí na rozsahu stavby a úplnosti podkladů. U složitějších projektů počítáme s časem potřebným pro sestavení rozpočtu a vyjasnění jednotlivých částí dodávky.",
    ),
    (
        "Jaké velikosti projektů realizujete",
        "Zaměřujeme se na stavební projekty s investičním objemem od 50 mil. Kč bez DPH. Realizujeme rezidenční, komerční a provozní objekty pro developery, soukromé investory a další zadavatele. Možnost spolupráce posoudíme podle konkrétního záměru, rozsahu a technických podmínek.",
    ),
    (
        "Ve kterých regionech působíte",
        "Působíme především v Praze a Středních Čechách. Vybrané projekty realizujeme také v dalších regionech České republiky. Možnost spolupráce projednáme podle konkrétního zadání.",
    ),
    (
        "Pracujete s vlastními kapacitami nebo se subdodavateli",
        "Stavbu řídí náš tým a pro jednotlivé profese pracujeme se stabilní sítí prověřených subdodavatelů. Jejich výběr, koordinaci a kontrolu kvality zajišťujeme v rámci generální dodávky.",
    ),
    (
        "Jaká je záruka na provedené práce",
        "Na provedené práce poskytujeme záruku v rozsahu sjednaném ve smlouvě o dílo. Délku záruky, podmínky jejího uplatnění a postup při reklamaci upřesníme v nabídce a smluvní dokumentaci podle konkrétní dodávky.",
    ),
    (
        "Jaký rozsah rekonstrukcí zvládnete",
        "Zajišťujeme dílčí modernizace i komplexní rekonstrukce a revitalizace objektů, včetně stavebních úprav technických zařízení budov. Možnost prací za provozu posoudíme podle technických a provozních podmínek.",
    ),
    (
        "Zajímá vás práce u nás",
        "Aktuální pozice najdete v části Kariéra na stránce O společnosti. Životopis nebo stručné představení můžete poslat na rada@austis.cz.",
    ),
]


def faq_jsonld():
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in FAQ
        ],
    }
    dumped = json.dumps(payload, ensure_ascii=False, indent=2)
    return f"    <script type=\"application/ld+json\">\n    {dumped}\n    </script>"


def write(name, html):
    path = ROOT / name
    path.write_text(html, encoding="utf-8")
    print(f"wrote {name} ({len(html)} bytes)")


def render_index():
    seibert = next(p for p in IN_PROGRESS if p["id"] == "seibert")
    vranany = next(p for p in DONE if p["id"] == "vranany")
    liberec_b = next(p for p in DONE if p["id"] == "liberec-b")
    html = head(
        "AUSTIS Pozemní stavby | Generální dodávky novostaveb a rekonstrukcí",
        "Realizujeme rezidenční, komerční a provozní objekty pro developery, investory a provozovatele budov.",
        "/",
    )
    start = chrome_start(
        "home",
        "AUSTIS Pozemní stavby",
        "Agrotechnology park Liberec",
        "Generální dodávky novostaveb a rekonstrukcí",
        "Realizujeme rezidenční, komerční a provozní objekty pro developery, investory a provozovatele budov.",
        "#vybrane-realizace",
        "Prohlédnout realizace",
        "Prohlédnout<br />realizace",
        home=True,
    )
    body = f"""
      <section id="co-zajistime" class="trio flow-first" aria-labelledby="zajistime-title">
        <h2 id="zajistime-title">Co pro vás zajistíme</h2>
        <div class="trio-grid cols-2">
          <article>
            <h3>Novostavby</h3>
            <p>Novostavby bytových, komerčních, administrativních a polyfunkčních objektů.</p>
            <p><a class="text-link" href="sluzby.html#pozemni-stavby">Více o pozemních stavbách</a></p>
          </article>
          <article>
            <h3>Rekonstrukce a revitalizace</h3>
            <p>Modernizujeme a přestavujeme stávající budovy a areály. Postup navrhujeme podle technického stavu objektu, vašich priorit a rozpočtu. U využívaných budov posoudíme možnosti etapizace a prací za provozu.</p>
            <p><a class="text-link" href="sluzby.html#pozemni-stavby">Více o rekonstrukcích</a></p>
          </article>
        </div>
      </section>

      <section id="vybrane-realizace" class="picked-section" aria-labelledby="picked-title">
        <div class="picked-head">
          <h2 id="picked-title">Vybrané realizace</h2>
          <p>Představujeme výběr dokončených i právě realizovaných staveb.</p>
        </div>
        <div class="picked-grid">
{picked_card(seibert, "projekty.html#seibert")}
{picked_card(vranany, "projekty.html#vranany")}
{picked_card(liberec_b, "projekty.html#liberec-b")}
        </div>
        <a class="btn btn-dark picked-all" href="projekty.html"><span class="btn-label">Všechny realizace</span></a>
      </section>

      <section id="spoluprace" class="contact-steps-section" aria-labelledby="spoluprace-title">
        <div class="contact-steps-head">
          <h2 id="spoluprace-title">Jak probíhá spolupráce</h2>
        </div>
        <ol class="contact-steps">
          <li>
            <span class="contact-step-num" aria-hidden="true">01</span>
            <div>
              <h3>První jednání</h3>
              <p>Probereme váš stavební záměr, lokalitu, dostupné podklady a požadovaný termín. Upřesníme rozsah spolupráce a další kroky přípravy nabídky.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">02</span>
            <div>
              <h3>Příprava realizace</h3>
              <p>Podle zadání připravíme postup prací, harmonogram a rozpočet. Vyjasníme také činnosti, které zajistíme my, a součinnost potřebnou od investora.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">03</span>
            <div>
              <h3>Průběh stavby</h3>
              <p>Zajistíme kompletní realizaci stavby. O postupu, nákladech a otázkách, které vyžadují vaše rozhodnutí, vás pravidelně informujeme dohodnutou formou.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">04</span>
            <div>
              <h3>Dokončení a předání</h3>
              <p>Předáme dokončené dílo. Rozsah součinnosti při kolaudaci a navazujících činnostech vychází ze smluvního zadání.</p>
            </div>
          </li>
        </ol>
        <p class="section-follow"><a class="text-link" href="sluzby.html#generalni-dodavka">Podrobnosti o generální dodávce</a></p>
      </section>

      <section id="spolecnost" class="about-teaser" aria-labelledby="about-home-title">
        <div class="about-teaser-copy">
          <h2 id="about-home-title">O společnosti</h2>
          <p>Jsme součástí skupiny AUSTIS a.s. Zaměřujeme se na generální dodávky průmyslové, občanské a bytové výstavby pro soukromé investory i veřejný sektor. Naše zaměření a zkušenosti představujeme prostřednictvím konkrétních služeb a realizací.</p>
          <p><a class="text-link" href="o-spolecnosti.html">O společnosti</a></p>
        </div>
        <div class="about-teaser-career" id="kariera-teaser">
          <h2>Kariéra</h2>
          <p>Rozšiřujeme tým. Hledáme kolegy pro vedení staveb a výrobní přípravu. Zajímá vás práce na stavebních projektech? Podívejte se na aktuální pozice a napište nám.</p>
          <p><a class="text-link" href="o-spolecnosti.html#kariera">Volné pozice</a></p>
        </div>
      </section>

      <section class="austis-cta home-cta" aria-labelledby="home-cta-title">
        <div class="austis-cta-copy">
          <h2 id="home-cta-title">Připravujete novostavbu nebo rekonstrukci</h2>
          <p>Pošlete nám základní zadání vašeho stavebního záměru. Prostudujeme vaše podklady a dohodneme nezávaznou konzultaci a další postup.</p>
          <p class="home-cta-contacts"><a href="tel:{PHONE_TEL}">{PHONE}</a> · <a href="mailto:{EMAIL}">{EMAIL}</a></p>
        </div>
        {cta_btn()}
      </section>
"""
    write("index.html", html + start + body + page_end())


def render_sluzby():
    extra_ld = breadcrumb("Služby", "/sluzby") + """
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": "Generální dodávka",
          "serviceType": "Generální dodávka stavby",
          "description": "Zajišťujeme generální dodávky novostaveb a rekonstrukcí pro developery a investory.",
          "url": "https://aps.austis.cz/sluzby#generalni-dodavka",
          "provider": { "@type": "Organization", "name": "AUSTIS Pozemní stavby s.r.o.", "url": "https://aps.austis.cz" }
        },
        {
          "@type": "Service",
          "name": "Pozemní stavby",
          "serviceType": "Pozemní stavby",
          "description": "Realizujeme novostavby a rekonstrukce rezidenčních, komerčních a provozních objektů.",
          "url": "https://aps.austis.cz/sluzby#pozemni-stavby",
          "provider": { "@type": "Organization", "name": "AUSTIS Pozemní stavby s.r.o.", "url": "https://aps.austis.cz" }
        }
      ]
    }
    </script>"""
    html = head(
        "Služby pro novostavby a rekonstrukce | AUSTIS",
        "Zajišťujeme generální dodávky novostaveb a rekonstrukcí pro developery a investory.",
        "/sluzby",
        extra_ld,
    )
    start = chrome_start(
        "sluzby",
        "AUSTIS služby",
        "Agrotechnology park Liberec",
        "Služby pro novostavby a rekonstrukce",
        "Zajišťujeme generální dodávky novostaveb a rekonstrukcí pro developery a investory.",
        "#prehled-sluzeb",
        "přehled služeb",
        "přehled<br />služeb",
    )
    body = """
      <section id="prehled-sluzeb" class="trio flow-first" aria-labelledby="sp-overview-title">
        <h2 id="sp-overview-title">Služby pro novostavby a rekonstrukce</h2>
        <p>
          <a class="text-link" href="#generalni-dodavka">Generální dodávka</a>
          ·
          <a class="text-link" href="#pozemni-stavby">Pozemní stavby</a>
        </p>
      </section>

      <section id="generalni-dodavka" class="figure-split is-text-only" aria-labelledby="sp-detail-1-title">
        <div class="figure-split-copy">
          <h2 id="sp-detail-1-title">Generální dodávka</h2>
          <p>Zajišťujeme generální dodávky novostaveb a rekonstrukcí pro developery a investory. Konkrétní rozsah dodávky a podmínky realizace sjednáváme podle projektové dokumentace a zadání investora.</p>
          <ul class="line-list">
            <li><strong>Příprava a plánování.</strong> Projdeme zadání a dostupnou projektovou dokumentaci, posoudíme podmínky místa a upřesníme rozsah prací. Připravíme postup realizace, harmonogram a rozpočet.</li>
            <li><strong>Výběr a koordinace subdodavatelů.</strong> Pracujeme se stabilní sítí prověřených firem. Pro každou stavbu vybíráme dodavatele jednotlivých profesí, organizujeme návaznost prací na stavbě a zajišťujeme jejich vzájemnou součinnost.</li>
            <li><strong>Řízení harmonogramu.</strong> Harmonogram sestavujeme podle požadavků projektu, dodávek materiálů a návaznosti prací. Sledujeme klíčové milníky a průběžně vyhodnocujeme postup. Pokud se podmínky změní, projednáme potřebnou úpravu plánu a její dopad na další fáze realizace.</li>
            <li><strong>Kontrola nákladů a změn.</strong> Rozpočet sledujeme průběžně a na odchylky upozorňujeme včas. Změny a jejich dopad na cenu, rozsah nebo termín projednáváme před jejich provedením. Investor tak dostává podklady pro rozhodování během stavby.</li>
            <li><strong>Kontrola kvality.</strong> Kontrolujeme provedené práce a jejich soulad s projektovým a smluvním zadáním. Odpovídáme za kvalitu sjednané dodávky.</li>
            <li><strong>Informování investora.</strong> V pravidelných přehledech předáváme informace o rozpracovanosti, čerpání rozpočtu a rizicích. Upozorňujeme na otázky, které vyžadují rozhodnutí investora. Formu a četnost informování nastavíme na začátku spolupráce podle potřeb zakázky.</li>
            <li><strong>Dokončení a předání.</strong> Předáme dokončené dílo. Rozsah součinnosti při kolaudaci a navazujících činnostech vychází ze smluvního zadání.</li>
          </ul>
          <a class="btn btn-red" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat generální dodávku</span></a>
        </div>
      </section>

      <section id="pozemni-stavby" class="figure-split is-text-only" aria-labelledby="sp-detail-2-title">
        <div class="figure-split-copy">
          <h2 id="sp-detail-2-title">Pozemní stavby</h2>
          <p>Realizujeme novostavby a rekonstrukce rezidenčních, komerčních a provozních objektů. Dodávka může zahrnovat celý stavební projekt od zemních prací a hrubé stavby přes technická zařízení budov až po dokončovací práce a předání.</p>
          <p>Rozsah díla vychází z projektové dokumentace a sjednaného zadání.</p>
          <h3>Typy staveb a souvisejících prací</h3>
          <ul class="line-list">
            <li>Rezidenční objekty a bytové domy.</li>
            <li>Komerční a administrativní budovy.</li>
            <li>Provozní a zemědělské areály.</li>
            <li>Technická zařízení budov.</li>
            <li>Inženýrské sítě a venkovní zpevněné plochy.</li>
          </ul>
          <a class="btn btn-red" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat pozemní stavbu</span></a>
        </div>
      </section>

      <section class="austis-cta" aria-labelledby="sluzby-cta-title">
        <div class="austis-cta-copy">
          <h2 id="sluzby-cta-title">Probereme rozsah vaší zakázky</h2>
          <p>Máte připravený projekt, nebo teprve vyjasňujete zadání? Napište nám. Domluvíme si nezávaznou konzultaci a upřesníme podklady potřebné pro posouzení spolupráce.</p>
        </div>
        <a class="btn btn-red" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat spolupráci</span></a>
      </section>
"""
    write("sluzby.html", html + start + body + page_end())


def render_projekty():
    html = head(
        "Realizace novostaveb a rekonstrukcí | AUSTIS Pozemní stavby",
        "Přehled dokončených i právě realizovaných staveb AUSTIS Pozemní stavby.",
        "/projekty",
        breadcrumb("Realizace", "/projekty"),
    )
    start = chrome_start(
        "projekty",
        "AUSTIS realizace",
        "Agrotechnology park Liberec",
        "Realizace novostaveb a rekonstrukcí",
        "Přehled dokončených i právě realizovaných staveb.",
        "#v-realizaci",
        "přehled realizací",
        "přehled<br />realizací",
    )
    in_progress = "\n".join(project_card(p, p.get("period_label")) for p in IN_PROGRESS)
    done = "\n".join(project_card(p) for p in DONE)
    body = f"""
      <section id="v-realizaci" class="realizace-group flow-first" aria-labelledby="inprogress-title">
        <h2 id="inprogress-title">V realizaci</h2>
        <div class="realizace-list">
{in_progress}
        </div>
      </section>

      <section id="dokoncene" class="realizace-group" aria-labelledby="done-title">
        <h2 id="done-title">Dokončené projekty</h2>
        <div class="realizace-list">
{done}
        </div>
      </section>

      <section class="austis-cta" aria-labelledby="projekty-cta-title">
        <div class="austis-cta-copy">
          <h2 id="projekty-cta-title">Připravujete podobný projekt</h2>
          <p>Napište nám, co plánujete a v jaké fázi přípravy se nacházíte. Projdeme zadání a domluvíme další kroky.</p>
        </div>
        <a class="btn btn-red" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat spolupráci</span></a>
      </section>
"""
    write("projekty.html", html + start + body + page_end())


def render_about():
    html = head(
        "O společnosti | AUSTIS Pozemní stavby",
        "AUSTIS Pozemní stavby s.r.o. je součástí skupiny AUSTIS. Zaměřujeme se především na generální dodávky průmyslové, občanské a bytové výstavby na klíč.",
        "/o-spolecnosti",
        breadcrumb("O společnosti", "/o-spolecnosti"),
    )
    start = chrome_start(
        "o-spolecnosti",
        "AUSTIS o společnosti",
        "Agrotechnology park Liberec",
        "AUSTIS Pozemní stavby",
        "AUSTIS Pozemní stavby s.r.o. je součástí skupiny AUSTIS. Zaměřujeme se především na generální dodávky průmyslové, občanské a bytové výstavby na klíč. Našimi zákazníky jsou developeři, soukromí investoři, firmy i veřejní zadavatelé; spolupracujeme také s jejich pověřenými zástupci.",
        "#o-spolecnosti",
        "více o společnosti",
        "více o<br />společnosti",
    )
    body = """
      <section id="o-spolecnosti" class="about-prose flow-first" aria-labelledby="about-intro-title">
        <h2 id="about-intro-title">AUSTIS Pozemní stavby</h2>
        <p>AUSTIS Pozemní stavby s.r.o. je součástí skupiny AUSTIS. Zaměřujeme se především na generální dodávky průmyslové, občanské a bytové výstavby na klíč. Našimi zákazníky jsou developeři, soukromí investoři, firmy i veřejní zadavatelé; spolupracujeme také s jejich pověřenými zástupci.</p>
        <p>Naše zaměření zahrnuje novostavby a rekonstrukce. Konkrétní zkušenosti představujeme v přehledu vybraných realizací, kde uvádíme jednotlivé objekty a naši roli při jejich výstavbě nebo modernizaci.</p>
      </section>

      <section class="about-prose" aria-labelledby="group-title">
        <h2 id="group-title">Zázemí skupiny AUSTIS</h2>
        <p>Společnost AUSTIS a.s. byla založena v roce 1990. Její činnost zahrnuje stavební chemii, stavební činnost a správu nemovitostí. Stavebním zakázkám se věnuje od roku 1996.</p>
        <p>S rozšířením těchto aktivit byly stavební a stavebně technické služby rozděleny mezi dceřiné společnosti AUSTIS Pozemní stavby s.r.o. a AUSTIS stavební s.r.o. AUSTIS Pozemní stavby se soustředí na generální dodávky stavebních projektů. AUSTIS stavební se specializuje na technický dozor stavebníka a koordinaci BOZP na staveništi.</p>
        <figure class="hq-photo is-small-slot">
          <img src="assets/photos/sidlo-austis-slivenec-1.webp" alt="Sídlo skupiny AUSTIS, K Austisu 680, Praha 5 – Slivenec" width="693" height="517" loading="lazy" decoding="async" />
        </figure>
      </section>

      <section class="trio" aria-labelledby="who-title">
        <h2 id="who-title">Pro koho pracujeme</h2>
        <div class="trio-grid cols-2">
          <article>
            <h3>Investoři</h3>
            <p>Spolupracujeme s investory připravujícími stavební projekty většího rozsahu. Při přípravě zakázky vycházíme z jejich investičního záměru, projektových podkladů a požadovaného termínu.</p>
          </article>
          <article>
            <h3>Developeři</h3>
            <p>Realizujeme rezidenční i komerční projekty. Při plánování zohledňujeme návaznost stavební dodávky na další části developerského záměru.</p>
          </article>
          <article>
            <h3>Firmy a provozovatelé</h3>
            <p>Stavíme provozní objekty a modernizujeme budovy a areály. U využívaných objektů je součástí přípravy také projednání provozních podmínek a případné etapizace.</p>
          </article>
          <article>
            <h3>Veřejný sektor</h3>
            <p>Naše zaměření zahrnuje také generální dodávky výstavby pro veřejné zadavatele.</p>
          </article>
        </div>
      </section>

      <section class="about-prose" aria-labelledby="people-title">
        <h2 id="people-title">Lidé a dodavatelé</h2>
        <p>Přípravu a vedení zakázek zajišťuje náš tým. Pro jednotlivé profese spolupracujeme se stabilní sítí prověřených subdodavatelů. Jejich výběr a koordinace patří do řízení realizace, které podrobně představujeme na stránce služeb.</p>
        <p>
          <a class="text-link" href="sluzby.html">Naše služby</a>
          ·
          <a class="text-link" href="projekty.html">Realizace</a>
        </p>
      </section>

      <section id="kariera" class="about-prose career-block" aria-labelledby="about-career-title">
        <h2 id="about-career-title">Přidejte se k našemu týmu</h2>
        <p>Rozšiřujeme tým o kolegy pro vedení staveb a výrobní přípravu. Hledáme lidi, kteří chtějí pracovat na konkrétních stavebních projektech a uplatnit své zkušenosti při jejich přípravě nebo realizaci.</p>
        <div class="trio-grid cols-2 career-grid">
          <article>
            <h3>Stavbyvedoucí</h3>
            <p>Samostatné vedení staveb v roli generálního dodavatele a koordinace prací jednotlivých profesí.</p>
          </article>
          <article>
            <h3>Výrobní příprava staveb</h3>
            <p>Příprava zakázek, rozpočtů, harmonogramů a podkladů pro navazující realizaci.</p>
          </article>
        </div>
        <p>Zajímá vás některá z pozic? Pošlete nám na <a href="mailto:info@austis.cz">info@austis.cz</a> životopis nebo stručné představení a uveďte oblast svého zájmu. Domluvíme další kontakt a probereme náplň práce i podmínky spolupráce.</p>
        <a class="btn btn-red" href="mailto:info@austis.cz"><span class="btn-label">Mám zájem o práci</span></a>
      </section>
"""
    write("o-spolecnosti.html", html + start + body + page_end())


def render_kontakt():
    html = head(
        "Kontakt | AUSTIS Pozemní stavby",
        "Plánujete novostavbu nebo rekonstrukci? Spojte se s námi a domluvte si nezávaznou konzultaci.",
        "/kontakt",
        breadcrumb("Kontakt", "/kontakt") + "\n" + faq_jsonld(),
    )
    start = chrome_start(
        "kontakt",
        "AUSTIS kontakt",
        "Agrotechnology park Liberec",
        "Probereme váš stavební záměr",
        "Plánujete novostavbu nebo rekonstrukci? Spojte se s námi a domluvte si nezávaznou konzultaci. Pro první kontakt nám stačí základní představa o projektu, lokalitě a předpokládaném termínu.",
        "#kontakt-udaje",
        "kontaktní údaje",
        "kontaktní<br />údaje",
    )
    faqs = "\n".join(
        f"""          <details class="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>"""
        for q, a in FAQ
    )
    body = f"""
      <section id="kontakt-udaje" class="contact-detail flow-first" aria-labelledby="contact-detail-title">
        <div class="contact-detail-lead">
          <h2 id="contact-detail-title">Kontaktní údaje</h2>
          <a class="contact-mail" href="mailto:{EMAIL}">
            <span class="contact-mail-label">E-mail</span>
            <span class="contact-mail-value">{EMAIL}</span>
          </a>
          <div class="contact-address">
            <span class="contact-mail-label">Adresa</span>
            <p>AUSTIS Pozemní stavby s.r.o.</p>
            <p>K Austisu 680, 154 00 Praha 5 – Slivenec</p>
          </div>
          <p class="contact-ids">IČ: <a href="{ICO_HREF}">{ICO}</a> · DIČ: <a href="{DIC_HREF}">{DIC}</a></p>
          <div class="contact-actions">
            <a class="btn btn-dark" href="tel:{PHONE_TEL}"><span class="btn-label">Zavolat</span></a>
            <a class="btn btn-dark" href="mailto:{EMAIL}"><span class="btn-label">Napsat e-mail</span></a>
            <a class="btn btn-red" href="poptavka.html#poptavka-form"><span class="btn-label">Poptat spolupráci</span></a>
          </div>
        </div>
        <figure class="contact-hq is-small-slot">
          <img src="{HQ_PHOTO}" alt="Sídlo skupiny AUSTIS, K Austisu 680, Praha 5 – Slivenec" width="693" height="517" loading="lazy" decoding="async" />
        </figure>
      </section>

      <section id="spoluprace-kroky" class="contact-steps-section" aria-labelledby="contact-process-title">
        <div class="contact-steps-head">
          <h2 id="contact-process-title">Jak zahájíme spolupráci</h2>
        </div>
        <ol class="contact-steps">
          <li>
            <span class="contact-step-num" aria-hidden="true">01</span>
            <div>
              <h3>Domluvíme konzultaci</h3>
              <p>Po přijetí zprávy vás kontaktujeme a domluvíme první jednání. Konzultace může proběhnout osobně nebo online podle potřeb projektu a vzájemné dohody.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">02</span>
            <div>
              <h3>Projdeme zadání a podklady</h3>
              <p>Probereme předložené podklady dané stavby, lokalitu, vaše priority a požadovaný termín. Podle dostupné dokumentace posoudíme, co bude potřeba doplnit a zda je vhodná prohlídka místa.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">03</span>
            <div>
              <h3>Navrhneme další postup</h3>
              <p>Upřesníme rozsah spolupráce, navrhneme postup realizace a rámcový harmonogram podle dostupných podkladů. Domluvíme také termín přípravy nabídky.</p>
            </div>
          </li>
          <li>
            <span class="contact-step-num" aria-hidden="true">04</span>
            <div>
              <h3>Připravíme nabídku</h3>
              <p>Po vyjasnění zadání předložíme cenovou nabídku s rozpočtem a smluvními podmínkami dle rozsahu dohodnuté dodávky a požadavků projektu.</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="faq-section" id="faq" aria-labelledby="faq-title">
        <div class="faq-head">
          <h2 id="faq-title">Časté otázky</h2>
        </div>
        <div class="faq-list">
{faqs}
        </div>
        <p class="section-follow"><a class="text-link" href="o-spolecnosti.html#kariera">Volné pozice</a></p>
      </section>
"""
    write("kontakt.html", html + start + body + page_end())


def render_poptavka():
    html = head(
        "Poptat spolupráci | AUSTIS Pozemní stavby",
        "Představte nám svůj stavební záměr. Ozveme se vám a domluvíme další postup.",
        "/poptavka",
        breadcrumb("Poptávka", "/poptavka"),
    )
    start = chrome_start(
        "poptavka",
        "AUSTIS poptávka",
        "Agrotechnology park Liberec",
        "Poptat spolupráci",
        "Představte nám svůj stavební záměr. Uveďte typ objektu, lokalitu, požadovaný rozsah prací a předpokládaný termín. Ozveme se vám a domluvíme další postup.",
        "#poptavka-form",
        "přejít na formulář",
        "vyplnit<br />formulář",
        "",
        True,
    )
    body = f"""
      <section id="poptavka-form" class="inquiry-section flow-first" aria-labelledby="inquiry-title">
        <div class="inquiry-lead">
          <h2 id="inquiry-title">Poptat spolupráci</h2>
          <p>Představte nám svůj stavební záměr. Uveďte typ objektu, lokalitu, požadovaný rozsah prací a předpokládaný termín. Ozveme se vám a domluvíme další postup.</p>
          <p>Pokud si nejste jistí výběrem služby nebo zatím nemáte všechny podklady, popište projekt vlastními slovy. Potřebné doplnění vyjasníme při prvním jednání.</p>
        </div>

        <form class="inquiry-form" id="poptavka-form-el">
          <p class="inquiry-status" role="status" hidden></p>
          <div class="inquiry-form-row">
            <div class="inquiry-field">
              <label for="name">Jméno a příjmení</label>
              <input type="text" id="name" name="name" autocomplete="name" required />
            </div>
            <div class="inquiry-field">
              <label for="company">Společnost</label>
              <input type="text" id="company" name="company" autocomplete="organization" />
            </div>
          </div>
          <div class="inquiry-form-row">
            <div class="inquiry-field">
              <label for="email">E-mail</label>
              <input type="email" id="email" name="email" autocomplete="email" required />
            </div>
            <div class="inquiry-field">
              <label for="phone">Telefon</label>
              <input type="tel" id="phone" name="phone" autocomplete="tel" />
            </div>
          </div>
          <div class="inquiry-form-row">
            <div class="inquiry-field">
              <label for="typ-realizace">Typ realizace</label>
              <select id="typ-realizace" name="typ-realizace">
                <option value="">Vyberte typ realizace</option>
                <option value="novostavba">Novostavba</option>
                <option value="rekonstrukce">Rekonstrukce a revitalizace</option>
                <option value="nejsem-si-jisty">Nejsem si jistý</option>
              </select>
            </div>
            <div class="inquiry-field">
              <label for="typ-stavby">Typ stavby</label>
              <select id="typ-stavby" name="typ-stavby">
                <option value="">Vyberte typ</option>
                <option value="bytovy-dum">Bytový dům nebo rezidenční soubor</option>
                <option value="komercni">Komerční nebo administrativní budova</option>
                <option value="prumysl">Průmyslový objekt</option>
                <option value="provozni">Provozní nebo zemědělský areál</option>
                <option value="rekreacni">Rekreační nebo ubytovací objekt</option>
                <option value="individualni">Individuální rezidenční projekt</option>
                <option value="jine">Jiné</option>
              </select>
            </div>
          </div>
          <div class="inquiry-field inquiry-field--full">
            <label for="location">Lokalita</label>
            <input type="text" id="location" name="location" aria-describedby="location-hint" />
            <p class="inquiry-hint" id="location-hint">Město nebo kraj, ve kterém plánujete realizaci.</p>
          </div>
          <div class="inquiry-field inquiry-field--full">
            <label for="termin">Předpokládaný termín</label>
            <input type="text" id="termin" name="termin" aria-describedby="termin-hint" />
            <p class="inquiry-hint" id="termin-hint">Uveďte plánované zahájení nebo dokončení. Pokud termín ještě neznáte, nechte pole prázdné.</p>
          </div>
          <div class="inquiry-field inquiry-field--full">
            <label for="message">Popis projektu</label>
            <textarea id="message" name="message" aria-describedby="message-hint" required></textarea>
            <p class="inquiry-hint" id="message-hint">Popište plánované práce a jejich rozsah. Uveďte také, zda máte projektovou dokumentaci a v jaké fázi přípravy se projekt nachází.</p>
          </div>
          <label class="inquiry-consent">
            <input type="checkbox" name="consent" required />
            <span>Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky. <a href="osobni-udaje.html">Informace o zpracování osobních údajů</a></span>
          </label>
          <button type="submit" class="btn btn-red"><span class="btn-label">Odeslat poptávku</span></button>
        </form>

        <aside class="inquiry-aside">
          <h3>Co se stane po odeslání</h3>
          <p>Kontaktujeme vás a domluvíme první konzultaci. Projdeme základní zadání a dostupné podklady, upřesníme rozsah spolupráce a termín přípravy nabídky. Podrobný postup a odpovědi na časté otázky najdete na kontaktní stránce.</p>
          <p><a class="text-link" href="kontakt.html#spoluprace-kroky">Jak zahájíme spolupráci</a></p>
          <h3>Preferujete přímý kontakt</h3>
          <p>Zavolejte na <a href="tel:{PHONE_TEL}"><strong>{PHONE}</strong></a> nebo napište na <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
          <p>Jsme vám k dispozici každý pracovní den od 7:00 do 18:00.</p>
        </aside>
      </section>
"""
    write("poptavka.html", html + start + body + page_end())


def render_privacy():
    html = head(
        "Informace o zpracování osobních údajů | AUSTIS Pozemní stavby",
        "Informace o zpracování osobních údajů AUSTIS Pozemní stavby.",
        "/osobni-udaje",
        breadcrumb("Informace o zpracování osobních údajů", "/osobni-udaje"),
    )
    start = chrome_start(
        "osobni-udaje",
        "AUSTIS informace o zpracování osobních údajů",
        "Agrotechnology park Liberec",
        "Informace o zpracování osobních údajů",
        "Text informací o zpracování osobních údajů provozovatel dosud nedodal.",
        "#osobni-udaje",
        "k textu",
        "k textu",
    )
    body = f"""
      <section id="osobni-udaje" class="about-prose flow-first" aria-labelledby="privacy-title">
        <h2 id="privacy-title">Informace o zpracování osobních údajů</h2>
        <p>Text informací o zpracování osobních údajů provozovatel dosud nedodal. Doplníme jej po dodání od odpovědné osoby.</p>
        <p>Poptávky zatím posílejte na <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
      </section>
"""
    write("osobni-udaje.html", html + start + body + page_end())


def main():
    render_index()
    render_sluzby()
    render_projekty()
    render_about()
    render_kontakt()
    render_poptavka()
    render_privacy()


if __name__ == "__main__":
    main()
