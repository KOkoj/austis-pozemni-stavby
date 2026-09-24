from pathlib import Path

p = Path(__file__).with_name("projekty.html")
text = p.read_text(encoding="utf-8")
start = text.find('      <section id="projekty-list"')
end = text.find('      <footer class="footer"')
if start < 0 or end < 0 or end <= start:
    raise SystemExit(f"markers not found start={start} end={end}")

block = r'''      <section id="projekty-list" class="sr sr-section flow-first" aria-labelledby="projekty-overview-title">
        <div class="sr-container">
          <div class="sr-header">
            <div class="sr-label">Naše projekty</div>
            <h2 class="sr-title" id="projekty-overview-title">Realizované i probíhající projekty</h2>
            <p class="sr-desc">Každý projekt vedeme jako generální dodavatel: jedna smlouva, jeden odpovědný tým a průběžný reporting pro investora.</p>
          </div>
          <div class="sr-grid">
            <article class="sr-card" id="ref-1">
              <div class="sr-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3 id="ref-1-title">Chata Seibert</h3>
              <p>Generální dodávka kompletní rekonstrukce horské chaty v Krkonoších, od logistiky montáží v náročném terénu po předání v sezónním provozu.</p>
              <div class="sr-pill">Rekreační stavba</div>
            </article>
            <article class="sr-card" id="ref-2">
              <div class="sr-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <h3 id="ref-2-title">Vraňany Farma Hanč</h3>
              <p>Výstavba provozních objektů a technického zázemí farmy. Jeden smluvní partner pro celý areál včetně inženýrských sítí a zpevněných ploch.</p>
              <div class="sr-pill">Zemědělský areál</div>
            </article>
            <article class="sr-card" id="ref-3">
              <div class="sr-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V9l7-6 7 6v12"/><path d="M9 21v-6h6v6"/></svg>
              </div>
              <h3 id="ref-3-title">Rodinný dům Roztoky</h3>
              <p>Novostavba rodinného domu na klíč v rámci generální dodávky. Investor jedná s jedním partnerem a má průběžný reporting i pevný harmonogram.</p>
              <div class="sr-pill">Novostavba RD · Probíhá</div>
            </article>
            <article class="sr-card" id="ref-4">
              <div class="sr-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>
              </div>
              <h3 id="ref-4-title">Novo Plaza</h3>
              <p>Realizace komerčního objektu v rámci developerského projektu. Řídíme termíny, náklady i návaznost na další fáze celého záměru.</p>
              <div class="sr-pill">Komerční development · Probíhá</div>
            </article>
          </div>
        </div>
      </section>

      <section class="sr-stats" aria-label="Statistiky">
        <div class="sr-container">
          <div class="sr-stats-grid">
            <div class="sr-stat">
              <b>1</b>
              <span>smlouva, jeden tým</span>
            </div>
            <div class="sr-stat">
              <b>Praha<em> a okolí</em></b>
              <span>oblast působnosti</span>
            </div>
            <div class="sr-stat">
              <b><em>4</em></b>
              <span>referenční stavby</span>
            </div>
          </div>
        </div>
      </section>

      <section class="sr-cta" aria-labelledby="projekty-cta-title">
        <div class="sr-container">
          <div class="sr-cta-inner">
            <div>
              <h2 id="projekty-cta-title">Připravujete stavební záměr?</h2>
              <p>Domluvte si nezávaznou konzultaci.</p>
            </div>
            <a class="sr-btn" href="poptavka.html#poptavka-form">
              Nezávazně poptat
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

'''

p.write_text(text[:start] + block + text[end:], encoding="utf-8")
print("replaced", end - start, "chars")
