import { ref, computed, type Ref } from 'vue';

// 支持字符串或响应式引用作为初始文本
type InitTextType = string | Ref<string> | (() => string);

export const useTipText = (initText: InitTextType) => {
  // 创建响应式的初始文本
  const initialText = computed(() => {
    if (typeof initText === 'string') {
      return initText;
    } else if (typeof initText === 'function') {
      return initText();
    } else {
      return initText.value;
    }
  });

  const text = ref(initialText.value);
  let timer: NodeJS.Timeout | undefined;

  // 监听初始文本变化
  const updateText = () => {
    if (!timer) {
      text.value = initialText.value;
    }
  };

  // 当初始文本改变时，如果当前没有临时文本，就更新显示
  computed(() => {
    updateText();
    return initialText.value;
  });

  const changeText = (tipText: string, timeout = 2000) => {
    if (timer) clearTimeout(timer);
    text.value = tipText;
    timer = setTimeout(() => {
      text.value = initialText.value;
      timer = undefined;
    }, timeout);
  };

  return { text, changeText };
};
