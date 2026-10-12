/* Teller uten informasjonskapsler (12.10.2026).

   - Besøk fra en merket lenke (?utm_source=…) telles én gang per sidevisning.
   - window.rapportlyTell(hendelse, kilde) brukes av /eksempel for å telle
     åpninger av eksempelrapporten.

   Ingenting lagres i nettleseren, og ingenting om nettleseren sendes — bare
   hendelsen og kilden. Funksjonen nettside-teller i Rapportly legger det til
   et tall per døgn. Derfor trengs ikke samtykke, og den står utenfor consent.js.

   text/plain og ikke application/json: da slipper nettleseren å sende en
   CORS-forespørsel først, og keepalive holder tellingen i live selv om siden
   byttes ut (som på /eksempel). */
(function () {
  var TELLER = 'https://uknssnhiwjftcdosepiv.supabase.co/functions/v1/nettside-teller';

  function tell(hendelse, kilde) {
    try {
      return fetch(TELLER, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ hendelse: hendelse, kilde: kilde || '' }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {
      return Promise.resolve();
    }
  }

  window.rapportlyTell = tell;

  var kilde = new URLSearchParams(location.search).get('utm_source');
  if (kilde) tell('besok', kilde);
})();
