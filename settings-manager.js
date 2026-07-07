/**
 * Production-Grade Persistent Settings Management System
 * Centralized manager for loading, saving, updating, and synchronizing user preferences.
 */
class SettingsManager {
    constructor() {
        this.STORAGE_KEY = 'salafiyah_preferences';
        this.DEBOUNCE_DELAY = 500;
        
        this.DEFAULT_SETTINGS = {
            appearance: {
                theme: 'light',
                accentColor: '#006994',
                fontSize: 1,
                fontFamily: 'Inter',
                animationIntensity: 1,
                blurIntensity: 20,
                cardRadius: 28,
                backgroundImage: { type: 'default', url: '' },
                patternOpacity: 1,
                patternEnabled: true,
                compactMode: false,
                uiDensity: 'regular',
                readingMode: false,
                ambientEnabled: true,
                dynamicPrayerTheme: false,
                immersiveMode: false,
                hapticStyle: 'soft'
            },
            dashboard: {
                widgetOrder: [],
                sidebarCollapsed: false,
                navigationMode: 'bottom',
                layout: 'standard'
            },
            prayer: {
                method: 2,
                school: 0,
                autoLocation: true,
                location: { city: 'Mecca', country: 'SA', lat: null, lng: null },
                alarmsEnabled: true,
                notifications: 'silent',
                hijriOffset: 0,
                hijriAfterMaghrib: false,
                hijriLanguage: 'en',
                ramadanMode: false
            },
            quran: {
                lastRead: { surah: 1, ayah: 1, page: 1 },
                bookmarks: { mushaf: [], quran: [], ayah: [] },
                translation: 'en.asad',
                tafsir: 'ar.muyassar',
                tajweedEnabled: false,
                showTranslit: false
            },
            general: {
                language: 'en',
                region: 'global',
                timeFormat24: false,
                dateFormat: 'standard'
            }
        };

        this.settings = this._deepClone(this.DEFAULT_SETTINGS);
        this.saveTimeout = null;
        
        this._migrateLegacySettings();
        this.load();
    }

    _deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    _migrateLegacySettings() {
        if (localStorage.getItem('salafiyah_preferences_migrated')) return;

        try {
            // Migrate old scattered localStorage keys into the new central system
            const legacyApp = JSON.parse(localStorage.getItem('app_settings')) || {};
            
            const m = {
                appearance: {
                    theme: localStorage.getItem('app_theme') || legacyApp.currentTheme || 'light',
                    accentColor: localStorage.getItem('accent_color') || legacyApp.accentColor || '#006994',
                    fontSize: parseFloat(localStorage.getItem('font_scale')) || legacyApp.fontScale || 1,
                    animationIntensity: parseFloat(localStorage.getItem('anim_intensity')) ?? legacyApp.animationIntensity ?? 1,
                    blurIntensity: parseFloat(localStorage.getItem('blur_intensity')) ?? legacyApp.blurIntensity ?? 20,
                    cardRadius: parseFloat(localStorage.getItem('card_radius')) ?? legacyApp.cardRadius ?? 28,
                    backgroundImage: { 
                        type: localStorage.getItem('bg_type') || 'default', 
                        url: localStorage.getItem('bg_url') || '' 
                    },
                    patternEnabled: localStorage.getItem('pattern_enabled') !== 'false',
                    uiDensity: localStorage.getItem('ui_density') || legacyApp.uiDensity || 'regular',
                    ambientEnabled: localStorage.getItem('ambient_enabled') !== 'false',
                    dynamicPrayerTheme: localStorage.getItem('dynamic_prayer_theme') === 'true',
                    immersiveMode: localStorage.getItem('immersive_mode') === 'true',
                    hapticStyle: localStorage.getItem('haptic_style') || legacyApp.hapticStyle || 'soft'
                },
                dashboard: {
                    sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true'
                },
                prayer: {
                    method: legacyApp.method ?? 2,
                    school: legacyApp.school ?? 0,
                    location: JSON.parse(localStorage.getItem('location')) || { city: 'Mecca', country: 'SA' },
                    alarmsEnabled: legacyApp.alarmsEnabled ?? true,
                    hijriOffset: parseInt(localStorage.getItem('hijri_offset')) || legacyApp.hijriOffset || 0,
                    hijriAfterMaghrib: localStorage.getItem('hijri_after_maghrib') === 'true',
                    hijriLanguage: localStorage.getItem('hijri_language') || legacyApp.hijriLanguage || 'en',
                    ramadanMode: legacyApp.ramadanMode || false
                },
                quran: {
                    lastRead: JSON.parse(localStorage.getItem('last_read')) || { surah: 1, ayah: 1, page: 1 },
                    bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || { mushaf: [], quran: [], ayah: [] },
                    translation: localStorage.getItem('translation_edition') || legacyApp.translationEdition || 'en.asad',
                    tajweedEnabled: localStorage.getItem('tajweed_enabled') === 'true',
                    showTranslit: localStorage.getItem('show_translit') === 'true'
                },
                general: {
                    language: localStorage.getItem('ui_language') || legacyApp.uiLanguage || 'en',
                    timeFormat24: legacyApp.format24 || false
                }
            };
            
            this.settings = this._mergeDeep(this._deepClone(this.DEFAULT_SETTINGS), m);
            this.saveSync();
            localStorage.setItem('salafiyah_preferences_migrated', 'true');
            
            // Note: We don't delete old keys to ensure a fallback if needed
        } catch (e) {
            console.warn('[SettingsManager] Failed to migrate legacy settings', e);
        }
    }

