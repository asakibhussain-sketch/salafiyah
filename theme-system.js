/**
 * Hikmah Premium Theme System
 * Dynamic themes, appearance controls, ambient layers, widget polish, and low-cost interactions.
 */

const PREMIUM_THEME_CLASSES = [
    'theme-midnight-noor',
    'theme-emerald-mosque',
    'theme-desert-sand',
    'theme-ramadan-night',
    'theme-kaaba-luxury',
    'theme-minimal-white',
    'theme-ottoman-royal',
    'theme-andalusia',
    'theme-indigo-sufi',
    'theme-persian-rose',
    'theme-mughal-garden',
    'theme-arctic-fajr',
    'dark-theme',
    'light-theme'
];

const LEGACY_THEME_CLASSES = [
    'theme-serenity',
    'theme-desert',
    'theme-night',
    'theme-forest'
];

const PREMIUM_THEMES = {
    light: {
        label: 'Light',
        themeColor: '#f8fafc',
        isDark: false
    },
    dark: {
        label: 'Dark',
        themeColor: '#0f172a',
        isDark: true
    },
    'theme-midnight-noor': {
        label: 'Midnight Noor',
        themeColor: '#06111d',
        isDark: true
    },
    'theme-emerald-mosque': {
        label: 'Emerald Mosque',
        themeColor: '#ecfdf5',
        isDark: false
    },
    'theme-desert-sand': {
        label: 'Desert Sand',
        themeColor: '#fefce8',
        isDark: false
    },
    'theme-ramadan-night': {
        label: 'Ramadan Night',
        themeColor: '#2e1065',
        isDark: true
    },
    'theme-kaaba-luxury': {
        label: 'Kaaba Black & Gold',
        themeColor: '#111827',
        isDark: true
    },
    'theme-minimal-white': {
        label: 'Minimal White Serenity',
        themeColor: '#fafafa',
        isDark: false
    },
    'theme-ottoman-royal': {
        label: 'Ottoman Royal',
        themeColor: '#0c2e3d',
        isDark: true
    },
    'theme-andalusia': {
        label: 'Andalusia Twilight',
        themeColor: '#0c0a09',
        isDark: true
    },
    'theme-indigo-sufi': {
        label: 'Indigo Sufi',
        themeColor: '#1e1b4b',
        isDark: true
    },
    'theme-persian-rose': {
        label: 'Persian Rose',
        themeColor: '#18181b',
        isDark: true
    },
    'theme-mughal-garden': {
        label: 'Mughal Garden',
        themeColor: '#064e3b',
        isDark: true
    },
    'theme-arctic-fajr': {
        label: 'Arctic Fajr',
        themeColor: '#f0f9ff',
        isDark: false
    }
};

let prayerThemeTimer = null;
let premiumRuntimeInstalled = false;
let dashboardDragSource = null;

function getPremiumSettings() {
    if (typeof state !== 'undefined' && state.settings) return state.settings;
    return {};
}





function initThemeSystem() {
    const sm = window.settingsManager;
    if (!sm) return;
    
    installPremiumRuntime();

    if (sm.get('appearance', 'dynamicPrayerTheme')) {
        initPrayerThemeMode();
    }
}


