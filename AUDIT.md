# Audit webu AUSTIS Pozemní stavby

Datum: 16. 7. 2026  
Rozsah: statické HTML stránky značky **Pozemní stavby** (`index.html`, `sluzby.html`, `projekty.html`, `o-spolecnosti.html`, `kontakt.html`, `poptavka.html`). Sourozenecké weby (Stavební, Real, holding) nejsou předmětem tohoto auditu.  
Poznámka: audit hodnotí **formu, strukturu a úplnost** — ne věcnou správnost firemních tvrzení.

---

## 1. Site inventory

### Existující stránky / routy

| Soubor | Veřejná URL (cleanUrls) | Účel |
|--------|-------------------------|------|
| `index.html` | `/` nebo `/index` | Homepage — positioning, služby, projektový snippet, o firmě, footer |
| `sluzby.html` | `/sluzby` | Přehled a detail tří hlavních služeb |
| `projekty.html` | `/projekty` | Reference / portfolio projektů |
| `o-spolecnosti.html` | `/o-spolecnosti` | O firmě, cílové skupiny, kariéra |
| `kontakt.html` | `/kontakt` | Kontaktní údaje + postup po poptávce |
| `poptavka.html` | `/poptavka` | Formulář nezávazné konzultace |

**Chybí v repozitáři:** `robots.txt`, `sitemap.xml`, samostatná stránka kariéry, FAQ, certifikace, mapa.

### Struktura stránek (pořadí sekcí)

#### `index.html` — homepage
1. Navigace (desktop floating + mobile)
2. Hero (value prop + CTA „prohlédnout projekty“)
3. Generální dodavatel — 5 benefitů + CTA konzultace
4. Služby — 3 karty (detail + poptávka) + odkaz na všechny služby
5. Projekty — snippet jednoho projektu + „více o projektu“ / „všechny projekty“
6. O společnosti — snippet + kariéra teaser + CTA
7. Footer — kontakt (IČ/DIČ) + kariéra

*(Mobile mirroruje stejný tok v samostatném layoutu.)*

#### `sluzby.html`
1. Hero služeb  
2. Přehled: příprava, generální dodávka, pozemní stavby  
3. Detail: Generální dodávka (`#generalni-dodavka`)  
4. Detail: Pozemní stavby (`#pozemni-stavby`)  
5. Detail: Rekonstrukce (`#rekonstrukce`)  
6. Footer  

#### `projekty.html`
1. Hero projektů  
2. Přehled typů (rekreační / provozní / komerční)  
3. Projekt 01 Chata Seibert (`#ref-1`) + galerie  
4. Projekt 02 Vraňany Farma Hanč (`#ref-2`) + galerie  
5. Projekt 03 Rodinný dům Roztoky (`#ref-3`) + galerie  
6. Projekt 04 Novo Plaza (`#ref-4`) + galerie  
7. Lightbox + footer  

#### `o-spolecnosti.html`
1. Hero  
2. Jak pracujeme (přístup / odpovědnost / reporting)  
3. Jeden partner pro celou stavbu  
4. S kým spolupracujeme  
5. Kariéra (`#kariera`)  
6. Footer  

#### `kontakt.html`
1. Hero  
2. Jsme vám k dispozici (společnost / kariéra / poptávka)  
3. Spojte se s námi (e-mail, IČ, DIČ)  
4. Co se stane po odeslání poptávky (4 kroky)  
5. Footer  

#### `poptavka.html`
1. Hero  
2. Formulář „Nezávazná konzultace“ (`#poptavka-form`) + aside „Co se stane dál“  
3. Footer (Kontakt + Odkazy)  

---

## 2. SEO audit (per page)

### Společné SEO nálezy (celý web)

| Oblast | Stav | Poznámka |
|--------|------|----------|
| `lang="cs"` | OK | Na všech stránkách |
| Viewport / charset | OK | |
| Canonical | Chybí | Žádná stránka nemá `<link rel="canonical">` |
| Open Graph / Twitter | Chybí | Žádné `og:*` / `twitter:*` |
| `robots.txt` | Chybí | |
| `sitemap.xml` | Chybí | |
| JSON-LD | Chybí | Viz sekce 3 |
| Favicon | Neověřeno v head | V head není explicitní favicon link |
| Duplicitní H1 | Problém | Substránky mají **dva H1** (desktop hero + mobile hero) se stejným textem — pro crawler to vypadá jako 2× H1 na jedné URL |
| Logo `alt=""` | Slabé | Loga mají prázdný alt; u dekorativních OK, u brand signalu lepší „AUSTIS Pozemní stavby“ |

### Titulky a meta description

