import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { signTVParams } from './sign.js';

/**
 * HTTP状态码说明：
 * 200: 请求成功
 * 403: 可能被风控或访问被拒绝
 * 429: 请求过于频繁，被限流
 * 500: 服务器内部错误
 * 502/503/504: 服务器临时不可用
 *
 * B站业务错误码会在日志中实时记录，具体含义需要根据实际返回情况分析
 * 设置 DEBUG=1 可查看所有请求和响应的详细信息
 *
 * Cookie验证功能日志层级：
 * - 普通模式：仅显示重要结果（验证开始/通过/未通过）
 * - DEBUG模式：显示详细过程（API调用、Cookie解析、错误分析等）
 */

// CORS配置
const TRUST_ORIGIN = process.env.TRUST_ORIGIN || (process.env.NODE_ENV === 'development' ? '*' : '');
const allowedOrigins = TRUST_ORIGIN.split(',')
  .map(s => s.trim())
  .filter(Boolean);
const ALLOW_ALL_ORIGINS = allowedOrigins.includes('*');

// CORS中间件
const corsMiddleware = async (c: any, next: any) => {
  await next();

  const origin = c.req.header('Origin');

  // 设置CORS头
  if (ALLOW_ALL_ORIGINS) {
    // 开发模式或明确配置为*时，允许所有来源
    if (origin === null || origin === 'null') {
      c.header('Access-Control-Allow-Origin', 'null');
    } else if (origin) {
      // 有具体origin时，使用该origin（不能用*与credentials同时使用）
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Vary', 'Origin');
    } else {
      // 无origin时，不设置任何Allow-Origin头
      return;
    }
  } else if (origin && allowedOrigins.includes(origin)) {
    // 生产模式下，只允许配置的域名
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
  } else if ((origin === null || origin === 'null') && process.env.NODE_ENV === 'development') {
    // 特殊处理：开发环境下允许null origin
    c.header('Access-Control-Allow-Origin', 'null');
  } else {
    // 不匹配的origin，不设置CORS头
    return;
  }

  // 设置其他CORS头（只有在允许origin的情况下才设置）
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400'); // 24小时
};

// 处理预检请求
const handlePreflight = (c: any) => {
  const origin = c.req.header('Origin');

  if (ALLOW_ALL_ORIGINS) {
    // 开发模式或明确配置为*时，允许所有来源
    if (origin === null || origin === 'null') {
      c.header('Access-Control-Allow-Origin', 'null');
    } else if (origin) {
      // 有具体origin时，使用该origin（不能用*与credentials同时使用）
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Vary', 'Origin');
    } else {
      // 无origin时，返回403
      return new Response(null, { status: 403 });
    }
  } else if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
  } else if ((origin === null || origin === 'null') && process.env.NODE_ENV === 'development') {
    // 特殊处理：开发环境下允许null origin
    c.header('Access-Control-Allow-Origin', 'null');
  } else {
    // 不匹配的origin，返回403
    return new Response(null, { status: 403 });
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400');

  return new Response(null, { status: 204 });
};

enum SSEEvent {
  GENERATE = 'generate',
  POLL = 'poll',
  END = 'end',
}

enum PollQrResultCode {
  SUCCESS = 0,
  EXPIRED = 86038,
  NOT_CONFIRMED = 86090,
  NOT_SCANNED = 86101,
}

const keepPollQrResultCode = new Set([PollQrResultCode.NOT_CONFIRMED, PollQrResultCode.NOT_SCANNED]);

// 添加状态码描述工具函数
const getQrStatusDescription = (code: number): string => {
  switch (code) {
    case PollQrResultCode.SUCCESS:
      return 'SUCCESS(登录成功)';
    case PollQrResultCode.EXPIRED:
      return 'EXPIRED(QR码已过期)';
    case PollQrResultCode.NOT_CONFIRMED:
      return 'NOT_CONFIRMED(已扫码未确认)';
    case PollQrResultCode.NOT_SCANNED:
      return 'NOT_SCANNED(未扫码)';
    default:
      return `UNKNOWN(${code})`;
  }
};

// 添加日志工具函数
const isDebugMode = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

// 格式化会话ID显示
const formatSessionId = (sessionId: number): string => {
  return `Client#${sessionId}`;
};

