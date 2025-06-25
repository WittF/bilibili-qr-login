import { ref } from 'vue';

export const useTipText = (initialText: string | (() => string)) => {
  const getInitialText = () => {
    return typeof initialText === 'function' ? initialText() : initialText;
  };

  const text = ref(getInitialText());
  let timer: NodeJS.Timeout | undefined;

  const changeText = (tipText: string, timeout = 2000) => {
    if (timer) clearTimeout(timer);
    text.value = tipText;
    timer = setTimeout(() => {
      text.value = getInitialText();
      timer = undefined;
    }, timeout);
  };

  return { text, changeText };
};
