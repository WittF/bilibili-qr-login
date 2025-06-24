<template>
  <div class="language-switcher">
    <div
      class="language-switcher__current"
      :class="{ 'language-switcher__current--open': isOpen }"
      @click="toggleDropdown"
    >
      <svg class="language-switcher__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="currentColor"
          stroke-width="2"
        />
        <path d="M2 12H22" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
      <span class="language-switcher__label">{{ getLanguageDisplayName(currentLanguage) }}</span>
      <svg
        class="language-switcher__arrow"
        :class="{ 'language-switcher__arrow--open': isOpen }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
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
          <svg
            v-if="language.code === currentLanguage"
            class="language-switcher__check"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../utils/i18n';
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
    background-color: var(--card-background);
    border: 1px solid var(--divider);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    font-size: 0.9rem;
    min-width: 100px;

    &:hover {
      background-color: var(--card-background);
      border-color: var(--bilibili-blue);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    &--open {
      background-color: var(--card-background);
      border-color: var(--bilibili-blue);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
    color: currentColor;
  }

  &__label {
    flex: 1;
    font-weight: 500;
  }

  &__arrow {
    width: 16px;
    height: 16px;
    color: currentColor;
    transition: transform 0.2s ease;

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
      background-color: rgba(251, 114, 153, 0.1);
      color: var(--bilibili-pink);
      font-weight: 500;
    }
  }

  &__option-name {
    flex: 1;
  }

  &__check {
    width: 16px;
    height: 16px;
    color: var(--bilibili-pink);
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
