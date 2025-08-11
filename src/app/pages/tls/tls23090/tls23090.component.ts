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
    ECR_No: [],
    tlt_no: [],
    CRD_Type: [],
    CRD_No: [],
    TXN_PayAmt: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    IPeriod: [],
    AcqBank: [],
    ConnStatus: [],
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

  columns: any[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true, style: 'text-left' },
    {
      field: 'tlt_no',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
      format: (val: any) => this.getLabelFromOptions(val, this.CounterOptions),
    },
    { field: 'CRD_Type', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_Bonus',
      header: '紅利',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    { field: 'TXN_Installment', header: '分期', visible: true },
    { field: 'TXN_PeriodType', header: '分期期別', visible: true },
    { field: 'TXN_Periods', header: '分期期數', visible: true },
    {
      field: 'TXN_DownPayAmt',
      header: '頭期款分期金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'TXN_MonthlyAmt',
      header: '每期分期金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];

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
    this.initializePage('TLS23090', 'TLS23090cru', this.queryForm, 
    );

    this.cardTypeService
      .getCardType()
      .subscribe((data) => (this.cardTypeOptions = data));
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.WhetherOptions = data));
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
    this.installmentPeriodService
      .getInstallmentPeriods()
      .subscribe((data) => (this.installmentPeriodOptions = data));
    this.acquiringBankService
      .getAcquiringBanks()
      .subscribe((data) => (this.acquiringBankOptions = data));
    this.connectionStatusService
      .getConnectionStatusOptions()
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
    .subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          resultData = res.Data || [];
          statusOK = true;
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;

        if (statusOK) {
          
          this.router.navigate(['account/tls/tls23090cru'], {
            state: {
              queryFormValue,
              pageSize: this.customPageSize,
              data: resultData,
              displayMode: this.displayMode,
            },
          });
        }
      },
    });
}



  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
