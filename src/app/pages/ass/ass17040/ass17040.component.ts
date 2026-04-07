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
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { Observable, finalize, map } from 'rxjs';
import { QueryASS17040Detail, QueryASS17040Request } from './ass17040.model';

function formatOrgDetails(value: unknown): string {
  if (value == null || typeof value !== 'object') {
    return '';
  }
  return Object.entries(value as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join('；');
}

@UntilDestroy()
@Component({
  selector: 'app-ass17040',
  templateUrl: './ass17040.component.html',
  styleUrl: './ass17040.component.scss',
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
  ],
})
export class ASS17040Component
  extends BasicQueryPageComponent<QueryASS17040Detail>
  implements OnInit
{
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

  data: QueryASS17040Detail[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS17040Request | null = null;

  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;

  readonly columns: ReportColumn[] = [
    { field: 'Seq', header: '序號', sortField: 'Seq' },
    { field: 'GoodsID', header: '品項ID', sortField: 'GoodsID' },
    { field: 'GoodsName', header: '品項名稱', sortField: 'GoodsName' },
    { field: 'GoodsPrice', header: '品項單價', sortField: 'GoodsPrice' },
    { field: 'TotalQty', header: '總數量', sortField: 'TotalQty' },
    { field: 'TotalAmt', header: '總金額', sortField: 'TotalAmt' },
    { field: 'RowType', header: '總筆性質', sortField: 'RowType' },
    {
      field: 'OrgDetails',
      header: '部門明細',
      showSort: false,
      format: (v, _i, row) => formatOrgDetails(row?.OrgDetails ?? v),
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

  private loadSmallCategoryOptions(mClassId: string): void {
    if (!mClassId) {
      this.smallCategoryOptions = [];
      return;
    }
    this.dropdown
      .queryFaClass2({ M_CLASS_ID: mClassId })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.smallCategoryOptions = opts ?? [];
      });
  }

  private loadGoodsOptions(): void {
    this.dropdown
      .queryFasItemDropDownList({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.goodsOptions = opts ?? [];
      });
  }

  private setupCategoryListeners(): void {
    this.queryForm.controls.bigCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
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
      .pipe(untilDestroyed(this))
      .subscribe((mid) => {
        this.queryForm.patchValue({ smallCategoryCode: null }, { emitEvent: false });
        this.smallCategoryOptions = [];
        if (mid) {
          this.loadSmallCategoryOptions(mid);
        }
      });
  }

  private buildPayload(
    raw: ReturnType<typeof this.queryForm.getRawValue>,
    pageSize: number,
    pageIndex: number,
    sortBy: QueryASS17040Request['SortBy'],
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

  queryFunction = (
    body: QueryASS17040Request & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<QueryASS17040Detail[]>> => {
    const rawForm = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload = this.buildPayload(rawForm, pageSize, pageIndex, body.SortBy);
    return this.ass17040Service.queryASS17040(payload).pipe(
      map((res) => {
        const details = res.Data?.Details ?? [];
        const mapped = details.map((row, i) => ({
          ...row,
          rowKey: `${row.Seq ?? i}-${row.RowType ?? ''}-${row.GoodsID ?? ''}-${i}`,
        }));
        return {
          ...res,
          Data: mapped,
          TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
        } as ApiResponse<QueryASS17040Detail[]>;
      }),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length
        ? [...this.tableReport.multiSortMeta]
        : undefined;
      this.lastQueryBody = this.buildPayload(raw, 30, 1, currentSort);

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
}
