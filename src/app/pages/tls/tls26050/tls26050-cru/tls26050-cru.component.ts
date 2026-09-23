import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';

import { formatAmount } from '@others/component/table/table.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';

import {
  TLS26050Data,
  TLS26050QueryRequest
} from 'src/app/service/api/tls/tls26050.service';

import {
  TLS26070Data,
  TLS26070QueryRequest,
  TLS26070Service
} from 'src/app/service/api/tls/tls26070.service';

@Component({
  selector: 'app-tls26050-cru',
  standalone: true,
  imports: [TableReportComponent, DialogModule],
  templateUrl: './tls26050-cru.component.html'
})
export class Tls26050CRUComponent implements OnChanges {

  private readonly tls26070Service = inject(TLS26070Service);
  private readonly destroyRef = inject(DestroyRef);

  @Input() visible = false;
  @Input() rowData: TLS26050Data | null = null;
  @Input() queryConditions: TLS26050QueryRequest | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  totalRecords = 0;
  data: TLS26070Data[] = [];
  historyRequestBody: TLS26070QueryRequest | null = null;
  columns: ReportColumn[] = [];

  // API
readonly detailQueryFn = (body: TLS26070QueryRequest) => {
  const currentPage = (body as any).PageIndex ?? body.pageIndex ?? 1;
  const pageSize = (body as any).PageSize ?? body.pageSize ?? 30;
  const apiPageIndex = Math.max(currentPage - 1, 0);

  const apiBody: any = {
    ...body,
    PageIndex: apiPageIndex,
    PageSize: pageSize,
    pageIndex: apiPageIndex,
    pageSize: pageSize
  };

  return this.tls26070Service.queryTLS26070(apiBody).pipe(
    map((response: any) => {
      const queryData: TLS26070Data[] = response?.Data?.QueryData ?? [];
      const sumData: TLS26070Data[] = response?.Data?.SumData ?? [];
      const allData: TLS26070Data[] = response?.Data?.AllData ?? [];

      return {
        Data: queryData,
        QueryData: queryData,
        SumData: sumData,
        AllData: allData,
        TotalCount: response?.TotalCount ?? queryData.length
      };
    }),
    takeUntilDestroyed(this.destroyRef)
  );
};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData) {
      this.data = [];
      this.totalRecords = 0;
      this.columns = this.buildColumns(this.queryConditions?.tax ?? true);
      this.queryDetail();
    }
  }

  // 建立查詢條件
  private buildRequest(): TLS26070QueryRequest {
    const q = this.queryConditions;
    const row = this.rowData!;

    const request: TLS26070QueryRequest = {
      pageSize: q?.pageSize ?? 30,
      pageIndex: 1,
      SortBy: q?.SortBy ?? [{ field: 'team_name', order: -1 }],

      reportType: q?.reportType ?? '1',

      onedatedd: q?.onedatedd,
      onedatedd_c: q?.onedatedd_c,

      onedateyy: q?.onedateyy,
      weeks: q?.weeks,
      startdate: q?.startdate,
      enddate: q?.enddate,
      onedateyy_c: q?.onedateyy_c,
      weeks_c: q?.weeks_c,
      startdate_c: q?.startdate_c,
      enddate_c: q?.enddate_c,

      onedatemm: q?.onedatemm,
      onedatemm_c: q?.onedatemm_c,

      halfyear_onedateyy: q?.halfyear_onedateyy,
      halfyear: q?.halfyear,
      halfyear_onedateyy_c: q?.halfyear_onedateyy_c,
      halfyear_c: q?.halfyear_c,

      year_onedateyy: q?.year_onedateyy,
      year_onedateyy_c: q?.year_onedateyy_c,

      sad_startdate: q?.sad_startdate,
      sad_enddate: q?.sad_enddate,
      sad_startdate_c: q?.sad_startdate_c,
      sad_enddate_c: q?.sad_enddate_c,

      eventID: q?.eventID,
      event_startdate: q?.event_startdate,
      event_enddate: q?.event_enddate,
      eventID_c: q?.eventID_c,
      event_startdate_c: q?.event_startdate_c,
      event_enddate_c: q?.event_enddate_c,

      floor: q?.floor,
      region: q?.region,

      bus_type: row.bus_type ? [row.bus_type] : q?.bus_type,
      bus_class: q?.bus_class,
      tlt_kind: row.tlt_kind ? [row.tlt_kind] : q?.tlt_kind,
      tlt_term_type: q?.tlt_term_type,

      org_id: row.division_no ? [row.division_no] : q?.org_id,

      tlt_no: q?.tlt_no,
      tax: q?.tax ?? true,

      tlt_building: row.tlt_building ?? q?.tlt_building?.[0] ?? undefined
    };

    console.log('TLS26070 Request =', request);

    return request;
  }

  // 查詢
  private queryDetail(): void {
    if (!this.rowData) return;

    const request = this.buildRequest();

    this.historyRequestBody = request;
    this.loading = true;

    this.detailQueryFn(request).subscribe({
      next: (res) => {
        this.data = res.Data ?? [];
        this.totalRecords = res.TotalCount ?? this.data.length;
        this.loading = false;

        console.log('TLS26070 Data =', this.data);
        console.log('TLS26070 TotalCount =', this.totalRecords);
      },
      error: (error) => {
        console.error('TLS26070 查詢失敗', error);
        this.data = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  // Dialog
  onHide(): void {
    this.visibleChange.emit(false);
  }

  // Table 資料同步
  onDataChange(data: TLS26070Data[]): void {
    this.data = data;
  }

  // 欄位
  private buildColumns(tax: boolean): ReportColumn[] {
    return [
      { field: 'tlt_building', header: '館別', visible: true, align: 'left' },
      { field: 'talent_id', header: '專櫃編號', visible: true, align: 'left' },
      { field: 'team_name', header: 'TEAM', visible: true, align: 'left' },
      { field: 'division_name', header: '組別', visible: true, align: 'left' },
      { field: 'tlt_kind', header: '櫃別', visible: true, align: 'left' },
      { field: 'bus_class_name', header: '大分類', visible: false, align: 'left' },
      { field: 'bus_sclass_name', header: '小分類', visible: true, align: 'left' },
      { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },

      { field: 'budget_now', header: '目標', visible: true, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'preorder_amt_now', header: '當期預售金額', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'preorder_namt_now', header: '當期預售金額', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'Achievement_rate_now', header: '目標達成率', visible: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isTotal: true, align: 'right', exportFormat: 'percentage' },
      { field: 'nAchievement_rate_now', header: '目標達成率', visible: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isTotal: true, align: 'right', exportFormat: 'percentage' },

      { field: 'preorder_custcnt_now', header: '當期交易筆數', visible: true, isTotal: true, format: formatAmount, align: 'right' },

      { field: 'avg_ordervalue_now', header: '當期客單價', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'navg_ordervalue_now', header: '當期客單價', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'preorder_amt_last', header: '去年同期預售金額', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'preorder_namt_last', header: '去年同期預售金額', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'preorder_custcnt_last', header: '去年同期交易筆數', visible: true, isTotal: true, format: formatAmount, align: 'right' },

      { field: 'avg_ordervalue_last', header: '去年同期客單價', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'navg_ordervalue_last', header: '去年同期客單價', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'Growth', header: '成長比', visible: tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isTotal: true, align: 'right', exportFormat: 'percentage' },
      { field: 'nGrowth', header: '成長比', visible: !tax, format: (value: number) => value ? `${value.toFixed(2)}%` : '0%', isTotal: true, align: 'right', exportFormat: 'percentage' },

      { field: 'PerformanceDiff', header: '業績差異', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'nPerformanceDiff', header: '業績差異', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'TransactionsNumber', header: '交易筆數差異', visible: true, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'OrdervalueDiff', header: '客單差異', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'nOrdervalueDiff', header: '客單差異', visible: !tax, format: formatAmount, isTotal: true, align: 'right' },

      { field: 'tlt_space', header: '營業坪數', visible: true, format: (value) => formatAmountWithDecimals(value, 2), isTotal: true, align: 'right', exportFormat: 'decimal2' },

      { field: 'MonthlyFloorEffect', header: '月坪效', visible: tax, format: formatAmount, isTotal: true, align: 'right' },
      { field: 'nMonthlyFloorEffect', header: '月坪效', visible: !tax, format: formatAmount, isTotal: true, align: 'right' }
    ];
  }
}