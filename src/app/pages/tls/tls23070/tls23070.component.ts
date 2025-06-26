import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/API/tls/tls23070.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrls: ['./tls23070.component.scss']
})
export class TLS23070Component extends BasicQueryPageComponent<any> {

  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  WhetherOptions: any[] = [];
  OrganizationCodeOptions: any[] = [''];

  showPageSizeDialog = false;
  customPageSize = 1000;

  queryForm = this.formBuilder.group({
    TXN_DateStart: [new Date('2020-01-01'), [Validators.required]],
    TXN_DateEnd: [new Date('2020-01-02'), [Validators.required]],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    {
      field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime()) ? val : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'PreSale_Received', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'PreSale_Checkout', header: '預售實收結帳', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_ExchangeAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat }

  ];

  constructor(
    private tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'TLS23070CRU', this.queryForm, (form) => this.onSubmit(form));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
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
  }
 
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading || form.invalid) return;

    this.handleSubmit(form, () => {
      const payload = { ...form.value };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      this.tls23070Service.queryTLS23070(payload).subscribe({
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
          this.messageService.errorBubble('查詢錯誤');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }
   goToReportMode(): void {
    this.customPageSize = 1000;
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = {
      ...this.queryForm.value,
      pageSize: this.customPageSize
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls23070Service.queryTLS23070(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
          this.router.navigate(['/TLS/TLS23070CRU'], {
            state: {
              queryFormValue,
              pageSize: this.customPageSize,
              data: res.Data || []
            }
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
      }
    });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
