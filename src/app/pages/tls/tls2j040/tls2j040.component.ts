import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2J040Request, TLS2j040Service } from '@service/api/tls/tls2j040.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { createPaginationConfig, formatAmount } from '../../../others/component/table/table.model';
import { GUI_STATUS_OPTIONS } from '../tls2j030/tls2j030.model';

@Component({
  selector: 'app-tls2j040',
  templateUrl: './tls2j040.component.html',
  styleUrl: './tls2j040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, TranslateModule, CalendarComponent, CommonModule,
    TableReportComponent
  ]
})
export class TLS2J040Component extends BasicQueryPageComponent<any> implements OnInit {

  // Updated form group to match the fields in TLS2J040Request
  queryForm = this.formBuilder.group({
    TxnDate: ['', Validators.required],               // 換開日期 (TxnDate)
    TxnGUINo: ['', [Validators.maxLength(20)]],        // 三聯式發票號碼 (TxnGUINo)
    TxnUniform: ['', [Validators.maxLength(8)]],       // 買受人統一編號 (TxnUniform)
    ...createPaginationConfig([{ field: 'TxnGUINo', order: 1 }]),
    pageSize: [1000],
  });

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  readonly tableData = signal<any[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: any;

  constructor(
    private readonly service: TLS2j040Service,
  ) {
    super();
  }

  columns: ReportColumn[] = [
    { field: 'InvoiceCreateDate', header: '換開日期', visible: true, format: this.formatDateOnly },


    { field: 'InvoiceNumber', header: '發票號碼', visible: true },

    { field: 'BuyerUniform', header: '統一編號', visible: true },

    { field: 'AmountNTax', header: '金額', visible: true, format: formatAmount },

    { field: 'TotalTax', header: '稅額', visible: true },

    // TaxType 已在後端轉中文，所以直接顯示
    { field: 'TaxType', header: '稅別', visible: true },

    { field: 'GUI_Status', header: '換開狀態', visible: true, format: (v: string) => GUI_STATUS_OPTIONS.find(o => o.value === String(v ?? ''))?.label ?? v },
  ];

  formatDateOnly(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? raw?.pageSize ?? 1000;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? raw?.pageIndex ?? 1;
    const payload = {
      TxnDate: raw.TxnDate,
      TxnGUINo: raw.TxnGUINo || undefined,
      TxnUniform: raw.TxnUniform || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body?.SortBy ?? raw?.SortBy,
    };
    return this.service.queryTLS2J040(payload);
  };

  onRowClick(row: any) {
    // 已作廢的換開發票不開 PDF
    if (String(row?.GUI_Status) === '1') return;

    const payload: TLS2J040Request = {
      TxnDate: row.InvoiceCreateDate,  // 換開日期
      TxnGUINo: row.InvoiceNumber,      // 三聯式發票號碼
      TxnUniform: row.BuyerUniform      // 買受人統一編號
    };

    this.service.print(payload)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response.Status === '0000' && response.Data?.Print_URL) {
          let rawUrl = response.Data.Print_URL.startsWith('http')
            ? response.Data.Print_URL
            : `${environment.BaseUrl}${response.Data.Print_URL}`;
          rawUrl = decodeURIComponent(rawUrl);

          // 開新分頁
          globalThis.open(rawUrl, '_blank');
        } else {
          this.messageService.errorBubble(response.Message);
        }
      });
  }



  ngOnInit(): void {
    this.initializePage('TLS2J040', '/TLS/TLS2J040', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      this.lastQueryBody = {
        TxnDate: raw.TxnDate,
        TxnGUINo: raw.TxnGUINo || undefined,
        TxnUniform: raw.TxnUniform || undefined,
        PageSize: raw.pageSize ?? 1000,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody).pipe(
        untilDestroyed(this),
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        })
      ).subscribe({
        next: res => {
          if (res?.Status && res.Status !== '0000') {
            this.messageService.errorBubble(res.Message ?? '查詢失敗');
          } else {
            this.tableData.set(res?.Data ?? []);
            this.totalRecords.set(res?.TotalCount ?? 0);
          }
        }
      });
    });
  }

  print(row: any): void {
    if (!row) {
      this.messageService.errorBubble('請先選擇資料！');
      return;
    }

    const payload: TLS2J040Request = {
      TxnDate: row.InvoiceCreateDate,   // 發票開立日期
      TxnGUINo: row.InvoiceNumber,      // 發票號碼
      TxnUniform: row.BuyerUniform,     // 買方統一編號
    };

    this.loading = true;

    this.service.print(payload)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {

        if (response.Status === '0000' && response.Data?.Print_URL) {
          let rawUrl = response.Data.Print_URL.startsWith('http')
            ? response.Data.Print_URL
            : `${environment.BaseUrl}${response.Data.Print_URL}`;
          rawUrl = decodeURIComponent(rawUrl);
          console.log('rawUrl', rawUrl);
          this.pdfUrl = rawUrl;
        } else {
          this.messageService.errorBubble(response.Message);
        }

      });
  }

}
