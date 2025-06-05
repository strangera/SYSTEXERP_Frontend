// tls13010-cru.component.ts (整理後版本 - 移除無用程式碼)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 工作流程服務
import { ContractFlowService } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';

// 下拉選單服務和選項
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';

// API 服務
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BankOptionsService } from '../../../service/API/dropdownservice/bank-option.service';
import { AutoCompleteOption } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';

interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_class: string;
  bus_class_name: string;
  bus_sclass: string;
  bus_sclass_name: string;
  bus_sclass_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// 地點資訊相關介面
interface LocationItem {
  id?: number | string;        // 資料庫ID
  location_no: string;        // 位置編號
  tlt_building: string;        // 館別
  tlt_floor: string;          // 樓層
  area_no: string;            // 區域
  businessArea: number;       // 營業坪數
  _status?: 'new' | 'modified' | 'deleted' | 'original'; // 前端狀態管理
}

interface LocationDetailItem {
  id: number;
  location_no: string;       // 位置編號
  tlt_building: string;       // 館別
  tlt_floor: string;          // 樓層
  area_no: string;            // 區域
  tlt_space: number;       // 營業坪數
  _status?: 'new' | 'modified' | 'deleted' | 'original';
}

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  // 地點資訊資料
  locationItems: LocationItem[] = [];

  // 位置選項資料
  locationWithDetailsOptions: any[] = [];

  // 新的位置表格欄位定義
  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 150px',
      options: [] // 這裡會在 updateLocationColumnOptions 中更新
    },
    {
      field: 'tlt_building',
      header: '館別',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'tlt_floor',
      header: '樓層',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'area_no',
      header: '區域',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'tlt_space',
      header: '營業坪數',
      type: 'number',
      editable: false,
      style: 'min-width: 120px'
    }
  ];

  // 新的位置資料陣列
  locationData: any[] = [];

  // ==========  地點資訊表格 ==========
  data: any[] = [
    {
      isNew: false,
      location_no: 'B123',
      floor: '2樓',
      area: 'B區',
      tlt_space: '100坪',
      startDate: '2023/12/01',
      endDate: '2024/11/30',
      performanceShare: 100,
    },
  ];

  filteredData: any[] = [...this.data];
  // ==========  主要表單定義 ==========
  dataForm = this.formBuilder.group({
    // 基本資訊
    talent_id: [''],
    apply_no: ['', [Validators.required]],
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
    tlt_no: [{ value: '契約書審核後才給號', disabled: true }],
    ven_uniform: ['', [Validators.required]],
    VEN_Name: [''],
    paper_type: ['', [Validators.required]],
    bus_type: [''],
    bus_class: [''],
    bus_sclass: [''],
    contract_subno: [''],

    // 洽談階段資訊
    tlt_bdate: [''],
    tlt_edate: [''],
    contact_Date: [''],
    contact_USR_Name: [''],
    feedback_date: [''],
    due_date: [''],

    // 營運資訊
    org_id: [''],
    tlt_contract_bdate: [''],
    tlt_contract_edate: [''],

    // 商務條件
    tlt_kind: [''],
    deco_type: [''],
    tlt_term_type: [''],
    comm_comp_type: ['2', [Validators.required]], // 預設為除稅
    edc_yn: [''],
    tlt_ctype_mtotal: [''],
    overall_status: [''],
    rent_ahead: [''],
    rent_period: [''],
    base_rent: [''],
    deposit: [''],
    total_amt: [''],
    total_amt_vendor: [''],
    construct_fees: [''],
    check_day: [''],

    // 業務設定
    comm_yn: [''],
    rece_yn: [''],
    pos_yn: [''],
    cash_yn: [''],
    money_type: [''],
    store_way: [''],
    check_type: [''],
    paytype: [''],
    vip_yn: [''],
    credit_card: [''],
    invoice_type: [''],

    // 其他設定
    meter_typeList: [[]],
    paymentMethods: [[]],
    ticket_remarks: [''],

    // 聯絡資訊
    email: ['', [Validators.email]],
    invoice_email: ['', [Validators.email]],
    CHECK_TITLE: [''],
    store_tel: [''],
    bank_id: [''],
    vendor_acct_name: [''],
    vendor_acct_no: [''],
    contact_tel: [''],
    contact_fax: [''],
    contact_addr: [''],
    tlt_remark: [''],

    // 狀態欄位
    tlt_openflag: [''],
    cap_saletype1: ['N'],
    cap_saletype2: ['N'],
    activity3: [false],
    activity4: [false],
    open_deposit: [''],

    // 銀行 AutoComplete
    selectedBankInfo: null
  });

  // ==========  固定下拉選單選項 ==========
  decorationOptions = [...TLS13010_DROPDOWN_OPTIONS.decorationType];
  moneyTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  checkTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.checkType];
  yesNoOptions = [...TLS13010_DROPDOWN_OPTIONS.yesNo];
  meterTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.meterType];
  paytypeOptions = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  storeWayOptions = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  invoiceTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.invoiceType];
  tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind];
  openflagStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  commissionCompTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.commissionCompType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  // ==========  API 載入的下拉選單選項 ==========
  vendorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  organizationOptions: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];
  selectedBankInfo: AutoCompleteOption | null = null;

  constructor(
    public override router: Router,
    private contractFlowService: ContractFlowService,
    public tls13010DropdownService: TLS13010DropdownService,
    private vendorService: VendorService,
    private contractStatusService: ContractStatusService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    private counterCategoryService: CounterCategoryService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private bankService: BankOptionsService,
    private locationOptionsService: LocationOptionsService,
    private tls13010Service: TLS13010Service,
  ) {
    super();
  }

  // ==========  生命週期方法 ==========
  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 先載入基本下拉選單
    this.loadDropdownOptions();

    // 然後載入位置選項
    this.loadLocationWithDetailsOptions();
    this.loadWorkflowData();
    this.setupAutoSave();
    this.setupBusTypeListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==========  資料載入方法 ==========
  private loadDropdownOptions(): void {
    // 廠商選項
    this.vendorService.getVendors().subscribe({
      next: (data) => this.vendorOptions = data,
      error: (err) => console.warn('載入廠商選項失敗:', err)
    });

    // 合約狀態選項
    this.contractStatusService.getContractStatuses().subscribe({
      next: (data) => this.contractStatusOptions = data,
      error: (err) => console.warn('載入合約狀態選項失敗:', err)
    });

    // 結帳方式選項
    this.settlementMethodService.getSettlementMethods().subscribe({
      next: (data) => this.settlementMethodOptions = data,
      error: (err) => console.warn('載入結帳方式選項失敗:', err)
    });

    // 付款方式選項
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (data) => this.paymentMethodOptions = data,
      error: (err) => console.warn('載入付款方式選項失敗:', err)
    });

    // 配合方式選項
    this.cooperationMethodService.getCooperationMethods().subscribe({
      next: (data) => this.cooperationMethodOptions = data,
      error: (err) => console.warn('載入配合方式選項失敗:', err)
    });

    // 櫃別選項
    this.counterCategoryService.getCounterCategories().subscribe({
      next: (data) => this.counterCategoryOptions = data,
      error: (err) => console.warn('載入櫃別選項失敗:', err)
    });

    // 大分類選項
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe({
      next: (data) => this.businessTypeCodeOptions = data,
      error: (err) => console.warn('載入大分類選項失敗:', err)
    });

    // 組織選項
    this.organizationNumberService.getOrganizationNumbers().subscribe({
      next: (data) => this.organizationOptions = data,
      error: (err) => console.warn('載入組織選項失敗:', err)
    });

  }

  private loadLocationWithDetailsOptions(): void {
    console.log('開始載入位置選項...');

    // 取得目前的 talentId（如果是編輯模式）
    const workflowData = this.contractFlowService.getCurrentData();
    const talentId = workflowData.queryRowData?.talent_id;

    this.locationOptionsService.getLocationWithDetailsOptions(talentId).subscribe({
      next: (data) => {
        console.log('API回傳的資料:', data);
        this.locationWithDetailsOptions = data;
        this.updateLocationColumnOptions();
        console.log('位置選項載入完成，共', this.locationWithDetailsOptions.length, '筆');
      },
      error: (err) => {
        console.warn('載入位置選項失敗:', err);
        this.messageService.warnBubble('載入位置選項失敗，請重新整理頁面');
      }
    });
  }

  // 更新位置欄位的下拉選單選項
  private updateLocationColumnOptions(): void {
    console.log('開始更新表格欄位選項...');

    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    if (locationColumn) {
      locationColumn.options = this.locationWithDetailsOptions.map(option => ({
        label: option.label,  // 用 service 轉換後的 label
        value: option.value   // 用 service 轉換後的 value
      }));

      console.log('已更新表格下拉選單選項:', locationColumn.options.length, '筆');
    } else {
      console.warn('找不到 location_no 欄位！'); // 改回原本的訊息
    }
  }


  private updateTableColumnOptions(): void {
    // 這個方法可能會覆蓋位置選項，先註解掉看看
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    if (locationColumn) {
      locationColumn.options = this.tls13010DropdownService.locationOptions;
    }

    const floorColumn = this.locationColumns.find(col => col.field === 'floor');
    if (floorColumn) {
      floorColumn.options = this.tls13010DropdownService.floorOptions;
    }
  }

  // 載入工作流程資料（修改，正確載入位置資料）
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();
    console.log('載入工作流程資料:', workflowData);

    if (workflowData.contractId) {
      const savedFormData = this.contractFlowService.getStep1Data();

      if (savedFormData && Object.keys(savedFormData).length > 0) {
        // 載入表單資料
        this.dataForm.patchValue(savedFormData);
        this.loadBusinessClassifications(savedFormData.bus_type, savedFormData.bus_class);

        // 載入暫存的位置資料
        if (savedFormData.locationInfo && savedFormData.locationInfo.length > 0) {
          this.locationData = savedFormData.locationInfo;
          console.log('從工作流程載入位置資料:', this.locationData);
        }
      } else if (workflowData.queryRowData) {
        this.loadDataFromQueryResult(workflowData.queryRowData);
      }

      // 載入既有的位置資料（如果有 talent_id）
      if (workflowData.queryRowData?.talent_id) {
        this.loadExistingLocationData(workflowData.queryRowData.talent_id);
      }
    } else {
      console.warn('沒有工作流程資料，重導向到查詢頁面');
      this.router.navigate(['/TLS/TLS13010']);
    }
  }


  private loadDataFromQueryResult(queryData: any): void {
    this.dataForm.patchValue({
      // 基本資訊
      talent_id: queryData.talent_id,
      apply_no: queryData.apply_no,
      tlt_name: queryData.tlt_name,
      tlt_no: queryData.tlt_no,
      VEN_Name: queryData.VEN_Name,
      ven_uniform: queryData.ven_uniform,
      paper_type: queryData.paper_type,
      bus_type: queryData.bus_type,
      bus_class: queryData.bus_class,
      bus_sclass: queryData.bus_sclass,
      contract_subno: queryData.contract_subno,

      // 合約資訊
      feedback_date: queryData.feedback_date,
      due_date: queryData.due_date,
      tlt_bdate: queryData.tlt_bdate,
      tlt_edate: queryData.tlt_edate,
      contact_Date: queryData.contact_Date,
      tlt_contract_bdate: queryData.tlt_contract_bdate,
      tlt_contract_edate: queryData.tlt_contract_edate,

      // 商務條件
      deco_type: queryData.deco_type,
      money_type: queryData.money_type,
      check_type: queryData.check_type,
      tlt_term_type: queryData.tlt_term_type,
      comm_comp_type: queryData.comm_comp_type || '2',
      store_way: queryData.store_way,
      rece_yn: queryData.rece_yn,
      pos_yn: queryData.pos_yn,
      cash_yn: queryData.cash_yn,
      org_id: queryData.org_id,
      overall_status: queryData.overall_status,
      paytype: queryData.paytype,
      invoice_type: queryData.invoice_type,

      // 聯絡資訊
      email: queryData.email,
      invoice_email: queryData.invoice_email,
      CHECK_TITLE: queryData.CHECK_TITLE,
      store_tel: queryData.store_tel,
      bank_id: queryData.bank_id,
      vendor_acct_name: queryData.vendor_acct_name,
      vendor_acct_no: queryData.vendor_acct_no,
      contact_tel: queryData.contact_tel,
      contact_fax: queryData.contact_fax,
      contact_addr: queryData.contact_addr,
      tlt_remark: queryData.tlt_remark,

      // 其他欄位
      comm_yn: queryData.comm_yn,
      base_rent: queryData.base_rent,
      tlt_kind: queryData.tlt_kind,
      edc_yn: queryData.edc_yn,
      tlt_ctype_mtotal: queryData.tlt_ctype_mtotal,
      rent_ahead: queryData.rent_ahead,
      rent_period: queryData.rent_period,
      deposit: queryData.deposit,
      vip_yn: queryData.vip_yn,
      credit_card: queryData.credit_card,
      total_amt: queryData.total_amt,
      total_amt_vendor: queryData.total_amt_vendor,
      construct_fees: queryData.construct_fees,
      ticket_remarks: queryData.ticket_remarks,
      cap_saletype1: queryData.cap_saletype1,
      cap_saletype2: queryData.cap_saletype2,
    });

    this.loadBusinessClassifications(queryData.bus_type, queryData.bus_class);
  }

  private loadBusinessClassifications(busType: string, busClass?: string): void {
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: (options) => {
          if (busClass) {
            this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
              next: (sClassOptions) => console.log('小分類載入完成:', sClassOptions.length),
              error: (error) => console.warn('載入小分類失敗:', error)
            });
          }
        },
        error: (error) => console.warn('載入中分類失敗:', error)
      });
    }
  }

  // ==========  表單監聽與自動儲存 ==========
  private setupAutoSave(): void {
    const formSubscription = this.dataForm.valueChanges.subscribe(() => {
      this.saveToWorkflow();
    });
    this.subscriptions.push(formSubscription);
  }

  private setupBusTypeListener(): void {
    // 監聽大分類變化
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges.subscribe(busType => {
      if (busType) {
        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: any[]) => {
            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find(option => option.value === currentBusClass);
            if (currentBusClass && !validBusClass) {
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類')
        });
      } else {
        this.tls13010DropdownService.clearBusClassOptions();
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_class')?.setValue('');
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    // 監聽中分類變化
    const busClassSubscription = this.dataForm.get('bus_class')?.valueChanges.subscribe(busClass => {
      const busType = this.dataForm.get('bus_type')?.value;
      if (busType && busClass) {
        this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
          next: (options: any[]) => {
            const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
            const validBusSClass = options.find(option => option.value === currentBusSClass);
            if (currentBusSClass && !validBusSClass) {
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => this.messageService.warnBubble('載入小分類選項失敗，請重新選擇中分類')
        });
      } else {
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    if (busTypeSubscription) this.subscriptions.push(busTypeSubscription);
    if (busClassSubscription) this.subscriptions.push(busClassSubscription);
  }

  // ==========  表單操作方法 ==========
  private saveToWorkflow(): void {
    if (this.dataForm.dirty) {
      const formData = this.dataForm.getRawValue();

      // 將位置資料一起暫存，但保持前端格式
      const workflowData = {
        ...formData,
        locationInfo: this.locationData // 保持前端格式暫存
      };

      this.contractFlowService.saveStep1Data(workflowData);
      console.log('已暫存到工作流程:', workflowData);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // 載入既有的地點資料 - 加入已使用位置到選項中
  private loadExistingLocationData(talentId: string): void {
    this.tls13010Service.queryTLS13010Location(talentId).subscribe({
      next: (response) => {
        if (response?.Data?.Locations && response.Data.Locations.length > 0) {
          // 直接使用，只需標記為原始資料
          this.locationData = response.Data.Locations.map((item: LocationItem) => ({
            ...item,
            _status: 'original' // 標記為原始資料
          }));

          // 將已使用的位置加入選項（如果選項中沒有的話）
          response.Data.Locations.forEach((item: LocationItem) => {
            const existsInOptions = this.locationWithDetailsOptions.find(
              opt => opt.location_no === item.location_no
            );

            if (!existsInOptions) {
              // 要轉換成跟 service 一樣的格式
              this.locationWithDetailsOptions.push({
                label: item.location_no,        // ✅ 加上 label
                value: item.location_no,        // ✅ 加上 value
                buildingNo: item.tlt_building,  // ✅ 轉換欄位名稱
                floorNo: item.tlt_floor,        // ✅ 轉換欄位名稱
                areaNo: item.area_no,          // ✅ 轉換欄位名稱
                tlt_space: item.businessArea || 0
              });
            }
          });

          this.updateLocationColumnOptions();
          console.log('位置資料載入完成:', this.locationData);
        }
      },
      error: (err) => {
        console.warn('載入位置資料失敗:', err);
        this.messageService.warnBubble('載入位置資料失敗');
      }
    });
  }
  // ==========  按鈕事件處理 ==========
  onSave(): void {
    this.saveToWorkflow();
    this.messageService.successBubble('資料已儲存');
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    if (!frm.valid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(frm);
      return;
    }
    this.saveToWorkflow();
    this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  onSubmitNext(): void {
    // if (this.dataForm.valid && this.validateLocationData()) {
    if (this.dataForm.valid) {
      this.saveToWorkflow(); // 確保最新資料已暫存
      this.router.navigate(['/TLS/TLS13010NEXT1']);
      this.messageService.infoBubble('進入下一步：代扣款設定');
    } else {
      this.submitted = true;
      this.markFormGroupTouched(this.dataForm);
      this.messageService.warnBubble('請完成必填欄位後再進入下一步');
    }
  }

  override onCancel(): void {
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
        this.messageService.infoBubble('已儲存草稿');
      }
    }
    this.router.navigate(['/TLS/TLS13010']);
  }

  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？此操作無法復原。')) {
      this.dataForm.reset();
      this.dataForm.patchValue({
        comm_comp_type: '2',
        invoice_type: '1'
      });
      this.data = [];
      this.filteredData = [];
      this.contractFlowService.clearTempData();
      this.messageService.infoBubble('表單已清除');
    }
  }

  calculatePerformanceShare(): void {
    const totalArea = this.data.reduce((sum, item) => {
      const area = parseFloat(item.businessArea) || 0;
      return sum + area;
    }, 0);

    if (totalArea > 0) {
      this.data.forEach(item => {
        const area = parseFloat(item.businessArea) || 0;
        item.performanceShare = Math.round((area / totalArea) * 100);
      });
      this.filteredData = [...this.data];
      this.saveToWorkflow();
      this.messageService.successBubble('業績分攤計算完成');
    } else {
      this.messageService.warnBubble('請先輸入營業坪數');
    }
  }

  // ==========  位置表格事件處理 ==========

  onAddLocationItem(): void {
    const newLocationItem: LocationItem = {
      id: this.generateTempId(), // 簡單的臨時ID生成
      location_no: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      businessArea: 0,
      _status: 'new'
    };

    this.locationData.push(newLocationItem);
    this.saveToWorkflow();
    this.messageService.infoBubble('已新增位置項目，請選擇位置編號');
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }


  // 批次刪除位置項目
  onBatchDeleteLocation(selectedItems: any[]): void {
    if (confirm(`確定要刪除 ${selectedItems.length} 個位置項目嗎？`)) {
      selectedItems.forEach(item => {
        const index = this.locationData.findIndex(d => d.id === item.id);
        if (index > -1) {
          // 如果是新增的資料，直接從陣列移除
          if (item._status === 'new') {
            this.locationData.splice(index, 1);
          } else {
            // 如果是既有資料，標記為刪除
            this.locationData[index]._status = 'deleted';
          }
        }
      });

      this.saveToWorkflow(); // 暫存
      this.messageService.successBubble(`已刪除 ${selectedItems.length} 個位置項目`);
    }
  }

  // 位置表格儲存事件（只暫存）
  onLocationTableSave(event: { oldData: any, newData: any }): void {
    const { newData } = event;

    // 標記狀態
    if (newData._status === 'original') {
      newData._status = 'modified';
    }

    console.log('位置資料已暫存:', newData);
    this.saveToWorkflow(); // 只暫存到工作流程
    this.messageService.successBubble('位置資料已儲存');
  }

  // 位置表格編輯事件
  onLocationTableEdit(rowData: any): void {
    console.log('開始編輯位置資料:', rowData);
  }

  // 位置表格取消事件
  onLocationTableCancel(rowData: any): void {
    console.log('取消編輯位置資料:', rowData);
  }

  // 處理下拉選單變更（位置編號選擇時自動帶入）
  onLocationDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    const { rowData, field, newValue, oldValue } = event;

    console.log('=== 下拉選單變更事件 ===');
    console.log('欄位:', field);
    console.log('新值:', newValue);
    console.log('舊值:', oldValue);
    console.log('當前 rowData:', rowData);

    // 加入這些檢查
    console.log('field 是否等於 location_no:', field === 'location_no');
    console.log('newValue 是否有值:', !!newValue);
    console.log('newValue 是否不等於 oldValue:', newValue !== oldValue);
    console.log('三個條件:', field === 'location_no', !!newValue, newValue !== oldValue);

    if (field === 'location_no' && newValue) {
      console.log('位置編號變更，開始自動帶入...');

      // 從選項中找到對應的資料
      const selectedLocation = this.locationWithDetailsOptions.find(
        location => location.value === newValue
      );

      console.log('找到的位置資料:', selectedLocation);

      if (selectedLocation) {
        console.log('帶入前的 rowData:', JSON.stringify(rowData, null, 2));

        // 直接複製屬性 - 欄位名稱完全一致！
        // 修正版本 - 直接用後端的欄位名稱
        rowData.tlt_building = selectedLocation.tlt_building;  // ✅
        rowData.tlt_floor = selectedLocation.tlt_floor;        // ✅
        rowData.area_no = selectedLocation.area_no;           // ✅
        rowData.businessArea = selectedLocation.businessArea || 0;

        // 標記狀態變更
        if (rowData._status === 'original') {
          rowData._status = 'modified';
        } else if (!rowData._status) {
          rowData._status = 'new';
        }

        console.log('帶入後的 rowData:', JSON.stringify(rowData, null, 2));

        // 強制觸發表格更新
        this.locationData = [...this.locationData];

        this.saveToWorkflow();
        this.messageService.infoBubble(`已自動帶入位置 ${newValue} 的詳細資訊`);
      } else {
        console.warn('找不到位置詳細資料:', newValue);
        console.warn('可用的位置:', this.locationWithDetailsOptions.map(opt => opt.location_no));
        this.messageService.warnBubble(`找不到位置 ${newValue} 的詳細資訊`);
      }
    }

    // 其他欄位變更也觸發暫存
    this.saveToWorkflow();
  }


  // 清除所有位置
  onClearAllLocations(): void {
    if (confirm('確定要清除所有位置資訊嗎？此操作無法復原。')) {
      this.locationData = [];
      this.data = [];
      this.filteredData = [];
      this.saveToWorkflow();
      this.messageService.infoBubble('已清除所有位置資訊');
    }
  }

  // 取得位置總營業坪數
  getTotalBusinessArea(): number {
    return this.locationData.reduce((total, item) => {
      const area = parseFloat(item.businessArea) || 0;
      return total + area;
    }, 0);
  }

  // 取得位置設定狀態
  getLocationSetupStatus(): { text: string, class: string } {
    if (this.locationData.length === 0) {
      return { text: '未設定', class: 'text-red-500' };
    } else {
      const hasEmptyLocation = this.locationData.some(item => !item.location_no);
      if (hasEmptyLocation) {
        return { text: '設定不完整', class: 'text-orange-500' };
      } else {
        return { text: '設定完成', class: 'text-green-500' };
      }
    }
  }

  // ==========  銀行相關事件處理 ==========
  onBankSelect(selectedBank: AutoCompleteOption): void {
    this.selectedBankInfo = selectedBank;
    this.dataForm.patchValue({ bank_id: selectedBank.value });
    this.saveToWorkflow();
  }

  onBankUnselect(): void {
    this.selectedBankInfo = null;
    this.dataForm.patchValue({ bank_id: '' });
    this.saveToWorkflow();
  }

  searchBankOptions(searchKeyword: string): Observable<string[]> {
    return this.bankService.getBankOptions(searchKeyword).pipe(
      map((data: any[]) => data.map(item => `${item.value}${item.label}`))
    );
  }

  // ==========  輔助方法 ==========
  canQuery(): boolean {
    return true;
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return '此欄位為必填';
      if (field.errors['email']) return '請輸入正確的 Email 格式';
      if (field.errors['maxlength']) return `最多可輸入 ${field.errors['maxlength'].requiredLength} 個字元`;
    }
    return '';
  }

  onRefreshBusClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: () => this.messageService.infoBubble('中分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類');
    }
  }

  onRefreshBusSClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    const busClass = this.dataForm.get('bus_class')?.value;

    if (busType && busClass) {
      this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
        next: () => this.messageService.infoBubble('小分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類和中分類');
    }
  }

  // // 驗證位置資料
  // private validateLocationData(): boolean {
  //   // 過濾掉已刪除的資料進行驗證
  //   const activeData = this.locationData.filter(item => item._status !== 'deleted');

  //   if (activeData.length === 0) {
  //     this.messageService.warnBubble('至少需要設定一個位置');
  //     return false;
  //   }

  //   let isValid = true;
  //   const errors: string[] = [];

  //   activeData.forEach((item, index) => {
  //     if (!item.location_no) {
  //       errors.push(`第 ${index + 1} 行：位置編號不能為空`);
  //       isValid = false;
  //     }
  //     if (!item.businessArea || item.businessArea <= 0) {
  //       errors.push(`第 ${index + 1} 行：營業坪數必須大於 0`);
  //       isValid = false;
  //     }
  //   });

  //   if (!isValid) {
  //     this.messageService.warnBubble(`位置資料驗證失敗：\n${errors.join('\n')}`);
  //   }

  //   return isValid;
  // }

  // 偵錯方法（顯示暫存和API格式）
  debugLocationData(): void {
    console.log('=== 位置資料偵錯資訊 ===');
    console.log('前端暫存格式:', this.locationData);

    // 刪除這些會報錯的行
    // const apiData = TLS13010Mapper.fromFrontendToApiSave(this.locationData);
    // console.log('將來會送到API的格式:', apiData);
    // console.log('新增資料:', apiData.filter(item => item._operation === 'INSERT'));
    // console.log('修改資料:', apiData.filter(item => item._operation === 'UPDATE'));
    // console.log('刪除資料:', apiData.filter(item => item._operation === 'DELETE'));

    // 改用這個
    // console.log('API 送出格式:', this.getLocationDataForApi());

    const workflowData = this.contractFlowService.getStep1Data();
    console.log('工作流程暫存資料:', workflowData?.locationInfo);
  }

  private getOperationType(status?: string): string {
    switch (status) {
      case 'new': return 'INSERT';
      case 'modified': return 'UPDATE';
      case 'deleted': return 'DELETE';
      default: return 'NONE';
    }
  }

  // 偵錯方法 - 檢查資料流
  debugLocationFlow(): void {
    console.log('=== 位置資料流偵錯 ===');
    console.log('選項資料:', this.locationWithDetailsOptions);
    console.log('表格資料:', this.locationData);
    console.log('表格欄位選項:', this.locationColumns.find(col => col.field === 'location_no')?.options);

    // 檢查第一筆選項資料的結構
    if (this.locationWithDetailsOptions.length > 0) {
      console.log('第一筆選項的所有屬性:', Object.keys(this.locationWithDetailsOptions[0]));
      console.log('第一筆選項的值:', this.locationWithDetailsOptions[0]);
    }
  }

}
