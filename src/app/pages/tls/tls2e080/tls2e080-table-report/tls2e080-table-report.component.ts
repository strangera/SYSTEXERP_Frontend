/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { ReportColumn, ColumnGroup } from './tls2e080-table-report.model';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ActivatedRoute } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { Tls2e080TableReportUtilityService } from './tls2e080-table-report-utility.service';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { TableExpansionComponent } from '@shared/componentkit/table/table-expansion/table-expansion.component';

@Component({
  selector: 'app-tls2e080-table-report',
  standalone: true,
  imports: [TableExpansionComponent, TableCaptionComponent, SkeletonModule, TableModule, NgFor, NgIf, NgClass, NgStyle, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls2e080-table-report.component.html',
  styleUrls: ['./tls2e080-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls2e080TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input({ required: true }) lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;                               // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];                               // 用來儲存查詢結果
  @Input() dataKey: string | undefined;                                 // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];                              // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];                  // 用來儲存查詢結果
  @Input({ required: true }) queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() loading = false;
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;// tableKey預設給路由名稱
  @Input() apiUrl: string | undefined = undefined;
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => {
    if (data) { return this.isRowSelectable(data); }
    return false;
  };
  // Header 相關
  @Input() showCaption = true;                                                  // 是否顯示 Caption
  // Header(左) 相關
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() customReport = false;               // 是否自訂報表
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>();  // 編輯事件
  // Footer 相關
  @Input() footerData: any;                  // (總計)頁尾資料
  @Input() groupRowsBy?: string;              // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // <<< 新增：用於儲存每個群組的總計
  @Input() subTotalData: any;               // (小計)頁尾資料
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
    public readonly tableUtility: Tls2e080TableReportUtilityService,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data !== undefined) {
      console.log(this.data);

      if (this.data.length > 0) {
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(this.data); // 計算當前頁面資料的小計

        if (this.data.length >= 30) {
          this.virtualData = Array(this.data.length).fill(null);
          setTimeout(() => {
            this.virtualData.splice(0, this.data.length, ...this.data);
          });
        } else {
          this.virtualData = [...this.data];
        }
      } else if (this.data.length === 0) {
        this.virtualData = Array(0).fill(null);
        this.totalRecords = 0;
        this.groupTotals = {}; // 沒資料時也要清空小計
      }
      this.selectedItems = [];
    }
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
  }
  isTotal = 0;
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
        this.updateGroupTotals(res.Data);
        this.data = [...this.data, ...res.Data];
        this.isTotal += this.data.reduce((a: number, b: any) => a + (b.STK_CURRENTQTY ?? 0), 0);
        this.totalRecords = res.TotalCount; // 確保總筆數同步更新
        this.virtualData = Array(this.data.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
          this.dt.scrollHeight = '700px';
        })
      }
    });
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
      const subtotal = subtotalRow ? subtotalRow[field] : 0;
      return col.format ? col.format(subtotal) : subtotal;
    }
    const groupKey = rowData[this.groupRowsBy];
    const field = col.field;
    // 2. 從預先計算的結果中獲取總計
    const total = this.groupTotals[groupKey]?.[field] ?? 0;
    // 3. 應用格式化
    return col.format ? col.format(total) : total;
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
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
}
