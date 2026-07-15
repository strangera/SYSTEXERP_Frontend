import { Directive, HostListener, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appCopyControl]',
  standalone: true,
})
export class CopyControlDirective {
  @Input('appCopyControl') control!: AbstractControl;

  @HostListener('click')
  @HostListener('keydown.enter')
  copyText(): void {
    const textToCopy = this.control.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }
}
