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
import { validateRequired } from './validate-field.model';
import { NotificationService } from '@shared/component/notification-message/notification.service';
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
  @Input() dataKey = '_TABLE_KEY';                        // table 資料key
  @Input() tableKey: string | undefined = undefined;      // table 唯一標識 (必填)
  @Input() title: string | undefined = undefined;         // table 標題
  @Input() tableRequired = false;                         // table 是否為必填
  tableDataEmpty = false;                                 // table 資料是否為空
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
  @Input() rowValidate: ((rowData: any, index?: number) => { isValid: boolean, errorMessage: string }) | undefined = undefined;
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: NotificationService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length > 0) {
      // 一開始先將無狀態的資料設為Original
      this.data = this.data.filter(item => item != null).map((item: any, index) => {
        if (item[this.dataStatusField] === undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Original;
        }
        // 載入資料時也執行整行驗證
        if (this.rowValidate) {
          item._rowValidationError = this.rowValidate(item, index);
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
    this.tableDataEmpty = false;
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
      rowData._rowValidationError = this.rowValidate(rowData, index);
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

  validateAllRows(): boolean {
    // 排除自動插入的空行
    const rowsToValidate = this.data.filter(row => !row._isAutoInsertCandidate);

    // 遍歷每一行並檢查其驗證狀態
    const isValid = rowsToValidate.every(row => {
      // 執行單一欄位的驗證
      const areFieldsValid = this.columns.every(col => {
        // 確保欄位驗證函式存在
        if (col.validate) {
          // 執行每個欄位的驗證規則
          const validationResults = col.validate.map(validateFn => validateFn(row[col.field], row, this.data, col.field, col.header));
          // 檢查是否有任何一個驗證失敗
          return validationResults.every(result => result.isValid);
        }
        return true; // 如果沒有驗證規則，則視為有效
      });

      // 執行整行驗證
      const isRowValid = !this.rowValidate || (this.rowValidate(row)?.isValid ?? true);

      return areFieldsValid && isRowValid;
    });

    return isValid;
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
  /** // !!! 整筆欄位使用，父層使用方法：
   /* // !!! 1. 宣告：@ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
   /* // !!! 2. 在提交呼叫共通元件：const valid = this.tableEditComponent.validateAndShowErrors();
   /* // !!! 3. 使用 valid 來判斷是否通過
 * 執行完整的驗證並處理錯誤提示
 * @returns {boolean} 整個表格是否有效
 */
  validateAndShowErrors(): boolean {
    if (!this.disabled && this.data[0]._isAutoInsertCandidate && this.tableRequired) {
      this.tableDataEmpty = true;
      return false;
    }
    for (const rowData of this.data) {
      if (rowData._isAutoInsertCandidate) { continue; }
      for (const col of this.columns) {// 1. 執行單一欄位驗證
        if (!rowData._validationErrors) { // 確保 _validationErrors 物件存在
          rowData._validationErrors = {};
        }
        let hasError = false;
        if (col.validate) {// 執行所有驗證規則
          for (const validateFn of col.validate) {
            const validationResult = validateFn(rowData[col.field], rowData, this.data, col.field, col.header);
            if (!validationResult.isValid) {
              rowData._validationErrors[col.field] = validationResult.errorMessage[0] || '欄位驗證失敗。';
              hasError = true;
              break; // 找到第一個欄位錯誤就跳出
            }
          }
        }
        if (!hasError) {// 如果該欄位沒有錯誤，確保清除錯誤訊息
          delete rowData._validationErrors[col.field];
        }
        if (hasError) { // 如果有任何欄位錯誤，直接顯示並返回 false
          this.messageService.errorBubble(`｢${col.header}」 ` + rowData._validationErrors[col.field], '表格欄位驗證失敗');
          return false;
        }
      }
      if (this.rowValidate) {// 2. 執行整行驗證
        rowData._rowValidationError = this.rowValidate(rowData);
      }
      if (rowData._rowValidationError?.isValid === false) {// 如果整行驗證有錯誤，直接顯示並返回 false
        this.messageService.errorBubble(rowData._rowValidationError.errorMessage, '表格驗證失敗');
        return false;
      }
    }
    return true;// 所有行都驗證通過
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
  // 判斷此col的validate參數是否有validateRequired的fuction
  isRequired(col: Column) {
    return col.validate?.some(validate => validate === validateRequired);
  }
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
