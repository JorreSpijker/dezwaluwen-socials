import { next } from '@vercel/functions'

export const config = { matcher: '/:path*' }

const { AUTH_ENABLED, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, ALLOWED_EMAILS = '', AUTH_URL } =
  process.env

const REDIRECT_URI = `${AUTH_URL}/auth/callback`
const SESSION_SECONDS = 30 * 24 * 60 * 60
const encoder = new TextEncoder()

function isAllowed(email) {
  const allowed = ALLOWED_EMAILS.toLowerCase().split(',').map((e) => e.trim())
  return allowed.includes(email.toLowerCase())
}

function getCookie(request, name) {
  const match = request.headers.get('cookie')?.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1]
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

function redirect(location, ...setCookies) {
  const headers = new Headers({ Location: location })
  setCookies.forEach((c) => headers.append('Set-Cookie', c))
  return new Response(null, { status: 302, headers })
}

function hmacKey() {
  return crypto.subtle.importKey('raw', encoder.encode(SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

async function sign(data) {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), encoder.encode(data))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verify(data, hex) {
  const bytes = new Uint8Array(hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? [])
  return crypto.subtle.verify('HMAC', await hmacKey(), bytes, encoder.encode(data))
}

// Cookie-formaat: <exp>.<hmac>.<email>. Allowlist wordt elke request opnieuw
// gecheckt, zodat intrekken ook bestaande sessies raakt.
async function sessionEmail(request) {
  const value = getCookie(request, 'session')
  if (!value) return null
  const [exp, sig, ...rest] = value.split('.')
  const email = rest.join('.')
  if (!sig || Number(exp) < Date.now()) return null
  return (await verify(`${exp}.${email}`, sig)) && isAllowed(email) ? email : null
}

// Na uitloggen niet direct terug naar Google, anders logt die je stil weer in.
function logout() {
  const html = '<!doctype html><meta charset="utf-8"><title>Uitgelogd</title><p style="font-family:sans-serif">Je bent uitgelogd. <a href="/auth/login">Opnieuw inloggen</a></p>'
  const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
  headers.append('Set-Cookie', cookie('session', '', 0))
  headers.append('Set-Cookie', cookie('picture', '', 0))
  return new Response(html, { headers })
}

function login() {
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  })
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, cookie('oauth_state', state, 600))
}

async function callback(request, url) {
  const state = getCookie(request, 'oauth_state')
  const code = url.searchParams.get('code')
  if (!state || state !== url.searchParams.get('state') || !code) {
    return new Response('Inloggen mislukt', { status: 400 })
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  const { id_token } = await res.json()
  if (!id_token) return new Response('Inloggen mislukt', { status: 400 })

  // id_token komt rechtstreeks van Google over TLS, dus geen signature-check nodig.
  const payload = JSON.parse(atob(id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  if (!payload.email_verified || !isAllowed(payload.email)) {
    return new Response('Geen toegang', { status: 403 })
  }

  const email = payload.email.toLowerCase()
  const exp = Date.now() + SESSION_SECONDS * 1000
  const sig = await sign(`${exp}.${email}`)
  // De foto is alleen weergave, dus niet in de gesigneerde sessie.
  return redirect(
    '/',
    cookie('session', `${exp}.${sig}.${email}`, SESSION_SECONDS),
    cookie('picture', encodeURIComponent(payload.picture ?? ''), SESSION_SECONDS),
  )
}

export default async function middleware(request) {
  // Alleen met AUTH_ENABLED=true is de app afgeschermd; anders open, zonder login.
  if (AUTH_ENABLED !== 'true') return next()
  const url = new URL(request.url)
  if (url.pathname === '/auth/login') return login()
  if (url.pathname === '/auth/callback') return callback(request, url)
  if (url.pathname === '/auth/logout') return logout()
  const email = await sessionEmail(request)
  if (!email) return redirect('/auth/login')
  if (url.pathname === '/auth/me') {
    const picture = decodeURIComponent(getCookie(request, 'picture') ?? '')
    return Response.json({ email, picture })
  }
  return next()
}
