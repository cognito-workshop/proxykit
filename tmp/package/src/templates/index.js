import { minimalFiles } from './minimal.js';
import { fullFiles } from './full.js';
import { cognitoFiles } from './cognito.js';

export function generateTemplateFiles(config, template) {
  switch (template) {
    case 'full':
      return fullFiles(config);
    case 'cognito':
      return cognitoFiles(config);
    case 'minimal':
    default:
      return minimalFiles(config);
  }
}
