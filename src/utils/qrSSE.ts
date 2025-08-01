import { computed, reactive } from 'vue';
import { postQrMessage } from './postMessage';
import { useI18n } from './i18n';
import { loggers } from './logger';

enum SSEEvent {
  GENERATE = 'generate',
  POLL = 'poll',
  END = 'end',
}

interface SSEGenerateData {
  code: number;
  msg: string;
  url: string;
  key: string;
}

interface SSEPollData {
  code: number;
  msg: string;
  cookie?: string;
  cookieValidation?: {
    status: 'success' | 'failed' | 'error';
    message: string;
    details?: string;
  };
}

enum PollQrResultCode {
  SUCCESS = 0,
  EXPIRED = 86038,
  NOT_CONFIRMED = 86090,
  NOT_SCANNED = 86101,
}

export enum QrStatus {
  LOADING,
  WAIT,
  SCANNED,
  EXPIRED,
  SUCCESS,
  ERROR,
}

interface QrState {
  url: string;
  cookie: string;
  errMsg: string;
  status: QrStatus;
  cookieValidation?: {
    status: 'success' | 'failed' | 'error';
    message: string;
    details?: string;
  };
}

const defaultState = (): QrState => ({
  url: '',
  cookie: '',
  errMsg: '',
  status: QrStatus.LOADING,
});

class QrSSE {
  private es!: EventSource;
  private reconnectTimeout?: number;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  public constructor(private state: QrState) {
    this.start();
  }

  public restart() {
    const { url } = this.state;
    Object.assign(this.state, defaultState(), { url });
    this.reconnectAttempts = 0;
    this.clearReconnectTimeout();
    this.start();
  }

  public stop() {
    if (!this.es) return;
    this.es.close();
    this.clearReconnectTimeout();
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
  }

  private start() {
    this.stop();

    try {
      this.es = new EventSource('/api/qr');
      this.es.addEventListener(SSEEvent.GENERATE, this.handleMessage);
      this.es.addEventListener(SSEEvent.POLL, this.handleMessage);
      this.es.addEventListener(SSEEvent.END, this.handleEnd);
      this.es.addEventListener('error', this.handleConnectionError);

      loggers.qrSSE.info('SSE连接已创建');
    } catch (error) {
      loggers.qrSSE.error('创建SSE连接失败', error);
      this.handleError('连接服务器失败，请检查网络连接');
    }
  }

  private handleMessage = ({ type, data }: MessageEvent<string>) => {
    const obj = JSON.parse(data);
    loggers.qrSSE.info('收到SSE消息', { type, data: obj });

    // 收到消息说明连接正常，重置重连计数器
    if (this.reconnectAttempts > 0) {
      loggers.qrSSE.info('连接已恢复，重置重连计数器', {
        previousAttempts: this.reconnectAttempts,
      });
      this.reconnectAttempts = 0;
      this.clearReconnectTimeout();
    }

    switch (type) {
      case SSEEvent.POLL:
        this.handlePoll(obj);
        break;
      case SSEEvent.GENERATE:
        this.handleGenerate(obj);
        break;
    }
  };

  private handleEnd = ({ data }: MessageEvent<string>) => {
    if (data) this.handleError(data);
    this.stop();
  };

  private handleError(msg: string) {
    this.state.errMsg = msg || '发生错误';
    this.state.status = QrStatus.ERROR;
    loggers.qrSSE.error('QR码服务错误', { message: msg });
  }

  private handleConnectionError = (event: Event) => {
    const eventSource = event.target as EventSource;

    loggers.qrSSE.warn('SSE连接异常', {
      readyState: eventSource.readyState,
      url: eventSource.url,
      eventType: event.type,
      reconnectAttempts: this.reconnectAttempts,
    });

    // 根据连接状态提供更精确的错误信息
    switch (eventSource.readyState) {
      case EventSource.CONNECTING:
        this.reconnectAttempts++;

        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          this.handleError('正在重连服务器...');

          // 设置重连超时，如果超时仍未连接成功，则提示用户手动重试
          this.clearReconnectTimeout();
          this.reconnectTimeout = window.setTimeout(() => {
            if (eventSource.readyState === EventSource.CONNECTING) {
              loggers.qrSSE.warn('重连超时', {
                attempts: this.reconnectAttempts,
                duration: '10s',
              });
              this.handleError('重连超时，请刷新二维码重试');
            }
          }, 10000);
        } else {
          loggers.qrSSE.error('重连次数超限', {
            maxAttempts: this.maxReconnectAttempts,
            actualAttempts: this.reconnectAttempts,
          });
          this.handleError('连接失败次数过多，请刷新二维码重试');
        }
        break;

      case EventSource.CLOSED:
        this.clearReconnectTimeout();
        this.handleError('连接已断开，请刷新页面重试');
        break;

      default:
        this.clearReconnectTimeout();
        this.handleError('网络连接异常，请检查网络状态');
    }
  };

  private logCookieValidationResult(validation: {
    status: 'success' | 'failed' | 'error';
    message: string;
    details?: string;
  }) {
    // 使用统一的日志系统记录Cookie验证结果
    const logData = {
      status: validation.status,
      message: validation.message,
      details: validation.details,
    };

    switch (validation.status) {
      case 'success':
        loggers.qrSSE.important('Cookie可用性验证通过', logData);
        break;
      case 'failed':
        loggers.qrSSE.warn('Cookie可用性验证未通过', logData);
        break;
      case 'error':
        loggers.qrSSE.error('Cookie可用性验证异常', logData);
        break;
    }
  }

  private handleGenerate({ code, msg, url }: SSEGenerateData) {
    if (code !== 0) {
      this.handleError(msg);
      return;
    }

    this.state.url = url;
    this.state.status = QrStatus.WAIT;
  }

  private handlePoll({ code, msg, cookie, cookieValidation }: SSEPollData) {
    switch (code) {
      case PollQrResultCode.NOT_SCANNED:
        this.state.status = QrStatus.WAIT;
        break;
      case PollQrResultCode.NOT_CONFIRMED:
        this.state.status = QrStatus.SCANNED;
        break;
      case PollQrResultCode.EXPIRED:
        this.state.status = QrStatus.EXPIRED;
        break;
      case PollQrResultCode.SUCCESS:
        this.state.status = QrStatus.SUCCESS;
        this.state.cookie = cookie!;
        this.state.cookieValidation = cookieValidation;

        // 在浏览器控制台显示Cookie验证结果
        if (cookieValidation) {
          this.logCookieValidationResult(cookieValidation);
        }

        postQrMessage({ type: 'success', data: cookie! });
        break;
      default:
        this.handleError(msg);
        break;
    }
  }
}

export const useQrSSE = () => {
  const state = reactive<QrState>(defaultState());
  const { t } = useI18n();

  const getters = reactive({
    statusText: computed(() => {
      switch (state.status) {
        case QrStatus.LOADING:
          return t.value.status.loading;
        case QrStatus.WAIT:
          return t.value.status.waiting;
        case QrStatus.SCANNED:
          return t.value.status.scanned;
        case QrStatus.EXPIRED:
          return t.value.status.expired;
        case QrStatus.SUCCESS:
          return t.value.status.success;
        default:
          return state.errMsg;
      }
    }),
  });

  const qrSSE = new QrSSE(state);

  return {
    state,
    getters,
    restart: qrSSE.restart.bind(qrSSE),
    stop: qrSSE.stop.bind(qrSSE),
  };
};
