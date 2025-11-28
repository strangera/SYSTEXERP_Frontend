/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { SortMeta } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { v4 as uuidv4 } from 'uuid';
import { DateCellComponent } from './table-edit-cell/date-cell.component';
import { DropdownCellComponent } from './table-edit-cell/dropdown-cell.component';
import { InputCellComponent } from './table-edit-cell/input-cell.component';
import { NumberCellComponent } from './table-edit-cell/number-cell.component';
import { CellInput } from './table-edit-cell/table-edit-cell.model';
import { TemplateCellComponent } from './table-edit-cell/template-cell.component';
import { TableUtilityService } from './table-edit-utility.service';
import { ColumnGroup, EditColumn, FieldChangeEvent } from './table-edit.model';
import { TableValidationService } from './table-validation.service';
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
    CommonModule,
    DividerModule,
    DropdownModule,
    FileUploadModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    KeyFilterModule,
    MultiSelectModule,
    OverlayPanelModule,
    SkeletonModule,
    TableModule,
    TooltipModule,
  ],
})
export class TableEditComponent implements OnChanges {
  // 基本設置
  @Input() title: string | undefined = undefined;     // table 標題
  @Input() tableKey: string | undefined = undefined;   // table 唯一標識 (必填)
  @Input() dataKey = '_TABLE_KEY';                 // table 資料key
  @Input() serialName = '序號';              // table 序號欄位名稱
  @Input() showReorder = true;           // 是否顯示順序調整
  @Output() rowReorderData = new EventEmitter<TableRowReorderEvent>();   // row reorder 事件
  trackByRow = (index: number, item: any) => item[this.dataKey];// 行追蹤
  @Input() tableRequired = false;            // table 是否為必填
  tableDataEmpty = false;                    // table 資料是否為空
  @Input() data: any[] = [];                 // table 資料 (必填)
  public _tableData: any[] = [];             // 內部用於表格顯示的資料 (包含新增行)
  private _fullData: any[] = [];             // 完整資料(包含 deleted 狀態的資料)
  @Input() columns!: EditColumn[];           // table 欄位配置 (必填)
  @Input() columnGroup?: ColumnGroup[];      // table 群組欄位
  @Output() dataChange = new EventEmitter<any[]>();    // table 資料改變 (事件)
  @Input() loading = false;                // 是否顯示 loading
  @Input() disabled = false;               // 是否禁用 table
  // 排序
  @Input() multiSortMeta: SortMeta[] | null | undefined = undefined; // table 多重排序
  // select 選擇Row相關
  @Input() showCheckBox = true;                        // 是否顯示 checkbox
  @Input() selectedItems: any = [];                    // table 已勾選資料
  @Output() selectionChange = new EventEmitter<any>(); // 資料變更(事件)
  @Input() isRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = () => true; // 可選擇(條件)
  rowSelectableWrapper = ({ data, index }: { data: any, index: number; }): boolean | undefined => { // 行是否可選，還有第一筆也不能被點選
    return this.isRowSelectable(data, index, this.data) && !data._isAutoInsertCandidate;// 不允許選擇新增中的列
  };
  // Header(左) 相關
  @Input() showDelete = true;                 // 是否顯示 刪除按鈕
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showInsert = false;                // 是否顯示 新增按鈕
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Output() insert = new EventEmitter<any>(); // 新增事件
  // Header(右) 相關
  @Input() showExcel = false;                     // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                // 是否顯示 匯出Excel按鈕
  @Output() exportExcel = new EventEmitter<any>();// 匯出 Excel 事件
  @Input() showExcelImport = true;                // 是否顯示 匯入Excel按鈕
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  @Input() exportExcelLoading = false;            // 匯出 Excel loading
  // rowEdit 相關
  @Input() canInsert = true;                  // 禁止新增 下方列的新增
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() defaultInsertData: any = {};         // 新增行的資料設定預設值 (可選，預設為所有資料為null)
  @Input() dataStatusField = '_dataStatus';     // 資料狀態 (如果有值增加狀態欄位；如果沒有值不增加狀態欄位)
  @Input() dataStatusValue = {                  // 預設 original/new/modified/deleted (可選)
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted'
  };
  @Input() keepDeletedData = false;       // 是否保留 Deleted 狀態的資料 (預設不保留)
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  // 驗證相關
  @Input() rowValidate: ((rowData: any, index?: number) => { isValid: boolean, errorMessage: string; }) | undefined = undefined;
  @Input() validateOnlySelected = false; // 是否只驗證已選擇的資料
  @Input() errorMessage: string | undefined; // 錯誤訊息
  // Footer
  @Input() footerData: any;         // (總計)頁尾資料

