export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxRequests = options.maxRequests || 100;
    this.clients = new Map();
    this.interval = null;
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(() => this.cleanup(), this.windowMs);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  check(key) {
    const now = Date.now();
    const client = this.clients.get(key);

    if (!client || now - client.windowStart > this.windowMs) {
      this.clients.set(key, {
        windowStart: now,
        count: 1,
      });
      return true;
    }

    if (client.count >= this.maxRequests) {
      return false;
    }

    client.count++;
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, client] of this.clients) {
      if (now - client.windowStart > this.windowMs) {
        this.clients.delete(key);
      }
    }
  }

  getStats() {
    return {
      trackedClients: this.clients.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
    };
  }
}
