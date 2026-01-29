import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ColumnDef, ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { RenewalBasicInfo, RenewalLocationInfo, RenewalQueryResponse, TLS12040Service } from '@service/api/tls/tls12040.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';




import { BusinessClassificationService } from '@pages/tls/tls12040-cru/services/business-classification.service';
import { TLS12040ValidationService } from '@pages/tls/tls12040-cru/validation/tls12040-validation.service';
import { DateValidationService } from '@pages/tls/tls13010-cru/validation/date-validation.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';
import { debounceTime, distinctUntilChanged, forkJoin, Observable, Subscription } from 'rxjs';
import { LocationItem } from '../../../../core/models/contract/location-item.interface';

interface DropdownOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-step1-contract-info',
  templateUrl: './step1-contract-info.component.html',
  styleUrls: ['./step1-contract-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    CheckboxModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextComponent,
    InputTextareaComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ExpandableEditTableComponent
  ]
})
export class Step1ContractInfoComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() locationData: LocationItem[] = [];
  @Input() isViewMode = false;
  @Input() submitted = false;
  @Input() isCreateMode = false;

  @Output() dataChange = new EventEmitter<{
    formValue: any;
    locationData: LocationItem[];
  }>();
  @Output() renewalDataLoaded = new EventEmitter<RenewalQueryResponse>();

  private subscriptions: Subscription[] = [];

  // 注入服務
  private readonly messageService = inject(NotificationService);
  private readonly tls12040Service = inject(TLS12040Service);
  private readonly tls12010Service = inject(Tls12010Service);
  private readonly businessClassificationService = inject(BusinessClassificationService);
  private readonly validationService = inject(TLS12040ValidationService);
  private readonly dateValidationService = inject(DateValidationService);
  private readonly tlsBaseService = inject(TlsContractBaseService);
  private readonly cdr = inject(ChangeDetectorRef);

  // 載入狀態旗標
  private isLoadingExistingData = false;
  private isLoadingRenewalData = false;
  private lastRenewalVenNo: string | null = null;

  // 位置表格欄位定義
  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'selector-panel',
      editable: true,
      style: 'min-width: 200px',
      selectorConfig: {
        valuePropertyName: 'value',
        labelPropertyName: 'label',
        displayFieldsConfig: [
          { fieldName: 'value', displayLabel: '', isPrimaryField: true }
        ],
        panelTableColumns: [
          { field: 'value', header: '位置編號', sortable: true },
          { field: 'building_desc', header: '館別', sortable: true },
          { field: 'floor_desc', header: '樓層' },
          { field: 'area_desc', header: '區域' },
          { field: 'tlt_space', header: '營業坪數' }
        ],
        searchFormFields: [
          {
            name: 'building_code',
            label: '館別',
            type: 'dropdown',
            colClass: 'col-4',
            options: [],
            placeholder: '選擇館別'
          },
          {
            name: 'floor_code',
            label: '樓層',
            type: 'dropdown',
            colClass: 'col-4',
            options: [],
            placeholder: '選擇樓層'
          },
          {
            name: 'area_code',
            label: '區域代號',
            type: 'dropdown',
            options: [],
            colClass: 'col-4',
            placeholder: '輸入區域代號'
          }
        ],
        searchMethod: this.searchLocationOptions.bind(this),
        panelDataSource: [],
        totalDataCount: 0
      }
    },
    { field: 'building_desc', header: '館別', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'floor_desc', header: '樓層', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'area_desc', header: '區域', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'tlt_space', header: '營業坪數', type: 'number', editable: false, style: 'min-width: 120px' }
  ];

  // 共用下拉選項
  decorationOptions: DropdownOption[];
  moneyTypeOptions: DropdownOption[];
  checkTypeOptions: DropdownOption[];
  storeWayOptions: DropdownOption[];
  paytypeOptions: DropdownOption[];
  invoiceTypeOptions: DropdownOption[];
  tltKindOptions: DropdownOption[];
  commCompTypeDropdown: DropdownOption[];
  approveStatusOptions: DropdownOption[];
  yesNoOptions: DropdownOption[];
  tltTermTypeOptions: DropdownOption[];
  tltctypemtotalOptions: DropdownOption[];
  totalAmtOptions: DropdownOption[];
  totalAmtVendorOptions: DropdownOption[];
  depositPaymentOptions: DropdownOption[];
  overallStatusOptions: DropdownOption[];
  applyTypeOptions: DropdownOption[];
  contractTypeOptions: DropdownOption[];
  applyStatusOptions: DropdownOption[];

  // API 選項
  bustypeOptions: DropdownOption[] = [];
  busClassOptions: DropdownOption[] = [];
  busSClassOptions: DropdownOption[] = [];
  orgOptions: DropdownOption[] = [];
  paperTypeOptions: DropdownOption[] = [];
  vendorOptions: DropdownOption[] = [];
  negotiatorOptions: DropdownOption[] = [];
  bankDropdownOptions: DropdownOption[] = [];
  buildingOptions: DropdownOption[] = [];
  floorOptions: DropdownOption[] = [];
  regionOptions: DropdownOption[] = [];

  // 內部狀態
  displayLocationData: LocationItem[] = [];
  loading = false;

  constructor(
    private sharedDropdownService: SharedDropdownService,
    private locationOptionsService: LocationOptionsService
  ) {
    // 從 SharedDropdownService 取得共用選項
    this.decorationOptions = this.sharedDropdownService.decorationOptions;
    this.moneyTypeOptions = this.sharedDropdownService.moneyTypeOptions;
    this.checkTypeOptions = this.sharedDropdownService.checkTypeOptions;
    this.storeWayOptions = this.sharedDropdownService.storeWayOptions;
    this.paytypeOptions = this.sharedDropdownService.paytypeOptions;
    this.invoiceTypeOptions = this.sharedDropdownService.invoiceTypeOptions;
    this.tltKindOptions = this.sharedDropdownService.tltKindOptions;
    this.commCompTypeDropdown = this.sharedDropdownService.commCompTypeOptions;
    this.approveStatusOptions = this.sharedDropdownService.approveStatusOptions;
    this.yesNoOptions = this.sharedDropdownService.yesNoOptions;
    this.tltTermTypeOptions = this.sharedDropdownService.tltTermTypeOptions;
    this.tltctypemtotalOptions = this.sharedDropdownService.tltctypemtotalOptions;
    this.totalAmtOptions = this.sharedDropdownService.totalAmtOptions;
    this.totalAmtVendorOptions = this.sharedDropdownService.totalAmtVendorOptions;
    this.depositPaymentOptions = this.sharedDropdownService.depositPaymentOptions;
    this.overallStatusOptions = this.sharedDropdownService.overallStatusOptions;
    this.applyTypeOptions = this.sharedDropdownService.applyTypeOptions;
    this.contractTypeOptions = this.sharedDropdownService.contractTypeOptions;
    this.applyStatusOptions = this.sharedDropdownService.applyStatusOptions;
  }

  ngOnInit(): void {
    this.initializeDropdownOptions();
    this.updateDisplayLocationData();
    this.setupFormListeners();
    this.setupDynamicValidators();
    this.setupContractDateSync();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 初始化 ==========

  /**
   * 初始化下拉選項
   */
  private initializeDropdownOptions(): void {
    // 載入 API 選項
    forkJoin({
      busTypes: this.sharedDropdownService.getBustypeOptions(),
      orgs: this.locationOptionsService.getOrgOptions(),
      paperTypes: this.sharedDropdownService.getPaperTypeOptions('T101'),
      vendors: this.sharedDropdownService.getVendorOptions('1'),
      banks: this.sharedDropdownService.getBankOptions(),
      negotiators: this.sharedDropdownService.getNegotiatorOptions(),
      buildings: this.locationOptionsService.getBuildingOptions(),
      floors: this.locationOptionsService.getFloorOptions(),
      regions: this.sharedDropdownService.getRegionOptions()
    }).subscribe({
      next: (results: any) => {
        this.bustypeOptions = results.busTypes || [];
        this.orgOptions = results.orgs || [];
        this.paperTypeOptions = results.paperTypes || [];
        this.vendorOptions = results.vendors || [];
        this.bankDropdownOptions = results.banks || [];
        this.negotiatorOptions = results.negotiators || [];
        this.buildingOptions = results.buildings || [];
        this.floorOptions = results.floors || [];
        this.regionOptions = results.regions || [];

        this.updateSelectorPanelOptions();
      },
      error: (err: unknown) => {
        console.error('初始化下拉選項失敗:', err);
      }
    });

    // 如果有大分類值，載入中分類選項
    const busType = this.form?.get('bus_type')?.value;
    if (busType) {
      this.loadBusClassOptions(busType);
    }
  }

  // ========== 表單監聽 ==========

  /**
   * 設定表單監聽器（含 isLoadingExistingData 保護）
   */
  private setupFormListeners(): void {
    // 監聽大分類變更
    const busTypeSub = this.form.get('bus_type')?.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(value => {
        // 如果是載入既有資料，不要清空值
        if (this.isLoadingExistingData) {
          console.log('正在載入既有資料，跳過大分類清空邏輯');
          // 但還是要載入選項
          if (value) {
            this.businessClassificationService.getBusClassOptions(value).subscribe({
              next: (options) => {
                this.busClassOptions = options;
                this.cdr.detectChanges();
              }
            });
          }
          return;
        }

        // 使用者手動變更時，執行清空邏輯
        if (value) {
          this.form.patchValue({ bus_class: '', bus_sclass: '' }, { emitEvent: false });
          this.busClassOptions = [];
          this.busSClassOptions = [];

          this.businessClassificationService.getBusClassOptions(value).subscribe({
            next: (options) => {
              this.busClassOptions = options;
              this.cdr.detectChanges();
            },
            error: () => {
              this.busClassOptions = [];
            }
          });
        } else {
          this.form.patchValue({ bus_class: '', bus_sclass: '' }, { emitEvent: false });
          this.busClassOptions = [];
          this.busSClassOptions = [];
        }

        this.emitDataChange();
      });
    if (busTypeSub) this.subscriptions.push(busTypeSub);

    // 監聽中分類變更
    const busClassSub = this.form.get('bus_class')?.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(value => {
        // 如果是載入既有資料，不要清空值
        if (this.isLoadingExistingData) {
          console.log('正在載入既有資料，跳過中分類清空邏輯');
          const busType = this.form.get('bus_type')?.value;
          if (busType && value) {
            this.businessClassificationService.getBusSClassOptions(busType, value).subscribe({
              next: (options) => {
                this.busSClassOptions = options;
                this.cdr.detectChanges();
              }
            });
          }
          return;
        }

        // 使用者手動變更時，執行清空邏輯
        const busType = this.form.get('bus_type')?.value;
        if (value && busType) {
          this.form.patchValue({ bus_sclass: '' }, { emitEvent: false });
          this.busSClassOptions = [];

          this.businessClassificationService.getBusSClassOptions(busType, value).subscribe({
            next: (options) => {
              this.busSClassOptions = options;
              this.cdr.detectChanges();
            },
            error: () => {
              this.busSClassOptions = [];
            }
          });
        } else {
          this.form.patchValue({ bus_sclass: '' }, { emitEvent: false });
          this.busSClassOptions = [];
        }

        this.emitDataChange();
      });
    if (busClassSub) this.subscriptions.push(busClassSub);

    // 監聽契約日期變更，同步營運日期
    const tltBdateSub = this.form.get('tlt_bdate')?.valueChanges.subscribe(value => {
      if (value && !this.form.get('tlt_contract_bdate')?.value) {
        this.form.patchValue({ tlt_contract_bdate: value }, { emitEvent: false });
      }
    });
    if (tltBdateSub) this.subscriptions.push(tltBdateSub);

    const tltEdateSub = this.form.get('tlt_edate')?.valueChanges.subscribe(value => {
      if (value && !this.form.get('tlt_contract_edate')?.value) {
        this.form.patchValue({ tlt_contract_edate: value }, { emitEvent: false });
      }
    });
    if (tltEdateSub) this.subscriptions.push(tltEdateSub);
  }

  /**
   * 設定動態驗證器
   */
  private setupDynamicValidators(): void {
    // 設定抽成別變更監聽
    this.form.get('tlt_term_type')?.valueChanges.subscribe(() => {
      this.validationService.updateFieldValidators(this.form);
    });

    // 設定付款方式變更監聽
    this.form.get('paytype')?.valueChanges.subscribe(() => {
      this.validationService.updatePaymentValidators(this.form);
    });

    // 設定保證金付款方式變更監聽
    ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
      this.form.get(fieldName)?.valueChanges.subscribe(() => {
        this.validationService.updateDepositValidators(this.form);
      });
    });

    // 設定日期驗證器
    this.dateValidationService.setupDateValidators(this.form, this.messageService);

    // 設定預收租金相關監聽
    this.setupRentAheadCalculation();

    // 初始驗證器設定
    this.validationService.updateAllValidators(this.form);
  }

  /**
   * 設定契約日期與營運日期的同步
   */
  private setupContractDateSync(): void {
    const dateSyncSubs = this.tlsBaseService.setupContractDateSync(this.form);
    this.subscriptions.push(...dateSyncSubs);
  }

  /**
   * 設定預收租金計算邏輯
   */
  private setupRentAheadCalculation(): void {
    // 監聽預收租金選項變更
    this.form.get('rent_ahead')?.valueChanges.subscribe((rentAhead) => {
      if (rentAhead === 'Y') {
        this.calculateRentPeriodIfPossible();
        this.updateBaseRentValidators();
      } else {
        // 預收租金為否時，清空期數
        this.form.get('rent_period')?.setValue(0);
        this.updateBaseRentValidators();
      }
    });

    // 監聽契約起始日變更
    this.form.get('tlt_bdate')?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.dateValidationService.validateContractDates(this.form, this.messageService);
      this.calculateRentPeriodIfPossible();
    });

    // 監聽契約迄日變更
    this.form.get('tlt_edate')?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.calculateRentPeriodIfPossible();
    });
  }

  /**
   * 檢查條件並計算預收租金期數
   */
  private calculateRentPeriodIfPossible(): void {
    const rentAhead = this.form.get('rent_ahead')?.value;
    const startDate = this.form.get('tlt_bdate')?.value;
    const endDate = this.form.get('tlt_edate')?.value;
    if (rentAhead !== 'Y' || !startDate || !endDate) {
      return;
    }
    this.dateValidationService.calculateAndSetRentPeriod(this.form, this.messageService);
  }

  /**
   * 更新固定租金驗證器
   */
  private updateBaseRentValidators(): void {
    const baseRentControl = this.form.get('base_rent');
    const rentAhead = this.form.get('rent_ahead')?.value;

    if (!baseRentControl) return;

    baseRentControl.clearValidators();

    if (rentAhead === 'Y') {
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      baseRentControl.setValidators([Validators.min(0)]);
    }

    baseRentControl.updateValueAndValidity();
  }

  // ========== 下拉選項載入 ==========

  /**
   * 載入中分類選項
   */
  private loadBusClassOptions(busType: string): void {
    this.sharedDropdownService.getBusClassOptions(busType).subscribe({
      next: (options: DropdownOption[]) => {
        this.busClassOptions = options || [];
      }
    });
  }

  /**
   * 載入小分類選項
   */
  private loadBusSClassOptions(busType: string, busClass: string): void {
    this.sharedDropdownService.getBusSClassOptions(busType, busClass).subscribe({
      next: (options: DropdownOption[]) => {
        this.busSClassOptions = options || [];
      }
    });
  }

  /**
   * 載入相依下拉選項（供 wizard 在載入既有資料後呼叫）
   * 不會清空已有的 bus_class / bus_sclass 值
   */
  loadDependentDropdowns(): void {
    const busType = this.form.get('bus_type')?.value;
    if (!busType) return;

    this.isLoadingExistingData = true;
    this.businessClassificationService.getBusClassOptions(busType).subscribe({
      next: (options) => {
        this.busClassOptions = options;
        const busClass = this.form.get('bus_class')?.value;
        if (busClass) {
          this.businessClassificationService.getBusSClassOptions(busType, busClass).subscribe({
            next: (sOptions) => {
              this.busSClassOptions = sOptions;
              this.isLoadingExistingData = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.isLoadingExistingData = false;
            }
          });
        } else {
          this.isLoadingExistingData = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoadingExistingData = false;
      }
    });
  }

  // ========== 廠商變更處理 ==========

  /**
   * 廠商變更處理（增強版）
   */
  onVendorChange(vendorVenNo: string): void {
    if (!vendorVenNo?.trim()) {
      // 清空所有相關欄位
      this.form.patchValue({
        vendor_no: '',
        ven_no: '',
        ven_uniform: '',
        VEN_Name: '',
        VEN_Address: '',
        vendor_acct_name: '',
        tlt_name: '',
        bus_type: '',
        contact_tel: '',
        contact_fax: ''
      }, { emitEvent: false });
      return;
    }

    // 檢查 vendorOptions 是否已載入
    if (!this.vendorOptions || this.vendorOptions.length === 0) {
      console.warn('vendorOptions 尚未載入');
      return;
    }

    // 找到選中的廠商資料
    const selectedOption = this.vendorOptions.find((opt: any) => opt.value === vendorVenNo);
    if (!selectedOption) {
      console.warn('找不到對應的廠商選項');
      return;
    }

    const vendorData = selectedOption as any;

    // A. 帶入廠商基本資料
    this.form.patchValue({
      vendor_no: vendorData.No || '',
      ven_no: vendorVenNo,
      ven_uniform: vendorData.No || '',
      VEN_Name: vendorData.Name || vendorData.label || '',
      VEN_Address: vendorData.VEN_Address || '',
      vendor_acct_name: vendorData.Name || vendorData.label || ''
    }, { emitEvent: false });

    // 標記為已觸碰
    this.form.get('ven_no')?.markAsTouched();
    this.form.get('ven_uniform')?.markAsTouched();
    this.form.get('VEN_Name')?.markAsTouched();
    this.form.get('VEN_Address')?.markAsTouched();
    this.form.get('vendor_acct_name')?.markAsTouched();

    this.messageService.successBubble('已自動填入廠商編號、廠商名稱、公司登記地址和帳戶名稱');

    // B. 載入潛在客戶資料或續約資料
    const applyType = this.form.get('apply_type')?.value;
    if (applyType === '2') {
      // 續約模式：載入原合約資料
      this.loadRenewalData(vendorVenNo);
    } else {
      // 非續約模式：載入潛在客戶資料
      this.loadPotentialCustomerData(vendorData.No || '');
    }

    this.emitDataChange();
  }

  // ========== 潛在客戶資料 ==========

  /**
   * 載入潛在客戶資料
   */
  private loadPotentialCustomerData(venUniform: string): void {
    const request = {
      PageSize: 1,
      PageIndex: 1,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      CreatedDateStart: null,
      CreatedDateEnd: null,
      contact_USR_Name: '',
      cus_uniform_id: [venUniform],
      VEN_Name: '',
      VEN_EngName: '',
      tlt_name: '',
      tlt_EngName: '',
      bus_type: []
    };

    this.tls12010Service.queryTLS12010(request).subscribe({
      next: (result) => {
        if (result.Data && result.Data.length > 0) {
          const potentialData = result.Data[0];

          this.form.patchValue({
            tlt_name: potentialData.tlt_name || '',
            bus_type: potentialData.bus_type || '',
            contact_tel: potentialData.VEN_BossTel || '',
            contact_fax: potentialData.VEN_BossFax || '',
            contact_addr: potentialData.VEN_Addr || ''
          }, { emitEvent: true });

          // 標記為已觸碰
          this.form.get('tlt_name')?.markAsTouched();
          this.form.get('bus_type')?.markAsTouched();

          this.messageService.successBubble('已自動帶入潛在客戶資料');
        } else {
          this.messageService.infoBubble('查無潛在客戶資料，僅帶入廠商基本資料');
        }
      },
      error: () => {
        this.messageService.warnBubble('查詢潛在客戶資料失敗');
      }
    });
  }

  // ========== 續約功能 ==========

  /**
   * 載入續約資料
   */
  private loadRenewalData(venNo: string): void {
    // 防止重複呼叫
    if (this.isLoadingRenewalData) {
      return;
    }
    // 如果是相同廠商，跳過重複請求
    if (this.lastRenewalVenNo === venNo) {
      return;
    }

    this.isLoadingRenewalData = true;
    this.lastRenewalVenNo = venNo;
    this.loading = true;

    this.tls12040Service.queryContractForRenewal(venNo).subscribe({
      next: (renewalData) => {
        // 回填基本資料到表單
        this.patchFormForRenewal(renewalData.BasicInfo, renewalData.next_contract_subno);

        // 回填位置資料
        if (renewalData.Locations && renewalData.Locations.length > 0) {
          this.patchLocationForRenewal(renewalData.Locations);
        }

        // 通知 wizard 續約資料已載入
        this.renewalDataLoaded.emit(renewalData);

        this.messageService.successBubble(
          `已載入原合約資料（第 ${renewalData.source_contract_subno} 版），將建立第 ${renewalData.next_contract_subno} 版續約`
        );

        this.isLoadingRenewalData = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        const errorMessage = error?.message || '查無原合約資料或載入失敗';
        this.messageService.warnBubble(errorMessage);
        this.lastRenewalVenNo = null;
        this.isLoadingRenewalData = false;
        this.loading = false;
      }
    });
  }

  /**
   * 將續約基本資料回填到表單
   */
  private patchFormForRenewal(basicInfo: RenewalBasicInfo, nextContractSubno: number): void {
    const renewalFields: Record<string, any> = {
      // 專櫃基本資訊
      tlt_no: basicInfo.tlt_no,
      tlt_shortname: basicInfo.tlt_shortname,
      tlt_name: basicInfo.tlt_name,
      paper_type: basicInfo.paper_type,
      org_id: basicInfo.org_id,

      // 業種分類
      bus_type: basicInfo.bus_type,
      bus_class: basicInfo.bus_class,
      bus_sclass: basicInfo.bus_sclass,

      // 商務條件
      tlt_term_type: basicInfo.tlt_term_type,
      comm_comp_type: basicInfo.comm_comp_type,
      tlt_kind: basicInfo.tlt_kind,
      deco_type: basicInfo.deco_type,
      edc_yn: basicInfo.edc_yn,
      tlt_ctype_mtotal: basicInfo.tlt_ctype_mtotal,
      overall_status: basicInfo.overall_status,
      rent_ahead: basicInfo.rent_ahead,
      rent_period: basicInfo.rent_period,
      base_rent: basicInfo.base_rent,
      deposit: basicInfo.deposit,

      // 業務設定
      rece_yn: basicInfo.rece_yn,
      pos_yn: basicInfo.pos_yn,
      cash_yn: basicInfo.cash_yn,
      comm_yn: basicInfo.comm_yn,
      money_type: basicInfo.money_type,
      store_way: basicInfo.store_way,
      check_type: basicInfo.check_type,
      paytype: basicInfo.paytype,
      vip_yn: basicInfo.vip_yn,
      credit_card: basicInfo.credit_card,
      total_amt: basicInfo.total_amt,
      total_amt_vendor: basicInfo.total_amt_vendor,
      total_amt_unit: basicInfo.total_amt_unit,
      total_amt_vendor_unit: basicInfo.total_amt_vendor_unit,

      // 保證金
      open_deposit: basicInfo.open_deposit,
      open_fees: basicInfo.open_fees,
      construct_deposit: basicInfo.construct_deposit,
      construct_fees: basicInfo.construct_fees,
      expiration_deposit: basicInfo.expiration_deposit,
      expiration_fees: basicInfo.expiration_fees,

      // 其他設定
      ticket_remarks: basicInfo.ticket_remarks,
      check_day: basicInfo.check_day,
      invoice_type: basicInfo.invoice_type,

      // 聯絡資訊
      email: basicInfo.email,
      invoice_email: basicInfo.invoice_email,
      CHECK_TITLE: basicInfo.CHECK_TITLE,
      store_tel: basicInfo.store_tel,
      bank_id: basicInfo.bank_id,
      vendor_acct_name: basicInfo.vendor_acct_name,
      vendor_acct_no: basicInfo.vendor_acct_no,
      contact_tel: basicInfo.contact_tel,
      contact_fax: basicInfo.contact_fax,
      contact_addr: basicInfo.contact_addr,

      // 公用事業
      water_flag: basicInfo.water_flag,
      electric_flag: basicInfo.electric_flag,
      gas_flag: basicInfo.gas_flag,

      // 銷售類型
      cap_saletype1: basicInfo.cap_saletype1,
      cap_saletype2: basicInfo.cap_saletype2,
      cap_saletype3: basicInfo.cap_saletype3,
      cap_saletype4: basicInfo.cap_saletype4,
      cap_saletype5: basicInfo.cap_saletype5,

      // 備註
      tlt_remark: basicInfo.tlt_remark,

      // 更新版次
      contract_subno: nextContractSubno.toString(),

      // 處理 check_typeList（對帳方式多選）
      check_typeList: basicInfo.check_type ? basicInfo.check_type.split(',').map((s: string) => s.trim()) : []
    };

    // 設定旗標避免觸發不必要的監聽
    this.isLoadingExistingData = true;

    // 回填表單
    this.form.patchValue(renewalFields, { emitEvent: false });

    // 載入分類選項
    if (basicInfo.bus_type) {
      this.loadDependentDropdowns();
    }

    // 延遲重置旗標
    setTimeout(() => {
      this.isLoadingExistingData = false;
    }, 500);
  }

  /**
   * 將續約位置資料回填到 locationData
   */
  private patchLocationForRenewal(locations: RenewalLocationInfo[]): void {
    // 將原合約位置轉換為新的位置資料（移除 ID，標記為新增）
    this.locationData = locations.map((loc) => ({
      id: this.generateTempId(),
      apply_no: '', // 新合約，尚無 apply_no
      location_no: loc.location_no,
      tlt_building: loc.tlt_building,
      tlt_floor: loc.tlt_floor,
      area_no: loc.area_no,
      tlt_space: loc.tlt_space,
      building_desc: loc.building_desc,
      floor_desc: loc.floor_desc,
      area_desc: loc.area_desc,
      _status: 'new' as const
    }));

    this.updateDisplayLocationData();
  }

  // ========== 分類變更處理 ==========

  /**
   * 大分類變更處理
   */
  onBusTypeChange(event: any): void {
    if (event) {
      this.loadBusClassOptions(event);
      this.form.patchValue({ bus_class: '', bus_sclass: '' });
      this.busClassOptions = [];
      this.busSClassOptions = [];
    }
    this.emitDataChange();
  }

  /**
   * 中分類變更處理
   */
  onBusClassChange(event: any): void {
    const busType = this.form.get('bus_type')?.value;
    if (event && busType) {
      this.loadBusSClassOptions(busType, event);
      this.form.patchValue({ bus_sclass: '' });
      this.busSClassOptions = [];
    }
    this.emitDataChange();
  }

  /**
   * 小分類變更處理
   */
  onBusSClassChange(event: any): void {
    this.emitDataChange();
  }

  // ========== 申請類型處理 ==========

  /**
   * 申請類型變更處理（增強版）
   */
  onApplyTypeChange(applyType: string): void {
    if (applyType === '2') {
      // 續約模式
      this.messageService.infoBubble('請選擇廠商統一編號以載入原合約資料');
      const venNo = this.form.get('ven_no')?.value;
      if (venNo) {
        this.loadRenewalData(venNo);
      }
    } else {
      // 非續約模式
      this.lastRenewalVenNo = null;
    }
    this.emitDataChange();
  }

  // ========== 位置表格相關 ==========

  /**
   * 更新顯示的位置資料（過濾已刪除項目）
   */
  updateDisplayLocationData(): void {
    this.displayLocationData = this.locationData.filter(item => item._status !== 'deleted');
  }

  /**
   * 取得顯示用位置資料
   */
  getDisplayLocationData(): LocationItem[] {
    return this.displayLocationData;
  }

  /**
   * 新增位置項目（增強版：檢查空白行）
   */
  onAddLocationItem(): void {
    // 檢查是否已有未填寫的新增行
    const hasEmptyNewRow = this.locationData.some(item =>
      item._status === 'new' &&
      !item.location_no
    );

    if (hasEmptyNewRow) {
      this.messageService.warnBubble('請先完成目前新增的櫃位資料後再新增下一筆');
      return;
    }

    const newItem: LocationItem = {
      id: this.generateTempId(),
      apply_no: this.form.get('apply_no')?.value || '',
      location_no: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      tlt_space: 0,
      building_desc: '',
      floor_desc: '',
      area_desc: '',
      _status: 'new'
    };
    this.locationData.push(newItem);
    this.updateDisplayLocationData();
    this.emitDataChange();
  }

  /**
   * 批次刪除位置項目
   */
  onBatchDeleteLocation(items: LocationItem[]): void {
    items.forEach(item => {
      const index = this.locationData.findIndex(loc => loc.id === item.id);
      if (index !== -1) {
        if (this.locationData[index]._status === 'new') {
          // 新增項目直接移除
          this.locationData.splice(index, 1);
        } else {
          // 既有項目標記為刪除
          this.locationData[index]._status = 'deleted';
        }
      }
    });
    this.updateDisplayLocationData();
    this.emitDataChange();
  }

  /**
   * 儲存位置項目（增強版：狀態追蹤）
   */
  onLocationTableSave(event: any): void {
    const { row } = event;
    const index = this.locationData.findIndex(item => item.id === row.id);
    if (index !== -1) {
      // 判斷狀態
      if (this.locationData[index]._status === 'new') {
        // 保持新增狀態
      } else {
        this.locationData[index]._status = 'modified';
      }
      Object.assign(this.locationData[index], row);
    }
    this.updateDisplayLocationData();
    this.emitDataChange();
  }

  /**
   * 編輯位置項目
   */
  onLocationTableEdit(event: any): void {
    // 編輯模式進入，不需特別處理
  }

  /**
   * 取消編輯位置項目（增強版：自動移除空白新增行）
   */
  onLocationTableCancel(event: any): void {
    const locationInfo = event?.row || event;

    // 檢查是否為空白新增行
    if (this.isEmptyLocationRow(locationInfo)) {
      const index = this.locationData.findIndex(item => item.id === locationInfo.id);
      if (index > -1) {
        this.locationData.splice(index, 1);
      }
      this.messageService.infoBubble('已取消新增櫃位');
      this.cdr.detectChanges();
    }

    this.updateDisplayLocationData();
  }

  /**
   * 位置下拉選單變更（增強版：含重複檢查與完整資料映射）
   */
  onLocationDropdownChange(event: any): void {
    const { row, column, value, rowData, field, newValue, oldValue, selectedOption } = event;

    // 相容兩種事件格式
    const actualRow = row || rowData;
    const actualField = column?.field || field;
    const actualValue = value || newValue;
    const actualSelectedOption = selectedOption;

    if (actualField === 'location_no' && actualValue) {
      // 重複檢查
      const isDuplicate = this.isLocationNoDuplicate(actualValue, actualRow.id);

      if (isDuplicate) {
        // 清空位置編號
        actualRow.location_no = '';

        // 如果是新增的空行，直接移除
        if (actualRow._status === 'new' && !actualRow.location_no) {
          this.removeLocationItem(String(actualRow.id));
        }

        this.messageService.warnBubble(`位置編號 ${actualValue} 已存在！`);
        this.cdr.detectChanges();
        return;
      }

      // 沒有重複，正常處理
      if (actualSelectedOption) {
        // 使用 selector-panel 提供的完整資料
        this.handleLocationSelectionFromSelectorPanel(actualRow, actualSelectedOption);
      } else {
        // 根據選擇的位置編號更新相關欄位
        const selectedLocation = this.findLocationByNo(actualValue);
        if (selectedLocation) {
          actualRow.tlt_building = selectedLocation.building_code || selectedLocation.tlt_building || '';
          actualRow.tlt_floor = selectedLocation.floor_code || selectedLocation.tlt_floor || '';
          actualRow.area_no = selectedLocation.area_code || selectedLocation.area_no || '';
          actualRow.building_desc = selectedLocation.building_desc || '';
          actualRow.floor_desc = selectedLocation.floor_desc || '';
          actualRow.area_desc = selectedLocation.area_desc || '';
          actualRow.tlt_space = selectedLocation.tlt_space || 0;
        }
      }

      // 更新狀態
      if (actualRow._status === 'new') {
        // 保持 new 狀態
      } else if (!actualRow._status) {
        actualRow._status = 'modified';
      }
    }

    this.emitDataChange();
  }

  /**
   * 位置欄位變更處理（含重複檢查）
   */
  onLocationFieldChange(event: { fieldName: string; newValue: any; rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    // 特別處理位置編號的重複檢查
    if (fieldName === 'location_no' && newValue) {
      const isDuplicate = this.isLocationNoDuplicate(newValue, rowData.id);

      if (isDuplicate) {
        // 發現重複，延遲移除
        setTimeout(() => {
          this.removeLocationItem(String(rowData.id));
        }, 100);
        return;
      }
    }

    this.emitDataChange();
  }

  /**
   * 從 selector-panel 處理位置選擇
   */
  private handleLocationSelectionFromSelectorPanel(rowData: any, selectedOption: any): void {
    const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);

    if (targetIndex === -1) {
      console.error('找不到對應項目:', rowData.id);
      return;
    }

    const locationInfo = {
      location_no: selectedOption.value || selectedOption.location_no || '',
      tlt_building: selectedOption.tlt_building || '',
      tlt_floor: selectedOption.tlt_floor || '',
      area_no: selectedOption.area_no || '',
      tlt_space: Number(selectedOption.tlt_space) || 0,
      building_desc: selectedOption.building_desc || '',
      floor_desc: selectedOption.floor_desc || '',
      area_desc: selectedOption.area_desc || ''
    };

    // 更新資料
    const currentStatus = this.locationData[targetIndex]._status;
    const newStatus = currentStatus === 'new' ? 'new' : 'modified';

    this.locationData[targetIndex] = {
      ...this.locationData[targetIndex],
      ...locationInfo,
      _status: newStatus
    };

    // 同步更新 rowData（讓表格立即顯示）
    Object.assign(rowData, this.locationData[targetIndex]);

    // 觸發變更檢測
    this.locationData = [...this.locationData];
    this.updateDisplayLocationData();
  }

  /**
   * 檢查位置編號是否重複
   */
  private isLocationNoDuplicate(locationNo: string, currentRowId: string | number | undefined): boolean {
    if (!locationNo || locationNo.trim() === '') {
      return false;
    }

    const duplicates = this.locationData.filter(item =>
      item.id !== currentRowId &&
      item._status !== 'deleted' &&
      item.location_no &&
      item.location_no.trim().toLowerCase() === locationNo.trim().toLowerCase()
    );

    if (duplicates.length > 0) {
      this.messageService.warnBubble(`櫃位編號「${locationNo}」已存在，已自動移除重複項`);
      return true;
    }
    return false;
  }

  /**
   * 移除位置項目
   */
  private removeLocationItem(itemId: string): void {
    this.locationData = this.locationData.filter(item => String(item.id) !== itemId);
    this.updateDisplayLocationData();
    this.cdr.detectChanges();
  }

  /**
   * 判斷是否為空白位置新增行
   */
  private isEmptyLocationRow(locationInfo: any): boolean {
    if (locationInfo?._status !== 'new') {
      return false;
    }

    const keyFields = ['location_no'];
    return keyFields.every(field => {
      const value = locationInfo[field];
      return value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '');
    });
  }

  /**
   * 根據位置編號查找位置資料
   */
  private findLocationByNo(locationNo: string): any {
    const selectorConfig = this.locationColumns[0].selectorConfig;
    if (selectorConfig?.panelDataSource) {
      return selectorConfig.panelDataSource.find((loc: any) => loc.value === locationNo);
    }
    return null;
  }

  /**
   * 計算總營業坪數
   */
  getTotaltlt_space(): number {
    return this.locationData
      .filter(item => item._status !== 'deleted')
      .reduce((total: number, item: LocationItem) => {
        const area = parseFloat(String(item.tlt_space || 0)) || 0;
        return total + area;
      }, 0);
  }

  /**
   * 搜尋位置選項
   */
  searchLocationOptions(searchParams: Record<string, unknown>): Observable<any[]> {
    if (searchParams['SortBy'] && Array.isArray(searchParams['SortBy'])) {
      searchParams['SortBy'] = (searchParams['SortBy'] as { field: string; order: number }[]).map((sort) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,
        order: sort.order
      }));
    }
    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }

  /**
   * 更新選擇器面板選項
   */
  private updateSelectorPanelOptions(): void {
    const selectorConfig = this.locationColumns[0].selectorConfig;
    if (selectorConfig?.searchFormFields) {
      const buildingField = selectorConfig.searchFormFields.find((f: any) => f.name === 'building_code');
      const floorField = selectorConfig.searchFormFields.find((f: any) => f.name === 'floor_code');
      const areaField = selectorConfig.searchFormFields.find((f: any) => f.name === 'area_code');

      if (buildingField) buildingField.options = this.buildingOptions;
      if (floorField) floorField.options = this.floorOptions;
      if (areaField) areaField.options = this.regionOptions;
    }
  }

  // ========== 驗證相關 ==========

  /**
   * 檢查欄位是否有錯誤
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  /**
   * 取得欄位錯誤訊息
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field) {
      return this.validationService.getFieldErrorMessage(fieldName, field);
    }
    return '';
  }

  // ========== 地址複製 ==========

  /**
   * 檢查是否可以複製地址
   */
  canCopyAddress(): boolean {
    return !!this.form.get('VEN_Address')?.value?.trim() && !this.isViewMode;
  }

  /**
   * 複製公司登記地址到郵寄地址
   */
  copyCompanyAddressToContact(): void {
    const companyAddress = this.form.get('VEN_Address')?.value?.trim();
    if (!companyAddress) {
      this.messageService.warnBubble('公司登記地址為空，無法複製');
      return;
    }
    const currentContactAddr = this.form.get('contact_addr')?.value?.trim();
    if (currentContactAddr && !confirm('郵寄地址已有內容，確定要覆蓋嗎？')) {
      return;
    }
    this.form.patchValue({ contact_addr: companyAddress });
    this.form.get('contact_addr')?.markAsTouched();
    this.form.get('contact_addr')?.markAsDirty();
    this.messageService.successBubble('已複製公司登記地址到郵寄地址');
  }

  // ========== Email 格式化與驗證 ==========

  /**
   * 格式化 Email 欄位（增強版）
   */
  formatEmailField(fieldName: string, value: string): void {
    if (!value?.trim()) return;

    // 單一 email，只需要驗證格式
    if (!value.includes(',') && !value.includes(';') && !value.includes('；')) {
      this.validateSingleEmail(fieldName, value.trim());
      return;
    }

    // 格式化多個 email
    const formatted = value
      .replace(/；/g, ';') // 全形分號轉半形
      .split(/[;,]/)
      .map(e => e.trim())
      .filter(e => e !== '')
      .join(';');

    const control = this.form.get(fieldName);
    if (control && formatted !== value) {
      control.setValue(formatted);
      this.messageService.infoBubble(`已自動格式化 ${this.getEmailFieldDisplayName(fieldName)}`);
    }

    // 驗證格式化後的 email
    this.validateMultipleEmails(fieldName, formatted);
  }

  /**
   * 驗證單一 email
   */
  private validateSingleEmail(fieldName: string, email: string): void {
    if (email && !this.isValidEmailFormat(email)) {
      this.messageService.warnBubble(`${this.getEmailFieldDisplayName(fieldName)} 格式不正確`);
    }
  }

  /**
   * 驗證多個 email
   */
  private validateMultipleEmails(fieldName: string, emailString: string): void {
    if (!emailString) return;

    const emails = emailString.split(';');
    const invalidEmails: string[] = [];

    emails.forEach(email => {
      if (email && !this.isValidEmailFormat(email)) {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      this.messageService.warnBubble(
        `${this.getEmailFieldDisplayName(fieldName)} 中有無效格式：${invalidEmails.join(', ')}`
      );
    }
  }

  /**
   * 驗證 email 格式
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * 取得 Email 欄位顯示名稱
   */
  private getEmailFieldDisplayName(fieldName: string): string {
    const fieldNames: Record<string, string> = {
      'email': '聯絡信箱',
      'invoice_email': '發票信箱'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // ========== 工具方法 ==========

  /**
   * 將日期字串轉換為 Date 物件
   * 支援格式: YYYY-MM-DD, YYYY/MM/DD, ISO 格式 (含時間)
   */
  parseDateToDateObject(value: string | Date | null | undefined): Date | null {
    if (!value) return null;

    // 已經是 Date 物件
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    if (typeof value !== 'string') return null;

    const dateStr = value.trim();
    if (!dateStr) return null;

    // 移除時間部分 (處理 ISO 格式如 2026-01-26T16:00:00.000Z)
    const datePart = dateStr.split(/[T\s]/)[0];

    // 嘗試 YYYY-MM-DD 或 YYYY/MM/DD 格式
    const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript 月份從 0 開始
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  /**
   * 生成臨時 ID
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * 發送資料變更事件
   */
  private emitDataChange(): void {
    this.dataChange.emit({
      formValue: this.form.getRawValue(),
      locationData: this.locationData
    });
  }
}
