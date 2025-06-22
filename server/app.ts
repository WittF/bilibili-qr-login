import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

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
 */

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

// 添加日志工具函数
const isDebugMode = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

const logger = {
  // 调试信息 - 仅在DEBUG模式下显示
  debug: (sessionId: number, message: string, data?: any) => {
    if (isDebugMode) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${sessionId}] DEBUG: ${message}`, data ? JSON.stringify(data) : '');
    }
  },
  // 一般信息 - 仅在DEBUG模式下显示
  info: (sessionId: number, message: string, data?: any) => {
    if (isDebugMode) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${sessionId}] INFO: ${message}`, data ? JSON.stringify(data) : '');
    }
  },
  // 重要信息 - 始终显示
  important: (sessionId: number, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${sessionId}] INFO: ${message}`, data ? JSON.stringify(data) : '');
  },
  // 错误信息 - 始终显示
  error: (sessionId: number, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${sessionId}] ERROR: ${message}`, error);
  },
  // 警告信息 - 始终显示
  warn: (sessionId: number, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [${sessionId}] WARN: ${message}`, data ? JSON.stringify(data) : '');
  },
};

// 启动时输出调试模式状态
console.log(`\n🚀 哔哩哔哩QR登录服务启动`);
console.log(`📊 调试模式: ${isDebugMode ? '开启 (展示详细日志)' : '关闭 (仅展示重要日志)'}`);
if (!isDebugMode) {
  console.log(`💡 提示: 设置环境变量 DEBUG=1 可开启详细日志\n`);
} else {
  console.log(`💡 详细日志已开启，包含所有请求和响应信息\n`);
}

export const app = new Hono();

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
    console.error('转换cookie时出错:', error);
    return c.json({ error: '处理cookie时出错' }, 500);
  }
});

let globalId = 0;

app.get('/api/qr', c => {
  const sessionId = globalId++;
  const clientIP =
    c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';
  const userAgent = c.req.header('User-Agent') || 'unknown';

  logger.important(sessionId, '新的QR码请求', {
    clientIP,
    userAgent: userAgent.substring(0, 100), // 只记录前100个字符
  });

  if (process.env.NODE_ENV !== 'development') {
    try {
      const host = c.req.header('Host');
      const referer = c.req.header('Referer');
      if (!referer || new URL(referer).host !== host) {
        logger.warn(sessionId, 'Referer检查失败', { host, referer });
        return c.text('', 403);
      }
    } catch {
      logger.warn(sessionId, 'Host检查异常');
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
    });

    // 断线重连时的 key
    const lastEventID = c.req.header('Last-Event-ID');
    if (lastEventID) {
      logger.info(sessionId, '断线重连', { lastEventID });
    }

    try {
      // 获取登录链接
      const qr = new LoginQr(userAgent, lastEventID, sessionId);
      if (!lastEventID) {
        logger.important(sessionId, '开始生成QR码');
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

        try {
          const result = await qr.poll();
          const pollDuration = Date.now() - pollStartTime;

          // 只有状态变化时才记录重要日志，否则记录debug
          if (result.code !== PollQrResultCode.NOT_SCANNED && result.code !== PollQrResultCode.NOT_CONFIRMED) {
            logger.important(sessionId, `轮询状态变化`, {
              pollCount: i + 1,
              duration: `${pollDuration}ms`,
              code: result.code,
              message: result.msg,
            });
          } else {
            logger.debug(sessionId, `轮询第${i + 1}次`, {
              duration: `${pollDuration}ms`,
              code: result.code,
            });
          }

          await stream.writeSSE({ data: JSON.stringify(result), event: SSEEvent.POLL });

          if (!keepPollQrResultCode.has(result.code)) {
            const totalDuration = Date.now() - startTime;
            logger.important(sessionId, '轮询结束', {
              reason: result.code === 0 ? '登录成功' : '登录失败或过期',
              code: result.code,
              totalDuration: `${totalDuration}ms`,
              pollCount: i + 1,
            });
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
      }

      const totalDuration = Date.now() - startTime;
      logger.warn(sessionId, '轮询超时终止', { totalDuration: `${totalDuration}ms` });
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      logger.error(sessionId, 'SSE流异常', {
        totalDuration: `${totalDuration}ms`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      await stream.writeSSE({ data: String(error), event: SSEEvent.END });
      await stream.close();
      return;
    }

    await stream.writeSSE({ data: '超时终止', event: SSEEvent.END });
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
      // 添加15秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const r = await fetch(url, {
        headers: this.header,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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
      // 添加10秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const r0 = await fetch(url, {
        headers: this.header,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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
            biliCode: result.code,
            message: result.msg,
          });
        } else {
          logger.debug(this.sessionId, '轮询结果详情', {
            duration: `${duration}ms`,
            httpStatus: r0.status,
            biliCode: result.code,
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
      // 添加10秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const r = await fetch(url, {
        headers: this.header,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
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
