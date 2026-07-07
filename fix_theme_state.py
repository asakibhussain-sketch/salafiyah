import re

with open('theme-system.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Helper to add state.settings update
def add_state_update(content, func_name, state_key, val_var):
    pattern = r'(function ' + func_name + r'\(.*?\)\s*\{.*?)(if\s*\([^)]+\)\s*refreshSettingsPanel\(\);)'
    replacement = r'\1if (window.state && window.state.settings) { window.state.settings.' + state_key + r' = ' + val_var + r'; }\n    \2'
    return re.sub(pattern, replacement, content, flags=re.DOTALL)

content = add_state_update(content, 'setAnimationIntensity', 'animationIntensity', 'val')
content = add_state_update(content, 'setBlurIntensity', 'blurIntensity', 'val')
content = add_state_update(content, 'setCardRadius', 'cardRadius', 'val')
content = add_state_update(content, 'setFontScale', 'fontScale', 'val')
content = add_state_update(content, 'setDensity', 'uiDensity', 'normalized')
content = add_state_update(content, 'setAmbientEnabled', 'ambientEnabled', 'active')
content = add_state_update(content, 'setPatternEnabled', 'patternEnabled', 'active')
content = add_state_update(content, 'setImmersiveMode', 'immersiveMode', 'active')

# Dynamic Prayer Theme is slightly different
dyn_pattern = r'(function setDynamicPrayerTheme\(enabled\)\s*\{.*?)(refreshSettingsPanel\(\);)'
dyn_repl = r'\1if (window.state && window.state.settings) { window.state.settings.dynamicPrayerTheme = active; }\n    \2'
content = re.sub(dyn_pattern, dyn_repl, content, flags=re.DOTALL)

with open('theme-system.js', 'w', encoding='utf-8') as f:
    f.write(content)
