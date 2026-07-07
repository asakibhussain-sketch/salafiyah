import re

with open('theme-system.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove old persistence logic
content = re.sub(r'function safeJsonStorage.*?\n}\n', '', content, flags=re.DOTALL)
content = re.sub(r'function persistPremiumSettings.*?\n}\n', '', content, flags=re.DOTALL)
content = re.sub(r'function readNumberSetting.*?\n}\n', '', content, flags=re.DOTALL)
content = re.sub(r'function readBooleanSetting.*?\n}\n', '', content, flags=re.DOTALL)

# Refactor initThemeSystem
init_theme_new = """function initThemeSystem() {
    const sm = window.settingsManager;
    if (!sm) return;
    
    installPremiumRuntime();

    if (sm.get('appearance', 'dynamicPrayerTheme')) {
        initPrayerThemeMode();
    }
}"""
content = re.sub(r'function initThemeSystem\(\) \{.*?(?=\nfunction applyTheme)', init_theme_new + '\n\n', content, flags=re.DOTALL)

# Refactor applyTheme
apply_theme_new = """function applyTheme(themeId, options = {}) {
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
}"""
content = re.sub(r'function applyTheme\(themeId, options = \{\}\) \{.*?(?=\nfunction setTheme)', apply_theme_new + '\n\n', content, flags=re.DOTALL)

# Refactor setTheme
set_theme_new = """function setTheme(themeId) {
    if (window.settingsManager) {
        window.settingsManager.set('appearance', 'dynamicPrayerTheme', false);
    }
    clearPrayerThemeTimer();
    applyTheme(themeId);
    refreshSettingsPanel();
}"""
content = re.sub(r'function setTheme\(themeId\) \{.*?(?=\nfunction applyAppearanceSettings)', set_theme_new + '\n\n', content, flags=re.DOTALL)

# Refactor applyAppearanceSettings
content = re.sub(r'function applyAppearanceSettings.*?\n}\n', '', content, flags=re.DOTALL)

# Refactor individual setting functions
# setAnimationIntensity
anim_new = """function setAnimationIntensity(intensity, options = {}) {
    const val = Math.max(0, Math.min(1, parseFloat(intensity) || 0));
    document.documentElement.style.setProperty('--anim-intensity', val);
    if (window.settingsManager) window.settingsManager.set('appearance', 'animationIntensity', val);
    if (options.render === true) refreshSettingsPanel();
}"""
content = re.sub(r'function setAnimationIntensity\(intensity, options = \{\}\) \{.*?(?=\nfunction setBlurIntensity)', anim_new + '\n\n', content, flags=re.DOTALL)

# setBlurIntensity
blur_new = """function setBlurIntensity(blur, options = {}) {
    const val = Math.max(0, Math.min(40, parseFloat(blur) || 0));
    document.documentElement.style.setProperty('--blur-intensity', `${val}px`);
    if (window.settingsManager) window.settingsManager.set('appearance', 'blurIntensity', val);
    if (options.render === true) refreshSettingsPanel();
}"""
content = re.sub(r'function setBlurIntensity\(blur, options = \{\}\) \{.*?(?=\nfunction setCardRadius)', blur_new + '\n\n', content, flags=re.DOTALL)

# setCardRadius
card_new = """function setCardRadius(radius, options = {}) {
    const val = Math.max(12, Math.min(40, parseFloat(radius) || 28));
    document.documentElement.style.setProperty('--card-radius', `${val}px`);
    if (window.settingsManager) window.settingsManager.set('appearance', 'cardRadius', val);
    if (options.render === true) refreshSettingsPanel();
}"""
content = re.sub(r'function setCardRadius\(radius, options = \{\}\) \{.*?(?=\nfunction setFontScale)', card_new + '\n\n', content, flags=re.DOTALL)

# setFontScale
font_new = """function setFontScale(scale, options = {}) {
    const val = Math.max(0.92, Math.min(1.14, parseFloat(scale) || 1));
    document.documentElement.style.setProperty('--font-scale', val);
    if (window.settingsManager) window.settingsManager.set('appearance', 'fontSize', val);
    if (options.render === true) refreshSettingsPanel();
}"""
content = re.sub(r'function setFontScale\(scale, options = \{\}\) \{.*?(?=\nfunction setDensity)', font_new + '\n\n', content, flags=re.DOTALL)

# setDensity
density_new = """function setDensity(density, options = {}) {
    const normalized = ['compact', 'regular', 'spacious'].includes(density) ? density : 'regular';
    document.body.classList.remove('density-compact', 'density-spacious', 'density-regular');
    document.body.classList.add(`density-${normalized}`);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'uiDensity', normalized);
    if (options.render !== false) refreshSettingsPanel();
}"""
content = re.sub(r'function setDensity\(density, options = \{\}\) \{.*?(?=\nfunction setAmbientEnabled)', density_new + '\n\n', content, flags=re.DOTALL)

# setAmbientEnabled
ambient_new = """function setAmbientEnabled(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('ambient-disabled', !active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'ambientEnabled', active);
    if (options.render !== false) refreshSettingsPanel();
}"""
content = re.sub(r'function setAmbientEnabled\(enabled, options = \{\}\) \{.*?(?=\nfunction setPatternEnabled)', ambient_new + '\n\n', content, flags=re.DOTALL)

# setPatternEnabled
pattern_new = """function setPatternEnabled(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('pattern-disabled', !active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'patternEnabled', active);
    if (options.render !== false) refreshSettingsPanel();
}"""
content = re.sub(r'function setPatternEnabled\(enabled, options = \{\}\) \{.*?(?=\nfunction setImmersiveMode)', pattern_new + '\n\n', content, flags=re.DOTALL)

# setImmersiveMode
immersive_new = """function setImmersiveMode(enabled, options = {}) {
    const active = !!enabled;
    document.body.classList.toggle('immersive-mode', active);
    if (options.persist !== false && window.settingsManager) window.settingsManager.set('appearance', 'immersiveMode', active);
    if (options.render !== false) refreshSettingsPanel();
}"""
content = re.sub(r'function setImmersiveMode\(enabled, options = \{\}\) \{.*?(?=\nfunction setDynamicPrayerTheme)', immersive_new + '\n\n', content, flags=re.DOTALL)

# setDynamicPrayerTheme
dyn_new = """function setDynamicPrayerTheme(enabled) {
    const active = !!enabled;
    if (window.settingsManager) window.settingsManager.set('appearance', 'dynamicPrayerTheme', active);

    if (active) {
        initPrayerThemeMode();
    } else {
        clearPrayerThemeTimer();
        const theme = window.settingsManager ? window.settingsManager.get('appearance', 'theme') : 'light';
        applyTheme(theme);
    }
    refreshSettingsPanel();
}"""
content = re.sub(r'function setDynamicPrayerTheme\(enabled\) \{.*?(?=\nfunction clearPrayerThemeTimer)', dyn_new + '\n\n', content, flags=re.DOTALL)

# getWidgetStorageKey and saveWidgetOrder
content = content.replace("localStorage.setItem(getWidgetStorageKey(grid), JSON.stringify(order));", 
"""
if (window.settingsManager) {
    const orders = window.settingsManager.get('dashboard', 'widgetOrder') || [];
    const gridIndex = Array.from(grid.parentElement.querySelectorAll('.widget-grid')).indexOf(grid);
    orders[gridIndex] = order;
    window.settingsManager.set('dashboard', 'widgetOrder', orders);
}
""")

content = content.replace("""    let order = [];
    try {
        order = JSON.parse(localStorage.getItem(getWidgetStorageKey(grid))) || [];
    } catch (e) {
        order = [];
    }""", 
"""    let order = [];
    if (window.settingsManager) {
        const orders = window.settingsManager.get('dashboard', 'widgetOrder') || [];
        const gridIndex = Array.from(grid.parentElement.querySelectorAll('.widget-grid')).indexOf(grid);
        order = orders[gridIndex] || [];
    }""")

# ensureSidebarControls
sidebar_new = """function ensureSidebarControls() {
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
}"""
content = re.sub(r'function ensureSidebarControls\(\) \{.*?(?=\nfunction getColorSchemeForTheme)', sidebar_new + '\n\n', content, flags=re.DOTALL)

with open('theme-system.js', 'w', encoding='utf-8') as f:
    f.write(content)
