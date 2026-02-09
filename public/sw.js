const CACHE_NAME = 'agri-trace-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
  // Vite bundles will be hashed, so precise caching requires a more complex build step (workbox)
  // For this basic requirement, we rely on runtime caching or network-first.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache dynamic assets for offline support of visited pages
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
