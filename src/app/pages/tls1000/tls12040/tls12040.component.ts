import { CooperationMethodService } from './../../../service/basic/cooperation-method.service';
import { SettlementMethodService } from './../../../service/basic/settlement-method.service';
import { CommissionTypeService } from './../../../service/basic/commission-type.service';
import { CommissionCalculationService } from './../../../service/basic/commission-calculation.service';
import { DecorationStyleService } from './../../../service/basic/decoration-style.service';
import { CounterCategoryService } from './../../../service/basic/counter-category.service';
import { OperationStatusService } from './../../../service/basic/operation-status.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { LocationService } from './../../../service/basic/location.service';
import { BusinessTypeCodeService } from './../../../service/basic/business-type-code-service.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';

// 2.1.2.4 專櫃要約書維護
@Component({
  selector: 'app-tls12040',
  templateUrl: './tls12040.component.html',
  styleUrl: './tls12040.component.scss'
})
export class TLS12040Component {
  ProgNo: string = '210006';
  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    recruitmentNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 專櫃招募編號
    industryCode: [[] as number[]], // 業種代號
    counterID: [, [this.validationService.numberValidator]], // 專櫃編號
    counterName: ['', [Validators.maxLength(50)]], // 專櫃名稱
    vendorUID: [[] as number[]], // 廠商統一編號
    locationNumber: [[] as number[]], // 位置編號
    startVersionNumber: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 版本編號
    endVersionNumber: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 版本編號
    contractStatus: [[] as number[]], // 合約狀態
    region: [[] as number[]], // 區域
    floor: [[] as number[]], // 樓層
    negotiator: [[] as number[]], // 洽談者
    organizationCode: [], // 組織代碼
    operatingStatus: [], // 營運狀況
    calculationMethod: [[] as number[]], // 抽成額計算方式
    replyStartDateFrom: [], // 回函日期
    replyStartDateTo: [], // 回函日期
    replyEndDateFrom: [], // 回函截止日
    replyEndDateTo: [], // 回函截止日
    negotiationDateFrom: [], // 洽談日期
    negotiationDateTo: [], // 洽談日期
    businessType: [[] as number[]], // 營業型態
    contractStartDateFrom: [], // 契約起始日
    contractStartDateTo: [], // 契約起始日
    contractEndDateFrom: [], // 契約截止日
    contractEndDateTo: [], // 契約截止日
    operationStartDateFrom: [], // 營運起始日
    operationStartDateTo: [], // 營運起始日
    operationEndDateFrom: [], // 營運截止日
    operationEndDateTo: [], // 營運截止日
    counterType: [[] as number[]], // 櫃別
    decorationStyle: [[] as number[]], // 裝潢方式
    chargeType: [[] as number[]], // 抽成別
    checkout: [[] as number[]], // 結帳方式
    payment: [[] as number[]], // 付款方式
    cooerationType: [[] as number[]], // 配合方式
    venderInvoice: [,], // 是否開立業主發票
    venderRegister: [,], // 是否使用業主收銀機
    venderCash: [,], // 是否為業主收現
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { recruitmentNumber: '00003584', brandCName: 'xx', vendorUID: '0000/停車管理', versionNumber: 1,
    //   contactor: 'A小姐', industryCode: '業種代號', replyDate: '', replyEndDate: '2024-09-09',
    //   contractType: '意向書', contractStatus: '未審核',rentNumber: 1},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'recruitmentNumber', header: '專櫃招募編號', visible: true },
    { field: 'brandCName', header: '專櫃編號', visible: true },
    { field: 'vendorUID', header: '專櫃名稱', visible: true },
    { field: 'versionNumber', header: '合約狀態', visible: true },
    { field: 'contactor', header: '營運狀況', visible: true },
    { field: 'industryCode', header: '回函狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  vendorUIDOptions: any[] = [];
  negotiatorOptions: any[] = [];
  industryCodeOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  approvalStatusOptions: any[] = [];
  businessTypeOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  operatingStatusOptions: any[] = [];
  calculationMethodOptions: any[] = [];
  counterTypeOptions: any[] = [];
  decorationStyleOptions: any[] = [];
  chargeTypeOptions: any[] = [];
  checkoutOptions: any[] = [];
  paymentOptions: any[] = [];
  cooerationTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private locationService: LocationService,
    private regionCodeService: RegionCodeService,
    private floorService: FloorService,
    private contractStatusService: ContractStatusService,
    private businessTypeService: BusinessTypeService,
    private organizationNumberService: OrganizationNumberService,
    private operationStatusService: OperationStatusService,
    private counterCategoryService: CounterCategoryService,
    private decorationStyleService: DecorationStyleService,
    private commissionCalculationService: CommissionCalculationService,
    private commissionTypeService: CommissionTypeService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethod2Service: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.negotiatorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locationNumberOptions = data;
    });
    //
    this.regionCodeService.getRegionCodes().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.operationStatusService.getOperationStatuses().subscribe(data => {
      this.operatingStatusOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.contractStatusService.getContractStatuses().subscribe(data => {
      this.approvalStatusOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationCodeOptions = data;
    });
    //
    this.businessTypeService.getBusinessTypes().subscribe(data => {
      this.businessTypeOptions = data;

      // 全選填入
      // let allValues = this.businessTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   businessType: allValues
      // });
    });
    //
    this.counterCategoryService.getCounterCategories().subscribe(data => {
      this.counterTypeOptions = data;

      // 全選填入
      // let allValues = this.counterTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   counterType: allValues
      // });
    });
    //
    this.decorationStyleService.getSystemTypes().subscribe(data => {
      this.decorationStyleOptions = data;

      // 全選填入
      // let allValues = this.decorationStyleOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   decorationStyle: allValues
      // });
    });
    //
    this.commissionCalculationService.getCommissionCalculations().subscribe(data => {
      this.calculationMethodOptions = data;

      // 全選填入
      // let allValues = this.calculationMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   calculationMethod: allValues
      // });
    });
    //
    this.commissionTypeService.getCommissionTypes().subscribe(data => {
      this.chargeTypeOptions = data;

      // 全選填入
      // let allValues = this.chargeTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   chargeType: allValues
      // });
    });
    //
    this.settlementMethodService.getSettlementMethods().subscribe(data => {
      this.checkoutOptions = data;

      // 全選填入
      // let allValues = this.checkoutOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   checkout: allValues
      // });
    });
    //
    this.paymentMethod2Service.getPaymentMethods().subscribe(data => {
      this.paymentOptions = data;

      // 全選填入
      // let allValues = this.paymentOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   payment: allValues
      // });
    });
    //
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.cooerationTypeOptions = data;

      // 全選填入
      // let allValues = this.cooerationTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   cooerationType: allValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }
  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS1000/TLS12040CRU'], extras);
  }
}
