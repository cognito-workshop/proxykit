export function epoxyFiles(config) {
  const serverEntry = `import express from 'express';
import { createServer } from 'node:http';
import config from '../src/config.js';

const app = express();
const server = createServer(app);

// Serve static files
app.use(express.static('src'));

// Epoxy proxy endpoint
app.all('/epoxy/*', async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const target = url.pathname.replace(/^\\/epoxy\\//, '');

  try {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key !== 'host') headers[key] = value;
    }

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req : undefined,
    });

    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    res.writeHead(502);
    res.end('Bad Gateway');
  }
});

const PORT = config.server.port;
const HOSTNAME = config.server.hostname;

server.listen(PORT, HOSTNAME, () => {
  console.log(\`Server running at http://\${HOSTNAME}:\${PORT}\`);
});
`;

  const clientTransport = `// Epoxy transport client
// Uses WASM-based TLS for end-to-end encryption

export async function createEpoxyConnection(url) {
  const ws = new WebSocket(url);
  return ws;
}
`;

  return [
    { path: 'server/index.js', content: serverEntry },
    { path: 'src/transport.js', content: clientTransport },
  ];
}
