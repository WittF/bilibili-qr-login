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

  public constructor(private state: QrState) {
    this.start();
  }

  public restart() {
    const { url } = this.state;
    Object.assign(this.state, defaultState(), { url });
    this.start();
  }

  public stop() {
    if (!this.es) return;
    this.es.close();
  }

  private start() {
    this.stop();
    this.es = new EventSource('/api/qr');
    this.es.addEventListener(SSEEvent.GENERATE, this.handleMessage);
    this.es.addEventListener(SSEEvent.POLL, this.handleMessage);
    this.es.addEventListener(SSEEvent.END, this.handleEnd);
  }

  private handleMessage = ({ type, data }: MessageEvent<string>) => {
    const obj = JSON.parse(data);
    loggers.qrSSE.debug('收到SSE消息', { type, data: obj });

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
    return;
  }

  private logCookieValidationResult(validation: {
    status: 'success' | 'failed' | 'error';
    message: string;
    details?: string;
  }) {
    // 保留特殊的Cookie验证日志样式，因为这是用户关心的重要信息
    const timestamp = new Date().toLocaleTimeString();

    switch (validation.status) {
      case 'success':
        console.log(
          `%c[${timestamp}] 🍪 Cookie可用性验证通过`,
          'color: #10b981; font-weight: bold;',
          `\n✅ ${validation.message}`,
        );
        // 同时记录到统一日志系统
        loggers.qrSSE.important('Cookie验证通过', { message: validation.message });
        break;

      case 'failed':
        console.warn(
          `%c[${timestamp}] 🍪 Cookie可用性验证未通过`,
          'color: #f59e0b; font-weight: bold;',
          `\n⚠️ ${validation.message}`,
          validation.details ? `\n📝 ${validation.details}` : '',
        );
        // 同时记录到统一日志系统
        loggers.qrSSE.warn('Cookie验证未通过', {
          message: validation.message,
          details: validation.details,
        });
        break;

      case 'error':
        console.error(
          `%c[${timestamp}] 🍪 Cookie可用性验证异常`,
          'color: #ef4444; font-weight: bold;',
          `\n❌ ${validation.message}`,
          validation.details ? `\n📝 ${validation.details}` : '',
        );
        // 同时记录到统一日志系统
        loggers.qrSSE.error('Cookie验证异常', {
          message: validation.message,
          details: validation.details,
        });
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
