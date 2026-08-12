import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  QueryASS11040DataWrapper,
  QueryASS11040Request,
  QueryASS11040Response,
} from '@pages/ass/ass11040/ass11040.model';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
//3.1.1.4 品項資料維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass11040',
  templateUrl: './ass11040.component.html',
  standalone: true,
  imports: [InputTextareaComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TranslateModule]
})
export class ASS11040Component extends BasicQueryPageComponent<QueryASS11040Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    itemCode: [null, [Validators.maxLength(13)]], // 品項代碼
    itemName: [null, [Validators.maxLength(64)]], // 品項名稱
    bigCategoryCode: [null as string | null], // 大分類代碼
    midCategoryCode: [null as string | null], // 中分類代碼
    smlCategoryCode: [null as string | null], // 小分類代碼
    itemCategory: [null], // 品項類別區分
    itemUnit: [null], // 基本單位
    packageUnit: [null], // 包裝單位
    warrantyMethod: [null], // 保固方式
    maintenanceMethod: [null], // 保養方式
    illustrate: [null, [Validators.maxLength(160)]], // 說明
  });

  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');
  bigCategoryCodeOptions: Option[] = [];
  midCategoryCodeOptions: Option[] = [];
  smlCategoryCodeOptions: Option[] = [];

  warrantyMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  maintenanceMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];

  public readonly tableData = signal<QueryASS11040Response[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS11040Request;
  selectedRows: QueryASS11040Response[] = [];

  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;

  columns: ReportColumn[] = [
    { field: 'GOODS_ID', header: '品項代碼', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'B_CLASS_ID', header: '大分類代碼', visible: true },
    { field: 'B_CLASS_NAME', header: '大分類名稱', visible: true },
    { field: 'M_CLASS_ID', header: '中分類代碼', visible: true },
    { field: 'M_CLASS_NAME', header: '中分類名稱', visible: true },
    { field: 'S_CLASS_ID', header: '小分類代碼', visible: true },
    { field: 'S_CLASS_NAME', header: '小分類名稱', visible: true },
    { field: 'MATERIAL_TYPE', header: '品項類別區分', visible: true },
  ];
  // ----------------------------------------------------------------

  constructor(
    public readonly ass11040Service: ASS11040Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', 'ass/ass11040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadBigCategoryOptions();
    this.setupCategoryCascades();
  }

  /** 載入大分類選項 */
  loadBigCategoryOptions(): void {
    this.dropdownApi
      .queryFaClassM()
      .pipe(untilDestroyed(this))
      .subscribe(opts => {
        this.bigCategoryCodeOptions = opts ?? [];
      });
  }

  /** 設定大→中→小分類 cascade 連動 */
  private setupCategoryCascades(): void {
    const bCtrl = this.queryForm.controls.bigCategoryCode;
    const mCtrl = this.queryForm.controls.midCategoryCode;
    const sCtrl = this.queryForm.controls.smlCategoryCode;

    const inOpts = (opts: Option[], v: unknown): boolean =>
      v != null && opts.some(o => String(o.value) === String(v));

    bCtrl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          mCtrl.patchValue(null, { emitEvent: false });
          sCtrl.patchValue(null, { emitEvent: false });
          this.midCategoryCodeOptions = [];
          this.smlCategoryCodeOptions = [];
        }),
        switchMap(bId =>
          !bId
            ? of([] as Option[])
            : this.dropdownApi.queryFaClass1({ B_CLASS_ID: bId }).pipe(map(o => o ?? [])),
        ),
        untilDestroyed(this),
      )
      .subscribe(opts => (this.midCategoryCodeOptions = opts));

    mCtrl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          sCtrl.patchValue(null, { emitEvent: false });
          this.smlCategoryCodeOptions = [];
        }),
        switchMap(mId =>
          !mId
            ? of([] as Option[])
            : this.dropdownApi
              .queryFaClass2({
                B_CLASS_ID: bCtrl.value ?? undefined,
                M_CLASS_ID: mId,
              })
              .pipe(map(o => o ?? [])),
        ),
        untilDestroyed(this),
      )
      .subscribe(opts => (this.smlCategoryCodeOptions = opts));

    // 還原查詢狀態時的初始化載入
    const initB = bCtrl.value;
    const initM = mCtrl.value;
    if (initB) {
      this.dropdownApi
        .queryFaClass1({ B_CLASS_ID: initB })
        .pipe(untilDestroyed(this))
        .subscribe(opts => {
          const mids = opts ?? [];
          this.midCategoryCodeOptions = mids;

          if (mCtrl.value != null && !inOpts(mids, mCtrl.value)) {
            mCtrl.patchValue(null, { emitEvent: false });
            sCtrl.patchValue(null, { emitEvent: false });
            return;
          }

          if (initM) {
            this.dropdownApi
              .queryFaClass2({ B_CLASS_ID: initB, M_CLASS_ID: initM })
              .pipe(untilDestroyed(this))
              .subscribe(opts2 => {
                const smalls = opts2 ?? [];
                this.smlCategoryCodeOptions = smalls;

                if (sCtrl.value != null && !inOpts(smalls, sCtrl.value)) {
                  sCtrl.patchValue(null, { emitEvent: false });
                }
              });
          }
        });
    }
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: QueryASS11040Request): Observable<ApiResponse<QueryASS11040Response[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const pageSize = (body as QueryASS11040Request & { pageSize?: number }).pageSize ?? body.PageSize;
    const pageIndex = (body as QueryASS11040Request & { pageIndex?: number }).pageIndex ?? body.PageIndex;
    const payload: QueryASS11040Request = {
      GOODS_ID: rawFormValue.itemCode || undefined,
      GOODS_NAME: rawFormValue.itemName || undefined,
      B_CLASS_ID: rawFormValue.bigCategoryCode || undefined,
      M_CLASS_ID: rawFormValue.midCategoryCode || undefined,
      S_CLASS_ID: rawFormValue.smlCategoryCode || undefined,
      MATERIAL_TYPE: rawFormValue.itemCategory || undefined,
      UNIT: rawFormValue.itemUnit || undefined,
      PACK_UNIT: rawFormValue.packageUnit || undefined,
      MT_MODE: rawFormValue.warrantyMethod || undefined,
      IVN_MODE: rawFormValue.maintenanceMethod || undefined,
      NOTES_KW: rawFormValue.illustrate || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    const cleanPayload = removeEmptyValues(payload) as QueryASS11040Request;
    return this.ass11040Service.queryASS11040(cleanPayload).pipe(
      map((res: ApiResponse<QueryASS11040DataWrapper>) => ({
        ...res,
        Data: res.Data?.QueryData ?? [],
        TotalCount: res.Data?.TotalRows ?? res.Data?.TotalCount ?? res.TotalCount ?? 0,
      }))
    );
  };

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length
        ? [...this.tableReport.multiSortMeta]
        : undefined;
      this.lastQueryBody = {
        GOODS_ID: rawFormValue.itemCode || undefined,
        GOODS_NAME: rawFormValue.itemName || undefined,
        B_CLASS_ID: rawFormValue.bigCategoryCode || undefined,
        M_CLASS_ID: rawFormValue.midCategoryCode || undefined,
        S_CLASS_ID: rawFormValue.smlCategoryCode || undefined,
        MATERIAL_TYPE: rawFormValue.itemCategory || undefined,
        UNIT: rawFormValue.itemUnit || undefined,
        PACK_UNIT: rawFormValue.packageUnit || undefined,
        MT_MODE: rawFormValue.warrantyMethod || undefined,
        IVN_MODE: rawFormValue.maintenanceMethod || undefined,
        NOTES_KW: rawFormValue.illustrate || undefined,
        PageSize: 99999,
        PageIndex: 1,
        SortBy: currentSort,
      } as QueryASS11040Request;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

}
