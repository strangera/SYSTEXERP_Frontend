import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model'; // 假設路徑正確

@Component({
  selector: 'app-percent-cell',
  host: { 'table-edit-id': '複製時請自行取唯一名' },
  template: `
    <p-iconField iconPosition="right">
      <div class="flex align-items-center gap-1">
        <input pInputText class="min-w-max" [placeholder]="isDisabled() ? '' :'請輸入' + cellInput.col.header"
               [(ngModel)]="cellInput.rowData[cellInput.col.field]"
               [ngModelOptions]="{ standalone: true }"
               [disabled]="isDisabled()"
               (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
               [maxlength]="3 + (cellInput.col.maxFractionDigits ?? 0)"
               [style]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available' }"
               [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
               [pKeyFilter]="percentKeyFilter"
               (blur)="handleBlur()"(keydown.enter)="handleEnter($event)"
               [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }" />
        <span class="d-block">%</span>
      </div>

      <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                   styleClass="pi pi-exclamation-circle text-red-500"
                   [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                   tooltipPosition="bottom" />
    </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    KeyFilterModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class PercentCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  // 移過來的屬性和方法
  public readonly percentKeyFilter = /^(100(\.0{1,2})?|(\d{1,2})(\.\d*)?)$/;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleBlur() {
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
    // 觸發一次 value change (確保 blur 後的狀態更新與驗證)
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }
  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    // event.stopPropagation(); // !!!客戶需求禁止加上這段
    this.handleBlur();
  }
}
