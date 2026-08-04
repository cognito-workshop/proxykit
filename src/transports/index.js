import { wispFiles } from './wisp.js';
import { bareFiles } from './bare.js';
import { epoxyFiles } from './epoxy.js';
import { directFiles } from './direct.js';

export function generateTransportFiles(config) {
  switch (config.proxy.transport) {
    case 'wisp':
      return wispFiles(config);
    case 'bare':
      return bareFiles(config);
    case 'epoxy':
      return epoxyFiles(config);
    case 'direct':
      return directFiles(config);
    default:
      return wispFiles(config);
  }
}
