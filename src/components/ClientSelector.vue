<template>
  <div class="client-selector">
    <button
      class="client-selector__option"
      :class="{ 'client-selector__option--active': currentClient === 'web' }"
      :aria-label="t.client.web"
      :title="t.client.web"
      @click="selectClient('web')"
    >
      <WebIcon class="client-selector__icon" />
    </button>
    <button
      class="client-selector__option"
      :class="{ 'client-selector__option--active': currentClient === 'tv' }"
      :aria-label="t.client.tv"
      :title="t.client.tv"
      @click="selectClient('tv')"
    >
      <TvIcon class="client-selector__icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '../utils/i18n';
import WebIcon from '../assets/icons/web.svg';
import TvIcon from '../assets/icons/tv.svg';

export type ClientType = 'web' | 'tv';

const { t } = useI18n();
const currentClient = ref<ClientType>('web');

const emit = defineEmits<{
  change: [client: ClientType];
}>();

const selectClient = (client: ClientType) => {
  if (currentClient.value !== client) {
    currentClient.value = client;
    emit('change', client);
  }
};

// 暴露当前选中的客户端类型
defineExpose({
  currentClient,
});
</script>

<style scoped lang="less">
.client-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--card-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--divider);

  &__option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: var(--spacing-xs);
    background-color: transparent;
    border: 2px solid var(--divider);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.15s ease;
    color: var(--text-secondary);
    will-change: transform, background-color, border-color;

    &:hover {
      background-color: var(--overlay-light);
      border-color: var(--bilibili-pink);
      transform: scale(1.05);
    }

    &--active {
      background-color: rgba(251, 114, 153, 0.1);
      border-color: var(--bilibili-pink);
      color: var(--bilibili-pink);
      font-weight: 500;

      &:hover {
        background-color: rgba(251, 114, 153, 0.15);
      }
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    color: currentColor;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    svg {
      width: 20px !important;
      height: 20px !important;
      display: block;
    }
  }
}

// 暗色主题
[data-theme='dark'] .client-selector {
  &__option {
    &:hover {
      background-color: var(--overlay-dark);
    }

    &--active {
      background-color: rgba(255, 126, 185, 0.15);

      &:hover {
        background-color: rgba(255, 126, 185, 0.2);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .client-selector {
    padding: var(--spacing-sm);

    &__option {
      width: 44px;
      height: 44px;
    }

    &__icon {
      width: 22px;
      height: 22px;

      svg {
        width: 22px !important;
        height: 22px !important;
      }
    }
  }
}

@media (max-width: 480px) {
  .client-selector {
    &__option {
      width: 40px;
      height: 40px;
    }

    &__icon {
      width: 20px;
      height: 20px;

      svg {
        width: 20px !important;
        height: 20px !important;
      }
    }
  }
}
</style>
