# Plan: Google-login via eigen Vercel middleware + e-mail-allowlist

## Context
Static Vite + React SPA op Vercel Hobby, geen backend. Alleen personen die jij toestemming geeft mogen erin, inloggen via Google. Better Auth te zwaar voor handvol gebruikers. Daarom: één `middleware.js` doet de Google OAuth-flow zelf, zet gesigneerde sessiecookie, checkt allowlist bij elke request. Geen library, geen DB. Ook statische bestanden en `*.vercel.app` dicht.

## Aanpak
1. `npm i @vercel/functions` (voor `next()`) → verify: in `package.json`.
2. `middleware.js` in project-root (~80 regels), matcher `/:path*`:
   - **`/auth/login`**: random `state` genereren, in kortlevende httpOnly cookie zetten, redirect naar `https://accounts.google.com/o/oauth2/v2/auth` met `client_id`, `redirect_uri`, `response_type=code`, `scope=openid email`, `state`.
   - **`/auth/callback`**: `state` uit query vergelijken met cookie. `code` server-side wisselen bij `https://oauth2.googleapis.com/token` (met client secret). `id_token` payload decoderen (direct van Google over TLS, dus geen signature-check nodig). Eis `email_verified` en e-mail in `ALLOWED_EMAILS`, anders 403. Dan sessiecookie `session=<email>.<exp>.<HMAC-SHA256>` (Web Crypto, `SESSION_SECRET`), httpOnly, Secure, SameSite=Lax, 30 dagen. Redirect `/`.
   - **Overige paden**: cookie checken (HMAC geldig, niet verlopen, e-mail nog in allowlist), dan `next()`. Geen geldige cookie → redirect `/auth/login`. Geen aparte login-pagina nodig.
3. Google Cloud Console: OAuth client (Web), consent screen "External". Redirect URI `https://<domein>/auth/callback`.
4. Vercel env vars (Production): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` (`openssl rand -base64 32`), `ALLOWED_EMAILS` (komma-gescheiden), `AUTH_URL` (`https://<domein>`). Niets in `.env` committen.
5. Plan kopiëren naar `docs/plan-auth.md`.

## Beheer
Toegang geven/intrekken: e-mail in `ALLOWED_EMAILS` toevoegen/weghalen, redeploy. Intrekken werkt direct, ook bij bestaande cookie (allowlist wordt elke request gecheckt).

## Beperkingen
- Alleen productiedomein; preview-URL's matchen niet met Google redirect URI. Die krijgen redirect naar productielogin en blijven dus dicht.
- Lokaal `npm run dev` draait geen middleware, lokaal blijft open. Testen via `vercel dev` + extra redirect URI `http://localhost:3000/auth/callback`.
- Geen uitlogknop (niet gevraagd).

## Verificatie
- Incognito naar domein → Google-login.
- Allowlisted account → app laadt incl. assets/fonts.
- Ander Google-account → 403.
- `curl -I https://<domein>/` en `https://<project>.vercel.app/` → redirect naar `/auth/login`.
- Cookie handmatig aanpassen → weer redirect naar login.
- E-mail uit allowlist + redeploy → bestaande sessie geweigerd.
