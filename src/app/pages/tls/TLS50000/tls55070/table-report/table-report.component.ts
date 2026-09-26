/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableCaptionComponent } from '@others/component/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { BasicPrintDataComponent } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { TableReportUtilityService } from './table-report-utility.service';
import { AddButton, ColumnGroup, expandAnimation, ReportColumn, TableQueryPayload } from './table-report.model';

@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': 'tls55070' },
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandAnimation]
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('dt') public dt!: Table;
  @Input() lastQueryBody?: any;       // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;        // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];        // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];        // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  virtualData: any = [];
  @Input() lazy = true;
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];     // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  @Input() loading = false;
  public _loading = false;
  @Input() showReorder = true;
  // Checkbox 相關
  @Input() showCheckBox = false;
  @Input() tableHeaderCheckboxLabel?: string;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  /** 資料點選(事件) */
  @Output() itemClick = new EventEmitter<any>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) };
  @Input() isAllSelected = false;           // 是否全選
  @Output() dataChange = new EventEmitter<any[]>();  // 用來儲存查詢結果
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};/** 接收外部傳入的自定義模板物件，Key 為 field 名稱 */
  // Header 相關
  @Input() showCaption = true;            // 是否顯示 Caption
  @Input() showSort = true;              // 是否顯示 排序
  public get multiSortMeta() { // 暴露內部 p-table 的多重排序狀態
    return this.dt?.multiSortMeta || [];
  }
  @Input() allowMultilineHeader = false; // 是否允許標題使用 \n 換行
  // Header(左) 相關
  @Input() showFilter = true;      // 是否顯示 Filter
  @Input() showReportMode = true;    // 是否顯示 匯出按鈕
  @Input() customReport = false;    // 是否自訂報表
  @Input() pageOrientation: string | null = 'Landscape'; // PDF橫式
  @Input() pageSizeSetting: string | null = 'A4'; // PDF A4
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;     // 是否顯示刪除按鈕
  @Input() deleteDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止刪除條件
  // Header(右) 相關
  @Input() showExcel = false;      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;     // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;     // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;   // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;    // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];           // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;    // 是否顯示 管理欄位
  @Input() showDetail = true;    // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;     // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() detailDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止明細條件
  @Output() edit = new EventEmitter<any>(); // 編輯事件
  @Input() addButton: AddButton[] = [];  // 自定義 管理按鈕
  @Input() buttonsLoading = false;   // 按鈕們 loading
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() footerPercentData: any;     // (百分比)頁尾資料
  @Input() extraFooterData: any; // 額外的 footer 資料（可為 object 或 array），會顯示於 footer 區塊，不對應欄位
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  @Input() subTotalLabel = '小計'; // 小計列左側標籤文字
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  @Output() selectButton = new EventEmitter<any>();    // 選擇 按鈕事件
  @Input() showSummary = true; // 是否顯示 總計欄位
  @Input() footerLabel = '總計'; // 總計列左側標籤文字
  /** 多列 footer 時，每列第一欄顯示的欄位名（如 group_name）；未設則顯示 footerLabel */
  @Input() footerLabelField?: string;
  @Input() autoHeight = false; // 是否依資料高度自動撐開（不固定 450px）
  @Input() showFooterTotal = true; // 是否顯示第一列 footer 總計資料
  @Input() allowFooterHtml = false; // 是否允許 footer 使用 HTML 內嵌呈現（預設 false，避免影響既有頁面）
  // expansion 收合展開
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  @Input() expansionShowSort = true;
  @Input() expansionShowReorder = true;
  expandedRows: Record<string, boolean> = {};
  // 連結
  @Output() linkClick = new EventEmitter<{ rowData: any, field: string }>();

  // 底層匯出
  @Input() apiUrl?: string;                         // table API URL (可選)
  @Input() DataKeyName?: string;                    // table 資料key名稱 (可選)
  @Input() Conditions?: any;                         // table 條件 (可選)
  @Input() PrintRemark = true;                    // 是否列印備註 (可選)
  @Input() emptyMessage = '查無資料';               // 無資料時顯示訊息 (可選)
  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  /** 將 footerData 正規化為陣列，供 template 依序繪製多列 footer；單一物件時為 [footerData]。 */
  get footerRows(): any[] {
    if (this.footerData == null) return [];
    return Array.isArray(this.footerData) ? this.footerData : [this.footerData];
  }
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // 只有當資料真的從 API 回來（不論長度是多少）才顯示
      // 或者是根據你是否有 lastQueryBody 來判斷
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.isAllSelected = false;
      this.selectedItems = [];
      this.virtualData = [];
      this.groupTotals = {};
      this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
      // 不用虛擬捲動：列高不固定（商品名稱換行＋每單多一列小計）且有 rowspan 群組，
      // 固定 itemSize 會算錯總高度導致最後幾列捲不到（#1244）。資料本來就分頁載入，DOM 量可控。
      if (this.data.length !== 0) {
        if (this.dt) {
          setTimeout(() => {
            this.syncTableSortMeta();
          });
        }
        this.virtualData = this.data;
        this.cdr.detectChanges();
      }
    }
  }

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) {
      return;
    }

    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;

    // --- 關鍵修正：改用最後一筆資料的 PageRank 來推算頁碼 ---
    // 假設 PageRank 是從 1 開始的連續序號
    const lastPageRank = this.data.length > 0 ? (this.data[this.data.length - 1].PageRank || 0) : 0;

    // 如果最後一個單據序號已經達到總筆數，表示沒資料了，直接退出
    if (lastPageRank >= this.totalRecords && this.totalRecords !== 0) {
      return;
    }

    const nextPageIndex = Math.floor(lastPageRank / pageSize) + 1;

    const currentSort = this.dt?.multiSortMeta;
    const body = {
      ...this.lastQueryBody,
      pageIndex: nextPageIndex,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };

    this._loading = true;
    this.queryFunction(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this._loading = false)
      )
      .subscribe(res => {
        if (res && res.Data && res.Data.length > 0) {
          // 更新小計與資料
          this.updateGroupTotals(res.Data);
          this.data = [...this.data, ...res.Data];
          this.virtualData = this.data;

          this.syncTableSortMeta();
          this.dataChange.emit(this.data);
          this.cdr.detectChanges();

          // 更新總筆數（這裏的 TotalCount 通常是指單據總數）
          this.totalRecords = res.TotalCount || this.totalRecords;
        }
      });
  }
  onSort(event: any) {
    if (!this.lazy) {
      this.groupTotals = {};
      this.updateGroupTotals(this.data);
      this.cdr.detectChanges();
      return;
    }
    if (this._loading) return;

    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];
      this.dt.multiSortMeta = [lastSort];
    }
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;

    // 判斷是否需要重新查詢
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) {
      return;
    }
    this.lastQueryBody = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta
    };
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
      pageSize, // 使用 pageSize 變數
      SortBy: this.dt.multiSortMeta ?? undefined // 這裡現在只包含最新的單一排序
    };
    this.loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.hasSearched = true;
      if (res && res.Data && res.Data.length > 0) {
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(res.Data);
        this.data = res.Data;
        this.virtualData = this.data;
        this.syncTableSortMeta();
        this.cdr.detectChanges();
        this.selectedItems = [];
        this.dataChange.emit(this.data);
      }
    });
  }
  customSort(event: TableQueryPayload) {
    if (!event.multiSortMeta) return;

    // 1. 原地排序
    this.data.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta!) {
        const value1 = data1[sortMeta.field];
        const value2 = data2[sortMeta.field];
        let result = 0;
        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        else
          result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

        if (result !== 0) return sortMeta.order * result;
      }
      return 0;
    });

    // 2. 處理勾選參考 (這步很重要，維持高亮的 key)
    if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
    }

    // 3. 更新小計
    this.groupTotals = {};
    this.updateGroupTotals(this.data);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.dt) {
        this.dt.restoreState();
      }
      this.cdr.detectChanges();
    }, 0);
  }
  onLazyLoad() {
    if (this.isAllSelected) {
      this.selectedItems = this.data.filter(rowData => {
        const selectable = this.isRowSelectable(rowData);
        return selectable === undefined ? true : selectable;
      });
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(false);
    }
  }
  ngAfterViewInit() {
    // 未開虛擬捲動，改掛表格捲動容器的原生 scroll 事件觸發載入下一頁
    const wrapper: HTMLElement | undefined = this.dt?.wrapperViewChild?.nativeElement;
    if (!wrapper) return;
    wrapper.addEventListener('scroll', this.onScroll);
    this.destroyRef.onDestroy(() => wrapper.removeEventListener('scroll', this.onScroll));
  }

  onScroll(event: Event) {
    if (this._loading) return;

    if (this.lazy) {
      const target = event.target as HTMLElement;

      // 取得當前最後一筆的序號
      const lastPageRank = this.data.length > 0 ? (this.data[this.data.length - 1].PageRank || 0) : 0;

      // 判斷條件：
      // 1. 最後一個 PageRank 小於總單據數 (totalRecords)
      // 2. 滾動條接近底部
      if (lastPageRank < this.totalRecords) {
        if (target.scrollHeight - target.scrollTop - target.clientHeight <= 5) { // 稍微放寬到 5px 比較好觸發
          this.loadMoreData();
        }
      }
    } else {
      // 非 lazy 模式維持現狀...
      if (this.selectedItems && this.selectedItems.length > 0) {
        this.selectedItems = [...this.selectedItems];
        this.cdr.detectChanges();
      }
    }
    this.cdr.markForCheck();
  }
  // 1. 處理單一勾選變更 (在 HTML 中對應 selectionChange)
  onSelectionChange(event: any[]) {
    this.selectedItems = [...event];

    // 找出目前資料中真正「可以被勾選」的數量
    const selectableRows = this.data.filter(rowData => {
      const selectable = this.isRowSelectable(rowData);
      return selectable === undefined ? true : selectable;
    });
    // 如果已選數量 > 0 且等於可選總數，才亮起全選
    this.isAllSelected = selectableRows.length > 0 && this.selectedItems.length === selectableRows.length;

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }
  onSelectAllChange(event: TableSelectAllChangeEvent) {
    const checked = event.checked;

    if (checked) {
      // 過濾出可選的資料
      this.selectedItems = this.data.filter(rowData => {
        const selectable = this.isRowSelectable(rowData);
        return selectable === undefined ? true : selectable;
      });
      // 如果過濾完發現根本沒資料可選，則全選按鈕不應亮起
      this.isAllSelected = this.selectedItems.length > 0;
    } else {
      this.selectedItems = [];
      this.isAllSelected = false;
    }

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }

  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  /**
 * 檢查是否有任何欄位被配置為需要小計。
 * @returns 如果至少一個欄位有 subtotalField 屬性則回傳 true。
 */
  hasSubtotalColumns(): boolean {
    return this.columns.some(col => col.isSubTotal && this.groupRowsBy);
  }
  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) {
      return true; // 如果沒有分組或已經是最後一筆，則視為群組結尾。
    }
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }

  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    if (!this.groupRowsBy || !col.isSubTotal) {
      return '';
    }

    const rawGroupValue = rowData[this.groupRowsBy];
    let matchKey: string;

    // --- 關鍵修正：與計算邏輯對齊 ---
    if (rawGroupValue === null || rawGroupValue === undefined) {
      // 這裡要能對應到 updateGroupTotals 產生的 Key
      // 我們假設 PageRank 是唯一的識別
      matchKey = `NULL_GROUP_${rowData.PageRank}`;
    } else {
      const groupColumn = this.columns.find(c => c.field === this.groupRowsBy);
      if (groupColumn && groupColumn.format) {
        matchKey = String(groupColumn.format(rawGroupValue, 0, rowData) ?? '').trim();
      } else {
        matchKey = String(rawGroupValue).trim();
      }
    }

    // 優先查找外部 subTotalData，若無則用前端計算的 groupTotals
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;

    // 格式化輸出 (例如加上千分位)
    return col.format ? col.format(total, 0, rowData) : total;
  }

  // 對新載入的資料進行增量計算，並更新 groupTotals。
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }

    const groupColumn = this.columns.find(col => col.field === this.groupRowsBy);
    const useFormatterForGroupKey = groupColumn && groupColumn.format;

    newData.forEach((row, index) => {
      const rawValue = row[this.groupRowsBy!];
      let groupKey: string;

      // --- 關鍵修正：處理 null ---
      if (rawValue === null || rawValue === undefined) {
        // 如果單號是 null，我們用 PageRank 或 rowIndex 產生一個唯一的 Key
        // 確保「這一個 null 單據」的小計不會跟「下一個 null 單據」混淆
        groupKey = `NULL_GROUP_${row.PageRank || index}`;
      } else if (useFormatterForGroupKey) {
        groupKey = String(groupColumn!.format!(rawValue, index, row) ?? '').trim();
      } else {
        groupKey = String(rawValue).trim();
      }

      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const field = col.field;
          // 這裡確保加總是正確的數值
          const value = parseFloat(row[field]) || 0;
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
  /**
 * 將上次查詢的排序條件同步回 p-table 元件，確保 UI 狀態一致
 */
  private syncTableSortMeta() {
    // 確保 dt 已初始化且有排序資料
    if (!this.dt || !this.lastQueryBody?.SortBy) return;

    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];

    // 1. 同步資料
    this.dt.multiSortMeta = meta.map(m => ({
      field: m.field || m.Field,
      order: m.order || m.Order
    }));

    // 3. 核心：通知 TableService 排序已變動，這會讓 Header 的小箭頭亮起來
    // PrimeNG 內部是靠這個 Observable 來通知 Header 元件更新 UI
    setTimeout(() => {
      this.dt.tableService.onSort(this.dt.multiSortMeta || []);
      this.cdr.detectChanges();
    }, 0);
  }
  /** 確保分頁參數統一為小寫，避免 PascalCase 導致重複查詢或參數丟失 */
  private normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;

    // 移除可能干擾的小寫/大寫重複項，並統一回傳小寫
    const { PageSize, PageIndex, ...rest } = body;
    return { ...rest, pageSize, pageIndex };
  }

  getBtnLabel(btn: any, rowData: any): string {
    if (typeof btn.label === 'function') {
      return btn.label(rowData);
    }
    return btn.label;
  }
}
