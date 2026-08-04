import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

export function runTui(options = {}) {
  const { waitUntilExit } = render(React.createElement(App, { options }));
  return waitUntilExit();
}
