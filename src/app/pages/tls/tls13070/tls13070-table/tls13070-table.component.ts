/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Tls13070Cag, Tls13070Level, Tls13070Limit, Tls13070Rent, Tls13070Response, Tls13070Service } from '@service/api/tls/tls13070.service';
import { Option } from '@service/utility/dropdown-api.model';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';

export interface FlattenedTls13070Row extends Tls13070Response {
  // 增加索引來識別這是該筆主資料的第幾條子資料
  rowIndex: number;
  // 該行是否有主資料 (用於控制 rowspan)
  isMainRow: boolean;
  // 儲存該筆主資料的總子行數
  rowspanCount: number;

  // 該行單獨的抽成、階梯、包底、固定租金資料
  singleCag?: Tls13070Cag;
  singleLevel?: Tls13070Level;
  singleLimit?: Tls13070Limit;
  singleRent?: Tls13070Rent;
  globalIndex: number;
}
@Component({
  selector: 'app-tls13070-table',
  standalone: true,
  imports: [CommonModule, SkeletonModule, TableModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule],
  templateUrl: './tls13070-table.component.html',
  styleUrls: ['./tls13070-table.component.scss'],
})
export class Tls13070TableComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input() lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input() totalRecords = 0;                               // 用來儲存總筆數
  @Input() data: any;                                    // 用來儲存查詢結果
  @Input() dataKey: string | undefined;                                 // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() loading = false;
  @Input() apiUrl: string | undefined = undefined;
  tableKey = 'TLS13070Table';                     // 用來儲存 table 狀態的 key
  private = true;            // 用來判斷是否為第一次載入
  virtualData: any = [];
  isLoading = false;
  @Input() aps1003_A?: Observable<Option[] | null>;
  @Input() aps1003_B?: Observable<Option[] | null>;
  @Input() aps1003_C?: Observable<Option[] | null>;
  @Input() aps1003_D?: Observable<Option[] | null>;
  totalColspan = 0;
  aLength = 0;
  bLength = 0;
  cLength = 0;
  dLength = 0;
  btnLoading = false;

  constructor(
    public readonly sanitizer: DomSanitizer,
    public readonly tls13070Service: Tls13070Service,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data !== changes['data'].previousValue) {
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      const flatData = this.flattenData(this.data);

      if (flatData.length >= 30) {
        this.virtualData = Array(flatData.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, flatData.length, ...flatData);
          if (this.dt) {
            this.dt.scrollHeight = '450px';
            this.dt.virtualScroll = true;
          }
        });
      } else {
        this.virtualData = flatData;
        if (this.dt) {
          this.dt.scrollHeight = 'flex';
          this.dt.virtualScroll = false;
        }
      }
    } else if (changes['data'] && this.data.length === 0) {
      this.virtualData = Array(0).fill(null);
      this.totalRecords = 0;
    }
    if (changes['lastQueryBody'] && this.lastQueryBody) {
      this.dt.multiSortMeta = this.lastQueryBody?.SortBy;
    }
    if (changes['aps1003_A'] && this.aps1003_A) {
      this.aps1003_A.pipe(untilDestroyed(this)).subscribe(res => {
        this.aLength = res?.length ?? 0;
        this.calculateColspan();
      });
    }
    if (changes['aps1003_B'] && this.aps1003_B) {
      this.aps1003_B.pipe(untilDestroyed(this)).subscribe(res => {
        this.bLength = res?.length ?? 0;
        this.calculateColspan();
      });
    }
    if (changes['aps1003_C'] && this.aps1003_C) {
      this.aps1003_C.pipe(untilDestroyed(this)).subscribe(res => {
        this.cLength = res?.length ?? 0;
        this.calculateColspan();
      });
    }
    if (changes['aps1003_D'] && this.aps1003_D) {
      this.aps1003_D.pipe(untilDestroyed(this)).subscribe(res => {
        this.dLength = res?.length ?? 0;
        this.calculateColspan();
      });
    }
  }

  calculateColspan = () => {
    // 固定的欄位數
    // 序號(1) + 招募編號(1) + 更新時間(1) + 位置編號(1) + 廠商名稱(1) + 廠商統編(1) = 6
    // 店櫃資料 (11) = 11
    // 租賃條件 (18) = 18
    // 目標營業額 (1) + 結帳後幾天匯款 (1) + 備註 (1) = 3
    const fixedCols = 6 + 11 + 18 + 3; // 總固定欄位 = 38

    // 動態欄位數
    const dynamicCols = this.aLength + this.bLength + (this.cLength * 3) + this.dLength;

    this.totalColspan = fixedCols + dynamicCols;
  };

  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
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
    this.lastQueryBody = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / 30) + 1,
      pageSize: 30,
      SortBy: this.dt.multiSortMeta
    }
    const body = { ...this.lastQueryBody };
    this.queryFunction(body).pipe(finalize(() => this.isLoading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.data = [...this.data, ...res.Data];
        this.totalRecords = res.TotalCount;
        const flatData = this.flattenData(this.data);
        this.virtualData = Array(flatData.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, flatData.length, ...flatData);
          this.dt.scrollHeight = '450px';
        });
      }
    });
  }
  /**
   * 將字串中的逗號 (,) 替換為 HTML 換行標籤 (<br />)
   * @param text 包含逗號分隔值的字串
   * @returns 包含 <br /> 標籤的新字串
   */
  splitWithLineBreaks(text: string | null | undefined): string {
    if (!text) { return ''; }
    return text.replace(/,/g, '<br />');
  }
  private flattenData(data: Tls13070Response[]): FlattenedTls13070Row[] {
    const flatData: FlattenedTls13070Row[] = [];
    if (!data) return [];

    // 引入一個計數器來計算全局序號
    let currentGlobalIndex = 1;

    data.forEach(item => {
      // 找出四個列表中的最大長度
      const maxLen = Math.max(
        item.cagList?.length ?? 0,
        item.levelList?.length ?? 0,
        item.limitList?.length ?? 0,
        item.rentList?.length ?? 0,
        1 // 至少要有一行來顯示主資料
      );

      for (let i = 0; i < maxLen; i++) {
        const row: FlattenedTls13070Row = {
          ...item,
          rowIndex: i,
          isMainRow: i === 0,
          rowspanCount: maxLen,

          // 只有主資料行才賦予 globalIndex，非主資料行賦予 null
          globalIndex: i === 0 ? currentGlobalIndex : null!,
          // 注意：這裡使用 ! 是因為 TypeScript 介面定義是 number，
          // 但在實際情況中只有 isMainRow 為 true 時才需要使用。

          singleCag: item.cagList?.[i],
          singleLevel: item.levelList?.[i],
          singleLimit: item.limitList?.[i],
          singleRent: item.rentList?.[i],
        };
        flatData.push(row);
      }

      // 每處理完一組主資料，全局序號才遞增
      currentGlobalIndex++;
    });

    return flatData;
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      return;
    }
    this.btnLoading = true;
    this.tls13070Service.exportTLS13070Excel(this.lastQueryBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
      error: (err) => {
        console.error('Excel 匯出失敗:', err);
      }
    });
  }
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const filename = '櫃位合約一覽表' + fileExtension; // 預設檔名
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}
