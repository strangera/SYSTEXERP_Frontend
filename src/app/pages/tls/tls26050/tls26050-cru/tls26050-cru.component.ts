import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatAmount } from '@others/component/table/table.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { DialogModule } from 'primeng/dialog';
import { map } from 'rxjs';
import { TLS26050Data, TLS26050QueryRequest } from 'src/app/service/api/tls/tls26050.service';
import { TLS26070Data, TLS26070QueryRequest, TLS26070Service } from 'src/app/service/api/tls/tls26070.service';

// 新增各櫃層級明細 Modal，比照 TLS32040/32050 的 Tls32040CRUComponent（Dialog + app-table-report）：
// 內容改呼叫 TLS26070Service.queryTLS26070，欄位比照 TLS26070 現有 columns 定義。
//
// ⚠️ 查詢條件疊加限制：TLS26070QueryRequest 完全沒有 team_name/division_name 這類篩選參數
// （後端 TLS26070Request.cs 逐一比對過，欄位跟 TLS26050Request 幾乎一致：floor/region/bus_type/
// bus_class/tlt_kind/tlt_term_type/org_id/tlt_no/tax，沒有任何 team/division 相關參數），

// 漏列、這次一併補上，後端 TLS26050Response 實際上有回傳）與 tlt_kind（櫃別代碼，兩邊介面都有）。
// team_name/division_name 兩個規格特別點名的欄位，實際上無法帶進查詢條件，只能拿來當 Modal 標題
// 顯示脈絡；這是已跟需求方確認過的已知精準度落差（見 SPEC-業績報表各櫃層級下鑽 的「已知風險」段落），
// 使用時 Modal 顯示的會是「主查詢條件 + 該列大分類/櫃別」範圍內的各櫃明細，不會精準縮到單一 TEAM/組別。
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

  readonly detailQueryFn = (body: TLS26070QueryRequest) =>
    this.tls26070Service.queryTLS26070(body).pipe(
      map((response: { Data?: { QueryData?: TLS26070Data[] }; TotalCount?: number }) => ({
        Data: response.Data?.QueryData ?? [],
        TotalCount: response.TotalCount ?? 0
      })),
      takeUntilDestroyed(this.destroyRef),
    );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData) {
      this.data = [];
      this.totalRecords = 0;
      this.columns = this.buildColumns(this.queryConditions?.tax ?? true);
      this.queryDetail();
    }
  }

  // 沿用主查詢頁的 lastQueryBody，疊加被點擊列可用且真的對得上 TLS26070QueryRequest 篩選參數的欄位
private buildRequest(): TLS26070QueryRequest {
  const q = this.queryConditions ?? {};
  const row = this.rowData!;

  const request: TLS26070QueryRequest = {
    ...q,

    // 館別
    tlt_building: row.tlt_building
      ? [row.tlt_building]
      : undefined,

    // 大分類
    bus_type: row.bus_type
      ? [row.bus_type]
      : q.bus_type,

    // 櫃別
    tlt_kind: row.tlt_kind
      ? [row.tlt_kind]
      : q.tlt_kind,

    // 組別代碼 -> TLS26070 org_id
    org_id: row.division_no
      ? [row.division_no]
      : q.org_id,
  };

  console.log('===== TLS26070 最終 Request =====');
  console.log('rowData =', row);
  console.log('tlt_building =', request.tlt_building);
  console.log('bus_type =', request.bus_type);
  console.log('tlt_kind =', request.tlt_kind);
  console.log('division_no =', row.division_no);
  console.log('org_id =', request.org_id);
  console.log('request =', request);

  return request;
}
  private queryDetail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;
    this.detailQueryFn(request).subscribe({
      next: (res) => {
        this.data = res.Data ?? [];
        this.totalRecords = res.TotalCount ?? this.data.length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // 欄位定義比照 TLS26070 現有 columns（tls26070.component.ts setColumns()）
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

    // 目標
    {
      field: 'budget_now',
      header: '目標',
      visible: true,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 當期預售金額
    {
      field: 'preorder_amt_now',
      header: '當期預售金額',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'preorder_namt_now',
      header: '當期預售金額',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 目標達成率
    {
      field: 'Achievement_rate_now',
      header: '目標達成率',
      visible: tax,
      format: (value: number) => value ? `${value.toFixed(2)}%` : '0%',
      isTotal: true,
      align: 'right',
      exportFormat: 'percentage'
    },
    {
      field: 'nAchievement_rate_now',
      header: '目標達成率',
      visible: !tax,
      format: (value: number) => value ? `${value.toFixed(2)}%` : '0%',
      isTotal: true,
      align: 'right',
      exportFormat: 'percentage'
    },

    // 當期交易筆數
    {
      field: 'preorder_custcnt_now',
      header: '當期交易筆數',
      visible: true,
      isTotal: true,
      format: formatAmount,
      align: 'right'
    },

    // 當期客單價
    {
      field: 'avg_ordervalue_now',
      header: '當期客單價',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'navg_ordervalue_now',
      header: '當期客單價',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 去年同期預售金額
    {
      field: 'preorder_amt_last',
      header: '去年同期預售金額',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'preorder_namt_last',
      header: '去年同期預售金額',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 去年同期交易筆數
    {
      field: 'preorder_custcnt_last',
      header: '去年同期交易筆數',
      visible: true,
      isTotal: true,
      format: formatAmount,
      align: 'right'
    },

    // 去年同期客單價
    {
      field: 'avg_ordervalue_last',
      header: '去年同期客單價',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'navg_ordervalue_last',
      header: '去年同期客單價',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 成長比
    {
      field: 'Growth',
      header: '成長比',
      visible: tax,
      format: (value: number) => value ? `${value.toFixed(2)}%` : '0%',
      isTotal: true,
      align: 'right',
      exportFormat: 'percentage'
    },
    {
      field: 'nGrowth',
      header: '成長比',
      visible: !tax,
      format: (value: number) => value ? `${value.toFixed(2)}%` : '0%',
      isTotal: true,
      align: 'right',
      exportFormat: 'percentage'
    },

    // 業績差異
    {
      field: 'PerformanceDiff',
      header: '業績差異',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'nPerformanceDiff',
      header: '業績差異',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 交易筆數差異
    {
      field: 'TransactionsNumber',
      header: '交易筆數差異',
      visible: true,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 客單差異
    {
      field: 'OrdervalueDiff',
      header: '客單差異',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'nOrdervalueDiff',
      header: '客單差異',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },

    // 營業坪數
    {
      field: 'tlt_space',
      header: '營業坪數',
      visible: true,
      format: (value) => formatAmountWithDecimals(value, 2),
      isTotal: true,
      align: 'right',
      exportFormat: 'decimal2'
    },

    // 月坪效
    {
      field: 'MonthlyFloorEffect',
      header: '月坪效',
      visible: tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    },
    {
      field: 'nMonthlyFloorEffect',
      header: '月坪效',
      visible: !tax,
      format: formatAmount,
      isTotal: true,
      align: 'right'
    }
  ];
}
}
