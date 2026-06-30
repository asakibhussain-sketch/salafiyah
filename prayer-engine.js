/**
 * Salafiyah Prayer Engine v2.0
 * Automatic, real-time prayer time system
 * - Coordinate-based GPS detection
 * - Live countdown (1-second local timer, zero API calls per second)
 * - Daily auto-sync & midnight refresh
 * - Travel detection (>20km triggers refetch)
 * - Ramadan auto-detection
 * - Smart notifications (15 min before + at prayer time)
 * - Offline cache (today + tomorrow)
 * - 7 calculation methods
 */

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────────────────────────
    const CACHE_PREFIX = 'pe_timings_';
    const COORD_KEY = 'pe_coords';
    const LAST_FETCH_KEY = 'pe_last_fetch';
    const TRAVEL_THRESHOLD_KM = 20;
    const ALADHAN_BASE = 'https://api.aladhan.com/v1';
    const REVERSE_GEO = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

    const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const MAIN_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    const CALC_METHODS = {
        1: { id: 1, name: 'Karachi — Univ. of Islamic Sciences' },
        2: { id: 2, name: 'ISNA — Islamic Society of North America' },
        3: { id: 3, name: 'Muslim World League' },
        4: { id: 4, name: "Umm Al-Qura University, Makkah" },
        5: { id: 5, name: 'Egyptian General Authority of Survey' },
        8: { id: 8, name: 'Dubai — Gulf Region' },
        13: { id: 13, name: 'Diyanet İşleri Başkanlığı — Turkey' }
    };

    // ─── Utility ─────────────────────────────────────────────────────────────────

    function toMinutes(timeStr) {
        if (!timeStr) return -1;
        const clean = timeStr.split(' ')[0]; // strip timezone suffix
        const [h, m] = clean.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return -1;
        return h * 60 + m;
    }

    function haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function todayKey() {
        return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

    function tomorrowKey() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString('en-CA');
    }

    function formatHMS(totalSeconds) {
        if (totalSeconds < 0) return '00:00:00';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    }

    function formatHMShort(totalSeconds) {
        if (totalSeconds < 0) return '--';
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
        if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
        return `${s}s`;
    }

    function nowSeconds() {
        const n = new Date();
        return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
    }

    // ─── Engine Object ────────────────────────────────────────────────────────────

    const PrayerEngine = {
        _countdownTimer: null,
        _dailySyncTimer: null,
        _midnightTimer: null,
        _geoWatchId: null,
        _lastCoords: null,
        _notifiedPrayers: {},  // {prayerName_date: true}
        _notificationTimers: [],

        todayKey: todayKey,

        // ── Init ────────────────────────────────────────────────────────────────

        async init() {
            console.log('[PrayerEngine] Initializing v2.0...');
            this._restoreCoords();
            await this._syncTimings();
            this._startCountdownLoop();
            this._startDailySyncLoop();
            this._scheduleMidnightRefresh();
            this._startGeoWatch();
            await this._prefetchTomorrow();
            console.log('[PrayerEngine] Ready.');
        },

        // ── Coordinate Helpers ──────────────────────────────────────────────────

        _restoreCoords() {
            try {
                const saved = localStorage.getItem(COORD_KEY);
                if (saved) this._lastCoords = JSON.parse(saved);
            } catch (_) { }
        },

        _saveCoords(lat, lon) {
            this._lastCoords = { lat, lon };
            localStorage.setItem(COORD_KEY, JSON.stringify({ lat, lon }));
        },

        // ── Location Detection ──────────────────────────────────────────────────

        async detectAndFetch(silent = false) {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    if (!silent) this._fallbackToCity();
                    resolve(false);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const { latitude, longitude } = pos.coords;

                        // Travel detection
                        if (this._lastCoords) {
                            const km = haversineKm(
                                this._lastCoords.lat, this._lastCoords.lon,
                                latitude, longitude
                            );
                            if (km > TRAVEL_THRESHOLD_KM) {
                                console.log(`[PrayerEngine] Travel detected: ${km.toFixed(1)} km — refetching`);
                                // Clear cached timings so fresh fetch is forced
                                localStorage.removeItem(CACHE_PREFIX + todayKey());
                            }
                        }

                        this._saveCoords(latitude, longitude);

                        // Update state.coordinates for Qibla and other features
                        if (window.state) {
                            window.state.coordinates = { latitude, longitude };
                        }

                        // Reverse geocode to get city/country
                        try {
                            const geoRes = await fetch(
                                `${REVERSE_GEO}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                                { signal: AbortSignal.timeout(5000) }
                            );
                            const geoData = await geoRes.json();
                            const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Unknown';
                            const country = geoData.countryCode || 'SA';

                            if (window.state) {
                                window.state.location = { city, country };
                                localStorage.setItem('location', JSON.stringify({ city, country }));
                            }
                        } catch (_) {
                            // Reverse geocode failed — we still have coords for prayer fetch
                        }

                        const ok = await this._fetchByCoords(latitude, longitude);
                        resolve(ok);
                    },
                    () => {
                        // Permission denied — fall back to city/country
                        this._fallbackToCity();
                        resolve(false);
                    },
                    { timeout: 10000, maximumAge: 300000 }
                );
            });
        },

        async _fallbackToCity() {
            const { city, country } = (window.state && window.state.location) || { city: 'Mecca', country: 'SA' };
            return this._fetchByCity(city, country);
        },

        // ── Background GPS Watch (travel detection) ─────────────────────────────

        _startGeoWatch() {
            if (!navigator.geolocation || this._geoWatchId !== null) return;
            this._geoWatchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    if (!this._lastCoords) {
                        this._saveCoords(latitude, longitude);
                        return;
                    }
                    const km = haversineKm(
                        this._lastCoords.lat, this._lastCoords.lon,
                        latitude, longitude
                    );
                    if (km > TRAVEL_THRESHOLD_KM) {
                        console.log(`[PrayerEngine] Travel watch: ${km.toFixed(1)} km moved — auto refetch`);
                        this._saveCoords(latitude, longitude);
                        localStorage.removeItem(CACHE_PREFIX + todayKey());
                        this._fetchByCoords(latitude, longitude).then(() => {
                            this._refreshUI();
                        });
                    }
                },
                () => { },
                { enableHighAccuracy: false, timeout: 30000, maximumAge: 600000 }
            );
        },

        stopGeoWatch() {
            if (this._geoWatchId !== null) {
                navigator.geolocation.clearWatch(this._geoWatchId);
                this._geoWatchId = null;
            }
        },

        // ── API Fetching ─────────────────────────────────────────────────────────

        async _fetchByCoords(lat, lon, dateKey = null) {
            const dk = dateKey || todayKey();
            const method = (window.state && window.state.settings && window.state.settings.method) || 3;
            const school = (window.state && window.state.settings && window.state.settings.school) || 0;
            const adj = (window.state && window.state.settings && window.state.settings.hijriOffset) || 0;

            const timestamp = Math.floor(new Date(dk + 'T12:00:00').getTime() / 1000);
            const url = `${ALADHAN_BASE}/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}&adj=${adj}`;

            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                if (json.code === 200 && json.data) {
                    this._processTimings(json.data, dk);
                    localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
                    return true;
                }
            } catch (e) {
                console.warn('[PrayerEngine] Coord fetch failed:', e.message);
            }
            return false;
        },

        async _fetchByCity(city, country, dateKey = null) {
            const dk = dateKey || todayKey();
            const method = (window.state && window.state.settings && window.state.settings.method) || 3;
            const school = (window.state && window.state.settings && window.state.settings.school) || 0;
            const adj = (window.state && window.state.settings && window.state.settings.hijriOffset) || 0;

            const url = `${ALADHAN_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}&adj=${adj}`;

            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                if (json.code === 200 && json.data) {
                    this._processTimings(json.data, dk);

                    // Extract coordinates from meta
                    if (json.data.meta && json.data.meta.latitude) {
                        this._saveCoords(json.data.meta.latitude, json.data.meta.longitude);
                        if (window.state) {
                            window.state.coordinates = {
                                latitude: json.data.meta.latitude,
                                longitude: json.data.meta.longitude
                            };
                        }
                    }
                    localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
                    return true;
                }
            } catch (e) {
                console.warn('[PrayerEngine] City fetch failed:', e.message);
            }
            return false;
        },

        async _processTimings(data, dateKey) {
            const timings = {};
            // Strip timezone suffixes from all timing values
            for (const [k, v] of Object.entries(data.timings || {})) {
                timings[k] = v.split(' ')[0];
            }

            // Cache with date key
            localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(timings));
            if (data.date && data.date.hijri) {
                localStorage.setItem('hijri_data_' + dateKey, JSON.stringify(data.date.hijri));
            }

            // Also store Hijri and meta in state
            if (window.state) {
                if (dateKey === todayKey()) {
                    window.state.prayerTimes = timings;
                    if (data.date && data.date.hijri) {
                        window.state.hijri = data.date.hijri;
                        localStorage.setItem('hijri_data', JSON.stringify(data.date.hijri));

                        // Handle manual Hijri offset robustly using gToH
                        const adj = (window.state && window.state.settings && window.state.settings.hijriOffset) || 0;
                        if (adj !== 0) {
                            const targetDate = new Date(dateKey + 'T12:00:00');
                            targetDate.setDate(targetDate.getDate() + adj);
                            const gDate = `${targetDate.getDate().toString().padStart(2, '0')}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getFullYear()}`;

                            try {
                                const r = await fetch(`${ALADHAN_BASE}/gToH/${gDate}`);
                                const adjData = await r.json();
                                if (adjData.code === 200 && adjData.data && adjData.data.hijri) {
                                    window.state.hijri = adjData.data.hijri;
                                    localStorage.setItem('hijri_data_' + dateKey, JSON.stringify(adjData.data.hijri));
                                    localStorage.setItem('hijri_data', JSON.stringify(adjData.data.hijri));
                                }
                            } catch (e) {
                                console.warn('[PrayerEngine] Hijri adjustment fetch failed', e);
                            }
                        }
                    }
                    if (data.meta) {
                        window.state.coordinates = window.state.coordinates || {};
                        window.state.coordinates.latitude = data.meta.latitude;
                        window.state.coordinates.longitude = data.meta.longitude;
                        window.state.coordinates.timezone = data.meta.timezone;
                    }
                    localStorage.setItem('prayer_times', JSON.stringify(timings));
                }
            }

            console.log('[PrayerEngine] Timings cached for', dateKey);
        },

        // ── Cache ────────────────────────────────────────────────────────────────

        getCachedTimings(dateKey) {
            try {
                const raw = localStorage.getItem(CACHE_PREFIX + dateKey);
                if (raw) return JSON.parse(raw);
            } catch (_) { }
            return null;
        },

        getCachedHijri(dateKey) {
            try {
                const raw = localStorage.getItem('hijri_data_' + dateKey);
                if (raw) return JSON.parse(raw);
            } catch (_) { }
            return null;
        },

        hasTodayCache() {
            return !!this.getCachedTimings(todayKey());
        },

        // ── Smart Sync ───────────────────────────────────────────────────────────

        async _syncTimings() {
            const today = todayKey();
            const lastFetchStr = localStorage.getItem(LAST_FETCH_KEY);
            const lastFetchDate = lastFetchStr ? new Date(lastFetchStr).toLocaleDateString('en-CA') : null;

            // Use cache if same day and already fetched
            if (lastFetchDate === today && this.hasTodayCache()) {
                const cached = this.getCachedTimings(today);
                if (window.state) window.state.prayerTimes = cached;
                console.log('[PrayerEngine] Using same-day cache');
                this._scheduleSmartNotifications();
                return;
            }

            // New day or no cache → fetch fresh
            let ok = false;
            if (this._lastCoords) {
                ok = await this._fetchByCoords(this._lastCoords.lat, this._lastCoords.lon);
            }
            if (!ok) {
                ok = await this._fallbackToCity();
            }

            if (!ok) {
                // Load from cache as fallback
                const cached = this.getCachedTimings(today);
                if (cached && window.state) {
                    window.state.prayerTimes = cached;
                    console.warn('[PrayerEngine] Offline — using cached timings');
                } else {
                    console.warn('[PrayerEngine] No cache and no network — prayer times unavailable');
                }
            }

            this._scheduleSmartNotifications();
            this._refreshUI();
        },

        async _prefetchTomorrow() {
            const dk = tomorrowKey();
            if (this.getCachedTimings(dk)) return; // already cached

            try {
                if (this._lastCoords) {
                    await this._fetchByCoords(this._lastCoords.lat, this._lastCoords.lon, dk);
                } else {
                    const { city, country } = (window.state && window.state.location) || { city: 'Mecca', country: 'SA' };
                    await this._fetchByCity(city, country, dk);
                }
                console.log('[PrayerEngine] Tomorrow prefetched:', dk);
            } catch (_) { }
        },

        // ── Daily Sync Loop ──────────────────────────────────────────────────────

        _startDailySyncLoop() {
            if (this._dailySyncTimer) clearInterval(this._dailySyncTimer);
            let _lastDate = todayKey();

            this._dailySyncTimer = setInterval(async () => {
                const current = todayKey();
                if (current !== _lastDate) {
                    console.log('[PrayerEngine] Day changed — syncing timings...');
                    _lastDate = current;
                    this._notifiedPrayers = {};  // reset daily notification tracker

                    // Promote tomorrow's cache to today
                    const tomorrowCache = this.getCachedTimings(tomorrowKey()) ||
                        this.getCachedTimings(current);

                    if (tomorrowCache && window.state) {
                        window.state.prayerTimes = tomorrowCache;
                        localStorage.setItem('prayer_times', JSON.stringify(tomorrowCache));
                        localStorage.setItem(CACHE_PREFIX + current, JSON.stringify(tomorrowCache));
                    }

                    await this._syncTimings();
                    await this._prefetchTomorrow();
                    this._refreshUI();
                    this._scheduleMidnightRefresh();
                }
            }, 30000); // check every 30s
        },

        // ── Midnight Refresh ─────────────────────────────────────────────────────

        _scheduleMidnightRefresh() {
            if (this._midnightTimer) clearTimeout(this._midnightTimer);
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 30, 0); // 30s after midnight
            const msUntilMidnight = midnight.getTime() - now.getTime();

            this._midnightTimer = setTimeout(async () => {
                console.log('[PrayerEngine] Midnight refresh triggered');
                await this._syncTimings();
                await this._prefetchTomorrow();
                this._notifiedPrayers = {};
                this._scheduleSmartNotifications();
                this._refreshUI();
            }, msUntilMidnight);

            console.log(`[PrayerEngine] Midnight refresh in ${Math.round(msUntilMidnight / 60000)} min`);
        },

        // ── Live Countdown Loop ──────────────────────────────────────────────────

        _startCountdownLoop() {
            if (this._countdownTimer) clearInterval(this._countdownTimer);
            this._countdownTimer = setInterval(() => {
                this._tick();
            }, 1000);
            this._tick(); // immediate first tick
        },

        _tick() {
            if (!window.state || !window.state.prayerTimes) return;
            const next = this.getNextPrayer();
            if (!next) return;

            // Update countdown display elements
            const cdEl = document.getElementById('pe-countdown');
            const nextNameEl = document.getElementById('pe-next-name');
            const nextTimeEl = document.getElementById('pe-next-time');
            const progressEl = document.getElementById('pe-progress-bar');

            if (cdEl) cdEl.textContent = formatHMShort(next.remainingSeconds);
            if (nextNameEl) nextNameEl.textContent = next.name;
            if (nextTimeEl) nextTimeEl.textContent = window.formatPrayerTime
                ? window.formatPrayerTime(next.time)
                : next.time;

            // Progress bar: fraction through the inter-prayer interval
            if (progressEl) {
                const pct = this._getPrayerProgress(next);
                progressEl.style.width = pct + '%';
            }

            // Ramadan countdowns
            if (this.isRamadan()) {
                this._updateRamadanCountdowns();
            }

            // Auto-switch prayer highlight at prayer time (within 60s window)
            // Handled by smart notifications
        },

        _getPrayerProgress(nextPrayer) {
            // Returns 0–100% progress from previous prayer to next
            const nowSec = nowSeconds();
            const nextSec = nowSec + nextPrayer.remainingSeconds;
            const prayerOrder = MAIN_PRAYERS;
            const prayerTimes = window.state.prayerTimes;

            const pIdx = prayerOrder.indexOf(nextPrayer.name);
            const prevName = pIdx > 0 ? prayerOrder[pIdx - 1] : prayerOrder[prayerOrder.length - 1];
            const prevTime = prayerTimes[prevName];
            if (!prevTime) return 0;

            const [ph, pm] = prevTime.split(':').map(Number);
            const prevSec = ph * 3600 + pm * 60;

            let interval;
            if (prevSec < nextSec - nextPrayer.remainingSeconds + nowSec) {
                interval = (nextSec - nowSec) + (nowSec - prevSec);
            } else {
                // Wrap around midnight
                interval = (86400 - prevSec) + nextSec - nowSec + nowSec;
            }

            const elapsed = nowSec - prevSec;
            if (interval <= 0) return 0;
            return Math.max(0, Math.min(100, (elapsed / interval) * 100));
        },

        // ── Next Prayer Logic ─────────────────────────────────────────────────────

        getNextPrayer() {
            if (!window.state || !window.state.prayerTimes) return null;
            const prayerTimes = window.state.prayerTimes;
            const nowSec = nowSeconds();

            for (const name of MAIN_PRAYERS) {
                const rawTime = prayerTimes[name];
                if (!rawTime) continue;
                const [h, m] = rawTime.split(':').map(Number);
                const pSec = h * 3600 + m * 60;
                if (pSec > nowSec) {
                    return { name, time: rawTime, remainingSeconds: pSec - nowSec };
                }
            }

            // All prayers passed — next is tomorrow's Fajr
            const fajrTime = prayerTimes['Fajr'];
            if (!fajrTime) return null;

            // Try tomorrow's cache
            const tmCache = this.getCachedTimings(tomorrowKey());
            const tmFajr = (tmCache && tmCache['Fajr']) || fajrTime;

            const [fh, fm] = tmFajr.split(':').map(Number);
            const fSec = fh * 3600 + fm * 60;
            const remaining = (86400 - nowSec) + fSec;
            return { name: 'Fajr', time: tmFajr, remainingSeconds: remaining };
        },

        getCurrentPrayer() {
            if (!window.state || !window.state.prayerTimes) return null;
            const prayerTimes = window.state.prayerTimes;
            const nowSec = nowSeconds();
            let current = null;

            for (const name of MAIN_PRAYERS) {
                const rawTime = prayerTimes[name];
                if (!rawTime) continue;
                const [h, m] = rawTime.split(':').map(Number);
                const pSec = h * 3600 + m * 60;
                if (pSec <= nowSec) current = { name, time: rawTime };
            }
            return current;
        },

        // ── Ramadan ──────────────────────────────────────────────────────────────

        getCurrentHijri() {
            const afterMaghrib = (window.state && window.state.settings && window.state.settings.hijriAfterMaghrib) || false;
            const todayK = todayKey();
            const tomorrowK = tomorrowKey();

            const todayCache = this.getCachedHijri(todayK);
            let activeHijri = todayCache;

            if (afterMaghrib) {
                const timings = this.getCachedTimings(todayK);
                if (timings && timings.Maghrib) {
                    const nowSecs = nowSeconds();
                    const maghribSecs = toMinutes(timings.Maghrib) * 60;
                    if (nowSecs >= maghribSecs) {
                        const tomorrowCache = this.getCachedHijri(tomorrowK);
                        if (tomorrowCache) activeHijri = tomorrowCache;
                    }
                }
            }
            return activeHijri || (window.state && window.state.hijri) || null;
        },

        getIslamicEvent(hijri) {
            if (!hijri) return null;
            const d = parseInt(hijri.day, 10);
            const m = parseInt(hijri.month && (hijri.month.number || hijri.month), 10);
            if (m === 1 && d === 1) return "Islamic New Year";
            if (m === 1 && d === 10) return "Ashura";
            if (m === 3 && d === 12) return "Mawlid al-Nabi";
            if (m === 7 && d === 27) return "Isra and Mi'raj";
            if (m === 8 && d === 15) return "Mid-Sha'ban";
            if (m === 9 && d === 1) return "Ramadan Begins";
            if (m === 9 && d >= 21 && d % 2 !== 0) return "Laylat al-Qadr (Expected)";
            if (m === 10 && d === 1) return "Eid al-Fitr";
            if (m === 12 && d === 9) return "Day of Arafah";
            if (m === 12 && d === 10) return "Eid al-Adha";
            if (m === 12 && (d === 11 || d === 12 || d === 13)) return "Days of Tashreeq";
            return null;
        },

        isRamadan() {
            try {
                const hijri = this.getCurrentHijri();
                if (!hijri) {
                    // Fallback: use Intl
                    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' });
                    const month = parseInt(formatter.format(new Date()), 10);
                    return month === 9;
                }
                const monthNum = parseInt(hijri.month && (hijri.month.number || hijri.month), 10);
                return monthNum === 9;
            } catch (_) {
                return false;
            }
        },

        getRamadanDay() {
            try {
                const hijri = this.getCurrentHijri();
                return hijri ? parseInt(hijri.day, 10) : 1;
            } catch (_) {
                return 1;
            }
        },

        getSuhoorEndTime() {
            // Suhoor ends at Imsak (if available) or Fajr
            const times = window.state && window.state.prayerTimes;
            if (!times) return null;
            return times.Imsak || times.Fajr;
        },

        getIftarTime() {
            // Iftar is at Maghrib
            const times = window.state && window.state.prayerTimes;
            return times ? times.Maghrib : null;
        },

        _updateRamadanCountdowns() {
            const suhoorEl = document.getElementById('pe-suhoor-cd');
            const iftarEl = document.getElementById('pe-iftar-cd');
            if (!suhoorEl && !iftarEl) return;

            const nowSec = nowSeconds();

            if (suhoorEl) {
                const st = this.getSuhoorEndTime();
                if (st) {
                    const [h, m] = st.split(':').map(Number);
                    const sSec = h * 3600 + m * 60;
                    let remaining = sSec - nowSec;
                    if (remaining < 0) remaining += 86400;
                    suhoorEl.textContent = remaining < 86400 ? formatHMS(remaining) : '--:--:--';
                }
            }

            if (iftarEl) {
                const it = this.getIftarTime();
                if (it) {
                    const [h, m] = it.split(':').map(Number);
                    const iSec = h * 3600 + m * 60;
                    let remaining = iSec - nowSec;
                    if (remaining < 0) remaining += 86400;
                    iftarEl.textContent = formatHMS(remaining);
                }
            }
        },

        // ── Smart Notifications ──────────────────────────────────────────────────

        _scheduleSmartNotifications() {
            // Clear old timers
            this._notificationTimers.forEach(t => clearTimeout(t));
            this._notificationTimers = [];

            if (!window.state || !window.state.settings || !window.state.settings.alarmsEnabled) return;
            if (!window.state.prayerTimes) return;

            const today = todayKey();

            MAIN_PRAYERS.forEach(name => {
                const rawTime = window.state.prayerTimes[name];
                if (!rawTime) return;

                const [h, m] = rawTime.split(':').map(Number);
                const now = new Date();
                const prayerDate = new Date(now);
                prayerDate.setHours(h, m, 0, 0);

                const msUntil = prayerDate - now;
                const msUntil15 = msUntil - 15 * 60 * 1000;

                // 15-minute reminder
                if (msUntil15 > 0) {
                    const tid15 = setTimeout(() => {
                        const key15 = `${name}_${today}_15min`;
                        if (!this._notifiedPrayers[key15]) {
                            this._notifiedPrayers[key15] = true;
                            this._sendNotification(
                                `⏰ ${name} in 15 minutes`,
                                `${name} prayer at ${window.formatPrayerTime ? window.formatPrayerTime(rawTime) : rawTime} — prepare yourself.`,
                                false
                            );
                        }
                    }, msUntil15);
                    this._notificationTimers.push(tid15);
                }

                // At prayer time
                if (msUntil > 0 && msUntil < 86400000) {
                    const tidAt = setTimeout(() => {
                        const keyAt = `${name}_${today}_at`;
                        if (!this._notifiedPrayers[keyAt]) {
                            this._notifiedPrayers[keyAt] = true;
                            // Trigger existing alarm function if available
                            if (typeof window.triggerPrayerAlarm === 'function') {
                                window.triggerPrayerAlarm(name);
                            } else {
                                this._sendNotification(
                                    `🕌 Time for ${name}`,
                                    `It is now time for ${name} prayer.`,
                                    true
                                );
                            }
                        }
                    }, msUntil > 0 ? msUntil : 0);
                    this._notificationTimers.push(tidAt);
                }
            });
        },

        async _sendNotification(title, body, playAdhan = false) {
            if (!('Notification' in window)) return;

            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            if (Notification.permission === 'granted') {
                try {
                    new Notification(title, {
                        body,
                        icon: '/icon.png',
                        badge: '/icon.png',
                        silent: !playAdhan
                    });
                } catch (_) { }
            }
        },

        // ── Public Refresh ───────────────────────────────────────────────────────

        async refresh(force = false) {
            if (force) {
                localStorage.removeItem(CACHE_PREFIX + todayKey());
                localStorage.removeItem(LAST_FETCH_KEY);
            }
            await this._syncTimings();
            await this._prefetchTomorrow();
            this._scheduleSmartNotifications();
            this._refreshUI();
        },

        // ── UI Refresh ───────────────────────────────────────────────────────────

        _refreshUI() {
            // Update active Hijri based on Maghrib rollover setting
            if (window.state) {
                const activeHijri = this.getCurrentHijri();
                if (activeHijri) window.state.hijri = activeHijri;
            }

            // Update sidebar/header Hijri date
            if (typeof window.updateDate === 'function') window.updateDate();


            // Refresh prayer theme if dynamic mode enabled
            if (window.state && window.state.settings && window.state.settings.dynamicPrayerTheme) {
                if (typeof window.refreshPrayerTheme === 'function') window.refreshPrayerTheme();
            }

            // Re-render dashboard if currently shown
            if (window.state && window.state.currentScreen === 'dashboard') {
                if (typeof window.renderDashboard === 'function') window.renderDashboard();
                else if (window.app && typeof window.app.loadScreen === 'function') {
                    // small delay to avoid re-render during existing render
                    setTimeout(() => {
                        if (window.state.currentScreen === 'dashboard') {
                            window.app.loadScreen('dashboard');
                        }
                    }, 500);
                }
            }

            // Update prayer list if it exists in DOM
            if (typeof window.updateDashboardPrayers === 'function') {
                window.updateDashboardPrayers();
            }
        },

        // ── Status Info (for settings display) ──────────────────────────────────

        getStatus() {
            const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
            const coords = this._lastCoords;
            const todayCache = this.hasTodayCache();
            const tomorrowCache = !!this.getCachedTimings(tomorrowKey());
            const method = CALC_METHODS[(window.state && window.state.settings && window.state.settings.method) || 3];
            const timezone = (window.state && window.state.coordinates && window.state.coordinates.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;

            return {
                lastFetch: lastFetch ? new Date(lastFetch).toLocaleString() : 'Never',
                coords: coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'Not detected',
                todayCache,
                tomorrowCache,
                method: method ? method.name : 'Unknown',
                timezone,
                isRamadan: this.isRamadan(),
                nextPrayer: this.getNextPrayer()
            };
        },

        // ── Calculation Methods ──────────────────────────────────────────────────

        getCalcMethods() {
            return CALC_METHODS;
        }
    };

    // ─── Expose Globally ─────────────────────────────────────────────────────────

    window.prayerEngine = PrayerEngine;
    window.formatHMS = formatHMS;
    window.formatHMShort = formatHMShort;

    // ─── Auto-Init After DOM Ready ────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for main.js to initialize state, then boot engine
            setTimeout(() => PrayerEngine.init(), 300);
        });
    } else {
        setTimeout(() => PrayerEngine.init(), 300);
    }

    // ─── Visibility-Based Sync ───────────────────────────────────────────────────
    // When user returns to app after being away, sync timings

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            PrayerEngine._syncTimings().then(() => PrayerEngine._refreshUI());
        }
    });

    console.log('[PrayerEngine] Module loaded');
})();
