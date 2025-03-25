import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-create',
  templateUrl: './button-create.component.html',
  styleUrl: './button-create.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonCreateComponent {
  label: string = 'create';
  icon: string = 'pi pi-plus';
  buttonClass: string = 'button-create';
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
