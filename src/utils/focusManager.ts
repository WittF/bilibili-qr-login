/**
 * 聚焦状态管理工具
 * 用于优化聚焦体验，清除残留状态
 */
export class FocusManager {
  private static instance: FocusManager;
  private focusedElements = new Set<HTMLElement>();
  private isMouseDown = false;
  private lastFocusTime = 0;

  constructor() {
    this.init();
  }

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  private init() {
    // 监听鼠标按下事件
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 监听聚焦事件
    document.addEventListener('focusin', this.handleFocusIn.bind(this), true);
    document.addEventListener('focusout', this.handleFocusOut.bind(this), true);

    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 监听点击事件（清除残留状态）
    document.addEventListener('click', this.handleClick.bind(this), true);
  }

  private handleMouseDown() {
    this.isMouseDown = true;
  }

  private handleMouseUp() {
    this.isMouseDown = false;
    // 延迟清除可能的残留聚焦状态
    setTimeout(() => {
      this.clearStaleHoverFocus();
    }, 100);
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target && this.isFocusableElement(target)) {
      this.focusedElements.add(target);
      this.lastFocusTime = Date.now();

      // 如果是鼠标操作导致的聚焦，标记为鼠标聚焦
      if (this.isMouseDown) {
        target.setAttribute('data-mouse-focus', 'true');
      } else {
        target.removeAttribute('data-mouse-focus');
      }
    }
  }

  private handleFocusOut(event: FocusEvent) {
    const target = event.target as HTMLElement;
    if (target) {
      this.focusedElements.delete(target);
      target.removeAttribute('data-mouse-focus');

      // 清除可能的残留样式
      this.clearElementFocusStyles(target);
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Tab键导航时清除所有鼠标聚焦标记
    if (event.key === 'Tab') {
      this.clearAllMouseFocusMarks();
    }
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 延迟处理，确保聚焦事件已经完成
    setTimeout(() => {
      // 如果点击的是按钮，清除其可能的残留聚焦状态
      if (target && this.isButtonElement(target)) {
        this.smartBlur(target);
      }
    }, 50);
  }

  private isFocusableElement(element: HTMLElement): boolean {
    const focusableTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'];
    return (
      focusableTags.includes(element.tagName) ||
      element.hasAttribute('tabindex') ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('language-switcher__current') ||
      element.classList.contains('language-switcher__option')
    );
  }

  private isButtonElement(element: HTMLElement): boolean {
    return (
      element.tagName === 'BUTTON' ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('btn') ||
      element.classList.contains('language-switcher__current')
    );
  }

  private clearStaleHoverFocus() {
    // 清除可能存在的伪悬停状态
    this.focusedElements.forEach(element => {
      if (element.hasAttribute('data-mouse-focus')) {
        const rect = element.getBoundingClientRect();
        const isHovered = this.isElementHovered(element, rect);

        if (!isHovered) {
          this.smartBlur(element);
        }
      }
    });
  }

  private isElementHovered(element: HTMLElement, rect: DOMRect): boolean {
    // 这里可以添加更复杂的悬停检测逻辑
    return element.matches(':hover');
  }

  private clearElementFocusStyles(element: HTMLElement) {
    // 移除可能的残留样式类
    element.classList.remove('focus-visible', 'focus-within');

    // 重置可能的内联样式
    if (element.style.boxShadow && element.style.boxShadow.includes('rgba(251, 114, 153')) {
      element.style.boxShadow = '';
    }
  }

  private clearAllMouseFocusMarks() {
    document.querySelectorAll('[data-mouse-focus]').forEach(element => {
      element.removeAttribute('data-mouse-focus');
    });
  }

  /**
   * 智能失焦 - 只在必要时移除焦点
   */
  public smartBlur(element: HTMLElement) {
    if (document.activeElement === element) {
      // 只有当元素确实是当前焦点时才移除焦点
      const shouldKeepFocus = this.shouldKeepFocus(element);

      if (!shouldKeepFocus) {
        element.blur();
        this.clearElementFocusStyles(element);
      }
    }
  }

  private shouldKeepFocus(element: HTMLElement): boolean {
    // 如果是键盘导航产生的焦点，保持焦点
    if (!element.hasAttribute('data-mouse-focus')) {
      return true;
    }

    // 如果是下拉菜单等需要保持焦点的元素
    if (element.classList.contains('language-switcher__current') && element.getAttribute('aria-expanded') === 'true') {
      return true;
    }

    // 如果刚刚获得焦点（100ms内），暂时保持
    if (Date.now() - this.lastFocusTime < 100) {
      return true;
    }

    return false;
  }

  /**
   * 手动清除所有残留的聚焦状态
   */
  public clearAllFocusStates() {
    this.focusedElements.forEach(element => {
      this.clearElementFocusStyles(element);
    });
    this.focusedElements.clear();

    // 清除当前活动元素的焦点
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur();
    }
  }

  /**
   * 为语言切换器提供专门的焦点管理
   */
  public handleLanguageSwitcherFocus(button: HTMLElement, shouldFocus: boolean = true) {
    if (shouldFocus) {
      // 延迟聚焦，确保DOM更新完成
      setTimeout(() => {
        button.focus();
        button.removeAttribute('data-mouse-focus');
      }, 100);
    } else {
      this.smartBlur(button);
    }
  }
}

// 创建全局实例
export const focusManager = FocusManager.getInstance();