| Stránka | Title | Délka (cca) | Meta description | Délka (cca) | CTA v meta | Duplikát title? |
|---------|-------|-------------|------------------|-------------|---------|-----------------|
| Úvod | `AUSTIS Pozemní stavby \| Generální dodavatel staveb` | ~48 | Ano — generální dodavatel, investoři/developeři, jedna smlouva | ~155 | Implicitní (positioning) | Ne |
| Služby | `Služby \| AUSTIS Pozemní stavby` | ~30 | Ano — výčet služeb | ~130 | Ne | Ne |
| Projekty | `Projekty \| AUSTIS Pozemní stavby` | ~31 | Ano — realizované/probíhající | ~110 | Ne | Ne |
| O společnosti | `O společnosti \| AUSTIS Pozemní stavby` | ~37 | Ano — generální dodavatel | ~105 | Ne | Ne |
| Kontakt | `Kontakt \| AUSTIS Pozemní stavby` | ~30 | Ano — nezávazná konzultace | ~95 | Ano (měkké) | Ne |
| Poptávka | `Poptat spolupráci \| AUSTIS Pozemní stavby` | ~40 | Ano — nezávazná konzultace | ~95 | Ano | Ne |

**Doporučení titulků (CZ):**
- Služby: `Generální dodávka a pozemní stavby | AUSTIS`
- Projekty: `Reference pozemních staveb | AUSTIS Pozemní stavby`
- Kontakt: doplnit lokalitu, pokud je relevantní (např. Praha / Střední Čechy)

