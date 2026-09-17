import { AsyncPipe } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12040Service } from '@service/api/ass/ass12040.service';
import { ASS13070Service } from '@service/api/ass/ass13070.service';
import { TblUserOrgidItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { combineLatest, distinctUntilChanged, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { ASS12040QueryRequest } from '../ass12040/ass12040.model';
import { ASS13070QueryRequest, ASS13070QueryRow } from './ass13070.model';

type ClassOption = { label: string; value: string | number | null | undefined };

/** 3.1.3.7 財產保管單位設定／移轉作業（查詢） */
@Component({
  selector: 'app-ass13070',
  templateUrl: './ass13070.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    CalendarRangeComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS13070Component extends BasicQueryPageComponent<ASS13070QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    DEPRE_YN: new FormControl<string | null>(null),
    SUBPOENA_ID: new FormControl<string | null>(null),
    GET_DATE_S: new FormControl<Date | null>(null),
    GET_DATE_E: new FormControl<Date | null>(null),
    B_CLASS_ID: new FormControl<string | null>(null),
    M_CLASS_ID: new FormControl<string | null>(null),
    S_CLASS_ID: new FormControl<string | null>(null),
    ASSET_ID: new FormControl<string | null>(null),
    HOLD_ORG_ID: new FormControl<string | null>(null),
    HOLD_EMP_ID: new FormControl<string | null>(null),
    USE_ORG_ID: new FormControl<string | null>(null),
    PageSize: new FormControl<number>(10000),
    PageIndex: new FormControl<number>(1),
  });

  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS13070QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS13070QueryRequest;
  public selectedItems: ASS13070QueryRow[] = [];

  public readonly depreYnOptions: { label: string; value: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];

  public readonly subpoenaOptions = signal<{ label: string; value: string }[]>([]);
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  public readonly midClassOptions = signal<ClassOption[]>([]);
  public readonly smallClassOptions = signal<ClassOption[]>([]);
  readonly assetOptions$ = this.dropdownApi.queryFAASSETChooseList_DropDownList();
  readonly orgOptions$ = this.dropdownApi.querySys3100();
  readonly userOrgidOptions$ = this.dropdownApi.queryTblUserOrgid();

  readonly holdEmpOptions$ = combineLatest([
    this.queryForm.controls.HOLD_ORG_ID.valueChanges.pipe(
      startWith(this.queryForm.controls.HOLD_ORG_ID.value),
    ),
    this.userOrgidOptions$,
  ]).pipe(
    map(([orgId, options]) =>
      !orgId
        ? []
        : (options ?? []).filter(
          o => (o as unknown as TblUserOrgidItem).Org_ID === orgId,
        ),
    ),
  );

  public readonly columns: ReportColumn[] = [
    { field: 'DEPRE_YN_NAME', header: '財產類型' },
    { field: 'SUBPOENA_ID', header: '進貨單號' },
    { field: 'ASSET_ID', header: '資產編號' },
    {
      field: 'GOODS_NAME',
      header: '品項',
      format: (_v, _i, row: ASS13070QueryRow) =>
        row?.GOODS_NAME ?? (row?.GOODS_ID ? `${row.GOODS_ID}` : ''),
    },
    { field: 'GET_DATE', header: '購入日期', format: formatDate },
    { field: 'FIR_GET_COST', header: '原購入金額', format: formatAmount },
    { field: 'ORI_ORG_NAME', header: '原保管單位' },
    { field: 'ORI_EMP_NAME', header: '原保管人' },
    { field: 'USE_ORG_NAME', header: '原使用單位' },
    { field: 'USE_EMP_NAME', header: '原使用人' },
  ];

  constructor(
    public readonly service: ASS13070Service,
    private readonly ass12040Service: ASS12040Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13070', 'ass/ass13070cru', this.queryForm, this.onSubmit.bind(this));
    this.loadBigClassOptions();
    this.loadSubpoenaOptions();
    this.setupClassCascades();
  }

  private formatDateStr(d: Date | null): string | undefined {
    if (!d) return undefined;
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private loadBigClassOptions(): void {
    this.dropdownApi.queryFaClassM({}).subscribe((opts) => {
      this.bigClassOptions.set(
        (opts ?? []).map((item) => ({
          label: item.label,
          value: String(item.value),
        })),
      );
    });
  }

  private setupClassCascades(): void {
    const bCtrl = this.queryForm.controls.B_CLASS_ID;
    const mCtrl = this.queryForm.controls.M_CLASS_ID;
    const sCtrl = this.queryForm.controls.S_CLASS_ID;

    interface ClassOption { label: string; value: string | number | null | undefined }

    const valueInOptions = (opts: ClassOption[], v: unknown): boolean => {
      if (v == null) return false;
      const sv = String(v);
      return opts.some(o => o?.value != null && String(o.value) === sv);
    };

    // B_CLASS_ID -> M_CLASS_ID
    bCtrl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          // 大分類一變，直接清掉中/小分類（對齊 ASS13050 行為）
          mCtrl.patchValue(null, { emitEvent: false });
          sCtrl.patchValue(null, { emitEvent: false });
          this.midClassOptions.set([]);
          this.smallClassOptions.set([]);
        }),
        switchMap(bClassId => {
          if (!bClassId) {
            return of([] as ClassOption[]);
          }
          return this.dropdownApi.queryFaClass1({ B_CLASS_ID: bClassId }).pipe(
            map(midOptions => (midOptions ?? []) as ClassOption[]),
          );
        }),
      )
      .subscribe(midOptions => {
        this.midClassOptions.set(midOptions);
      });

    // M_CLASS_ID -> S_CLASS_ID
    mCtrl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          // 中分類一變，直接清掉小分類
          sCtrl.patchValue(null, { emitEvent: false });
          this.smallClassOptions.set([]);
        }),
        switchMap(mClassId => {
          if (!mClassId) {
            return of([] as ClassOption[]);
          }
          return this.dropdownApi
            .queryFaClass2({ B_CLASS_ID: bCtrl.value ?? undefined, M_CLASS_ID: mClassId })
            .pipe(
              map(smallOptions => (smallOptions ?? []) as ClassOption[]),
            );
        }),
      )
      .subscribe(smallOptions => {
        this.smallClassOptions.set(smallOptions);
      });

    // 初始化：載入初始的中/小分類選項
    const initialBClassId = bCtrl.value;
    const initialMClassId = mCtrl.value;

    if (initialBClassId) {
      this.dropdownApi
        .queryFaClass1({ B_CLASS_ID: initialBClassId })
        .subscribe(midOptions => {
          const mids = (midOptions ?? []) as ClassOption[];
          this.midClassOptions.set(mids);

          // 若還原進來的中分類不在大分類選項內，直接清掉中/小
          if (mCtrl.value != null && !valueInOptions(mids, mCtrl.value)) {
            mCtrl.patchValue(null, { emitEvent: false });
            sCtrl.patchValue(null, { emitEvent: false });
            this.smallClassOptions.set([]);
            return;
          }

          // 再載入小分類
          if (initialMClassId) {
            this.dropdownApi
              .queryFaClass2({ B_CLASS_ID: initialBClassId ?? undefined, M_CLASS_ID: initialMClassId })
              .subscribe(smallOptions => {
                const smalls = (smallOptions ?? []) as ClassOption[];
                this.smallClassOptions.set(smalls);

                // 若還原進來的小分類不在中分類選項內，清掉小分類
                if (sCtrl.value != null && !valueInOptions(smalls, sCtrl.value)) {
                  sCtrl.patchValue(null, { emitEvent: false });
                }
              });
          }
        });
    } else {
      // 大分類沒有選，選項清空即可
      this.midClassOptions.set([]);
      this.smallClassOptions.set([]);
    }
  }

  /** 進貨單號下拉：由採購單審核查詢結果去重取得 */
  private loadSubpoenaOptions(): void {
    const body: ASS12040QueryRequest = { PageSize: 1000, PageIndex: 1 };
    this.ass12040Service.queryASS12040(removeEmptyValues(body) as ASS12040QueryRequest).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const seen = new Set<string>();
        const opts: { label: string; value: string }[] = [];
        for (const row of res.Data ?? []) {
          const id = row.SUBPOENA_ID?.trim();
          if (!id || seen.has(id)) continue;
          seen.add(id);
          opts.push({ label: id, value: id });
        }
        this.subpoenaOptions.set(opts);
      },
    });
  }

  public queryFunction = (
    body: ASS13070QueryRequest & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<ASS13070QueryRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: ASS13070QueryRequest = {
      DEPRE_YN: raw.DEPRE_YN || undefined,
      SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
      GET_DATE_S: raw.GET_DATE_S ? this.formatDateStr(raw.GET_DATE_S) : undefined,
      GET_DATE_E: raw.GET_DATE_E ? this.formatDateStr(raw.GET_DATE_E) : undefined,
      B_CLASS_ID: raw.B_CLASS_ID || undefined,
      M_CLASS_ID: raw.M_CLASS_ID || undefined,
      S_CLASS_ID: raw.S_CLASS_ID || undefined,
      ASSET_ID: raw.ASSET_ID || undefined,
      HOLD_ORG_ID: raw.HOLD_ORG_ID || undefined,
      HOLD_EMP_ID: raw.HOLD_EMP_ID || undefined,
      USE_ORG_ID: raw.USE_ORG_ID || undefined,
      PageSize: body.PageSize ?? (body as { pageSize?: number }).pageSize ?? 100,
      PageIndex: body.PageIndex ?? (body as { pageIndex?: number }).pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as ASS13070QueryRequest;
    return this.service.queryASS13070(clean);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        DEPRE_YN: raw.DEPRE_YN || undefined,
        SUBPOENA_ID: raw.SUBPOENA_ID || undefined,
        GET_DATE_S: raw.GET_DATE_S ? this.formatDateStr(raw.GET_DATE_S) : undefined,
        GET_DATE_E: raw.GET_DATE_E ? this.formatDateStr(raw.GET_DATE_E) : undefined,
        B_CLASS_ID: raw.B_CLASS_ID || undefined,
        M_CLASS_ID: raw.M_CLASS_ID || undefined,
        S_CLASS_ID: raw.S_CLASS_ID || undefined,
        ASSET_ID: raw.ASSET_ID || undefined,
        HOLD_ORG_ID: raw.HOLD_ORG_ID || undefined,
        HOLD_EMP_ID: raw.HOLD_EMP_ID || undefined,
        USE_ORG_ID: raw.USE_ORG_ID || undefined,
        PageSize: raw.PageSize ?? 100,
        PageIndex: raw.PageIndex ?? 1,
      } as ASS13070QueryRequest;

      this.tableLoading.set(true);
      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
  if (res.Status !== '0000') return;

  this.tableData.set(res.Data ?? []);
  this.totalRecords.set(res.TotalCount ?? 0);

  // 每次重新查詢清空勾選
  this.selectedItems = [];
},
        });
    });
  }

  /** 進入移轉頁（需勾選至少一筆） */
/** 進入移轉頁（需先查詢並勾選至少一筆） */
public onGoTransfer(): void {

  // 尚未查詢，或查詢後沒有資料
  if (this.tableData().length === 0) {
    this.messageService.warnBubble('請先查詢並勾選一筆資料');
    return;
  }

  // 有查詢資料，但尚未勾選
  if (this.selectedItems.length === 0) {
    this.messageService.warnBubble('請至少勾選一筆資料');
    return;
  }

  const missingId = this.selectedItems.some(r => r.ID == null);

  if (missingId) {
    this.messageService.warnBubble('勾選資料缺少主鍵 ID，無法移轉');
    return;
  }

  this.router.navigate(['account/ass/ass13070cru'], {
    state: {
      crudstatus: CRUDStatus.Create,
      fromRoute: this.router.url,
      ass13070Rows: this.selectedItems,
    },
  });
}
}
