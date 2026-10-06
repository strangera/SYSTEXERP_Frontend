import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16060Service } from '@service/api/ass/ass16060.service';
import { Sys1000Query } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ASS16060MasterDisplayRow,
  ASS16060QueryRequest,
} from './ass16060.model';

/** 領用退料作業 — 查詢 */
@UntilDestroy()
@Component({
  selector: 'app-ass16060',
  templateUrl: './ass16060.component.html',
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
  extends BasicQueryPageComponent<ASS16060MasterDisplayRow>
  implements OnInit {
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

  readonly tableData = signal<ASS16060MasterDisplayRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS16060QueryRequest;

  warehouseOptions = signal<{ label: string; value: string | number }[]>([]);
  returnStatusOptions = signal<{ label: string; value: string }[]>([]);
  returnEmpOptions = signal<{ label: string; value: string | number }[]>([]);
  orgOptions = signal<{ label: string; value: string | number }[]>([]);

  readonly columns: ReportColumn[] = [
    { field: 'MTRETURN_ID', header: '退回單號', visible: true },
    { field: 'EMP_ID', header: '退回人員代號', visible: true },
    { field: 'EMP_NAME', header: '退回人員名稱', visible: true },
    { field: 'WH_ID', header: '倉別代號', visible: true },
    { field: 'WH_NAME', header: '倉別名稱', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'ORG_NAME', header: '部門名稱', visible: true },
    {
      field: 'RETURN_DATE',
      header: '退回日期',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'STATUS_NAME', header: '退回狀態', visible: true },
    {
      field: 'detailCount',
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
      MTRETURNM_STATUS: raw.returnStatus || undefined,
      MTRETURN_ID: raw.returnNo || undefined,
      EMP_ID: raw.returnEmpId || undefined,
      ORG_ID: raw.orgId || undefined,
      RETURN_DATE_START: this.toApiDateValue(raw.returnDateFrom),
      RETURN_DATE_END: this.toApiDateValue(raw.returnDateTo),
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
  }): Observable<ApiResponse<ASS16060MasterDisplayRow[]>> => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;
    return this.service.queryASS16060M(request).pipe(
      map((res) => {
        if (res.Status !== '0000') {
          return { ...res, Data: [] as ASS16060MasterDisplayRow[], TotalCount: 0 };
        }
        const rows: ASS16060MasterDisplayRow[] = (res.Data ?? []).map((row) => ({
          ...row,
          detailCount: row.DetailCount ?? 0,
        }));
        return { ...res, Data: rows, TotalCount: res.TotalCount ?? rows.length };
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

  /** 僅「已申請」(1) 可編輯，已審核等其他狀態禁用 */
  readonly editDisabled = (row: ASS16060MasterDisplayRow): boolean =>
    row.MTRETURNM_STATUS !== '1';

  onTableEdit(row: ASS16060MasterDisplayRow): void {
    if (this.editDisabled(row)) return;
    this.onEdit(row);
  }

  /** 管理欄檢視 → CRU Read（整筆 row 帶過去，CRU 頁再打 queryASS16060 補明細） */
  onTableDetail(row: ASS16060MasterDisplayRow): void {
    if (!this.hasPermission(this.Actions.Query)) return;
    this.navigateWithState(CRUDStatus.Read, row);
  }
}
