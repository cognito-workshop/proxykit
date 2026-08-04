import { generateThemeCss } from '../lib/themes.js';

export function fullFiles(config) {
  const theme = config.theme || 'dark';

  const settingsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings</title>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div class="container">
    <h1>Settings</h1>
    <div class="settings-grid">
      <div class="setting-group">
        <label for="search-engine">Search Engine</label>
        <select id="search-engine">
          <option value="https://www.google.com/search?q=">Google</option>
          <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
          <option value="https://search.brave.com/search?q=">Brave</option>
          <option value="https://www.bing.com/search?q=">Bing</option>
        </select>
      </div>

      <div class="setting-group">
        <label for="theme">Theme</label>
        <select id="theme">
          <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
          <option value="midnight" ${theme === 'midnight' ? 'selected' : ''}>Midnight</option>
          <option value="forest" ${theme === 'forest' ? 'selected' : ''}>Forest</option>
          <option value="sunset" ${theme === 'sunset' ? 'selected' : ''}>Sunset</option>
          <option value="ocean" ${theme === 'ocean' ? 'selected' : ''}>Ocean</option>
          <option value="light" ${theme === 'light' ? 'selected' : ''}>Light</option>
        </select>
      </div>

      <div class="setting-group">
        <label for="proxy-mode">Proxy Mode</label>
        <select id="proxy-mode">
          <option value="standard">Standard</option>
          <option value="stealth">Stealth</option>
        </select>
      </div>
    </div>

    <div class="analytics">
      <h2>Analytics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value" id="total-visits">0</span>
          <span class="stat-label">Total Visits</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" id="active-sessions">0</span>
          <span class="stat-label">Active Sessions</span>
        </div>
      </div>
    </div>

    <a href="/" class="back-link">Back to Proxy</a>
  </div>
  <script src="/assets/settings.js" type="module"></script>
</body>
</html>
`;

  const settingsJs = `const STORAGE_KEY = 'proxy_settings';

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {
    searchEngine: 'https://www.google.com/search?q=',
    theme: '${theme}',
    proxyMode: 'standard',
  };
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function initSettings() {
  const settings = loadSettings();

  document.getElementById('search-engine').value = settings.searchEngine;
  document.getElementById('theme').value = settings.theme;
  document.getElementById('proxy-mode').value = settings.proxyMode;

  document.querySelectorAll('select').forEach((select) => {
    select.addEventListener('change', () => {
      settings.searchEngine = document.getElementById('search-engine').value;
      settings.theme = document.getElementById('theme').value;
      settings.proxyMode = document.getElementById('proxy-mode').value;
      saveSettings(settings);
      applyTheme(settings.theme);
    });
  });

  applyTheme(settings.theme);
}

async function applyTheme(theme) {
  try {
    const { getThemeCss } = await import('./themes.js');
    const style = document.getElementById('dynamic-theme');
    if (style) style.textContent = getThemeCss(theme);
  } catch {
    document.body.setAttribute('data-theme', theme);
  }
}

function loadAnalytics() {
  const stats = JSON.parse(localStorage.getItem('proxy_analytics') || '{}');
  document.getElementById('total-visits').textContent = stats.totalVisits || 0;
  document.getElementById('active-sessions').textContent = stats.activeSessions || 0;
}

document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  loadAnalytics();
});
`;

  const analyticsJs = `const ANALYTICS_KEY = 'proxy_analytics';

export function trackVisit(url) {
  const stats = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{"totalVisits":0,"visits":[]}');
  stats.totalVisits++;
  stats.visits.push({ url, timestamp: Date.now() });

  if (stats.visits.length > 100) {
    stats.visits = stats.visits.slice(-100);
  }

  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats));
}

export function getStats() {
  return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{"totalVisits":0,"visits":[]}');
}
`;

  const css = generateThemeCss(theme);

  const readme = `# ${config.proxy.engine} Proxy

A full-featured web proxy built with ProxyKit.

## Features

- Landing page with search
- Settings UI (search engine, theme, proxy mode)
- Analytics tracking
- Service worker based proxy

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Pages

- \`/\` - Landing page
- \`/settings\` - Settings UI

## Configuration

Edit \`src/config.js\` to change proxy settings.

## Themes

Available themes: dark, midnight, forest, sunset, ocean, light
Change in settings or edit \`src/config.js\`.
`;

  return [
    { path: 'src/settings.html', content: settingsHtml },
    { path: 'src/assets/settings.js', content: settingsJs },
    { path: 'src/assets/analytics.js', content: analyticsJs },
    { path: 'src/assets/index.css', content: css },
    { path: 'README.md', content: readme },
  ];
}
