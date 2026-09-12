# Plan — posten automatiseren

Doel: wekelijks programma en uitslagen automatisch op Instagram en Facebook krijgen, zonder dat iemand handmatig de app opent, exporteert en upload.

Status: **plan, nog niets gebouwd.** Openstaande beslissingen staan onderaan.

## Wat er nu is

De app is volledig client-side (Vite + React, statische hosting). Renderen gebeurt in de browser-DOM, `html-to-image` maakt er een PNG van en `navigator.share` / een download-link brengt het bestand naar de telefoon. Volgorde en verborgen wedstrijden staan in `localStorage`.

Drie dingen die dat blokkeren voor automatisering:

1. Er is geen server die op een tijdstip iets kan doen.
2. De PNG bestaat alleen in de browser; Meta's API wil een **publiek bereikbare HTTPS-URL** of een geüploade binary, geen blob uit een tab.
3. Volgorde/verbergen zit in `localStorage` van één apparaat — een automatische run weet daar niets van.

## Wat posten via API technisch vraagt

Alles loopt via de Meta Graph API. Voorwaarden:

- Instagram-account moet **Business of Creator** zijn en gekoppeld aan een Facebook-pagina.
- Een Meta-app (developers.facebook.com) met de producten Instagram Graph API en Facebook Login.
- Permissies: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_manage_posts`, `business_management`.
- Een token dat niet elke twee maanden omvalt: **System User token** via Meta Business Manager (verloopt niet) is beter dan een long-lived page token (60 dagen, moet ververst worden).

De vier publicatieroutes:

| Kanaal | Endpoint | Formaat |
|---|---|---|
| Instagram feed | `POST /{ig-user-id}/media` (image_url, caption) → `POST /{ig-user-id}/media_publish` | post 4:5 (1080×1350) |
| Instagram story | zelfde, met `media_type=STORIES` | story 9:16 |
| Facebook pagina-post | `POST /{page-id}/photos` (url, message) | post 4:5 |
| Facebook pagina-story | `POST /{page-id}/photo_stories` (twee stappen: upload + publish) | story 9:16 |

Te verifiëren vóór we bouwen (niet blind aannemen):

- Of de app **App Review** nodig heeft. Voor publiceren naar assets waarvan de app-gebruiker zelf beheerder is, werkt standard access in development mode meestal; live gaan met `instagram_content_publish` kan review vragen. Dit eerst uitproberen met een testpost, want het bepaalt de doorlooptijd (review = dagen tot weken).
- IG-limiet: 50 gepubliceerde items per 24 uur — ruim voldoende, maar wel checken bij meerdere pagina's.
- Of carrousel nodig is: bij meerdere pagina's programma is één IG-carrouselpost (`children`) netter dan losse posts.

## Hoe de afbeelding server-side ontstaat

Voorkeur: **de bestaande React-render hergebruiken via headless Chromium (Playwright)**. Niet de layout nabouwen in een image-library — dan lopen preview en output uit elkaar.

Daarvoor is nodig:

1. Een render-route in de app, bijvoorbeeld `/render?tab=program&from=2026-09-12&to=2026-09-19&format=post&page=1`, die alleen het canvas rendert, zonder zijbalk en knoppen.
2. Alle state uit URL-parameters in plaats van `localStorage` (ook `hidden` en `order`, als we die in de automatische run willen meenemen — zie open beslissingen).
3. Een expliciet klaar-signaal, bijvoorbeeld `window.__renderReady = true` zodra fonts (`document.fonts.ready`), het logo en `bg-blur.jpg` geladen zijn én de paginering is uitgerekend. Playwright wacht daarop; anders schiet je willekeurig raak met timeouts.
4. Playwright zet viewport op 1080×`format.height`, `deviceScaleFactor: 1`, en maakt per pagina een `element.screenshot()`. Dat vervangt `html-to-image` in het automatische pad; de handmatige knop in de app blijft zoals hij is.

Bijvangst: de screenshot van echte Chromium is betrouwbaarder dan `html-to-image` (geen Safari-workarounds nodig).

## Waar de PNG's komen te staan

Meta haalt `image_url` zelf op, dus de bestanden moeten publiek staan gedurende de publicatie.

Keuze: **Cloudflare R2 met publieke bucket** (of S3). Simpel alternatief zonder extra account: de PNG's committen naar een publieke branch en `raw.githubusercontent.com` als URL gebruiken — werkt, maar vervuilt de repo-historie en is trager.

Na publicatie mogen ze weg (lifecycle rule op 7 dagen).

## Waar het draait

Twee opties:

**A. GitHub Actions cron (aanbevolen).** Geen server, geen kosten, Playwright draait er out of the box. Workflow: checkout → `npm ci` → `npm run build` → `vite preview` lokaal in de runner → Playwright screenshot → upload naar R2 → Graph API calls. Secrets in GitHub Secrets. Nadeel: cron in Actions kan tot ~10 minuten te laat vuren, en een handmatige herstart is een `workflow_dispatch`.

**B. Kleine service (Fly.io / VPS) met node-cron.** Meer controle, altijd bereikbaar (handig voor een goedkeur-knop), maar wel iets om te onderhouden en te betalen.

Advies: A, tenzij we de goedkeurstap als webapp willen (dan B).

## Mens ertussen of niet

De inhoud is nu niet volledig automatiseerbaar-veilig: wedstrijden verbergen en de volgorde aanpassen doe je met de hand, en de KNKV-data kan gaten hebben (afgelastingen, ontbrekende uitslagen).

Aanbevolen: **genereren automatisch, publiceren na één klik goedkeuring.**

Flow: vrijdagochtend genereert de job de vier afbeeldingen → stuurt ze als preview naar een Telegram-bot (of e-mail/WhatsApp) met knoppen "Plaatsen" / "Aanpassen in de app" → bij goedkeuring vuurt de publicatiestap. Bij "aanpassen" open je de bestaande app, doet je wijzigingen en drukt daar op publiceren.

Volledig zonder mens kan later, als het een paar weken goed is gegaan.

## Fasering

1. **Meta-setup uitzoeken** → verify: met een handmatige `curl` één testafbeelding naar de IG-story en de FB-pagina publiceren. Dit eerst, want hier zit de enige echte onzekerheid (review/permissies). Alles daarna is gewoon programmeren.
2. **Render-route + klaar-signaal in de app** → verify: `/render?...` levert in de browser exact hetzelfde beeld als de preview.
3. **Playwright-script** → verify: script schrijft `story-1.png` en `post-1.png` van 1080×1920 en 1080×1350, pixelvergelijk met de handmatige export.
4. **Upload naar R2 + publieke URL** → verify: URL in een incognitovenster opent de PNG.
5. **Publish-adapters (4 kanalen, idempotent)** → verify: testpost op een testpagina, en een tweede run met dezelfde week publiceert niets dubbels (state-bestand of R2-key met week-hash als sleutel).
6. **Captions** → template per soort: "Programma zaterdag 12 september" / "Uitslagen afgelopen weekend", plus vaste hashtags. Verify: caption verschijnt correct bij de testpost.
7. **Cron + goedkeurstap** → verify: één week lang meedraaien in dry-run (wel genereren en previewen, niet publiceren).
8. **Foutafhandeling en signalering** → mislukte run stuurt een bericht met de foutmelding; geen stille stiltes. Verify: forceer een 400 van de Graph API en controleer dat de melding binnenkomt.

## Open beslissingen

1. **Goedkeuring of volautomatisch?** (advies: goedkeuring via Telegram-bot)
2. **Welke kanalen echt?** Vier varianten (IG feed, IG story, FB post, FB story) of alleen stories?
3. **Volgorde/verbergen in de automatische run:** defaults gebruiken (alles zichtbaar, chronologisch), of moet de automaat de laatst opgeslagen instellingen kennen? Dat laatste betekent state naar een server tillen in plaats van `localStorage`.
4. **Meerdere pagina's:** losse posts of één carrousel op Instagram?
5. **Momenten:** programma vrijdag 18:00, uitslagen zondag 20:00? (nu nog een aanname)
6. **Hosting van de afbeeldingen:** R2/S3 of publieke GitHub-branch.

## Alternatief zonder Graph API

Een planningstool met API (Buffer, Metricool, Later) accepteert een upload en regelt het posten. Scheelt de hele Meta-app, tokens en review, kost een abonnement en je bent afhankelijk van hun limieten. Overwegen als stap 1 op App Review vastloopt.
