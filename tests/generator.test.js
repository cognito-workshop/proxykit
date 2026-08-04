import { describe, it } from 'node:test';
import assert from 'node:assert';
import { collectFiles } from '../src/generator.js';

describe('collectFiles', () => {
  it('generates files for ultraviolet + wisp + docker-caddy + minimal', async () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux', prefix: '/service/', bare: '/bare/', relay: '/v1/connect' },
      server: { port: 8080, hostname: 'localhost' },
      deployment: 'docker-caddy',
      template: 'minimal',
      theme: 'dark',
    };
    const files = await collectFiles('test', config, 'minimal');
    assert.ok(files.length > 0);
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes('src/config.js'));
    assert.ok(paths.includes('package.json'));
    assert.ok(paths.includes('src/sw.js'));
    assert.ok(paths.includes('docker/Dockerfile'));
    assert.ok(paths.includes('Caddyfile'));
  });

  it('generates files for scramjet + bare + docker-nginx + full', async () => {
    const config = {
      proxy: { engine: 'scramjet', transport: 'bare', mux: null, prefix: '/service/', bare: '/bare/', relay: '/v1/connect' },
      server: { port: 8080, hostname: 'localhost' },
      deployment: 'docker-nginx',
      template: 'full',
      theme: 'dark',
    };
    const files = await collectFiles('test', config, 'full');
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes('nginx.conf'));
    assert.ok(paths.includes('src/settings.html'));
    assert.ok(paths.includes('src/assets/settings.js'));
  });

  it('generates files for rammerhead + direct + static + minimal', async () => {
    const config = {
      proxy: { engine: 'rammerhead', transport: 'direct', mux: null, prefix: '/service/', bare: '/bare/', relay: '/v1/connect' },
      server: { port: 8080, hostname: 'localhost' },
      deployment: 'static',
      template: 'minimal',
      theme: 'dark',
    };
    const files = await collectFiles('test', config, 'minimal');
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes('scripts/build.sh'));
    assert.ok(paths.includes('server/rammerhead-config.js'));
  });

  it('generates files for cognito template', async () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux', prefix: '/service/', bare: '/bare/', relay: '/v1/connect' },
      server: { port: 8080, hostname: 'localhost' },
      deployment: 'docker-caddy',
      template: 'cognito',
      theme: 'dark',
    };
    const files = await collectFiles('test', config, 'cognito');
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes('src/assets/relay-client.js'));
  });

  it('includes theme CSS in files', async () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux', prefix: '/service/', bare: '/bare/', relay: '/v1/connect' },
      server: { port: 8080, hostname: 'localhost' },
      deployment: 'docker-caddy',
      template: 'minimal',
      theme: 'midnight',
    };
    const files = await collectFiles('test', config, 'minimal');
    const cssFile = files.find((f) => f.path === 'src/assets/index.css');
    assert.ok(cssFile);
    assert.ok(cssFile.content.includes('#0a0a1a'));
  });
});
