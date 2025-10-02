// table-input.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { Column } from '../table.model';

@Component({
  selector: 'app-table-input',
  standalone: true,
  imports: [
    AutoCompleteModule,
    CalendarModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    ImageModule,
    InputNumberModule,
    InputTextModule,
    OverlayPanelModule,
    PrimeTemplate,
    TableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-input.component.html',
  styles: [
    `
    .input-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    .input-wrapper[data-suffix]:not([data-suffix=""]):after {
      content: attr(data-suffix);
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #6b7280;
      font-size: 0.875rem;
      z-index: 10;
    }
    :host ::ng-deep .input-wrapper input.p-inputtext[data-suffix]:not([data-suffix=""]) {
      padding-right: 40px;
    }
    `
  ]
})
export class TableInputComponent {
  // 接收父元件傳來的資料與欄位設定
  public col = input.required<Column>();
  public rowData = input<any>();
  public rowIndex = input.required<number>();
  public alwaysEdit = input<boolean>(!1);
  public disabled = input<boolean>(!1);

  // 輸出事件，通知父元件資料已變動或失去焦點
  public readonly fieldChange = output<FieldChangeEvent>();
  public readonly filterChange = output<AutoCompleteCompleteEvent>();
  public readonly fieldBlur = output<FieldChangeEvent>();

  /** dropdownTable用 */
  public readonly dpTableLazyLoadData = output<any>();
  public selectedItems: Record<string | symbol, any> = Object.create(null);

  /** 處理 Dropdown/AutoComplete 的選項來源 */
  public getOptions = computed(() => {
    const colOptions = this.col().options;
    return typeof colOptions === 'function' ? (colOptions(this.rowData()) || void 0) : colOptions || void 0;
  });

  constructor() {
    // effect(() => console.log(`init:`, [this.col(), this.rowData(), this.rowIndex(), this.alwaysEdit(), this.disabled()]));
  }

  /** 處理 ngModelChange 事件，並發送給父元件 */
  public onValueChange(value: any): void {
    // console.log(`onValueChange:`, [value]);
    this.fieldChange.emit({ field: this.col().field, value, rowIndex: this.rowIndex() });
  }

  /** 處理 onBlur 事件，並發送給父元件 */
  public onBlur(): void {
    // console.log(`onBlur:`, [this.rowData()[this.col().field]]);
    this.fieldBlur.emit({ field: this.col().field, value: this.rowData()[this.col().field], rowIndex: this.rowIndex() });
  }

  /** 處理 AutoComplete 的過濾事件，並發送給父元件 */
  public onFilterComplete(event: AutoCompleteCompleteEvent): void {
    // console.log(`onFilterComplete:`, [event]);
    this.filterChange.emit(event);
  }

  /** 處理下拉 Table 的懶加載事件 */
  public onLazyLoadData = (event: any): void => {
    const pageSize: number = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = (event.first ?? !1) / pageSize + 1;
    const SortBy = event.multiSortMeta ?? [{ field: this.col().tableKey, order: 1 }];
    // console.log(`onLazyLoadData:`, [pageIndex, pageSize, SortBy]);
    this.dpTableLazyLoadData.emit({ pageIndex, pageSize, SortBy });
  };

  /** 處理下拉 Table 的選擇變更 */
  public onTableSelectionChange(): void {
    if (this.col().type !== 'dropdownTable') return;
    // console.log(`onTableSelectionChange:`, [this.selectedItems, this.rowData(), this.col]);
    this.rowData()[this.col().field] = this.selectedItems[this.col().valueKey || 'id'] || null;
    this.fieldChange.emit({ field: this.col().field, value: this.rowData()[this.col().field], rowIndex: this.rowIndex() });
  };

  /** 取得 template 類型欄位的顯示值 */
  public templateDisplayValue = computed(() => {
    if (this.col().type !== 'template') return '';

    const rowData = this.rowData();
    const fieldValue = rowData?.[this.col().field];
    const displayField = this.col().templateDisplayField;
    const nameValue = displayField ? rowData?.[displayField] : void 0;

    if (typeof this.col().templateDisplayFormat === 'function') {
      return this.col().templateDisplayFormat!(fieldValue, nameValue);
    }

    if (this.col().templateDisplayField) {
      if (fieldValue && nameValue) return `${fieldValue} - ${nameValue}`;
    }

    // 預設顯示邏輯：只顯示欄位值
    return fieldValue || '';
  });
}

interface FieldChangeEvent {
  field: string;
  value: any;
  rowIndex?: number;
}
