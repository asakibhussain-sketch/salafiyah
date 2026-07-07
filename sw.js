// ─── Version: bump this on EVERY deploy ───────────────────────────────────────
// This timestamp is replaced by the build process or bumped manually.
const CACHE_VERSION = 'salafiyah-v20260707_2';
const API_CACHE_NAME = 'salafiyah-api-v2';

// ─── App shell: cached on install (images & large assets use cache-first) ─────
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/settings-manager.js',
    '/prayer-engine.js',
    '/audio-engine.js',
    '/main.js',
    '/theme-system.js',
    '/manifest.json',
    '/icon.png',
];

// Large static assets that change rarely — cache-first
const STATIC_ASSETS = [
    '/hero_mosque_night_1777635162540.png',
    '/quote_lantern_soft_1777635193799.png',
    '/spiritual_night_bg_1777640765146.png',
    '/madani_blessings.json',
    '/sahih_muslim_books.json',
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
// Pre-cache shell; do NOT call skipWaiting() here — wait for user confirmation.
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_VERSION).then(cache =>
                cache.addAll([...SHELL_ASSETS, ...STATIC_ASSETS])
                    .catch(err => {
                        // Pre-caching partially failed — still proceed
                        console.warn('[SW] Some assets failed to pre-cache:', err);
                    })
            ),
        ])
        // NOTE: self.skipWaiting() is intentionally NOT called here.
        // The page will call SKIP_WAITING when the user confirms the update.
    );
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
// Delete ALL caches that are not the current version, then claim all clients.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_VERSION && k !== API_CACHE_NAME)
                    .map(k => {
                        console.log('[SW] Purging stale cache:', k);
                        return caches.delete(k);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ─── MESSAGE HANDLER ──────────────────────────────────────────────────────────
// Main page sends { type: 'SKIP_WAITING' } when the user clicks "Update".
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    // Respond to version check requests
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and non-http requests
    if (request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // ── 1. Our own backend API routes: always network, never cache ────────────
    if (url.pathname.startsWith('/api/') ||
        url.hostname.includes('ngrok') ||
        url.hostname.includes('loca.lt') ||
        url.hostname.includes('trycloudflare.com')) {
        // Pass through — let browser handle with no SW interception
        return;
    }

    // ── 2. Quran / CDN APIs: Cache-First (large, immutable payloads) ──────────
    if (url.hostname.includes('api.alquran.cloud') ||
        url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('quran.com') ||
        url.hostname.includes('everyayah.com')) {
        event.respondWith(cacheFirst(request, API_CACHE_NAME));
        return;
    }

    // ── 3. Aladhan Prayer API: Network-First with cache fallback (24h TTL) ────
    if (url.hostname.includes('api.aladhan.com') || url.hostname.includes('aladhan.com')) {
        event.respondWith(networkFirstWithTTL(request, API_CACHE_NAME, 24 * 60 * 60 * 1000));
        return;
    }

    // ── 4. Other external APIs: Network-First with cache fallback ─────────────
    if (!url.hostname.includes(self.location.hostname) && !url.hostname.includes('localhost')) {
        event.respondWith(networkFirst(request, API_CACHE_NAME));
        return;
    }

    // ── 5. HTML navigation: Network-First (never serve stale index.html) ──────
    if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
        event.respondWith(networkFirstForNavigation(request));
        return;
    }

    // ── 6. JS / CSS: Stale-While-Revalidate (fast loads + background refresh) ─
    if (url.pathname.match(/\.(js|css)$/)) {
        event.respondWith(staleWhileRevalidate(request, CACHE_VERSION));
        return;
    }

    // ── 7. Images / Fonts: Cache-First (stable assets, rarely change) ─────────
    if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2|ttf|otf)$/)) {
        event.respondWith(cacheFirst(request, CACHE_VERSION));
        return;
    }

    // ── 8. JSON data files: Stale-While-Revalidate ────────────────────────────
    if (url.pathname.match(/\.json$/)) {
        event.respondWith(staleWhileRevalidate(request, CACHE_VERSION));
        return;
    }

    // ── 9. Everything else: Network-First with cache fallback ─────────────────
    event.respondWith(networkFirst(request, CACHE_VERSION));
});

// ─── STRATEGY: Cache-First ────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.status === 200) {
            cache.put(request, networkRes.clone());
        }
        return networkRes;
    } catch (e) {
        return new Response('Offline', { status: 503 });
    }
}

// ─── STRATEGY: Stale-While-Revalidate ────────────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Always revalidate in background
    const fetchPromise = fetch(request).then(networkRes => {
        if (networkRes && networkRes.status === 200 &&
            (networkRes.type === 'basic' || networkRes.type === 'cors')) {
            cache.put(request, networkRes.clone());
        }
        return networkRes;
    }).catch(() => null);

    return cached || fetchPromise;
}

// ─── STRATEGY: Network-First with cache fallback ──────────────────────────────
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.status === 200 &&
            (networkRes.type === 'basic' || networkRes.type === 'cors')) {
            cache.put(request, networkRes.clone());
        }
        return networkRes;
    } catch (e) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'Offline', code: 503 }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ─── STRATEGY: Network-First for HTML navigation (no stale HTML) ──────────────
// Ensures users always get fresh HTML when online. Falls back to cached version
// only when completely offline. This prevents stale index.html issues.
async function networkFirstForNavigation(request) {
    const cache = await caches.open(CACHE_VERSION);
    try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.status === 200) {
            // Refresh cache with newest HTML
            cache.put(request, networkRes.clone());
        }
        return networkRes;
    } catch (e) {
        // Offline: serve cached index.html for all navigation requests
        const cached = await cache.match(request, { ignoreSearch: true }) ||
                       await cache.match('/index.html', { ignoreSearch: true });
        if (cached) return cached;
        return new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// ─── STRATEGY: Network-First with 24-hour TTL (Aladhan, etc.) ────────────────
async function networkFirstWithTTL(request, cacheName, ttlMs) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Check if cached version is still fresh
    if (cached) {
        const cachedAt = cached.headers.get('sw-cached-at');
        if (cachedAt && (Date.now() - parseInt(cachedAt, 10)) < ttlMs) {
            // Serve from cache; revalidate in background
            fetch(request).then(res => {
                if (res && res.status === 200) {
                    storageWithTimestamp(cache, request, res);
                }
            }).catch(() => {});
            return cached;
        }
    }

    // Cache is stale or missing — fetch from network
    try {
        const networkRes = await fetch(request);
        if (networkRes && networkRes.status === 200) {
            await storageWithTimestamp(cache, request, networkRes.clone());
        }
        return networkRes;
    } catch (e) {
        // Offline: serve stale data rather than nothing
        if (cached) return cached;
        return new Response(JSON.stringify({ code: 503, error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper: store a response with a timestamp header
async function storageWithTimestamp(cache, request, response) {
    const body = await response.clone().arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('sw-cached-at', Date.now().toString());
    const toStore = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
    return cache.put(request, toStore);
}