// 格式化中国标准时间
const getCSTTimestamp = (): string => {
  const now = new Date();
  // 转换为中国标准时间 (UTC+8)
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

  // 格式化为 YYYY-MM-DD HH:mm:ss.SSS CST
  const year = chinaTime.getUTCFullYear();
  const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(chinaTime.getUTCDate()).padStart(2, '0');
  const hour = String(chinaTime.getUTCHours()).padStart(2, '0');
  const minute = String(chinaTime.getUTCMinutes()).padStart(2, '0');
  const second = String(chinaTime.getUTCSeconds()).padStart(2, '0');
  const millisecond = String(chinaTime.getUTCMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond} CST`;
};

const logger = {
  // 调试信息 - 仅在DEBUG模式下显示
  debug: (sessionId: number, message: string, data?: any) => {
    if (isDebugMode) {
      const timestamp = getCSTTimestamp();
      console.log(`[${timestamp}] [${formatSessionId(sessionId)}] DEBUG: ${message}`, data ? JSON.stringify(data) : '');
    }
  },
  // 一般信息 - 仅在DEBUG模式下显示
  info: (sessionId: number, message: string, data?: any) => {
    if (isDebugMode) {
      const timestamp = getCSTTimestamp();
      console.log(`[${timestamp}] [${formatSessionId(sessionId)}] INFO: ${message}`, data ? JSON.stringify(data) : '');
    }
  },
  // 重要信息 - 始终显示
  important: (sessionId: number, message: string, data?: any) => {
    const timestamp = getCSTTimestamp();
    console.log(`[${timestamp}] [${formatSessionId(sessionId)}] INFO: ${message}`, data ? JSON.stringify(data) : '');
  },
  // 错误信息 - 始终显示
  error: (sessionId: number, message: string, error?: any) => {
    const timestamp = getCSTTimestamp();
    console.error(`[${timestamp}] [${formatSessionId(sessionId)}] ERROR: ${message}`, error);
  },
  // 警告信息 - 始终显示
  warn: (sessionId: number, message: string, data?: any) => {
    const timestamp = getCSTTimestamp();
    console.warn(`[${timestamp}] [${formatSessionId(sessionId)}] WARN: ${message}`, data ? JSON.stringify(data) : '');
  },
};

export const app = new Hono();

// 应用CORS中间件到所有路由
app.use('*', corsMiddleware);

// 处理所有API路由的预检请求
app.options('/api/*', handlePreflight);

// 添加cookie转换接口
app.post('/api/convert', async c => {
  const body = await c.req.json();
  const { cookies } = body;

  if (!cookies) {
    return c.json({ error: '无效的cookie数据' }, 400);
  }

  try {
    interface CookieItem {
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      httpOnly: boolean;
      secure: boolean;
      sameSite: string;
    }

    // 根据cookie名称猜测domain
    const guessDomain = (name: string): string => {
      if (name.startsWith('HMACCOUNT') || name.startsWith('Hm_')) {
        return '.hm.baidu.com';
      }

      if (
        name.includes('bili_') ||
        name.includes('SESSDATA') ||
        name.includes('DedeUserID') ||
        name.includes('buvid') ||
        name === 'sid' ||
        name === 'fingerprint' ||
        name === 'b_lsid' ||
        name === 'b_nut' ||
        name === '_uuid'
      ) {
        // 对于B站相关cookie，根据名称进一步区分
        if (name.includes('comic')) {
          return '.bilicomic.com';
        } else if (name.includes('game')) {
          return '.biligame.com';
        } else {
          return '.bilibili.com';
        }
      }

      return body.domain || '.bilibili.com';
    };

    let cookieArray: CookieItem[] = [];

    // 处理字符串格式的cookies
    if (typeof cookies === 'string') {
      cookieArray = cookies.split('; ').map((cookie: string) => {
        const [name, value] = cookie.split('=');
        const domain = guessDomain(name);

        // 根据cookie名称和domain设置适当的属性
        let httpOnly = false;
        let secure = false;
        let sameSite = 'Lax';

        // SESSDATA通常是httpOnly和secure的
        if (name === 'SESSDATA') {
          httpOnly = true;
          secure = true;
        }

        // 非bilibili.com域名的cookie通常使用None sameSite
        if (domain !== '.bilibili.com') {
          sameSite = 'None';
        }

        return {
          name,
          value,
          domain,
          path: body.path || '/',
          expires: body.expires || Date.now() / 1000 + 86400 * 30, // 默认30天
          httpOnly,
          secure,
          sameSite,
        };
      });
    }
    // 处理已经是数组格式的cookies
    else if (Array.isArray(cookies)) {
      cookieArray = cookies.map(cookie => {
        // 确保cookie对象包含所有必要的字段
        return {
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain || guessDomain(cookie.name),
          path: cookie.path || '/',
          expires: cookie.expires || -1,
          httpOnly: cookie.httpOnly !== undefined ? cookie.httpOnly : false,
          secure: cookie.secure !== undefined ? cookie.secure : false,
          sameSite: cookie.sameSite || 'Lax',
        };
      });
    }

    // 使用_default格式包装结果
    const result = {
      _default: {
        '1': {
          key: 'cookie',
          value: cookieArray,
        },
      },
    };

    return c.json(result);
  } catch (error) {
    // 使用统一的日志格式，这里使用简单的console.error因为无法获取sessionId
    const timestamp = getCSTTimestamp();
    console.error(`[${timestamp}] [COOKIE-CONVERT] ERROR: 转换cookie时出错`, error);
    return c.json({ error: '处理cookie时出错' }, 500);
  }
});

// 获取真实客户端IP的函数
const getRealClientIP = (c: any): string => {
  // 第一优先级：检查各种代理头部，按优先级排序
  const headers = [
    'CF-Connecting-IP', // Cloudflare
    'True-Client-IP', // Cloudflare Enterprise
    'X-Real-IP', // Nginx
    'X-Forwarded-For', // 标准代理头（可能包含多个IP）
    'X-Client-IP', // Apache
    'X-Forwarded', // 其他代理
    'X-Cluster-Client-IP', // 集群
    'Forwarded-For', // RFC 7239
    'Forwarded', // RFC 7239 标准格式
  ];

  for (const header of headers) {
    const value = c.req.header(header);
    if (value) {
      // 处理包含多个IP的情况（如 X-Forwarded-For）
      if (header === 'X-Forwarded-For' || header === 'Forwarded-For') {
        // X-Forwarded-For 格式: "client, proxy1, proxy2"
        const ips = value.split(',').map((ip: string) => ip.trim());
        const clientIP = ips[0];
        if (clientIP && isValidIP(clientIP)) {
          return clientIP;
        }
      } else if (header === 'Forwarded') {
        // Forwarded 格式: "for=192.0.2.60;proto=http;by=203.0.113.43"
        const forMatch = value.match(/for=([^;,\s]+)/);
        if (forMatch && forMatch[1]) {
          const ip = forMatch[1].replace(/"/g, '');
          if (isValidIP(ip)) {
            return ip;
          }
        }
      } else {
        // 单个IP的情况
        if (isValidIP(value)) {
          return value;
        }
      }
    }
  }

  // 第二优先级：尝试获取直连客户端IP（用于公网IP直接访问）
  try {
    // 检查Hono环境变量中的连接信息
    if (c.env && c.env.REMOTE_ADDR) {
      const remoteIP = c.env.REMOTE_ADDR;
      if (isValidIP(remoteIP)) {
        return remoteIP;
      }
    }

    // 检查Node.js环境下的socket连接信息
    if (c.req.raw && c.req.raw.socket && c.req.raw.socket.remoteAddress) {
      const remoteAddr = c.req.raw.socket.remoteAddress;
      if (remoteAddr && isValidIP(remoteAddr)) {
        return remoteAddr;
      }
    }

    // 检查其他可能的连接信息来源
    if (c.req.raw && c.req.raw.connection && c.req.raw.connection.remoteAddress) {
      const remoteAddr = c.req.raw.connection.remoteAddress;
      if (remoteAddr && isValidIP(remoteAddr)) {
        return remoteAddr;
      }
    }
  } catch (error) {
    // 忽略获取连接信息时的错误
  }

  // 第三优先级：本地环境处理
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下，如果没有获取到IP，返回localhost
    return 'localhost';
  }

  // 最后：检查是否为直接IP访问模式
  try {
    const hostHeader = c.req.header('host');
    if (hostHeader && /^\d+\.\d+\.\d+\.\d+/.test(hostHeader)) {
      // 直接IP访问但无法获取客户端IP
      return 'direct-connection';
    }
  } catch (error) {
    // 忽略解析host头部时的错误
  }

  return 'unknown';
};

// 验证IP格式的简单函数
const isValidIP = (ip: string | undefined | null): boolean => {
  if (!ip || ip === 'unknown') return false;

  // 移除端口号
  const cleanIP = ip.split(':')[0];

  // IPv4 正则
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 正则（简化版）
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  // 在生产环境中排除内网IP和特殊IP
  if (ipv4Regex.test(cleanIP)) {
    const parts = cleanIP.split('.').map(Number);

    // 开发环境下不排除内网IP，让所有有效IP格式都通过
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // 生产环境排除内网IP: 10.x.x.x, 172.16.x.x-172.31.x.x, 192.168.x.x, 127.x.x.x
    if (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    ) {
      return false;
    }
    return true;
  }

  return ipv6Regex.test(cleanIP);
};

// 在线客户端管理系统
interface ActiveSession {
  sessionId: number;
  clientIP: string;
  userAgent: string;
  connectTime: number;
  lastActiveTime: number;
  isActive: boolean;
}

class ClientManager {
  private activeSessions = new Map<number, ActiveSession>();
  private cleanupInterval?: NodeJS.Timeout;

  public constructor() {
    // 每30秒清理一次超时的会话（5分钟无活动）
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions(5 * 60 * 1000); // 5分钟
    }, 30 * 1000);
  }

  // 添加新会话
  public addSession(sessionId: number, clientIP: string, userAgent: string): void {
    const now = Date.now();
    this.activeSessions.set(sessionId, {
      sessionId,
      clientIP,
      userAgent: userAgent.substring(0, 100),
      connectTime: now,
      lastActiveTime: now,
      isActive: true,
    });

    this.logSessionStats('新客户端连接');
  }

  // 更新会话活跃时间
  public updateActivity(sessionId: number): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActiveTime = Date.now();
      session.isActive = true;
    }
  }

  // 移除会话
  public removeSession(sessionId: number, reason: string = '正常断开'): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const duration = Date.now() - session.connectTime;
      this.activeSessions.delete(sessionId);

      logger.info(sessionId, '客户端断开连接', {
        reason,
        sessionDuration: `${Math.round(duration / 1000)}s`,
        totalActiveSessions: this.activeSessions.size,
      });

      this.logSessionStats('客户端断开');
    }
  }

  // 获取当前活跃会话数量
  public getActiveCount(): number {
    return this.activeSessions.size;
  }

  // 清理资源
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.activeSessions.clear();
  }

  // 清理不活跃的会话
  private cleanupInactiveSessions(timeoutMs: number): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActiveTime > timeoutMs) {
        this.activeSessions.delete(sessionId);
        cleanedCount++;

        logger.debug(sessionId, '清理超时会话', {
          lastActiveTime: new Date(session.lastActiveTime).toISOString(),
          timeoutMinutes: Math.round(timeoutMs / 60000),
        });
      }
    }

    if (cleanedCount > 0) {
      this.logSessionStats(`清理了${cleanedCount}个超时会话`);
    }
  }

  // 记录会话统计信息
  private logSessionStats(action: string): void {
    const activeCount = this.activeSessions.size;
    const currentTime = new Date().toISOString();

    // 统计不同IP的客户端数量
    const uniqueIPs = new Set(Array.from(this.activeSessions.values()).map(s => s.clientIP));

    logger.important(0, `客户端统计 - ${action}`, {
      当前在线: activeCount,
      独立IP数: uniqueIPs.size,
      计算时间: currentTime,
    });

    // 调试模式下显示详细信息
    if (isDebugMode && activeCount > 0) {
      const sessions = Array.from(this.activeSessions.values()).map(s => ({
        sessionId: s.sessionId,
        clientIP: s.clientIP,
        connectDuration: `${Math.round((Date.now() - s.connectTime) / 1000)}s`,
        lastActiveAgo: `${Math.round((Date.now() - s.lastActiveTime) / 1000)}s前`,
      }));

      logger.debug(0, '活跃会话详情', { sessions });
    }
  }
}

// 创建全局客户端管理器
const clientManager = new ClientManager();

let globalId = 0;

app.get('/api/qr', c => {
  const sessionId = globalId++;
  const clientIP = getRealClientIP(c);
  const userAgent = c.req.header('User-Agent') || 'unknown';
  const clientType = (c.req.query('client') || 'web') as 'web' | 'tv';

  // 注册新会话到客户端管理器
  clientManager.addSession(sessionId, clientIP, userAgent);

  // 添加调试信息来帮助排查IP获取问题
  if (isDebugMode) {
    const debugHeaders = {
      'CF-Connecting-IP': c.req.header('CF-Connecting-IP'),
      'X-Forwarded-For': c.req.header('X-Forwarded-For'),
      'X-Real-IP': c.req.header('X-Real-IP'),
      'True-Client-IP': c.req.header('True-Client-IP'),
      'X-Client-IP': c.req.header('X-Client-IP'),
      Forwarded: c.req.header('Forwarded'),
    };

    const connectionInfo = {
      host: c.req.header('host'),
      userAgent: c.req.header('User-Agent')?.substring(0, 50),
      socketRemoteAddress: (c.req.raw as any)?.socket?.remoteAddress,
      connectionRemoteAddress: (c.req.raw as any)?.connection?.remoteAddress,
      envRemoteAddr: c.env?.REMOTE_ADDR,
    };

    logger.debug(sessionId, 'IP获取调试信息', {
      finalIP: clientIP,
      proxyHeaders: Object.fromEntries(Object.entries(debugHeaders).filter(([, v]) => v)),
      connectionInfo: Object.fromEntries(Object.entries(connectionInfo).filter(([, v]) => v)),
    });
  }

  logger.important(sessionId, '新的QR码请求', {
    clientIP,
    userAgent: userAgent.substring(0, 100), // 只记录前100个字符
  });

  if (process.env.NODE_ENV !== 'development') {
    try {
      const host = c.req.header('Host');
      const referer = c.req.header('Referer');

      if (!referer) {
        logger.warn(sessionId, 'Referer检查失败：缺少Referer头', { host, referer });
        return c.text('', 403);
      }

      const refererHost = new URL(referer).host;
      const refererOrigin = new URL(referer).origin;

      // 检查是否为同域名访问
      if (refererHost === host) {
        // 同域名访问，允许通过
        logger.debug(sessionId, 'Referer检查通过：同域名访问', { host, referer });
      } else if (ALLOW_ALL_ORIGINS) {
        // 如果TRUST_ORIGIN配置为*，允许所有来源
        logger.debug(sessionId, 'Referer检查通过：允许所有来源', { host, referer });
      } else if (allowedOrigins.includes(refererOrigin) || allowedOrigins.includes(refererHost)) {
        // 如果referer在信任的域名列表中，允许通过（支持完整origin或仅域名匹配）
        logger.debug(sessionId, 'Referer检查通过：在信任域名列表中', {
          host,
          referer,
          refererOrigin,
          refererHost,
          allowedOrigins,
        });
      } else {
        // 其他情况拒绝访问
        logger.warn(sessionId, 'Referer检查失败：不在信任域名列表中', {
          host,
          referer,
          refererOrigin,
          allowedOrigins:
            allowedOrigins.length > 10 ? `${allowedOrigins.slice(0, 10).join(',')}...` : allowedOrigins.join(','),
        });
        return c.text('', 403);
      }
    } catch (error) {
      logger.warn(sessionId, 'Referer检查异常', {
        error: error instanceof Error ? error.message : String(error),
        host: c.req.header('Host'),
        referer: c.req.header('Referer'),
      });
      return c.text('', 403);
    }
  }

  return streamSSE(c, async stream => {
    const startTime = Date.now();
    logger.debug(sessionId, 'SSE流开始');

    // 编码加上 charset
    c.header('Content-Type', 'text/event-stream; charset=utf-8');

    let streamClosed = false;
    stream.onAbort(() => {
      streamClosed = true;
      const duration = Date.now() - startTime;
      logger.debug(sessionId, 'SSE流关闭', { duration: `${duration}ms` });

      // 从客户端管理器中移除会话
      clientManager.removeSession(sessionId, 'SSE流中断');
    });

    // 断线重连时的 key
    const lastEventID = c.req.header('Last-Event-ID');
    if (lastEventID) {
      logger.info(sessionId, '断线重连', { lastEventID });
    }

    try {
      // 根据clientType创建对应的登录实例
      const qr =
        clientType === 'tv'
          ? new LoginQrTV(userAgent, lastEventID, sessionId)
          : new LoginQr(userAgent, lastEventID, sessionId);

      if (!lastEventID) {
        logger.important(sessionId, `开始生成QR码 (${clientType}端)`);
        const generateStartTime = Date.now();

        const genRes = await qr.generate();
        const generateDuration = Date.now() - generateStartTime;

        if (genRes.code === 0) {
          logger.important(sessionId, 'QR码生成成功', {
            duration: `${generateDuration}ms`,
          });
        } else {
          logger.error(sessionId, 'QR码生成失败', {
            duration: `${generateDuration}ms`,
            code: genRes.code,
            message: genRes.msg,
          });
        }

        await stream.writeSSE({ data: JSON.stringify(genRes), event: SSEEvent.GENERATE, id: genRes.key });

        if (genRes.code !== 0) {
          await stream.writeSSE({ data: '', event: SSEEvent.END });
          await stream.close();
          return;
        }
        await stream.sleep(2000);
      }

      // 轮询
      logger.important(sessionId, '开始轮询QR码状态');
      for (let i = 0; i < 100 && !streamClosed; i++) {
        const pollStartTime = Date.now();

        // 更新会话活跃时间
        clientManager.updateActivity(sessionId);

        try {
          const result = await qr.poll();
          const pollDuration = Date.now() - pollStartTime;

          // 只有状态变化时才记录重要日志，否则记录debug
          if (result.code !== PollQrResultCode.NOT_SCANNED && result.code !== PollQrResultCode.NOT_CONFIRMED) {
            logger.important(sessionId, `轮询状态变化`, {
              pollCount: i + 1,
              duration: `${pollDuration}ms`,
              status: getQrStatusDescription(result.code),
              message: result.msg,
            });
          } else {
            logger.debug(sessionId, `轮询第${i + 1}次`, {
              duration: `${pollDuration}ms`,
              status: getQrStatusDescription(result.code),
            });
          }

          await stream.writeSSE({ data: JSON.stringify(result), event: SSEEvent.POLL });

          if (!keepPollQrResultCode.has(result.code)) {
            const totalDuration = Date.now() - startTime;
            const reason = result.code === 0 ? '登录成功' : '登录失败或过期';

            logger.important(sessionId, '轮询结束', {
              reason,
              status: getQrStatusDescription(result.code),
              totalDuration: `${totalDuration}ms`,
              pollCount: i + 1,
            });

            // 移除会话
            clientManager.removeSession(sessionId, reason);

            await stream.writeSSE({ data: '', event: SSEEvent.END });
            await stream.close();
            return;
          }
        } catch (pollError) {
          const pollDuration = Date.now() - pollStartTime;
          logger.error(sessionId, `轮询第${i + 1}次出错`, {
            duration: `${pollDuration}ms`,
            error: pollError instanceof Error ? pollError.message : String(pollError),
          });
          // 继续轮询，不立即退出
        }

        await stream.sleep(2000);

        // 检查连接状态，如果用户断开则退出
        if (streamClosed) {
          const totalDuration = Date.now() - startTime;
          logger.info(sessionId, '用户断开连接', {
            totalDuration: `${totalDuration}ms`,
            pollCount: i + 1,
          });

          // 移除会话 (注意：可能已经在stream.onAbort中移除过了)
          clientManager.removeSession(sessionId, '用户主动断开');
          return;
        }
      }

      // 只有在没有断开连接的情况下才是真正的超时
      if (!streamClosed) {
        const totalDuration = Date.now() - startTime;
        logger.warn(sessionId, '轮询达到最大次数限制', {
          totalDuration: `${totalDuration}ms`,
          maxPolls: 100,
        });

        // 移除会话
        clientManager.removeSession(sessionId, '轮询超时');
      }
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      logger.error(sessionId, 'SSE流异常', {
        totalDuration: `${totalDuration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // 移除会话
      clientManager.removeSession(sessionId, 'SSE流异常');

      await stream.writeSSE({ data: String(error), event: SSEEvent.END });
      await stream.close();
      return;
    }

    // 正常结束，不需要额外的日志
    if (!streamClosed) {
      await stream.writeSSE({ data: '服务结束', event: SSEEvent.END });
      // 移除会话
      clientManager.removeSession(sessionId, '服务正常结束');
    }
    await stream.close();
  });
});

