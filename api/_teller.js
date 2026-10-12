// Telling på serveren for rapportly.no/eksempel og rapportly.no/fra/<kilde>.
//
// Tor Andre 12.10.2026, alternativ B: ingen skript i nettleseren. Det er
// forespørselen brukeren selv sender ved å klikke på lenken som telles, og
// bare som et tall per døgn og kilde (nettside-teller i Rapportly). Ingen IP,
// ingen informasjonskapsel, ingenting om nettleseren lagres.
//
// User-Agent leses bare for å la være å telle det som ikke er mennesker:
// forhåndsvisninger i chat, e-postfiltre som sjekker lenker og roboter. Outlook
// Safe Links ser ofte ut som en vanlig nettleser og kan ikke skilles ut.
const TELLER = 'https://uknssnhiwjftcdosepiv.supabase.co/functions/v1/nettside-teller';

const IKKE_MENNESKE = /bot|crawl|spider|preview|slurp|facebookexternalhit|embedly|skype|whatsapp|discord|ms-office|microsoft office|mimecast|proofpoint|barracuda|python|curl|wget|go-http|java\/|okhttp|node-fetch|axios|headless|phantom|lighthouse/i;

function erMenneske(req) {
  const ua = String(req.headers['user-agent'] || '');
  return req.method === 'GET' && ua.length > 0 && !IKKE_MENNESKE.test(ua);
}

async function tell(hendelse, kilde) {
  try {
    const svar = await fetch(TELLER, {
      method: 'POST',
      // Funksjonen tar bare imot fra rapportly.no — samme vern som kontaktskjemaet.
      headers: { 'Content-Type': 'application/json', Origin: 'https://rapportly.no' },
      body: JSON.stringify({ hendelse, kilde }),
      signal: AbortSignal.timeout(1500),
    });
    if (!svar.ok) console.error('[teller]', hendelse, kilde, svar.status);
  } catch (e) {
    // Telleren skal aldri stoppe den som klikket.
    console.error('[teller]', hendelse, kilde, e && e.message);
  }
}

/** Kilden fra lenken: små bokstaver, tall og bindestrek. Alt annet blir «annet». */
function lesKilde(v) {
  const k = typeof v === 'string' ? v.trim().toLowerCase() : '';
  return /^[a-z0-9-]{1,30}$/.test(k) ? k : 'annet';
}

module.exports = { erMenneske, tell, lesKilde };
