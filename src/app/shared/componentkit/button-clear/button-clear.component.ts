import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-clear',
  templateUrl: './button-clear.component.html',
  styleUrl: './button-clear.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonClearComponent {
  label: string = 'clear';
  buttonClass: string = 'button-clear';
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
