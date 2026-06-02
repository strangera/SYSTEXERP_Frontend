import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-number-cell',
  host: { 'table-edit-id': '複製時請自行取唯一名' },
  template: `
    <p-iconField iconPosition="left">

      <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                   styleClass="pi pi-exclamation-circle text-red-500"
                   [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                   tooltipPosition="bottom" />
      <p-inputNumber class="w-full" mode="decimal"
                     [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                     [ngModelOptions]="{ standalone: true }"
                     [placeholder]="
                     isDisabled() ? '' :cellInput.col.placeholder ? cellInput.col.placeholder : '請輸入' + cellInput.col.header
                     "
                     [min]="cellInput.col.min || -Infinity" [max]="cellInput.col.max || Infinity"
                     [disabled]="isDisabled()"
                     (onInput)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index)"
                     [minlength]="cellInput.col.minLength || null"
                     [maxlength]="cellInput.col.maxLength || null"
                     [minFractionDigits]="cellInput.col.minFractionDigits"
                     [maxFractionDigits]="cellInput.col.maxFractionDigits"
                     (onFocus)="handleFocus($event)"
                     (onBlur)="handleBlur()"(keydown.enter)="handleEnter($event)"
                     [style]="{'text-align': cellInput.col.textAlign,'width': cellInput.col.width}"
                     [inputStyle]="{'width': '100%', 'text-align': cellInput.col.textAlign || 'right'}"
                     [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
                     [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }" />
    </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule, // 隔離 InputNumberModule
    IconFieldModule,
    InputIconModule,
    TooltipModule // 需確保這個模組被引入
  ]
})
export class NumberCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }
  Infinity = Infinity;
  // 來自 NumberCellComponent.ts
  handleBlur() {
    const field = this.cellInput.col.field;
    let currentValue = this.cellInput.rowData[field];
    const min = this.cellInput.col.min ?? -Infinity;

    // 1. 執行 Min 限制修正
    if (typeof currentValue === 'number' && !isNaN(currentValue) && currentValue < min) {
      currentValue = min;
      // 強制更新模型，將負數修正為 0
      this.cellInput.rowData[field] = min;
    }

    // 2. 觸發 onBlur 函數 (PUR_TotNet/Tax 的 onBlur)
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      currentValue, // 傳遞修正後的值
      this.cellInput.col,
      this.cellInput.index
    );

    // 3. 執行一次 onValueChange 以觸發最終驗證/狀態更新
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      currentValue, // 傳遞修正後的值
      this.cellInput.col,
      this.cellInput.index
    );
  }
  handleFocus(event: Event) {
    // 1. PrimeNG 的 onFocus 有時會把原生事件封裝在 originalEvent 裡，如果沒有就取 event.target
    const inputElement = event?.target;
    // 2. 判斷這個 target 是不是一個 HTML 的 input 元素
    if (inputElement instanceof HTMLInputElement) {
      // 💡 加上微小延遲，避免被 PrimeNG 後續的游標定位邏輯覆蓋
      setTimeout(() => {
        inputElement.select(); // ✨ 此時 target 被推導為 HTMLInputElement，可以安全呼叫 select()
      }, 10);
    }

    // 執行原先外層 editColumns 配置的 onFocus 回調
    this.cellInput.col.onFocus?.(
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
