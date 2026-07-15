import { Directive, HostListener } from '@angular/core';
import { focusNextFocusable } from './enter-to-tab.util';

@Directive({
  selector: '[appEnterToTab]',
  standalone: true,
})
export class EnterToTabDirective {
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.enter.capture', ['$event'])
  onEnter(event: Event): void {
    focusNextFocusable(event);
  }
}
