export type Theme = 'light' | 'dark' | 'auto';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'auto';
  private mediaQuery: MediaQueryList;

  private constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private init() {
    // 从cookie读取主题偏好
    const savedTheme = this.getCookieTheme();
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    // 监听系统主题变化
    this.mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'auto') {
        this.applyTheme();
      }
    });

    // 应用主题
    this.applyTheme();
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
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // 更新meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (metaThemeColor) {
      metaThemeColor.content = effectiveTheme === 'dark' ? '#1a1a1a' : '#f6f7f8';
    }
  }

  setTheme(theme: Theme) {
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
