# Jyotisha Kundli

A complete Vedic astrology (jyotisha) studio built with Next.js, TypeScript, Tailwind CSS and the Swiss Ephemeris. It computes a full birth chart and everything that hangs off it — dashas, divisional charts, panchang and muhurat, Ashtakoot matching, strength, yogas, transits and a printable report — server-side, with no third-party astrology API.

**Live demo:** run locally with `npm run dev` and open <http://localhost:3000>.

## What it does

| Area | Details |
| --- | --- |
| **Birth chart (D1)** | Sidereal positions of the nine grahas, whole-sign bhavas, lagna, nakshatra and pada, dignity, combustion, retrogradation, house lords, Bhrigu Bindu, Gulika, KP sub-lords, declination. North-Indian and South-Indian chart renderings. |
| **Divisional charts** | D1, D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa), D7 (Saptamsa), D9 (Navamsa), D10 (Dasamsa), D12 (Dwadasamsa), D16, D20, D24, D27, D30, D40, D45, D60 — Parashari rules. |
| **Dashas** | Vimshottari to five levels (Maha → Prana), with the running chain, full mahadasha sequence, balance at birth and Yogini dasha. |
| **Panchang** | Tithi, nakshatra, yoga, karana and vara for the sunrise-to-sunrise day; sunrise/sunset, day and night length, choghadiya (day and night), Rahu kaal, Yamaganda, Gulika kaal, Abhijit muhurat, horas, lunar month (Purnimanta and Amanta), Vikram and Shaka samvat, samvatsara, ritu and ayana. |
| **Matching** | Ashtakoot Guna Milan — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi — with Mangal dosha and its classical cancellations for both charts. |
| **Strength** | Shadbala in virupas and rupas against the classical minima, Vimshopaka, and full Ashtakavarga (Bhinnashtakavarga, Sarvashtakavarga and the 337-point totals). |
| **Yogas** | Raja, Dhana, Chandra, Pancha Mahapurusha, Nabhasa, doshas (Mangal, Kaal Sarpa, Kemadruma, Kendradhipati, Shakata, Daridra and more), with the rule that formed each one. |
| **Timing** | Current transits against the natal Moon, Sade Sati status and its windows, and the running dasha chain. |
| **Reading** | A generated interpretation: lagna and Moon personality, house-by-house reading, yogas, and traditional upaya. |
| **Report** | A print-ready full report (`/report`) with every table; “Print / save PDF” uses the browser’s print dialog and a dedicated print stylesheet. |

## Conventions

The defaults follow Jagannatha Hora, Parashara’s Light and AstroSage Kundli:

- **Ayanamsa:** Lahiri / Chitrapaksha (True Chitrapaksha, Raman, KP, Yukteshwar and Fagan–Bradley are selectable).
- **Node:** mean lunar node (true node optional).
- **Houses:** whole-sign (Rasi = Bhava); Sripati, Porphyry, Placidus and Equal are selectable.
- **Dasha year:** 365.25 days (360-day savana optional in the engine).
- **Positions:** apparent geocentric, sidereal, from the Swiss Ephemeris.
- **Vara:** weekday of the local sunrise that begins the Hindu day.
- **Panchang sunrise:** centre of the disc, no refraction — the Drik Panchang / JHora convention.

Calculation options can be changed in the forms; they are encoded in the URL so a chart is shareable and reproducible.

## Stack

