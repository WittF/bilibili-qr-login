import { loggers } from './logger';

export const IS_DEV = process.env.NODE_ENV === 'development';

// 模式检测
export const PARAM_MODE = (new URL(window.location.href).searchParams.get('mode') || '') as 'window' | 'iframe' | '';

// 信任源配置 - 使用构建时替换的配置
export const trustOrigins = __TRUST_ORIGIN__
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export const TRUST_ALL_ORIGIN = trustOrigins.includes('*');

// 记录模式检测结果
if (PARAM_MODE) {
  loggers.app.important('检测到iframe/window模式', {
    mode: PARAM_MODE,
    currentUrl: window.location.href,
    referrer: document.referrer || 'none',
    trustAllOrigin: TRUST_ALL_ORIGIN,
    trustedOrigins: TRUST_ALL_ORIGIN ? ['*'] : trustOrigins,
  });
} else {
  loggers.app.debug('标准模式运行', {
    currentUrl: window.location.href,
    hasUrlParams: !!new URL(window.location.href).search,
  });
}

// 记录环境配置
loggers.app.debug('常量配置加载完成', {
  mode: PARAM_MODE || 'standard',
  trustAllOrigin: TRUST_ALL_ORIGIN,
  trustedOriginsCount: trustOrigins.length,
  trustOriginConfig: __TRUST_ORIGIN__,
  isDev: import.meta.env.DEV,
  envMode: import.meta.env.MODE,
});
