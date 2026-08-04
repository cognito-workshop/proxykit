export function dockerCaddyFiles(config) {
  const dockerfile = `FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN npm run build 2>/dev/null || true

EXPOSE ${config.server.port}

CMD ["node", "server/index.js"]
`;

  const compose = `services:
  proxy:
    build: .
    ports:
      - "\${PORT:-${config.server.port}}:${config.server.port}"
    environment:
      - PORT=${config.server.port}
      - HOSTNAME=0.0.0.0
      - NODE_ENV=production
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - proxy
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
`;

  const caddyfile = `:80 {
    reverse_proxy proxy:${config.server.port}

    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy no-referrer
    }

    encode gzip

    log {
        output stdout
    }
}
`;

  return [
    { path: 'docker/Dockerfile', content: dockerfile },
    { path: 'docker/docker-compose.yml', content: compose },
    { path: 'Caddyfile', content: caddyfile },
  ];
}
