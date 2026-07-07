import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update state initialization
get_initial_state_repl = """    const sm = window.settingsManager ? window.settingsManager.getAll() : {};
    const app = sm.appearance || {};
    const quran = sm.quran || {};
    const prayer = sm.prayer || {};
    const dash = sm.dashboard || {};
    const gen = sm.general || {};

    return {
        mushafOffline: {
            isDownloading: false,
            progress: 0,
            isDownloaded: localStorage.getItem('mushaf_downloaded') === 'true'
        },
        currentScreen: 'dashboard',
        user: null,
        theme: app.theme || 'light',
        tasbih: {
            counts: JSON.parse(localStorage.getItem('tasbih_counts')) || {},
            currentPhrase: localStorage.getItem('tasbih_current_phrase') || 'SubhanAllah',
            customPhrase: localStorage.getItem('tasbih_custom_phrase') || '',
            haptics: localStorage.getItem('tasbih_haptics') === 'true'
        },
        streak: parseInt(localStorage.getItem('streak')) || 0,
        lastActiveDate: localStorage.getItem('last_active_date') || null,
        dhikrs: [
            { id: 'SubhanAllah', arabic: 'سُبْحَانَ اللهِ', roman: 'SubhanAllah' },
            { id: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah' },
            { id: 'AllahuAkbar', arabic: 'اللهُ أَكْبَرُ', roman: 'Allahu Akbar' },
            { id: 'LaIlahaIllallah', arabic: 'لَا إِلَهَ إِلَّا اللهُ', roman: 'La ilaha illallah' },
            { id: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللهَ', roman: 'Astaghfirullah' }
        ],
        tracker,
        bookmarks: quran.bookmarks || { mushaf: [], quran: [], ayah: [] },
        goals: JSON.parse(localStorage.getItem('goals')) || {
            mushaf: { type: 'custom', target: 5, progress: 0 },
            tasbih: { type: 'custom', target: 1000, progress: 0 },
            date: new Date().toDateString()
        },
        recording: {
            engine: null,
            timer: null,
            seconds: 0,
            currentAyah: null,
            isRecording: false
        },
        calendarView: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        },
        quranHadithState: {
            currentSurah: 1,
            currentAyah: 1
        },
        lastRead: quran.lastRead || {
            surahNum: 67,
            surahName: 'Al-Mulk',
            ayahNum: 1,
            page: 562,
            type: 'mushaf'
        },
        settings: {
            method: prayer.method ?? 3,
            format24: gen.timeFormat24 ?? true,
            school: prayer.school ?? 0,
            ramadanMode: prayer.ramadanMode ?? false,
            alarmsEnabled: prayer.alarmsEnabled ?? true,
            translationEdition: quran.translation ?? 'en.asad',
            mushafPage: quran.lastRead?.page ?? 1,
            uiLanguage: gen.language ?? 'en',
            tajweedEnabled: quran.tajweedEnabled ?? false,
            accentColor: app.accentColor ?? '#006994',
            uiDensity: app.uiDensity ?? 'regular',
            hijriOffset: prayer.hijriOffset ?? 1,
            hapticStyle: app.hapticStyle ?? 'soft',
            currentTheme: app.theme ?? 'light',
            animationIntensity: app.animationIntensity ?? 1,
            blurIntensity: app.blurIntensity ?? 20,
            cardRadius: app.cardRadius ?? 28,
            fontScale: app.fontSize ?? 1,
            ambientEnabled: app.ambientEnabled ?? true,
            patternEnabled: app.patternEnabled ?? true,
            dynamicPrayerTheme: app.dynamicPrayerTheme ?? false,
            immersiveMode: app.immersiveMode ?? false,
            hijriAfterMaghrib: prayer.hijriAfterMaghrib ?? false,
            hijriLanguage: prayer.hijriLanguage ?? 'en'
        },
        location: prayer.location || { city: 'Mecca', country: 'SA' },
        hijri: JSON.parse(localStorage.getItem('hijri_data')) || offlineHijri,
        prayerTimes: JSON.parse(localStorage.getItem('prayer_times')) || null,
        coordinates: null,
        background: app.backgroundImage || { type: 'default', url: '' },
        audio: {
            isPlaying: false,
            currentSurah: null,
            currentAyah: null,
            currentNameId: null,
            surahData: null,
            player: new Audio(),
            reciter: 'ar.alafasy',
            loopMode: 'none',
            playbackRate: 1.0,
            isListening: false
        },
        chat: {
            messages: JSON.parse(localStorage.getItem('chat_history')) || [
                { role: 'bot', content: 'Assalamu Alaikum! I am your Islamic assistant. How can I help you today with questions about Salah, Fasting, or general knowledge?' }
            ]
        },
        quiz: {
            history: JSON.parse(localStorage.getItem('quiz_history')) || [],
            totalScore: parseInt(localStorage.getItem('quiz_total_score')) || 0
        },
        showTranslit: quran.showTranslit ?? false
    };"""
