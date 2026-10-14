import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ColumnGroup, formatAmount, formatPercentage } from '@others/component/table/table.model';
import { footerShowTotal, TLS31020Total } from '@service/api/tls/tls31020.service';
import { TLS31050DetailItem, TLS31050DetailRequest, TLS31050Item, TLS31050PrintDetailRequest, TLS31050Request, Tls31050Service } from '@service/api/tls/tls31050.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../../../../shared/components/notification-message/notification.service';
import { formatAmountWithDecimals, ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';
import { applyDisplayStatusVisibility } from '../../TLS30000/common/report-display-status.util';

@Component({
  selector: 'app-tls31050-cru',
  standalone: true,
  imports: [TableReportComponent, ButtonModule, DialogModule],
  templateUrl: './tls31050-cru.component.html'
})
export class Tls31050CRUComponent implements OnChanges {
  private readonly tls31050Service = inject(Tls31050Service);
  private readonly messageService = inject(NotificationService);

  @Input() visible = false;
  @Input() rowData: TLS31050Item | null = null;
  @Input() queryConditions: TLS31050Request | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  btnLoading = false;
  totalRecords = 0;
  data: TLS31050DetailItem[] = [];
  footerTotal: TLS31020Total | null = null;
  footershowTotal: footerShowTotal | null = null;
  historyRequestBody: TLS31050DetailRequest | null = null;

  readonly detailQueryFn = (body: TLS31050DetailRequest) =>
    this.tls31050Service.queryTLS31050Detail(body);

  // --- 動態欄位重構點 --- (定義明細動態欄位)
  columns: ReportColumn[] = [
    { field: 'building_desc', header: '館別', align: 'left' },
    { field: 'org_name', header: '組織名稱', align: 'left' },
    { field: 'tlt_kind', header: '櫃別', align: 'left' },
    { field: 'tlt_no', header: '專櫃編號', align: 'left' },
    { field: 'location_no', header: '位置編號', align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', align: 'left' },
    { field: 'budget', header: '營業目標', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AVN_TotSaleAmt', header: '營業實績', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'NormalSales', header: '正品', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'SpecialSales', header: '特價', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'Discount95Sales', header: '95折', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'Discount90Sales', header: '9折', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'Discount80Sales', header: '8折', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'Discount70Sales', header: '7折', groupField: '營業額', format: formatAmount, align: 'right' },
    { field: 'AchievementRate', header: '達成率', groupField: '營業額', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'BudgetRate', header: '營業目標佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'PerformanceRate', header: '營業實績佔比', groupField: '營業佔比', format: (v) => formatPercentage(v, 2), align: 'right' },
    { field: 'TxnCount', header: '交易筆數', groupField: '客單價', format: formatAmount, align: 'right' },
{ 
  field: 'AvgTicket', 
  header: '客單價', 
  groupField: '客單價', 
  format: (v) => formatAmountWithDecimals(v, 2), 
  align: 'right' 
},
    { field: 'tlt_space', header: '坪數', groupField: '營業坪效', format: (v) => formatAmountWithDecimals(v, 2), align: 'right' },
    { field: 'MonthlyPSM', header: '坪效', groupField: '營業坪效', format: formatAmount, align: 'right' },
    { field: 'MonthlyBudgetTotal', header: '月營業目標', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'MonthlySalesTotal', header: '月營業實績', groupField: '月累計', format: formatAmount, align: 'right' },
    { field: 'CompletionRate', header: '完成率', groupField: '月累計', format: (v) => formatPercentage(v, 2), align: 'right' },

    { field: 'PrePerformance', header: '預售業績', visible: false, format: formatAmount, align: 'right' },
    { field: 'ConsumerNum', header: '消費人數', visible: false, format: formatAmount, align: 'right' },
    { field: 'ConsumerOrder', header: '消費客單', visible: false, format: formatAmount, align: 'right' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.footerTotal = null;
      this.totalRecords = 0;
      this.setColumns();
      this.queryDetail();
    }
  }

  // --- 動態欄位重構點 --- (明細顯隱同步)
  private setColumns(): void {
    this.columns = applyDisplayStatusVisibility(this.columns, {
      preSale: this.queryConditions?.PreSale === true,
      consumerNum: this.queryConditions?.ConsumerNum === true,
      fallbackWhenUnset: true,
    });
  }

  // --- 動態欄位重構點 --- (帶入 PreSale 與 ConsumerNum 參數)
  private buildRequest(): TLS31050DetailRequest {
    const q = this.queryConditions!;
    return {
      TXN_DateS: q.TXN_DateS,
      TXN_DateE: q.TXN_DateE,
      TLT_NO: q.TLT_NO ?? [],
      tlt_building: q.tlt_building ?? [],
      tlt_floor: q.tlt_floor ?? [],
      area_no: q.area_no ?? [],
      bus_type: q.bus_type ?? [],
      bus_class: q.bus_class ?? [],
      bus_sclass: q.bus_sclass ?? [],
      tlt_kind: q.tlt_kind ?? [],
      tlt_term_type: this.rowData!.tlt_term_type,
      org_id: q.org_id ?? [],
      TaxType: q.TaxType,
      IsRece_Yn: q.IsRece_Yn,
      PreSale: q.PreSale,
      ConsumerNum: q.ConsumerNum,
      pageIndex: 1,
      pageSize: 100
    };
  }

private queryDetail(): void {
  const request = this.buildRequest();
  this.historyRequestBody = request;
  this.loading = true;

  this.tls31050Service.queryTLS31050Detail(request)
    .pipe(finalize(() => this.loading = false))
    .subscribe(res => {
      this.data = res.Data ?? [];
      this.footerTotal = res.TotalData ?? null;

      const totalBudget = this.data.reduce(
        (sum, item) => sum + Number(item.budget ?? 0),
        0
      );

      const totalSales = this.data.reduce(
        (sum, item) => sum + Number(item.AVN_TotSaleAmt ?? 0),
        0
      );

      const totalTxnCount = this.data.reduce(
        (sum, item) => sum + Number(item.TxnCount ?? 0),
        0
      );

      const totalNormalSales = this.data.reduce(
        (sum, item) => sum + Number(item.NormalSales ?? 0),
        0
      );

      const totalSpecialSales = this.data.reduce(
        (sum, item) => sum + Number(item.SpecialSales ?? 0),
        0
      );

      const totalDiscount95Sales = this.data.reduce(
        (sum, item) => sum + Number(item.Discount95Sales ?? 0),
        0
      );

      const totalDiscount90Sales = this.data.reduce(
        (sum, item) => sum + Number(item.Discount90Sales ?? 0),
        0
      );

      const totalDiscount80Sales = this.data.reduce(
        (sum, item) => sum + Number(item.Discount80Sales ?? 0),
        0
      );

      const totalDiscount70Sales = this.data.reduce(
        (sum, item) => sum + Number(item.Discount70Sales ?? 0),
        0
      );

      // 達成率：前端自行計算
      const achievementRate =
        totalBudget !== 0
          ? (totalSales / totalBudget) * 100
          : 0;

      // 客單價：前端自行計算
      const avgTicket =
        totalTxnCount !== 0
          ? totalSales / totalTxnCount
          : 0;

      this.footershowTotal = {
        budget: totalBudget,
        AVN_TotSaleAmt: totalSales,

        NormalSales: totalNormalSales,
        SpecialSales: totalSpecialSales,
        Discount95Sales: totalDiscount95Sales,
        Discount90Sales: totalDiscount90Sales,
        Discount80Sales: totalDiscount80Sales,
        Discount70Sales: totalDiscount70Sales,

        AchievementRate: achievementRate,

        BudgetRate: 100,
        PerformanceRate: 100,

        TxnCount: totalTxnCount,
        AvgTicket: avgTicket,

        MonthlyBudgetTotal: this.footerTotal?.TotalMonthlyBudget ?? 0,
        MonthlySalesTotal: this.footerTotal?.TotalMonthlySales ?? 0,
        CompletionRate: this.footerTotal?.AvgCompletionRate ?? 0,

        PrePerformance: this.footerTotal?.TotalPrePerformance ?? 0,
        ConsumerNum: this.footerTotal?.TotalConsumerNum ?? 0,
        ConsumerOrder: this.footerTotal?.TotalConsumerOrder ?? 0
      } as footerShowTotal;

      this.totalRecords = res.TotalCount;
    });
}
private sumBy(field: keyof TLS31050DetailItem): number {
  return this.data.reduce(
    (sum, item) => sum + Number(item[field] ?? 0),
    0
  );
}

  columnGroup: ColumnGroup[] = [
    { field: '營業額', header: '營業額' },
    { field: '營業佔比', header: '營業佔比' },
    { field: '客單價', header: '客單價' },
    { field: '營業坪效', header: '營業坪效' },
    { field: '月累計', header: '月累計' },
  ];

  onReport(isExcel: boolean): void {
    if (!this.historyRequestBody) return;
    const req: TLS31050PrintDetailRequest = {
      ...this.historyRequestBody,
      IsMerge: true,
      IsExcel: isExcel,
    };
    this.btnLoading = true;
    this.tls31050Service.printTLS31050Detail(req)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (res.Data?.Print_URL) {
          globalThis.open(environment.ApiUrl + res.Data.Print_URL, '_blank');
        }
      });
  }
}
