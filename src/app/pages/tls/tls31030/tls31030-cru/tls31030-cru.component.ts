import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ColumnGroup, formatAmount, formatPercentage } from '@others/component/table/table.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { TLS31030DetailItem, TLS31030DetailRequest, TLS31030Item, TLS31030PrintDetailRequest, TLS31030Request, Tls31030Service } from 'src/app/service/api/tls/tls31030.service';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../../../../shared/component/notification-message/notification.service';
import { formatAmountWithDecimals, ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls31030-cru',
  standalone: true,
  imports: [TableReportComponent, ButtonModule, DialogModule],
  templateUrl: './tls31030-cru.component.html'
})
export class Tls31030CRUComponent implements OnChanges {
  private readonly tls31030Service = inject(Tls31030Service);
  private readonly messageService = inject(NotificationService);

  @Input() visible = false;
  @Input() rowData: TLS31030Item | null = null;
  @Input() queryConditions: TLS31030Request | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  btnPDFLoading = false;
  btnExcelLoading = false;
  totalRecords = 0;
  data: TLS31030DetailItem[] = [];
  footerTotal: TLS31020Total | null = null;
  footershowTotal: footerShowTotal | null = null;
  historyRequestBody: TLS31030DetailRequest | null = null;

  readonly detailQueryFn = (body: TLS31030DetailRequest) =>
    this.tls31030Service.queryTLS31030Detail(body);

  columns: ReportColumn[] = [
    { field: 'building_desc', header: '館別', align: 'left' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'tlt_kind', header: '櫃別', align: 'left' },
    { field: 'tlt_no', header: '專櫃編號', align: 'left' },
    { field: 'location_no', header: '位置編號', align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', align: 'left' },
    { field: 'budget', header: '營業目標', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AVN_TotSaleAmt', header: '營業實績', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AchievementRate', header: '達成率', groupField: '營業額', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'BudgetRate', header: '營業目標佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PerformanceRate', header: '營業實績佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'TxnCount', header: '交易筆數', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'AvgTicket', header: '客單價', groupField: '客單價', format: formatAmount, align: 'right' },
    { field: 'tlt_space', header: '坪數', groupField: '營業坪效', format: (v) => formatAmountWithDecimals(v, 2), align: 'right' },
    { field: 'MonthlyPSM', header: '坪效', groupField: '營業坪效', format: formatAmount, align: 'right' },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'MonthlySalesTotal', header: '月營業實績', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'CompletionRate', header: '完成率', groupField: '月累計', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PreOrderAmt', header: '預售實績', format: formatAmount, align: 'right' },
  ];

  columnGroup: ColumnGroup[] = [
    { field: '營業額', header: '營業額' },
    { field: '營業佔比', header: '營業佔比' },
    { field: '客單價', header: '客單價' },
    { field: '營業坪效', header: '營業坪效' },
    { field: '月累計', header: '月累計' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.footerTotal = null;
      this.footershowTotal = null;
      this.totalRecords = 0;
      this.queryDetail();
    }
  }

  onReport(isExcel: boolean): void {
    if (!this.historyRequestBody) return;
    const req: TLS31030PrintDetailRequest = {
      ...this.historyRequestBody,
      // IsMerge: true,
      IsExcel: isExcel,
    };
    if (isExcel) {
      this.btnExcelLoading = true;
      this.tls31030Service.printTLS31030Detail(req)
        .pipe(finalize(() => this.btnExcelLoading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          if (res.Data?.Print_URL) {
            globalThis.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
          }
        });
    } else {
      this.btnPDFLoading = true;
      this.tls31030Service.printTLS31030Detail(req)
        .pipe(finalize(() => this.btnPDFLoading = false))
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
          if (res.Data?.Print_URL) {
            globalThis.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
          }
        });
    }
  }

  private buildRequest(): TLS31030DetailRequest {
    const q = this.queryConditions!;
    return {
      TXN_DateS: q.TXN_DateS,
      TXN_DateE: q.TXN_DateE,
      tlt_building: q.tlt_building ?? [],
      tlt_floor: q.tlt_floor ?? [],
      area_no: q.area_no ?? [],
      bus_type: this.rowData!.bus_type,
      bus_class: q.bus_class ?? [],
      bus_sclass: q.bus_sclass ?? [],
      tlt_kind: q.tlt_kind ?? [],
      tlt_term_type: q.tlt_term_type ?? [],
      org_id: q.org_id ?? [],
      TaxType: q.TaxType,
      IsRece_Yn: q.IsRece_Yn,
      pageSize: 100,
    };
  }

  private queryDetail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;
    this.tls31030Service.queryTLS31030Detail(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
        this.data = res.Data ?? [];
        this.footerTotal = res.TotalData ?? null;
        this.footershowTotal = this.footerTotal ? {
          budget: this.footerTotal.TotalBudget,
          AVN_TotSaleAmt: this.footerTotal.TotalSales,
          TxnCount: this.footerTotal.TotalTxnCount,
          AvgTicket: this.footerTotal.AvgTicket,
          tlt_space: this.footerTotal.TotalSpace,
          MonthlyPSM: this.footerTotal.AvgPSM,
          MonthlyBudgetTotal: this.footerTotal.TotalMonthlyBudget,
          MonthlySalesTotal: this.footerTotal.TotalMonthlySales,
          AchievementRate: this.footerTotal.AvgAchievementRate,
          CompletionRate: this.footerTotal.AvgCompletionRate,
          PreOrderAmt: this.footerTotal.TotalPreOrderAmt,
        } : null;
        this.totalRecords = res.TotalCount;
      });
  }
}