interface GenerateQrResp {
  code: number;
  message: string;
  ttl: number;
  data: {
    url: string;
    qrcode_key: string;
  };
}

interface PollQrResp {
  code: number;
  message: string;
  ttl: number;
  data: {
    url: string;
    refresh_token: string;
    timestamp: string;
    code: number;
    message: string;
  };
}

interface PollQrResult {
  code: number;
  msg: string;
  cookie?: string;
  cookieValidation?: {
    status: 'success' | 'failed' | 'error';
    message: string;
    details?: string;
  };
}

class LoginQr {
  private readonly header: Record<string, string> = {};

  public constructor(
    userAgent = '',
    private key = '',
    private sessionId: number,
  ) {
    this.header = {
      'User-Agent': userAgent,
      Origin: 'https://www.bilibili.com',
      Referer: 'https://www.bilibili.com/',
    };

    logger.debug(this.sessionId, 'LoginQr实例创建', {
      hasUserAgent: !!userAgent,
      hasKey: !!key,
    });
  }

  public async generate() {
    const startTime = Date.now();
    const url = 'https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-fe-header';

    logger.debug(this.sessionId, '开始请求B站生成QR码API', { url });

    try {
      const r = await fetchWithTimeout(
        url,
        {
          headers: this.header,
        },
        15000,
      );

      const duration = Date.now() - startTime;

      logger.debug(this.sessionId, 'B站API响应', {
        duration: `${duration}ms`,
        status: r.status,
        statusText: r.statusText,
        headers: {
          'content-type': r.headers.get('content-type'),
          'x-bili-trace-id': r.headers.get('x-bili-trace-id'),
          server: r.headers.get('server'),
        },
      });

      if (!r.ok) {
        logger.error(this.sessionId, 'B站QR码生成API请求失败', {
          status: r.status,
          statusText: r.statusText,
          duration: `${duration}ms`,
        });
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }

      const responseText = await r.text();
      logger.debug(this.sessionId, 'B站API响应内容', {
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 200),
      });

      const responseData = JSON.parse(responseText) as GenerateQrResp;
      const { code, message, data: { url: qrUrl, qrcode_key: key } = { url: '', qrcode_key: '' } } = responseData;

      this.key = key;

      // 根据B站API的返回码决定日志级别
      if (code === 0) {
        logger.debug(this.sessionId, 'QR码生成结果详情', {
          duration: `${duration}ms`,
          httpStatus: r.status,
          biliCode: code,
          hasUrl: !!qrUrl,
          hasKey: !!key,
        });
      } else {
        logger.important(this.sessionId, 'B站QR码生成API返回错误', {
          duration: `${duration}ms`,
          httpStatus: r.status,
          biliCode: code,
          message: message,
        });
      }

      return { code, msg: message, url: qrUrl, key };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(this.sessionId, 'QR码生成请求超时', { duration: `${duration}ms` });
        return { code: -1, msg: '请求超时，可能是网络问题或被风控', url: '', key: '' };
      }

