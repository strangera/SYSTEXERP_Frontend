// tls13010.component.ts (修改後 - 只加入必要的部分)
import { Sysb800DropdownService } from './../../../service/API/sys/sysb800-dropdown.service';
import { WhetherService } from './../../../service/basic/whether.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 新增這個
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { LocationService } from '../../../service/basic/location.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { CommissionCalculationService } from '../../../service/basic/commission-calculation.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { DecorationMethodService } from '../../../service/basic/decoration-method.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';
import { formatCheckType, formatCommissionCompType, formatDecoType, formatMoneyType, formatOpenflagStatus, formatTltTermType } from './tls13010.constants';
import { DropdownOption, TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from './tls13010.dropdown';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service'; // 新增這個
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { forkJoin } from 'rxjs';

// 資料模型不變...
interface ContractItem {
  talent_id: string;
  apply_no: string;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  paper_type: string;
  contract_subno: string;
  feedback_date: string;
  due_date: string;
  tlt_bdate: string;
  tlt_edate: string;
  contact_Date: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  bus_type: string;
  bus_class: string;
  bus_sclass: string;
  deco_type: string;
  money_type: string;
  check_type: string;
  tlt_term_type: string;
  comm_comp_type: string;
  comm_yn: string;
  store_way: string;
  rece_yn: string;
  pos_yn: string;
  cash_yn: string;
  tlt_openflag: string;
  org_id: string;
  rent_ahead: string;
  rent_period: string;
  base_rent: string;
  deposit: string;
  total_amt: string;
  total_amt_vendor: string;
  open_deposit: string;
  open_fees: string;
  construct_deposit: string;
  construct_fees: string;
  expiration_deposit: string;
  expiration_fees: string;
  check_day: string;
  tlt_kind: string;
  edc_yn: string;
  tlt_ctype_mtotal: string;
  overall_status: string;
  paytype: string;
  vip_yn: string;
  credit_card: string;
  invoice_type: string;
  water_flag: string;
  electric_flag: string;
  gas_flag: string;
  email: string;
  invoice_email: string;
  CHECK_TITLE: string;
  store_tel: string;
  bank_id: string;
  vendor_acct_name: string;
  vendor_acct_no: string;
  contact_tel: string;
  contact_fax: string;
  contact_addr: string;
  tlt_remark: string;
  ticket_remarks: string;
  source_type: string;
  rental_count: string;
  contract_type: string;
}

@Component({
  selector: 'app-tls13010',
  templateUrl: './tls13010.component.html',
  styleUrl: './tls13010.component.scss',
})
export class TLS13010Component extends BasicQueryPageComponent<ContractItem> implements OnInit {

  // 現有的屬性都保持不變
  queryForm = this.formBuilder.nonNullable.group({
    // 基本資訊
    apply_no: [, [Validators.maxLength(50)]], // 專櫃招募編號
    tlt_name: [, [Validators.maxLength(100)]], // 專櫃名稱
    tlt_no: [, [Validators.maxLength(50)]], // 專櫃編號
    bus_typeList: [[]], // 大分類
    ven_no: [, [Validators.maxLength(50)]], // 廠商編號
    ven_uniformList: [[]], // 廠商統一編號
    paper_typeList: [[]], // 證件類型

    // 地點資訊
    location_noList: [[]], // 位置
    area_noList: [[]], // 區域
    tlt_buildingList: [[]], // 館別
    tlt_floorList: [[]], // 樓層

    // 合約資訊
    apply_typeList: [[]], // 申請類型
    contact_USR_No: [[]], // 聯絡人清單
    feedback_date_from: [], // 回函日期(起)
    feedback_date_to: [], // 回函日期(迄)
    due_date_from: [], // 回函截止日(起)
    due_date_to: [], // 回函截止日(迄)
    contact_Date_from: [], // 聯絡日期(起)
    contact_Date_to: [], // 聯絡日期(迄)

    // 專櫃日期範圍
    tlt_bdate_start_from: [], // 專櫃開始日期(起)
    tlt_bdate_end_to: [], // 專櫃開始日期(迄)
    tlt_edate_start_from: [], // 專櫃結束日期(起)
    tlt_edate_end_to: [], // 專櫃結束日期(迄)

    // 合約日期範圍
    tlt_contract_bdate_from: [], // 合約開始日期(起)
    tlt_contract_bdate_to: [], // 合約開始日期(迄)
    tlt_contract_edate_from: [], // 合約結束日期(起)
    tlt_contract_edate_to: [], // 合約結束日期(迄)

    // 營運資訊
    tlt_openflagList: [[]], // 開幕狀態清單
    org_idList: [[]], // 組織代碼清單

    // 財務與其他資訊
    comm_comp_type: [['2']], // 佣金計算方式清單
    tlt_term_typeList: [[]], // 合約期間類型清單
    money_typeList: [[]], // 幣別清單
    paytypeList: [[]], // 付款方式清單
    store_wayList: [[]], // 收款方式清單
    invoice_typeList: [[]], // 發票類型清單
    tlt_kindList: [[]], // 專櫃種類清單
    deco_typeList: [[]], // 裝潢類型清單
    overall_statusList: [[]], // 整體狀態清單
    check_day: [, [Validators.maxLength(10)]], // 對帳日

    // Y/N 條件
    rece_yn: [], // 是否收取管理費
    pos_yn: [], // 是否有POS機
    cash_yn: [], // 是否收現金

    // 抄表類型
    meter_typeList: [[]], // 抄表類型清單

    // 保證金相關 (如果需要的話)
    depositTypes: [[]], // 有無保證金
    paymentMethods: [[]], // 保證金付款方式

    // 使用 createPaginationConfig 建立分頁配置
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }])
  });

  // 表格資料
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [...this.data];

  // 表格欄位配置 - 根據 API 回傳的欄位調整
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true }, //欄位還沒開
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'feedback_date', header: '回函日期', visible: true, format: formatDate },
    { field: 'due_date', header: '回函截止日', visible: true, format: formatDate },
    { field: 'tlt_contract_bdate', header: '契約起始日', visible: true, format: formatDate },
    { field: 'tlt_contract_edate', header: '契約截止日', visible: true, format: formatDate },
    { field: 'tlt_bdate', header: '營運起始日', visible: true, format: formatDate },
    { field: 'tlt_edate', header: '營運截止日', visible: true, format: formatDate },
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'deco_type', header: '裝潢方式', visible: true, format: formatDecoType },
    { field: 'money_type', header: '結帳方式', visible: true, format: formatMoneyType },
    { field: 'check_type', header: '對帳方式', visible: true, format: formatCheckType },
    { field: 'comm_comp_type', header: '抽成別', visible: true, format: formatCommissionCompType },
    { field: 'store_way', header: '配合方式', visible: true, format: formatTltTermType },
    { field: 'rece_yn', header: '開立業主發票', visible: true, format: formatYN },
    { field: 'pos_yn', header: '使用業主收現', visible: true, format: formatYN },
    { field: 'cash_yn', header: '業主收現銀行', visible: true, format: formatYN },
    { field: 'contract_type', header: '合約種類', visible: true },
    { field: 'overall_status', header: '營運狀態', visible: true, format: formatOpenflagStatus },
    { field: 'source_type', header: '來源處', visible: true },
    { field: 'rental_count', header: '承租數', visible: true },
  ];

  totalRecords: number = 0;
  selectedItems: ContractItem[] = [];

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
  tltopenflagOption = TLS13010_DROPDOWN_OPTIONS.openflagStatus; // 開幕狀態

  // API 來的選項 (保留原來的)
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
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
  bustypeOption: any[] = [];
  // 新增這些屬性
  public buildingOptions: DropdownOption[] = [];     // 館別
  public floorOptions: DropdownOption[] = [];        // 樓層
  public regionOptions: DropdownOption[] = [];       // 區域
  public orgOptions: DropdownOption[] = [];          // 組織代碼
  public paperTypeOptions: DropdownOption[] = [];          //營業型態

  constructor(
    public override router: Router, // 改為 public
    private locationOptionsService: LocationOptionsService, // 新增這行
    private contractFlowService: ContractFlowService, // 新增
    public tls13010DropdownService: TLS13010DropdownService, // 改成 public，這樣 template 可以直接用
    private businessTypeCodeService: BusinessTypeCodeService,
    private vendorService: VendorService,
    private locationService: LocationService,
    private contractStatusService: ContractStatusService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private organizationService: OrganizationNumberService,
    private operationStatusService: OperationStatusService,
    private commissionCalculationService: CommissionCalculationService,
    private counterCategoryService: CounterCategoryService,
    private decorationMethodService: DecorationMethodService,
    private commissionTypeService: CommissionTypeService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    private whetherService: WhetherService,
    private negotiatorService: UserCodeService,
    private businessTypeService: BusinessTypeService,
    private apiService: TLS13010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 使用 BasicQueryPageComponent 的 initializePage 方法
    this.initializePage('TLS13010', '/TLS/TLS13010CRU', this.queryForm, (form) => this.onSubmit(form));

    // 新增：檢查是否有進行中的工作流程
    this.checkExistingWorkflow();


    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入所有下拉選單資料
    this.loadDropdownOptions();
  }

  // 新增：檢查是否有進行中的工作流程
  private checkExistingWorkflow(): void {
    const currentStatus = this.contractFlowService.getCurrentStatus();

    if (currentStatus.contractId) {
      const currentData = this.contractFlowService.getCurrentData();
      const stepName = this.contractFlowService.getStepName(currentStatus.currentStep);

      console.log('發現進行中的工作流程:', {
        contractId: currentStatus.contractId,
        currentStep: stepName,
        progress: this.contractFlowService.getProgressPercentage()
      });

      // 顯示提示訊息
      this.messageService.infoBubble(
        `發現進行中的工作流程 (${currentData.queryRowData?.apply_no || currentStatus.contractId})，` +
        `當前在：${stepName}`
      );
    }
  }

  private loadDropdownOptions(): void {
    // 只載入需要從 API 取得的選項

    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });

    this.locationService.getLocations().subscribe((data) => {
      this.locationOptions = data;
    });

    // ... 其他 API 相關的選項
  }

  // 主要的查詢方法 - 保持原樣
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 呼叫 API 服務
      this.apiService.queryTLS13010(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;

            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(this.ProgNo, frm.value);

            if (this.data.length === 0) {
              console.log('查詢結果為空');
              this.messageService.infoBubble('查詢無資料');
            }
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
        },
        error: (err: any) => {
          console.error('API error:', err);
          this.messageService.errorBubble('查詢失敗，請檢查網路連線或聯繫管理員');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  // 修改：編輯功能 - 整合工作流程
  override onEdit(rowData: ContractItem): void { // 加上 override
    console.log('開始編輯:', rowData);

    // 檢查是否要繼續現有工作流程或開始新的
    if (this.contractFlowService.continueWorkflow(rowData)) {
      // 繼續現有工作流程
      const currentStatus = this.contractFlowService.getCurrentStatus();
      this.navigateToStep(currentStatus.currentStep);
      this.messageService.infoBubble('繼續現有的編輯工作流程');
    } else {
      // 開始新的工作流程
      this.contractFlowService.startWorkflow(rowData);
      this.navigateToStep(WorkflowStep.CONTRACT_INFO);
      this.messageService.infoBubble('開始新的編輯工作流程');
    }
  }

  // 新增：詳細檢視功能
  override onDetail(rowData: ContractItem): void { // 加上 override
    console.log('檢視詳細:', rowData);
    // 暫時導向編輯頁面，之後可以建立唯讀的詳細頁面
    this.onEdit(rowData);
  }

  // 新增：導航到指定步驟
  private navigateToStep(step: WorkflowStep): void {
    switch (step) {
      case WorkflowStep.CONTRACT_INFO:
        this.router.navigate(['/TLS/TLS13010CRU']);
        break;
      case WorkflowStep.DEDUCTION:
        this.router.navigate(['/TLS/TLS13010NEXT1']);
        break;
      case WorkflowStep.COMMISSION:
        this.router.navigate(['/TLS/TLS13010NEXT2']);
        break;
      case WorkflowStep.CONDITION:
        this.router.navigate(['/TLS/TLS13010NEXT3']);
        break;
      default:
        this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  onSubmitQuery(frm: FormGroup): void {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  // 修改：刪除功能 - 檢查是否有項目正在編輯中
  onDelete(data: ContractItem | ContractItem[]): void { // 加上 override
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      this.messageService.warnBubble('沒有選中的項目');
      return;
    }

    // 檢查是否有項目正在編輯中
    const currentStatus = this.contractFlowService.getCurrentStatus();
    const editingItems = items.filter(item =>
      item.talent_id === currentStatus.contractId ||
      item.apply_no === currentStatus.contractId
    );

    if (editingItems.length > 0) {
      this.messageService.warnBubble('有項目正在編輯中，請先完成或取消編輯');
      return;
    }

    // 由於 API 資料結構中沒有 id 欄位，這裡使用 talent_id 作為識別
    const idList = items
      .filter(item => item && item.talent_id != null && item.talent_id !== undefined)
      .map(item => item.talent_id);

    if (idList.length === 0) {
      this.messageService.warnBubble('選中的項目缺少有效 ID');
      return;
    }

    // 確認刪除
    if (confirm(`確定要刪除 ${idList.length} 個項目嗎？`)) {
      this.apiService.deleteTLS11020(idList as any[]).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
            this.onSubmit(this.queryForm); // 刷新資料
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(`刪除失敗: ${response.Message || '未知錯誤'}`);
          }
        },
        error: (err: any) => {
          console.error('API error:', err);
          this.messageService.errorBubble('刪除失敗，請檢查網路連線或聯繫管理員');
        },
        complete: () => {
          this.selectedItems = [];
        }
      });
    }
  }

  // 可選：判斷資料列是否可選取（如果需要的話）
  isRowSelectable(rowData: ContractItem): boolean {
    // 根據業務需求決定哪些資料列可以被選取
    // 例如：只有特定狀態的合約可以被選取
    return true; // 預設全部可選
  }

  // 新增：取得工作流程狀態 (可用於 template 顯示)
  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  // 新增：取得進度百分比 (可用於 template 顯示)
  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }

  // 新增這個方法
  private initLocationOptions(): void {
    forkJoin({
      building: this.locationOptionsService.getBuildingOptions(),
      floor: this.locationOptionsService.getFloorOptions(),
      region: this.locationOptionsService.getRegionOptions(),
      org: this.locationOptionsService.getOrgOptions(),
      location: this.locationOptionsService.getLocationOptions(),
      paperType: this.locationOptionsService.getPaperTypeOptions()
    }).subscribe({
      next: (results) => {
        this.buildingOptions = results.building;
        this.floorOptions = results.floor;
        this.regionOptions = results.region;
        this.orgOptions = results.org;
        this.locationOptions = results.location;
        this.paperTypeOptions = results.paperType;
      },
      error: (error) => console.error('載入 Location 選項失敗:', error)
    });
  }

  // 新增這些 getter 方法
  getBuildingOptions(): DropdownOption[] { return this.buildingOptions; }
  getFloorOptions(): DropdownOption[] { return this.floorOptions; }
  getRegionOptions(): DropdownOption[] { return this.regionOptions; }
  getOrgOptions(): DropdownOption[] { return this.orgOptions; }
  getLocationOptions(): DropdownOption[] { return this.locationOptions; }
  getPaperTypeOptions(): DropdownOption[] {
    return this.paperTypeOptions;
  }
}
