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
    private fin29080Service: FIN29080Service
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    ACP_Date_From: [null, Validators.required],                  // 立帳日期(起) - 必填
    ACP_Date_To: [null, Validators.required],                    // 立帳日期(迄) - 必填
    ACP_ExpectPayDate_From: [null],         // 預計付款日(起)
    ACP_ExpectPayDate_To: [null],           // 預計付款日(迄)
    ...createPaginationConfig([])
  });

  data: FIN29080Data[] = [];
  selectedItems: FIN29080Data[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;

  columns: Column[] = [
    { field: 'ExpectedPayDate', header: '預計付款日', visible: true, format: formatDate },
    { field: 'PayableAmount', header: '應付金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'WithholdAmount', header: '代扣款項', visible: true, format: formatAmount, isTotal: true },
    { field: 'DiscountInterest', header: '貼現利息', visible: true, format: formatAmount, isTotal: true },
    { field: 'EstimatedPayable', header: '預估應付款', visible: true, format: formatAmount, isTotal: true },
  ];

  showSubTotal = true;
  groupRowsBy = 'ExpectedPayDate';
  showTotal = true;

  ngOnInit(): void {
    this.initializePage('FIN29080', 'account/fin/fin29080cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29080Service.queryFIN29080(this.buildQueryPayload(formValue))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }

  // ========= 匯出 =========
  onExportPDF(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.ACP_Date_From || !formValue.ACP_Date_To) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportPDFbtnLoading = true;
    this.fin29080Service.exportFIN29080PDF(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '應付帳款預估表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportExcel(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.ACP_Date_From || !formValue.ACP_Date_To) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportExcelbtnLoading = true;
    this.fin29080Service.exportFIN29080Excel(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportExcelbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '應付帳款預估表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(formValue: any): any {
    return {
      ...formValue,
      ACP_Date_From: this.toDateOnly(formValue.ACP_Date_From),
      ACP_Date_To: this.toDateOnly(formValue.ACP_Date_To),
      ACP_ExpectPayDate_From: this.toDateOnly(formValue.ACP_ExpectPayDate_From),
      ACP_ExpectPayDate_To: this.toDateOnly(formValue.ACP_ExpectPayDate_To),
    };
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

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}