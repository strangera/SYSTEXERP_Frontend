/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { ColumnGroup, data } from './tls13070-table.model';
import { TableReportUtilityService } from './tls13070-table.service';
import { ImageModule } from 'primeng/image';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { SkeletonModule } from 'primeng/skeleton';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';

@Component({
  selector: 'app-tls13070-table',
  standalone: true,
  imports: [TableCaptionComponent, CommonModule, SkeletonModule, TableModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls13070-table.component.html',
  styleUrls: ['./tls13070-table.component.scss'],
})
export class Tls13070TableComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input() lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input() totalRecords = 0;                               // 用來儲存總筆數
  @Input() data = data;                                    // 用來儲存查詢結果
  @Input() dataKey: string | undefined;                                 // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() loading = false;
  @Input() apiUrl: string | undefined = undefined;
  tableKey = 'TLS13070Table';                     // 用來儲存 table 狀態的 key
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位

  private = true;            // 用來判斷是否為第一次載入
  virtualData: any = [];
  isLoading = false;
  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
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
    if (changes['lastQueryBody'] && this.lastQueryBody) {
      this.dt.multiSortMeta = this.lastQueryBody?.SortBy;
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
        this.totalRecords = res.TotalCount; // 確保總筆數同步更新
        this.virtualData = Array(this.data.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
          this.dt.scrollHeight = '700px';
        })
      }
    });
  }
  // 新增 onSort 方法
  onSort(event: any) {
    // 檢查是否有 queryFunction
    if (!this.queryFunction || !this.lastQueryBody || this.data.length < 30) {
      return;
    }
    // 3. 準備查詢參數
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
    };

    // 4. 呼叫 API 重新取得資料
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

  // 回傳幾年幾個月又幾天，不要用moment方法，tlt_contract_edate 減 tlt_contract_bdate
  getContractYear(rowData: any): string {
    // 檢查日期是否存在
    if (!rowData.tlt_contract_bdate || !rowData.tlt_contract_edate) {
      return '';
    }

    // 將日期字串轉換成 Date 物件
    const startDate = new Date(rowData.tlt_contract_bdate);
    const endDate = new Date(rowData.tlt_contract_edate);

    // 檢查日期是否有效
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '';
    }

    // 確保結束日期大於或等於起始日期
    if (startDate > endDate) {
      return '結束日期早於起始日期';
    }

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    // 調整月份和年份
    if (days < 0) {
      months--;
      // 取得上個月的最後一天，用來計算剩餘天數
      const lastDayOfLastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      days = days + lastDayOfLastMonth;
    }

    // 調整年份
    if (months < 0) {
      years--;
      months = months + 12;
    }

    // 建構回傳字串
    let result = '';
    if (years > 0) {
      result += `${years}年`;
    }
    if (months > 0) {
      result += `${months}個月`;
    }
    if (days > 0) {
      result += `${days}天`;
    }

    // 如果所有值都是 0，回傳「0天」
    if (result === '') {
      return '0天';
    }

    return result;
  }
}
