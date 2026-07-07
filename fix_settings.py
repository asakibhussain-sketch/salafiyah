import sys

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update button onclick handlers
content = content.replace('onclick="window.app.saveSettings()"', 'onclick="window.app.saveSettings(this)"')

# 2. Update saveSettings signature
content = content.replace('function saveSettings() {', 'function saveSettings(btn = null) {')

# 3. Update fetchPrayerTimes signature and prayerEngine.refresh call
old_fetch = '''async function fetchPrayerTimes() {
    // If the prayer engine is available, use it for a coordinate-based fetch
    if (window.prayerEngine) {
        try {
            await window.prayerEngine.refresh();'''

new_fetch = '''async function fetchPrayerTimes(force = false) {
    // If the prayer engine is available, use it for a coordinate-based fetch
    if (window.prayerEngine) {
        try {
            await window.prayerEngine.refresh(force);'''

content = content.replace(old_fetch, new_fetch)

# 4. Update saveSettings refetch logic and add visual feedback
old_save_end = '''    if (refetchRequired) {
        // Clear caches and force refetch
        if (window.prayerEngine) {
            localStorage.removeItem('salafiyah_timings_' + window.prayerEngine.todayKey());
        }
        fetchPrayerTimes();
    } else {
        fetchPrayerTimes();
    }
}'''

new_save_end = '''    if (refetchRequired) {
        fetchPrayerTimes(true);
    } else {
        fetchPrayerTimes(false);
    }

    if (btn && btn.tagName === 'BUTTON') {
        const originalText = btn.textContent;
        btn.textContent = '✓ Saved!';
        btn.style.backgroundColor = 'var(--accent-emerald)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }
}'''

content = content.replace(old_save_end, new_save_end)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
