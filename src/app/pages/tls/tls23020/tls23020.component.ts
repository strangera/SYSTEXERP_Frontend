import { Component } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS23020Service } from '../../../service/api/tls/tls23020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { finalize } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, EMPTY, throwError, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';      // ✅ 新增
import { takeUntil, debounceTime } from 'rxjs/operators'; // ✅ 新增

const now = new Date();

@Component({
    selector: 'app-tls23020',
    templateUrl: './tls23020.component.html',
    styleUrls: ['./tls23020.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeQuickComponent,
        MultiSelectComponent,
        InputNumberRangeComponent,
        InputTextComponent,
        DropdownComponent,
        CheckboxModule,
        InputTextModule,
        ButtonComponent,
        DialogModule,
        RadioButtonModule,
        PrimeTemplate,
        ButtonDirective,
        TranslateModule,
    ],
})
export class TLS23020Component extends BasicQueryPageComponent<any> {
  
  //所需參數
  private readonly STORAGE_KEY = 'TLS23020:queryForm';
  private destroy$ = new Subject<void>();   // ✅ 新增
  querySubscription: Subscription | null = null;
  displayMode: 'Detail' | 'Summary' = 'Detail'; // 預設顯示明細報表
  data: any[] = [];
  totalRecords: number = 0;
    readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  //Request
queryForm = this.formBuilder.group({
  TXN_DateStart: [this.yesterday, [Validators.required]],
  TXN_DateEnd: [this.yesterday, [Validators.required]],

  ECR_No: this.formBuilder.control<any[]>([]),
  TXN_No_Start: [null, [this.validationService.numberValidator]],
  TXN_No_End: [null, [this.validationService.numberValidator]],
  TLT_No: this.formBuilder.control<any[]>([]),

  TXN_GUINo: [''],
  PLU_SalePrc_Start: [null],
  PLU_SalePrc_End: [null],

  TXN_TaxType: this.formBuilder.control<any[]>([]),
  TXN_DiscCode: this.formBuilder.control<any[]>([]),
  tlt_id: this.formBuilder.control<any[]>([]),
  PLU_MagNo: this.formBuilder.control<any[]>([]),
  ACT_DiscCode: this.formBuilder.control<any[]>([]),

  IsNoPLU_No: [false],

  rece_yn: this.formBuilder.control<any[]>([]),
  cash_yn: this.formBuilder.control<any[]>([]),
  tlt_building: this.formBuilder.control<any[]>([]),
  tlt_floor: this.formBuilder.control<any[]>([]),
  org_id: this.formBuilder.control<any[]>([]),

  isSummary: false,
  ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
});

  // 下拉選單選項
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  txnStatusOptions: any[] = [];
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private tls23020Service: TLS23020Service,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private floorService: FloorService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private tls11010Service: Tls11010Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private txnStatusService: TxnStatusService,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
  this.initializePage('TLS23020', 'TLS23020cru', this.queryForm);

  this.restoreQueryFromStorage();

  // ✅ 用 takeUntil，不再需要 this.formValueSub
  this.queryForm.valueChanges
    .pipe(debounceTime(300), takeUntil(this.destroy$))
    .subscribe(() => this.saveQueryToStorage());

  // ❌ 刪掉這段混用 key 的讀取
  // const savedQuery = localStorage.getItem('TLS23010_queryForm') ...

  this.tls11010Service.getBuildingOptions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => this.BUILDING_NO_Options = res);

  this.taxableService.getSystemTypes()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.taxableOptions = data);

  this.discountService.getLocalDiscountOptions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.discountOptions = data);

  this.deductionbigCategoryService.getLocalDeductionCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.deductionbigCategoryOptions = data);

  this.whetherService.getWhetherOptions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.whetherOptions = data);

  this.txnStatusService.getTxnStatusOptions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.txnStatusOptions = data);

  this.floorService.getFloors()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.floorOptions = data);

  this.tls11010Service.getOrgOptions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

  this.commissionTypeService.getCommissionTypes()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.commissionTypeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

  this.ECRNoService.getECRNo()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

  this.counterNameService.getCounters()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
}


  
  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  showPageSizeDialog = false;
  customPageSize = 1000;

  goToReportMode(): void {
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請先完成查詢條件');
      this.queryForm.markAllAsTouched();
      return;
    }

    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    console.log('✅ displayMode 傳送前:', this.displayMode);
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const rawFormValue = { ...this.queryForm.value } as any;
    for (const key in rawFormValue) {
      if (rawFormValue[key] === '') rawFormValue[key] = null;
    }

    const queryFormValue = {
      ...rawFormValue,
      pageSize: this.customPageSize,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls23020Service
      .queryTLS23020(queryFormValue, this.displayMode)
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
            this.router.navigate(['account/tls/tls23020cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: res.Data || [],
                displayMode: this.displayMode,
              },
            });
            
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢錯誤');
          this.loading = false;
          this.messageService.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        },
      });
  }

  /** 立即把目前表單狀態存進 LocalStorage（日期會轉 ISO 字串） */
private saveQueryToStorage(): void {
  const raw = this.queryForm.getRawValue();
  const payload = JSON.stringify(raw, (k, v) => (v instanceof Date ? v.toISOString() : v));
  localStorage.setItem(this.STORAGE_KEY, payload);
}

    /** 從 LocalStorage 還原進表單（把 ISO 字串還原成 Date 物件） */
private restoreQueryFromStorage(): void {
  const json = localStorage.getItem(this.STORAGE_KEY);
  if (!json) return;

  const parsed = JSON.parse(json, (_k, v) => {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    }
    return v;
  });

  this.queryForm.patchValue(parsed, { emitEvent: false });
}

/** 清除 LocalStorage 內儲存的查詢條件 */
private clearQueryStorage(): void {
  localStorage.removeItem(this.STORAGE_KEY);
}
onClearClick(): void {
  this.queryForm.reset({
    TXN_DateStart: this.yesterday,
    TXN_DateEnd: this.yesterday,

    ECR_No: [],
    TXN_No_Start: null,
    TXN_No_End: null,
    TLT_No: [],

    TXN_GUINo: '',
    PLU_SalePrc_Start: null,
    PLU_SalePrc_End: null,

    TXN_TaxType: [],
    TXN_DiscCode: [],
    tlt_id: [],
    PLU_MagNo: [],
    ACT_DiscCode: [],

    IsNoPLU_No: false,

    rece_yn: [],
    cash_yn: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],

    isSummary: false,
  });
  this.clearQueryStorage();
  this.messageService.infoBubble('已清除查詢條件');
}
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();

  this.querySubscription?.unsubscribe(); // 若你之後也加「中途取消」需求
}

}