function applyTheme(themeId, options = {}) {
    const theme = PREMIUM_THEMES[themeId] ? themeId : 'light';
    const body = document.body;

    [...PREMIUM_THEME_CLASSES, ...LEGACY_THEME_CLASSES].forEach(className => body.classList.remove(className));
    body.classList.add(theme === 'dark' || theme === 'light' ? `${theme}-theme` : theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = PREMIUM_THEMES[theme].isDark ? 'dark' : 'light';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', PREMIUM_THEMES[theme].themeColor);

    if (options.persist !== false && window.settingsManager) {
        window.settingsManager.set('appearance', 'theme', theme);
    }
    
    if (typeof state !== 'undefined' && state.settings) {
        state.settings.currentTheme = theme;
        state.theme = PREMIUM_THEMES[theme].isDark ? 'dark' : 'light';
    }

    window.dispatchEvent(new CustomEvent('salafiyah:theme-changed', {
        detail: { theme, meta: PREMIUM_THEMES[theme] }
    }));
}


function setTheme(themeId) {
    if (window.settingsManager) {
        window.settingsManager.set('appearance', 'dynamicPrayerTheme', false);
    }
    clearPrayerThemeTimer();
    applyTheme(themeId);
    refreshSettingsPanel();
}



function setAnimationIntensity(intensity, options = {}) {
    const val = Math.max(0, Math.min(1, parseFloat(intensity) || 0));
    document.documentElement.style.setProperty('--anim-intensity', val);
    if (window.settingsManager) window.settingsManager.set('appearance', 'animationIntensity', val);
    if (window.state && window.state.settings) { window.state.settings.animationIntensity = val; }
    if (options.render === true) refreshSettingsPanel();
}


function setBlurIntensity(blur, options = {}) {
    const val = Math.max(0, Math.min(40, parseFloat(blur) || 0));
    document.documentElement.style.setProperty('--blur-intensity', `${val}px`);
    if (window.settingsManager) window.settingsManager.set('appearance', 'blurIntensity', val);
    if (window.state && window.state.settings) { window.state.settings.blurIntensity = val; }
    if (options.render === true) refreshSettingsPanel();
}


function setCardRadius(radius, options = {}) {
    const val = Math.max(12, Math.min(40, parseFloat(radius) || 28));
    document.documentElement.style.setProperty('--card-radius', `${val}px`);
    if (window.settingsManager) window.settingsManager.set('appearance', 'cardRadius', val);
    if (window.state && window.state.settings) { window.state.settings.cardRadius = val; }
    if (options.render === true) refreshSettingsPanel();
}


function setFontScale(scale, options = {}) {
    const val = Math.max(0.92, Math.min(1.14, parseFloat(scale) || 1));
    document.documentElement.style.setProperty('--font-scale', val);
    if (window.settingsManager) window.settingsManager.set('appearance', 'fontSize', val);
    if (window.state && window.state.settings) { window.state.settings.fontScale = val; }
    if (options.render === true) refreshSettingsPanel();
}


function setDensity(density, options = {}) {
    const normalized = ['compact', 'regular', 'spacious'].includes(density) ? density : 'regular';
    document.body.classList.remove('density-compact', 'density-spacious', 'density-regular');
    document.body.classList.add(`density-${normalized}`);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'uiDensity', normalized);
    if (window.state && window.state.settings) { window.state.settings.uiDensity = normalized; }
    if (options.render !== false) refreshSettingsPanel();
}


function setAmbientEnabled(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('ambient-disabled', !active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'ambientEnabled', active);
    if (window.state && window.state.settings) { window.state.settings.ambientEnabled = active; }
    if (options.render !== false) refreshSettingsPanel();
}


function setPatternEnabled(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('pattern-disabled', !active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'patternEnabled', active);
    if (window.state && window.state.settings) { window.state.settings.patternEnabled = active; }
    if (options.render !== false) refreshSettingsPanel();
}


function setImmersiveMode(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('immersive-mode', active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'immersiveMode', active);
    if (window.state && window.state.settings) { window.state.settings.immersiveMode = active; }
    if (options.render !== false) refreshSettingsPanel();
}


function setDynamicPrayerTheme(enabled) {
    const active = !!enabled;
    if (window.settingsManager) window.settingsManager.set('appearance', 'dynamicPrayerTheme', active);

    if (active) {
        initPrayerThemeMode();
    } else {
        clearPrayerThemeTimer();
        const theme = window.settingsManager ? window.settingsManager.get('appearance', 'theme') : 'light';
        applyTheme(theme);
    }
    if (window.state && window.state.settings) { window.state.settings.dynamicPrayerTheme = active; }
    refreshSettingsPanel();
}


