import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

// Shared Components
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableComponent } from '@others/component/table/table.component';
import { AddButton, Column, createPaginationConfig } from '@others/component/table/table.model';

// Shared Services
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import {
  formatApproveStatus,
  formatDecoType,
  formatMoneyType,
  formatTltTermType,
  formatStoreWay,
  formatOpenflagStatus,
} from '@others/constants/business.constants';
import { Actions } from '@shared/service/permission-guard.service';
import { SharedDropdownService } from '@others/services/shared-dropdown.service';

// API Service
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';

// Models
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// i18n
import { TranslateModule } from '@ngx-translate/core';

/**
 * 查詢結果項目 — 對應後端 TLS13020Models.QueryTLS13020ListItem（TLTTALENT 全欄位）
 */
export interface ContractItem {
  // 主鍵 / 識別
  id: number;
  talent_id: string;
  apply_no: string;
  contract_no: string;
  contract_subno: number;
  tlt_no: string;
  tlt_shortname?: string;
  tlt_name: string;
  // 廠商
  ven_uniform: string;
  ven_no?: string;
  VEN_Name?: string;
  // 組織 / 分類
  org_id?: string;
  source_type?: string;
  paper_type?: string;
  bus_type?: string;
  bus_class?: string;
  bus_sclass?: string;
  // 日期（ISO 8601 string from backend DateTime）
  tlt_bdate?: string;
  tlt_edate?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
  feedback_date?: string;
  due_date?: string;
  contact_Date?: string;
  approved_date?: string;
  app_date?: string;
  crt_date?: string;
  upd_date?: string;
  // 聯絡人
  contact_USR_No?: string;
  contact_USR_Name?: string;
  contact_tel?: string;
  contact_fax?: string;
  contact_addr?: string;
  // 抽成 / 計算設定
  tlt_kind?: string;
  deco_type?: string;
  tlt_term_type?: string;
  comm_comp_type?: string;
  tlt_ctype_mtotal?: string;
  overall_status?: string;
  // 財務
  check_day?: number;
  base_rent?: number;
  deposit?: number;
  rent_ahead?: string;
  rent_period?: number;
  total_amt?: number;
  total_amt_vendor?: number;
  // 保證金
  open_deposit?: string;
  open_fees?: number;
  construct_deposit?: string;
  construct_fees?: number;
  expiration_deposit?: string;
  expiration_fees?: number;
  ticket_remarks?: string;
  // 付款 / 收款
  rece_yn?: string;
  pos_yn?: string;
  cash_yn?: string;
  comm_yn?: string;
  paytype?: string;
  money_type?: string;
  store_way?: string;
  check_type?: string;
  invoice_type?: string;
  vip_yn?: string;
  credit_card?: number;
  // 帳務 / 聯絡
  email?: string;
  invoice_email?: string;
  CHECK_TITLE?: string;
  store_tel?: string;
  bank_id?: string;
  vendor_acct_name?: string;
  vendor_acct_no?: string;
  // 水電瓦斯
  water_flag?: string;
  electric_flag?: string;
  gas_flag?: string;
  // 活動
  cap_saletype1?: string;
  cap_saletype2?: string;
  cap_saletype3?: string;
  cap_saletype4?: string;
  // 其他
  edc_yn?: string;
  machine_id?: string;
  tlt_openflag?: string;
  approve_status?: string;
  apply_type?: string;
  tlt_remark?: string;
  // 稽核
  approved_userno?: string;
  approved_user_name?: string;
  app_usr_no?: string;
  app_usr_name?: string;
  crt_usr_no?: string;
  crt_usr_name?: string;
  upd_usr_no?: string;
  upd_usr_name?: string;
  // 計算欄位
  rental_count?: number;
  CanEdit: boolean;
  CanVoid: boolean;
}

/**
 * TLS13020 查詢頁面組件
 * 專櫃契約書續約維護作業 - 查詢列表
 */
@Component({
  selector: 'app-tls13020-query',
  templateUrl: './query.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    CheckboxModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent
  ]
})
export class QueryComponent extends BasicQueryPageComponent<ContractItem> implements OnInit {

