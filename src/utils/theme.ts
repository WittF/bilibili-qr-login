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
    // 优先级：URL参数 > Cookie > 默认(auto)
    const urlTheme = this.getUrlTheme();
    const savedTheme = this.getCookieTheme();

    if (urlTheme) {
      this.currentTheme = urlTheme;
      // 如果URL指定了主题，也保存到cookie中
      this.setCookieTheme(urlTheme);
    } else if (savedTheme) {
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
