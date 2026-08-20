/* ============================================================
   VOLDA — førehandsvisingsskript.

   Handlekorg, ruting og filtrering er ting Shopify gjer i den
   ferdige butikken. Her er dei simulerte i minnet.

   Farge- og fontvalet finst berre i førehandsvisinga. Tekstpanelet er
   eit verktøy for å samle inn tekstane — det som kjem ut av det, blir
   innhaldet i temaet. Panelet er IKKJE modalt: det er ein «manual»
   popover utan bakgrunnsavskjerming, så resten av sida held seg synleg
   og klikkbar medan Ove skriv.
   ============================================================ */
(() => {
  'use strict';

  const VARER = JSON.parse(document.querySelector('#varedata').textContent);
  const TEKSTFELT = JSON.parse(document.querySelector('#tekstfelt').textContent);
  const nb = new Intl.NumberFormat('nb-NO', {
    style: 'currency', currency: 'NOK',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  const kr = (k) => nb.format(k);
  const rot = document.documentElement;

  /* ------------------------------------------------------------ Varsel */

  let varselEl;
  function varsle(tekst) {
    varselEl ??= document.body.appendChild(
      Object.assign(document.createElement('output'), { className: 'varsel' }));
    varselEl.textContent = tekst;
    varselEl.dataset.vis = 'ja';
    clearTimeout(varselEl._t);
    varselEl._t = setTimeout(() => { varselEl.dataset.vis = 'nei'; }, 4200);
  }

  /* -------------------------------------------------------------- Korg */

  const dialog = document.querySelector('dialog.korg');
  const korg = [];

  function teiknKorg() {
    document.querySelectorAll('[data-korgtal]').forEach((el) => {
      el.textContent = korg.length;
      el.dataset.korgtal = korg.length;
    });
    const liste = dialog.querySelector('[data-korglinjer]');
    const botn = dialog.querySelector('[data-korgbotn]');

    if (!korg.length) {
      liste.innerHTML = '<li class="korg__tom"><p>Korga er tom.</p>' +
        '<a class="knapp knapp--tom" href="#/butikk">Sjå butikken</a></li>';
      botn.hidden = true;
      return;
    }
    liste.innerHTML = korg.map((h) => {
      const v = VARER[h];
      return `<li class="korg__linje">
        <img src="${v.bilete}" alt="" width="72" height="72" loading="lazy" decoding="async">
        <div><a href="#/produkt/${h}">${v.tittel}</a>
          <p>1 stk &middot; einaste eksemplar</p></div>
        <div class="korg__pris">${kr(v.pris)}</div>
        <button type="button" class="korg__fjern" data-fjern="${h}"
                aria-label="Fjern ${v.tittel} frå korga">Fjern</button></li>`;
    }).join('');
    botn.hidden = false;
    dialog.querySelector('[data-korgsum]').textContent =
      kr(korg.reduce((s, h) => s + VARER[h].pris, 0));
  }

  function leggIKorg(handle) {
    const v = VARER[handle];
    if (!v) return;
    if (v.seld) { varsle('Dette produktet er alt seld.'); return; }
    if (korg.includes(handle)) {
      varsle(`Det finst berre eitt eksemplar av «${v.tittel}», og det ligg alt i korga di.`);
      return;
    }
    korg.push(handle);
    teiknKorg();
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-opne-korg]')) {
      ev.preventDefault(); if (!dialog.open) dialog.showModal(); return;
    }
    if (ev.target.closest('[data-lukk-korg]')) { ev.preventDefault(); dialog.close(); return; }
    const legg = ev.target.closest('[data-legg]');
    if (legg) { ev.preventDefault(); leggIKorg(legg.dataset.legg); return; }
    const fjern = ev.target.closest('[data-fjern]');
    if (fjern) { korg.splice(korg.indexOf(fjern.dataset.fjern), 1); teiknKorg(); return; }
    if (ev.target.closest('[data-kassa]')) {
      ev.preventDefault();
      varsle('Dette er ei førehandsvising — kassa kjem når butikken er sett opp i Shopify.');
    }
  });
  dialog?.addEventListener('click', (ev) => { if (ev.target === dialog) dialog.close(); });

  /* ------------------------------------------------------------ Router */

  const sider = new Map(
    [...document.querySelectorAll('[data-side]')].map((s) => [s.dataset.side, s]));

  function visSide(namn, rull = true) {
    if (!sider.has(namn)) namn = 'ikkje-funne';
    sider.forEach((el, n) => {
      if (n === namn) el.setAttribute('data-aktiv', '');
      else el.removeAttribute('data-aktiv');
    });
    const sti = `#/${namn}`;
    document.querySelectorAll('[data-meny] a').forEach((a) => {
      if (a.getAttribute('href') === sti) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    rot.dataset.visSide = namn.split('/')[0];
    if (rull) window.scrollTo({ top: 0, behavior: 'instant' });
    const h = sider.get(namn)?.querySelector('h1');
    if (h && rull) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }

  const frahash = () => location.hash.replace(/^#\/?/, '') || 'heim';

  window.addEventListener('hashchange', () => {
    if (dialog?.open) dialog.close();
    document.querySelector('.filterpanel')?.hidePopover?.();
    document.querySelector('.mobilmeny')?.hidePopover?.();
    // Tekstpanelet er med vilje IKKJE lukka her — det skal kunne stå
    // ope medan du bladar mellom sidene og ser endringane live.
    const gjer = () => visSide(frahash());
    if (document.startViewTransition &&
        matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      document.startViewTransition(gjer);
    } else { gjer(); }
  });

  const mobmeny = document.querySelector('.mobilmeny[popover]');
  mobmeny?.addEventListener('click', (ev) => {
    if (ev.target.closest('a[href^="#/"]')) mobmeny.hidePopover();
  });

  /* ------------------------------------------------------------ Filter
     Fleirval: innanfor ei gruppe tel det som ELLER, mellom gruppene
     som OG. Same markup ligg to stader — skinna på desktop, popover-
     panelet nådd frå header-knappen på mobil — og blir halden i takt
     fordi alle knappar med same data-sett blir oppdaterte samla.
     Valet vises ved at knappen sjølv blir farga; det trengst ingen
     ekstra rad med fjernbare filter-chips attpå.                     */

  const GRUPPER = { kategori: 'kategori', pris: 'prisband', treslag: 'treslag' };
  const val = { kategori: new Set(), pris: new Set(), treslag: new Set() };
  const butikk = document.querySelector('[data-side="butikk"]');

  function filtrer() {
    if (!butikk) return;
    let treff = 0;
    butikk.querySelectorAll('[data-vare]').forEach((k) => {
      const ok = Object.entries(GRUPPER).every(([g, attr]) => {
        if (!val[g].size) return true;
        const verdiar = (k.dataset[attr] ?? '').split(' ').filter(Boolean);
        return verdiar.some((v) => val[g].has(v));
      });
      k.hidden = !ok;
      if (ok) treff++;
    });

    // Filterpanelet/-knappen ligg utanfor butikk-seksjonen, så teljarane
    // må hentast frå heile dokumentet — elles står dei stille.
    document.querySelectorAll('[data-treff]').forEach((el) => { el.textContent = treff; });
    const tomt = butikk.querySelector('[data-ingen-treff]');
    if (tomt) tomt.hidden = treff > 0;

    const talAktive = Object.values(val).reduce((s, m) => s + m.size, 0);
    document.querySelectorAll('[data-tal]').forEach((el) => { el.dataset.tal = talAktive; });
  }

  function settChips(gruppe) {
    document.querySelectorAll(`[data-sett^="${gruppe}:"]`).forEach((k) => {
      const v = k.dataset.sett.split(':')[1];
      k.setAttribute('aria-pressed', String(val[gruppe].has(v)));
    });
  }

  document.addEventListener('click', (ev) => {
    const knapp = ev.target.closest('[data-sett]');
    if (!knapp) return;
    ev.preventDefault();
    const [gruppe, verdi] = knapp.dataset.sett.split(':');
    if (!val[gruppe]) return;

    if (val[gruppe].has(verdi)) val[gruppe].delete(verdi);
    else val[gruppe].add(verdi);

    settChips(gruppe);
    filtrer();
    if (location.hash !== '#/butikk') location.hash = '#/butikk';
  });

  document.querySelectorAll('[data-nullstill]').forEach((b) => b.addEventListener('click', () => {
    Object.values(val).forEach((m) => m.clear());
    Object.keys(val).forEach(settChips);
    filtrer();
  }));

  /* --------------------------------------------------------------- Søk */

  const sokfelt = document.querySelector('[data-sokfelt]');
  if (sokfelt) {
    const omfang = sokfelt.closest('.side');
    const kjor = () => {
      const q = sokfelt.value.trim().toLowerCase();
      let treff = 0;
      omfang.querySelectorAll('[data-sokbar]').forEach((k) => {
        const med = !q || k.dataset.sokbar.includes(q);
        k.hidden = !med;
        if (med) treff++;
      });
      const t = omfang.querySelector('[data-soktreff]');
      if (t) t.textContent = q ? (treff === 1 ? '1 treff' : `${treff} treff`) : '';
    };
    sokfelt.addEventListener('input', kjor);
    sokfelt.closest('form')?.addEventListener('submit', (ev) => { ev.preventDefault(); kjor(); });
  }

  /* ------------------------------------------------------- Mørk modus */

  function settPalett(namn) {
    rot.dataset.palett = namn;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(rot).getPropertyValue('--bg').trim();
  }

  // Fargen er avgjord: Havre. Mørk modus byter til Kveld og tilbake.
  const LYS = 'havre';

  function settMorkmodus(pa) {
    document.querySelectorAll('[data-morkmodus]').forEach((b) => {
      b.setAttribute('aria-pressed', String(pa));
    });
    settPalett(pa ? 'kveld' : LYS);
  }

  document.addEventListener('click', (ev) => {
    const mk = ev.target.closest('[data-morkmodus]');
    if (mk) { settMorkmodus(mk.getAttribute('aria-pressed') !== 'true'); return; }
  });

  /* ---------------------------------------------------- Tekstpanelet */

  const tekstpanel = document.querySelector('.tekstpanel');

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && tekstpanel?.matches(':popover-open')) {
      tekstpanel.hidePopover();
    }
  });

  const LAGERNOKKEL = 'volda-tekst-2';
  const standard = Object.fromEntries(TEKSTFELT.map((f) => [f.nokkel, f.standard]));
  let tekst = { ...standard };

  function trygg(s) {
    return String(s).replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function rikTilHtml(verdi) {
    // Blanke linjer skil avsnitt. «## » framfor ei linje gjer ho til mellomtittel.
    return String(verdi).split(/\n\s*\n/).map((bolk) => {
      const t = bolk.trim();
      if (!t) return '';
      if (t.startsWith('## ')) return `<h2>${trygg(t.slice(3))}</h2>`;
      return `<p>${trygg(t).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  function skrivUt(nokkel) {
    const verdi = tekst[nokkel];
    document.querySelectorAll(`[data-tekst="${nokkel}"]`).forEach((el) => {
      el.textContent = verdi;
      el.hidden = String(verdi).trim() === '';

      // E-post og telefon står både som tekst og som lenke. Utan dette peikar
      // lenka framleis på plassholdaren når teksten er endra.
      if (el.tagName === 'A') {
        const h = el.getAttribute('href') || '';
        if (h.startsWith('mailto:')) {
          el.setAttribute('href', 'mailto:' + String(verdi).trim());
        } else if (h.startsWith('tel:')) {
          el.setAttribute('href', 'tel:' + String(verdi).replace(/[^\d+]/g, ''));
        }
      }
    });
    document.querySelectorAll(`[data-tekst-rik="${nokkel}"]`).forEach((el) => {
      el.innerHTML = rikTilHtml(verdi);
    });
  }

  function skrivUtAlt() { Object.keys(tekst).forEach(skrivUt); }

  function merkEndra() {
    let endra = 0;
    TEKSTFELT.forEach((f) => {
      const felt = document.querySelector(`#felt-${f.nokkel}`);
      if (!felt) return;
      const ulik = tekst[f.nokkel] !== standard[f.nokkel];
      felt.closest('.felt')?.classList.toggle('felt--endra', ulik);
      if (ulik) endra++;
    });
    const tal = document.querySelector('[data-endra-tal]');
    if (tal) {
      tal.textContent = endra === 0 ? 'Ingen felt er endra enno.'
        : (endra === 1 ? '1 felt er endra.' : `${endra} felt er endra.`);
    }
  }

  // Vi lagrar BERRE felta som skil seg frå det sida blir levert med.
  // Lagra vi heile objektet, ville eit einaste tastetrykk frose alle 43 felta,
  // og nye tekstar vi legg ut ville aldri nå fram til nokon som har vore
  // innom panelet.
  function lagre() {
    try {
      const endra = {};
      for (const n of Object.keys(standard)) {
        if (tekst[n] !== standard[n]) endra[n] = tekst[n];
      }
      if (Object.keys(endra).length) {
        localStorage.setItem(LAGERNOKKEL, JSON.stringify(endra));
      } else {
        localStorage.removeItem(LAGERNOKKEL);
      }
    } catch { /* fullt lager e.l. — teksten står framleis på skjermen */ }
  }

  function lastInnLagra() {
    try {
      // Gamle versjonar lagra alle felta under ein annan nøkkel. Den må vekk,
      // elles held han att tekstar som er oppdaterte sidan.
      localStorage.removeItem('volda-tekst');

      const r = localStorage.getItem(LAGERNOKKEL);
      if (r) tekst = { ...standard, ...JSON.parse(r) };
    } catch { /* øydelagt lager — bruk standard */ }
  }

  function fyllSkjema() {
    TEKSTFELT.forEach((f) => {
      const felt = document.querySelector(`#felt-${f.nokkel}`);
      if (felt) felt.value = tekst[f.nokkel];
    });
  }

  document.addEventListener('input', (ev) => {
    const felt = ev.target.closest('[data-tekstfelt]');
    if (!felt) return;
    const n = felt.dataset.tekstfelt;
    tekst[n] = felt.value;
    skrivUt(n);
    merkEndra();
    lagre();
  });

  document.querySelector('[data-tekst-nullstill]')?.addEventListener('click', () => {
    if (!confirm('Nullstille alle tekstane til det som stod her frå før?')) return;
    tekst = { ...standard };
    try { localStorage.removeItem(LAGERNOKKEL); } catch { /* ingenting */ }
    fyllSkjema(); skrivUtAlt(); merkEndra();
    varsle('Tekstane er sette tilbake.');
  });

  document.querySelector('[data-tekst-last-ned]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(tekst, null, 2)],
      { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'treverket-tekst.json';
    a.click();
    URL.revokeObjectURL(a.href);
    varsle('Fila er lasta ned. Send ho til Vebjørn.');
  });

  document.querySelector('[data-tekst-last-opp]')?.addEventListener('change', (ev) => {
    const fil = ev.target.files?.[0];
    if (!fil) return;
    const les = new FileReader();
    les.onload = () => {
      try {
        tekst = { ...standard, ...JSON.parse(les.result) };
        fyllSkjema(); skrivUtAlt(); merkEndra(); lagre();
        varsle('Teksten er lasta inn.');
      } catch {
        varsle('Klarte ikkje lese fila. Er det ei treverket-tekst.json?');
      }
    };
    les.readAsText(fil);
    ev.target.value = '';
  });

  document.querySelector('[data-tekst-kopier]')?.addEventListener('click', async () => {
    const linjer = TEKSTFELT.map((f) => `${f.merke}\n${tekst[f.nokkel]}\n`).join('\n');
    try {
      await navigator.clipboard.writeText(linjer);
      varsle('Alle tekstane er kopierte.');
    } catch {
      varsle('Nettlesaren tillét ikkje kopiering. Bruk «Last ned» i staden.');
    }
  });

  /* ------------------------------------------------------------- Start */

  settPalett(rot.dataset.palett || 'havre');

  lastInnLagra();
  fyllSkjema();
  skrivUtAlt();
  merkEndra();

  Object.keys(val).forEach(settChips);
  filtrer();
  teiknKorg();
  visSide(frahash(), false);
})();
