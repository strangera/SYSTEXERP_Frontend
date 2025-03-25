import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-delete',
  templateUrl: './button-delete.component.html',
  styleUrl: './button-delete.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonDeleteComponent {
  label: string = 'delete';
  icon: string = 'pi pi-trash';
  buttonClass: string = 'button-delete';
  @Input() isDisabled: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
