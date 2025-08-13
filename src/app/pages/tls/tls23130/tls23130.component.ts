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
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-tls23130',
    templateUrl: './tls23130.component.html',
    styleUrls: ['./tls23130.component.scss'],
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, DropdownComponent, MultiSelectComponent, InputTextModule, ButtonComponent, TranslateModule]
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  private destroy$ = new Subject<void>();

  private readonly STORAGE_KEY = 'TLS23130:queryForm';
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
    saleDateStart: [this.yesterday, [Validators.required]],
    saleDateEnd: [this.yesterday, [Validators.required]],
    BNK_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    

    ...createPaginationConfig([{ field: 'TA.tlt_no', order: 1 }])
  });



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
    this.restoreQueryFromStorage();
this.queryForm.valueChanges
  .pipe(debounceTime(300), takeUntil(this.destroy$))
  .subscribe(() => this.saveQueryToStorage());


    this.cardTypeService.getCardType().pipe(takeUntil(this.destroy$)).subscribe(data => this.cardTypeOptions = data);
    this.organizationNumberService.getOrganizationNumbers().pipe(takeUntil(this.destroy$)).subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().pipe(takeUntil(this.destroy$)).subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().pipe(takeUntil(this.destroy$)).subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.bus_typeOptions = res?.map(x => ({ label: x.label, formLabel: x.label, value: x.value })) || [];
    });
    this.whetherService.getWhetherOptions().pipe(takeUntil(this.destroy$)).subscribe(data => this.whetherOptions = data);
    this.tls11010Service.getBuildingOptions().pipe(takeUntil(this.destroy$)).subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
    });
    this.counterNameService.getCounters().pipe(takeUntil(this.destroy$)).subscribe(res => {
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

   this.tls23130Service.queryTLS23130(queryFormValue)
  .pipe(
    timeout(30000),
    catchError(() => {
      this.messageService.errorBubble('查詢失敗');
      this.loading = false;
      this.messageService.unblockUi();
      this.showPageSizeDialog = false;
      return of({ Status: '9999', Data: [] });
    })
  )
  .subscribe({
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
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();

  this.querySubscription?.unsubscribe();
}

}
