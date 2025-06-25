/**
 * 简化的聚焦状态管理工具
 */
export class FocusManager {
  private static instance: FocusManager;

  public static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * 智能失焦 - 移除元素焦点
   */
  public smartBlur(element: HTMLElement) {
    if (document.activeElement === element) {
      element.blur();
    }
  }

  /**
   * 为语言切换器提供焦点管理
   */
  public handleLanguageSwitcherFocus(button: HTMLElement, shouldFocus: boolean = true) {
    if (shouldFocus) {
      setTimeout(() => button.focus(), 100);
    } else {
      this.smartBlur(button);
    }
  }
}

// 创建全局实例
export const focusManager = FocusManager.getInstance();
