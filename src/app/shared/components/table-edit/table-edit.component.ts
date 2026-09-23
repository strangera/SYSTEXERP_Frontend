/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, inject, Input, NgZone, OnChanges, Output, SimpleChanges, TemplateRef, Type, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@shared/components/notification-message/notification.service';
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
import { debounceTime, Subject } from 'rxjs';
import { TableEditDataService } from './services/table-edit-data.service';
import { TableUtilityService } from './services/table-edit-utility.service';
import { TableValidationService } from './services/table-validation.service';
import { AutoCompleteCellComponent } from './table-edit-cell/auto-complete-cell.component';
import { CheckboxCellComponent } from './table-edit-cell/checkbox-cell.component';
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
  host: { 'table-edit-id': '複製時請自行取唯一名' },
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
  providers: [TableEditDataService, TableValidationService]
})
export class TableEditComponent implements OnChanges, AfterContentInit {
  @ViewChild('dt') private readonly table!: Table;
  @ContentChild('customCell') customCellTemp!: TemplateRef<any>;
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
  @Input() showSort = false;                // 是否顯示排序
  // select 選擇Row相關
  @Input() showCheckBox = true;                        // 是否顯示 checkbox
  @Input() selectedItems: any = [];                    // table 已勾選資料
  @Output() selectionChange = new EventEmitter<any>(); // 資料變更(事件)
  @Input() isRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = () => true; // 可選擇(條件)
  // Header(左) 相關
  @Input() showDelete = true;                 // 是否顯示 刪除按鈕
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showInsert = false;                // 是否顯示 新增按鈕
  @Input() insertText: string | undefined;               // 新增按鈕文字
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
  @Input() footerData: any;
  private footerUpdateSubject = new Subject<void>();
  protected _calculatedFooterData: any = {}; // 用於儲存計算結果
  @Input() footerSummaryLabel = '總計'; // 新增：Footer 摘要行的標籤名稱
  @Input() showFooter = false;
  @Input() scrollable = false; // 是否要滾輪
  @Input() showPaginator = false; // 是否顯示 分頁器
  // 鍵盤操作相關
  @Input() enableTabInsert = false; // 是否在最後一列最後一個欄位按 Tab 觸發新增

