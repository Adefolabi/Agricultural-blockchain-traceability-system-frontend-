const CACHE_NAME = 'agri-trace-v6';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

function isApiRequest(url) {
  const parsed = new URL(url);
  // Only intercept same-origin /api/* requests (the pattern used when the
  // backend is proxied through the same host, e.g. via a Vite dev proxy or a
  // reverse-proxy in production).  Cross-origin requests — e.g. when
  // VITE_API_BASE_URL points to a separate backend domain like DigitalOcean —
  // must NOT be intercepted here: the SW's re-fetch runs in a different CORS
  // context and will fail, producing the misleading "Backend unreachable" error
  // even when the backend is perfectly healthy.
  return parsed.origin === self.location.origin && parsed.pathname.startsWith('/api/');
}

// Return a JSON error response so event.respondWith never receives a rejection.
function networkError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // API requests — always network, never cache.
  // Catch network failures so event.respondWith never receives a rejected promise.
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request).catch(() =>
        networkError(503, 'Backend unreachable. Please check the server is running.')
      )
    );
    return;
  }

  // All other requests — cache-first, network fallback.
  // IMPORTANT: d