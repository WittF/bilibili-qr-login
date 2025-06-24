import { PARAM_MODE, TRUST_ALL_ORIGIN, trustOrigins } from './const';
import { loggers } from './logger';

interface QrMessage {
  type: 'success';
  mode: string;
  data: string;
}

export const postQrMessage = (data: Omit<QrMessage, 'mode'>) => {
  loggers.postMessage.debug('开始处理QR登录消息', {
    messageType: data.type,
    mode: PARAM_MODE,
    dataLength: data.data?.length || 0,
  });

  if (!PARAM_MODE) {
    loggers.postMessage.debug('非iframe/window模式，跳过postMessage发送');
    return;
  }

  const targetWindow: Window | null =
    PARAM_MODE === 'window' ? window.opener : PARAM_MODE === 'iframe' ? window.top : null;

  if (!targetWindow) {
    loggers.postMessage.error('没有目标窗口，可能不在iframe或window模式中', {
      mode: PARAM_MODE,
      hasWindowOpener: !!window.opener,
      hasWindowTop: !!window.top,
      currentOrigin: window.location.origin,
    });
    return;
  }

  const message: QrMessage = { ...data, mode: PARAM_MODE };

  loggers.postMessage.debug('准备发送消息到父窗口', {
    mode: PARAM_MODE,
    messageType: message.type,
    trustAllOrigin: TRUST_ALL_ORIGIN,
    trustedOrigins: TRUST_ALL_ORIGIN ? ['*'] : trustOrigins,
    targetWindowExists: !!targetWindow,
  });

  try {
    if (TRUST_ALL_ORIGIN) {
      targetWindow.postMessage(message, '*');
      loggers.postMessage.important('消息已发送到父窗口', {
        mode: PARAM_MODE,
        targetOrigin: '*',
        messageType: message.type,
      });
    } else {
      trustOrigins.forEach(origin => {
        targetWindow.postMessage(message, origin);
        loggers.postMessage.debug('消息已发送到指定域', {
          mode: PARAM_MODE,
          targetOrigin: origin,
          messageType: message.type,
        });
      });
      loggers.postMessage.important('消息已发送到所有信任域', {
        mode: PARAM_MODE,
        trustedOriginsCount: trustOrigins.length,
        messageType: message.type,
      });
    }
  } catch (error) {
    loggers.postMessage.error('发送消息失败', {
      mode: PARAM_MODE,
      error: error instanceof Error ? error.message : String(error),
      messageType: message.type,
    });
  }
};