  protected readonly tableUtilityService = inject(TableUtilityService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly messageService = inject(NotificationService);
  protected readonly validationService = inject(TableValidationService);
  protected readonly dataService = inject(TableEditDataService);
  protected readonly zone = inject(NgZone);

  public get _tableData(): any[] {
    return this.dataService.tableData;
  }
  public trackByRow = (index: number, item: any) => item[this.dataKey];// 行追蹤
  public rowSelectableWrapper = ({ data, index }: { data: any, index: number; }): boolean | undefined => { // 行是否可選，還有第一筆也不能被點選
    return this.isRowSelectable(data, index, this.data) && !data._isAutoInsertCandidate;// 不允許選擇新增中的列
  };
  public tableDataEmpty = false;                    // table 資料是否為空

  constructor() {
    this.footerUpdateSubject.pipe(debounceTime(300)).subscribe(() => {
      this._calculatedFooterData = this.calculateFooterData();
      this.cdr.markForCheck();
    });
  }

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
          this._calculatedFooterData = this.calculateFooterData(); // 新增
          this.cdr.detectChanges();
        }
      }
    }

    // 新增：當 columns 改變時也重新計算 footer
    if (changes['columns'] && !changes['columns'].firstChange) {
      this._calculatedFooterData = this.calculateFooterData();
      this.cdr.markForCheck();
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

    // 處理 canInsert 動態變化
    if (changes['canInsert']) {
      const prev = changes['canInsert'].previousValue;
      const curr = changes['canInsert'].currentValue;
      if (prev !== curr) {
        // 啟用 canInsert：若沒有 candidate row 且未 disabled，插入一筆候選行
        if (curr === true) {
          if (!this.disabled) {
            const hasCandidate = this._tableData.some(item => item._isAutoInsertCandidate);
            if (!hasCandidate) {
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
        } else {
          // 停用 canInsert：移除所有 candidate rows 並發射 clean data 給父層
          const beforeLen = this._tableData.length;
          const keep = this._tableData.filter(item => !item._isAutoInsertCandidate);
          if (keep.length !== beforeLen) {
            // 直接修改內部陣列（service 的 tableData 參考）
            this._tableData.length = 0;
            this._tableData.push(...keep);
            // 發射 clean data 給父層（過濾掉 candidate）
            this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
            this.cdr.detectChanges();
          }
        }
      }
    }
  }
  ngAfterContentInit(): void {
    // 當外部傳入的 <ng-template #customCell> 準備好時
    if (this.customCellTemp) {
      // 使用 setTimeout 避開「單向資料流」的檢測錯誤
      setTimeout(() => {
        this.cdr.markForCheck(); // 告訴 Angular：樣板來了，請重新渲染儲存格
      }, 0);
    }
  }
  /**
   * 儲存格 keydown 事件處理：
   * - 一律阻止事件往外傳（維持原本行為）
   * - 若有啟用 enableTabInsert，且在最後一列最後一欄按下 Tab，則自動觸發新增。
   */
  onCellKeydown(event: KeyboardEvent, rowIndex: number, colIndex: number): void {
    event.stopPropagation();

    const isTab = event.key === 'Tab';
    const isEnter = event.key === 'Enter';

    if (!isTab && !isEnter) return;
    if (this.disabled) return;

    // --- 關鍵修正：動態判斷這是否為該行最後一個可編輯欄位 ---
    const rowData = this._tableData[rowIndex];
    const isLastEditableCol = this.isLastEditableColumn(rowData, rowIndex, colIndex);
    const isLastRow = rowIndex === this._tableData.length - 1;

    if (isEnter) {
      event.preventDefault();

      if (isLastEditableCol) {
        if (isLastRow) {
          // 如果是全表格最後一格，觸發轉正與自動新增
          this.handleEnterAtLastCell(rowIndex);
        } else {
          // 如果只是該行最後一格，跳到下一行第一格
          this.focusFirstInput(rowIndex + 1);
        }
      } else {
        // 一般跳格
        this.focusNextCell(rowIndex, colIndex);
      }
    } else if (isTab && !event.shiftKey && isLastEditableCol && isLastRow && this.enableTabInsert) {
      this.handleEnterAtLastCell(rowIndex);
    }
  }
  /**
   * 判斷當前 colIndex 是否為該 row 邏輯上的最後一個可編輯欄位
   */
  private isLastEditableColumn(rowData: any, rowIndex: number, currentColIndex: number): boolean {
    // 從最後一個欄位開始往前找
    for (let i = this.columns.length - 1; i >= 0; i--) {
      const col = this.columns[i];
      const isHidden = typeof col.hidden === 'function' ? col.hidden(rowData, rowIndex) : col.hidden;

      // 只要有 type 且沒被隱藏，它就是一個「可編輯欄位」
      if (col.type && !isHidden) {
        // 如果找到的第一個（也就是最後一個）索引等於當前索引，就是最後一格
        return i === currentColIndex;
      }
    }
    return false;
  }
  private handleEnterAtLastCell(rowIndex: number) {
    const rowData = this._tableData[rowIndex];

    // 1. 如果目前這筆是候選行，按下 Enter 表示完成輸入，將其轉正
    if (rowData._isAutoInsertCandidate) {
      rowData._isAutoInsertCandidate = false;
      rowData[this.dataStatusField] = this.dataStatusValue.New;

      // 發射事件讓父元件同步資料
      this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
    }

    // 2. 檢查是否能新增，並執行新增
    if (this.canInsert && !this.disabled) {
      this.insertRow();
      this.cdr.detectChanges(); // 強制渲染新 Row DOM
    }

    // 3. 聚焦到新行
    setTimeout(() => {
      this.focusFirstInput(rowIndex + 1);
    }, 50);
  }
  /**
 * 核心方法：手動計算並聚焦下一個輸入框
 * @param rowIndex 目前行索引
 * @param colIndex 目前列(欄位)索引
 */
  private focusNextCell(rowIndex: number, colIndex: number): void {
    let nextRow = rowIndex;
    let nextCol = colIndex + 1;

    // 1. 如果這一列已經到最後一欄了，換到下一列的第一欄
    if (nextCol >= this.columns.length) {
      nextCol = 0;
      nextRow++;
    }

    // 2. 檢查是否超出表格總行數
    if (nextRow < this._tableData.length) {
      const nextColDef = this.columns[nextCol];
      const rowData = this._tableData[nextRow];

      // 3. 判斷下一個儲存格是否為「隱藏」或「不可編輯」
      // 如果該欄位有 hidden 邏輯且結果為 true，或者該欄位根本沒定義 type (純文字)
      const isHidden = typeof nextColDef.hidden === 'function'
        ? nextColDef.hidden(rowData, nextRow)
        : nextColDef.hidden;

      if (isHidden || !nextColDef.type) {
        // 遞迴尋找再下一個可用的 Cell
        this.focusNextCell(nextRow, nextCol);
        return;
      }

      // 4. 執行聚焦動作
      setTimeout(() => {
        if (!this.table || !this.table.el) return;

        const tbody = this.table.el.nativeElement.querySelector('.p-datatable-tbody');
        if (tbody) {
          const targetRow = tbody.children[nextRow];
          if (targetRow) {
            // 使用 calculateActualTdIndex 修正因 Checkbox/Reorder 產生的偏移
            const tdIndex = this.calculateActualTdIndex(nextCol);
            const targetTd = targetRow.children[tdIndex];

            if (targetTd) {
              // 尋找該 Td 內可聚焦的元素
              const focusable = targetTd.querySelector(
                'input, select, textarea, .p-dropdown-label, [tabindex="0"]'
              ) as HTMLElement;

              if (focusable) {
                focusable.focus();
                // 如果是 Input 順便全選內容 (ERP 使用者通常喜歡這樣，方便直接覆蓋輸入)
                if (focusable instanceof HTMLInputElement) {
                  focusable.select();
                }
              } else {
                // 雖然有 type 但找不到可聚焦元素，繼續找下一個
                this.focusNextCell(nextRow, nextCol);
              }
            }
          }
        }
      });
    }
  }
  /**
 * 輔助方法：計算真實的 td index (因為前面有序號、Checkbox、Reorder 欄位)
 */
  private calculateActualTdIndex(colIndex: number): number {
    let offset = 1; // 基礎序號欄位
    if (this.showReorder && this._tableData.length) offset++;
    if (this.showCheckBox && !this.disabled && this.data.length) offset++;
    return colIndex + offset;
  }
  onSelectionChange(event: any) {
    if (this.disabled) { return; }
    // 使用 zone. runOutsideAngular 優化效能
    this.zone.runOutsideAngular(() => {
      // 過濾掉新增候選行
      const filtered = event.filter((item: any) => !item._isAutoInsertCandidate);
      // 延遲更新，避免阻塞 UI
      requestAnimationFrame(() => {
        this.zone.run(() => {
          // 更新元件內部 selectedItems 並向外發射 selectionChange
          this.selectedItems = filtered;
          this.selectionChange.emit(filtered);
          this.cdr.markForCheck();
        });
      });
    });
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
    this.dataChange.emit(this._tableData.filter(item => !item._isAutoInsertCandidate));
    this.cdr.detectChanges();
  }
  // 處理 onValueChange 事件，並發送給父元件
  onValueChange(rowData: any, value: any, col: EditColumn, index: number) {
    if (this.disabled) { return; }
    this.tableDataEmpty = false;
    if ((col as any).isUserInput === true && rowData._isAutoInsertCandidate) {
      rowData._isAutoInsertCandidate = false;
      rowData[this.dataStatusField] = this.dataStatusValue.New;// 標示這筆為 New（避免共通把它當成舊資料）
    }
    // 1. 先更新 rowData 當下的值 (這很重要，否則 Service 拿不到最新值去計算)
    rowData[col.field] = value;
    // 新增邏輯：自動清空因隱藏而失效的欄位值
    this.columns.forEach(column => {
      // 如果該欄位有定義 hidden 邏輯，且執行結果為 true (隱藏)
      if ((typeof column.hidden === 'function' ? column.hidden(rowData, index) : column.hidden) === true) {
        // 且該欄位目前還有值，則清空它
        if (rowData[column.field] !== null && rowData[column.field] !== undefined) {
          rowData[column.field] = null;

          // 如果隱藏的欄位也有驗證錯誤，清空值後一併移除該欄位的錯誤標記
          if (rowData._validationErrors && rowData._validationErrors[column.field]) {
            delete rowData._validationErrors[column.field];
          }
        }
      }
    });
    // 2. 呼叫 Service 進行「該欄位」引發的計算與狀態更新
    const { shouldInsertNewRow, cleanData } = this.dataService.updateRowOnValueChange(
      rowData, value, col, index,
      this.columns, this.dataKey, this.dataStatusField, this.dataStatusValue,
      this.keepDeletedData, this.canInsert, this.rowValidate, this.defaultInsertData
    );
    // 3. 執行驗證 (計算完後驗證才準確)
    this.validationService.validateField(rowData, col, value, this._tableData, index);
    // 確保空表時也能插入新增行（這是舊邏輯，保持在 Component 端）
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow();
    }

    // 觸發 fieldChange 事件
    this.fieldChange.emit({ rowData, field: col.field, value, index });
    // 將原本直接計算改為發送訊號
    // this._calculatedFooterData = this.calculateFooterData();
    this.footerUpdateSubject.next();
    // 發射 cleanData 給父層
    this.dataChange.emit(cleanData);
    this.cdr.markForCheck();
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
    this._calculatedFooterData = this.calculateFooterData();
    // 3. 發射資料給父層
    this.dataChange.emit(cleanData);
    this.cdr.markForCheck();
  }
  /** // !!! 整筆欄位使用，父層使用方法：
  / * // !!! @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  /* // !!! 1. 宣告 const tableEditComponent = inject(TableEditComponent);
  /* // !!! 1. 或者宣告 @ViewChild('tableEdit') tableEditComponent!: TableEditComponent;
  /* // !!! 2. 在提交呼叫共通元件：const valid = this.tableEditComponent.validateAndShowErrors();
  /* // !!! 3. 使用 valid 來判斷是否通過
      if (!valid) {
        this.loading = false;
        return;
      }
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
      case 'autoComplete':
        return AutoCompleteCellComponent;
      case 'date':
        return DateCellComponent;
      case 'checkbox':
        return CheckboxCellComponent;
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
      disabled: this.disabled || !!this.rowEditDisabled(rowData),
      onValueChange: this.onValueChange.bind(this),
      onFilterComplete: (event: any, rowData: any, col: EditColumn, index: number) => {
        if (col.onFilterComplete) {
          col.onFilterComplete(event, rowData, col, index);
        }
      }
    };
  }
  /** 強制重跑所有非候選行對指定欄位的驗證，用於跨列校驗（如合計必須等於 100%）。 */
  public revalidateField(field: string): void {
    const col = this.columns.find(c => c.field === field);
    if (!col) return;
    for (let i = 0; i < this._tableData.length; i++) {
      const rowData = this._tableData[i];
      if (rowData._isAutoInsertCandidate) continue;
      this.validationService.validateField(rowData, col, rowData[col.field], this._tableData, i);
    }
    this.cdr.markForCheck();
  }

  /**
   * 根據 col.cellClass 屬性，獲取 <td> 標籤應用的 CSS class
   * @param rowData 當前行資料
   * @param col EditColumn 配置物件
   * @returns 應用的 CSS class 字串
   */
  getTdClass(rowData: any, col: EditColumn): string {
    if (!col.cellClass) return '';
    if (typeof col.cellClass === 'function') return col.cellClass(rowData);
    return col.cellClass;
  }
  /**
 * 根據設定的 columns 聚合屬性，計算表格底部總計資料 (Footer Data)。
 * @returns 包含計算結果的物件，例如: { Amount: 1234, Quantity: 50, ... }
 */
  private calculateFooterData(): any {
    if (!this._tableData || !this.columns) {
      return {};
    }

    // 過濾掉新增候選行（因為它不是實際數據）和已刪除的資料（如果 keepDeletedData 為 true）
    const aggregatedData = this._tableData.filter(item =>
      !item._isAutoInsertCandidate &&
      !(this.keepDeletedData && item[this.dataStatusField] === this.dataStatusValue.Deleted)
    );

    const footer: Record<string, any> = {};

    // 遍歷所有欄位配置
    this.columns.forEach(col => {
      if (col.aggregate === 'sum') {
        let sum = 0;
        aggregatedData.forEach(item => {
          const value = item[col.field];
          // 確保值是有效數字
          if (typeof value === 'number' && !isNaN(value)) {
            sum += value;
          }
        });
        footer[col.field] = sum;

      } else if (col.aggregate === 'count') {
        // 僅計算非空的行數
        footer[col.field] = aggregatedData.filter(item => item[col.field] !== null && item[col.field] !== undefined).length;
      }
      // 您可以根據需要添加 'avg' 等其他聚合邏輯
    });

    return footer;
  }
  /**
   * 允許模板存取 Object.keys (解決 Angular Change Detection 限制)
   */
  protected getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  /**
 * 計算總計行第一個 td 應該合併的欄位數量 (colspan)
 * @returns 合併的欄位數
 */
  calculateFooterColspan(): number {
    let baseColspan = 1;// 基礎合併數：序號欄位 (1)
    if (this.showReorder && this._tableData.length) baseColspan++;// Reorder 欄位
    if (this.showCheckBox && !this.disabled && this.data.length) baseColspan++;// CheckBox 欄位 (僅在顯示且資料不為空時計入)
    let firstAggregateIndex = -1;
    if (this.footerData) {
      firstAggregateIndex = this.tableUtilityService.getFirstAggregateIndex(this.columns, this.footerData);
    } else if (this.getObjectKeys(this._calculatedFooterData).length > 0) {
      firstAggregateIndex = this.tableUtilityService.getFirstCalculatedAggregateIndex(this.columns, this._calculatedFooterData);
    }
    // 如果沒有總計值，或所有欄位都有總計值 (則不需要合併)
    if (firstAggregateIndex === -1 || firstAggregateIndex === 0) {
      return baseColspan; // 僅合併前面幾個非資料欄位
    }
    return baseColspan + firstAggregateIndex;// 合併數為：基礎 colspan + 第一個有總計值的資料欄位索引
  }

  focusFirstInput(rowIndex: number) {
    if (!this.table || !this.table.el) return;

    setTimeout(() => {
      const el = this.table.el.nativeElement;
      const rows = el.querySelectorAll('.p-datatable-tbody tr');
      const targetRow = rows[rowIndex];

      if (targetRow) {
        // 尋找該行內第一個「可見且非禁用」的輸入控制項
        const input = targetRow.querySelector(
          'input:not([disabled]):not([hidden]), .p-dropdown-label, .p-inputnumber-input, .p-autocomplete-input, [tabindex="0"]'
        ) as HTMLElement;

        if (input) {
          input.focus();
          if (input.tagName === 'INPUT') {
            (input as HTMLInputElement).select();
          }
        }
      }
    }, 50);
  }
}
