import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatPercentage } from '@others/component/table/table.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { TLS32040Request, TLS32040Response } from 'src/app/service/api/tls/tls32040.service';
import { TLS32060Request, TLS32060Response, TLS32060Service } from 'src/app/service/api/tls/tls32060.service';
import { NotificationService } from '../../../../shared/components/notification-message/notification.service';
import { ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';

// 比照 TLS32060(各櫃業績報表) 下鑽：點擊 TEAM 列時改查各櫃層級明細，
// 直接沿用 TLS32060Service.queryTLS32060 + 其既有 ReportColumn 定義，不再呼叫 queryTLS32040Detail。
@Component({
  selector: 'app-tls32040-cru',
  standalone: true,
  imports: [TableReportComponent, ButtonModule, DialogModule],
  templateUrl: './tls32040-cru.component.html'
})
export class Tls32040CRUComponent implements OnChanges {
  private readonly tls32060Service = inject(TLS32060Service);
  private readonly messageService = inject(NotificationService);

  @Input() visible = false;
  @Input() rowData: TLS32040Response | null = null;
  @Input() queryConditions: TLS32040Request | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  totalRecords = 0;
  data: TLS32060Response[] = [];
  historyRequestBody: TLS32060Request | null = null;

  readonly detailQueryFn = (body: TLS32060Request) =>
    this.tls32060Service.queryTLS32060(body);

  // 欄位定義比照 TLS32060 現有 ReportColumn（館別/中小分類/專櫃編號/專櫃名稱/位置編號等）
  columns: ReportColumn[] = [
    { field: 'BuildingName', header: '館別', visible: true, align: 'left' },
    { field: 'TeamId', header: '單位代碼', visible: true, align: 'left' },
    { field: 'TeamName', header: '單位名稱', visible: true, align: 'left' },
    { field: 'OrgId', header: '樓組代碼', visible: true, align: 'left' },
    { field: 'OrgName', header: '樓組名稱', visible: true, align: 'left' },
    { field: 'BusClass', header: '中分類代碼', visible: true, align: 'left' },
    { field: 'BusClassName', header: '中分類名稱', visible: true, align: 'left' },
    { field: 'BusSClass', header: '小分類代碼', visible: true, align: 'left' },
    { field: 'BusSClassName', header: '小分類名稱', visible: true, align: 'left' },
    { field: 'TltNo', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'TltName', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'TltKindName', header: '櫃別名稱', visible: true, align: 'left' },
    { field: 'LocationNo', header: '位置編號', visible: true, align: 'left' },

    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_CustCnt', header: '本期來客數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_MonthSpaceEff', header: '本期月坪效', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },
    { field: 'Base_MonthSpaceContrib', header: '本期月坪貢獻', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },

    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_MonthSpaceEff', header: '上期月坪效', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },
    { field: 'Comp_MonthSpaceContrib', header: '上期月坪貢獻', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },

    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_MonthSpaceEff', header: '月坪效差異', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },
    { field: 'Diff_MonthSpaceContrib', header: '月坪貢獻差異', visible: false, format: (value) => formatAmountWithDecimals(value, 0), align: 'right' },

    { field: 'Space', header: '營業坪數', visible: true, format: (value) => formatAmountWithDecimals(value, 2), align: 'right' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.totalRecords = 0;
      this.setMonthSpaceColumnsVisible(['MONTH', 'HALFYEAR', 'YEAR'].includes(this.queryConditions.ReportType));
      this.queryDetail();
    }
  }

  private setMonthSpaceColumnsVisible(visible: boolean): void {
    const fields = [
      'Base_MonthSpaceEff', 'Base_MonthSpaceContrib',
      'Comp_MonthSpaceEff', 'Comp_MonthSpaceContrib',
      'Diff_MonthSpaceEff', 'Diff_MonthSpaceContrib',
    ];
    this.columns = this.columns.map(col => fields.includes(col.field) ? { ...col, visible } : col);
  }

  // 沿用主查詢頁的 historyRequestBody，僅將被點擊列的 OrgId 帶入 OrgList
  private buildRequest(): TLS32060Request {
    const q = this.queryConditions!;
    return {
      ...q,
      OrgList: this.rowData!.OrgId ?? '',
    } as TLS32060Request;
  }

  private queryDetail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;
    this.tls32060Service.queryTLS32060(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res: ApiResponse<TLS32060Response[]>) => {
        this.data = res.Data ?? [];
        this.totalRecords = (res.TotalCount && res.TotalCount > 0) ? res.TotalCount : (this.data?.length ?? 0);
      });
  }
}
