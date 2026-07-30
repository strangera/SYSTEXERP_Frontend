import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ASS14030Service } from '@service/api/ass/ass14030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { ASS14030PayDetailRow } from '../ass14030/ass14030.model';

//3.1.4.3  傳票審核傳送作業 - 應收付明細
@Component({
  selector: 'app-ass14030-paydetail',
  templateUrl: './ass14030-paydetail.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, TableReportComponent, TranslateModule],
})
export class ASS14030PayDetailComponent extends BasicQueryPageComponent<ASS14030PayDetailRow> implements OnInit {
  private readonly service = inject(ASS14030Service);
  private readonly destroyRef = inject(DestroyRef);

  data: ASS14030PayDetailRow[] = [];
  totalRecords = 0;
  footerData: Record<string, unknown> | null = null;

  private receiptInsId = '';

  columns: ReportColumn[] = [];

  ngOnInit(): void {
    this.initializePage('ASS14030');
    const state = this.router.lastSuccessfulNavigation?.extras.state as Record<string, unknown> | undefined;
    this.receiptInsId = (state?.['RECEIPT_INS_ID'] as string) ?? '';
    const isReceivable = (state?.['PayType'] as string) === '應收';
    this.columns = this.buildColumns(isReceivable);
    if (!this.receiptInsId) {
      this.messageService.warnBubble('缺少發票維護單號，無法載入資料。');
      return;
    }
    this.loadData();
  }

  private buildColumns(isReceivable: boolean): ReportColumn[] {
    return [
      { field: 'SeqNo', header: isReceivable ? '應收帳款代號' : '應付帳款代號', visible: true, align: 'center' },
      { field: 'ORG_ID', header: '組織代碼', visible: true },
      { field: 'VEN_Uniform', header: '客戶代碼', visible: true },
      { field: 'SUPPLIER_ID', header: '廠商代碼', visible: true },
      { field: 'VouType', header: '傳票類型', visible: true },
      { field: 'sam_yyymm', header: '年月', visible: true },
      { field: 'sam_termno', header: '帳次', visible: true, align: 'center' },
      { field: 'Amt', header: isReceivable ? '應收帳款金額' : '應付帳款金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
      { field: 'VEN_PayType', header: '付款方式', visible: true },
      { field: 'BNKNo', header: '銀行代碼', visible: true },
      { field: 'VEN_BankAccountNo', header: '帳號', visible: true },
      { field: 'VEN_AccountName', header: '戶名', visible: true },
      { field: 'VEN_Name', header: '公司抬頭', visible: true },
      { field: 'AccNo', header: '會計科目', visible: true },
      { field: 'Pay_Date', header: '預計收款日期', visible: true, format: formatDate },
      { field: 'VouDate', header: '立帳日期', visible: true, format: formatDate },
      { field: 'Remark', header: '備註', visible: true },
    ];
  }

  private loadData(): void {
    this.loading = true;
    this.service.queryASS14030PayDetail({ RECEIPT_INS_ID: this.receiptInsId }).pipe(
      this.withLoading(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      this.data = res.Data;
      this.totalRecords = res.TotalCount;
      const totalAmt = this.data.reduce((sum, row) => sum + (row.Amt ?? 0), 0);
      this.footerData = { Amt: totalAmt };
    });
  }

  onBack(): void {
    this.router.navigate(['/account/ass/ass14030'], {
      state: { fromRoute: this.router.url },
    });
  }
}
