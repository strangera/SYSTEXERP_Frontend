import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS17090QueryRequest,
  ASS17090QueryRow,
  QueryASS17090Detail,
  QueryASS17090Response,
} from '@pages/ass/ass17090/ass17090.model';
import { ASS17090Service } from '@service/api/ass/ass17090.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, Observable, tap } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { formatAmount2, ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import { ApiResponse } from '../../../shared/utils/rxjs-operators/validate-api-response';

@UntilDestroy()
@Component({
  selector: 'app-ass17090',
  templateUrl: './ass17090.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    DropdownComponent,
    CalendarComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS17090Component extends BasicQueryPageComponent<ASS17090QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    queryType: [null as number | null],
    warehouseId: [null as string | null],
    stockDate: [null as Date | null, Validators.required],
    bigCategoryId: [null as string | null],
    midCategoryId: [null as string | null],
    smallCategoryId: [null as string | null],
    goodsId: [null as string | null],
  });
  readonly tableData = signal<ASS17090QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableFooterData = signal<Record<string, number | null | undefined> | null>(null);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS17090QueryRequest;
  exportExcelLoading = false;

  private readonly defaultPageSize = 3000;

  queryTypeOptions = [
    { value: 0, label: '全部' },
    { value: 1, label: '只顯示低於安全庫存' },
  ];
  warehouseOptions: { value: string; label: string }[] = [];
  bigCategoryOptions: { value: string; label: string }[] = [];
  midCategoryOptions: { value: string; label: string }[] = [];
  smallCategoryOptions: { value: string; label: string }[] = [];
  goodsOptions: { value: string; label: string }[] = [];

  columns: ReportColumn[] = [
    { field: 'GoodsID', header: '品項編號', visible: true },
    // width 明確指定，避開 TableReportWidthService 對未指定 width 欄位的 200px 自動寬度上限，理由同 ASS17080
    { field: 'GoodsName', header: '品項名稱', visible: true, width: '220px' },
    {
      field: 'StocksQty',
      header: '目前庫存數量',
      visible: true,
      align: 'right',
      format: (v) => formatAmount2(v),
    },
    {
      field: 'SafeQty',
      header: '安全庫存數量',
      visible: true,
      align: 'right',
      format: (v) => formatAmount2(v),
    },
    {
      field: 'ProjectQty',
      header: '請購數量',
      visible: true,
      align: 'right',
      format: (v) => formatAmount2(v),
    },
    {
      field: 'ExamineQty',
      header: '驗收數量',
      visible: true,
      align: 'right',
      format: (v) => formatAmount2(v),
    },
  ];

  constructor(
    private readonly ass17090Service: ASS17090Service,
    private readonly dropdownApi: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17090', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    this.bindCategoryCascade();
  }

  private loadDropdownOptions(): void {
    this.dropdownApi.queryFaHos().pipe(untilDestroyed(this)).subscribe((opts) => {
      this.warehouseOptions = opts ?? [];
    });
    this.dropdownApi.queryFaClassM({}).pipe(untilDestroyed(this)).subscribe((opts) => {
      this.bigCategoryOptions = opts ?? [];
    });
    this.dropdownApi
      .queryFasItemDropdown({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.goodsOptions = opts ?? [];
      });
  }

  private bindCategoryCascade(): void {
    this.queryForm.controls.bigCategoryId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((bClassId) => {
        this.queryForm.patchValue({ midCategoryId: null, smallCategoryId: null }, { emitEvent: false });
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        if (!bClassId) return;
        this.dropdownApi
          .queryFaClass1({ B_CLASS_ID: bClassId })
          .pipe(untilDestroyed(this))
          .subscribe((opts) => {
            this.midCategoryOptions = opts ?? [];
          });
      });

    this.queryForm.controls.midCategoryId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((mClassId) => {
        this.queryForm.patchValue({ smallCategoryId: null }, { emitEvent: false });
        this.smallCategoryOptions = [];
        if (!mClassId) return;
        this.dropdownApi
          .queryFaClass2({
            B_CLASS_ID: this.queryForm.controls.bigCategoryId.value ?? undefined,
            M_CLASS_ID: mClassId,
          })
          .pipe(untilDestroyed(this))
          .subscribe((opts) => {
            this.smallCategoryOptions = opts ?? [];
          });
      });
  }

  private toApiDateValue(value: Date | string | null): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    return value;
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): ASS17090QueryRequest {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? body?.SortBy : undefined;

    const payload: ASS17090QueryRequest = {
      MID: this.authService.currentUserValue?.mid != null
        ? String(this.authService.currentUserValue.mid)
        : undefined,
      QUERY_TYPE: raw.queryType ?? undefined,
      STOCK_DATE: this.toApiDateValue(raw.stockDate),
      WH_ID: raw.warehouseId ?? undefined,
      B_CLASS_ID: raw.bigCategoryId ?? undefined,
      M_CLASS_ID: raw.midCategoryId ?? undefined,
      S_CLASS_ID: raw.smallCategoryId ?? undefined,
      GOODS_ID: raw.goodsId ?? undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as ASS17090QueryRequest;
  }

  private static isSubtotalRow(row: QueryASS17090Detail): boolean {
    return String(row.RowType ?? '').toUpperCase() === 'S';
  }

  private buildFooterFromData(data: QueryASS17090Response | undefined): Record<string, number | null | undefined> | null {
    if (!data) return null;
    const hasTotal =
      data.SafeQty != null ||
      data.StocksQty != null ||
      data.ProjectQty != null ||
      data.ExamineQty != null;
    if (!hasTotal) return null;
    return {
      SafeQty: data.SafeQty,
      StocksQty: data.StocksQty,
      ProjectQty: data.ProjectQty,
      ExamineQty: data.ExamineQty,
    };
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): Observable<{ Data: ASS17090QueryRow[]; TotalCount: number }> => {
    const request = this.buildRequest(body);
    this.lastQueryBody = request;
    const requestPageIndex = request.PageIndex ?? 1;
    return this.ass17090Service.queryASS17090(request).pipe(
      tap((res: ApiResponse<QueryASS17090Response>) => {
        if (res.Status !== '0000') {
          this.tableFooterData.set(null);
          return;
        }
        this.tableFooterData.set(this.buildFooterFromData(res.Data));
      }),
      map((res: ApiResponse<QueryASS17090Response>) => {
        if (res.Status !== '0000') {
          return { Data: [] as ASS17090QueryRow[], TotalCount: 0 };
        }
        const dataObj = res.Data;
        const details = (dataObj?.Details ?? []).filter((row) => !ASS17090Component.isSubtotalRow(row));
        const mapped = details.map((row, idx): ASS17090QueryRow => ({
          ...row,
          ID: `${row.GoodsID ?? 'row'}-p${requestPageIndex}-r${row.RowNo ?? idx + 1}`,
        }));
        return {
          Data: mapped,
          TotalCount: res.TotalCount ?? dataObj?.TotalRows ?? mapped.length,
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
            this.tableFooterData.set(null);
          },
        });
    });
  }

  private buildExportPayload(): ASS17090QueryRequest {
    return this.buildRequest({
      PageSize: 0,
      PageIndex: 0,
      SortBy: this.lastQueryBody?.SortBy,
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
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  onExportExcel(): void {
    const payload = this.buildExportPayload();
    this.exportExcelLoading = true;
    this.ass17090Service
      .exportExcelASS17090(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.exportExcelLoading = false)
      )
      .subscribe((blob) => {
        if (blob) {
          this.downloadBlob(blob, `耗材庫存查詢作業_${this.getTimestamp()}.xlsx`);
        }
      });
  }

  onClearForm(): void {
    this.queryForm.reset({
      queryType: null,
      warehouseId: null,
      stockDate: null,
      bigCategoryId: null,
      midCategoryId: null,
      smallCategoryId: null,
      goodsId: null,
    });
    this.midCategoryOptions = [];
    this.smallCategoryOptions = [];
    this.lastQueryBody = undefined;
    this.tableData.set([]);
    this.totalRecords.set(0);
    this.tableFooterData.set(null);
  }
}
