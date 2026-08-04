import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTheme, getThemeNames, generateThemeCss } from '../src/lib/themes.js';

describe('getTheme', () => {
  it('returns dark theme by default', () => {
    const theme = getTheme('dark');
    assert.strictEqual(theme.name, 'dark');
    assert.strictEqual(theme.bg, '#0f0f0f');
  });

  it('returns midnight theme', () => {
    const theme = getTheme('midnight');
    assert.strictEqual(theme.name, 'midnight');
    assert.ok(theme.bg.includes('#0a0a1a'));
  });

  it('falls back to dark for unknown theme', () => {
    const theme = getTheme('unknown');
    assert.strictEqual(theme.name, 'dark');
  });
});

describe('getThemeNames', () => {
  it('returns all theme names', () => {
    const names = getThemeNames();
    assert.ok(names.includes('dark'));
    assert.ok(names.includes('midnight'));
    assert.ok(names.includes('forest'));
    assert.ok(names.includes('sunset'));
    assert.ok(names.includes('ocean'));
    assert.ok(names.includes('light'));
  });
});

describe('generateThemeCss', () => {
  it('generates CSS with custom properties', () => {
    const css = generateThemeCss('dark');
    assert.ok(css.includes('--bg:'));
    assert.ok(css.includes('--surface:'));
    assert.ok(css.includes('--primary:'));
  });

  it('includes base styles', () => {
    const css = generateThemeCss('dark');
    assert.ok(css.includes('margin: 0'));
    assert.ok(css.includes('box-sizing: border-box'));
    assert.ok(css.includes('font-family'));
  });
});
