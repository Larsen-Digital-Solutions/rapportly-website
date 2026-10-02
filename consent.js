/* Rapportly – samtykke til informasjonskapsler + besøksstatistikk. Google Analytics og Vercel Web Analytics lastes kun
   etter samtykke til «Statistikk» (ekomloven § 3-15 gjelder også skript uten informasjonskapsler, jf. EDPB 2/2023 pkt. 33).
   Banneret blokkerer ikke siden. «Kun nødvendige» og «Godta alle» er like store og like synlige.
   Valget lagres med tidspunkt og spørres om igjen etter 6 måneder (CNILs anbefaling; Datatilsynet har ingen frist),
   eller når VERSJON økes (ny tekst eller endringer hos Google). Lukk (×) uten valg regnes som «nei». */
(function () {
  var GA_ID = 'G-97VHS0PLWM';
  var KEY = 'rapportly-samtykke';
  var VERSJON = 1;
  var GYLDIG_MS = 182 * 864e5;

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function loadVercel() {
    if (window.__vaLoaded) return;
    window.__vaLoaded = true;
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://cdn.vercel-insights.com/v1/script.js';
    document.head.appendChild(s);
  }

  function lastStatistikk() { loadGA(); loadVercel(); }

  /* Trukket samtykke: stopp GA på denne siden og slett informasjonskapslene den har satt */
  function stopGA() {
    window['ga-disable-' + GA_ID] = true;
    document.cookie.split(';').forEach(function (c) {
      var navn = c.split('=')[0].trim();
      if (navn === '_ga' || navn.indexOf('_ga_') === 0) {
        ['', '; domain=.rapportly.no', '; domain=rapportly.no'].forEach(function (d) {
          document.cookie = navn + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  function lesValg() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && v.versjon === VERSJON && Date.now() - new Date(v.tid).getTime() < GYLDIG_MS) return v;
    } catch (e) {}
    return null;
  }

  function lagre(statistikk) {
    var hadde = lesValg();
    try { localStorage.setItem(KEY, JSON.stringify({ versjon: VERSJON, statistikk: statistikk, tid: new Date().toISOString() })); } catch (e) {}
    lukk();
    if (statistikk) lastStatistikk();
    else if (hadde && hadde.statistikk) stopGA();
  }

  var CSS =
    '#cookie-banner{position:fixed;left:1.5rem;bottom:1.5rem;z-index:9999;width:min(25rem,calc(100vw - 1.5rem));max-height:calc(100dvh - 3rem);overflow-y:auto;overscroll-behavior:contain;' +
      'background:oklch(20% 0.08 258);color:oklch(86% 0.02 258);border:1px solid oklch(34% 0.07 258);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.38);' +
      'font-family:"Figtree",system-ui,sans-serif;font-size:.875rem;line-height:1.55;text-align:left;animation:cb-inn .22s cubic-bezier(.2,.8,.2,1)}' +
    '@keyframes cb-inn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '#cookie-banner .cb-body{padding:1.4rem 1.4rem 1.25rem}' +
    '#cookie-banner .cb-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:0 0 .45rem}' +
    '#cookie-banner .cb-title{font-size:1rem;font-weight:800;margin:0;color:#fff;letter-spacing:-.005em}' +
    '#cookie-banner p{margin:0}' +
    '#cookie-banner a{color:#fff;font-weight:600;text-decoration:underline;text-decoration-color:oklch(100% 0 0 / .4);text-underline-offset:2px}' +
    '#cookie-banner a:hover{text-decoration-color:#fff}' +
    '#cookie-banner .cb-btns{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:1.1rem}' +
    '#cookie-banner .cb-btn{font-family:inherit;font-size:.875rem;font-weight:700;border-radius:9999px;padding:.7rem 1rem;cursor:pointer;border:0;' +
      'background:#fff;color:oklch(20% 0.08 258);transition:background .15s}' +
    '#cookie-banner .cb-btn:hover{background:oklch(90% 0.03 258)}' +
    '#cookie-banner .cb-link{display:block;margin:.85rem auto 0;padding:.2rem;background:none;border:0;font:inherit;font-size:.8125rem;font-weight:600;color:oklch(80% 0.03 258);cursor:pointer;text-decoration:underline;text-decoration-color:oklch(100% 0 0 / .35);text-underline-offset:2px}' +
    '#cookie-banner .cb-link:hover{color:#fff}' +
    '#cookie-banner .cb-x{flex:none;width:2rem;height:2rem;margin:-.4rem -.5rem -.4rem 0;border-radius:9999px;border:0;background:none;color:oklch(80% 0.03 258);font-size:1.35rem;line-height:1;cursor:pointer}' +
    '#cookie-banner .cb-x:hover{background:oklch(28% 0.07 258);color:#fff}' +
    '#cookie-banner button:focus-visible{outline:2px solid oklch(78% 0.14 260);outline-offset:2px}' +
    /* Lag 2: kategoriene */
    '#cookie-banner .cb-kat{border-top:1px solid oklch(32% 0.06 258);padding:.95rem 0 .1rem;margin-top:.95rem}' +
    '#cookie-banner .cb-kat-topp{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.3rem}' +
    '#cookie-banner .cb-kat h3{font-size:.9rem;font-weight:700;color:#fff;margin:0}' +
    '#cookie-banner .cb-alltid{font-size:.75rem;font-weight:600;color:oklch(78% 0.03 258);white-space:nowrap}' +
    '#cookie-banner .cb-switch{flex:none;position:relative;width:2.6rem;height:1.5rem;border-radius:9999px;border:0;padding:0;cursor:pointer;background:oklch(38% 0.05 258);transition:background .15s}' +
    '#cookie-banner .cb-switch::after{content:"";position:absolute;top:.1875rem;left:.1875rem;width:1.125rem;height:1.125rem;border-radius:50%;background:#fff;transition:transform .15s}' +
    '#cookie-banner .cb-switch[aria-checked="true"]{background:oklch(58% 0.22 260)}' +
    '#cookie-banner .cb-switch[aria-checked="true"]::after{transform:translateX(1.1rem)}' +
    '#cookie-banner details{margin-top:.45rem}' +
    '#cookie-banner summary{cursor:pointer;font-size:.8125rem;font-weight:600;color:oklch(80% 0.03 258);width:max-content;list-style-position:inside}' +
    '#cookie-banner summary:hover{color:#fff}' +
    '#cookie-banner .cb-kake{margin-top:.5rem;padding:.6rem .75rem;border-radius:8px;background:oklch(24% 0.07 258);font-size:.8125rem}' +
    '#cookie-banner .cb-kake dl{display:grid;grid-template-columns:auto 1fr;gap:.15rem .75rem;margin:0}' +
    '#cookie-banner .cb-kake dt{color:oklch(72% 0.03 258)}' +
    '#cookie-banner .cb-kake dd{margin:0;color:oklch(90% 0.02 258)}' +
    '#cookie-banner .cb-kake code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.78rem;color:#fff}' +
    '#cookie-banner .cb-merk{margin-top:.95rem;font-size:.8125rem;color:oklch(76% 0.03 258)}' +
    '@media(max-width:540px){#cookie-banner{left:.75rem;bottom:.75rem;max-height:calc(100dvh - 1.5rem)}}' +
    '@media(prefers-reduced-motion:reduce){#cookie-banner{animation:none}}';

  function kake(navn, hvem, formaal, varighet, ikkeKode) {
    return '<div class="cb-kake"><dl>' +
      '<dt>Navn</dt><dd>' + (ikkeKode ? navn : '<code>' + navn + '</code>') + '</dd>' +
      '<dt>Fra</dt><dd>' + hvem + '</dd>' +
      '<dt>Formål</dt><dd>' + formaal + '</dd>' +
      '<dt>Varighet</dt><dd>' + varighet + '</dd>' +
    '</dl></div>';
  }

  function forside() {
    return '<div class="cb-body">' +
      '<div class="cb-head"><p class="cb-title" id="cb-tittel">Informasjonskapsler</p>' + LUKK + '</div>' +
      '<p>Med ditt samtykke bruker vi Google Analytics og Vercel Web Analytics til å telle besøk og se hvilke sider som brukes, slik at vi kan gjøre nettsiden bedre. Opplysningene blir tilgjengelige for Google og Vercel, også i USA, og Google setter informasjonskapsler. Du kan trekke tilbake samtykket når som helst under «Informasjonskapsler» nederst på siden.</p>' +
      '<div class="cb-btns">' +
        '<button type="button" class="cb-btn" data-valg="nei">Kun nødvendige</button>' +
        '<button type="button" class="cb-btn" data-valg="ja">Godta alle</button>' +
      '</div>' +
      '<button type="button" class="cb-link" data-vis="detaljer">Les mer og tilpass</button>' +
    '</div>';
  }

  var LUKK = '<button type="button" class="cb-x" data-lukk aria-label="Lukk">×</button>';

  function detaljer(statistikk) {
    return '<div class="cb-body">' +
      '<div class="cb-head"><p class="cb-title" id="cb-tittel">Informasjonskapsler</p>' + LUKK + '</div>' +
      '<p>Her ser du hva som lagres på enheten din, hvorfor og hvor lenge. Statistikk er av til du slår den på.</p>' +
      '<div class="cb-kat">' +
        '<div class="cb-kat-topp"><h3>Nødvendige</h3><span class="cb-alltid">Alltid på</span></div>' +
        '<p>Husker valget du gjør her, så du ikke blir spurt på hver side.</p>' +
        '<details><summary>Vis detaljer</summary>' +
          kake('rapportly-samtykke', 'Rapportly (lokal lagring i nettleseren)', 'Lagrer valget ditt om informasjonskapsler', '6 måneder') +
        '</details>' +
      '</div>' +
      '<div class="cb-kat">' +
        '<div class="cb-kat-topp"><h3 id="cb-stat">Statistikk</h3>' +
          '<button type="button" class="cb-switch" role="switch" aria-checked="' + (statistikk ? 'true' : 'false') + '" aria-labelledby="cb-stat"></button></div>' +
        '<p>Google Analytics og Vercel Web Analytics gir oss statistikk over hvilke sider som besøkes og hvordan besøkende finner fram. Opplysningene behandles av Google og Vercel, også i USA.</p>' +
        '<details><summary>Vis detaljer</summary>' +
          kake('_ga', 'Google', 'Skiller besøkende fra hverandre', 'Inntil 2 år') +
          kake('_ga_97VHS0PLWM', 'Google', 'Holder rede på økten din', 'Inntil 2 år') +
          kake('Vercel Web Analytics', 'Vercel', 'Teller sidevisninger, uten informasjonskapsler', 'Lagres ikke på enheten din', true) +
        '</details>' +
      '</div>' +
      '<p class="cb-merk">Les mer i <a href="/personvern#punkt-5">personvernerklæringen</a>.</p>' +
      '<div class="cb-btns">' +
        '<button type="button" class="cb-btn" data-valg="lagre">Lagre valg</button>' +
        '<button type="button" class="cb-btn" data-valg="ja">Godta alle</button>' +
      '</div>' +
    '</div>';
  }

  var boks = null;
  function lukk() { if (boks) { boks.remove(); boks = null; } }
  function lukkUtenValg() { if (lesValg()) lukk(); else lagre(false); }

  function vis(lag) {
    if (!document.getElementById('cb-css')) {
      var css = document.createElement('style');
      css.id = 'cb-css';
      css.textContent = CSS;
      document.head.appendChild(css);
    }
    if (!boks) {
      boks = document.createElement('div');
      boks.id = 'cookie-banner';
      boks.setAttribute('role', 'dialog');
      boks.setAttribute('aria-modal', 'false');
      boks.setAttribute('aria-labelledby', 'cb-tittel');
      document.body.appendChild(boks);
      boks.addEventListener('click', function (e) {
        var t = e.target.closest('button');
        if (!t) return;
        if (t.hasAttribute('data-lukk')) return lukkUtenValg();
        if (t.classList.contains('cb-switch')) return t.setAttribute('aria-checked', t.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        if (t.getAttribute('data-vis') === 'detaljer') { vis('detaljer'); var f = boks.querySelector('.cb-switch'); if (f) f.focus(); return; }
        var valg = t.getAttribute('data-valg');
        if (valg === 'ja') lagre(true);
        else if (valg === 'nei') lagre(false);
        else if (valg === 'lagre') lagre(boks.querySelector('.cb-switch').getAttribute('aria-checked') === 'true');
      });
      boks.addEventListener('keydown', function (e) { if (e.key === 'Escape') lukkUtenValg(); });
    }
    var v = lesValg();
    boks.innerHTML = lag === 'detaljer' ? detaljer(!!(v && v.statistikk)) : forside();
  }

  /* «Informasjonskapsler»-lenken i footer: åpner innstillingene med dagens valg */
  window.rapportlyResetConsent = function () {
    vis('detaljer');
    var x = boks.querySelector('.cb-switch');
    if (x) x.focus();
  };

  try { localStorage.removeItem('rapportly-cookie-consent'); } catch (e) {} /* gammel nøkkel uten tidspunkt */
  var valg = lesValg();
  if (valg) {
    if (valg.statistikk) lastStatistikk();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { vis('forside'); });
  } else {
    vis('forside');
  }
})();
