/**
 * TLS13010-V2 查詢組件 (Step 0)
 *
 * 職責：
 * - 查詢條件輸入
 * - 顯示合約列表
 * - 導航到編輯/檢視頁面
 */
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// 基礎組件
import {
  AddButton,
  Column,
  createPaginationConfig,
  formatDate,
  formatYN
} from '@others/component/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Actions } from '@shared/service/permission-guard.service';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

// 共用組件
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';

// V2 服務與類型
import { CommissionType, CommissionTypeLabels } from '../../core/constants';
import { ContractItem } from '../../core/models/contract';

// API 服務
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS13010DropdownService, TLS13010_DROPDOWN_OPTIONS } from '@pages/tls/shared/constants/tls13010.dropdown';
import { EarlyTerminationPreview, TLS13010Service } from '@service/api/tls/tls13010.service';
import { ExecSpFuncService } from '@service/utility/execSpFunc.service';
import { concatMap, finalize, from } from 'rxjs';

// 格式化函數
import {
  formatApproveStatus,
  formatCheckType,
  formatDecoType,
  formatMoneyType,
  formatOpenflagStatus,
  formatStoreWay
} from '@pages/tls/shared/constants/tls13010.constants';

@Component({
  selector: 'app-tls13010v2-query',
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss',
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
    CalendarComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    InputTextRangeComponent,
    Button,
    TooltipModule,
    DialogModule,
    DatePipe,
    TableModule
  ]
})
export class QueryComponent extends BasicQueryPageComponent<ContractItem> implements OnInit {

