import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss',
    standalone: true,
    imports: [DialogModule, PrimeTemplate, ButtonComponent]
})
export class DialogComponent {
  @Input() visible = false;
  @Input() header = 'header';
  @Input() disable = false;
  @Input() height = '100%';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter();

  saveDialog() {
    if (this.disable) {
      return;
    }
    this.save.emit();
  }
}
