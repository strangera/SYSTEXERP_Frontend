import { SortMeta } from 'primeng/api';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17040Service } from '@service/api/ass/ass17040.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import {
  formatAmount
} from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Observable, distinctUntilChanged, finalize, map, tap } from 'rxjs';
import { ASS17020TableReportComponent } from '../ass17020/ass17020-table-report.component';
import {
  ColumnGroup,
  ReportColumn,
} from '../ass17020/ass17020-table-report.model';
import {
  ASS17040DataRow,
  ASS17040DeptInfo,
  ASS17040FlatRow,
  ASS17040Summary,
  QueryASS17040DataPayload,
  QueryASS17040Request,
} from './ass17040.model';

@UntilDestroy()
@Component({
  selector: 'app-ass17040',
  templateUrl: './ass17040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    ButtonModule,
    ASS17020TableReportComponent,
    TranslateModule,
  ],
})
export class ASS17040Component
  extends BasicQueryPageComponent<ASS17040FlatRow>
  implements OnInit {
  readonly queryForm = this.formBuilder.nonNullable.group({
    Sdate: [null as Date | null, [Validators.required]],
    Edate: [null as Date | null, [Validators.required]],
    OrgID: [null as string | null],
    bigCategoryCode: [null as string | null],
    midCategoryCode: [null as string | null],
    smallCategoryCode: [null as string | null],
    GoodsID: [null as string | null],
  });

  orgOptions: Option[] = [];
  bigCategoryOptions: Option[] = [];
  midCategoryOptions: Option[] = [];
  smallCategoryOptions: Option[] = [];
  goodsOptions: Option[] = [];

  data: ASS17040FlatRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS17040Request | null = null;

  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  summaryFooter: Record<string, unknown> | null = null;
  exportPdfLoading = false;
  exportExcelLoading = false;

  @ViewChild(ASS17020TableReportComponent)
  tableReport!: ASS17020TableReportComponent;

  private readonly defaultPageSize = 30;

  private readonly baseColumns: ReportColumn[] = [
    { field: 'Seq', header: '序號', sortField: 'Seq' },
    { field: 'GoodsName', header: '品名', sortField: 'GoodsName' },
    {
      field: 'GoodsPrice',
      header: '品項單價',
      align: 'right',
      sortField: 'GoodsPrice',
      format: (v) => formatAmount(v as number),
    },
  ];

  private readonly tailColumns: ReportColumn[] = [
    {
      field: 'TotalQty',
      header: '總計數量',
      align: 'right',
      sortField: 'TotalQty',
      format: (v) => formatAmount(v as number),
    },
    {
      field: 'TotalAmt',
      header: '總計金額',
      align: 'right',
      sortField: 'TotalAmt',
      format: (v) => formatAmount(v as number),
    },
  ];

  constructor(
    private readonly ass17040Service: ASS17040Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17040', '', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    this.rebuildColumns([]);
    this.loadOrgOptions();
    this.loadBigCategoryOptions();
    this.loadGoodsOptions();
    this.setupCategoryListeners();
  }

  private loadOrgOptions(): void {
    this.dropdown
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.orgOptions = opts ?? [];
      });
  }

  private loadBigCategoryOptions(): void {
    this.dropdown
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.bigCategoryOptions = opts ?? [];
      });
  }

  private loadMidCategoryOptions(bClassId: string): void {
    if (!bClassId) {
      this.midCategoryOptions = [];
      return;
    }
    this.dropdown
      .queryFaClass1({ B_CLASS_ID: bClassId })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.midCategoryOptions = opts ?? [];
      });
  }

  private loadSmallCategoryOptions(bClassId: string, mClassId: string): void {
    if (!mClassId) {
      this.smallCategoryOptions = [];
      return;
    }
    this.dropdown
      .queryFaClass2({ B_CLASS_ID: bClassId || undefined, M_CLASS_ID: mClassId })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.smallCategoryOptions = opts ?? [];
      });
  }

  private loadGoodsOptions(): void {
    this.dropdown
      .queryFasItemDropdown({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe((opts: Option[] | null) => {
        this.goodsOptions = opts ?? [];
      });
  }

  private setupCategoryListeners(): void {
    this.queryForm.controls.bigCategoryCode.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((big) => {
        this.queryForm.patchValue(
          { midCategoryCode: null, smallCategoryCode: null },
          { emitEvent: false },
        );
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        if (big) {
          this.loadMidCategoryOptions(big);
        }
      });

    this.queryForm.controls.midCategoryCode.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((mid) => {
        this.queryForm.patchValue({ smallCategoryCode: null }, { emitEvent: false });
        this.smallCategoryOptions = [];
        if (mid) {
          const big = this.queryForm.controls.bigCategoryCode.value ?? '';
          this.loadSmallCategoryOptions(big, mid);
        }
      });

    const initialBig = this.queryForm.controls.bigCategoryCode.value;
    const initialMid = this.queryForm.controls.midCategoryCode.value;
    if (initialBig) {
      this.loadMidCategoryOptions(initialBig);
    }
    if (initialMid) {
      this.loadSmallCategoryOptions(initialBig ?? '', initialMid);
    }
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

  private rebuildColumns(deptData: ASS17040DeptInfo[]): void {
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
        showSort: false,
        format: (v) => formatAmount(v as number),
      });
      deptCols.push({
        field: af,
        header: '金額',
        groupField: k,
        align: 'right',
        showSort: false,
        format: (v) => formatAmount(v as number),
      });
    }
    this.columns = [...this.baseColumns, ...deptCols, ...this.tailColumns];
    this.columnGroup = deptData.map((d) => ({ field: d.Key, header: d.Name }));
  }

  private flattenRow(
    row: ASS17040DataRow,
    deptInfos: ASS17040DeptInfo[],
    pageIndex: number,
    rowIndex: number,
  ): ASS17040FlatRow {
    const out: ASS17040FlatRow = {
      Seq: row.Seq ?? null,
      GoodsName: row.GoodsName ?? null,
      GoodsPrice: row.GoodsPrice ?? null,
      TotalQty: row.TotalQty ?? null,
      TotalAmt: row.TotalAmt ?? null,
      __rowUid: `${pageIndex}-${rowIndex}-${row.Seq ?? ''}-${row.GoodsID ?? ''}`,
    };
    for (const d of deptInfos) {
      const det = row.Depts?.[d.Key];
      out[this.deptQtyField(d.Key)] = det?.Qty ?? null;
      out[this.deptAmtField(d.Key)] = det?.Amt ?? null;
    }
    return out;
  }

  private flattenSummary(
    summary: ASS17040Summary | null | undefined,
    deptInfos: ASS17040DeptInfo[],
  ): Record<string, unknown> | null {
    if (!summary) {
      return null;
    }
    const row: Record<string, unknown> = {
      Seq: '',
      GoodsName: '',
      GoodsPrice: '',
      __rowUid: 'summary',
    };
    for (const d of deptInfos) {
      const det = summary.Depts?.[d.Key];
      row[this.deptQtyField(d.Key)] = det?.Qty ?? 0;
      row[this.deptAmtField(d.Key)] = det?.Amt ?? 0;
    }
    row['TotalQty'] = summary.TotalQty ?? 0;
    row['TotalAmt'] = summary.TotalAmt ?? 0;
    return row;
  }

  private buildPayload(
    raw: ReturnType<typeof this.queryForm.getRawValue>,
    pageSize: number,
    pageIndex: number,
    sortBy: SortMeta[] | undefined,
  ): QueryASS17040Request {
    return removeEmptyValues({
      StartDate: raw.Sdate ? new Date(raw.Sdate).toISOString() : undefined,
      EndDate: raw.Edate ? new Date(raw.Edate).toISOString() : undefined,
      OrgID: raw.OrgID || undefined,
      BClassID: raw.bigCategoryCode || undefined,
      MClassID: raw.midCategoryCode || undefined,
      SClassID: raw.smallCategoryCode || undefined,
      GoodsID: raw.GoodsID || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    }) as QueryASS17040Request;
  }

  private buildExportPayload(): QueryASS17040Request {
    const raw = this.queryForm.getRawValue();
    const currentSort = this.tableReport?.multiSortMeta?.length
      ? [...this.tableReport.multiSortMeta]
      : this.lastQueryBody?.SortBy;
    return this.buildPayload(raw, 0, 0, currentSort);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0')
    );
  }

  queryFunction = (
    body: QueryASS17040Request & {
      pageSize?: number;
      pageIndex?: number;
      PageSize?: number;
      PageIndex?: number;
      SortBy?: SortMeta[];
    },
  ): Observable<ApiResponse<ASS17040FlatRow[]>> => {
    const rawForm = this.queryForm.getRawValue();
    const pageSize =
      body.pageSize ?? body.PageSize ?? this.defaultPageSize;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload = this.buildPayload(
      rawForm,
      pageSize,
      pageIndex,
      body.SortBy,
    );
    return this.ass17040Service.queryASS17040(payload).pipe(
      tap((res: ApiResponse<QueryASS17040DataPayload>) => {
        if (res.Status === '0000' && res.Data?.QueryData) {
          const deptData = res.Data.QueryData.DeptData ?? [];
          this.rebuildColumns(deptData);
          this.summaryFooter = this.flattenSummary(
            res.Data.QueryData.Summary,
            deptData,
          );
        } else {
          this.rebuildColumns([]);
          this.summaryFooter = null;
        }
      }),
      map(
        (res: ApiResponse<QueryASS17040DataPayload>): ApiResponse<
          ASS17040FlatRow[]
        > => {
          if (res.Status !== '0000') {
            return {
              ...res,
              Data: [] as ASS17040FlatRow[],
              TotalCount: 0,
            } as ApiResponse<ASS17040FlatRow[]>;
          }
          const qd = res.Data?.QueryData;
          const deptData = qd?.DeptData ?? [];
          const rows = qd?.Data ?? [];
          const flat = rows.map((row, idx) =>
            this.flattenRow(row, deptData, pageIndex, idx),
          );
          const total = res.Data?.TotalRows ?? res.TotalCount ?? 0;
          return {
            ...res,
            Data: flat,
            TotalCount: total,
          } as ApiResponse<ASS17040FlatRow[]>;
        },
      ),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length
        ? [...this.tableReport.multiSortMeta]
        : undefined;
      this.lastQueryBody = this.buildPayload(
        raw,
        this.defaultPageSize,
        1,
        currentSort,
      );

      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe((res) => {
          if (res.Status !== '0000') {
            return;
          }
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, raw);
        });
    });
  }

  onExportPdf(): void {
    const payload = this.buildExportPayload();
    this.exportPdfLoading = true;
    this.ass17040Service
      .exportPDFASS17040(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.exportPdfLoading = false;
        }),
      )
      .subscribe({
        next: blob => {
          if (blob) {
            this.downloadBlob(blob, `領用退料統計表_${this.getTimestamp()}.pdf`);
          }
        },
        error: () => {
          this.messageService.errorBubble('PDF 匯出失敗，請重試。');
        },
      });
  }

  onExportExcel(): void {
    const payload = this.buildExportPayload();
    this.exportExcelLoading = true;
    this.ass17040Service
      .exportExcelASS17040(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.exportExcelLoading = false;
        }),
      )
      .subscribe({
        next: blob => {
          if (blob) {
            this.downloadBlob(blob, `領用退料統計表_${this.getTimestamp()}.xlsx`);
          }
        },
        error: () => {
          this.messageService.errorBubble('Excel 匯出失敗，請重試。');
        },
      });
  }
}
