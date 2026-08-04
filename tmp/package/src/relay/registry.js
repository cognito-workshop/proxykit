import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_FILE = path.join(process.cwd(), 'data', 'servers.json');

export class Registry {
  constructor() {
    this.servers = new Map();
  }

  async load() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      for (const server of parsed) {
        this.servers.set(server.id, server);
      }
    } catch {
      this.servers = new Map();
    }
  }

  async save() {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify([...this.servers.values()], null, 2));
  }

  addServer(server) {
    this.servers.set(server.id, server);
    this.save();
  }

  removeServer(id) {
    this.servers.delete(id);
    this.save();
  }

  getServer(id) {
    return this.servers.get(id);
  }

  getAllServers() {
    return [...this.servers.values()];
  }

  getHealthyServers() {
    return this.getAllServers().filter((s) => {
      if (s.status === 'dead') return false;
      if (!s.lastHeartbeat) return false;
      const elapsed = Date.now() - s.lastHeartbeat;
      return elapsed < 90000;
    });
  }

  updateHeartbeat(id, stats) {
    const server = this.servers.get(id);
    if (!server) return;

    server.lastHeartbeat = Date.now();
    server.status = 'healthy';
    if (stats) {
      server.stats = { ...server.stats, ...stats };
    }
    this.save();
  }

  markUnhealthy(id) {
    const server = this.servers.get(id);
    if (!server) return;

    server.status = 'unhealthy';
    this.save();
  }

  markDead(id) {
    const server = this.servers.get(id);
    if (!server) return;

    server.status = 'dead';
    this.save();
  }

  calculateScore(server) {
    const latency = server.stats?.latency_ms || 50;
    const bandwidth = server.stats?.bandwidth_mbps || 100;
    const load = server.stats?.load_pct || 50;
    const healthy = server.status === 'healthy' ? 1 : 0.1;

    return (1 / latency) * bandwidth * healthy * (1 - load / 100);
  }
}
