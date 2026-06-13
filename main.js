/**
 * Salafiyah - Muslim Daily Companion
 * Main UI Logic & State Management
 */
console.log('Salafiyah v53 loaded - Friday check & Offline Assets active');

/// --- Global Error Boundary ---
window.onerror = function (msg, url, line, col, error) {
    console.error("App Crash:", msg, "at", line, ":", col);
    const content = document.getElementById('content-area');
    if (content) {
        content.innerHTML = `
            <div class="glass-card" style="margin: 2rem; border-left: 4px solid var(--accent-gold); animation: slideUp 0.5s ease both;">
                <h3 style="color: var(--accent-gold);">Something went wrong</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">The application encountered an unexpected error. This usually happens due to corrupted local data.</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="location.reload()" style="background: var(--accent-emerald);">Reload App</button>
                    <button class="btn-primary" onclick="localStorage.clear(); location.reload();" style="background: #ef4444; border-color: #ef4444;">Clear All Data & Reset</button>
                </div>
                <p style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 1rem; opacity: 0.5;">Error: ${msg}</p>
            </div>
        `;
    }
    return false;
};

// --- i18n Dictionary ---
const i18n = {
    en: {
        nav_home: "Home", nav_tasbih: "Tasbih", nav_quran: "Quran", nav_ask: "Ask Imam", nav_tracker: "Tracker",
        dashboard: "Salafiyah", tasbih: "Tasbih", quran: "Quran", books: "Books", tracker: "Tracker", qibla: "Qibla Compass", settings: "Settings", mushaf: "Sacred Mushaf", learn: "Learn", nearby: "Nearby",
        daily_goal: "Daily Spiritual Goal", spiritual_progress: "Spiritual Progress", tasks_completed: "tasks completed", daily_inspiration: "Daily Inspiration", prayer_times: "Prayer Times",
        recent_tasbih: "Recent Tasbih", count: "Count", features: "Features",
        salah_tracker: "Salah Tracker", fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
        daily_habits: "Daily Habits", morning_adhkar: "Morning Adhkar", evening_adhkar: "Evening Adhkar", quran_read: "Quran Recitation",
        location_settings: "Location Settings", detect_location: "Detect My Location", city: "City", country: "Country (Code)", update_location: "Update Location",
        app_prefs: "Salafiyah Preferences", ramadan_mode: "Ramadan Mode", prayer_alarms: "Prayer Alarms", calc_method: "Calculation Method", use_24h: "Use 24-hour time format", save_prefs: "Save Preferences",
        test_adhan: "Test Adhan Sound", back: "Back", back_to_dashboard: "Back to Salafiyah", close: "Close", play_all: "Play All Names",
        select_language: "Select Language", ui_language: "Salafiyah Interface Language", quran_trans_lang: "Quran Translation",
        daily_essentials: "Daily Essentials", explore_learn: "Explore & Learn", preferences: "Preferences",
        toolkit: "Spiritual Toolkit", qaza: "Qaza Tracker", zakat: "Zakat Calculator", quiz: "Islamic Quiz", bookmarks: "Bookmarks",
        search_quran: "Search Quran", ramadan: "Ramadan Mode", fasting_tracker: "Fasting Tracker", taraweeh: "Taraweeh Tracker",
        goals: "Spiritual Goals", custom: "Custom", recommended: "Recommended", shared: "Shared Successfully",
        toolkit_hub: "Toolkit Hub", spiritual_center: "Your Spiritual Control Center", start_journey: "Start Your Journey",
        explore: "Explore", hero_tagline: "Find Peace. Stay Connected.", hero_title: "Your Journey to Peace and Purpose",
        hero_desc: "Salafiyah is your all-in-one companion for a stronger connection with Allah — guiding your intention, actions, and reflection.",
        focus_mode_title: "Focus Mode", focus_mode_desc: "Undistracted Spiritual Journey", exit_focus: "Exit Focus Mode",
        jummah_mubarak: "Jummah Mubarak", jummah_kahf_reminder: "Don't forget to read Surah Al-Kahf and send Salawat upon the Prophet (PBUH).",
        download_mushaf: "Download Mushaf", downloading: "Downloading...", downloaded: "Offline Ready", download_offline: "Download for Offline Access",
        read_kahf: "Read Kahf", verse_of_day: "Verse of the Day", recitation_phrase: "Recitation Phrase",
        prev_surah: "Previous", next_surah: "Next"
    },
    ar: {
        nav_home: "الرئيسية", nav_tasbih: "تسبيح", nav_quran: "قرآن", nav_ask: "اسأل الإمام", nav_tracker: "المتابعة",
        dashboard: "السلفية", tasbih: "مسبحة", quran: "القرآن الكريم", books: "كتب", tracker: "المتابعة اليومية", qibla: "بوصلة القبلة", settings: "الإعدادات", mushaf: "المصحف الشريف", learn: "تعلم", nearby: "بالقرب مني",
        daily_goal: "الهدف الروحي اليومي", spiritual_progress: "التقدم الروحي", tasks_completed: "مهام مكتملة", daily_inspiration: "إلهام اليوم", prayer_times: "أوقات الصلاة",
        recent_tasbih: "تسبيح حديث", count: "العدد", features: "المميزات",
        salah_tracker: "متابعة الصلاة", fajr: "الفجر", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء",
        daily_habits: "عادات يومية", morning_adhkar: "أذكار الصباح", evening_adhkar: "أذكار المساء", quran_read: "تلاوة القرآن",
        location_settings: "إعدادات الموقع", detect_location: "تحديد موقعي", city: "المدينة", country: "الدولة", update_location: "تحديث الموقع",
        app_prefs: "تفضيلات التطبيق", ramadan_mode: "وضع رمضان", prayer_alarms: "تنبيهات الصلاة", calc_method: "طريقة الحساب", use_24h: "نظام 24 ساعة", save_prefs: "حفظ التفضيلات",
        test_adhan: "تجربة صوت الأذان", back: "رجوع", back_to_dashboard: "العودة للرئيسية", close: "إغلاق", play_all: "تشغيل الكل",
        select_language: "اختر اللغة", ui_language: "لغة واجهة التطبيق", quran_trans_lang: "ترجمة القرآن",
        daily_essentials: "الأساسيات اليومية", explore_learn: "استكشف وتعلم", preferences: "التفضيلات",
        toolkit: "حقيبة الأدوات", qaza: "قضاء الصلوات", zakat: "حساب الزكاة", quiz: "مسابقة إسلامية", bookmarks: "العلامات",
        search_quran: "بحث في القرآن", ramadan: "شهر رمضان", fasting_tracker: "متابعة الصيام", taraweeh: "متابعة التراويح",
        goals: "الأهداف الروحية", custom: "مخصص", recommended: "موصى به", shared: "تمت المشاركة بنجاح",
        toolkit_hub: "مركز الأدوات", spiritual_center: "مركز التحكم الروحي الخاص بك", start_journey: "ابدأ رحلتك",
        explore: "استكشف", hero_tagline: "جد السلام. ابق متصلاً.", hero_title: "رحلتك نحو السلام والهدف",
        hero_desc: "السلفية هي رفيقك الشامل لتعزيز صلتك بالله — توجه نيتك وأعمالك وتأملك.",
        focus_mode_title: "وضع التركيز", focus_mode_desc: "رحلة روحية بلا مشتتات", exit_focus: "الخروج من وضع التركيز",
        jummah_mubarak: "جمعة مباركة", jummah_kahf_reminder: "لا تنسَ قراءة سورة الكهف والصلاة على النبي ﷺ.",
        read_kahf: "اقرأ الكهف", verse_of_day: "آية اليوم", recitation_phrase: "جملة الذكر",
        prev_surah: "السابقة", next_surah: "التالية"
    },
    ur: {
        nav_home: "ہوم", nav_tasbih: "تسبیح", nav_quran: "قرآن", nav_ask: "امام سے پوچھیں", nav_tracker: "ٹریکر",
        dashboard: "سلفیہ", tasbih: "تسبیح", quran: "قرآن مجید", books: "کتب", tracker: "روزانہ ٹریکر", qibla: "قبلہ نما", settings: "ترتیبات", mushaf: "مصحف", learn: "سیکھیں", nearby: "قریبی مقامات",
        daily_goal: "روزانہ روحانی مقصد", spiritual_progress: "روحانی ترقی", tasks_completed: "مکمل کام", daily_inspiration: "آج کی بات", prayer_times: "نماز کے اوقات",
        recent_tasbih: "حالیہ تسبیح", count: "تعداد", features: "خصوصیات",
        salah_tracker: "نماز ٹریکر", fajr: "فجر", dhuhr: "ظہر", asr: "عصر", maghrib: "مغرب", isha: "عشاء",
        daily_habits: "روزانہ کی عادات", morning_adhkar: "صبح کے اذکار", evening_adhkar: "شام کے اذکار", quran_read: "تلاوت قرآن",
        location_settings: "مقام کی ترتیبات", detect_location: "میرا مقام معلوم کریں", city: "شہر", country: "ملک", update_location: "مقام اپ ڈیٹ کریں",
        app_prefs: "ایپ کی ترتیبات", ramadan_mode: "رمضان موڈ", prayer_alarms: "نماز کے الارم", calc_method: "حساب کا طریقہ", use_24h: "24 گھنٹے کا فارمیٹ", save_prefs: "ترتیبات محفوظ کریں",
        test_adhan: "اذان کی آواز چیک کریں", back: "واپس", back_to_dashboard: "ہوم پر واپس جائیں", close: "بند کریں", play_all: "سب چلائیں",
        select_language: "زبان منتخب کریں", ui_language: "ایپ کی زبان", quran_trans_lang: "قرآن کا ترجمہ",
        daily_essentials: "روزانہ کی ضروریات", explore_learn: "سیکھیں اور دریافت کریں", preferences: "ترجیحات",
        toolkit: "ٹول کٹ", qaza: "قضا نمازیں", zakat: "زکوٰۃ کیلکولیٹر", quiz: "اسلامی کوئز", bookmarks: "بک مارکس",
        search_quran: "قرآن میں تلاش کریں", ramadan: "رمضان", fasting_tracker: "روزہ ٹریکر", taraweeh: "تراویح ٹریکر",
        goals: "روحانی اہداف", custom: "اپنی مرضی کے", recommended: "تجویز کردہ", shared: "کامیابی سے شیئر کیا گیا",
        toolkit_hub: "ٹول کٹ ہب", spiritual_center: "آپ کا روحانی کنٹرول سینٹر", start_journey: "اپنا سفر شروع کریں",
        explore: "دریافت کریں", hero_tagline: "سکون پائیں، جڑے رہیں۔", hero_title: "سکون اور مقصد کی طرف آپ کا سفر",
        hero_desc: "سلفیہ اللہ کے ساتھ آپ کے تعلق کو مضبوط بنانے کے لیے آپ کا ہمہ گیر ساتھی ہے — جو آپ کی نیت، اعمال اور فکر کی رہنمائی کرتا ہے۔",
        focus_mode_title: "فوکس موڈ", focus_mode_desc: "بغیر کسی خلل کے روحانی سفر", exit_focus: "فوکس موڈ سے باہر نکلیں",
        jummah_mubarak: "جمعہ مبارک", jummah_kahf_reminder: "سورة الكهف پڑھنا اور نبی کریم ﷺ پر درود بھیجنا نہ بھولیں۔",
        read_kahf: "الكهف پڑھیں", verse_of_day: "آج کی آیت", recitation_phrase: "ذکر کی تسبیح",
        prev_surah: "پچھلا", next_surah: "اگلا"
    },
    id: {
        nav_home: "Beranda", nav_tasbih: "Tasbih", nav_quran: "Quran", nav_ask: "Tanya Imam", nav_tracker: "Pelacak",
        dashboard: "Salafiyah", tasbih: "Tasbih", quran: "Al-Quran", books: "Buku", tracker: "Pelacak Harian", qibla: "Kompas Kiblat", settings: "Pengaturan", mushaf: "Mushaf", learn: "Belajar", nearby: "Sekitar",
        daily_goal: "Target Spiritual Harian", spiritual_progress: "Kemajuan Spiritual", tasks_completed: "tugas selesai", daily_inspiration: "Inspirasi Hari Ini", prayer_times: "Waktu Shalat",
        recent_tasbih: "Tasbih Terakhir", count: "Jumlah", features: "Fitur",
        salah_tracker: "Pelacak Shalat", fajr: "Fajr", dhuhr: "Dzuhur", asr: "Ashar", maghrib: "Maghrib", isha: "Isya",
        daily_habits: "Kebiasaan Harian", morning_adhkar: "Dzikir Pagi", evening_adhkar: "Dzikir Petang", quran_read: "Tilawah Quran",
        location_settings: "Pengaturan Lokasi", detect_location: "Deteksi Lokasi Saya", city: "Kota", country: "Negara", update_location: "Perbarui Lokasi",
        app_prefs: "Preferensi Aplikasi", ramadan_mode: "Mode Ramadan", prayer_alarms: "Alarm Shalat", calc_method: "Metode Perhitungan", use_24h: "Format 24 Jam", save_prefs: "Simpan Preferensi",
        test_adhan: "Tes Suara Adzan", back: "Kembali", back_to_dashboard: "Kembali ke Beranda", close: "Tutup", play_all: "Putar Semua",
        select_language: "Pilih Bahasa", ui_language: "Bahasa Aplikasi", quran_trans_lang: "Terjemahan Quran",
        daily_essentials: "Esensial Harian", explore_learn: "Jelajahi & Belajar", preferences: "Preferensi",
        toolkit: "Peralatan", qaza: "Pelacak Qadha", zakat: "Kalkulator Zakat", quiz: "Kuis Islami", bookmarks: "Penanda",
        search_quran: "Cari Quran", ramadan: "Ramadan", fasting_tracker: "Pelacak Puasa", taraweeh: "Pelacak Tarawih",
        goals: "Target Spiritual", custom: "Kustom", recommended: "Rekomendasi", shared: "Berhasil Dibagikan",
        jummah_mubarak: "Jumat Berkah", jummah_kahf_reminder: "Jangan lupa membaca Surah Al-Kahf dan mengirimkan Salawat kepada Nabi ﷺ.",
        read_kahf: "Baca Al-Kahf", verse_of_day: "Ayat Hari Ini", recitation_phrase: "Frase Pengulangan",
        prev_surah: "Sebelumnya", next_surah: "Berikutnya"
    },
    fr: {
        nav_home: "Accueil", nav_tasbih: "Tasbih", nav_quran: "Coran", nav_ask: "Demander à l'Imam", nav_tracker: "Suivi",
        dashboard: "Salafiyah", tasbih: "Tasbih", quran: "Le Coran", books: "Livres", tracker: "Suivi Quotidien", qibla: "Boussole Qibla", settings: "Paramètres", mushaf: "Le Mushaf", learn: "Apprendre", nearby: "À Proximité",
        daily_goal: "Objectif Spirituel Quotidien", spiritual_progress: "Progrès Spirituel", tasks_completed: "tâches terminées", daily_inspiration: "Inspiration du Jour", prayer_times: "Heures de Prière",
        recent_tasbih: "Tasbih Récent", count: "Compte", features: "Fonctionnalités",
        salah_tracker: "Suivi des Prières", fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
        daily_habits: "Habitudes Quotidiennes", morning_adhkar: "Adhkar du Matin", evening_adhkar: "Adhkar du Soir", quran_read: "Récitation du Coran",
        location_settings: "Paramètres de Localisation", detect_location: "Détecter ma Position", city: "Ville", country: "Pays", update_location: "Mettre à jour",
        app_prefs: "Préférences de l'App", ramadan_mode: "Mode Ramadan", prayer_alarms: "Alarmes de Prière", calc_method: "Méthode de Calcul", use_24h: "Format 24h", save_prefs: "Enregistrer",
        test_adhan: "Tester l'Adhan", back: "Retour", back_to_dashboard: "Retour au Tableau de Bord", close: "Fermer", play_all: "Tout Lire",
        select_language: "Choisir la Langue", ui_language: "Langue de l'Interface", quran_trans_lang: "Traduction du Coran",
        daily_essentials: "Essentiels Quotidiens", explore_learn: "Explorer & Apprendre", preferences: "Préférences",
        toolkit: "Boîte à Outils", qaza: "Suivi des Qaza", zakat: "Calcul de la Zakat", quiz: "Quiz Islamique", bookmarks: "Signets",
        search_quran: "Chercher dans le Coran", ramadan: "Ramadan", fasting_tracker: "Suivi du Jeûne", taraweeh: "Suivi Tarawih",
        goals: "Objectifs Spirituels", custom: "Personnalisé", recommended: "Recommandé", shared: "Partagé avec Succès",
        jummah_mubarak: "Vendredi Béni", jummah_kahf_reminder: "N'oublie pas de lire la Sourate Al-Kahf et d'envoyer les Salawat au Prophète ﷺ.",
        read_kahf: "Lire Al-Kahf", verse_of_day: "Verset du Jour", recitation_phrase: "Phrase de Récitation",
        prev_surah: "Précédent", next_surah: "Suivant"
    }
};

function t(key) {
    const lang = state?.settings?.uiLanguage || 'en';
    const translation = i18n[lang]?.[key] || i18n['en'][key];
    if (!translation) {
        console.warn(`Missing translation for key: ${key}`);
        return key.replace('nav_', '').charAt(0).toUpperCase() + key.replace('nav_', '').slice(1);
    }
    return translation;
}

// --- State Management ---
const getInitialState = () => {
    const defaultTracker = {
        date: new Date().toDateString(),
        tasks: {
            fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
            morning_adhkar: false, evening_adhkar: false, quran_read: false
        },
        habits: [],
        qaza: JSON.parse(localStorage.getItem('qaza_data')) || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        fasting: JSON.parse(localStorage.getItem('fasting_data')) || Array(30).fill(false),
        taraweeh: parseInt(localStorage.getItem('taraweeh_count')) || 0
    };

    const savedTracker = JSON.parse(localStorage.getItem('tracker_data')) || {};
    const tracker = { ...defaultTracker, ...savedTracker };
    tracker.tasks = { ...defaultTracker.tasks, ...(savedTracker.tasks || {}) };

    const offlineHijri = (() => {
        try {
            const date = new Date();
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', options);
            const parts = hijriFormatter.formatToParts(date);
            const hj = {};
            parts.forEach(p => {
                if (p.type === 'day') hj.day = p.value;
                if (p.type === 'month') hj.month = { en: p.value };
                if (p.type === 'year') hj.year = p.value;
            });
            return hj;
        } catch (e) {
            return { day: '1', month: { en: 'Ramadan' }, year: '1447' };
        }
    })();

    return {
        mushafOffline: {
            isDownloading: false,
            progress: 0,
            isDownloaded: localStorage.getItem('mushaf_downloaded') === 'true'
        },
        currentScreen: 'dashboard',
        user: JSON.parse(localStorage.getItem('user')) || null,
        theme: localStorage.getItem('theme') || 'light',
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
        bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || { mushaf: [], quran: [], ayah: [] },
        goals: JSON.parse(localStorage.getItem('goals')) || {
            mushaf: { type: 'custom', target: 5, progress: 0 },
            tasbih: { type: 'custom', target: 1000, progress: 0 },
            date: new Date().toDateString()
        },
        lastRead: JSON.parse(localStorage.getItem('last_read')) || {
            surahNum: 67,
            surahName: 'Al-Mulk',
            ayahNum: 1,
            page: 562,
            type: 'mushaf'
        },
        settings: JSON.parse(localStorage.getItem('app_settings')) || {
            method: 3,
            format24: true,
            school: 0,
            ramadanMode: false,
            alarmsEnabled: true,
            translationEdition: localStorage.getItem('translation_edition') || 'en.asad',
            mushafPage: parseInt(localStorage.getItem('mushaf_page')) || 1,
            uiLanguage: localStorage.getItem('ui_language') || 'en',
            tajweedEnabled: localStorage.getItem('tajweed_enabled') === 'true',
            accentColor: localStorage.getItem('accent_color') || '#006994',
            uiDensity: localStorage.getItem('ui_density') || 'regular',
            focusMode: localStorage.getItem('focus_mode') === 'true',
            hapticStyle: localStorage.getItem('haptic_style') || 'soft',
            currentTheme: localStorage.getItem('app_theme') || localStorage.getItem('theme') || 'light',
            animationIntensity: parseFloat(localStorage.getItem('anim_intensity')) || 1,
            blurIntensity: parseFloat(localStorage.getItem('blur_intensity')) || 20,
            cardRadius: parseFloat(localStorage.getItem('card_radius')) || 28,
            fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
            ambientEnabled: localStorage.getItem('ambient_enabled') !== 'false',
            patternEnabled: localStorage.getItem('pattern_enabled') !== 'false',
            dynamicPrayerTheme: localStorage.getItem('dynamic_prayer_theme') === 'true',
            immersiveMode: localStorage.getItem('immersive_mode') === 'true'
        },
        location: JSON.parse(localStorage.getItem('location')) || { city: 'Mecca', country: 'SA' },
        hijri: JSON.parse(localStorage.getItem('hijri_data')) || offlineHijri,
        prayerTimes: null,
        coordinates: null,
        background: {
            type: localStorage.getItem('bg_type') || 'default',
            url: localStorage.getItem('bg_url') || '',
        },
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
        showTranslit: localStorage.getItem('show_translit') === 'true'
    };
};


const state = getInitialState();

state.settings = {
    method: 3,
    format24: true,
    school: 0,
    ramadanMode: false,
    alarmsEnabled: true,
    translationEdition: localStorage.getItem('translation_edition') || 'en.asad',
    mushafPage: parseInt(localStorage.getItem('mushaf_page')) || 1,
    uiLanguage: localStorage.getItem('ui_language') || 'en',
    tajweedEnabled: localStorage.getItem('tajweed_enabled') === 'true',
    accentColor: localStorage.getItem('accent_color') || '#006994',
    uiDensity: localStorage.getItem('ui_density') || 'regular',
    focusMode: localStorage.getItem('focus_mode') === 'true',
    hapticStyle: localStorage.getItem('haptic_style') || 'soft',
    currentTheme: localStorage.getItem('app_theme') || localStorage.getItem('theme') || 'light',
    animationIntensity: parseFloat(localStorage.getItem('anim_intensity')) || 1,
    blurIntensity: parseFloat(localStorage.getItem('blur_intensity')) || 20,
    cardRadius: parseFloat(localStorage.getItem('card_radius')) || 28,
    fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
    ambientEnabled: localStorage.getItem('ambient_enabled') !== 'false',
    patternEnabled: localStorage.getItem('pattern_enabled') !== 'false',
    dynamicPrayerTheme: localStorage.getItem('dynamic_prayer_theme') === 'true',
    immersiveMode: localStorage.getItem('immersive_mode') === 'true',
    ...state.settings
};

state.settings.currentTheme = localStorage.getItem('app_theme') || state.settings.currentTheme || 'light';
state.settings.uiDensity = localStorage.getItem('ui_density') || state.settings.uiDensity || 'regular';
state.settings.dynamicPrayerTheme = localStorage.getItem('dynamic_prayer_theme') === 'true' || state.settings.dynamicPrayerTheme === true;
state.settings.immersiveMode = localStorage.getItem('immersive_mode') === 'true' || state.settings.immersiveMode === true;
let verseAudio = null;
let verseAudioPlaying = false;
let currentAdhan = null;


const learningContent = [
    {
        id: 'pillars',
        title: '5 Pillars of Islam',
        icon: '🕌',
        content: `The foundation of a Muslim's life consists of five key acts:
        <br><br><strong>1. Shahada (Faith):</strong> The declaration that "There is no god but Allah, and Muhammad is the messenger of Allah."
        <br><br><strong>2. Salah (Prayer):</strong> Performing the five daily prayers to maintain a connection with Allah.
        <br><br><strong>3. Zakat (Almsgiving):</strong> Giving 2.5% of one's wealth to the poor and needy.
        <br><br><strong>4. Sawm (Fasting):</strong> Fasting in Ramadan from dawn to sunset to increase Taqwa.
        <br><br><strong>5. Hajj (Pilgrimage):</strong> The pilgrimage to the Kaaba in Makkah for those who are able.`
    },
    {
        id: 'salah',
        title: 'Salah Guide',
        icon: '🧎',
        content: `A step-by-step guide to performing Salah from Quran411:
        <br><br><strong>1. Niyyah:</strong> Quietly set your intention for the specific prayer.
        <br><br><strong>2. Takbir:</strong> Raise your hands and say "Allahu Akbar".
        <br><br><strong>3. Qiyam:</strong> Stand with hands on the chest and recite Surah Al-Fatiha.
        <br><br><strong>4. Ruku:</strong> Bow and say "Subhana Rabbiyal Azeem" 3 times.
        <br><br><strong>5. Sujud:</strong> Prostrate and say "Subhana Rabbiyal A'la" 3 times.
        <br><br><strong>6. Tashahhud:</strong> Sit and recite the testimony of faith.`
    },
    {
        id: 'names',
        title: '99 Names of Allah',
        icon: '✨',
        content: `Asma-ul-Husna (The Most Beautiful Names). Reciting these names helps in understanding the attributes of our Creator.
        <div id="names-list-container" style="margin-top: 1.5rem; display: grid; grid-template-columns: 1fr; gap: 0.8rem;">
            <!-- Will be populated by specific logic -->
        </div>`
    },
    {
        id: 'fasting',
        title: 'Ramadan Rules',
        icon: '🌙',
        content: `Essential rules and Duas for Ramadan:
        <br><br><strong>Dua for Suhoor:</strong> "Wa bi-sawmi ghadinn nawaiytu min shahri ramadan."
        <br><br><strong>Dua for Iftar:</strong> "Allahumma inni laka sumtu wa bika aamantu... wa ala rizq-ika-aftartu."
        <br><br>Focus on charity, patience, and reciting the Quran during this blessed month.`
    },
    {
        id: 'faith',
        title: 'Articles of Faith',
        icon: '💎',
        content: `The 6 core pillars of Iman (Faith) that define a believer's worldview:
        <br><br><strong>1. Belief in Allah:</strong> The absolute oneness and uniqueness of the Creator (Tawhid).
        <br><br><strong>2. Belief in His Angels:</strong> Created from light, they carry out Allah's commands without fail.
        <br><br><strong>3. Belief in His Books:</strong> The Torah, Psalms, Gospel, and the final preserved Word—the Holy Qur'an.
        <br><br><strong>4. Belief in His Messengers:</strong> From Adam to Muhammad (PBUH), sent to guide all nations.
        <br><br><strong>5. Belief in the Last Day:</strong> Resurrection, accountability, and the eternal life in Paradise or Hellfire.
        <br><br><strong>6. Belief in Divine Decree:</strong> Knowing that everything occurs according to Allah's infinite wisdom and will.`
    },
    {
        id: 'promised',
        title: 'Promised Paradise',
        icon: '🏘️',
        content: `The 10 companions (Al-Ashara al-Mubashara) given glad tidings of Jannah during their lifetime:
        <br><br><strong>1. Abu Bakr al-Siddiq:</strong> The first Caliph and closest companion.
        <br><br><strong>2. Umar ibn al-Khattab:</strong> Known for justice and state-building.
        <br><br><strong>3. Uthman ibn Affan:</strong> The compiler of the Quran and model of modesty.
        <br><br><strong>4. Ali ibn Abi Talib:</strong> The gate of knowledge and cousin of the Prophet.
        <br><br><strong>5. Talha ibn Ubaydullah, 6. Zubayr ibn al-Awwam, 7. Abdur-Rahman ibn Awf, 8. Sa’d ibn Abi Waqqas, 9. Sa’id ibn Zayd, 10. Abu Ubaydah ibn al-Jarrah.</strong>`
    },
    {
        id: 'signs',
        title: 'End Times Signs',
        icon: '⚠️',
        content: `Major signs that immediately precede the Day of Judgment as taught in Sunnah:
        <br><br>• <strong>The Mahdi:</strong> A leader who will fill the earth with justice.
        <br><br>• <strong>The Dajjal:</strong> The false messiah and the greatest trial for humanity.
        <br><br>• <strong>Descent of Isa (Jesus):</strong> He will return to defeat the Dajjal and establish peace.
        <br><br>• <strong>Gog & Magog:</strong> Tribes that will emerge and cause great destruction.
        <br><br>• <strong>The Sun from the West:</strong> A cosmic sign after which repentance is no longer accepted.`
    },
    {
        id: 'caliphs',
        title: 'The Four Caliphs',
        icon: '🛡️',
        content: `The Rashidun (Rightly Guided) Caliphs who led the Ummah after the Prophet (PBUH):
        <br><br><strong>Abu Bakr (632-634):</strong> Stabilized the state and preserved the faith.
        <br><br><strong>Umar (634-644):</strong> A brilliant administrator who expanded the Islamic boundaries with justice.
        <br><br><strong>Uthman (644-656):</strong> Standardized the Quranic script for all generations.
        <br><br><strong>Ali (656-661):</strong> A hero of knowledge and bravery who prioritized unity during trials.`
    },
    {
        id: 'library',
        title: 'Resource Library',
        icon: '📚',
        content: `Access authentic Islamic books, Hadith, and Q&A from trusted sources:
        <div class="external-grid" style="margin-top: 1.5rem;">
            <a href="https://sunnah.com" target="_blank" class="resource-card">
                <div class="resource-icon">📖</div>
                <div class="resource-name">Sunnah.com (Hadith)</div>
            </a>
            <a href="https://quran.com" target="_blank" class="resource-card">
                <div class="resource-icon">🕌</div>
                <div class="resource-name">Quran.com</div>
            </a>
            <a href="https://kalamullah.com" target="_blank" class="resource-card">
                <div class="resource-icon">📚</div>
                <div class="resource-name">Kalamullah (Books)</div>
            </a>
            <a href="https://islamqa.info" target="_blank" class="resource-card">
                <div class="resource-icon">❓</div>
                <div class="resource-name">IslamQA (Q&A)</div>
            </a>
        </div>`
    }
];

