import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectPackageManager } from '../src/lib/package-manager.js';

describe('detectPackageManager', () => {
  it('returns a package manager object', () => {
    const pm = detectPackageManager();
    assert.ok(pm);
    assert.ok(pm.installCmd);
    assert.ok(pm.runCmd);
    assert.ok(pm.lockfile);
  });

  it('defaults to npm', () => {
    const pm = detectPackageManager();
    assert.strictEqual(pm.lockfile, 'package-lock.json');
  });
});
