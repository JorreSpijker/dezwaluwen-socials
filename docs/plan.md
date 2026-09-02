# Social media afbeeldingen generator — De Zwaluwen

## Context

Club De Zwaluwen (korfbal, clubcode `NCX35M2`) wil wekelijks twee story-afbeeldingen posten op Instagram en Facebook: het **programma** van de komende week en de **uitslagen** van de afgelopen week. Dat gebeurt nu handmatig. Deze tool haalt de data live uit de KNKV-API, rendert die in een story-template (1080×1920) en exporteert als PNG.

`/Users/jorrespijker/Dev/dezwaluwen-socials` is nu leeg — greenfield, geen git repo.

## Bevindingen uit API-onderzoek

- `GET https://api-mijn.korfbal.nl/api/v2/clubs/NCX35M2/program?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` werkt zonder auth en stuurt `access-control-allow-origin: *` mee → **directe fetch vanuit de browser, geen proxy nodig**.
- Responsvorm programma: array van weekblokken, elk `{ year, week, matches: [...] }`. Match:
  ```json
  {
    "date": "2026-09-05T09:00:00+0200",
    "teams": { "home": { "name": "Zwaluwen J7", "clubRefId": "NCX35M2" },
               "away": { "name": "Oost-Arnhem J6", "clubRefId": "NCX17P9" } },
    "facility": { "name": "Sportpark Hengelder", "address": { "city": "ZEVENAAR" } },
    "field": { "name": "1K40 A" },
    "pool": { "name": "Gr4-040" },
    "status": { "game": "gepland", "status": "SCHEDULED" },
    "ref_id": 3162
  }
  ```
  Eigen club herkenbaar aan `clubRefId === "NCX35M2"` (niet aan teamnaam matchen).
- Testweek 31-08 t/m 07-09-2026 gaf 1 weekblok, 10 wedstrijden, allemaal op zaterdag.
- **`/results` geeft momenteel `[]`** voor elk geprobeerd bereik (aug 2026, apr 2026, nov 2025, geen params). `/program` op datums in het verleden geeft ook `[]`. Conclusie: de API bevat alleen het huidige/komende seizoen en er is dit seizoen nog niet gespeeld (eerste wedstrijden 05-09-2026). De exacte vorm van een uitslag-object is dus **niet empirisch te verifiëren**.

  **Aanname:** uitslagen hebben dezelfde structuur als programma-matches plus een scoreveld. De parser wordt daarom defensief: hij zoekt de score achtereenvolgens op `match.score`, `match.result`, `match.stats`, `match.teams.home.score`/`away.score` en accepteert zowel `{home, away}` als `"12-10"`-strings. Vindt hij niets, dan toont de UI de ruwe JSON van de eerste match in een `<details>`-blok zodat de mapping in één ronde bijgesteld kan worden zodra er echte data is (na 5 september).

## Keuzes (bevestigd door gebruiker)

| Onderwerp | Keuze |
|---|---|
| Stack | Vite + React + Tailwind, statisch te hosten |
| Overflow | Auto-schalen van rijhoogte/fontsize, altijd één afbeelding |
| Filter | Alle wedstrijden, met checkboxes per team om te verbergen |
| Datums | Berekende defaults + date-inputs als override |

## Architectuur

```
dezwaluwen-socials/
├── index.html
├── package.json            vite, react, react-dom, tailwindcss, html-to-image, date-fns
├── tailwind.config.js
├── public/logo-placeholder.svg
├── docs/plan.md            kopie van dit plan (eerste stap na goedkeuring)
└── src/
    ├── main.jsx
    ├── App.jsx             tabs, datum-state, filter-state, exportknop
    ├── api/korfbal.js      fetchProgram / fetchResults + normalisatie
    ├── lib/dates.js        today / nextWeek / oneWeekAgo, formatters (nl)
    ├── lib/export.js       exportPng(node, filename)
    ├── components/
    │   ├── Tabs.jsx
    │   ├── Controls.jsx       date-inputs + team-checkboxes + exportknop
    │   ├── StoryCanvas.jsx    1080×1920 frame, logo, titel, kinderen, footer
    │   ├── MatchRow.jsx       programma-rij
    │   └── ResultRow.jsx      uitslag-rij
    └── index.css
```

### `src/api/korfbal.js`

Één `fetchMatches(kind, dateFrom, dateTo)` voor beide endpoints — zelfde basis-URL, alleen `program`/`results` verschilt. Vlakt de weekblokken plat en normaliseert naar één model:

