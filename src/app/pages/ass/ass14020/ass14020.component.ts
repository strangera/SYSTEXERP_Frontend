import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Ass14020Service, queryASS14020Response } from '@service/api/ass/ass14020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

// 3.1.4.2 請款關帳作業
@Component({
  selector: 'app-ass14020',
  templateUrl: './ass14020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TableReportComponent,
    TranslateModule,
  ]
})
export class ASS14020Component extends BasicQueryPageComponent<queryASS14020Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CloseDate: [new Date(), Validators.required],
  });

  data: queryASS14020Response[] = [];
  totalRecords = 0;
  selectedItems: queryASS14020Response[] = [];

  columns: ReportColumn[] = [
    { field: 'RECEIPT_INS_ID', header: '發票維護單號', visible: true },
    { field: 'NTX_AMT', header: '未稅總金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TX_AMT', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    { field: 'AMT', header: '總金額', visible: true, format: formatAmount, align: 'right' },
  ];

  constructor(private readonly ass14020Service: Ass14020Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS14020');
    this.onQuery();
  }

  private toDateOnlyString(d: Date | null | undefined): string | null {
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onQuery(): void {
    this.loading = true;
    this.ass14020Service.queryASS14020()
      .pipe(untilDestroyed(this), finalize(() => { this.loading = false; }))
      .subscribe(res => {
        this.data = res?.Data?.QueryData ?? [];
        this.totalRecords = res?.Data?.TotalCount ?? 0;
        this.selectedItems = [];
      });
  }

  onClose(frm: FormGroup): void {
    if (!this.selectedItems || this.selectedItems.length === 0) return;
    this.handleSubmit(frm, () => {
      const body = {
        CloseDate: this.toDateOnlyString(frm.value.CloseDate) ?? '',
        ReceiptInvoices: this.selectedItems.map(item => ({
          ReceiptInsId: item.RECEIPT_INS_ID ?? '',
          NoTaxAmt: item.NTX_AMT ?? 0,
          TaxAmt: item.TX_AMT ?? 0,
        })),
      };

      this.loading = true;
      this.messageService.blockUi();
      this.ass14020Service.closeASS14020(body)
        .pipe(untilDestroyed(this), finalize(() => { this.loading = false; this.messageService.unblockUi(); }))
        .subscribe(res => {
          const vouNo = res?.Data?.VoucherList?.map(v => v.VouNo).filter(Boolean).join('、') ?? '';
          this.onQuery();
          setTimeout(() => {
            this.messageService.confirm({
              header: '關帳成功',
              message: `傳票號碼：${vouNo}`,
              icon: 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false
            });
          }, 200);
        });
    });
  }
}
