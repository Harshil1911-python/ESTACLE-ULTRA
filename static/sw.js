/* Estacle PWA service worker */
const CACHE = 'estacle-v1';
const PRECACHE = [
  '/',
  '/login',
  '/static/css/admin.css',
  '/static/css/login.css',
  '/static/js/app-nav.js',
  '/static/js/pwa.js',
  '/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only same-origin
  if (url.origin !== self.location.origin) return;

  // Static assets: cache-first
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req).then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // HTML/pages: network-first, fall back to cache
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }).catch(() => caches.match(req).then((c) => c || caches.match('/login')))
  );
});
