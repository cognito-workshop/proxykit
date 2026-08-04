#!/usr/bin/env node

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);

let resolved;
try {
  resolved = require.resolve('../dist/cli.js');
} catch {
  console.error('proxykit is not built. Run `npm run build` first.');
  process.exit(1);
}

import(pathToFileURL(resolved).href);
