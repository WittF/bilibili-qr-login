/**
 * 统一的前端日志系统
 * 参考服务器端设计，但适配前端环境
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  module: string;
  debugMode?: boolean;
}

// 前端调试模式控制 - 使用独立的环境变量
const getFrontendDebugMode = (): boolean => {
  // 1. 优先检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  if (debugParam === '1' || debugParam === 'true') {
    return true;
  }

  // 2. 检查 localStorage 设置
  const localDebug = localStorage.getItem('bilibili-qr-debug');
  if (localDebug === '1' || localDebug === 'true') {
    return true;
  }

  // 3. 检查环境变量（仅在开发模式下作为后备）
  if (import.meta.env.VITE_DEBUG === 'true') {
    return true;
  }

  // 4. 默认关闭调试模式
  return false;
};

class Logger {
  private module: string;
  private debugMode: boolean;

  public constructor(config: LoggerConfig) {
    this.module = config.module;
    // 使用独立的调试模式控制，而不是开发模式
    this.debugMode = config.debugMode ?? getFrontendDebugMode();
  }

  /**
   * 格式化时间戳 - 使用系统本地时间
   */
  private getTimestamp(): string {
    return new Date().toLocaleString();
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
   * 调试信息 - 仅在调试模式下显示
   */
  public debug(message: string, data?: any): void {
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
  public info(message: string, data?: any): void {
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
  public warn(message: string, data?: any): void {
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
  public error(message: string, error?: any): void {
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
   * 重要信息 - 始终显示（使用info样式但不受调试模式限制）
   */
  public important(message: string, data?: any): void {
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

/**
 * 全局调试控制接口
 * 可以在浏览器控制台中使用
 */
export const debugControl = {
  /**
   * 开启前端调试模式
   */
  enable(): void {
    localStorage.setItem('bilibili-qr-debug', 'true');
    console.log('%c[DEBUG] 前端调试模式已开启，刷新页面生效', 'color: #3b82f6; font-weight: bold;');
    console.log('%c[DEBUG] 当前页面 URL 加上 ?debug=1 可立即生效', 'color: #3b82f6;');
  },

  /**
   * 关闭前端调试模式
   */
  disable(): void {
    localStorage.removeItem('bilibili-qr-debug');
    console.log('%c[DEBUG] 前端调试模式已关闭，刷新页面生效', 'color: #f59e0b; font-weight: bold;');
  },

  /**
   * 查看当前调试状态
   */
  status(): void {
    const isEnabled = getFrontendDebugMode();
    const methods = [];

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === '1' || urlParams.get('debug') === 'true') {
      methods.push('URL参数');
    }

    if (localStorage.getItem('bilibili-qr-debug') === 'true') {
      methods.push('localStorage');
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      methods.push('环境变量');
    }

    console.log(
      `%c[DEBUG] 调试模式状态: ${isEnabled ? '已开启' : '已关闭'}`,
      `color: ${isEnabled ? '#10b981' : '#ef4444'}; font-weight: bold;`,
    );

    if (isEnabled && methods.length > 0) {
      console.log(`%c[DEBUG] 开启方式: ${methods.join(', ')}`, 'color: #6b7280;');
    }

    console.log('%c[DEBUG] 控制方法:', 'color: #6b7280;');
    console.log('%c  debugControl.enable()  - 开启调试模式', 'color: #6b7280;');
    console.log('%c  debugControl.disable() - 关闭调试模式', 'color: #6b7280;');
    console.log('%c  debugControl.status()  - 查看状态', 'color: #6b7280;');
  },
};

// 在开发环境下，将调试控制接口挂载到全局对象
if (import.meta.env.DEV) {
  (window as any).debugControl = debugControl;
  console.log('%c[LOGGER] 调试控制接口已挂载到 window.debugControl', 'color: #8b5cf6;');
}