**Doporučení meta:** u Služeb a Projektů doplnit výzvu („Poptat konzultaci“, „Prohlédnout realizace“`).

### H1–H3 hierarchie

| Stránka | H1 | Hierarchie | Klíčová slova v nadpisech |
|---------|----|------------|---------------------------|
| Úvod | 1× desktop + 1× mobile (stejný text) — v DOM 2× | H1 → H2 → H3 logicky OK | Silné: generální dodavatel, pozemní stavby |
| Služby | 2× v DOM | OK (overview H2/H3, detaily H2) | Silné: generální dodávka, pozemní stavby, rekonstrukce |
| Projekty | 2× v DOM | H2 projektů + H3 typů — OK | Střední; názvy projektů spíš brand než keywords |
| O společnosti | 2× v DOM | OK | Střední–silné |
| Kontakt | 2× v DOM | OK | Měkké (konzultace) |
| Poptávka | 2× v DOM | H1 + H2 formuláře OK | OK |

**Akce:** skrýt jeden H1 z a11y/SEO pohledu (např. mobile H1 → `p`/`div` se stejným vizuálem, nebo `aria-hidden` + jeden viditelný H1), aby na URL zbyl právě jeden H1.

### URL slugy

| Slug | Hodnocení |
|------|-----------|
| `/sluzby`, `/projekty`, `/kontakt`, `/poptavka`, `/o-spolecnosti` | Čitelné, české, konzistentní |
| Anchory `#generalni-dodavka`, `#pozemni-stavby`, `#rekonstrukce`, `#ref-1`…`#ref-4`, `#kariera`, `#poptavka-form` | Dobré pro deep-linky |
| `projekty.html` místo starého `reference.html` | Lepší keyword alignment |

`vercel.json` má `cleanUrls: true` — vhodné.

### Alt texty obrázků

| Kontext | Stav |
|---------|------|
| Služby — detail fotky | Dobré, popisné CZ alt |
| Projekty — galerie | Dobré, pojmenované podle projektu |
| Homepage služby | Základní, ale OK |
| Homepage hero / mobile still | Často `alt=""` + `aria-hidden` — OK pokud dekorativní |
| Projekty snippet left image | `alt=""` aria-hidden — OK |
| Mobile project photo | `alt=""` — **slabé**, měl by nést název projektu |
| Opakované assety napříč projekty | Formálně alt existuje, ale stejné fotky u různých projektů oslabují důvěryhodnost (UX/SEO trust) |

### Interní linking

**Silné:**
- Globální nav na všech stránkách
- Homepage → služby (karty + „všechny služby“), projekty, o společnosti, kontakt, poptávka
- Deep-linky služeb a projektů (`?service=` + `#…`)
- Footer kariéra → `#kariera`

**Slabé / chybějící:**
- Ze stránek služeb/projektů málo kontextových odkazů „zpět na související“ (např. projekt → služba „rekonstrukce“)
- Kontakt nemá výrazný CTA na formulář v první viewportu (jen nav CTA)
- Chybí breadcrumb navigace
- Footer na většině stránek nemá odkazy na Služby / Projekty (kromě `poptavka.html`)

### Technické SEO

- **Canonical:** chybí na všech stránkách  
- **Sitemap / robots:** chybí  
- **OG tags:** chybí (sdílení na LinkedIn/FB bude bez náhledu)  
- **Security headers:** částečně OK přes `vercel.json` (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`)  
- **Performance hints:** preload hero image — dobré  

---

## 3. AEO audit

### Structured data (JSON-LD)

| Typ | Stav |
|-----|------|
| `Organization` / `LocalBusiness` / `GeneralContractor` | Chybí |
| `Service` (3 služby) | Chybí |
| `FAQPage` | Chybí (není FAQ) |
| `BreadcrumbList` | Chybí |
| `ContactPage` / `WebSite` + `SearchAction` | Chybí |
| `JobPosting` (kariéra) | Chybí |

**Doporučený minimální set (CZ trh):**
1. `Organization` + adresa, IČ, telefon, e-mail, `sameAs`  
2. 3× `Service` napojené na Organization  
3. `BreadcrumbList` na substránkách  
4. Po přidání FAQ → `FAQPage`

### FAQ a question → answer formát

- Samostatná FAQ sekce/stránka **neexistuje**.
- Kontakt a poptávka mají „Co se stane dál“ jako kroky — blíží se AEO, ale **nejsou formulované jako otázky** (např. „Jak probíhá první konzultace?“).
- Benefity na homepage odpovídají implicitním dotazům („proč generální dodavatel?“), ale bez Q formátu.

### Machine-extractable informace

| Informace | Extrahovatelná z textu? | Kde |
|-----------|-------------------------|-----|
| Co firma dělá | Ano | H1, leady, služby |
| Pro koho (investoři, developeři) | Ano | O společnosti, homepage |
| IČ / DIČ / název s.r.o. | Ano | Kontakt, footery |
| E-mail | Ano | `info@austis.cz` na kontakt |
| Telefon | Částečně | Jen na `poptavka.html` (`+420 251 099 111`) — **není na kontaktní stránce** |
| Fyzická adresa / mapa | Ne | Chybí |
| Provozní doba | Částečně | Jen u telefonu na poptávce |
| Konkrétní lokality projektů | Ano | Krkonoše, Vraňany, Roztoky, Praha |
| Certifikace / pojištění | Ne | Chybí |

**Verdikt AEO:** obsah je srozumitelný lidem i modelům v základní rovině („generální dodavatel pozemních staveb“), ale chybí strukturovaná data, FAQ a kompletní NAP (Name–Address–Phone) na jednom místě.

---

## 4. UX / content structure (per page)

### Homepage (`index.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| Value prop do 5 s | Silné — H1 jasně říká roli a cílovku |
| CTA above the fold | Částečné — „prohlédnout projekty“ ano; primární obchodní CTA „poptat“ je v nav, ne v hero copy |
| Flow problem → solution → proof → action | Dobré: benefity → služby → projekt → firma → kontakt |
| CTAs | Služby (2 tlačítka), projekty, o firmě, nav — dobré pokrytí; footer CTA odstraněno záměrně |
| Trust | Projekty + konkrétní názvy; chybí roky na trhu, loga klientů, certifikáty, počty realizací |
| Readability | Krátké odstavce, H3 benefity, dobré |

### Služby (`sluzby.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| Hero VP | Jasné |
| Flow | Přehled → 3 detaily se scope listy — výborné |
| CTA | Nav „poptat“; v detailech chybí lokální CTA „poptat tuto službu“ (na homepage už je) |
| Trust | Scope listy působí konkrétně; chybí napojení na konkrétní projekty |
| Readability | Velmi dobrá (odstavec + bullet scope) |

### Projekty (`projekty.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| Hero VP | OK |
| Proof | 4 projekty s meta + galerií — základní portfolio OK |
| CTA | Primárně nav; chybí CTA u každého projektu („podobný projekt? poptat“) |
| Trust riziko | Opakované fotografie napříč projekty snižují důvěru |
| Readability | Dobrá |

### O společnosti (`o-spolecnosti.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| VP | Jasné |
| Flow | Jak pracujeme → kdo jsme → klienti → kariéra |
| CTA | Nav + kariéra bez přímého „napsat CV / kontakt“ buttonu v sekci |
| Trust | Chybí tým (jména/fotky), historie, certifikace |
| Readability | Dobrá |

### Kontakt (`kontakt.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| Hero CTA | „Domluvte si konzultaci“ — dobré; chybí button přímo na `#poptavka-form` v hero |
| NAP | E-mail + IČ ano; telefon a adresa/mapa **chybí** |
| Process | 4 kroky po poptávce — silný UX prvek |
| Readability | Dobrá |

### Poptávka (`poptavka.html`)

| Kritérium | Hodnocení |
|-----------|-----------|
| Above the fold | Formulář je hlavní job stránky — OK |
| CTA | Submit + telefon v aside |
| Form UX | Služba, typ stavby, lokalita — dobré; preselect z homepage funguje |
| Trust | Kroky „co dál“ vedle formuláře — výborné |
| Readability | OK |

---

## 5. Missing sections/pages

Porovnání s typickým webem generálního dodavatele pozemních staveb:

| Položka | Stav | Priorita | Proč |
|---------|------|----------|------|
| Portfolio s fotkami | Částečně (4 projekty) | — | Existuje; rozšířit a vyčistit assety |
| Detail služeb | Ano (3 služby na jedné URL) | — | Dostatečné; volitelně landing pages |
| Proces spolupráce (krok za krokem) | Částečně (kontakt + poptávka) | **High** | Chybí dedikovaná viditelná sekce/stránka „Jak probíhá spolupráce“ z homepage |
| O nás / tým | Částečně (bez týmu) | **Medium** | Bez lidí a historie slabší B2B trust |
| Certifikace a pojištění | Chybí | **High** | U stavebních firem klíčový trust signal pro investory |
| FAQ | Chybí | **High** | SEO + AEO + snížení bariéry před poptávkou |
| Formulář poptávky | Ano | — | |
| Kontakt s IČO | Ano | — | |
| Kontakt s mapou + adresou | Chybí | **High** | Local SEO + důvěra + NAP konzistence |
| Telefon na kontaktní stránce | Chybí | **High** | Telefon je jen na poptávce |
| Samostatná kariéra stránka | Ne (sekce) | **Low** | Sekce stačí, dokud nejsou 3+ pozice |
| Blog / aktuality | Chybí | **Low** | Až po basic SEO/trust |
| Klientská loga / čísla (X realizací, Y let) | Chybí | **Medium** | Rychlý social proof na homepage |
| OG + sitemap + robots + JSON-LD | Chybí | **High** | Základ technického SEO/AEO |
| Jeden H1 na stránku | Není | **Medium** | Technický SEO hygiene |

---

## 6. Prioritized action plan

| # | Úkol | Impact | Effort | Priorita (impact/effort) |
|---|------|--------|--------|---------------------------|
| 1 | Přidat `Organization`/`LocalBusiness` JSON-LD (název, IČ, e-mail, telefon, URL) | High | Low | **P0** |
| 2 | Doplnit `robots.txt` + `sitemap.xml` (6 URL) | High | Low | **P0** |
| 3 | Open Graph + canonical na všech stránkách | High | Low | **P0** |
| 4 | Sjednotit NAP: telefon + adresa na `kontakt.html` (a ve footeru) | High | Low | **P0** |
| 5 | Opravit duplicitní H1 (desktop/mobile) na substránkách | Medium | Low | **P1** |
| 6 | Meta descriptions se CTA u Služeb a Projektů; silnější titles | Medium | Low | **P1** |
| 7 | FAQ sekce (8–12 otázek v Q→A) + `FAQPage` schema; odkaz z homepage/kontakt | High | Medium | **P1** |
| 8 | Sekce „Jak probíhá spolupráce“ (4–6 kroků) na homepage nebo `/spoluprace` | High | Medium | **P1** |
| 9 | CTA „Poptat tuto službu“ v detailech na `sluzby.html` (už existuje vzor z homepage) | Medium | Low | **P1** |
| 10 | CTA u každého projektu na `projekty.html` | Medium | Low | **P1** |
| 11 | Mapa sídla na kontaktní stránce | Medium | Low–Medium | **P2** |
| 12 | Unikátní fotografie per projekt (odstranit recycling assetů) | High | High | **P2** |
| 13 | Blok certifikace / pojištění / oprávnění | High | Medium | **P2** |
| 14 | Trust strip na homepage (roky, počet projektů, typy staveb) — bez vymyšlených čísel, jen ověřená fakta | Medium | Low | **P2** |
| 15 | `Service` schema pro 3 služby + `BreadcrumbList` | Medium | Low | **P2** |
| 16 | Tým / klíčáře na O společnosti | Medium | Medium | **P3** |
| 17 | Kontextové interní odkazy projekt ↔ služba | Medium | Low | **P3** |
| 18 | Kariéra jako samostatná stránka + `JobPosting` | Low | Medium | **P3** |

### Rychlé win (doporučené pořadí implementace)

1. Technický balíček: canonical, OG, robots, sitemap, JSON-LD Organization  
2. Kontaktní úplnost: telefon + adresa (+ mapa)  
3. FAQ + proces spolupráce (obsah i AEO)  
4. CTA hygiene na Službách a Projektech  
5. Trust: certifikace + čisté unikátní foto portfolio  

---

## Shrnutí

Web má **jasný positioning**, srozumitelnou informační architekturu (6 stránek) a dobrou čitelnost. Největší mezery jsou **technické SEO/AEO** (schema, OG, sitemap), **neúplný NAP na kontaktu**, chybějící **FAQ / certifikace / mapa** a **duplicitní H1** v desktop+mobile markupu. Obchodní tok (služby → projekty → poptávka) je funkční; po doplnění trust a machine-readable vrstev bude web výrazně silnější ve vyhledávání i v AI odpovědích.
