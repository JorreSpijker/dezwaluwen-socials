# Plan: Balsponsor, Sponsor in de spotlight, Voorstelrondje

## Context
Drie menu-items staan nog op placeholder. Zelfde opzet als Laatste nieuws / Team van de week: `Generator` + `CanvasFrame` + `PhotoBox`, story en post.

## Inhoud
- **Balsponsor**: sponsorlogo (groot, passend), sponsornaam, optionele tekst, wedstrijd Zwaluwen 1 uit API (eerstvolgende automatisch).
- **Sponsor in de spotlight**: foto, logo (klein wit vlak naast naam), naam, tekst, optionele website.
- **Voorstelrondje**: foto, naam, team/rol, vraag-antwoordparen (toevoegen/verwijderen, standaardvragen voorgevuld; alleen beantwoorde vragen op afbeelding).

## Stappen
1. S1-wedstrijden ophalen + keuzeveld uit `TeamOfWeek.jsx` naar `src/components/FirstTeamMatch.jsx` (hook + veld), beide pagina's gebruiken het.
2. `PhotoField` in `fields.jsx`: fit-keuze alleen tonen als `onFit` meekomt (logo altijd passend).
3. Nieuwe pagina's + canvassen: `Balsponsor`/`BallSponsorCanvas`, `Spotlight`/`SpotlightCanvas`, `Introduction`/`IntroductionCanvas`.
4. `pages.js` → `ready: true`, `App.jsx` → routes.

## Verificatie
`npm run build`; in browser elke generator vullen, story + post bekijken, export PNG.
