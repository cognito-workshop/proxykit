import readline from 'node:readline';
import { generateProject, collectFiles } from '../generator.js';
import { validateConfig, getRecommendedTransport, getRecommendedDeployment } from '../lib/validate.js';
import { detectPackageManager } from '../lib/package-manager.js';
import { bold, green, cyan, dim, yellow } from '../lib/colors.js';

export async function runInit(options = {}) {
  console.log(`\n${bold('proxykit')} ${dim('v0.1.0')}\n`);
  console.log('Scaffold a production-ready web proxy.\n');

  let answers = {};

  if (!options.yes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

    answers.name = (await ask(`Project name${options.name ? ` (${options.name})` : ''}: `)).trim() || options.name || 'my-proxy';

    console.log('\nProxy engine:');
    console.log('  1. ultraviolet (service worker, most features)');
    console.log('  2. scramjet (service worker, obfuscation)');
    console.log('  3. rammerhead (session-based routing)');
    const engineChoice = (await ask('Enter choice (1-3): ')).trim();
    const engines = ['ultraviolet', 'scramjet', 'rammerhead'];
    answers.engine = engines[parseInt(engineChoice, 10) - 1] || options.engine || 'ultraviolet';

    const recommendedTransport = getRecommendedTransport(answers.engine);
    console.log(`\nTransport (recommended: ${recommendedTransport}):`);
    console.log('  1. wisp (WebSocket, needs server)');
    console.log('  2. bare (browser WebSocket adapter)');
    console.log('  3. epoxy (WASM-based TLS)');
    console.log('  4. direct (simple HTTP proxy)');
    const transportChoice = (await ask('Enter choice (1-4): ')).trim();
    const transports = ['wisp', 'bare', 'epoxy', 'direct'];
    answers.transport = transports[parseInt(transportChoice, 10) - 1] || options.transport || recommendedTransport;

    console.log('\nMux layer:');
    console.log('  1. baremux (multiplexed connections)');
    console.log('  2. none (no mux)');
    const muxChoice = (await ask('Enter choice (1-2): ')).trim();
    const muxOptions = ['baremux', 'none'];
    answers.mux = muxOptions[parseInt(muxChoice, 10) - 1] || options.mux || 'baremux';

    const recommendedDeployment = getRecommendedDeployment(answers.transport);
    console.log(`\nDeployment target (recommended: ${recommendedDeployment}):`);
    console.log('  1. docker-caddy (Docker + Caddy reverse proxy)');
    console.log('  2. docker-nginx (Docker + Nginx reverse proxy)');
    console.log('  3. cloudflare-pages (Cloudflare Workers)');
    console.log('  4. vercel (Vercel serverless)');
    console.log('  5. static (static files, any host)');
    const deployChoice = (await ask('Enter choice (1-5): ')).trim();
    const deployments = ['docker-caddy', 'docker-nginx', 'cloudflare-pages', 'vercel', 'static'];
    answers.deployment = deployments[parseInt(deployChoice, 10) - 1] || options.deployment || recommendedDeployment;

    console.log('\nTemplate:');
    console.log('  1. minimal (essentials only)');
    console.log('  2. full (landing page, settings, analytics)');
    console.log('  3. cognito (Cognito Relay integration)');
    const templateChoice = (await ask('Enter choice (1-3): ')).trim();
    const templates = ['minimal', 'full', 'cognito'];
    answers.template = templates[parseInt(templateChoice, 10) - 1] || options.template || 'minimal';

    console.log('\nTheme:');
    console.log('  1. dark (default)');
    console.log('  2. midnight (purple hues)');
    console.log('  3. forest (green hues)');
    console.log('  4. sunset (red hues)');
    console.log('  5. ocean (blue hues)');
    console.log('  6. light (bright)');
    const themeChoice = (await ask('Enter choice (1-6): ')).trim();
    const themes = ['dark', 'midnight', 'forest', 'sunset', 'ocean', 'light'];
    answers.theme = themes[parseInt(themeChoice, 10) - 1] || options.theme || 'dark';

    answers.git = options.git !== false && ((await ask('\nInitialize git repo? (Y/n): ')).trim().toLowerCase() !== 'n');

    rl.close();
  } else {
    answers = {
      name: options.name || 'my-proxy',
      engine: options.engine || 'ultraviolet',
      transport: options.transport || 'wisp',
      mux: options.mux === 'none' ? null : (options.mux || 'baremux'),
      deployment: options.deployment || 'docker-caddy',
      template: options.template || 'minimal',
      theme: options.theme || 'dark',
      git: options.git !== false,
    };
  }

  if (answers.mux === 'none') answers.mux = null;

  const config = {
    proxy: {
      engine: answers.engine,
      transport: answers.transport,
      mux: answers.mux,
      prefix: '/service/',
      bare: '/bare/',
      relay: '/v1/connect',
    },
    server: {
      port: 8080,
      hostname: 'localhost',
    },
    deployment: answers.deployment,
    template: answers.template,
    theme: answers.theme,
  };

  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.log(`\n${yellow('Validation errors:')}`);
    for (const err of errors) {
      console.log(`  ${dim('•')} ${err}`);
    }
    console.log();
    process.exit(1);
  }

  const pkgManager = detectPackageManager();

  if (!options.yes) {
    console.log(`\n${dim('Files to create:')}`);
    const previewFiles = await collectFiles(answers.name, config, answers.template);
    for (const f of previewFiles.slice(0, 15)) {
      console.log(`  ${dim('•')} ${f.path}`);
    }
    if (previewFiles.length > 15) {
      console.log(`  ${dim(`... and ${previewFiles.length - 15} more`)}`);
    }

    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const confirm = await new Promise((resolve) => {
      rl2.question(`\n${bold('Create project?')} (Y/n): `, resolve);
    });
    rl2.close();

    if (confirm.trim().toLowerCase() === 'n') {
      console.log(dim('\nCancelled.'));
      process.exit(0);
    }
  }

  console.log();

  const projectDir = await generateProject(answers.name, config, answers.template);

  if (answers.git) {
    const { execSync } = await import('node:child_process');
    try {
      execSync('git init', { cwd: projectDir, stdio: 'ignore' });
      execSync('git add -A', { cwd: projectDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit from proxykit"', { cwd: projectDir, stdio: 'ignore' });
      console.log(`  ${dim('init')} git repository`);
    } catch {
      console.log(`  ${yellow('warn')} git init failed (git may not be installed)`);
    }
  }

  console.log(`\n${green('Done!')}\n`);
  console.log(`  cd ${cyan(answers.name)}`);
  console.log(`  ${pkgManager.installCmd}`);
  console.log(`  ${pkgManager.runCmd} dev`);
  console.log();
}
