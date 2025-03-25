import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-button-demo',
  templateUrl: './button-demo.component.html',
  styleUrl: './button-demo.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonDemoComponent {
  @Input() label: string = 'create';
  @Input() icon: string = 'pi pi-plus';
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  buttonClass: string = 'button-create';

  handleClick() {
    // this.onClick.emit();
  }
}
