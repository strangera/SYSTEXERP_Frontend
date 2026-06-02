/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
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
import { AddButton, ColumnGroup, expandAnimation, ReportColumn, TableQueryPayload } from './table-report.model';

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
  @Input() ItemSize = 46;
  @Input() lazy = true;
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];     // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url.at(-1)!.path;
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
  private isSyncingSort = false;
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
  @Input() editTooltip: string | ((rowData: any) => string) = '編輯';
  // 新增一個輔助方法來解析 Tooltip
  getEditTooltip(rowData: any): string {
    if (typeof this.editTooltip === 'function') {
      return this.editTooltip(rowData);
    }
    return this.editTooltip;
  }
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
  @Input() showSubTotalGroupValue = true; // 小計列是否顯示群組值（小計(XXX)）
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
  @Input() reportTitle?: string;                    // 自訂報表標題
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
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
          setTimeout(() => {
            this.syncTableSortMeta();
          });
        }
        this.cdr.detectChanges();
        // 判斷是否需要進行虛擬滾動，如果資料小於 pageSize 則不進行
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          if (this.data.length === this.totalRecords) {
            this.dt.lazy = false;
            this.lazy = false;
            this.dt.scrollHeight = this.autoHeight ? undefined as any : '600px';
            if (!this.showManage) {
              this.ItemSize = 46;
            }
          } else {
            this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
          }
          this.dt.virtualScroll = true;
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) {
      return; // 如果正在載入、沒有查詢函式、沒有查詢條件或已載入全部資料，則退出
    }
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    const currentSort = this.dt?.multiSortMeta;
    if (currentSort) {
      this.lastQueryBody.SortBy = currentSort;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize, // 使用 pageSize 變數
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this._loading = false)).subscribe(res => {
      if (res?.Data && res.Data.length > 0) {
        this.virtualData = Array.from({ length: this.data.length + res.Data.length });
        this.updateGroupTotals(res.Data);
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.syncTableSortMeta();
        this.dataChange.emit(this.data);
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || this.data.length;
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
    if (this.isSyncingSort || this._loading) return;
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
      if (res?.Data && res.Data.length > 0) {
        this.virtualData = [];
        this.dt.virtualScroll = false;
        this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        this.groupTotals = {}; // 清空小計，因為這是新的一組資料
        this.updateGroupTotals(res.Data);
        this.data = res.Data;
        this.syncTableSortMeta();
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
        this.dataChange.emit(this.data);
      }
    });
  }
  customSort(event: TableQueryPayload) {
    if (!event.multiSortMeta) return;

    // 1. 原地排序
    this.data.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta) {
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
        return selectable ?? true;
      });
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(false);
    }
  }
  onScroll(event: any) {
    if (this._loading) return;
    if (this.lazy) {
      const target = event.originalEvent.target;
      const pageSize = this.lastQueryBody?.pageSize ?? this.lastQueryBody?.PageSize ?? 30;
      if (this.data.length >= pageSize) {
        const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 10;
        if (isBottom && this.data.length < this.totalRecords) {
          this.loadMoreData();
        }
      }
    }
    else if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
      this.cdr.detectChanges();
    }
    this.cdr.markForCheck();
  }
  // 1. 處理單一勾選變更 (在 HTML 中對應 selectionChange)
  onSelectionChange(event: any[]) {
    this.selectedItems = [...event];

    // 找出目前資料中真正「可以被勾選」的數量
    const selectableRows = this.data.filter(rowData => {
      const selectable = this.isRowSelectable(rowData);
      return selectable ?? true;
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
        return selectable ?? true;
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
    const useFormatterForGroupKey = groupColumn?.format;

    let matchKey: string;

    // ** 1. 生成用於匹配的格式化群組鍵 **
    if (useFormatterForGroupKey) {
      // 使用欄位定義中的 format 函式來產生匹配鍵
      matchKey = String(groupColumn.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
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
          itemMatchKey = String(groupColumn.format!(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
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
    const useFormatterForGroupKey = groupColumn?.format;

    for (const row of newData) {
      const rawValue = row[this.groupRowsBy];
      let groupKey: string;

      if (useFormatterForGroupKey) {
        // 【已修正】使用欄位定義中的 format 函式來產生分組鍵
        groupKey = String(groupColumn.format!(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        // 【已修正】如果沒有 format 函式或找不到欄位定義，退回到安全轉換
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }

      // 如果 groupKey 為 'UNKNOWN_GROUP' 且原始值為 undefined/null，可以選擇跳過
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        continue;
      }

      // 初始化該群組的總計物件
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      // 進行增量加總
      for (const col of this.columns) {
        if (col.isSubTotal) {
          const field = col.field;
          // 確保值是數字，如果不是則為 0
          const value = Number(row[field]) || 0;

          // 增量加總
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      }
    }
  }
  /**
 * 將上次查詢的排序條件同步回 p-table 元件，確保 UI 狀態一致
 */
  private syncTableSortMeta() {
    if (!this.dt || !this.lastQueryBody?.SortBy) return;

    this.isSyncingSort = true; // 開啟旗標
    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];
    this.dt.multiSortMeta = meta.map(m => ({ field: m.field || m.Field, order: m.order || m.Order }));

    setTimeout(() => {
      this.dt.tableService.onSort(this.dt.multiSortMeta || []);
      this.cdr.detectChanges();
      this.isSyncingSort = false; // 關閉旗標
    }, 0);
  }
  /** 確保分頁參數統一為小寫，避免 PascalCase 導致重複查詢或參數丟失 */
  private normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;

    // 移除可能干擾的小寫/大寫重複項，並統一回傳小寫
    const { PageSize, PageIndex, ...rest } = body;
    return { ...rest, pageSize, pageIndex, PageSize, PageIndex };
  }

  getBtnLabel(btn: any, rowData: any): string {
    if (typeof btn.label === 'function') {
      return btn.label(rowData);
    }
    return btn.label;
  }
}
