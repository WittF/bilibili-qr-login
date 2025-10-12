import { PARAM_MODE, PARAM_TARGET_ORIGIN, TRUST_ALL_ORIGIN, trustOrigins } from './const';
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

  // 尝试获取父页面的origin
  const getParentOrigin = (): string | null => {
    try {
      if (PARAM_MODE === 'window' && window.opener) {
        return window.opener.location.origin;
      }
      if (PARAM_MODE === 'iframe' && window.parent !== window) {
        return window.parent.location.origin;
      }
    } catch (error) {
      // 跨域限制，尝试从referrer获取
      if (document.referrer) {
        try {
          return new URL(document.referrer).origin;
        } catch {
          // referrer解析失败
        }
      }
    }
    return null;
  };

  loggers.postMessage.debug('准备发送消息到父窗口', {
    mode: PARAM_MODE,
    messageType: message.type,
    trustAllOrigin: TRUST_ALL_ORIGIN,
    trustOrigins: TRUST_ALL_ORIGIN ? ['*'] : trustOrigins,
    targetWindowExists: !!targetWindow,
    customTargetOrigin: PARAM_TARGET_ORIGIN || 'none',
  });

  try {
    // 优先级1: 开发模式或配置了 '*'，允许发送到任意域名
    if (TRUST_ALL_ORIGIN) {
      const targetOrigin = PARAM_TARGET_ORIGIN || '*';
      targetWindow.postMessage(message, targetOrigin);
      loggers.postMessage.important('消息已发送 (开发模式)', {
        mode: PARAM_MODE,
        targetOrigin,
        messageType: message.type,
        source: PARAM_TARGET_ORIGIN ? 'url-parameter' : 'wildcard',
      });
    } else if (trustOrigins.length > 0) {
      // 优先级2: 配置了特定域名白名单
      if (PARAM_TARGET_ORIGIN) {
        // URL 参数必须在白名单内
        if (trustOrigins.includes(PARAM_TARGET_ORIGIN)) {
          targetWindow.postMessage(message, PARAM_TARGET_ORIGIN);
          loggers.postMessage.important('消息已发送到URL参数指定的域名 (已验证)', {
            mode: PARAM_MODE,
            targetOrigin: PARAM_TARGET_ORIGIN,
            messageType: message.type,
          });
        } else {
          loggers.postMessage.error('URL参数指定的域名不在信任列表中', {
            mode: PARAM_MODE,
            requestedOrigin: PARAM_TARGET_ORIGIN,
            trustOrigins,
            messageType: message.type,
          });
          // 降级到白名单发送
          trustOrigins.forEach(origin => {
            targetWindow.postMessage(message, origin);
          });
          loggers.postMessage.important('已降级发送到配置的信任域', {
            mode: PARAM_MODE,
            trustOriginsCount: trustOrigins.length,
            messageType: message.type,
          });
        }
      } else {
        // 没有 URL 参数，发送到所有白名单域名
        trustOrigins.forEach(origin => {
          targetWindow.postMessage(message, origin);
          loggers.postMessage.debug('消息已发送到指定域', {
            mode: PARAM_MODE,
            targetOrigin: origin,
            messageType: message.type,
          });
        });
        loggers.postMessage.important('消息已发送到配置的信任域', {
          mode: PARAM_MODE,
          trustOriginsCount: trustOrigins.length,
          messageType: message.type,
        });
      }
    } else {
      // 优先级3: 没有配置 TRUST_ORIGIN，使用 URL 参数或自动检测
      if (PARAM_TARGET_ORIGIN) {
        targetWindow.postMessage(message, PARAM_TARGET_ORIGIN);
        loggers.postMessage.important('消息已发送到URL参数指定的域名', {
          mode: PARAM_MODE,
          targetOrigin: PARAM_TARGET_ORIGIN,
          messageType: message.type,
        });
      } else {
        const parentOrigin = getParentOrigin();
        const targetOrigin = parentOrigin || window.location.origin;

        targetWindow.postMessage(message, targetOrigin);
        loggers.postMessage.important('消息已发送到自动检测的域名', {
          mode: PARAM_MODE,
          targetOrigin,
          messageType: message.type,
          parentOriginDetected: !!parentOrigin,
        });
      }
    }
  } catch (error) {
    loggers.postMessage.error('发送消息失败', {
      mode: PARAM_MODE,
      error: error instanceof Error ? error.message : String(error),
      messageType: message.type,
    });
  }
};
