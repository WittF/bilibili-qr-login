export type Theme = 'light' | 'dark' | 'auto';

let currentTheme: Theme = 'auto';
let mediaQuery: MediaQueryList;
let initialized = false;

// 初始化主题管理
function init() {
  if (initialized) return;

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // 优先级：URL参数 > Cookie > 默认(auto)
  const urlTheme = getUrlTheme();
  const savedTheme = getCookieTheme();

  if (urlTheme) {
    currentTheme = urlTheme;
    setCookieTheme(urlTheme);
  } else if (savedTheme) {
    currentTheme = savedTheme;
  }

  // 监听系统主题变化
  mediaQuery.addEventListener('change', () => {
    if (currentTheme === 'auto') {
      applyTheme();
    }
  });

  applyTheme();
  initialized = true;
}

function getUrlTheme(): Theme | null {
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  if (themeParam && ['light', 'dark', 'auto'].includes(themeParam)) {
    return themeParam as Theme;
  }
  return null;
}

function getCookieTheme(): Theme | null {
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

function setCookieTheme(theme: Theme) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getEffectiveTheme(): 'light' | 'dark' {
  if (currentTheme === 'auto') {
    return mediaQuery.matches ? 'dark' : 'light';
  }
  return currentTheme;
}

function applyTheme() {
  const effectiveTheme = getEffectiveTheme();

  document.documentElement.setAttribute('data-theme', effectiveTheme);

  // 更新meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (metaThemeColor) {
    metaThemeColor.content = effectiveTheme === 'dark' ? '#0e0f10' : '#f6f7f8';
  }
}

// 导出的API
export const themeManager = {
  init,
  setTheme(theme: Theme) {
    currentTheme = theme;
    setCookieTheme(theme);
    applyTheme();
  },
  getCurrentTheme() {
    return currentTheme;
  },
  getEffectiveTheme() {
    return getEffectiveTheme();
  },
  reinitialize: init,
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 0);
}
