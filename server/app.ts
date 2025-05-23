import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

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
  if (process.env.NODE_ENV !== 'development') {
    try {
      const host = c.req.header('Host');
      const referer = c.req.header('Referer');
      if (!referer || new URL(referer).host !== host) {
        return c.text('', 403);
      }
    } catch {
      return c.text('', 403);
    }
  }
  return streamSSE(c, async stream => {
    // 编码加上 charset
    c.header('Content-Type', 'text/event-stream; charset=utf-8');

    const id = globalId++;
    let streamClosed = false;
    stream.onAbort(() => {
      streamClosed = true;
      console.log(id, 'closed');
    });

    // 断线重连时的 key
    const lastEventID = c.req.header('Last-Event-ID');

    try {
      // 获取登录链接
      const qr = new LoginQr(c.req.header('User-Agent'), lastEventID);
      if (!lastEventID) {
        const genRes = await qr.generate();
        console.log(id, 'generate');
        await stream.writeSSE({ data: JSON.stringify(genRes), event: SSEEvent.GENERATE, id: genRes.key });
        if (genRes.code !== 0) {
          await stream.writeSSE({ data: '', event: SSEEvent.END });
          await stream.close();
          return;
        }
        await stream.sleep(2000);
      }

      // 轮询
      for (let i = 0; i < 100 && !streamClosed; i++) {
        console.log(id, 'poll', i);
        const result = await qr.poll();
        await stream.writeSSE({ data: JSON.stringify(result), event: SSEEvent.POLL });
        if (!keepPollQrResultCode.has(result.code)) {
          await stream.writeSSE({ data: '', event: SSEEvent.END });
          await stream.close();
          return;
        }
        await stream.sleep(2000);
      }
    } catch (error) {
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
  ) {
    this.header = {
      'User-Agent': userAgent,
      Origin: 'https://www.bilibili.com',
      Referer: 'https://www.bilibili.com/',
    };
  }

  public async generate() {
    const r = await fetch('https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-fe-header', {
      headers: this.header,
    });
    const {
      code,
      message,
      data: { url, qrcode_key: key } = { url: '', qrcode_key: '' },
    } = (await r.json()) as GenerateQrResp;
    this.key = key;
    return { code, msg: message, url, key };
  }

  public async poll() {
    const r0 = await fetch(
      `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${this.key}&source=main-fe-header`,
      { headers: this.header },
    );
    const { code, message, data } = (await r0.json()) as PollQrResp;
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

    if (result.code !== 0) return result;

    result.cookie = new Cookie()
      .set('buvid3', await this.getBuvid3())
      .add(r0.headers.getSetCookie())
      .del('i-wanna-go-back')
      .toString();

    return result;
  }

  private async getBuvid3() {
    const r = await fetch('https://api.bilibili.com/x/frontend/finger/spi', { headers: this.header });
    const { code, message, data } = await r.json();
    if (code !== 0) throw new Error(message);
    return data.b_3;
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
