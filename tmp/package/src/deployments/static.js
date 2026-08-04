export function staticFiles(config) {
  const readme = `# Static Proxy Build

This is a static build of your proxy. Upload the \`dist/\` folder to any static hosting service.

## Files

- \`src/\` - Client-side files (HTML, JS, CSS, service worker)
- \`dist/\` - Build output (ready to upload)

## Build

\`\`\`bash
npm run build
\`\`\`

## Upload

Upload the \`dist/\` folder to:
- GitHub Pages
- Netlify
- Surge.sh
- Any web server

## Notes

- This build does not include a Node.js server
- Transport must be \`direct\` for static deployments
- Service worker will handle proxy routing client-side
`;

  const buildScript = `#!/bin/bash

set -e

echo "Building static proxy..."

mkdir -p dist

# Copy source files
cp -r src/* dist/

# Generate service worker manifest
cat > dist/sw-manifest.json << EOF
{
  "version": "0.1.0",
  "engine": "${config.proxy.engine}",
  "transport": "${config.proxy.transport}",
  "prefix": "${config.proxy.prefix}"
}
EOF

echo "Build complete! Output in dist/"
`;

  return [
    { path: 'scripts/build.sh', content: buildScript },
    { path: 'docs/DEPLOY.md', content: readme },
  ];
}
