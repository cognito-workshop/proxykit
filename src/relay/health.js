export class HealthChecker {
  constructor(registry) {
    this.registry = registry;
    this.interval = null;
    this.probeInterval = 30000;
    this.bandwidthInterval = 300000;
  }

  start() {
    this.interval = setInterval(() => this.checkAll(), this.probeInterval);
    this.checkAll();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async checkAll() {
    const servers = this.registry.getAllServers();

    for (const server of servers) {
      try {
        await this.probe(server);
        this.registry.markUnhealthy(server.id);
      } catch {
        const lastHeartbeat = server.lastHeartbeat || 0;
        const elapsed = Date.now() - lastHeartbeat;

        if (elapsed > 90000) {
          this.registry.markDead(server.id);
        } else if (elapsed > 60000) {
          this.registry.markUnhealthy(server.id);
        }
      }
    }
  }

  async probe(server) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const start = Date.now();
      const response = await fetch(server.url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      const latency = Date.now() - start;

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      this.registry.updateHeartbeat(server.id, { latency_ms: latency });
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
