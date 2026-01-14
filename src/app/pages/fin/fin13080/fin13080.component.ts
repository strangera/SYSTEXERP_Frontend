import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

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
    YearMonthComponent,
    TableComponent,
    ButtonModule,
  ],
})
export class FIN13080Component extends BasicQueryPageComponent<any> implements OnInit {

  loadGuiTrackOptions(event: any): void {
    // 接受 YearMonth 的變更事件，必要時可載入字軌下拉
    console.log('[loadGuiTrackOptions] GUI_YYMM changed:', event);
  }

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

    // 註冊能接受 YYYYMM 字串或 Date 的偶數月驗證器
    this.queryForm.get('GUI_YYMM')?.setValidators([this.evenMonthYyyymmValidator.bind(this)]);
    this.queryForm.get('Invoice_No_Start')?.valueChanges.subscribe(start => {
      const endControl = this.queryForm.get('Invoice_No_End');
      if (!endControl?.value && start) {
        endControl?.setValue(start);
      }
    });
  }

  // 驗證器：接受 YYYYMM 字串或 Date 物件，檢查是否為偶數月
  evenMonthYyyymmValidator(control: { value: any }): any {
    const value = control.value;
    if (value === null || value === '') return null;

    // YYYYMM 字串情況
    if (typeof value === 'string' && value.length === 6) {
      const month = parseInt(value.substring(4, 6), 10);
      if (isNaN(month)) return { invalidDate2: true };
      return month % 2 === 0 ? null : { invalidEvenMonth: true };
    }

    // Date 物件情況，委派給現有的 service
    if (value instanceof Date) {
      return this.validationService.evenMonthValidator({ value: value });
    }

    return { invalidDate2: true };
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
      GUI_YYMM: raw.GUI_YYMM
        ? (typeof raw.GUI_YYMM === 'string' && raw.GUI_YYMM.length === 6
          ? raw.GUI_YYMM
          : this.formatDate(new Date(raw.GUI_YYMM)).substring(0, 7).replace('-', ''))
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
