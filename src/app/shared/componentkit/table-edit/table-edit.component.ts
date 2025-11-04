/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { SortMeta } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { v4 as uuidv4 } from 'uuid';
import { TableUtilityService } from './table-edit-utility.service';
import { ColumnGroup, EditColumn, FieldChangeEvent } from './table-edit.model';
import { validateRequired } from './validate-field.model';
@Component({
  selector: 'app-table-edit',
  templateUrl: './table-edit.component.html',
  styleUrl: './table-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    BreadcrumbModule,
    SkeletonModule,
    FileUploadModule,
    CalendarModule,
    OverlayPanelModule,
  ],
})
export class TableEditComponent implements OnChanges, AfterContentInit {
  @ViewChild('dt', { static: false }) dt!: Table;         // table 元件
  @ViewChild('fileUpload') fileUpload!: FileUpload; // 檔案上傳 元件
  // 基本設置
  dataKey = '_TABLE_KEY';                                 // table 資料key
  @Input() tableKey: string | undefined = undefined;      // table 唯一標識 (必填)
  @Input() title: string | undefined = undefined;         // table 標題
  @Input() tableRequired = false;                         // table 是否為必填
  tableDataEmpty = false;                                 // table 資料是否為空
  @Input() columns!: EditColumn[];                        // table 欄位配置 (必填)
  @Input() data: any[] = [];                              // table 資料 (必填)
  @Output() dataChange = new EventEmitter<any[]>();       // table 資料改變 (事件)
  @Input() loading = false;                               // 是否顯示 loading
  @Input() disabled = false;                              // 是否禁用 table
  @Input() multiSortMeta: SortMeta[] | null | undefined = undefined; // table 多重排序
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // select 選擇Row相關
  @Input() showCheckBox = true;                                               // 是否顯示 checkbox
  @Input() selectedItems: any = [];                                             // table 已勾選資料
  @Input() isRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  // Header(左) 相關
  @Input() showInsert = false;                // 是否顯示 新增按鈕
  @Input() showDelete = true;                // 是否顯示 刪除按鈕
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Output() insert = new EventEmitter<any>(); // 新增事件
  // Header(右) 相關
  @Input() showExcel = false;                      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                 // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;                 // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;         // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 禁止新增
  @Input() canInsert = true;
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  // rowEdit 相關
  @Input() showReorder = true;                     // 是否顯示順序調整
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
  @Input() rowValidate: ((rowData: any, index?: number) => { isValid: boolean, errorMessage: string; }) | undefined = undefined;
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  @Output() rowReorderData = new EventEmitter<TableRowReorderEvent>();      // row reorder 事件
  @Input() errorMessage = '至少輸入一筆資料'; // 錯誤訊息
  // 總計
  @Input() footerData: any;                  // (總計)頁尾資料

  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: NotificationService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (this.data.length > 0) {
        // 一開始先將無狀態的資料設為Original
        this.data = this.data.filter(item => item != null).map((item: any, index) => {
          if (item[this.dataStatusField] === undefined) {
            item[this.dataStatusField] = this.dataStatusValue.Original;
            item[this.dataKey] = `temp-${uuidv4()}`;
          }
          // 載入資料時，確保所有計算欄位都是最新的
          // 新增的邏輯：呼叫計算方法
          this.calculateRow(item);
          // 載入資料時也執行整行驗證
          if (this.rowValidate) {
            item._rowValidationError = this.rowValidate(item, index);
          }
          return item;
        });
      }
      // 如果資料中沒有 _isAutoInsertCandidate 欄位則新增
      if (!this.data.some(item => item['_isAutoInsertCandidate']) && this.canInsert) {
        this.insertRow();
      }
    }
    // 處理 defaultInsertData 改變的邏輯：更新現有的新增候選行
    if (changes['defaultInsertData']) {
      // 確保在資料載入和初始化之後執行
      this.updateCandidateRowDefaults();
    }
  }
  // 輔助方法：計算單一列的欄位值
  private calculateRow(rowData: any): void {
    // 遍歷所有 editColumns
    this.columns.forEach(col => {
      // 檢查此欄位是否有 calculate 方法
      if (col.calculate) {
        // 執行計算並取得結果物件
        const updates = col.calculate(rowData, rowData[col.field]);

        // 將計算結果應用到 rowData
        for (const key in updates) {
          if (Object.prototype.hasOwnProperty.call(updates, key)) {
            rowData[key] = updates[key];
          }
        }
      }
    });
    this.dataChange.emit(this.data);
  }
  /**
   * 當 defaultInsertData 改變時，更新現有的「自動新增候選行」的預設值。
   */
  private updateCandidateRowDefaults(): void {
    const candidateRow = this.data.find(item => item['_isAutoInsertCandidate'] === true);

    if (candidateRow && this.defaultInsertData) {
      const newDefaults = this.defaultInsertData;

      // 遍歷新的 defaultInsertData，將其值覆蓋到候選行中
      for (const key in newDefaults) {
        if (Object.prototype.hasOwnProperty.call(newDefaults, key)) {
          // 避免覆蓋內部關鍵狀態欄位，例如：
          // dataKey, dataStatusField, _isAutoInsertCandidate
          if (key !== this.dataKey && key !== this.dataStatusField && key !== '_isAutoInsertCandidate') {
            candidateRow[key] = newDefaults[key];
          }
        }
      }
      // 由於是直接修改 this.data 裡的物件，需要手動觸發變更偵測
      this.cdr.detectChanges();
    }
  }
  ngAfterContentInit(): void {
    // setTimeout(() => {
    //   if (!this.disabled && this.canInsert) {
    //     this.insertRow();
    //     this.cdr.detectChanges();
    //   }
    // }, 0);
  }
  onSelectionChange(event: any) {
    if (this.disabled) { return; }
    event = event.filter((item: any) => !item._isAutoInsertCandidate);
    this.selectionChange.emit(event);
  }
  // Insert 按鈕
  insertRow() {
    if (this.disabled || !this.canInsert) { return; }
    const { newRowData, data } = this.tableUtilityService.insertNewRow(
      this.data,
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField, // 將 dataStatusField 傳給服務
      this.dataStatusValue  // 將 dataStatusValue 傳給服務
    );
    this.data = data;
  }
  // 處理 ngModelChange 事件，並發送給父元件
  onValueChange(rowData: any, value: any, col: EditColumn, index: number) {
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
    if (isAutoInsertCandidate && value !== undefined && value !== null && value !== '' && !this.disabled && this.canInsert) {
      this.insertRow();
      // 標記這行已不再是自動插入的候選行，防止重複觸發
      rowData['_isAutoInsertCandidate'] = false;
    }

    // 不論是不是新增列，都執行單一欄位的驗證
    this.validateField(rowData, col, value);
    // --- 新增的自動計算邏輯 ---
    if (col.calculate) {
      // 呼叫 calculate 方法，取得要更新的欄位值
      const updates = col.calculate(rowData, value);
      // 遍歷回傳的物件，更新 rowData 的值
      for (const field in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          // 使用 patchValue 方法更新欄位值，這樣可以觸發相關的變更偵測
          // 但這裡我們直接更新 rowData，因為 ngModelChange 事件已經在處理中
          rowData[field] = updates[field];
        }
      }
    }
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
    // data不包含狀態為已刪除資料
    this.data = updatedData.filter(item => item[this.dataStatusField] !== this.dataStatusValue.Deleted);
    this.delete.emit(updatedData);
    this.dataChange.emit(this.data);
    this.selectedItems = [];
    // 如果表格資料為空，自動插入一筆新資料
    if (this.data.length === 0 && this.canInsert) {
      this.insertRow();
    }
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
  validateField(rowData: any, col: EditColumn, value: any): boolean {
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
    if (!this.disabled && this.data && !this.data.length && this.tableRequired) {
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
    if (event.dropIndex === this.lastRow() && this.canInsert) {
      this.deleteRow([draggedItem]);
      this.insertRow();
      return;
    }
  }
  // !!! 以下為核心
  // 判斷此col的validate參數是否有validateRequired的fuction
  isRequired(col: EditColumn) {
    return col.validate?.some(validate => validate.name === 'validateRequired');
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as EditColumn[];// 欄位調整
  }
  trackByRow = (index: number, item: any) => item[this.dataKey];// 行追蹤
  // 行是否可選，還有第一筆也不能被點選
  rowSelectableWrapper = ({ data, index }: { data: any, index: number; }): boolean | undefined => {
    // 不允許選擇新增中的列
    return this.isRowSelectable(data, index, this.data) && !data._isAutoInsertCandidate;
  };
  // (欄位是Dropdown使用): 獲取Dropdown的選項，支持function加入或直接給List
  getOptions(rowData: any, col: EditColumn) { return typeof col.options === 'function' ? (col.options(rowData) || undefined) : col.options || undefined; }
  // 最後一筆
  lastRow() {
    return this.data.length > 0 ? this.data.length - 1 : -1;
  }
  onExportExcel() { this.exportExcel.emit(); }                      // 匯出Excel範本 事件
  onImportExcel(event?: FileSelectEvent) {                           // 匯入Excel
    this.importExcel.emit(event);
    if (event) {
      this.fileUpload.clear();
    }
  }
  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: EditColumn, index: number, columns: EditColumn[]): boolean {
    return this.tableUtilityService.shouldRenderGroupHeader(col, index, columns);
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: EditColumn[], groupField: string): number {
    return this.tableUtilityService.getColumnSpan(columns, groupField);
  }
  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  // 分組欄位對齊
  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }

  /** 回傳完整data並去除最後一行新增的 */
  get reorderData(): any[] {
    return this.data.slice(0, -1);
  }
  /** 處理 Template input 顯示的值 */
  public templateDisplayValue(rowData: any, col: EditColumn): string {
    const displayField = col.templateDisplayField;
    // console.log(`templateDisplayValue:`, [rowData, displayField]);

    return displayField ? rowData[displayField] : rowData[col.field] || '';
  };
}
