// ─── Cache version: bump this string on EVERY deploy ─────────────────────────
// Using a timestamp so it's always unique on save.
const CACHE_VERSION = 'salafiyah-v20260628_9';
const API_CACHE_NAME = 'salafiyah-api-v2';

// Core app shell — these are fetched & cached on install
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/main.js',
    '/prayer-engine.js',
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

    // --- 2. Aladhan Prayer API: Stale-While-Revalidate (24h TTL, offline fallback) ---
    if (url.hostname.includes('api.aladhan.com') || url.hostname.includes('aladhan.com')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(async cache => {
                const cached = await cache.match(request);

                // Check if cache is fresh (< 24 hours)
                let isFresh = false;
                if (cached) {
                    const cachedDate = cached.headers.get('sw-cached-at');
                    if (cachedDate) {
                        const age = Date.now() - parseInt(cachedDate, 10);
                        isFresh = age < 24 * 60 * 60 * 1000; // 24 hours
                    }
                }

                if (isFresh) {
                    // Serve from cache, revalidate in background
                    fetch(request).then(res => {
                        if (res && res.status === 200) {
                            const cloned = res.clone();
                            // Add timestamp header via new Response
                            cloned.headers && cloned.headers.append && cloned.headers.append('sw-cached-at', Date.now());
                            cache.put(request, res.clone());
                        }
                    }).catch(() => {});
                    return cached;
                }

                // Not fresh or no cache — try network
                try {
                    const networkRes = await fetch(request);
                    if (networkRes && networkRes.status === 200) {
                        // Store with custom header via Response wrapper
                        const body = await networkRes.clone().arrayBuffer();
                        const headers = new Headers(networkRes.headers);
                        headers.set('sw-cached-at', Date.now().toString());
                        const toStore = new Response(body, {
                            status: networkRes.status,
                            statusText: networkRes.statusText,
                            headers
                        });
                        cache.put(request, toStore);
                    }
                    return networkRes;
                } catch (e) {
                    // Offline: return stale cache if available
                    if (cached) return cached;
                    return new Response(JSON.stringify({ code: 503, error: 'Offline' }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })
        );
        return;
    }

    // --- 3. Our own API routes: always go to network (never cache) ---
    if (url.pathname.startsWith('/api/') ||
        url.hostname.includes('ngrok')) {
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
