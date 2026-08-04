import fs from 'node:fs';
import path from 'node:path';

const MANAGERS = {
  npm: {
    lockfile: 'package-lock.json',
    installCmd: 'npm install',
    runCmd: 'npm run',
    createCmd: 'npx',
  },
  yarn: {
    lockfile: 'yarn.lock',
    installCmd: 'yarn install',
    runCmd: 'yarn',
    createCmd: 'yarn create',
  },
  pnpm: {
    lockfile: 'pnpm-lock.yaml',
    installCmd: 'pnpm install',
    runCmd: 'pnpm',
    createCmd: 'pnpm create',
  },
  bun: {
    lockfile: 'bun.lockb',
    installCmd: 'bun install',
    runCmd: 'bun run',
    createCmd: 'bunx',
  },
};

export function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.includes('yarn')) return MANAGERS.yarn;
  if (userAgent.includes('pnpm')) return MANAGERS.pnpm;
  if (userAgent.includes('bun')) return MANAGERS.bun;

  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    for (const [name, manager] of Object.entries(MANAGERS)) {
      if (fs.existsSync(path.join(dir, manager.lockfile))) {
        return manager;
      }
    }
    dir = path.dirname(dir);
  }

  return MANAGERS.npm;
}
