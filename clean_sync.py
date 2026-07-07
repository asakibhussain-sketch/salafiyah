import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove exact line calls to syncUserData()
content = re.sub(r'\n\s*syncUserData\(\);', '', content)
# Remove from window.app
content = re.sub(r'\s*syncUserData: \(\) => syncUserData\(\),', '', content)

# Remove the sync button block safely if it exists
btn_regex = r'<button class="btn-secondary" style="padding: 0\.5rem 1rem; font-size: 0\.75rem;" onclick="\$\{state\.user \? \'window\.app\.syncUserData\(\)\' : \'window\.app\.toggleAuth\(\)\'\}">\s*\$\{state\.user \? \'Sync Now\' : \'Sign In to Sync\'\}\s*</button>'
content = re.sub(btn_regex, '', content)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed syncUserData calls and button.")
