export function dockerNginxFiles(config) {
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

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - proxy
    restart: unless-stopped
`;

  const nginxConf = `server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://proxy:${config.server.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy no-referrer always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
`;

  return [
    { path: 'docker/Dockerfile', content: dockerfile },
    { path: 'docker/docker-compose.yml', content: compose },
    { path: 'nginx.conf', content: nginxConf },
  ];
}
