const THEMES = {
  dark: {
    name: 'dark',
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    border: '#333',
    text: '#e0e0e0',
    textMuted: '#666',
    primary: '#646cff',
    primaryHover: '#535bf2',
  },
  midnight: {
    name: 'midnight',
    bg: '#0a0a1a',
    surface: '#12122a',
    border: '#2a2a4a',
    text: '#e0e0ff',
    textMuted: '#7070a0',
    primary: '#7c7cff',
    primaryHover: '#6a6aee',
  },
  forest: {
    name: 'forest',
    bg: '#0a1a0a',
    surface: '#122a12',
    border: '#2a4a2a',
    text: '#e0ffe0',
    textMuted: '#70a070',
    primary: '#4caf50',
    primaryHover: '#43a047',
  },
  sunset: {
    name: 'sunset',
    bg: '#1a0a0a',
    surface: '#2a1212',
    border: '#4a2a2a',
    text: '#ffe0e0',
    textMuted: '#a07070',
    primary: '#ff6b6b',
    primaryHover: '#ee5a5a',
  },
  ocean: {
    name: 'ocean',
    bg: '#0a0a1a',
    surface: '#12122a',
    border: '#2a2a4a',
    text: '#e0f0ff',
    textMuted: '#7090b0',
    primary: '#42a5f5',
    primaryHover: '#1e88e5',
  },
  light: {
    name: 'light',
    bg: '#ffffff',
    surface: '#f5f5f5',
    border: '#e0e0e0',
    text: '#1a1a1a',
    textMuted: '#666',
    primary: '#646cff',
    primaryHover: '#535bf2',
  },
};

export function getTheme(name) {
  return THEMES[name] || THEMES.dark;
}

export function getThemeNames() {
  return Object.keys(THEMES);
}

export function generateThemeCss(theme) {
  const t = getTheme(theme);
  return `:root {
  --bg: ${t.bg};
  --surface: ${t.surface};
  --border: ${t.border};
  --text: ${t.text};
  --text-muted: ${t.textMuted};
  --primary: ${t.primary};
  --primary-hover: ${t.primaryHover};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

#proxy-form {
  display: flex;
  gap: 0.5rem;
}

#url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

#url-input:focus {
  border-color: var(--primary);
}

button {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: var(--primary-hover);
}

.hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.settings-grid {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: 500;
}

.setting-group select {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.back-link {
  display: inline-block;
  margin-top: 2rem;
  color: var(--primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
`;
}
