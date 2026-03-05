import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13040Service } from '@service/api/ass/ass13040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize, forkJoin } from 'rxjs';
import { ASS13040QueryRequest, ASS13040QueryRow } from './ass13040.model';

/** 3.1.3.4 批次報廢作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass13040',
  templateUrl: './ass13040.component.html',
  styleUrl: './ass13040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS13040Component extends BasicQueryPageComponent<ASS13040QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    scrapCode: [null as string | null, [Validators.maxLength(20)]], // 商品報廢單編號
    manageCode: [null as string | null], // 商品管理編號
    userCode: [null as string | null], // 報廢人員編號
    departmentCode: [null as string | null], // 部門代號
    scrapDateFrom: [null as Date | null], // 報廢申請日起
    scrapDateTo: [null as Date | null], // 報廢申請日訖
    scrapStatus: [null as string | null], // 商品報廢單狀態
    PageSize: [30],
    PageIndex: [1],
  });

  manageCodeOptions: Option[] = [];
  userCodeOptions: Option[] = [];
  departmentCodeOptions: Option[] = [];
  scrapStatusOptions: Option[] = [];

  data: ASS13040QueryRow[] = [];
  selectedRows: ASS13040QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: ASS13040QueryRequest | null = null;

  columns: ReportColumn[] = [
    { field: 'SCRAP_FORM_NO', header: '商品報廢單編號', visible: true },
    { field: 'ITEM_NO', header: '商品管理編號', visible: true },
    { field: 'SCRAP_USER_NO', header: '報廢人員編號', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'APPLY_DATE', header: '報廢申請日期', visible: true },
    { field: 'SCRAP_STATUS', header: '商品報廢單狀態', visible: true },
    { field: 'REMARK', header: '說明', visible: true },
  ];

  constructor(
    private readonly ass13040Service: ASS13040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13040', 'ass/ass13040cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadDropdowns();
  }

  queryFunction = (body: unknown): ReturnType<ASS13040Service['queryASS13040']> => {
    const raw = this.queryForm.getRawValue();
    const b = body as Record<string, unknown>;
    const payload: ASS13040QueryRequest = {
      SCRAP_FORM_NO: raw.scrapCode ?? undefined,
      ITEM_NO: raw.manageCode ?? undefined,
      SCRAP_USER_NO: raw.userCode ?? undefined,
      ORG_ID: raw.departmentCode ?? undefined,
      APPLY_DATE_S: raw.scrapDateFrom ? this.formatDate(raw.scrapDateFrom) : undefined,
      APPLY_DATE_E: raw.scrapDateTo ? this.formatDate(raw.scrapDateTo) : undefined,
      SCRAP_STATUS: raw.scrapStatus ?? undefined,
      PageSize: (b['PageSize'] ?? b['pageSize'] ?? 30) as number,
      PageIndex: (b['PageIndex'] ?? b['pageIndex'] ?? 1) as number,
      SortBy: b['SortBy'] as ASS13040QueryRequest['SortBy'],
    };
    return this.ass13040Service.queryASS13040(payload);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        SCRAP_FORM_NO: raw.scrapCode ?? undefined,
        ITEM_NO: raw.manageCode ?? undefined,
        SCRAP_USER_NO: raw.userCode ?? undefined,
        ORG_ID: raw.departmentCode ?? undefined,
        APPLY_DATE_S: raw.scrapDateFrom ? this.formatDate(raw.scrapDateFrom) : undefined,
        APPLY_DATE_E: raw.scrapDateTo ? this.formatDate(raw.scrapDateTo) : undefined,
        SCRAP_STATUS: raw.scrapStatus ?? undefined,
        PageSize: 30,
        PageIndex: 1,
      };
      this.loading = true;
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
            this.selectedRows = [];
            this.queryStateService.setQueryState(this.ProgNo, raw);
          },
        });
    });
  }

  onClearForm(): void {
    this.queryForm.reset({
      scrapCode: null,
      manageCode: null,
      userCode: null,
      departmentCode: null,
      scrapDateFrom: null,
      scrapDateTo: null,
      scrapStatus: null,
      PageSize: 30,
      PageIndex: 1,
    });
  }

  private loadDropdowns(): void {
    forkJoin({
      manageCodes: this.dropdownApiService.queryAss11040Dropdown(),
      users: this.dropdownApiService.queryTblUser(),
      departments: this.dropdownApiService.querySys3100(),
      statuses: this.dropdownApiService.querySys1000({ SYS_Type: 'AM_DAMAGEM_STATUS' }),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ manageCodes, users, departments, statuses }) => {
          this.manageCodeOptions = manageCodes ?? [];
          this.userCodeOptions = users ?? [];
          this.departmentCodeOptions = departments ?? [];
          this.scrapStatusOptions = this.mapToOptions(statuses ?? []);
        },
      });
  }

  private mapToOptions(items: Array<{ No: string; Name: string }>): Option[] {
    return items.map(item => ({
      value: item.No,
      label: `${item.No} - ${item.Name}`,
    }));
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
