import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS17020DataPayload,
  ASS17020DataRow,
  ASS17020DeptInfo,
  ASS17020FlatRow,
  ASS17020Summary,
  QueryASS17020Request,
} from '@pages/ass/ass17020/ass17020.model';
import { ASS17020Service } from '@service/api/ass/ass17020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { SortOption } from '@shared/models/api/base-api.interface';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { distinctUntilChanged } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ASS17020TableReportComponent } from './ass17020-table-report.component';
import {
  ColumnGroup,
  ReportColumn,
  formatAmount,
  formatAmountWithDecimals,
} from './ass17020-table-report.model';

/** 領用統計表 */
@UntilDestroy()
@Component({
  selector: 'app-ass17020',
  templateUrl: './ass17020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    ASS17020TableReportComponent,
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

  exportPdfLoading = false;
  exportExcelLoading = false;

  lastQueryBody?: QueryASS17020Request;
  private readonly defaultPageSize = 30;

  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  summaryFooter: Record<string, unknown> | null = null;

  private readonly baseColumns: ReportColumn[] = [
    { field: 'RowNo', header: '序號', sortField: 'RowNo' },
    { field: 'Goods', header: '品名', sortField: 'Goods' },
    {
      field: 'UnitPrice',
      header: '品項單價',
      align: 'right',
      sortField: 'UnitPrice',
      format: (v) => formatAmountWithDecimals(v, 2),
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
          .queryFaClass2({
            B_CLASS_ID: this.queryForm.controls.bClassId.value ?? undefined,
            M_CLASS_ID: m,
          })
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
    /** 前綴三欄留空，第一個有值欄為部門數量，使 footer 合併格涵蓋序號+品名+品項單價並顯示 footerLabel「小計」 */
    const row: Record<string, unknown> = {
      RowNo: '',
      Goods: '',
      UnitPrice: '',
      __rowUid: 'summary',
    };
    for (const d of deptInfos) {
      const det = summary.Depts?.[d.Key];
      row[this.deptQtyField(d.Key)] = det?.Qty ?? 0;
      row[this.deptAmtField(d.Key)] = det?.Amt ?? 0;
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

  onExportPdf(): void {
    const payload = this.lastQueryBody;
    if (!payload) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    this.exportPdfLoading = true;
    this.ass17020Service
      .exportPDFASS17020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.exportPdfLoading = false)),
      )
      .subscribe({
        next: blob => {
          if (blob) {
            this.downloadBlob(blob, `領用統計表_${this.getTimestamp()}.pdf`);
          }
        },
        error: () => {
          this.messageService.errorBubble('PDF 匯出失敗，請重試。');
        },
      });
  }

  onExportExcel(): void {
    const payload = this.lastQueryBody;
    if (!payload) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    this.exportExcelLoading = true;
    this.ass17020Service
      .exportExcelASS17020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.exportExcelLoading = false)),
      )
      .subscribe({
        next: blob => {
          if (blob) {
            this.downloadBlob(blob, `領用統計表_${this.getTimestamp()}.xlsx`);
          }
        },
        error: () => {
          this.messageService.errorBubble('Excel 匯出失敗，請重試。');
        },
      });
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
}
