/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
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

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [TableExpansionComponent, SkeletonModule, TableModule, NgFor, NgIf, NgClass, NgStyle, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input({ required: true }) lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;                               // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];                               // 用來儲存查詢結果
  @Input() dataKey: string | undefined;                                 // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];                              // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];                  // 用來儲存查詢結果
  @Input({ required: true }) queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() loading = false;
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  //
  @Input() apiUrl: string | undefined = undefined;
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Input() rowSelectableWrapper: (row: any) => boolean = () => true;
  // Header 相關
  @Input() showCaption = true;                                                  // 是否顯示 Caption
  @Input() showSort = true;                                                     // 是否顯示 排序
  // Header(左) 相關
  @Input() showHeader = true;                 // 是否顯示 Header
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() customReport = false;               // 是否自訂報表
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  @Input() showInsert = false;                // 是否顯示 Insert新增按鈕
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Input() deleteData = false;                // 預先刪除資料 (關聯：需要加入dataKey, dataChange)
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;                    // 是否顯示刪除按鈕
  @Input() deleteIcon = 'pi pi-trash';          // 刪除按鈕圖示
  @Input() deletepTooltip = '刪除';              // 刪除按鈕提示
  // Header(右) 相關
  @Input() showExcel = false;                      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                 // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;                 // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;         // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>();  // 編輯事件
  @Input() addButton: AddButton[] = [];      // 自定義 管理按鈕
  @Input() buttonsLoading = false;           // 按鈕們 loading
  @Input() footerData: any;                  // (總計)頁尾資料
  @Input() groupRowsBy?: string;              // (小計)群組欄位
  @Output() selectButton = new EventEmitter<any>();             // 選擇 按鈕事件
  @Input() disabled = false;
  // 展開
  // expansion 收合展開
  /** 收合展開 欄位配置(expansion必需配置) @default [] */
  @Input() expansionColumns: ReportColumn[] = [];
  /** 收合展開 資料key(expansion必需配置) @default 'details' */
  @Input() expansionDataKey = 'details';
  /** 收合展開 排序欄位(單一排序) @default [{ field: this.expansionDataKey, order: 1 }] */
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  /** 屬性來接收父層傳來的載入函數 */
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  /** 收合展開 已展開資料 @default {} */
  expandedRows: Record<string, boolean> = {};
  //
  private = true;            // 用來判斷是否為第一次載入
  virtualData: any = [];
  isLoading = false;
  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data.length > 0) {
      if (this.data.length >= 30) {
        this.virtualData = Array(this.data.length).fill(null); // ! 清空虛擬資料
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
        })
      } else {
        this.virtualData = [...this.data];
      }
    } else if (changes['data'] && this.data.length === 0) {
      this.virtualData = Array(0).fill(null);
      this.totalRecords = 0;
    }
  }

  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
  // 分組欄位對齊
  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }
  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  onScroll(event: any) {
    if (this.isLoading || this.data.length >= this.totalRecords || this.data.length < 30) {
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
  }
  loadMoreData() {
    if (!this.queryFunction || !this.lastQueryBody) {
      return;
    }
    this.isLoading = true;
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / 30) + 1,
      pageSize: 30,
      SortBy: this.dt.multiSortMeta
    };
    this.queryFunction(body).pipe(finalize(() => this.isLoading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.data = [...this.data, ...res.Data];
        this.totalRecords = res.TotalCount; // 確保總筆數同步更新
        this.virtualData = Array(this.data.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
          this.dt.scrollHeight = '700px';
        })
      }
    });
  }
  onSort(event: any) {
    console.log('🚨 DEBUG - onSort event:', event);

    // 1. 核心修正：確保單點擊只保留單一排序
    // PrimeNG 在 sortMode="multiple" 時，event.multisortmeta 包含所有排序。
    // 如果我們只想要單一排序，就只取最後一個元素作為新的排序狀態。
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      // 取得最新點擊的排序狀態
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];

      // 強制將 multiSortMeta 設定為只有最新的這一個排序
      this.dt.multiSortMeta = [lastSort];
    }

    // 檢查是否有 queryFunction (省略部分邏輯，確保程式碼連貫)
    if (!this.queryFunction || !this.lastQueryBody || this.data.length < 30) {
      return;
    }

    // 3. 準備查詢參數
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
      pageSize: 30,
      SortBy: this.dt.multiSortMeta // 這裡現在只包含最新的單一排序
    };

    // 4. 呼叫 API 重新取得資料 (後續邏輯不變)
    this.queryFunction(body).pipe(finalize(() => this.isLoading = false)).subscribe(res => {
      if (res && res.Data) {
        // 5. API 成功後，更新資料和狀態
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body; // 更新最後一次的查詢條件

        // 重新處理虛擬滾動資料
        if (this.data.length > 0) {
          if (this.data.length >= 30) {
            this.virtualData = Array(this.data.length).fill(null);
            setTimeout(() => {
              this.virtualData.splice(0, this.data.length, ...this.data);
            });
          } else {
            this.virtualData = [...this.data];
          }
        }
      }
    });
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
    return this.columns.some(col => !col.hidden && col.isSubTotal && this.groupRowsBy);
  }
  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) {
      return true; // 如果沒有分組或已經是最後一筆，則視為群組結尾。
    }
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }
  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    if (!this.groupRowsBy || !col.isSubTotal) {
      return ''; // 1. 基本檢查：如果沒有分組依據，或不是小計欄位，直接回傳空字串。
    }
    return this.tableUtility.getGroupSubtotal(rowData, col, this.groupRowsBy, this.data);
  }
  // 切換行展開
  toggleRowExpansion(rowData: any) {
    this.tableUtility.toggleRowExpansionLogic(rowData, this.dataKey ?? 'id', this.expansionDataKey, this.expansionLoadFn, this.expandedRows, this);
  }
}
