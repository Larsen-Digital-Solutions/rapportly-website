# Pilotfixes — feil og ønsker fra pilotkunder

Sporing av alt pilotkunder melder inn under Rapportly-piloten, med rotårsak, fiks og status.
Kode bor i `projects/clarity-reporting/` (prod-prosjekt `uknssnhiwjftcdosepiv`, `app.rapportly.no`).

**Arbeidsregel:** rapporter ærlig — feil er feil. Hver sak: symptom → rotårsak (verifisert i kode/DB) → fiks → status. Ingen prod-endring uten Tor Andres OK.

---

## Status

| # | Dato | Pilotkunde | Sak | Alvor | Status |
|---|---|---|---|---|---|
| 001 | 2026-06-26 | Fredrik Vikse | Invitasjonslenke utløper for raskt | HØY | 🟡 Stopgap (24t) live + «Re-send» virker · 7-dagers-fiks pending |
| 002 | 2026-06-26 | Fredrik Vikse | Klient-import gjør ingenting («0 importert») | HØY | 🟢 Hovedfeil fikset i prod · frontend feil-visning pending |
| 003 | 2026-06-30 | Fredrik Vikse | Forside-grafikk vasker ut til hvit i nedlastet PDF | MID | ✅ Deployet + verifisert (test-Tripletex) · Oakberry-regen gjenstår |
| 004 | 2026-06-30 | Fredrik Vikse | Balanse: Varelager + Kundefordringer feilkategorisert | HØY | ✅ Deployet + verifisert (1396/1400/1579-seed) · Oakberry-regen gjenstår |
| 005 | 2026-06-30 | Fredrik Vikse | «Netto rentebærende gjeld» misvisende (konserngjeld) | MID | ✅ Fjernet + verifisert (test-Tripletex) |
| 006 | 2026-06-30 | Fredrik Vikse | Topp leverandører viser 0 utestående | HØY | ✅ Deployet + verifisert (test-Tripletex) |

---

## 001 · Invitasjonslenke utløper for raskt
**Meldt:** 2026-06-26, Fredrik Vikse (pilotbyrå).
**Symptom (kundens ord):** «Prøvde linken nå, og det står at den er utløpt. Varer den mindre enn et døgn?»

**Rotårsak (verifisert i kode):**
- Invitasjonslenken genereres som en **Supabase Auth-lenke**: `adminClient.auth.admin.generateLink({ type: 'invite' })` → `linkData.properties.action_link` (`supabase/functions/invite-staff/index.ts:218–235`).
- Levetiden til den lenken styres av Supabase Auth sin **«Email OTP Expiration»** (GoTrue `MAILER_OTP_EXP`) — **ikke** av vår `pending_invitations.expires_at`, som koden setter til **7 dager** (`invite-staff.ts:207`).
- Supabase-standard for e-postlenke-/OTP-utløp er typisk **1 time** (maks ~24t via dashboard). Derfor: 7-dagers-verdien er villedende, og en kunde som klikker dagen etter får «utløpt».

**Fiks-alternativer (rangert):**
1. **Strakstiltak (ingen kode, ingen deploy):** Hev «Email OTP Expiration» i Supabase → Authentication → Email til maks (f.eks. 86400 s = 24t). Dekker de fleste tilfeller. *Krever dashboard-tilgang.*
2. **Robust (kode):** Koble invitasjonen fra den korte Auth-OTP-en — bruk vår egen 7-dagers `pending_invitations`-token + en «sett passord»-side/endepunkt som oppretter kontoen ved klikk. Da bestemmer vi levetiden selv (f.eks. 7 dager), uavhengig av Auth-OTP. Større endring.
3. **UX-mitigering:** «Send invitasjon på nytt»-knapp i byrå-admin (re-invitasjon lager fersk lenke i dag — koden støtter `used_at: null`-reset). + Skriv i e-posten hvor lenge lenken varer.

**Strakshjelp til Fredrik nå:** send fersk invitasjon på nytt (genererer ny lenke) og be ham klikke med en gang. Hev gjerne utløpet (alt. 1) først, så holder den nye lenken lenger.

**Status:** 🟡 Stopgap live — OTP-utløp hevet `3600 → 86400` (1t → 24t) i Supabase Auth, 2026-06-26. «Re-send»-knappen lager fersk lenke og virker (kaller `invite-staff` på nytt). **Gjenstår:** ekte 7-dagers-fiks (egen token + `redeem-invite` som veksler inn fersk Supabase-lenke ved klikk) — anbefales før flere pilotkunder.