function clearPrayerThemeTimer() {
    if (prayerThemeTimer) {
        clearTimeout(prayerThemeTimer);
        prayerThemeTimer = null;
    }
}

function initPrayerThemeMode() {
    clearPrayerThemeTimer();
    const settings = getPremiumSettings();
    if (!settings.dynamicPrayerTheme) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerTimes = getPrayerTimesForTheme();
    const themeId = getPrayerThemeForMinute(currentMinutes, prayerTimes);

    applyTheme(themeId, { persist: false });

    const orderedTimes = [
        prayerTimes.Fajr,
        prayerTimes.Dhuhr,
        prayerTimes.Asr,
        prayerTimes.Maghrib,
        prayerTimes.Isha
    ].filter(Number.isFinite).sort((a, b) => a - b);
    const next = getNextPrayerTime(currentMinutes, orderedTimes);
    const delay = Math.max(60000, (next - currentMinutes) * 60 * 1000 + 1000);
    prayerThemeTimer = setTimeout(initPrayerThemeMode, delay);
}

function getPrayerTimesForTheme() {
    let storedTimes = {};
    try {
        storedTimes = JSON.parse(localStorage.getItem('prayer_times')) || {};
    } catch (e) {
        storedTimes = {};
    }

    const source = (typeof state !== 'undefined' && state.prayerTimes) || storedTimes;
    return {
        Fajr: parsePrayerTime(source.Fajr) || 300,
        Dhuhr: parsePrayerTime(source.Dhuhr) || 720,
        Asr: parsePrayerTime(source.Asr) || 960,
        Maghrib: parsePrayerTime(source.Maghrib) || 1110,
        Isha: parsePrayerTime(source.Isha) || 1230
    };
}

function getPrayerThemeForMinute(currentMinutes, prayerTimes) {
    if (currentMinutes >= prayerTimes.Fajr && currentMinutes < prayerTimes.Dhuhr) {
        return 'theme-minimal-white';
    }
    if (currentMinutes >= prayerTimes.Dhuhr && currentMinutes < prayerTimes.Asr) {
        return 'theme-emerald-mosque';
    }
    if (currentMinutes >= prayerTimes.Asr && currentMinutes < prayerTimes.Maghrib) {
        return 'theme-desert-sand';
    }
    if (currentMinutes >= prayerTimes.Maghrib && currentMinutes < prayerTimes.Isha) {
        return 'theme-ramadan-night';
    }
    return 'theme-midnight-noor';
}

function parsePrayerTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
}

function getNextPrayerTime(currentMinutes, prayerTimes) {
    for (const time of prayerTimes) {
        if (time > currentMinutes) return time;
    }
    return (prayerTimes[0] || 300) + 24 * 60;
}

function refreshSettingsPanel() {
    if (typeof state !== 'undefined' && state.currentScreen === 'settings' && typeof renderSettings === 'function') {
        renderSettings();
    }
}

function installPremiumRuntime() {
    if (premiumRuntimeInstalled) return;
    premiumRuntimeInstalled = true;

    ensureSidebarControls();
    bindInteractionFeedback();
    bindRevealObserver();
    bindDashboardLifecycle();
}

function bindInteractionFeedback() {
    document.addEventListener('pointerdown', event => {
        const target = event.target.closest('button, .btn-primary, .btn-secondary, .dhikr-chip, .nav-item, .action-item, .theme-preview-card');
        if (!target || target.disabled) return;

        target.classList.remove('tap-feedback');
        void target.offsetWidth;
        target.classList.add('tap-feedback');

        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    }, { passive: true });

    document.addEventListener('pointermove', event => {
        const target = event.target.closest('.btn-primary, .btn-secondary, .theme-preview-card');
        if (!target) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
}

function bindRevealObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const observeNewNodes = root => {
        root.querySelectorAll('.glass-card, .sakinah-card, .toolkit-card, .action-item').forEach((node, index) => {
            if (node.dataset.revealBound) return;
            node.dataset.revealBound = 'true';
            node.style.setProperty('--reveal-delay', `${Math.min(index * 24, 180)}ms`);
            node.classList.add('reveal-ready');
            observer.observe(node);
        });
    };

    observeNewNodes(document);

    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) observeNewNodes(node);
            });
        });
    });

    const content = document.getElementById('content-area');
    if (content) mutationObserver.observe(content, { childList: true, subtree: true });
}

