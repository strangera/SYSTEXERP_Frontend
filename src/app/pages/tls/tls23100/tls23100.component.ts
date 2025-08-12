import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  private destroy$ = new Subject<void>();
  private readonly STORAGE_KEY = 'TLS23100:queryForm';
  private formValueSub?: Subscription;
  querySubscription: Subscription | null = null;
  //此頁面所需參數
  showPageSizeDialog = false;
  customPageSize = 1000;
  Data: any[] = [];
  totalRecords = 0;
   readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  //request
queryForm = this.formBuilder.group({
  TXN_DateStart: [this.yesterday as Date, [Validators.required]],
  TXN_DateEnd: [this.yesterday, [Validators.required]],

  ECR_No: this.formBuilder.control<any[]>([]),
  TLT_No: this.formBuilder.control<any[]>([]),
  CRD_Type: this.formBuilder.control<any[]>([]),
  CRD_No: this.formBuilder.control<any[]>([]),

  TXN_PayAmt: [null],

  tlt_building: this.formBuilder.control<any[]>([]),
  tlt_floor: this.formBuilder.control<any[]>([]),
  org_id: this.formBuilder.control<any[]>([]),

  IPeriod: this.formBuilder.control<any[]>([]),
  AcqBank: this.formBuilder.control<any[]>([]),
  ConnStatus: this.formBuilder.control<any[]>([]),

  IsHaveTERM_No: [null],
  ...createPaginationConfig([{ field: 'TLT_No', order: 1 }]),
});


  //下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];
  //匯入所需Services
  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }
  //頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100cru', this.queryForm);

    this.restoreQueryFromStorage();
this.queryForm.valueChanges
  .pipe(debounceTime(300), takeUntil(this.destroy$))
  .subscribe(() => this.saveQueryToStorage());

    //收銀機號下拉
    this.ECRNoService.getECRNo().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    //專櫃編號下拉
    this.counterNameService.getCounters().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.CounterOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    //付款別下拉
    this.paymentTypeService
      .getPaymentTypes().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.paymentTypeOptions = data));
    //館別下拉
    this.tls11010Service
      .getBuildingOptions().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    //樓層下拉
    this.floorService
      .getFloors().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.floorOptions = data));

    //組織代碼下拉
    this.tls11010Service.getOrgOptions().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;

    // ✅ 驗證查詢表單是否有效
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    // ✅ 取出表單值並處理空字串 => null
    const rawFormValue: Record<string, any> = { ...this.queryForm.value };

    for (const key in rawFormValue) {
      const value = rawFormValue[key];

      if (typeof value === 'string' && value.trim() === '') {
        rawFormValue[key] = null;
      }
    }

    // ✅ 加入自定義筆數參數（PageSize 是後端預期欄位）
    const queryFormValue = {
      ...rawFormValue,
      pageSize: this.customPageSize, // 前端使用的
      PageSize: this.customPageSize, // 傳給後端
      PageIndex: 1, // 預設查詢第 1 頁
    };

    // ✅ 啟用 loading 與畫面鎖定
    this.loading = true;
    this.messageService.blockUi();

    // ✅ 呼叫查詢 API
    this.tls23100Service
  .queryTLS23100(queryFormValue)
  .pipe(
    timeout(30000),
    catchError(() => {
      this.messageService.errorBubble('查詢失敗');
      this.loading = false;
      this.messageService.unblockUi();
      this.showPageSizeDialog = false;
      return of({ Status: '9999', Data: [] });
    })
  )
  .subscribe({
    next: (res) => {
      if (res.Status === '0000') {
        this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
        this.router.navigate(['account/tls/tls23100cru'], {
          state: {
            queryFormValue,
            pageSize: this.customPageSize,
            data: res.Data || [],
          },
        }).then(() => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        });
      } else {
        this.messageService.errorBubble('查詢失敗');
      }
    },
    complete: () => {
      // 若上面已導航成功會在 then() 解鎖；這裡保險再解一次
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
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();

  this.querySubscription?.unsubscribe();
}

}