content = re.sub(r'return \{.*?show_translit.*?=== \'true\'\n    \};', get_initial_state_repl, content, flags=re.DOTALL)

# Remove the redundant state.settings = {...} block that immediately follows getInitialState
content = re.sub(r'state\.settings = \{.*?\.\.\.state\.settings\n\};\n\nstate\.settings\.currentTheme.*?immersiveMode === true;', '', content, flags=re.DOTALL)

# Update saveSettings
save_settings_old = """    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    localStorage.setItem('tajweed_enabled', state.settings.tajweedEnabled);"""
save_settings_new = """    if (window.settingsManager) {
        window.settingsManager.set('prayer', 'method', state.settings.method);
        window.settingsManager.set('general', 'timeFormat24', state.settings.format24);
        window.settingsManager.set('prayer', 'ramadanMode', state.settings.ramadanMode);
        window.settingsManager.set('prayer', 'alarmsEnabled', state.settings.alarmsEnabled);
        window.settingsManager.set('quran', 'tajweedEnabled', state.settings.tajweedEnabled);
        window.settingsManager.set('prayer', 'hijriOffset', state.settings.hijriOffset);
        window.settingsManager.set('prayer', 'hijriAfterMaghrib', state.settings.hijriAfterMaghrib);
        window.settingsManager.set('prayer', 'hijriLanguage', state.settings.hijriLanguage);
        window.settingsManager.set('appearance', 'hapticStyle', state.settings.hapticStyle);
        window.settingsManager.saveSync();
    }"""
content = content.replace(save_settings_old, save_settings_new)

# Update background save
bg_old = """    if (bgType) {
        state.background.type = bgType;
        state.background.url = bgUrl;
        applyBackground();
    }"""
bg_new = """    if (bgType) {
        state.background.type = bgType;
        state.background.url = bgUrl;
        if (window.settingsManager) window.settingsManager.set('appearance', 'backgroundImage', { type: bgType, url: bgUrl }, true);
        applyBackground();
    }"""
content = content.replace(bg_old, bg_new)

# Update mushafPage saves
mushaf_page_old = "localStorage.setItem('mushaf_page', state.settings.mushafPage);"
mushaf_page_new = "if (window.settingsManager) window.settingsManager.set('quran', 'lastRead', { ...window.settingsManager.get('quran', 'lastRead'), page: state.settings.mushafPage });"
content = content.replace(mushaf_page_old, mushaf_page_new)

# Update saveLocation
location_old = "localStorage.setItem('location', JSON.stringify(state.location));"
location_new = "if (window.settingsManager) window.settingsManager.set('prayer', 'location', state.location, true);"
content = content.replace(location_old, location_new)

# Update show_translit
translit_old = "localStorage.setItem('show_translit', state.showTranslit);"
translit_new = "if (window.settingsManager) window.settingsManager.set('quran', 'showTranslit', state.showTranslit);"
content = content.replace(translit_old, translit_new)

# Update bookmarks
bookmarks_old = "localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));"
bookmarks_new = "if (window.settingsManager) window.settingsManager.set('quran', 'bookmarks', state.bookmarks, true);"
content = content.replace(bookmarks_old, bookmarks_new)

# Update translation edition
trans_old = "localStorage.setItem('translation_edition', id);"
trans_new = "if (window.settingsManager) window.settingsManager.set('quran', 'translation', id);"
content = content.replace(trans_old, trans_new)

# Update uiLanguage
lang_old = "localStorage.setItem('ui_language', lang);"
lang_new = "if (window.settingsManager) window.settingsManager.set('general', 'language', lang);"
content = content.replace(lang_old, lang_new)


with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
