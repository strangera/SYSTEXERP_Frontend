import { WhetherService } from './../../../service/basic/whether.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
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
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';

// 資料模型：專櫃契約書維護項目
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
}

const now = new Date();
const nowDate = new Date();

//專櫃契約書維護
@Component({
  selector: 'app-tls13010',
  templateUrl: './tls13010.component.html',
  styleUrl: './tls13010.component.scss',
})
export class TLS13010Component extends BasicQueryPageComponent<ContractItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    recruitmentCode: [, [Validators.maxLength(8)]],
    businessTypeCode: [],
    counterCode: [, [Validators.maxLength(6)]],
    counterName: [, [Validators.maxLength(50)]],
    vendorCode: [],
    locationCode: [],
    startserial: [, [Validators.maxLength(8)]],
    endserial: [, [Validators.maxLength(8)]],
    contractStatus: [],
    regionCode: [],
    floorCode: [],
    negotiator: [],
    organizationCode: [],
    operationStatus: [],
    commissionCalculation: [],
    responseStartDate: [],
    responseEndDate: [],
    responseDeadlineStartDate: [],
    responseDeadlineEndDate: [],
    negotiationStartDate: [],
    negotiationEndDate: [],
    businessType: [],
    contractStartDate: [],
    contractEndDate: [],
    contractDeadlineStartDate: [],
    contractDeadlineEndDate: [],
    operationStartDate: [],
    operationEndDate: [],
    operationDeadlineStartDate: [],
    operationDeadlineEndDate: [],
    counterCategory: [],
    decorationMethod: [],
    commissionType: [],
    settlementMethod: [],
    paymentMethod: [],
    cooperationMethod: [],
    issueOwnerInvoice: [],
    useOwnerCashRegister: [],
    ownerCashCollection: [],
    whetherOptions: [],
    businessTypeCodeOptions: [],
    isMeterReadOption: [],
    isGuaranteedByNoteOption: [],
    isTestOption: [],
    // 使用 createPaginationConfig 建立分頁配置
    ...createPaginationConfig([{ field: 'talent_id', order: 1 }])
  });

  // 表格資料
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [...this.data];

  // 假資料 - 保留作為開發時的備用資料
  counterCodeOptions: any[] = [
    { value: 'C001', label: 'C001' },
  ];

  isMeterReadOptions: any[] = [
    { value: '1', label: '水表' },
    { value: '2', label: '電表' },
    { value: '3', label: '瓦斯表' },
  ];

  isGuaranteedByNoteOptions: any[] = [
    { value: '1', label: '準時開業' },
    { value: '2', label: '施工保證' },
    { value: '3', label: '契約屆滿保證票' },
  ];

  isTestOptions: any[] = [
    { value: '1', label: '現金' },
    { value: '2', label: '支票' },
    { value: '3', label: '履約保證金' },
  ];

  // 表格欄位配置 - 根據 API 回傳的欄位調整
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'feedback_date', header: '回函日期', visible: true },
    { field: 'due_date', header: '回函截止日', visible: true },
    { field: 'tlt_contract_bdate', header: '契約起始日', visible: true, format: (rowData: any) => formatDate(rowData) },
    { field: 'tlt_contract_edate', header: '契約截止日', visible: true },
    { field: 'tlt_bdate', header: '營運起始日', visible: true },
    { field: 'tlt_edate', header: '營運截止日', visible: true },
    { field: 'bus_type', header: '大分類代號', visible: true, },
    { field: 'deco_type', header: '裝潢方式', visible: true },
    { field: 'money_type', header: '結帳方式', visible: true },
    { field: 'check_type', header: '對帳方式', visible: true },
    { field: 'comm_comp_type', header: '抽成別', visible: true },
    { field: 'tlt_term_type', header: '配合方式', visible: true },
    { field: 'rece_yn', header: '開立業主發票', visible: true },
    { field: 'pos_yn', header: '使用業主收現', visible: true },
    { field: 'cash_yn', header: '業主收現銀行', visible: true },
    { field: 'tlt_kind', header: '合約種類', visible: true },
    { field: 'overall_status', header: '營運狀態', visible: true },
    { field: 'org_id', header: '來源處', visible: true },
    { field: 'total_amt', header: '承租數', visible: true },
  ];

  totalRecords: number = 0;
  selectedItems: ContractItem[] = [];

  // 下拉選單選項
  businessTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  businessType: any[] = [];
  counterCategoryOptions: any[] = [];
  decorationMethodOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  issueOwnerInvoiceOptions: any[] = [];
  useOwnerCashRegisterOptions: any[] = [];
  ownerCashCollectionOptions: any[] = [];
  whetherOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];

  constructor(
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
    private apiService: TLS13010Service, // 注入 API 服務
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 使用 BasicQueryPageComponent 的 initializePage 方法
    this.initializePage('TLS13010', '/TLS/TLS13010CRU', this.queryForm, (form) => this.onSubmit(form));

    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入所有下拉選單資料
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });

    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });

    this.locationService.getLocations().subscribe((data) => {
      this.locationOptions = data;
    });

    this.contractStatusService.getContractStatuses().subscribe((data) => {
      this.contractStatusOptions = data;
    });

    this.RegionService.getRegionOptions().subscribe((data) => {
      this.regionOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    this.negotiatorService.getUserCode().subscribe((data) => {
      this.negotiatorOptions = data;
    });

    this.organizationService.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data;
    });

    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });

    this.commissionCalculationService.getCommissionCalculations().subscribe((data) => {
      this.commissionCalculationOptions = data;
    });

    this.counterCategoryService.getCounterCategories().subscribe((data) => {
      this.counterCategoryOptions = data;
    });

    this.decorationMethodService.getDecorationMethods().subscribe((data) => {
      this.decorationMethodOptions = data;
    });

    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });

    this.settlementMethodService.getSettlementMethods().subscribe((data) => {
      this.settlementMethodOptions = data;
    });

    this.paymentMethodService.getPaymentMethods().subscribe((data) => {
      this.paymentMethodOptions = data;
    });

    this.cooperationMethodService.getCooperationMethods().subscribe((data) => {
      this.cooperationMethodOptions = data;
    });

    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.whetherOptions = data;
    });

    this.businessTypeService.getBusinessTypes().subscribe((data) => {
      this.businessTypeOptions = data;
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  // 主要的查詢方法 - 參考 SYSB800 的實作
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
            } else {
              this.messageService.successBubble(`查詢成功，共 ${this.data.length} 筆資料`);
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

  onSubmitQuery(frm: FormGroup): void {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset();  // 重置表單
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.selectedItems = [];
  }

  // 刪除功能 - 參考 SYSB800 的實作
  onDelete(data: ContractItem | ContractItem[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      this.messageService.warnBubble('沒有選中的項目');
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

    // 這裡需要確認實際的刪除 API，可能需要調整
    // 暫時使用 deleteTLS11020，實際應該要有對應的 deleteTLS13010
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

  // 可選：判斷資料列是否可選取（如果需要的話）
  isRowSelectable(rowData: ContractItem): boolean {
    // 根據業務需求決定哪些資料列可以被選取
    // 例如：只有特定狀態的合約可以被選取
    return true; // 預設全部可選
  }
}
