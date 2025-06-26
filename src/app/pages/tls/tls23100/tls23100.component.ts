import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss']
})
export class TLS23100Component extends BasicQueryPageComponent<any> {

  queryForm = this.formBuilder.group({
    counterCode: [''],
        TXN_DateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    TXN_DateEnd: [new Date(), [Validators.required]],
    pstarttime: [new Date('2020-01-01'), [Validators.required]],
    pendtime: [new Date(), [Validators.required]],
    paymentType: [''],
    TLT_No: [''],
     ECR_No: [''],
    tlt_building: [''],                                  // 樓層建物
    tlt_floor: [''],                                     // 樓層編號
    org_id: [''],                                        // 組織代碼
    ...createPaginationConfig([{ field: 'counterCode', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
    { field: 'transactionNumber', header: '交易序號', visible: true },
        { field: 'tlt_no', header: '專櫃編號', visible: true,
      style: 'text-left' },
          { field: 'tlt_no', header: '櫃位名稱', visible: true,
      style: 'text-left',format: (val: any) => this.getLabelFromOptions(val, this.CounterOptions) },
    { field: 'paymentType', header: '付款別', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.paymentTypeOptions) },
    { field: 'cardType', header: '卡別', visible: true },
    { field: 'cardNumber', header: '號碼', visible: true },
    {
      field: 'amount', header: '金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
  ];

  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];


  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
        private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23100', '', this.queryForm, (form) => this.onSubmit(form));

    this.paymentTypeService.getPaymentTypes().subscribe(data => {
      this.paymentTypeOptions = data;
    });
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
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
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
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

      this.tls23100Service.queryTLS23100(payload).subscribe({
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
