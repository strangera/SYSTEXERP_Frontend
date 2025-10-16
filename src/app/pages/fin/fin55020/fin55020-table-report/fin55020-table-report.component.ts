/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe, DecimalPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { ReportColumn } from './fin55020-table-report.model';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ActivatedRoute } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { getSYS1000 } from '@service/system/sys1000.service';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [DatePipe, DecimalPipe, SkeletonModule, TableModule, NgFor, NgIf, NgStyle, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './fin55020-table-report.component.html',
  styleUrls: ['./fin55020-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fin55020TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input({ required: true }) lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;                               // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];                               // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];                              // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];                  // 用來儲存查詢結果
  @Input({ required: true }) queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() loading = false;
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  // Header(左) 相關
  @Input() customReport = false;               // 是否自訂報表
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  private = true;            // 用來判斷是否為第一次載入
  virtualData: any = [];
  isLoading = false;
  getSYS1000 = getSYS1000;
  constructor(
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data !== undefined) {
      if (this.data.length > 0) {
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
      }
    }
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
  // 判斷欄位是否可見
  isColumnVisible(col: ReportColumn): boolean {
    return col.visible !== false;
  }
}
