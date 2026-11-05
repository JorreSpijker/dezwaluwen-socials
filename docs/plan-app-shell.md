# Plan — app-shell met menu en header

## Context

App is nu één generator (programma/uitslagen via tabs). Wordt onderdeel van grotere socials-app met meer generators: Team van de week, Balsponsor, Laatste nieuws, Sponsor in de spotlight, Voorstelrondje. Nu alleen shell: header, zijbalkmenu, routing. Nieuwe items = placeholder-pagina. Module-inhoud later, per stuk.

Keuzes gebruiker:
- Programma en Uitslagen = twee losse menu-items; tabs verdwijnen.
- Header: clublogo + appnaam, titel huidige pagina, hamburger op mobiel.
- Layout desktop: **Menu | Preview | Instellingen**. Menu + preview vast patroon, instellingenkolom per generator anders.

## Aannames

- Routing via `location.hash` (`#/programma`, `#/uitslagen`, `#/team-van-de-week`, …), geen router-library. Herladen houdt pagina; default `#/programma`.
- Mobiel: header met hamburger, menu als drawer (overlay). Pagina-volgorde mobiel blijft instellingen bóven preview (eerder todo-punt), via CSS `order`.
- Exportknop blijft in instellingenkolom (mobiel fixed onderaan, zoals nu).
- Programma/Uitslagen delen opgeslagen state (`lib/storage.js`), zoals nu.

## Bestanden

- `src/lib/pages.js` (nieuw) — lijst `{ id, label }` van alle 7 menu-items, in menuvolgorde.
- `src/App.jsx` — wordt shell: hash-state lezen (`hashchange`-listener), header, menu, actieve pagina renderen. Huidige inhoud verhuist.
- `src/pages/Matches.jsx` (nieuw) — huidige App-body, `tab`-state vervangen door prop `kind` (`program`/`results`). Gerenderd met `key={kind}` zodat bereik reset bij wissel (= huidig `changeTab`-gedrag). `Tabs`-gebruik eruit. Grid omdraaien: preview links, instellingen rechts (`lg:grid-cols-[1fr_20rem]`).
- `src/pages/Placeholder.jsx` (nieuw) — titel + "Binnenkort".
- `src/components/Header.jsx` (nieuw) — `/logo.svg`, "De Zwaluwen socials", paginatitel, hamburgerknop (`lg:hidden`).
- `src/components/Menu.jsx` (nieuw) — links naar `#/<id>`, actieve markering; desktop vaste kolom, mobiel drawer met backdrop, sluit bij klik.
- `src/components/Tabs.jsx` — verwijderen (wees na wijziging).

Hergebruik: bestaande tailwind-tokens (`bg-club`, `text-club`), knopstijl actief/inactief uit `Tabs.jsx` voor menu-items.

## Stappen

1. Plan kopiëren naar `docs/plan-app-shell.md` → verify: bestand bestaat.
2. `pages.js`, `Placeholder.jsx`, `Header.jsx`, `Menu.jsx` → verify: build slaagt.
3. App-body naar `pages/Matches.jsx`, kolommen omdraaien → verify: programma en uitslagen werken als voorheen (fetch, slepen, verbergen, export).
4. `App.jsx` shell + hash-routing, `Tabs.jsx` weg → verify: alle 7 menu-items navigeren, herladen houdt pagina.

## Verificatie

- `npm run build` zonder fouten.
- `npm run dev`, desktop: menu links, preview midden, instellingen rechts; preview schaalt nog goed.
- Mobiele breedte (375px): hamburger opent/sluit drawer, instellingen boven preview, exportknop onderaan.
- Programma ↔ Uitslagen wisselen: datumbereik reset, eigen wedstrijden blijven bewaard.
- Export PNG nog 1080×1920 / 1080×1350.