- Next.js 16 (App Router, server components) and React 19
- TypeScript, Tailwind CSS 4
- [`sweph`](https://www.npmjs.com/package/sweph) — native Node bindings for the Swiss Ephemeris
- No database and no external astrology service: everything is computed per request.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run build   # production build
npm start       # run the production build
```

### Deploying

GitHub Pages cannot host this app: the chart maths runs on the server with a native Swiss Ephemeris module. Use a Node host such as Vercel, Render or a VPS.

- **Vercel:** import the repository at <https://vercel.com/new>, keep the default Next.js settings, and deploy. `next.config.ts` traces `ephe/**` into the server bundle, and `sweph` ships prebuilt Linux x64/arm64 binaries.
- **Docker / VPS:** `npm ci && npm run build && npm start` with `ephe/` alongside the app.
- Set `SE_EPHE_PATH` if you keep the ephemeris files outside `ephe/`.

### Ephemeris data

`sweph` loads its `.se1` files from `ephe/` at runtime (see `src/lib/astro/ephemeris.ts`). The repository ships the files needed for 1800–2400:

```
ephe/seas_18.se1    ephe/semo_18.se1    ephe/sepl_18.se1    ephe/sefstars.txt
```

Keep that directory next to the app when deploying, or point `SE_EPHE_PATH` at your own copy of the Swiss Ephemeris files. If the files are missing, the library falls back to its built-in Moshier ephemeris, which is less precise for the outer planets.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and birth-detail form |
| `/kundli` | Full chart with tabs: Overview, Charts & vargas, Dashas, Panchang, Strength, Yogas & reading |
| `/matching` | Ashtakoot matching for two people |
| `/panchang` | Daily panchang and muhurat for any date and place, with previous/next navigation |
| `/report` | Printable, complete report |

All state lives in query parameters (`n`, `d`, `t`, `p`, `lat`, `lon`, `tz`, `ay`, `hs`, …), so every view is a shareable link.

## Project layout

```
src/
  app/                  routes (kundli, matching, panchang, report)
  components/           client views: forms, charts, tab shell, panels
  lib/
    astro/
      ephemeris.ts      Swiss Ephemeris wrapper (server only)
      options.ts        calculation options safe for the browser bundle
      chart.ts          D1 chart, dignity, combustion, house lords
      vargas.ts         divisional chart rules
      dasha.ts          Vimshottari and Yogini dashas
      panchang.ts       five limbs, sunrise day, muhurat windows
      strength.ts       Shadbala and Vimshopaka
      ashtakavarga.ts   Bhinnashtakavarga and Sarvashtakavarga
      yogas.ts          yoga and dosha detection
      matching.ts       Ashtakoot and Mangal dosha
      interpret.ts      generated reading
      index.ts          orchestrator: computeKundli()
    geo/cities.ts       offline city database with coordinates and IANA zones
    time.ts             IANA timezone conversion, Julian Day, weekday
  scripts/              smoke checks (npm run smoke, npm run check:panchang)
ephe/                   Swiss Ephemeris data files
```

`sweph` is a native module and must stay on the server. Client components import choices and types from `src/lib/astro/options.ts` and `src/lib/astro/constants.ts` only; `src/lib/astro/ephemeris.ts` is never imported into a client bundle.

## Verification

```bash
npm run smoke           # end-to-end engine check for a known chart
npm run check:panchang  # weekday/panchang sanity across timezones
```

The smoke test checks the 1990-01-01 12:00 New Delhi chart: lagna Pisces 13°55′, Moon Dhanishta 4, Shukla Panchami, Mars balance 0.106 years, Ashtakavarga totals 48/49/39/54/56/52/39 (sum 337).

## Accuracy and attribution

- Astronomy: [Swiss Ephemeris](https://www.astro.com/swisseph/) by Astrodienst (AGPL-3.0 for the free version; commercial licences are available from Astrodienst). The `sweph` npm package wraps the same engine used by Jagannatha Hora and Parashara’s Light.
- Ashtakavarga tables: the classical B. V. Raman layout, ported from [VedAstro](https://github.com/VedAstro/VedAstro) (MIT licence).
- Classical rules: Parashara’s *Brihat Parashara Hora Shastra*, with conventions cross-checked against Jagannatha Hora, AstroSage Kundli, Parashara’s Light and the open-source `jyotisha` / VedAstro projects. No proprietary code from commercial software is copied.

## Disclaimer

This app is for study and guidance. It is not medical, legal or financial advice, and it is not a substitute for a consultation with a qualified astrologer. A birth-time error of four minutes moves the lagna by about one degree — verify the lagna when it sits near a sign boundary.
