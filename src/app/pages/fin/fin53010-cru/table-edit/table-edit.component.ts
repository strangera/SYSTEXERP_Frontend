/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, NgZone, OnChanges, Output, SimpleChanges, Type, ViewChild } from '@angular/core';
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
import { Observable, take } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { TableEditDataService } from './services/table-edit-data.service';
import { TableUtilityService } from './services/table-edit-utility.service';
import { TableValidationService } from './services/table-validation.service';
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
  host: { 'table-edit-id': 'FIN53010CRU' },
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
  @Input() showSort = false;                // 是否顯示排序
  // select 選擇Row相關
  @Input() showCheckBox = true;                        // 是否顯示 checkbox
  @Input() selectedItems: any = [];                    // table 已勾選資料
  @Output() selectionChange = new EventEmitter<any>(); // 資料變更(事件)
  @Input() isRowSelectable: (rowData: any, rowIndex: number, data: any) => boolean | undefined = () => true; // 可選擇(條件)
  // Header(左) 相關
  @Input() showDelete = true;                 // 是否顯示 刪除按鈕
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  // 刪除前的非同步守衛：回傳 false 則中止刪除（由守衛自行提示訊息）
  @Input() beforeDelete?: (rows: any[]) => Observable<boolean>;
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
  protected _calculatedFooterData: any = {}; // 用於儲存計算結果
  @Input() footerSummaryLabel = '總計'; // 新增：Footer 摘要行的標籤名稱
  @Input() showFooter = false;
  @Input() scrollable = false; // 是否要滾輪
  /** 大量列時與 scrollable 併用以僅渲染可視列（本機 FIN53010 明細表可選用） */
  @Input() virtualScroll = false;
  @Input() virtualScrollItemSize: number | undefined = undefined;
  @Input() showPaginator = false; // 是否顯示 分頁器

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
    // 2. 呼叫 Service 進行「該欄位」引發的計算與狀態更新
    const { shouldInsertNewRow, cleanData } = this.dataService.updateRowOnValueChange(
      rowData, value, col, index,
      this.columns, this.dataKey, this.dataStatusField, this.dataStatusValue,
      this.keepDeletedData, this.canInsert, this.rowValidate, this.defaultInsertData
    );
    // 3. 執行驗證 (計算完後驗證才準確)
    this.validationService.validateField(rowData, col, value, this._tableData);
    // 確保空表時也能插入新增行（這是舊邏輯，保持在 Component 端）
    if (this._tableData.length === 0 && this.canInsert) {
      this.insertRow();
    }

    // 觸發 fieldChange 事件
    this.fieldChange.emit({ rowData, field: col.field, value, index });
    this._calculatedFooterData = this.calculateFooterData(); // 新增
    // 發射 cleanData 給父層
    this.dataChange.emit(cleanData);
    this.cdr.markForCheck();
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.disabled) { return; }

    // 檢查是否有選中的項目
    if (!selectedItems || selectedItems.length === 0) {
      return;
    }

    // 實際執行刪除
    const doDelete = () => {
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
    };

    // 顯示確認對話框
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        // 有守衛時先檢查（例：立帳已被沖帳不可刪），回 false 則中止
        if (this.beforeDelete) {
          this.beforeDelete(selectedItems).pipe(take(1)).subscribe(ok => {
            if (ok) doDelete();
            this.cdr.markForCheck();
          });
          return;
        }
        doDelete();
      }
    });
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
      disabled: this.disabled || !!rowData?.isPOS4023,
      onValueChange: this.onValueChange.bind(this),
    };
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

  // ===== 點擊才編輯（Excel 式）：大筆數表格避免一次建立數千個編輯元件 =====
  /** 開啟後，有 type 的格子平常顯示純文字，雙擊該格才實體化編輯元件（每張表同時最多一格是重量級元件）。 */
  @Input() cellEditOnClick = false;
  /** 目前正在編輯的格子（dataKey 值 + 欄位）；null = 沒有任何格在編輯。 */
  private activeCell: { key: unknown; field: string; } | null = null;

  /** 該格此刻是否要渲染「編輯元件」（否則渲染純文字）。 */
  public isCellEditing(rowData: any, col: EditColumn): boolean {
    if (!this.cellEditOnClick) return true;              // 模式關閉：維持原本一律可編輯
    if (rowData?._isAutoInsertCandidate) return true;    // 新增候選列直接可編輯，維持原新增體驗
    return this.activeCell?.key === rowData?.[this.dataKey] && this.activeCell?.field === col.field;
  }

  /** 該格是否為禁用（唯讀）欄位——禁用格永遠只顯示文字，不進入編輯。 */
  public isCellDisabled(rowData: any, col: EditColumn): boolean {
    if (this.disabled || !!rowData?.isPOS4023) return true;
    if (typeof col.disabled === 'function') return !!col.disabled(rowData?.[col.field], undefined, rowData);
    return false;
  }

  /** 單擊格子 → 進入編輯並自動聚焦/展開（體感接近「本來就開著」，但同時最多一格是重量級元件）。 */
  public onCellClick(rowData: any, col: EditColumn, rowIndex: number, event: MouseEvent): void {
    if (col.type) event.stopPropagation();
    if (!this.cellEditOnClick || !col.type) return;
    if (this.isCellDisabled(rowData, col)) return;
    const alreadyEditing = this.activeCell?.key === rowData?.[this.dataKey] && this.activeCell?.field === col.field;
    if (alreadyEditing) return; // 已在編輯 → 讓這次點擊直接落到元件上
    const td = event.currentTarget as HTMLElement;
    this.activeCell = { key: rowData?.[this.dataKey], field: col.field };
    this.cdr.detectChanges();
    setTimeout(() => this.focusCellEditor(td)); // render 後聚焦：輸入框直接可打字、下拉自動展開
  }

  /** 雙擊格子 → 觸發該欄的 onDblClick（如挑發票 dialog），並確保已進入編輯。 */
  public onCellDblClick(rowData: any, col: EditColumn, rowIndex: number): void {
    if (!this.cellEditOnClick || !col.type || !col.onDblClick) return;
    if (this.isCellDisabled(rowData, col)) return;
    this.activeCell = { key: rowData?.[this.dataKey], field: col.field };
    col.onDblClick(rowData, rowData?.[col.field], col, rowIndex);
    this.cdr.detectChanges();
  }

  /** 進入編輯後把焦點放進該格的編輯元件：有輸入框就 focus（可直接打字/日曆自動開），純下拉就展開。 */
  private focusCellEditor(td: HTMLElement): void {
    const input = td.querySelector('input, textarea') as HTMLElement | null;
    if (input) { input.focus(); return; }
    const dropdown = td.querySelector('.p-dropdown') as HTMLElement | null;
    dropdown?.click();
  }

  /** 純文字狀態要顯示的內容：下拉反查 label、日期格式化、template 用顯示欄位，其餘用 format/原值。 */
  public displayText(rowData: any, col: EditColumn, rowIndex: number): string {
    const value = rowData?.[col.field];
    if (col.format) { const r = col.format(value, rowIndex, rowData); return r == null ? '' : String(r); }
    if (value === null || value === undefined || value === '') return '';
    switch (col.type) {
      case 'dropdown': {
        const opts = typeof col.options === 'function' ? col.options(rowData) : col.options;
        if (!Array.isArray(opts)) return String(value);
        const vKey = col.optionValue ?? 'value';
        const lKey = col.optionLabel ?? 'label';
        const found = opts.find((o: any) => String(o?.[vKey]) === String(value));
        return found ? String(found[lKey] ?? value) : String(value);
      }
      case 'template':
        return String(rowData?.[col.templateDisplayField ?? col.field] ?? value);
      case 'date': {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return String(value);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        // 依 view 決定精度：月檢視（申報年月等）只到年月，避免多帶「日」；年檢視只到年。
        if (col.view === 'month') return `${y}/${m}`;
        if (col.view === 'year') return String(y);
        return `${y}/${m}/${String(d.getDate()).padStart(2, '0')}`;
      }
      default:
        return String(value);
    }
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
   * 非群組表頭序號欄 colspan（與 thead 一致；無 checkbox 時以序號佔滿原 checkbox 欄位寬）
   */
  protected get serialThColspan(): number {
    return this.canInsert && !this.disabled && this._tableData.length > 0
      && this._tableData[this._tableData.length - 1]._isAutoInsertCandidate && !this.showCheckBox
      ? 2
      : 1;
  }

  /**
   * body 序號欄 colspan：與表頭／checkbox 合併列一致
   */
  protected serialTdColspan(rowData: any): number {
    if (rowData._isAutoInsertCandidate && this.data.length && this.showCheckBox) {
      return 2;
    }
    if (!this.columnGroup?.length && this.serialThColspan === 2) {
      return 2;
    }
    return 1;
  }

  /**
 * 計算總計行第一個 td 應該合併的欄位數量 (colspan)
 * @returns 合併的欄位數
 */
  calculateFooterColspan(): number {
    let baseColspan = 1;// 基礎合併數：序號欄位 (1)
    if (!this.columnGroup?.length && this.serialThColspan === 2) {
      baseColspan++;// 序號佔 2 欄（無獨立 checkbox 欄）
    }
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
}
