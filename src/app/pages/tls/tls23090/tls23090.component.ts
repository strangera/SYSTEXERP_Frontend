import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { ConnectionStatusService } from '../../../service/basic/connection-status.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';


@Component({
    selector: 'app-tls23090',
    templateUrl: './tls23090.component.html',
    styleUrls: ['./tls23090.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeQuickComponent,
        MultiSelectComponent,
        DropdownComponent,
        InputTextComponent,
        InputTextModule,
        ButtonComponent,
        DialogModule,
        RadioButtonModule,
        PrimeTemplate,
        ButtonDirective,
        TranslateModule,
    ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  private destroy$ = new Subject<void>(); // 統一退訂用
  private readonly STORAGE_KEY = 'TLS23090:queryForm';
  private formValueSub?: Subscription;
  querySubscription: Subscription | null = null;
  showPageSizeDialog = false;
  customPageSize = 1000;
  displayMode: 'CreditCardDetail' | 'CounterCardAnalysis' = 'CreditCardDetail'; // 預設報表模式
  readonly yesterday: Date = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - 1);
      return d;
    })();
queryForm = this.formBuilder.group({
  TXN_DateStart: [this.yesterday, [Validators.required]],
  TXN_DateEnd: [this.yesterday, [Validators.required]],
  ECR_No: this.formBuilder.control<any[]>([]),
  tlt_no: this.formBuilder.control<any[]>([]),
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
  ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
});

  cardTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  connectionStatusOptions: any[] = [];

  data: any[] = [];
  totalRecords = 0;



  constructor(
    private cardTypeService: CardTypeService,
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private connectionStatusService: ConnectionStatusService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', 'TLS23090cru', this.queryForm,);
    this.restoreQueryFromStorage();
    this.queryForm.valueChanges
  .pipe(debounceTime(300), takeUntil(this.destroy$))
  .subscribe(() => this.saveQueryToStorage());



    this.cardTypeService
      .getCardType().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.cardTypeOptions = data));
    this.floorService
      .getFloors().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.floorOptions = data));
    this.whetherService
      .getWhetherOptions().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.WhetherOptions = data));
    this.tls11010Service
      .getBuildingOptions().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.installmentPeriodService
      .getInstallmentPeriods().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.installmentPeriodOptions = data));
    this.acquiringBankService
      .getAcquiringBanks().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.acquiringBankOptions = data));
    this.connectionStatusService
      .getConnectionStatusOptions().pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.connectionStatusOptions = data));
  }


  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
  if (this.loading) return;

  this.submitted = true;

  if (this.queryForm.invalid) {
    this.messageService.warnBubble('請確認欄位資料是否完整');
    this.queryForm.markAllAsTouched();
    return;
  }

  const queryFormValue = {
    ...this.queryForm.value,
    pageSize: this.customPageSize,
  };

  this.loading = true;
  this.messageService.blockUi();

  let resultData: any[] = [];
  let statusOK = false;

this.tls23090Service
  .queryTLS23090(queryFormValue, this.displayMode)
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
        const resultData = res.Data || [];
        this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
        this.router.navigate(['account/tls/tls23090cru'], {
          state: {
            queryFormValue,
            pageSize: this.customPageSize,
            data: resultData,
            displayMode: this.displayMode,
          },
        });
      } else {
        this.messageService.errorBubble('查詢失敗');
      }
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
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();

  this.querySubscription?.unsubscribe();
}

}
