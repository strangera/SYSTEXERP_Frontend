import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { formatAmount, ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRPayRow, TLS2A030ByDayAndPayNoState } from './tls2a030-bydayandpayno.model';

@Component({
  selector: 'app-tls2a030-bydayandpayno',
  standalone: true,
  templateUrl: './tls2a030-bydayandpayno.component.html',
  imports: [CommonModule, MenubarComponent, ButtonComponent, TableReportComponent, TranslateModule],
})
export class TLS2A030ByDayAndPayNoComponent extends BasicQueryPageComponent<ECRPayRow> implements OnInit {
  private readonly service = inject(TLS2A030Service);
  private readonly destroyRef = inject(DestroyRef);

  data: ECRPayRow[] = [];
  totalRecords = 0;
  footerData: Record<string, unknown> | null = null;
  queryContext: TLS2A030ByDayAndPayNoState | null = null;

  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機編號', visible: true, type: 'link' },
    { field: 'OVER_PayAmt', header: '實際溢欠總額 (A)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'PreAudit_OVER_PayAmt', header: '審核前溢欠總額 (B)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Actual_ReceivedAmt', header: '實收總額 (C)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'BOOK_PayAmt', header: '系統帳 (D)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Compare_CD', header: '(C) 與 (D) 比較', visible: true, align: 'center', format: (v: string) => v === 'O' ? '〇' : '✖' },
    { field: 'Compare_AB', header: '(A) 與 (B) 比較', visible: true, align: 'center', format: (v: string) => v === 'O' ? '〇' : '✖' },
  ];

  ngOnInit(): void {
    this.initializePage('TLS2A030');

    const state = this.router.lastSuccessfulNavigation?.extras.state as TLS2A030ByDayAndPayNoState | undefined;
    if (!state?.TXN_Date || !state?.PAY_NO) {
      this.messageService.warnBubble('缺少查詢條件，請由溢欠彙總表每日資料重新進入。');
      return;
    }
    this.queryContext = state;
    this.loadData();
  }

  private loadData(): void {
    if (!this.queryContext) return;
    this.loading = true;
    this.service.queryTLS2A030_ByDayAndPayNo({
      SaleDate: this.queryContext.TXN_Date,
      PAY_NO: this.queryContext.PAY_NO,
      ECR_No_Start: this.queryContext.ECR_No_Start,
      ECR_No_End: this.queryContext.ECR_No_End,
      PageSize: 999999,
      PageIndex: 1,
      SortBy: [],
    }).pipe(
      this.withLoading(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      this.data = res?.Data?.QueryData ?? [];
      this.totalRecords = this.data.length;
      const total = res?.Data?.payAmtTotalData;
      this.footerData = total ? {
        OVER_PayAmt: total.OVER_Total_PayAmt,
        PreAudit_OVER_PayAmt: total.PreAudit_OVER_Total_PayAmt,
        Actual_ReceivedAmt: total.Actual_ReceivedAmt_Total,
        BOOK_PayAmt: total.BOOK_Total_PayAmt,
        Compare_CD: total.Compare_CD_Total,
        Compare_AB: total.Compare_AB_Total,
      } : null;
    });
  }

  onLinkClick(event: { rowData: ECRPayRow; field: string }): void {
    if (!this.queryContext) return;
    this.router.navigate(['/account/tls/tls2a010'], {
      state: {
        TXN_Date: this.queryContext.TXN_Date,
        ECR_No: event.rowData.ECR_No,
        PAY_NO: this.queryContext.PAY_NO,
        fromRoute: this.router.url,
      },
    });
  }

  onBack(): void {
    if (!this.queryContext) {
      this.router.navigate(['/account/tls/tls2a030']);
      return;
    }
    this.router.navigate(['/account/tls/tls2a030byday'], {
      state: {
        SaleDateStart: this.queryContext.SaleDateStart,
        SaleDateEnd: this.queryContext.SaleDateEnd,
        ECR_No_Start: this.queryContext.ECR_No_Start,
        ECR_No_End: this.queryContext.ECR_No_End,
        fromRoute: this.router.url,
      },
    });
  }
}
