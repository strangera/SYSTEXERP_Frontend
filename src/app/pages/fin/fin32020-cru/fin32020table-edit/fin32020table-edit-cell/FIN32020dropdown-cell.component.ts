// ... (保留所有原本的 import)
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'; // 引入 inject
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { EditColumn } from '../fin32020table-edit.model';
import { TableUtilityService } from '../services/fin32020table-edit-utility.service'; // 🎯 引入服務
import { FIN32020CellInput } from './FIN32020table-edit-cell.model';

@Component({
  selector: 'app-dropdown-cell',
  template: `
    <p-iconField iconPosition="right">
      <p-dropdown class="flex min-w-max" appendTo="body"
                  [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                  [ngModelOptions]="{ standalone: true }"
                  [placeholder]="isDisabled() ? '' :'請輸入' + cellInput.col.header"
                  [options]="getOptions(cellInput.rowData, cellInput.col)"
                  [optionLabel]="cellInput.col.optionLabel"
                  [optionValue]="cellInput.col.optionValue"
                  [filter]="true"
                  [style]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                  [disabled]="isDisabled()"
                  [editable]="true"
                  (onChange)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index)"
                  (onHide)="handleHide()"
                  [virtualScroll]="true"
                  [virtualScrollItemSize]="37"
                  scrollHeight="250px"
                  [showClear]="cellInput.col.showClear ?? true"
                  [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
                  [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }">
        <ng-template let-item pTemplate="item" *ngIf="cellInput.col.templateLabel">
          <div class="flex align-items-center gap-2">
            <span>{{ item[cellInput.col.templateLabel] }}</span>
          </div>
        </ng-template>
      </p-dropdown>

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
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class FIN32020DropdownCellComponent {
  @Input({ required: true }) cellInput!: FIN32020CellInput;

  protected readonly tableUtilityService = inject(TableUtilityService);

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleHide() {
    const rowData = this.cellInput.rowData;
    const col = this.cellInput.col as EditColumn; // 確保類型為 EditColumn
    const currentValue = rowData[col.field];

    let isValueCleaned = false; // 追蹤值是否有被清洗 (設為 null)

    if (col.type === 'dropdown') {
      const options = this.getOptions(rowData, col) || [];
      let isValidOption = false;

      if (currentValue === null || currentValue === undefined) {
        isValidOption = true; // null 或 undefined 是允許的 (除非是必填)
      } else {
        // 檢查當前值是否仍在有效選項列表中
        const valueKey = col.optionValue || col.optionLabel;
        isValidOption = options.some((option: any) => {
          if (valueKey && option[valueKey] === currentValue) {
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
        isValueCleaned = true;
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
  public getOptions(rowData: any, col: EditColumn): any[] | undefined {
    // 邏輯直接從 TableEditComponent 搬過來
    return typeof col.options === 'function' ? (col.options(rowData) || undefined) : col.options || undefined;
  }
}
