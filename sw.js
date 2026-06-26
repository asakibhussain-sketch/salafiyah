// ─── Cache version: bump this string on EVERY deploy ─────────────────────────
// Using a timestamp so it's always unique on save.
const CACHE_VERSION = 'salafiyah-v' + '20260627_1';
const API_CACHE_NAME = 'salafiyah-api-v2';

// Core app shell — these are fetched & cached on install
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/main.js',
    '/style.css',
    '/theme-system.js',
    '/manifest.json',
    '/icon.png',
    '/sahih_muslim_books.json',
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
// Pre-cache the app shell, then immediately activate (no waiting for old tabs)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())   // don't wait — activate now
            .catch(err => {
                // Even if pre-caching fails, still activate so the app can load
                console.warn('[SW] Pre-cache failed:', err);
                return self.skipWaiting();
            })
    );
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
// Delete ALL old caches, then claim all open clients immediately.
// This ensures every open tab gets the new SW without needing a second refresh.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_VERSION && k !== API_CACHE_NAME)
                    .map(k => {
                        console.log('[SW] Deleting old cache:', k);
                        return caches.delete(k);
                    })
            ))
            .then(() => self.clients.claim())   // take control of ALL open tabs NOW
    );
});

// ─── MESSAGE HANDLER ─────────────────────────────────────────────────────────
// The app page can post { type: 'SKIP_WAITING' } to force the waiting SW active.
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // --- Skip non-GET and browser-extension requests ---
    if (request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // --- 1. Quran API: Cache-First (large payloads, rarely changes) ---
    if (url.hostname.includes('api.alquran.cloud') ||
        url.hostname.includes('cdn.jsdelivr.net')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(res => {
                        if (res && res.status === 200) {
                            cache.put(request, res.clone());
                        }
                        return res;
                    });
                })
            )
        );
        return;
    }

    // --- 2. Our own API routes: always go to network (never cache) ---
    if (url.pathname.startsWith('/api/') ||
        url.hostname.includes('api.aladhan.com') ||
        url.hostname.includes('ngrok') ||
        url.hostname.includes('aladhan')) {
        return; // let browser handle normally (no SW interception)
    }

    // --- 3. App shell: Network-First with cache fallback ---
    // Tries the network first; if offline falls back to the cached version.
    // On success, refreshes the cache entry so next visit gets the fresh file.
    event.respondWith(
        fetch(request)
            .then(networkRes => {
                // Only cache valid same-origin responses
                if (networkRes && networkRes.status === 200 &&
                    (networkRes.type === 'basic' || networkRes.type === 'cors')) {
                    const toCache = networkRes.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(request, toCache));
                }
                return networkRes;
            })
            .catch(() => {
                // Offline fallback: serve from cache, ignoring query params like ?t=...
                return caches.match(request, { ignoreSearch: true }).then(cached => {
                    if (cached) return cached;
                    // Last resort: return the cached index.html for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html', { ignoreSearch: true });
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
