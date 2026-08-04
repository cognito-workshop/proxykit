const VALID_ENGINES = ['ultraviolet', 'scramjet', 'rammerhead'];
const VALID_TRANSPORTS = ['wisp', 'bare', 'epoxy', 'direct'];
const VALID_MUX = ['baremux', 'none', null];
const VALID_DEPLOYMENTS = ['docker-caddy', 'docker-nginx', 'cloudflare-pages', 'vercel', 'static'];
const VALID_TEMPLATES = ['minimal', 'full', 'cognito'];

const INCOMPATIBLE_COMBOS = [
  {
    engine: 'rammerhead',
    transport: 'wisp',
    reason: 'Rammerhead uses session-based routing, not Wisp transport',
  },
  {
    engine: 'rammerhead',
    transport: 'bare',
    reason: 'Rammerhead uses session-based routing, not Bare transport',
  },
  {
    engine: 'rammerhead',
    transport: 'epoxy',
    reason: 'Rammerhead uses session-based routing, not Epoxy transport',
  },
  {
    deployment: 'static',
    transport: 'wisp',
    reason: 'Static deployments cannot run a Wisp server',
  },
  {
    deployment: 'static',
    transport: 'bare',
    reason: 'Static deployments cannot run a Bare server',
  },
  {
    deployment: 'cloudflare-pages',
    transport: 'wisp',
    reason: 'Cloudflare Pages cannot run a Wisp server',
  },
  {
    deployment: 'vercel',
    transport: 'wisp',
    reason: 'Vercel cannot run a Wisp server',
  },
  {
    deployment: 'cloudflare-pages',
    mux: 'baremux',
    reason: 'Cloudflare Pages cannot run BareMux',
  },
  {
    deployment: 'vercel',
    mux: 'baremux',
    reason: 'Vercel cannot run BareMux',
  },
];

export function validateConfig(config) {
  const errors = [];

  if (!VALID_ENGINES.includes(config.proxy.engine)) {
    errors.push(`Invalid engine: ${config.proxy.engine}. Must be one of: ${VALID_ENGINES.join(', ')}`);
  }

  if (!VALID_TRANSPORTS.includes(config.proxy.transport)) {
    errors.push(`Invalid transport: ${config.proxy.transport}. Must be one of: ${VALID_TRANSPORTS.join(', ')}`);
  }

  if (!VALID_MUX.includes(config.proxy.mux)) {
    errors.push(`Invalid mux: ${config.proxy.mux}. Must be one of: ${VALID_MUX.join(', ')}`);
  }

  if (!VALID_DEPLOYMENTS.includes(config.deployment)) {
    errors.push(`Invalid deployment: ${config.deployment}. Must be one of: ${VALID_DEPLOYMENTS.join(', ')}`);
  }

  if (!VALID_TEMPLATES.includes(config.template)) {
    errors.push(`Invalid template: ${config.template}. Must be one of: ${VALID_TEMPLATES.join(', ')}`);
  }

  for (const combo of INCOMPATIBLE_COMBOS) {
    const matchesEngine = !combo.engine || combo.engine === config.proxy.engine;
    const matchesTransport = !combo.transport || combo.transport === config.proxy.transport;
    const matchesMux = !combo.mux || combo.mux === config.proxy.mux;
    const matchesDeployment = !combo.deployment || combo.deployment === config.deployment;

    if (matchesEngine && matchesTransport && matchesMux && matchesDeployment) {
      errors.push(combo.reason);
    }
  }

  return errors;
}

export function getValidChoices() {
  return {
    engines: VALID_ENGINES,
    transports: VALID_TRANSPORTS,
    mux: VALID_MUX,
    deployments: VALID_DEPLOYMENTS,
    templates: VALID_TEMPLATES,
  };
}

export function getRecommendedTransport(engine) {
  switch (engine) {
    case 'rammerhead':
      return 'direct';
    case 'ultraviolet':
    case 'scramjet':
    default:
      return 'wisp';
  }
}

export function getRecommendedDeployment(transport) {
  switch (transport) {
    case 'wisp':
      return 'docker-caddy';
    case 'bare':
    case 'epoxy':
      return 'docker-nginx';
    case 'direct':
      return 'static';
    default:
      return 'docker-caddy';
  }
}
