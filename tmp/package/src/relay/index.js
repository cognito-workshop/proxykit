#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { RelayServer } from './server.js';

const { values } = parseArgs({
  options: {
    port:       { type: 'string', short: 'p' },
    hostname:   { type: 'string', short: 'h' },
    rateLimit:  { type: 'string', short: 'r' },
    adminToken: { type: 'string', short: 'a' },
    help:       { type: 'boolean', default: false },
  },
  strict: false,
});

if (values.help) {
  console.log(`
Cognito Relay - Centralized Wisp server registry

Usage:
  node relay/index.js [options]

Options:
  -p, --port <port>           Server port (default: 3000)
  -h, --hostname <host>       Bind address (default: 0.0.0.0)
  -r, --rate-limit <max>      Max requests per minute per IP (default: 100)
  -a, --admin-token <token>   Admin token for management API
  --help                      Show this message

Environment Variables:
  RELAY_ADMIN_TOKEN           Admin token (alternative to --admin-token)
  RELAY_PORT                  Server port (alternative to --port)
`);
  process.exit(0);
}

const server = new RelayServer({
  port: parseInt(values.port || process.env.RELAY_PORT || '3000', 10),
  hostname: values.hostname || '0.0.0.0',
  rateLimit: parseInt(values.rateLimit || '100', 10),
  adminToken: values.adminToken || process.env.RELAY_ADMIN_TOKEN,
});

await server.start();
