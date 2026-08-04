export function cognitoFiles(config) {
  const clientJs = `import { RelayClient } from './relay-client.js';

const relay = new RelayClient({
  registryUrl: '${config.proxy.relay}',
  region: 'us',
  transport: '${config.proxy.transport}',
});

let currentServer = null;

async function connectViaRelay() {
  try {
    currentServer = await relay.getBestServer();
    if (currentServer) {
      console.log('Connected to relay server:', currentServer.url);
      configureTransport(currentServer.url);
    } else {
      console.warn('No relay servers available, falling back to direct');
    }
  } catch (err) {
    console.error('Relay connection failed:', err);
  }
}

function configureTransport(wispUrl) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'CONFIGURE_TRANSPORT',
      wispUrl,
    });
  }
}

document.getElementById('proxy-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('url-input');
  let url = input.value.trim();
  if (!url) return;

  if (!/^https?:\\/\\//.test(url)) {
    url = 'https://' + url;
  }

  if (!currentServer) {
    await connectViaRelay();
  }

  window.location.href = '${config.proxy.prefix}uv/' + url;
});

document.addEventListener('DOMContentLoaded', connectViaRelay);
`;

  const relayClientJs = `export class RelayClient {
  constructor(options = {}) {
    this.registryUrl = options.registryUrl || 'http://localhost:3000';
    this.region = options.region || null;
    this.transport = options.transport || 'wisp';
    this.limit = options.limit || 3;
  }

  async getBestServer() {
    const servers = await this.getServers();
    return servers[0] || null;
  }

  async getServers() {
    const params = new URLSearchParams();
    if (this.region) params.set('region', this.region);
    if (this.transport) params.set('transport', this.transport);
    params.set('limit', String(this.limit));

    const url = \`\${this.registryUrl}/v1/connect?\${params}\`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(\`Registry query failed: \${response.status}\`);
    }

    const data = await response.json();
    return data.servers || [];
  }
}
`;

  const serverWispEntry = `import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { createWispStream } from '@aspect-build/wisp';
import config from '../src/config.js';

const app = express();
const server = createServer(app);

app.use(express.static('src'));

// Wisp endpoint with relay fallback
const wss = new WebSocketServer({ server, path: '/wisp' });

wss.on('connection', (ws) => {
  const stream = createWispStream(ws);
  stream.on('error', (err) => {
    console.error('Wisp error:', err.message);
  });
  ws.on('close', () => stream.destroy());
});

// Health endpoint for relay registration
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: config.proxy.engine });
});

const PORT = config.server.port;
const HOSTNAME = config.server.hostname;

server.listen(PORT, HOSTNAME, () => {
  console.log(\`Cognito proxy running at http://\${HOSTNAME}:\${PORT}\`);
  console.log(\`Register this server with Cognito Relay at \${config.proxy.relay}\`);
});
`;

  const dockerfile = `FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

EXPOSE ${config.server.port}

CMD ["node", "server/index.js"]
`;

  const compose = `services:
  proxy:
    build: .
    ports:
      - "\${PORT:-${config.server.port}}:${config.server.port}"
    environment:
      - PORT=${config.server.port}
      - HOSTNAME=0.0.0.0
      - NODE_ENV=production
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - proxy
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
`;

  const caddyfile = `:80 {
    reverse_proxy proxy:${config.server.port}

    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy no-referrer
    }

    encode gzip
}
`;

  const readme = `# Cognito Proxy

A Cognito-compatible web proxy with Relay integration.

## Features

- Automatic relay server discovery
- Health-aware server selection
- Failover to best available server
- Docker + Caddy deployment

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Cognito Relay

This proxy automatically connects to the Cognito Relay registry to find the best available Wisp server. If the primary server goes down, it fails over to the next best server transparently.

## Configuration

Edit \`src/config.js\` to change proxy settings.
- \`proxy.relay\` - Registry URL
- \`proxy.transport\` - Transport type (wisp, bare, epoxy, direct)
`;

  return [
    { path: 'src/assets/index.js', content: clientJs },
    { path: 'src/assets/relay-client.js', content: relayClientJs },
    { path: 'server/index.js', content: serverWispEntry },
    { path: 'docker/Dockerfile', content: dockerfile },
    { path: 'docker/docker-compose.yml', content: compose },
    { path: 'Caddyfile', content: caddyfile },
    { path: 'README.md', content: readme },
  ];
}
