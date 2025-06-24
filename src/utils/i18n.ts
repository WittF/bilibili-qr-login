import { ref, computed } from 'vue';

// 支持的语言列表
export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en' | 'jp';

// 翻译文本接口
interface TranslationTexts {
  // 主要标题和描述
  title: {
    login: string;
    cookieTool: string;
  };
  subtitle: {
    login: string;
    cookieTool: string;
  };

  // 状态文本
  status: {
    loading: string;
    waiting: string;
    scanned: string;
    expired: string;
    success: string;
  };

  // Cookie 组件
  cookie: {
    info: string;
    convert: string;
    converting: string;
    result: string;
    copy: string;
    copied: string;
    download: string;
    formatError: string;
    serverError: string;
    convertError: string;
    unknownError: string;
  };

  // 其他文本
  common: {
    viewSource: string;
    refreshQR: string;
  };

  // HTML Meta 信息
  meta: {
    description: string;
    devDescription: string;
  };
}

// 翻译数据
const translations: Record<SupportedLanguage, TranslationTexts> = {
  'zh-CN': {
    title: {
      login: '哔哩哔哩登录',
      cookieTool: '哔哩哔哩 Cookie 获取工具',
    },
    subtitle: {
      login: '请使用哔哩哔哩手机 APP 扫码登录',
      cookieTool: '使用手机 APP 扫码登录后即可获取 cookie',
    },
    status: {
      loading: '加载中',
      waiting: '等待扫码',
      scanned: '已扫码，等待登录',
      expired: '二维码已过期，请刷新',
      success: '登录成功',
    },
    cookie: {
      info: 'Cookie 信息',
      convert: '转换',
      converting: '转换中...',
      result: '转换结果',
      copy: '复制',
      copied: '已复制',
      download: '下载',
      formatError: 'Cookie 格式不正确，请确保包含必要的B站登录信息',
      serverError: '服务器响应错误',
      convertError: '转换失败',
      unknownError: '未知错误',
    },
    common: {
      viewSource: '查看源码',
      refreshQR: '刷新二维码',
    },
    meta: {
      description: '哔哩哔哩二维码登录工具 - 使用手机APP扫码快速登录哔哩哔哩，安全获取Cookie信息',
      devDescription: '哔哩哔哩二维码登录工具开发版 - 开发测试专用页面',
    },
  },

  'zh-TW': {
    title: {
      login: 'bilibili 登入',
      cookieTool: 'bilibili Cookie 取得工具',
    },
    subtitle: {
      login: '請使用 bilibili 手機 APP 掃碼登入',
      cookieTool: '使用手機 APP 掃碼登入後即可取得 cookie',
    },
    status: {
      loading: '載入中',
      waiting: '等待掃碼',
      scanned: '已掃碼，等待登入',
      expired: '二維碼已過期，請重新整理',
      success: '登入成功',
    },
    cookie: {
      info: 'Cookie 資訊',
      convert: '轉換',
      converting: '轉換中...',
      result: '轉換結果',
      copy: '複製',
      copied: '已複製',
      download: '下載',
      formatError: 'Cookie 格式不正確，請確保包含必要的 bilibili 登入資訊',
      serverError: '伺服器回應錯誤',
      convertError: '轉換失敗',
      unknownError: '未知錯誤',
    },
    common: {
      viewSource: '查看源碼',
      refreshQR: '重新整理二維碼',
    },
    meta: {
      description: 'bilibili 二維碼登入工具 - 使用手機APP掃碼快速登入bilibili，安全取得Cookie資訊',
      devDescription: 'bilibili 二維碼登入工具開發版 - 開發測試專用頁面',
    },
  },

  en: {
    title: {
      login: 'Bilibili Login',
      cookieTool: 'Bilibili Cookie Tool',
    },
    subtitle: {
      login: 'Please use Bilibili mobile app to scan QR code',
      cookieTool: 'Scan QR code with mobile app to get cookies',
    },
    status: {
      loading: 'Loading',
      waiting: 'Waiting for scan',
      scanned: 'Scanned, waiting for login',
      expired: 'QR code expired, please refresh',
      success: 'Login successful',
    },
    cookie: {
      info: 'Cookie Information',
      convert: 'Convert',
      converting: 'Converting...',
      result: 'Conversion Result',
      copy: 'Copy',
      copied: 'Copied',
      download: 'Download',
      formatError: 'Invalid cookie format, please ensure it contains necessary Bilibili login information',
      serverError: 'Server response error',
      convertError: 'Conversion failed',
      unknownError: 'Unknown error',
    },
    common: {
      viewSource: 'View Source',
      refreshQR: 'Refresh QR Code',
    },
    meta: {
      description:
        'Bilibili QR Code Login Tool - Quickly login to Bilibili using mobile app QR scan, securely obtain Cookie information',
      devDescription: 'Bilibili QR Code Login Tool Development Version - Development and testing page',
    },
  },

  jp: {
    title: {
      login: 'bilibili ログイン',
      cookieTool: 'bilibili Cookie 取得ツール',
    },
    subtitle: {
      login: 'bilibili モバイルアプリでQRコードをスキャンしてください',
      cookieTool: 'モバイルアプリでQRコードをスキャンしてCookieを取得',
    },
    status: {
      loading: '読み込み中',
      waiting: 'スキャン待ち',
      scanned: 'スキャン済み、ログイン待ち',
      expired: 'QRコードが期限切れです。更新してください',
      success: 'ログイン成功',
    },
    cookie: {
      info: 'Cookie 情報',
      convert: '変換',
      converting: '変換中...',
      result: '変換結果',
      copy: 'コピー',
      copied: 'コピーしました',
      download: 'ダウンロード',
      formatError: 'Cookieの形式が正しくありません。bilibiliログイン情報が含まれていることを確認してください',
      serverError: 'サーバー応答エラー',
      convertError: '変換に失敗しました',
      unknownError: '不明なエラー',
    },
    common: {
      viewSource: 'ソースコードを見る',
      refreshQR: 'QRコードを更新',
    },
    meta: {
      description:
        'bilibili QRコードログインツール - モバイルアプリのQRスキャンでbilibiliに迅速ログイン、Cookieを安全取得',
      devDescription: 'bilibili QRコードログインツール開発版 - 開発・テスト専用ページ',
    },
  },
};

