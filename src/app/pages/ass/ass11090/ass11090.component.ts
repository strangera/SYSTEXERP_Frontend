import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11090Service } from '@service/api/ass/ass11090.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { distinctUntilChanged, finalize } from 'rxjs';
import { ASS11090Data, ASS11090QueryRequest } from './ass11090.model';

// 3.1.1.9 資材中分類會計科目維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass11090',
  templateUrl: './ass11090.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class ASS11090Component extends BasicQueryPageComponent<ASS11090Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    /** 大分類代碼 */
    B_CLASS_ID: new FormControl<string | null>(null),
    /** 中分類代碼 */
    M_CLASS_ID: new FormControl<string | null>(null),
    /** 所屬會計科目(借) */
    STYPE_ACCNO: new FormControl<string | null>(null),
    /** 所屬會計科目(貸) */
    STYPE_ACCNO2: new FormControl<string | null>(null),
    /** 進項稅額科目(借) */
    STYPE_TAX_ACCNO: new FormControl<string | null>(null),
    /** 費用科目 */
    FEES_ACCNO: new FormControl<string | null>(null),
    /** 折舊科目(借) */
    DEPRE_ACCNO: new FormControl<string | null>(null),
    /** 累計折舊科目(貸) */
    DEPRE_ACCNO2: new FormControl<string | null>(null),
    /** 折舊年限 */
    EXP_YEAR: new FormControl<number | null>(null),
    /** 備註關鍵字 */
    NOTES_KW: new FormControl<string | null>(null),
    // 中分類會計科目對應表資料量有限（會計分類固定，不會像交易單據無限增長），
    // 一次撈全部避免虛擬捲動分批載入時，畫面實際列數跟右下角總筆數（TotalCount）在還沒捲到底前不一致
    PageSize: new FormControl<number>(1000),
    PageIndex: new FormControl<number>(1),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<ASS11090Data[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: ASS11090QueryRequest;

  @ViewChild('tableReport') tableReport?: TableReportComponent;

  public readonly columns: ReportColumn[] = [
    { field: 'B_CLASS_ID', header: '大分類代碼' },
    { field: 'B_CLASS_NAME', header: '大分類名稱' },
    { field: 'M_CLASS_ID', header: '中分類代碼' },
    { field: 'M_CLASS_NAME', header: '中分類名稱' },
    { field: 'STYPE_ACCNO_NAME', header: '所屬會計科目(借)' },
    { field: 'STYPE_ACCNO2_NAME', header: '所屬會計科目(貸)' },
    { field: 'STYPE_TAX_ACCNO_NAME', header: '進項稅額科目(借)' },
    { field: 'FEES_ACCNO_NAME', header: '費用科目' },
    { field: 'DEPRE_ACCNO_NAME', header: '折舊科目(借)' },
    { field: 'DEPRE_ACCNO2_NAME', header: '累計折舊科目(貸)' },
    { field: 'EXP_YEAR', header: '折舊年限' },
    { field: 'NOTES', header: '備註' },
  ];

  // 大分類代碼/名稱下拉選項
  public readonly bigClassOptions = signal<{ label: string; value: string }[]>([]);
  // 中分類代碼/名稱下拉選項
  public readonly midClassOptions = signal<{ label: string; value: string }[]>([]);
  // 會計科目下拉選項
  public accountingOptions: Option[] = [];

  constructor(
    public readonly service: ASS11090Service,
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11090', '/ASS/ASS11090CRU', this.queryForm, this.onSubmit.bind(this));
    this.loadBigClassOptions();
    this.loadAccountingOptions();
    this.setupClassCascade();
  }

  /**
   * 載入大分類下拉選項
   */
  private loadBigClassOptions(): void {
    this.ass11010Service.queryASS11010({}).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
          value: item.CLASS_ID,
        }));
        this.bigClassOptions.set(options);
      },
    });
  }

  /**
   * 載入指定大分類底下的中分類下拉選項
   */
  private loadMidClassOptions(bClassId: string): void {
    this.ass11020Service.queryASS11020({ B_CLASS_ID: bClassId }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: item.M_CLASS_ID,
        }));
        this.midClassOptions.set(options);
      },
    });
  }

  /**
   * 大→中分類聯動：大分類變動時清空中分類並重新載入該大分類底下的中分類
   */
  private setupClassCascade(): void {
    this.queryForm.controls.B_CLASS_ID.valueChanges.pipe(
      distinctUntilChanged(),
      untilDestroyed(this),
    ).subscribe(bClassId => {
      this.queryForm.patchValue({ M_CLASS_ID: null }, { emitEvent: false });
      this.midClassOptions.set([]);
      if (bClassId) {
        this.loadMidClassOptions(bClassId);
      }
    });

    // initializePage 回填查詢狀態時，valueChanges 可能已錯過，補一次初始載入
    const initialBClassId = this.queryForm.controls.B_CLASS_ID.value;
    if (initialBClassId) {
      this.loadMidClassOptions(initialBClassId);
    }
  }

  /**
   * 載入會計科目下拉選項
   */
  private loadAccountingOptions(): void {
    this.dropdownApiService.queryGls1005().subscribe({
      next: (options) => {
        if (options) {
          this.accountingOptions = options;
        }
      },
      error: (err) => {
        console.error('載入會計科目下拉選單失敗:', err);
      }
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const rawFormValue = this.queryForm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta ?? [];
      const payload = {
        B_CLASS_ID: rawFormValue.B_CLASS_ID || undefined,
        M_CLASS_ID: rawFormValue.M_CLASS_ID || undefined,
        STYPE_ACCNO: rawFormValue.STYPE_ACCNO || undefined,
        STYPE_ACCNO2: rawFormValue.STYPE_ACCNO2 || undefined,
        STYPE_TAX_ACCNO: rawFormValue.STYPE_TAX_ACCNO || undefined,
        FEES_ACCNO: rawFormValue.FEES_ACCNO || undefined,
        DEPRE_ACCNO: rawFormValue.DEPRE_ACCNO || undefined,
        DEPRE_ACCNO2: rawFormValue.DEPRE_ACCNO2 || undefined,
        EXP_YEAR: rawFormValue.EXP_YEAR || undefined,
        NOTES_KW: rawFormValue.NOTES_KW || undefined,
        PageSize: rawFormValue.PageSize || 30,
        PageIndex: rawFormValue.PageIndex || 1,
        SortBy: currentSort.length > 0 ? currentSort : undefined,
      };
      const cleanPayload = removeEmptyValues(payload) as ASS11090QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.service.queryASS11090(cleanPayload).pipe(
        finalize(() => {
          this.tableLoading.set(false);
          this.loading = false;
        }),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.lastQueryBody = cleanPayload;
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }
}
