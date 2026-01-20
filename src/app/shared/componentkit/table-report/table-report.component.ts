/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { TableCaptionComponent } from '../table/table-caption/table-caption.component';
import { TableExpansionComponent } from '../table/table-expansion/table-expansion.component';
import { TableReportUtilityService } from './table-report-utility.service';
import { AddButton, ColumnGroup, expandAnimation, formatAmount2, ReportColumn } from './table-report.model';

@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': '複製時請自行取唯一名' },
  standalone: true,
  imports: [TableExpansionComponent, SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandAnimation]
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
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
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) };
  @Input() isAllSelected = false;           // 是否全選
  @Output() dataChange = new EventEmitter<any[]>();  // 用來儲存查詢結果
  // Header 相關
  @Input() showCaption = true;            // 是否顯示 Caption
  @Input() showSort = true;              // 是否顯示 排序
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
  @Output() edit = new EventEmitter<any>(); // 編輯事件
  @Input() addButton: AddButton[] = [];  // 自定義 管理按鈕
  @Input() buttonsLoading = false;   // 按鈕們 loading
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() footerPercentData: any;     // (百分比)頁尾資料
  @Input() extraFooterData: any; // 額外的 footer 資料（可為 object 或 array），會顯示於 footer 區塊，不對應欄位
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  @Output() selectButton = new EventEmitter<any>();    // 選擇 按鈕事件
  @Input() showSummary = true; // 是否顯示 總計欄位
  @Input() footerLabel = '總計'; // 總計列左側標籤文字
  @Input() autoHeight = false; // 是否依資料高度自動撐開（不固定 450px）
  @Input() showFooterTotal = true; // 是否顯示第一列 footer 總計資料
  @Input() allowFooterHtml = false; // 是否允許 footer 使用 HTML 內嵌呈現（預設 false，避免影響既有頁面）
  // expansion 收合展開
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.isAllSelected = false;
      this.selectedItems = [];
      this.virtualData = [];
      this.groupTotals = {};
      this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
        }
        this.cdr.detectChanges();
        // 判斷是否需要進行虛擬滾動，如果資料小於 pageSize 則不進行
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }

  // 對 extraFooter 的 key 做中文對應
  private rawLabelMap: Record<string, string> = {
    UnPostedAmt_NoTax: '未登錄餘額(免稅)',
    UnPostedAmt_WithTax: '未登錄餘額(含稅)',
  };

  private formatValue(v: any): any {
    if (v === null || v === undefined || v === '') return '';
    const num = Number(v);
    if (!isNaN(num)) return formatAmount2(num);
    return String(v);
  }

  // 將 extraFooterData 統一轉為陣列格式 [{label, value}, ...]
  public getExtraFooterArray(): { label: string; value: any }[] {
    const d = this.extraFooterData;
    if (!d) return [];
    if (Array.isArray(d)) {
      return d.map((x: any) => {
        if (x && typeof x === 'object' && ('label' in x || 'value' in x)) {
          const rawLabel = x.label ?? '';
          const mappedLabel = this.rawLabelMap[rawLabel] ?? rawLabel;
          return { label: mappedLabel, value: this.formatValue(x.value ?? '') };
        }
        const rawLabel = String(x?.label ?? '');
        return { label: this.rawLabelMap[rawLabel] ?? rawLabel, value: this.formatValue(x?.value ?? x) };
      });
    }
    if (typeof d === 'object') {
      return Object.keys(d).map(k => ({ label: this.rawLabelMap[k] ?? k, value: this.formatValue(d[k]) }));
    }
    return [{ label: '', value: this.formatValue(d) }];
  }
  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody || this.data.length >= this.totalRecords || !this.lazy) {
      return; // 如果正在載入、沒有查詢函式、沒有查詢條件或已載入全部資料，則退出
    }
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    const currentSort = this.dt?.multiSortMeta;
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize, // 使用 pageSize 變數
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this._loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = Array.from({ length: this.data.length + res.Data.length });
        this.updateGroupTotals(res.Data);
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.dataChange.emit(this.data);
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || this.data.length;
      }
    });
  }
  onSort(event: any) {
    if (this._loading || !this.lazy) {
      return;
    }
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];
      this.dt.multiSortMeta = [lastSort];
    }
    // 取得 pageSize，支援 pageSize / PageSize，若不存在則預設為 30
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;

    // 判斷是否需要重新查詢
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) {
      return;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
      pageSize, // 使用 pageSize 變數
      SortBy: this.dt.multiSortMeta ?? undefined // 這裡現在只包含最新的單一排序
    };
    this.loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = [];
        this.dt.virtualScroll = false;
        this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(res.Data);
        this.data = res.Data;
        this.cdr.detectChanges();

        // 判斷是否開啟虛擬滾動：將 30 改為 pageSize
        if (res.Data.length < pageSize) {
          this.data = res.Data;
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
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
      this.selectedItems = this.data.filter(rowData => {
        const selectable = this.isRowSelectable(rowData);
        return selectable === undefined ? true : selectable;
      });
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    }
  }
  onScroll(event: any) {
    if (this._loading || !this.lazy) {
      return;
    }
    this.selectedItems = [...this.selectedItems];
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    if (this.data.length >= this.totalRecords || this.data.length < pageSize) {
      this.virtualData = [...this.data];
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
  // 1. 處理單一勾選變更 (在 HTML 中對應 selectionChange)
  onSelectionChange(event: any[]) {
    this.selectedItems = event;

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

    // 獲取用於分組的原始值
    const rawGroupValue = rowData[this.groupRowsBy];

    // 獲取用於分組的欄位定義
    const groupColumn = this.columns.find(c => c.field === this.groupRowsBy);
    const useFormatterForGroupKey = groupColumn && groupColumn.format;

    let matchKey: string;

    // ** 1. 生成用於匹配的格式化群組鍵 **
    if (useFormatterForGroupKey) {
      // 使用欄位定義中的 format 函式來產生匹配鍵
      matchKey = String(groupColumn!.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
    } else {
      // 退回到安全轉換
      matchKey = String(rawGroupValue ?? '').trim() || 'UNKNOWN_GROUP';
    }

    // ** 2. 優先查找外部傳入的 subTotalData **
    if (this.subTotalData && this.subTotalData.length > 0 && this.groupRowsBy) {
      // 假設 subTotalData 中的分組欄位 (item[this.groupRowsBy]) 也是原始值
      // 為了確保匹配，我們需要對 subTotalData 中的分組欄位進行相同的格式化
      const subtotalRow = this.subTotalData.find((item: any) => {
        const itemRawValue = item[this.groupRowsBy!];
        let itemMatchKey: string;

        if (useFormatterForGroupKey) {
          itemMatchKey = String(groupColumn!.format!(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
        } else {
          itemMatchKey = String(itemRawValue ?? '').trim() || 'UNKNOWN_GROUP';
        }
        // 使用格式化後的鍵進行比對
        return itemMatchKey === matchKey;
      });

      if (subtotalRow) {
        const subtotal = subtotalRow[col.field] ?? 0;
        // 對小計值應用格式化
        return col.format ? col.format(subtotal) : subtotal;
      }
    }

    // ** 3. 回退到前端計算的 groupTotals **
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;
    // 對小計值應用格式化
    return col.format ? col.format(total) : total;
  }

  // 對新載入的資料進行增量計算，並更新 groupTotals。
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }

    // 1. 找出作為分組依據的欄位定義
    const groupColumn = this.columns.find(col => col.field === this.groupRowsBy);
    // 檢查分組欄位是否存在且具有 format 函式
    const useFormatterForGroupKey = groupColumn && groupColumn.format;

    newData.forEach(row => {
      const rawValue = row[this.groupRowsBy!];
      let groupKey: string;

      if (useFormatterForGroupKey) {
        // 【已修正】使用欄位定義中的 format 函式來產生分組鍵
        groupKey = String(groupColumn!.format!(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        // 【已修正】如果沒有 format 函式或找不到欄位定義，退回到安全轉換
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }

      // 如果 groupKey 為 'UNKNOWN_GROUP' 且原始值為 undefined/null，可以選擇跳過
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        return;
      }

      // 初始化該群組的總計物件
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      // 進行增量加總
      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const field = col.field;
          // 確保值是數字，如果不是則為 0
          const value = Number(row[field]) || 0;

          // 增量加總
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
}
