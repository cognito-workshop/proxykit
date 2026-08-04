import { dockerCaddyFiles } from './docker-caddy.js';
import { dockerNginxFiles } from './docker-nginx.js';
import { cloudflarePagesFiles } from './cloudflare-pages.js';
import { vercelFiles } from './vercel.js';
import { staticFiles } from './static.js';

export function generateDeploymentFiles(config) {
  switch (config.deployment) {
    case 'docker-caddy':
      return dockerCaddyFiles(config);
    case 'docker-nginx':
      return dockerNginxFiles(config);
    case 'cloudflare-pages':
      return cloudflarePagesFiles(config);
    case 'vercel':
      return vercelFiles(config);
    case 'static':
      return staticFiles(config);
    default:
      return dockerCaddyFiles(config);
  }
}