  protected readonly tableUtilityService = inject(TableUtilityService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly messageService = inject(NotificationService);
  protected readonly validationService = inject(TableValidationService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // 2. 如果 keepDeletedData 為 true,保留舊的 deleted 資料
      const existingDeletedItems = this.keepDeletedData
        ? this._fullData.filter(item => item[this.dataStatusField] === this.dataStatusValue.Deleted)
        : [];
      // 3. 複製一份完整資料(包含所有狀態)
      this._fullData = this.data.filter(item => item != null).map((item: any, index) => {
        // 初始化狀態和 UUID (與您原來的邏輯相同)
        if (item[this.dataStatusField] === undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Original;
          item[this.dataKey] = item[this.dataKey] ?? `temp-${uuidv4()}`;
        }
        this.calculateRow(item);
        if (this.rowValidate) {
          item._rowValidationError = this.rowValidate(item, index);
        }
        return item;
      });
      // 4. 合併舊的 deleted 資料 (避免重複)
      if (existingDeletedItems.length > 0) {
        // 建立現有項目的 Set，使用更可靠的比對方式
        const existingKeys = new Set(
          this._fullData
            .map(item => item[this.dataKey])
            .filter(key => key !== undefined && key !== null && key !== '')
        );

        // 只恢復那些確實不存在於新資料中的 deleted 項目
        const deletedToRestore = existingDeletedItems.filter(item => {
          const itemKey = item[this.dataKey];
          // 如果項目有有效的 dataKey，檢查是否已存在
          if (itemKey !== undefined && itemKey !== null && itemKey !== '') {
            return !existingKeys.has(itemKey);
          }
          // 如果項目沒有有效的 dataKey (例如 id=undefined 的新增項目被刪除)
          // 這種情況通常是 status='new' 的項目被刪除，不需要恢復
          return false;
        });
        this._fullData = [...this._fullData, ...deletedToRestore];
      }
      // 5. 顯示用資料:過濾掉 deleted 狀態
      this._tableData = this._fullData.filter(item => item[this.dataStatusField] !== this.dataStatusValue.Deleted);
      // 6. 如果內部資料中沒有新增行，則插入
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
  // 當 defaultInsertData 改變時，更新現有的「自動新增候選行」的預設值。
  private updateCandidateRowDefaults(): void {
    const candidateRow = this.data.find(item => item['_isAutoInsertCandidate'] === true);
    if (candidateRow && this.defaultInsertData) {
      const newDefaults = this.defaultInsertData;
      // 遍歷新的 defaultInsertData，將其值覆蓋到候選行中
      for (const key in newDefaults) {
        if (Object.prototype.hasOwnProperty.call(newDefaults, key)) {
          // 避免覆蓋內部關鍵狀態欄位，例如：dataKey, dataStatusField, _isAutoInsertCandidate
          if (key !== this.dataKey && key !== this.dataStatusField && key !== '_isAutoInsertCandidate') {
            candidateRow[key] = newDefaults[key];
          }
        }
      }
      this.cdr.detectChanges();
    }
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
      this.dataStatusField,
      this.dataStatusValue
    );
    this._tableData = data;
    this.cdr.detectChanges();
  }
  // 處理 onValueChange 事件，並發送給父元件
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
    this.validationService.validateField(rowData, col, value, this.data);
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

    // 同步更新 _fullData 中的對應資料
    const fullDataIndex = this._fullData.findIndex(item => item[this.dataKey] === rowData[this.dataKey]);
    if (fullDataIndex !== -1) {
      this._fullData[fullDataIndex] = rowData;
    }

    // 由於數據綁定和驗證已經更新了 `this._tableData` 中的物件，現在發送 `dataChange`
    // 【關鍵】：根據 keepDeletedData 決定是否包含 Deleted 資料
    let cleanData: any[];
    if (this.keepDeletedData) {
      // 保留 Deleted 資料，從 _fullData 取得
      cleanData = this._fullData.filter(item => !item._isAutoInsertCandidate);
    } else {
      // 預設行為：過濾掉 Deleted 狀態的資料，從 _tableData 取得
      cleanData = this._tableData.filter(item => !item._isAutoInsertCandidate);
    }
    this.dataChange.emit(cleanData);
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.disabled) { return; }
    const itemsToDelete = new Set(selectedItems.map((item: any) => item[this.dataKey])); // 取得所有要刪除的 ID

