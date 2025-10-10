import { createHash } from 'crypto';

/**
 * TV端 APP 密钥
 * 使用云视听小电视的appkey和appsec
 */
export const TV_APPKEY = '4409e2ce8ffd12b8';
export const TV_APPSEC = '59b43e04ad6965f34319062b478f83dd';

/**
 * 生成APP签名
 * @param params URL参数对象
 * @param appsec APP密钥
 * @returns MD5签名
 */
export function generateSign(params: Record<string, string | number>, appsec: string): string {
  // 按key排序参数
  const sortedKeys = Object.keys(params).sort();
  // 拼接参数字符串
  const paramStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  // 拼接appsec并计算MD5
  const signStr = paramStr + appsec;
  return createHash('md5').update(signStr).digest('hex');
}

/**
 * 为TV端请求参数添加签名
 * @param params 参数对象
 * @returns 添加了ts和sign的参数对象
 */
export function signTVParams(params: Record<string, string | number>): Record<string, string | number> {
  const ts = Math.floor(Date.now() / 1000);
  const paramsWithAppkey = {
    appkey: TV_APPKEY,
    ...params,
    ts,
  };
  const sign = generateSign(paramsWithAppkey, TV_APPSEC);
  return {
    ...paramsWithAppkey,
    sign,
  };
}
