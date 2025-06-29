// public/sw.js
const CACHE_NAME = 'budget-tracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg', // If you have this
  '/src/main.tsx', // Main entry point
  '/src/App.tsx',
  '/src/index.css',
  // Add other critical files your app uses
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Clone the response for caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            
            return response;
          })
          .catch(() => {
            // Fallback for failed requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('Offline content not available', { 
              status: 503, 
              statusText: 'Offline' 
            });
          });
      })
  );
});