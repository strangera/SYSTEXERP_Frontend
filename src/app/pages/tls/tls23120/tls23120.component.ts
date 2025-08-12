import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, EMPTY, throwError, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-tls23120',
    templateUrl: './tls23120.component.html',
    styleUrls: ['./tls23120.component.scss'],
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, MultiSelectComponent, DropdownComponent, RadiobuttonComponent, InputTextModule, ButtonComponent, TranslateModule]
})
export class TLS23120Component extends BasicQueryPageComponent<any> {
  private readonly STORAGE_KEY = 'TLS23120:queryForm';
  private formValueSub?: Subscription;
  querySubscription: Subscription | null = null;
  showPageSizeDialog = false;
  customPageSize = 1000;
   readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  data: any[] = [];
  totalRecords = 0;


  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    bus_type: [],
    ShowBusType: true,
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    area_no : [],
    TLT_No: [],
    ...createPaginationConfig
  });




  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
];

  constructor(
    private tls23120Service: TLS23120Service,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
     private floorService: FloorService,
     private regionService: RegionService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23120', '', this.queryForm);
    this.restoreQueryFromStorage();
    this.formValueSub = this.queryForm.valueChanges
    .subscribe(() => this.saveQueryToStorage());
    const savedQuery = localStorage.getItem('TLS23010_queryForm');
    if (savedQuery) {
      const parsedQuery = JSON.parse(savedQuery);
      this.queryForm.patchValue(parsedQuery);
    }
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => this.businessTypeCodeOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
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

    const queryFormValue = {
      ...this.queryForm.value,
      ShowBusType: this.queryForm.value.ShowBusType ?? true,
      pageSize: this.customPageSize
    };

    this.loading = true;
    this.messageService.blockUi();
    this.tls23120Service.queryTLS23120(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
          this.router.navigate(['account/tls/tls23120cru'], {
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
  /** 立即把目前表單狀態存進 LocalStorage（日期會轉 ISO 字串） */
private saveQueryToStorage(): void {
  const raw = this.queryForm.getRawValue();
  const payload = JSON.stringify(raw, (k, v) => (v instanceof Date ? v.toISOString() : v));
  localStorage.setItem(this.STORAGE_KEY, payload);
}

    /** 從 LocalStorage 還原進表單（把 ISO 字串還原成 Date 物件） */
private restoreQueryFromStorage(): void {
  const json = localStorage.getItem(this.STORAGE_KEY);
  if (!json) return;

  const parsed = JSON.parse(json, (_k, v) => {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    }
    return v;
  });

  this.queryForm.patchValue(parsed, { emitEvent: false });
}

/** 清除 LocalStorage 內儲存的查詢條件 */
private clearQueryStorage(): void {
  localStorage.removeItem(this.STORAGE_KEY);
}

}