const nearbyServices = [
    { type: 'Mosque', icon: '🕌', query: 'mosque near me' },
    { type: 'Halal Food', icon: '🥩', query: 'halal restaurant near me' },
    { type: 'Islamic Library', icon: '📚', query: 'islamic library near me' },
    { type: 'Islamic Store', icon: '🛍️', query: 'islamic store near me' },
    { type: 'Quran School', icon: '📖', query: 'quran school madrasah near me' },
    { type: 'Islamic Center', icon: '🏛️', query: 'islamic center near me' }
];

const islamicStores = [
    { name: 'SunnahStore', desc: 'Books, Attar, Prayer Items', url: 'https://sunnahstore.co.uk', icon: '🧿', badge: 'UK' },
    { name: 'IslamicBookStore', desc: 'Authentic Islamic Literature', url: 'https://www.islamicbookstore.com', icon: '📗', badge: 'USA' },
    { name: 'Modanisa', desc: 'Modest Fashion & Clothing', url: 'https://www.modanisa.com', icon: '🧕', badge: 'Global' },
    { name: 'Dar-us-Salam', desc: 'Qurans, Hadith & Books', url: 'https://www.darussalam.com', icon: '📕', badge: 'Global' },
    { name: 'Zamzam.com', desc: 'Zamzam Water & Hajj Gifts', url: 'https://zamzam.com', icon: '💧', badge: 'KSA' },
    { name: 'Al-Huda Books', desc: 'Islamic Education Resources', url: 'https://www.alhudastore.com', icon: '🌙', badge: 'CA' }
];

const quranReciters = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', style: 'Murattal' },
    { id: 'ar.abdulbasitmujawwad', name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
    { id: 'ar.abdulsamad', name: 'AbdulBaset AbdulSamad', style: 'Murattal' },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', style: 'Murattal' },
    { id: 'ar.minshawimujawwad', name: 'Mohamed Siddiq Al-Minshawi', style: 'Mujawwad' },
    { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', style: 'Murattal' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', style: 'Murattal' },
    { id: 'ar.husarymujawwad', name: 'Mahmoud Khalil Al-Husary', style: 'Mujawwad' },
    { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman as-Sudais', style: 'Murattal' },
    { id: 'ar.shuraym', name: 'Sa\'ud ash-Shuraym', style: 'Murattal' }
];

function applyCustomization() {
    const root = document.documentElement;
    root.style.setProperty('--primary-blue', state.settings.accentColor);

    // Convert hex to RGB
    const hex = state.settings.accentColor.replace('#', '');
    if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        root.style.setProperty('--primary-blue-rgb', `${r}, ${g}, ${b}`);
    }

    document.body.classList.remove('density-compact', 'density-spacious');
    if (state.settings.uiDensity !== 'regular') {
        document.body.classList.add('density-' + state.settings.uiDensity);
    }
}

