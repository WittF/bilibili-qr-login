import { isIP } from 'node:net';
import tls from 'node:tls';
import { Agent, Dispatcher, ProxyAgent } from 'undici';
import { SocksClient } from 'socks';
import type { Socket } from 'node:net';
import type { TLSSocket } from 'node:tls';

type NoProxyRule = {
  host: string;
  port?: number;
  isWildcard: boolean;
  isIp: boolean;
};

type ProxyEnv = {
  httpsProxy: string;
  httpProxy: string;
  allProxy: string;
  noProxy: string;
};

type ProxyState = {
  dispatcher: Dispatcher | null;
  env: ProxyEnv;
  active: {
    https: boolean;
    http: boolean;
    all: boolean;
  };
};

let cached: ProxyState | undefined;

function readProxyEnv(): ProxyEnv {
  return {
    httpsProxy: process.env.https_proxy ?? process.env.HTTPS_PROXY ?? '',
    httpProxy: process.env.http_proxy ?? process.env.HTTP_PROXY ?? '',
    allProxy: process.env.all_proxy ?? process.env.ALL_PROXY ?? '',
    noProxy: process.env.no_proxy ?? process.env.NO_PROXY ?? '',
  };
}

export function redact(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.username || url.password) {
      url.username = '';
      url.password = '';
    }
    return url.toString();
  } catch {
    return '<invalid>';
  }
}

export function normalizeHost(host: string): string {
  const normalized = host
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase();
  if (!normalized.includes(':')) return normalized;

  try {
    return new URL(`http://[${normalized}]`).hostname.replace(/^\[|\]$/g, '').toLowerCase();
  } catch {
    return normalized;
  }
}

export function parseNoProxy(raw: string): NoProxyRule[] {
  if (!raw.trim()) return [];

  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(entry => {
      if (entry === '*') {
        return { host: '*', isWildcard: true, isIp: false };
      }

      let host = entry;
      let port: number | undefined;
      const bracketedIpv6 = entry.match(/^\[([^\]]+)\](?::(\d+))?$/);

      if (bracketedIpv6) {
        host = bracketedIpv6[1];
        if (bracketedIpv6[2]) port = Number(bracketedIpv6[2]);
      } else {
        const lastColon = entry.lastIndexOf(':');
        const hasSingleColon = lastColon === entry.indexOf(':');
        if (hasSingleColon && lastColon > -1 && /^\d+$/.test(entry.slice(lastColon + 1))) {
          host = entry.slice(0, lastColon);
          port = Number(entry.slice(lastColon + 1));
        }
      }

      host = normalizeHost(host.replace(/^\./, ''));
      const isIp = isIP(host) !== 0;
      return { host, port, isWildcard: false, isIp };
    });
}

export function matchesNoProxy(originHost: string, originPort: number, rules: NoProxyRule[]): boolean {
  const host = normalizeHost(originHost);

  for (const rule of rules) {
    if (rule.isWildcard) return true;
    if (rule.port !== undefined && rule.port !== originPort) continue;
    if (host === rule.host) return true;
    if (!rule.isIp && host.endsWith(`.${rule.host}`)) return true;
  }

  return false;
}

function makeSocksDispatcher(proxyUrl: URL): Dispatcher {
  return new Agent({
    connect: async (opts, callback) => {
      let settled = false;
      function done(err: Error, socket: null): void;
      function done(err: null, socket: Socket | TLSSocket): void;
      function done(err: Error | null, socket: Socket | TLSSocket | null): void {
        if (settled) return;
        settled = true;
        if (err) callback(err, null);
        else if (socket) callback(null, socket);
        else callback(new Error('SOCKS proxy connected without a socket'), null);
      }

      try {
        const { socket } = await SocksClient.createConnection({
          proxy: {
            host: proxyUrl.hostname,
            port: Number(proxyUrl.port) || 1080,
            type: 5,
            userId: decodeURIComponent(proxyUrl.username) || undefined,
            password: decodeURIComponent(proxyUrl.password) || undefined,
          },
          command: 'connect',
          destination: {
            host: opts.hostname,
            port: Number(opts.port) || (opts.protocol === 'https:' ? 443 : 80),
          },
        });

        if (opts.protocol !== 'https:') {
          done(null, socket);
          return;
        }

        const tlsSocket = tls.connect({
          socket,
          servername: opts.servername || opts.hostname,
          ALPNProtocols: ['http/1.1'],
        });
        const onError = (err: Error) => done(err, null);
        tlsSocket.once('error', onError);
        tlsSocket.once('secureConnect', () => {
          tlsSocket.removeListener('error', onError);
          done(null, tlsSocket);
        });
      } catch (err) {
        done(err as Error, null);
      }
    },
  });
}

