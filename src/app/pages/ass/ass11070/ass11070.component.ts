import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11070Service } from '@service/api/ass/ass11070.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { ASS11070Data, ASS11070QueryRequest } from './ass11070.model';

// 3.1.1.7 備用供應商資料維護作業
@Component({
  selector: 'app-ass11070',
  templateUrl: './ass11070.component.html',
  styleUrl: './ass11070.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    InputTextRangeComponent,
    MenubarComponent,
    RadiobuttonComponent,
    TableReportComponent,
  ],
})
export class ASS11070Component extends BasicQueryPageComponent<ASS11070Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    startdate: new FormControl<Date | null>(null),
    enddate: new FormControl<Date | null>(null),
    receptionPerson: new FormControl<string | null>(null),
    vendorUID: new FormControl<string | null>(null),
    bussinessModel: new FormControl<number | null>(null),
    vendorCName: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    vendorEName: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactPerson: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactPhone: new FormControl<string | null>(null, [Validators.maxLength(15)]),
    contactTitle: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactFax: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactCellphone: new FormControl<string | null>(null, [Validators.maxLength(10)]),
    contactEmail: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    companyAddress: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    companyResponsibility: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    paymentMethod: new FormControl<number | null>(null),
    ticketPeriodStart: new FormControl<string | null>(null),
    ticketPeriodEnd: new FormControl<string | null>(null),
    services: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    remark: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11070Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11070QueryRequest;

  public readonly columns: ReportColumn[] = [
    { field: 'CreateDate', header: '建檔日期', format: formatDate },
    { field: 'VendorUID', header: '廠商統一編號' },
    { field: 'VendorName', header: '廠商名稱' },
    { field: 'ContactPerson', header: '聯絡人' },
    { field: 'ContactPhone', header: '聯絡人電話(O)' },
    { field: 'ContactCellphone', header: '聯絡人行動電話' },
  ];

  public readonly bussinessOptions: { value: number; label: string }[] = [
    { value: 1, label: '工廠直銷' },
    { value: 2, label: '代理商' },
    { value: 3, label: '經銷商' },
    { value: 4, label: '零售連鎖' },
    { value: 5, label: '零售一般' },
  ];
  public readonly paymentMethodOptions: { value: number; label: string }[] = [
    { value: 1, label: '電匯' },
    { value: 2, label: '開票' },
    { value: 3, label: '現金' },
  ];

  constructor(
    public readonly service: ASS11070Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11070', '/ASS/ASS11070CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug('ASS11070 init:', [this.queryForm]);
  }

  private toDateString(d: Date | null): string | undefined {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  public queryFunction = (body: ASS11070QueryRequest): Observable<ApiResponse<ASS11070Data[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS11070QueryRequest = {
      CreateDate_S: this.toDateString(raw.startdate ?? null),
      CreateDate_E: this.toDateString(raw.enddate ?? null),
      ReceptionPerson: raw.receptionPerson ?? undefined,
      VendorUID: raw.vendorUID ?? undefined,
      BussinessModel: raw.bussinessModel ?? undefined,
      VendorCName: raw.vendorCName ?? undefined,
      VendorEName: raw.vendorEName ?? undefined,
      ContactPerson: raw.contactPerson ?? undefined,
      ContactPhone: raw.contactPhone ?? undefined,
      ContactTitle: raw.contactTitle ?? undefined,
      ContactFax: raw.contactFax ?? undefined,
      ContactCellphone: raw.contactCellphone ?? undefined,
      ContactEmail: raw.contactEmail ?? undefined,
      CompanyAddress: raw.companyAddress ?? undefined,
      CompanyResponsibility: raw.companyResponsibility ?? undefined,
      PaymentMethod: raw.paymentMethod ?? undefined,
      TicketPeriod_S: raw.ticketPeriodStart ?? undefined,
      TicketPeriod_E: raw.ticketPeriodEnd ?? undefined,
      Services: raw.services ?? undefined,
      Remark: raw.remark ?? undefined,
      PageSize: body.PageSize ?? raw.pageSize ?? 30,
      PageIndex: body.PageIndex ?? raw.pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as ASS11070QueryRequest;
    return this.service.queryASS11070(clean);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        CreateDate_S: this.toDateString(raw.startdate ?? null),
        CreateDate_E: this.toDateString(raw.enddate ?? null),
        ReceptionPerson: raw.receptionPerson ?? undefined,
        VendorUID: raw.vendorUID ?? undefined,
        BussinessModel: raw.bussinessModel ?? undefined,
        VendorCName: raw.vendorCName ?? undefined,
        VendorEName: raw.vendorEName ?? undefined,
        ContactPerson: raw.contactPerson ?? undefined,
        ContactPhone: raw.contactPhone ?? undefined,
        ContactTitle: raw.contactTitle ?? undefined,
        ContactFax: raw.contactFax ?? undefined,
        ContactCellphone: raw.contactCellphone ?? undefined,
        ContactEmail: raw.contactEmail ?? undefined,
        CompanyAddress: raw.companyAddress ?? undefined,
        CompanyResponsibility: raw.companyResponsibility ?? undefined,
        PaymentMethod: raw.paymentMethod ?? undefined,
        TicketPeriod_S: raw.ticketPeriodStart ?? undefined,
        TicketPeriod_E: raw.ticketPeriodEnd ?? undefined,
        Services: raw.services ?? undefined,
        Remark: raw.remark ?? undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
      } as ASS11070QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.logger.debug('ASS11070 onSubmit:', [this.lastQueryBody]);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }
}
