import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls23040',
    templateUrl: './tls23040.component.html',
    styleUrls: ['./tls23040.component.scss'],
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
        InputTextModule,
        ButtonComponent,
        DialogModule,
        RadioButtonModule,
        PrimeTemplate,
        ButtonDirective,
        TranslateModule,
    ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    ECR_No: [''],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [''],
    TXN_Status: [''],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [''],
    org_id: [''],
    TXN_FlagStatus: [''],
    TXN_Subtype: [''],

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
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    { field: 'gui_track', header: '發票起號(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票號碼(起)', visible: true },
    { field: 'GUIEndNo', header: '發票號碼(迄)', visible: true },
    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '業績金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    // {
    //   field: 'TXN_FlagStatus',
    //   header: '狀態旗標',
    //   visible: true,
    // },
    // {
    //   field: 'TXN_Subtype',
    //   header: '交易附屬型態',
    //   visible: true,
    // },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ORG_ECR_No', header: '原收銀機代號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotPayScoreAmt',
      header: '會員積點折抵',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
  ];

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,

    private tls11010Service: Tls11010Service,
  ) {
    super();
  }
  useSummaryMode = false; // 預設為明細表模式
  ngOnInit(): void {
    this.initializePage('TLS23040', '', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    this.useSummaryMode = false; // 預設為明細表模式

    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));
    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );
    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));

    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') payload[key] = null;
      });

      this.tls23040Service.queryTLS23040(payload).subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            this.messageService.successBubble('查詢成功');
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.messageService.errorBubble('查詢錯誤');
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

  //報表模式

  showPageSizeDialog = false;
  customPageSize = 1000;
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

  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }
  displayMode: 'Report' | 'ByPaymentType' | 'ByDiscountType' = 'Report';
  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize,
      displayMode: this.displayMode,
    });

    console.log('🔍 當前查詢模式:', this.displayMode);
    console.log('📤 查詢參數:', queryFormValue);
    // ✅ 自動補 ECR_No 的邏輯放這
    if (this.displayMode === 'ByPaymentType' && !queryFormValue.ECR_No) {
      const firstECR = this.ECRNoOptions[0]?.value;
      if (firstECR) {
        queryFormValue.ECR_No = firstECR;
      } else {
        this.messageService.warnBubble('付款別報表需選擇收銀機代號');
        this.loading = false;
        this.messageService.unblockUi();
        return;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    const query$ =
      this.displayMode === 'Report'
        ? this.tls23040Service.queryTLS23040(queryFormValue)
        : this.tls23040Service.queryCombined(queryFormValue);

    query$
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

            this.router.navigate(['account/tls/tls23040cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: resultData,
                displayMode: this.displayMode,
              },
            });

            this.messageService.successBubble('查詢成功');
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
}
