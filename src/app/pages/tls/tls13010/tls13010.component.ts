import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// 基礎服務
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton, Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';

// 格式化函數
import {
  formatApproveStatus,
  formatCheckType,
  formatDecoType,
  formatMoneyType,
  formatOpenflagStatus,
  formatStoreWay,
  formatTltTermType
} from './tls13010.constants';

// 下拉選單服務
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from './tls13010.dropdown';

// 業務服務
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { ContractFlowService } from './services/contract-flow.service';

// API 服務

// 資料模型
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ExecSpFuncService } from '@service/utility/execSpFunc.service';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { AccordionModule } from 'primeng/accordion';
import { Button } from "primeng/button";
import { concatMap, finalize, from } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ContractItem } from './tls13010.model';

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
    InputTextRangeComponent,
    Button
  ],
})
export class TLS13010Component extends BasicQueryPageComponent<ContractItem> implements OnInit {

  public readonly addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ContractItem) => this.onApprove(rowData),
      disabled: (rowData: ContractItem) => rowData.source_type === '要約書' || rowData.approve_status !== '1'
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ContractItem) => this.onUnapprove(rowData),
      disabled: (rowData: ContractItem) => rowData.source_type === '要約書' || rowData.approve_status !== '2'
    },
    {
      label: '作廢',
      icon: 'pi pi-times-circle text-red-500',
      action: (rowData: ContractItem) => this.onVoid(rowData),
      disabled: (rowData: ContractItem) => rowData.source_type === '要約書' || this.isVoidDisabled(rowData)
    }
  ];

  // 表單定義
  queryForm = this.formBuilder.nonNullable.group({
    // 基本資訊
    apply_no: [, [Validators.maxLength(50)]],
    tlt_name: [, [Validators.maxLength(100)]],
    tlt_no: [, [Validators.maxLength(50)]],
    bus_typeList: [[]],
    ven_no: [, [Validators.maxLength(50)]],
    vendor_ven_no: [, [Validators.maxLength(16)]],
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
    approve_statusList: [[]],

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

  APPLY_STATUS_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.applyStatusOptions];

  constructor(
    public override router: Router,
    private contractFlowService: ContractFlowService,
    public tls13010DropdownService: TLS13010DropdownService,
    private apiService: TLS13010Service,
    private readonly ExecSpFunc: ExecSpFuncService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', '/tls/tls13010cru', this.queryForm, (form) => this.onSubmit(form));
    this.checkExistingWorkflow();
    this.initializeDropdownOptions();
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
   * 初始化所有下拉選單選項
   */
  private initializeDropdownOptions(): void {
    console.log('📍 TLS13010 查詢頁面：開始初始化下拉選單選項');

    // 初始化所有選項（包含 POS2013、洽談者、支付編號等）
    this.tls13010DropdownService.initialize().subscribe({
      next: (results) => {
        console.log('✅ TLS13010 查詢頁面：所有下拉選單載入完成');

        // 設定廠商統一編號選項
        this.pos2013Options = this.tls13010DropdownService.getPOS2013Options();
        console.log('  廠商統一編號:', this.pos2013Options.length, '個');
        console.log('  洽談者:', this.tls13010DropdownService.negotiatorOptions.length, '個');
        console.log('  支付編號:', this.tls13010DropdownService.payNoOptions.length, '個');
      },
      error: (error) => {
        console.error('❌ TLS13010 查詢頁面：下拉選單載入失敗:', error);
        this.pos2013Options = [];
      }
    });
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
    * 覆寫父類的 onCreate 方法，實作新增功能
    */
  override onCreate(): void {
    console.log(' 開始新增流程，清空所有暫存資料');

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

    // 根據 contract_type 決定導向哪個頁面
    if (rowData.contract_type === '要約書') {
      this.router.navigate(['account/tls/tls12040cru']);
      this.messageService.infoBubble('進入要約書編輯模式');
    } else {
      this.router.navigate(['account/tls/tls13010cru']);
      this.messageService.infoBubble('進入契約書編輯模式');
    }
  }

  /**
   * 詳細檢視功能
   */
  override onDetail(rowData: ContractItem): void {
    this.contractFlowService.startViewWorkflow(rowData);

    // 根據 contract_type 決定導向哪個頁面
    if (rowData.contract_type === '要約書') {
      this.router.navigate(['account/tls/tls12040cru']);
      this.messageService.infoBubble('進入要約書檢視模式');
    } else {
      this.router.navigate(['account/tls/tls13010cru']);
      this.messageService.infoBubble('進入契約書檢視模式');
    }
  }

  /**
   * 刪除功能
   */
  onDelete(data: ContractItem | ContractItem[]): void { }

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

  isPOS2013OptionsLoaded(): boolean {
    return this.pos2013Options.length > 0;
  }

  /**
  * 判斷合約是否可編輯
  */
  canEditContract = (rowData: ContractItem): boolean => {
    // 方法1: 使用後端傳來的 CanEdit 屬性
    if (rowData.CanEdit !== undefined) {
      return rowData.CanEdit;
    }

    // 方法2: 前端自行判斷 (備用方案)
    return rowData.approve_status === '1'; // 只有未審核狀態可編輯
  }

  /**
   * 編輯按鈕禁用條件
   */
  editDisabled = (rowData: ContractItem): boolean => {
    return !this.canEditContract(rowData);
  }


  /**
 * 判斷作廢按鈕是否應該被禁用
 */
  private isVoidDisabled(rowData: ContractItem): boolean {
    // 已作廢的不能再作廢
    if (rowData.approve_status === '3') {
      return true;
    }

    // 未審核的可以作廢
    if (rowData.approve_status === '1') {
      return false;
    }

    // 已審核的需要檢查契約是否已生效
    if (rowData.approve_status === '2') {
      const today = new Date();
      const contractStart = new Date(rowData.tlt_contract_bdate);
      // 契約已生效就不能作廢
      return contractStart < today;
    }

    return true; // 其他情況都禁用
  }

  /**
   * 審核功能
   */
  public onApprove(rowData: ContractItem): void {
    this.confirmationService.confirm({
      message: `確定要審核合約 ${rowData.apply_no} 嗎？`,
      accept: () => {
        // 調用審核 API
        this.apiService.approveTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (response: any) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('審核成功');
              this.onSubmit(this.queryForm); // 重新查詢更新狀態
            } else {
              this.messageService.errorBubble(`審核失敗: ${response.Message || '未知錯誤'}`);
            }
          },
          error: (err: any) => {
            console.error('審核失敗:', err);
            this.messageService.errorBubble('審核失敗，請檢查網路連線或聯繫管理員');
          }
        });
      },
      reject: () => {
        this.messageService.infoBubble('已取消審核');
      }
    });
  }

  /**
   * 反審核功能
   */
  public onUnapprove(rowData: ContractItem): void {
    this.confirmationService.confirm({
      message: `確定要反審核合約 ${rowData.apply_no} 嗎？`,
      accept: () => {
        // 調用反審核 API
        this.apiService.unapproveTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (response: any) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('反審核成功');
              this.onSubmit(this.queryForm); // 重新查詢更新狀態
            } else {
              this.messageService.errorBubble(`反審核失敗: ${response.Message || '未知錯誤'}`);
            }
          },
          error: (err: any) => {
            console.error('反審核失敗:', err);
            this.messageService.errorBubble('反審核失敗，請檢查網路連線或聯繫管理員');
          }
        });
      },
      reject: () => {
        this.messageService.infoBubble('已取消反審核');
      }
    });
  }

  /**
   * 作廢功能
   */
  public onVoid(rowData: ContractItem): void {
    // 先檢查是否可以作廢
    if (this.isVoidDisabled(rowData)) {
      if (rowData.approve_status === '3') {
        this.messageService.warnBubble('該合約已作廢');
      } else if (rowData.approve_status === '2') {
        this.messageService.warnBubble('合約已生效，無法作廢');
      }
      return;
    }

    this.confirmationService.confirm({
      message: `確定要作廢合約 ${rowData.apply_no} 嗎？作廢後無法恢復。`,
      accept: () => {
        // 調用作廢 API
        this.apiService.voidTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (response: any) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm); // 重新查詢更新狀態
            } else {
              this.messageService.errorBubble(`作廢失敗: ${response.Message || '未知錯誤'}`);
            }
          },
          error: (err: any) => {
            console.error('作廢失敗:', err);
            this.messageService.errorBubble('作廢失敗，請檢查網路連線或聯繫管理員');
          }
        });
      },
      reject: () => {
        this.messageService.infoBubble('已取消作廢');
      }
    });
  }

  btnLoading = false;
  onUpload() {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const userNo = this.authService.currentUserValue?.user_No;
    const itemsToUpload = this.selectedItems;

    if (!storeNo || !userNo || !itemsToUpload.length) {
      return;
    }

    this.btnLoading = true;

    from(itemsToUpload).pipe(
      concatMap((item) => {
        // 為每個選定的 item 建立三個不同的 params
        const paramsArray = [
          {
            SYS_StoreNo: storeNo,
            EXP_StoreNo: storeNo,
            EXP_Type: "TLTTALENT",
            EXP_DocNo: item.talent_id, // 假設你的資料結構中有 talent_id 欄位
            EXP_DataFlag: "S2P",
            EXP_Desc: ""
          },
          {
            SYS_StoreNo: storeNo,
            EXP_StoreNo: storeNo,
            EXP_Type: "TLTTALENT_CHARGEM",
            EXP_DocNo: item.talent_id,
            EXP_DataFlag: "S2P",
            EXP_Desc: ""
          },
          {
            SYS_StoreNo: storeNo,
            EXP_StoreNo: storeNo,
            EXP_Type: "TLTTALENT_CHARGED",
            EXP_DocNo: item.talent_id,
            EXP_DataFlag: "S2P",
            EXP_Desc: ""
          }
        ];

        // 使用 from 將陣列轉換為 Observable，然後用 concatMap 依序執行
        return from(paramsArray).pipe(
          concatMap(params => this.ExecSpFunc.ExecSpFunc(params))
        );
      }),
      finalize(() => this.btnLoading = false),
      untilDestroyed(this)
    ).subscribe({
      next: (response) => {
        if (response.ErrCode !== 0) {
          this.messageService.errorBubble(response.ErrMsg);
          return;
        }
        // 注意：這裡會收到多個 response，你可能需要調整處理邏輯
        // 例如收集所有 response 或者只在最後一個完成時執行清理動作
      },
      error: (error) => {
        // 處理錯誤情況
        console.error('Upload error:', error);
        this.messageService.errorBubble('上傳過程中發生錯誤');
      },
      complete: () => {
        // 所有請求完成後的處理
        this.selectedItems = [];
        this.onSubmit(this.queryForm);
      }
    });
  }
}
