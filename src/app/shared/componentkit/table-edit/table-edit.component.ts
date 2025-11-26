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
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { v4 as uuidv4 } from 'uuid';
import { TableUtilityService } from './table-edit-utility.service';
import { ColumnGroup, EditColumn, FieldChangeEvent } from './table-edit.model';
@Component({
  selector: 'app-table-edit',
  templateUrl: './table-edit.component.html',
  styleUrl: './table-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AutoCompleteModule,
    BreadcrumbModule,
    ButtonModule,
    CalendarModule,
    CommonModule,
    DividerModule,
    DropdownModule,
    FileUploadModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    KeyFilterModule,
    MultiSelectModule,
    OverlayPanelModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
})
export class TableEditComponent implements OnChanges, AfterContentInit {
  @ViewChild('dt', { static: false }) dt!: Table;     // table 元件
  @ViewChild('fileUpload') fileUpload!: FileUpload; // 檔案上傳 元件
  // 基本設置
  dataKey = '_TABLE_KEY';                 // table 資料key
  @Input() tableKey: string | undefined = undefined;   // table 唯一標識 (必填)
  @Input() title: string | undefined = undefined;     // table 標題
  @Input() tableRequired = false;             // table 是否為必填
  tableDataEmpty = false;                 // table 資料是否為空
  @Input() columns!: EditColumn[];            // table 欄位配置 (必填)
  @Input() data: any[] = [];               // table 資料 (必填)
  public _tableData: any[] = [];             // 內部用於表格顯示的資料 (包含新增行)
  @Output() dataChange = new EventEmitter<any[]>();    // table 資料改變 (事件)
  @Input() loading = false;                // 是否顯示 loading
  @Input() disabled = false;               // 是否禁用 table
  @Input() multiSortMeta: SortMeta[] | null | undefined = undefined; // table 多重排序
  @Input() serialName = '序號';              // table 序號欄位名稱
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                     // table 群組欄位
  // select 選擇Row相關
  @Input() showCheckBox = true;                        // 是否顯示 checkbox
  @Input() selectedItems: any = [];                       // table 已勾選資料
  @Input() isRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() selectionChange = new EventEmitter<any>();             // 資料變更(事件)
  // Header(左) 相關
  @Input() showInsert = false;        // 是否顯示 新增按鈕
  @Input() showDelete = true;        // 是否顯示 刪除按鈕
  @Input() insertDisabled = false;      // 新增按鈕是否禁用
  @Output() insert = new EventEmitter<any>(); // 新增事件
  // Header(右) 相關
  @Input() showExcel = false;           // 是否顯示 匯出Excel
  @Input() showExcelExport = true;         // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;         // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;     // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;       // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 禁止新增
  @Input() canInsert = true;
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  // rowEdit 相關
  @Input() showReorder = true;           // 是否顯示順序調整
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() defaultInsertData: any = {};       // 預設新增資料 (可選，預設為所有資料為null)
  @Input() dataStatusField = '_dataStatus';     // 資料狀態 (如果有值增加狀態欄位；如果沒有值不增加狀態欄位)
  @Input() dataStatusValue = {           // 預設 original/new/modified/deleted (可選)
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted'
  };
  // 驗證相關
  @Input() rowValidate: ((rowData: any, index?: number) => { isValid: boolean, errorMessage: string; }) | undefined = undefined;
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  @Output() rowReorderData = new EventEmitter<TableRowReorderEvent>();   // row reorder 事件
  @Input() errorMessage: string | undefined; // 錯誤訊息
  @Input() footerData: any;         // (總計)頁尾資料
  /** 新增：是否只判斷驗證已選擇的資料，預設為 false */
  @Input() validateOnlySelected = false;

