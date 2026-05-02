const CACHE_NAME = 'agri-trace-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Never cache API calls — always go to the network for fresh blockchain data.
function isApiRequest(url) {
  return new URL(url).pathname.startsWith('/api/');
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately without waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Remove caches from previous versions.
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Let API requests bypass the cache entirely — always network.
  if (isApiRequest(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For everything else: cache-first with network fallback + runtime population.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache successful same-origin responses (not opaque cross-origin).
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      });
    })
  );
});
