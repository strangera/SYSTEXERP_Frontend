import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { EditColumn } from '../table-edit.model';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-auto-complete-cell',
  host: { 'table-edit-id': 'auto-complete-cell' },
  template: `
    <p-iconField iconPosition="right">
      <p-autoComplete
        #autoCompleteRef
        class="flex min-w-max"
        styleClass="w-full"
        inputStyleClass="w-full"
        appendTo="body"
        [(ngModel)]="cellInput.rowData[cellInput.col.field]"
        [ngModelOptions]="{ standalone: true }"
        [placeholder]="internalLoading ? '載入中...' : (isDisabled() ? '' : '請輸入' + cellInput.col.header)"
        [suggestions]="getOptions(cellInput.rowData, cellInput.col)"
        [optionLabel]="cellInput.col.optionLabel"
        [optionValue]="cellInput.col.optionValue"
        [disabled]="isDisabled()"
        [forceSelection]="cellInput.col.forceSelection ?? false"
        [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
        [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }"
        (completeMethod)="handleComplete($event)"
        (onSelect)="onSelect($event)"
        (onClear)="onClear()"
        (onBlur)="handleBlur()"
        (keydown.enter)="handleEnter($event)"
      >
        <ng-template let-item pTemplate="item" *ngIf="cellInput.col.templateLabel">
          <div class="flex align-items-center gap-2">
            <span>{{ item[cellInput.col.templateLabel] }}</span>
          </div>
        </ng-template>
      </p-autoComplete>

      <p-inputIcon
        *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field] && !internalLoading"
        styleClass="pi pi-exclamation-circle text-red-500"
        [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
        tooltipPosition="bottom"
      />
    </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class AutoCompleteCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  private readonly cdr = inject(ChangeDetectorRef);

  public internalLoading = false;
  private _resolvedOptions: any[] = [];
  private _lastRowData: any = null;
  private _lastTriggerValues: Record<string, any> = {};

  isDisabled(): boolean {
    const col = this.cellInput.col;
    // 這裡拿掉 internalLoading 的判斷，只判斷業務邏輯上的 disabled
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  /**
   * 獲取建議選項 (支援同步與非同步)
   */
  public getOptions(rowData: any, col: EditColumn): any[] {
    if (!col.optionsAsync) {
      return (typeof col.options === 'function' ? col.options(rowData) : col.options) || [];
    }
    return this._resolvedOptions;
  }

  /**
   * 處理搜尋過濾
   */
  handleComplete(event: AutoCompleteCompleteEvent) {
    const col = this.cellInput.col as EditColumn;
    const rowData = this.cellInput.rowData;

    if (col.optionsAsync) {
      this.internalLoading = true; // 開啟 loading 狀態 (顯示旋轉圈圈)
      this.cdr.markForCheck(); // 確保 UI 更新顯示 loading

      const optionsResult = typeof col.options === 'function'
        ? col.options(rowData, event.query)
        : col.options;

      if (optionsResult && typeof optionsResult.subscribe === 'function') {
        optionsResult.subscribe({
          next: (data: any) => {
            this._resolvedOptions = data || [];
            this.internalLoading = false; // 關閉 loading，但 Input 始終維持 Focus
            this.cdr.markForCheck();
          },
          error: () => {
            this.internalLoading = false;
            this.cdr.markForCheck();
          }
        });
      }
    }
  }

  onSelect(event: any) {
    const col = this.cellInput.col as EditColumn;
    const value = event.value ?? event; // PrimeNG select event 結構可能不同

    this.cellInput.onValueChange(this.cellInput.rowData, value, col, this.cellInput.index);

    if (col.onChange) {
      col.onChange(value, this.cellInput.rowData, col, this.cellInput.index);
    }
  }

  onClear() {
    const col = this.cellInput.col as EditColumn;
    this.cellInput.onValueChange(this.cellInput.rowData, null, col, this.cellInput.index);
  }

  handleBlur() {
    const col = this.cellInput.col as EditColumn;
    const rowData = this.cellInput.rowData;
    const currentValue = rowData[col.field];

    // 執行配置中的 onBlur
    if (col.onBlur) {
      col.onBlur(rowData, currentValue, col, this.cellInput.index);
    }

    // 觸發框架驗證
    this.cellInput.onValueChange(rowData, currentValue, col, this.cellInput.index);
  }

  handleEnter(event: Event) {
    event.preventDefault();
    // event.stopPropagation();// !!!客戶需求禁止加上這段
    this.handleBlur();
  }
}