  // ========== 表格按鈕 ==========
  public readonly addButton: AddButton[] = [
    {
      label: '續約',
      icon: 'pi pi-copy text-blue-500',
      action: (rowData: ContractItem) => { this.onRenewal(rowData); },
      disabled: () => !this.hasPermission(Actions.Create)
    }
  ];

  // ========== 查詢表單 ==========
  queryForm = this.formBuilder.group({
    apply_no: [null as string | null],
    apply_typeList: [[] as string[]],
    bus_type: [null as string | null],
    tlt_no: [null as string | null],
    tlt_name: ['', [Validators.maxLength(50)]],
    ven_uniformList: [[] as string[]],
    location_no: [null as string | null],
    contract_subno_from: [null as number | null],
    contract_subno_to: [null as number | null],
    approve_statusList: [[] as string[]],
    area_no: [null as string | null],
    tlt_floor: [null as string | null],
    tlt_buildingList: [[] as string[]],
    contact_USR_No: [[] as string[]],
    org_id: [null as string | null],
    comm_comp_type: [[] as string[]],
    feedback_date_from: [null as Date | null],
    feedback_date_to: [null as Date | null],
    due_date_from: [null as Date | null],
    due_date_to: [null as Date | null],
    contact_Date_from: [null as Date | null],
    contact_Date_to: [null as Date | null],
    paper_typeList: [[] as string[]],
    tlt_bdate_start_from: [null as Date | null],
    tlt_bdate_start_to: [null as Date | null],
    tlt_edate_start_from: [null as Date | null],
    tlt_edate_start_to: [null as Date | null],
    tlt_contract_bdate_from: [null as Date | null],
    tlt_contract_bdate_to: [null as Date | null],
    tlt_contract_edate_from: [null as Date | null],
    tlt_contract_edate_to: [null as Date | null],
    tlt_kindList: [[] as string[]],
    deco_typeList: [[] as string[]],
    tlt_term_typeList: [[] as string[]],
    money_typeList: [[] as string[]],
    paytypeList: [[] as string[]],
    store_wayList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    rece_yn: [false],
    pos_yn: [false],
    cash_yn: [false],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  // ========== 表格資料 ==========
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [];
  totalRecords = 0;
  selectedItems: ContractItem[] = [];

  private readonly formatDate = (value: string): string => value ? new Date(value).toLocaleDateString() : '';

  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'ven_uniform', header: '廠商統編/名稱', visible: true, align: 'left', format: (value: string, _index?: number, rowData?: ContractItem) => [value, rowData?.VEN_Name].filter(Boolean).join(' / ') },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'feedback_date', header: '回函日期', visible: true, format: this.formatDate },
    { field: 'due_date', header: '回函截止日', visible: true, format: this.formatDate },
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'bus_type', header: '大分類名稱', visible: true, align: 'left', format: (value: string) => this.busTypeName(value) },
    { field: 'deco_type', header: '裝潢方式', visible: true, format: formatDecoType },
    { field: 'money_type', header: '結帳方式', visible: true, format: formatMoneyType },
    { field: 'tlt_term_type', header: '抽成別', visible: true, format: formatTltTermType },
    { field: 'store_way', header: '配合方式', visible: true, format: formatStoreWay },
    { field: 'contract_no', header: '合約種類', visible: true, format: () => '契約書' },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'tlt_openflag', header: '營運狀態', visible: true, format: formatOpenflagStatus },
    { field: 'tlt_contract_bdate', header: '營運起始日', visible: true, format: this.formatDate },
    { field: 'tlt_contract_edate', header: '營運截止日', visible: true, format: this.formatDate },
  ];

  // ========== 下拉選單選項 ==========
  industryCodeOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  buildingOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  businessTypeOptions: any[] = [];

  // 固定選項 (從共用服務取得)
  get decorationStyleOptions() { return this.sharedDropdownService.decorationOptions; }
  get checkoutOptions() { return this.sharedDropdownService.moneyTypeOptions; }
  get paymentOptions() { return this.sharedDropdownService.paytypeOptions; }
  get cooperationTypeOptions() { return this.sharedDropdownService.storeWayOptions; }
  readonly openFlagOptions = getSYS1000Options('tlt_openflag');
  get counterTypeOptions() { return this.sharedDropdownService.tltKindOptions; }
  get chargeTypeOptions() { return this.sharedDropdownService.tltTermTypeOptions; }
  get calculationMethodOptions() { return this.sharedDropdownService.commCompTypeOptions; }
  get approvalStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }
  get applyTypeOptions() { return this.sharedDropdownService.applyTypeOptions; }

  constructor(
    private apiService: TLS13010Service,
    public sharedDropdownService: SharedDropdownService,
    public override router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面，導航到精靈頁面
    this.initializePage('TLS13020', '/tls/tls13020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  // ========== 下拉選單載入 ==========
  private loadDropdownOptions(): void {
    // 載入大分類
    this.sharedDropdownService.getBustypeOptions().subscribe({
      next: (options) => this.industryCodeOptions = options,
      error: () => this.industryCodeOptions = []
    });

    // 載入廠商
    this.sharedDropdownService.getVendorOptions('1').subscribe({
      next: (options) => this.vendorUIDOptions = options,
      error: () => this.vendorUIDOptions = []
    });

    // 載入位置
    this.sharedDropdownService.getLocationOptions().subscribe({
      next: (options) => this.locationNumberOptions = options,
      error: () => this.locationNumberOptions = []
    });

    // 載入區域
    this.sharedDropdownService.getRegionOptions().subscribe({
      next: (options) => this.regionOptions = options,
      error: () => this.regionOptions = []
    });

    // 載入樓層
    this.sharedDropdownService.getFloorOptions().subscribe({
      next: (options) => this.floorOptions = options,
      error: () => this.floorOptions = []
    });

    // 載入館別
    this.sharedDropdownService.getBuildingOptions().subscribe({
      next: (options) => this.buildingOptions = options,
      error: () => this.buildingOptions = []
    });

    // 載入洽談者
    this.sharedDropdownService.getNegotiatorOptions().subscribe({
      next: (options) => this.negotiatorOptions = options,
      error: () => this.negotiatorOptions = []
    });

    // 載入組織
    this.sharedDropdownService.getOrgOptions().subscribe({
      next: (options) => this.organizationCodeOptions = options,
      error: () => this.organizationCodeOptions = []
    });

    // 載入營業型態
    this.sharedDropdownService.getPaperTypeOptions('T101').subscribe({
      next: (options) => this.businessTypeOptions = options,
      error: () => this.businessTypeOptions = []
    });
  }

  // ========== 查詢 ==========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.value;
      const queryRequest = {
        ...formValue,
        contract_subno_from: formValue.contract_subno_from ? String(formValue.contract_subno_from) : undefined,
        contract_subno_to: formValue.contract_subno_to ? String(formValue.contract_subno_to) : undefined,
        rece_yn: formValue.rece_yn ? 'Y' : undefined,
        pos_yn: formValue.pos_yn ? 'Y' : undefined,
        cash_yn: formValue.cash_yn ? 'Y' : undefined,
      };

      this.apiService.queryTLS13020(queryRequest).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, form.value);

            if (this.data.length === 0) {
              this.messageService.infoBubble('查詢無資料');
            }
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢失敗，請檢查網路連線');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  onSubmitQuery(form: FormGroup): void {
    this.onSubmit(form);
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  // ========== 導航（使用 BasicQueryPageComponent 標準模式）==========

  /**
   * 編輯 - 額外檢查合約是否可編輯
   */
  override onEdit(rowData: ContractItem): void {
    if (this.hasPermission(Actions.Edit) && this.canEditContract(rowData)) {
      this.navigateWithState(CRUDStatus.Edit, rowData);
    }
  }

  /**
   * 續約 - 先檢查是否有未審核版本，若有則提示並阻止進入
   */
  async onRenewal(rowData: ContractItem): Promise<void> {
    if (!this.hasPermission(Actions.Create)) return;

    try {
      const hasUnapproved = await firstValueFrom(this.apiService.checkUnapprovedVersion(rowData.tlt_no));
      if (hasUnapproved) {
        this.messageService.warnBubble(`此櫃號:${rowData.tlt_no} 尚有未審核合約版本，請先檢視未審核版本合約!!`);
        return;
      }
    } catch {
      // 檢查失敗不阻止進入，交由後端 submit 時再卡控
    }

    this.navigateWithState(CRUDStatus.Create, rowData);
  }

  /**
   * 點擊行
   */
  onRowClick(rowData: ContractItem): void {
    if (this.hasPermission(Actions.Query)) {
      this.navigateWithState(CRUDStatus.Read, rowData);
    }
  }

  onDetailClick(rowData: ContractItem): void {
    if (this.hasPermission(Actions.Query)) {
      this.navigateWithState(CRUDStatus.Read, rowData);
    }
  }

  // ========== 審核/反審核/作廢 ==========
  onApprove(rowData: ContractItem): void {
    if (rowData.approve_status !== '1') {
      this.messageService.warnBubble('只有未審核狀態的合約才能審核');
      return;
    }

    this.messageService.confirm({
      message: `確定要審核專櫃編號 ${rowData.apply_no} 嗎？`,
      header: '審核確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => this.performApprove(rowData),
      reject: () => this.messageService.infoBubble('已取消審核')
    });
  }

  private performApprove(rowData: ContractItem): void {
    this.messageService.blockUi();
    this.apiService.approveTLS13010({ talentId: rowData.talent_id }).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('審核成功');
          // 審核後刷新使用者資料權限
          this.apiService.refreshUserDataPermissions().subscribe({
            error: () => this.messageService.warnBubble('審核成功，但權限更新失敗。請重新登入以查看更新。')
          });
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(`審核失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err) => {
        this.messageService.errorBubble(err.error?.Message || '審核失敗');
      },
      complete: () => this.messageService.unblockUi()
    });
  }

  onUnapprove(rowData: ContractItem): void {
    if (rowData.approve_status !== '2') {
      this.messageService.warnBubble('只有已審核狀態的合約才能反審核');
      return;
    }

    this.messageService.confirm({
      message: `確定要反審核專櫃編號 ${rowData.apply_no} 嗎？`,
      header: '反審核確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => this.performUnapprove(rowData),
      reject: () => this.messageService.infoBubble('已取消反審核')
    });
  }

  private performUnapprove(rowData: ContractItem): void {
    this.messageService.blockUi();
    this.apiService.unapproveTLS13010({ talentId: rowData.talent_id }).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('反審核成功');
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(`反審核失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err) => {
        this.messageService.errorBubble(err.error?.Message || '反審核失敗');
      },
      complete: () => this.messageService.unblockUi()
    });
  }

  private isVoidDisabled(rowData: ContractItem): boolean {
    if (rowData.CanVoid !== undefined) {
      return !rowData.CanVoid;
    }
    return rowData.approve_status === '3';
  }

  onVoid(rowData: ContractItem): void {
    if (this.isVoidDisabled(rowData)) {
      if (rowData.approve_status === '3') {
        this.messageService.warnBubble('該合約已作廢');
      } else {
        this.messageService.warnBubble('合約已生效，無法作廢');
      }
      return;
    }

    this.messageService.confirm({
      message: `確定要作廢合約 ${rowData.apply_no} 嗎？作廢後無法恢復。`,
      accept: () => {
        this.apiService.voidTLS13010({ talentId: rowData.talent_id }).subscribe({
          next: (response: any) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('作廢成功');
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(`作廢失敗: ${response.Message || '未知錯誤'}`);
            }
          },
          error: () => {
            this.messageService.errorBubble('作廢失敗');
          }
        });
      },
      reject: () => this.messageService.infoBubble('已取消作廢')
    });
  }

  // ========== 輔助方法 ==========
  isRowSelectable(_rowData: ContractItem): boolean {
    return true;
  }

  editDisabled = (rowData: ContractItem): boolean => {
    return !this.canEditContract(rowData);
  };

  /**
   * 由已載入的大分類選項 (industryCodeOptions，label 格式 "代號 - 名稱") 取得大分類名稱
   */
  private busTypeName(code: string): string {
    if (!code) return '';
    const opt = this.industryCodeOptions.find(o => o.value === code);
    if (!opt?.label) return code;
    const idx = opt.label.indexOf(' - ');
    return idx >= 0 ? opt.label.substring(idx + 3) : opt.label;
  }

  canEditContract = (rowData: ContractItem): boolean => {
    if (rowData.CanEdit !== undefined) {
      return rowData.CanEdit;
    }
    return rowData.approve_status === '1';
  };
}
