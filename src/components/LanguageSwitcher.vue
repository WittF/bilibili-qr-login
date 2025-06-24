<template>
  <div class="language-switcher">
    <button
      class="language-switcher__current"
      :class="{ 'language-switcher__current--open': isOpen }"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      aria-label="选择语言"
      @click="toggleDropdown"
      @keydown="handleKeyDown"
    >
      <LanguageIcon class="language-switcher__icon" />
      <span class="language-switcher__label">{{ getLanguageDisplayName(currentLanguage) }}</span>
      <ArrowDownIcon class="language-switcher__arrow" :class="{ 'language-switcher__arrow--open': isOpen }" />
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="language-switcher__dropdown" role="menu" :aria-label="'语言选择菜单'">
        <button
          v-for="(language, index) in getSupportedLanguages()"
          :key="language.code"
          class="language-switcher__option"
          :class="{ 'language-switcher__option--active': language.code === currentLanguage }"
          role="menuitem"
          :tabindex="isOpen ? 0 : -1"
          :aria-selected="language.code === currentLanguage"
          @click="selectLanguage(language.code)"
          @keydown="handleOptionKeyDown($event, index)"
        >
          <span class="language-switcher__option-name">{{ language.name }}</span>
          <CheckSmallIcon v-if="language.code === currentLanguage" class="language-switcher__check" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from '../utils/i18n';
import LanguageIcon from '../assets/icons/language.svg';
import ArrowDownIcon from '../assets/icons/arrow_down.svg';
import CheckSmallIcon from '../assets/icons/check_small.svg';
import type { SupportedLanguage } from '../utils/i18n';

const { currentLanguage, setLanguage, getLanguageDisplayName, getSupportedLanguages } = useI18n();
const isOpen = ref(false);
const currentFocusIndex = ref(-1);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    currentFocusIndex.value = -1;
    // 延迟聚焦第一个选项，等待DOM更新
    nextTick(() => {
      const firstOption = document.querySelector('.language-switcher__option') as HTMLElement;
      if (firstOption) {
        firstOption.focus();
        currentFocusIndex.value = 0;
      }
    });
  }
};

const selectLanguage = (lang: SupportedLanguage) => {
  setLanguage(lang);
  isOpen.value = false;
  currentFocusIndex.value = -1;
  // 返回焦点到主按钮
  const button = document.querySelector('.language-switcher__current') as HTMLElement;
  if (button) {
    button.focus();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      toggleDropdown();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value) {
        toggleDropdown();
      }
      break;
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault();
        isOpen.value = false;
        currentFocusIndex.value = -1;
      }
      break;
  }
};

const handleOptionKeyDown = (event: KeyboardEvent, index: number) => {
  const languages = getSupportedLanguages();

  switch (event.key) {
    case 'Enter':
    case ' ': {
      event.preventDefault();
      selectLanguage(languages[index].code);
      break;
    }
    case 'ArrowDown': {
      event.preventDefault();
      currentFocusIndex.value = (index + 1) % languages.length;
      nextTick(() => {
        const nextOption = document.querySelectorAll('.language-switcher__option')[
          currentFocusIndex.value
        ] as HTMLElement;
        if (nextOption) {
          nextOption.focus();
        }
      });
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      currentFocusIndex.value = index === 0 ? languages.length - 1 : index - 1;
      nextTick(() => {
        const prevOption = document.querySelectorAll('.language-switcher__option')[
          currentFocusIndex.value
        ] as HTMLElement;
        if (prevOption) {
          prevOption.focus();
        }
      });
      break;
    }
    case 'Escape': {
      event.preventDefault();
      isOpen.value = false;
      currentFocusIndex.value = -1;
      // 返回焦点到主按钮
      const button = document.querySelector('.language-switcher__current') as HTMLElement;
      if (button) {
        button.focus();
      }
      break;
    }
  }
};

const closeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isOpen.value = false;
    currentFocusIndex.value = -1;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped lang="less">
.language-switcher {
  position: relative;
  display: inline-block;

  &__current {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: transparent;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-secondary);
    font-size: 0.9rem;
    min-width: 110px;
    font-family: inherit;

    // 重置button默认样式
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    // 确保文字对齐
    text-align: left;

    &:hover {
      background-color: var(--overlay-light);
      transform: translateY(-1px);
    }

    &:focus {
      outline: 2px solid var(--bilibili-pink);
      outline-offset: 2px;
    }

    &:focus-visible {
      outline: 2px solid var(--bilibili-pink);
      outline-offset: 2px;
    }

    &--open {
      background-color: var(--overlay-light);
      color: var(--text-primary);
    }
  }

  &__icon {
    color: currentColor;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
    }
  }

  &__label {
    flex: 1;
    font-weight: 500;
    display: flex;
    align-items: center;
    height: 16px;
    line-height: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    white-space: nowrap;
  }

  &__arrow {
    color: currentColor;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
    }

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 0;
    bottom: auto;
    left: 100%;
    right: auto;
    margin-left: var(--spacing-xs);
    background-color: var(--card-background);
    border: 1px solid var(--divider);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    z-index: 2000;
    min-width: 120px;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 0.9rem;
    background-color: transparent;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;

    &:hover {
      background-color: var(--background);
    }

    &:focus {
      outline: 2px solid var(--bilibili-pink);
      outline-offset: -2px;
      background-color: var(--background);
    }

    &--active {
      background-color: var(--overlay-light);
      color: var(--text-primary);
      font-weight: 500;
    }
  }

  &__option-name {
    flex: 1;
    display: flex;
    align-items: center;
    height: 16px;
    line-height: 1;
  }

  &__check {
    color: var(--bilibili-pink);
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
    }
  }
}

// 下拉动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// 暗色主题下的特殊样式
[data-theme='dark'] .language-switcher {
  &__current {
    color: var(--text-secondary);

    &:hover {
      background-color: var(--overlay-dark);
      color: var(--text-primary);
    }

    &--open {
      background-color: var(--overlay-dark);
      color: var(--text-primary);
    }
  }

  &__option {
    color: var(--text-primary);

    &:hover {
      background-color: var(--overlay-dark);
    }

    &:focus {
      background-color: var(--overlay-dark);
    }

    &--active {
      color: var(--text-primary);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .language-switcher {
    &__current {
      min-width: 90px;
      padding: var(--spacing-xs);
      font-size: 0.85rem;
    }

    &__dropdown {
      left: auto;
      right: 0;
      margin-left: 0;
      margin-right: 0;
      min-width: 100px;
    }

    &__option {
      padding: var(--spacing-sm);
      font-size: 0.85rem;
    }
  }
}
</style>
