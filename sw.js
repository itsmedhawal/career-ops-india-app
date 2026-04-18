/**
 * Career-Ops-India App — Service Worker
 * Enables offline-first PWA: caches the shell (HTML, fonts, manifest)
 * so Tracker, Analytics, and Profile work without connectivity.
 */

const CACHE_NAME = 'coi-v7.7';

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './worker.js',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install — pre-cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first for API calls, cache-first for shell assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache API calls — let them pass through
  if (url.hostname === 'api.anthropic.com' ||
      url.hostname === 'generativelanguage.googleapis.com' ||
      url.hostname === 'raw.githubusercontent.com' ||
      url.hostname === 'huggingface.co') {
    return;
  }

  // For navigation and shell assets: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        // Cache successful GET responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached); // If network fails, fall back to cache

      return cached || networkFetch;
    })
  );
});
