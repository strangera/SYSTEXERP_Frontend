// tls13010.component.ts - 整理後版本
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// 基礎服務
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';

// 格式化函數
import {
  formatCheckType,
  formatTltTermType,
  formatStoreWay,
  formatCommCompType,
  formatDecoType,
  formatMoneyType,
  formatOpenflagStatus,
  formatApproveStatus,
} from './tls13010.constants';

// 下拉選單服務
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from './tls13010.dropdown';

// 業務服務
import { ContractFlowService } from './services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';

// API 服務
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';

// 資料模型
import { ContractItem, WorkflowStep } from './tls13010.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';

@Component({
  selector: 'app-tls13010',
  templateUrl: './tls13010.component.html',
  styleUrl: './tls13010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    InputTextRangeComponent
  ],
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
    check_day: [, [Validators.maxLength(6)]],

    // Y/N 條件
    rece_yn: [],
    pos_yn: [],
    cash_yn: [],

    // 抄表類型
    meter_typeList: [[]],

    // 保證金相關
    depositTypes: [[]],
    all_deposit: [[]],
    paymentMethods: [[]],
    //版次區間
    contract_subno_from: [],
    contract_subno_to: [],
    total_amt_unit: [''], // 目標營業額單位(業主)
    total_amt_vendor_unit: [''], // 目標營業額單位(廠商)

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
    { field: 'tlt_term_type', header: '抽成別', visible: true, format: formatTltTermType },
    // { field: 'comm_comp_type', header: '抽成額計算方式', visible: true, format: formatCommCompType },
    { field: 'store_way', header: '配合方式', visible: true, format: formatStoreWay },
    { field: 'rece_yn', header: '開立業主發票', visible: true, format: formatYN },
    { field: 'pos_yn', header: '使用業主收現', visible: true, format: formatYN },
    { field: 'cash_yn', header: '業主收現銀行', visible: true, format: formatYN },
    { field: 'contract_type', header: '合約種類', visible: true },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'source_type', header: '來源處', visible: true },
    { field: 'rental_count', header: '承租數', visible: true },
    { field: 'tlt_openflag', header: '營運狀態', visible: true, format: formatOpenflagStatus },
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
  // commissionCompTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.commissionCompType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltTermTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
  pos2013Options: any[] = [];
  MONEY_TYPE_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  PAYTYPE_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  STORE_WAY_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  APPROVE_STATUS_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions];

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
    this.initializePage('TLS13010', '/tls/tls13010cru', this.queryForm, (form) => this.onSubmit(form));
    this.checkExistingWorkflow();
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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

      // this.messageService.infoBubble(
      //   `發現進行中的工作流程 (${currentData.queryRowData?.apply_no || currentStatus.contractId})，` +
      //   `當前在：${stepName}`
      // );
    }
  }
  /**
   * 載入 POS2013 選項
   */
  private loadPOS2013Options(): void {
    console.log('📍 開始載入 POS2013 選項');

    // 如果服務已經載入完成，直接使用
    const options = this.tls13010DropdownService.getPOS2013Options();
    if (options.length > 0) {
      this.pos2013Options = options;
      console.log('✅ POS2013 選項已載入:', this.pos2013Options.length);
      return;
    }

    // 如果未載入，持續檢查直到載入完成
    const checkInterval = setInterval(() => {
      const latestOptions = this.tls13010DropdownService.getPOS2013Options();
      if (latestOptions.length > 0) {
        this.pos2013Options = latestOptions;
        console.log('✅ POS2013 選項載入完成:', this.pos2013Options.length);
        clearInterval(checkInterval);
      }
    }, 200); // 每 200ms 檢查一次

    // 設置 5 秒超時，避免無限等待
    setTimeout(() => {
      clearInterval(checkInterval);
      if (this.pos2013Options.length === 0) {
        console.warn('⚠️ POS2013 選項載入超時');
        this.messageService.warnBubble('載入廠商選項失敗，請重新整理頁面');
      }
    }, 5000);
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
    * 🎯 覆寫父類的 onCreate 方法，實作新增功能
    */
  override onCreate(): void {
    console.log('🆕 開始新增流程，清空所有暫存資料');

    // 確保不是檢視模式
    this.contractFlowService.clearViewMode();

    // 1. 清空工作流程服務的所有暫存資料
    this.contractFlowService.clearTempData();
    console.log('✅ 已清空所有工作流程暫存資料');

    // 2. 初始化一個新的工作流程，使用空的查詢資料
    const emptyQueryData = this.createEmptyQueryData();
    this.contractFlowService.startWorkflow(emptyQueryData);
    console.log('✅ 已初始化新的工作流程');

    // 3. 導向 CRU 頁面
    this.router.navigate(['account/tls/tls13010cru']);
    this.messageService.infoBubble('開始新增契約資料');
  }


  private createEmptyQueryData(): any {
    return {
      talent_id: '', // 空的，表示新增
      apply_no: '',
      tlt_name: '',
      ven_uniform: '',
      VEN_Name: '',
      paper_type: '',
      bus_type: '',
      bus_class: '',
      bus_sclass: '',
      contract_subno: '',

      // 日期欄位使用預設值
      feedback_date: '',
      due_date: '',
      tlt_bdate: '',
      tlt_edate: '',
      contact_Date: '',
      tlt_contract_bdate: '',
      tlt_contract_edate: '',

      // 商務條件預設值
      tlt_kind: '',
      deco_type: '',
      tlt_term_type: '3', // 預設為一般抽成
      comm_comp_type: '2', // 預設為除稅
      edc_yn: '',
      tlt_ctype_mtotal: '',
      overall_status: '',

      // 其他欄位
      org_id: '',
      money_type: '',
      store_way: '',
      check_type: '',
      paytype: '',
      rece_yn: '',
      pos_yn: '',
      cash_yn: '',

      // 標記為新增模式
      _isNewContract: true
    };
  }

  /**
   * 編輯功能
   */
  override onEdit(rowData: ContractItem): void {
    this.contractFlowService.setViewMode(false);
    this.contractFlowService.startWorkflow(rowData);

    this.router.navigate(['account/tls/tls13010cru']); // 不帶參數
    this.messageService.infoBubble('進入編輯模式');
  }

  /**
   * 詳細檢視功能
   */
  override onDetail(rowData: ContractItem): void {
    // 🎯 使用 startViewWorkflow 會自動持久化檢視模式
    this.contractFlowService.startViewWorkflow(rowData);

    // 🎯 不帶任何 URL 參數，依賴持久化狀態
    this.router.navigate(['account/tls/tls13010cru']);

    this.messageService.infoBubble('進入檢視模式');
  }
  /**
   * 導航到指定步驟
   */
  private navigateToStep(step: WorkflowStep): void {
    switch (step) {
      case WorkflowStep.CONTRACT_INFO:
        this.router.navigate(['account/tls/tls13010cru']);
        break;
      case WorkflowStep.DEDUCTION:
        this.router.navigate(['account/tls/tls13010next1']);
        break;
      case WorkflowStep.COMMISSION:
        this.router.navigate(['account/tls/tls13010next2']);
        break;
      case WorkflowStep.CONDITION:
        this.router.navigate(['account/tls/tls13010next3']);
        break;
      default:
        this.router.navigate(['account/tls/tls13010cru']);
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
