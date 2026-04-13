import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  QueryASS17030DeptInfo,
  QueryASS17030Detail,
  QueryASS17030Request,
  QueryASS17030Summary,
} from '@pages/ass/ass17030/ass17030.model';
import { ASS17030Service } from '@service/api/ass/ass17030.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import {
  Ass17030DeptHeader,
  Ass17030TableReportComponent,
} from '@shared/componentkit/ass17030-table-report/ass17030-table-report.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

@UntilDestroy()
@Component({
  selector: 'app-ass17030',
  templateUrl: './ass17030.component.html',
  styleUrl: './ass17030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    Ass17030TableReportComponent,
    TranslateModule,
  ],
})
export class ASS17030Component extends BasicQueryPageComponent<QueryASS17030Detail> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Sdate: [null as Date | null, Validators.required],
    Edate: [null as Date | null, Validators.required],
    orgId: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    goodsId: [null as string | null],
  });

  orgOptions: { value: string; label: string }[] = [];
  bigCategoryOptions: Option[] = [];
  midCategoryOptions: Option[] = [];
  smallCategoryOptions: Option[] = [];
  goodsOptions: Option[] = [];

  public readonly tableData = signal<QueryASS17030Detail[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public readonly deptHeaders = signal<Ass17030DeptHeader[]>([]);
  public readonly footerData = signal<Record<string, unknown> | undefined>(undefined);
  lastQueryBody?: QueryASS17030Request & { pageSize?: number; pageIndex?: number };
  private currentDeptData: QueryASS17030DeptInfo[] = [];

  @ViewChild(Ass17030TableReportComponent) tableReport!: Ass17030TableReportComponent;

  columns: ReportColumn[] = [
    { field: 'Goods', header: '品名', visible: true },
    { field: 'UnitPrice', header: '品項單價', visible: true, format: this.money, align: 'right' },
    { field: 'TotalQty', header: '總計數量', visible: true, format: this.money, align: 'right' },
    { field: 'TotalAmt', header: '總計金額', visible: true, format: this.money, align: 'right' },
  ];

  constructor(
    private readonly ass17030Service: ASS17030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17030', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadOrgOptions();
    this.loadBigCategoryOptions();
    this.loadGoodsOptions();
    this.setupCategoryCascade();
  }

  private loadOrgOptions(): void {
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') {
          return;
        }
        const items = res.Data ?? [];
        this.orgOptions = items.map(item => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
  }

  private loadBigCategoryOptions(): void {
    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.bigCategoryOptions = opts ?? [];
      });
  }

  private loadMidCategoryOptions(bClassId: string): void {
    this.dropdownApiService
      .queryFaClass1({ B_CLASS_ID: bClassId })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.midCategoryOptions = opts ?? [];
      });
  }

  private loadSmallCategoryOptions(mClassId: string): void {
    this.dropdownApiService
      .queryFaClass2({ M_CLASS_ID: mClassId })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.smallCategoryOptions = opts ?? [];
      });
  }

  private loadGoodsOptions(): void {
    this.dropdownApiService
      .queryFasItemDropDownList({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.goodsOptions = opts ?? [];
      });
  }

  private setupCategoryCascade(): void {
    let prevB: string | null | undefined;
    let prevM: string | null | undefined;

    this.queryForm.controls.bClassId.valueChanges.pipe(untilDestroyed(this)).subscribe(b => {
      if (prevB !== undefined && prevB !== b) {
        this.queryForm.patchValue({ mClassId: null, sClassId: null }, { emitEvent: false });
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
      }
      prevB = b;
      if (b) {
        this.loadMidCategoryOptions(b);
      } else {
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
      }
    });

    this.queryForm.controls.mClassId.valueChanges.pipe(untilDestroyed(this)).subscribe(m => {
      if (prevM !== undefined && prevM !== m) {
        this.queryForm.patchValue({ sClassId: null }, { emitEvent: false });
        this.smallCategoryOptions = [];
      }
      prevM = m;
      if (m) {
        this.loadSmallCategoryOptions(m);
      } else {
        this.smallCategoryOptions = [];
      }
    });
  }

  private toStartOfDayIso(d: Date): string {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
  }

  private toEndOfDayIso(d: Date): string {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.toISOString();
  }

  public queryFunction = (
    body: QueryASS17030Request & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<QueryASS17030Detail[]>> => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: QueryASS17030Request = {
      StartDate: raw.Sdate ? this.toStartOfDayIso(raw.Sdate) : undefined,
      EndDate: raw.Edate ? this.toEndOfDayIso(raw.Edate) : undefined,
      OrgID: raw.orgId || undefined,
      BClassID: raw.bClassId || undefined,
      MClassID: raw.mClassId || undefined,
      SClassID: raw.sClassId || undefined,
      GoodsID: raw.goodsId || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload as Record<string, unknown>) as QueryASS17030Request;
    if (payload.SortBy?.length) {
      clean.SortBy = payload.SortBy;
    }
    return this.ass17030Service.queryASS17030(clean).pipe(
      map(res => {
        const deptData = res.DeptData ?? this.currentDeptData;
        if (res.DeptData?.length) {
          this.currentDeptData = res.DeptData;
          this.deptHeaders.set(this.toDeptHeaders(res.DeptData));
          this.columns = this.buildColumns(res.DeptData);
        }
        if (res.Summary) {
          this.footerData.set(this.buildFooterData(res.Summary, deptData));
        }
        const rows = (res.Data ?? []).map(row => this.flattenRow(row, deptData));
        return {
          ...res,
          Data: rows,
        };
      }),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length
        ? [...this.tableReport.multiSortMeta]
        : undefined;
      this.lastQueryBody = {
        StartDate: rawFormValue.Sdate ? this.toStartOfDayIso(rawFormValue.Sdate) : undefined,
        EndDate: rawFormValue.Edate ? this.toEndOfDayIso(rawFormValue.Edate) : undefined,
        OrgID: rawFormValue.orgId || undefined,
        BClassID: rawFormValue.bClassId || undefined,
        MClassID: rawFormValue.mClassId || undefined,
        SClassID: rawFormValue.sClassId || undefined,
        GoodsID: rawFormValue.goodsId || undefined,
        PageSize: 30,
        PageIndex: 1,
        SortBy: currentSort,
      } as QueryASS17030Request & { pageSize?: number; pageIndex?: number };

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
          next: res => {
            if (res.Status !== '0000') {
              return;
            }
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  private toDeptHeaders(deptData: QueryASS17030DeptInfo[]): Ass17030DeptHeader[] {
    return deptData.map(item => ({
      key: item.Key ?? '',
      name: item.Name || item.Key || '',
    }));
  }

  private buildColumns(deptData: QueryASS17030DeptInfo[]): ReportColumn[] {
    const baseColumns: ReportColumn[] = [
      { field: 'Goods', header: '品名', visible: true },
      { field: 'UnitPrice', header: '品項單價', visible: true, format: this.money, align: 'right' },
    ];
    const deptColumns: ReportColumn[] = deptData.flatMap(item => {
      const key = item.Key ?? '';
      return [
        {
          field: this.getDeptQtyField(key),
          header: '數量',
          visible: true,
          format: this.money,
          align: 'right',
        },
        {
          field: this.getDeptAmtField(key),
          header: '金額',
          visible: true,
          format: this.money,
          align: 'right',
        },
      ];
    });
    const totalColumns: ReportColumn[] = [
      { field: 'TotalQty', header: '總計數量', visible: true, format: this.money, align: 'right' },
      { field: 'TotalAmt', header: '總計金額', visible: true, format: this.money, align: 'right' },
    ];
    return [...baseColumns, ...deptColumns, ...totalColumns];
  }

  private flattenRow(row: QueryASS17030Detail, deptData: QueryASS17030DeptInfo[]): QueryASS17030Detail {
    const flat: QueryASS17030Detail = { ...row };
    deptData.forEach(dept => {
      const key = dept.Key ?? '';
      const deptValue = row.Depts?.[key];
      flat[this.getDeptQtyField(key)] = Number(deptValue?.Qty ?? 0);
      flat[this.getDeptAmtField(key)] = Number(deptValue?.Amt ?? 0);
    });
    return flat;
  }

  private buildFooterData(
    summary: QueryASS17030Summary,
    deptData: QueryASS17030DeptInfo[],
  ): Record<string, unknown> {
    const footer: Record<string, unknown> = {
      TotalQty: Number(summary.TotalQty ?? 0),
      TotalAmt: Number(summary.TotalAmt ?? 0),
    };
    deptData.forEach(dept => {
      const key = dept.Key ?? '';
      const deptSummary = summary.Depts?.[key];
      footer[this.getDeptQtyField(key)] = Number(deptSummary?.Qty ?? 0);
      footer[this.getDeptAmtField(key)] = Number(deptSummary?.Amt ?? 0);
    });
    return footer;
  }

  private getDeptQtyField(key: string): string {
    return `dept_${key}_qty`;
  }

  private getDeptAmtField(key: string): string {
    return `dept_${key}_amt`;
  }

  private money(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString();
  }
}
