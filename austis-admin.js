/* ============================================================
   AUSTIS Admin — správní panel (ukázka rozhraní)
   Client-side only. Data se ukládají do localStorage.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const uid = () => Math.random().toString(36).slice(2, 9);

  const SITES = {
    austis: { label: "AUSTIS a.s.", accent: "austis", url: "www.austis.cz" },
    stavebni: { label: "AUSTIS Stavební", accent: "stavebni", url: "www.austis-stavebni.cz" },
    real: { label: "AUSTIS Real", accent: "real", url: "www.austis-real.cz" },
    eternal: { label: "ETERNAL", accent: "eternal", url: "www.barvy-eternal.cz" },
  };
  const siteLabel = (k) => (SITES[k] ? SITES[k].label : k);

  const MONTHS = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
  function fmtDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function relTime(iso) {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `před ${Math.max(1, Math.round(diff / 60))} min`;
    if (diff < 86400) return `před ${Math.round(diff / 3600)} h`;
    if (diff < 172800) return "včera";
    return fmtDate(iso);
  }
  function daysAgoISO(days, hour = 9) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
    return d.toISOString();
  }

  /* ---------- Seed data ---------- */
  const SEED = {
    inquiries: [
      { id: uid(), site: "real", type: "poptavka", name: "SVJ Křížová 12", email: "predseda@svj-krizova.cz", phone: "+420 604 118 220", subject: "Nabídka na správu bytového domu (28 j.)", message: "Dobrý den,\nhledáme nového správce pro náš bytový dům na Praze 5. Jde o 28 bytových jednotek, 2 nebytové prostory. Zajímá nás kompletní technická i ekonomická správa. Můžete nám prosím zaslat nabídku?\n\nDěkuji, Ing. Marek Dvořák", date: daysAgoISO(0, 8), status: "new" },
      { id: uid(), site: "stavebni", type: "poptavka", name: "Petr Novotný", email: "p.novotny@develop-hb.cz", phone: "+420 777 552 013", subject: "Generální dodávka — administrativní budova", message: "Dobrý den,\npoptáváme generálního dodavatele na výstavbu administrativní budovy (4 NP, cca 2 200 m²) v Praze-Zbraslav. Máme hotovou projektovou dokumentaci pro provádění stavby. Předpokládané zahájení Q3.\n\nBudeme rádi za schůzku.", date: daysAgoISO(0, 11), status: "new" },
      { id: uid(), site: "eternal", type: "kontakt", name: "Barvy-laky Horák", email: "objednavky@bl-horak.cz", phone: "+420 585 224 118", subject: "Velkoobchodní ceník ETERNAL", message: "Dobrý den, měli bychom zájem zařadit produkty ETERNAL do sortimentu naší prodejny. Prosím o zaslání velkoobchodního ceníku a podmínek spolupráce.", date: daysAgoISO(1, 14), status: "new" },
      { id: uid(), site: "austis", type: "kontakt", name: "Jana Kučerová", email: "jana.kucerova@email.cz", phone: "+420 723 090 441", subject: "Dotaz na technický dozor (TDS)", message: "Dobrý den, stavíme rodinný dům svépomocí a hledáme technický dozor stavebníka. Je to služba, kterou nabízíte i pro menší stavby? Děkuji.", date: daysAgoISO(2, 10), status: "read" },
      { id: uid(), site: "real", type: "poptavka", name: "BD Slunečná", email: "vybor@bdslunecna.cz", phone: "+420 602 771 004", subject: "Havarijní servis a úklid", message: "Poptáváme zajištění havarijního servisu 24/7 a pravidelného úklidu společných prostor pro bytové družstvo (54 jednotek).", date: daysAgoISO(3, 9), status: "read" },
      { id: uid(), site: "stavebni", type: "poptavka", name: "Město Řevnice", email: "investice@revnice.cz", phone: "+420 257 720 111", subject: "Rekonstrukce ZŠ — koordinátor BOZP", message: "Dobrý den, k plánované rekonstrukci základní školy poptáváme koordinátora BOZP na staveništi. Prosím o kontakt.", date: daysAgoISO(5, 13), status: "archived" },
      { id: uid(), site: "austis", type: "kontakt", name: "Tomáš Bílek", email: "t.bilek@seznam.cz", phone: "+420 608 223 887", subject: "Spolupráce / poptávka portfolia", message: "Dobrý den, zajímá mě celkové portfolio služeb AUSTIS pro připravovaný developerský projekt. Rád bych domluvil úvodní schůzku.", date: daysAgoISO(7, 15), status: "read" },
    ],
    news: [
      { id: uid(), site: "austis", title: "AUSTIS slaví 30 let na trhu", excerpt: "Ohlížíme se za třemi dekádami stavební chemie, realizací a správy nemovitostí.", body: "Letos si připomínáme 30 let od založení společnosti. Za tu dobu jsme vyrostli z výrobce nátěrových hmot v komplexního partnera pro stavebnictví.", category: "Společnost", date: daysAgoISO(4), published: true },
      { id: uid(), site: "eternal", title: "Nová řada ETERNAL na dřevo 2026", excerpt: "Rozšiřujeme portfolio vodou ředitelných lazur o odolnější UV filtr.", body: "Vylepšená receptura přináší delší životnost nátěru a lepší krytí. Dostupné od dubna ve všech odstínech.", category: "Produkty", date: daysAgoISO(9), published: true },
      { id: uid(), site: "stavebni", title: "Dokončili jsme rekonstrukci polikliniky", excerpt: "Předali jsme investorovi kompletně zrekonstruovaný objekt polikliniky v Praze 4.", body: "Rekonstrukce zahrnovala výměnu rozvodů, zateplení a modernizaci interiérů za plného provozu.", category: "Realizace", date: daysAgoISO(15), published: true },
      { id: uid(), site: "real", title: "Rozšiřujeme tým správy nemovitostí", excerpt: "Díky rostoucí poptávce přijímáme nové kolegy do technické správy.", body: "Hledáme technika správy budov a ekonoma. Více v sekci Kariéra.", category: "Nábor", date: daysAgoISO(22), published: false },
    ],
    properties: [
      { id: uid(), title: "Bytový dům Kavčí Hory", ptype: "Bytový dům", location: "Praha 4 – Podolí", units: 42, area: 3180, status: "managed", note: "Kompletní technická a ekonomická správa, havarijní servis 24/7.", image: "assets/austis-real-hero.png" },
      { id: uid(), title: "Administrativní centrum Slivenec", ptype: "Administrativa", location: "Praha 5 – Slivenec", units: 12, area: 2450, status: "managed", note: "Správa komerčního objektu, facility management.", image: "assets/austis-hq.png" },
      { id: uid(), title: "Rezidence U Parku", ptype: "Bytový dům", location: "Praha 6 – Dejvice", units: 28, area: 2100, status: "managed", note: "Ekonomická správa SVJ, vedení účetnictví a fondů oprav.", image: "" },
      { id: uid(), title: "Nebytový prostor — pronájem", ptype: "Komerční", location: "Praha 5 – Smíchov", units: 1, area: 96, status: "free", note: "Volná jednotka vhodná pro obchod či kancelář, ihned k dispozici.", image: "" },
    ],
    jobs: [
      { id: uid(), site: "real", title: "Technik správy nemovitostí", location: "Praha 5", jtype: "Plný úvazek", department: "Správa nemovitostí", published: true, salary: "45 000 – 55 000 Kč", desc: "Zajišťování technického stavu spravovaných objektů, koordinace oprav a revizí, komunikace s vlastníky." },
      { id: uid(), site: "stavebni", title: "Stavbyvedoucí", location: "Praha a Střední Čechy", jtype: "Plný úvazek", department: "Realizace staveb", published: true, salary: "Dle dohody", desc: "Řízení realizace staveb od zahájení po kolaudaci, vedení týmu, kontrola rozpočtu a harmonogramu." },
      { id: uid(), site: "eternal", title: "Technolog výroby nátěrových hmot", location: "Praha 5 – Slivenec", jtype: "Plný úvazek", department: "Výroba", published: true, salary: "40 000 – 50 000 Kč", desc: "Vývoj a optimalizace receptur, kontrola kvality, spolupráce na nových produktech." },
      { id: uid(), site: "austis", title: "Účetní / mzdová účetní", location: "Praha 5", jtype: "Zkrácený úvazek", department: "Ekonomika", published: false, salary: "Dle dohody", desc: "Zpracování účetnictví a mezd, komunikace s úřady, podpora ekonomického oddělení." },
    ],
    contacts: {
      austis: { company: "AUSTIS a.s.", street: "K Austisu 680", city: "154 00 Praha 5 – Slivenec", phone: "+420 251 099 111", email: "austis@austis.cz", ico: "00550655", dic: "CZ00550655", hours: "Po–Pá 7:00–15:30" },
      stavebni: { company: "AUSTIS a.s. — Stavební činnost", street: "K Austisu 680", city: "154 00 Praha 5 – Slivenec", phone: "+420 251 099 120", email: "stavby@austis.cz", ico: "00550655", dic: "CZ00550655", hours: "Po–Pá 7:00–16:00" },
      real: { company: "AUSTIS Real", street: "K Austisu 680", city: "154 00 Praha 5 – Slivenec", phone: "+420 251 099 130", email: "real@austis.cz", ico: "00550655", dic: "CZ00550655", hours: "Po–Pá 8:00–16:00" },
      eternal: { company: "ETERNAL — barvy a laky", street: "K Austisu 680", city: "154 00 Praha 5 – Slivenec", phone: "+420 251 099 140", email: "eternal@austis.cz", ico: "00550655", dic: "CZ00550655", hours: "Po–Pá 7:00–15:00" },
    },
  };

  /* ---------- State / persistence ---------- */
  const STORE_KEY = "austis-admin-store-v1";
  let store;
  try {
    store = JSON.parse(localStorage.getItem(STORE_KEY));
  } catch (e) {
    store = null;
  }
  if (!store || !store.inquiries) {
    store = JSON.parse(JSON.stringify(SEED));
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  let currentSite = "all";
  let currentView = "dashboard";
  let searchTerm = "";
  const filterFor = (arr, extra) =>
    arr.filter((x) => (currentSite === "all" || x.site === currentSite || !x.site) && (!extra || extra(x)));

  /* ---------- Toasts ---------- */
  function toast(msg, kind) {
    const host = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " is-" + kind : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 240);
    }, 2600);
  }

  /* ---------- Modal ---------- */
  const modalRoot = $("#modal-root");
  function openModal(title, bodyHTML, wide) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = bodyHTML;
    $(".admin-modal").classList.toggle("is-wide", !!wide);
    modalRoot.hidden = false;
    document.body.style.overflow = "hidden";
    return $("#modal-body");
  }
  function closeModal() {
    modalRoot.hidden = true;
    $("#modal-body").innerHTML = "";
    document.body.style.overflow = "";
  }
  $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalRoot.hidden) closeModal();
  });

  /* ============================================================
     VIEWS
     ============================================================ */
  const VIEWS = {
    dashboard: { title: "Nástěnka", subtitle: "Souhrn napříč všemi weby", render: renderDashboard },
    inquiries: { title: "Poptávky & formuláře", subtitle: "Zprávy odeslané z webových formulářů", render: renderInquiries },
    news: { title: "Aktuality", subtitle: "Novinky a články publikované na webech", render: renderNews },
    properties: { title: "Nemovitosti", subtitle: "Portfolio spravovaných a nabízených objektů", render: renderProperties },
    jobs: { title: "Kariéra", subtitle: "Nabídky pracovních pozic", render: renderJobs },
    contacts: { title: "Kontaktní údaje", subtitle: "Kontaktní informace zobrazené na webech", render: renderContacts },
    settings: { title: "Nastavení webů", subtitle: "Přehled a stav jednotlivých webů", render: renderSettings },
  };

  const viewEl = $("#admin-view");
  function setView(name) {
    if (!VIEWS[name]) name = "dashboard";
    currentView = name;
    $$(".admin-nav-item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === name));
    $("#view-title").textContent = VIEWS[name].title;
    $("#view-subtitle").textContent = VIEWS[name].subtitle;
    renderCurrent();
    viewEl.focus();
    document.querySelector(".admin-shell").classList.remove("nav-open");
    const scrim = $(".nav-scrim");
    if (scrim) scrim.remove();
  }
  function renderCurrent() {
    viewEl.classList.remove("view-anim");
    void viewEl.offsetWidth;
    viewEl.innerHTML = VIEWS[currentView].render();
    viewEl.classList.add("view-anim");
    bindViewEvents();
    updateBadges();
  }

  /* ---------- Site tag helper ---------- */
  const siteTag = (site) => `<span class="tag site-${site}"><span class="tag-dot"></span>${esc(siteLabel(site))}</span>`;

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function renderDashboard() {
    const inq = filterFor(store.inquiries);
    const newCount = inq.filter((i) => i.status === "new").length;
    const news = filterFor(store.news);
    const publishedNews = news.filter((n) => n.published).length;
    const props = store.properties.length;
    const jobs = filterFor(store.jobs).filter((j) => j.published).length;

    const stats = [
      { label: "Nové poptávky", value: newCount, trend: "<strong>+3</strong> tento týden", accent: "austis" },
      { label: "Publikované aktuality", value: publishedNews, trend: news.length + " celkem", accent: "eternal" },
      { label: "Spravované nemovitosti", value: props, trend: "<strong>98 %</strong> obsazenost", accent: "real" },
      { label: "Otevřené pozice", value: jobs, trend: "napříč weby", accent: "stavebni" },
    ];

    const recent = filterFor(store.inquiries)
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const activity = buildActivity().slice(0, 6);

    return `
      <div class="stat-grid">
        ${stats
          .map(
            (s) => `
          <div class="stat-card" data-accent="${s.accent}">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${s.value}</div>
            <div class="stat-trend">${s.trend}</div>
          </div>`
          )
          .join("")}
      </div>

      <div class="dash-grid">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <h3>Nejnovější poptávky</h3>
            <a href="#" data-goto="inquiries">Zobrazit vše →</a>
          </div>
          <div class="dash-panel-body">
            ${
              recent.length
                ? `<table class="data" style="margin:0"><tbody>
              ${recent
                .map(
                  (i) => `
                <tr data-inq="${i.id}" class="${i.status === "new" ? "is-unread" : ""}">
                  <td>
                    <div class="cell-primary">${esc(i.name)} ${i.status === "new" ? '<span class="tag st-new" style="margin-left:6px">Nové</span>' : ""}</div>
                    <div class="cell-sub">${esc(i.subject)}</div>
                  </td>
                  <td style="width:130px">${siteTag(i.site)}</td>
                  <td style="width:110px;color:var(--faint)">${relTime(i.date)}</td>
                </tr>`
                )
                .join("")}
            </tbody></table>`
                : emptyBlock("Žádné poptávky pro tento web.")
            }
          </div>
        </div>

        <div class="dash-panel">
          <div class="dash-panel-head"><h3>Rychlé akce</h3></div>
          <div class="quick-grid">
            <button class="quick-action" data-quick="news">
              <span class="qa-ico ico-plus"></span>
              <strong>Přidat aktualitu</strong>
              <span>Publikovat novinku</span>
            </button>
            <button class="quick-action" data-quick="properties">
              <span class="qa-ico ico-plus"></span>
              <strong>Přidat nemovitost</strong>
              <span>Nový objekt do portfolia</span>
            </button>
            <button class="quick-action" data-quick="jobs">
              <span class="qa-ico ico-plus"></span>
              <strong>Vypsat pozici</strong>
              <span>Nová nabídka práce</span>
            </button>
            <button class="quick-action" data-quick="contacts">
              <span class="qa-ico ico-plus"></span>
              <strong>Upravit kontakt</strong>
              <span>Změnit údaje webu</span>
            </button>
          </div>
          <div class="dash-panel-head" style="border-top:1px solid var(--grid)"><h3>Poslední aktivita</h3></div>
          <div class="dash-panel-body">
            ${activity
              .map(
                (a) => `
              <div class="feed-item">
                <span class="feed-dot" data-accent="${a.site}"></span>
                <div class="feed-text">
                  ${a.text}
                  <div class="feed-time">${relTime(a.date)} · ${esc(siteLabel(a.site))}</div>
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>`;
  }

  function buildActivity() {
    const items = [];
    store.inquiries.forEach((i) =>
      items.push({ date: i.date, site: i.site, text: `Nová zpráva od <strong>${esc(i.name)}</strong>` })
    );
    store.news.forEach((n) =>
      items.push({ date: n.date, site: n.site, text: `Aktualita <strong>${esc(n.title)}</strong> ${n.published ? "publikována" : "uložena jako koncept"}` })
    );
    store.jobs.forEach((j) =>
      items.push({ date: daysAgoISO(Math.floor(Math.random() * 10) + 1), site: j.site, text: `Pozice <strong>${esc(j.title)}</strong> ${j.published ? "zveřejněna" : "skryta"}` })
    );
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /* ============================================================
     INQUIRIES
     ============================================================ */
  let inqFilter = "all";
  function renderInquiries() {
    let list = filterFor(store.inquiries, (i) => {
      if (inqFilter === "new") return i.status === "new";
      if (inqFilter === "archived") return i.status === "archived";
      if (inqFilter === "all") return i.status !== "archived";
      return true;
    });
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((i) => (i.name + i.subject + i.email + i.message).toLowerCase().includes(t));
    }
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    const rows = list
      .map(
        (i) => `
      <tr data-inq="${i.id}" class="${i.status === "new" ? "is-unread" : ""}">
        <td>
          <div class="cell-primary">${esc(i.name)}</div>
          <div class="cell-sub">${esc(i.email)}</div>
        </td>
        <td>
          <div class="cell-primary" style="font-weight:400">${esc(i.subject)}</div>
          <div class="cell-sub">${i.type === "poptavka" ? "Poptávkový formulář" : "Kontaktní formulář"}</div>
        </td>
        <td style="width:150px">${siteTag(i.site)}</td>
        <td style="width:120px">${statusTag(i.status)}</td>
        <td style="width:120px;color:var(--faint)">${relTime(i.date)}</td>
        <td style="width:60px">
          <div class="row-actions">
            <button class="icon-btn" data-inq-view="${i.id}" title="Otevřít"><span class="i i-eye"></span></button>
          </div>
        </td>
      </tr>`
      )
      .join("");

    return `
      <div class="section-head">
        <div><h2>Přijaté zprávy</h2><p>Poptávky a dotazy odeslané z formulářů na webech</p></div>
      </div>
      <div class="table-wrap">
        <div class="table-toolbar">
          <div class="seg" data-inq-filter>
            <button data-f="all" class="${inqFilter === "all" ? "is-active" : ""}">Aktivní</button>
            <button data-f="new" class="${inqFilter === "new" ? "is-active" : ""}">Nepřečtené</button>
            <button data-f="archived" class="${inqFilter === "archived" ? "is-active" : ""}">Archiv</button>
          </div>
          <span class="table-count">${list.length} ${czPlural(list.length, "zpráva", "zprávy", "zpráv")}</span>
        </div>
        ${
          list.length
            ? `<table class="data">
          <thead><tr><th>Odesílatel</th><th>Předmět</th><th>Web</th><th>Stav</th><th>Přijato</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`
            : emptyBlock("Žádné zprávy neodpovídají filtru.")
        }
      </div>`;
  }

  function statusTag(s) {
    if (s === "new") return '<span class="tag st-new">Nové</span>';
    if (s === "archived") return '<span class="tag st-archived">Archivováno</span>';
    return '<span class="tag st-read">Přečteno</span>';
  }

  function openInquiry(id) {
    const i = store.inquiries.find((x) => x.id === id);
    if (!i) return;
    if (i.status === "new") {
      i.status = "read";
      save();
    }
    const body = openModal(
      "Detail zprávy",
      `
      <div class="detail-head">
        <div>
          <h3>${esc(i.subject)}</h3>
          <div class="detail-meta-row">
            ${siteTag(i.site)}
            <span class="tag">${i.type === "poptavka" ? "Poptávka" : "Kontakt"}</span>
            <span style="font-size:12.5px;color:var(--faint)">${fmtDate(i.date)}</span>
          </div>
        </div>
      </div>
      <div class="detail-fields">
        <div class="detail-field"><label>Jméno / firma</label><div class="val">${esc(i.name)}</div></div>
        <div class="detail-field"><label>E-mail</label><div class="val"><a href="mailto:${esc(i.email)}">${esc(i.email)}</a></div></div>
        <div class="detail-field"><label>Telefon</label><div class="val"><a href="tel:${esc(i.phone)}">${esc(i.phone)}</a></div></div>
        <div class="detail-field"><label>Web</label><div class="val">${esc(siteLabel(i.site))}</div></div>
      </div>
      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--faint);display:block;margin-bottom:6px">Zpráva</label>
      <div class="detail-message">${esc(i.message)}</div>
      <div class="detail-actions">
        <a class="btn btn-primary" href="mailto:${esc(i.email)}?subject=Re: ${encodeURIComponent(i.subject)}">Odpovědět e-mailem</a>
        <button class="btn btn-ghost" data-inq-archive="${i.id}">${i.status === "archived" ? "Obnovit z archivu" : "Archivovat"}</button>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-danger" data-inq-delete="${i.id}">Smazat</button>
      </div>`
    );

    body.querySelector("[data-inq-archive]").addEventListener("click", () => {
      i.status = i.status === "archived" ? "read" : "archived";
      save();
      closeModal();
      renderCurrent();
      toast(i.status === "archived" ? "Zpráva archivována" : "Zpráva obnovena", "info");
    });
    body.querySelector("[data-inq-delete]").addEventListener("click", () => {
      store.inquiries = store.inquiries.filter((x) => x.id !== id);
      save();
      closeModal();
      renderCurrent();
      toast("Zpráva smazána", "warn");
    });
  }

  /* ============================================================
     NEWS
     ============================================================ */
  function renderNews() {
    let list = filterFor(store.news);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((n) => (n.title + n.excerpt + n.category).toLowerCase().includes(t));
    }
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
      <div class="section-head">
        <div><h2>Aktuality</h2><p>Spravujte novinky zobrazené v sekci „Aktuality“ na webech</p></div>
        <div class="section-head-actions">
          <button class="btn btn-primary" data-news-new><span class="btn-ico ico-plus"></span>Přidat aktualitu</button>
        </div>
      </div>
      ${
        list.length
          ? `<div class="card-grid">
        ${list
          .map(
            (n) => `
          <article class="content-card">
            <div class="content-card-media">
              <div class="media-fallback">${esc(n.category ? n.category.charAt(0) : "A")}</div>
              <div class="media-tags">${siteTag(n.site)}</div>
            </div>
            <div class="content-card-body">
              <div class="content-card-meta">
                <span>${fmtDate(n.date)}</span>
                ${n.published ? '<span class="tag st-published">Publikováno</span>' : '<span class="tag st-draft">Koncept</span>'}
              </div>
              <h3>${esc(n.title)}</h3>
              <p>${esc(n.excerpt)}</p>
              <div class="content-card-foot">
                <span class="tag">${esc(n.category || "Novinka")}</span>
                <span class="spacer"></span>
                <button class="icon-btn" data-news-edit="${n.id}" title="Upravit"><span class="i i-edit"></span></button>
                <button class="icon-btn" data-news-del="${n.id}" title="Smazat"><span class="i i-trash"></span></button>
              </div>
            </div>
          </article>`
          )
          .join("")}
      </div>`
          : emptyBlock("Zatím žádné aktuality.", "Přidat aktualitu", "news-new")
      }`;
  }

  function newsEditor(id) {
    const editing = id ? store.news.find((n) => n.id === id) : null;
    const n = editing || { site: currentSite === "all" ? "austis" : currentSite, category: "", title: "", excerpt: "", body: "", published: false };
    const body = openModal(
      editing ? "Upravit aktualitu" : "Nová aktualita",
      `
      <form class="form-grid" id="news-form">
        <div class="field-row">
          <div class="field">
            <label>Web <span class="req">*</span></label>
            ${siteSelect(n.site)}
          </div>
          <div class="field">
            <label>Kategorie</label>
            <input name="category" value="${esc(n.category)}" placeholder="např. Produkty, Realizace" />
          </div>
        </div>
        <div class="field">
          <label>Nadpis <span class="req">*</span></label>
          <input name="title" value="${esc(n.title)}" required placeholder="Titulek aktuality" />
        </div>
        <div class="field">
          <label>Perex</label>
          <textarea name="excerpt" placeholder="Krátký úvod zobrazený v přehledu">${esc(n.excerpt)}</textarea>
        </div>
        <div class="field">
          <label>Text</label>
          <textarea name="body" style="min-height:140px" placeholder="Celý text článku">${esc(n.body)}</textarea>
        </div>
        <label class="switch">
          <input type="checkbox" name="published" ${n.published ? "checked" : ""} />
          <span class="track"></span>
          Publikovat na web
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editing ? "Uložit změny" : "Vytvořit aktualitu"}</button>
          <button type="button" class="btn btn-ghost" data-close-modal>Zrušit</button>
        </div>
      </form>`
    );
    body.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    body.querySelector("#news-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.title.value.trim()) return toast("Doplňte nadpis", "warn");
      const data = {
        site: f.site.value,
        category: f.category.value.trim(),
        title: f.title.value.trim(),
        excerpt: f.excerpt.value.trim(),
        body: f.body.value.trim(),
        published: f.published.checked,
      };
      if (editing) {
        Object.assign(editing, data);
        toast("Aktualita uložena");
      } else {
        store.news.unshift(Object.assign({ id: uid(), date: new Date().toISOString() }, data));
        toast("Aktualita vytvořena");
      }
      save();
      closeModal();
      renderCurrent();
    });
  }

  /* ============================================================
     PROPERTIES
     ============================================================ */
  function renderProperties() {
    let list = store.properties.slice();
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((p) => (p.title + p.location + p.ptype).toLowerCase().includes(t));
    }
    return `
      <div class="section-head">
        <div><h2>Nemovitosti</h2><p>Portfolio objektů zobrazené na webu AUSTIS Real</p></div>
        <div class="section-head-actions">
          <button class="btn btn-primary" data-prop-new><span class="btn-ico ico-plus"></span>Přidat nemovitost</button>
        </div>
      </div>
      ${
        list.length
          ? `<div class="card-grid">
        ${list
          .map(
            (p) => `
          <article class="content-card">
            <div class="content-card-media">
              ${p.image ? `<img src="${esc(p.image)}" alt="" onerror="this.style.display='none'" />` : `<div class="media-fallback">${esc(p.title.charAt(0))}</div>`}
              <div class="media-tags">${p.status === "managed" ? '<span class="tag st-managed">Ve správě</span>' : '<span class="tag st-free">Volné</span>'}</div>
            </div>
            <div class="content-card-body">
              <div class="content-card-meta"><span>${esc(p.ptype)}</span><span>·</span><span>${esc(p.location)}</span></div>
              <h3>${esc(p.title)}</h3>
              <div class="prop-specs">
                <span><b>${p.units}</b><small>jednotek</small></span>
                <span><b>${Number(p.area).toLocaleString("cs-CZ")} m²</b><small>plocha</small></span>
              </div>
              <p>${esc(p.note)}</p>
              <div class="content-card-foot">
                <span class="spacer"></span>
                <button class="icon-btn" data-prop-edit="${p.id}" title="Upravit"><span class="i i-edit"></span></button>
                <button class="icon-btn" data-prop-del="${p.id}" title="Smazat"><span class="i i-trash"></span></button>
              </div>
            </div>
          </article>`
          )
          .join("")}
      </div>`
          : emptyBlock("Zatím žádné nemovitosti.", "Přidat nemovitost", "prop-new")
      }`;
  }

  function propEditor(id) {
    const editing = id ? store.properties.find((p) => p.id === id) : null;
    const p = editing || { title: "", ptype: "Bytový dům", location: "", units: 1, area: 0, status: "managed", note: "", image: "" };
    const opt = (v) => `<option value="${v}" ${p.ptype === v ? "selected" : ""}>${v}</option>`;
    const body = openModal(
      editing ? "Upravit nemovitost" : "Nová nemovitost",
      `
      <form class="form-grid" id="prop-form">
        <div class="field">
          <label>Název objektu <span class="req">*</span></label>
          <input name="title" value="${esc(p.title)}" required placeholder="např. Bytový dům Kavčí Hory" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>Typ</label>
            <select name="ptype">${opt("Bytový dům")}${opt("Administrativa")}${opt("Komerční")}${opt("Rodinný dům")}${opt("Jiné")}</select>
          </div>
          <div class="field">
            <label>Lokalita</label>
            <input name="location" value="${esc(p.location)}" placeholder="Praha 5 – Slivenec" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Počet jednotek</label>
            <input name="units" type="number" min="0" value="${esc(p.units)}" />
          </div>
          <div class="field">
            <label>Plocha (m²)</label>
            <input name="area" type="number" min="0" value="${esc(p.area)}" />
          </div>
        </div>
        <div class="field">
          <label>Stav</label>
          <select name="status">
            <option value="managed" ${p.status === "managed" ? "selected" : ""}>Ve správě</option>
            <option value="free" ${p.status === "free" ? "selected" : ""}>Volné / k pronájmu</option>
          </select>
        </div>
        <div class="field">
          <label>Popis</label>
          <textarea name="note" placeholder="Krátký popis objektu a rozsahu služeb">${esc(p.note)}</textarea>
        </div>
        <div class="field">
          <label>Obrázek (cesta)</label>
          <input name="image" value="${esc(p.image)}" placeholder="assets/objekt.png" />
          <span class="hint">V ukázce stačí cesta k souboru; v ostrém provozu by šlo o nahrání fotky.</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editing ? "Uložit změny" : "Přidat nemovitost"}</button>
          <button type="button" class="btn btn-ghost" data-close-modal>Zrušit</button>
        </div>
      </form>`
    );
    body.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    body.querySelector("#prop-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.title.value.trim()) return toast("Doplňte název", "warn");
      const data = {
        title: f.title.value.trim(),
        ptype: f.ptype.value,
        location: f.location.value.trim(),
        units: Number(f.units.value) || 0,
        area: Number(f.area.value) || 0,
        status: f.status.value,
        note: f.note.value.trim(),
        image: f.image.value.trim(),
      };
      if (editing) {
        Object.assign(editing, data);
        toast("Nemovitost uložena");
      } else {
        store.properties.unshift(Object.assign({ id: uid() }, data));
        toast("Nemovitost přidána");
      }
      save();
      closeModal();
      renderCurrent();
    });
  }

  /* ============================================================
     JOBS
     ============================================================ */
  function renderJobs() {
    let list = filterFor(store.jobs);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter((j) => (j.title + j.location + j.department).toLowerCase().includes(t));
    }
    const rows = list
      .map(
        (j) => `
      <tr data-job-edit="${j.id}">
        <td>
          <div class="cell-primary">${esc(j.title)}</div>
          <div class="cell-sub">${esc(j.department)} · ${esc(j.salary || "")}</div>
        </td>
        <td>${siteTag(j.site)}</td>
        <td>${esc(j.location)}</td>
        <td><span class="tag">${esc(j.jtype)}</span></td>
        <td>${j.published ? '<span class="tag st-published">Zveřejněno</span>' : '<span class="tag st-draft">Skryto</span>'}</td>
        <td style="width:90px">
          <div class="row-actions">
            <button class="icon-btn" data-job-edit-btn="${j.id}" title="Upravit"><span class="i i-edit"></span></button>
            <button class="icon-btn" data-job-del="${j.id}" title="Smazat"><span class="i i-trash"></span></button>
          </div>
        </td>
      </tr>`
      )
      .join("");

    return `
      <div class="section-head">
        <div><h2>Kariéra</h2><p>Nabídky práce zobrazené v sekci „Kariéra“ na webech</p></div>
        <div class="section-head-actions">
          <button class="btn btn-primary" data-job-new><span class="btn-ico ico-plus"></span>Vypsat pozici</button>
        </div>
      </div>
      <div class="table-wrap">
        <div class="table-toolbar">
          <span class="table-count">${list.length} ${czPlural(list.length, "pozice", "pozice", "pozic")}</span>
        </div>
        ${
          list.length
            ? `<table class="data">
          <thead><tr><th>Pozice</th><th>Web</th><th>Lokalita</th><th>Úvazek</th><th>Stav</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`
            : emptyBlock("Zatím žádné pracovní nabídky.", "Vypsat pozici", "job-new")
        }
      </div>`;
  }

  function jobEditor(id) {
    const editing = id ? store.jobs.find((j) => j.id === id) : null;
    const j = editing || { site: currentSite === "all" ? "austis" : currentSite, title: "", department: "", location: "", jtype: "Plný úvazek", salary: "", desc: "", published: true };
    const jt = (v) => `<option value="${v}" ${j.jtype === v ? "selected" : ""}>${v}</option>`;
    const body = openModal(
      editing ? "Upravit pozici" : "Nová pozice",
      `
      <form class="form-grid" id="job-form">
        <div class="field">
          <label>Název pozice <span class="req">*</span></label>
          <input name="title" value="${esc(j.title)}" required placeholder="např. Stavbyvedoucí" />
        </div>
        <div class="field-row">
          <div class="field"><label>Web <span class="req">*</span></label>${siteSelect(j.site)}</div>
          <div class="field"><label>Oddělení</label><input name="department" value="${esc(j.department)}" placeholder="Realizace staveb" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Lokalita</label><input name="location" value="${esc(j.location)}" placeholder="Praha 5" /></div>
          <div class="field"><label>Úvazek</label><select name="jtype">${jt("Plný úvazek")}${jt("Zkrácený úvazek")}${jt("Brigáda / DPP")}${jt("OSVČ")}</select></div>
        </div>
        <div class="field">
          <label>Mzdové rozpětí</label>
          <input name="salary" value="${esc(j.salary)}" placeholder="45 000 – 55 000 Kč / Dle dohody" />
        </div>
        <div class="field">
          <label>Popis pozice</label>
          <textarea name="desc" style="min-height:120px" placeholder="Náplň práce, požadavky, benefity">${esc(j.desc)}</textarea>
        </div>
        <label class="switch">
          <input type="checkbox" name="published" ${j.published ? "checked" : ""} />
          <span class="track"></span>
          Zveřejnit nabídku
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editing ? "Uložit změny" : "Vypsat pozici"}</button>
          <button type="button" class="btn btn-ghost" data-close-modal>Zrušit</button>
        </div>
      </form>`
    );
    body.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    body.querySelector("#job-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (!f.title.value.trim()) return toast("Doplňte název pozice", "warn");
      const data = {
        site: f.site.value,
        title: f.title.value.trim(),
        department: f.department.value.trim(),
        location: f.location.value.trim(),
        jtype: f.jtype.value,
        salary: f.salary.value.trim(),
        desc: f.desc.value.trim(),
        published: f.published.checked,
      };
      if (editing) {
        Object.assign(editing, data);
        toast("Pozice uložena");
      } else {
        store.jobs.unshift(Object.assign({ id: uid() }, data));
        toast("Pozice vypsána");
      }
      save();
      closeModal();
      renderCurrent();
    });
  }

  /* ============================================================
     CONTACTS
     ============================================================ */
  function renderContacts() {
    const keys = currentSite === "all" ? Object.keys(store.contacts) : [currentSite];
    return `
      <div class="section-head">
        <div><h2>Kontaktní údaje</h2><p>Údaje zobrazené v patičce a na kontaktních stránkách webů</p></div>
      </div>
      ${keys
        .map((k) => {
          const c = store.contacts[k];
          return `
        <form class="form-panel" data-contact="${k}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            ${siteTag(k)}
            <span style="font-size:12.5px;color:var(--muted)">${esc(SITES[k].url)}</span>
          </div>
          <div class="field-row">
            <div class="field"><label>Název firmy</label><input name="company" value="${esc(c.company)}" /></div>
            <div class="field"><label>Otevírací doba</label><input name="hours" value="${esc(c.hours)}" /></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Ulice a č.p.</label><input name="street" value="${esc(c.street)}" /></div>
            <div class="field"><label>PSČ a město</label><input name="city" value="${esc(c.city)}" /></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Telefon</label><input name="phone" value="${esc(c.phone)}" /></div>
            <div class="field"><label>E-mail</label><input name="email" type="email" value="${esc(c.email)}" /></div>
          </div>
          <div class="field-row">
            <div class="field"><label>IČ</label><input name="ico" value="${esc(c.ico)}" /></div>
            <div class="field"><label>DIČ</label><input name="dic" value="${esc(c.dic)}" /></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Uložit změny</button>
            <span class="spacer"></span>
            <span class="status-line"><span class="live-dot"></span>Web je online</span>
          </div>
        </form>`;
        })
        .join("")}`;
  }

  /* ============================================================
     SETTINGS
     ============================================================ */
  function renderSettings() {
    return `
      <div class="section-head">
        <div><h2>Nastavení webů</h2><p>Přehled napojených webů spravovaných z tohoto panelu</p></div>
      </div>
      <div class="site-tiles">
        ${Object.keys(SITES)
          .map((k) => {
            const s = SITES[k];
            const news = store.news.filter((n) => n.site === k).length;
            const jobs = store.jobs.filter((j) => j.site === k).length;
            const inq = store.inquiries.filter((i) => i.site === k && i.status === "new").length;
            return `
          <div class="site-tile" data-accent="${s.accent}">
            ${siteTag(k)}
            <h3>${esc(s.label)}</h3>
            <div class="site-url">${esc(s.url)}</div>
            <div class="site-stat-row">
              <div class="site-stat"><b>${news}</b><span>Aktuality</span></div>
              <div class="site-stat"><b>${jobs}</b><span>Pozice</span></div>
              <div class="site-stat"><b>${inq}</b><span>Nové</span></div>
            </div>
            <div class="status-line"><span class="live-dot"></span>Online · aktualizováno dnes</div>
          </div>`;
          })
          .join("")}
      </div>

      <div class="form-panel" style="margin-top:22px">
        <h3>Data ukázky</h3>
        <p class="panel-sub">Panel je nezávazná ukázka. Veškeré změny se ukládají pouze do tohoto prohlížeče (localStorage).</p>
        <div class="form-actions" style="margin-top:0;border-top:0;padding-top:0">
          <button class="btn btn-ghost" data-reset>Obnovit ukázková data</button>
        </div>
      </div>`;
  }

  /* ============================================================
     SHARED UI helpers
     ============================================================ */
  function siteSelect(sel) {
    return `<select name="site">${Object.keys(SITES)
      .map((k) => `<option value="${k}" ${sel === k ? "selected" : ""}>${esc(SITES[k].label)}</option>`)
      .join("")}</select>`;
  }
  function emptyBlock(msg, ctaLabel, ctaAction) {
    return `<div class="empty">
      <div class="empty-ico"></div>
      <h3>Nic tu zatím není</h3>
      <p>${esc(msg)}</p>
      ${ctaLabel ? `<button class="btn btn-primary" data-empty-cta="${ctaAction}"><span class="btn-ico ico-plus"></span>${esc(ctaLabel)}</button>` : ""}
    </div>`;
  }
  function czPlural(n, one, few, many) {
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  }
  function confirmDelete(msg, onYes) {
    const body = openModal(
      "Potvrdit smazání",
      `<p style="font-size:14px;margin:0 0 4px">${esc(msg)}</p>
       <p style="font-size:12.5px;color:var(--muted);margin:0">Tuto akci nelze vzít zpět.</p>
       <div class="form-actions">
         <button class="btn btn-primary" style="background:var(--red)" data-yes>Smazat</button>
         <button class="btn btn-ghost" data-close-modal>Zrušit</button>
       </div>`
    );
    body.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    body.querySelector("[data-yes]").addEventListener("click", () => {
      onYes();
      closeModal();
    });
  }

  function updateBadges() {
    const newInq = store.inquiries.filter((i) => i.status === "new").length;
    const badge = $('[data-badge="inquiries"]');
    if (badge) {
      badge.textContent = newInq;
      badge.dataset.empty = newInq === 0 ? "true" : "false";
    }
  }

  /* ============================================================
     EVENT BINDING (delegation per render)
     ============================================================ */
  function bindViewEvents() {
    // dashboard
    $$("[data-goto]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        setView(el.dataset.goto);
      })
    );
    $$("[data-quick]").forEach((el) =>
      el.addEventListener("click", () => {
        const t = el.dataset.quick;
        if (t === "news") newsEditor();
        else if (t === "properties") propEditor();
        else if (t === "jobs") jobEditor();
        else setView("contacts");
      })
    );
    $$("[data-inq]").forEach((el) => el.addEventListener("click", () => openInquiry(el.dataset.inq)));

    // inquiries
    $$("[data-inq-view]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        openInquiry(el.dataset.inqView);
      })
    );
    const inqFilterEl = $("[data-inq-filter]");
    if (inqFilterEl)
      inqFilterEl.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          inqFilter = b.dataset.f;
          renderCurrent();
        })
      );

    // news
    const newsNew = $("[data-news-new]");
    if (newsNew) newsNew.addEventListener("click", () => newsEditor());
    $$("[data-news-edit]").forEach((el) => el.addEventListener("click", () => newsEditor(el.dataset.newsEdit)));
    $$("[data-news-del]").forEach((el) =>
      el.addEventListener("click", () => {
        const item = store.news.find((n) => n.id === el.dataset.newsDel);
        confirmDelete(`Smazat aktualitu „${item ? item.title : ""}“?`, () => {
          store.news = store.news.filter((n) => n.id !== el.dataset.newsDel);
          save();
          renderCurrent();
          toast("Aktualita smazána", "warn");
        });
      })
    );

    // properties
    const propNew = $("[data-prop-new]");
    if (propNew) propNew.addEventListener("click", () => propEditor());
    $$("[data-prop-edit]").forEach((el) => el.addEventListener("click", () => propEditor(el.dataset.propEdit)));
    $$("[data-prop-del]").forEach((el) =>
      el.addEventListener("click", () => {
        const item = store.properties.find((p) => p.id === el.dataset.propDel);
        confirmDelete(`Smazat nemovitost „${item ? item.title : ""}“?`, () => {
          store.properties = store.properties.filter((p) => p.id !== el.dataset.propDel);
          save();
          renderCurrent();
          toast("Nemovitost smazána", "warn");
        });
      })
    );

    // jobs
    const jobNew = $("[data-job-new]");
    if (jobNew) jobNew.addEventListener("click", () => jobEditor());
    $$("[data-job-edit]").forEach((row) =>
      row.addEventListener("click", (e) => {
        if (e.target.closest(".icon-btn")) return;
        jobEditor(row.dataset.jobEdit);
      })
    );
    $$("[data-job-edit-btn]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        jobEditor(el.dataset.jobEditBtn);
      })
    );
    $$("[data-job-del]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = store.jobs.find((j) => j.id === el.dataset.jobDel);
        confirmDelete(`Smazat pozici „${item ? item.title : ""}“?`, () => {
          store.jobs = store.jobs.filter((j) => j.id !== el.dataset.jobDel);
          save();
          renderCurrent();
          toast("Pozice smazána", "warn");
        });
      })
    );

    // contacts
    $$("[data-contact]").forEach((form) =>
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const k = form.dataset.contact;
        const c = store.contacts[k];
        ["company", "hours", "street", "city", "phone", "email", "ico", "dic"].forEach((n) => {
          if (form[n]) c[n] = form[n].value.trim();
        });
        save();
        toast(`Kontakt „${siteLabel(k)}“ uložen`);
      })
    );

    // empty CTA
    $$("[data-empty-cta]").forEach((el) =>
      el.addEventListener("click", () => {
        const a = el.dataset.emptyCta;
        if (a === "news-new") newsEditor();
        else if (a === "prop-new") propEditor();
        else if (a === "job-new") jobEditor();
      })
    );

    // settings reset
    const reset = $("[data-reset]");
    if (reset)
      reset.addEventListener("click", () => {
        confirmDelete("Obnovit všechna ukázková data do výchozího stavu?", () => {
          store = JSON.parse(JSON.stringify(SEED));
          save();
          renderCurrent();
          toast("Ukázková data obnovena", "info");
        });
      });
  }

  /* ============================================================
     GLOBAL WIRING
     ============================================================ */
  // sidebar nav
  $$(".admin-nav-item").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  // site switcher
  $$(".admin-site-pill").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".admin-site-pill").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      currentSite = b.dataset.site;
      const acc = b.dataset.accent;
      document.documentElement.style.setProperty("--accent", acc ? `var(--acc-${acc})` : "var(--red)");
      renderCurrent();
    })
  );

  // search
  const searchInput = $("#global-search");
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = searchInput.value.trim();
      if (["inquiries", "news", "properties", "jobs"].includes(currentView)) renderCurrent();
    }, 180);
  });

  // mobile menu
  const shell = $(".admin-shell");
  $(".admin-menu-toggle").addEventListener("click", () => {
    const open = shell.classList.toggle("nav-open");
    if (open) {
      const scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      scrim.addEventListener("click", () => {
        shell.classList.remove("nav-open");
        scrim.remove();
      });
      shell.appendChild(scrim);
    } else {
      const s = $(".nav-scrim");
      if (s) s.remove();
    }
  });

  $(".admin-user-logout").addEventListener("click", () => toast("Odhlášení — v ukázce neaktivní", "info"));

  // boot
  setView("dashboard");
})();
