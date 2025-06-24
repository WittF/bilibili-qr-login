<template>
  <div class="language-switcher">
    <div
      class="language-switcher__current"
      :class="{ 'language-switcher__current--open': isOpen }"
      @click="toggleDropdown"
    >
      <LanguageIcon class="language-switcher__icon" />
      <span class="language-switcher__label">{{ getLanguageDisplayName(currentLanguage) }}</span>
      <ArrowDownIcon class="language-switcher__arrow" :class="{ 'language-switcher__arrow--open': isOpen }" />
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="language-switcher__dropdown">
        <div
          v-for="language in getSupportedLanguages()"
          :key="language.code"
          class="language-switcher__option"
          :class="{ 'language-switcher__option--active': language.code === currentLanguage }"
          @click="selectLanguage(language.code)"
        >
          <span class="language-switcher__option-name">{{ language.name }}</span>
          <CheckSmallIcon v-if="language.code === currentLanguage" class="language-switcher__check" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../utils/i18n';
import LanguageIcon from '../assets/icons/language.svg';
import ArrowDownIcon from '../assets/icons/arrow_down.svg';
import CheckSmallIcon from '../assets/icons/check_small.svg';
import type { SupportedLanguage } from '../utils/i18n';

const { currentLanguage, setLanguage, getLanguageDisplayName, getSupportedLanguages } = useI18n();
const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (lang: SupportedLanguage) => {
  setLanguage(lang);
  isOpen.value = false;
};

const closeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isOpen.value = false;
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
    transition: all 0.2s ease;
    color: var(--text-secondary);
    font-size: 0.9rem;
    min-width: 100px;

    &:hover {
      background-color: var(--overlay-light);
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

    svg {
      width: 16px !important;
      height: 16px !important;
      display: block;
    }
  }

  &__label {
    flex: 1;
    font-weight: 500;
  }

  &__arrow {
    color: currentColor;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
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

    &:hover {
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
  }

  &__check {
    color: var(--bilibili-pink);
    flex-shrink: 0;
    width: 16px;
    height: 16px;

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
    &:hover {
      background-color: var(--overlay-dark);
    }

    &--open {
      background-color: var(--overlay-dark);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .language-switcher {
    &__current {
      min-width: 80px;
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
