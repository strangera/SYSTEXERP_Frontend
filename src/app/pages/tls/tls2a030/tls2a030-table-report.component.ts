/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '@others/component/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { ReportColumn, TableQueryPayload } from './tls2a030-table-report.model';

@Component({
  selector: 'app-tls2a030-table-report',
  host: { 'table-report-id': 'app-tls2a030-table-report' },
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ButtonModule, TooltipModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls2a030-table-report.component.html',
  styleUrls: ['./tls2a030-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TLS2A030TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;
  virtualData: any = [];
  lazy = true;
  @Input() dataKey: string | undefined;
  selectedColumns: ReportColumn[] = [];
  @Input() tableKey = this.route.snapshot.url.at(-1)!.path;
  @Input() loading = false;
  public _loading = false;
  @Input() showReportMode = true;
  @Input() showDelete = true;
  @Input() footerData: any;
  @Input() footerLabel = '總計';
  @Input() allowFooterHtml = false;

  constructor(
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.virtualData = [];
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
        }
        this.cdr.detectChanges();
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = '450px';
        } else {
          if (this.data.length === this.totalRecords) { this.dt.lazy = false; }
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }
  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) {
      return;
    }
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    const currentSort = this.dt?.multiSortMeta;
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this._loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = Array.from({ length: this.data.length + res.Data.length });
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || this.data.length;
      }
    });
  }
  onSort(event: any) {
    if (this._loading) return;
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta.at(-1);
      this.dt.multiSortMeta = [lastSort];
    }
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    if (!this.queryFunction || !this.lastQueryBody) {
      return;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta ?? undefined
    };
    this.loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = [];
        this.dt.virtualScroll = false;
        this.dt.scrollHeight = '450px';
        this.data = res.Data;
        this.cdr.detectChanges();
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
  customSort(event: TableQueryPayload) {
    this.data.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta) {
        const value1 = data1[sortMeta.field];
        const value2 = data2[sortMeta.field];
        let result = 0;
        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) { /* 兩者皆為 null，result 維持初始值 0 */ }
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        else
          result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        if (result !== 0) {
          return sortMeta.order * result;
        }
      }
      return 0;
    });
    this.virtualData = this.data;
    this.cdr.markForCheck();
  }
  onScroll(event: any) {
    if (this._loading) return;
    const target = event.originalEvent.target;
    const pageSize = this.lastQueryBody?.pageSize || 30;
    if (this.data.length < this.totalRecords && this.data.length >= pageSize) {
      if (target.scrollHeight - target.scrollTop - target.clientHeight <= 2) {
        this.loadMoreData();
      }
    }
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
}
