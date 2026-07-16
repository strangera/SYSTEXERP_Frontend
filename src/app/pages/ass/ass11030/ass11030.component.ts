import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { distinctUntilChanged, finalize, Observable } from 'rxjs';
import { ASS11030Data, ASS11030QueryRequest } from './ass11030.model';

// 3.1.1.3 資產列管品及耗材分類管理作業-小分類維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass11030',
  templateUrl: './ass11030.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11030Component extends BasicQueryPageComponent<ASS11030Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    S_CLASS_ID: new FormControl<string | null>(null),   // 小分類代碼
    M_CLASS_ID: new FormControl<string | null>(null),   // 中分類代碼
    B_CLASS_ID: new FormControl<string | null>(null),   // 大分類代碼
    NOTES_KEYWORD: new FormControl<string | null>(null), // 說明
    pageSize: new FormControl<number>(30),            // 每頁筆數
    pageIndex: new FormControl<number>(1),            // 頁碼
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11030Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11030QueryRequest;

  public readonly columns: ReportColumn[] = [
    { field: 'S_CLASS_ID', header: '小分類代碼' },
    { field: 'S_CLASS_NAME', header: '小分類名稱' },
    { field: 'M_CLASS_ID', header: '中分類代碼' },
    { field: 'B_CLASS_ID', header: '大分類代碼' },
  ];

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  // 中分類代碼/名稱下拉選項
  public readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  // 小分類代碼/名稱下拉選項
  public readonly smallClassOptions = signal<{ label: string; value: string }[]>([]);

  constructor(
    public readonly service: ASS11030Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11030', '/ass/ass11030cru', this.queryForm, this.onSubmit.bind(this));
    this.logger.debug(`ASS11030 init:`, [this.queryForm]);
    this.loadBigClassOptions();
    this.setupClassCascades();
  }

  /**
   * 載入大分類下拉選項（FACLASSM）
   */
  private loadBigClassOptions(): void {
    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe({
        next: options => {
          this.bigClassOptions.set(
            (options ?? []).map(item => ({
              value: String(item.value),
              label: item.label,
            })),
          );
        },
        error: () => {
          this.bigClassOptions.set([]);
        },
      });
  }

  private setupClassCascades(): void {
    const bCtrl = this.queryForm.controls.B_CLASS_ID;
    const mCtrl = this.queryForm.controls.M_CLASS_ID;
    const sCtrl = this.queryForm.controls.S_CLASS_ID;

    bCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(bClassId => {
        mCtrl.patchValue(null, { emitEvent: false });
        sCtrl.patchValue(null, { emitEvent: false });
        this.midClassOptions.set([]);
        this.smallClassOptions.set([]);
        if (!bClassId) return;
        this.dropdownApiService
          .queryFaClass1({ B_CLASS_ID: bClassId })
          .pipe(untilDestroyed(this))
          .subscribe(options => {
            this.midClassOptions.set(
              (options ?? []).map(item => ({
                value: String(item.value),
                label: item.label,
              })),
            );
          });
      });

    mCtrl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(mClassId => {
        sCtrl.patchValue(null, { emitEvent: false });
        this.smallClassOptions.set([]);
        if (!mClassId) return;
        const bForSmall = bCtrl.value ?? undefined;
        this.dropdownApiService
          .queryFaClass2({ B_CLASS_ID: bForSmall, M_CLASS_ID: mClassId })
          .pipe(untilDestroyed(this))
          .subscribe(options => {
            this.smallClassOptions.set(
              (options ?? []).map(item => ({
                value: String(item.value),
                label: item.label,
              })),
            );
          });
      });

    const initialBClassId = bCtrl.value;
    const initialMClassId = mCtrl.value;
    if (initialBClassId) {
      this.dropdownApiService
        .queryFaClass1({ B_CLASS_ID: initialBClassId })
        .pipe(untilDestroyed(this))
        .subscribe(options => {
          this.midClassOptions.set(
            (options ?? []).map(item => ({
              value: String(item.value),
              label: item.label,
            })),
          );
        });
    }
    if (initialMClassId && initialBClassId) {
      this.dropdownApiService
        .queryFaClass2({ B_CLASS_ID: initialBClassId, M_CLASS_ID: initialMClassId })
        .pipe(untilDestroyed(this))
        .subscribe(options => {
          this.smallClassOptions.set(
            (options ?? []).map(item => ({
              value: String(item.value),
              label: item.label,
            })),
          );
        });
    }
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: ASS11030QueryRequest): Observable<ApiResponse<ASS11030Data[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const pageSize: number = body.PageSize || (body as any).pageSize;
    const pageIndex: number = body.PageIndex || (body as any).pageIndex;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const payload: ASS11030QueryRequest = {
      S_CLASS_ID: rawFormValue.S_CLASS_ID || undefined,
      M_CLASS_ID: rawFormValue.M_CLASS_ID || undefined,
      B_CLASS_ID: rawFormValue.B_CLASS_ID || undefined,
      NOTES_KEYWORD: rawFormValue.NOTES_KEYWORD || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    // 移除空值
    const cleanPayload = removeEmptyValues(payload) as ASS11030QueryRequest;
    return this.service.queryASS11030(cleanPayload);
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      this.lastQueryBody = {
        S_CLASS_ID: rawFormValue.S_CLASS_ID || undefined,
        M_CLASS_ID: rawFormValue.M_CLASS_ID || undefined,
        B_CLASS_ID: rawFormValue.B_CLASS_ID || undefined,
        NOTES_KEYWORD: rawFormValue.NOTES_KEYWORD || undefined,
        PageSize: rawFormValue.pageSize || 30,
        PageIndex: rawFormValue.pageIndex || 1,
      } as ASS11030QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.logger.debug(`onSubmit:`, [this.lastQueryBody]);
      this.queryFunction(this.lastQueryBody).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }
}