function buildDispatcher(proxyUrl: string): Dispatcher | null {
  let url: URL;
  try {
    url = new URL(proxyUrl);
  } catch {
    console.warn(`[Proxy] 无法解析 ${redact(proxyUrl)}，已禁用此代理`);
    return null;
  }

  try {
    switch (url.protocol) {
      case 'http:':
      case 'https:':
        return new ProxyAgent({ uri: url.toString() });
      case 'socks:':
      case 'socks5:':
      case 'socks5h:':
        return makeSocksDispatcher(url);
      default:
        console.warn(`[Proxy] 不支持的代理协议: ${url.protocol}，已禁用此代理`);
        return null;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[Proxy] 创建代理失败 ${redact(proxyUrl)}: ${message}，已禁用此代理`);
    return null;
  }
}

class RoutingDispatcher extends Dispatcher {
  public constructor(
    private readonly httpsDispatcher: Dispatcher | null,
    private readonly httpDispatcher: Dispatcher | null,
    private readonly allDispatcher: Dispatcher | null,
    private readonly defaultDispatcher: Dispatcher,
    private readonly noProxyRules: NoProxyRule[],
  ) {
    super();
  }

  public dispatch(opts: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandlers): boolean {
    if (!opts.origin) return this.defaultDispatcher.dispatch(opts, handler);

    let origin: URL;
    try {
      origin = new URL(String(opts.origin));
    } catch {
      return this.defaultDispatcher.dispatch(opts, handler);
    }

    const port = Number(origin.port) || (origin.protocol === 'https:' ? 443 : 80);
    if (matchesNoProxy(origin.hostname, port, this.noProxyRules)) {
      return this.defaultDispatcher.dispatch(opts, handler);
    }

    const picked =
      origin.protocol === 'https:'
        ? this.httpsDispatcher ?? this.httpDispatcher ?? this.allDispatcher
        : this.httpDispatcher ?? this.allDispatcher;

    return (picked ?? this.defaultDispatcher).dispatch(opts, handler);
  }

  public close(): Promise<void>;
  public close(callback: () => void): void;
  public close(callback?: () => void): Promise<void> | void {
    const promise = Promise.all(this.all().map(dispatcher => dispatcher.close())).then(() => undefined);

    if (callback) {
      void promise.then(callback, callback);
      return;
    }

    return promise;
  }

  public destroy(): Promise<void>;
  public destroy(err: Error | null): Promise<void>;
  public destroy(callback: () => void): void;
  public destroy(err: Error | null, callback: () => void): void;
  public destroy(errOrCallback?: Error | null | (() => void), callback?: () => void): Promise<void> | void {
    const err = typeof errOrCallback === 'function' ? null : errOrCallback ?? null;
    const done = typeof errOrCallback === 'function' ? errOrCallback : callback;
    const promise = Promise.all(this.all().map(dispatcher => dispatcher.destroy(err))).then(() => undefined);

    if (done) {
      void promise.then(done, done);
      return;
    }

    return promise;
  }

  private all(): Dispatcher[] {
    return [this.httpsDispatcher, this.httpDispatcher, this.allDispatcher, this.defaultDispatcher].filter(
      (dispatcher): dispatcher is Dispatcher => dispatcher != null,
    );
  }
}

function createProxyState(): ProxyState {
  const env = readProxyEnv();

  if (!env.httpsProxy && !env.httpProxy && !env.allProxy) {
    return {
      dispatcher: null,
      env,
      active: { https: false, http: false, all: false },
    };
  }

  const httpsDispatcher = env.httpsProxy ? buildDispatcher(env.httpsProxy) : null;
  const httpDispatcher = env.httpProxy ? buildDispatcher(env.httpProxy) : null;
  const allDispatcher = env.allProxy ? buildDispatcher(env.allProxy) : null;

  if (!httpsDispatcher && !httpDispatcher && !allDispatcher) {
    return {
      dispatcher: null,
      env,
      active: { https: false, http: false, all: false },
    };
  }

  return {
    dispatcher: new RoutingDispatcher(
      httpsDispatcher,
      httpDispatcher,
      allDispatcher,
      new Agent(),
      parseNoProxy(env.noProxy),
    ),
    env,
    active: {
      https: httpsDispatcher != null,
      http: httpDispatcher != null,
      all: allDispatcher != null,
    },
  };
}

export function getProxyDispatcher(): Dispatcher | null {
  if (!cached) cached = createProxyState();
  return cached.dispatcher;
}

export function initProxy(): void {
  if (!cached) cached = createProxyState();
  if (!cached.dispatcher) return;

  const { env, active } = cached;
  if (active.https) console.log(`[Proxy] https_proxy=${redact(env.httpsProxy)}`);
  if (active.http) console.log(`[Proxy] http_proxy=${redact(env.httpProxy)}`);
  if (active.all) console.log(`[Proxy] all_proxy=${redact(env.allProxy)}`);
  if (env.noProxy) console.log(`[Proxy] no_proxy=${env.noProxy}`);
}
