import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17010Service } from '@service/api/ass/ass17010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import {
  QueryASS17010Detail,
  QueryASS17010Request,
  QueryASS17010TableRow,
} from '@pages/ass/ass17010/ass17010.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { SortOption } from '@shared/models/api/base-api.interface';

/** 3.1.7.1 領用明細表 */
@UntilDestroy()
@Component({
  selector: 'app-ass17010',
  templateUrl: './ass17010.component.html',
  styleUrl: './ass17010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS17010Component extends BasicQueryPageComponent<QueryASS17010Detail> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    displayType: new FormControl<string | null>(null),
    startDate: new FormControl<Date | null>(null, [Validators.required]),
    endDate: new FormControl<Date | null>(null, [Validators.required]),
    orgId: new FormControl<string | null>(null),
    bClassId: new FormControl<string | null>(null),
    mClassId: new FormControl<string | null>(null),
    sClassId: new FormControl<string | null>(null),
    goodsId: new FormControl<string | null>(null),
  });

  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<QueryASS17010TableRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS17010Request & { pageIndex?: number; pageSize?: number };

  @ViewChild(TableReportComponent) tableReport?: TableReportComponent;

  private readonly defaultPageSize = 30;

  public readonly displayTypeOptions = [
    { value: 'ALL', label: '全部' },
    { value: 'ISSUE', label: '發料' },
    { value: 'RETURN', label: '退料' },
  ];

  public orgOptions: Array<{ label: string; value: string }> = [];
  public bigCategoryOptions: Array<{ label: string; value: string }> = [];
  public midCategoryOptions: Array<{ label: string; value: string }> = [];
  public smallCategoryOptions: Array<{ label: string; value: string }> = [];
  public goodsOptions: Array<{ label: string; value: string }> = [];

  public readonly columns: ReportColumn[] = [
    { field: 'GoodsID', header: '品項編號', visible: true },
    { field: 'GoodsName', header: '品項名稱', visible: true },
    { field: 'GoodsPrice', header: '品項單價', visible: true, align: 'right' },
    { field: 'DocNo', header: '領用單號', visible: true },
    { field: 'DeptName', header: '部門', visible: true },
    { field: 'Qty', header: '數量', visible: true, align: 'right' },
    { field: 'Amt', header: '總金額', visible: true, align: 'right' },
    { field: 'RowType', header: '行類別', visible: true },
    { field: 'RowTypeName', header: '行類別名稱', visible: true },
  ];

  constructor(
    private readonly ass17010Service: ASS17010Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17010', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadOrgOptions();
    this.loadBigCategoryOptions();
    this.loadMidCategoryOptions('');
    this.loadSmallCategoryOptions('');
    this.loadGoodsOptions();
    this.setupCategoryListeners();
  }

  private loadOrgOptions(): void {
    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.orgOptions = list.map((o) => ({
          label: o.label ?? String(o.value ?? ''),
          value: String(o.value ?? ''),
        }));
      });
  }

  private loadBigCategoryOptions(): void {
    this.dropdownApi
      .queryFaClassM()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.bigCategoryOptions = list.map((o) => ({
          label: o.label ?? String(o.value ?? ''),
          value: String(o.value ?? ''),
        }));
      });
  }

  private loadMidCategoryOptions(bClassId: string): void {
    this.dropdownApi
      .queryFaClass1({ B_CLASS_ID: bClassId || undefined })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.midCategoryOptions = list.map((o) => ({
          label: o.label ?? String(o.value ?? ''),
          value: String(o.value ?? ''),
        }));
      });
  }

  private loadSmallCategoryOptions(mClassId: string): void {
    this.dropdownApi
      .queryFaClass2({ M_CLASS_ID: mClassId || undefined })
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.smallCategoryOptions = list.map((o) => ({
          label: o.label ?? String(o.value ?? ''),
          value: String(o.value ?? ''),
        }));
      });
  }

  private loadGoodsOptions(): void {
    this.dropdownApi
      .queryFasItemDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.goodsOptions = list.map((o) => ({
          label: o.label ?? String(o.value ?? ''),
          value: String(o.value ?? ''),
        }));
      });
  }

  private setupCategoryListeners(): void {
    this.queryForm.controls.bClassId.valueChanges.pipe(untilDestroyed(this)).subscribe((big) => {
      this.queryForm.patchValue({ mClassId: null, sClassId: null }, { emitEvent: false });
      this.loadMidCategoryOptions(big ?? '');
    });
    this.queryForm.controls.mClassId.valueChanges.pipe(untilDestroyed(this)).subscribe((mid) => {
      this.queryForm.patchValue({ sClassId: null }, { emitEvent: false });
      this.loadSmallCategoryOptions(mid ?? '');
    });
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
  }): QueryASS17010Request {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? (body?.SortBy as SortOption[]) : undefined;

    const payload: QueryASS17010Request = {
      DisplayType: raw.displayType || undefined,
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
    return removeEmptyValues(payload) as QueryASS17010Request;
  }

  public queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): Observable<ApiResponse<QueryASS17010TableRow[]>> => {
    const pageSize = body.pageSize ?? body.PageSize ?? this.defaultPageSize;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const request = this.buildRequest(body);
    this.lastQueryBody = { ...request, pageIndex, pageSize };

    return this.ass17010Service.queryASS17010(request).pipe(
      map((res) => {
        const details = res.Data?.Details ?? [];
        const baseOffset = (pageIndex - 1) * pageSize;
        const mapped: QueryASS17010TableRow[] = details.map((row, idx) => ({
          ...row,
          _pk: `${pageIndex}-${baseOffset + idx}-${row.DocNo ?? ''}-${row.GoodsID ?? ''}-${row.RowType ?? ''}`,
        }));
        return {
          ...res,
          Data: mapped,
          TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
        } as ApiResponse<QueryASS17010TableRow[]>;
      }),
    );
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const currentSort =
        this.tableReport?.multiSortMeta?.length ? [...this.tableReport.multiSortMeta] : undefined;
      this.lastQueryBody = {
        ...this.buildRequest({
          pageSize: this.defaultPageSize,
          pageIndex: 1,
          SortBy: currentSort,
        }),
        pageIndex: 1,
        pageSize: this.defaultPageSize,
      };

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
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

  onClearForm(): void {
    this.queryForm.reset({
      displayType: null,
      startDate: null,
      endDate: null,
      orgId: null,
      bClassId: null,
      mClassId: null,
      sClassId: null,
      goodsId: null,
    });
    this.loadMidCategoryOptions('');
    this.loadSmallCategoryOptions('');
  }
}
