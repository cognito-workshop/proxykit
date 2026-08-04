declare namespace ProxyKit {
  type Engine = 'ultraviolet' | 'scramjet' | 'rammerhead';
  type Transport = 'wisp' | 'bare' | 'epoxy' | 'direct';
  type Mux = 'baremux' | null;
  type Deployment = 'docker-caddy' | 'docker-nginx' | 'cloudflare-pages' | 'vercel' | 'static';
  type Template = 'minimal' | 'full' | 'cognito';

  interface Config {
    proxy: {
      engine: Engine;
      transport: Transport;
      mux: Mux;
      prefix: string;
      bare: string;
      relay: string;
    };
    server: {
      port: number;
      hostname: string;
    };
    deployment: Deployment;
  }

  interface InitOptions {
    name?: string;
    engine?: Engine;
    transport?: Transport;
    mux?: Mux;
    deployment?: Deployment;
    template?: Template;
  }

  interface TemplateFile {
    path: string;
    content: string;
  }
}
