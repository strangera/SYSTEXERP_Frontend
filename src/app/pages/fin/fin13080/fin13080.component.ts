import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { map } from 'rxjs';
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { formatAmount, formatDate as formatDateDisplay } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin13080',
  templateUrl: './fin13080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarComponent,
    TooltipModule,
    InputTextComponent,
    TableReportComponent,
    YearMonthComponent,
    ButtonModule,
  ],
})
export class FIN13080Component extends BasicQueryPageComponent<any> implements OnInit {

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  queryForm = this.formBuilder.group({
    No: [null, Validators.maxLength(16)],
    Date: [new Date(), Validators.required],
    INV_DeclareYM: [null],
    Invoice_No_Start: ['', Validators.maxLength(10)],
    Invoice_No_End: ['', Validators.maxLength(10)],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'No', order: 1 }]],
  });

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  Date: Date | null = null;
  minDate?: Date;
  columns: ReportColumn[] = [
    { field: 'No', header: '退回/折讓單號', visible: true },
    { field: 'Date', header: '退回/折讓日期', visible: true, format: (v: string) => formatDateDisplay(v) },
    { field: 'INV_DeclareYM', header: '發票年月', visible: true },
    { field: 'Invoice_No', header: '發票號碼', visible: true },
    { field: 'SaleAmt', header: '折讓金額', visible: true, align: 'right', format: (v: number | string) => formatAmount(v) },
    { field: 'INV_Cancel', header: '折讓狀態', visible: true, format: (v: string) => v === 'Y' ? '作廢' : v === 'N' ? '開立' : v }
  ];

  constructor(
    public readonly fin13080Service: Fin13080Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13080', '/FIN/FIN13080cru', this.queryForm, (form) => this.onSubmit(form));

    this.queryForm.get('Invoice_No_Start')?.valueChanges.subscribe(start => {
      const endControl = this.queryForm.get('Invoice_No_End');
      if (!endControl?.value && start) {
        endControl?.setValue(start);
      }
    });
  }

  // 表單小寫欄位 -> 後端要的大寫分頁欄位 + 日期格式化
  private buildPayload(raw: any) {
    return {
      PageSize: raw.pageSize ?? 20,
      PageIndex: raw.pageIndex ?? 1,
      OrderBy: '',
      Offset: 0,
      SortBy: raw.SortBy ?? [{ field: 'No', order: 1 }],
      No: raw.No ?? '',
      Date: raw.Date ? this.formatDate(new Date(raw.Date)) : '',
      INV_DeclareYM: raw.INV_DeclareYM
        ? this.formatDate(new Date(raw.INV_DeclareYM)).substring(0, 7).replace('-', '')
        : '',
      Invoice_No_Start: raw.Invoice_No_Start !== '' ? raw.Invoice_No_Start : null,
      Invoice_No_End: raw.Invoice_No_End !== '' ? raw.Invoice_No_End : null,
    };
  }

  private mapResponseData(data: { Date?: string }[]) {
    return (data ?? []).map(item => ({
      ...item,
      Date: item.Date ? this.formatDate(new Date(item.Date)) : ''
    }));
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;
    this.loading = true;

    const raw = form.value;
    const payload = this.buildPayload(raw);

    this.fin13080Service.queryFIN13080(payload).subscribe({
      next: (res) => {
        this.lastQueryBody = raw;
        this.data = this.mapResponseData(res?.Data ?? []);
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;
      },

    });
  }

  // table-report 內部捲動載入/排序會直接呼叫這支，需重現 onSubmit 的大寫欄位轉換與回應格式化
  queryFn = (body: any) => this.fin13080Service.queryFIN13080(this.buildPayload(body)).pipe(
    map(res => ({ ...res, Data: this.mapResponseData(res?.Data ?? []) }))
  );

  isRowSelectable = (row: any): boolean => !!row?.CanDel;

  onDelete(rowData: any[]) {
    if (!rowData || rowData.length === 0) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }

    if (rowData.some(r => !r?.CanDel)) {
      this.messageService.warnBubble('已審核之申報年月資料不可刪除');
      return;
    }

    this.messageService.confirm({
      header: '是否確認刪除',
      accept: () => {
        const payload = {
          IDs: rowData.map(item => ({
            ID: item.ID,
            DataType: item.DataType ?? "",
            InvoiceType: item.InvoiceType ?? ""
          }))
        };

        console.log('FIN13080 刪除 payload:', JSON.stringify(payload));

        this.fin13080Service.updateFIN13080(payload).subscribe((res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });
      }
    });
  }

}
