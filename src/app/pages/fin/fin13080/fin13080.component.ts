import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TooltipModule } from 'primeng/tooltip';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { yesterday } from '@shared/models/system/query-form.model';
import { ButtonModule } from 'primeng/button';

export const monthOptions = [
  { value: '02', label: '二月' },
  { value: '04', label: '四月' },
  { value: '06', label: '六月' },
  { value: '08', label: '八月' },
  { value: '10', label: '十月' },
  { value: '12', label: '十二月' },
];

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
    TableComponent,
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
    Date: [yesterday],
    GUI_YYMM: [null, [this.validationService.evenMonthValidator]],
    Invoice_No_Start: ['', Validators.maxLength(10)],
    Invoice_No_End: ['', Validators.maxLength(10)],
    ...createPaginationConfig([{ field: 'No', order: 1 }]),
  });
  monthOptions = monthOptions;

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  Date: Date | null = null;
  minDate?: Date;
  columns: any[] = [
    { field: 'No', header: '退回/折讓單號', visible: true },
    { field: 'Date', header: '退回/折讓日期', visible: true },
    { field: 'INV_DeclareYM', header: '發票年月', visible: true },
    { field: 'Invoice_No', header: '發票號碼', visible: true }
  ];

  constructor(
    private fin13080Service: Fin13080Service,
    private validationService: ValidationService,
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
  setMinDate(): Date | undefined {
    if (this.queryForm) {
      const today = new Date();
      const currentMonth = today.getMonth();
      if ((currentMonth + 1) % 2 !== 0) {
        return new Date(today.getFullYear(), currentMonth, 1);
      } else {
        return new Date(today.getFullYear(), currentMonth - 1, 1);
      }
    }
    return undefined;
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;
    this.loading = true;

    const raw = form.value;
    const payload = {
      PageSize: raw.pageSize ?? 20,
      PageIndex: raw.pageIndex ?? 1,
      OrderBy: '',
      Offset: 0,
      SortBy: raw.SortBy ?? [{ field: 'No', order: 1 }],
      No: raw.No ?? '',
      Date: raw.Date ? this.formatDate(new Date(raw.Date)) : '',
      INV_DeclareYM: raw.INV_DeclareYM
        ? this.formatDate(new Date(raw.INV_DeclareYM)).substring(0, 7).replace('-', '') // e.g. "202509"
        : '', No_Start: null,
      Invoice_No_Start: raw.Invoice_No_Start !== '' ? raw.Invoice_No_Start : null,
      Invoice_No_End: raw.Invoice_No_End !== '' ? raw.Invoice_No_End : null,
    };


    this.fin13080Service.queryFIN13080(payload).subscribe({
      next: (res) => {
        this.data = (res?.Data ?? []).map((item: { Date?: string }) => ({
          ...item,
          Date: item.Date ? this.formatDate(new Date(item.Date)) : ''
        }));
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('查詢 FIN13080 失敗:', err);
        this.messageService.errorBubble('查詢失敗，請稍後再試');
        this.loading = false;
      }
    });
  }

  onDelete(rowData: any[]) {
    if (!rowData || rowData.length === 0) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
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
