import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { ButtonComponent } from '../button/button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  standalone: true,
  imports: [DialogModule, PrimeTemplate, ButtonComponent, NgIf]
})
export class DialogComponent {
  @Input() visible = false;
  @Input() header = 'header'; // 開窗的標題
  @Input() disable = false;
  @Input() height = '100%'; // 高度
  @Input() showFooter = true; // 是否顯示footer
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter();

  saveDialog() {
    if (this.disable) {
      return;
    }
    this.save.emit();
  }
}
