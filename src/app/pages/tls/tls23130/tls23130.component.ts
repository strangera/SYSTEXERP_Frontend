import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';

import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23130Service } from '../../../service/API/tls/tls23130.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';

@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  styleUrls: ['./tls23130.component.scss']
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    saleDateStart: [new Date(), [Validators.required]],
    saleDateEnd: [new Date(), [Validators.required]],
    organizationCode: [{ value: '' }],
    regionCode: [[]], // ✅ 改為陣列
    saleMonthYear: [''],   // 銷售年月
    CRD_Type: [''], // 銀行代碼
    businessTypeCode: [{ value: '' }],
    whetherDisplayBusinessType: [],
    locationRadio: [''],
    tlt_building: [''],                                  // 樓層建物
    tlt_floor: [''],                                     // 樓層編號
    org_id: [''],                                        // 組織代碼
    tlt_no: [''],                                      // 專櫃編號
    bus_typeList: [[]],                                  // 業務類別
    ...createPaginationConfig([{ field: 'area', order: 1 }])
  });



  columns: any[] = [
    { field: 'cardNumber', header: '卡號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'machineNumber', header: '機號/名稱', visible: true },
    { field: 'amount', header: '金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_Date', header: '日期', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true },

    { field: 'installmentPeriod', header: '分期數', visible: true },
    { field: 'initialPayment', header: '頭期', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'monthlyPayment', header: '每期', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' }
  ];


  data: any[] = [];
  totalRecords = 0;
  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  CounterOptions: any[] = [];
  bus_typeOptions: any[] = [];


  constructor(
    private tls23130Service: TLS23130Service,
    private regionService: RegionService,
    private cardTypeService: CardTypeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private floorService: FloorService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', '', this.queryForm, (form) => this.onSubmit(form));
    this.cardTypeService.getCardType().subscribe(data => this.cardTypeOptions = data);
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe((res) => {
      this.bus_typeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: x.label,           // 給下拉選單用
        value: x.value,
      })) || [];});
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);

    
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
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

      this.tls23130Service.queryTLS23130(payload).subscribe({
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