    _mergeDeep(target, source) {
        if (typeof target !== 'object' || target === null) return source;
        if (typeof source !== 'object' || source === null) return target;
        
        const output = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Array) {
                output[key] = source[key]; // overwrite arrays completely
            } else if (typeof source[key] === 'object' && source[key] !== null) {
                output[key] = this._mergeDeep(target[key], source[key]);
            } else if (source[key] !== undefined && source[key] !== null) {
                output[key] = source[key];
            }
        }
        return output;
    }

    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.settings = this._mergeDeep(this._deepClone(this.DEFAULT_SETTINGS), parsed);
            }
        } catch (e) {
            console.error('[SettingsManager] Failed to load settings. Using defaults.', e);
            this.settings = this._deepClone(this.DEFAULT_SETTINGS);
        }
    }

    saveSync() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            this.syncWithServer();
        } catch (e) {
            console.error('[SettingsManager] Failed to save settings to localStorage', e);
        }
    }

    save() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveSync();
            this.saveTimeout = null;
        }, this.DEBOUNCE_DELAY);
    }

    syncWithServer() {
        // Placeholder for future cloud sync.
        // If authentication is added back, this method will check if a user is logged in
        // and push the this.settings JSON to the backend API, while resolving conflicts based on timestamps.
        if (window.state && window.state.user) {
            console.log('[SettingsManager] Simulating sync with server for user:', window.state.user.id);
            // fetch('/api/user/preferences', { method: 'POST', body: JSON.stringify(this.settings) });
        }
    }

    get(category, key) {
        if (this.settings[category]) {
            return this.settings[category][key];
        }
        return undefined;
    }

    set(category, key, value, immediate = false) {
        if (this.settings[category]) {
            this.settings[category][key] = value;
            if (immediate) {
                this.saveSync();
            } else {
                this.save();
            }
        }
    }
    
    setCategory(category, obj) {
        if (this.settings[category]) {
            this.settings[category] = this._mergeDeep(this.settings[category], obj);
            this.save();
        }
    }

    getAll() {
        return this.settings;
    }

    /**
     * Call this synchronously in <head> to prevent FOUC (Flash of Unstyled Content).
     * This will apply all CSS variables and classes before the body renders.
     */
    initAppearance() {
        const app = this.settings.appearance;
        const html = document.documentElement;

        // Apply theme data attribute and color scheme
        html.dataset.theme = app.theme;
        
        // Determine if dark based on theme name (basic heuristic)
        const isDark = app.theme.includes('dark') || ['theme-midnight-noor', 'theme-ramadan-night', 'theme-kaaba-luxury', 'theme-ottoman-royal', 'theme-andalusia', 'theme-indigo-sufi', 'theme-persian-rose', 'theme-mughal-garden'].includes(app.theme);
        html.style.colorScheme = isDark ? 'dark' : 'light';

        // Apply CSS Variables
        html.style.setProperty('--anim-intensity', app.animationIntensity);
        html.style.setProperty('--blur-intensity', `${app.blurIntensity}px`);
        html.style.setProperty('--card-radius', `${app.cardRadius}px`);
        html.style.setProperty('--font-scale', app.fontSize);
        
        // Wait for body to exist to apply classes, but we can do it now if possible
        const applyBodyClasses = () => {
            const body = document.body;
            if (!body) return;
            
            // Clean up existing theme classes just in case
            body.className = body.className.replace(/theme-[a-z-]+/g, '').replace(/(light|dark)-theme/g, '');
            
            if (app.theme === 'light' || app.theme === 'dark') {
                body.classList.add(`${app.theme}-theme`);
            } else {
                body.classList.add(app.theme);
            }

            body.classList.remove('density-compact', 'density-spacious', 'density-regular');
            body.classList.add(`density-${app.uiDensity}`);
            
            body.classList.toggle('ambient-disabled', !app.ambientEnabled);
            body.classList.toggle('pattern-disabled', !app.patternEnabled);
            body.classList.toggle('immersive-mode', app.immersiveMode);
            
            if (this.settings.prayer.ramadanMode) {
                body.classList.add('ramadan-mode');
            }
            if (app.readingMode) {
                body.classList.add('read-mode');
            }
            if (this.settings.dashboard.sidebarCollapsed) {
                body.classList.add('sidebar-collapsed');
            }
        };

        if (document.body) {
            applyBodyClasses();
        } else {
            document.addEventListener('DOMContentLoaded', applyBodyClasses);
        }
    }
}