---

## 002 · Klient-import gjør ingenting («0 kunder importert»)
**Meldt:** 2026-06-26, Fredrik Vikse (Flyt Regnskap). Koblet Tripletex → klient (Oakberry Vest AS, org 936558887) hentes i Rapportly, men «Importer 1 kunde» gjorde ingenting.

**Rotårsak (verifisert i kode + DB):**
- Importen kjører `supabase.from('companies').upsert(row, { onConflict: 'tenant_id,org_nr' })` (`AddCompanyDialog.tsx:208`; samme mønster i `PowerOfficeCallback.tsx` og manuell «legg til»).
- `companies` hadde **kun** PK på `id` — **ingen unik indeks på `(tenant_id, org_nr)`**. Postgres kaster da 42P10 («no unique or exclusion constraint matching the ON CONFLICT specification»).
- Feilen svelges: `if (!error) count++` → loopen fullfører med count = 0 → `toast.success('0 kunder importert')`. Derav «ingenting skjer».
- **Tabell-vid** (rammet alle byråer, ikke bare Flyt). **Ikke** forårsaket av RLS-grant-herdingen (companies var urørt). Pre-eksisterende; Fredrik først til å treffe den i prod.

**Fiks:**
1. ✅ Ryddet ett blokkerende duplikat i Larsen-test (Holand Invest hadde lånt Larsen Digital Solutions' org.nr → org.nr fjernet).
2. ✅ La unik indeks `companies_tenant_org_uniq (tenant_id, org_nr)` i prod — migrasjon `20260626000001`, commit `7887e9f`. Upserten virker nå **uten app-deploy**.
3. ✅ **Frontend feil-visning gjort lokalt** (pending deploy): Tripletex-import (`AddCompanyDialog`) og PowerOffice-bulk (`PowerOfficeCallback`) viser nå ekte feil i stedet for stille «0 importert». CSV-import gjorde det allerede. Bevisste `.catch(()=>null)` på valgfrie rapport-seksjoner urørt (graceful degradation). Krever frontend-deploy for å nå prod.

**Status:** 🟢 Hovedfeil fikset i prod — Fredrik kan importere nå. Frontend feil-visning pending.

---

## 003 · Forside-grafikk vasker ut til hvit i nedlastet PDF
**Meldt:** 2026-06-30, Fredrik Vikse (Flyt Regnskap). Sammenligning av Oakberry-rapport (mai 2026) mot Tripletex-balanse.
**Symptom (kundens ord):** «Forsiden ser sykt bra ut i systemet, men når man laster ned i pdf skjer noe med grafikken.» — mørk forside med hvit logo/tekst ble hvit/utvasket i PDF.

**Rotårsak (verifisert i kode):**
- Fullstendig-rapporten lastes ned via nettleserens `window.print()` på `/rapport-visning` (`src/pages/MonthlyReportDetail.tsx:511–541`).
- Forsiden (`src/components/report/ThemedCover.tsx`) bygger mørk bakgrunn via CSS-gradienter (`ground`/`bannerTint`/`scrim` i `src/pdf/themes/flyt.ts`) + `.a4-cover { background: var(--ink) }`.
- `@media print`-blokken i `public/report-template/report-styles.css` manglet `print-color-adjust: exact`. Nettleseren stripper da bakgrunnsfarger/gradienter ved utskrift → hvit forside der hvit logo/tekst forsvinner. (Klientvennlig-malen hadde regelen; fullstendig hadde den ikke.)

**Fiks:** La `-webkit-print-color-adjust: exact; print-color-adjust: exact;` på `.a4-page, .a4-cover` i print-blokka. Egenskapen arves → dekker også de inline-stylede gradient-lagene + forsidebildet.

**Oppfølging (`40a0c5c`):** Mørk bakgrunn var avhengig av at forsidebildet rakk å laste — det korte 8s-taket kunne skrive ut uten et tregt bilde. Forhåndslaster nå forsidebilde + logo (varmer cachen) før print-iframen åpnes, og venter til hvert bilde er **dekodet** (ikke bare `complete`) før `window.print()`. 8s-taket erstattet med 30s anti-heng-backstopp. Bildet er nå garantert med — ingen fallback til ren bakgrunn.

**Status:** ✅ Deployet + verifisert (Tor Andre bekreftet forsiden i nedlastet PDF, 2026-06-30).

---

## 004 · Balanse: Varelager + Kundefordringer feilkategorisert
**Meldt:** 2026-06-30, Fredrik Vikse. Oakberry mai 2026: Varelager viste 604 076 (Tripletex konto 1400 = 290 789); kundefordringer inkluderte diverse andre fordringer.

**Rotårsak (verifisert i kode + mot Tripletex):**
- Kontointervallene i `EIENDEL_RANGES` (`supabase/functions/tripletex-proxy/index.ts`) var feil:
  - `varelager: 1300–1499` dro finansielle anleggsmidler (1393 Franchise 265 077 + 1396 Depositum 48 210 = 313 287) inn i lageret → 290 789 + 313 287 = 604 076.
  - `fordringer (label «Kundefordringer»): 1500–1799` lumpet andre fordringer (1700/1749/1770 = 53 719) sammen med ekte kundefordringer (1500 = 4 088) → 57 807.
- Feilen rammet også Sum omløpsmidler (1 112 649 vs 799 362), Likviditetsgrad (2,38 vs 1,71) og Arbeidskapital.

**Fiks:** Anleggsmidler = 1000–1399, Varelager = 1400–1499, Kundefordringer = 1500–1549, ny linje «Andre fordringer» = 1550–1799. Oppdaterte `omlopsmidler`-summen (+andre_fordringer), `prevOmlopsmidler` (1400–1999) og kontantstrømmens `endringVarelager` (1400–1499, fjernet 13xx-dobbelttelling mot anlegg).

**Verifisert (kodenivå, mot Tripletex):** Anleggsmidler 1 691 451 ✓ · Varelager 290 789 ✓ · Kundefordringer 4 088 ✓ · Andre fordringer 53 719 ✓ · Sum omløpsmidler 799 362 ✓ · Sum eiendeler uendret 2 490 813 ✓.

**Status:** 🟢 Deployet til prod (edge `tripletex-proxy` v98, 2026-06-30). Live-verifisering pending (Fredrik regenererer / test-Tripletex).

---

## 005 · «Netto rentebærende gjeld» misvisende
**Meldt:** 2026-06-30, Fredrik Vikse. «Ser ikke hvor 1,799 mill kommer fra … selskapet har egentlig ikke noe rentebærende gjeld.»

**Rotårsak (verifisert i kode):**
- `netDebt = langsiktigGjeld − bankinnskudd` (`tripletex-proxy` `buildKPIsFromData`) regnet ALL langsiktig gjeld som rentebærende. For Oakberry: 2 250 000 (konto 2260 «Gjeld til selskap i samme konsern», ikke-rentebærende) − 450 766 = 1 799 234.
- Saldobalansen alene avslører ikke hvilke poster som faktisk bærer rente → et automatisk tall blir misvisende.

**Fiks (Tor Andres beslutning: fjern):** Fjernet «Netto rentebærende gjeld»-raden fra rapporten (`src/lib/rapportDataMapper.ts`) og «Netto gjeld» fra app-visningen (`src/components/reports/ReportSections.tsx`). `netDebt` beregnes fortsatt i proxyen, men vises ikke.

**Status:** 🟢 Deployet til prod via Vercel (commit `3f17bcf`, 2026-06-30). Live-verifisering pending.

---

## 006 · Topp leverandører viser 0 utestående
**Meldt:** 2026-06-30, Fredrik Vikse. «Står at det er null utestående, men ser at de f.eks. skylder penger til Asko pr 31.05.»

**Rotårsak (verifisert i kode):**
- `outstandingBalance` var **hardkodet til 0** i både `getTopSuppliers` og `getTopCustomers` (`tripletex-proxy`), så «Utestående»-kolonnen og «Totalt utestående»-KPI-en (`src/pdf/TopSuppliersSection.tsx:19`, sum over raden) ble alltid 0 — selv om leverandørgjeld (127 106) fantes.

**Fiks:** Henter åpne reskontroposter via eksisterende `fetchOpenPostings` (leverandør 2400–2499 / kunde 1500–1799) pr. asOf, summerer per navn, og setter `outstandingBalance` per leverandør/kunde. Aldersfordeling-siden (total) var allerede korrekt; nå stemmer topp-listen overens.

**Status:** 🟢 Deployet til prod (edge `tripletex-proxy` v98, 2026-06-30). Live-verifisering pending (bekreft at Asko m.fl. viser reell saldo).
