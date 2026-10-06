/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29070Data, FIN29070Service } from '@service/api/fin/fin29070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { TableComponent } from '@others/component/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

@Component({
  selector: 'app-fin29070',
  templateUrl: './fin29070.component.html',
  standalone: true,
  imports: [ReportSignatureComponent, 
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    // InputTextComponent,
    TableComponent,
    DropdownRangeComponent
  ]
})
export class FIN29070Component extends BasicQueryPageComponent<FIN29070Data> implements OnInit {
  constructor(
    private fin29070Service: FIN29070Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    VEN_No_From: [null, Validators.required],                       // 廠商編號(起)
    VEN_No_To: [null, Validators.required],                         // 廠商編號(迄)
    ODM_Date_From: [null, Validators.required], // 立帳日期(起) - 必填
    ODM_Date_To: [null, Validators.required],   // 立帳日期(迄) - 必填
    ...createPaginationConfig([{ field: 'VendorNo', order: 1 }])
  });

  data: FIN29070Data[] = [];
  selectedItems: FIN29070Data[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;
  vendorOptions: any[] = [];

  columns: Column[] = [
    { field: 'VendorNo', header: '廠商編號', visible: true },
    { field: 'PostingDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'APAccountNo', header: '應付科目', visible: true },
    { field: 'VoucherNo', header: '對應傳票號碼', visible: true },
    { field: 'CompanyNo', header: '組織代號', visible: true },
    { field: 'RelatedAccNo', header: '對應科目代號', visible: true },
    { field: 'Description', header: '摘要', visible: true },
    { field: 'Amount', header: '金額', visible: true, format: formatAmount },
  ];

  ngOnInit(): void {
    this.initializePage('FIN29070', 'account/fin/fin29070cru', this.queryForm, (form) => this.onSubmit(form));
    // 載入廠商下拉選單
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this)).subscribe(res =>
        this.vendorOptions = res.Data.map((x: any) => ({ label: `${x.VEN_No} - ${x.Name}`, value: x.VEN_No })));
  }

  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29070Service.queryFIN29070(this.buildQueryPayload(formValue))
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
    if (!formValue.ODM_Date_From || !formValue.ODM_Date_To) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportPDFbtnLoading = true;
    this.fin29070Service.exportFIN29070PDF(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '廠商應付對應科目明細表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportExcel(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.ODM_Date_From || !formValue.ODM_Date_To) {
      this.messageService?.warnBubble?.('請輸入立帳日期（起訖）');
      return;
    }

    this.exportExcelbtnLoading = true;
    this.fin29070Service.exportFIN29070Excel(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportExcelbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '廠商應付對應科目明細表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(formValue: any): any {
    return {
      ...formValue,
      ODM_Date_From: this.toDateOnly(formValue.ODM_Date_From),
      ODM_Date_To: this.toDateOnly(formValue.ODM_Date_To),
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
