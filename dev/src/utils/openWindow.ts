// 为开发模式添加简单的日志系统
const createDevLogger = (module: string) => ({
  debug: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${module}] DEBUG: ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${module}] INFO: ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${module}] ERROR: ${message}`, data || '');
  },
});

const logger = createDevLogger('DEV-WINDOW');

interface ScreenExt extends Screen {
  availLeft: number;
  availTop: number;
}

const getCenterPosition = (width: number, height: number) => {
  const screenLeft = window.screenLeft !== undefined ? window.screenLeft : (window.screen as ScreenExt).availLeft;
  const screenTop = window.screenTop !== undefined ? window.screenTop : (window.screen as ScreenExt).availTop;

  const screenWidth = window.screen.width || window.outerWidth || document.documentElement.clientWidth;
  const screenHeight = window.screen.height || window.outerWidth || document.documentElement.clientHeight;

  const position = {
    left: Math.round((screenWidth - width) / 2 + screenLeft),
    top: Math.round((screenHeight - height) / 2 + screenTop),
  };

  logger.debug('计算窗口居中位置', {
    windowSize: { width, height },
    screenSize: { width: screenWidth, height: screenHeight },
    screenOffset: { left: screenLeft, top: screenTop },
    calculatedPosition: position,
  });

  return position;
};

const getFeaturesStr = (features: Record<string, any>) => {
  const featuresStr = Object.entries(features)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');

  logger.debug('窗口特性配置', { features, featuresString: featuresStr });
  return featuresStr;
};

export const openQrWindow = (url: string) => {
  const width = 380;
  const height = 340;

  logger.info('准备打开QR登录窗口', {
    targetUrl: url,
    windowSize: { width, height },
    currentOrigin: window.location.origin,
  });

  try {
    const features = getFeaturesStr({
      width,
      height,
      location: false,
      menubar: false,
      resizable: false,
      scrollbars: false,
      status: false,
      toolbar: false,
      ...getCenterPosition(width, height),
    });

    const newWindow = window.open(url, '_blank', features);

    if (newWindow) {
      logger.info('QR登录窗口打开成功', {
        windowName: '_blank',
        features,
        hasWindowReference: !!newWindow,
      });

      // 监听窗口关闭
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          logger.info('QR登录窗口已关闭');
        }
      }, 1000);

      // 30秒后停止检查（避免无限循环）
      setTimeout(() => {
        clearInterval(checkClosed);
        logger.debug('停止窗口关闭状态检查');
      }, 30000);
    } else {
      logger.error('QR登录窗口打开失败', {
        possibleCause: '弹窗被阻止或浏览器限制',
        userAgent: navigator.userAgent.substring(0, 100),
      });
    }

    return newWindow;
  } catch (error) {
    logger.error('打开QR登录窗口时发生异常', {
      error: error instanceof Error ? error.message : String(error),
      url,
      windowSize: { width, height },
    });
    return null;
  }
};
