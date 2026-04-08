import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-input-cell',
  host: { 'table-edit-id': 'fin32030-cru' },
  template: `
    <ng-container [ngSwitch]="cellInput.col.type">
      <p-iconField iconPosition="right">
        <ng-container *ngSwitchCase="'input'">
          <input pInputText class="min-w-max" [placeholder]="isDisabled() ? '' :'請輸入' + cellInput.col.header"
                 [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                 [ngModelOptions]="{ standalone: true }"
                 [disabled]="isDisabled()"
                 (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
                 [maxlength]="cellInput.col.maxLength || null"
                 [style]="{'width': cellInput.col.width || '100%', 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                 [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
                 (focus)="handleFocus()" (blur)="handleBlur()" (keydown.enter)="handleEnter($event)"
                 [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }" />
        </ng-container>

        <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     styleClass="pi pi-exclamation-circle text-red-500"
                     [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     tooltipPosition="bottom" />
      </p-iconField>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    // 假設 KeyFilterModule 被移除，因為它不再需要
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class InputCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleFocus() {
    // 執行 onFocus 回調（如果有定義）
    this.cellInput.col.onFocus?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }

  handleBlur() {
    // 執行原來的 onBlur 邏輯
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
    event.stopPropagation(); // 阻止事件冒泡
    this.handleBlur();
  }
}
