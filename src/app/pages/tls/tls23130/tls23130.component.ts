import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23130Service } from '../../../service/api/tls/tls23130.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls23130',
    templateUrl: './tls23130.component.html',
    styleUrls: ['./tls23130.component.scss'],
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextModule, ButtonComponent, TranslateModule]
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  showPageSizeDialog = false;
  customPageSize = 1000;

  queryForm = this.formBuilder.group({
    saleDateStart: [new Date('2024-01-01'), [Validators.required]],
    saleDateEnd: [new Date('2024-01-31'), [Validators.required]],
    BNK_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    

    ...createPaginationConfig([{ field: 'TA.tlt_no', order: 1 }])
  });

  columns: any[] = [
    { field: 'CRD_No', header: '卡號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'TXN_Date', header: '日期', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true },
    { field: 'TERM_No', header: '分期數', visible: true },
    { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'EDC_InstEachAmt', header: '每期', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' }
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
    this.initializePage('TLS23130', '', this.queryForm);

    this.cardTypeService.getCardType().subscribe(data => this.cardTypeOptions = data);
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(res => {
      this.bus_typeOptions = res?.map(x => ({ label: x.label, formLabel: x.label, value: x.value })) || [];
    });
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
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

    const queryFormValue = { ...this.queryForm.value, pageSize: this.customPageSize };
    this.loading = true;
    this.messageService.blockUi();

    this.tls23130Service.queryTLS23130(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
          this.router.navigate(['account/tls/tls23130cru'], {
            state: {
              queryFormValue,
              pageSize: this.customPageSize,
              data: res.Data || []
            }
          });
          
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
