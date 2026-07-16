import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
import { formatApproveStatus } from '@others/constants/business.constants';
import { Actions } from '@shared/service/permission-guard.service';
import { SharedDropdownService } from '@others/services/shared-dropdown.service';

// API Service
import { TLS12040Service } from '@service/api/tls/tls12040.service';

// Models
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// i18n
import { TranslateModule } from '@ngx-translate/core';

/**
 * 查詢結果項目
 */
export interface ContractItem {
  id: number;
  apply_no: string;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  approve_status: string;
  tlt_term_type: string;
  CanEdit: boolean;
  CanVoid: boolean;
  CanUnapprove: boolean;
}

/**
 * TLS12040-v2 查詢頁面組件
 * 專櫃要約書維護 - 查詢列表
 */
@Component({
  selector: 'app-tls12040-v2-query',
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
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ContractItem) => this.onApprove(rowData),
      disabled: (rowData: ContractItem) => rowData.approve_status !== '1' || !this.hasPermission(Actions.Audit)
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ContractItem) => this.onUnapprove(rowData),
      disabled: (rowData: ContractItem) => !rowData.CanUnapprove || !this.hasPermission(Actions.AntiAudit)
    },
    {
      label: '作廢',
      icon: 'pi pi-times-circle text-red-500',
      action: (rowData: ContractItem) => this.onVoid(rowData),
      disabled: (rowData: ContractItem) => this.isVoidDisabled(rowData) || !this.hasPermission(Actions.Invalidate)
    }
  ];

  // ========== 查詢表單 ==========
  queryForm = this.formBuilder.group({
    apply_no: [null as string | null],
    bus_type: [null as string | null],
    tlt_no: [null as string | null],
    tlt_name: ['', [Validators.maxLength(50)]],
    ven_uniformList: [[] as string[]],
    location_no: [null as string | null],
    contract_subno_from: [null as number | null],
    contract_subno_to: [null as number | null],
    approve_status: [null as string | null],
    area_no: [null as string | null],
    tlt_floor: [null as string | null],
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
    rece_yn: [false],
    pos_yn: [false],
    cash_yn: [false],
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }])
  });

  // ========== 表格資料 ==========
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [];
  totalRecords = 0;
  selectedItems: ContractItem[] = [];

  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus }
  ];

  // ========== 下拉選單選項 ==========
  industryCodeOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  businessTypeOptions: any[] = [];

  // 固定選項 (從共用服務取得)
  get decorationStyleOptions() { return this.sharedDropdownService.decorationOptions; }
  get checkoutOptions() { return this.sharedDropdownService.moneyTypeOptions; }
  get paymentOptions() { return this.sharedDropdownService.paytypeOptions; }
  get cooperationTypeOptions() { return this.sharedDropdownService.storeWayOptions; }
  get counterTypeOptions() { return this.sharedDropdownService.tltKindOptions; }
  get chargeTypeOptions() { return this.sharedDropdownService.tltTermTypeOptions; }
  get calculationMethodOptions() { return this.sharedDropdownService.commCompTypeOptions; }
  get approvalStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }

  constructor(
    private apiService: TLS12040Service,
    public sharedDropdownService: SharedDropdownService,
    public override router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    // 初始化頁面，導航到精靈頁面
    this.initializePage('TLS12040', '/tls/tls12040cru', this.queryForm, (form) => this.onSubmit(form));
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
        cash_yn: formValue.cash_yn ? 'Y' : undefined
      };

      this.apiService.queryTLS12040(queryRequest).subscribe({
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

  // /**
  //  * 續約
  //  */
  // onRenewal(rowData: ContractItem): void {
  //   if (this.hasPermission(Actions.Create)) {
  //     this.navigateToWizard('renewal', rowData);
  //   }
  // }

  /**
   * 點擊行
   */
  onRowClick(rowData: ContractItem): void {
    if (this.hasPermission(Actions.Edit) && this.canEditContract(rowData)) {
      this.navigateWithState(CRUDStatus.Edit, rowData);
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
    this.apiService.approveTLS12040({ apply_no: rowData.apply_no }).subscribe({
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
    if (!rowData.CanUnapprove) {
      if (rowData.approve_status !== '2') {
        this.messageService.warnBubble('只有已審核狀態的合約才能反審核');
      } else {
        this.messageService.warnBubble('已轉合約且合約已審核，請先對合約進行反審核');
      }
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
    this.apiService.unapproveTLS12040({ apply_no: rowData.apply_no }).subscribe({
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
        this.apiService.voidTLS12040({ apply_no: rowData.apply_no }).subscribe({
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

  canEditContract = (rowData: ContractItem): boolean => {
    if (rowData.CanEdit !== undefined) {
      return rowData.CanEdit;
    }
    return rowData.approve_status === '1';
  };
}
