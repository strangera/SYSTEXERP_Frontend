/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { TableUtilityService } from '@shared/componentkit/table/table-utility.service';
import { AddButton, Column, ColumnGroup, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { PrimeTemplate } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableRowReorderEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, finalize, fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-fin55030-table-subheader',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    TableModule,
    PrimeTemplate,
    MultiSelectModule,
    TooltipModule,
    FormsModule,
    Button,
    FileUploadModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    SkeletonModule,
    AutoCompleteModule,
    ImageModule,
    TableCaptionComponent,
  ],
  templateUrl: './fin55030-table-subheader.component.html',
  styleUrl: './fin55030-table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Fin55030TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges, AfterViewInit {
  /** 自訂群組表頭顯示 template */
  @Input() groupHeaderTemplate?: TemplateRef<any>;
  /** table 元件 */
  @ViewChild('dt', { static: false }) dt!: Table;
  // 基本設置
  /** table 資料key @default 'ID' */
  @Input() dataKey = 'ID';
  /** table 唯一標識 (必填) @default undefined */
  @Input() tableKey: string | undefined = undefined;
  /** table 標題 @default undefined */
  @Input() title: string | undefined = undefined;
  /** table 欄位配置 (必填) */
  @Input() columns!: Column[];
  /** table 原始欄位 */
  originalColumns!: Column[];
  /** table 預設顯示欄位 */
  selectedColumns!: Column[];
  /** table 資料 (必填) @default [] */
  @Input() data: any[] = [];
  /** table 資料改變 (事件) */
  @Output() dataChange = new EventEmitter<any[]>();
  /** 是否顯示 loading @default false */
  @Input() loading = false;
  // --- 分頁 & 虛擬滾動新增 ---
  @Input() lastQueryBody?: any;
  @Input() queryFunction: ((body: any) => Observable<any>) | null = null;
  public _loading = false;
  virtualData: any[] = [];

  trackByFn = (index: number, item: any) => {
    return this.dataKey ? item?.[this.dataKey] : index;
  };

  // select 選擇Row相關
  /** 資料點選(事件) */
  @Output() itemClick = new EventEmitter<any>();
  /** 資料重新排序(事件) */
  @Output() rowReorder = new EventEmitter<TableRowReorderEvent>();

  // Header 相關
  /** 是否顯示 Caption @default true */
  @Input() showCaption = true;

  // Header(左)
  /** 是否顯示 Header @default true */
  @Input() showHeader = true;
  /** 是否顯示 Filter @default true */
  @Input() showFilter = true;
  /** 是否顯示 下拉選單分頁器 @default true */
  @Input() showPage = true;
  /** 欄位群組 */
  @Input() columnGroup?: ColumnGroup[];
  // 資料小計
  /** table 群組資料 @default '' */
  @Input() groupRowsBy = '';
  // 群組依據欄位名稱
  @Input() groupRowsByName = '';
  // 是否顯示群組表頭
  @Input() showGroupheader = true;
  /** 用於緩存已分組的數據 @default new Map() */
  groupedDataCache = new Map();
  /** 是否顯示群組小計 @default false */
  @Input() showSubTotal = false;
  /** 群組小計顯示文字，預設 '小計' */
  @Input() subtotalLabel = '小計';
  /** 群組表頭小計欄位設定，預設使用 ACP_Amt / PayAmt / NotPayAmt */
  @Input() subTotalGroupHeaders: { field: string; label: string }[] = [
    { field: 'ACP_Amt', label: '廠商立帳合計' },
    { field: 'PayAmt', label: '廠商沖銷合計' },
    { field: 'NotPayAmt', label: '廠商未沖銷合計' },
  ];
  groupTotals: Record<string, Record<string, number>> = {};
  // 群組 Footer 科目餘額
  /** 是否顯示群組 Footer（科目餘額列）@default false */
  @Input() showGroupFooter = false;
  /** 群組 Footer 顯示標籤 @default '科目餘額' */
  @Input() groupFooterLabel = '科目餘額';
  /** ACCDC 對照表，key = groupRowsBy 的值，value = '借方' 或 '貸方' @default {} */
  @Input() accdcMap: Record<string, string> = {};
  // 資料總計
  /** 是否顯示總計 @default false */
  @Input() showTotal = false;
  /** 「總計」文字顯示在哪個欄位（field）；不設定則顯示在序號欄 */
  @Input() totalLabelColumn?: string;
  /** 依此欄位值（去除首字前綴）做交替色區隔，例如 'PTA' */
  @Input() ptaGroupByField?: string;
  private _ptaGroupIndices: number[] = [];

  private recomputePTAGroups() {
    if (!this.ptaGroupByField || !this.data.length) {
      this._ptaGroupIndices = [];
      return;
    }
    // 計算每個 base PTA 的筆數，只有多筆才做交替色
    const getPTABase = (raw: string) => {
      const withoutPrefix = raw.length > 1 ? raw.substring(1) : raw;
      const lastHyphen = withoutPrefix.lastIndexOf('-');
      return lastHyphen > 0 ? withoutPrefix.substring(0, lastHyphen) : withoutPrefix;
    };
    const groupCounts = new Map<string, number>();
    for (const row of this.data) {
      const key = getPTABase(row[this.ptaGroupByField] as string ?? '');
      groupCounts.set(key, (groupCounts.get(key) ?? 0) + 1);
    }

    const indices: number[] = [];
    let groupIdx = 0;
    let prevKey = '';
    for (let i = 0; i < this.data.length; i++) {
      const raw = this.data[i]?.[this.ptaGroupByField] as string ?? '';
      const key = getPTABase(raw);
      if (i > 0 && key !== prevKey && (groupCounts.get(key) ?? 0) > 1) {
        groupIdx = (groupIdx + 1) % 2;
      }
      // 只有多筆組才標記顏色
      indices[i] = (groupCounts.get(key) ?? 0) > 1 ? groupIdx : -1;
      prevKey = key;
    }
    this._ptaGroupIndices = indices;
  }

  getPTAGroupClass(rowIndex: number): string {
    if (!this.ptaGroupByField) return '';
    const idx = this._ptaGroupIndices[rowIndex];
    return idx === 0 ? 'pta-group-0' : idx === 1 ? 'pta-group-alt' : '';
  }
  // 管理 欄位
  /** 是否顯示 管理欄位 @default true */
  @Input() showManage = true;
  /** 是否顯示 管理欄位(明細按鈕) @default true */
  @Input() showDetail = true;
  /** 明細事件 */
  @Output() detail = new EventEmitter<any>();
  @Output() detailWithColValue = new EventEmitter<{ row: any, col: Column, value: any }>();
  /** 是否顯示 管理欄位(編輯按鈕) @default true */
  @Input() showEdit = true;
  /** Row禁止編輯條件 @default () => false */
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  /** 編輯事件 */
  @Output() edit = new EventEmitter<any>();
  /** 自定義 管理按鈕 @default [] */
  @Input() addButton: AddButton[] = [];
  /** 按鈕們 loading @default false */
  @Input() buttonsLoading = false;

  // select 選擇Row相關（支援外部勾選與 selection 綁定）
  @Input() showCheckBox = false;
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';
  @Input() selectedItems: any[] = [];
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectedItemsChange = new EventEmitter<any>();
  // body
  /** 是否顯示 排序欄位 @default false */
  @Input() showReorder = false;
  // Footer
  /** 是否顯示 Footer @default false */
  @Input() showFooter = false;
  /** 記錄總數 @default 0 */
  @Input() totalRecords = 0;
  /** 共幾頁數 @default 0 */
  totalPages = 0;
  /** 每頁顯示的行數 @default 30 */
  @Input() rows = 30;
  /** 當前表格的起始索引 @default 0 */
  first = 0;
  /** (右上)下拉選單 頁數選項 @default [] */
  pages: { label: string, value: number; }[] = [];
  /** (右上)下拉選單 當前選擇的頁數 @default 1 */
  selectedPage: number | null = 1;
  /** 是否啟用 Lazy 加載 @default false */
  @Input() lazy = true;
  /** Lazy 加載事件 */
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  /** 是否啟用 PrimeNG virtualScroll，預設啟用（與 groupRowsBy 搭配） */
  @Input() enableVirtualScroll = true;

  // 其他
  /** table 無資料時顯示文字 @default '查無資料' */
  @Input() emptyMessage = '查無資料';

  @Input() fullData: any[] = [];  // << 新增：全部資料
  @Input() lazyBatchSize = 30;
  /** 後端回傳的群組/總計資料 (例如 totalData) */
  @Input() totalData: any[] = [];
  /** 若為 true，會在每次從後端載入分頁時，過濾掉可能為「頁尾總計」之列（例如 VendorNo === 'TOTAL' 或 VendorName === '總計'） */
  @Input() skipPageTotalRows = false;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly tableUtilityService: TableUtilityService,
    private readonly cd: ChangeDetectorRef,
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lazyBatchSize']) {
      this.rows = this.lazyBatchSize;
    }

    if (changes['data']) {
      this.virtualData = [...this.data];
      this.recomputePTAGroups();

      console.log('[ngOnChanges] data 改變', {
        dataLength: this.data.length,
        virtualDataLength: this.virtualData.length,
        totalRecords: this.totalRecords,
        fullDataLength: this.fullData.length,
        rows: this.rows,
        lazyBatchSize: this.lazyBatchSize
      });

      if (this.dt) {
        // totalRecords 正常更新
        this.dt.totalRecords = this.totalRecords;
        this.dt.rows = this.lazyBatchSize;
      }
      this.cd.detectChanges();
    }

    // 如果 parent 更新 fullData，但沒有同步 data，則用 fullData 初始化 data（僅在 data 為空時）
    if (changes['fullData']) {
      console.log('[ngOnChanges] fullData 改變', { fullDataLength: this.fullData?.length });
      if (this.fullData && this.fullData.length) {
        // deterministic sort to avoid random order between requests when backend returns unsorted data
        this.sortFullDataIfNeeded();
        if ((!this.data || this.data.length === 0)) {
          const batch = this.lazyBatchSize || (this.lastQueryBody?.pageSize) || 30;
          this.data = this.fullData.slice(0, batch);
          this.virtualData = [...this.data];
          this.totalRecords = this.totalRecords || this.fullData.length;
          console.log('[ngOnChanges] 使用 fullData 初始化 data', { initLength: this.data.length });
          this.dataChange.emit(this.data);
          if (this.dt) {
            this.dt.totalRecords = this.totalRecords;
            this.dt.rows = batch;
          }
          this.cd.detectChanges();
        }
      }
    }

    if (changes['columns'] && this.columns.length > 0) {
      this.originalColumns = [...this.columns];
      this.selectedColumns = this.columns.filter(c => !c.hidden);

      this.showSubTotal = this.showSubTotal || this.columns.some(c => c.isSubTotal);
      this.showTotal = this.showTotal || this.columns.some(c => c.isTotal);
    }
  }

  // 資料勾選
  onSelectionChange(event: any) {
    const selected = Array.isArray(event) ? event : event ? [event] : [];
    this.selectedItems = selected.filter((item: any) => this.isRowSelectable(item));
    this.selectionChange.emit(this.selectedItems);
    this.selectedItemsChange.emit(this.selectedItems);
  }

  loadMoreData() {
    console.log('[loadMoreData] 開始載入更多資料', {
      dataLength: this.data.length,
      fullDataLength: this.fullData.length,
      totalRecords: this.totalRecords,
      lazyBatchSize: this.lazyBatchSize
    });

    // 判斷是「一頁式載入模式」
    const isLocalMode = !this.queryFunction;

    // 一頁式模式：資料全部在 fullData
    if (isLocalMode) {
      const batch = this.lastQueryBody?.pageSize || this.lazyBatchSize || 30;
      const currentLength = this.data.length;
      const next = currentLength + batch;

      const more = this.fullData.slice(currentLength, next);

      console.log('[loadMoreData] 本地模式載入', {
        batch,
        currentLength,
        next,
        moreLength: more.length
      });

      if (more.length) {
        this.data = [...this.data, ...more];
        this.virtualData = this.data;
        this.dataChange.emit(this.data);
        console.log('[loadMoreData] 資料已更新', { newDataLength: this.data.length });
      }

      return;
    }

    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // API 分頁模式（queryFunction 存在）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

    if (
      this._loading ||
      !this.lastQueryBody ||
      this.data.length >= this.totalRecords
    ) {
      return;
    }

    const pageSize = this.lastQueryBody.pageSize || 30;

    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize
    };

    this._loading = true;

    // 使用 queryFunction!：你已保證不會是 null
    this.queryFunction!(body)
      .pipe(finalize(() => (this._loading = false)))
      .subscribe((res) => {
        if (res?.Data?.length) {
          let incoming = res.Data as any[];
          if (this.skipPageTotalRows) {
            incoming = incoming.filter(r => {
              try {
                const vals = Object.values(r || {});
                for (const v of vals) {
                  if (v === 'TOTAL' || v === '總計') return false;
                  if (typeof v === 'string' && v.trim().toUpperCase() === 'TOTAL') return false;
                }
              } catch (e) {
                // ignore and keep row
              }
              return true;
            });
          }

          if (incoming.length) {
            this.data = [...this.data, ...incoming];
            this.virtualData = this.data;
            this.totalRecords = res.TotalCount || this.totalRecords;
            this.dataChange.emit(this.data);
          }
        }
      });
  }

  /** 增量更新小計 */
  updateGroupTotals(newData: any[]) {
    if (!this.showSubTotal || !this.groupRowsBy) return;

    const groupField = this.groupRowsBy;

    newData.forEach(row => {
      const groupKey = String(row[groupField] ?? '').trim();
      if (!groupKey) return;

      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const val = Number(row[col.field]) || 0;
          this.groupTotals[groupKey][col.field] =
            (this.groupTotals[groupKey][col.field] || 0) + val;
        }
      });
    });
  }
  onScroll(event: any) {
    // API 模式
    if (this.queryFunction) {
      if (this.data.length >= this.totalRecords) return;
    }
    // 一頁式模式（fullData 模式）
    else {
      if (this.data.length >= this.fullData.length) {
        console.log('[onScroll] 已載入所有資料，不再載入');
        return;
      }
    }

    if (event?.originalEvent?.target) {
      const target = event.originalEvent.target;
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      console.log('[onScroll] 滾動事件', { scrollBottom, scrollHeight: target.scrollHeight, scrollTop: target.scrollTop, clientHeight: target.clientHeight });

      if (scrollBottom <= 2) {
        console.log('[onScroll] 接近底部，觸發載入更多');
        this.loadMoreData();
      }
    }

    this.cd.detectChanges();
  }
  onSort(event: any) {
    if (!this.queryFunction || !this.lastQueryBody) return;

    const pageSize = this.lastQueryBody.pageSize || 30;

    const body = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: event.multiSortMeta ?? []
    };

    this.loading = true;

    this.queryFunction(body)
      .pipe(finalize(() => {
        this.loading = false;
        this._loading = false;
      }))
      .subscribe(res => {
        if (res?.Data) {
          this.data = res.Data;
          this.virtualData = this.data;
          this.totalRecords = res.TotalCount;
          if (this.dt) {
            this.dt.virtualScroll = res.Data.length >= pageSize;
          }
        }
      });
  }


  // 視窗大小變化時重新計算表格寬度
  ngAfterViewInit() {
    fromEvent(globalThis, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.cd.detectChanges();
      });

    // 手動監聽表格的滾動事件（嘗試多個 selector，兼容不同 PrimeNG 版本）
    setTimeout(() => {
      if (this.dt?.el?.nativeElement) {
        const selectors = [
          '.p-datatable-scrollable-body',
          '.p-datatable-scrollable-body-wrapper',
          '.p-datatable-wrapper',
          '.p-datatable-scrollable-view',
          '.p-datatable-scrollable-body-table'
        ];

        const elements: any[] = [];
        for (const s of selectors) {
          const nodeList = this.dt.el.nativeElement.querySelectorAll(s);
          if (nodeList && nodeList.length) {
            nodeList.forEach((n: any) => elements.push({ el: n, selector: s }));
          }
        }

        // 若找不到預設 selector，嘗試尋找可滾動的子元素
        if (elements.length === 0) {
          const all = this.dt.el.nativeElement.querySelectorAll('*');
          all.forEach((n: any) => {
            try {
              const style = globalThis.getComputedStyle(n);
              if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && n.clientHeight > 0) {
                elements.push({ el: n, selector: 'computed-overflow' });
              }
            } catch (e) {
              // ignore
            }
          });
        }

        if (elements.length) {
          console.log('[ngAfterViewInit] 找到滾動容器數量=', elements.length);
          elements.forEach(({ el, selector }: any, idx: number) => {
            fromEvent(el, 'scroll')
              .pipe(debounceTime(100))
              .subscribe((event: any) => {
                const target = event.target;
                const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

                console.log('[滾動監聽] 滾動狀態', {
                  idx,
                  selector,
                  scrollBottom,
                  scrollHeight: target.scrollHeight,
                  scrollTop: target.scrollTop,
                  clientHeight: target.clientHeight,
                  dataLength: this.data.length,
                  fullDataLength: this.fullData.length
                });

                if (scrollBottom <= 50 && !this._loading) {
                  const hasMoreData = this.queryFunction
                    ? this.data.length < this.totalRecords
                    : this.data.length < this.fullData.length;

                  if (hasMoreData) {
                    console.log('[滾動監聽] 觸發載入更多資料 (idx=' + idx + ', selector=' + selector + ')');
                    this.loadMoreData();
                  }
                }
              });
          });
        } else {
          console.warn('[ngAfterViewInit] 找不到滾動容器（含 computed overflow 探測）');
        }
      }
    }, 500);

    // 監聽整頁滾動（處理使用者在整頁滾動而非 table 內部滾動的情況）
    fromEvent(globalThis, 'scroll')
      .pipe(debounceTime(150))
      .subscribe(() => {
        try {
          const tableEl = this.dt?.el?.nativeElement as HTMLElement | undefined;
          if (!tableEl) return;

          const rect = tableEl.getBoundingClientRect();
          const threshold = 200; // 距離視窗底部 threshold

          console.log('[globalThis scroll] table rect', { top: rect.top, bottom: rect.bottom, innerHeight: globalThis.innerHeight });

          // 如果 table 的底部接近或低於視窗底部，嘗試載入更多
          if (rect.bottom <= globalThis.innerHeight + threshold && rect.top < globalThis.innerHeight) {
            if (this._loading) return;
            const hasMoreData = this.queryFunction ? (this.data.length < this.totalRecords) : (this.data.length < this.fullData.length);
            if (hasMoreData) {
              console.log('[globalThis scroll] 接近 table 底部，觸發載入更多資料');
              this.loadMoreData();
            }
          }
        } catch (e) {
          // ignore
        }
      });
  }
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };

  get getVisibleHeaderCount(): number {
    let count = 0;
    if (!this.showSubTotal && this.data.length && this.showReorder) {
      count += 1;
    }
    // 序號欄
    count += 1;
    // 勾選欄
    if (this.showCheckBox && this.selectionMode === 'multiple') {
      count += 1;
    }
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    count += visibleColumnCount;
    if (this.showManage) count += 1;

    return count;
  }

  // 過濾欄位記錄保存
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  // Edit 按鈕 事件
  editRow(rowData: any) { this.edit.emit(rowData); }

  // Detail 或 雙擊行 事件
  detailRow(rowData: any, col?: Column, value?: any) {
    if (col && value) {
      this.detailWithColValue.emit({ row: rowData, col, value });
    }
    this.detail.emit(rowData);
  }

  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return this.tableUtilityService.getColumnSpan(columns, groupField);
  }

  // 取得沒有分組的欄位
  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    return this.tableUtilityService.getUngroupedColumns(columns, columnGroup);
  }

  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    return this.tableUtilityService.shouldRenderGroupHeader(col, index, columns);
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

  // 分組總計
  getGroupSubtotal(groupValue: any, field: string): number {
    // 優先使用後端傳來的 totalData（若有）
    try {
      if (this.totalData && this.totalData.length) {
        const keyCandidates = [
          `${field}_Subtotal`,
          `${field}Subtotal`,
          `${field.replace(/Amt$/, 'Amy')}_Subtotal`,
          `${field.replace(/Amt$/, 'Amy')}Subtotal`
        ];

        const entry = this.totalData.find(td => String(td?.VendorNo ?? '') === String(groupValue ?? ''));
        if (entry) {
          for (const k of keyCandidates) {
            if (k in entry) {
              return Number(entry[k]) || 0;
            }
          }
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // fallback: 計算目前 data 的小計
    return this.tableUtilityService.getGroupSubtotal(this.data, this.groupRowsBy, groupValue, field);
  }

  /**
   * 依 ACCDC 計算群組科目餘額，回傳 { debit, credit }。
   * 若 ACCDC='借方'：net = PTA1 - PTA2；net>0→借方，net<0→貸方(正值)
   * 若 ACCDC='貸方'：net = PTA2 - PTA1；net>0→貸方，net<0→借方(正值)
   * Fallback（無 ACCDC）：以符號判斷
   */
  getGroupNetBalance(groupValue: string): { debit: number; credit: number } {
    const pta1 = this.getGroupSubtotal(groupValue, 'PTA1');
    const pta2 = this.getGroupSubtotal(groupValue, 'PTA2');
    // DB 值：'D' = 借方, 'C' = 貸方；fallback 用符號判斷
    const accdc = this.accdcMap[groupValue] ?? (pta1 >= pta2 ? 'D' : 'C');

    if (accdc === 'D') {
      // 借方科目：net = 借 - 貸
      const net = pta1 - pta2;
      return net >= 0
        ? { debit: net, credit: 0 }
        : { debit: 0, credit: -net };
    } else {
      // 貸方科目：net = 貸 - 借
      const net = pta2 - pta1;
      return net >= 0
        ? { debit: 0, credit: net }
        : { debit: -net, credit: 0 };
    }
  }

  // 全表總計
  getTotal(field: string): number {
    // 優先使用後端傳來的總計（VendorNo === '' 為全表總計）
    try {
      if (this.totalData && this.totalData.length) {
        const totalEntry = this.totalData.find(td => (td?.VendorNo ?? '') === '');
        if (totalEntry) {
          const keyCandidates = [
            `${field}_Total`,
            `${field}Total`,
            `${field.replace(/Amt$/, 'Amy')}_Total`,
            `${field.replace(/Amt$/, 'Amy')}Total`
          ];
          for (const k of keyCandidates) {
            if (k in totalEntry) {
              return Number(totalEntry[k]) || 0;
            }
          }
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    return this.tableUtilityService.getTotal(this.data, field);
  }
  // 計算單一 ACP_No 的未沖餘額小計（優先用 fullData，fallback 到 data）
  getACPSubtotal(acpNo: string): number {
    try {
      const source = (this.fullData && this.fullData.length) ? this.fullData : this.data;
      return (source || [])
        .filter(d => String(d?.ACP_No ?? '') === String(acpNo ?? ''))
        .reduce((s, r) => s + (Number(r?.NotPayAmy ?? r?.NotPayAmy === 0 ? r.NotPayAmy : 0) || 0), 0);
    } catch (e) {
      return 0;
    }
  }
  // 若 fullData 存在且沒有後端排序要求，對 fullData 做 deterministic sort
  private sortFullDataIfNeeded() {
    try {
      const groupField = this.groupRowsBy || 'VendorNo';
      // 印出前 5 筆原始樣本供 debug
      try {
        const sampleBefore = (this.fullData || []).slice(0, 5).map((r: any) => ({ ACP_No: r?.ACP_No, VendorNo: r?.VendorNo }));
        console.log('[sortFullDataIfNeeded] fullData sample BEFORE sort', sampleBefore);
      } catch (e) { /* ignore */ }

      // 使用穩定排序（強制排序，忽略 server SortBy），把 index 當作最後的 tiebreaker
      const mapped = this.fullData.map((item: any, idx: number) => ({ item, idx }));
      mapped.sort((x: any, y: any) => {
        const a = x.item;
        const b = y.item;
        const ga = String(a?.[groupField] ?? '').localeCompare(String(b?.[groupField] ?? ''));
        if (ga !== 0) return ga;
        const pa = a?.PostDate ? new Date(a.PostDate).getTime() : 0;
        const pb = b?.PostDate ? new Date(b.PostDate).getTime() : 0;
        if (pa !== pb) return pa - pb;
        const aa = String(a?.ACP_No ?? '');
        const ab = String(b?.ACP_No ?? '');
        const ca = aa.localeCompare(ab);
        if (ca !== 0) return ca;
        return x.idx - y.idx;
      });
      this.fullData = mapped.map(m => m.item);

      try {
        const sampleAfter = (this.fullData || []).slice(0, 5).map((r: any) => ({ ACP_No: r?.ACP_No, VendorNo: r?.VendorNo }));
        console.log('[sortFullDataIfNeeded] fullData sample AFTER sort', sampleAfter);
      } catch (e) { /* ignore */ }
    } catch (e) {
      // ignore sort errors
      console.warn('[sortFullDataIfNeeded] 排序失敗', e);
    }
  }
  // 欄位調整
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  // 資料列重新排序
  onRowReorder(event: TableRowReorderEvent): void {
    this.rowReorder.emit(event);
  }
}
