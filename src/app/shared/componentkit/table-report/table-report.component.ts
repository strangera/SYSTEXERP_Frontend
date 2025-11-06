/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { AddButton, ReportColumn, ColumnGroup } from './table-report.model';
import { TableReportUtilityService } from './table-report-utility.service';
import { ImageModule } from 'primeng/image';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '../table/table-caption/table-caption.component';
import { FileSelectEvent } from 'primeng/fileupload';
import { ActivatedRoute } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TableExpansionComponent } from '../table/table-expansion/table-expansion.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { trigger, style, transition, animate } from '@angular/animations'; // 1. 引入動畫相關函式
@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [TableExpansionComponent, SkeletonModule, TableModule, NgFor, NgIf, NgClass, NgStyle, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' }))
      ])
    ])
  ]
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) lastQueryBody?: any;              // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;                // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];                // 用來儲存查詢結果
  virtualData: any = [];
  @Input() dataKey: string | undefined;                 // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];               // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];         // 用來儲存查詢結果
  @Input({ required: true }) queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  @Input() loading = false;
  @Input() firstLoading = false;
  @Input() apiUrl: string | undefined = undefined;
  // Checkbox 相關
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => {
    if (data) { return this.isRowSelectable(data); }
    return false; //
  };
  @Input() isAllSelected = false;                            // 是否全選
  @Output() dataChange = new EventEmitter<any[]>();               // 用來儲存查詢結果
  // Header 相關
  @Input() showCaption = true;                         // 是否顯示 Caption
  @Input() showSort = true;                           // 是否顯示 排序
  // Header(左) 相關
  @Input() showFilter = true;         // 是否顯示 Filter
  @Input() showReportMode = true;       // 是否顯示 匯出按鈕
  @Input() customReport = false;        // 是否自訂報表
  @Input() pageOrientation: string | null = 'Landscape'; // PDF橫式
  @Input() pageSizeSetting: string | null = 'A4'; // PDF A4
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;          // 是否顯示刪除按鈕
  // Header(右) 相關
  @Input() showExcel = false;           // 是否顯示 匯出Excel
  @Input() showExcelExport = true;         // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;         // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;     // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;       // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                     // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;        // 是否顯示 管理欄位
  @Input() showDetail = true;        // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;         // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>(); // 編輯事件
  @Input() addButton: AddButton[] = [];   // 自定義 管理按鈕
  @Input() buttonsLoading = false;      // 按鈕們 loading
  @Input() footerData: any;         // (總計)頁尾資料
  @Input() footerPercentData: any;         // (百分比)頁尾資料
  @Input() groupRowsBy?: string;       // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;        // (小計)頁尾資料
  @Output() selectButton = new EventEmitter<any>();       // 選擇 按鈕事件
  // expansion 收合展開
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  expandedRows: Record<string, boolean> = {};

  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.isAllSelected = false;
      // 取得 pageSize，若 lastQueryBody 或其 pageSize 不存在，則預設為 30
      const pageSize = this.lastQueryBody?.pageSize || 30;

      if (this.data.length !== 0) {
        this.virtualData = [];
        if (this.dt) {
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = '450px';
        }
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
        this.cdr.detectChanges();

        // 判斷是否開啟虛擬滾動：將 30 改為 pageSize
        if (this.data.length < pageSize) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
        this.selectedItems = [];
      } else {
        this.virtualData = [];
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
      }
    }
  }
  loadMoreData() {
    if (this.loading || !this.queryFunction || !this.lastQueryBody || this.data.length >= this.totalRecords) {
      return; // 如果正在載入、沒有查詢函式、沒有查詢條件或已載入全部資料，則退出
    }
    // 取得 pageSize，若 lastQueryBody 或其 pageSize 不存在，則預設為 30
    const pageSize = this.lastQueryBody?.pageSize || 30;

    const body = {
      ...this.lastQueryBody,
      // pageIndex 計算：將 30 改為 pageSize
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize: pageSize, // 使用 pageSize 變數
    };
    this.loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = Array.from({ length: this.data.length + res.Data.length });
        this.updateGroupTotals(res.Data);
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.dataChange.emit(this.data);
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || 0;
      }
    });
  }
  onSort(event: any) {
    if (this.loading) {
      return;
    }
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];
      this.dt.multiSortMeta = [lastSort];
    }
    // 取得 pageSize，若 lastQueryBody 或其 pageSize 不存在，則預設為 30
    const pageSize = this.lastQueryBody?.pageSize || 30;

    // 判斷是否需要重新查詢：將 30 改為 pageSize
    if (!this.queryFunction || !this.lastQueryBody || this.data.length < pageSize) {
      return;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
      pageSize: pageSize, // 使用 pageSize 變數
      SortBy: this.dt.multiSortMeta // 這裡現在只包含最新的單一排序
    };
    this.queryFunction(body).pipe(untilDestroyed(this)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = [];
        this.dt.virtualScroll = false;
        this.dt.scrollHeight = '450px';
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(res.Data);
        this.data = res.Data;
        this.cdr.detectChanges();

        // 判斷是否開啟虛擬滾動：將 30 改為 pageSize
        if (res.Data.length < pageSize) {
          this.data = res.Data;
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = '450px';
          this.virtualData = Array.from({ length: res.Data.length });
          this.data = res.Data;
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
        this.selectedItems = [];
      }
    });
  }
  onLazyLoad() {
    if (this.isAllSelected) {
      this.selectedItems = [...this.data];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    }
  }
  onScroll(event: any) {
    if (this.data.length >= this.totalRecords || this.data.length < 30) {
      this.virtualData = [...this.data]
      return;
    }
    if (event && event.originalEvent && event.originalEvent.target) {
      const target = event.originalEvent.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      const threshold = 2; // 容錯值可自行調整，通常 1-2 像素就足夠
      if (scrollHeight - scrollTop - clientHeight <= threshold) {
        this.loadMoreData();
      }
    }
    this.cdr.detectChanges();
  }
  onSelectAllChange(event: TableSelectAllChangeEvent) {
    this.isAllSelected = event.checked;
    if (this.isAllSelected) {
      this.selectedItems = [...this.data];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(false);
    }
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
      return ''; // 1. 基本檢查
    }
    if (this.subTotalData && this.subTotalData.length > 0 && this.groupRowsBy) {
      const groupKey = rowData[this.groupRowsBy];
      const field = col.field;
      const subtotalRow = this.subTotalData.find((item: any) => item[this.groupRowsBy as string] === groupKey);
      if (subtotalRow) {
        const subtotal = subtotalRow[field] ?? 0; // 使用 ?? 避免 undefined
        return col.format ? col.format(subtotal) : subtotal;
      }
    }

    const groupKey = rowData[this.groupRowsBy];
    const field = col.field;

    // 2. 從預先計算的結果中獲取總計
    const total = this.groupTotals[groupKey]?.[field] ?? 0;

    // 3. 應用格式化
    return col.format ? col.format(total) : total;
  }
  // 切換行展開
  toggleRowExpansion(rowData: any) {
    this.tableUtility.toggleRowExpansionLogic(rowData, this.dataKey ?? 'id', this.expansionDataKey, this.expansionLoadFn, this.expandedRows, this);
  }
  /**
 * 對新載入的資料進行增量計算，並更新 groupTotals。
 * @param newData 這次 API 呼叫新載入的資料陣列。
 */
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }
    newData.forEach(row => {
      const groupKey = (row[this.groupRowsBy!] as string)?.trim() ?? 'UNKNOWN_GROUP'; // 進行 trim 處理
      if (groupKey === undefined) return;
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }
      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const field = col.field;
          const value = Number(row[field]) || 0;
          // 增量加總
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
}