```js
{ id, date: Date, home, away, isHomeClub, isAwayClub,
  facility, city, field, pool, score: {home, away} | null }
```

`score` blijft `null` voor programma. Sorteren op datum, daarna op tijd.

### `src/lib/dates.js`

`today()`, `nextWeek()` (+7d), `oneWeekAgo()` (−7d), alle als `yyyy-MM-dd` via `date-fns`. Plus `formatDayHeader` (`zaterdag 5 september`) en `formatTime` (`09:00`) met `nl` locale — de API-datum bevat al de juiste offset (`+0200`), dus geen tijdzone-conversie doen.

### `src/components/StoryCanvas.jsx`

- Vaste `width: 1080px; height: 1920px` — de echte exportmaat. Instagram- en Facebook-story delen dezelfde 9:16-maat, dus één template volstaat.
- In de UI in een wrapper met `transform: scale(0.3)` + `transform-origin: top left` zodat de preview op het scherm past. De export-node is de **binnenste** div, dus de scale raakt de PNG niet.
- Layout: logo bovenin (`public/logo-placeholder.svg`, gecentreerd, ~200px hoog), daaronder titel ("PROGRAMMA" / "UITSLAGEN") met weekbereik, dan de wedstrijdlijst onder elkaar, met een dagkop per speeldag. Footer met clubnaam/handle.
- **Auto-schaal:** één afgeleide waarde uit `matches.length` bepaalt rijhoogte, fontsize en padding (bijv. `≤8 → ruim`, `9–14 → normaal`, `15+ → compact`) via een lookup-tabel in plaats van meet-logica. Deterministisch en dus reproduceerbaar in de export.
- Eigen team wordt vet/accentkleur gezet op basis van `isHomeClub`/`isAwayClub`.

### `src/lib/export.js`

`html-to-image`'s `toPng(node, { pixelRatio: 1, width: 1080, height: 1920, style: { transform: 'none' } })` → blob → download als `zwaluwen-programma-2026-09-05.png`. De `style`-override neutraliseert de preview-scale tijdens het renderen.

Het logo is een lokale SVG in `public/`, dus geen cross-origin taint op het canvas. Externe fonts vermijden (system font stack of een lokaal `@font-face` met base64) — remote fonts zijn de meest voorkomende oorzaak van kapotte html-to-image-output.

### `src/App.jsx`

State: `tab`, `dateFrom`, `dateTo` (reset naar de juiste defaults bij tabwissel), `matches`, `hiddenTeams: Set`, `loading`, `error`. Fetch in een `useEffect` op `[tab, dateFrom, dateTo]`. Team-checkboxes worden afgeleid uit de eigen-clubteams in de respons.

Lege respons is een normale toestand (zoals `/results` nu): toon "Geen wedstrijden in dit bereik", geen foutmelding.

## Stappen

1. Vite-project opzetten (`npm create vite@latest . -- --template react`), Tailwind + html-to-image + date-fns toevoegen, `docs/plan.md` schrijven → verify: `npm run dev` toont de lege app.
2. `lib/dates.js` + `api/korfbal.js` met normalisatie → verify: programma-tab logt 10 genormaliseerde wedstrijden voor 31-08…07-09-2026.
3. `StoryCanvas` + `MatchRow` + tabs + controls → verify: preview toont de 10 wedstrijden onder elkaar met logo en dagkop.
4. `ResultRow` + defensieve score-parser + JSON-fallback-blok → verify: uitslagen-tab toont de lege staat zonder crash.
5. PNG-export → verify: geëxporteerd bestand is exact 1080×1920 en visueel gelijk aan de preview.
6. Auto-schaal-tabel + team-filter → verify: filter uitvinken haalt rijen weg en de layout schaalt mee.

## Verificatie

- `npm run dev`, programma-tab: 10 wedstrijden voor de standaarddatums.
- Export-PNG openen en de afmetingen controleren (`sips -g pixelWidth -g pixelHeight bestand.png` → 1080 × 1920).
- Overflow testen door `dateTo` op ~4 weken te zetten; controleren dat alles binnen het frame blijft.
- Uitslagen-tab: nu leeg; na 5 september 2026 opnieuw draaien en de score-mapping bevestigen aan de hand van het fallback-JSON-blok.

## Open punt

Het echte clubloog ontbreekt — er wordt een placeholder-SVG gebruikt. Vervangen door `public/logo.svg` (of PNG) neer te zetten en het pad in `StoryCanvas.jsx` aan te passen.
