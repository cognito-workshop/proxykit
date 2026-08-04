import { ultravioletFiles } from './ultraviolet.js';
import { scramjetFiles } from './scramjet.js';
import { rammerheadFiles } from './rammerhead.js';

export function generateEngineFiles(config) {
  switch (config.proxy.engine) {
    case 'ultraviolet':
      return ultravioletFiles(config);
    case 'scramjet':
      return scramjetFiles(config);
    case 'rammerhead':
      return rammerheadFiles(config);
    default:
      return ultravioletFiles(config);
  }
}