function formatPrayerTime(timeStr) {
    if (!timeStr) return '--:--';
    if (state.settings.format24) return timeStr;

    // Convert HH:mm to 12h
    const [h, m] = timeStr.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

// Expose functions to window early to avoid undefined errors
window.app = {
    loadScreen: (...args) => loadScreen(...args),
    resetTasbih: (...args) => resetTasbih(...args),
    resetAllData: (...args) => resetAllData(...args),
    loadSurah: (...args) => loadSurah(...args),
    toggleAuth: (...args) => toggleAuth(...args),
    renderAuthForm: (...args) => renderAuthForm(...args),
    handleAuthSubmit: (...args) => handleAuthSubmit(...args),
    loadBook: (...args) => loadBook(...args),
    toggleTrackerTask: (...args) => toggleTrackerTask(...args),
    runCommand: (...args) => runCommand(...args),
    saveLocation: (...args) => saveLocation(...args),
    saveSettings: (...args) => saveSettings(...args),
    renderHadithDetail: (...args) => renderHadithDetail(...args),
    detectLocation: (...args) => detectLocation(...args),
    toggleTheme: (...args) => toggleTheme(...args),
    toggleTranslit: (...args) => toggleTranslit(...args),
    applyCustomDhikr: (...args) => applyCustomDhikr(...args),
    updateAccentColor: (hex) => updateAccentColor(hex),
    updateDensity: (density) => updateDensity(density),
    applyCustomization: () => applyCustomization(),
    loadTopic: (...args) => loadTopic(...args),
    sendMessage: (...args) => sendMessage(...args),
    resetChat: (...args) => resetChat(...args),
    toggleAudio: (...args) => toggleAudio(...args),
    playSurahAudio: (...args) => playSurahAudio(...args),
    playAyahAudio: (...args) => playAyahAudio(...args),
    closePlayer: (...args) => closePlayer(...args),
    seekAudio: (...args) => seekAudio(...args),
    toggleLoop: (...args) => toggleLoop(...args),
    setPlaybackRate: (...args) => setPlaybackRate(...args),
    skipAyah: (...args) => skipAyah(...args),
    toggleLanguageModal: (...args) => toggleLanguageModal(...args),
    setTranslation: (...args) => setTranslation(...args),
    setUILanguage: (...args) => setUILanguage(...args),
    resetMushaf: (...args) => resetMushaf(...args),
    changeMushafPage: (...args) => changeMushafPage(...args),
    skipSurah: (...args) => skipSurah(...args),
    playNameAudio: (...args) => playNameAudio(...args),
    playAllNamesAudio: (...args) => playAllNamesAudio(...args),
    handleProgressSeek: (...args) => handleProgressSeek(...args),
    toggleBookmark: (...args) => toggleBookmark(...args),
    shareContent: (...args) => shareContent(...args),
    vibrate: (...args) => vibrate(...args),
    toggleVoiceRecognition: (...args) => toggleVoiceRecognition(...args),
    showLanguagePicker: (...args) => showLanguagePicker(...args),
    setLanguage: (...args) => setLanguage(...args),
    playVOTDAudio: (s, a) => playVOTDAudio(s, a),
    triggerPrayerAlarm: (...args) => triggerPrayerAlarm(...args),
    updateQaza: (...args) => updateQaza(...args),
    setSearchType: (...args) => setSearchType(...args),
    toggleFast: (...args) => toggleFast(...args),
    updateTaraweeh: (...args) => updateTaraweeh(...args),
    updateZakat: (...args) => updateZakat(...args),
    toggleReciterModal: () => toggleReciterModal(),
    setReciter: (id) => setReciter(id),
    speakArabic: (text) => speakArabic(text),
    syncUserData: () => syncUserData(),
    exportSyncKey: () => exportSyncKey(),
    importSyncKey: () => importSyncKey(),
    applyBackground: () => applyBackground(),
    renderDuas: (...args) => renderDuas(...args),
    renderLanguages: (...args) => renderLanguages(...args),
    renderCalendar: (...args) => renderCalendar(...args),

    exitFocusMode: () => {
        state.settings.focusMode = false;
        localStorage.setItem('focus_mode', 'false');
        document.body.classList.remove('focus-mode');
        renderDashboard();
    },
    generateAITasbih: () => generateAITasbih(),
    setAITasbih: (phrase) => setAITasbih(phrase),
    applyUITheme: (id) => applyUITheme(id),
    toggleReadMode: () => toggleReadMode(),
    filterSurahList: (q) => filterSurahList(q),
    loadPreviousSurah: (currentId) => loadPreviousSurah(currentId),
    loadNextSurah: (currentId) => loadNextSurah(currentId),
    renderMushaf: () => renderMushaf(),
    changeMushafPage: (d) => changeMushafPage(d),
    resetMushaf: () => resetMushaf(),
    downloadMushaf: () => downloadMushaf(),
    requestCompassPermission: () => requestCompassPermission(),
    setTheme: (themeId) => setTheme(themeId),
    setAnimationIntensity: (val) => setAnimationIntensity(val),
    setBlurIntensity: (val) => setBlurIntensity(val),
    setCardRadius: (val) => setCardRadius(val),
    setFontScale: (val) => setFontScale(val),
    setAmbientEnabled: (enabled) => setAmbientEnabled(enabled),
    setPatternEnabled: (enabled) => setPatternEnabled(enabled),
    setImmersiveMode: (enabled) => setImmersiveMode(enabled),
    setDynamicPrayerTheme: (enabled) => setDynamicPrayerTheme(enabled),
    setDensity: (density) => setDensity(density),
    refreshPrayerTheme: () => refreshPrayerTheme()
};

const adhkarData = {
    "Morning Adhkar": [
        { arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return.", count: 1 },
        { arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَكَلِمَةِ الْإِخْلَاصِ وَدِينِ نَبِيّينا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", translation: "We have entered a new day upon the natural religion of Islam, the word of sincerity, and the religion of our Prophet Muhammad.", count: 1 },
        { arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", translation: "Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.", count: 3 }
    ],
    "Evening Adhkar": [
        { arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.", count: 1 },
        { arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "I seek refuge in Allah's perfect words from the evil of what He has created.", count: 3 }
    ],
    "Eating & Drinking": [
        { arabic: "بِسْمِ اللَّهِ", translation: "In the name of Allah.", count: 1 },
        { arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", translation: "Praise is to Allah who has fed me this and provided it for me without any might or power from myself.", count: 1 }
    ],
    "Travel": [
        { arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", translation: "Glory is to Him Who has provided this for us though we could never have had its control by ourselves, and indeed to our Lord we surely return.", count: 1 },
        { arabic: "اللَّهُمَّ إِنَا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى", translation: "O Allah, we ask You of this journey for righteousness and piety.", count: 1 }
    ],
    "Quranic Duas": [
        { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.", count: 1 },
        { arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا", translation: "Our Lord, do not impose blame upon us if we have forgotten or erred.", count: 1 }
    ],
    "Protection & Safety": [
        { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.", count: 3 },
        { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", translation: "In the name of Allah, with Whose name nothing is harmed on earth nor in heaven, and He is the All-Hearing, the All-Knowing.", count: 3 }
    ],
    "Before Sleep": [
        { arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ", translation: "In Your name my Lord, I lie down and in Your name I rise.", count: 1 },
        { arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.", count: 3 }
    ],
    "Prophetic Duas": [
        { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ", translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice.", count: 1 },
        { arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", translation: "O Turner of the hearts, keep my heart steadfast upon Your religion.", count: 1 },
        { arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", translation: "O Allah, You are Forgiving and love forgiveness, so forgive me.", count: 1 }
    ],
    "Durood Shariff": [
        {
            arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
            translation: "O Allah, bestow Your favor upon Muhammad and upon the family of Muhammad as You bestowed Your favor upon Ibrahim and upon the family of Ibrahim, You are Praiseworthy, Most Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim, You are Praiseworthy, Most Glorious.",
            count: 1
        },
        {
            arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَآلِ إِبْرَاهِيمَ",
            translation: "O Allah, send Your blessings on Muhammad, Your slave and Messenger, as You sent Your blessings on Ibrahim; and send Your blessings on Muhammad and his family, as You sent Your blessings on Ibrahim and his family.",
            count: 1
        },
        {
            arabic: "صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ",
            translation: "May Allah bless him and grant him peace.",
            count: 100
        },
        {
            arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ",
            translation: "O Allah, send blessings upon our master Muhammad, a blessing by which You deliver us from all terrors and calamities (Durood Tunajjina).",
            count: 1
        }
    ],
    "Islamic Etiquettes": [
        { arabic: "إِذَا لَقِيتَهُ فَسَلِّمْ عَلَيْهِ", translation: "When you meet a fellow Muslim, greet them with 'Assalamu Alaikum'.", count: 1 },
        { arabic: "لَا يَشْرَبَنَّ أَحَدٌ مِنْكُمْ قَائِمًا", translation: "None of you should drink while standing.", count: 1 },
        { arabic: "بِسْمِ اللَّهِ قَبْلَ الْأَكْلِ", translation: "Say 'Bismillah' before eating.", count: 1 }
    ],
    "Stories of Sahaba": [
        { arabic: "أبو بكر الصديق", translation: "The closest companion of the Prophet (ﷺ) and the first Caliph, known for his unwavering faith.", count: 1 },
        { arabic: "عمر بن الخطاب", translation: "The second Caliph, known for his justice and strength in character.", count: 1 },
        { arabic: "عثمان بن عفان", translation: "The third Caliph, known for his modesty and generosity.", count: 1 }
    ],
    "Duas for Daily Life": [
        { arabic: "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي", translation: "O Allah, rectify for me my religion which is the safeguard of my affairs.", count: 1 },
        { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", count: 1 },
        { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى", translation: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.", count: 1 }
    ],
    "Salah Guide": [
        { arabic: "النية", translation: "Niyyah (Intention): Heartfelt intention to perform the specific prayer.", count: 1 },
        { arabic: "تكبيرة الإحرام", translation: "Takbiratul Ihram: Raising hands and saying 'Allahu Akbar' to begin.", count: 1 },
        { arabic: "القيام", translation: "Qiyam: Standing upright while reciting Surah Al-Fatihah.", count: 1 },
        { arabic: "الركوع", translation: "Ruku: Bowing down with hands on knees.", count: 1 },
        { arabic: "السجود", translation: "Sujood: Prostrating with forehead, nose, palms, knees, and toes touching the ground.", count: 1 }
    ],
};

const quranTranslations = [
    { name: 'English (Asad)', id: 'en.asad' },
    { name: 'English (Sahih Intl)', id: 'en.sahih' },
    { name: 'Urdu (Jalandhry)', id: 'ur.jalandhry' },
    { name: 'Urdu (Ahmed Ali)', id: 'ur.ahmedali' },
    { name: 'Kannada (Abdul Hameed)', id: 'kn.abdulhameed' },
    { name: 'Hindi (Farooq)', id: 'hi.farooq' },
    { name: 'Hindi (Hindi)', id: 'hi.hindi' },
    { name: 'Tamil (Jan Turst)', id: 'ta.tamil' },
    { name: 'Malayalam (Abdul Hameed)', id: 'ml.abdulhameed' },
    { name: 'Bengali (Zohurul Hoque)', id: 'bn.hoque' },
    { name: 'French (Hamidullah)', id: 'fr.hamidullah' },
    { name: 'Spanish (Cortes)', id: 'es.cortes' },
    { name: 'German (Abu Rida)', id: 'de.aburida' },
    { name: 'Turkish (Diyanet)', id: 'tr.diyanet' },
    { name: 'Russian (Abu Adel)', id: 'ru.abuadel' },
    { name: 'Chinese (Ma Jian)', id: 'zh.majian' },
    { name: 'Persian (Qaraati)', id: 'fa.qaraati' },
    { name: 'Indonesian (Bahasa)', id: 'id.indonesian' },
    { name: 'Malay (Basmeih)', id: 'ms.basmeih' },
    { name: 'Portuguese (El-Hayek)', id: 'pt.elhayek' },
    { name: 'Japanese (Japanese)', id: 'ja.japanese' },
    { name: 'Korean (Korean)', id: 'ko.korean' },
    // Simplified for now, but API has 100+
];

const namesOfAllah = [
    { "id": 1, "arabic": "الرحمن", "transliteration": "Ar-Rahman", "meaning": "The All-Compassionate" },
    { "id": 2, "arabic": "الرحيم", "transliteration": "Ar-Rahim", "meaning": "The All-Merciful" },
    { "id": 3, "arabic": "الملك", "transliteration": "Al-Malik", "meaning": "The Absolute Ruler" },
    { "id": 4, "arabic": "القدوس", "transliteration": "Al-Quddus", "meaning": "The Pure One" },
    { "id": 5, "arabic": "السلام", "transliteration": "As-Salam", "meaning": "The Source of Peace" },
    { "id": 6, "arabic": "المؤمن", "transliteration": "Al-Mu'min", "meaning": "The Inspirer of Faith" },
    { "id": 7, "arabic": "المهيمن", "transliteration": "Al-Muhaymin", "meaning": "The Guardian" },
    { "id": 8, "arabic": "العزيز", "transliteration": "Al-Aziz", "meaning": "The Victorious" },
    { "id": 9, "arabic": "الجبار", "transliteration": "Al-Jabbar", "meaning": "The Compeller" },
    { "id": 10, "arabic": "المتكبر", "transliteration": "Al-Mutakabbir", "meaning": "The Greatest" },
    { "id": 11, "arabic": "الخالق", "transliteration": "Al-Khaliq", "meaning": "The Creator" },
    { "id": 12, "arabic": "البارئ", "transliteration": "Al-Bari'", "meaning": "The Maker of Order" },
    { "id": 13, "arabic": "المصور", "transliteration": "Al-Musawwir", "meaning": "The Shaper of Beauty" },
    { "id": 14, "arabic": "الغفار", "transliteration": "Al-Ghaffar", "meaning": "The Forgiving" },
    { "id": 15, "arabic": "القهار", "transliteration": "Al-Qahhar", "meaning": "The Subduer" },
    { "id": 16, "arabic": "الوهاب", "transliteration": "Al-Wahhab", "meaning": "The Giver of All" },
    { "id": 17, "arabic": "الرزاق", "transliteration": "Ar-Razzaq", "meaning": "The Sustainer" },
    { "id": 18, "arabic": "الفتاح", "transliteration": "Al-Fattah", "meaning": "The Opener" },
    { "id": 19, "arabic": "العليم", "transliteration": "Al-Alim", "meaning": "The Knower of All" },
    { "id": 20, "arabic": "القابض", "transliteration": "Al-Qabid", "meaning": "The Constrictor" },
    { "id": 21, "arabic": "الباسط", "transliteration": "Al-Basit", "meaning": "The Reliever" },
    { "id": 22, "arabic": "الخافض", "transliteration": "Al-Khafid", "meaning": "The Abaser" },
    { "id": 23, "arabic": "الرافع", "transliteration": "Ar-Rafi", "meaning": "The Exalter" },
    { "id": 24, "arabic": "المعز", "transliteration": "Al-Mu'izz", "meaning": "The Bestower of Honors" },
    { "id": 25, "arabic": "المذل", "transliteration": "Al-Mudhill", "meaning": "The Giver of Dishonor" },
    { "id": 26, "arabic": "السميع", "transliteration": "As-Sami", "meaning": "The All-Hearing" },
    { "id": 27, "arabic": "البصير", "transliteration": "Al-Basir", "meaning": "The All-Seeing" },
    { "id": 28, "arabic": "الحكم", "transliteration": "Al-Hakam", "meaning": "The Judge" },
    { "id": 29, "arabic": "العدل", "transliteration": "Al-Adl", "meaning": "The Just" },
    { "id": 30, "arabic": "اللطيف", "transliteration": "Al-Latif", "meaning": "The Subtle One" },
    { "id": 31, "arabic": "الخبير", "transliteration": "Al-Khabir", "meaning": "The All-Aware" },
    { "id": 32, "arabic": "الحليم", "transliteration": "Al-Halim", "meaning": "The Forbearing" },
    { "id": 33, "arabic": "العظيم", "transliteration": "Al-Azim", "meaning": "The Magnificent" },
    { "id": 34, "arabic": "الغفور", "transliteration": "Al-Ghafur", "meaning": "The Forgiver and Hider of Faults" },
    { "id": 35, "arabic": "الشكور", "transliteration": "Ash-Shakur", "meaning": "The Rewarder of Thankfulness" },
    { "id": 36, "arabic": "العلي", "transliteration": "Al-Ali", "meaning": "The Highest" },
    { "id": 37, "arabic": "الكبير", "transliteration": "Al-Kabir", "meaning": "The Greatest" },
    { "id": 38, "arabic": "الحفيظ", "transliteration": "Al-Hafiz", "meaning": "The Preserver" },
    { "id": 39, "arabic": "المقيت", "transliteration": "Al-Muqit", "meaning": "The Nourisher" },
    { "id": 40, "arabic": "الحسيب", "transliteration": "Al-Hasib", "meaning": "The Accounter" },
    { "id": 41, "arabic": "الجليل", "transliteration": "Al-Jalil", "meaning": "The Mighty" },
    { "id": 42, "arabic": "الكريم", "transliteration": "Al-Karim", "meaning": "The Generous" },
    { "id": 43, "arabic": "الرقيب", "transliteration": "Ar-Raqib", "meaning": "The Watchful One" },
    { "id": 44, "arabic": "المجيب", "transliteration": "Al-Mujib", "meaning": "The Responder to Prayer" },
    { "id": 45, "arabic": "الواسع", "transliteration": "Al-Wasi", "meaning": "The All-Comprehending" },
    { "id": 46, "arabic": "الحكيم", "transliteration": "Al-Hakim", "meaning": "The Perfectly Wise" },
    { "id": 47, "arabic": "الودود", "transliteration": "Al-Wadud", "meaning": "The Loving One" },
    { "id": 48, "arabic": "الماجد", "transliteration": "Al-Majid", "meaning": "The Majestic One" },
    { "id": 49, "arabic": "الباعث", "transliteration": "Al-Ba'ith", "meaning": "The Resurrector" },
    { "id": 50, "arabic": "الشهيد", "transliteration": "Ash-Shahid", "meaning": "The Witness" },
    { "id": 51, "arabic": "الحق", "transliteration": "Al-Haqq", "meaning": "The Truth" },
    { "id": 52, "arabic": "الوكيل", "transliteration": "Al-Wakil", "meaning": "The Trustee" },
    { "id": 53, "arabic": "القوي", "transliteration": "Al-Qawiyy", "meaning": "The Possessor of All Strength" },
    { "id": 54, "arabic": "المتين", "transliteration": "Al-Matin", "meaning": "The Forceful One" },
    { "id": 55, "arabic": "الولي", "transliteration": "Al-Waliyy", "meaning": "The Governor" },
    { "id": 56, "arabic": "الحميد", "transliteration": "Al-Hamid", "meaning": "The Praised One" },
    { "id": 57, "arabic": "المحصي", "transliteration": "Al-Muhsi", "meaning": "The Appraiser" },
    { "id": 58, "arabic": "المبدئ", "transliteration": "Al-Mubdi'", "meaning": "The Originator" },
    { "id": 59, "arabic": "المعيد", "transliteration": "Al-Mu'id", "meaning": "The Restorer" },
    { "id": 60, "arabic": "المحيي", "transliteration": "Al-Muhyi", "meaning": "The Giver of Life" },
    { "id": 61, "arabic": "المميت", "transliteration": "Al-Mumit", "meaning": "The Creator of Death" },
    { "id": 62, "arabic": "الحي", "transliteration": "Al-Hayy", "meaning": "The Ever-Living One" },
    { "id": 63, "arabic": "القيوم", "transliteration": "Al-Qayyum", "meaning": "The Self-Sustaining One" },
    { "id": 64, "arabic": "الواجد", "transliteration": "Al-Wajid", "meaning": "The Perceiver" },
    { "id": 65, "arabic": "الماجد", "transliteration": "Al-Majid", "meaning": "The Illustrious One" },
    { "id": 66, "arabic": "الواحد", "transliteration": "Al-Wahid", "meaning": "The Unique One" },
    { "id": 67, "arabic": "الاحد", "transliteration": "Al-Ahad", "meaning": "The One" },
    { "id": 68, "arabic": "الصمد", "transliteration": "As-Samad", "meaning": "The Satisfier of All Needs" },
    { "id": 69, "arabic": "القادر", "transliteration": "Al-Qadir", "meaning": "The All Powerful" },
    { "id": 70, "arabic": "المقتدر", "transliteration": "Al-Muqtadir", "meaning": "The Creator of All Power" },
    { "id": 71, "arabic": "المقدم", "transliteration": "Al-Muqaddim", "meaning": "The Expediter" },
    { "id": 72, "arabic": "المؤخر", "transliteration": "Al-Mu'akhkhir", "meaning": "The Delayer" },
    { "id": 73, "arabic": "الأول", "transliteration": "Al-Awwal", "meaning": "The First" },
    { "id": 74, "arabic": "الأخر", "transliteration": "Al-Akhir", "meaning": "The Last" },
    { "id": 75, "arabic": "الظاهر", "transliteration": "Az-Zahir", "meaning": "The Manifest One" },
    { "id": 76, "arabic": "الباطن", "transliteration": "Al-Batin", "meaning": "The Hidden One" },
    { "id": 77, "arabic": "الوالي", "transliteration": "Al-Wali", "meaning": "The Protecting Friend" },
    { "id": 78, "arabic": "المتعالي", "transliteration": "Al-Muta'ali", "meaning": "The Supreme One" },
    { "id": 79, "arabic": "البر", "transliteration": "Al-Barr", "meaning": "The Doer of Good" },
    { "id": 80, "arabic": "التواب", "transliteration": "At-Tawwab", "meaning": "The Guide to Repentance" },
    { "id": 81, "arabic": "المنتقم", "transliteration": "Al-Muntaqim", "meaning": "The Avenger" },
    { "id": 82, "arabic": "العفو", "transliteration": "Al-Afu", "meaning": "The Forgiver" },
    { "id": 83, "arabic": "الرؤوف", "transliteration": "Ar-Ra'uf", "meaning": "The Clement" },
    { "id": 84, "arabic": "مالك الملك", "transliteration": "Malik-ul-Mulk", "meaning": "The Owner of All" },
    { "id": 85, "arabic": "ذو الجلال و الإكرام", "transliteration": "Dhul-Jalali wal-Ikram", "meaning": "The Lord of Majesty and Bounty" },
    { "id": 86, "arabic": "المقسط", "transliteration": "Al-Muqsit", "meaning": "The Equitable One" },
    { "id": 87, "arabic": "الجامع", "transliteration": "Al-Jami'", "meaning": "The Gatherer" },
    { "id": 88, "arabic": "الغني", "transliteration": "Al-Ghani", "meaning": "The Rich One" },
    { "id": 89, "arabic": "المغني", "transliteration": "Al-Mughni", "meaning": "The Enricher" },
    { "id": 90, "arabic": "المانع", "transliteration": "Al-Mani'", "meaning": "The Preventer of Harm" },
    { "id": 91, "arabic": "الضار", "transliteration": "Ad-Darr", "meaning": "The Creator of The Harmful" },
    { "id": 92, "arabic": "النافع", "transliteration": "An-Nafi'", "meaning": "The Creator of Good" },
    { "id": 93, "arabic": "النور", "transliteration": "An-Nur", "meaning": "The Light" },
    { "id": 94, "arabic": "الهادي", "transliteration": "Al-Hadi", "meaning": "The Guide" },
    { "id": 95, "arabic": "البديع", "transliteration": "Al-Badi", "meaning": "The Originator" },
    { "id": 96, "arabic": "الباقي", "transliteration": "Al-Baqi", "meaning": "The Everlasting One" },
    { "id": 97, "arabic": "الوارث", "transliteration": "Al-Warith", "meaning": "The Inheritor of All" },
    { "id": 98, "arabic": "الرشيد", "transliteration": "Ar-Rashid", "meaning": "The Righteous Teacher" },
    { "id": 99, "arabic": "الصبور", "transliteration": "As-Sabur", "meaning": "The Patient One" }
];

const dailyQuotes = [
    { text: "The best among you are those who have the best manners and character.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Allah does not look at your forms and possessions, but He looks at your hearts and your deeds.", author: "Prophet Muhammad (ﷺ)" },
    { text: "The strong man is not the one who can overpower others, but the one who can control himself when he is angry.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Be in this world as if you were a stranger or a traveler.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Whosoever follows a path to seek knowledge therein, Allah will make easy for him a path to Paradise.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Verily, with hardship comes ease.", author: "Quran 94:6" },
    { text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Kindness is a mark of faith, and whoever is not kind has no faith.", author: "Prophet Muhammad (ﷺ)" },
    { text: "A good word is charity.", author: "Prophet Muhammad (ﷺ)" },
    { text: "Richness is not having many possessions, but richness is being content with oneself.", author: "Prophet Muhammad (ﷺ)" }
];


// --- DOM Elements (assigned inside DOMContentLoaded) ---
let contentArea;
let screenTitle;
let navItems;
let currentDateEl;

function renderZakat() {
    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('toolkit')">← Toolkit</button>
            <div class="glass-card">
                <h3 class="section-title">Zakat Calculator</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2rem;">Calculate your annual Zakat (2.5%) based on your assets.</p>
                
                <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                    <div class="input-group">
                        <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Cash & Savings</label>
                        <input type="number" id="zakat-cash" class="settings-input" placeholder="0.00" oninput="window.app.updateZakat()">
                    </div>
                    <div class="input-group">
                        <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Gold Value</label>
                        <input type="number" id="zakat-gold" class="settings-input" placeholder="0.00" oninput="window.app.updateZakat()">
                    </div>
                    <div class="input-group">
                        <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Silver Value</label>
                        <input type="number" id="zakat-silver" class="settings-input" placeholder="0.00" oninput="window.app.updateZakat()">
                    </div>
                    <div class="input-group">
                        <label style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Other Assets (Stocks/Inv.)</label>
                        <input type="number" id="zakat-other" class="settings-input" placeholder="0.00" oninput="window.app.updateZakat()">
                    </div>
                </div>

                <div class="glass-card" style="margin-top: 2rem; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(var(--primary-blue-rgb), 0.3); border-radius: 20px; text-align: center;">
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; margin-bottom: 0.5rem;">Total Zakat Due</div>
                    <div id="zakat-result" style="font-size: 2.5rem; font-weight: 800; color: var(--accent-primary);">0.00</div>
                    <p style="font-size: 0.7rem; margin-top: 1rem; opacity: 0.5;">* This is a general calculation. Please consult a scholar for specific cases.</p>
                </div>
            </div>
        </div>
    `;
}

window.app.updateZakat = () => {
    const cash = parseFloat(document.getElementById('zakat-cash').value) || 0;
    const gold = parseFloat(document.getElementById('zakat-gold').value) || 0;
    const silver = parseFloat(document.getElementById('zakat-silver').value) || 0;
    const other = parseFloat(document.getElementById('zakat-other').value) || 0;

    const total = cash + gold + silver + other;
    const zakat = total * 0.025;

    document.getElementById('zakat-result').textContent = zakat.toFixed(2);
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    contentArea = document.getElementById('content-area');
    screenTitle = document.getElementById('screen-title');
    navItems = document.querySelectorAll('.nav-item');
    currentDateEl = document.getElementById('current-date');

    initTheme();
    updateDate();
    initNav();
    updateAuthUI();
    loadScreen('dashboard');
    checkStreak();
    checkDailyReset();
    fetchPrayerTimes();
    initCommandPalette();
    startPrayerWatch();
});

function initTheme() {
    const savedTheme = localStorage.getItem('app_theme') || state.settings.currentTheme || state.theme || 'light';
    document.body.classList.remove('theme-serenity', 'theme-desert', 'theme-night', 'theme-forest');
    if (typeof applyTheme === 'function') {
        applyTheme(savedTheme, { persist: false });
    } else {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add((savedTheme === 'dark' ? 'dark' : 'light') + '-theme');
    }
    if (state.settings.focusMode) document.body.classList.add('focus-mode');
    applyRTL(state.settings.uiLanguage);
}

function applyRTL(lang) {
    if (lang === 'ar' || lang === 'ur') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
    } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
    }
}

function renderBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const screen = item.getAttribute('data-screen');
        if (!screen) return;

        const key = screen === 'dashboard' ? 'nav_home' : 'nav_' + screen;
        const textSpan = item.querySelector('span');
        if (textSpan) {
            textSpan.textContent = t(key);
        }
    });
}

function toggleTheme() {
    const current = state.settings.currentTheme || state.theme || 'light';
    const nextTheme = current === 'dark' || current === 'theme-midnight-noor' || current === 'theme-kaaba-luxury'
        ? 'theme-minimal-white'
        : 'theme-midnight-noor';

    if (typeof setTheme === 'function') {
        setTheme(nextTheme);
    } else {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(state.theme + '-theme');
        localStorage.setItem('theme', state.theme);
    }
}

function updateDate() {
    const currentDateEl = document.getElementById('current-date');
    const hijriDateEl = document.getElementById('hijri-date');
    const sidebarDateEl = document.getElementById('current-date-sidebar');
    const sidebarHijriEl = document.getElementById('hijri-date-sidebar');

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const hijriStr = state.hijri ? `${state.hijri.day} ${state.hijri.month.en} ${state.hijri.year}` : '';

    if (currentDateEl) currentDateEl.textContent = dateStr;
    if (sidebarDateEl) sidebarDateEl.textContent = dateStr;

    if (hijriDateEl) hijriDateEl.textContent = hijriStr;
    if (sidebarHijriEl) sidebarHijriEl.textContent = hijriStr;
}

function initNav() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screen = item.getAttribute('data-screen');
            loadScreen(screen);

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// --- Router ---
async function loadScreen(screen) {
    state.currentScreen = screen;
    const titleEl = document.getElementById('screen-title');
    if (titleEl) titleEl.textContent = t(screen) || (screen.charAt(0).toUpperCase() + screen.slice(1));

    contentArea.style.opacity = '0';
    contentArea.style.transform = 'translateY(10px)';
    contentArea.style.transition = `all 0.4s var(--anim-ease)`;

    // Update Nav Active State
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemScreen = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        item.classList.toggle('active', itemScreen === screen);
    });

    setTimeout(async () => {
        contentArea.innerHTML = '';
        switch (screen) {
            case 'dashboard': await renderDashboard(); break;
            case 'tasbih': renderTasbih(); break;
            case 'quran': await renderQuran(); break;
            case 'books': renderBooks(); break;
            case 'tracker': renderTracker(); break;
            case 'qibla': renderQibla(); break;
            case 'settings': renderSettings(); break;
            case 'mushaf': await renderMushaf(); break;
            case 'learn': renderLearn(); break;
            case 'nearby': renderNearby(); break;
            case 'ask': renderChat(); break;
            case 'duas': renderDuas(); break;
            case 'toolkit': renderToolkitHub(); break;
            case 'qaza': renderQaza(); break;
            case 'zakat': renderZakat(); break;
            case 'goals': renderGoals(); break;
            case 'quiz': renderQuiz(); break;
            case 'bookmarks': renderBookmarks(); break;
            case 'customization': renderCustomization(); break;
            case 'calendar': renderCalendar(); break;
            case 'languages': renderLanguages(); break;
        }

        requestAnimationFrame(() => {
            contentArea.style.opacity = '1';
            contentArea.style.transform = 'translateY(0)';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.dispatchEvent(new CustomEvent('salafiyah:screen-rendered', { detail: { screen } }));
        });
    }, 250);
}

// --- Screen Renders ---

function renderChat() {
    const currentTranslation = quranTranslations.find(t => t.id === state.settings.translationEdition)?.name || 'English (Asad)';
    contentArea.innerHTML = `
        <div class="chat-wrapper" style="animation: entrance 0.6s var(--anim-spring) both;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.75rem;">
                <div class="btn-back" style="margin:0;" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <!-- Language & Translation Selector -->
                    <button class="dhikr-chip" onclick="window.app.toggleLanguageModal()" title="Language & Translation" style="display:flex; align-items:center; gap:0.4rem; font-size:0.78rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        ${state.settings.uiLanguage.toUpperCase()} / Translation
                    </button>
                    <!-- Reset Chat -->
                    <button class="profile-circle" onclick="window.app.resetChat()" title="Clear chat" style="width:36px; height:36px; background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                    <div style="display:flex; align-items:center; gap:0.5rem; color:var(--accent-primary); font-weight:700; font-size:0.9rem;">
                        <span class="pulse" style="width:8px; height:8px; background:var(--accent-primary); border-radius:50%;"></span>
                        AI Imam
                    </div>
                </div>
            </div>

            <!-- Quick prompts -->
            <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap;">
                ${['How to pray Fajr?', 'Dua for anxiety', 'What breaks fast?', 'Pillars of Islam'].map(q => `
                    <button class="dhikr-chip" style="font-size:0.75rem;" onclick="document.getElementById('chat-input').value='${q}'; window.app.sendMessage();">${q}</button>
                `).join('')}
            </div>

            <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                    ${state.chat.messages.map(m => `
                        <div class="chat-bubble ${m.role}">
                            ${m.content}
                            <div style="font-size:0.65rem; opacity:0.4; margin-top:0.4rem; text-align:${m.role === 'user' ? 'right' : 'left'}">${m.time || ''}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Ask about Islam, Salah, Duas..." onkeydown="if(event.key==='Enter') window.app.sendMessage()">
                    <button class="chat-send" onclick="window.app.sendMessage()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    const chatMsgs = document.getElementById('chat-messages');
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.chat.messages.push({ role: 'user', content: text, time });
    input.value = '';
    renderChat();

    // Show loading state
    const chatMsgs = document.getElementById('chat-messages');
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble bot loading';
    loadingBubble.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div> Thinking...';
    chatMsgs.appendChild(loadingBubble);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: state.chat.messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
        })
    })
        .then(res => res.json())
        .then(data => {
            loadingBubble.remove();
            if (data.choices && data.choices[0]) {
                const response = data.choices[0].message.content;

                const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                state.chat.messages.push({ role: 'bot', content: response, time: botTime });
                localStorage.setItem('chat_history', JSON.stringify(state.chat.messages));
                renderChat();
            } else {
                throw new Error("Invalid API response");
            }
        })
        .catch(err => {
            console.error("Groq API Error:", err);
            loadingBubble.remove();
            state.chat.messages.push({ role: 'bot', content: "I'm having trouble connecting to the knowledge base right now. Please try again in a moment." });
            renderChat();
        });
}

function resetChat() {
    if (confirm("Are you sure you want to clear your chat history with the Imam?")) {
        state.chat.messages = [
            { role: 'bot', content: "Assalamu Alaikum! I am your AI Imam assistant. How can I help you today with your spiritual journey or questions about Islam?" }
        ];
        localStorage.setItem('chat_history', JSON.stringify(state.chat.messages));
        renderChat();
    }
}

// --- Audio Logic ---

async function playSurahAudio(surahId) {
    if (state.audio.isPlaying && state.audio.currentSurah === surahId) {
        toggleAudio();
        return;
    }

    try {
        state.audio.currentSurah = surahId;
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/${state.audio.reciter}`);
        const data = await res.json();
        state.audio.surahData = data.data;
        state.audio.currentAyahIndex = -1;

        // Sync Mushaf Page if active
        if (state.currentScreen === 'mushaf' && data.data.ayahs && data.data.ayahs.length > 0) {
            const startPage = data.data.ayahs[0].page;
            state.settings.mushafPage = startPage;
            localStorage.setItem('mushaf_page', startPage);
            renderMushaf();
        }

        playNextAyah();
        showAudioPlayer();
    } catch (e) {
        console.error("Surah Audio Error:", e);
        const fallback = 'ar.alafasy';
        if (state.audio.reciter !== fallback) {
            alert("Primary reciter stream unavailable. Switching to Alafasy...");
            state.audio.reciter = fallback;
            playSurahAudio(surahId);
        } else {
            alert("Recitation server is currently busy. Please try another surah.");
        }
    }
}

function playNextAyah() {
    if (!state.audio.surahData) return;

    // Check for Loop Ayah
    if (state.audio.loopMode === 'ayah' && state.audio.currentAyahIndex !== undefined) {
        // Keep index same
    } else {
        state.audio.currentAyahIndex = (state.audio.currentAyahIndex === undefined) ? 0 : state.audio.currentAyahIndex + 1;
    }

    if (state.audio.currentAyahIndex >= state.audio.surahData.ayahs.length) {
        if (state.audio.loopMode === 'surah') {
            state.audio.currentAyahIndex = 0;
        } else {
            closePlayer();
            return;
        }
    }

    const ayah = state.audio.surahData.ayahs[state.audio.currentAyahIndex];
    state.audio.currentAyah = ayah.numberInSurah;
    state.audio.player.src = ayah.audio;
    state.audio.player.playbackRate = state.audio.playbackRate;
    state.audio.player.play();
    state.audio.isPlaying = true;

    state.audio.player.onended = () => {
        playNextAyah();
    };

    // Progress Update
    state.audio.player.ontimeupdate = () => {
        const slider = document.getElementById('audio-progress');
        if (slider && !slider.matches(':active')) {
            slider.value = (state.audio.player.currentTime / state.audio.player.duration) * 100 || 0;
        }
        const currTimeSpan = document.getElementById('audio-current-time');
        const totalTimeSpan = document.getElementById('audio-total-time');
        if (currTimeSpan) currTimeSpan.textContent = formatTime(state.audio.player.currentTime);
        if (totalTimeSpan && !isNaN(state.audio.player.duration) && state.audio.player.duration !== Infinity) {
            totalTimeSpan.textContent = formatTime(state.audio.player.duration);
        }
    };

    updatePlayerUI();
    highlightAyah(ayah.numberInSurah);
}

function highlightAyah(num) {
    const ayahEl = document.getElementById(`ayah-${num}`);
    if (ayahEl) {
        document.querySelectorAll('.ayah-highlight').forEach(el => el.classList.remove('ayah-highlight'));
        ayahEl.classList.add('ayah-highlight');
        ayahEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function toggleAudio() {
    if (state.audio.isPlaying) {
        state.audio.player.pause();
        state.audio.isPlaying = false;
    } else {
        state.audio.player.play();
        state.audio.isPlaying = true;
    }
    updatePlayerUI();
}

function showAudioPlayer() {
    const container = document.getElementById('audio-player-container');
    container.classList.remove('audio-player-hidden');
    updatePlayerUI();
}

function updatePlayerUI() {
    const container = document.getElementById('audio-player-container');
    if (!container || !state.audio.surahData) return;

    const loopLabels = { 'none': 'No Loop', 'ayah': 'Loop Ayah', 'surah': 'Loop Surah' };
    const playbackRates = [0.5, 1.0, 1.25, 1.5, 2.0];

    // Audio Pulse Glow
    if (state.audio.isPlaying) {
        container.style.animation = 'pulseGlow 2s infinite';
    } else {
        container.style.animation = 'none';
    }

    container.innerHTML = `
        <div class="player-card" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; animation: entrance 0.4s var(--anim-spring) both;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="player-info" style="flex: 1;">
                    <div class="player-title" style="font-weight: 700; color: var(--accent-primary);">${state.audio.surahData.englishName}</div>
                    <div class="player-subtitle" style="font-size: 0.75rem; color: var(--text-muted);">Verse ${state.audio.currentAyah || 1} • ${state.audio.surahData.edition?.name || 'Recitation'}</div>
                </div>
                <button class="profile-circle" onclick="window.app.closePlayer()" style="width: 32px; height: 32px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); font-size: 1.2rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">&times;</button>
            </div>

            <div style="width: 100%; display: flex; align-items: center; gap: 10px; margin: 5px 0;">
                <span id="audio-current-time" style="font-size: 0.65rem; color: var(--text-muted); width: 35px; font-variant-numeric: tabular-nums;">${formatTime(state.audio.player.currentTime)}</span>
                <input type="range" id="audio-progress" min="0" max="100" value="${(state.audio.player.currentTime / (state.audio.player.duration || 1)) * 100}" 
                       style="flex: 1; height: 4px; accent-color: var(--accent-primary); cursor: pointer;"
                       oninput="window.app.handleProgressSeek(this.value)">
                <span id="audio-total-time" style="font-size: 0.65rem; color: var(--text-muted); width: 35px; font-variant-numeric: tabular-nums;">${formatTime(state.audio.player.duration)}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
                <div class="player-controls" style="display: flex; align-items: center; gap: 8px;">
                    <button class="profile-circle" style="width: 32px; height: 32px;" onclick="window.app.skipAyah('prev')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                    </button>
                    <button class="play-pause-btn" style="width: 44px; height: 44px; background: var(--gemini-sparkle); color: #000; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);" onclick="window.app.toggleAudio()">
                        ${state.audio.isPlaying ?
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'}
                    </button>
                    <button class="profile-circle" style="width: 32px; height: 32px;" onclick="window.app.skipAyah('next')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                    </button>
                </div>

                <div style="display: flex; gap: 0.4rem; align-items: center;">
                    <button class="dhikr-chip ${state.audio.loopMode !== 'none' ? 'active' : ''}" 
                            onclick="window.app.toggleLoop()" style="font-size: 0.65rem; padding: 0.4rem 0.8rem; border-radius: 10px;">
                        ${loopLabels[state.audio.loopMode]}
                    </button>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="dhikr-chip" onclick="window.app.skipSurah('prev')" style="font-size: 0.6rem; padding: 0.4rem 0.6rem; border-radius: 10px;">&laquo;</button>
                        <button class="dhikr-chip" onclick="window.app.skipSurah('next')" style="font-size: 0.6rem; padding: 0.4rem 0.6rem; border-radius: 10px;">&raquo;</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function closePlayer() {
    state.audio.player.pause();
    state.audio.isPlaying = false;
    state.audio.currentSurah = null;
    state.audio.surahData = null;
    document.getElementById('audio-player-container').classList.add('audio-player-hidden');
}

async function playAyahAudio(surahId, ayahNum) {
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${ayahNum}/${state.audio.reciter}`);
        const data = await res.json();
        const ayah = data.data;

        state.audio.player.src = ayah.audio;
        state.audio.player.playbackRate = state.audio.playbackRate;
        state.audio.player.play();
        state.audio.isPlaying = true;
        state.audio.currentAyah = ayahNum;

        state.audio.surahData = { englishName: ayah.surah.englishName, recitation: { name: 'Mishary Rashid Alafasy' }, ayahs: [ayah] };
        state.audio.currentAyahIndex = 0;

        state.audio.player.onended = () => {
            if (state.audio.loopMode === 'ayah') {
                state.audio.player.play();
            } else {
                closePlayer();
            }
        };

        state.audio.player.ontimeupdate = () => {
            const slider = document.getElementById('audio-progress');
            if (slider && !slider.matches(':active')) {
                slider.value = (state.audio.player.currentTime / state.audio.player.duration) * 100 || 0;
            }
            const currTimeSpan = document.getElementById('audio-current-time');
            const totalTimeSpan = document.getElementById('audio-total-time');
            if (currTimeSpan) currTimeSpan.textContent = formatTime(state.audio.player.currentTime);
            if (totalTimeSpan && !isNaN(state.audio.player.duration) && state.audio.player.duration !== Infinity) {
                totalTimeSpan.textContent = formatTime(state.audio.player.duration);
            }
        };

        showAudioPlayer();
    } catch (e) {
        console.error("Audio Error:", e);
        alert("Audio playback unavailable. Trying another source...");
        const fallbackId = 'ar.alafasy';
        if (state.audio.reciter !== fallbackId) {
            state.audio.reciter = fallbackId;
            playAyahAudio(surahId, ayahNum);
        }
    }
}

function seekAudio(amount) {
    state.audio.player.currentTime += amount;
}

function toggleLoop() {
    const modes = ['none', 'ayah', 'surah'];
    const currentIdx = modes.indexOf(state.audio.loopMode);
    state.audio.loopMode = modes[(currentIdx + 1) % modes.length];
    updatePlayerUI();
}

function setPlaybackRate(rate) {
    state.audio.playbackRate = rate;
    state.audio.player.playbackRate = rate;
    updatePlayerUI();
}

function skipSurah(direction) {
    if (!state.audio.currentSurah) return;
    let nextSurah = direction === 'next' ? state.audio.currentSurah + 1 : state.audio.currentSurah - 1;
    if (nextSurah < 1) nextSurah = 114;
    if (nextSurah > 114) nextSurah = 1;
    playSurahAudio(nextSurah);
}

function handleProgressSeek(val) {
    if (state.audio.player.duration) {
        state.audio.player.currentTime = (val / 100) * state.audio.player.duration;
    }
}

async function renderDashboard() {
    try {
        const hijriDate = state.hijri ? `${state.hijri.day} ${state.hijri.month.en} ${state.hijri.year}` : 'Loading...';

        // Mock prayer times for premium UI feel
        const prayerTimes = [
            { name: 'Fajr', time: '4:32 AM' },
            { name: 'Dhuhr', time: '12:23 PM' },
            { name: 'Asr', time: '3:45 PM' },
            { name: 'Maghrib', time: '6:47 PM', active: true },
            { name: 'Isha', time: '8:15 PM' }
        ];

        contentArea.innerHTML = `
            <div class="premium-dashboard" style="animation: entrance 0.8s var(--anim-spring) both;">
                
                <!-- ===== HERO SECTION ===== -->
                <div class="hero-section" style="min-height: 400px; background: linear-gradient(to right, var(--bg-main), rgba(var(--primary-blue-rgb), 0.1)), url('./hero_mosque_night_1777635162540.png'); background-size: cover; background-position: center; border-radius: 24px; padding: var(--side-padding); margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; border: 1px solid var(--border-color);">
                    
                    <!-- Jummah Bubble - Adaptive positioning (Friday Only) -->
                    ${new Date().getDay() === 5 ? `
                    <div class="glass-card" style="position: absolute; top: 1.5rem; right: 1.5rem; padding: 0.75rem 1.25rem; border-radius: 16px; display: flex; align-items: center; gap: 1rem; border: 1px solid var(--border-color); box-shadow: var(--shadow-premium); z-index: 10; max-width: calc(100% - 3rem);">
                        <div style="font-size: 1.2rem;">🕌</div>
                        <div style="overflow: hidden;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t('jummah_mubarak')}</div>
                            <div style="font-size: 0.6rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t('jummah_kahf_reminder')}</div>
                        </div>
                    </div>
                    ` : ''}

                    <div style="max-width: 600px; position: relative; z-index: 1;">
                        <span style="color: var(--accent-gold); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.75rem; display: block;">Find Peace. Stay Connected.</span>
                        <h1 class="serif" style="font-size: clamp(1.75rem, 6vw, 3.5rem); color: var(--text-primary); margin-bottom: 1.25rem; line-height: 1.1; font-weight: 900;">Your Journey to<br>Peace and Purpose</h1>
                        <p style="color: var(--text-secondary); font-size: clamp(0.85rem, 2vw, 1rem); line-height: 1.6; margin-bottom: 2.5rem; opacity: 0.9;">Salafiyah is your all-in-one companion for a stronger connection with Allah — guiding your intention, actions, and reflection.</p>
                        
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button class="btn-primary" onclick="window.app.loadScreen('toolkit')" style="padding: 0.9rem 2rem; border-radius: 14px; font-weight: 700; min-width: 160px;">Start Your Journey</button>
                            <button class="btn-secondary" onclick="window.app.loadScreen('learn')" style="background: transparent; border: 2px solid var(--primary-blue); color: var(--primary-blue); padding: 0.9rem 2rem; border-radius: 14px; font-weight: 700; min-width: 140px;">Explore</button>
                        </div>
                    </div>
                </div>

                <!-- ===== VERSE OF THE DAY ===== -->
                <div class="glass-card" style="position: relative; overflow: hidden; padding: 2.5rem; margin-bottom: 1.5rem;">
                    <div style="background-image: url('https://www.transparenttextures.com/patterns/islamic-art.png'); opacity: 0.03; position: absolute; inset: 0;"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="width: 32px; height: 32px; background: rgba(var(--primary-blue-rgb), 0.1); color: var(--primary-blue); border-radius: 8px; display: flex; align-items: center; justify-content: center;">✨</div>
                            <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em;">Verse of the Day</span>
                        </div>
                        <div id="verse-content" style="color: var(--text-primary);">
                            <div class="loading-spinner" style="border-top-color: var(--primary-blue);"></div>
                        </div>
                    </div>
                </div>

                <!-- ===== MAIN GRID ROW 1 ===== -->
                <div class="grid-4-cols">
                    <!-- Prayer Times -->
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                Prayer Times
                            </div>
                            <span style="font-size: 0.65rem; color: var(--text-muted);">${hijriDate}</span>
                        </div>
                        <div class="prayer-list">
                            ${prayerTimes.map(p => `
                                <div class="prayer-item ${p.active ? 'active' : ''}" style="color: ${p.active ? 'var(--accent-emerald)' : 'var(--text-secondary)'}">
                                    <span>${p.name}</span>
                                    <span style="font-weight: 700;">${p.time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Daily Dhikr -->
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            Daily Dhikr
                        </div>
                        <div style="display: flex; gap: 1.5rem; justify-content: center;">
                            <div class="circular-progress" style="--p: ${state.tracker.tasks.morning_adhkar ? 100 : 0};">
                                <svg viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="36"/><circle class="progress" cx="40" cy="40" r="36" style="stroke: var(--primary-blue)"/></svg>
                                <div class="value" style="color: var(--text-primary)">${state.tracker.tasks.morning_adhkar ? '100%' : '0%'}</div>
                                <div style="font-size: 0.55rem; color: var(--text-muted); text-align: center; margin-top: 5px;">Morning</div>
                            </div>
                            <div class="circular-progress" style="--p: ${state.tracker.tasks.evening_adhkar ? 100 : 0};">
                                <svg viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="36"/><circle class="progress" cx="40" cy="40" r="36" style="stroke: #8b5cf6;"/></svg>
                                <div class="value" style="color: var(--text-primary)">${state.tracker.tasks.evening_adhkar ? '100%' : '0%'}</div>
                                <div style="font-size: 0.55rem; color: var(--text-muted); text-align: center; margin-top: 5px;">Evening</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.app.loadScreen('tracker')" style="width: 100%; margin-top: 1.5rem; justify-content: center; background: transparent; border: 1.5px solid var(--border-color); color: var(--text-primary); padding: 0.75rem;">Open Tracker</button>
                    </div>

                    <!-- Quran Progress -->
                    <div class="glass-card" style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Quran Progress
                        </div>
                        <div style="font-size: 1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">Surah ${state.lastRead.surahName}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem;">${state.lastRead.type === 'mushaf' ? 'Page ' + state.lastRead.page : 'Ayah ' + state.lastRead.ayahNum}</div>
                        <div style="height: 6px; background: var(--border-color); border-radius: 3px; margin-bottom: 1.5rem; overflow: hidden;">
                            <div style="width: ${((state.lastRead.page || 1) / 604) * 100}%; height: 100%; background: var(--primary-blue); border-radius: 3px;"></div>
                        </div>
                        <button class="btn-primary" onclick="window.app.loadScreen('${state.lastRead.type}')" style="width: 100%; justify-content: center; padding: 0.75rem;">Continue</button>
                    </div>

                    <!-- Calendar -->
                    <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            Islamic Calendar
                        </div>
                        <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">${hijriDate}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.5rem;">${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        
                        <div style="margin-top: auto;">
                            <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem;">Upcoming Fasts</div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
                                    <span>Ayyam al-Bidh (13th)</span>
                                    <span style="font-weight: 700; color: var(--accent-gold);">May 12</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
                                    <span>Sunnah Monday</span>
                                    <span style="font-weight: 700; color: var(--accent-gold);">May 4</span>
                                </div>
                            </div>
                        </div>

                        <button class="btn-primary" onclick="window.app.loadScreen('calendar')" style="width: 100%; margin-top: 1.5rem; justify-content: center; background: transparent; border: 1.5px solid var(--border-color); color: var(--text-primary); padding: 0.75rem;">View Calendar</button>
                    </div>
                </div>

                <!-- ===== QUICK ACTIONS ===== -->
                <div class="grid-4-cols">
                    <div class="glass-card" style="padding: 1.5rem; grid-column: span 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem;">Insights</div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-emerald);">92%</div><div style="font-size: 0.5rem; color: var(--text-muted);">Prayer</div></div>
                            <div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">68%</div><div style="font-size: 0.5rem; color: var(--text-muted);">Dhikr</div></div>
                            <div style="text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">7</div><div style="font-size: 0.5rem; color: var(--text-muted);">Streak</div></div>
                        </div>
                    </div>
                    <div class="glass-card" style="padding: 1.5rem; grid-column: span 3;">
                        <div class="quick-actions-grid">
                            <div class="action-item" onclick="window.app.loadScreen('qibla')">
                                <div class="action-icon qibla">🧭</div>
                                <div class="action-label">Qibla</div>
                            </div>
                            <div class="action-item" onclick="window.app.loadScreen('tasbih')">
                                <div class="action-icon tasbih">📿</div>
                                <div class="action-label">Tasbih</div>
                            </div>
                            <div class="action-item" onclick="window.app.loadScreen('duas')">
                                <div class="action-icon duas">🤲</div>
                                <div class="action-label">Duas</div>
                            </div>
                            <div class="action-item" onclick="window.app.loadScreen('toolkit')">
                                <div class="action-icon toolkit">🛠️</div>
                                <div class="action-label">Toolkit</div>
                            </div>
                            <div class="action-item" onclick="window.app.loadScreen('zakat')">
                                <div class="action-icon zakat">💰</div>
                                <div class="action-label">Zakat</div>
                            </div>
                            <div class="action-item" onclick="window.app.loadScreen('learn')">
                                <div class="action-icon learn">🎓</div>
                                <div class="action-label">Learn</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== DAILY INSPIRATION BANNER ===== -->
                <div class="glass-card" style="padding: 2rem; background: var(--bg-card); display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; border: 1px solid var(--border-color);">
                    <div style="grid-column: 1 / -1; margin-bottom: -1rem;">
                        <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--accent-gold); font-size: 1.2rem;">☀</span> Daily Inspiration
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Tafsir</div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">And whoever relies upon Allah — then He is sufficient for him.</p>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Quote</div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">"The soul finds rest in the remembrance of Allah."</p>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Tip</div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">Start your day with Fajr, seek knowledge, and end your day with reflection.</p>
                    </div>
                </div>
            </div>
        `;

        // Render verse content after template is set
        const dayIdx = new Date().getDate() % CURATED_VERSES.length;
        renderVerseContent(CURATED_VERSES[dayIdx]);
        fetchRandomVerse();
    } catch (err) {
        console.error('Dashboard Render Error:', err);
    }
}

// Curated pool of beautiful Ayahs — shown instantly, no API needed
const CURATED_VERSES = [
    {
        surahNum: 2,
        ayahNum: 286,
        arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
        translation: 'Allah does not burden a soul beyond that it can bear.',
        ref: 'Al-Baqarah 2:286'
    },
    {
        surahNum: 94,
        ayahNum: 6,
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Indeed, with hardship [will be] ease.',
        ref: 'Ash-Sharh 94:6'
    }
];

function renderVerseContent(v) {
    const container = document.getElementById('verse-content');
    if (!container) return;
    container.innerHTML = `
        <div style="font-family:'Amiri',serif; font-size:1.8rem; line-height:1.4; color:var(--text-primary); margin-bottom:1rem; direction:rtl;">${v.arabic}</div>
        <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1rem;">${v.translation}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.05em;">— ${v.ref}</span>
            <button id="verse-audio-btn" class="dhikr-chip" onclick="window.app.playVOTDAudio(${v.surahNum}, ${v.ayahNum})" style="background:var(--primary-blue); border:none; color:#fff; font-size:0.7rem; padding:0.4rem 1rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Listen
            </button>
        </div>
    `;
}

function playVOTDAudio(surahNum, ayahNum) {
    const playBtn = document.getElementById('verse-audio-btn');

    if (verseAudio && verseAudioPlaying) {
        verseAudio.pause();
        verseAudioPlaying = false;
        if (playBtn) {
            playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Listen`;
        }
        return;
    }

    if (playBtn) playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="3" fill="none" stroke-dasharray="31" stroke-dashoffset="10"/></svg> Loading...`;

    const s = String(surahNum).padStart(3, '0');
    const a = String(ayahNum).padStart(3, '0');
    const surahOffsets = [0, 0, 7, 293, 493, 669, 789, 954, 1160, 1235, 1364, 1473, 1596, 1707, 1750, 1802, 1901, 2029, 2140, 2250, 2348, 2483, 2595, 2673, 2791, 2855, 2932, 3159, 3252, 3340, 3409, 3469, 3503, 3533, 3602, 3660, 3705, 3788, 3970, 4058, 4133, 4218, 4272, 4325, 4414, 4473, 4510, 4545, 4583, 4612, 4630, 4675, 4735, 4784, 4846, 4901, 4979, 5075, 5104, 5126, 5150, 5163, 5177, 5188, 5199, 5217, 5229, 5241, 5271, 5323, 5375, 5419, 5447, 5475, 5495, 5551, 5591, 5622, 5672, 5712, 5758, 5800, 5829, 5848, 5884, 5909, 5931, 5948, 5960, 5981, 5995, 6008, 6023, 6043, 6057, 6065, 6083, 6090, 6098, 6106, 6125, 6130, 6138, 6146, 6157, 6168, 6176, 6179, 6188, 6193, 6197, 6204, 6207, 6213, 6216, 6221, 6225, 6230, 6236];
    const globalAyah = (surahOffsets[surahNum] || 0) + ayahNum;
    const sources = [
        `https://audio.qurancdn.com/Alafasy/128/${s}${a}.mp3`,
        `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyah}.mp3`
    ];

    if (!verseAudio) verseAudio = new Audio();
    verseAudio.pause();
    verseAudio.src = '';

    function trySource(index) {
        if (index >= sources.length) {
            console.error("VOTD Audio: All sources failed.");
            if (playBtn) playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2"/></svg> Error`;
            setTimeout(() => { if (playBtn) playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Listen`; }, 2500);
            return;
        }

        verseAudio.src = sources[index];
        verseAudio.load();
        verseAudio.play()
            .then(() => {
                verseAudioPlaying = true;
                if (playBtn) playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
            })
            .catch((err) => {
                console.warn(`VOTD Audio: Source ${index} failed (${sources[index]}), trying next...`);
                trySource(index + 1);
            });
    }

    verseAudio.onended = () => {
        verseAudioPlaying = false;
        if (playBtn) playBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Listen`;
    };
    trySource(0);
}

function renderStreakCard() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;

    return `
        <div class="streak-card glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(var(--primary-blue-rgb), 0.03); border: none; box-shadow: none;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; background: rgba(20, 184, 166, 0.2); color: #14b8a6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                        💧
                    </div>
                    <div>
                        <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); opacity: 0.8;">Your Current Streak</div>
                        <div style="display: flex; align-items: baseline; gap: 0.3rem;">
                            <span style="font-size: 1.75rem; font-weight: 900; color: var(--text-primary);">${state.streak || 0}</span>
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); opacity: 0.6;">days</span>
                        </div>
                    </div>
                </div>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary-blue); cursor: pointer;" onclick="window.app.loadScreen('tracker')">View Progress →</span>
            </div>
            
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0; opacity: 0.8;">Keep it up! You're doing great.</p>

            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem;">
                ${days.map((day, i) => {
        const isDone = i < adjustedToday || (i === adjustedToday && Object.values(state.tracker.tasks).some(v => v === true));
        return `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted);">${day}</span>
                            <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid ${isDone ? '#14b8a6' : 'rgba(0,0,0,0.1)'}; background: ${isDone ? '#14b8a6' : 'transparent'}; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                                ${isDone ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

async function fetchRandomVerse() {
    const dayIndex = new Date().getDate() % CURATED_VERSES.length;
    const curatedVerse = CURATED_VERSES[dayIndex];
    renderVerseContent(curatedVerse);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const randomAyah = Math.floor(Math.random() * 6236) + 1;
        const res = await fetch(
            `https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,${state.settings.translationEdition}`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await res.json();

        if (data?.code === 200 && data.data?.length >= 2) {
            const arabicData = data.data[0];
            const transData = data.data[1];
            const liveVerse = {
                surahNum: arabicData.surah.number,
                ayahNum: arabicData.numberInSurah,
                arabic: arabicData.text,
                translation: transData.text,
                ref: `${arabicData.surah.englishName} ${arabicData.surah.number}:${arabicData.numberInSurah}`
            };
            renderVerseContent(liveVerse);
        }
    } catch (e) {
        console.info('Using curated verse (API unavailable)');
    }
}

function speakArabic(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

function renderStreakCard() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    const tasksDone = Object.values(state.tracker.tasks).some(v => v === true);

    return `
        <div class="streak-card glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; animation-delay: 0.4s;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 44px; height: 44px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; border: 1px solid rgba(16, 185, 129, 0.2);">
                        💧
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Spiritual Progress</div>
                        <div style="display: flex; align-items: baseline; gap: 0.3rem;">
                            <span style="font-size: 1.6rem; font-weight: 950; color: var(--text-primary); line-height: 1;">${state.streak || 0}</span>
                            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); opacity: 0.7;">days</span>
                        </div>
                    </div>
                </div>
                <button class="dhikr-chip" style="margin: 0; padding: 0.6rem 1rem; font-size: 0.75rem; border: none; background: var(--accent-primary); color: #fff;" onclick="window.app.loadScreen('goals')">
                    Explore →
                </button>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-top: 1px solid var(--glass-border); padding-top: 1.25rem;">
                ${days.map((day, i) => {
        let cls = '';
        let icon = day;
        if (i === adjustedToday) {
            cls = tasksDone ? 'checked' : 'active';
            if (tasksDone) icon = '✓';
        } else if (i < adjustedToday) {
            cls = 'checked';
            icon = '✓';
        }
        return `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.6rem; flex: 1;">
                            <span style="font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; opacity: 0.8;">${day}</span>
                            <div class="streak-day-circle ${cls}" style="width: 34px; height: 34px; font-size: 0.8rem;">${icon}</div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

function renderGoals() {
    const progress = state.goals.mushaf.progress;
    const total = state.goals.mushaf.total;
    const percent = Math.round((progress / total) * 100);

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <div class="btn-back" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
            
            <div class="glass-card" style="margin-bottom: 2rem; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="section-title" style="margin: 0;">Daily Progress</h3>
                    <div class="dhikr-chip active">🔥 ${state.streak || 0} Day Streak</div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span>Holy Quran Progress</span>
                        <span style="font-weight: 800; color: var(--accent-gold);">${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: var(--gemini-sparkle); transition: width 1s ease;"></div>
                    </div>
                    <p style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.6;">You have read ${progress} of ${total} pages.</p>
                </div>

                <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="glass-card" style="padding: 1rem; text-align: center; background: rgba(var(--primary-blue-rgb), 0.05);">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📖</div>
                        <div style="font-weight: 800; font-size: 1.2rem;">${progress}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6;">Pages Read</div>
                    </div>
                    <div class="glass-card" style="padding: 1rem; text-align: center; background: rgba(245, 158, 11, 0.05);">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🏆</div>
                        <div style="font-weight: 800; font-size: 1.2rem;">${state.quiz?.score || 0}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6;">Quiz Points</div>
                    </div>
                </div>
            </div>

            <div class="sakinah-card" style="background: var(--gemini-sparkle); color: #fff;" onclick="window.app.loadScreen('quiz')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: #fff; margin-bottom: 0.25rem;">Daily Islamic Quiz</h3>
                        <p style="opacity: 0.8; font-size: 0.85rem;">Test your knowledge and earn rewards.</p>
                    </div>
                    <div style="font-size: 2rem;">🏆</div>
                </div>
            </div>
        </div>
    `;
}

function renderCustomization() {
    const colors = [
        { name: 'Default', hex: '#006994' },
        { name: 'Emerald', hex: '#10b981' },
        { name: 'Indigo', hex: '#6366f1' },
        { name: 'Rose', hex: '#f43f5e' },
        { name: 'Amber', hex: '#f59e0b' },
        { name: 'Violet', hex: '#8b5cf6' },
        { name: 'Teal', hex: '#14b8a6' },
        { name: 'Gold', hex: '#C5A059' }
    ];

    const themes = [
        { id: 'default', name: 'Ocean Blue', grad: 'linear-gradient(135deg,#006994,#00b4cc)' },
        { id: 'serenity', name: 'Serenity', grad: 'linear-gradient(135deg,#5b8ea6,#8ab4c2)' },
        { id: 'desert', name: 'Desert Gold', grad: 'linear-gradient(135deg,#c8853a,#d4a84b)' },
        { id: 'night', name: 'Night Sky', grad: 'linear-gradient(135deg,#7c6dc8,#c4a8e8)' },
        { id: 'forest', name: 'Forest', grad: 'linear-gradient(135deg,#3d8b5b,#8ab86f)' },
        { id: 'ramadan', name: 'Ramadan', grad: 'linear-gradient(135deg,#2d1b4e,#FFD700)' }
    ];

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both; max-width: 800px; margin: 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <h2 class="serif" style="font-size: 2rem; color: var(--primary-blue);">App Appearance</h2>
                <button class="btn-back" onclick="window.app.loadScreen('dashboard')">Done</button>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem; padding: 2rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">🎨 Theme Preset</h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.5rem;">Choose a complete visual style</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
                    ${themes.map(th => `
                        <div onclick="window.app.applyUITheme('${th.id}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:0.6rem; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform=''">
                            <div style="width:56px; height:56px; border-radius:16px; background:${th.grad}; border:4px solid ${(state.settings.uiTheme || 'default') === th.id ? 'var(--text-primary)' : 'transparent'}; box-shadow:0 4px 16px rgba(0,0,0,0.18); transition:all 0.3s ease;"></div>
                            <span style="font-size:0.72rem; font-weight:700; color:var(--text-secondary); text-align:center;">${th.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem; padding: 2rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">👁️ Read Mode</h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.5rem;">Eye & health protection while reading Quran. Warm tones, larger text, eye-rest reminders.</p>
                <button class="dhikr-chip ${state.settings.readMode ? 'active' : ''}" onclick="window.app.toggleReadMode()" style="width: 100%; padding: 1rem; border-radius: 14px; font-size: 0.9rem;">
                    ${state.settings.readMode ? '🟢 Read Mode ON — Click to Disable' : '🟡 Enable Read Mode'}
                </button>
                ${state.settings.readMode ? `
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(184,134,11,0.1); border-radius: 12px; border: 1px solid rgba(184,134,11,0.2);">
                    <p style="font-size: 0.8rem; color: var(--accent-gold); margin: 0;">👁️ Read Mode active — Warm background, larger Arabic, 20-20-20 eye breaks every 20 min.</p>
                </div>` : ''}
            </div>

            <div class="glass-card" style="margin-bottom: 2rem; padding: 2rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    Theme Accent Color
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1.5rem;">
                    ${colors.map(c => `
                        <div onclick="window.app.updateAccentColor('${c.hex}')" style="cursor:pointer; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; transition: transform 0.2s ease;">
                            <div style="width: 56px; height: 56px; background: ${c.hex}; border-radius: 16px; border: 4px solid ${state.settings.accentColor === c.hex ? 'var(--text-primary)' : 'transparent'}; box-shadow: var(--shadow-soft);"></div>
                            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">${c.name}</span>
                        </div>
                    `).join('')}
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                        <input type="color" value="${state.settings.accentColor}" onchange="window.app.updateAccentColor(this.value)" style="width: 56px; height: 56px; border-radius: 16px; border: none; cursor: pointer; background: transparent;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Custom</span>
                    </div>
                </div>
            </div>

            <div class="glass-card" style="padding: 2rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Interface Format
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div onclick="window.app.updateDensity('compact')" class="dhikr-chip ${state.settings.uiDensity === 'compact' ? 'active' : ''}" style="padding: 1.5rem; flex-direction: column; height: auto;">
                        <span style="font-size: 1.2rem; margin-bottom: 0.5rem;">📱</span>
                        <span style="font-weight: 800;">Compact</span>
                        <span style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.25rem;">Best for small phones</span>
                    </div>
                    <div onclick="window.app.updateDensity('regular')" class="dhikr-chip ${state.settings.uiDensity === 'regular' ? 'active' : ''}" style="padding: 1.5rem; flex-direction: column; height: auto;">
                        <span style="font-size: 1.2rem; margin-bottom: 0.5rem;">✨</span>
                        <span style="font-weight: 800;">Regular</span>
                        <span style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.25rem;">The default experience</span>
                    </div>
                    <div onclick="window.app.updateDensity('spacious')" class="dhikr-chip ${state.settings.uiDensity === 'spacious' ? 'active' : ''}" style="padding: 1.5rem; flex-direction: column; height: auto;">
                        <span style="font-size: 1.2rem; margin-bottom: 0.5rem;">📖</span>
                        <span style="font-weight: 800;">Spacious</span>
                        <span style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.25rem;">Best for tablets & foldables</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(var(--primary-blue-rgb), 0.05); border-radius: 20px; border: 1px dashed var(--primary-blue); text-align: center;">
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Changes are applied instantly. Your theme is saved to your account.</p>
            </div>
        </div>
    `;
}

function updateAccentColor(hex) {
    state.settings.accentColor = hex;
    localStorage.setItem('accent_color', hex);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    applyCustomization();
    renderCustomization();
    syncUserData();
}

function updateDensity(density) {
    state.settings.uiDensity = density;
    localStorage.setItem('ui_density', density);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    applyCustomization();
    renderCustomization();
}

function applyUITheme(themeId) {
    const themeClasses = ['theme-serenity', 'theme-desert', 'theme-night', 'theme-forest', 'ramadan-mode'];
    themeClasses.forEach(c => document.body.classList.remove(c));
    const themeMap = {
        serenity: 'theme-serenity', desert: 'theme-desert',
        night: 'theme-night', forest: 'theme-forest', ramadan: 'ramadan-mode'
    };
    if (themeMap[themeId]) document.body.classList.add(themeMap[themeId]);
    state.settings.uiTheme = themeId;
    localStorage.setItem('ui_theme', themeId);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    renderCustomization();
}

function toggleReadMode() {
    state.settings.readMode = !state.settings.readMode;
    localStorage.setItem('read_mode', state.settings.readMode);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    if (state.settings.readMode) {
        document.body.classList.add('read-mode');
        startEyeBreakTimer();
    } else {
        document.body.classList.remove('read-mode');
        if (window.eyeBreakInterval) clearInterval(window.eyeBreakInterval);
    }
    renderCustomization();
}

function startEyeBreakTimer() {
    if (window.eyeBreakInterval) clearInterval(window.eyeBreakInterval);
    let minutes = 20;
    window.eyeBreakInterval = setInterval(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;';
        overlay.innerHTML = `
            <div style="font-size:4rem">👁️</div>
            <h2 style="color:#f0e6d0;font-family:Amiri,serif;font-size:2rem;">20-20-20 Eye Break</h2>
            <p style="color:rgba(255,255,255,0.8);text-align:center;max-width:360px;line-height:1.6;">Look at something 20 feet away for 20 seconds.<br>Rest your eyes and say Bismillah.</p>
            <div id="eye-countdown" style="font-size:3rem;font-weight:900;color:#f59e0b;">20</div>
            <p style="color:rgba(255,255,255,0.5);font-size:0.8rem;">Auto-closing in 20 seconds</p>
        `;
        document.body.appendChild(overlay);
        let sec = 20;
        const countdown = setInterval(() => {
            sec--;
            const el = document.getElementById('eye-countdown');
            if (el) el.textContent = sec;
            if (sec <= 0) { clearInterval(countdown); overlay.remove(); }
        }, 1000);
    }, minutes * 60 * 1000);
}


function renderLanguages() {
    const uiLanguages = [
        { id: 'en', name: 'English', native: 'English' },
        { id: 'ar', name: 'Arabic', native: 'العربية' },
        { id: 'ur', name: 'Urdu', native: 'اردو' },
        { id: 'fr', name: 'French', native: 'Français' },
        { id: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' }
    ];

    const translations = [
        { id: 'en.asad', name: 'Muhammad Asad', lang: 'English' },
        { id: 'en.sahih', name: 'Sahih International', lang: 'English' },
        { id: 'en.pickthall', name: 'Marmaduke Pickthall', lang: 'English' },
        { id: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn', lang: 'Arabic' },
        { id: 'ar.muyassar', name: 'Al-Muntakhab', lang: 'Arabic' },
        { id: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', lang: 'Urdu' },
        { id: 'ur.ahmedali', name: 'Maulana Ahmed Ali', lang: 'Urdu' },
        { id: 'fr.hamidullah', name: 'Muhammad Hamidullah', lang: 'French' },
        { id: 'id.indonesian', name: 'Bahasa Indonesia', lang: 'Indonesian' }
    ];

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both; padding-bottom: 3rem;">
            <button class="btn-back" onclick="window.app.loadScreen('dashboard')">← Dashboard</button>
            
            <div class="glass-card" style="margin-bottom: 2.5rem; padding: 2.5rem; text-align: center; background: linear-gradient(135deg, rgba(var(--primary-blue-rgb), 0.1), transparent); border: 1px solid var(--border-color);">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">🌐</div>
                <h2 style="font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">Language & Translation</h2>
                <p style="color: var(--text-secondary); opacity: 0.8;">Personalize your spiritual experience</p>
            </div>

            <!-- UI Language Section -->
            <div style="margin-bottom: 3rem;">
                <h3 class="section-title" style="margin-bottom: 1.5rem;">Interface Language</h3>
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    ${uiLanguages.map(lang => `
                        <div class="glass-card dhikr-chip ${state.settings.uiLanguage === lang.id ? 'active' : ''}" 
                             onclick="window.app.setLanguage('${lang.id}')"
                             style="justify-content: space-between; padding: 1.25rem 1.75rem; width: 100%; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                                <span style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${lang.name}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.7;">${lang.native}</span>
                            </div>
                            ${state.settings.uiLanguage === lang.id ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 10px var(--accent-emerald);"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Quran Translation Section -->
            <div>
                <h3 class="section-title" style="margin-bottom: 1.5rem;">Quran Translation</h3>
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    ${translations.map(tr => `
                        <div class="glass-card dhikr-chip ${state.settings.translationEdition === tr.id ? 'active' : ''}" 
                             onclick="window.app.setTranslation('${tr.id}')"
                             style="justify-content: space-between; padding: 1.25rem 1.75rem; width: 100%; border-radius: 20px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                                <span style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${tr.name}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.7;">${tr.lang}</span>
                            </div>
                            ${state.settings.translationEdition === tr.id ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-gold); box-shadow: 0 0 10px var(--accent-gold);"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function setTranslation(id) {
    state.settings.translationEdition = id;
    localStorage.setItem('translation_edition', id);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    renderLanguages(); // Refresh list to show active state
    alert('Translation updated successfully!');
}

function showLanguagePicker() {
    const languages = [
        { id: 'en', name: 'English', native: 'English' },
        { id: 'ar', name: 'Arabic', native: 'العربية' },
        { id: 'ur', name: 'Urdu', native: 'اردو' },
        { id: 'fr', name: 'French', native: 'Français' },
        { id: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'overlay-backdrop';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const modal = document.createElement('div');
    modal.className = 'glass-card';
    modal.style.width = '90%';
    modal.style.maxWidth = '400px';
    modal.style.padding = '2rem';
    modal.style.animation = 'scaleIn 0.3s var(--anim-spring) both';

    modal.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; text-align: center;">Select Language</h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${languages.map(lang => `
                <div class="dhikr-chip ${state.settings.uiLanguage === lang.id ? 'active' : ''}" 
                     onclick="window.app.setLanguage('${lang.id}')"
                     style="justify-content: space-between; padding: 1rem 1.5rem; width: 100%;">
                    <span>${lang.name}</span>
                    <span style="opacity: 0.5; font-size: 0.8rem;">${lang.native}</span>
                </div>
            `).join('')}
        </div>
        <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 2rem; justify-content: center;">Close</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function setLanguage(lang) {
    state.settings.uiLanguage = lang;
    localStorage.setItem('ui_language', lang);
    localStorage.setItem('app_settings', JSON.stringify(state.settings));

    // Refresh UI
    location.reload(); // Quickest way to re-init everything with new language
}

function renderCalendar() {
    const screenTitle = document.getElementById('screen-title');
    screenTitle.textContent = "Islamic Calendar";

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Get month details
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('default', { month: 'long' });

    // Hijri Info
    const hijri = state.hijri;

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('dashboard')">← Dashboard</button>
            
            <div class="glass-card" style="margin-bottom: 2rem; padding: 2.5rem; text-align: center; background: linear-gradient(135deg, rgba(var(--primary-blue-rgb), 0.1), transparent); border: 1px solid var(--border-color);">
                <div style="font-size: 0.85rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1rem;">Current Date</div>
                <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">${hijri.day} ${hijri.month.en} ${hijri.year}</h2>
                <p style="color: var(--text-secondary); opacity: 0.8; font-weight: 600;">${monthName} ${year}</p>
            </div>

            <div class="glass-card" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800;">${monthName} ${year}</h3>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="dhikr-chip" style="padding: 0.6rem 1rem;">←</button>
                        <button class="dhikr-chip" style="padding: 0.6rem 1rem;">→</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; text-align: center;">
                    ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => `
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; letter-spacing: 0.1em;">${d}</div>
                    `).join('')}
                    
                    ${Array(firstDay).fill(null).map(() => `<div></div>`).join('')}
                    
                    ${Array(daysInMonth).fill(null).map((_, i) => {
        const day = i + 1;
        const isToday = day === now.getDate();
        // Example highlights for Sunnah fasts
        const isSunnah = (new Date(year, month, day).getDay() === 1 || new Date(year, month, day).getDay() === 4);
        const isWhiteDay = [13, 14, 15].includes(day); // Approx for demo

        return `
                            <div style="aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-radius: 16px; background: ${isToday ? 'var(--primary-blue)' : 'rgba(255,255,255,0.03)'}; color: ${isToday ? '#fff' : 'var(--text-primary)'}; border: 1px solid ${isToday ? 'var(--primary-blue)' : 'var(--glass-border)'}; cursor: pointer; transition: all 0.2s ease;">
                                <span style="font-weight: 800; font-size: 1rem;">${day}</span>
                                ${isSunnah || isWhiteDay ? `<div style="position: absolute; bottom: 6px; width: 4px; height: 4px; border-radius: 50%; background: ${isToday ? '#fff' : 'var(--accent-gold)'};"></div>` : ''}
                            </div>
                        `;
    }).join('')}
                </div>
            </div>

            <div class="glass-card" style="margin-top: 2rem;">
                <h3 class="section-title">Key Spiritual Dates</h3>
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: rgba(245, 158, 11, 0.15); color: var(--accent-gold); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">✨</div>
                        <div>
                            <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary);">Ayyam al-Bidh (White Days)</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">Recommended fasting on 13, 14, and 15 of each lunar month.</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🌙</div>
                        <div>
                            <div style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary);">Monday & Thursday Sunnah</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">The Prophet (PBUH) used to fast on these days.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDuas(selectedCat = 'all') {
    const screenTitle = document.getElementById('screen-title');
    screenTitle.textContent = "Duas & Supplications";

    const categories = [
        { id: 'all', name: 'All Duas', icon: '✨' },
        { id: 'daily', name: 'Daily', icon: '☀️' },
        { id: 'salah', name: 'After Salah', icon: '📿' },
        { id: 'protection', name: 'Protection', icon: '🛡️' },
        { id: 'travel', name: 'Travel', icon: '✈️' },
        { id: 'comfort', name: 'Comfort', icon: '🤲' },
        { id: 'parents', name: 'Parents', icon: '❤️' }
    ];

    const duas = [
        {
            cat: 'daily',
            title: 'Waking Up',
            arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
            translit: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilaihin-nushur',
            trans: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.'
        },
        {
            cat: 'daily',
            title: 'Sayyidul Istighfar (Chief Forgiveness)',
            arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
            translit: 'Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika mastata\'tu, a\'udhu bika min sharri ma sana\'tu, abu\'u laka bini\'matika \'alayya, wa abu\'u laka bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta',
            trans: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.'
        },
        {
            cat: 'parents',
            title: 'For Parents',
            arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
            translit: 'Rabbir-hamhuma kama rabbayani saghira',
            trans: 'My Lord, have mercy upon them as they brought me up [when I was] small.'
        },
        {
            cat: 'protection',
            title: 'Morning/Evening Protection',
            arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
            translit: 'Bismillahi-lladhi la yadurru ma\'as-mihi shai\'un fil-ardi wa la fis-sama\'i wa Huwas-Sami\'ul-\'Alim',
            trans: 'In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.'
        },
        {
            cat: 'travel',
            title: 'Travel Dua',
            arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
            translit: 'Subhanalladhi sakh-khara lana hadha wa ma kunna lahu muqrineen. Wa inna ila Rabbina lamunqaliboon',
            trans: 'Glory is to Him who has subjected this to us, and we could not have [otherwise] subdued it. And indeed we, to our Lord, will surely return.'
        },
        {
            cat: 'comfort',
            title: 'Dua of Prophet Yunus',
            arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
            translit: 'La ilaha illa Anta subhanaka inni kuntu minaz-zalimin',
            trans: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.'
        },
        {
            cat: 'salah',
            title: 'After Salah (Tasbih)',
            arabic: 'سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (33x)',
            translit: 'SubhanAllah, AlHamdulillah, AllahuAkbar',
            trans: 'Glory be to Allah, Praise be to Allah, Allah is the Greatest.'
        }
    ];

    const filtered = selectedCat === 'all' ? duas : duas.filter(d => d.cat === selectedCat);

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
                <button class="btn-back" onclick="window.app.loadScreen('dashboard')">← Dashboard</button>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${filtered.length} Supplications</div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 2rem; padding: 1.5rem; border-radius: 20px;">
                <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;" class="hide-scrollbar">
                    ${categories.map(c => `
                        <button class="dhikr-chip" 
                            onclick="window.app.renderDuas('${c.id}')"
                            style="white-space: nowrap; padding: 0.75rem 1.25rem; ${selectedCat === c.id ? 'background: var(--primary-blue); color: #fff;' : ''}">
                            <span>${c.icon}</span> ${c.name}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${filtered.length > 0 ? filtered.map(d => `
                    <div class="glass-card" style="padding: 2rem; transition: transform 0.3s ease; border-radius: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                            <span style="font-size: 0.7rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.1em; background: rgba(var(--accent-gold-rgb), 0.1); padding: 0.3rem 0.7rem; border-radius: 6px;">${d.title}</span>
                            <button class="icon-btn" onclick="window.app.shareContent('${d.title}', '${d.arabic}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                            </button>
                        </div>
                        <div style="font-family: 'Amiri', serif; font-size: 1.7rem; color: var(--text-primary); text-align: right; line-height: 1.8; margin-bottom: 1.5rem; direction: rtl;">${d.arabic}</div>
                        <div style="font-style: italic; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; border-left: 3px solid var(--primary-blue); padding-left: 1rem; opacity: 0.9;">${d.translit}</div>
                        <div style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 12px;">${d.trans}</div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 4rem 2rem; opacity: 0.5;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                        <p>No duas found in this category yet.</p>
                    </div>
                `}
            </div>

            <div style="margin-top: 3rem; text-align: center; opacity: 0.6; padding-bottom: 2rem;">
                <p style="font-size: 0.85rem;">Authentic supplications from <i>Hisnul Muslim</i> and Quran.</p>
            </div>
        </div>
    `;
}

function renderToolkitHub() {
    const tools = [
        { id: 'mushaf', name: t('mushaf'), icon: '📜', color: '#10b981', desc: 'Read Original Script' },
        { id: 'quran', name: t('quran'), icon: '📖', color: '#38bdf8', desc: 'Translation & Audio' },
        { id: 'tasbih', name: t('tasbih'), icon: '📿', color: '#fbbf24', desc: 'Track your Dhikr' },
        { id: 'tracker', name: t('tracker'), icon: '📈', color: '#818cf8', desc: 'Salah & Habits' },
        { id: 'qaza', name: t('qaza'), icon: '⏳', color: '#f43f5e', desc: 'Missed Prayers' },
        { id: 'zakat', name: t('zakat'), icon: '💰', color: '#10b981', desc: 'Wealth Obligation' },
        { id: 'quiz', name: t('quiz'), icon: '🎯', color: '#fbbf24', desc: 'Test Knowledge' },
        { id: 'bookmarks', name: t('bookmarks'), icon: '🔖', color: '#f472b6', desc: 'Saved Verses' },
        { id: 'qibla', name: t('qibla'), icon: '🧭', color: '#38bdf8', desc: 'Find Direction' },
        { id: 'learn', name: t('learn'), icon: '✨', color: '#818cf8', desc: 'Basics & Guides' },
        { id: 'nearby', name: t('nearby'), icon: '📍', color: '#f43f5e', desc: 'Mosques & Halal' },
        { id: 'ask', name: t('nav_ask'), icon: '💬', color: '#10b981', desc: 'Instant Answers' },
        { id: 'customization', name: 'App Appearance', icon: '🎨', color: '#f59e0b', desc: 'Theme & Colors' },
        { id: 'settings', name: t('settings'), icon: '⚙️', color: '#64748b', desc: 'Location & Calc' }
    ];

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <div style="margin-bottom: 2.5rem; text-align: center;">
                <h2 style="font-size: 2.5rem; font-weight: 950; background: var(--gemini-sparkle); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; letter-spacing: -0.02em; filter: drop-shadow(0 0 20px rgba(0,242,254,0.15));">${t('toolkit_hub')}</h2>
                <p style="color: var(--text-secondary); font-weight: 600; font-size: 1rem; letter-spacing: 0.05em;">${t('spiritual_center')}</p>
            </div>

            <div class="toolkit-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1.25rem;">
                ${tools.map((tool, idx) => `
                    <div class="glass-card toolkit-card" onclick="window.app.loadScreen('${tool.id}')" style="padding: 1.75rem 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; cursor: pointer; transition: all 0.4s var(--anim-spring); animation: scaleIn 0.5s ease both; animation-delay: ${idx * 0.03}s; border-radius: 28px;">
                        <div class="tool-icon-wrapper" style="font-size: 2.5rem; background: ${tool.color}10; width: 72px; height: 72px; border-radius: 22px; display: flex; align-items: center; justify-content: center; border: 1px solid ${tool.color}25; box-shadow: 0 10px 25px -5px ${tool.color}15;">
                            ${tool.icon}
                        </div>
                        <div>
                            <div style="font-weight: 850; font-size: 1rem; color: var(--text-primary); margin-bottom: 4px;">${tool.name}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; line-height: 1.2; opacity: 0.8;">${tool.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 4rem; text-align: center; padding-bottom: 2rem;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.4;">Salafiyah Redesign 2.0</div>
            </div>
        </div>
    `;
}


function updateRamadanCountdown() {
    const countdownEl = document.getElementById('ramadan-countdown');
    if (!countdownEl) return;

    // Hardcoded target for demonstration or calc from Hijri
    const ramadanDate = new Date('2026-03-01T00:00:00'); // Example
    const now = new Date();
    const diff = ramadanDate - now;

    if (diff < 0) {
        countdownEl.textContent = "Ramadan Kareem!";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    countdownEl.textContent = `${days}d ${hours}h ${mins}m`;
}

function renderTasbih() {
    const currentPhrase = state.tasbih.currentPhrase;
    const count = state.tasbih.counts[currentPhrase] || 0;

    const recommendations = [
        { id: 'SubhanAllah', arabic: 'سُبْحَانَ اللهِ', roman: 'SubhanAllah' },
        { id: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah' },
        { id: 'AllahuAkbar', arabic: 'اللهُ أَكْبَرُ', roman: 'Allahu Akbar' },
        { id: 'LaIlahaIllallah', arabic: 'لَا إِلَهَ إِلَّا اللهُ', roman: 'La ilaha illallah' },
        { id: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللهَ', roman: 'Astaghfirullah' }
    ];

    contentArea.innerHTML = `
        <div class="btn-back" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
        
        <div class="glass-card" style="margin-bottom: 2rem;">
            <label style="display: block; font-size: 0.75rem; color: var(--accent-primary); text-transform: uppercase; margin-bottom: 0.8rem; letter-spacing: 0.1em; font-weight: 700;">${t('recitation_phrase')}</label>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                <input type="text" id="custom-dhikr-input" placeholder="Enter custom phrase..." value="${currentPhrase}" 
                       style="flex: 1; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 14px; color: var(--text-primary); outline: none; font-size: 0.95rem;">
                <button class="dhikr-chip active" onclick="window.app.applyCustomDhikr()" style="border-radius: 14px; padding: 0 1.5rem;">Set</button>
            </div>
            
            <label style="display: block; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.8rem; letter-spacing: 0.05em;">Recommended</label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${recommendations.map(r => `
                    <button class="dhikr-chip ${currentPhrase === r.roman ? 'active' : ''}" 
                            onclick="window.app.setAITasbih(\`${r.roman}\`)" 
                            style="font-size: 0.75rem; padding: 0.5rem 1rem;">
                        ${r.roman}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="tasbih-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0;">
            <div class="counter-circle" id="tasbih-btn" style="position: relative; overflow: hidden; transform-origin: center; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; z-index: 2; width: 100%; padding: 0 1rem;">
                    <div class="arabic-text" style="font-size: 1.8rem; line-height: 1.2; color: var(--primary-blue); margin-bottom: 0.5rem; display: block;">
                        ${recommendations.find(r => r.roman === currentPhrase)?.arabic || 'ذكر'}
                    </div>
                    <div class="counter-label" id="current-dhikr-label" style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">${currentPhrase}</div>
                    <div class="counter-value" id="counter-val" style="line-height: 1; font-size: 3.5rem;">${count}</div>
                </div>
                <!-- Interactive Glow -->
                <div style="position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%); opacity: 0.08; pointer-events: none;"></div>
            </div>
            
            <div style="margin-top: 3rem; width: 100%; display: flex; gap: 1rem; max-width: 280px;">
                <button class="dhikr-chip" onclick="window.app.resetTasbih()" style="opacity: 0.8; flex: 1; padding: 1rem; border-radius: 16px; border-color: rgba(239, 68, 68, 0.3); color: #ef4444;">Reset</button>
                <button class="dhikr-chip active" onclick="handleTasbihClick(event)" style="flex: 2; padding: 1rem; border-radius: 16px;">Count +1</button>
            </div>
        </div>
        
        <div style="margin-top: 2rem;">
            <p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; font-style: italic;">"Verily, in the remembrance of Allah do hearts find rest." (13:28)</p>
        </div>

        <div class="tasbih-ai-panel">
            <h4 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--primary-blue);">✨ AI Dhikr Generator</h4>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem;">Let AI suggest a personalized Dhikr phrase for your current spiritual state.</p>
            <div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem;">
                <input id="ai-tasbih-context" type="text" placeholder="e.g. feeling anxious, seeking forgiveness..." style="flex: 1; background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 0.75rem 1rem; border-radius: 12px; color: var(--text-primary); outline: none; font-size: 0.85rem; font-family: inherit;">
                <button class="dhikr-chip active" onclick="window.app.generateAITasbih()" style="border-radius: 12px; padding: 0 1.25rem; white-space: nowrap;">
                    Generate
                </button>
            </div>
            <div id="ai-tasbih-result"></div>
        </div>
    `;

    const btn = document.getElementById('tasbih-btn');

    // Unified Pointer Events to fix double-counting on Android
    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(0.96)';
    });

    btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        btn.style.transform = 'scale(1)';
        handleTasbihClick(e);
    });

    // Fallback for older browsers (rare but safe)
    if (!window.PointerEvent) {
        btn.onclick = (e) => handleTasbihClick(e);
    }
}

function applyCustomDhikr() {
    const input = document.getElementById('custom-dhikr-input');
    const newPhrase = input.value.trim() || 'SubhanAllah';
    state.tasbih.currentPhrase = newPhrase;
    localStorage.setItem('tasbih_current_phrase', newPhrase);
    renderTasbih();
}

async function generateAITasbih() {
    const context = document.getElementById('ai-tasbih-context')?.value?.trim() || 'general remembrance';
    const resultEl = document.getElementById('ai-tasbih-result');
    if (!resultEl) return;

    resultEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: rgba(var(--primary-blue-rgb),0.05); border-radius: 12px;">
            <div class="ai-loading-dots"><span></span><span></span><span></span></div>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Consulting AI for your Dhikr...</span>
        </div>`;

    try {
        const res = await fetch('/api/ai/tasbih', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context })
        });

        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        const phrase = data.phrase || '';
        const arabic = data.arabic || '';
        const meaning = data.meaning || '';

        resultEl.innerHTML = `
            <div class="ai-dhikr-result" style="animation: scaleIn 0.5s var(--anim-spring) both;">
                <div style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary-blue); margin-bottom: 0.75rem;">AI Recommendation</div>
                ${arabic ? `<div class="arabic-text" style="font-size: 1.8rem; margin-bottom: 1rem; color: var(--primary-blue);">${arabic}</div>` : ''}
                <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary);">${phrase}</div>
                ${meaning ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">${meaning}</div>` : ''}
                <button class="btn-primary" onclick="window.app.setAITasbih(\`${phrase.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" style="width: 100%; justify-content: center; border-radius: 14px;">
                    Apply This Dhikr
                </button>
            </div>`;
    } catch (e) {
        console.error("AI Generation failed", e);
        const fallbacks = [
            { phrase: 'SubhanAllahi wa bihamdihi', arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', meaning: 'Glory and praise be to Allah — lightens the heart' },
            { phrase: 'Hasbiyallahu la ilaha illa huwa', arabic: 'حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ', meaning: 'Allah is sufficient for me — for anxiety and worry' },
            { phrase: 'Astaghfirullah al-Adheem', arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ', meaning: 'Seeking forgiveness from Allah the Most Great' }
        ];
        const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        resultEl.innerHTML = `
            <div class="ai-dhikr-result">
                <div style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem;">Offline Suggestion</div>
                <div class="arabic-text" style="font-size: 1.6rem; margin-bottom: 0.75rem;">${pick.arabic}</div>
                <div style="font-weight: 700; margin-bottom: 0.4rem;">${pick.phrase}</div>
                <button class="dhikr-chip active" onclick="window.app.setAITasbih(\`${pick.phrase}\`)" style="width: 100%; border-radius: 12px; justify-content: center;">
                    Use This Dhikr
                </button>
            </div>`;
    }
}

function setAITasbih(phrase) {
    if (!phrase) return;
    const cleanPhrase = phrase.trim();
    state.tasbih.currentPhrase = cleanPhrase;
    localStorage.setItem('tasbih_current_phrase', cleanPhrase);
    if (!state.tasbih.counts[cleanPhrase]) state.tasbih.counts[cleanPhrase] = 0;
    localStorage.setItem('tasbih_counts', JSON.stringify(state.tasbih.counts));
    if (state.currentScreen !== 'tasbih') {
        loadScreen('tasbih');
    } else {
        renderTasbih();
    }
}

async function renderQuran() {
    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap: wrap; gap: 1rem;">
                <h2 class="serif" style="font-size:2rem; color:var(--primary-blue); margin:0;">The Noble Qur'an</h2>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <button class="dhikr-chip active" onclick="window.app.toggleReciterModal()" style="display: flex; align-items: center; gap: 0.5rem; background: var(--gemini-sparkle); color: #fff; border: none; padding: 0.6rem 1rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1v22M17 5H9.5a4.5 4.5 0 1 0 0 9H12M12 14v7"/></svg>
                        Reciter
                    </button>
                    <div class="search-bar" style="margin:0; width: 180px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                        <input type="text" placeholder="Search..." onkeyup="window.app.filterSurahList(this.value)">
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="margin-bottom: 2rem; padding: 1.5rem;">
                <h3 class="section-title" style="margin-bottom: 1.5rem;">Quran Explorer</h3>
                <div class="search-bar" style="display: flex; gap: 0.8rem;">
                    <div style="flex: 1; position: relative;">
                        <input type="text" placeholder="Search Surahs or Words..." id="quran-search-input" style="width: 100%; padding: 1rem 1.2rem 1rem 3rem; border-radius: 16px; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-primary); outline: none; font-size: 0.95rem;">
                        <div style="position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</div>
                    </div>
                    <button class="dhikr-chip active" id="translit-btn" onclick="window.app.toggleTranslit()" style="border-radius: 16px; padding: 0 1.2rem; font-size: 0.75rem;">${state.showTranslit ? 'Translit: ON' : 'Translit: OFF'}</button>
                </div>
                
                <div id="search-type-toggle" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="dhikr-chip active" id="search-surah-btn" onclick="window.app.setSearchType('surah')" style="font-size: 0.7rem;">Surahs</button>
                    <button class="dhikr-chip" id="search-word-btn" onclick="window.app.setSearchType('word')" style="font-size: 0.7rem;">Word Search</button>
                </div>
            </div>

            <div id="quran-results-container">
                <div id="quran-list" class="item-list">
                    <div class="loading-spinner" style="margin: 3rem auto;"></div>
                </div>
            </div>
        </div>
    `;

    state.searchType = 'surah';
    loadSurahList();

    const searchInput = document.getElementById('quran-search-input');
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (state.searchType === 'surah') {
            filterSurahList(val);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && state.searchType === 'word') {
            searchQuranWords(searchInput.value.trim());
        }
    });
}

async function loadSurahList() {
    try {
        const listEl = document.getElementById('quran-list');
        const cached = localStorage.getItem('surahs_list');
        let surahs = cached ? JSON.parse(cached) : null;

        if (!surahs) {
            const res = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await res.json();
            surahs = data.data;
            localStorage.setItem('surahs_list', JSON.stringify(surahs));
        }

        renderSurahList(surahs);
    } catch (e) {
        document.getElementById('quran-list').innerHTML = '<p>Error loading Quran. Please check connection.</p>';
    }
}

function renderSurahList(surahs) {
    const listEl = document.getElementById('quran-list');
    if (!listEl) return;

    listEl.innerHTML = surahs.map((surah, index) => {
        const isBookmarked = state.bookmarks.quran.some(b => b.id === surah.number);
        return `
            <div class="list-item" onclick="window.app.loadSurah(${surah.number})" style="animation: slideUp 0.4s ease both; animation-delay: ${index * 0.02}s">
                <div class="item-info">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 32px; height: 32px; background: rgba(var(--primary-blue-rgb), 0.14); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: var(--primary-blue);">${surah.number}</div>
                        <h4>${surah.englishName}</h4>
                    </div>
                    <span style="margin-left: 3.2rem;">${surah.englishNameTranslation} • ${surah.numberOfAyahs} Verses</span>
                </div>
                <div class="item-meta" style="display: flex; align-items: center; gap: 1rem;">
                    <div class="item-arabic">${surah.name}</div>
                    <button class="profile-circle ${isBookmarked ? 'active' : ''}" 
                            onclick="event.stopPropagation(); window.app.toggleBookmark('quran', ${surah.number}, {name: '${surah.englishName}'}); this.classList.toggle('active');" 
                            style="width: 32px; height: 32px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'var(--accent-gold)' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterSurahList(query) {
    const listEl = document.getElementById('quran-list');
    const items = listEl.querySelectorAll('.list-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

async function searchQuranWords(query) {
    if (!query || query.length < 2) return;
    const listEl = document.getElementById('quran-list');
    listEl.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto;"></div>';

    try {
        // Detect if Arabic
        const isArabic = /[\u0600-\u06FF]/.test(query);
        const edition = isArabic ? 'quran-uthmani' : (state.settings.translationEdition || 'en.asad');

        const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`);
        const data = await res.json();

        if (data.code !== 200 || !data.data || data.data.matches.length === 0) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; opacity: 0.6;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.8rem;">Try searching for a different word or check your spelling.</p>
                </div>`;
            return;
        }

        listEl.innerHTML = `
            <div style="padding: 0 0.5rem 1rem; font-size: 0.85rem; opacity: 0.7;">
                Found ${data.data.matches.length} matches in the Holy Quran
            </div>
            ${data.data.matches.map((match, index) => `
                <div class="glass-card" style="margin-bottom: 1.25rem; padding: 1.5rem; animation: slideUp 0.4s ease both; animation-delay: ${index * 0.05}s; cursor: pointer;" onclick="window.app.loadSurah(${match.surah.number}, ${match.numberInSurah})">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                        <span style="font-weight: 800; color: var(--accent-gold); font-size: 0.8rem; background: rgba(251, 191, 36, 0.1); padding: 0.3rem 0.75rem; border-radius: 20px;">
                            ${match.surah.englishName} : ${match.numberInSurah}
                        </span>
                        <span style="font-size: 0.7rem; opacity: 0.5; font-weight: 700;">SURAH ${match.surah.number}</span>
                    </div>
                    <div class="arabic-text" style="font-size: 1.4rem; margin-bottom: 1rem; line-height: 1.8; text-align: right; color: var(--text-primary);">
                        ${match.text}
                    </div>
                    ${!isArabic ? `
                        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; font-style: italic; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                            "${match.text}"
                        </p>
                    ` : ''}
                </div>
            `).join('')}
        `;
    } catch (e) {
        console.error("Search Error:", e);
        listEl.innerHTML = '<div class="glass-card" style="padding: 2rem; text-align: center; color: #ef4444;">Search service is currently unavailable. Please try again later.</div>';
    }
}

window.app.setSearchType = (type) => {
    state.searchType = type;
    document.getElementById('search-surah-btn').classList.toggle('active', type === 'surah');
    document.getElementById('search-word-btn').classList.toggle('active', type === 'word');
    const input = document.getElementById('quran-search-input');
    input.placeholder = type === 'surah' ? 'Search Surahs...' : 'Search for words (e.g. Charity, Faith)...';
    if (type === 'surah') loadSurahList();
};


function renderQuiz() {
    const questions = [
        { q: "What is the first month of the Islamic calendar?", a: ["Muharram", "Ramadan", "Shawwal", "Safar"], c: 0 },
        { q: "How many chapters (Surahs) are in the Quran?", a: ["110", "114", "120", "100"], c: 1 },
        { q: "Which prophet is known as 'Khalilullah' (Friend of Allah)?", a: ["Musa", "Isa", "Ibrahim", "Nuh"], c: 2 },
        { q: "What is the shortest Surah in the Quran?", a: ["Al-Ikhlas", "Al-Asr", "Al-Kawthar", "An-Nas"], c: 2 },
        { q: "Which companion is known as 'The Sword of Allah'?", a: ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Khalid ibn al-Walid", "Hamza ibn Abdul-Muttalib"], c: 2 }
    ];

    let currentQ = 0;
    let score = 0;

    const startQuiz = () => {
        contentArea.innerHTML = `
            <div style="animation: entrance 0.6s var(--anim-spring) both;">
                <button class="btn-back" onclick="window.app.loadScreen('toolkit')">← Toolkit</button>
                <div class="glass-card" id="quiz-card" style="padding: 2.5rem; text-align: center;">
                    <div id="quiz-progress" style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 800; margin-bottom: 1rem;">QUESTION 1 / ${questions.length}</div>
                    <div id="quiz-question" style="font-size: 1.4rem; font-weight: 800; margin-bottom: 2rem; line-height: 1.4;">${questions[0].q}</div>
                    <div id="quiz-options" style="display: flex; flex-direction: column; gap: 1rem;">
                        ${questions[0].a.map((opt, i) => `
                            <button class="dhikr-chip" style="width: 100%; padding: 1.2rem; border-radius: 18px; font-size: 1rem;" onclick="window.app.checkQuizAnswer(${i})">${opt}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    };

    window.app.checkQuizAnswer = (idx) => {
        const correct = questions[currentQ].c;
        const options = document.getElementById('quiz-options').children;

        if (idx === correct) {
            options[idx].style.background = 'rgba(16, 185, 129, 0.2)';
            options[idx].style.borderColor = '#10b981';
            score++;
            vibrate('pulse');
        } else {
            options[idx].style.background = 'rgba(239, 68, 68, 0.2)';
            options[idx].style.borderColor = '#ef4444';
            options[correct].style.background = 'rgba(16, 185, 129, 0.2)';
            options[correct].style.borderColor = '#10b981';
            vibrate('alert');
        }

        Array.from(options).forEach(opt => opt.disabled = true);

        setTimeout(() => {
            currentQ++;
            if (currentQ < questions.length) {
                updateQuizUI();
            } else {
                showQuizResult();
            }
        }, 1500);
    };

    const updateQuizUI = () => {
        const q = questions[currentQ];
        document.getElementById('quiz-progress').textContent = `QUESTION ${currentQ + 1} / ${questions.length}`;
        document.getElementById('quiz-question').textContent = q.q;
        document.getElementById('quiz-options').innerHTML = q.a.map((opt, i) => `
            <button class="dhikr-chip" style="width: 100%; padding: 1.2rem; border-radius: 18px; font-size: 1rem;" onclick="window.app.checkQuizAnswer(${i})">${opt}</button>
        `).join('');
    };

    const showQuizResult = () => {
        state.quiz.totalScore += score;
        state.quiz.history.push({ date: new Date().toISOString(), score, total: questions.length });
        localStorage.setItem('quiz_total_score', state.quiz.totalScore);
        localStorage.setItem('quiz_history', JSON.stringify(state.quiz.history));

        contentArea.innerHTML = `
            <div style="animation: entrance 0.6s var(--anim-spring) both; text-align: center;">
                <button class="btn-back" onclick="window.app.loadScreen('toolkit')">← Toolkit</button>
                <div class="glass-card" style="padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
                    <h2 style="font-weight: 800; margin-bottom: 0.5rem;">Quiz Completed!</h2>
                    <div style="font-size: 3rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 1rem;">${score} / ${questions.length}</div>
                    <p style="opacity: 0.7; margin-bottom: 2rem;">Total Knowledge Points: ${state.quiz.totalScore}</p>
                    <button class="btn-primary" onclick="window.app.loadScreen('quiz')">Try Again</button>
                </div>
            </div>
        `;
    };

    startQuiz();
}
function renderBooks() {
    const books = [
        { title: "Morning Adhkar", category: "Dua", count: 3 },
        { title: "Evening Adhkar", category: "Dua", count: 2 },
        { title: "40 Hadith Nawawi", category: "Hadith", count: 40 },
        { title: "Names of Allah", category: "Education", count: 99 },
        { title: "Fortress of the Muslim", category: "Dua", count: 132 },
        { title: "Quranic Duas", category: "Dua", count: 25 },
        { title: "Prophetic Duas", category: "Dua", count: 15 },
        { title: "Islamic Etiquettes", category: "Education", count: 10 },
        { title: "Stories of Sahaba", category: "History", count: 5 },
        { title: "Duas for Daily Life", category: "Dua", count: 10 },
        { title: "Salah Guide", category: "Education", count: 5 }
    ];

    contentArea.innerHTML = `
        <div class="item-list">
            ${books.map(book => `
                <div class="list-item" onclick="window.app.loadBook('${book.title}')">
                    <div class="item-info">
                        <h4>${book.title}</h4>
                        <span>${book.category} • ${book.count} items</span>
                    </div>
                    <div class="item-meta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadBook(title) {
    if (title === "40 Hadith Nawawi") {
        screenTitle.textContent = title;
        contentArea.innerHTML = `<div class="btn-back" onclick="window.app.loadScreen('books')">← Back to Resources</div><p>Fetching Hadith collection...</p>`;
        try {
            const res = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json');
            const data = await res.json();
            contentArea.innerHTML = `
                <div class="btn-back" onclick="window.app.loadScreen('books')">← Back to Resources</div>
                <div class="item-list">
                    ${data.hadiths.map(h => `
                        <div class="list-item" onclick="window.app.renderHadithDetail(${h.hadithnumber})">
                            <div class="item-info">
                                <h4>Hadith ${h.hadithnumber}</h4>
                                <span style="display: block; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${h.text}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            state.currentHadithData = data.hadiths;
        } catch (e) {
            contentArea.innerHTML = `<p>Failed to load Hadith collection. Please check connection.</p>`;
        }
        return;
    }

    if (title === "Names of Allah") {
        screenTitle.textContent = "99 Names of Allah";
        contentArea.innerHTML = `
            <div class="btn-back" onclick="window.app.loadScreen('books')">← Back to Resources</div>
            <div class="book-reader">
                ${namesOfAllah.map((name, idx) => `
                    <div class="glass-card" style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; animation: scaleIn 0.4s ease both; animation-delay: ${idx * 0.05}s;">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; color: var(--accent-gold);">${name.transliteration}</h4>
                                <span class="arabic-text" style="font-size: 1.2rem;">${name.arabic}</span>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">${name.meaning}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    if (title === "Names of Muhammad") {
        screenTitle.textContent = "99 Names of Muhammad (PBUH)";
        const prophetNames = [
            { arabic: "مُحَمَّد", transliteration: "Muhammad", meaning: "The Praised One" },
            { arabic: "أَحْمَد", transliteration: "Ahmad", meaning: "Most Deserving of Praise" },
            { arabic: "حَامِد", transliteration: "Hamid", meaning: "Praiser (of Allah)" },
            { arabic: "مَحْمُود", transliteration: "Mahmud", meaning: "The Commendable" },
            { arabic: "قَاسِم", transliteration: "Qasim", meaning: "The Distributor" },
            { arabic: "عَاقِب", transliteration: "Aqib", meaning: "The Successor" },
            { arabic: "فَاتِح", transliteration: "Fatih", meaning: "The Opener" },
            { arabic: "شَاهِد", transliteration: "Shahid", meaning: "The Witness" },
            { arabic: "حَاشِر", transliteration: "Hashir", meaning: "The Gatherer" },
            { arabic: "رَشِيد", transliteration: "Rashid", meaning: "The Guide" },
            { arabic: "مَشْهُود", transliteration: "Mashhud", meaning: "The Attested" },
            { arabic: "بَشِير", transliteration: "Bashir", meaning: "The Bringer of Good Tidings" },
            { arabic: "نَذِير", transliteration: "Nadhir", meaning: "The Warner" },
            { arabic: "دَاعِي", transliteration: "Dai", meaning: "The Caller (to Allah)" },
            { arabic: "شَافِي", transliteration: "Shafi", meaning: "The Healer" },
            { arabic: "مُصْطَفَى", transliteration: "Mustafa", meaning: "The Chosen One" },
            { arabic: "مُجْتَبَى", transliteration: "Mujtaba", meaning: "The Selected One" },
            { arabic: "مُرْتَضَى", transliteration: "Murtada", meaning: "The Agreeable" }
        ];
        contentArea.innerHTML = `
            <div class="btn-back" onclick="window.app.loadScreen('books')">← Back to Resources</div>
            <div class="book-reader">
                ${prophetNames.map((name, idx) => `
                    <div class="glass-card" style="margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; animation: scaleIn 0.4s ease both; animation-delay: ${idx * 0.05}s;">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; color: var(--accent-gold);">${name.transliteration}</h4>
                                <span class="arabic-text" style="font-size: 1.2rem;">${name.arabic}</span>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.2rem 0 0;">${name.meaning}</p>
                        </div>
                    </div>
                `).join('')}
                <div class="glass-card" style="text-align: center; opacity: 0.7;">
                    <p style="font-size: 0.8rem;">More names being added daily...</p>
                </div>
            </div>
        `;
        return;
    }

    if (!adhkarData[title]) {
        alert(title + " content is coming soon in the next update!");
        return;
    }

    screenTitle.textContent = title;
    contentArea.innerHTML = `
        <div class="btn-back" onclick="window.app.loadScreen('books')">← Back to Resources</div>
        <div class="book-reader">
            ${adhkarData[title].map((item, idx) => `
                <div class="glass-card adhkar-card">
                    <div class="dhikr-count-badge">${item.count}x</div>
                    <div class="arabic-text" style="font-size: 1.4rem;">${item.arabic}</div>
                    <p class="translation-text" style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">${item.translation}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderHadithDetail(num) {
    const hadith = state.currentHadithData.find(h => h.hadithnumber === num);
    if (!hadith) return;

    screenTitle.textContent = `Hadith ${num}`;
    contentArea.innerHTML = `
        <div class="btn-back" onclick="window.app.loadBook('40 Hadith Nawawi')">← Back to Collection</div>
        <div class="glass-card">
            <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary);">${hadith.text}</p>
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                 <span style="font-size: 0.8rem; color: var(--accent-gold);">Hadith ${hadith.hadithnumber}</span>
                 <button class="dhikr-chip" onclick="window.app.loadBook('40 Hadith Nawawi')">Close</button>
            </div>
        </div>
    `;
}

function renderTracker() {
    const tasks = [
        { id: 'fajr', label: 'Fajr Prayer', type: 'prayer' },
        { id: 'dhuhr', label: 'Dhuhr Prayer', type: 'prayer' },
        { id: 'asr', label: 'Asr Prayer', type: 'prayer' },
        { id: 'maghrib', label: 'Maghrib Prayer', type: 'prayer' },
        { id: 'isha', label: 'Isha Prayer', type: 'prayer' },
        { id: 'morning_adhkar', label: 'Morning Adhkar', type: 'dhikr' },
        { id: 'evening_adhkar', label: 'Evening Adhkar', type: 'dhikr' },
        { id: 'quran_read', label: 'Quran Recitation', type: 'quran' }
    ];

    const completedCount = Object.values(state.tracker.tasks).filter(Boolean).length;

    // Goal Progress
    const mushafGoal = state.goals.mushaf;
    const tasbihGoal = state.goals.tasbih;
    const mushafProgress = Math.min((mushafGoal.progress / mushafGoal.target) * 100, 100);
    const tasbihProgress = Math.min((tasbihGoal.progress / tasbihGoal.target) * 100, 100);

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('dashboard')">← Dashboard</button>

            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 class="section-title">Daily Spiritual Goals</h3>
                
                <div class="goal-item" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span style="font-weight: 700;">Mushaf Pages</span>
                        <span style="color: var(--accent-primary);">${mushafGoal.progress} / ${mushafGoal.target}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                        <div style="height: 100%; width: ${mushafProgress}%; background: var(--accent-primary); transition: width 0.5s ease;"></div>
                    </div>
                </div>

                <div class="goal-item">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span style="font-weight: 700;">Tasbih Count</span>
                        <span style="color: var(--accent-gold);">${tasbihGoal.progress} / ${tasbihGoal.target}</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                        <div style="height: 100%; width: ${tasbihProgress}%; background: var(--accent-gold); transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                <button class="dhikr-chip" style="width: 100%; margin-top: 1.5rem; border-color: var(--glass-border);" onclick="window.app.loadScreen('settings')">Edit Goals</button>
            </div>

            <div class="glass-card">
                <h3 class="section-title">Salah & Adhkar Checklist</h3>
                <div class="checklist">
                    ${tasks.map(task => `
                        <div class="checklist-item ${state.tracker.tasks[task.id] ? 'completed' : ''}" 
                             onclick="window.app.toggleTrackerTask('${task.id}')">
                            <div class="checkbox">
                                ${state.tracker.tasks[task.id] ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                            </div>
                            <span>${task.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="glass-card">
                <h3 class="section-title">Growth Analytics</h3>
                <div style="height: 120px; display: flex; align-items: flex-end; gap: 10px; padding: 20px 0;">
                    ${[60, 40, 80, 50, 70, 90, (completedCount / tasks.length) * 100].map(h => `
                        <div style="flex: 1; background: var(--accent-emerald); height: ${Math.min(h, 100)}%; border-radius: 6px; opacity: 0.6; transition: height 0.5s ease;"></div>
                    `).join('')}
                </div>
                <p style="text-align: center; font-size: 0.75rem; color: var(--text-secondary);">Last 7 Days Activity</p>
            </div>
        </div>
    `;
}

function renderQaza() {
    const prayers = [
        { id: 'fajr', name: 'Fajr', color: '#3b82f6' },
        { id: 'dhuhr', name: 'Dhuhr', color: '#10b981' },
        { id: 'asr', name: 'Asr', color: '#f59e0b' },
        { id: 'maghrib', name: 'Maghrib', color: '#ef4444' },
        { id: 'isha', name: 'Isha', color: '#8b5cf6' }
    ];

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('toolkit')">← Toolkit</button>
            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 class="section-title" style="color: var(--accent-gold);">Qaza Tracker (Missed Prayers)</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 2rem;">Track prayers you've missed and intend to fulfill. Click + to add or - when you pray them.</p>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${prayers.map(p => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid var(--glass-border);">
                            <div style="font-weight: 700; color: ${p.color}; font-size: 1.1rem;">${p.name}</div>
                            <div style="display: flex; align-items: center; gap: 1.5rem;">
                                <button class="profile-circle" style="width: 36px; height: 36px;" onclick="window.app.updateQaza('${p.id}', -1)">-</button>
                                <span style="font-size: 1.5rem; font-weight: 800; min-width: 40px; text-align: center;">${state.tracker.qaza[p.id]}</span>
                                <button class="profile-circle" style="width: 36px; height: 36px;" onclick="window.app.updateQaza('${p.id}', 1)">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="glass-card" style="text-align: center; opacity: 0.7;">
                <p style="font-size: 0.8rem; font-style: italic;">"The first thing for which a servant will be held to account on the Day of Resurrection will be his prayer."</p>
            </div>
        </div>
    `;
}

window.app.updateQaza = (id, delta) => {
    state.tracker.qaza[id] = Math.max(0, state.tracker.qaza[id] + delta);
    localStorage.setItem('qaza_data', JSON.stringify(state.tracker.qaza));
    renderQaza();
    vibrate('soft');
};

// --- Offline Hijri Fallback (Kuwaiti Algorithm) ---
function getOfflineHijri() {
    const today = new Date();
    let day = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();

    let m = month + 1;
    let y = year;
    if (m < 3) { y -= 1; m += 12; }

    let a = Math.floor(y / 100);
    let b = 2 - a + Math.floor(a / 4);
    let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

    let z = jd + 1;
    let i = Math.floor((z - 1867216.25) / 36524.25);
    let aa = z + 1 + i - Math.floor(i / 4);
    let bb = aa + 1524;
    let cc = Math.floor((bb - 122.1) / 365.25);
    let dd = Math.floor(365.25 * cc);
    let ee = Math.floor((bb - dd) / 30.6001);

    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;

    let hijriMonth = Math.floor((24 * l) / 709);
    let hijriDay = l - Math.floor((709 * hijriMonth) / 24);
    let hijriYear = 30 * n + j - 30;

    const months = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];

    return {
        day: hijriDay,
        month: { en: months[hijriMonth - 1] || "Ramadan" },
        year: hijriYear
    };
}

async function fetchPrayerTimes() {
    try {
        const { method, school } = state.settings;
        const { city, country } = state.location;
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}&school=${school}`);
        const data = await res.json();
        if (data.code === 200) {
            state.prayerTimes = data.data.timings;
            state.hijri = data.data.date.hijri;
            state.coordinates = data.data.meta;
            localStorage.setItem('hijri_data', JSON.stringify(state.hijri));
            localStorage.setItem('prayer_times', JSON.stringify(state.prayerTimes));
            if (state.settings.dynamicPrayerTheme && typeof refreshPrayerTheme === 'function') refreshPrayerTheme();
            if (state.currentScreen === 'dashboard') renderDashboard();
        }
    } catch (e) {
        console.warn("Failed to fetch prayer times", e);
    }
}

async function detectLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    const btn = document.getElementById('detect-loc-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Locating...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();

            state.location = { city: data.city || data.locality, country: data.countryCode };
            localStorage.setItem('location', JSON.stringify(state.location));

            // Refresh settings UI if visible
            if (state.currentScreen === 'settings') renderSettings();
            fetchPrayerTimes();
            alert(`Location detected: ${state.location.city}, ${state.location.country}`);
        } catch (e) {
            alert('Failed to identify city from coordinates.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, () => {
        alert('Permission denied or location unavailable.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

function renderLearn() {
    contentArea.innerHTML = `
        <div class="btn-back" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
        <div class="item-list">
            ${learningContent.map((topic, idx) => `
                <div class="glass-card topic-card" onclick="window.app.loadTopic('${topic.id}')" style="animation: scaleIn 0.4s ease both; animation-delay: ${idx * 0.1}s;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="action-icon" style="font-size: 1.5rem; background: rgba(255,255,255,0.05);">${topic.icon}</div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: var(--text-primary);">${topic.title}</h4>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0.2rem 0 0;">Deep dive into sacred knowledge</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3;"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </div>
            `).join('')}
            
            <div class="glass-card topic-card" onclick="window.app.loadScreen('nearby')" style="animation: scaleIn 0.4s ease both; animation-delay: 0.4s;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="action-icon" style="font-size: 1.5rem; background: rgba(255,255,255,0.05);">📍</div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0;">Nearby Services</h4>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0.2rem 0 0;">Find mosques & halal food locally</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadTopic(id) {
    const topic = learningContent.find(t => t.id === id);
    if (!topic) return;

    screenTitle.textContent = topic.title;
    contentArea.innerHTML = `
        <div class="btn-back" onclick="window.app.loadScreen('learn')">← Back to Topics</div>
        <div class="glass-card" style="animation: slideUp 0.5s ease both;">
            <div style="font-size: 3rem; text-align: center; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));">${topic.icon}</div>
            <div class="learning-content-body" style="line-height: 1.8; color: var(--text-primary);">
                ${topic.content}
            </div>
            
            ${id === 'names' ? `
                <div id="names-list-container" style="margin-top: 2rem; display: grid; gap: 1rem;">
                    <!-- Populated by namesOfAllah data -->
                    ${namesOfAllah.map(n => `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.4s ease both;">
                            <div>
                                <div style="font-weight: 700; color: var(--accent-gold); font-size: 0.9rem;">${n.id}. ${n.transliteration}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${n.meaning}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div class="arabic-text" style="font-size: 1.3rem; margin-bottom: 0;">${n.arabic}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderNearby() {
    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
        <div class="btn-back" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
        <div style="margin-bottom: 1.5rem; text-align: center;">
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Find Islamic services & stores around you.</p>
        </div>

        <div class="nearby-section-header">🗺️ Find Nearby</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            ${nearbyServices.map((service, idx) => `
                <a href="https://www.google.com/maps/search/${encodeURIComponent(service.query)}" target="_blank"
                   style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem 1rem; background: var(--card-white); border-radius: 20px; border: 1px solid var(--glass-border); text-decoration: none; transition: all 0.3s ease; animation: scaleIn 0.4s ease both; animation-delay: ${idx * 0.05}s; cursor: pointer;"
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-premium)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
                    <div style="font-size: 2rem;">${service.icon}</div>
                    <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); text-align: center;">${service.type}s</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">Open Maps</div>
                </a>
            `).join('')}
        </div>

        <div class="nearby-section-header">🛍️ Islamic Stores Online</div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${islamicStores.map((store, idx) => `
                <a href="${store.url}" target="_blank" class="store-card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1.25rem; animation: slideUp 0.4s ease both; animation-delay: ${idx * 0.08}s;">
                    <div style="font-size: 2rem; flex-shrink: 0;">${store.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem;">${store.name}</div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary);">${store.desc}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0;">
                        <span class="store-card-badge">${store.badge}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </div>
                </a>
            `).join('')}
        </div>
        </div>
    `;
}

async function startPrayerWatch() {
    // Check every 30 seconds for better precision
    if (window.prayerInterval) clearInterval(window.prayerInterval);

    window.prayerInterval = setInterval(() => {
        if (!state.prayerTimes || !state.settings.alarmsEnabled) return;

        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds();

        // Only trigger at the start of the minute (seconds < 30) to avoid double triggers
        if (seconds > 30) return;

        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(p => {
            const prayerTime = state.prayerTimes[p];
            if (prayerTime === currentTime) {
                // Check if already triggered this minute to prevent loops
                const lastTrigger = localStorage.getItem(`last_alarm_${p}`);
                const today = now.toDateString();
                if (lastTrigger !== `${today}_${currentTime}`) {
                    triggerPrayerAlarm(p);
                    localStorage.setItem(`last_alarm_${p}`, `${today}_${currentTime}`);
                }
            }
        });
    }, 30000);
}

function triggerPrayerAlarm(name) {
    if (!state.settings.alarmsEnabled) return;

    console.log(`Triggering alarm for ${name}`);
    vibrate('alert');

    // Browser notification
    if (Notification.permission === "granted") {
        try {
            new Notification(`Salafiyah - Time for ${name}`, {
                body: `It is now time for ${name} prayer in ${state.location.city}.`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                silent: false
            });
        } catch (e) {
            console.warn("Notification failed", e);
        }
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // Audio Alarm (Adhan sound)
    const adhanUrls = [
        'https://download.quranicaudio.com/adhan/mishari_rashid_al_afasy.mp3',
        'https://www.islamcan.com/audio/adhan/azan1.mp3'
    ];

    if (currentAdhan) {
        currentAdhan.pause();
        currentAdhan.src = "";
    }

    try {
        currentAdhan = new Audio(adhanUrls[0]);
        currentAdhan.play().catch(e => {
            console.warn("Audio playback blocked by browser. Retrying second source...");
            currentAdhan.src = adhanUrls[1];
            currentAdhan.play().catch(err => console.error("All Adhan sources failed. User interaction required."));
        });
    } catch (err) {
        console.error("Adhan initialization failed", err);
    }

    // Custom UI Alert
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'modal-overlay active';
    alertOverlay.style.display = 'flex';
    alertOverlay.innerHTML = `
        <div class="glass-card modal-content" style="text-align: center; border: 2px solid var(--accent-primary); animation: pulseGlow 2s infinite;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🕌</div>
            <h2 style="color: var(--accent-primary); margin-bottom: 0.5rem;">Allahu Akbar!</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">It is time for <strong>${name}</strong></p>
            <button class="btn-primary" onclick="if(currentAdhan){currentAdhan.pause();currentAdhan=null;} this.parentElement.parentElement.remove();">Close Alarm</button>
        </div>
    `;
    document.body.appendChild(alertOverlay);
}

async function renderSettings() {
    const methods = [
        { id: 1, name: 'University of Islamic Sciences, Karachi' },
        { id: 2, name: 'Islamic Society of North America (ISNA)' },
        { id: 3, name: 'Muslim World League' },
        { id: 4, name: 'Umm Al-Qura University, Makkah' },
        { id: 5, name: 'Egyptian General Authority of Survey' }
    ];

    const appearanceThemes = [
        { id: 'theme-midnight-noor', name: 'Midnight Noor', desc: 'Moonlit navy with blue glow', bg: 'linear-gradient(135deg,#06111d,#0e7cc1)', text: '#e0f2fe', dots: ['#38bdf8', '#0e7cc1', '#60a5d5'] },
        { id: 'theme-emerald-mosque', name: 'Emerald Mosque', desc: 'Green geometry and gold light', bg: 'linear-gradient(135deg,#064e3b,#10b981)', text: '#ecfdf5', dots: ['#10b981', '#d97706', '#f0fdf4'] },
        { id: 'theme-desert-sand', name: 'Desert Sand', desc: 'Warm sandstone and calm contrast', bg: 'linear-gradient(135deg,#fef3c7,#a16207)', text: '#713f12', dots: ['#d97706', '#fef3c7', '#8b5cf6'] },
        { id: 'theme-ramadan-night', name: 'Ramadan Night', desc: 'Lantern purple with gold ambience', bg: 'linear-gradient(135deg,#2e1065,#6d28d9)', text: '#fcd34d', dots: ['#fbbf24', '#d8b4fe', '#6d28d9'] },
        { id: 'theme-kaaba-luxury', name: 'Kaaba Black & Gold', desc: 'Deep black with premium gold', bg: 'linear-gradient(135deg,#050505,#1f2937 58%,#f59e0b)', text: '#fef3c7', dots: ['#f59e0b', '#fef3c7', '#111827'] },
        { id: 'theme-minimal-white', name: 'Minimal White', desc: 'Clean white serenity mode', bg: 'linear-gradient(135deg,#ffffff,#f3f4f6)', text: '#1a1a1a', dots: ['#7c3aed', '#06b6d4', '#ffffff'] },
        { id: 'theme-ottoman-royal', name: 'Ottoman Royal', desc: 'Emerald, bronze, classical depth', bg: 'linear-gradient(135deg,#0c2e3d,#134e7a,#d97706)', text: '#e0f2fe', dots: ['#06b6d4', '#d97706', '#134e7a'] },
        { id: 'theme-andalusia', name: 'Andalusia Twilight', desc: 'Warm terracotta and deep blue', bg: 'linear-gradient(135deg,#ea580c,#0c0a09,#1e3a8a)', text: '#fed7aa', dots: ['#ea580c', '#3b82f6', '#facc15'] },
        { id: 'theme-indigo-sufi', name: 'Indigo Sufi', desc: 'Mystical indigo and violet', bg: 'linear-gradient(135deg,#1e1b4b,#312e81,#6366f1)', text: '#e0e7ff', dots: ['#6366f1', '#a855f7', '#312e81'] },
        { id: 'theme-persian-rose', name: 'Persian Rose', desc: 'Deep rose and charcoal', bg: 'linear-gradient(135deg,#e11d48,#18181b,#4c0519)', text: '#ffe4e6', dots: ['#e11d48', '#fb7185', '#18181b'] },
        { id: 'theme-mughal-garden', name: 'Mughal Garden', desc: 'Lush teal and forest green', bg: 'linear-gradient(135deg,#064e3b,#065f46,#0d9488)', text: '#ccfbf1', dots: ['#0d9488', '#059669', '#064e3b'] },
        { id: 'theme-arctic-fajr', name: 'Arctic Fajr', desc: 'Crisp pale blue and white', bg: 'linear-gradient(135deg,#f0f9ff,#ffffff,#bae6fd)', text: '#0c4a6e', dots: ['#0ea5e9', '#7dd3fc', '#ffffff'] },
        { id: 'dark', name: 'Classic Dark', desc: 'Familiar low-light mode', bg: 'linear-gradient(135deg,#0f172a,#1e293b)', text: '#f8fafc', dots: ['#6366f1', '#94a3b8', '#1e293b'] }
    ];

    const themePreviewCards = appearanceThemes.map(theme => `
        <button type="button" class="theme-preview-card ${state.settings.currentTheme === theme.id ? 'active' : ''}"
            style="--preview-bg:${theme.bg}; --preview-text:${theme.text};"
            aria-pressed="${state.settings.currentTheme === theme.id}"
            onclick="window.app.setTheme('${theme.id}')">
            <div class="theme-preview-title">${theme.name}</div>
            <div class="theme-preview-subtitle">${theme.desc}</div>
            <div class="theme-preview-orbits">
                ${theme.dots.map(dot => `<span style="--dot:${dot};"></span>`).join('')}
            </div>
        </button>
    `).join('');

    const animationIntensity = state.settings.animationIntensity ?? 1;
    const blurIntensity = state.settings.blurIntensity ?? 20;
    const cardRadius = state.settings.cardRadius ?? 28;
    const fontScale = state.settings.fontScale ?? 1;

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <h2 class="serif" style="font-size: 2rem; color: var(--primary-blue);">${t('settings')}</h2>
                <button class="btn-back" onclick="window.app.loadScreen('dashboard')">${t('back')}</button>
            </div>
            
            <div class="glass-card">
            <h3 class="section-title">${t('location_settings')}</h3>
            <div style="margin-bottom: 1.5rem;">
                <button class="dhikr-chip active" id="detect-loc-btn" onclick="window.app.detectLocation()" style="width: 100%; padding: 0.8rem; border-radius: 12px; margin-bottom: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    ${t('detect_location')}
                </button>
                <p style="font-size: 0.75rem; color: var(--text-secondary); text-align: center;">Or enter manually below:</p>
            </div>
            <div class="form-group">
                <label>${t('city')}</label>
                <input type="text" id="set-city" placeholder="e.g. London" value="${state.location.city}">
            </div>
            <div class="form-group">
                <label>${t('country')}</label>
                <input type="text" id="set-country" placeholder="e.g. GB" value="${state.location.country}">
            </div>
            <button class="btn-primary" onclick="window.app.saveLocation()">${t('update_location')}</button>
        </div>

        <div class="glass-card">
            <h3 class="section-title">${t('app_prefs')}</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0;">Ramadan Mode</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">Show countdown and fasting times</p>
                </div>
                <input type="checkbox" id="set-ramadan" ${state.settings.ramadanMode ? 'checked' : ''} onchange="window.app.saveSettings()">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0; color: var(--accent-emerald);">Minimalist Focus Mode</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">Hide distractions, stats, and extra buttons</p>
                </div>
                <input type="checkbox" id="set-focus" ${state.settings.focusMode ? 'checked' : ''} onchange="window.app.saveSettings()">
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>Haptic Feedback Style</label>
                <select id="set-haptic" onchange="window.app.saveSettings()" style="width: 100%; height: 45px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 12px; padding: 0 1rem; outline: none;">
                    <option value="none" ${state.settings.hapticStyle === 'none' ? 'selected' : ''}>Off</option>
                    <option value="soft" ${state.settings.hapticStyle === 'soft' ? 'selected' : ''}>Soft Whisper (10ms)</option>
                    <option value="medium" ${state.settings.hapticStyle === 'medium' ? 'selected' : ''}>Standard (30ms)</option>
                    <option value="heavy" ${state.settings.hapticStyle === 'heavy' ? 'selected' : ''}>Deep Impact (60ms)</option>
                    <option value="pulse" ${state.settings.hapticStyle === 'pulse' ? 'selected' : ''}>Prayer Pulse (Beat)</option>
                </select>
                <p style="font-size: 0.6rem; color: var(--text-secondary); margin-top: 0.4rem;">Physical vibration on supported Android/Mobile devices.</p>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0;">Tajweed Highlighting</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">Color-coded rules in Quran Reader</p>
                </div>
                <input type="checkbox" id="set-tajweed" ${state.settings.tajweedEnabled ? 'checked' : ''} onchange="window.app.saveSettings()">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="margin: 0;">Prayer Alarms</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">Notifications and Adhan audio</p>
                </div>
                <input type="checkbox" id="set-alarms" ${state.settings.alarmsEnabled ? 'checked' : ''} onchange="window.app.saveSettings()">
            </div>
            <div style="margin-bottom: 1.5rem;">
                <button class="dhikr-chip" onclick="window.app.triggerPrayerAlarm('Test Adhan')" style="width: 100%; padding: 0.6rem; border-radius: 10px;">
                    🔊 Test Adhan Sound
                </button>
                <p style="font-size: 0.6rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: center;">Clicking this also enables audio playback in your browser.</p>
            </div>
            <div class="form-group">
                <label>Calculation Method</label>
                <select id="set-method" style="width: 100%; height: 45px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 12px; padding: 0 1rem; outline: none;">
                    ${methods.map(m => `<option value="${m.id}" ${state.settings.method === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
                </select>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                <input type="checkbox" id="set-format24" ${state.settings.format24 ? 'checked' : ''}>
                <label for="set-format24" style="font-size: 0.9rem;">Use 24-hour time format</label>
            </div>
            <button class="btn-primary" style="margin-top: 2rem;" onclick="window.app.saveSettings()">Save Preferences</button>
        </div>

        <div class="glass-card">
            <h3 class="section-title">Premium Appearance</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Live themes and motion controls are applied instantly and remembered across visits.</p>

            <div class="theme-preview-grid" style="margin-bottom: 1.5rem;">
                ${themePreviewCards}
            </div>

            <div class="appearance-grid" style="margin-bottom: 1rem;">
                <label class="premium-toggle">
                    <div>
                        <h4>Dynamic Prayer Mode</h4>
                        <p>Fajr, Dhuhr, Asr, Maghrib, and Isha each receive a matching atmosphere.</p>
                    </div>
                    <input type="checkbox" id="set-dynamic-prayer" ${state.settings.dynamicPrayerTheme ? 'checked' : ''} onchange="window.app.setDynamicPrayerTheme(this.checked)">
                </label>

                <label class="premium-toggle">
                    <div>
                        <h4>Immersive Mode</h4>
                        <p>Softens persistent chrome so reading and reflection feel calmer.</p>
                    </div>
                    <input type="checkbox" id="set-immersive" ${state.settings.immersiveMode ? 'checked' : ''} onchange="window.app.setImmersiveMode(this.checked)">
                </label>

                <label class="premium-toggle">
                    <div>
                        <h4>Ambient Background</h4>
                        <p>Floating glow layers tuned per theme with very low paint cost.</p>
                    </div>
                    <input type="checkbox" id="set-ambient" ${state.settings.ambientEnabled !== false ? 'checked' : ''} onchange="window.app.setAmbientEnabled(this.checked)">
                </label>

                <label class="premium-toggle">
                    <div>
                        <h4>Islamic Pattern Layer</h4>
                        <p>Subtle geometric texture for pages and dashboard surfaces.</p>
                    </div>
                    <input type="checkbox" id="set-pattern" ${state.settings.patternEnabled !== false ? 'checked' : ''} onchange="window.app.setPatternEnabled(this.checked)">
                </label>
            </div>

            <div class="appearance-grid" style="margin-bottom: 1rem;">
                <div class="range-control">
                    <h4>Animation Intensity</h4>
                    <p>Controls page transitions, reveals, hover lift, and feedback motion.</p>
                    <input type="range" id="set-anim-intensity" min="0" max="1" step="0.05" value="${animationIntensity}" oninput="window.app.setAnimationIntensity(this.value)">
                    <div class="range-value">${Math.round(animationIntensity * 100)}%</div>
                </div>

                <div class="range-control">
                    <h4>Blur Intensity</h4>
                    <p>Adjusts glass cards, header, sidebar, and floating actions.</p>
                    <input type="range" id="set-blur" min="0" max="40" step="2" value="${blurIntensity}" oninput="window.app.setBlurIntensity(this.value)">
                    <div class="range-value">${blurIntensity}px</div>
                </div>

                <div class="range-control">
                    <h4>Card Radius</h4>
                    <p>Fine-tune modern softness without changing layout structure.</p>
                    <input type="range" id="set-card-radius" min="12" max="40" step="2" value="${cardRadius}" oninput="window.app.setCardRadius(this.value)">
                    <div class="range-value">${cardRadius}px</div>
                </div>

                <div class="range-control">
                    <h4>Font Scale</h4>
                    <p>Improves readability globally while preserving responsive spacing.</p>
                    <input type="range" id="set-font-scale" min="0.92" max="1.14" step="0.01" value="${fontScale}" oninput="window.app.setFontScale(this.value)">
                    <div class="range-value">${Math.round(fontScale * 100)}%</div>
                </div>
            </div>

            <div class="density-group">
                ${['compact', 'regular', 'spacious'].map(density => `
                    <button type="button" class="density-option ${state.settings.uiDensity === density ? 'active' : ''}" onclick="window.app.setDensity('${density}')">
                        <h4>${density.charAt(0).toUpperCase() + density.slice(1)}</h4>
                        <p>${density === 'compact' ? 'Dense dashboard for phones.' : density === 'spacious' ? 'Airier reading and tablet spacing.' : 'Balanced default spacing.'}</p>
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="glass-card">
            <h3 class="section-title">Dashboard Appearance</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Personalize your spiritual space.</p>
            
            <div class="form-group">
                <label>Background Type</label>
                <select id="set-bg-type" onchange="window.app.applyBackground()" style="width: 100%; height: 45px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); border-radius: 12px; padding: 0 1rem; outline: none;">
                    <option value="default" ${state.background.type === 'default' ? 'selected' : ''}>Minimalist (Default)</option>
                    <option value="custom" ${state.background.type === 'custom' ? 'selected' : ''}>Custom Image URL</option>
                    <option value="cycle" ${state.background.type === 'cycle' ? 'selected' : ''}>Spiritual Cycle (Auto-Rotate)</option>
                </select>
            </div>

            <div id="custom-bg-input" style="display: ${state.background.type === 'custom' ? 'block' : 'none'}; margin-top: 1rem;">
                <label style="font-size: 0.75rem;">Custom Image URL</label>
                <input type="text" id="set-bg-url" value="${state.background.url}" placeholder="https://example.com/bg.jpg" onchange="window.app.applyBackground()" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; outline: none; margin-top: 0.5rem;">
            </div>


        </div>

        <div class="glass-card">
            <h3 class="section-title">Cloud & Sync</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Access your spiritual journey on any device.</p>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div>
                        <div style="font-size: 0.85rem; font-weight: 700;">Account Sync</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${state.user ? `Logged in as ${state.user.email}` : 'Not signed in'}</div>
                    </div>
                    <button class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.75rem;" onclick="${state.user ? 'window.app.syncUserData()' : 'window.app.toggleAuth()'}">
                        ${state.user ? 'Sync Now' : 'Sign In'}
                    </button>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary" style="flex: 1; padding: 0.8rem; font-size: 0.75rem; justify-content: center;" onclick="window.app.exportSyncKey()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                        Export Key
                    </button>
                    <button class="btn-secondary" style="flex: 1; padding: 0.8rem; font-size: 0.75rem; justify-content: center;" onclick="window.app.importSyncKey()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Import Key
                    </button>
                </div>
                <p style="font-size: 0.65rem; color: var(--text-muted); text-align: center;">Use the Sync Key to transfer data manually if you don't want to create an account.</p>
            </div>
        </div>

        <div class="glass-card" style="border: 1px solid rgba(239, 68, 68, 0.2);">
            <h3 class="section-title" style="color: #ef4444;">Danger Zone</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem;">These actions cannot be undone.</p>
            <button class="dhikr-chip" onclick="window.app.resetAllData()" style="width: 100%; border-color: #ef4444; color: #ef4444; padding: 0.8rem;">
                Wipe All App Data & Progress
            </button>
        </div>
    </div>
    `;
}

function renderQibla() {
    if (!state.coordinates) {
        contentArea.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📍</div>
                <h3>Location Required</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Please set your city and country in Settings or enable GPS to calculate the Qibla.</p>
                <button class="btn-primary" onclick="window.app.loadScreen('settings')">Open Settings</button>
            </div>
        `;
        return;
    }

    const { latitude, longitude } = state.coordinates;
    const meccaLat = 21.4225;
    const meccaLon = 39.8262;

    const y = Math.sin(THREE_RADIANS(meccaLon - longitude));
    const x = Math.cos(THREE_RADIANS(latitude)) * Math.tan(THREE_RADIANS(meccaLat)) - Math.sin(THREE_RADIANS(latitude)) * Math.cos(THREE_RADIANS(meccaLon - longitude));
    const qiblaDeg = (THREE_DEGREES(Math.atan2(y, x)) + 360) % 360;

    contentArea.innerHTML = `
        <div class="qibla-container" style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; align-items: start; animation: entrance 0.6s var(--anim-spring) both;">
            <!-- LEFT: Compass -->
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div class="compass-outer" id="qibla-compass">
                    <div class="compass-needle" id="qibla-needle"></div>
                    <div class="compass-label">N</div>
                    <div class="compass-label">E</div>
                    <div class="compass-label">S</div>
                    <div class="compass-label">W</div>
                </div>
                <div class="glass-card" style="margin-top: 2rem; text-align: center; width: 100%;">
                    <h3 style="color: var(--accent-emerald); font-size: 2rem; margin: 0;">${Math.round(qiblaDeg)}°</h3>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Qibla Angle (from True North)</p>
                </div>
                <div id="qibla-status" style="margin-top: 1.5rem; font-size: 0.8rem; height: 1.2rem; transition: all 0.3s ease;">
                    <span style="opacity: 0.5;">Rotate to align</span>
                </div>
                <p style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 1rem; line-height: 1.4;">
                    Rotate your device until the Kaaba 🕋 points straight up to face Mecca.
                </p>
            </div>

            <!-- RIGHT: Prayer Timings -->
            <div class="glass-card" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h3 style="margin: 0;">Prayer Timings</h3>
                        <div style="font-size: 0.75rem; opacity: 0.6;">${state.location.city || 'Detecting...'}, ${state.location.country || ''}</div>
                    </div>
                    <button class="profile-circle" onclick="window.app.detectLocation()" title="Refresh Location" style="width: 32px; height: 32px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    </button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(name => {
        const rawTime = state.prayerTimes ? state.prayerTimes[name] : null;
        const time = formatPrayerTime(rawTime);
        const isNext = name === getNextPrayer()?.name;
        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.1rem; background: ${isNext ? 'rgba(var(--primary-blue-rgb), 0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isNext ? 'var(--primary-blue)' : 'rgba(255,255,255,0.05)'}; border-radius: 16px; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">${name}</div>
                                    ${isNext ? '<span class="dhikr-chip active" style="font-size: 0.6rem; padding: 0.2rem 0.5rem;">NEXT</span>' : ''}
                                </div>
                                <div style="font-family: 'Outfit', sans-serif; font-weight: 800; color: var(--accent-gold); font-size: 1.1rem;">${time}</div>
                            </div>
                        `;
    }).join('')}
                </div>

                <button class="btn-primary" style="width: 100%; margin-top: 1.5rem; font-size: 0.85rem; justify-content: center; height: 50px; border-radius: 16px;" onclick="window.app.loadScreen('settings')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Adjust Settings
                </button>
            </div>
        </div>
    `;

    // Handle compass orientation
    const needle = document.getElementById('qibla-needle');
    const outer = document.getElementById('qibla-compass');
    const status = document.getElementById('qibla-status');
    if (!needle) return;

    // Initial state
    needle.style.transform = `rotate(${qiblaDeg}deg)`;
    
    // Add Kaaba icon to needle
    needle.innerHTML = '<div class="kaaba-icon">🕋</div>';

    const handleOrientation = (e) => {
        let heading = e.webkitCompassHeading || (360 - e.alpha); // Adjust alpha for Android
        if (typeof e.absolute !== 'undefined' && !e.absolute && typeof e.webkitCompassHeading === 'undefined') {
            return;
        }

        if (heading !== null && heading !== undefined) {
            outer.style.transform = `rotate(${-heading}deg)`;
            
            // Check if facing Qibla (within 5 degrees)
            const currentDirection = (qiblaDeg - heading + 360) % 360;
            const isFacing = currentDirection < 8 || currentDirection > 352;
            
            if (isFacing) {
                status.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 800;">✨ FACING QIBLA</span>`;
                status.classList.add('facing-active');
                if (!state._vibrated) {
                    if (navigator.vibrate) navigator.vibrate(30);
                    state._vibrated = true;
                }
            } else {
                status.innerHTML = `<span style="opacity: 0.5;">Rotate to align</span>`;
                status.classList.remove('facing-active');
                state._vibrated = false;
            }
        }
    };

    // Show Permission button for iOS
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permBtn = document.createElement('button');
        permBtn.className = 'btn-primary';
        permBtn.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;';
        permBtn.textContent = 'Enable Compass';
        permBtn.onclick = () => {
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    permBtn.remove();
                    window.addEventListener('deviceorientation', handleOrientation, true);
                }
            });
        };
        outer.parentElement.style.position = 'relative';
        outer.parentElement.appendChild(permBtn);
    } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

async function requestCompassPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') renderQibla();
    } else {
        renderQibla();
    }
}

function THREE_RADIANS(deg) { return deg * (Math.PI / 180); }
function THREE_DEGREES(rad) { return rad * (180 / Math.PI); }

function saveSettings() {
    const methodEl = document.getElementById('set-method');
    const format24El = document.getElementById('set-format24');
    const ramadanModeEl = document.getElementById('set-ramadan');
    const alarmsEnabledEl = document.getElementById('set-alarms');
    const tajweedEl = document.getElementById('set-tajweed');

    if (!methodEl) return;

    state.settings.method = parseInt(methodEl.value);
    state.settings.format24 = format24El ? format24El.checked : state.settings.format24;
    state.settings.ramadanMode = ramadanModeEl ? ramadanModeEl.checked : state.settings.ramadanMode;
    state.settings.alarmsEnabled = alarmsEnabledEl ? alarmsEnabledEl.checked : state.settings.alarmsEnabled;
    state.settings.tajweedEnabled = tajweedEl ? tajweedEl.checked : state.settings.tajweedEnabled;

    localStorage.setItem('app_settings', JSON.stringify(state.settings));
    localStorage.setItem('tajweed_enabled', state.settings.tajweedEnabled);

    // Save Background Settings
    const bgType = document.getElementById('set-bg-type')?.value;
    const bgUrl = document.getElementById('set-bg-url')?.value;

    const focusEl = document.getElementById('set-focus');
    const hapticStyle = document.getElementById('set-haptic')?.value;

    if (focusEl) {
        state.settings.focusMode = focusEl.checked;
        state.settings.hapticStyle = hapticStyle || state.settings.hapticStyle;

        localStorage.setItem('focus_mode', state.settings.focusMode);
        localStorage.setItem('haptic_style', state.settings.hapticStyle);

        if (state.settings.focusMode) document.body.classList.add('focus-mode');
        else document.body.classList.remove('focus-mode');

        if (state.settings.hapticStyle !== 'none') vibrate('soft'); // Test vibration
    }

    if (bgType) {
        state.background.type = bgType;
        state.background.url = bgUrl;
        applyBackground();
    }

    // Handle Ramadan Pack
    if (state.settings.ramadanMode) {
        document.body.classList.add('ramadan-mode');
    } else {
        document.body.classList.remove('ramadan-mode');
    }

    fetchPrayerTimes();
    syncUserData();
    alert('Preferences saved!');
}

const bgCycleList = [
    './spiritual_serenity_bg_1777640712068.png',
    './spiritual_night_bg_1777640765146.png',
    './hero_mosque_night_1777635162540.png'
];
let currentBgIdx = 0;

function applyBackground() {
    const customInput = document.getElementById('custom-bg-input');
    const type = document.getElementById('set-bg-type')?.value || state.background.type;
    const url = document.getElementById('set-bg-url')?.value || state.background.url;

    if (customInput) customInput.style.display = (type === 'custom' ? 'block' : 'none');

    state.background.type = type;
    state.background.url = url;

    // Refresh dashboard only after the app shell has mounted.
    if (contentArea && state.currentScreen === 'dashboard') renderDashboard();
}



function initBgCycle() {
    setInterval(() => {
        if (state.background.type === 'cycle') {
            currentBgIdx = (currentBgIdx + 1) % bgCycleList.length;
            applyBackground();
        }
    }, 60000); // Cycle every minute
}
initBgCycle();

function saveLocation() {
    const city = document.getElementById('set-city').value.trim();
    const country = document.getElementById('set-country').value.trim();

    if (!city || !country) {
        alert('Please enter both city and country code.');
        return;
    }

    state.location = { city, country };
    localStorage.setItem('location', JSON.stringify(state.location));
    fetchPrayerTimes();
    syncUserData();
    alert('Location updated!');
}

function setTasbihLang(lang) {
    state.tasbih.language = lang;
    localStorage.setItem('tasbih_lang', lang);
    renderTasbih();
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('last_reset_date');

    if (lastReset !== today) {
        // New day! Reset daily tasks
        Object.keys(state.tracker.tasks).forEach(k => state.tracker.tasks[k] = false);
        // We might want to keep tasbih counts or reset them? 
        // "Reset the data section after the day ends" -> likely means tracker/daily stats
        localStorage.setItem('tracker_data', JSON.stringify(state.tracker));
        localStorage.setItem('last_reset_date', today);
        console.log("Daily data reset performed.");
    }
}

async function renderHadithWidget() {
    try {
        const res = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json');
        const data = await res.json();
        const randomHadith = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];

        const textEl = document.getElementById('hadith-text');
        const refEl = document.getElementById('hadith-ref');
        if (textEl && refEl) {
            textEl.textContent = `"${randomHadith.text.substring(0, 200)}..."`;
            refEl.textContent = `— 40 Hadith Nawawi, Hadith ${randomHadith.hadithnumber}`;
        }
    } catch (e) {
        console.error("Hadith fetch failed", e);
    }
}

function getNextPrayer() {
    if (!state.prayerTimes) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const prayers = prayerOrder.map(name => ({
        name,
        time: state.prayerTimes[name]
    }));

    for (let p of prayers) {
        if (!p.time) continue;
        const [h, m] = p.time.split(':').map(Number);
        const pTime = h * 60 + m;
        if (pTime > currentTime) return { ...p, minutesLeft: pTime - currentTime };
    }

    // Default to Tomorrow's Fajr
    if (prayers[0] && prayers[0].time) {
        const [fh, fm] = prayers[0].time.split(':').map(Number);
        const fTime = (fh + 24) * 60 + fm;
        return { ...prayers[0], name: 'Fajr (Tomorrow)', minutesLeft: fTime - currentTime };
    }
    return null;
}

// --- Logic Functions ---

function handleTasbihClick(e) {
    const phrase = state.tasbih.currentPhrase;
    if (!state.tasbih.counts[phrase]) state.tasbih.counts[phrase] = 0;

    state.tasbih.counts[phrase]++;

    // Update Goal Progress
    state.goals.tasbih.progress++;
    localStorage.setItem('goals', JSON.stringify(state.goals));

    const counterVal = document.getElementById('counter-val');
    if (counterVal) counterVal.textContent = state.tasbih.counts[phrase];

    // Ripple Effect
    const btn = document.getElementById('tasbih-btn');
    if (btn) {
        vibrate('soft');
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Save to local storage
    localStorage.setItem('tasbih_counts', JSON.stringify(state.tasbih.counts));
    syncUserData();

    // Haptic feedback
    vibrate('soft');
}


function resetTasbih() {
    const phrase = state.tasbih.currentPhrase;
    if (confirm(`Reset count for "${phrase}"?`)) {
        state.tasbih.counts[phrase] = 0;
        localStorage.setItem('tasbih_counts', JSON.stringify(state.tasbih.counts));
        syncUserData();
        renderTasbih();
    }
}

function resetAllData() {
    if (confirm('CRITICAL: This will permanently delete ALL your progress, tasbih counts, and session data. Are you sure?')) {
        localStorage.clear();
        window.location.reload();
    }
}

// --- Auth Logic ---

function toggleAuth() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    if (state.user) {
        if (confirm(`Logged in as ${state.user.email}. Sign out?`)) {
            handleLogout();
        }
    } else {
        const isVisible = modal.style.display === 'flex';
        modal.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) renderAuthForm('login');
    }
}

function renderAuthForm(mode) {
    const container = document.getElementById('auth-form-container');
    const isLogin = mode === 'login';
    const isSignup = mode === 'signup';
    const isOTP = mode === 'signup-otp' || mode === 'forgot-otp';
    const isForgot = mode === 'forgot';

    let title = 'Welcome Back';
    let sub = 'Sign in to sync your spiritual progress.';
    if (isSignup) { title = 'Create Account'; sub = 'Join Salafiyah and track your daily journey.'; }
    if (isOTP) { title = 'Verify Identity'; sub = 'We sent a verification code to your email.'; }
    if (isForgot) { title = 'Reset Password'; sub = 'Enter your email to receive a reset code.'; }

    container.innerHTML = `
        <div class="auth-form" style="animation: entrance 0.4s ease-out both;">
            <h2 style="color: var(--primary-blue); margin-bottom: 0.5rem;">${title}</h2>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 2rem;">${sub}</p>
            
            ${isOTP ? `
                <div class="form-group">
                    <label>Enter 6-Digit OTP</label>
                    <input type="text" id="auth-otp" placeholder="123456" maxlength="6" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: rgba(0,0,0,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); outline: none; font-size: 1.2rem; letter-spacing: 0.3em; text-align: center;">
                </div>
                ${mode === 'forgot-otp' ? `
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="auth-new-pass" placeholder="••••••••" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: rgba(0,0,0,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); outline: none;">
                    </div>
                ` : ''}
            ` : `
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-email" placeholder="name@example.com" value="${window.tempAuthEmail || ''}" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: rgba(0,0,0,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); outline: none;">
                </div>
                ${!isForgot ? `
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="auth-pass" placeholder="••••••••" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: rgba(0,0,0,0.05); border: 1px solid var(--glass-border); color: var(--text-primary); outline: none;">
                    </div>
                ` : ''}
            `}
            
            <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="window.app.handleAuthSubmit('${mode}')">
                ${isLogin ? 'Sign In' : (isSignup || isForgot ? 'Send Code' : 'Verify & Continue')}
            </button>
            
            <div class="auth-footer" style="margin-top: 1.5rem; font-size: 0.85rem; text-align: center; color: var(--text-secondary);">
                ${isLogin ? `
                    Don't have an account? <a onclick="window.app.renderAuthForm('signup')" style="color: var(--primary-blue); font-weight: 700; cursor: pointer;">Sign Up</a>
                    <br><br>
                    <a onclick="window.app.renderAuthForm('forgot')" style="color: var(--text-muted); cursor: pointer;">Forgot Password?</a>
                ` : `
                    Already have an account? <a onclick="window.app.renderAuthForm('login')" style="color: var(--primary-blue); font-weight: 700; cursor: pointer;">Sign In</a>
                `}
            </div>
        </div>
    `;
}

async function handleAuthSubmit(mode) {
    if (mode === 'signup' || mode === 'forgot') {
        const email = document.getElementById('auth-email').value;
        const pass = mode === 'signup' ? document.getElementById('auth-pass').value : null;
        if (!email || (mode === 'signup' && !pass)) { alert('Please fill in all fields.'); return; }

        window.tempAuthEmail = email;
        window.tempAuthPass = pass;

        try {
            const res = await fetch('/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                renderAuthForm(mode === 'signup' ? 'signup-otp' : 'forgot-otp');
                alert("A verification code has been sent. Please check your email (and server console).");
            } else {
                const d = await res.json();
                alert(d.detail || 'Failed to send OTP.');
            }
        } catch (e) { alert('Network error.'); }
        return;
    }

    const email = window.tempAuthEmail || document.getElementById('auth-email')?.value;
    const otp = document.getElementById('auth-otp')?.value;
    const pass = window.tempAuthPass || document.getElementById('auth-pass')?.value;
    const newPass = document.getElementById('auth-new-pass')?.value;

    let endpoint = '/api/auth/login';
    let body = { email, password: pass };

    if (mode === 'signup-otp') {
        endpoint = '/api/auth/signup';
        body = { email, password: pass, otp };
    } else if (mode === 'forgot-otp') {
        endpoint = '/api/auth/forgot-password';
        body = { email, otp, new_password: newPass };
    }

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.ok) {
            if (mode === 'forgot-otp') {
                alert("Password updated successfully! Please sign in.");
                renderAuthForm('login');
                return;
            }

            state.user = data.user || { email: data.email || email, id: data.user_id };
            localStorage.setItem('user', JSON.stringify(state.user));

            if (data.data) {
                if (data.data.tracker) state.tracker = data.data.tracker;
                if (data.data.tasbih_counts) state.tasbih.counts = data.data.tasbih_counts;
                if (data.data.settings) state.settings = { ...state.settings, ...data.data.settings };
                if (data.data.bookmarks) state.bookmarks = data.data.bookmarks;
                if (data.data.goals) state.goals = data.data.goals;
                if (data.data.quiz) state.quiz = data.data.quiz;
            }

            updateAuthUI();
            document.getElementById('auth-modal').style.display = 'none';
            loadScreen(state.currentScreen);
            alert(`${mode === 'login' ? 'Signed in' : 'Account created'} successfully!`);
            if (mode === 'signup-otp') syncUserData();

            // Clean up
            delete window.tempAuthEmail;
            delete window.tempAuthPass;
        } else {
            alert(data.detail || 'Authentication failed.');
        }
    } catch (e) {
        alert('Network error. Is the server running?');
    }
}

async function syncUserData() {
    if (!state.user) return;
    try {
        const payload = {
            email: state.user.email,
            data: {
                tracker: state.tracker,
                tasbih_counts: state.tasbih.counts,
                settings: state.settings,
                bookmarks: state.bookmarks,
                goals: state.goals,
                quiz: state.quiz,
                lastSync: new Date().toISOString()
            }
        };
        await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        localStorage.setItem('last_cloud_sync', new Date().toLocaleTimeString());
    } catch (e) {
        console.warn("Sync failed", e);
    }
}

let syncTimeout;
function triggerAutoSync() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncUserData(), 2000); // 2s debounce
}

function exportSyncKey() {
    const data = JSON.stringify(state);
    const key = btoa(data); // Simple base64 for key
    navigator.clipboard.writeText(key).then(() => {
        alert("Sync Key copied to clipboard! Paste this on your other device to import.");
    });
}

function importSyncKey() {
    const key = prompt("Paste your Sync Key here:");
    if (!key) return;
    try {
        const data = JSON.parse(atob(key));
        if (confirm("This will overwrite all current data. Continue?")) {
            Object.assign(state, data);
            saveSettings(); // This triggers localStorage persistence
            alert("Data imported successfully! App will now reload.");
            window.location.reload();
        }
    } catch (e) {
        alert("Invalid Sync Key. Please check and try again.");
    }
}

function handleLogout() {
    state.user = null;
    localStorage.removeItem('user');
    updateAuthUI();
    loadScreen('dashboard');
}




function updateAuthUI() {
    const profileBtn = document.getElementById('profile-btn');
    if (!profileBtn) return;
    if (state.user) {
        profileBtn.classList.add('logged-in');
        profileBtn.innerHTML = `<span>${state.user.email[0].toUpperCase()}</span>`;
    } else {
        profileBtn.classList.remove('logged-in');
        profileBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }
}



// --- Sacred Mushaf Logic ---

async function renderMushaf() {
    const screenTitle = document.getElementById('screen-title');
    screenTitle.textContent = "Sacred Mushaf";
    contentArea.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div class="btn-back" style="margin: 0;" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
            <button class="dhikr-chip" onclick="window.app.resetMushaf()">Reset</button>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 300px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 1rem; opacity: 0.7;">Opening the sacred pages...</p>
        </div>
    `;

    // Sanitize Page
    if (isNaN(state.settings.mushafPage)) state.settings.mushafPage = 1;

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/page/${state.settings.mushafPage}/quran-uthmani`);
        if (!res.ok) throw new Error('API down');

        const data = await res.json();
        if (!data || !data.data) throw new Error('Invalid data');

        const page = data.data;

        // Update Progress
        state.goals.mushaf.progress = Math.max(state.goals.mushaf.progress, state.settings.mushafPage);
        localStorage.setItem('goals', JSON.stringify(state.goals));

        // Update Last Read
        if (page.ayahs && page.ayahs.length > 0) {
            state.lastRead = {
                surahNum: page.ayahs[0].surah.number,
                surahName: page.ayahs[0].surah.englishName,
                ayahNum: page.ayahs[0].numberInSurah,
                page: state.settings.mushafPage,
                type: 'mushaf'
            };
            localStorage.setItem('last_read', JSON.stringify(state.lastRead));
        }

        contentArea.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div class="btn-back" style="margin: 0;" onclick="window.app.loadScreen('dashboard')">← ${t('back_to_dashboard')}</div>
                <div style="display: flex; gap: 0.5rem;">
                     <button class="profile-circle ${state.bookmarks.mushaf.some(b => b.id === state.settings.mushafPage) ? 'active' : ''}" 
                             onclick="window.app.toggleBookmark('mushaf', ${state.settings.mushafPage}, {}); this.classList.toggle('active');" 
                             style="width: 36px; height: 36px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                    <button class="dhikr-chip" onclick="window.app.resetMushaf()">Reset</button>
                </div>
            </div>
            <div class="mushaf-container">
                <!-- Offline Download Badge -->
                <div style="margin-bottom: 1.5rem; display: flex; justify-content: center; width: 100%;">
                    ${state.mushafOffline.isDownloaded ? `
                        <div class="mushaf-offline-badge" title="Mushaf is available offline">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ${t('downloaded')}
                        </div>
                    ` : state.mushafOffline.isDownloading ? `
                        <div style="width: 100%; max-width: 300px;">
                            <div class="mushaf-offline-badge downloading" style="width: 100%; justify-content: center; margin-bottom: 0.5rem;">
                                <div class="loading-spinner" style="width: 12px; height: 12px; border-width: 2px; margin-right: 8px;"></div>
                                ${t('downloading')} ${state.mushafOffline.progress}%
                            </div>
                            <div class="mushaf-download-progress">
                                <div class="mushaf-download-progress-bar" style="width: ${state.mushafOffline.progress}%;"></div>
                            </div>
                        </div>
                    ` : `
                        <button class="dhikr-chip" onclick="window.app.downloadMushaf()" style="background: rgba(var(--primary-blue-rgb), 0.05); color: var(--primary-blue); border: 1px dashed var(--primary-blue); padding: 0.5rem 1.25rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            ${t('download_offline')}
                        </button>
                    `}
                </div>

                <div class="mushaf-page">
                    <div style="font-size: 0.75rem; color: var(--accent-primary); text-align: center; margin-bottom: 2rem; font-weight: 700; letter-spacing: 0.15em; opacity: 0.6;">
                        PAGE ${state.settings.mushafPage}
                    </div>
                    <div class="arabic-text mushaf-text">
                        ${page.ayahs.map(a => `${a.text} <span class="ayah-num-mushaf" style="font-size: 1rem; color: var(--accent-gold); vertical-align: middle; font-family: serif;">(${a.numberInSurah})</span>`).join(' ')}
                    </div>
                </div>
                <div class="mushaf-controls" style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; background: var(--glass-bg); padding: 1rem; border-radius: 20px; border: 1px solid var(--glass-border);">
                    <button class="dhikr-chip" style="padding: 0.6rem 1.5rem;" onclick="window.app.changeMushafPage(-1)" ${state.settings.mushafPage <= 1 ? 'disabled style="opacity:0.3"' : ''}>← Previous</button>
                    <div style="font-size: 0.95rem; font-weight: 800; color: var(--accent-primary);">
                        ${state.settings.mushafPage} / 604
                    </div>
                    <button class="dhikr-chip" style="padding: 0.6rem 1.5rem;" onclick="window.app.changeMushafPage(1)" ${state.settings.mushafPage >= 604 ? 'disabled style="opacity:0.3"' : ''}>Next →</button>
                </div>
            </div>
        `;
    } catch (e) {
        console.error("Mushaf Error:", e);
        contentArea.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📴</div>
                <h3 style="color: var(--accent-gold);">Connection Issue</h3>
                <p style="font-size: 0.9rem; margin-bottom: 1.5rem; opacity: 0.7;">We couldn't load the sacred page. Please check your internet connection.</p>
                <button class="btn-primary" onclick="window.app.loadScreen('mushaf')">Try Again</button>
            </div>
        `;
    }
}

async function downloadMushaf() {
    if (state.mushafOffline.isDownloading) return;

    state.mushafOffline.isDownloading = true;
    state.mushafOffline.progress = 0;
    renderMushaf();

    try {
        const API_CACHE_NAME = 'salafiyah-api-v1';
        const cache = await caches.open(API_CACHE_NAME);
        const totalPages = 604;
        const batchSize = 15;

        for (let i = 1; i <= totalPages; i++) {
            const url = `https://api.alquran.cloud/v1/page/${i}/quran-uthmani`;

            const cached = await cache.match(url);
            if (!cached) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response.clone());
                    }
                } catch (err) {
                    console.warn(`Failed to download page ${i}`, err);
                }
            }

            state.mushafOffline.progress = Math.round((i / totalPages) * 100);

            if (i % batchSize === 0 || i === totalPages) {
                renderMushaf();
                await new Promise(r => setTimeout(r, 50));
            }
        }

        state.mushafOffline.isDownloading = false;
        state.mushafOffline.isDownloaded = true;
        localStorage.setItem('mushaf_downloaded', 'true');
        renderMushaf();
        alert("The Mushaf has been successfully downloaded for offline use.");
    } catch (err) {
        console.error("Mushaf Download Error:", err);
        state.mushafOffline.isDownloading = false;
        renderMushaf();
        alert("There was an error downloading the Mushaf. Please check your connection.");
    }
}

async function loadSurah(id, scrollToAyah = null) {
    screenTitle.textContent = "Loading...";
    contentArea.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';

    try {
        const edition = state.settings.tajweedEnabled ? 'quran-tajweed' : 'quran-uthmani';
        const editions = [edition, state.settings.translationEdition, 'en.transliteration'].join(',');
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/${editions}`);
        const data = await res.json();

        const arabic = data.data[0];
        const translation = data.data[1];
        const translit = data.data[2];

        screenTitle.textContent = arabic.englishName;

        // Update Last Read
        state.lastRead = {
            surahNum: id,
            surahName: arabic.englishName,
            ayahNum: scrollToAyah || 1,
            page: arabic.ayahs[0].page,
            type: 'quran'
        };
        localStorage.setItem('last_read', JSON.stringify(state.lastRead));

        contentArea.innerHTML = `
            <div class="surah-header" style="animation: fadeIn 0.5s ease both; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="btn-back" onclick="window.app.loadScreen('quran')" style="margin-bottom: 0;">← All Surahs</button>
                    <button class="dhikr-chip" id="prev-surah-btn" onclick="window.app.loadPreviousSurah(${id})" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; padding: 0.5rem 1rem;" ${id === 1 ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        ${t('prev_surah')}
                    </button>
                    <button class="dhikr-chip" id="next-surah-btn" onclick="window.app.loadNextSurah(${id})" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; padding: 0.5rem 1rem;" ${id === 114 ? 'disabled' : ''}>
                        ${t('next_surah')}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
                <button class="dhikr-chip" onclick="window.app.toggleLanguageModal()" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Translation
                </button>
            </div>
                <div class="glass-card" style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: var(--accent-primary);">${arabic.name}</h2>
                    <p style="font-size: 0.9rem; opacity: 0.7;">${arabic.englishNameTranslation} • ${arabic.numberOfAyahs} Verses</p>
                    <button class="btn-primary" style="margin-top: 1.5rem; padding: 0.8rem 2rem; font-size: 0.8rem;" onclick="window.app.playSurahAudio(${id})">
                         Play Full Surah
                    </button>
                </div>
            </div>
            
            <div class="ayah-list">
                ${arabic.ayahs.map((ayah, i) => {
            const transText = translation.ayahs[i].text;
            const isBookmarked = state.bookmarks.ayah.some(b => b.id === `${id}:${ayah.numberInSurah}`);
            return `
                        <div class="glass-card ayah-card" id="ayah-${ayah.numberInSurah}" style="animation: slideUp 0.4s ease both; animation-delay: ${i * 0.02}s;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                                <div style="width: 32px; height: 32px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; color: var(--accent-gold);">
                                    ${ayah.numberInSurah}
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="profile-circle" title="Share Ayah" onclick="window.app.shareContent(\`${arabic.englishName.replace(/`/g, '\\`').replace(/\$/g, '\\$')} [${ayah.numberInSurah}]\`, \`${transText.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                    </button>
                                    <button class="profile-circle ${isBookmarked ? 'active' : ''}" 
                                            onclick="window.app.toggleBookmark('ayah', '${id}:${ayah.numberInSurah}', {surahId: ${id}, surahName: \`${arabic.englishName.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, text: \`${transText.substring(0, 50).replace(/`/g, '\\`').replace(/\$/g, '\\$')}...\`}); this.classList.toggle('active');">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'var(--accent-gold)' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    </button>
                                    <button class="profile-circle" onclick="window.app.playAyahAudio(${id}, ${ayah.numberInSurah})">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </button>
                                </div>
                            </div>
                            <div class="arabic-text" style="font-size: 1.8rem; margin-bottom: 1rem; line-height: 2.2;">
                                ${state.settings.tajweedEnabled ? parseTajweed(ayah.text) : ayah.text}
                            </div>
                            ${state.showTranslit && translit ? `
                                <div class="translit-text" style="font-size: 0.9rem; color: var(--accent-primary); font-style: italic; margin-bottom: 1rem; opacity: 0.8;">
                                    ${translit.ayahs[i].text}
                                </div>
                            ` : ''}
                            <div class="translation-text" style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6; border-top: 1px solid var(--glass-border); padding-top: 1.25rem;">
                                ${transText}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        if (scrollToAyah) {
            setTimeout(() => {
                const el = document.getElementById(`ayah-${scrollToAyah}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    } catch (e) {
        console.error(e);
        contentArea.innerHTML = '<p>Error loading surah content.</p>';
    }
}

function loadPreviousSurah(currentId) {
    if (currentId > 1) {
        loadSurah(currentId - 1);
    }
}

function loadNextSurah(currentId) {
    if (currentId < 114) {
        loadSurah(currentId + 1);
    }
}

function parseTajweed(text) {
    // Basic regex for Aladhan API Tajweed tags
    // Example: [h:text] -> <span class="tajweed-ghunnah">text</span>
    // Rules: h=ghunnah, i=ikhfa, q=qalqalah, m=idgham, n=idgham_wo_ghunnah, p=iqlab, l=lam_shamsiyyah
    return text
        .replace(/\[h:([^\]]+)\]/g, '<span class="tajweed-ghunnah">$1</span>')
        .replace(/\[i:([^\]]+)\]/g, '<span class="tajweed-ikhfa">$1</span>')
        .replace(/\[q:([^\]]+)\]/g, '<span class="tajweed-qalqalah">$1</span>')
        .replace(/\[m:([^\]]+)\]/g, '<span class="tajweed-idgham">$1</span>')
        .replace(/\[n:([^\]]+)\]/g, '<span class="tajweed-idgham-wo-ghunnah">$1</span>')
        .replace(/\[p:([^\]]+)\]/g, '<span class="tajweed-iqlab">$1</span>')
        .replace(/\[l:([^\]]+)\]/g, '<span class="tajweed-lam-shamsiyyah">$1</span>')
        .replace(/\[o:([^\]]+)\]/g, '<span class="tajweed-madda-obligatory">$1</span>')
        .replace(/\[j:([^\]]+)\]/g, '<span class="tajweed-madda-permissible">$1</span>')
        .replace(/\[v:([^\]]+)\]/g, '<span class="tajweed-madda-necessity">$1</span>');
}