function bindDashboardLifecycle() {
    window.addEventListener('salafiyah:screen-rendered', event => {
        if (event.detail?.screen === 'dashboard') {
            initDashboardWidgets();
        }
    });

    initDashboardWidgets();
}

function initDashboardWidgets() {
    const dashboard = document.querySelector('.premium-dashboard');
    if (!dashboard) return;

    dashboard.querySelectorAll('.grid-4-cols').forEach((grid, gridIndex) => {
        const cards = Array.from(grid.children).filter(child => child.classList.contains('glass-card'));
        if (cards.length < 2) return;

        grid.classList.add('widget-grid');
        cards.forEach((card, cardIndex) => {
            const key = `grid-${gridIndex}-card-${cardIndex}`;
            card.classList.add('dashboard-widget');
            card.dataset.widgetKey = card.dataset.widgetKey || key;
            card.setAttribute('draggable', 'true');
            card.setAttribute('tabindex', card.getAttribute('tabindex') || '0');
            card.setAttribute('aria-grabbed', 'false');
        });

        applyWidgetOrder(grid);
        bindWidgetGrid(grid);
    });
}

function bindWidgetGrid(grid) {
    if (grid.dataset.dragBound) return;
    grid.dataset.dragBound = 'true';

    grid.addEventListener('dragstart', event => {
        dashboardDragSource = event.target.closest('.dashboard-widget');
        if (!dashboardDragSource) return;
        dashboardDragSource.classList.add('widget-dragging');
        dashboardDragSource.setAttribute('aria-grabbed', 'true');
        event.dataTransfer.effectAllowed = 'move';
    });

    grid.addEventListener('dragover', event => {
        if (!dashboardDragSource) return;
        event.preventDefault();
        const target = event.target.closest('.dashboard-widget');
        if (!target || target === dashboardDragSource || target.parentElement !== grid) return;

        const targetRect = target.getBoundingClientRect();
        const insertBefore = event.clientY < targetRect.top + targetRect.height / 2;
        grid.insertBefore(dashboardDragSource, insertBefore ? target : target.nextSibling);
    });

    grid.addEventListener('dragend', () => {
        if (dashboardDragSource) {
            dashboardDragSource.classList.remove('widget-dragging');
            dashboardDragSource.setAttribute('aria-grabbed', 'false');
        }
        dashboardDragSource = null;
        saveWidgetOrder(grid);
    });
}

function getWidgetStorageKey(grid) {
    const gridIndex = Array.from(grid.parentElement.querySelectorAll('.widget-grid')).indexOf(grid);
    return `dashboard_widget_order_${gridIndex}`;
}

function saveWidgetOrder(grid) {
    const order = Array.from(grid.children)
        .filter(child => child.dataset.widgetKey)
        .map(child => child.dataset.widgetKey);
    
if (window.settingsManager) {
    const orders = window.settingsManager.get('dashboard', 'widgetOrder') || [];
    const gridIndex = Array.from(grid.parentElement.querySelectorAll('.widget-grid')).indexOf(grid);
    orders[gridIndex] = order;
    window.settingsManager.set('dashboard', 'widgetOrder', orders);
}

}

function applyWidgetOrder(grid) {
    let order = [];
    if (window.settingsManager) {
        const orders = window.settingsManager.get('dashboard', 'widgetOrder') || [];
        const gridIndex = Array.from(grid.parentElement.querySelectorAll('.widget-grid')).indexOf(grid);
        order = orders[gridIndex] || [];
    }

    if (!order.length) return;
    const cards = Array.from(grid.children).filter(child => child.dataset.widgetKey);
    order.forEach(key => {
        const card = cards.find(item => item.dataset.widgetKey === key);
        if (card) grid.appendChild(card);
    });
}


