import { generateThemeCss } from '../lib/themes.js';

export function minimalFiles(config) {
  const theme = config.theme || 'dark';

  const readme = `# ${config.proxy.engine} Proxy

A minimal web proxy built with ProxyKit.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

Edit \`src/config.js\` to change proxy settings.

## Engine

- **Engine**: ${config.proxy.engine}
- **Transport**: ${config.proxy.transport}
- **Mux**: ${config.proxy.mux || 'none'}
- **Deployment**: ${config.deployment}
- **Theme**: ${theme}
`;

  const css = generateThemeCss(theme);

  return [
    { path: 'README.md', content: readme },
    { path: 'src/assets/index.css', content: css },
  ];
}
