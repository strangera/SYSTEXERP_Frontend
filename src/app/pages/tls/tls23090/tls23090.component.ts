import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  styleUrls: ['./tls23090.component.scss']
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    ECR_No: [''],
    tlt_no: [''],
    CRD_Type: [''],
    CRD_No: [''],
    TXN_PayAmt: [null],
    tlt_building: [''],                                  // 樓層建物
    tlt_floor: [''],                                     // 樓層編號
    org_id: [''],  
    IPeriod: [''],     
    AcqBank:  [''],  
    ConnStatus     :  [''],                                  // 組織代碼
    IsHaveTERM_No: [null], // 預設為 null 而不是 true
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }])
  });

  cardTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = []
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項
  WhetherOptions: any[] = [];
  installmentPeriodOptions: any[] = []; // 分期期數選項
  acquiringBankOptions: any[] = []; // 收單銀行選項
  connectionStatusOptions: any[] = []; // 連線狀態選項


  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true },
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true,
      style: 'text-left' },
          { field: 'tlt_no', header: '櫃位名稱', visible: true,
      style: 'text-left',format: (val: any) => this.getLabelFromOptions(val, this.CounterOptions) },
    { field: 'CRD_Type', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt', header: '金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_Bonus', header: '紅利', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    { field: 'TXN_Installment', header: '分期', visible: true },
    { field: 'TXN_PeriodType', header: '分期期別', visible: true },
    { field: 'TXN_Periods', header: '分期期數', visible: true },
    {
      field: 'TXN_DownPayAmt', header: '頭期款分期金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_MonthlyAmt', header: '每期分期金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
  ];

  constructor(
    private cardTypeService: CardTypeService,
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private installmentPeriodService:InstallmentPeriodService,
    private acquiringBankService:AcquiringBankService,
    private connectionStatusService:ConnectionStatusService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', '', this.queryForm, (form) => this.onSubmit(form));
    this.cardTypeService.getCardType().subscribe(data => {
      this.cardTypeOptions = data;
    });
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
     this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });

     this.installmentPeriodService.getInstallmentPeriods().subscribe(data => this.installmentPeriodOptions = data);
  this.acquiringBankService.getAcquiringBanks().subscribe(data => this.acquiringBankOptions = data);
    this.connectionStatusService.getConnectionStatusOptions().subscribe(data => this.connectionStatusOptions = data);


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

      // ✅ 將 'Y' / 'N' 轉成 true / false
      if (payload.IsHaveTERM_No === 'Y') {
        payload.IsHaveTERM_No = true;
      } else if (payload.IsHaveTERM_No === 'N') {
        payload.IsHaveTERM_No = false;
      }

      // ✅ 將空字串轉 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      console.log('查詢參數:', payload);

      this.tls23090Service.queryTLS23090(payload).subscribe({
        next: (res) => {
          console.log('查詢結果:', res);
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
        }
      });
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
