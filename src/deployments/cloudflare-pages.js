export function cloudflarePagesFiles(config) {
  const workerJs = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy routing
    if (url.pathname.startsWith('${config.proxy.prefix}')) {
      return handleProxy(request, env);
    }

    // Static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleProxy(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.slice('${config.proxy.prefix}'.length);

  // Decode the target URL
  let target;
  try {
    target = decodeURIComponent(path);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const headers = new Headers(request.headers);
    headers.delete('host');

    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response('Bad Gateway', { status: 502 });
  }
}
`;

  const wranglerToml = `name = "proxy"
main = "_worker.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./src"
`;

  const packageJson = `{
  "name": "proxy",
  "scripts": {
    "dev": "wrangler pages dev src",
    "deploy": "wrangler pages deploy src"
  },
  "devDependencies": {
    "wrangler": "^3.0.0"
  }
}
`;

  return [
    { path: '_worker.js', content: workerJs },
    { path: 'wrangler.toml', content: wranglerToml },
    { path: 'package.json', content: packageJson },
  ];
}
