// ... (保留所有原本的 import)
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core'; // 引入 inject
import { FormsModule } from '@angular/forms';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TableUtilityService } from '../services/table-edit-utility.service'; // 🎯 引入服務
import { EditColumn } from '../table-edit.model';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-dropdown-cell',
  host: { 'table-edit-id': '複製時請自行取唯一名' },
  template: `
 <p-iconField iconPosition="right">
  <p-dropdown class="flex min-w-max" appendTo="body"
              [(ngModel)]="cellInput.rowData[cellInput.col.field]"
              [ngModelOptions]="{ standalone: true }"
              [placeholder]="internalLoading ? '載入中...' : (isDisabled() ? '' : '請輸入' + cellInput.col.header)"
              [options]="getOptions(cellInput.rowData, cellInput.col)"
              [optionLabel]="cellInput.col.optionLabel"
              [optionValue]="cellInput.col.optionValue"
              [filter]="true"
              [style]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
              [disabled]="isDisabled() || internalLoading"
              [editable]="true"
              [loading]="internalLoading"
              [virtualScroll]="true"
              [virtualScrollItemSize]="40"
              [showClear]="cellInput.col.showClear ?? true"
              [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
              [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }"
              (onChange)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index);onDropdownChange($event)"
              (onHide)="handleHide()"
              (keydown.enter)="handleEnter($event)">

    <ng-template let-item pTemplate="item" *ngIf="cellInput.col.templateLabel">
      <div class="flex align-items-center gap-2">
        <span>{{ item[cellInput.col.templateLabel] }}</span>
      </div>
    </ng-template>
  </p-dropdown>

  <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field] && !internalLoading"
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
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class DropdownCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  protected readonly tableUtilityService = inject(TableUtilityService);
  private readonly cdr = inject(ChangeDetectorRef);

  public internalLoading = false;
  private _resolvedOptions: any[] | undefined = undefined;
  private _lastRowData: any = null;
  private _isSubscribing = false;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleHide() {
    const rowData = this.cellInput.rowData;
    const col = this.cellInput.col as EditColumn; // 確保類型為 EditColumn
    const currentValue = rowData[col.field];

    if (col.type === 'dropdown') {
      const options = this.getOptions(rowData, col) || [];
      let isValidOption = false;

      if (currentValue === null || currentValue === undefined) {
        isValidOption = true; // null 或 undefined 是允許的 (除非是必填)
      } else {
        // 檢查當前值是否仍在有效選項列表中
        const valueKey = col.optionValue || col.optionLabel;
        isValidOption = options.some((option: any) => {
          // 使用字串化比較以避免 number vs string 的嚴格相等問題
          if (valueKey && String(option[valueKey]) === String(currentValue)) {
            return true;
          }
          if (!col.optionValue && typeof currentValue === 'object' && option === currentValue) {
            return true;
          }
          return false;
        });
      }

      if (!isValidOption) {
        rowData[col.field] = null; // 強制將無效值設為 null
      }
    }

    // 呼叫父層的 onValueChange
    // 如果值被清洗 (設為 null)，或即使沒有清洗，下拉選單關閉後也應該重新觸發驗證
    // 這樣可以確保在下拉選單關閉時，即使只是點擊，也會觸發 rowValidate 檢查。
    this.cellInput.onValueChange(
      rowData,
      rowData[col.field], // 傳遞可能已被清洗的最新值
      col,
      this.cellInput.index
    );
  }


  /**
   * 獲取 Dropdown 的選項，支持 function 加入或直接給 List
   * @param rowData 當前行資料
   * @param col 欄位配置
   * @returns 選項陣列
   */
  // 紀錄上一次的參數物件 (Key: 欄位名, Value: 欄位值)
  private _lastTriggerValues: Record<string, any> = {};
  public getOptions(rowData: any, col: EditColumn): any[] | undefined {
    if (!col.optionsAsync) {
      return typeof col.options === 'function' ? col.options(rowData) : col.options;
    }

    // 1. 建立當前依賴欄位的值快照
    const currentTriggerValues: Record<string, any> = {};
    if (col.triggerFields) {
      col.triggerFields.forEach(f => {
        currentTriggerValues[f] = rowData?.[f];
      });
    }

    // 2. 判斷是否需要刷新：rowData 指標變了 OR 任何一個 triggerField 的值變了
    const triggerChanged = JSON.stringify(this._lastTriggerValues) !== JSON.stringify(currentTriggerValues);

    if (this._lastRowData !== rowData || triggerChanged) {
      this._lastRowData = rowData;
      this._lastTriggerValues = currentTriggerValues; // 更新快照

      const optionsResult = typeof col.options === 'function' ? col.options(rowData) : col.options;

      // ... 以下維持原有的 Observable subscribe 邏輯 ...
      if (optionsResult && typeof optionsResult.subscribe === 'function') {
        this.internalLoading = true;
        optionsResult.subscribe({
          next: (data: any) => {
            this._resolvedOptions = data;
            this.internalLoading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.internalLoading = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        this._resolvedOptions = optionsResult;
      }
    }

    return this._resolvedOptions;
  }

  /**
   * 處理 Dropdown 值的變更
   */
  onDropdownChange(event: DropdownChangeEvent) {
    const col = this.cellInput.col as EditColumn;
    const rowData = this.cellInput.rowData;
    const index = this.cellInput.index;

    // 1. 執行原有的系統邏輯 (更新資料與觸發驗證)
    this.cellInput.onValueChange(rowData, event.value, col, index);

    // 2. 執行使用者在配置中定義的自定義 onChange
    if (col.onChange && typeof col.onChange === 'function') {
      col.onChange(event.value, rowData, col, index);
    }
  }

  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    event.stopPropagation(); // 阻止事件冒泡
  }
}
