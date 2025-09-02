/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterContentInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent } from 'primeng/table';
import { TableUtilityService } from './table-edit-utility.service';
import { Column, FieldChangeEvent } from './table-edit.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BreadcrumbModule } from "primeng/breadcrumb";
@Component({
  selector: 'app-table-edit',
  templateUrl: './table-edit.component.html',
  styleUrl: './table-edit.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    TableModule,
    MultiSelectModule,
    TooltipModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    IconFieldModule,
    InputIconModule,
    BreadcrumbModule
  ],
})
export class TableEditComponent implements OnChanges, AfterContentInit {
  @ViewChild('dt', { static: false }) dt!: Table;         // table 元件
  // 基本設置
  @Input() dataKey = '_TABLE_KEY';                                // table 資料key
  @Input() tableKey: string | undefined = undefined;      // table 唯一標識 (必填)
  @Input() title: string | undefined = undefined;         // table 標題
  @Input() columns!: Column[];                            // table 欄位配置 (必填)
  @Input() data: any[] = [];                              // table 資料 (必填)
  @Output() dataChange = new EventEmitter<any[]>();       // table 資料改變 (事件)
  @Input() loading = false;                               // 是否顯示 loading
  @Input() disabled = false;                              // 是否禁用 table
  // select 選擇Row相關
  @Input() selectedItems: any = [];                                             // table 已勾選資料
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  // Header(左) 相關
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  // rowEdit 相關
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() defaultInsertData: any = {};             // 預設新增資料 (可選，預設為所有資料為null)
  @Input() dataStatusField = '_dataStatus';          // 資料狀態 (如果有值增加狀態欄位；如果沒有值不增加狀態欄位)
  @Input() dataStatusValue = {                      // 預設 original/new/modified/deleted (可選)
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted'
  };
  // 驗證整行[rowValidate]，範例：
  // validateEntireRow(rowData: T) {
  //   if (驗證條件) {
  //     return { isValid: false, errorMessage: '錯誤訊息' };
  //   }
  //   return { isValid: true, errorMessage: '' };
  // }
  @Input() rowValidate: ((rowData: any) => { isValid: boolean, errorMessage: string }) | undefined = undefined;
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly cdr: ChangeDetectorRef
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length > 0) {
      // 一開始先將無狀態的資料設為Original
      this.data = this.data.filter(item => item != null).map((item: any) => {
        if (item[this.dataStatusField] === undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Original;
        }
        // 載入資料時也執行整行驗證
        if (this.rowValidate) {
          item._rowValidationError = this.rowValidate(item);
        }
        return item;
      });
      this.dataChange.emit(this.data);
    }
  }
  ngAfterContentInit(): void {
    setTimeout(() => {
      if (!this.disabled) {
        this.insertRow();
        this.cdr.detectChanges();
      }
    }, 0);
  }
  onSelectionChange(event: any) {
    if (this.disabled) { return; }
    event = event.filter((item: any) => !item._isAutoInsertCandidate);
    this.selectionChange.emit(event)
  }
  // Insert 按鈕
  insertRow() {
    if (this.disabled) { return; }
    if (this.data.length === 0) {
      this.insert.emit();
    }
    const { newRowData, data } = this.tableUtilityService.insertNewRow(
      this.data,
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField, // 將 dataStatusField 傳給服務
      this.dataStatusValue  // 將 dataStatusValue 傳給服務
    );
    this.data = data;
    console.log(this.data);

    this.insert.emit();
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.disabled) { return; }
    const itemsToDelete = new Set(selectedItems.map((item: any) => item[this.dataKey])); // 取得所有要刪除的 ID
    const updatedData = this.data.map(item => {
      if (itemsToDelete.has(item[this.dataKey])) {
        // 刪除時資料若為Original要將資料狀態改為Deleted
        if (item[this.dataStatusField] === this.dataStatusValue.Original) {
          return { ...item, [this.dataStatusField]: this.dataStatusValue.Deleted };
        }
        return null; // 刪除時資料若為New 直接刪除
      }
      return item;
    }).filter(item => item !== null);
    this.data = updatedData as any[];
    this.delete.emit(selectedItems);
    this.dataChange.emit(this.data);
    this.selectedItems = [];
    // 如果表格資料為空，自動插入一筆新資料
    if (this.data.length === 0) {
      this.insertRow();
    }
  }
  // 處理 ngModelChange 事件，並發送給父元件
  onValueChange(rowData: any, value: any, col: Column, index: number) {
    if (this.disabled) {
      return;
    }

    // 如果資料是 Original 狀態，且有變更，則將狀態改為 Modified
    if (rowData[this.dataStatusField] === this.dataStatusValue.Original) {
      rowData[this.dataStatusField] = this.dataStatusValue.Modified;
    }

    const isAutoInsertCandidate = rowData['_isAutoInsertCandidate'];

    // 檢查是否為「新增中的列」，並且有輸入值
    // 只有在是候選列、有輸入值，且不是被禁用的情況下，才自動插入新行
    if (isAutoInsertCandidate && value !== undefined && value !== null && value !== '' && !this.disabled) {
      this.insertRow();
      // 標記這行已不再是自動插入的候選行，防止重複觸發
      rowData['_isAutoInsertCandidate'] = false;
    }

    // 不論是不是新增列，都執行單一欄位的驗證
    this.validateField(rowData, col, value);

    // 執行整行驗證並儲存結果
    // 只有當行不再是自動插入的候選行時才執行整行驗證，以避免驗證空行
    if (this.rowValidate && !isAutoInsertCandidate) {
      console.log('🚨 驗證整行資料:', rowData);
      rowData._rowValidationError = this.rowValidate(rowData);
    } else if (isAutoInsertCandidate) {
      // 如果是新增行，確保清空所有驗證錯誤，避免顯示紅色
      if (rowData._rowValidationError) {
        delete rowData._rowValidationError;
      }
    }

    // 觸發 fieldChange 事件，無論驗證是否通過
    this.fieldChange.emit({ rowData, field: col.field, value, index });

    // 由於數據綁定和驗證已經更新了 `this.data`，再次發送 `dataChange`
    this.dataChange.emit(this.data);
  }

  // 對單一欄位執行驗證，並更新 rowData 中的錯誤狀態
  validateField(rowData: any, col: Column, value: any): boolean {
    // 確保 _validationErrors 物件存在
    if (!rowData._validationErrors) {
      rowData._validationErrors = {};
    }
    let isValidField = true;
    let errorMessage = '';
    // 執行該欄位的所有驗證規則
    if (col.validate) {
      for (const validateFn of col.validate) {
        // 將完整的 data 陣列傳遞給驗證函數，以支持跨行驗證（如重複值）
        const validationResult = validateFn(value, rowData, this.data, col.field, col.header);
        if (!validationResult.isValid) {
          isValidField = false;
          // 只顯示第一個錯誤訊息
          errorMessage = validationResult.errorMessage[0];
          break; // 找到一個錯誤就停止，只顯示第一個錯誤
        }
      }
    }
    // 更新錯誤狀態
    if (!isValidField) {
      rowData._validationErrors[col.field] = errorMessage;
    } else {
      delete rowData._validationErrors[col.field]; // 欄位有效時，清除錯誤
    }
    // 如果所有欄位都有效，可以考慮清除整行的 _validationErrors 屬性
    // 但通常不需要，因為只需要檢查特定欄位的錯誤
    // if (Object.keys(rowData._validationErrors).length === 0) {
    //   delete rowData._validationErrors;
    // }
    return isValidField;
  }
  onRowReorder(event: TableColumnReorderEvent) {
    if (this.disabled || !event.dragIndex) {
      return;
    }
    // 取得拖曳的列
    const draggedItem = this.data[event.dragIndex];

    // 如果拖曳的列是新增列，直接返回，不執行任何操作
    if (draggedItem['_isAutoInsertCandidate']) {
      return;
    }

    // 如果將資料拖曳到最後一筆，則將其視為刪除並重新插入一個新空行
    if (event.dropIndex === this.lastRow()) {
      this.deleteRow([draggedItem]);
      this.insertRow();
      return;
    }
  }
  // !!! 以下為核心
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];// 欄位調整
  }
  trackByRow = (index: number, item: any) => item[this.dataKey];// 行追蹤
  // 行是否可選，還有第一筆也不能被點選
  rowSelectableWrapper = ({ data, index }: { data: any, index: number; }): boolean | undefined => {
    // 不允許選擇新增中的列
    return this.isRowSelectable(data) && !data._isAutoInsertCandidate;
  };
  // (欄位是Dropdown使用): 獲取Dropdown的選項，支持function加入或直接給List
  getOptions(rowData: any, col: Column) { return typeof col.options === 'function' ? (col.options(rowData) || undefined) : col.options || undefined; }
  // 最後一筆
  lastRow() {
    return this.data.length > 0 ? this.data.length - 1 : -1;
  }
}
