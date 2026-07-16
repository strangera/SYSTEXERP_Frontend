import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-dialog',
  template: `
  <p-dialog [(visible)]="visible" position="center" [focusOnShow]="false"
    [style]="{ width: width, height: height, maxWidth: maxWidth, minHeight: minHeight }" [header]="header" [modal]="true"
    [styleClass]="styleClass + ' p-fluid'" (visibleChange)="visibleChange.emit($event)" [maximizable]="true"
    appendTo="body" [closable]="!loading" (onShow)="show.emit()">
    <ng-template pTemplate="content">
      <ng-content></ng-content>
    </ng-template>
    <ng-template pTemplate="footer" *ngIf="showFooter">
      <div class="grid justify-content-end gap-2 m-0 border-top-1 surface-border pt-3">
        <app-button btnType="back" (click)="visibleChange.emit(false)"></app-button>
        <app-button label="確定" btnType="submit" (click)="saveDialog()" [loading]="loading" [disabled]="disable"></app-button>
      </div>
    </ng-template>
  </p-dialog>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, PrimeTemplate, ButtonComponent, NgIf]
})
export class DialogComponent {
  @Input() visible = false;
  @Input() header = 'header'; // 開窗的標題
  @Input() disable = false;
  @Input() height = 'auto'; // 高度
  @Input() width = '900px'; // 寬度
  @Input() maxWidth = '100%'; // 最大寬度
  @Input() minHeight = '100px'; // 最小高度
  @Input() styleClass = ''; // 是否顯示footer
  @Input() showFooter = true; // 是否顯示footer
  @Input() loading = false; // 是否顯示載入中
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter();
  @Output() show = new EventEmitter<void>();

  saveDialog() {
    if (this.disable) {
      return;
    }
    this.save.emit();
  }
}