// 语言检测函数
function detectLanguage(): SupportedLanguage {
  try {
    // 1. 优先检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) {
      const normalizedLang = normalizeLanguageCode(langParam);
      if (normalizedLang && normalizedLang in translations) {
        return normalizedLang;
      }
    }

    // 2. 检查 localStorage 保存的语言偏好
    const savedLang = localStorage.getItem('bilibili-qr-lang') as SupportedLanguage;
    if (savedLang && savedLang in translations) {
      return savedLang;
    }

    // 3. 检查浏览器语言设置
    const browserLangs = navigator.languages || [navigator.language];
    for (const browserLang of browserLangs) {
      const normalizedLang = normalizeLanguageCode(browserLang);
      if (normalizedLang && normalizedLang in translations) {
        return normalizedLang;
      }
    }
  } catch (error) {
    console.warn('语言检测失败，使用默认语言:', error);
  }

  // 4. 默认返回简体中文
  return DEFAULT_LANGUAGE;
}

// 标准化语言代码
function normalizeLanguageCode(langCode: string): SupportedLanguage | null {
  const lang = langCode.toLowerCase();

  // 精确匹配
  if (lang === 'zh-cn' || lang === 'zh_cn' || lang === 'cn') return 'zh-CN';
  if (lang === 'zh-tw' || lang === 'zh_tw') return 'zh-TW';
  if (lang === 'en' || lang === 'en-us' || lang === 'en_us') return 'en';
  if (lang === 'ja' || lang === 'jp' || lang === 'ja-jp' || lang === 'ja_jp') return 'jp';

  // 前缀匹配
  if (lang.startsWith('zh-tw') || lang.startsWith('zh_tw')) return 'zh-TW';
  if (lang.startsWith('zh-hk') || lang.startsWith('zh_hk')) return 'zh-TW';
  if (lang.startsWith('zh-mo') || lang.startsWith('zh_mo')) return 'zh-TW';
  if (lang.startsWith('zh')) return 'zh-CN';
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('ja') || lang.startsWith('jp')) return 'jp';

  return null;
}

// 默认语言常量
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN';

// 当前语言状态
const currentLanguage = ref<SupportedLanguage>(detectLanguage());

// 安全获取翻译文本的函数
function getTranslation(lang: SupportedLanguage): TranslationTexts {
  return translations[lang] || translations[DEFAULT_LANGUAGE];
}

// 国际化 hook
export function useI18n() {
  // 当前翻译文本，确保总是有默认值
  const t = computed(() => getTranslation(currentLanguage.value));

  // 切换语言
  const setLanguage = (lang: SupportedLanguage) => {
    if (lang in translations) {
      currentLanguage.value = lang;
      localStorage.setItem('bilibili-qr-lang', lang);

      // 更新 HTML lang 属性
      document.documentElement.lang = lang;

      // 更新页面标题
      updatePageTitle();
    } else {
      console.warn(`不支持的语言代码: ${lang}, 使用默认语言 ${DEFAULT_LANGUAGE}`);
      currentLanguage.value = DEFAULT_LANGUAGE;
      document.documentElement.lang = DEFAULT_LANGUAGE;
    }
  };

  // 更新页面标题
  const updatePageTitle = () => {
    const PARAM_MODE = (new URL(window.location.href).searchParams.get('mode') || '') as 'window' | 'iframe' | '';
    const title = PARAM_MODE ? t.value.title.login : t.value.title.cookieTool;
    document.title = title;
  };

  // 获取语言代码对应的显示名称
  const getLanguageDisplayName = (lang: SupportedLanguage): string => {
    const displayNames = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      en: 'English',
      jp: '日本語',
    };
    return displayNames[lang];
  };

  // 获取所有支持的语言
  const getSupportedLanguages = (): Array<{ code: SupportedLanguage; name: string }> => {
    return Object.keys(translations).map(code => ({
      code: code as SupportedLanguage,
      name: getLanguageDisplayName(code as SupportedLanguage),
    }));
  };

  // 检查语言是否受支持
  const isLanguageSupported = (lang: string): boolean => {
    return lang in translations;
  };

  // 获取默认语言
  const getDefaultLanguage = (): SupportedLanguage => {
    return DEFAULT_LANGUAGE;
  };

  return {
    t,
    currentLanguage: currentLanguage,
    setLanguage,
    updatePageTitle,
    getLanguageDisplayName,
    getSupportedLanguages,
    isLanguageSupported,
    getDefaultLanguage,
  };
}

// 验证当前语言是否有效
function validateCurrentLanguage(): void {
  if (!(currentLanguage.value in translations)) {
    console.warn(`当前语言 ${currentLanguage.value} 无效，重置为默认语言 ${DEFAULT_LANGUAGE}`);
    currentLanguage.value = DEFAULT_LANGUAGE;
  }
}

// 安全初始化
function safeInitialize(): void {
  try {
    validateCurrentLanguage();
    document.documentElement.lang = currentLanguage.value;
  } catch (error) {
    console.error('国际化初始化失败:', error);
    currentLanguage.value = DEFAULT_LANGUAGE;
    document.documentElement.lang = DEFAULT_LANGUAGE;
  }
}

// 初始化时设置 HTML lang 属性
safeInitialize();
