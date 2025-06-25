/**
 * 简化的前端日志系统
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 简化的调试模式检测
const isDebugMode = (): boolean => {
  return (
    new URLSearchParams(window.location.search).get('debug') === '1' ||
    localStorage.getItem('bilibili-qr-debug') === 'true' ||
    import.meta.env.VITE_DEBUG === 'true'
  );
};

class Logger {
  private module: string;

  public constructor(module: string) {
    this.module = module;
  }

  public debug(message: string, data?: any): void {
    if (!isDebugMode()) return;
    if (data !== undefined) {
      console.log(this.formatMessage('debug', message), data);
    } else {
      console.log(this.formatMessage('debug', message));
    }
  }

  public info(message: string, data?: any): void {
    if (data !== undefined) {
      console.log(this.formatMessage('info', message), data);
    } else {
      console.log(this.formatMessage('info', message));
    }
  }

  public warn(message: string, data?: any): void {
    if (data !== undefined) {
      console.warn(this.formatMessage('warn', message), data);
    } else {
      console.warn(this.formatMessage('warn', message));
    }
  }

  public error(message: string, error?: any): void {
    if (error !== undefined) {
      console.error(this.formatMessage('error', message), error);
    } else {
      console.error(this.formatMessage('error', message));
    }
  }

  // 重要信息始终显示
  public important(message: string, data?: any): void {
    if (data !== undefined) {
      console.log(this.formatMessage('info', message), data);
    } else {
      console.log(this.formatMessage('info', message));
    }
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${new Date().toLocaleTimeString()}] [${this.module}] ${level.toUpperCase()}: ${message}`;
  }
}

// 创建模块专用的logger实例
export function createLogger(module: string): Logger {
  return new Logger(module);
}

// 预定义的常用logger实例
export const loggers = {
  theme: createLogger('THEME'),
  i18n: createLogger('I18N'),
  qrSSE: createLogger('QR-SSE'),
  postMessage: createLogger('POST-MSG'),
  app: createLogger('APP'),
  cookie: createLogger('COOKIE'),
} as const;
