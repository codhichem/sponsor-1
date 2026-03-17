const CACHE_NAME = 'sponsor-crm-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/auth.js',
  './assets/js/data-service.js',
  './assets/js/ui-handlers.js',
  './assets/js/ui-render.js'
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
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
