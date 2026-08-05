import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { TableComponent } from '@others/component/table/table.component';
import { Column } from '@others/component/table/table.model';

import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { RenewalBasicInfo, RenewalLocationInfo, RenewalQueryResponse, TLS12080Service } from '@service/api/tls/tls12080.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { SharedDropdownService } from '@others/services/shared-dropdown.service';
import { LocationOptionsService } from '@others/services/dropdownservice/location-options.service';
import { VendorCategoryOptionsService } from '@others/services/dropdownservice/vendor-category-options.service';




import { BusinessClassificationService } from '@pages/tls/shared/services/business-classification.service';
import { DateValidationService } from '@pages/tls/shared/services/date-validation.service';
import { TLS12040ValidationService } from '@pages/tls/shared/services/tls12040-validation.service';
import { TlsContractBaseService } from '@others/services/tls/tls-contract-base.service';
import { debounceTime, distinctUntilChanged, forkJoin, Subscription } from 'rxjs';
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
    FormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextComponent,
    InputTextareaComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    TableEditComponent,
    TableComponent
  ]
})
export class Step1ContractInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() form!: FormGroup;
  @Input() locationData: LocationItem[] = [];
  @Input() isViewMode = false;
  @Input() submitted = false;
  @Input() isCreateMode = false;
  /** 父元件 API 載入完成後設為 true，通知 step1 載入依賴下拉 */
  @Input() dataReady = false;

  @Output() dataChange = new EventEmitter<{
    formValue: any;
    locationData: LocationItem[];
  }>();
  @Output() renewalDataLoaded = new EventEmitter<RenewalQueryResponse>();

  private subscriptions: Subscription[] = [];

  // 注入服務
  private readonly messageService = inject(NotificationService);
  private readonly tls12080Service = inject(TLS12080Service);
  private readonly tls12010Service = inject(Tls12010Service);
  private readonly tls13010Service = inject(TLS13010Service);
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
  locationEditColumns: EditColumn[] = [
    { field: 'location_no', header: '位置編號', type: 'custom', minWidth: '160px' },
    { field: 'building_desc', header: '館別', minWidth: '100px' },
    { field: 'floor_desc', header: '樓層', minWidth: '100px' },
    { field: 'area_desc', header: '區域', minWidth: '100px' },
    { field: 'tlt_space', header: '營業坪數', minWidth: '120px' },
    { field: 'tlt_bdate', header: '起始日', type: 'date', dateFormat: 'yy/mm/dd', minWidth: '130px' },
    { field: 'tlt_edate', header: '截止日', type: 'date', dateFormat: 'yy/mm/dd', minWidth: '130px' },
    // TLS12080 暫不啟用業績分攤(%)（僅 TLS13010 / TLS13020 需要）
    // {
    //   field: 'sale_rate', header: '業績分攤(%)', type: 'inputNumber',
    //   min: 0, max: 100, maxFractionDigits: 2, suffix: '%', minWidth: '130px',
    //   validate: [
    //     (value: unknown) => {
    //       const num = Number(value);
    //       const ok = value !== null && value !== undefined && value !== '' && !isNaN(num) && num > 0;
    //       return { isValid: ok, errorMessage: ok ? [] : ['業績分攤(%) 必填且需大於 0'] };
    //     }
    //   ]
    // },
  ];

  selectedLocationRows: LocationItem[] = [];
  /** 上次分配業績分攤時的櫃位地點數量（TLS12080 暫停用） */
  // private lastSaleRateCount = -1;

  locationDefaultInsertData = {
    location_no: '',
    tlt_building: '',
    building_desc: '',
    tlt_floor: '',
    floor_desc: '',
    area_no: '',
    area_desc: '',
    tlt_space: 0,
    sale_rate: null,
    tlt_bdate: null,
    tlt_edate: null
  };

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
  pos2013Options: any[] = [];
  negotiatorOptions: DropdownOption[] = [];
  bankDropdownOptions: DropdownOption[] = [];
  buildingOptions: DropdownOption[] = [];
  floorOptions: DropdownOption[] = [];
  regionOptions: DropdownOption[] = [];

  // 位置選擇器 Dialog 狀態
  locationPickerVisible = false;
  locationPickerLoading = false;
  locationPickerData: any[] = [];
  locationPickerSelectedRow: any = null;
  private currentPickerRow: LocationItem | null = null;
  locationStatusFilter = new FormControl('all');
  locationStatusOptions = [
    { label: '全部', value: 'all' },
    { label: '未使用', value: 'available' },
    { label: '使用中', value: 'occupied' }
  ];
  pickerBuildingFilter = new FormControl(null);
  pickerFloorFilter = new FormControl(null);
  pickerAreaFilter = new FormControl(null);
  pickerLocationNoFilter = new FormControl(null);

  locationPickerColumns: Column[] = [
    { field: 'value', header: '位置編號', showSort: true },
    { field: 'building_desc', header: '館別' },
    { field: 'floor_desc', header: '樓層' },
    { field: 'area_desc', header: '區域' },
    { field: 'tlt_space', header: '坪數' },
    {
      field: 'occ_tlt_no' as any,
      header: '狀態',
      format: (_val: unknown, _i: unknown, rowData: unknown) => this.isOccupiedInPickerRange(rowData) ? '使用中' : '未使用',
      cellClass: (rowData: unknown) => this.isOccupiedInPickerRange(rowData) ? 'text-red-500 font-bold' : 'text-green-600'
    },
    { field: 'occ_tlt_no', header: '專櫃編號' },
    { field: 'occ_tlt_name', header: '專櫃名稱' },
    { field: 'occ_bdate', header: '起始日' },
    { field: 'occ_edate', header: '截止日' },
  ];

  // 內部狀態
  displayLocationData: LocationItem[] = [];
  loading = false;

  constructor(
    private sharedDropdownService: SharedDropdownService,
    private readonly locationOptionsService: LocationOptionsService,
    private readonly vendorCategoryService: VendorCategoryOptionsService
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

  ngOnChanges(changes: SimpleChanges): void {
    // locationData 從父元件更新時，自動刷新顯示
    if (changes['locationData']) {
      this.updateDisplayLocationData();
    }
    // 父元件 API 載入完成，載入依賴下拉（中分類、小分類）
    if (changes['dataReady'] && this.dataReady && this.form?.get('bus_type')?.value) {
      this.loadDependentDropdowns();
    }
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
      vendors: this.vendorCategoryService.getVendorCategoryNoNameOptionsForCru(),
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
        this.pos2013Options = results.vendors || [];
        this.bankDropdownOptions = results.banks || [];
        this.negotiatorOptions = results.negotiators || [];
        this.buildingOptions = results.buildings || [];
        this.floorOptions = results.floors || [];
        this.regionOptions = results.regions || [];
        // options 載入完成後強制重繪，確保 readonly dropdown 能正確顯示 label
        this.cdr.detectChanges();
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

    // 監聽契約日期變更，同步營運日期 & 自動帶入空白的地點起訖日
    const tltBdateSub = this.form.get('tlt_bdate')?.valueChanges.subscribe(value => {
      if (value && !this.form.get('tlt_contract_bdate')?.value) {
        this.form.patchValue({ tlt_contract_bdate: value }, { emitEvent: false });
      }
      // 自動帶入：地點起始日為空者，填入契約起始日
      if (value) {
        let changed = false;
        this.locationData.forEach(loc => {
          if (loc._status !== 'deleted' && !loc.tlt_bdate) {
            loc.tlt_bdate = value;
            changed = true;
          }
        });
        if (changed) {
          this.updateDisplayLocationData();
          this.emitDataChange();
        }
      }
    });
    if (tltBdateSub) this.subscriptions.push(tltBdateSub);

    const tltEdateSub = this.form.get('tlt_edate')?.valueChanges.subscribe(value => {
      if (value && !this.form.get('tlt_contract_edate')?.value) {
        this.form.patchValue({ tlt_contract_edate: value }, { emitEvent: false });
      }
      // 自動帶入：地點截止日為空者，填入契約截止日
      if (value) {
        let changed = false;
        this.locationData.forEach(loc => {
          if (loc._status !== 'deleted' && !loc.tlt_edate) {
            loc.tlt_edate = value;
            changed = true;
          }
        });
        if (changed) {
          this.updateDisplayLocationData();
          this.emitDataChange();
        }
      }
    });
    if (tltEdateSub) this.subscriptions.push(tltEdateSub);
  }

  /**
   * 設定動態驗證器
   */
  private setupDynamicValidators(): void {
    // 設定抽成別變更監聽
    this.form.get('tlt_term_type')?.valueChanges.subscribe((val) => {
      this.validationService.updateFieldValidators(this.form);
      if (!['4', '6'].includes(val)) {
        this.form.get('tlt_ctype_mtotal')?.setValue(null);
      }
    });

    // 設定付款方式變更監聽
    this.form.get('paytype')?.valueChanges.subscribe(() => {
      this.validationService.updatePaymentValidators(this.form);
    });

    // [暫時註解] 保證金付款方式變更監聽 - 選擇付款方式時金額變必填
    // ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
    //   this.form.get(fieldName)?.valueChanges.subscribe(() => {
    //     this.validationService.updateDepositValidators(this.form);
    //   });
    // });

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

    // 監聽契約起始日變更，自動同步所有地點起始日
    const bdateSub = this.form.get('tlt_bdate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractStart => {
        if (contractStart && !this.isViewMode) {
          // 更新候選列預設值
          this.locationDefaultInsertData = { ...this.locationDefaultInsertData, tlt_bdate: contractStart };
          let changed = false;
          this.locationData.forEach(loc => {
            if (loc._status !== 'deleted') {
              loc.tlt_bdate = contractStart;
              changed = true;
            }
          });
          if (changed) {
            this.updateDisplayLocationData();
            this.emitDataChange();
          }
        }
      });

    // 監聽契約截止日變更，自動同步所有地點截止日
    const edateSub = this.form.get('tlt_edate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractEnd => {
        if (contractEnd && !this.isViewMode) {
          // 更新候選列預設值
          this.locationDefaultInsertData = { ...this.locationDefaultInsertData, tlt_edate: contractEnd };
          let changed = false;
          this.locationData.forEach(loc => {
            if (loc._status !== 'deleted') {
              loc.tlt_edate = contractEnd;
              changed = true;
            }
          });
          if (changed) {
            this.updateDisplayLocationData();
            this.emitDataChange();
          }
        }
      });

    if (bdateSub) this.subscriptions.push(bdateSub);
    if (edateSub) this.subscriptions.push(edateSub);
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

    const selectedOption = this.pos2013Options.find((opt: any) => opt.value === vendorVenNo);
    if (!selectedOption) return;

    // A. 帶入廠商基本資料
    this.form.patchValue({
      vendor_no: selectedOption.No || '',
      ven_no: selectedOption.VEN_No || selectedOption.value,
      ven_uniform: selectedOption.No || '',
      VEN_Name: selectedOption.Name || selectedOption.label || '',
      VEN_Address: selectedOption.VEN_Address || '',
      vendor_acct_name: selectedOption.Name || selectedOption.label || ''
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
    if (applyType === '2' && this.isCreateMode) {
      // 續約模式：載入原合約資料
      this.loadRenewalData(vendorVenNo);
    } else {
      // 無條件查詢潛在客戶資料（帶入大分類等欄位）
      this.loadPotentialCustomerData(selectedOption.No || '');
    }

    // C. 載入 POS2013 廠商聯絡資訊（不限 apply_type，僅排除檢視模式）
    if (!this.isViewMode) {
      this.loadVendorContactInfo(vendorVenNo);
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
            bus_type: potentialData.bus_type || ''
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

  // ========== POS2013 廠商聯絡資訊 ==========

  /** 根據廠商編號查詢POS2013廠商聯絡資訊並自動帶入 */
  private loadVendorContactInfo(venNo: string): void {
    this.tls13010Service.queryVendorInfo(venNo).subscribe({
      next: (res: any) => {
        if (res?.Status === '0000' && res?.Data) {
          const d = res.Data;
          this.form.patchValue({
            email: d.email || '',
            invoice_email: d.invoice_email || '',
            CHECK_TITLE: d.CHECK_TITLE || '',
            contact_tel: d.contact_tel || '',
            contact_fax: d.contact_fax || '',
            contact_addr: d.contact_addr || '',
            bank_id: d.bank_id || '',
            vendor_acct_name: d.vendor_acct_name || '',
            vendor_acct_no: d.vendor_acct_no || '',
            paytype: d.paytype || '',
            check_day: d.check_day || ''
          }, { emitEvent: false });
          this.messageService.successBubble('已自動帶入廠商聯絡資訊');
        }
      },
      error: (err) => {
        console.error('查詢廠商聯絡資訊失敗:', err);
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

    this.tls12080Service.queryContractForRenewal(venNo).subscribe({
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
      // 續約必須強制設為 '2'（防止被其他流程重置）
      apply_type: '2',

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
    // 通知 wizard 更新 wizardState.locationData（續約位置資料）
    this.emitDataChange();
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
    // 續約只在新增模式下觸發
    if (applyType === '2' && this.isCreateMode) {
      this.messageService.infoBubble('請選擇廠商統一編號以載入原合約資料');
      const venNo = this.form.get('ven_no')?.value;
      if (venNo) {
        this.loadRenewalData(venNo);
      }
    } else {
      this.lastRenewalVenNo = null;
    }

    this.emitDataChange();
  }

  /**
   * 申請案件型態(contract_type)變更處理
   * 切到「潛在客戶」(1) 且已選廠商 → 載入潛在客戶資料
   */
  onContractTypeChange(contractType: string): void {
    if (contractType === '1') {
      // 潛在客戶：清空回函截止日
      this.form.patchValue({ due_date: null }, { emitEvent: false });

      const venUniform = this.form.get('ven_uniform')?.value;
      if (venUniform) {
        this.loadPotentialCustomerData(venUniform);
      }
    }
    this.emitDataChange();
  }

  // ========== 位置表格相關 ==========

  /**
   * 更新顯示的位置資料（過濾已刪除項目）
   */
  updateDisplayLocationData(): void {
    // this.applySaleRateDistribution(); // TLS12080 暫不啟用業績分攤
    this.displayLocationData = this.locationData.filter(item => item._status !== 'deleted');
  }

  /**
   * 依櫃位地點數量平均分配業績分攤(%)：1 個 = 100、2 個各 50，以此類推。
   * TLS12080 暫不啟用（僅 TLS13010 / TLS13020 需要），保留供日後開啟。
   */
  // private applySaleRateDistribution(): void {
  //   const active = this.locationData.filter(
  //     loc => loc._status !== 'deleted' && String(loc.location_no || '').trim()
  //   );
  //   const n = active.length;
  //   const anyMissing = active.some(loc => loc.sale_rate == null || Number(loc.sale_rate) <= 0);
  //   const countChanged = this.lastSaleRateCount >= 0 && n !== this.lastSaleRateCount;
  //   this.lastSaleRateCount = n;
  //   if (n === 0) return;
  //   if (!countChanged && !anyMissing) return;
  //
  //   const base = Math.floor((100 / n) * 100) / 100; // 取到小數 2 位
  //   active.forEach((loc, i) => {
  //     loc.sale_rate = i === n - 1
  //       ? Math.round((100 - base * (n - 1)) * 100) / 100 // 最後一筆補足使總和 = 100
  //       : base;
  //   });
  // }

  /** 移除未填入位置編號的新增空列，離開步驟前呼叫 */
  removeEmptyNewRows(): void {
    const cleaned = this.locationData.filter(
      loc => loc._status !== 'new' || loc.location_no?.trim()
    );
    if (cleaned.length !== this.locationData.length) {
      this.locationData = cleaned;
      this.updateDisplayLocationData();
      this.emitDataChange();
    }
  }

  /**
   * 取得顯示用位置資料
   */
  getDisplayLocationData(): LocationItem[] {
    return this.displayLocationData;
  }

  // ========== 位置表格 dataChange ==========

  onLocationDataChange(data: any[]): void {
    // 保留本次 table-edit 不知道的舊刪除紀錄
    const emittedKeys = new Set(
      data.map(d => d._TABLE_KEY ?? (d.id != null ? String(d.id) : '')).filter(Boolean)
    );
    const prevDeleted = this.locationData.filter(
      loc => loc._status === 'deleted' &&
        !(loc as any)._TABLE_KEY &&
        loc.id != null &&
        !emittedKeys.has(String(loc.id))
    );
    // 新列加入時，若日期為空則自動帶入合約起訖日
    const contractBdate = this.form.get('tlt_bdate')?.value;
    const contractEdate = this.form.get('tlt_edate')?.value;
    data.forEach(row => {
      if (!row.tlt_bdate && contractBdate) row.tlt_bdate = contractBdate;
      if (!row.tlt_edate && contractEdate) row.tlt_edate = contractEdate;
    });
    this.locationData = [...prevDeleted, ...data] as LocationItem[];
    this.displayLocationData = data as LocationItem[];
    this.emitDataChange();
  }

  get filteredPickerData(): any[] {
    switch (this.locationStatusFilter.value) {
      case 'available': return this.locationPickerData.filter(x => !this.isOccupiedInPickerRange(x));
      case 'occupied': return this.locationPickerData.filter(x => this.isOccupiedInPickerRange(x));
      default: return this.locationPickerData;
    }
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

  isOccupiedInPickerRange(rowData: unknown): boolean {
    const row = rowData as { occ_tlt_no?: string; occ_bdate?: string; occ_edate?: string };
    if (!row?.occ_tlt_no) return false;
    const reqStart = this.currentPickerRow?.tlt_bdate ? new Date(this.currentPickerRow.tlt_bdate as string) : null;
    const reqEnd = this.currentPickerRow?.tlt_edate ? new Date(this.currentPickerRow.tlt_edate as string) : null;
    const occStart = row.occ_bdate ? new Date(row.occ_bdate) : null;
    const occEnd = row.occ_edate ? new Date(row.occ_edate) : null;
    if (!reqStart || !reqEnd || !occStart || !occEnd) return true;
    return reqStart <= occEnd && reqEnd >= occStart;
  }

  isLocationSelectable = (rowData: unknown): boolean => !this.isOccupiedInPickerRange(rowData);

  private formatDateParam(d: string | Date | undefined | null): string | null {
    if (!d) return null;
    if (d instanceof Date) return d.toLocaleDateString('sv-SE');
    return d;
  }

  openLocationPicker(rowData: any): void {
    const row = rowData as LocationItem;
    if (!row.tlt_bdate) row.tlt_bdate = this.form.get('tlt_bdate')?.value || null;
    if (!row.tlt_edate) row.tlt_edate = this.form.get('tlt_edate')?.value || null;
    if (!row.tlt_bdate || !row.tlt_edate) {
      this.messageService.warnBubble('請先填寫位置的起始日與截止日');
      return;
    }
    this.currentPickerRow = row;
    this.locationPickerSelectedRow = null;
    this.locationPickerData = [];
    this.locationStatusFilter.setValue('all');
    this.pickerBuildingFilter.setValue(null);
    this.pickerFloorFilter.setValue(null);
    this.pickerAreaFilter.setValue(null);
    this.pickerLocationNoFilter.setValue(null);
    this.locationPickerVisible = true;
    this.loadLocationPickerData(row);
  }

  private loadLocationPickerData(row: LocationItem, filters?: { building_code?: string; floor_code?: string; area_code?: string; location_no?: string }): void {
    this.locationPickerLoading = true;
    const talentIdVal = this.form.get('talent_id')?.value;
    const params: any = {
      PageSize: 9999,
      PageIndex: 1,
      tlt_bdate: this.formatDateParam(row.tlt_bdate),
      tlt_edate: this.formatDateParam(row.tlt_edate),
      talent_id: talentIdVal ? Number(talentIdVal) : null
    };
    if (filters?.building_code) params.building_code = filters.building_code;
    if (filters?.floor_code) params.floor_code = filters.floor_code;
    if (filters?.area_code) params.area_code = filters.area_code;
    if (filters?.location_no) params.location_no = filters.location_no;

    this.locationOptionsService.getLocationWithDetailsOptions(params).subscribe({
      next: (data) => {
        this.locationPickerData = data;
        this.locationPickerLoading = false;
      },
      error: () => { this.locationPickerLoading = false; }
    });
  }

  onPickerSearch(): void {
    if (!this.currentPickerRow) return;
    this.locationPickerSelectedRow = null;
    this.loadLocationPickerData(this.currentPickerRow, {
      building_code: this.pickerBuildingFilter.value || undefined,
      floor_code: this.pickerFloorFilter.value || undefined,
      area_code: this.pickerAreaFilter.value || undefined,
      location_no: this.pickerLocationNoFilter.value || undefined,
    });
  }

  onLocationPickerConfirm(): void {
    if (!this.locationPickerSelectedRow || !this.currentPickerRow) return;
    const location = Array.isArray(this.locationPickerSelectedRow)
      ? this.locationPickerSelectedRow[0]
      : this.locationPickerSelectedRow;
    if (!location) return;
    const row = this.currentPickerRow;

    // 候選列（尚未轉為真實列）：直接新增一筆真實列
    if ((row as LocationItem & { _isAutoInsertCandidate?: boolean })._isAutoInsertCandidate) {
      const isDuplicate = this.locationData.some(item =>
        item.location_no === location.value && item._status !== 'deleted'
      );
      if (isDuplicate) {
        this.messageService.errorBubble(`位置編號 ${location.value} 已存在!`);
        return;
      }
      const newRow: LocationItem = {
        location_no: location.value,
        tlt_building: location.tlt_building || '',
        tlt_floor: location.tlt_floor || '',
        area_no: location.area_no || '',
        building_desc: location.building_desc || '',
        floor_desc: location.floor_desc || '',
        area_desc: location.area_desc || '',
        tlt_space: location.tlt_space || 0,
        tlt_bdate: row.tlt_bdate,
        tlt_edate: row.tlt_edate,
        _status: 'new'
      };
      this.locationData = [...this.locationData, newRow];
      this.updateDisplayLocationData();
      this.emitDataChange();
      this.locationPickerVisible = false;
      this.currentPickerRow = null;
      return;
    }

    const isDuplicate = this.locationData.some(item =>
      item.location_no === location.value &&
      item._status !== 'deleted' &&
      item.id !== row.id
    );
    if (isDuplicate) {
      this.messageService.errorBubble(`位置編號 ${location.value} 已存在!`);
      return;
    }

    const targetIndex = this.locationData.findIndex(item => item.id === row.id);
    if (targetIndex !== -1) {
      const current = this.locationData[targetIndex];
      this.locationData[targetIndex] = {
        ...current,
        location_no: location.value,
        tlt_building: location.tlt_building || '',
        tlt_floor: location.tlt_floor || '',
        area_no: location.area_no || '',
        building_desc: location.building_desc || '',
        floor_desc: location.floor_desc || '',
        area_desc: location.area_desc || '',
        tlt_space: location.tlt_space || 0,
        _status: current._status === 'new' ? 'new' : 'modified'
      };
      this.locationData = [...this.locationData];
      this.updateDisplayLocationData();
    }

    this.locationPickerVisible = false;
    this.currentPickerRow = null;
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

  get isMtotalReadonly(): boolean {
    return !['4', '6'].includes(this.form.get('tlt_term_type')?.value);
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
    // this.applySaleRateDistribution(); // TLS12080 暫不啟用業績分攤
    this.dataChange.emit({
      formValue: this.form.getRawValue(),
      locationData: this.locationData
    });
  }
}
