import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-submit',
  templateUrl: './button-submit.component.html',
  styleUrl: './button-submit.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonSubmitComponent {
  label: string = 'confirm';
  icon: string = 'pi pi-check';
  buttonClass: string = 'button-submit';
  @Input() isFormEditable: boolean = true;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
