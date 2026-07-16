export function focusNextFocusable(event: Event): void {
  const keyboardEvent = event as KeyboardEvent;
  const target = keyboardEvent.target as HTMLElement;

  if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') {
    return;
  }

  keyboardEvent.preventDefault();
  keyboardEvent.stopImmediatePropagation();
  keyboardEvent.stopPropagation();

  // 定義所有可被跳轉到的選擇器
  const focusableSelector = 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled])';
  const focusableElements = Array.from(document.querySelectorAll(focusableSelector)) as HTMLElement[];
  const index = focusableElements.indexOf(target);

  if (index > -1 && focusableElements[index + 1]) {
    const nextElement = focusableElements[index + 1];

    // 針對 PrimeNG 這類包裝元件，嘗試找到內部的 input
    const pInput = nextElement.querySelector('input');
    if (pInput) {
      pInput.focus();
    } else {
      nextElement.focus();
    }
  }
}
