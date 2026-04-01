import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS15080Service } from '@service/api/ass/ass15080.service';
import {
  ASS15080QueryRequest,
  ASS15080QueryRow,
} from '@pages/ass/ass15080/ass15080.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortOption } from '@shared/models/api/base-api.interface';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

/** 資產重估查詢 */
@UntilDestroy()
@Component({
  selector: 'app-ass15080',
  templateUrl: './ass15080.component.html',
  styleUrl: './ass15080.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS15080Component
  extends BasicQueryPageComponent<ASS15080QueryRow>
  implements OnInit
{
  queryForm = this.formBuilder.nonNullable.group({
    accNo: [null as string | null],
    orgId: [null as string | null],
    appDateFrom: [null as string | null],
    appDateTo: [null as string | null],
    chkDateFrom: [null as string | null],
    chkDateTo: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    goodsId: [null as string | null],
    baseDate: [null as Date | string | null],
  });

  accNoOptions: { value: string; label: string }[] = [];
  orgIdOptions: { value: string; label: string }[] = [];
  bClassOptions: { value: string; label: string }[] = [];
  mClassOptions: { value: string; label: string }[] = [];
  sClassOptions: { value: string; label: string }[] = [];
  goodsIdOptions: { value: string; label: string }[] = [];

  readonly tableData = signal<ASS15080QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS15080QueryRequest;
  private readonly defaultPageSize = 30;

  columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '財產編號', visible: true },
    { field: 'GOODS_ID', header: '項目編號', visible: true },
    { field: 'GOODS_NAME', header: '項目名稱', visible: true },
    {
      field: 'CRT_Date',
      header: '異動審核日',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'HOLD_ORG_ID', header: '保管單位', visible: true },
    { field: 'Org_Name', header: '保管單位名稱', visible: true },
    { field: 'UPD_GET_COST', header: '異動價格', visible: true },
    { field: 'UPD_EXP_YEAR', header: '異動耐用年限', visible: true },
    { field: 'NOTES', header: '備註', visible: true },
  ];

  constructor(private readonly ass15080Service: ASS15080Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS15080',
      '',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): ASS15080QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy)
      ? (body.SortBy as SortOption[])
      : undefined;

    const payload: ASS15080QueryRequest = {
      ACC_NO: raw.accNo || undefined,
      ORG_ID: raw.orgId || undefined,
      APP_DATE_S: this.toApiDateValue(raw.appDateFrom),
      APP_DATE_E: this.toApiDateValue(raw.appDateTo),
      CHK_DATE_S: this.toApiDateValue(raw.chkDateFrom),
      CHK_DATE_E: this.toApiDateValue(raw.chkDateTo),
      B_CLASS_ID: raw.bClassId || undefined,
      M_CLASS_ID: raw.mClassId || undefined,
      S_CLASS_ID: raw.sClassId || undefined,
      GOODS_ID: raw.goodsId || undefined,
      BASE_DATE: this.toBaseDateYyyyMm(raw.baseDate),
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as ASS15080QueryRequest;
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }) => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;
    return this.ass15080Service.queryASS15080(request).pipe(
      map((res: ApiResponse<ASS15080QueryRow[]>) => {
        const list = res.Status === '0000' ? (res.Data ?? []) : [];
        const mapped = list.map((row, idx) => ({
          ...row,
          RowNum: row.RowNum ?? idx + 1,
          ID:
            row.ID ??
            `${row.ASSET_ID ?? ''}-${row.GOODS_ID ?? ''}-${idx}`,
        }));
        return {
          Data: mapped,
          TotalCount: res.TotalCount ?? mapped.length,
        };
      })
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = this.buildRequest({
        pageSize: this.defaultPageSize,
        pageIndex: 1,
        SortBy: this.lastQueryBody?.SortBy,
      });
      this.tableLoading.set(true);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res) => {
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

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private toBaseDateYyyyMm(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    if (typeof value === 'string') {
      const nums = value.replace(/\D/g, '');
      if (nums.length >= 6) return nums.substring(0, 6);
    }
    return undefined;
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
