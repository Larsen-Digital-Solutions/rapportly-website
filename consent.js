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
      '#cookie-banner{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(6,12,26,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}' +
      '#cookie-banner .cb-inner{max-width:460px;width:100%;background:oklch(20% 0.08 258);color:oklch(92% 0.02 258);border:1px solid oklch(35% 0.08 258);border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.45);padding:2rem 2rem 1.75rem;text-align:center;font-family:"Figtree",system-ui,sans-serif}' +
      '#cookie-banner .cb-title{font-size:1.25rem;font-weight:800;margin:0 0 .6rem;color:#fff}' +
      '#cookie-banner p{margin:0 0 1.5rem;font-size:1rem;line-height:1.6}' +
      '#cookie-banner a{color:oklch(78% 0.14 260);font-weight:600;text-decoration:underline}' +
      '#cookie-banner .cb-btns{display:flex;gap:.7rem;justify-content:center}' +
      '#cookie-banner button{font-family:inherit;font-size:.95rem;font-weight:700;border-radius:9999px;padding:.75rem 1.8rem;cursor:pointer;border:0;transition:background .15s,transform .15s}' +
      '#cookie-banner .cb-decline{background:transparent;color:oklch(85% 0.02 258);border:1px solid oklch(45% 0.05 258)}' +
      '#cookie-banner .cb-decline:hover{background:oklch(30% 0.06 258)}' +
      '#cookie-banner .cb-accept{background:oklch(58% 0.22 260);color:#fff}' +
      '#cookie-banner .cb-accept:hover{background:oklch(52% 0.22 260);transform:translateY(-1px)}' +
      '@media(max-width:480px){#cookie-banner .cb-btns{flex-direction:column-reverse}#cookie-banner button{width:100%}}';
    document.head.appendChild(css);

    var wrap = document.createElement('div');
    wrap.id = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Samtykke til informasjonskapsler');
    wrap.innerHTML =
      '<div class="cb-inner">' +
        '<p class="cb-title">Informasjonskapsler</p>' +
        '<p>Vi bruker informasjonskapsler til besøksstatistikk (Google Analytics) for å gjøre nettsiden bedre. <a href="personvern.html">Les mer</a>.</p>' +
        '<div class="cb-btns">' +
          '<button type="button" class="cb-decline">Avslå</button>' +
          '<button type="button" class="cb-accept">Godta</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('.cb-accept').addEventListener('click', function () { remember('granted'); });
    wrap.querySelector('.cb-decline').addEventListener('click', function () { remember('denied'); });
  }

  /* Lar brukeren endre/trekke tilbake samtykke — kalles fra «Informasjonskapsler»-lenken i footer */
  window.rapportlyResetConsent = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (!document.getElementById('cookie-banner')) showBanner();
  };

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
