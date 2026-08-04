import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateConfig, getRecommendedTransport, getRecommendedDeployment, getValidChoices } from '../src/lib/validate.js';

describe('validateConfig', () => {
  it('returns no errors for valid config', () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux' },
      deployment: 'docker-caddy',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.strictEqual(errors.length, 0);
  });

  it('returns error for invalid engine', () => {
    const config = {
      proxy: { engine: 'invalid', transport: 'wisp', mux: 'baremux' },
      deployment: 'docker-caddy',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.ok(errors.some((e) => e.includes('Invalid engine')));
  });

  it('returns error for invalid transport', () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'invalid', mux: 'baremux' },
      deployment: 'docker-caddy',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.ok(errors.some((e) => e.includes('Invalid transport')));
  });

  it('returns error for rammerhead + wisp combo', () => {
    const config = {
      proxy: { engine: 'rammerhead', transport: 'wisp', mux: null },
      deployment: 'docker-caddy',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.ok(errors.some((e) => e.includes('Rammerhead')));
  });

  it('returns error for static + wisp combo', () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux' },
      deployment: 'static',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.ok(errors.some((e) => e.includes('Static')));
  });

  it('returns error for cloudflare-pages + wisp combo', () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'wisp', mux: 'baremux' },
      deployment: 'cloudflare-pages',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.ok(errors.some((e) => e.includes('Cloudflare')));
  });

  it('allows direct transport with static deployment', () => {
    const config = {
      proxy: { engine: 'ultraviolet', transport: 'direct', mux: null },
      deployment: 'static',
      template: 'minimal',
    };
    const errors = validateConfig(config);
    assert.strictEqual(errors.length, 0);
  });
});

describe('getRecommendedTransport', () => {
  it('recommends direct for rammerhead', () => {
    assert.strictEqual(getRecommendedTransport('rammerhead'), 'direct');
  });

  it('recommends wisp for ultraviolet', () => {
    assert.strictEqual(getRecommendedTransport('ultraviolet'), 'wisp');
  });

  it('recommends wisp for scramjet', () => {
    assert.strictEqual(getRecommendedTransport('scramjet'), 'wisp');
  });
});

describe('getRecommendedDeployment', () => {
  it('recommends static for direct transport', () => {
    assert.strictEqual(getRecommendedDeployment('direct'), 'static');
  });

  it('recommends docker-caddy for wisp', () => {
    assert.strictEqual(getRecommendedDeployment('wisp'), 'docker-caddy');
  });

  it('recommends docker-nginx for bare', () => {
    assert.strictEqual(getRecommendedDeployment('bare'), 'docker-nginx');
  });
});

describe('getValidChoices', () => {
  it('returns all valid choices', () => {
    const choices = getValidChoices();
    assert.ok(choices.engines.includes('ultraviolet'));
    assert.ok(choices.transports.includes('wisp'));
    assert.ok(choices.deployments.includes('docker-caddy'));
    assert.ok(choices.templates.includes('minimal'));
  });
});
