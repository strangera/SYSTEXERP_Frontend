import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-action',
  templateUrl: './button-action.component.html',
  styleUrl: './button-action.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonActionComponent {
  @Input() label: string = 'create';
  @Input() icon: string = 'pi pi-plus';
  @Input() IsDisabel: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  buttonClass: string = 'button-sitemap';

  handleClick() {
    this.onClick.emit();
  }
}