    // 更新完整資料 (_fullData)
    this._fullData = this._fullData.map(item => {
      if (itemsToDelete.has(item[this.dataKey])) {
        // 刪除時資料若為Original要將資料狀態改為Deleted
        if (item[this.dataStatusField] === this.dataStatusValue.Original || item[this.dataStatusField] === this.dataStatusValue.Modified) {
          return { ...item, [this.dataStatusField]: this.dataStatusValue.Deleted };
        }
        return null; // 刪除時資料若為New 直接刪除
      }
      return item;
    }).filter(item => item !== null);

    // 更新內部顯示資料 (只在畫面上隱藏 Deleted 資料)
    this._tableData = this._fullData.filter(item => item[this.dataStatusField] !== this.dataStatusValue.Deleted);

    this.delete.emit(this._fullData);
    this.selectedItems = [];

    // 2. 【關鍵檢查點 A】: 刪除後，如果內部資料為空，插入一筆新增行
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow(); // *** 這裡會將新增行加入 this._tableData ***
    }

    // 3. 【關鍵】：發射資料給父層 (根據 keepDeletedData 參數決定是否保留 Deleted)
    let cleanData: any[];
    if (this.keepDeletedData) {
      // 保留 Deleted 資料，從 _fullData 取得
      cleanData = this._fullData.filter(item => !item._isAutoInsertCandidate);
    } else {
      // 預設行為：過濾掉 Deleted 狀態的資料，從 _tableData 取得
      cleanData = this._tableData.filter(item => !item._isAutoInsertCandidate);
    }
    this.dataChange.emit(cleanData);
  }
  /** // !!! 整筆欄位使用，父層使用方法：
  /* // !!! 1. 宣告：@ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  /* // !!! 2. 在提交呼叫共通元件：const valid = this.tableEditComponent.validateAndShowErrors();
  /* // !!! 3. 使用 valid 來判斷是否通過
 /** 執行完整的驗證並處理錯誤提示
   * @returns {boolean} 整個表格是否有效
   */
  validateAndShowErrors(): boolean {
    // 呼叫 Service 執行核心驗證邏輯
    const { isValid, isTableEmpty } = this.validationService.validateAndShowErrors(
      this.data, this.columns, this.selectedItems, this.tableRequired, this.validateOnlySelected, this.rowValidate
    );
    this.tableDataEmpty = isTableEmpty;
    // 如果表格必填且為空
    if (isTableEmpty) {
      this.messageService.errorBubble('表格資料不可為空', '驗證失敗');
      this.cdr.detectChanges();
      return false;
    }
    // 如果欄位/行驗證失敗
    if (!isValid) {
      this.cdr.detectChanges(); // 讓錯誤樣式顯示
      return false;
    }
    // 驗證通過前，確保表格資料參考更新（清除任何先前可能殘留的錯誤樣式）
    this.data = [...this.data];
    this.cdr.detectChanges();
    return true; // 所有驗證通過
  }
  onRowReorder() {
    if (this.disabled) { return; }
    this._tableData = this.tableUtilityService.reorderTableData(this._tableData, this.canInsert);
    this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
    this.cdr.detectChanges();
  }
  // 取得 Cell Component 類型 (用於 NgComponentOutlet)
  getEditComponent(type: EditColumn['type']): Type<any> | undefined {
    switch (type) {
      case 'input':
        return InputCellComponent;
      case 'inputNumber':
        return NumberCellComponent;
      case 'dropdown':
        return DropdownCellComponent;
      case 'date':
        return DateCellComponent;
      case 'template':
        return TemplateCellComponent;
      default:
        return undefined;
    }
  }
  // 取得 Cell 元件的輸入屬性
  public cellInputData(rowData: any, col: EditColumn, index: number): CellInput {
    return {
      rowData,
      col,
      index,
      disabled: this.disabled,
      onValueChange: this.onValueChange.bind(this),
    };
  }
}
