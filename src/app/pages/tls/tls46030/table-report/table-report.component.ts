/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000 } from '@service/system/sys1000.service';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag'; // 新增
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { ReportColumn } from './table-report.model';

@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': 'tls46030' },
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent, TagModule],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() tableKey = 'tls46030';
  @Input() loading = false;
  public _loading = false;
  // Header 相關
  @Input() showSort = true;              // 是否顯示 排序
  public get multiSortMeta() { // 暴露內部 p-table 的多重排序狀態
    return this.dt?.multiSortMeta || [];
  }
  private isSyncingSort = false;
  // 管理 欄位
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>(); // 編輯事件
  // 底層匯出
  @Input() apiUrl?: string;                         // table API URL (可選)
  @Input() reportTitle?: string;                    // 自訂報表標題
  @Input() DataKeyName?: string;                    // table 資料key名稱 (可選)
  @Input() Conditions?: any;                         // table 條件 (可選)
  constructor(
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // 只有當資料真的從 API 回來（不論長度是多少）才顯示
      // 或者是根據你是否有 lastQueryBody 來判斷
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.virtualData = [];
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
          this.dt.scrollHeight = '450px';
        } else {
          this.dt.scrollHeight = '450px';
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
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.syncTableSortMeta();
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || this.data.length;
      }
    });
  }
  onSort(event: any) {
    if (!this.lazy) {
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
        this.dt.scrollHeight = '450px';
        this.data = res.Data;
        this.syncTableSortMeta();
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
      }
    });
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
    this.cdr.markForCheck();
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
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
  getFormattedValue(col: ReportColumn, val: any, rowIndex: number, rowData: any): any {
    if (col.format) {
      return col.format(val, rowIndex, rowData);
    }
    const sysValue = getSYS1000(col.field, val);
    if (sysValue !== undefined && sysValue !== null) {
      return sysValue;
    }
    return val;
  }

  // 定義異動類型的設定
  private readonly fieldTypeConfig: Record<string, { label: string, icon: string, class: string }> = {
    'ECR_Type': { label: '機台類型', icon: 'pi-cog', class: 'bg-indigo-100 text-indigo-700' },
    'ECR_SAL_Type': { label: '機台用途別', icon: 'pi-briefcase', class: 'bg-purple-100 text-purple-700' },
    'ECR_LocNo': { label: '店位代碼', icon: 'pi-map-marker', class: 'bg-green-100 text-green-700' },
    'ECR_TLT_No': { label: '專櫃編號', icon: 'pi-users', class: 'bg-orange-100 text-orange-700' },
    'SYS_SrvNo': { label: '主機編號', icon: 'pi-server', class: 'bg-blue-100 text-blue-700' },
    'ECR_TmplNo': { label: '周邊模版編號', icon: 'pi-table', class: 'bg-cyan-100 text-cyan-700' },
    'ECR_CloseDate': { label: '停用日期', icon: 'pi-calendar', class: 'bg-teal-100 text-teal-700' },
    'ECR_IP': { label: '收銀機網路IP', icon: 'pi-wifi', class: 'bg-pink-100 text-pink-700' }
  };

  // 輔助函式：取得樣式
  getFieldConfig(id: string) {
    return this.fieldTypeConfig[id] || { label: id, icon: 'pi-question', class: 'bg-gray-100 text-gray-700' };
  }
}
