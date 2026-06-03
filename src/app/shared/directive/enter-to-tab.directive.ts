import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnterToTab]',
  standalone: true
})
export class EnterToTabDirective {

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    // 取得當前獲得焦點的元素
    const target = event.target as HTMLElement;

    // 如果是 textarea，允許換行，不進行 Tab 跳轉
    if (target.tagName === 'TEXTAREA') return;

    event.preventDefault();

    // 選擇所有可輸入的元素，包含 PrimeNG 的 input 以及一般的 input
    // 加入 :not([disabled]) 來過濾掉禁用的欄位
    const selector = 'input:not([disabled]), select:not([disabled]), p-dropdown, p-calendar, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

    const index = focusable.indexOf(target);

    if (index > -1 && focusable[index + 1]) {
      const nextElement = focusable[index + 1];

      // 如果下一個是 PrimeNG 元件，嘗試對其內部的 input 聚焦
      const pInput = nextElement.querySelector('input') as HTMLElement;
      if (pInput) {
        pInput.focus();
      } else {
        nextElement.focus();
      }
    }
  }
}
