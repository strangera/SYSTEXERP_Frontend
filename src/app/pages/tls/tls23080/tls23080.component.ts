import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23080Service } from '../../../service/API/tls/tls23080.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss']
})
export class TLS23080Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [null,],
    TXN_DateEnd: [null,],
    ECR_No: [''],
    tlt_no: [''],
    tlt_building: [''],
    tlt_floor: [''],
    org_id: [''],
    TXN_Year: [''],
    TXN_Month: [''],
    queryMonthYear: [''],
    ...createPaginationConfig([{ field: 'TXN_DateStart', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    {
      field: 'TXN_Date', header: '銷售日期', visible: true, format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_CancelAmt', header: '作廢', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
  ];

  WhetherOptions: any[] = [];

  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = []
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private whetherService: WhetherService,
    private tls23080Service: TLS23080Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', '', this.queryForm, (form) => this.onSubmit(form));

    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
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

      // 將空字串轉為 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      this.tls23080Service.queryTLS23080(payload).subscribe({
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
        }
      });
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
