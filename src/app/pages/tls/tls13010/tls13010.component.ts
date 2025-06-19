// tls13010.component.ts - 整理後版本
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// 基礎服務
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';

// 格式化函數
import {
  formatCheckType,
  formatCommissionCompType,
  formatDecoType,
  formatMoneyType,
  formatOpenflagStatus,
  formatTltTermType
} from './tls13010.constants';

// 下拉選單服務
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from './tls13010.dropdown';

// 業務服務
import { ContractFlowService, WorkflowStep } from './services/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';

// API 服務
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';

// 資料模型
import { ContractItem } from './tls13010.model';

@Component({
  selector: 'app-tls13010',
  templateUrl: './tls13010.component.html',
  styleUrl: './tls13010.component.scss',
})
export class TLS13010Component extends BasicQueryPageComponent<ContractItem> implements OnInit {

  // 表單定義
  queryForm = this.formBuilder.nonNullable.group({
    // 基本資訊
    apply_no: [, [Validators.maxLength(50)]],
    tlt_name: [, [Validators.maxLength(100)]],
    tlt_no: [, [Validators.maxLength(50)]],
    bus_typeList: [[]],
    ven_no: [, [Validators.maxLength(50)]],
    ven_uniformList: [[]],
    paper_typeList: [[]],

    // 地點資訊
    location_noList: [[]],
    area_noList: [[]],
    tlt_buildingList: [[]],
    tlt_floorList: [[]],

    // 合約資訊
    apply_typeList: [[]],
    contact_USR_No: [[]],
    feedback_date_from: [],
    feedback_date_to: [],
    due_date_from: [],
    due_date_to: [],
    contact_Date_from: [],
    contact_Date_to: [],

    // 專櫃日期範圍
    tlt_bdate_start_from: [],
    tlt_bdate_end_to: [],
    tlt_edate_start_from: [],
    tlt_edate_end_to: [],

    // 合約日期範圍
    tlt_contract_bdate_from: [],
    tlt_contract_bdate_to: [],
    tlt_contract_edate_from: [],
    tlt_contract_edate_to: [],

    // 營運資訊
    tlt_openflagList: [[]],
    org_idList: [[]],

    // 財務與其他資訊
    comm_comp_type: [['2']], // 預設值為除稅
    tlt_term_typeList: [[]],
    money_typeList: [[]],
    paytypeList: [[]],
    store_wayList: [[]],
    invoice_typeList: [[]],
    tlt_kindList: [[]],
    deco_typeList: [[]],
    overall_statusList: [[]],
    check_day: [, [Validators.maxLength(10)]],

    // Y/N 條件
    rece_yn: [],
    pos_yn: [],
    cash_yn: [],

    // 抄表類型
    meter_typeList: [[]],

    // 保證金相關
    depositTypes: [[]],
    open_deposit: [[]],
    paymentMethods: [[]],

    // 分頁配置
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }])
  });

  // 表格資料
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [...this.data];
  totalRecords: number = 0;
  selectedItems: ContractItem[] = [];

  // 表格欄位配置
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
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

  // ========== 下拉選單選項 ==========
  // 固定選項
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
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  depositPaymentOptions = [...TLS13010_DROPDOWN_OPTIONS.depositPayment];
  commissionCompTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.commissionCompType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];

  // API 載入的選項
  vendorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  pos2013Options: any[] = [];

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
    private apiService: TLS13010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', '/TLS/TLS13010CRU', this.queryForm, (form) => this.onSubmit(form));
    this.checkExistingWorkflow();
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.loadDropdownOptions();
    this.loadPOS2013Options();
  }

  /**
   * 檢查是否有進行中的工作流程
   */
  private checkExistingWorkflow(): void {
    const currentStatus = this.contractFlowService.getCurrentStatus();
    if (currentStatus.contractId) {
      const currentData = this.contractFlowService.getCurrentData();
      const stepName = this.contractFlowService.getStepName(currentStatus.currentStep);

      this.messageService.infoBubble(
        `發現進行中的工作流程 (${currentData.queryRowData?.apply_no || currentStatus.contractId})，` +
        `當前在：${stepName}`
      );
    }
  }

  /**
   * 載入下拉選單選項
   */
  private loadDropdownOptions(): void {
    this.vendorService.getVendors().subscribe({
      next: (data) => this.vendorOptions = data,
      error: (err) => console.warn('載入廠商選項失敗:', err)
    });

    this.contractStatusService.getContractStatuses().subscribe({
      next: (data) => this.contractStatusOptions = data,
      error: (err) => console.warn('載入合約狀態選項失敗:', err)
    });

    this.settlementMethodService.getSettlementMethods().subscribe({
      next: (data) => this.settlementMethodOptions = data,
      error: (err) => console.warn('載入結帳方式選項失敗:', err)
    });

    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (data) => this.paymentMethodOptions = data,
      error: (err) => console.warn('載入付款方式選項失敗:', err)
    });

    this.cooperationMethodService.getCooperationMethods().subscribe({
      next: (data) => this.cooperationMethodOptions = data,
      error: (err) => console.warn('載入配合方式選項失敗:', err)
    });

    this.counterCategoryService.getCounterCategories().subscribe({
      next: (data) => this.counterCategoryOptions = data,
      error: (err) => console.warn('載入櫃別選項失敗:', err)
    });
  }

  /**
   * 載入 POS2013 選項
   */
  private loadPOS2013Options(): void {
    // 如果 DropdownService 中已經載入完成，直接使用
    if (this.tls13010DropdownService.pos2013Options.length > 0) {
      this.pos2013Options = this.tls13010DropdownService.getPOS2013Options();
    } else {
      // 否則延遲載入
      setTimeout(() => {
        this.pos2013Options = this.tls13010DropdownService.getPOS2013Options();
        console.log('POS2013選項載入完成 (查詢頁面):', this.pos2013Options.length);
      }, 500);
    }
  }

  /**
   * 主要查詢方法
   */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.apiService.queryTLS13010(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);

            if (this.data.length === 0) {
              this.messageService.infoBubble('查詢無資料');
            }
          } else {
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

  /**
   * 編輯功能
   */
  override onEdit(rowData: ContractItem): void {
    // 統一使用 startWorkflow，內部會自動處理新資料或現有暫存
    this.contractFlowService.startWorkflow(rowData);

    // 固定導向 CRU 頁面
    this.navigateToStep(WorkflowStep.CONTRACT_INFO);

    // 檢查是否有暫存資料來顯示不同訊息
    const hasExistingData = this.contractFlowService.getStep1Data(rowData);

    if (hasExistingData) {
      this.messageService.infoBubble('繼續編輯暫存資料（從契約資訊開始）');
    } else {
      this.messageService.infoBubble('開始新的編輯工作流程');
    }
  }

  /**
   * 詳細檢視功能
   */
  override onDetail(rowData: ContractItem): void {
    this.onEdit(rowData);
  }

  /**
   * 導航到指定步驟
   */
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

  /**
   * 刪除功能
   */
  onDelete(data: ContractItem | ContractItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      this.messageService.warnBubble('沒有選中的項目');
      return;
    }

    const currentStatus = this.contractFlowService.getCurrentStatus();
    const editingItems = items.filter(item =>
      item.talent_id === currentStatus.contractId ||
      item.apply_no === currentStatus.contractId
    );

    if (editingItems.length > 0) {
      this.messageService.warnBubble('有項目正在編輯中，請先完成或取消編輯');
      return;
    }

    const idList = items
      .filter(item => item && item.talent_id != null && item.talent_id !== undefined)
      .map(item => item.talent_id);

    if (idList.length === 0) {
      this.messageService.warnBubble('選中的項目缺少有效 ID');
      return;
    }

    if (confirm(`確定要刪除 ${idList.length} 個項目嗎？`)) {
      this.apiService.deleteTLS11020(idList as any[]).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.messageService.successBubble(`成功刪除 ${idList.length} 個項目`);
            this.onSubmit(this.queryForm);
          } else {
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

  /**
   * 判斷資料列是否可選取
   */
  isRowSelectable(rowData: ContractItem): boolean {
    return true;
  }

  /**
   * 取得工作流程狀態
   */
  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  /**
   * 取得進度百分比
   */
  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }

  isPOS2013OptionsLoaded(): boolean {
    return this.pos2013Options.length > 0;
  }
}
