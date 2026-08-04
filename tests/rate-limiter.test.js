import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RateLimiter } from '../src/relay/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows requests within limit', () => {
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 3 });
    assert.ok(limiter.check('ip1'));
    assert.ok(limiter.check('ip1'));
    assert.ok(limiter.check('ip1'));
  });

  it('blocks requests over limit', () => {
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 2 });
    assert.ok(limiter.check('ip1'));
    assert.ok(limiter.check('ip1'));
    assert.ok(!limiter.check('ip1'));
  });

  it('tracks different clients separately', () => {
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 1 });
    assert.ok(limiter.check('ip1'));
    assert.ok(limiter.check('ip2'));
    assert.ok(!limiter.check('ip1'));
    assert.ok(!limiter.check('ip2'));
  });

  it('returns stats', () => {
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });
    limiter.check('ip1');
    const stats = limiter.getStats();
    assert.strictEqual(stats.maxRequests, 100);
    assert.strictEqual(stats.windowMs, 60000);
    assert.strictEqual(stats.trackedClients, 1);
  });
});
