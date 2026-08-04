export function wispFiles(config) {
  const wispServerCode = `import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { createWispStream } from '@aspect-build/wisp';

const PORT = process.env.WISP_PORT || 6543;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Wisp Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const stream = createWispStream(ws);

  stream.on('error', (err) => {
    console.error('Wisp stream error:', err.message);
  });

  ws.on('close', () => {
    stream.destroy();
  });
});

server.listen(PORT, () => {
  console.log(\`Wisp server listening on port \${PORT}\`);
});
`;

  const serverEntry = `import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { createWispStream } from '@aspect-build/wisp';
import config from '../src/config.js';

const app = express();
const server = createServer(app);

// Serve static files
app.use(express.static('src'));

// Wisp WebSocket endpoint
const wss = new WebSocketServer({ server, path: '/wisp' });

wss.on('connection', (ws) => {
  const stream = createWispStream(ws);
  stream.on('error', (err) => {
    console.error('Wisp error:', err.message);
  });
  ws.on('close', () => stream.destroy());
});

const PORT = config.server.port;
const HOSTNAME = config.server.hostname;

server.listen(PORT, HOSTNAME, () => {
  console.log(\`Server running at http://\${HOSTNAME}:\${PORT}\`);
});
`;

  return [
    { path: 'server/wisp.js', content: wispServerCode },
    { path: 'server/index.js', content: serverEntry },
  ];
}
