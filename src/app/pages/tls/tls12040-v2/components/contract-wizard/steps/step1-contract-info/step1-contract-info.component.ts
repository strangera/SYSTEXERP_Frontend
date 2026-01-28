import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';

import { forkJoin, Observable, Subscription } from 'rxjs';
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

  @Output() dataChange = new EventEmitter<{
    formValue: any;
    locationData: LocationItem[];
  }>();

  private subscriptions: Subscription[] = [];

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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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

  /**
   * 設定表單監聽器
   */
  private setupFormListeners(): void {
    // 監聽大分類變更
    const busTypeSub = this.form.get('bus_type')?.valueChanges.subscribe(value => {
      if (value) {
        this.loadBusClassOptions(value);
        this.form.patchValue({ bus_class: '', bus_sclass: '' }, { emitEvent: false });
        this.busClassOptions = [];
        this.busSClassOptions = [];
      }
    });
    if (busTypeSub) this.subscriptions.push(busTypeSub);

    // 監聯中分類變更
    const busClassSub = this.form.get('bus_class')?.valueChanges.subscribe(value => {
      const busType = this.form.get('bus_type')?.value;
      if (value && busType) {
        this.loadBusSClassOptions(busType, value);
        this.form.patchValue({ bus_sclass: '' }, { emitEvent: false });
        this.busSClassOptions = [];
      }
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
   * 廠商變更處理
   */
  onVendorChange(event: any): void {
    if (!event) return;

    const selectedVendor = this.vendorOptions.find((v: any) => v.value === event);
    if (selectedVendor) {
      this.form.patchValue({
        ven_no: (selectedVendor as any).ven_no || '',
        ven_uniform: (selectedVendor as any).ven_uniform || '',
        VEN_Name: (selectedVendor as any).ven_name || '',
        VEN_Address: (selectedVendor as any).ven_address || ''
      });
    }
    this.emitDataChange();
  }

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

  /**
   * 申請類型變更處理
   */
  onApplyTypeChange(event: any): void {
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
   * 新增位置項目
   */
  onAddLocationItem(): void {
    const newItem: LocationItem = {
      id: `temp_${Date.now()}`,
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
   * 儲存位置項目
   */
  onLocationTableSave(event: any): void {
    const { row } = event;
    const index = this.locationData.findIndex(item => item.id === row.id);
    if (index !== -1) {
      if (this.locationData[index]._status !== 'new') {
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
   * 取消編輯位置項目
   */
  onLocationTableCancel(event: any): void {
    this.updateDisplayLocationData();
  }

  /**
   * 位置下拉選單變更
   */
  onLocationDropdownChange(event: any): void {
    const { row, column, value } = event;
    if (column.field === 'location_no' && value) {
      // 根據選擇的位置編號更新相關欄位
      const selectedLocation = this.findLocationByNo(value);
      if (selectedLocation) {
        row.tlt_building = selectedLocation.building_code || '';
        row.tlt_floor = selectedLocation.floor_code || '';
        row.area_no = selectedLocation.area_code || '';
        row.building_desc = selectedLocation.building_desc || '';
        row.floor_desc = selectedLocation.floor_desc || '';
        row.area_desc = selectedLocation.area_desc || '';
        row.tlt_space = selectedLocation.tlt_space || 0;
      }
    }
    this.emitDataChange();
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

  /**
   * 格式化 Email 欄位
   */
  formatEmailField(fieldName: string, event: any): void {
    const control = this.form.get(fieldName);
    if (control && control.value) {
      // 將全形分號轉換為半形
      const formatted = control.value.replace(/；/g, ';');
      control.setValue(formatted);
    }
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
