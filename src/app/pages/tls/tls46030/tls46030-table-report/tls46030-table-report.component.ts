/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000 } from '@service/system/sys1000.service';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { ReportColumn } from './tls46030-table-report.model';

@Component({
  selector: 'app-tls46030-table-report',
  host: { 'table-report-id': 'tls46030' },
  standalone: true,
  imports: [
    SkeletonModule,
    TableModule,
    CommonModule,
    ButtonModule,
    TooltipModule,
    FormsModule,
    TableCaptionComponent,
    TagModule
  ],
  templateUrl: './tls46030-table-report.component.html',
  styleUrls: ['./tls46030-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TLS46030TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;

  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() dataKey: string | undefined;
  @Input() loading = false;

  @Output() detail = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();

  public virtualData: any[] = [];
  public _loading = false;
  public hasSearched = false;
  public tableKey = 'tls46030'; // 預設對應本作業

  private isSyncingSort = false;

  constructor() {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.virtualData = [];

      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
          setTimeout(() => this.syncTableSortMeta());
        }
        this.cdr.detectChanges();

        const pageSize = this.lastQueryBody?.pageSize || 2000;
        if (this.data.length < pageSize) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
        } else {
          this.dt.virtualScroll = true;
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) return;

    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    const currentSort = this.dt?.multiSortMeta;

    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };

    this._loading = true;
    this.queryFunction(body)
      .pipe(untilDestroyed(this), finalize(() => this._loading = false))
      .subscribe(res => {
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
    if (this.isSyncingSort || this._loading || !this.queryFunction || !this.lastQueryBody) return;

    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      this.dt.multiSortMeta = [event.multiSortMeta.at(-1)];
    }

    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;

    this.lastQueryBody = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta
    };

    this.loading = true;
    this.queryFunction(this.lastQueryBody)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(res => {
        this.hasSearched = true;
        if (res?.Data && res.Data.length > 0) {
          this.data = res.Data;
          this.syncTableSortMeta();
          if (res.Data.length < pageSize) {
            this.dt.virtualScroll = false;
            this.virtualData = this.data;
          } else {
            this.dt.virtualScroll = true;
            this.virtualData = Array.from({ length: res.Data.length });
            this.cdr.detectChanges();
            this.virtualData = this.data;
          }
        }
      });
  }

  onScroll(event: any) {
    if (this._loading) return;
    const target = event.originalEvent.target;
    const pageSize = this.lastQueryBody?.pageSize ?? 30;

    if (this.data.length >= pageSize) {
      const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 5000;
      if (isBottom && this.data.length < this.totalRecords) {
        this.loadMoreData();
      }
    }
    this.cdr.markForCheck();
  }

  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }

  private syncTableSortMeta() {
    if (!this.dt || !this.lastQueryBody?.SortBy) return;
    this.isSyncingSort = true;
    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];
    this.dt.multiSortMeta = meta.map(m => ({ field: m.field || m.Field, order: m.order || m.Order }));
    setTimeout(() => {
      this.dt.tableService.onSort(this.dt.multiSortMeta || []);
      this.cdr.detectChanges();
      this.isSyncingSort = false;
    }, 0);
  }

  private normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 2000;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const { PageSize, PageIndex, ...rest } = body;
    return { ...rest, pageSize, pageIndex, PageSize, PageIndex };
  }

  getFormattedValue(col: ReportColumn, val: any, rowIndex: number, rowData: any): any {
    if (col.format) {
      return col.format(val, rowIndex, rowData);
    }
    const sysValue = getSYS1000(col.field, val);
    return (sysValue !== undefined && sysValue !== null) ? sysValue : val;
  }

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

  getFieldConfig(id: string) {
    return this.fieldTypeConfig[id] || { label: id, icon: 'pi-question', class: 'bg-gray-100 text-gray-700' };
  }
}
