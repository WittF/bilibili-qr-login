import { themeManager } from './theme';

export class ThemeDebugger {
  private debugPanel: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    // 只在开发模式下启用
    if (import.meta.env.DEV) {
      this.init();
    }
  }

  private init() {
    // 添加快捷键：Ctrl + Shift + T 切换调试面板
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        this.toggle();
      }
    });

    // 创建调试面板
    this.createDebugPanel();
    this.updateDebugInfo();

    // 监听主题变化
    const observer = new MutationObserver(() => {
      this.updateDebugInfo();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    console.log('🐛 主题调试器已启用 - 按 Ctrl+Shift+T 切换调试面板');
  }

  private createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'theme-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    document.body.appendChild(this.debugPanel);
  }

  private updateDebugInfo() {
    if (!this.debugPanel) return;

    const currentTheme = themeManager.getCurrentTheme();
    const effectiveTheme = themeManager.getEffectiveThemeValue();
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');
    const dataTheme = document.documentElement.getAttribute('data-theme');

    this.debugPanel.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold; color: #4fc3f7;">🎨 主题调试信息</div>
      <div>📍 当前主题: <span style="color: #81c784;">${currentTheme}</span></div>
      <div>🎯 生效主题: <span style="color: #ffb74d;">${effectiveTheme}</span></div>
      <div>🔗 URL参数: <span style="color: #f06292;">${urlTheme || '无'}</span></div>
      <div>🏷️ DOM属性: <span style="color: #ba68c8;">${dataTheme || '未设置'}</span></div>
      <div>🌓 系统偏好: <span style="color: #4db6ac;">${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}</span></div>
      <div style="margin-top: 8px; font-size: 10px; color: #ccc;">
        Ctrl+Shift+T 切换面板
      </div>
    `;
  }

  toggle() {
    if (!this.debugPanel) return;

    this.isVisible = !this.isVisible;
    this.debugPanel.style.transform = this.isVisible ? 'translateX(0)' : 'translateX(100%)';

    if (this.isVisible) {
      this.updateDebugInfo();
    }
  }

  show() {
    this.isVisible = true;
    if (this.debugPanel) {
      this.debugPanel.style.transform = 'translateX(0)';
      this.updateDebugInfo();
    }
  }

  hide() {
    this.isVisible = false;
    if (this.debugPanel) {
      this.debugPanel.style.transform = 'translateX(100%)';
    }
  }
}

export const themeDebugger = new ThemeDebugger();
