import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatPercentage } from '@others/component/table/table.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { TLS32050DetailRequest, TLS32050DetailResponse, TLS32050Request, TLS32050Response, TLS32050Service } from 'src/app/service/api/tls/tls32050.service';
import { NotificationService } from '../../../../shared/components/notification-message/notification.service';
import { ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls32050-cru',
  standalone: true,
  imports: [TableReportComponent, ButtonModule, DialogModule],
  templateUrl: './tls32050-cru.component.html'
})
export class Tls32050CRUComponent implements OnChanges {
  public readonly tls32050Service = inject(TLS32050Service);
  private readonly messageService = inject(NotificationService);

  @Input() visible = false;
  @Input() rowData: TLS32050Response | null = null;
  @Input() queryConditions: TLS32050Request | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  btnLoading = false;
  totalRecords = 0;
  data: TLS32050DetailResponse[] = [];
  historyRequestBody: TLS32050DetailRequest | null = null;

  readonly detailQueryFn = (body: TLS32050DetailRequest) =>
    this.tls32050Service.queryTLS32050Detail(body);

  columns: ReportColumn[] = [
    { field: 'RowType', header: '列別', visible: true, align: 'left' },
    { field: 'TeamId', header: '單位代碼', visible: true, align: 'left' },
    { field: 'TeamName', header: '單位名稱', visible: true, align: 'left' },
    { field: 'OrgId', header: '樓組代碼', visible: true, align: 'left' },
    { field: 'OrgName', header: '樓組名稱', visible: true, align: 'left' },
    { field: 'Base_Target', header: '本期銷售目標', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_SaleAmt', header: '本期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AchieveRate', header: '本期達成率', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },
    { field: 'Base_TxnCnt', header: '本期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Base_AvgTicket', header: '本期客單價', visible: true, format: formatAmount, align: 'right' },

    { field: 'Comp_SaleAmt', header: '上期銷售金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_TxnCnt', header: '上期交易筆數', visible: true, format: formatAmount, align: 'right' },
    { field: 'Comp_AvgTicket', header: '上期客單價', visible: true, format: formatAmount, align: 'right' },
    { field: 'Growth_SaleAmtPct', header: '成長比', visible: true, format: (value) => formatPercentage(value, 2), align: 'right' },

    { field: 'Diff_SaleAmt', header: '銷售金額差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_TxnCnt', header: '交易筆數差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Diff_AvgTicket', header: '客單價差異', visible: true, format: formatAmount, align: 'right' },
    { field: 'Space', header: '營業坪數', visible: true, format: (value) => formatAmountWithDecimals(value, 2), align: 'right' },

    { field: 'Base_DaySpaceEff', header: '本期日平均坪效', visible: true, format: formatAmount, align: 'right' },
    { field: 'BaseCustCnt', header: '本期顧客數', visible: true, format: formatAmount, align: 'right' },
    { field: 'CompCustCnt', header: '上期顧客數', visible: true, format: formatAmount, align: 'right' },
    { field: 'TotalSpace', header: '總坪數', visible: true, format: formatAmount, align: 'right' },
    { field: 'BaseDays', header: '基準天數', visible: true, format: formatAmount, align: 'right' },
  ];

  tlt_kind_Option = [
    { value: '1', label: '正櫃' },
    { value: '2', label: '臨時櫃' },
    { value: '3', label: '特賣會' },
    { value: '4', label: '虛擬櫃' },
  ]

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.totalRecords = 0;
      this.queryTLS32050Detail();
    }
  }

  private buildRequest(): TLS32050DetailRequest {
    const q = this.queryConditions!;
    const row = this.rowData!;

    const tltKindName = row.TltKindName ?? '';
    // 🔎 由名稱找對應的編號
    const tltKindValue =
      this.tlt_kind_Option.find(x => x.label === tltKindName)?.value ?? '';

    return {
      OrgId: row.OrgId ?? '',
      BaseDateFrom: q.BaseDateFrom?.toString() ?? '',
      BaseDateTo: q.BaseDateTo?.toString() ?? '',
      CompareDateFrom: q.CompareDateFrom?.toString() ?? '',
      CompareDateTo: q.CompareDateTo?.toString() ?? '',
      BusClass: row.Bus_Class ?? '',
      TltKind: tltKindValue ?? '', // row.TltKind ?? '', 
      FloorList: q.FloorList ?? '',
      AreaList: q.AreaList ?? '',
      BusTypeList: q.BusTypeList ?? [],
      BusClassList: q.BusClassList ?? [],
      BusSClassList: q.BusSClassList ?? [],
      TltKindList: q.TltKindList ?? '',
      OrgList: q.OrgList ?? '',
      TltNoList: q.TltNoList ?? '',
      TermTypeList: q.TermTypeList ?? '',
      BuildingList: q.BuildingList ?? '',
      AmtTaxMode: q.AmtTaxMode ?? 'G',
      ReceFilter: q.ReceFilter ?? 'A',
    } as TLS32050DetailRequest;
  }

  private queryTLS32050Detail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;
    this.tls32050Service.queryTLS32050Detail(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res: ApiResponse<TLS32050DetailResponse[]>) => {
        this.data = res.Data ?? [];
        this.totalRecords = (res.TotalCount && res.TotalCount > 0) ? res.TotalCount : (this.data?.length ?? 0);
      });
  }

}
