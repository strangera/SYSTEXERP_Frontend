import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TLS23030Service } from '../../../service/api/tls/tls23030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { WhetherService } from '../../../service/basic/whether.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TicketStatusService } from '../../../service/basic/ticket-status-service.service';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { timeout, catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core'; // 確保有 import
type DisplayMode = 'Report' | 'SummaryReport';
@Component({
    selector: 'app-tls23030',
    templateUrl: './tls23030.component.html',
    styleUrls: ['./tls23030.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeQuickComponent,
        MultiSelectComponent,
        InputNumberRangeComponent,
        DropdownComponent,
        InputTextComponent,
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
export class TLS23030Component extends BasicQueryPageComponent<any> {
  displayMode: DisplayMode = 'Report';

  useSummaryMode = false; // 預設為明細表模式

  queryForm = this.formBuilder.group({
    DisplayMode: this.displayMode, // 預設為明細表模式
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    TXN_DateEnd: [new Date('2020-01-03') as Date, [Validators.required]],
    ECR_No: [], // ✅ 修正為 []
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [], // ✅ 修正為 []
    PAY_Type: [], // ✅ 修正為 []
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [], // ✅ 修正為 []
    TXN_MemCard: [''],
    CRD_Type: [], // ✅ 修正為 []
    CRD_No: [''],
    pay_taxtype: [''],
    org_id: [], // ✅ 修正為 []
    IsPayType: [false],
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [], // ✅ 修正為 []
    PAY_NO: [], // ✅ 修正為 []
    IsHaveTERM_No: [false],

    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    }, // 若無此欄位請移除
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    {
      field: 'PAY_Type',
      header: '付款別',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.paymentTypeOptions),
    },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TaxAlwnc',
      header: '備抵稅額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    {
      field: 'TXN_Time',
      header: '交易時間',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) return val;

        const yyyy = date.getFullYear();
        const MM = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const HH = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');

        return `${yyyy}/${MM}/${dd} ${HH}:${mm}`;
      },
    },
    { field: 'CRD_Type', header: '信用卡別', visible: true },
    {
      field: 'CRD_No',
      header: '信用卡卡號/條碼',
      visible: true,
      style: 'text-right',
    },
    {
      field: 'IsHaveTERM_No',
      header: '是否分期',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.WhetherOptions),
    },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    {
      field: 'org_id',
      header: '組織名稱',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.OrganizationCodeOptions),
    },
  ];

  displayModeOptions: any[] = [];
  WhetherOptions: any[] = [];
  paymentTypeOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  ticketStatusOptions: any[] = [];
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private whetherService: WhetherService,
    private displayModeService: DisplayModeService,
    private paymentTypeService: PaymentTypeService,
    private transactionTypeService: TransactionTypeService,
    private cardTypeService: CardTypeService,
    private ticketStatusService: TicketStatusService,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
    private tls23030Service: TLS23030Service,
    private txnStatusService: TxnStatusService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23030', '', this.queryForm, (form) =>
      this.onSubmit(form),
    );

    // ✅ 下拉選單初始化
    this.displayModeService
      .getDisplayModes()
      .subscribe((data) => (this.displayModeOptions = data));
    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.WhetherOptions = data));
    this.paymentTypeService
      .getPaymentTypes()
      .subscribe((data) => (this.paymentTypeOptions = data));
    this.transactionTypeService
      .getTransactionTypes()
      .subscribe((data) => (this.transactionTypeOptions = data));
    this.cardTypeService
      .getCardType()
      .subscribe((data) => (this.cardTypeOptions = data));
    this.ticketStatusService
      .getTicketStatuses()
      .subscribe((data) => (this.ticketStatusOptions = data));
    this.taxableService
      .getSystemTypes()
      .subscribe((data) => (this.taxableOptions = data));
    this.discountService
      .getLocalDiscountOptions()
      .subscribe((data) => (this.discountOptions = data));
    this.deductionbigCategoryService
      .getLocalDeductionCategories()
      .subscribe((data) => (this.deductionbigCategoryOptions = data));
    this.commissionTypeService
      .getCommissionTypes()
      .subscribe((data) => (this.commissionTypeOptions = data));
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res || []).map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res || []).map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res || []).map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  private cleanFormPayload(payload: any): any {
    for (const key in payload) {
      const val = payload[key];
      if (
        val === '' ||
        val === null ||
        (Array.isArray(val) && val.length === 0)
      ) {
        payload[key] = null;
      }
    }

    if (payload['IsHaveTERM_No'] === 'Y') payload['IsHaveTERM_No'] = true;
    if (payload['IsHaveTERM_No'] === 'N') payload['IsHaveTERM_No'] = false;

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30, // ✅ 小寫
      pageIndex: (payload.pageIndex ?? 1) - 1, // ✅ 小寫
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ID', order: 1 }],
    };
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = this.cleanFormPayload({ ...form.value });

      console.log('查詢參數:', payload);

      this.tls23030Service
        .queryTLS23030(payload)
        .pipe(
          timeout(30000),
          catchError((err) => {
            if (err.name === 'TimeoutError') {
              this.messageService.warnBubble(
                '查詢時間過久，請嘗試縮小查詢條件範圍',
              );
            } else {
              this.messageService.errorBubble('查詢錯誤');
            }
            this.data = [];
            this.totalRecords = 0;
            this.loading = false;
            this.messageService.unblockUi();
            return of({ Status: '9999', Data: [] });
          }),
        )
        .subscribe({
          next: (res: any) => {
            if (res.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount || this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, payload);
              this.messageService.successBubble('查詢成功');
            } else if (res.Status !== '9999') {
              this.messageService.errorBubble('查詢失敗');
            }
          },
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
  //報表修改
  showPageSizeDialog = false;
  customPageSize = 1000;
  goToReportMode(): void {
    this.useSummaryMode = true; // ✅ 必加這行，否則條件不會是 SummaryReport
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true; // 👈 顯示彈窗
  }
  confirmPageSizeAndNavigate(): void {
    console.log('✅ displayMode 傳送前:', this.displayMode);
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize,
      DisplayMode: this.displayMode, // ✅ 改這裡
    });

    console.log('🔍 當前查詢模式:', this.displayMode);
    console.log('📤 查詢參數:', queryFormValue);

    this.loading = true;
    this.messageService.blockUi();

    this.tls23030Service
      .queryTLS23030(queryFormValue)
      .pipe(
        timeout(30000),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            this.messageService.warnBubble(
              '查詢時間過久，請嘗試縮小查詢條件範圍',
            );
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [] });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            const resultData = res.Data || [];
            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

            this.router
              .navigate(['account/tls/tls23030cru'], {
                state: {
                  queryFormValue,
                  pageSize: this.customPageSize,
                  data: resultData,
                },
              })
              .then((success) => {
                if (!success) {
                  this.messageService.errorBubble('導航失敗');
                }
              });

            this.messageService.successBubble('查詢成功');
          } else if (res.Status !== '9999') {
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
}