function ensureSidebarControls() {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (!sidebar || document.getElementById('sidebar-collapse-toggle')) return;

    const button = document.createElement('button');
    button.id = 'sidebar-collapse-toggle';
    button.className = 'sidebar-collapse-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Collapse sidebar');
    button.innerHTML = '<span aria-hidden="true">|</span>';
    
    const isCollapsed = window.settingsManager ? window.settingsManager.get('dashboard', 'sidebarCollapsed') : false;
    
    button.addEventListener('click', () => {
        const collapsed = !document.body.classList.contains('sidebar-collapsed');
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        button.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        if (window.settingsManager) window.settingsManager.set('dashboard', 'sidebarCollapsed', collapsed);
    });
    sidebar.appendChild(button);

    if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
        button.setAttribute('aria-label', 'Expand sidebar');
    }
}


function getColorSchemeForTheme(themeId) {
    const schemes = {
        light: { primary: '#6366f1', bg: '#f8fafc', card: '#ffffff' },
        dark: { primary: '#6366f1', bg: '#0f172a', card: '#1e293b' },
        'theme-midnight-noor': { primary: '#0e7cc1', bg: '#06111d', card: '#0f1b2e' },
        'theme-emerald-mosque': { primary: '#059669', bg: '#ecfdf5', card: '#f0fdf4' },
        'theme-desert-sand': { primary: '#a16207', bg: '#fefce8', card: '#fffbeb' },
        'theme-ramadan-night': { primary: '#6d28d9', bg: '#2e1065', card: '#3f1582' },
        'theme-kaaba-luxury': { primary: '#f59e0b', bg: '#111827', card: '#1f2937' },
        'theme-minimal-white': { primary: '#7c3aed', bg: '#fafafa', card: '#ffffff' },
        'theme-ottoman-royal': { primary: '#164e63', bg: '#0c2e3d', card: '#134e7a' },
        'theme-andalusia': { primary: '#ea580c', bg: '#0c0a09', card: '#1c1917' },
        'theme-indigo-sufi': { primary: '#6366f1', bg: '#1e1b4b', card: '#312e81' },
        'theme-persian-rose': { primary: '#e11d48', bg: '#18181b', card: '#27272a' },
        'theme-mughal-garden': { primary: '#0d9488', bg: '#064e3b', card: '#065f46' },
        'theme-arctic-fajr': { primary: '#0ea5e9', bg: '#f0f9ff', card: '#ffffff' }
    };

    return schemes[themeId] || schemes.light;
}

window.initThemeSystem = initThemeSystem;
window.applyTheme = applyTheme;
window.setTheme = setTheme;
window.setAnimationIntensity = setAnimationIntensity;
window.setBlurIntensity = setBlurIntensity;
window.setCardRadius = setCardRadius;
window.setFontScale = setFontScale;
window.setDensity = setDensity;
window.setAmbientEnabled = setAmbientEnabled;
window.setPatternEnabled = setPatternEnabled;
window.setImmersiveMode = setImmersiveMode;
window.setDynamicPrayerTheme = setDynamicPrayerTheme;
window.refreshPrayerTheme = initPrayerThemeMode;
window.getColorSchemeForTheme = getColorSchemeForTheme;

if (window.app) {
    Object.assign(window.app, {
        setTheme,
        setAnimationIntensity,
        setBlurIntensity,
        setCardRadius,
        setFontScale,
        setDensity,
        setAmbientEnabled,
        setPatternEnabled,
        setImmersiveMode,
        setDynamicPrayerTheme,
        refreshPrayerTheme: initPrayerThemeMode
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initThemeSystem,
        applyTheme,
        setTheme,
        setAnimationIntensity,
        setBlurIntensity,
        setCardRadius,
        setFontScale
    };
}
