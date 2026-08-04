export function vercelFiles(config) {
  const proxyHandler = `export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const target = decodeURIComponent(url);
    const headers = { ...req.headers };
    delete headers.host;

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req : undefined,
    });

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    const body = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(body));
  } catch (err) {
    res.status(502).json({ error: 'Bad Gateway' });
  }
}
`;

  const vercelJson = `{
  "version": 2,
  "rewrites": [
    { "source": "/${config.proxy.prefix}*", "destination": "/api/proxy" }
  ],
  "headers": [
    {
      "source": "/${config.proxy.prefix}(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
`;

  return [
    { path: 'api/proxy.js', content: proxyHandler },
    { path: 'vercel.json', content: vercelJson },
  ];
}
