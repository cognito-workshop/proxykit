export function ultravioletFiles(config) {
  const { prefix, bare } = config.proxy;
  const transport = config.proxy.transport;

  const swContent = `import { registerRoute } from 'workbox-core';
import { Ultraviolet } from '${prefix}uv.sw.js';

const uv = new Ultraviolet({
  prefix: '${prefix}',
  bare: '${bare}',
  config: {
    sw: '${prefix}sw.js',
    file: '${prefix}sw.js',
  },
});

uv.registerSW();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
`;

  const uvConfigContent = `export default {
  prefix: '${prefix}',
  bare: '${bare}',
  encodeUrl: Ultraviolet.encodeUrl,
};

if (typeof Ultraviolet !== 'undefined') {
  self.__uv$config = {
    prefix: '${prefix}',
    bare: '${bare}',
    sw: '${prefix}sw.js',
  };
}
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proxy</title>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div class="container">
    <h1>Web Proxy</h1>
    <form id="proxy-form">
      <input type="text" id="url-input" placeholder="Enter URL..." autofocus>
      <button type="submit">Go</button>
    </form>
  </div>
  <script src="/assets/index.js" type="module"></script>
</body>
</html>
`;

  const clientJs = `const swPath = '/service/sw.js';
const prefix = '/service/';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(swPath, { scope: prefix });
}

document.getElementById('proxy-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('url-input');
  let url = input.value.trim();
  if (!url) return;

  if (!/^https?:\\/\\//.test(url)) {
    url = 'https://' + url;
  }

  window.location.href = prefix + 'uv/' + url;
});
`;

  const clientCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f0f;
  color: #e0e0e0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fff;
}

#proxy-form {
  display: flex;
  gap: 0.5rem;
}

#url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

#url-input:focus {
  border-color: #646cff;
}

button {
  padding: 0.75rem 1.5rem;
  background: #646cff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #535bf2;
}
`;

  const uvProxyJs = `import { Ultraviolet } from '@titaniumnetwork-dev/ultraviolet';

const uv = new Ultraviolet({
  prefix: '${prefix}',
  bare: '${bare}',
});

export default uv;
`;

  return [
    { path: 'src/sw.js', content: swContent },
    { path: 'src/uv.config.js', content: uvConfigContent },
    { path: 'src/index.html', content: indexHtml },
    { path: 'src/assets/index.js', content: clientJs },
    { path: 'src/assets/index.css', content: clientCss },
    { path: 'server/uv-proxy.js', content: uvProxyJs },
  ];
}
