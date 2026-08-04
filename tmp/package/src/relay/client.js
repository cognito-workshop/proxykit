export class RelayClient {
  constructor(options = {}) {
    this.registryUrl = options.registryUrl || 'http://localhost:3000';
    this.region = options.region || null;
    this.transport = options.transport || 'wisp';
    this.limit = options.limit || 3;
  }

  async getBestServer() {
    const servers = await this.getServers();
    return servers[0] || null;
  }

  async getServers() {
    const params = new URLSearchParams();
    if (this.region) params.set('region', this.region);
    if (this.transport) params.set('transport', this.transport);
    params.set('limit', String(this.limit));

    const url = `${this.registryUrl}/v1/connect?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Registry query failed: ${response.status}`);
    }

    const data = await response.json();
    return data.servers || [];
  }

  async register(options) {
    const { url, region, capacity, authToken } = options;

    const response = await fetch(`${this.registryUrl}/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        region,
        capacity,
        auth_token: authToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    return response.json();
  }

  async heartbeat(options) {
    const { serverId, authToken, stats } = options;

    const response = await fetch(`${this.registryUrl}/v1/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        server_id: serverId,
        auth_token: authToken,
        stats,
      }),
    });

    if (!response.ok) {
      throw new Error(`Heartbeat failed: ${response.status}`);
    }

    return response.json();
  }

  async deregister(options) {
    const { serverId, authToken } = options;

    const response = await fetch(`${this.registryUrl}/v1/deregister`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        server_id: serverId,
        auth_token: authToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Deregistration failed: ${response.status}`);
    }

    return response.json();
  }
}