function resetMushaf() {
    state.settings.mushafPage = 1;
    localStorage.setItem('mushaf_page', 1);
    renderMushaf();
}

function changeMushafPage(delta) {
    const newPage = state.settings.mushafPage + delta;
    if (newPage >= 1 && newPage <= 604) {
        state.settings.mushafPage = newPage;
        localStorage.setItem('mushaf_page', newPage);

        // Update Goal Progress
        if (delta > 0) {
            state.goals.mushaf.progress++;
            localStorage.setItem('goals', JSON.stringify(state.goals));
        }

        renderMushaf();
    }
}


// --- Language Modal ---

function setUILanguage(lang) {
    state.settings.uiLanguage = lang;
    localStorage.setItem('ui_language', lang);
    applyRTL(lang);
    toggleLanguageModal();
    // Re-render nav and current screen
    renderBottomNav();
    loadScreen(state.currentScreen);
}

function toggleLanguageModal() {
    const existing = document.getElementById('language-modal');
    if (existing) {
        existing.remove();
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'language-modal';
    modal.className = 'modal-overlay active';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="glass-card modal-content" style="max-height: 80vh; overflow-y: auto; width: 90%; max-width: 400px; padding: 2rem;">
            <h3 style="margin-bottom: 1.5rem; text-align: center;">${t('select_language')}</h3>
            
            <h4 style="margin-bottom: 1rem; color: var(--accent-gold);">${t('ui_language')}</h4>
            <div class="item-list" style="margin-bottom: 2rem;">
                <div class="glass-card topic-card ${state.settings.uiLanguage === 'en' ? 'active' : ''}" 
                     style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                     onclick="window.app.setUILanguage('en')">
                    <div style="font-weight: 600;">English</div>
                </div>
                <div class="glass-card topic-card ${state.settings.uiLanguage === 'ar' ? 'active' : ''}" 
                     style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                     onclick="window.app.setUILanguage('ar')">
                    <div style="font-weight: 600;">العربية</div>
                </div>
                <div class="glass-card topic-card ${state.settings.uiLanguage === 'ur' ? 'active' : ''}" 
                     style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                     onclick="window.app.setUILanguage('ur')">
                    <div style="font-weight: 600;">اردو</div>
                </div>
                <div class="glass-card topic-card ${state.settings.uiLanguage === 'id' ? 'active' : ''}" 
                     style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                     onclick="window.app.setUILanguage('id')">
                    <div style="font-weight: 600;">Bahasa Indonesia</div>
                </div>
                <div class="glass-card topic-card ${state.settings.uiLanguage === 'fr' ? 'active' : ''}" 
                     style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                     onclick="window.app.setUILanguage('fr')">
                    <div style="font-weight: 600;">Français</div>
                </div>
            </div>

            <h4 style="margin-bottom: 1rem; color: var(--accent-emerald); display: flex; justify-content: space-between; align-items: center;">
                Transliteration
                <input type="checkbox" id="modal-translit-toggle" ${state.showTranslit ? 'checked' : ''} onchange="window.app.toggleTranslit()">
            </h4>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 1.5rem; margin-top: -0.5rem;">Show English pronunciation for Arabic text.</p>

            <h4 style="margin-bottom: 1rem; color: var(--accent-gold);">${t('quran_trans_lang')}</h4>
            <div class="item-list">
                ${quranTranslations.map(tr => `
                    <div class="glass-card topic-card ${state.settings.translationEdition === tr.id ? 'active' : ''}" 
                         style="padding: 1rem; margin-bottom: 0.5rem; cursor: pointer;"
                         onclick="window.app.setTranslation('${tr.id}')">
                        <div style="font-weight: 600;">${tr.name}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-primary" style="margin-top: 1.5rem;" onclick="window.app.toggleLanguageModal()">${t('close')}</button>
        </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) toggleLanguageModal(); };
    document.body.appendChild(modal);
}

// --- 99 Names Audio ---

function updateNameAudioUI(id, isPlaying) {
    const btn = document.getElementById(`name-audio-btn-${id}`);
    if (btn) {
        btn.innerHTML = isPlaying
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    }
}

let playAllMode = false;

function playNameAudio(id) {
    playAllMode = false; // Cancel play all if manual click

    if (state.audio.currentNameId === id && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateNameAudioUI(id, false);
        state.audio.currentNameId = null;
        loadBook("Names of Allah");
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (state.audio.currentNameId) {
            updateNameAudioUI(state.audio.currentNameId, false);
        }
    }

    const nameObj = namesOfAllah.find(n => n.id === id);
    if (!nameObj) return;

    state.audio.currentNameId = id;
    updateNameAudioUI(id, true);

    const utterance = new SpeechSynthesisUtterance(nameObj.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;

    utterance.onend = () => {
        updateNameAudioUI(id, false);
        state.audio.currentNameId = null;
    };

    utterance.onerror = (e) => {
        console.error("TTS failed", e);
        updateNameAudioUI(id, false);
        state.audio.currentNameId = null;
    };

    window.speechSynthesis.speak(utterance);
}

function playAllNamesAudio(startId = 1) {
    if (startId > 99) {
        playAllMode = false;
        return;
    }

    playAllMode = true;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (state.audio.currentNameId && state.audio.currentNameId !== startId) {
            updateNameAudioUI(state.audio.currentNameId, false);
        }
    }

    const nameObj = namesOfAllah.find(n => n.id === startId);
    if (!nameObj) {
        playAllMode = false;
        return;
    }

    state.audio.currentNameId = startId;
    updateNameAudioUI(startId, true);

    const btn = document.getElementById(`name-audio-btn-${startId}`);
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const utterance = new SpeechSynthesisUtterance(nameObj.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;

    utterance.onend = () => {
        updateNameAudioUI(startId, false);
        state.audio.currentNameId = null;
        if (playAllMode) {
            setTimeout(() => {
                if (playAllMode) playAllNamesAudio(startId + 1);
            }, 500);
        }
    };

    utterance.onerror = (e) => {
        console.error("TTS failed", e);
        updateNameAudioUI(startId, false);
        playAllMode = false;
    };

    window.speechSynthesis.speak(utterance);
}

function toggleReciterModal() {
    let modal = document.getElementById('reciter-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reciter-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const currentReciter = quranReciters.find(r => r.id === state.audio.reciter) || quranReciters[0];

    modal.innerHTML = `
        <div class="glass-card modal-content" style="max-width: 500px; width: 90%; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 class="serif" style="font-size: 1.5rem; margin: 0; color: var(--primary-blue);">Choose Reciter</h3>
                <button class="profile-circle" onclick="document.getElementById('reciter-modal').classList.remove('active')" style="width: 32px; height: 32px;">✕</button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
                ${quranReciters.map(r => `
                    <div onclick="window.app.setReciter('${r.id}')" 
                         style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-radius: 16px; cursor: pointer; transition: all 0.2s ease;
                         background: ${r.id === state.audio.reciter ? 'rgba(var(--primary-blue-rgb), 0.1)' : 'rgba(255,255,255,0.03)'};
                         border: 1px solid ${r.id === state.audio.reciter ? 'var(--primary-blue)' : 'var(--glass-border)'};">
                        <div>
                            <div style="font-weight: 700; color: var(--text-primary);">${r.name}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px;">${r.style}</div>
                        </div>
                        ${r.id === state.audio.reciter ? '<span style="font-size: 1.2rem;">✨</span>' : ''}
                    </div>
                `).join('')}
            </div>
            
            <button class="btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="document.getElementById('reciter-modal').classList.remove('active')">Close</button>
        </div>
    `;
    modal.classList.add('active');
}

function setReciter(id) {
    state.audio.reciter = id;
    localStorage.setItem('quran_reciter', id);

    // Update active UI
    document.getElementById('reciter-modal').classList.remove('active');

    // If audio is playing, restart with new reciter
    if (state.audio.isPlaying && state.audio.currentSurah) {
        const currentSurah = state.audio.currentSurah;
        state.audio.isPlaying = false;
        state.audio.player.pause();
        playSurahAudio(currentSurah);
    }

    if (state.currentScreen === 'quran') renderQuran();
}

function setTranslation(id) {
    state.settings.translationEdition = id;
    localStorage.setItem('translation_edition', id);
    toggleLanguageModal();
    if (state.currentScreen === 'quran') {
        // Reload Quran list if needed, or if in a surah, reload it
        const screenTitle = document.getElementById('screen-title').textContent;
        const surahs = JSON.parse(localStorage.getItem('surahs_list')) || [];
        const surah = surahs.find(s => s.englishName === screenTitle);
        if (surah) loadSurah(surah.number);
        else renderQuran();
    }
    if (state.currentScreen === 'dashboard') renderDashboard();
}

function toggleTranslit() {
    state.showTranslit = !state.showTranslit;
    localStorage.setItem('show_translit', state.showTranslit);

    // If in surah view, reload to apply
    const screenTitleEl = document.getElementById('screen-title');
    const surahsList = JSON.parse(localStorage.getItem('surahs_list')) || [];
    const currentSurah = surahsList.find(s => s.englishName === screenTitleEl?.textContent);

    if (currentSurah) {
        loadSurah(currentSurah.number);
    } else {
        renderQuran();
    }
}

function checkStreak() {
    const today = new Date().toDateString();
    const lastActive = state.lastActiveDate;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastActive === yesterday.toDateString()) {
        state.streak++;
    } else if (lastActive === null) {
        state.streak = 1;
    } else {
        // Streak broken, but let's keep it 1 if they are starting today
        state.streak = 1;
    }

    state.lastActiveDate = today;
    localStorage.setItem('streak', state.streak);
    localStorage.setItem('last_active_date', today);
}

function toggleTrackerTask(id) {
    state.tracker.tasks[id] = !state.tracker.tasks[id];
    localStorage.setItem('tracker_data', JSON.stringify(state.tracker));
    if (state.currentScreen === 'tracker') renderTracker();
    triggerAutoSync();
}

function initCommandPalette() {
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
    });

    const palette = document.createElement('div');
    palette.id = 'command-palette';
    palette.className = 'modal-overlay';
    palette.style.display = 'none';
    palette.innerHTML = `
        <div class="glass-card modal-content" style="padding: 1rem;">
            <input type="text" id="command-search" placeholder="Search commands... (e.g. 'Quran', 'Reset')" style="width: 100%; padding: 1rem; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; outline: none;">
            <div id="command-results" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;"></div>
        </div>
    `;
    document.body.appendChild(palette);

    const commands = [
        { name: 'Go to Quran', action: () => loadScreen('quran') },
        { name: 'Go to Tasbih', action: () => loadScreen('tasbih') },
        { name: 'Go to Tracker', action: () => loadScreen('tracker') },
        { name: 'Go to Dashboard', action: () => loadScreen('dashboard') },
        { name: 'Reset Tasbih', action: () => resetTasbih() },
        { name: 'Sign Out', action: () => handleLogout() },
        { name: 'Morning Adhkar', action: () => { loadScreen('books'); loadBook('Morning Adhkar'); } },
        { name: 'Evening Adhkar', action: () => { loadScreen('books'); loadBook('Evening Adhkar'); } }
    ];

    const input = document.getElementById('command-search');
    const results = document.getElementById('command-results');

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        const filtered = commands.filter(c => c.name.toLowerCase().includes(val));
        results.innerHTML = filtered.map(c => `
            <div class="command-item" style="padding: 0.8rem 1rem; cursor: pointer; border-radius: 8px;" onclick="window.app.runCommand('${c.name}')">
                ${c.name}
            </div>
        `).join('');
    });

    palette.addEventListener('click', (e) => {
        if (e.target === palette) toggleCommandPalette();
    });
}

function toggleCommandPalette() {
    const palette = document.getElementById('command-palette');
    const isVisible = palette.style.display === 'flex';
    palette.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
        document.getElementById('command-search').value = '';
        document.getElementById('command-search').focus();
        // Show all results by default
        document.getElementById('command-search').dispatchEvent(new Event('input'));
    }
}

function runCommand(name) {
    const commands = {
        'Go to Quran': () => loadScreen('quran'),
        'Go to Tasbih': () => loadScreen('tasbih'),
        'Go to Tracker': () => loadScreen('tracker'),
        'Go to Dashboard': () => loadScreen('dashboard'),
        'Reset Tasbih': () => resetTasbih(),
        'Sign Out': () => handleLogout(),
        'Morning Adhkar': () => { loadScreen('books'); loadBook('Morning Adhkar'); },
        'Evening Adhkar': () => { loadScreen('books'); loadBook('Evening Adhkar'); }
    };
    if (commands[name]) {
        commands[name]();
        toggleCommandPalette();
    }
}

// Expose functions to window (already handled at top, maintaining for logic)

function renderRamadanMode() {
    const fasting = state.tracker.fasting;
    const completedFasts = fasting.filter(Boolean).length;
    const taraweeh = state.tracker.taraweeh;

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('dashboard')">← Dashboard</button>
            
            <div class="glass-card ramadan-status" style="padding: 2.25rem; border-radius: 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)); border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🌙</div>
                <h2 style="font-weight: 800; color: var(--accent-gold); font-size: 1.8rem; margin-bottom: 0.5rem;">Ramadan Kareem</h2>
                <p style="opacity: 0.8; font-size: 0.95rem;">May Allah accept your fasts and prayers.</p>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 class="section-title">Fasting Tracker</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Completed: ${completedFasts} / 30 Days</p>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.8rem;">
                    ${fasting.map((done, i) => `
                        <div class="fast-day ${done ? 'completed' : ''}" 
                             onclick="window.app.toggleFast(${i})"
                             style="aspect-ratio: 1; border: 1px solid ${done ? 'var(--accent-gold)' : 'var(--glass-border)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; cursor: pointer; background: ${done ? 'rgba(245, 158, 11, 0.2)' : 'transparent'}; transition: all 0.2s ease;">
                            ${i + 1}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="glass-card" style="margin-bottom: 2rem;">
                <h3 class="section-title">Taraweeh Tracker</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-primary);">${taraweeh} Rakats</div>
                    <div style="display: flex; gap: 0.8rem;">
                        <button class="dhikr-chip active" onclick="window.app.updateTaraweeh(8)" style="font-size: 0.75rem;">+8</button>
                        <button class="dhikr-chip active" onclick="window.app.updateTaraweeh(20)" style="font-size: 0.75rem;">+20</button>
                        <button class="dhikr-chip" onclick="window.app.updateTaraweeh(-state.tracker.taraweeh)" style="color: #ef4444; border-color: #ef4444; font-size: 0.75rem;">Reset</button>
                    </div>
                </div>
                <div style="height: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min((taraweeh / 20) * 100, 100)}%; background: var(--accent-primary); transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div class="glass-card">
                <h3 class="section-title">Ramadan Duas</h3>
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="padding: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; margin-bottom: 1rem;">Suhoor Dua</div>
                        <div class="arabic-text" style="font-size: 1.3rem; margin-bottom: 1rem;">وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ</div>
                        <p style="font-size: 0.85rem; opacity: 0.7; font-style: italic;">"I intend to keep the fast for tomorrow in the month of Ramadan."</p>
                    </div>
                    <div style="padding: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 20px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700; text-transform: uppercase; margin-bottom: 1rem;">Iftar Dua</div>
                        <div class="arabic-text" style="font-size: 1.3rem; margin-bottom: 1rem;">اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ</div>
                        <p style="font-size: 0.85rem; opacity: 0.7; font-style: italic;">"O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance."</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.app.toggleFast = (day) => {
    state.tracker.fasting[day] = !state.tracker.fasting[day];
    localStorage.setItem('fasting_data', JSON.stringify(state.tracker.fasting));
    renderRamadanMode();
    vibrate('soft');
};

window.app.updateTaraweeh = (rakats) => {
    state.tracker.taraweeh = Math.max(0, state.tracker.taraweeh + rakats);
    localStorage.setItem('taraweeh_count', state.tracker.taraweeh);
    renderRamadanMode();
    vibrate('soft');
};

function toggleBookmark(type, id, metadata) {
    const list = state.bookmarks[type];
    const index = list.findIndex(b => b.id === id);

    if (index > -1) {
        list.splice(index, 1);
        vibrate('soft'); // Subtle feedback
    } else {
        list.push({ id, ...metadata, date: new Date().toISOString() });
        vibrate('medium'); // Success feedback
    }

    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));

    // Refresh current screen if relevant
    if (state.currentScreen === 'bookmarks') renderBookmarks();
    // Specific triggers for Mushaf/Quran buttons
    const btn = document.getElementById(`bookmark-${type}-${id}`);
    if (btn) btn.classList.toggle('active');
    triggerAutoSync();
}

function toggleVoiceRecognition() {
    if (state.audio.isListening) {
        stopVoiceRecognition();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice recognition is not supported in this browser.");
        return;
    }

    state.audio.recognition = new SpeechRecognition();
    state.audio.recognition.lang = 'en-US';
    state.audio.recognition.interimResults = false;
    state.audio.recognition.maxAlternatives = 1;

    state.audio.recognition.onstart = () => {
        state.audio.isListening = true;
        const micBtn = document.getElementById('voice-mic-btn');
        if (micBtn) micBtn.classList.add('pulse-active');
        vibrate('soft');
    };

    state.audio.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voice Command:", transcript);
        handleVoiceCommand(transcript);
    };

    state.audio.recognition.onend = () => {
        state.audio.isListening = false;
        const micBtn = document.getElementById('voice-mic-btn');
        if (micBtn) micBtn.classList.remove('pulse-active');
    };

    state.audio.recognition.onerror = (event) => {
        console.error("Speech Recognition Error", event.error);
        stopVoiceRecognition();
    };

    state.audio.recognition.start();
}