  // ========== 表格操作按鈕 ==========
  public readonly addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ContractItem) => this.onApprove(rowData),
      disabled: (rowData: ContractItem) =>
        rowData.source_type === '要約書' ||
        rowData.approve_status !== '1' ||
        !this.hasPermission(Actions.Audit)
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ContractItem) => this.onUnapprove(rowData),
      disabled: (rowData: ContractItem) =>
        rowData.source_type === '要約書' ||
        rowData.approve_status !== '2' ||
        !this.hasPermission(Actions.AntiAudit) ||
        this.isUnApproveBlocked(rowData)
    },

    {
      label: '作廢',
      icon: 'pi pi-times-circle text-red-500',
      action: (rowData: ContractItem) => this.onVoid(rowData),
      disabled: (rowData: ContractItem) =>
        rowData.source_type === '要約書' ||
        this.isVoidDisabled(rowData) ||
        !this.hasPermission(Actions.Invalidate)
    },
    {
      label: '提前撤櫃',
      icon: 'pi pi-calendar-times text-purple-500',
      action: (rowData: ContractItem) => this.onEarlyTermination(rowData),
      disabled: (rowData: ContractItem) =>
        rowData.source_type === '要約書' ||
        rowData.approve_status !== '2' ||
        this.isContractExpired(rowData)
    }
  ];

  // ========== 提前撤櫃 Dialog ==========
  earlyTerminationDialogVisible = false;
  earlyTerminationRow: ContractItem | null = null;
  earlyTerminationDateControl = new FormControl<Date | null>(null, Validators.required);
  earlyTerminationPreview: EarlyTerminationPreview | null = null;
  previewLoading = false;


  // ========== 表單定義 ==========
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
    tlt_bdate_start_to: [],
    tlt_edate_start_from: [],
    tlt_edate_start_to: [],

    // 合約日期範圍
    tlt_contract_bdate_from: [],
    tlt_contract_bdate_to: [],
    tlt_contract_edate_from: [],
    tlt_contract_edate_to: [],

    // 營運資訊
    tlt_openflagList: [[]],
    org_idList: [[]],

    // 財務與其他資訊
    comm_comp_type: [['2']],
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

    // 版次區間
    contract_subno_from: [],
    contract_subno_to: [],
    total_amt_unit: [''],
    total_amt_vendor_unit: [''],
    approve_statusList: [[]],

    // 分頁配置
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }])
  });

  // ========== 表格資料 ==========
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [...this.data];
  totalRecords = 0;
  selectedItems: ContractItem[] = [];

  // ========== 表格欄位配置 ==========
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'feedback_date', header: '回函日期', visible: true, format: formatDate },
    { field: 'due_date', header: '回函截止日', visible: true, format: formatDate },
    { field: 'tlt_bdate', header: '契約起始日', visible: true, format: formatDate },
    { field: 'tlt_edate', header: '契約截止日', visible: true, format: formatDate },
    { field: 'tlt_contract_bdate', header: '營運起始日', visible: true, format: formatDate },
    { field: 'tlt_contract_edate', header: '營運截止日', visible: true, format: formatDate },
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'deco_type', header: '裝潢方式', visible: true, format: formatDecoType },
    { field: 'money_type', header: '結帳方式', visible: true, format: formatMoneyType },
    { field: 'check_type', header: '對帳方式', visible: true, format: formatCheckType },
    { field: 'tlt_term_type', header: '抽成別', visible: true, format: this.formatCommissionType.bind(this) },
    { field: 'store_way', header: '配合方式', visible: true, format: formatStoreWay },
    { field: 'rece_yn', header: '開立業主發票', visible: true, format: formatYN },
    { field: 'pos_yn', header: '使用業主收現', visible: true, format: formatYN },
    { field: 'cash_yn', header: '業主收現銀行', visible: true, format: formatYN },
    { field: 'contract_type', header: '合約種類', visible: true },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'source_type', header: '來源處', visible: true },
    { field: 'rental_count', header: '承租數', visible: true },
    { field: 'tlt_openflag', header: '營運狀態', visible: true, format: formatOpenflagStatus }
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
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltTermTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
  pos2013Options: any[] = [];
  MONEY_TYPE_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  PAYTYPE_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  STORE_WAY_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  APPROVE_STATUS_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions];
  APPLY_STATUS_OPTIONS = [...TLS13010_DROPDOWN_OPTIONS.applyStatusOptions];

  // ========== 下傳按鈕 ==========
  btnLoading = false;

  constructor(
    public override router: Router,
    public dropdownService: TLS13010DropdownService,
    private apiService: TLS13010Service,
    private readonly ExecSpFunc: ExecSpFuncService
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面 - 使用 V2 精靈路由
    this.initializePage('TLS13010', '/tls/tls13010cru', this.queryForm, (form) => this.onSubmit(form));
    this.initializeDropdowns();
  }

  // ========== 下拉選單初始化 ==========
  private initializeDropdowns(): void {
    this.dropdownService.initialize().subscribe({
      next: () => {
        this.pos2013Options = this.dropdownService.getPOS2013Options();
      },
      error: (err) => {
        console.error('下拉選單載入失敗:', err);
        this.pos2013Options = [];
      }
    });
  }

  // ========== 查詢處理 ==========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.apiService.queryTLS13010(form.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, form.value);

            if (this.data.length === 0) {
              this.messageService.infoBubble('查詢無資料');
            }
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
        },
        error: (err) => {
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

  // ========== 新增功能 ==========
  override onCreate(): void {
    // 導航到精靈頁面 (新增模式)
    this.router.navigate(['account/tls/tls13010cru'], {
      state: { mode: 'create' }
    });
    this.messageService.infoBubble('開始新增契約資料');
  }

  // ========== 編輯功能 ==========
  onView(rowData: ContractItem): void {
    this.startEditWorkflow(rowData, true);
  }

  override onEdit(rowData: ContractItem): void {
    this.startEditWorkflow(rowData, false);
  }

  private startEditWorkflow(rowData: ContractItem, isViewMode: boolean): void {
    // 要約書 → TLS12040-v2
    if (rowData.contract_type === '要約書') {
      this.router.navigate(['account/tls/tls12040cru'], {
        state: {
          crudstatus: isViewMode ? CRUDStatus.Read : CRUDStatus.Edit,
          rowdata: rowData
        }
      });
      this.messageService.infoBubble(isViewMode ? '進入要約書檢視模式' : '進入要約書編輯模式');
      return;
    }

    // 契約書 → TLS13010-v2
    this.router.navigate(['account/tls/tls13010cru'], {
      state: {
        mode: isViewMode ? 'view' : 'edit',
        data: {
          talent_id: rowData.talent_id,
          apply_no: rowData.apply_no,
          tlt_name: rowData.tlt_name,
          tlt_no: rowData.tlt_no
        }
      }
    });
  }

  // ========== 刪除功能 ==========
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete(_data: ContractItem | ContractItem[]): void {
    // 暫不實作刪除功能
  }

  // ========== 審核功能 ==========
  onApprove(rowData: ContractItem): void {
    this.messageService.confirm({
      message: `確定要審核 ${rowData.tlt_no} ${rowData.tlt_name} 嗎？`,
      accept: () => {
        this.apiService.approveTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (res: any) => {
            if (res.Status === '0000') {
              this.messageService.successBubble('審核成功');
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`審核失敗: ${res.Message}`);
            }
          },
          error: () => this.messageService.errorBubble('審核失敗')
        });
      }
    });
  }

  onUnapprove(rowData: ContractItem): void {
    if (rowData.approve_status !== '2') {
      this.messageService.warnBubble('只有已審核狀態的合約才能反審核');
      return;
    }

    this.messageService.confirm({
      message: `確定要反審核合約 ${rowData.apply_no} 嗎？`,
      accept: () => {
        this.apiService.unapproveTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (res: any) => {
            if (res.Status === '0000') {
              this.messageService.successBubble('反審核成功');
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`反審核失敗: ${res.Message}`);
            }
          },
          error: (err: any) => this.messageService.errorBubble(err?.error?.Message || '反審核失敗')
        });
      }
    });
  }

  onVoid(rowData: ContractItem): void {
    // 先檢查是否可以作廢
    if (this.isVoidDisabled(rowData)) {
      if (rowData.approve_status === '3') {
        this.messageService.warnBubble('該合約已作廢');
      } else if (rowData.approve_status === '2') {
        this.messageService.warnBubble('合約已生效，無法作廢');
      }
      return;
    }

    this.messageService.confirm({
      message: `確定要作廢合約 ${rowData.apply_no} 嗎？作廢後無法恢復。`,
      accept: () => {
        this.apiService.voidTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (res: any) => {
            if (res.Status === '0000') {
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`作廢失敗: ${res.Message}`);
            }
          },
          error: () => this.messageService.errorBubble('作廢失敗')
        });
      }
    });
  }

  // ========== 提前撤櫃功能 ==========
  earlyTerminationMinDate: Date = new Date();
  earlyTerminationMaxDate: Date | null = null;

  onEarlyTermination(rowData: ContractItem): void {
    this.earlyTerminationRow = rowData;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    this.earlyTerminationMinDate = tomorrow;
    if (rowData.tlt_edate) {
      const contractEnd = new Date(rowData.tlt_edate);
      contractEnd.setDate(contractEnd.getDate() - 1);
      this.earlyTerminationMaxDate = contractEnd;
    } else {
      this.earlyTerminationMaxDate = null;
    }
    this.earlyTerminationDateControl.setValue(null);
    this.earlyTerminationPreview = null;
    this.earlyTerminationDialogVisible = true;
  }

  private formatSelectedDate(): string {
    const date = this.earlyTerminationDateControl.value!;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  previewEarlyTermination(): void {
    if (!this.earlyTerminationRow || !this.earlyTerminationDateControl.value) {
      this.earlyTerminationDateControl.markAsTouched();
      return;
    }
    this.previewLoading = true;
    this.earlyTerminationPreview = null;
    this.apiService.earlyTerminationPreviewTLS13010({
      talentId: this.earlyTerminationRow.talent_id,
      tlt_contract_edate: this.formatSelectedDate()
    }).subscribe({
      next: (res: any) => {
        this.previewLoading = false;
        if (res.Status === '0000') {
          this.earlyTerminationPreview = res.Data;
        } else {
          this.messageService.errorBubble(`預覽失敗: ${res.Data?.Message || '請聯繫系統管理員'}`);
        }
      },
      error: () => {
        this.previewLoading = false;
        this.messageService.errorBubble('預覽失敗，請檢查網路連線');
      }
    });
  }

  confirmEarlyTermination(): void {
    if (!this.earlyTerminationRow || !this.earlyTerminationDateControl.value) return;
    this.messageService.blockUi();
    this.apiService.earlyTerminationTLS13010({
      talentId: this.earlyTerminationRow.talent_id,
      tlt_contract_edate: this.formatSelectedDate()
    }).subscribe({
      next: (res: any) => {
        if (res.Status === '0000') {
          this.messageService.successBubble('提前撤櫃成功');
          this.earlyTerminationDialogVisible = false;
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(`提前撤櫃失敗: ${res.Data?.Message || '請聯繫系統管理員'}`);
        }
      },
      complete: () => this.messageService.unblockUi()
    });
  }

  // ========== 輔助方法 ==========
  private isContractExpired(rowData: ContractItem): boolean {
    if (!rowData.tlt_edate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(rowData.tlt_edate) < today;
  }

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
   * 判斷資料列是否可選取
   */
  isRowSelectable = (rowData: ContractItem): boolean => {
    // 要約書不可選取（下傳僅支援契約書）
    return rowData.source_type !== '要約書';
  };

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
  };

  /**
   * 編輯按鈕禁用條件
   */
  editDisabled = (rowData: ContractItem): boolean => {
    return !this.canEditContract(rowData);
  };

  /**
   * 檢查是否有下傳權限
   */
  hasDownloadPermission(): boolean {
    return this.hasPermission(Actions.Download);
  }

  /**
   * 下傳功能
   */
  onUpload(): void {
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
            EXP_DocNo: item.talent_id,
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
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.messageService.errorBubble('上傳過程中發生錯誤');
      },
      complete: () => {
        this.messageService.successBubble('下傳成功');
        this.selectedItems = [];
        this.onSubmit(this.queryForm);
      }
    });
  }

  /**
   * 使用 V2 枚舉格式化抽成類型
   */
  private formatCommissionType(value: string): string {
    return CommissionTypeLabels[value as CommissionType] || value || '';
  }

  // ========== 反審核月份卡控 ==========
  /**
   * 撤櫃(tlt_openflag='9')超過 撤櫃月+1 的月底即封鎖反審核
   */
  isUnApproveBlocked(rowData: ContractItem): boolean {
    if (rowData.tlt_openflag !== '0') return false; // '0' = 已撤櫃
    if (!rowData.tlt_contract_edate) return false;
    const withdrawalDate = new Date(rowData.tlt_contract_edate);
    let cutoffMonth = withdrawalDate.getMonth() + 2;
    let cutoffYear = withdrawalDate.getFullYear();
    if (cutoffMonth >= 12) { cutoffYear++; cutoffMonth -= 12; }
    const today = new Date();
    if (today.getFullYear() > cutoffYear) return true;
    if (today.getFullYear() === cutoffYear && today.getMonth() >= cutoffMonth) return true;
    return false;
  }

}
