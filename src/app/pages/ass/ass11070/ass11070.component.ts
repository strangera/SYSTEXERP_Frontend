import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11070Service } from '@service/api/ass/ass11070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { QueryASS11070Request, QueryASS11070Response } from './ass11070.model';

// 3.1.1.7 備用供應商資料維護作業
@Component({
  selector: 'app-ass11070',
  templateUrl: './ass11070.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    RadiobuttonComponent,
    MenubarComponent,
    TableReportComponent,
    ButtonModule,
  ],
})
export class ASS11070Component extends BasicQueryPageComponent<QueryASS11070Response> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    crtDateS: new FormControl<Date | null>(null),
    crtDateE: new FormControl<Date | null>(null),
    prStaffId: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    vendorId: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    mangerType: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    vendorName: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    vendorNameE: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactStaff: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactTel: new FormControl<string | null>(null, [Validators.maxLength(15)]),
    contactTitle: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactFax: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    contactMobilePhone: new FormControl<string | null>(null, [Validators.maxLength(10)]),
    contactEmail: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    companyAddress: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    chargeStaff: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    payType: new FormControl<string | null>(null, [Validators.maxLength(20)]),
    ticketPeriod: new FormControl<string | null>(null, [Validators.maxLength(30), Validators.pattern('^[0-9]+$')]),
    serviceItems: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    notes: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    pageSize: new FormControl<number>(10000),
    pageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<QueryASS11070Response[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public readonly staffOptions = signal<{ label: string; value: string; name: string }[]>([]);
  public readonly vendorOptions = signal<{ label: string; value: string }[]>([]);
  public readonly mangerTypeOptions = [
    { value: '1', label: '工廠直銷' },
    { value: '2', label: '代理商' },
    { value: '3', label: '經銷商' },
    { value: '4', label: '零售連鎖' },
    { value: '5', label: '零售一般' },
  ];
  public readonly payTypeOptions = [
    { value: '1', label: '電匯' },
    { value: '2', label: '支票' },
    { value: '3', label: '現金' },
  ];
  public btnPDFLoading = false;
  public btnImportLoading = false;
  public selectedItems: QueryASS11070Response[] = [];
  public lastQueryBody?: QueryASS11070Request;

  public readonly columns: ReportColumn[] = [
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'VENDOR_ID', header: '統一編號' },
    { field: 'VENDOR_NAME', header: '廠商名稱' },
    { field: 'CONTACT_STAFF', header: '聯絡人' },
    { field: 'CONTACT_TEL', header: '聯絡人電話' },
    { field: 'CONTACT_MOBILE_PHONE', header: '聯絡人手機' },
  ];

  constructor(
    public readonly service: ASS11070Service,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11070', '/ASS/ASS11070CRU', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug('ASS11070 init:', [this.queryForm]);
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? []).map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
          name: item.Name,
        }));
        this.staffOptions.set(options);
      },
    });

    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? []).map(item => ({
          label: `${item.VEN_No} - ${item.Name}`,
          value: item.VEN_No ?? '',
        }));
        this.vendorOptions.set(options);
      },
    });
  }

  private resolveStaffName(staffId: string | null): string | undefined {
    if (!staffId) return undefined;
    return this.staffOptions().find(option => option.value === staffId)?.name;
  }

  private toDateString(d: Date | null): string | undefined {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private buildQueryPayload(body: QueryASS11070Request = {}): QueryASS11070Request {
    const pagingBody = body as QueryASS11070Request & { pageSize?: number; pageIndex?: number };
    const raw = this.queryForm.getRawValue();
    const hasLoadMorePaging = pagingBody.pageIndex !== undefined || pagingBody.pageSize !== undefined;
    const pageSize = pagingBody.pageSize ?? pagingBody.PageSize ?? raw.pageSize ?? 10000;
    const pageIndex = pagingBody.pageIndex ?? pagingBody.PageIndex ?? raw.pageIndex ?? 1;
    const payload: QueryASS11070Request = {
      CRT_Date_S: this.toDateString(raw.crtDateS ?? null),
      CRT_Date_E: this.toDateString(raw.crtDateE ?? null),
      PR_STAFF_ID: raw.prStaffId ?? undefined,
      PR_STAFF_NAME: this.resolveStaffName(raw.prStaffId ?? null),
      VENDOR_ID: raw.vendorId ?? undefined,
      MANGER_TYPE: raw.mangerType ?? undefined,
      VENDOR_NAME: raw.vendorName ?? undefined,
      VENDOR_NAME_E: raw.vendorNameE ?? undefined,
      CONTACT_STAFF: raw.contactStaff ?? undefined,
      CONTACT_TITLE: raw.contactTitle ?? undefined,
      CONTACT_TEL: raw.contactTel ?? undefined,
      CONTACT_MOBILE_PHONE: raw.contactMobilePhone ?? undefined,
      CONTACT_EMAIL: raw.contactEmail ?? undefined,
      CONTACT_FAX: raw.contactFax ?? undefined,
      CHARGE_STAFF: raw.chargeStaff ?? undefined,
      VENDOR_REG_ADDR: raw.companyAddress ?? undefined,
      PAY_TYPE: raw.payType ?? undefined,
      TICKET_PERIOD_S: raw.ticketPeriod ?? undefined,
      TICKET_PERIOD_E: raw.ticketPeriod ?? undefined,
      Service_Items: raw.serviceItems ?? undefined,
      NOTES: raw.notes ?? undefined,
      OrderBy: pagingBody.OrderBy,
      Offset: hasLoadMorePaging ? (pageIndex - 1) * pageSize : (pagingBody.Offset ?? (pageIndex - 1) * pageSize),
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: pagingBody.SortBy,
    };
    return removeEmptyValues(payload) as QueryASS11070Request;
  }

  public queryFunction = (body: QueryASS11070Request): Observable<ApiResponse<QueryASS11070Response[]>> => {
    const clean = this.buildQueryPayload(body);
    return this.service.queryASS11070(clean);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = this.buildQueryPayload({
        PageSize: raw.pageSize ?? 10000,
        PageIndex: raw.pageIndex ?? 1,
      });

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

  public onImportFinancialVendors(): void {
    if (this.selectedItems.length === 0) {
      this.messageService.warnBox('請勾選要轉入的廠商');
      return;
    }
    const vendorIds = this.selectedItems
      .map(r => r.VENDOR_ID)
      .filter((id): id is string => !!id);
    const VendorIDList = vendorIds.join(',');
    if (!VendorIDList) {
      this.messageService.warnBox('勾選的廠商無有效統一編號');
      return;
    }
    this.btnImportLoading = true;
    this.service
      .transferToPOS2013ASS11070({ VendorIDList })
      .pipe(
        finalize(() => {
          this.btnImportLoading = false;
        })
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.messageService.successBubble(res.Message ?? '轉入成功');
          this.selectedItems = [];
        },
      });
  }

  public onExportPDF(): void {
    const payload = this.buildQueryPayload();
    this.btnPDFLoading = true;
    this.service
      .exportPDFASS11070(payload)
      .pipe(
        finalize(() => {
          this.btnPDFLoading = false;
        })
      )
      .subscribe(blob => {
        if (!blob) return;
        const now = new Date();
        const timestamp = now.getFullYear().toString()
          + (now.getMonth() + 1).toString().padStart(2, '0')
          + now.getDate().toString().padStart(2, '0')
          + now.getHours().toString().padStart(2, '0')
          + now.getMinutes().toString().padStart(2, '0')
          + now.getSeconds().toString().padStart(2, '0');
        const fileName = `備用供應商資料${timestamp}.pdf`;
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(blobUrl);
      });
  }
}
