import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17070Service } from '@service/api/ass/ass17070.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { distinctUntilChanged, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { QueryASS17070DataWrapper, QueryASS17070Detail, QueryASS17070Request } from './ass17070.model';

@UntilDestroy()
@Component({
  selector: 'app-ass17070',
  templateUrl: './ass17070.component.html',
  styleUrl: './ass17070.component.scss',
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
export class ASS17070Component extends BasicQueryPageComponent<QueryASS17070Detail> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    StartDate: [null as Date | null, [Validators.required]],
    EndDate: [null as Date | null, [Validators.required]],
    OrgID: [null as string | null],
    BClassID: [null as string | null],
    MClassID: [null as string | null],
    SClassID: [null as string | null],
    GoodsID: [null as string | null],
  });

  orgOptions: { value: string; label: string }[] = [];
  bClassOptions: { value: string; label: string }[] = [];
  mClassOptions: { value: string; label: string }[] = [];
  sClassOptions: { value: string; label: string }[] = [];
  goodsOptions: { value: string; label: string }[] = [];

  public readonly tableData = signal<QueryASS17070Detail[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS17070Request;
  public footerData?: QueryASS17070Detail;

  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;

  formatAmountWithDecimals = formatAmountWithDecimals;

  columns: ReportColumn[] = [
    { field: 'GoodsID', header: '品項編號', align: 'left' },
    { field: 'GoodsName', header: '品項名稱', align: 'left' },
    { field: 'UnitPrice', header: '單價', align: 'right', format: (v) => formatAmountWithDecimals(v, 0) },
    { field: 'DamageNo', header: '報廢單號' },
    { field: 'WHName', header: '倉別名稱' },
    { field: 'Qty', header: '數量', align: 'right', format: (v) => formatAmountWithDecimals(v, 0) },
    { field: 'Amt', header: '金額', align: 'right', format: (v) => formatAmountWithDecimals(v, 0) },
  ];

  constructor(
    private readonly ass17070Service: ASS17070Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17070', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdowns();
    this.setupCategoryListeners();
  }

  private loadDropdowns(): void {
    this.dropdownApi.querySys3100().pipe(untilDestroyed(this)).subscribe((options) => {
      this.orgOptions = options ?? [];
    });
    this.dropdownApi.queryFaClassM({}).pipe(untilDestroyed(this)).subscribe((options) => {
      this.bClassOptions = options ?? [];
    });
    this.mClassOptions = [];
    this.sClassOptions = [];
    this.dropdownApi.queryFasItemDropdown({ MATERIAL_TYPE: '3' }).pipe(untilDestroyed(this)).subscribe((options: Option[] | null) => {
      this.goodsOptions = options ?? [];
    });
  }

  private setupCategoryListeners(): void {
    const bCtrl = this.queryForm.controls.BClassID;
    const mCtrl = this.queryForm.controls.MClassID;
    const sCtrl = this.queryForm.controls.SClassID;

    bCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((b) => {
        // 大分類變更 -> 清中/小分類
        mCtrl.patchValue(null, { emitEvent: false });
        sCtrl.patchValue(null, { emitEvent: false });
        this.mClassOptions = [];
        this.sClassOptions = [];
        if (b) {
          this.dropdownApi.queryFaClass1({ B_CLASS_ID: b }).pipe(untilDestroyed(this)).subscribe((options) => {
            this.mClassOptions = options ?? [];
          });
        }
      });

    mCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((m) => {
        // 中分類變更 -> 清小分類
        sCtrl.patchValue(null, { emitEvent: false });
        this.sClassOptions = [];
        if (m) {
          this.dropdownApi
            .queryFaClass2({ B_CLASS_ID: bCtrl.value ?? undefined, M_CLASS_ID: m })
            .pipe(untilDestroyed(this))
            .subscribe((options) => {
            this.sClassOptions = options ?? [];
          });
        }
      });

    // 初始值/查詢狀態還原：載入對應層級選單（不清值）
    const initialB = bCtrl.value;
    const initialM = mCtrl.value;
    if (initialB) {
      this.dropdownApi.queryFaClass1({ B_CLASS_ID: initialB }).pipe(untilDestroyed(this)).subscribe((options) => {
        this.mClassOptions = options ?? [];
      });
    }
    if (initialM && initialB) {
      this.dropdownApi
        .queryFaClass2({ B_CLASS_ID: initialB, M_CLASS_ID: initialM })
        .pipe(untilDestroyed(this))
        .subscribe((options) => {
          this.sClassOptions = options ?? [];
        });
    }
  }

  private toIsoString(value: Date | string | null): string | undefined {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  private splitRowTypeData(rows: QueryASS17070Detail[]): {
    detailRows: QueryASS17070Detail[];
    footer?: QueryASS17070Detail;
  } {
    const detailRows: QueryASS17070Detail[] = [];
    let footer: QueryASS17070Detail | undefined;

    rows.forEach((item) => {
      const rowType = String(item?.RowType ?? '').toUpperCase();
      if (rowType === 'TOTAL') {
        footer = { ...item };
        return;
      }

      detailRows.push(item);
    });

    return { detailRows, footer };
  }

  public queryFunction = (body: QueryASS17070Request): Observable<ApiResponse<QueryASS17070Detail[]>> => {
    const raw = this.queryForm.getRawValue();
    const pageSize = (body as QueryASS17070Request & { pageSize?: number }).pageSize ?? body.PageSize;
    const pageIndex = (body as QueryASS17070Request & { pageIndex?: number }).pageIndex ?? body.PageIndex;

    const payload: QueryASS17070Request = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      StartDate: this.toIsoString(raw.StartDate) ?? '',
      EndDate: this.toIsoString(raw.EndDate) ?? '',
      OrgID: raw.OrgID || undefined,
      BClassID: raw.BClassID || undefined,
      MClassID: raw.MClassID || undefined,
      SClassID: raw.SClassID || undefined,
      GoodsID: raw.GoodsID || undefined,
      SortBy: body.SortBy,
      OrderBy: body.OrderBy,
      Offset: body.Offset,
    };

    const cleanPayload = removeEmptyValues(payload) as QueryASS17070Request;
    return this.ass17070Service.queryASS17070(cleanPayload).pipe(
      map((res: ApiResponse<QueryASS17070DataWrapper>) => {
        const details = res.Data?.Details ?? [];
        const transformed = this.splitRowTypeData(details);
        this.footerData = transformed.footer;
        return {
          ...res,
          Data: transformed.detailRows,
          TotalCount: res.Data?.TotalRows ?? transformed.detailRows.length,
        };
      }),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length ? [...this.tableReport.multiSortMeta] : undefined;

      this.lastQueryBody = {
        PageSize: 30,
        PageIndex: 1,
        StartDate: this.toIsoString(raw.StartDate) ?? '',
        EndDate: this.toIsoString(raw.EndDate) ?? '',
        OrgID: raw.OrgID || undefined,
        BClassID: raw.BClassID || undefined,
        MClassID: raw.MClassID || undefined,
        SClassID: raw.SClassID || undefined,
        GoodsID: raw.GoodsID || undefined,
        SortBy: currentSort,
      };

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);

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
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }
}
