import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-query',
  templateUrl: './button-query.component.html',
  styleUrl: './button-query.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonQueryComponent {
  label: string = 'query';
  icon: string = 'pi pi-search';
  buttonClass: string = 'button-query';
  @Input() loading: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