function vibrate(pattern = 'soft') {
    if (!('vibrate' in navigator)) return;
    if (!state.tasbih.haptics) return;

    const styles = {
        'soft': 15,
        'medium': 40,
        'heavy': [60, 40, 60],
        'alert': [200, 100, 200, 100, 500],
        'pulse': [50, 100, 50, 100, 50]
    };

    const activePattern = styles[state.settings.hapticStyle] || styles[pattern] || styles.soft;
    navigator.vibrate(activePattern);
}

function stopVoiceRecognition() {
    if (state.audio.recognition) {
        state.audio.recognition.stop();
        state.audio.isListening = false;
    }
}

function handleVoiceCommand(cmd) {
    if (cmd.includes('open quran') || cmd.includes('go to quran')) {
        loadScreen('quran');
    } else if (cmd.includes('open tasbih') || cmd.includes('go to tasbih')) {
        loadScreen('tasbih');
    } else if (cmd.includes('open tracker') || cmd.includes('go to tracker')) {
        loadScreen('tracker');
    } else if (cmd.includes('open mushaf') || cmd.includes('go to mushaf')) {
        loadScreen('mushaf');
    } else if (cmd.includes('play surah')) {
        // Simple regex to extract surah name/number
        const match = cmd.match(/play surah (.*)/);
        if (match) {
            const name = match[1].trim();
            // Try to find surah by name or number
            const surahs = JSON.parse(localStorage.getItem('surahs_list'));
            if (surahs) {
                const s = surahs.find(s => s.englishName.toLowerCase().includes(name) || s.number == name);
                if (s) playSurahAudio(s.number);
            }
        }
    } else if (cmd.includes('stop audio') || cmd.includes('stop')) {
        closePlayer();
    } else if (cmd.includes('go home') || cmd.includes('dashboard')) {
        loadScreen('dashboard');
    }
}

