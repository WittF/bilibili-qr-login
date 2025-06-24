export type Theme = 'light' | 'dark' | 'auto';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'auto';
  private mediaQuery: MediaQueryList;
  private initialized = false;

  private constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // 延迟初始化，确保DOM准备好
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      // DOM已经准备好，立即初始化
      setTimeout(() => this.init(), 0);
    }
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  // 公开方法，允许手动重新初始化
  reinitialize() {
    if (import.meta.env.DEV) {
      console.log('🔄 重新初始化主题管理器');
    }
    this.init();
  }

  private init() {
    if (this.initialized) {
      return;
    }

    const isDebug = import.meta.env.DEV;

    if (isDebug) {
      console.log('🎨 主题管理器初始化');
    }

    // 优先级：URL参数 > Cookie > 默认(auto)
    const urlTheme = this.getUrlTheme();
    const savedTheme = this.getCookieTheme();

    if (isDebug) {
      console.log('🔍 主题检测:', { urlTheme, savedTheme });
    }

    if (urlTheme) {
      this.currentTheme = urlTheme;
      this.setCookieTheme(urlTheme);
      if (isDebug) console.log('✅ 使用URL参数主题:', urlTheme);
    } else if (savedTheme) {
      this.currentTheme = savedTheme;
      if (isDebug) console.log('✅ 使用Cookie主题:', savedTheme);
    } else {
      if (isDebug) console.log('✅ 使用默认主题: auto');
    }

    // 监听系统主题变化（只添加一次）
    if (!this.initialized) {
      this.mediaQuery.addEventListener('change', e => {
        if (isDebug) {
          console.log('🌓 系统主题变化:', e.matches ? 'dark' : 'light');
        }
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
    }

    // 应用主题
    this.applyTheme();
    this.initialized = true;
  }

  private getUrlTheme(): Theme | null {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam && ['light', 'dark', 'auto'].includes(themeParam)) {
      return themeParam as Theme;
    }
    return null;
  }

  private getCookieTheme(): Theme | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'theme') {
        const theme = value as Theme;
        if (['light', 'dark', 'auto'].includes(theme)) {
          return theme;
        }
      }
    }
    return null;
  }

  private setCookieTheme(theme: Theme) {
    // 设置cookie，有效期1年
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  private applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();

    if (import.meta.env.DEV) {
      console.log('🎯 应用主题:', effectiveTheme);
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // 更新meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (metaThemeColor) {
      metaThemeColor.content = effectiveTheme === 'dark' ? '#0e0f10' : '#f6f7f8';
    }
  }

  setTheme(theme: Theme) {
    if (import.meta.env.DEV) {
      console.log('🎛️ 手动设置主题:', theme);
    }
    this.currentTheme = theme;
    this.setCookieTheme(theme);
    this.applyTheme();
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getEffectiveThemeValue(): 'light' | 'dark' {
    return this.getEffectiveTheme();
  }
}

export const themeManager = ThemeManager.getInstance();
