export function rammerheadFiles(config) {
  const prefix = config.proxy.prefix;
  const sessionLength = 60;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rammerhead Proxy</title>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div class="container">
    <h1>Rammerhead Proxy</h1>
    <form id="proxy-form">
      <input type="text" id="url-input" placeholder="Enter URL..." autofocus>
      <button type="submit">Go</button>
    </form>
    <p class="hint">Sessions expire after ${sessionLength} minutes of inactivity.</p>
  </div>
  <script src="/assets/index.js" type="module"></script>
</body>
</html>
`;

  const sessionLifetimeMs = sessionLength * 60 * 1000;
  const clientJs = `document.getElementById('proxy-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('url-input');
  let url = input.value.trim();
  if (!url) return;

  if (!/^https?:\\/\\//.test(url)) {
    url = 'https://' + url;
  }

  const session = await createSession();
  window.location.href = '/${prefix}/' + session + '/' + encodeURIComponent(url);
});

async function createSession() {
  const res = await fetch('/${prefix}/new-session?sessionLifetime=${sessionLifetimeMs}', {
    method: 'GET',
  });
  const data = await res.json();
  return data.id;
}
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

.hint {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}
`;

  const serverConfig = `export const rammerheadConfig = {
  prefix: '${prefix}',
  sessionLifetime: ${sessionLength * 60 * 1000},
  blockList: [],
};
`;

  return [
    { path: 'src/index.html', content: indexHtml },
    { path: 'src/assets/index.js', content: clientJs },
    { path: 'src/assets/index.css', content: clientCss },
    { path: 'server/rammerhead-config.js', content: serverConfig },
  ];
}
