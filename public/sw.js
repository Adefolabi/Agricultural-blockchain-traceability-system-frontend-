const CACHE_NAME = 'agri-trace-v7';

// Only precache stable assets that never change between deploys.
// '/' and '/index.html' are deliberately excluded — they reference
// content-hashed JS/CSS filenames that change with every build.
// Caching them with a cache-first strategy causes stale index.html to be
// served after a new deployment; when the browser then requests the old
// hashed bundle (which no longer exists), Vercel's SPA rewrite serves
// index.html with MIME type text/html — which the browser refuses to
// execute as a JavaScript module, producing a blank page.
const PRECACHE_URLS = [
  '/manifest.json',
  '/icon.svg',
];

// Only handle http/https — ignore chrome-extension://, data:, etc.
function isHttpRequest(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

// Same-origin /api/* requests when using a same-host proxy.
// Cross-origin requests (e.g. DigitalOcean backend) are NOT intercepted.
function isApiRequest(url) {
  const parsed = new URL(url);
  return parsed.origin === self.location.origin && parsed.pathname.startsWith('/api/');
}

// Navigation requests are full-page HTML loads.
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Vite writes content-hashed filenames like /assets/index-abc123.js —
// these are immutable and safe to serve from cache indefinitely.
function isHashedAsset(url) {
  return new URL(url).pathname.startsWith('/assets/');
}

function networkError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  eve