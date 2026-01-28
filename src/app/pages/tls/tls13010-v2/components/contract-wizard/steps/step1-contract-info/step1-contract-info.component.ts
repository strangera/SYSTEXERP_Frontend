/**
 * Step 1: 合約基本資料子組件
 *
 * 接收父組件的 form 和資料，不管理自己的路由
 */
import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, distinctUntilChanged, firstValueFrom, of, switchMap } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

// 共用組件
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ColumnDef, ExpandableEditTableComponent, SelectorTableColumn } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

// V2 類型
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { DropdownOption, TLS13010DropdownService, TLS13010_DROPDOWN_OPTIONS } from '../../../../../tls13010/tls13010.dropdown';
import { LocationItem } from '../../../../core/models/contract';

// 服務
import { BankOptionsService } from '@service/api/dropdownservice/bank-option.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';

import { NotificationService } from '@shared/component/notification-message/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-step1-contract-info',
  templateUrl: './step1-contract-info.component.html',
  styleUrls: ['./step1-contract-info.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    CheckboxModule,
    InputTextComponent,
    InputTextareaComponent,
    DropdownComponent,
    CalendarComponent,
    MultiSelectComponent,
    InputNumberComponent,
    RadiobuttonComponent,
    ExpandableEditTableComponent
  ]
})
export class Step1ContractInfoComponent implements OnInit, OnChanges, OnDestroy {
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
        displayFieldsConfig: [{ fieldName: 'value', displayLabel: '', isPrimaryField: true }],
        panelTableColumns: [
          { field: 'value', header: '位置編號', sortable: true },
          { field: 'building_desc', header: '館別', sortable: true },
          { field: 'floor_desc', header: '樓層' },
          { field: 'area_desc', header: '區域' },
          { field: 'tlt_space', header: '營業坪數' },
        ] as SelectorTableColumn[],
        searchFormFields: [
          { name: 'building_code', label: '館別', type: 'dropdown', colClass: 'col-4', options: [], placeholder: '選擇館別' },
          { name: 'floor_code', label: '樓層', type: 'dropdown', colClass: 'col-4', options: [], placeholder: '選擇樓層' },
          { name: 'area_code', label: '區域代號', type: 'dropdown', options: [], colClass: 'col-4', placeholder: '輸入區域代號' },
        ],
        searchMethod: this.searchLocationOptions.bind(this),
        panelDataSource: [],
        totalDataCount: 0,
      }
    },
    { field: 'building_desc', header: '館別', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'floor_desc', header: '樓層', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'area_desc', header: '區域', type: 'text', editable: false, style: 'min-width: 100px' },
    { field: 'tlt_space', header: '營業坪數', type: 'number', editable: false, style: 'min-width: 120px' }
  ];

  private subscriptions: Subscription[] = [];
  submitted = false;
  loading = false;

  constructor(
    private locationOptionsService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private bankService: BankOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private tls12010Service: Tls12010Service,
    private tlsBaseService: TlsContractBaseService,
    private messageService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadDropdowns();
    this.setupBusTypeListener();
    this.setupBusClassListener();
    this.setupDateAutoFillListeners();
    this.updateDisplayLocationData();

    // 確保 dropdownService 選項已載入後才更新 selector panel
    // 等待一小段時間讓 parent component 的 dropdownService.initialize() 完成
    setTimeout(() => {
      this.updateSelectorPanelOptions();
    }, 100);

    // 注意：中小分類選項的載入由父組件 (contract-wizard) 在 loadContractData 後處理
    // 因為子組件的 ngOnInit 可能在父組件載入資料之前執行
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 當 locationData 變更時，更新顯示資料
    if (changes['locationData'] && !changes['locationData'].firstChange) {
      this.updateDisplayLocationData();
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
      this.pos2013Options = await firstValueFrom(this.vendorCategoryService.getVendorCategoryNoNameOptions());
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
    // 監聽契約起始日變更，自動更新營運起始日
    const contractStartSub = this.form.get('tlt_bdate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractStart => {
        if (contractStart && this.crudstatus !== CRUDStatus.Read) {
          this.form.patchValue({ tlt_contract_bdate: contractStart }, { emitEvent: false });
        }
      });

    // 監聽契約截止日變更，自動更新營運截止日
    const contractEndSub = this.form.get('tlt_edate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractEnd => {
        if (contractEnd && this.crudstatus !== CRUDStatus.Read) {
          this.form.patchValue({ tlt_contract_edate: contractEnd }, { emitEvent: false });
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

  private updateSelectorPanelOptions(): void {
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    if (locationColumn?.selectorConfig?.searchFormFields) {
      const buildingField = locationColumn.selectorConfig.searchFormFields.find(field => field.name === 'building_code');
      if (buildingField) buildingField.options = this.dropdownService.buildingOptions || [];

      const floorField = locationColumn.selectorConfig.searchFormFields.find(field => field.name === 'floor_code');
      if (floorField) floorField.options = this.dropdownService.floorOptions || [];

      const areaField = locationColumn.selectorConfig.searchFormFields.find(field => field.name === 'area_code');
      if (areaField) areaField.options = this.dropdownService.regionOptions || [];
    }
  }

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

    // 載入潛在客戶資料
    const vendorNo = selectedOption.No || '';
    if (vendorNo) {
      this.loadPotentialCustomerData(vendorNo);
    }
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
          this.form.patchValue({
            tlt_name: data.tlt_name || '',
            bus_type: data.bus_type || '',
            contact_tel: data.VEN_BossTel || '',
            contact_fax: data.VEN_BossFax || '',
            contact_addr: data.VEN_Addr || ''
          }, { emitEvent: true });
          this.messageService.successBubble('已自動帶入潛在客戶資料');
        } else {
          this.form.patchValue({
            tlt_name: '', bus_type: '', contact_tel: '', contact_fax: '', contact_addr: ''
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

  searchLocationOptions(searchParams: Record<string, unknown>): Observable<DropdownOption[]> {
    if (searchParams['SortBy'] && Array.isArray(searchParams['SortBy'])) {
      searchParams['SortBy'] = (searchParams['SortBy'] as { field: string; order: number }[]).map((sort) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,
        order: sort.order
      }));
    }
    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }

  addLocation(): void {
    const newLocation: LocationItem = {
      id: Date.now(),
      location_no: '', tlt_building: '', building_desc: '',
      tlt_floor: '', floor_desc: '', area_no: '', area_desc: '',
      tlt_space: 0, _status: 'new'
    };
    this.locationData = [...this.locationData, newLocation];
    this.updateDisplayLocationData();
    this.locationDataChange.emit(this.locationData);
  }

  onBatchDeleteLocation(items: LocationItem[]): void {
    items.forEach(item => {
      const index = this.locationData.findIndex(loc => loc.id === item.id);
      if (index !== -1) {
        if (this.locationData[index]._status === 'new') {
          this.locationData.splice(index, 1);
        } else {
          this.locationData[index]._status = 'deleted';
        }
      }
    });
    this.locationData = [...this.locationData];
    this.updateDisplayLocationData();
    this.locationDataChange.emit(this.locationData);
  }

  onLocationSave(event: { oldData: LocationItem, newData: LocationItem }): void {
    const index = this.locationData.findIndex(loc => loc.id === event.oldData.id);
    if (index !== -1) {
      this.locationData[index] = { ...event.newData, _status: event.oldData._status === 'new' ? 'new' : 'modified' };
      this.updateDisplayLocationData();
      this.locationDataChange.emit(this.locationData);
    }
  }

  onLocationDropdownChange(event: { rowData: LocationItem; field: string; newValue: string; selectedOption?: any }): void {
    const { rowData, field, newValue, selectedOption } = event;

    if (field === 'location_no' && newValue && selectedOption) {
      const isDuplicate = this.locationData.some(item =>
        item.location_no === newValue && String(item.id) !== String(rowData.id) && item._status !== 'deleted'
      );

      if (isDuplicate) {
        rowData.location_no = '';
        this.messageService.errorBubble(`位置編號 ${newValue} 已存在!`);
        return;
      }

      // 設定位置編號
      rowData.location_no = selectedOption.value || newValue;

      // 設定代碼欄位 (用於後端儲存)
      rowData.tlt_building = selectedOption.tlt_building || '';
      rowData.tlt_floor = selectedOption.tlt_floor || '';
      rowData.area_no = selectedOption.area_no || '';

      // 設定描述欄位 (用於前端顯示)
      rowData.building_desc = selectedOption.building_desc || '';
      rowData.floor_desc = selectedOption.floor_desc || '';
      rowData.area_desc = selectedOption.area_desc || '';

      // 設定營業坪數
      rowData.tlt_space = selectedOption.tlt_space || 0;

      const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);
      if (targetIndex !== -1) {
        const currentStatus = this.locationData[targetIndex]._status;
        this.locationData[targetIndex] = {
          ...this.locationData[targetIndex],
          ...rowData,
          _status: currentStatus === 'new' ? 'new' : 'modified'
        };
        this.locationData = [...this.locationData];
        this.updateDisplayLocationData();
        this.locationDataChange.emit(this.locationData);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocationTableEdit(_event: LocationItem): void { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocationTableCancel(_event: LocationItem): void { }

  // ========== 輔助方法 ==========
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
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
