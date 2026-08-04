# proxykit

Scaffold production-ready web proxies. Like create-t3-app but for the proxy community.

```bash
npx proxykit init
```

![proxykit TUI](https://raw.githubusercontent.com/proxykit/proxykit/main/assets/tui-preview.png)

## Features

- **Interactive TUI** - Step-by-step wizard with arrow key navigation
- **3 Proxy Engines** - Ultraviolet, Scramjet, Rammerhead
- **4 Transports** - Wisp, Bare, Epoxy, Direct
- **5 Deployment Targets** - Docker+Caddy, Docker+Nginx, Cloudflare Pages, Vercel, Static
- **3 Templates** - Minimal, Full, Cognito
- **6 Themes** - Dark, Midnight, Forest, Sunset, Ocean, Light
- **Input Validation** - Rejects incompatible engine/transport combos
- **Git Init** - Auto-initialize git repository
- **Package Manager Detection** - npm, yarn, pnpm, bun
- **File Preview** - See all files before writing
- **Cognito Relay** - Centralized Wisp server registry with health checks

## Quick Start

```bash
npx proxykit init
```

Follow the interactive prompts:

```
? Project name: my-proxy
? Proxy engine: (1) Ultraviolet  (2) Scramjet  (3) Rammerhead
? Transport: (1) Wisp  (2) Bare  (3) Epoxy  (4) Direct
? Mux layer: (1) BareMux  (2) None
? Deployment target: (1) Docker+Caddy  (2) Docker+Nginx  (3) Cloudflare Pages  (4) Vercel  (5) Static
? Template: (1) Minimal  (2) Full  (3) Cognito
? Theme: (1) Dark  (2) Midnight  (3) Forest  (4) Sunset  (5) Ocean  (6) Light
? Initialize git repo? (1) Yes  (2) No
```

## CLI Options

### Non-interactive mode

```bash
npx proxykit init --yes \
  --name my-proxy \
  --engine ultraviolet \
  --transport wisp \
  --mux baremux \
  --deployment docker-caddy \
  --template minimal \
  --theme dark \
  --git
```

### All flags

| Flag | Description | Default |
|------|-------------|---------|
| `--name <name>` | Project name | `my-proxy` |
| `--engine <engine>` | Proxy engine | `ultraviolet` |
| `--transport <transport>` | Transport layer | auto-detected |
| `--mux <mux>` | Mux layer | `baremux` |
| `--deployment <target>` | Deployment target | auto-detected |
| `--template <template>` | Template variant | `minimal` |
| `--theme <theme>` | Color theme | `dark` |
| `--git` / `--no-git` | Initialize git repo | `true` |
| `--yes` / `-y` | Skip prompts, use defaults | `false` |
| `--help` / `-h` | Show help | |
| `--version` / `-v` | Show version | |

### Engine/Transport recommendations

The CLI recommends compatible combinations:

| Engine | Recommended Transport | Reason |
|--------|----------------------|--------|
| Ultraviolet | Wisp | Full feature support |
| Scramjet | Wisp | Full feature support |
| Rammerhead | Direct | Session-based, no WS needed |

| Transport | Recommended Deployment | Reason |
|-----------|----------------------|--------|
| Wisp | Docker+Caddy | Needs Node.js server |
| Bare | Docker+Nginx | Needs Node.js server |
| Epoxy | Docker+Nginx | Needs Node.js server |
| Direct | Static | No server required |

### Incompatible combinations

These combos are rejected with helpful errors:

- Rammerhead + Wisp/Bare/Epoxy (uses session routing)
- Static + Wisp/Bare (can't run servers)
- Cloudflare Pages + Wisp/Bare (can't run servers)
- Vercel + Wisp/Bare (can't run servers)

## Engines

| Engine | Type | Prefix | Notes |
|--------|------|--------|-------|
| **Ultraviolet** | Service Worker | `/service/uv/` | Most popular, full feature set |
| **Scramjet** | Service Worker | `/scramjet/` | Obfuscation-focused |
| **Rammerhead** | Session Proxy | `/service/` | Session-based routing |

### Ultraviolet

```js
// Generated sw.js
importScripts('/service/uv/uv.sw.js');

const uv = new Ultraviolet({
  prefix: '/service/',
  bare: '/bare/',
});
```

### Scramjet

```js
// Generated sw.js
const sjConfig = {
  prefix: '/scramjet/',
  wisp: 'ws://localhost:6543',
  codec: 'woff2',
};
```

### Rammerhead

```js
// Generated server config
export const rammerheadConfig = {
  prefix: '/service/',
  sessionLifetime: 3600000, // 1 hour
  blockList: [],
};
```

## Transports

| Transport | Client | Server | Notes |
|-----------|--------|--------|-------|
| **Wisp** | WebSocket | Node.js Wisp server | Most feature-rich |
| **Bare** | WebSocket | Express adapter | Browser-compatible |
| **Epoxy** | WASM | Express adapter | TLS in WASM |
| **Direct** | HTTP | None | Simplest option |

### Wisp

Requires a Wisp server. Generated server includes:

```js
// server/index.js
import { createWispStream } from '@aspect-build/wisp';

const wss = new WebSocketServer({ server, path: '/wisp' });
wss.on('connection', (ws) => {
  const stream = createWispStream(ws);
});
```

### Direct

No server-side WebSocket needed:

```js
// server/index.js
app.all('/proxy/*', async (req, res) => {
  const target = req.url.replace('/proxy/', '');
  const response = await fetch(target, { method: req.method });
  // ... pipe response
});
```

## Deployment Targets

### Docker + Caddy

```
my-proxy/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── Caddyfile
└── ...
```

```bash
cd my-proxy
docker compose up -d
```

### Docker + Nginx

```
my-proxy/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── nginx.conf
└── ...
```

### Cloudflare Pages

```
my-proxy/
├── _worker.js
├── wrangler.toml
└── ...
```

```bash
npx wrangler pages deploy src
```

### Vercel

```
my-proxy/
├── api/
│   └── proxy.js
├── vercel.json
└── ...
```

### Static

```
my-proxy/
├── scripts/
│   └── build.sh
├── docs/
│   └── DEPLOY.md
└── ...
```

```bash
npm run build
# Upload dist/ to any static host
```

## Templates

### Minimal

Bare essentials - search bar, service worker registration, basic styling.

```
src/
├── config.js
├── index.html
├── sw.js
└── assets/
    ├── index.css
    └── index.js
```

### Full

Complete proxy with landing page, settings UI, and analytics.

```
src/
├── config.js
├── index.html
├── settings.html
├── sw.js
└── assets/
    ├── index.css
    ├── index.js
    ├── settings.js
    └── analytics.js
```

Features:
- Search engine selector (Google, DuckDuckGo, Brave, Bing)
- Theme switcher (persists to localStorage)
- Proxy mode (standard/stealth)
- Visit analytics

### Cognito

Cognito Relay integration with automatic server discovery.

```
src/
├── config.js
├── index.html
├── sw.js
└── assets/
    ├── index.css
    ├── index.js
    └── relay-client.js
```

Features:
- Automatic Wisp server discovery
- Health-aware server selection
- Failover to best available server

## Themes

6 built-in themes with CSS custom properties:

| Theme | Background | Primary |
|-------|-----------|---------|
| **dark** | `#0f0f0f` | `#646cff` |
| **midnight** | `#0a0a1a` | `#7c7cff` |
| **forest** | `#0a1a0a` | `#4caf50` |
| **sunset** | `#1a0a0a` | `#ff6b6b` |
| **ocean** | `#0a0a1a` | `#42a5f5` |
| **light** | `#ffffff` | `#646cff` |

Custom CSS variables:

```css
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --border: #333;
  --text: #e0e0e0;
  --text-muted: #666;
  --primary: #646cff;
  --primary-hover: #535bf2;
}
```

## Cognito Relay

A centralized Wisp server registry with health checking and automatic failover.

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Proxy SW    │────▶│  Registry   │────▶│  Public Wisp │
│  (UV/SJ)    │     │  API        │     │  Servers     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │              ┌─────▼─────┐
       │              │  Health   │
       └──────────────│  Checks   │
                      └───────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/register` | Register a Wisp server |
| `POST` | `/v1/heartbeat` | Send health heartbeat |
| `GET` | `/v1/connect` | Query best servers |
| `DELETE` | `/v1/deregister` | Remove server |
| `GET` | `/v1/servers` | List all servers |
| `GET` | `/v1/stats` | Registry statistics |

### Client Query

```bash
GET /v1/connect?region=us&transport=wisp&limit=3

{
  "servers": [
    {
      "id": "srv_xxx",
      "url": "wss://wisp1.example.com",
      "region": "us-east",
      "score": 92.4,
      "latency_ms": 12,
      "bandwidth_gbps": 1.2,
      "load_pct": 34,
      "status": "healthy"
    }
  ]
}
```

### Scoring Formula

```
score = (1 / latency_ms) * bandwidth_gbps * health_flag * (1 - load_pct/100)
```

### Running the Relay

```bash
node src/relay/index.js --port 3000
```

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `RELAY_PORT` | Server port | `3000` |
| `RELAY_ADMIN_TOKEN` | Admin auth token | none |

### Rate Limiting

Built-in per-IP rate limiting:

- Default: 100 requests/minute per IP
- Configurable via `--rate-limit` flag
- Returns `429 Too Many Requests` with `Retry-After` header

## Generated Project Structure

```
my-proxy/
├── src/
│   ├── config.js           # Proxy configuration
│   ├── index.html          # Landing page
│   ├── sw.js               # Service worker
│   ├── uv.config.js        # Ultraviolet config (if UV engine)
│   ├── transport.js        # Transport client (if direct/epoxy)
│   └── assets/
│       ├── index.css       # Styles with theme
│       ├── index.js        # Client bundle
│       ├── settings.js     # Settings UI (full template)
│       ├── analytics.js    # Analytics (full template)
│       └── relay-client.js # Relay client (cognito template)
├── server/
│   ├── index.js            # Node.js entry point
│   ├── wisp.js             # Wisp server (if wisp transport)
│   └── rammerhead-config.js # Rammerhead config (if rammerhead)
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── Caddyfile               # or nginx.conf
├── package.json
├── .env.example
└── README.md
```

## Configuration

Generated `src/config.js`:

```js
export default {
  proxy: {
    engine: 'ultraviolet',
    transport: 'wisp',
    mux: 'baremux',
    prefix: '/service/',
    bare: '/bare/',
    relay: '/v1/connect',
  },
  server: {
    port: process.env.PORT || 8080,
    hostname: process.env.HOSTNAME || 'localhost',
  },
  deployment: 'docker-caddy',
};
```

## Development

```bash
# Clone the repo
git clone https://github.com/proxykit/proxykit.git
cd proxykit

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

```bash
npm test
```

Tests cover:
- Input validation
- Engine/transport compatibility
- Theme generation
- Rate limiter
- Package manager detection
- File generation

## Publishing

```bash
# Build and publish
npm run build
npm publish
```

The `prepublishOnly` script automatically runs `npm run build` before publishing.

## CI/CD

GitHub Actions workflows:

- **CI** (`ci.yml`) - Runs tests on Node 18, 20, 22
- **Publish** (`publish.yml`) - Publishes to npm on release

## License

MIT
