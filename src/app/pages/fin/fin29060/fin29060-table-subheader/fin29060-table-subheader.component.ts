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
  selector: 'app-fin29060-table-subheader',
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
  templateUrl: './fin29060-table-subheader.component.html',
  styleUrl: './fin29060-table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Fin29060TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges, AfterViewInit {
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
  groupTotals: Record<string, Record<string, number>> = {};
  // 資料總計
  /** 是否顯示總計 @default false */
  @Input() showTotal = false;
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
  /** 每頁顯示的行數 @default 20 */
  @Input() rows = 20;
  /** 當前表格的起始索引 @default 0 */
  first = 0;
  /** (右上)下拉選單 頁數選項 @default [] */
  pages: { label: string, value: number; }[] = [];
  /** (右上)下拉選單 當前選擇的頁數 @default 1 */
  selectedPage: number | null = 1;
  /** 是否啟用 Lazy 加載 @default false */
  @Input() lazy = false;
  /** Lazy 加載事件 */
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  // 其他
  /** table 無資料時顯示文字 @default '查無資料' */
  @Input() emptyMessage = '查無資料';

  @Input() fullData: any[] = [];  // << 新增：全部資料
  @Input() lazyBatchSize = 30;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly tableUtilityService: TableUtilityService,
    private readonly cd: ChangeDetectorRef,
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.virtualData = [...this.data];

      if (this.dt) {
        // totalRecords 正常更新
        this.dt.totalRecords = this.totalRecords;
      }
      this.cd.detectChanges();
    }

    if (changes['columns'] && this.columns.length > 0) {
      this.originalColumns = [...this.columns];
      this.selectedColumns = this.columns.filter(c => !c.hidden);

      this.showSubTotal = this.showSubTotal || this.columns.some(c => c.isSubTotal);
      this.showTotal = this.showTotal || this.columns.some(c => c.isTotal);
    }
  }

  loadMoreData() {
    // 判斷是「一頁式載入模式」
    const isLocalMode = !this.queryFunction;

    // 一頁式模式：資料全部在 fullData（例如 FIN29060）
    if (isLocalMode) {
      const batch = this.lastQueryBody?.pageSize || this.lazyBatchSize || 30;
      const currentLength = this.data.length;
      const next = currentLength + batch;

      const more = this.fullData.slice(currentLength, next);

      if (more.length) {
        this.data = [...this.data, ...more];
        this.virtualData = this.data;
        this.dataChange.emit(this.data);
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
          this.data = [...this.data, ...res.Data];
          this.virtualData = this.data;
          this.totalRecords = res.TotalCount || this.totalRecords;
          this.dataChange.emit(this.data);
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
      if (this.data.length >= this.fullData.length) return;
    }

    if (event?.originalEvent?.target) {
      const target = event.originalEvent.target;
      if (target.scrollHeight - target.scrollTop - target.clientHeight <= 2) {
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
    fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.cd.detectChanges();
      });
  }
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };

  get getVisibleHeaderCount(): number {
    let count = 0;
    if (!this.showSubTotal && this.data.length && this.showReorder) {
      count += 1;
    }
    count += 1;
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
    return this.tableUtilityService.getGroupSubtotal(this.data, this.groupRowsBy, groupValue, field);
  }

  // 全表總計
  getTotal(field: string): number {
    return this.tableUtilityService.getTotal(this.data, field);
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
