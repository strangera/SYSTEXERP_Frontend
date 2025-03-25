import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-cancel',
  templateUrl: './button-cancel.component.html',
  styleUrl: './button-cancel.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonCancelComponent {
  label: string = 'cancel';
  icon: string = 'pi pi-times';
  buttonClass: string = 'button-cancel';
  @Input() IsDisabel: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  handleClick() {
    this.onClick.emit();
  }
}