  public readonly percentKeyFilter = /^(100(\.0{1,2})?|(\d{1,2})(\.\d*)?)$/; // 驗證百分比

  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: NotificationService
  ) { }

  // ... (ngOnChanges 和其他方法保持不變，直到 validateAndShowErrors)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // 1. 將外部傳入的資料深拷貝，作為內部顯示的起點
      //  確保只有來自父層的資料才進入此處
      if (changes['data'].currentValue === this._tableData) {
        // 這是由 dataChange 事件觸發的回流，不需要再次處理
        return;
      }
      // 2. 複製一份，確保不修改父層傳入的原始陣列
      this._tableData = this.data.filter(item => item != null).map((item: any, index) => {
        // 初始化狀態和 UUID (與您原來的邏輯相同)
        if (item[this.dataStatusField] === undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Original;
          item[this.dataKey] = `temp-${uuidv4()}`;
        }
        this.calculateRow(item);
        if (this.rowValidate) {
          item._rowValidationError = this.rowValidate(item, index);
        }
        return item;
      });
      // 3. 如果內部資料中沒有新增行，則插入
      if (!this._tableData.some(item => item['_isAutoInsertCandidate']) && this.canInsert) {
        this.insertRow();
      }
      this.cdr.detectChanges();
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
    //  if (!this.disabled && this.canInsert) {
    //   this.insertRow();
    //   this.cdr.detectChanges();
    //  }
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
      this._tableData,
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField, // 將 dataStatusField 傳給服務
      this.dataStatusValue // 將 dataStatusValue 傳給服務
    );
    this._tableData = data;
    this.cdr.detectChanges();
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
      if (this._tableData.length === 0 && this.canInsert) {
        this.insertRow();
      }
    }

    // 觸發 fieldChange 事件，無論驗證是否通過
    this.fieldChange.emit({ rowData, field: col.field, value, index });

    // 由於數據綁定和驗證已經更新了 `this._tableData` 中的物件，現在發送 `dataChange`
    // 【關鍵】：發射給父層的是經過過濾的乾淨資料！
    const cleanData = this._tableData.filter(item => item[this.dataStatusField] !== this.dataStatusValue.Deleted && !item._isAutoInsertCandidate);
    this.dataChange.emit(cleanData); // 這樣父層的 data 就不包含新增行了！
  }
  onDropdownHide(rowData: any, col: any) {
    const currentValue = rowData[col.field];
    if (col.type === 'dropdown') {
      const options = this.getOptions(rowData, col) || [];
      let isValidOption = false;
      if (currentValue === null || currentValue === undefined) {
        isValidOption = true;
      } else {
        const valueKey = col.optionValue || col.optionLabel; // 如果沒有 optionValue，可能 PrimeNG 會用 Label 來綁定
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
        rowData[col.field] = null;
      }
    }
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
    // 更新內部顯示資料
    this._tableData = updatedData.filter(item => item[this.dataStatusField] !== this.dataStatusValue.Deleted);
    this.delete.emit(updatedData);
    this.selectedItems = [];
    // 2. 【關鍵檢查點 A】: 刪除後，如果內部資料為空，插入一筆新增行
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow(); // *** 這裡會將新增行加入 this._tableData ***
    }
    // 3. 【關鍵】：發射乾淨的資料給父層
    //  注意：這裡發射的陣列應該是空陣列，因為 this._tableData 現在只包含新增行。
    const cleanData = this._tableData.filter(item => !item._isAutoInsertCandidate);
    this.dataChange.emit(cleanData);
  }
  // ... (validateAllRows 保持不變)
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
  // ... (validateField 保持不變)
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
    //  delete rowData._validationErrors;
    // }
    return isValidField;
  }
  /** // !!! 整筆欄位使用，父層使用方法：
   /* // !!! 1. 宣告：@ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
   /* // !!! 2. 在提交呼叫共通元件：const valid = this.tableEditComponent.validateAndShowErrors();
   /* // !!! 3. 使用 valid 來判斷是否通過
 /**
   * 執行完整的驗證並處理錯誤提示
   * @returns {boolean} 整個表格是否有效
   */
  validateAndShowErrors(): boolean {
    // 1. 清除所有行的舊有驗證錯誤狀態 (保持上一步的優化)
    for (const rowData of this.data) {
      if (rowData._validationErrors) {
        delete rowData._validationErrors;
      }
      if (rowData._rowValidationError) {
        delete rowData._rowValidationError;
      }
    }

    // --- 【優化後的整體必填檢查】 ---
    if (this.tableRequired && !this.disabled) {
      // 排除自動插入的空行後，取得有效資料
      const actualData = this.data.filter(row => !row._isAutoInsertCandidate);

      let shouldCheckActualDataEmpty = true;

      if (this.validateOnlySelected) {
        // 在 validateOnlySelected 模式下，判斷是否有選擇的資料
        if (this.selectedItems && this.selectedItems.length > 0) {
          // 如果有選擇資料，則通過表格必填檢查
          shouldCheckActualDataEmpty = false;
        }
      } else {
        // 在非 validateOnlySelected 模式下，只要實際資料有東西就通過表格必填檢查
        if (actualData.length > 0) {
          shouldCheckActualDataEmpty = false;
        }
      }

      // 最終判斷是否為「表格空」的錯誤
      if (shouldCheckActualDataEmpty) {
        this.tableDataEmpty = true;
        this.cdr.detectChanges(); // 立即更新狀態
        return false; // 表格必填但沒資料/沒選取
      } else {
        this.tableDataEmpty = false; // 有資料或有選取，清除表格空狀態
      }
    } else {
      this.tableDataEmpty = false; // 如果非必填或被禁用，清除表格空狀態
    }
    // --- 【整體必填檢查結束】 ---

    // 確定要驗證的資料集
    let rowsToValidate: any[];
    if (this.validateOnlySelected && this.selectedItems.length > 0) {
      // 🌟 如果設定為只驗證已選擇的資料，則使用 selectedItems
      rowsToValidate = this.selectedItems;
    } else if (this.validateOnlySelected && this.selectedItems.length === 0) {
      // 🌟 如果開啟 validateOnlySelected 但沒有選擇任何項目，則視為通過行/欄位驗證
      this.data = [...this.data];
      this.cdr.detectChanges();
      return true;
    } else {
      // 否則驗證所有非新增行的資料
      rowsToValidate = this.data.filter(row => !row._isAutoInsertCandidate);
    }

    // 遍歷需要驗證的行 (欄位和行驗證)
    for (const rowData of rowsToValidate) {

      // --- 欄位驗證 (Field Validation) ---
      for (const col of this.columns) {
        if (!rowData._validationErrors) {
          rowData._validationErrors = {};
        }
        let hasError = false;

        if (col.validate) {
          for (const validateFn of col.validate) {
            const validationResult = validateFn(rowData[col.field], rowData, this.data, col.field, col.header);
            if (!validationResult.isValid) {
              rowData._validationErrors[col.field] = validationResult.errorMessage[0] || '欄位驗證失敗。';
              hasError = true;
              break; // 找到第一個欄位錯誤就跳出
            }
          }
        }

        if (!hasError) {
          delete rowData._validationErrors[col.field];
        }

        if (hasError) {
          // 發現錯誤時，強制刷新並返回
          this.data = [...this.data];
          this.cdr.detectChanges();

          this.messageService.errorBubble(`｢${col.header}」 ` + rowData._validationErrors[col.field], '表格欄位驗證失敗');
          return false;
        }
      }

      // --- 整行驗證 (Row Validation) ---
      if (this.rowValidate) {
        rowData._rowValidationError = this.rowValidate(rowData);
      }

      if (rowData._rowValidationError?.isValid === false) {
        // 發現整行錯誤時，強制刷新並返回
        this.data = [...this.data];
        this.cdr.detectChanges();

        this.messageService.errorBubble(rowData._rowValidationError.errorMessage, '表格驗證失敗');
        return false;
      }
    }

    // 驗證通過前，確保表格資料參考更新（清除任何先前可能殘留的錯誤樣式）
    this.data = [...this.data];
    this.cdr.detectChanges();

    return true; // 所有行都驗證通過
  }

  // ... (hasRowError 和後續方法保持不變)
  /**
 * 檢查該行是否包含任何欄位錯誤或整行驗證錯誤。
 */
  public hasRowError(rowData: any): boolean {
    if (rowData._isAutoInsertCandidate) {
      return false;
    }

    // 檢查整行驗證錯誤
    if (rowData._rowValidationError?.isValid === false) {
      return true;
    }

    // 檢查是否有任何欄位驗證錯誤
    // (如果 _validationErrors 存在且其屬性數量 > 0)
    if (rowData._validationErrors && Object.keys(rowData._validationErrors).length > 0) {
      return true;
    }

    return false;
  }
  onRowReorder(event: TableRowReorderEvent) {
    if (this.disabled) {
      return;
    }
    if (this.canInsert) {
      const candidateIndex = this._tableData.findIndex(item => item['_isAutoInsertCandidate']);
      const lastIndex = this._tableData.length - 1;
      if (candidateIndex !== -1 && candidateIndex !== lastIndex) {
        this._tableData.splice(candidateIndex, 1);
        this.insertRow();
      }
    }
    this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
    this.cdr.detectChanges();
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
  onExportExcel() { this.exportExcel.emit(); }           // 匯出Excel範本 事件
  onImportExcel(event?: FileSelectEvent) {              // 匯入Excel
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
  public get reorderData(): any[] {
    return this.data.filter(item => !item._isAutoInsertCandidate); // 改成判斷item._isAutoInsertCandidate比較安全
  }
  /** 處理 Template input 顯示的值 */
  public templateDisplayValue(rowData: any, col: EditColumn): string {
    const displayField = col.templateDisplayField;
    // console.log(`templateDisplayValue:`, [rowData, displayField]);

    return displayField ? rowData[displayField] : rowData[col.field] || '';
  };
}
