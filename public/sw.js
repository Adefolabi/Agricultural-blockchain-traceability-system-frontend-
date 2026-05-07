const CACHE_NAME = 'agri-trace-v4';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

function isApiRequest(url) {
  return new URL(url).pathname.startsWith('/api/');
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
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Only cache successful same-origin responses.
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
          return response;
        })
        .catch(() => networkError(503, 'Network request failed.'));
    })
  );
});
