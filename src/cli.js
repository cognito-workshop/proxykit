#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { runInit } from './commands/init.js';

const HELP = `
proxykit - scaffold production-ready web proxies

Usage:
  npx proxykit init [options]

Options:
  --name <name>           Project name
  --engine <engine>       Proxy engine: ultraviolet | scramjet | rammerhead
  --transport <transport> Transport: wisp | bare | epoxy | direct
  --mux <mux>             Mux layer: baremux | none
  --deployment <target>   Deployment: docker-caddy | docker-nginx | cloudflare-pages | vercel | static
  --template <template>   Template: minimal | full | cognito
  --theme <theme>         Theme: dark | midnight | forest | sunset | ocean | light
  --git                   Initialize git repo (default: true)
  --no-git                Skip git init
  --yes                   Skip prompts, use defaults (non-interactive)
  --help                  Show this message
  --version               Show version
`;

const { values, positionals } = parseArgs({
  options: {
    name:       { type: 'string' },
    engine:     { type: 'string' },
    transport:  { type: 'string' },
    mux:        { type: 'string' },
    deployment: { type: 'string' },
    template:   { type: 'string' },
    theme:      { type: 'string' },
    git:        { type: 'boolean', default: true },
    'no-git':   { type: 'boolean', default: false },
    yes:        { type: 'boolean', default: false },
    help:       { type: 'boolean', short: 'h', default: false },
    version:    { type: 'boolean', short: 'v', default: false },
  },
  allowPositionals: true,
  strict: false,
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (values.version) {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const pkg = require('../package.json');
  console.log(pkg.version);
  process.exit(0);
}

const command = positionals[0] || 'init';

if (command === 'init') {
  const opts = {
    ...values,
    git: values['no-git'] ? false : values.git,
  };

  if (opts.yes) {
    await runInit(opts);
  } else {
    const { runTui } = await import('./tui/index.js');
    await runTui(opts);
  }
} else {
  console.error(`Unknown command: ${command}`);
  console.log(HELP);
  process.exit(1);
}
