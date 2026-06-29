import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { Tls13070Cag, Tls13070Level, Tls13070Limit, Tls13070Rent, Tls13070Response, Tls13070Service } from '@service/api/tls/tls13070.service';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';

export interface FlattenedTls13070Row extends Tls13070Response {
  rowIndex: number;
  isMainRow: boolean;
  isLastSubRow: boolean;
  recordEven: boolean;
  rowspanCount: number;
  singleCag?: Tls13070Cag;
  singleLevel?: Tls13070Level;
  singleLimit?: Tls13070Limit;
  singleRent?: Tls13070Rent;
  globalIndex: number;
}

@Component({
  selector: 'app-tls13070-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './tls13070-table.component.html',
  styleUrls: ['./tls13070-table.component.scss'],
})
export class Tls13070TableComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;

  @Input() lastQueryBody?: any;
  @Input() totalRecords = 0;
  @Input() data: Tls13070Response[] = [];
  @Input() dataKey?: string;
  @Input() queryFunction?: (body: any) => Observable<any>;
  @Input() loading = false;
  @Input() aps1003_A?: Observable<any[] | null>;
  @Input() aps1003_B?: Observable<any[] | null>;
  @Input() aps1003_C?: Observable<any[] | null>;
  @Input() aps1003_D?: Observable<any[] | null>;

  tableKey = 'TLS13070Table';
  flatData: FlattenedTls13070Row[] = [];
  isLoading = false;
  hasSearched = false;
  btnLoading = false;
  totalColspan = 0;
  aOptions: any[] = [];
  bOptions: any[] = [];
  cOptions: any[] = [];
  dOptions: any[] = [];

  readonly numToleratedItems = Math.ceil(700 / 46) * 2;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly tls13070Service = inject(Tls13070Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly trackByFn = (index: number, item: FlattenedTls13070Row): number =>
    item?.globalIndex ?? index;

  // 箭頭函式確保 this 正確，傳給 virtualScrollOptions.onScroll
  readonly onVirtualScroll = (event: any) => {
    if (this.isLoading || this.data.length >= this.totalRecords || this.data.length < 30) return;
    const target = event.originalEvent?.target as HTMLElement | undefined;
    if (!target) return;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollHeight - scrollTop - clientHeight <= 2) this.loadMoreData();
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (this.lastQueryBody) this.hasSearched = true;
      this.flatData = this.buildFlatData(this.data ?? []);
    }
    if (changes['lastQueryBody'] && this.lastQueryBody && this.dt) {
      this.dt.multiSortMeta = this.lastQueryBody.SortBy;
    }
    if (changes['aps1003_A'] && this.aps1003_A) {
      this.aps1003_A.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.aOptions = res ?? [];
        this.recalcColspan();
      });
    }
    if (changes['aps1003_B'] && this.aps1003_B) {
      this.aps1003_B.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.bOptions = res ?? [];
        this.recalcColspan();
      });
    }
    if (changes['aps1003_C'] && this.aps1003_C) {
      this.aps1003_C.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.cOptions = res ?? [];
        this.recalcColspan();
      });
    }
    if (changes['aps1003_D'] && this.aps1003_D) {
      this.aps1003_D.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.dOptions = res ?? [];
        this.recalcColspan();
      });
    }
  }

  splitWithLineBreaks(text: string | null | undefined): string {
    return text ? text.replace(/,/g, '<br />') : '';
  }

  onExportXLSX(): void {
    if (!this.lastQueryBody) return;
    this.btnLoading = true;
    this.tls13070Service.exportTLS13070Excel(this.lastQueryBody).pipe(
      finalize(() => (this.btnLoading = false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => this.handleFileExport(response),
      error: (err) => console.error('Excel 匯出失敗:', err),
    });
  }

  private loadMoreData(): void {
    if (!this.queryFunction || !this.lastQueryBody) return;
    this.isLoading = true;
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / 30) + 1,
      pageSize: 30,
      SortBy: this.dt?.multiSortMeta,
    };
    this.queryFunction(body)
      .pipe(finalize(() => (this.isLoading = false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.Data?.length > 0) {
          this.data = [...this.data, ...res.Data];
          this.totalRecords = res.TotalCount;
          this.flatData = this.buildFlatData(this.data);
        }
      });
  }

  private recalcColspan(): void {
    // fixed: 序號(1)+招募編號(1)+更新時間(1)+位置編號(1)+廠商名稱(1)+廠商統編(1)=6, 店櫃(11), 租賃(18), 目標(1)+結帳後(1)+備註(1)=3
    const fixed = 6 + 11 + 18 + 3;
    const dynamic = this.aOptions.length + this.bOptions.length + (this.cOptions.length * 3) + this.dOptions.length;
    this.totalColspan = fixed + dynamic;
  }

  private handleFileExport(response: HttpResponse<Blob>): void {
    const blob = response.body;
    if (!blob || blob.size === 0) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '櫃位合約一覽表.xlsx';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private buildFlatData(data: Tls13070Response[]): FlattenedTls13070Row[] {
    const result: FlattenedTls13070Row[] = [];
    let seq = 1;
    for (const item of data) {
      const len = Math.max(
        item.cagList?.length ?? 0,
        item.levelList?.length ?? 0,
        item.limitList?.length ?? 0,
        item.rentList?.length ?? 0,
        1
      );
      for (let i = 0; i < len; i++) {
        result.push({
          ...item,
          rowIndex: i,
          isMainRow: i === 0,
          isLastSubRow: i === len - 1,
          recordEven: seq % 2 === 0,
          rowspanCount: len,
          globalIndex: i === 0 ? seq : null!,
          singleCag: item.cagList?.[i],
          singleLevel: item.levelList?.[i],
          singleLimit: item.limitList?.[i],
          singleRent: item.rentList?.[i],
        });
      }
      seq++;
    }
    return result;
  }
}
