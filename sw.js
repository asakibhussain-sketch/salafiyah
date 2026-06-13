const CACHE_NAME = 'salafiyah-v54';
const ASSETS = [
    '/',
    '/index.html',
    '/main.js',
    '/style.css',
    '/manifest.json',
    '/icon.png',
    '/hero_mosque_night_1777635162540.png',
    '/quote_lantern_soft_1777635193799.png',
    '/spiritual_night_bg_1777640765146.png'
];

const API_CACHE_NAME = 'salafiyah-api-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== API_CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const url = event.request.url;

    // 1. Quran API Caching - Cache First Strategy
    if (url.includes('api.alquran.cloud')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // 2. Skip other external APIs to ensure fresh data (Prayer times, AI)
    if (url.includes('api.aladhan.com') || url.includes('/api/')) {
        return;
    }

    // 3. Default App Assets
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
