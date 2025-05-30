// tls13010-cru.component.ts (修改後)
import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { Component, OnInit, OnDestroy } from '@angular/core'; // 新增 OnDestroy
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 新增 Router
import { Subscription } from 'rxjs'; // 新增 Subscription
import { ValidationService } from '../../../shared/service/validation.service';
import { BaseTypeService } from '../../../service/basic/base-type-service.service';
import { ExcessHandlingMethodService } from '../../../service/basic/excess-handling-method.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { ReconciliationMethodService } from '../../../service/basic/reconciliation-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { PaperTypeService } from '../../../service/basic/paper-type.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { BankAccountCodeService } from '../../../service/basic/bank-account-code.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { DecorationStyleService } from '../../../service/basic/decoration-style.service';
import { CommissionCalculationService } from '../../../service/basic/commission-calculation.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service'; // 修改引入
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

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

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // 地點資訊表格資料
  data: any[] = [
    {
      isNew: false,
      locationCode: 'B123',
      floor: '2樓',
      area: 'B區',
      businessArea: '100坪',
      startDate: '2023/12/01',
      endDate: '2024/11/30',
      performanceShare: 100,
    },
  ];

  filteredData: any[] = [...this.data];

  // 表格欄位配置
  columns: any[] = [
    {
      field: 'locationCode', header: '位置編號', visible: true, type: 'dropdown',
      options: [
        { label: 'B123', value: 'B123' },
        { label: 'C234', value: 'C234' },
      ],
    },
    {
      field: 'floor', header: '樓層', visible: true,
      type: 'dropdown',
      options: [
        { label: '1樓', value: '1樓' },
        { label: '2樓', value: '2樓' },
        { label: '3樓', value: '3樓' },
        { label: '4樓', value: '4樓' },
        { label: '5樓', value: '5樓' },
      ],
    },
    { field: 'area', header: '區域', visible: true, type: 'input', },
    { field: 'businessArea', header: '營業坪數', visible: true, type: 'input' },
    { field: 'startDate', header: '使用起始日', visible: true, type: 'date' },
    { field: 'endDate', header: '使用截止日', visible: true, type: 'date' },
    { field: 'performanceShare', header: '業績分攤(%)', visible: true, type: 'input' },
  ];

  // 主要表單定義
  dataForm = this.formBuilder.group({
    /** @description 合約ID */
    talent_id: [''],
    /** @description 專櫃招募編號 */
    apply_no: [''],

    // 基本資訊
    /** @description 專櫃名稱 */
    tlt_name: [''],
    /** @description 專櫃編號 */
    tlt_no: [{ value: '契約書審核後才給號', disabled: true }],
    /** @description 廠商統一編號 */
    ven_uniform: [''],
    /** @description 廠商名稱 */
    VEN_Name: [''],
    /** @description 營業型態 */
    paper_type: [''],
    /** @description 大分類 */
    bus_type: [''],
    /** @description 中分類 */
    bus_class: [''],
    /** @description 小分類 */
    bus_sclass: [''],
    /** @description 版本編號 */
    contract_subno: [''],

    // 合約資訊
    /** @description 合約起始日 */
    tlt_bdate: [''],
    /** @description 合約終止日 */
    tlt_edate: [''],
    /** @description 洽談日期 */
    contact_Date: [''],
    /** @description 洽談人員姓名 */
    contact_USR_Name: [''],
    /** @description 回函日期 */
    feedback_date: [''],
    /** @description 回函截止日 */
    due_date: [''],

    // 營運資訊
    /** @description 組織代號 */
    org_id: [''],
    /** @description 營運起始日 */
    tlt_contract_bdate: [''],
    /** @description 營運截止日 */
    tlt_contract_edate: [''],

    // 財務資訊
    /** @description 抽成別 */
    tlt_term_type: [''],
    /** @description 抽成額計算方式，預設為除稅 */
    comm_comp_type: ['2'],
    /** @description 是否為抽成 */
    comm_yn: [''],
    /** @description 預收租金 */
    rent_ahead: [''],
    /** @description 預收租金期數 */
    rent_period: [''],
    /** @description 固定租金 */
    base_rent: [''],
    /** @description 押金 */
    deposit: [''],
    /** @description 年目標營業額(業主) */
    total_amt: [''],
    /** @description 年預估營業額(廠商) */
    total_amt_vendor: [''],
    /** @description 準時開業保證金付款方式 */
    open_deposit: [''],
    /** @description 準時開業保證金 */
    open_fees: [''],
    /** @description 裝潢方式 */
    deco_type: [''],
    /** @description 保證金付款方式 */
    paymentMethods: [[]],
    /** @description 施工保證金 */
    construct_fees: [''],
    /** @description 付款期限(天數) */
    check_day: [''],

    // 業務資訊
    /** @description 櫃別 */
    tlt_kind: [''],
    /** @description 是否使用業主商店代號 */
    edc_yn: [''],
    /** @description 包底類別 */
    tlt_ctype_mtotal: [''],
    /** @description 超出部份處理方式 */
    overall_status: [''],
    /** @description 是否開立業主發票 */
    rece_yn: [''],
    /** @description 是否使用業主收銀機 */
    pos_yn: [''],
    /** @description 是否為業主收現 */
    cash_yn: [''],
    /** @description 結帳方式 */
    money_type: [''],
    /** @description 配合方式 */
    store_way: [''],
    /** @description 對帳方式 */
    check_type: [''],
    /** @description 付款方式 */
    paytype: [''],
    /** @description 是否配合聯名卡 */
    vip_yn: [''],
    /** @description 聯名卡折數 */
    credit_card: [''],
    /** @description 請款單據別 */
    invoice_type: ['1'],

    // 抄表類型
    /** @description 抄表類型清單 */
    meter_typeList: [[]],

    // 保證金相關
    /** @description 保證金備註 */
    ticket_remarks: [''],

    // 聯絡資訊
    /** @description 電子信箱 */
    email: [''],
    /** @description 發票電子郵件 */
    invoice_email: [''],
    /** @description 票據抬頭 */
    CHECK_TITLE: [''],
    /** @description 專櫃電話號碼 */
    store_tel: [''],
    /** @description 廠商匯款銀行代號 */
    bank_id: [''],
    /** @description 廠商帳戶名稱 */
    vendor_acct_name: [''],
    /** @description 廠商銀行帳號 */
    vendor_acct_no: [''],
    /** @description 公司電話號碼 */
    contact_tel: [''],
    /** @description 公司傳真號碼 */
    contact_fax: [''],
    /** @description 郵寄地址 */
    contact_addr: [''],
    /** @description 備註 */
    tlt_remark: [''],
  });

  // 固定選項 (從 constants 來的)
  decorationOptions = TLS13010_DROPDOWN_OPTIONS.decorationType;
  moneyTypeOptions = TLS13010_DROPDOWN_OPTIONS.moneyType;
  checkTypeOptions = TLS13010_DROPDOWN_OPTIONS.checkType;
  yesNoOptions = TLS13010_DROPDOWN_OPTIONS.yesNo;
  meterTypeOptions = TLS13010_DROPDOWN_OPTIONS.meterType;
  paytypeOptions = TLS13010_DROPDOWN_OPTIONS.paytype;
  storeWayOptions = TLS13010_DROPDOWN_OPTIONS.storeWay;
  invoiceTypeOptions = TLS13010_DROPDOWN_OPTIONS.invoiceType;
  tltKindOptions = TLS13010_DROPDOWN_OPTIONS.tltKind;
  openflagStatusOptions = TLS13010_DROPDOWN_OPTIONS.openflagStatus;
  overallStatusOptions = TLS13010_DROPDOWN_OPTIONS.overallStatus;
  depositTypeOptions = TLS13010_DROPDOWN_OPTIONS.depositType;
  depositPaymentOptions = TLS13010_DROPDOWN_OPTIONS.depositPayment;
  commissionCompTypeOptions = TLS13010_DROPDOWN_OPTIONS.commissionCompType;
  businessTypeOptions = TLS13010_DROPDOWN_OPTIONS.businessType;
  commCompTypeDropdown = TLS13010_DROPDOWN_OPTIONS.commCompType;

  // API 來的選項
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
  regionOptions: any[] = [];
  buildingOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];

  constructor(
    public override router: Router, // 新增
    private contractFlowService: ContractFlowService,
    private validationService: ValidationService,
    private counterCategoryService: CounterCategoryService,
    private decorationStyleService: DecorationStyleService,
    private commissionTypeService: CommissionTypeService,
    private commissionCalculationService: CommissionCalculationService,
    private baseTypeService: BaseTypeService,
    private excessHandlingMethodService: ExcessHandlingMethodService,
    private checkoutMethodService: SettlementMethodService,
    private cooperationMethodService: CooperationMethodService,
    private reconciliationMethodService: ReconciliationMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private bankAccountCodeService: BankAccountCodeService,
    private invoiceDocumentTypeService: PaperTypeService,
    private depositPaymentMethodService: PaymentMethod2Service,
    private constructionDepositPaymentMethodService: PaymentMethod2Service,
    private whetherService: WhetherService,
    private vendorService: VendorService,
    private businessTypeService: BusinessTypeService,
    private OrganizationNumberService: OrganizationNumberService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private productCategoryService: ProductCategoryService,
    private smallCategoryService: SmallCategoryService,
    private userCodeService: UserCodeService,
    private LocationCodeService: LocationCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入工作流程資料
    this.loadWorkflowData();

    // 監聽表單變化並自動儲存
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 載入工作流程資料
   */
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();

    console.log('載入工作流程資料:', workflowData);

    if (workflowData.contractId) {
      // 載入已儲存的表單資料
      const savedFormData = this.contractFlowService.getStep1Data();
      console.log('載入表單資料:', savedFormData);

      if (savedFormData && Object.keys(savedFormData).length > 0) {
        this.dataForm.patchValue(savedFormData);
        console.log('使用已儲存的表單資料');
      } else if (workflowData.queryRowData) {
        // 如果沒有已儲存的表單資料，使用查詢結果
        this.loadDataFromQueryResult(workflowData.queryRowData);
        console.log('使用查詢結果初始化表單');
      }

      // TODO: 載入地點資訊 (之後實作)
      // if (workflowData.locationInfo && workflowData.locationInfo.length > 0) {
      //   this.data = workflowData.locationInfo;
      //   this.filteredData = [...this.data];
      // }
    } else {
      console.warn('沒有工作流程資料，重導向到查詢頁面');
      this.router.navigate(['/TLS/TLS13010']);
    }
  }

  /**
   * 從查詢結果載入資料
   */
  private loadDataFromQueryResult(queryData: any): void {
    console.log('從查詢結果載入資料:', queryData);

    this.dataForm.patchValue({
      // 隱藏的ID欄位
      talent_id: queryData.talent_id,
      apply_no: queryData.apply_no,

      // 基本資訊
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

      // 其他欄位根據需要對應
      deco_type: queryData.deco_type,
      money_type: queryData.money_type,
      check_type: queryData.check_type,
      tlt_term_type: queryData.tlt_term_type,
      comm_comp_type: queryData.comm_comp_type,
      store_way: queryData.store_way,
      rece_yn: queryData.rece_yn,
      pos_yn: queryData.pos_yn,
      cash_yn: queryData.cash_yn,
      org_id: queryData.org_id,
      overall_status: queryData.overall_status,
      paytype: queryData.paytype,
      invoice_type: queryData.invoice_type,
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
    });
  }

  /**
   * 設定自動儲存
   */
  private setupAutoSave(): void {
    // 監聽表單變化，延遲儲存
    const formSubscription = this.dataForm.valueChanges.subscribe(() => {
      this.saveToWorkflow();
    });

    this.subscriptions.push(formSubscription);
  }

  /**
   * 儲存到工作流程
   */
  private saveToWorkflow(): void {
    if (this.dataForm.valid || this.dataForm.dirty) {
      const formData = this.dataForm.value;

      this.contractFlowService.saveStep1Data(formData);

      console.log('自動儲存表單資料到工作流程');
    }
  }

  /**
   * 手動儲存
   */
  onSave(): void {
    this.saveToWorkflow();
    this.messageService.successBubble('資料已儲存');
  }

  /**
   * 提交表單
   */
  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (!frm.valid) {
      this.messageService.warnBubble('請檢查必填欄位');
      return;
    }

    // 儲存到工作流程
    this.saveToWorkflow();

    this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  /**
   * 下一步
   */
  onSubmitNext(): void {
    if (this.dataForm.valid) {
      this.saveToWorkflow();
      this.router.navigate(['/TLS/TLS13010NEXT1']);
    } else {
      this.submitted = true;
      this.messageService.warnBubble('請完成必填欄位後再進入下一步');
    }
  }

  /**
   * 上一步 / 取消
   */
  override onCancel(): void {
    // 詢問是否要儲存草稿
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
      }
    }

    this.router.navigate(['/TLS/TLS13010']);
  }

  /**
   * 清除表單
   */
  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？')) {
      this.dataForm.reset();
      this.data = []; // 清除地點資訊
      this.filteredData = [];

      // 清除工作流程中的資料
      this.contractFlowService.clearTempData();
    }
  }

  /**
   * 計算業績分攤
   */
  calculatePerformanceShare(): void {
    console.log('計算業績分攤');

    // 根據營業坪數計算業績分攤比例
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
      this.saveToWorkflow(); // 自動儲存

      this.messageService.successBubble('業績分攤計算完成');
    } else {
      this.messageService.warnBubble('請先輸入營業坪數');
    }
  }

  /**
   * 表單驗證輔助方法
   */
  canQuery(): boolean {
    return true;
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  // ========== 以下保留您原有的 FormArray 相關方法 ==========

  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]),
  });

  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      systemTypeDetailOptions: [],
      organizationNumberOptions: [],
      LocationCodeOptions: [],
      useStartDate: [],
      useEndDate: [],
      Performancesharing: [],
      floor: [{ value: '選完位置編號自動帶入', disabled: true }],
      area: [{ value: '選完位置編號自動帶入', disabled: true }],
      squaremeters: [{ value: '選完位置編號自動帶入', disabled: true }],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  /**
   * 取得工作流程狀態 (用於 template 顯示)
   */
  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  /**
   * 取得進度百分比 (用於 template 顯示)
   */
  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }
}
