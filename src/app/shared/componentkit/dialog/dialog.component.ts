import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Input() visible = false;
  @Input() header = 'header';
  @Input() disable = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter();

  saveDialog() {
    if (this.disable) {
      return;
    }
    this.save.emit();
  }
}
