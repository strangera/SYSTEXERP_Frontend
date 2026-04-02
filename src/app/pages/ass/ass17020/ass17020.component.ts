import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17020Service } from '@service/api/ass/ass17020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import {
  ASS17020DataPayload,
  ASS17020DataRow,
  ASS17020DeptInfo,
  ASS17020FlatRow,
  ASS17020Summary,
  QueryASS17020Request,
} from '@pages/ass/ass17020/ass17020.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import {
  ColumnGroup,
  ReportColumn,
  formatAmount,
} from '@shared/componentkit/table-report/table-report.model';
import { SortOption } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { distinctUntilChanged } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

/** 領用統計表 */
@UntilDestroy()
@Component({
  selector: 'app-ass17020',
  templateUrl: './ass17020.component.html',
  styleUrl: './ass17020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS17020Component
  extends BasicQueryPageComponent<ASS17020FlatRow>
  implements OnInit
{
  queryForm = this.formBuilder.nonNullable.group({
    startDate: [null as Date | string | null, [Validators.required]],
    endDate: [null as Date | string | null, [Validators.required]],
    orgId: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    goodsId: [null as string | null],
  });

  orgOptions: { value: string; label: string }[] = [];
  bigClassOptions: { value: string; label: string }[] = [];
  midClassOptions: { value: string; label: string }[] = [];
  smallClassOptions: { value: string; label: string }[] = [];
  goodsOptions: { value: string; label: string }[] = [];

  readonly tableData = signal<ASS17020FlatRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);

  lastQueryBody?: QueryASS17020Request;
  private readonly defaultPageSize = 30;

  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  summaryFooter: Record<string, unknown> | null = null;

  private readonly baseColumns: ReportColumn[] = [
    { field: 'RowNo', header: '列號', sortField: 'RowNo' },
    { field: 'Goods', header: '品名或物品描述', sortField: 'Goods' },
    {
      field: 'UnitPrice',
      header: '單價',
      align: 'right',
      sortField: 'UnitPrice',
      format: (v) => formatAmount(v as number),
    },
  ];

  private readonly tailColumns: ReportColumn[] = [
    {
      field: 'TotalQty',
      header: '總數量',
      align: 'right',
      sortField: 'TotalQty',
      format: (v) => formatAmount(v as number),
    },
    {
      field: 'TotalAmt',
      header: '總金額',
      align: 'right',
      sortField: 'TotalAmt',
      format: (v) => formatAmount(v as number),
    },
  ];

  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly ass17020Service: ASS17020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS17020',
      '',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
    this.rebuildColumns([]);
    this.loadStaticDropdowns();
    this.setupClassCascades();
  }

  private loadStaticDropdowns(): void {
    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.orgOptions = opts ?? [];
      });

    this.dropdownApi
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.bigClassOptions = opts ?? [];
      });

    this.dropdownApi
      .queryFasItemDropdown({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.goodsOptions = opts ?? [];
      });
  }

  private setupClassCascades(): void {
    this.queryForm.controls.bClassId.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged())
      .subscribe((b) => {
        this.queryForm.patchValue(
          { mClassId: null, sClassId: null },
          { emitEvent: false }
        );
        this.midClassOptions = [];
        this.smallClassOptions = [];
        if (!b) {
          return;
        }
        this.dropdownApi
          .queryFaClass1({ B_CLASS_ID: b })
          .pipe(untilDestroyed(this))
          .subscribe((opts) => {
            this.midClassOptions = opts ?? [];
          });
      });

    this.queryForm.controls.mClassId.valueChanges
      .pipe(untilDestroyed(this), distinctUntilChanged())
      .subscribe((m) => {
        this.queryForm.patchValue({ sClassId: null }, { emitEvent: false });
        this.smallClassOptions = [];
        if (!m) {
          return;
        }
        this.dropdownApi
          .queryFaClass2({ M_CLASS_ID: m })
          .pipe(untilDestroyed(this))
          .subscribe((opts) => {
            this.smallClassOptions = opts ?? [];
          });
      });
  }

  private sanitizeDeptKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private deptQtyField(key: string): string {
    return `dept__${this.sanitizeDeptKey(key)}__Qty`;
  }

  private deptAmtField(key: string): string {
    return `dept__${this.sanitizeDeptKey(key)}__Amt`;
  }

  private rebuildColumns(deptData: ASS17020DeptInfo[]): void {
    const deptCols: ReportColumn[] = [];
    for (const d of deptData) {
      const k = d.Key;
      const qf = this.deptQtyField(k);
      const af = this.deptAmtField(k);
      deptCols.push({
        field: qf,
        header: '數量',
        groupField: k,
        align: 'right',
        sortField: qf,
        format: (v) => formatAmount(v as number),
      });
      deptCols.push({
        field: af,
        header: '金額',
        groupField: k,
        align: 'right',
        sortField: af,
        format: (v) => formatAmount(v as number),
      });
    }
    this.columns = [...this.baseColumns, ...deptCols, ...this.tailColumns];
    this.columnGroup = deptData.map((d) => ({ field: d.Key, header: d.Name }));
  }

  private flattenRow(
    row: ASS17020DataRow,
    deptInfos: ASS17020DeptInfo[],
    pageIndex: number,
    rowIndex: number
  ): ASS17020FlatRow {
    const out: ASS17020FlatRow = {
      RowNo: row.RowNo,
      Goods: row.Goods,
      UnitPrice: row.UnitPrice,
      TotalQty: row.TotalQty,
      TotalAmt: row.TotalAmt,
      __rowUid: `${pageIndex}-${rowIndex}-${row.RowNo}`,
    };
    for (const d of deptInfos) {
      const det = row.Depts?.[d.Key];
      out[this.deptQtyField(d.Key)] = det?.Qty ?? null;
      out[this.deptAmtField(d.Key)] = det?.Amt ?? null;
    }
    return out;
  }

  private flattenSummary(
    summary: ASS17020Summary | null | undefined,
    deptInfos: ASS17020DeptInfo[]
  ): Record<string, unknown> | null {
    if (!summary) {
      return null;
    }
    const row: Record<string, unknown> = {
      RowNo: '',
      Goods: '總計',
      UnitPrice: '',
      __rowUid: 'summary',
    };
    for (const d of deptInfos) {
      const det = summary.Depts?.[d.Key];
      row[this.deptQtyField(d.Key)] = det?.Qty ?? '';
      row[this.deptAmtField(d.Key)] = det?.Amt ?? '';
    }
    row['TotalQty'] = summary.TotalQty;
    row['TotalAmt'] = summary.TotalAmt;
    return row;
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): QueryASS17020Request {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy)
      ? (body?.SortBy as SortOption[])
      : undefined;

    const payload: QueryASS17020Request = {
      StartDate: this.toApiDateValue(raw.startDate),
      EndDate: this.toApiDateValue(raw.endDate),
      OrgID: raw.orgId || undefined,
      BClassID: raw.bClassId || undefined,
      MClassID: raw.mClassId || undefined,
      SClassID: raw.sClassId || undefined,
      GoodsID: raw.goodsId || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as QueryASS17020Request;
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
    return this.ass17020Service.queryASS17020(request).pipe(
      tap((res: ApiResponse<ASS17020DataPayload>) => {
        if (res.Status === '0000' && res.Data?.QueryData) {
          const deptData = res.Data.QueryData.DeptData ?? [];
          this.rebuildColumns(deptData);
          this.summaryFooter = this.flattenSummary(
            res.Data.QueryData.Summary,
            deptData
          );
        } else {
          this.rebuildColumns([]);
          this.summaryFooter = null;
        }
      }),
      map((res) => {
        if (res.Status !== '0000') {
          return { Data: [] as ASS17020FlatRow[], TotalCount: 0 };
        }
        const qd = res.Data?.QueryData;
        const deptData = qd?.DeptData ?? [];
        const rows = qd?.Data ?? [];
        const pageIndex = request.PageIndex ?? 1;
        const flat = rows.map((row, idx) =>
          this.flattenRow(row, deptData, pageIndex, idx)
        );
        const total = res.Data?.TotalRows ?? res.TotalCount ?? 0;
        return { Data: flat, TotalCount: total };
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
            this.summaryFooter = null;
            this.rebuildColumns([]);
          },
        });
    });
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') {
      return undefined;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    return undefined;
  }

  onClearForm(): void {
    this.queryForm.reset({
      startDate: null,
      endDate: null,
      orgId: null,
      bClassId: null,
      mClassId: null,
      sClassId: null,
      goodsId: null,
    });
    this.midClassOptions = [];
    this.smallClassOptions = [];
  }
}
