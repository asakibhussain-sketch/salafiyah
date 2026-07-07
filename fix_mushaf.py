import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix mushaf_page
content = re.sub(r"localStorage\.setItem\('mushaf_page',\s*(.*?)\);", r"if (window.settingsManager) window.settingsManager.set('quran', 'lastRead', { ...(window.settingsManager.get('quran', 'lastRead') || {}), page: \1 });", content)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
