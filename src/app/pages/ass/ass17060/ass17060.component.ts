import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17060Service } from '@service/api/ass/ass17060.service';
import type { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { distinctUntilChanged, finalize, map, Observable, of } from 'rxjs';
import { QueryASS17060DetailRow, QueryASS17060Request } from './ass17060.model';

/** 3.1.7.6 調撥明細表 */
@UntilDestroy()
@Component({
  selector: 'app-ass17060',
  templateUrl: './ass17060.component.html',
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
export class ASS17060Component extends BasicQueryPageComponent<QueryASS17060DetailRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Sdate: [null as Date | null, Validators.required],
    Edate: [null as Date | null, Validators.required],
    OrgID: [null as string | null],
    BClassID: [null as string | null],
    MClassID: [null as string | null],
    SClassID: [null as string | null],
    GoodsID: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
  });

  orgOptions: Array<{ label: string; value: string }> = [];
  bigCategoryOptions: Option[] = [];
  midCategoryOptions: Option[] = [];
  smallCategoryOptions: Option[] = [];
  goodsOptions: Option[] = [];

  data: QueryASS17060DetailRow[] = [];
  totalRecords = 0;
  lastQueryBody: (QueryASS17060Request & { pageSize?: number; pageIndex?: number }) | null = null;

  columns: ReportColumn[] = [
    { field: 'goods_id', header: '品項編號', align: 'left' },
    { field: 'goods_name', header: '品項名稱', align: 'left' },
    { field: 'unit_price', header: '單價', align: 'right', format: (value) => formatAmountWithDecimals(value, 0) },
    { field: 'whmove_id', header: '調撥單號', align: 'center' },
    { field: 'whmove_status_name', header: '調撥狀態', align: 'center' },
    { field: 'wh_name', header: '倉別', align: 'center' },
    { field: 'qty', header: '數量', align: 'right', format: (value) => formatAmountWithDecimals(value, 0) },
    { field: 'move_amt', header: '調撥金額', align: 'right', format: (value) => formatAmountWithDecimals(value, 0) },
  ];

  constructor(
    private readonly ass17060Service: ASS17060Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17060', '', this.queryForm, () => this.onSubmit());
    this.loadOrgOptions();
    this.loadBigCategoryOptions();
    this.loadGoodsOptions();
    this.setupCategoryCascade();
  }

  private loadOrgOptions(): void {
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      if (res.Status !== '0000') return;
      this.orgOptions = (res.Data ?? []).map((item) => ({
        label: `${item.No ?? ''}-${item.Name ?? ''}`,
        value: item.No ?? '',
      }));
    });
  }

  private loadBigCategoryOptions(): void {
    this.dropdownApiService.queryFaClassM({}).pipe(untilDestroyed(this)).subscribe((opts) => {
      this.bigCategoryOptions = opts ?? [];
    });
  }

  private loadGoodsOptions(): void {
    this.dropdownApiService.queryFasItemDropdown({ MATERIAL_TYPE: '3' }).pipe(untilDestroyed(this)).subscribe((opts: Option[] | null) => {
      this.goodsOptions = opts ?? [];
    });
  }

  private setupCategoryCascade(): void {
    const bCtrl = this.queryForm.controls.BClassID;
    const mCtrl = this.queryForm.controls.MClassID;
    const sCtrl = this.queryForm.controls.SClassID;

    bCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((b) => {
        mCtrl.patchValue(null, { emitEvent: false });
        sCtrl.patchValue(null, { emitEvent: false });
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        if (!b) return;
        this.dropdownApiService.queryFaClass1({ B_CLASS_ID: b }).pipe(untilDestroyed(this)).subscribe((opts) => {
          this.midCategoryOptions = opts ?? [];
        });
      });

    mCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((m) => {
        sCtrl.patchValue(null, { emitEvent: false });
        this.smallCategoryOptions = [];
        if (!m) return;
        this.dropdownApiService
          .queryFaClass2({ B_CLASS_ID: bCtrl.value ?? undefined, M_CLASS_ID: m })
          .pipe(untilDestroyed(this))
          .subscribe((opts) => {
          this.smallCategoryOptions = opts ?? [];
        });
      });

    const initialB = bCtrl.value;
    const initialM = mCtrl.value;
    if (initialB) {
      this.dropdownApiService.queryFaClass1({ B_CLASS_ID: initialB }).pipe(untilDestroyed(this)).subscribe((opts) => {
        this.midCategoryOptions = opts ?? [];
      });
    }
    if (initialM && initialB) {
      this.dropdownApiService
        .queryFaClass2({ B_CLASS_ID: initialB, M_CLASS_ID: initialM })
        .pipe(untilDestroyed(this))
        .subscribe((opts) => {
        this.smallCategoryOptions = opts ?? [];
      });
    }
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

  private buildPayload(raw: ReturnType<typeof this.queryForm.getRawValue>, body: object): QueryASS17060Request | null {
    const b = body as Record<string, unknown>;
    const pageSize = (b['pageSize'] as number | undefined) ?? (b['PageSize'] as number | undefined) ?? raw.PageSize ?? 30;
    const pageIndex = (b['pageIndex'] as number | undefined) ?? (b['PageIndex'] as number | undefined) ?? 1;
    const sortBy = b['SortBy'] as QueryASS17060Request['SortBy'] | undefined;
    const s = raw.Sdate;
    const e = raw.Edate;
    if (!s || !e) {
      return null;
    }
    const payload: QueryASS17060Request = {
      StartDate: this.toStartOfDayIso(s),
      EndDate: this.toEndOfDayIso(e),
      OrgID: raw.OrgID || undefined,
      BClassID: raw.BClassID || undefined,
      MClassID: raw.MClassID || undefined,
      SClassID: raw.SClassID || undefined,
      GoodsID: raw.GoodsID || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      Offset: (pageIndex - 1) * pageSize,
      SortBy: sortBy,
    };
    const cleaned = removeEmptyValues({ ...payload } as Record<string, unknown>);
    return cleaned as unknown as QueryASS17060Request;
  }

  queryFunction = (body: object): Observable<ApiResponse<QueryASS17060DetailRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw, body);
    if (!payload) {
      const empty: ApiResponse<QueryASS17060DetailRow[]> = {
        Status: '0000',
        Data: [] as QueryASS17060DetailRow[],
        TotalCount: 0,
        Error: null,
        Meta: { Timestamp: '', RequestId: '' },
        Message: '',
        TotalPage: 0,
      };
      return of(empty);
    }
    return this.ass17060Service.queryASS17060(payload).pipe(
      map((res) => ({
        ...res,
        Data: (res.Data ?? []).map((r, i) => ({
          ...r,
          _pk: `${r.sort_no ?? ''}_${r.goods_id ?? ''}_${r.whmove_id ?? ''}_${i}`,
        })),
      })),
    );
  };

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      const pageSize = raw.PageSize ?? 30;
      const built = this.buildPayload(raw, { pageSize, pageIndex: 1 });
      if (!built) {
        this.loading = false;
        return;
      }
      this.lastQueryBody = {
        ...built,
        pageSize,
        pageIndex: 1,
      };
      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
          },
        });
    });
  }
}
