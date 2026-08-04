import fs from 'node:fs/promises';
import path from 'node:path';
import { generateEngineFiles } from './engines/index.js';
import { generateTransportFiles } from './transports/index.js';
import { generateDeploymentFiles } from './deployments/index.js';
import { generateTemplateFiles } from './templates/index.js';
import { dim } from './lib/colors.js';

export async function collectFiles(name, config, template) {
  const files = new Map();

  function addFile(relPath, content) {
    files.set(relPath, content);
  }

  addFile('src/config.js', generateConfig(config));
  addFile('.env.example', generateEnvExample(config));
  addFile('package.json', generatePackageJson(name, config));

  const engineFiles = generateEngineFiles(config);
  for (const f of engineFiles) addFile(f.path, f.content);

  const transportFiles = generateTransportFiles(config);
  for (const f of transportFiles) addFile(f.path, f.content);

  const deployFiles = generateDeploymentFiles(config);
  for (const f of deployFiles) addFile(f.path, f.content);

  const templateFiles = generateTemplateFiles(config, template);
  for (const f of templateFiles) addFile(f.path, f.content);

  return [...files.entries()].map(([path, content]) => ({ path, content }));
}

export async function generateProject(name, config, template) {
  const root = path.resolve(name);

  await fs.mkdir(root, { recursive: true });
  await fs.mkdir(path.join(root, 'src', 'assets'), { recursive: true });
  await fs.mkdir(path.join(root, 'server'), { recursive: true });

  const files = await collectFiles(name, config, template);

  for (const { path: relPath, content } of files) {
    const fullPath = path.join(root, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    console.log(`  ${dim('create')} ${relPath}`);
  }

  return root;
}

function generateConfig(config) {
  return `export default {
  proxy: {
    engine: '${config.proxy.engine}',
    transport: '${config.proxy.transport}',
    mux: ${config.proxy.mux ? `'${config.proxy.mux}'` : 'null'},
    prefix: '${config.proxy.prefix}',
    bare: '${config.proxy.bare}',
    relay: '${config.proxy.relay}',
  },
  server: {
    port: process.env.PORT || ${config.server.port},
    hostname: process.env.HOSTNAME || '${config.server.hostname}',
  },
  deployment: '${config.deployment}',
};
`;
}

function generateEnvExample(config) {
  const lines = [
    `PORT=${config.server.port}`,
    `HOSTNAME=${config.server.hostname}`,
    `NODE_ENV=production`,
  ];
  if (config.proxy.transport === 'wisp') {
    lines.push(`WISP_SERVER_URL=wss://wisp.example.com`);
  }
  if (config.template === 'cognito') {
    lines.push(`RELAY_AUTH_TOKEN=your-auth-token`);
  }
  return lines.join('\n') + '\n';
}

function generatePackageJson(name, config) {
  const deps = {};
  const scripts = { dev: 'node server/index.js', start: 'node server/index.js' };

  if (config.proxy.engine === 'ultraviolet') {
    deps['@titaniumnetwork-dev/ultraviolet'] = '^3.0.0';
  } else if (config.proxy.engine === 'scramjet') {
    deps['mercuryworkshop/scramjet'] = '*';
  } else if (config.proxy.engine === 'rammerhead') {
    deps['rammerhead'] = '*';
  }

  if (config.proxy.transport === 'wisp') {
    deps['@aspect-build/wisp'] = '*';
    deps['ws'] = '^8.0.0';
  } else if (config.proxy.transport === 'bare') {
    deps['@aspect-build/baremux'] = '*';
  } else if (config.proxy.transport === 'epoxy') {
    deps['epoxy-transport'] = '*';
  }

  if (config.proxy.mux === 'baremux') {
    deps['@aspect-build/baremux'] = '*';
  }

  deps['express'] = '^4.18.0';

  return JSON.stringify(
    {
      name,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts,
      dependencies: deps,
    },
    null,
    2
  ) + '\n';
}
