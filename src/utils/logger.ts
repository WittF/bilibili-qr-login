/**
 * 统一的前端日志系统
 * 参考服务器端设计，但适配前端环境
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  module: string;
  debugMode?: boolean;
}

class Logger {
  private module: string;
  private debugMode: boolean;

  constructor(config: LoggerConfig) {
    this.module = config.module;
    this.debugMode = config.debugMode ?? import.meta.env.DEV;
  }

  /**
   * 格式化时间戳
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string): string {
    return `[${this.getTimestamp()}] [${this.module}] ${level.toUpperCase()}: ${message}`;
  }

  /**
   * 获取控制台样式
   */
  private getStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #6b7280; font-weight: normal;',
      info: 'color: #3b82f6; font-weight: normal;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
    };
    return styles[level];
  }

  /**
   * 调试信息 - 仅在调试模式下显示
   */
  debug(message: string, data?: any): void {
    if (!this.debugMode) return;

    const formattedMessage = this.formatMessage('debug', message);
    if (data !== undefined) {
      console.log(`%c${formattedMessage}`, this.getStyle('debug'), data);
    } else {
      console.log(`%c${formattedMessage}`, this.getStyle('debug'));
    }
  }

  /**
   * 一般信息 - 仅在调试模式下显示
   */
  info(message: string, data?: any): void {
    if (!this.debugMode) return;

    const formattedMessage = this.formatMessage('info', message);
    if (data !== undefined) {
      console.log(`%c${formattedMessage}`, this.getStyle('info'), data);
    } else {
      console.log(`%c${formattedMessage}`, this.getStyle('info'));
    }
  }

  /**
   * 警告信息 - 始终显示
   */
  warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('warn', message);
    if (data !== undefined) {
      console.warn(`%c${formattedMessage}`, this.getStyle('warn'), data);
    } else {
      console.warn(`%c${formattedMessage}`, this.getStyle('warn'));
    }
  }

  /**
   * 错误信息 - 始终显示
   */
  error(message: string, error?: any): void {
    const formattedMessage = this.formatMessage('error', message);

    // 增强错误日志，包含时间戳和更多上下文
    if (error !== undefined) {
      console.error(`%c${formattedMessage}`, this.getStyle('error'), error);

      // 如果是网络错误，提供更多上下文
      if (error instanceof Error && this.isNetworkError(error)) {
        const networkDetails = {
          errorName: error.name,
          errorMessage: error.message,
          isOnline: navigator.onLine,
          currentUrl: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100), // 限制长度
        };

        const detailMessage = this.formatMessage('error', `${this.module} 网络错误详情`);
        console.error(`%c${detailMessage}`, this.getStyle('error'), networkDetails);
      }
    } else {
      console.error(`%c${formattedMessage}`, this.getStyle('error'));
    }
  }

  /**
   * 检查是否为网络相关错误
   */
  private isNetworkError(error: Error): boolean {
    // 检查错误名称
    if (['AbortError', 'TypeError', 'NetworkError'].includes(error.name)) {
      return true;
    }

    // 检查错误消息中的关键词
    const networkKeywords = [
      'Failed to fetch',
      'Network request failed',
      'fetch',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'Connection refused',
    ];

    return networkKeywords.some(keyword => error.message.includes(keyword));
  }

  /**
   * 重要信息 - 始终显示（使用info样式但不受调试模式限制）
   */
  important(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('info', message);
    if (data !== undefined) {
      console.log(`%c${formattedMessage}`, this.getStyle('info'), data);
    } else {
      console.log(`%c${formattedMessage}`, this.getStyle('info'));
    }
  }
}

/**
 * 创建模块专用的logger实例
 */
export function createLogger(module: string, debugMode?: boolean): Logger {
  return new Logger({ module, debugMode });
}

/**
 * 预定义的常用logger实例
 */
export const loggers = {
  theme: createLogger('THEME'),
  i18n: createLogger('I18N'),
  qrSSE: createLogger('QR-SSE'),
  postMessage: createLogger('POST-MSG'),
  app: createLogger('APP'),
  cookie: createLogger('COOKIE'),
} as const;
