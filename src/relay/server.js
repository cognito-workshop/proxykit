import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Registry } from './registry.js';
import { HealthChecker } from './health.js';
import { RateLimiter } from './rate-limiter.js';

export class RelayServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.hostname = options.hostname || '0.0.0.0';
    this.registry = new Registry();
    this.healthChecker = new HealthChecker(this.registry);
    this.rateLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: options.rateLimit || 100,
    });
    this.authTokens = new Map();
    this.adminToken = options.adminToken || process.env.RELAY_ADMIN_TOKEN || null;
  }

  async start() {
    const server = createServer((req, res) => this.handleRequest(req, res));

    await this.registry.load();
    this.healthChecker.start();
    this.rateLimiter.start();

    server.listen(this.port, this.hostname, () => {
      console.log(`Cognito Relay listening on http://${this.hostname}:${this.port}`);
    });

    return server;
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    if (!this.rateLimiter.check(clientIp)) {
      res.writeHead(429, {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '60',
      });
      res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
      return;
    }

    try {
      if (url.pathname === '/v1/register' && req.method === 'POST') {
        return this.handleRegister(req, res, corsHeaders);
      }
      if (url.pathname === '/v1/heartbeat' && req.method === 'POST') {
        return this.handleHeartbeat(req, res, corsHeaders);
      }
      if (url.pathname === '/v1/connect' && req.method === 'GET') {
        return this.handleConnect(req, res, url, corsHeaders);
      }
      if (url.pathname === '/v1/deregister' && req.method === 'DELETE') {
        return this.handleDeregister(req, res, corsHeaders);
      }
      if (url.pathname === '/v1/servers' && req.method === 'GET') {
        return this.handleListServers(req, res, corsHeaders);
      }
      if (url.pathname === '/v1/stats' && req.method === 'GET') {
        return this.handleStats(req, res, corsHeaders);
      }

      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      console.error('Request error:', err);
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  async readBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  async handleRegister(req, res, headers) {
    const body = await this.readBody(req);
    const { url, region, capacity, auth_token } = body;

    if (!url || !auth_token) {
      res.writeHead(400, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url or auth_token' }));
      return;
    }

    try {
      new URL(url);
    } catch {
      res.writeHead(400, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid server URL' }));
      return;
    }

    const id = `srv_${randomUUID().slice(0, 12)}`;
    const server = {
      id,
      url,
      region: region || 'unknown',
      capacity: capacity || 1000,
      auth_token,
      registered: Date.now(),
      lastHeartbeat: null,
      status: 'pending',
      stats: {
        active_connections: 0,
        bandwidth_mbps: 0,
      },
    };

    this.registry.addServer(server);
    this.authTokens.set(id, auth_token);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, registered: true }));
  }

  async handleHeartbeat(req, res, headers) {
    const body = await this.readBody(req);
    const { server_id, auth_token, stats } = body;

    if (!server_id || !auth_token) {
      res.writeHead(400, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing server_id or auth_token' }));
      return;
    }

    const token = this.authTokens.get(server_id);
    if (token !== auth_token) {
      res.writeHead(401, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid auth token' }));
      return;
    }

    this.registry.updateHeartbeat(server_id, stats);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  }

  async handleConnect(req, res, url, headers) {
    const region = url.searchParams.get('region') || null;
    const transport = url.searchParams.get('transport') || null;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '3', 10), 10);

    let servers = this.registry.getHealthyServers();

    if (region) {
      servers = servers.filter((s) => s.region === region);
    }

    servers = servers
      .map((s) => ({
        ...s,
        score: this.registry.calculateScore(s),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ auth_token, ...rest }) => rest);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ servers }));
  }

  async handleDeregister(req, res, headers) {
    const body = await this.readBody(req);
    const { server_id, auth_token } = body;

    if (!server_id || !auth_token) {
      res.writeHead(400, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing server_id or auth_token' }));
      return;
    }

    const token = this.authTokens.get(server_id);
    if (token !== auth_token) {
      res.writeHead(401, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid auth token' }));
      return;
    }

    this.registry.removeServer(server_id);
    this.authTokens.delete(server_id);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ deregistered: true }));
  }

  async handleListServers(req, res, headers) {
    const servers = this.registry.getAllServers().map(({ auth_token, ...rest }) => rest);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ servers }));
  }

  async handleStats(req, res, headers) {
    const servers = this.registry.getAllServers();
    const healthy = servers.filter((s) => s.status === 'healthy').length;
    const total = servers.length;

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      servers: { total, healthy },
      uptime: process.uptime(),
      rateLimit: this.rateLimiter.getStats(),
    }));
  }
}
