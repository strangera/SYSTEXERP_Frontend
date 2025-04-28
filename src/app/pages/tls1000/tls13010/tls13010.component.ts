import { WhetherService } from './../../../service/basic/whether.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { LocationService } from '../../../service/basic/location.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { RegionCodeService } from '../../../service/basic/region-code.service';
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

const now = new Date();
const nowDate = new Date();
//專櫃契約書維護
@Component({
  selector: 'app-tls13010',
  templateUrl: './tls13010.component.html',
  styleUrl: './tls13010.component.scss',
})
export class TLS13010Component {
  ProgNo: string = '210010';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };
  // 查詢
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
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


  });
  // 表格
  data: any[] = [
    {
      recruitmentCode: 'R001',
      counterCode: 'C001',
      counterName: '專櫃A',
      vendorCode: 'V001',
      vendorName: '廠商A',
      versionCode: '1.0',
      replyDate: '2024-01-01',
      replyDeadline: '2024-02-01',
      contractStartDate: '2024-03-01',
      contractEndDate: '2025-02-28',
      operationStartDate: '2024-03-15',
      operationEndDate: '2025-02-28',
      businessTypeCode: 'B001',
      performanceMethod: '標準',
      settlementMethod: '每月結算',
      accountMethod: '月中對帳',
      drawMethod: '固定抽成',
      matchMethod: '長期合作',
      issueInvoice: '是',
      ownerReceipt: '否',
      ownerBank: '銀行A',
      contractType: '一年期',
      operationStatus: '營運中',
      source: '總部',
      leaseAmount: 100,
    },
    {
      recruitmentCode: 'R002',
      counterCode: 'C002',
      counterName: '專櫃B',
      vendorCode: 'V002',
      vendorName: '廠商B',
      versionCode: '1.1',
      replyDate: '2024-01-10',
      replyDeadline: '2024-02-10',
      contractStartDate: '2024-04-01',
      contractEndDate: '2025-03-31',
      operationStartDate: '2024-04-15',
      operationEndDate: '2025-03-31',
      businessTypeCode: 'B002',
      performanceMethod: '自訂',
      settlementMethod: '雙月結算',
      accountMethod: '季末對帳',
      drawMethod: '浮動抽成',
      matchMethod: '臨時合作',
      issueInvoice: '否',
      ownerReceipt: '是',
      ownerBank: '銀行B',
      contractType: '兩年期',
      operationStatus: '試營運',
      source: '分公司',
      leaseAmount: 200,
    },
    {
      recruitmentCode: 'R003',
      counterCode: 'C003',
      counterName: '專櫃C',
      vendorCode: 'V003',
      vendorName: '廠商C',
      versionCode: '1.2',
      replyDate: '2024-01-20',
      replyDeadline: '2024-02-20',
      contractStartDate: '2024-05-01',
      contractEndDate: '2025-04-30',
      operationStartDate: '2024-05-10',
      operationEndDate: '2025-04-30',
      businessTypeCode: 'B003',
      performanceMethod: '高級',
      settlementMethod: '每季結算',
      accountMethod: '年末對帳',
      drawMethod: '比例抽成',
      matchMethod: '短期合作',
      issueInvoice: '是',
      ownerReceipt: '是',
      ownerBank: '銀行C',
      contractType: '三年期',
      operationStatus: '已結束',
      source: '代理商',
      leaseAmount: 300,
    }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'recruitmentCode', header: '專櫃招募編號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '專櫃名稱', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'vendorName', header: '廠商名稱（廠商名稱）', visible: true },
    { field: 'versionCode', header: '版本編號', visible: true },
    { field: 'replyDate', header: '回函日期', visible: true },
    { field: 'replyDeadline', header: '回函截止日', visible: true },
    { field: 'contractStartDate', header: '契約起始日', visible: true },
    { field: 'contractEndDate', header: '契約截止日', visible: true },
    { field: 'operationStartDate', header: '營運起始日', visible: true },
    { field: 'operationEndDate', header: '營運截止日', visible: true },
    { field: 'businessTypeCode', header: '業種代號', visible: true },
    { field: 'performanceMethod', header: '裝潢方式', visible: true },
    { field: 'settlementMethod', header: '結帳方式', visible: true },
    { field: 'accountMethod', header: '對帳方式', visible: true },
    { field: 'drawMethod', header: '抽成別', visible: true },
    { field: 'matchMethod', header: '配合方式', visible: true },
    { field: 'issueInvoice', header: '開立業主發票', visible: true },
    { field: 'ownerReceipt', header: '使用業主收現', visible: true },
    { field: 'ownerBank', header: '業主收現銀行', visible: true },
    { field: 'contractType', header: '合約種類', visible: true },
    { field: 'operationStatus', header: '營運狀態', visible: true },
    { field: 'source', header: '來源處', visible: true },
    { field: 'leaseAmount', header: '承租數', visible: true },
  ];

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
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private vendorService: VendorService,
    private locationService: LocationService,
    private contractStatusService: ContractStatusService,
    private regionCodeService: RegionCodeService,
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
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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
    this.regionCodeService.getRegionCodes().subscribe((data) => {
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
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;

  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }
  onRowClick(data: any): void {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS1000/TLS13010CRU'], extras);
  }
  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS1000/TLS13010CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
          recruitmentCode: data.recruitmentCode  // 將專櫃招募編號傳遞過去
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS1000/TLS13010CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
