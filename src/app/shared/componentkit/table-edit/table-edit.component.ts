/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, Type, ViewChild } from '@angular/core';
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
import { Table, TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TableEditDataService } from './services/table-edit-data.service';
import { TableUtilityService } from './services/table-edit-utility.service';
import { TableValidationService } from './services/table-validation.service';
import { DateCellComponent } from './table-edit-cell/date-cell.component';
import { DropdownCellComponent } from './table-edit-cell/dropdown-cell.component';
import { InputCellComponent } from './table-edit-cell/input-cell.component';
import { NumberCellComponent } from './table-edit-cell/number-cell.component';
import { PercentCellComponent } from './table-edit-cell/percent-cell.component';
import { CellInput } from './table-edit-cell/table-edit-cell.model';
import { TemplateCellComponent } from './table-edit-cell/template-cell.component';
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
  @ViewChild('dt') private readonly table!: Table;
  // 基本設置
  @Input() title: string | undefined = undefined;       // table 標題
  @Input() tableKey: string | undefined = undefined;    // table 唯一標識 (必填)
  @Input() dataKey = '_TABLE_KEY';                      // table 資料key
  @Input() serialName = '序號';                         // table 序號欄位名稱
  @Input() showReorder = true;                          // 是否顯示順序調整
  @Output() rowReorderData = new EventEmitter<TableRowReorderEvent>();   // row reorder 事件
  @Input() tableRequired = false;            // table 是否為必填
  @Input({ required: true }) data: any[] = [];                 // table 資料 (必填)
  @Input({ required: true }) columns!: EditColumn[];           // table 欄位配置 (必填)
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
  protected readonly dataService = inject(TableEditDataService);

  public get _tableData(): any[] {
    return this.dataService.tableData;
  }
  public trackByRow = (index: number, item: any) => item[this.dataKey];// 行追蹤
  public rowSelectableWrapper = ({ data, index }: { data: any, index: number; }): boolean | undefined => { // 行是否可選，還有第一筆也不能被點選
    return this.isRowSelectable(data, index, this.data) && !data._isAutoInsertCandidate;// 不允許選擇新增中的列
  };
  public tableDataEmpty = false;                    // table 資料是否為空

  ngOnChanges(changes: SimpleChanges): void {
    // 檢查 'data' 是否有變動
    if (changes['data']) {
      const dataChange = changes['data'];
      const isDataReferenceDifferent = dataChange.previousValue !== dataChange.currentValue;
      // 如果是第一次載入 (firstChange)，或資料參考改變
      if (dataChange.firstChange || isDataReferenceDifferent) {
        const isInternalStateSynchronized =
          this.dataService.isSynchronized(this.data, this.dataKey);
        // 如果為第一次載入，我們強制進行初始化
        if (dataChange.firstChange || !isInternalStateSynchronized) {
          this.dataService.initializeData(
            this.data, this.columns, this.dataKey, this.dataStatusField,
            this.dataStatusValue, this.keepDeletedData, this.canInsert,
            this.rowValidate, this.defaultInsertData, this.disabled
          );
          // 由於 Service 已經更新了 _tableData，我們需要通知 Angular 刷新視圖
          this.cdr.detectChanges();
        }
      }
    }

    // 處理 defaultInsertData 改變的邏輯：更新現有的新增候選行
    if (changes['defaultInsertData']) {
      this.dataService.updateCandidateRowDefaults(this.dataKey, this.dataStatusField, this.defaultInsertData);
      this.cdr.detectChanges();
    }

    if (changes['disabled']) {
      const currentDisabled = changes['disabled'].currentValue;
      const previousDisabled = changes['disabled'].previousValue;
      if (previousDisabled !== currentDisabled && currentDisabled === false && this.canInsert) {
        const hasCandidateRow = this._tableData.some(item => item['_isAutoInsertCandidate']);
        if (!hasCandidateRow) {
          this.dataService.insertNewRow(
            this.columns,
            this.dataKey,
            this.defaultInsertData,
            this.dataStatusField,
            this.dataStatusValue
          );
          this.cdr.detectChanges();
        }
      }
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
    this.dataService.insertNewRow(
      this.columns,
      this.dataKey,
      this.defaultInsertData,
      this.dataStatusField,
      this.dataStatusValue
    );
    this.cdr.detectChanges();
  }
  // 處理 onValueChange 事件，並發送給父元件
  onValueChange(rowData: any, value: any, col: EditColumn, index: number) {
    if (this.disabled) { return; }
    this.tableDataEmpty = false;
    this.validationService.validateField(rowData, col, value, this._tableData);
    // 執行所有狀態轉換、計算、驗證和自動新增邏輯
    const { shouldInsertNewRow, cleanData } = this.dataService.updateRowOnValueChange(
      rowData, value, col, index,
      this.columns,
      this.dataKey,
      this.dataStatusField,
      this.dataStatusValue,
      this.keepDeletedData,
      this.canInsert,
      this.rowValidate,
      this.defaultInsertData
    );
    // 確保空表時也能插入新增行（這是舊邏輯，保持在 Component 端）
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow();
    }

    // 觸發 fieldChange 事件
    this.fieldChange.emit({ rowData, field: col.field, value, index });

    // 發射 cleanData 給父層
    this.dataChange.emit(cleanData);
    this.cdr.detectChanges();
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.disabled) { return; }

    // 呼叫 Service 執行刪除邏輯
    const { fullData, cleanData } = this.dataService.deleteRows(
      selectedItems,
      this.dataKey,
      this.dataStatusField,
      this.dataStatusValue,
      this.canInsert,
      this.keepDeletedData
    );

    this.delete.emit(fullData); // 傳遞包含 Deleted 狀態的完整資料
    this.selectedItems = [];

    // 2. 【關鍵檢查點 A】: 刪除後，如果內部資料為空，插入一筆新增行
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow();
    }

    // 3. 發射資料給父層
    this.dataChange.emit(cleanData);
    this.cdr.detectChanges();
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
    const { isValid, isTableEmpty, firstErrorIndex } = this.validationService.validateAndShowErrors(
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
      //  新功能：滾動到第一個錯誤位置
      if (firstErrorIndex !== undefined && firstErrorIndex !== -1) {
        this.scrollToRow(firstErrorIndex);
      }
      return false;
    }
    return true; // 所有驗證通過
  }
  /**
   * 滾動 PrimeNG Table 到指定的行索引。
   * @param index 要滾動到的行索引 (基於 _tableData)
   */
  private scrollToRow(index: number): void {
    if (this.table && this.table.el) {
      const tbody = this.table.el.nativeElement.querySelector('.p-datatable-tbody');
      if (tbody) {
        const rowElement = tbody.children[index];
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }
  onRowReorder() {
    this.tableUtilityService.reorderTableData(this._tableData, this.canInsert, this.disabled);
    this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
  }
  // 取得 Cell Component 類型 (用於 NgComponentOutlet)
  getEditComponent(type: EditColumn['type']): Type<any> | undefined {
    switch (type) {
      case 'input':
        return InputCellComponent;
      case 'percent':
        return PercentCellComponent;
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
