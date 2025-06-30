import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss']
})
export class TLS23120Component extends BasicQueryPageComponent<any> {
  showPageSizeDialog = false;
  customPageSize = 1000;

  queryForm = this.formBuilder.group({
    saleDateStart: [new Date('2020-01-01') as Date, [Validators.required]],
    saleDateEnd: [new Date('2020-01-15') as Date, [Validators.required]],
    organizationCode: [{}],
    regionCode: [],
    businessTypeCode: [],
    whetherDisplayBusinessType: [],
    locationRadio: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    bus_typeList: [],
    tlt_no: [],
    ...createPaginationConfig([{ field: 'area', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'area', header: '區分', visible: true },
    { field: 'transactionCount', header: '銷貨筆數', visible: true },
    { field: 'netSales', header: '淨銷貨', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'businessTax', header: '營業稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'transactionAmount', header: '銷貨金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'preSaleCount', header: '預售筆數', visible: true },
    { field: 'preSaleAmount', header: '預售金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'settleCount', header: '結帳筆數', visible: true },
    { field: 'settleAmount', header: '結帳金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' }
  ];

  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  bus_typeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23120Service: TLS23120Service,
    private regionService: RegionService,
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
    this.initializePage('TLS23120', '', this.queryForm, (form) => this.onSubmit(form));

    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => this.businessTypeCodeOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
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
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      this.loading = true;
      this.messageService.blockUi();

      this.tls23120Service.queryTLS23120(payload).subscribe({
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
          this.showPageSizeDialog = false;
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

    this.tls23120Service.queryTLS23120(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
          this.router.navigate(['/TLS/TLS23120CRU'], {
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
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      }
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
