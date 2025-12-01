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
import { debounceTime, fromEvent } from 'rxjs';

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
    Button, // 注意：Button 和 ButtonDirective 通常會被 ButtonModule 涵蓋
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

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly tableUtilityService: TableUtilityService,
    private readonly cd: ChangeDetectorRef,
  ) { super(); }

  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
      });
    }
    // 僅在 columns 首次被設定時執行初始化邏輯// 這樣就不會在每次 data 變動時都重置 filter 狀態
    if (changes['columns'] && this.columns.length > 0) {
      this.originalColumns = this.columns;
      this.showSubTotal = this.showSubTotal ? this.showSubTotal : this.columns.find(c => c.isSubTotal) !== undefined;
      this.showTotal = this.showTotal ? this.showTotal : this.columns.find(c => c.isTotal) !== undefined;
      if (changes['columns'].firstChange) {
        setTimeout(() => {// 恢復歷史紀錄，如果沒有就使用預設值
          this.rows = this.queryState.getQueryState(this.tableKey + 'rows')?.value ?? this.rows; // 取得分頁狀態
        }, 300);
      }
    }
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

  // 計算欄位總數(包含序號、勾選、管理)
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + visibleColumnCount + Number(this.showManage) + (this.showSubTotal || this.showTotal ? 0 : 1);
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
