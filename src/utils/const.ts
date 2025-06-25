import { loggers } from './logger';

export const IS_DEV = process.env.NODE_ENV === 'development';

// 应用版本号
export const APP_VERSION = __APP_VERSION__;

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
  loggers.app.info('标准模式运行', {
    currentUrl: window.location.href,
    hasUrlParams: !!new URL(window.location.href).search,
  });
}

// 记录环境配置
const trustOriginStatus = TRUST_ALL_ORIGIN
  ? '允许所有域名'
  : trustOrigins.length > 0
    ? `仅允许: ${trustOrigins.join(', ')}`
    : '仅允许当前域名';

loggers.app.important('应用配置加载完成', {
  mode: PARAM_MODE || 'standard',
  environment: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  trustOriginPolicy: trustOriginStatus,
  trustedOrigins: TRUST_ALL_ORIGIN ? ['*'] : trustOrigins.length > 0 ? trustOrigins : [window.location.origin],
  version: APP_VERSION,
});
