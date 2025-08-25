import { CooperationMethodService } from './../../../service/basic/cooperation-method.service';
import { SettlementMethodService } from './../../../service/basic/settlement-method.service';
import { CommissionTypeService } from './../../../service/basic/commission-type.service';
import { CommissionCalculationService } from './../../../service/basic/commission-calculation.service';
import { DecorationStyleService } from './../../../service/basic/decoration-style.service';
import { CounterCategoryService } from './../../../service/basic/counter-category.service';
import { OperationStatusService } from './../../../service/basic/operation-status.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { LocationService } from './../../../service/basic/location.service';
import { BusinessTypeCodeService } from './../../../service/basic/business-type-code-service.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column } from '@shared/componentkit/table/table.model';

// 2.1.2.4 專櫃要約書維護
@Component({
  selector: 'app-tls12040',
  templateUrl: './tls12040.component.html',
  styleUrl: './tls12040.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, InputNumberRangeComponent, MultiSelectComponent, CalendarRangeComponent, CheckboxModule, TableComponent, TranslateModule]
})
export class TLS12040Component {
  ProgNo: string = '210006';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    apply_no: [, [Validators.maxLength(8)]], // 專櫃招募編號
    bus_type: [[] as number[]], // 大分類代號
    tlt_no: [, []], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(50)]], // 櫃位名稱
    ven_uniform: [[] as number[]], // 廠商統一編號
    location_no: [[] as number[]], // 位置編號
    contract_no: [, [Validators.max(12)]], // 版本編號
    endcontract_no: [, [Validators.max(12)]], // 版本編號
    approve_status: [[]], // 合約狀態
    area_no: [[] as number[]], // 區域
    tlt_floor: [[] as number[]], // 樓層
    contact_USR_No: [[] as number[]], // 洽談者
    org_id: [], // 組織代碼
    operatingStatus: [], // 營運狀況 //TODO:目前不知道是什麼(待修)
    comm_comp_type: [[]], // 抽成計算方式(1:含稅, 2:除稅)--畫面上只有2的選項
    feedback_date_from: [], // 回函日期
    feedback_date_to: [], // 回函日期
    due_date_from: [], // 回函截止日
    due_date_to: [], // 回函截止日
    contact_Date_from: [], // 洽談日期
    contact_Date_to: [], // 洽談日期
    paper_typeList: [[]], // 營業型態
    tlt_bdate_start_from: [], // 契約起始日
    tlt_bdate_end_to: [], // 契約起始日
    tlt_edate_start_from: [], // 契約截止日
    tlt_edate_end_to: [], // 契約截止日
    tlt_contract_bdate_from: [], // 營運起始日
    tlt_contract_bdate_to: [], // 營運起始日
    tlt_contract_edate_from: [], // 營運截止日
    tlt_contract_edate_to: [], // 營運截止日
    tlt_kindList: [[]], // 櫃別
    deco_typeList: [[]], // 裝潢方式
    tlt_term_typeList: [[]], // 抽成別
    money_typeList: [[]], // 結帳方式
    paytypeList: [[]], // 付款方式
    store_wayList: [[]], // 配合方式
    rece_yn: [false], // 是否開立業主發票
    pos_yn: [false], // 是否使用業主收銀機
    cash_yn: [false], // 是否為業主收現
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { recruitmentNumber: '00003584', brandCName: 'xx', vendorUID: '0000/停車管理', versionNumber: 1,
    //   contactor: 'A小姐', industryCode: '大分類代號', replyDate: '', replyEndDate: '2024-09-09',
    //   contractType: '意向書', contractStatus: '未審核',rentNumber: 1},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'apply_type', header: '合約狀態', visible: true },
    { field: 'tlt_openflag', header: '營運狀況', visible: true },
    { field: 'IDONTKNOWN', header: '回函狀態', visible: true },
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
    private RegionService: RegionService,
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
    this.RegionService.getRegionOptions().subscribe(data => {
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
    return true;
  }
  canAdd(): boolean {
    return true;
  }
  canEdit(): boolean {
    return true;
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
