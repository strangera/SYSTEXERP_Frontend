/**
 * Step 1: 合約基本資料子組件
 *
 * 接收父組件的 form 和資料，不管理自己的路由
 */
import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, distinctUntilChanged, firstValueFrom, of, switchMap } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';

// 共用組件
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

// V2 類型
import { DropdownOption, TLS13010DropdownService, TLS13010_DROPDOWN_OPTIONS } from '@pages/tls/shared/constants/tls13010.dropdown';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { LocationItem } from '../../../../core/models/contract';

// 服務
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { TlsContractBaseService } from '@others/services/tls/tls-contract-base.service';
import { BankOptionsService } from '@others/services/dropdownservice/bank-option.service';
import { LocationOptionsService } from '@others/services/dropdownservice/location-options.service';
import { NegotiatorOptionsService } from '@others/services/dropdownservice/negotiator-options.service';
import { VendorCategoryOptionsService } from '@others/services/dropdownservice/vendor-category-options.service';

import { NotificationService } from '@shared/components/notification-message/notification.service';

@Component({
  selector: 'app-step1-contract-info',
  templateUrl: './step1-contract-info.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    SelectButtonModule,
    InputTextComponent,
    InputTextareaComponent,
    DropdownComponent,
    CalendarComponent,
    MultiSelectComponent,
    InputNumberComponent,
    RadiobuttonComponent,
    TableEditComponent,
    TableComponent
  ]
})
export class Step1ContractInfoComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('locationTableRef') private locationTableRef?: TableEditComponent;

  // ========== 輸入屬性 ==========
  @Input() form!: FormGroup;
  @Input() locationData: LocationItem[] = [];
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create;
  @Input() dropdownService!: TLS13010DropdownService;
  @Input() originalCommissionType = '';  // 用於偵測抽成別是否變更

  // ========== 輸出事件 ==========
  @Output() locationDataChange = new EventEmitter<LocationItem[]>();

  readonly CRUDStatus = CRUDStatus;

  // ========== 下拉選單選項 ==========
  decorationOptions = [...TLS13010_DROPDOWN_OPTIONS.decorationType];
  moneyTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  checkTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.checkType];
  yesNoOptions = [...TLS13010_DROPDOWN_OPTIONS.yesNo];
  meterTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.meterType];
  paytypeOptions = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  storeWayOptions = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  invoiceTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.invoiceType];
  tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind];
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  tltTermTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  depositPaymentOptions = [...TLS13010_DROPDOWN_OPTIONS.depositPayment];
  total_amt_unitOptions = [...TLS13010_DROPDOWN_OPTIONS.total_amt_unit];
  total_amt_vendor_unit_options = [...TLS13010_DROPDOWN_OPTIONS.total_amt_vendor_unit];
  approveStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  meterReadingOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  // 動態載入的選項
  pos2013Options: any[] = [];
  negotiatorOptions: any[] = [];
  bankDropdownOptions: any[] = [];

  // 位置表格
  displayLocationData: LocationItem[] = [];
  selectedLocationRows: LocationItem[] = [];
  private isOwnEmit = false;
  private lastSaleRateCount = -1;

  locationEditColumns: EditColumn[] = [
    { field: 'location_no', header: '位置編號', type: 'custom', minWidth: '160px' },
    { field: 'building_desc', header: '館別', minWidth: '100px' },
    { field: 'floor_desc', header: '樓層', minWidth: '100px' },
    { field: 'area_desc', header: '區域', minWidth: '100px' },
    { field: 'tlt_space', header: '營業坪數', minWidth: '120px' },
    { field: 'tlt_bdate', header: '起始日', type: 'date', dateFormat: 'yy/mm/dd', minWidth: '130px' },
    { field: 'tlt_edate', header: '截止日', type: 'date', dateFormat: 'yy/mm/dd', minWidth: '130px' },
    {
      field: 'sale_rate', header: '業績分攤(%)', type: 'inputNumber',
      min: 0, max: 100, maxFractionDigits: 2, suffix: '%', minWidth: '130px',
      validate: [
        (value: unknown) => {
          const num = Number(value);
          const ok = value !== null && value !== undefined && value !== '' && !isNaN(num) && num > 0;
          return { isValid: ok, errorMessage: ok ? [] : ['業績分攤(%) 必填且需大於 0'] };
        },
        (_value: unknown, _rowData: unknown, data: unknown[]) => {
          const active = (data as LocationItem[]).filter(
            r => !(r as LocationItem & { _isAutoInsertCandidate?: boolean })._isAutoInsertCandidate &&
                 r._status !== 'deleted' && String(r.location_no || '').trim()
          );
          const total = Math.round(active.reduce((s, r) => s + (Number(r.sale_rate) || 0), 0) * 100) / 100;
          const ok = total === 100;
          return { isValid: ok, errorMessage: ok ? [] : [`業績分攤(%) 合計須等於 100%（目前：${total}%）`] };
        }
      ],
      onBlur: () => setTimeout(() => this.locationTableRef?.revalidateField('sale_rate'), 0),
    },
  ];

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

  /** 判斷位置在當前選擇器的時間區間內是否有佔用衝突 */
  isOccupiedInPickerRange(rowData: unknown): boolean {
    const row = rowData as { occ_tlt_no?: string; occ_bdate?: string; occ_edate?: string };
    if (!row?.occ_tlt_no) return false;
    const reqStart = this.currentPickerRow?.tlt_bdate ? new Date(this.currentPickerRow.tlt_bdate as string) : null;
    const reqEnd = this.currentPickerRow?.tlt_edate ? new Date(this.currentPickerRow.tlt_edate as string) : null;
    const occStart = row.occ_bdate ? new Date(row.occ_bdate) : null;
    const occEnd = row.occ_edate ? new Date(row.occ_edate) : null;
    if (!reqStart || !reqEnd || !occStart || !occEnd) return true; // 無法判斷時保守視為佔用
    // 有重疊：reqStart <= occEnd && reqEnd >= occStart
    return reqStart <= occEnd && reqEnd >= occStart;
  }

  isLocationSelectable = (rowData: unknown): boolean => !this.isOccupiedInPickerRange(rowData);

  // 位置選擇 Dialog 狀態
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

  // 位置選擇器篩選條件
  pickerBuildingFilter = new FormControl(null);
  pickerFloorFilter = new FormControl(null);
  pickerAreaFilter = new FormControl(null);
  pickerLocationNoFilter = new FormControl(null);

  get filteredPickerData(): any[] {
    switch (this.locationStatusFilter.value) {
      case 'available': return this.locationPickerData.filter(x => !x.occ_tlt_no);
      case 'occupied': return this.locationPickerData.filter(x => !!x.occ_tlt_no);
      default: return this.locationPickerData;
    }
  }

  private subscriptions: Subscription[] = [];
  submitted = false;
  loading = false;

  constructor(
    private locationOptionsService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private bankService: BankOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private tls12010Service: Tls12010Service,
    private tls13010Service: TLS13010Service,
    private tlsBaseService: TlsContractBaseService,
    private messageService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadDropdowns();
    this.setupBusTypeListener();
    this.setupBusClassListener();
    this.setupDateAutoFillListeners();
    this.setupTermTypeListener();
    this.updateDisplayLocationData();

    // 父組件透過 isInitialized 控制渲染時機，確保 dropdownService 已完成初始化
    this.updateSelectorPanelOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 當 locationData 變更時，更新顯示資料（跳過自己 emit 觸發的回流）
    if (changes['locationData']) {
      if (this.isOwnEmit) {
        this.isOwnEmit = false;
        return;
      }
      // 載入既有資料時，若尚無業績分攤值則平均帶入（已有值則保留）
      this.applySaleRateDistribution();
      if (!changes['locationData'].firstChange) {
        this.updateDisplayLocationData();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 初始化 ==========
  private async loadDropdowns(): Promise<void> {
    try {
      await Promise.all([
        this.loadVendorOptions(),
        this.loadBankOptions(),
        this.loadNegotiatorOptions(),
      ]);
    } catch (error) {
      console.error('下拉選單載入失敗:', error);
    }
  }

  private async loadVendorOptions(): Promise<void> {
    try {
      this.pos2013Options = await firstValueFrom(this.vendorCategoryService.getVendorCategoryNoNameOptionsForCru());
    } catch (error) {
      this.pos2013Options = [];
    }
  }

  private async loadBankOptions(): Promise<void> {
    try {
      this.bankDropdownOptions = await firstValueFrom(this.bankService.getBankOptions());
    } catch (error) {
      this.bankDropdownOptions = [];
    }
  }

  private async loadNegotiatorOptions(): Promise<void> {
    try {
      this.negotiatorOptions = await firstValueFrom(this.negotiatorService.getNegotiatorOptions());
    } catch (error) {
      this.negotiatorOptions = [];
    }
  }

  // ========== 表單監聽 ==========
  private setupBusTypeListener(): void {
    const subscription = this.form.get('bus_type')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(busType => {
          if (!busType) return of([]);
          return this.dropdownService.loadBusClassOptions(busType);
        })
      )
      .subscribe({
        next: (options) => {
          const currentBusClass = this.form.get('bus_class')?.value;
          const validBusClass = options.find((opt: DropdownOption) => opt.value === currentBusClass);
          if (currentBusClass && !validBusClass) {
            this.form.patchValue({ bus_class: '', bus_sclass: '' }, { emitEvent: false });
          }
        }
      });

    if (subscription) this.subscriptions.push(subscription);
  }

  private setupBusClassListener(): void {
    const subscription = this.form.get('bus_class')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(busClass => {
          const busType = this.form.get('bus_type')?.value;
          this.dropdownService.clearBusSClassOptions();
          if (!busClass || !busType) return of([]);
          return this.dropdownService.loadBusSClassOptions(busType, busClass);
        })
      )
      .subscribe({
        next: (options: DropdownOption[]) => {
          const currentBusSClass = this.form.get('bus_sclass')?.value;
          const validBusSClass = options.find((opt: DropdownOption) => opt.value === currentBusSClass);
          if (currentBusSClass && !validBusSClass) {
            this.form.patchValue({ bus_sclass: '' }, { emitEvent: false });
          }
        }
      });

    if (subscription) this.subscriptions.push(subscription);
  }

  private setupDateAutoFillListeners(): void {
    // 監聽契約起始日變更，自動更新營運起始日 & 自動帶入空白的地點起始日
    const contractStartSub = this.form.get('tlt_bdate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractStart => {
        if (contractStart && this.crudstatus !== CRUDStatus.Read) {
          this.form.patchValue({ tlt_contract_bdate: contractStart }, { emitEvent: false });
          // 更新候選列預設值
          this.locationDefaultInsertData = { ...this.locationDefaultInsertData, tlt_bdate: contractStart };
          // 自動帶入：所有非刪除地點的起始日一律同步契約起始日
          let changed = false;
          this.locationData.forEach(loc => {
            if (loc._status !== 'deleted') {
              loc.tlt_bdate = contractStart;
              if (loc._status === 'original') loc._status = 'modified';
              changed = true;
            }
          });
          if (changed) {
            this.updateDisplayLocationData();
            this.locationDataChange.emit(this.locationData);
          }
        }
      });

    // 監聽契約截止日變更，自動更新營運截止日 & 自動帶入空白的地點截止日
    const contractEndSub = this.form.get('tlt_edate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractEnd => {
        if (contractEnd && this.crudstatus !== CRUDStatus.Read) {
          this.form.patchValue({ tlt_contract_edate: contractEnd }, { emitEvent: false });
          // 更新候選列預設值
          this.locationDefaultInsertData = { ...this.locationDefaultInsertData, tlt_edate: contractEnd };
          // 自動帶入：所有非刪除地點的截止日一律同步契約截止日
          let changed = false;
          this.locationData.forEach(loc => {
            if (loc._status !== 'deleted') {
              loc.tlt_edate = contractEnd;
              if (loc._status === 'original') loc._status = 'modified';
              changed = true;
            }
          });
          if (changed) {
            this.updateDisplayLocationData();
            this.locationDataChange.emit(this.locationData);
          }
        }
      });

    // 監聽回函日期變更，自動更新回函截止日（+15天）
    const feedbackDateSub = this.form.get('feedback_date')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(feedbackDate => {
        if (feedbackDate && this.crudstatus !== CRUDStatus.Read) {
          const date = new Date(feedbackDate);
          if (!isNaN(date.getTime())) {
            // 使用 Date 物件而非字串，避免顯示時間
            const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15);
            this.form.patchValue({ due_date: dueDate }, { emitEvent: false });
          }
        }
      });

    if (contractStartSub) this.subscriptions.push(contractStartSub);
    if (contractEndSub) this.subscriptions.push(contractEndSub);
    if (feedbackDateSub) this.subscriptions.push(feedbackDateSub);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private updateSelectorPanelOptions(): void { }

  // ========== 廠商變更 ==========
  onVendorChange(vendorVenNo: string): void {
    if (!vendorVenNo || !vendorVenNo.trim()) {
      this.form.patchValue({
        vendor_ven_no: '', vendor_no: '', ven_no: '', ven_uniform: '',
        VEN_Name: '', VEN_Address: '', vendor_acct_name: '',
        tlt_name: '', bus_type: '', contact_tel: '', contact_fax: '', contact_addr: ''
      }, { emitEvent: false });
      return;
    }

    const selectedOption = this.pos2013Options.find((opt: any) => opt.value === vendorVenNo);
    if (!selectedOption) return;

    this.form.patchValue({
      vendor_ven_no: selectedOption.VEN_No || selectedOption.value,
      vendor_no: selectedOption.No || '',
      ven_no: selectedOption.VEN_No || selectedOption.value,
      ven_uniform: selectedOption.No || '',
      VEN_Name: selectedOption.Name || selectedOption.label || '',
      VEN_Address: selectedOption.VEN_Address || '',
      vendor_acct_name: selectedOption.Name || selectedOption.label || ''
    }, { emitEvent: false });

    const venNo = selectedOption.VEN_No || selectedOption.value;
    const vendorNo = selectedOption.No || '';

    // 唯讀模式不需檢查佔用，直接帶入潛在客戶資料
    if (this.crudstatus === CRUDStatus.Read) {
      if (vendorNo) this.loadPotentialCustomerData(vendorNo);
      return;
    }

    // 先檢查廠編是否已被其他櫃號使用；已被使用就不帶任何資料，
    // 避免多打廠商聯絡/潛在客戶兩隻 API，也不會跳出與失敗訊息矛盾的成功提示
    this.checkVendorOccupied(venNo, () => {
      this.loadVendorContactInfo(vendorVenNo);
      if (vendorNo) this.loadPotentialCustomerData(vendorNo);
    });
  }

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

  /**
   * 選定廠商後即時檢查該廠編是否已被其他櫃號的未作廢合約使用。
   * 未被使用時才呼叫 onAvailable（帶入聯絡/潛在客戶資料）；已被使用則清空選取。
   */
  private checkVendorOccupied(venNo: string, onAvailable: () => void): void {
    if (!venNo) return;
    const tltNo = this.form.get('tlt_no')?.value ?? '';
    this.tls13010Service.checkVendorOccupied(venNo, tltNo).subscribe({
      next: (occupiedTltNo) => {
        if (occupiedTltNo) {
          this.messageService.errorBubble(`此廠編已被櫃號${occupiedTltNo}使用！不可選取！`);
          this.onVendorChange('');
        } else {
          onAvailable();
        }
      }
    });
  }

  private loadPotentialCustomerData(vendorNo: string): void {
    const request = {
      PageSize: 1, PageIndex: 1, OrderBy: '', Offset: 0, SortBy: [],
      CreatedDateStart: null, CreatedDateEnd: null, contact_USR_Name: '',
      cus_uniform_id: [vendorNo], VEN_Name: '', VEN_EngName: '', tlt_name: '', tlt_EngName: '', bus_type: []
    };

    this.tls12010Service.queryTLS12010(request).subscribe({
      next: (result: any) => {
        if (result.Data && result.Data.length > 0) {
          const data = result.Data[0];
          // 只帶入 tlt_name、bus_type，聯絡資訊由 POS2013 queryVendorInfo 帶入
          this.form.patchValue({
            tlt_name: data.tlt_name || '',
            bus_type: data.bus_type || ''
          }, { emitEvent: true });
          this.messageService.successBubble('已自動帶入潛在客戶資料');
        } else {
          this.form.patchValue({
            tlt_name: '', bus_type: ''
          }, { emitEvent: true });
          this.messageService.infoBubble('查無潛在客戶資料');
        }
      }
    });
  }

  // ========== 位置表格 ==========
  private updateDisplayLocationData(): void {
    this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
  }

  /**
   * 依櫃位地點數量平均分配業績分攤(%)：1 個 = 100、2 個各 50，以此類推。
   * 只在「地點數量變動」或「有列尚未有分攤值」時重算，保留既有資料/使用者手動微調。
   */
  private applySaleRateDistribution(): void {
    const active = this.locationData.filter(
      loc => loc._status !== 'deleted' && String(loc.location_no || '').trim()
    );
    const n = active.length;
    const anyMissing = active.some(loc => loc.sale_rate == null || Number(loc.sale_rate) <= 0);
    const countChanged = this.lastSaleRateCount >= 0 && n !== this.lastSaleRateCount;
    this.lastSaleRateCount = n;
    if (n === 0) return;
    if (!countChanged && !anyMissing) return;

    const base = Math.floor((100 / n) * 100) / 100; // 取到小數 2 位
    active.forEach((loc, i) => {
      const newRate = i === n - 1
        ? Math.round((100 - base * (n - 1)) * 100) / 100 // 最後一筆補足使總和 = 100
        : base;
      if (loc.sale_rate !== newRate) {
        loc.sale_rate = newRate;
        // 既有資料被自動分攤改動 → 標記為 modified，後端才會更新（original 會被略過不存）
        if (loc._status === 'original') {
          loc._status = 'modified';
        }
      }
    });
  }

  /** 移除未填入位置編號的新增空列，離開步驟前呼叫 */
  removeEmptyNewRows(): void {
    const cleaned = this.locationData.filter(
      loc => loc._status !== 'new' || loc.location_no?.trim()
    );
    if (cleaned.length !== this.locationData.length) {
      this.locationData = cleaned;
      this.updateDisplayLocationData();
      this.locationDataChange.emit(this.locationData);
    }
  }

  // ========== 位置表格 dataChange ==========

  onLocationDataChange(data: any[]): void {
    // 保留本次 table-edit 不知道的舊刪除紀錄（例如：前次編輯工作階段已標記 deleted 的行）
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
    this.applySaleRateDistribution();
    this.displayLocationData = data as LocationItem[];
    this.isOwnEmit = true;
    this.locationDataChange.emit(this.locationData);
  }


  // ========== 位置選擇 Dialog ==========

  openLocationPicker(rowData: any): void {
    const row = rowData as LocationItem;
    // 自動帶入合約起訖日（若尚未設定）
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

  private formatDateParam(d: string | Date | undefined | null): string | null {
    if (!d) return null;
    if (d instanceof Date) return d.toLocaleDateString('sv-SE');
    return d;
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
      this.applySaleRateDistribution();
      this.displayLocationData = this.locationData.filter(l => l._status !== 'deleted');
      this.isOwnEmit = true;
      this.locationDataChange.emit(this.locationData);
      this.locationPickerVisible = false;
      this.currentPickerRow = null;
      return;
    }

    const rowKey = (row as any)._TABLE_KEY;

    const isDuplicate = this.locationData.some(item =>
      item.location_no === location.value &&
      item._status !== 'deleted' &&
      (rowKey ? (item as any)._TABLE_KEY !== rowKey : String(item.id) !== String(row.id))
    );
    if (isDuplicate) {
      this.messageService.errorBubble(`位置編號 ${location.value} 已存在!`);
      return;
    }

    const targetIndex = this.locationData.findIndex(item => {
      const itemKey = (item as any)._TABLE_KEY;
      if (rowKey && itemKey) return rowKey === itemKey;
      return item.id != null && item.id === row.id;
    });

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
      this.applySaleRateDistribution();
      this.updateDisplayLocationData();
      this.locationDataChange.emit(this.locationData);
    }

    this.locationPickerVisible = false;
    this.currentPickerRow = null;
  }



  private setupTermTypeListener(): void {
    const sub = this.form.get('tlt_term_type')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(val => {
        if (!['4', '6'].includes(val)) {
          this.form.get('tlt_ctype_mtotal')?.setValue(null);
        }
      });
    if (sub) this.subscriptions.push(sub);
  }

  // ========== 輔助方法 ==========
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isMtotalReadonly(): boolean {
    return !['4', '6'].includes(this.form.get('tlt_term_type')?.value);
  }

  /**
   * 取得表單控制項 (用於模板綁定)
   */
  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  hasCommissionTypeChanged(): boolean {
    const currentType = this.form.get('tlt_term_type')?.value;
    return this.originalCommissionType !== '' && currentType !== this.originalCommissionType;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatEmailField(fieldName: string, _event?: string): void {
    const control = this.form.get(fieldName);
    if (control && control.value) {
      const formatted = (control.value as string).replace(/；/g, ';').replace(/\s*;\s*/g, ';').trim();
      control.setValue(formatted);
    }
  }
}
