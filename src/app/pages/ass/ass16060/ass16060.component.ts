import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16060QueryRequest, ASS16060QueryRow } from './ass16060.model';
import { ASS16060Service } from '@service/api/ass/ass16060.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Sys1000Query } from '@service/utility/dropdown-api.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 領用退料作業 — 查詢 */
@UntilDestroy()
@Component({
  selector: 'app-ass16060',
  templateUrl: './ass16060.component.html',
  styleUrl: './ass16060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS16060Component
  extends BasicQueryPageComponent<ASS16060QueryRow>
  implements OnInit
{
  readonly defaultPageSize = 30;

  readonly queryForm = this.formBuilder.group({
    whId: new FormControl<string | null>(null),
    returnStatus: new FormControl<string | null>(null),
    returnNo: new FormControl<string | null>(null),
    returnEmpId: new FormControl<string | null>(null),
    orgId: new FormControl<string | null>(null),
    returnDateFrom: new FormControl<Date | string | null>(null),
    returnDateTo: new FormControl<Date | string | null>(null),
    pageSize: new FormControl<number>(this.defaultPageSize),
    pageIndex: new FormControl<number>(1),
  });

  readonly qf = computed(() => this.queryForm.controls);

  readonly tableData = signal<ASS16060QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS16060QueryRequest;

  warehouseOptions = signal<{ label: string; value: string | number }[]>([]);
  returnStatusOptions = signal<{ label: string; value: string }[]>([]);
  returnEmpOptions = signal<{ label: string; value: string | number }[]>([]);
  orgOptions = signal<{ label: string; value: string | number }[]>([]);

  readonly columns: ReportColumn[] = [
    { field: 'RETURN_NO', header: '退回單號', visible: true },
    { field: 'RETURN_EMP_ID', header: '退回人代號', visible: true },
    { field: 'WH_NAME', header: '倉別', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    {
      field: 'RETURN_DATE',
      header: '退回日期',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'RETURN_STATUS_NAME', header: '退回狀態', visible: true },
    {
      field: 'DETAIL_COUNT',
      header: '明細筆數',
      visible: true,
      align: 'right',
    },
  ];

  constructor(
    private readonly service: ASS16060Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS16060',
      'ass/ass16060cru',
      this.queryForm,
      this.onSubmit.bind(this),
    );
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropdownApi
      .queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => this.warehouseOptions.set(opts ?? []));

    this.dropdownApi
      .querySys1000({ SYS_Type: 'AM_MTRETURNM_STATUS' } as Sys1000Query)
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          })),
        ),
      )
      .subscribe((opts) => this.returnStatusOptions.set(opts));

    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => this.returnEmpOptions.set(opts ?? []));

    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => this.orgOptions.set(opts ?? []));
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): ASS16060QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize =
      body?.pageSize ??
      body?.PageSize ??
      raw.pageSize ??
      this.defaultPageSize;
    const pageIndex =
      body?.pageIndex ?? body?.PageIndex ?? raw.pageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? body.SortBy : undefined;

    const payload: ASS16060QueryRequest = {
      WH_ID: raw.whId || undefined,
      RETURN_STATUS: raw.returnStatus || undefined,
      RETURN_NO: raw.returnNo || undefined,
      RETURN_EMP_ID: raw.returnEmpId || undefined,
      ORG_ID: raw.orgId || undefined,
      RETURN_DATE_S: this.toApiDateValue(raw.returnDateFrom),
      RETURN_DATE_E: this.toApiDateValue(raw.returnDateTo),
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy as ASS16060QueryRequest['SortBy'],
    };

    return removeEmptyValues(payload) as ASS16060QueryRequest;
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): Observable<ApiResponse<ASS16060QueryRow[]>> => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;
    return this.service.queryASS16060(request).pipe(
      map((res) => {
        if (res.Status !== '0000') {
          return { ...res, Data: [] as ASS16060QueryRow[], TotalCount: 0 };
        }
        const rows = res.Data ?? [];
        const mapped = rows.map((row, idx) => ({
          ...row,
          ID: row.ID ?? row.RETURN_NO ?? `row-${idx}`,
        }));
        return { ...res, Data: mapped, TotalCount: res.TotalCount ?? mapped.length };
      }),
    );
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = this.buildRequest({
        pageSize: rawFormValue.pageSize ?? this.defaultPageSize,
        pageIndex: 1,
        SortBy: this.lastQueryBody?.SortBy,
      });
      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: (res) => {
            if (res.Status !== '0000') {
              this.tableData.set([]);
              this.totalRecords.set(0);
              return;
            }
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
          error: () => {
            this.tableData.set([]);
            this.totalRecords.set(0);
          },
        });
    });
  }

  /** 管理欄檢視：後端未串時僅提示 */
  onTableDetail(_row: ASS16060QueryRow): void {
    this.messageService.infoBubble('待 API 串接');
  }
}