      logger.error(this.sessionId, 'QR码生成请求失败', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        code: -1,
        msg: `请求失败: ${error instanceof Error ? error.message : String(error)}`,
        url: '',
        key: '',
      };
    }
  }

  public async poll() {
    const startTime = Date.now();
    const url = `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${this.key}&source=main-fe-header`;

    logger.debug(this.sessionId, '开始轮询QR码状态', { qrcode_key: this.key });

    try {
      const r0 = await fetchWithTimeout(
        url,
        {
          headers: this.header,
        },
        10000,
      );

      const duration = Date.now() - startTime;

      logger.debug(this.sessionId, '轮询API响应', {
        duration: `${duration}ms`,
        status: r0.status,
        statusText: r0.statusText,
        hasSetCookie: r0.headers.has('set-cookie'),
      });

      if (!r0.ok) {
        logger.error(this.sessionId, 'B站轮询API请求失败', {
          status: r0.status,
          statusText: r0.statusText,
          duration: `${duration}ms`,
        });
        throw new Error(`HTTP ${r0.status}: ${r0.statusText}`);
      }

      const responseData = (await r0.json()) as PollQrResp;
      const { code, message, data } = responseData;

      const result: PollQrResult =
        code === 0
          ? {
              code: data.code,
              msg: data.message,
            }
          : {
              code: Number(code),
              msg: message,
            };

      if (result.code !== 0) {
        // 对于非成功状态，记录更多信息用于排错
        if (result.code === PollQrResultCode.EXPIRED) {
          logger.important(this.sessionId, 'QR码已过期', {
            duration: `${duration}ms`,
            httpStatus: r0.status,
            status: getQrStatusDescription(result.code),
            message: result.msg,
          });
        } else {
          logger.debug(this.sessionId, '轮询结果详情', {
            duration: `${duration}ms`,
            httpStatus: r0.status,
            status: getQrStatusDescription(result.code),
            message: result.msg,
          });
        }
        return result;
      }

      // 登录成功，获取cookie
      logger.important(this.sessionId, '登录成功，开始获取cookie', {
        httpStatus: r0.status,
        duration: `${duration}ms`,
      });
      const cookieStartTime = Date.now();

      try {
        result.cookie = new Cookie()
          .set('buvid3', await this.getBuvid3())
          .add(r0.headers.getSetCookie())
          .del('i-wanna-go-back')
          .toString();

        const cookieDuration = Date.now() - cookieStartTime;
        logger.important(this.sessionId, 'Cookie获取完成', {
          duration: `${cookieDuration}ms`,
          cookieLength: result.cookie.length,
          totalDuration: `${Date.now() - startTime}ms`,
        });

        // 登录成功后测试Cookie有效性（通过点赞动态）
        logger.important(this.sessionId, '验证Cookie有效性');

        const cookieValidation = await validateCookieViaDynamic(
          result.cookie,
          this.header['User-Agent'],
          this.sessionId,
        );
        result.cookieValidation = cookieValidation;

        if (cookieValidation.status === 'success') {
          logger.important(this.sessionId, 'Cookie验证通过', {
            status: '可正常使用B站功能',
          });
        } else {
          logger.warn(this.sessionId, 'Cookie验证未通过', {
            reason: cookieValidation.message,
            details: cookieValidation.details,
            note: '登录成功，但Cookie可能无法使用部分B站功能',
          });
        }
      } catch (cookieError) {
        const cookieDuration = Date.now() - cookieStartTime;
        logger.error(this.sessionId, 'Cookie获取失败', {
          duration: `${cookieDuration}ms`,
          error: cookieError instanceof Error ? cookieError.message : String(cookieError),
        });
        // 即使cookie获取失败，也返回登录成功的结果
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(this.sessionId, '轮询请求超时', { duration: `${duration}ms` });
        return { code: -1, msg: '轮询超时，可能是网络问题' };
      }

      logger.error(this.sessionId, '轮询请求失败', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        code: -1,
        msg: `轮询失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async getBuvid3() {
    const startTime = Date.now();
    const url = 'https://api.bilibili.com/x/frontend/finger/spi';

    logger.debug(this.sessionId, '开始获取buvid3');

    try {
      const r = await fetchWithTimeout(
        url,
        {
          headers: this.header,
        },
        10000,
      );

      const duration = Date.now() - startTime;

      if (!r.ok) {
        logger.error(this.sessionId, 'buvid3获取API请求失败', {
          status: r.status,
          statusText: r.statusText,
          duration: `${duration}ms`,
        });
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }

      const { code, message, data } = await r.json();

      logger.debug(this.sessionId, 'buvid3获取结果', {
        duration: `${duration}ms`,
        httpStatus: r.status,
        biliCode: code,
        message,
        hasBuvid3: !!data?.b_3,
      });

      if (code !== 0) {
        logger.error(this.sessionId, 'buvid3获取失败，B站API返回错误', {
          duration: `${duration}ms`,
          httpStatus: r.status,
          biliCode: code,
          message,
        });
        throw new Error(message);
      }

      return data.b_3;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(this.sessionId, 'buvid3获取超时', { duration: `${duration}ms` });
        throw new Error('buvid3获取超时');
      }

      logger.error(this.sessionId, 'buvid3获取失败', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}

// 辅助函数：带超时的fetch请求
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 辅助函数：将对象转换为URLSearchParams
function objectToFormData(params: Record<string, string | number>): URLSearchParams {
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  return formData;
}

// 辅助函数：合并Cookie字符串
function mergeCookies(...parts: Array<string | Record<string, string>>): string {
  const cookieMap = new Map<string, string>();

  parts.forEach(part => {
    if (typeof part === 'string') {
      // 解析字符串形式的Cookie
      part.split(';').forEach(item => {
        const trimmed = item.trim();
        if (trimmed) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            cookieMap.set(key.trim(), valueParts.join('=').trim());
          }
        }
      });
    } else {
      // 对象形式的Cookie
      Object.entries(part).forEach(([key, value]) => {
        cookieMap.set(key, value);
      });
    }
  });

  return Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

// 辅助函数：验证Cookie有效性（通过动态点赞API）
async function validateCookieViaDynamic(
  cookieString: string,
  userAgent: string,
  sessionId: number,
): Promise<{
  status: 'success' | 'failed' | 'error';
  message: string;
  details?: string;
}> {
  const startTime = Date.now();
  const dynamicId = '894797775503360036';

  logger.debug(sessionId, '启动Cookie功能性测试', {
    testMethod: '哔哩哔哩动态点赞API',
    testTarget: `动态ID ${dynamicId}`,
    testPurpose: '验证Cookie是否具备完整的B站API访问权限',
    expectedOutcome: '成功调用需要认证的B站API接口',
  });

  try {
    // 从cookie字符串中提取需要的值
    const cookieMap = new Map<string, string>();
    cookieString.split('; ').forEach(cookie => {
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookieMap.set(name.trim(), value.trim());
      }
    });

    const sessdata = cookieMap.get('SESSDATA');
    const biliJct = cookieMap.get('bili_jct');

    logger.debug(sessionId, 'Cookie解析结果', {
      hasSESSDATA: !!sessdata,
      hasBiliJct: !!biliJct,
      cookieCount: cookieMap.size,
      keyNames: Array.from(cookieMap.keys()).slice(0, 10),
    });

    if (!sessdata || !biliJct) {
      return {
        status: 'failed',
        message: 'Cookie缺少关键认证信息',
        details: 'SESSDATA 或 bili_jct 不存在',
      };
    }

    const url = 'https://api.bilibili.com/x/dynamic/feed/dyn/thumb';
    const params = new URLSearchParams({ csrf: biliJct });

    const requestBody = {
      dyn_id_str: dynamicId,
      up: 1,
      spmid: '333.1369.0.0',
      from_spmid: '333.999.0.0',
    };

    const response = await fetchWithTimeout(
      `${url}?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieString,
          'User-Agent': userAgent,
          Referer: 'https://www.bilibili.com/',
          Origin: 'https://www.bilibili.com',
        },
        body: JSON.stringify(requestBody),
      },
      15000,
    );

    const duration = Date.now() - startTime;

    logger.debug(sessionId, '点赞API响应', {
      duration: `${duration}ms`,
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `网络请求失败 (${response.status})`,
        details: response.statusText,
      };
    }

    const responseData = await response.json();

    logger.debug(sessionId, 'Cookie测试API响应数据', {
      duration: `${duration}ms`,
      code: responseData.code,
      message: responseData.message,
    });

    if (responseData.code === 0) {
      logger.debug(sessionId, 'Cookie测试成功', {
        testResult: 'PASS',
        duration: `${duration}ms`,
        conclusion: 'Cookie具备完整的B站API访问权限',
      });

      return {
        status: 'success',
        message: 'Cookie验证通过',
        details: '可正常使用B站功能',
      };
    } else {
      const errorAnalysis =
        responseData.code === -101
          ? '账号未登录或Cookie已失效'
          : responseData.code === -111
            ? 'CSRF校验失败（bili_jct无效）'
            : responseData.code === -352
              ? '风控校验失败（可能需要验证码）'
              : `B站API返回错误码 ${responseData.code}`;

      const cookieDiagnosis =
        responseData.code === -101
          ? 'SESSDATA可能已过期或无效'
          : responseData.code === -111
            ? 'bili_jct不匹配或已失效'
            : '请检查Cookie完整性';

      logger.debug(sessionId, 'Cookie测试失败分析', {
        testResult: 'FAIL',
        errorCode: responseData.code,
        errorAnalysis,
        cookieDiagnosis,
        duration: `${duration}ms`,
        recommendation: '建议重新获取Cookie或检查账户状态',
      });

      return {
        status: 'failed',
        message: errorAnalysis,
        details: cookieDiagnosis,
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error(sessionId, 'Cookie测试超时', {
        testResult: 'TIMEOUT',
        duration: `${duration}ms`,
        reason: '网络请求超时',
        impact: '无法验证Cookie有效性',
        recommendation: '检查网络连接或B站API状态',
      });

      return {
        status: 'error',
        message: '验证超时',
        details: '网络请求超时，请检查网络连接',
      };
    }

    logger.error(sessionId, 'Cookie测试异常', {
      testResult: 'ERROR',
      duration: `${duration}ms`,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      impact: '无法完成Cookie有效性验证',
      recommendation: '检查网络连接、Cookie格式或B站API状态',
    });

    return {
      status: 'error',
      message: '验证过程异常',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

// TV端响应接口
interface GenerateQrTVResp {
  code: number;
  message: string;
  ttl: number;
  data: {
    url: string;
    auth_code: string;
  };
}

interface PollQrTVResp {
  code: number;
  message: string;
  ttl: number;
  data: {
    is_new?: boolean;
    mid: number;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_info?: {
      mid: number;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    cookie_info?: {
      cookies: Array<{
        name: string;
        value: string;
        http_only: number;
        expires: number;
        secure: number;
      }>;
      domains: string[];
    };
    sso?: string[];
  } | null;
}

// TV端登录类
class LoginQrTV {
  private readonly header: Record<string, string> = {};
  private authCode = '';

  public constructor(
    userAgent = '',
    authCode = '',
    private sessionId: number,
  ) {
    this.authCode = authCode;
    this.header = {
      'User-Agent': userAgent,
    };

    logger.debug(this.sessionId, 'LoginQrTV实例创建', {
      hasUserAgent: !!userAgent,
      hasAuthCode: !!authCode,
    });
  }

  public async generate() {
    const startTime = Date.now();

    const params = signTVParams({
      local_id: 0,
    });

    const url = 'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code';

    logger.debug(this.sessionId, '开始请求B站TV端生成QR码API', { url });

    try {
      const r = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            ...this.header,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: objectToFormData(params).toString(),
        },
        15000,
      );

      const duration = Date.now() - startTime;

      logger.debug(this.sessionId, 'B站TV端API响应', {
        duration: `${duration}ms`,
        status: r.status,
        statusText: r.statusText,
      });

      if (!r.ok) {
        logger.error(this.sessionId, 'B站TV端QR码生成API请求失败', {
          status: r.status,
          statusText: r.statusText,
          duration: `${duration}ms`,
        });
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }

      const responseText = await r.text();
      const responseData = JSON.parse(responseText) as GenerateQrTVResp;
      const { code, message, data } = responseData;
      const { url: qrUrl, auth_code } = data || { url: '', auth_code: '' };

      this.authCode = auth_code;

      if (code === 0) {
        logger.debug(this.sessionId, 'TV端QR码生成结果详情', {
          duration: `${duration}ms`,
          httpStatus: r.status,
          biliCode: code,
          hasUrl: !!qrUrl,
          hasAuthCode: !!auth_code,
        });
      } else {
        logger.important(this.sessionId, 'B站TV端QR码生成API返回错误', {
          duration: `${duration}ms`,
          httpStatus: r.status,
          biliCode: code,
          message: message,
        });
      }

      return { code, msg: message, url: qrUrl, key: auth_code };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(this.sessionId, 'TV端QR码生成请求超时', { duration: `${duration}ms` });
        return { code: -1, msg: '请求超时，可能是网络问题或被风控', url: '', key: '' };
      }

      logger.error(this.sessionId, 'TV端QR码生成请求失败', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        code: -1,
        msg: `请求失败: ${error instanceof Error ? error.message : String(error)}`,
        url: '',
        key: '',
      };
    }
  }

  public async poll() {
    const startTime = Date.now();

    const params = signTVParams({
      auth_code: this.authCode,
      local_id: 0,
    });

    const url = 'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll';

    logger.debug(this.sessionId, '开始轮询TV端QR码状态', { auth_code: this.authCode });

    try {
      const r0 = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            ...this.header,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: objectToFormData(params).toString(),
        },
        10000,
      );

      const duration = Date.now() - startTime;

      logger.debug(this.sessionId, 'TV端轮询API响应', {
        duration: `${duration}ms`,
        status: r0.status,
        statusText: r0.statusText,
      });

      if (!r0.ok) {
        logger.error(this.sessionId, 'TV端轮询请求HTTP失败', {
          status: r0.status,
          statusText: r0.statusText,
          duration: `${duration}ms`,
        });
        throw new Error(`HTTP ${r0.status}: ${r0.statusText}`);
      }

      const responseText = await r0.text();
      const r = JSON.parse(responseText) as PollQrTVResp;
      const { code, message, data } = r;

      // 根据不同的返回码输出不同级别的日志
      if (code === 0 && data) {
        // 成功登录
        logger.important(this.sessionId, 'TV端扫码登录成功', {
          duration: `${duration}ms`,
          mid: data.mid,
          hasCookieInfo: !!data.cookie_info,
        });

        // 从cookie_info中提取cookie
        const cookieParts: Record<string, string> = {};
        if (data.cookie_info?.cookies) {
          data.cookie_info.cookies.forEach(cookie => {
            cookieParts[cookie.name] = cookie.value;
          });

          logger.debug(this.sessionId, 'TV端Cookie信息', {
            cookieCount: data.cookie_info.cookies.length,
            keys: Object.keys(cookieParts),
          });
        }

        // 添加token信息
        const tokenParts: Record<string, string> = {};
        if (data.access_token) tokenParts.access_token = data.access_token;
        if (data.refresh_token) tokenParts.refresh_token = data.refresh_token;
        if (data.mid) tokenParts.mid = String(data.mid);
        if (data.expires_in) tokenParts.expires_in = String(data.expires_in);

        if (Object.keys(tokenParts).length > 0) {
          logger.debug(this.sessionId, 'TV端Token信息', {
            mid: data.mid,
            hasAccessToken: !!data.access_token,
            hasRefreshToken: !!data.refresh_token,
            expiresIn: data.expires_in,
          });
        }

        // 合并所有Cookie
        const cookieString = mergeCookies(cookieParts, tokenParts);

        // 验证Cookie有效性
        logger.important(this.sessionId, '验证TV端Cookie有效性');
        const cookieValidation = await validateCookieViaDynamic(
          cookieString,
          this.header['User-Agent'],
          this.sessionId,
        );

        if (cookieValidation.status === 'success') {
          logger.important(this.sessionId, 'TV端Cookie验证通过', {
            status: '可正常使用B站功能',
          });
        } else {
          logger.warn(this.sessionId, 'TV端Cookie验证未通过', {
            reason: cookieValidation.message,
            details: cookieValidation.details,
            note: '登录成功，但Cookie可能无法使用部分B站功能',
          });
        }

        return {
          code: 0,
          msg: message,
          cookie: cookieString,
          cookieValidation,
        };
      } else if (code === 86039 || code === -404) {
        // 二维码尚未确认
        logger.debug(this.sessionId, 'TV端二维码尚未确认', {
          duration: `${duration}ms`,
          code,
        });
        return { code: 86101, msg: '未扫码' };
      } else if (code === 86090) {
        // 已扫码未确认
        logger.debug(this.sessionId, 'TV端已扫码未确认', {
          duration: `${duration}ms`,
        });
        return { code: 86090, msg: '二维码已扫码未确认' };
      } else if (code === 86038) {
        // 二维码已失效
        logger.important(this.sessionId, 'TV端二维码已失效', {
          duration: `${duration}ms`,
        });
        return { code: 86038, msg: '二维码已失效' };
      } else {
        // 其他错误
        logger.error(this.sessionId, 'TV端轮询返回未知状态', {
          duration: `${duration}ms`,
          code,
          message,
        });
        return { code: -1, msg: message || '未知错误' };
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(this.sessionId, 'TV端轮询超时', { duration: `${duration}ms` });
        return { code: -1, msg: '请求超时' };
      }

      logger.error(this.sessionId, 'TV端轮询失败', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        code: -1,
        msg: `轮询失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

class Cookie {
  private cookie = new Map<string, string>();

  public constructor(cookies?: string[]) {
    if (cookies) this.add(cookies);
  }

  public set(name: string, value: string) {
    this.cookie.set(name, value);
    return this;
  }

  public add(cookies: string[]) {
    cookies.forEach(str => {
      const [nv] = str.split(';');
      const [name, ...values] = nv.split('=');
      this.cookie.set(name, values.join('='));
    });
    return this;
  }

  public del(name: string) {
    this.cookie.delete(name);
    return this;
  }

  public toString() {
    return Array.from(this.cookie.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
}
