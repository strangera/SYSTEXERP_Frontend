/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29080Data, FIN29080Service } from '@service/api/fin/fin29080.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin29080',
  templateUrl: './fin29080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    TableComponent
  ]
})
export class FIN29080Component extends BasicQueryPageComponent<FIN29080Data> implements OnInit {

  constructor(
    private fin29080Service: FIN29080Service,
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    QueryDateFrom: [null, Validators.required],
    QueryDateTo: [null, Validators.required],
    PaymentDateFrom: [null],
    PaymentDateTo: [null],
    ...createPaginationConfig([])
  });

  data: FIN29080Data[] = [];
  selectedItems: FIN29080Data[] = [];
  totalRecords = 0;
  btnLoading = false;

  columns: Column[] = [
    { field: 'ID', header: '序號', visible: true },
    { field: 'PaymentDate', header: '預計付款日', visible: true, format: formatDate },
    { field: 'PayableAmount', header: '應付款金額', visible: true, format: formatAmount },
    { field: 'DeductionAmount', header: '代扣款項', visible: true, format: formatAmount },
    { field: 'DiscountInterest', header: '貼現利息', visible: true, format: formatAmount },
    { field: 'EstimatedPayable', header: '預估應付款', visible: true, format: formatAmount },
  ];

  ngOnInit(): void {
    this.initializePage('FIN29080', 'account/fin/fin29080cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryPayload(form.getRawValue());
      this.fin29080Service.queryFIN29080(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(raw: any): any {
    const queryFrom = this.toDateOnly(raw?.QueryDateFrom);
    const queryTo = this.toDateOnly(raw?.QueryDateTo);
    const paymentFrom = this.toDateOnly(raw?.PaymentDateFrom);
    const paymentTo = this.toDateOnly(raw?.PaymentDateTo);

    return {
      ...raw,
      QueryDateFrom: queryFrom,
      QueryDateTo: queryTo,
      PaymentDateFrom: paymentFrom || '',
      PaymentDateTo: paymentTo || '',
    };
  }

  // ========= 匯出 =========
  // TODO: 待實作
  onExportPDF() {
    // if ((this.selectedItems?.length ?? 0) === 0) return this.messageService?.warnBubble?.('請至少選取一筆資料進行匯出。');
    // const payload = {
    //   IDList: this.selectedItems.map(i => i.ID),
    //   PrintType: this.queryForm.controls.PrintType.value || 'A4R',
    // };
    // if (!payload) return;

    // this.btnLoading = true;
    // this.fin29080Service.exportFIN29080PDF(payload)
    //   .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
    //   .subscribe({
    //     next: (r) => this.handleFileExport(r, '.pdf', '預估應付款列印'),
    //     error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
    //   });
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }
}