function renderBookmarks() {
    const { mushaf, quran, ayah } = state.bookmarks;
    const hasBookmarks = mushaf.length > 0 || quran.length > 0 || ayah.length > 0;

    contentArea.innerHTML = `
        <div style="animation: entrance 0.6s var(--anim-spring) both;">
            <button class="btn-back" onclick="window.app.loadScreen('toolkit')">← Toolkit</button>
            
            ${!hasBookmarks ? `
                <div style="text-align: center; padding: 4rem 2rem; opacity: 0.5;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔖</div>
                    <h3>No Bookmarks Yet</h3>
                    <p>Save your favorite surahs, ayahs, or mushaf pages to find them here.</p>
                </div>
            ` : `
                <div class="bookmark-sections">
                    ${quran.length > 0 ? `
                        <div class="section-title" style="margin-top: 2rem;">Surahs</div>
                        <div class="item-list">
                            ${quran.map(b => `
                                <div class="list-item" onclick="window.app.loadSurah(${b.id})">
                                    <div class="item-info">
                                        <h4>${b.name}</h4>
                                        <span>Saved on ${new Date(b.date).toLocaleDateString()}</span>
                                    </div>
                                    <button class="profile-circle" onclick="event.stopPropagation(); window.app.toggleBookmark('quran', ${b.id})">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-gold)"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${mushaf.length > 0 ? `
                        <div class="section-title" style="margin-top: 2rem;">Mushaf Pages</div>
                        <div class="item-list">
                            ${mushaf.map(b => `
                                <div class="list-item" onclick="state.settings.mushafPage = ${b.id}; window.app.loadScreen('mushaf')">
                                    <div class="item-info">
                                        <h4>Page ${b.id}</h4>
                                        <span>Saved on ${new Date(b.date).toLocaleDateString()}</span>
                                    </div>
                                    <button class="profile-circle" onclick="event.stopPropagation(); window.app.toggleBookmark('mushaf', ${b.id})">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-gold)"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${ayah.length > 0 ? `
                        <div class="section-title" style="margin-top: 2rem;">Ayahs</div>
                        <div class="item-list">
                            ${ayah.map(b => `
                                <div class="list-item" onclick="window.app.loadSurah(${b.surahId})">
                                    <div class="item-info">
                                        <h4>${b.surahName} [${b.id.split(':')[1]}]</h4>
                                        <span style="display: block; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.text}</span>
                                    </div>
                                    <button class="profile-circle" onclick="event.stopPropagation(); window.app.toggleBookmark('ayah', '${b.id}', {surahId: ${b.surahId}, surahName: \`${b.surahName.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, text: \`${b.text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`})">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-gold)"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `}
        </div>
    `;
}

async function shareContent(title, text) {
    const shareData = {
        title: 'Salafiyah - Spiritual Companion',
        text: `${title}\n\n${text}\n\nShared from Salafiyah App`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share failed', err);
        }
    } else {
        // Fallback to WhatsApp
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)}`;
        window.open(whatsappUrl, '_blank');
    }
}


// Initialize Background & Ambience
applyBackground();

if (state.settings.ramadanMode) document.body.classList.add('ramadan-mode');
if (state.settings.focusMode) document.body.classList.add('focus-mode');
if (new Date().getDay() === 5) document.body.classList.add('jummah-mode');

// Initialize legacy UI Theme only when no premium theme is active.
if (!localStorage.getItem('app_theme') && state.settings.uiTheme && state.settings.uiTheme !== 'default') {
    const themeMap = {
        serenity: 'theme-serenity', desert: 'theme-desert',
        night: 'theme-night', forest: 'theme-forest', ramadan: 'ramadan-mode'
    };
    if (themeMap[state.settings.uiTheme]) document.body.classList.add(themeMap[state.settings.uiTheme]);
}

// Initialize Read Mode
if (state.settings.readMode) {
    document.body.classList.add('read-mode');
    startEyeBreakTimer();
}

// Light mode class for sync button visibility
function updateThemeClass() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }
}
updateThemeClass();
