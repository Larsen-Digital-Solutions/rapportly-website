/* Rapportly – cookie-samtykke + Google Analytics (laster GA kun etter «Godta») */
(function () {
  var GA_ID = 'G-97VHS0PLWM';
  var KEY = 'rapportly-cookie-consent';

  function loadGA() {
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

  function remember(val) {
    try { localStorage.setItem(KEY, val); } catch (e) {}
    var b = document.getElementById('cookie-banner');
    if (b) b.remove();
    if (val === 'granted') loadGA();
  }

  function showBanner() {
    var css = document.createElement('style');
    css.textContent =
      '#cookie-banner{position:fixed;bottom:1rem;left:1rem;right:1rem;z-index:9999;display:flex;justify-content:center;pointer-events:none}' +
      '#cookie-banner .cb-inner{pointer-events:auto;max-width:640px;width:100%;background:oklch(20% 0.08 258);color:oklch(92% 0.02 258);border:1px solid oklch(35% 0.08 258);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);padding:1.1rem 1.35rem;display:flex;flex-wrap:wrap;align-items:center;gap:.9rem 1.2rem;font-family:"Figtree",system-ui,sans-serif;font-size:.92rem;line-height:1.5}' +
      '#cookie-banner p{margin:0;flex:1 1 280px}' +
      '#cookie-banner a{color:oklch(78% 0.14 260);font-weight:600;text-decoration:underline}' +
      '#cookie-banner .cb-btns{display:flex;gap:.6rem;margin-left:auto}' +
      '#cookie-banner button{font-family:inherit;font-size:.88rem;font-weight:700;border-radius:9999px;padding:.55rem 1.3rem;cursor:pointer;border:0;transition:background .15s}' +
      '#cookie-banner .cb-decline{background:transparent;color:oklch(85% 0.02 258);border:1px solid oklch(45% 0.05 258)}' +
      '#cookie-banner .cb-decline:hover{background:oklch(30% 0.06 258)}' +
      '#cookie-banner .cb-accept{background:oklch(58% 0.22 260);color:#fff}' +
      '#cookie-banner .cb-accept:hover{background:oklch(52% 0.22 260)}' +
      '@media(max-width:560px){#cookie-banner .cb-btns{width:100%}#cookie-banner button{flex:1}}';
    document.head.appendChild(css);

    var wrap = document.createElement('div');
    wrap.id = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Samtykke til informasjonskapsler');
    wrap.innerHTML =
      '<div class="cb-inner">' +
        '<p>Vi bruker informasjonskapsler til anonym besøksstatistikk (Google Analytics) for å gjøre nettsiden bedre. <a href="/personvern">Les mer</a>.</p>' +
        '<div class="cb-btns">' +
          '<button type="button" class="cb-decline">Avslå</button>' +
          '<button type="button" class="cb-accept">Godta</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('.cb-accept').addEventListener('click', function () { remember('granted'); });
    wrap.querySelector('.cb-decline').addEventListener('click', function () { remember('denied'); });
  }

  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  if (choice === 'granted') {
    loadGA();
  } else if (choice === 'denied') {
    /* ingen sporing */
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
