import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { WhetherService } from './../../../service/basic/whether.service';
import { FloorService } from './../../../service/basic/floor.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls13070',
  templateUrl: './tls13070.component.html',
  styleUrls: ['./tls13070.component.scss'],
})
export class TLS13070Component {
  ProgNo: string = '210016';
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
    recruitmentCode: [],
    businessTypeCode: [],
    counterCode: [],
    counterName: [],
    vendorCode: [],
    versionCodestart: [],
    versionCodeend: [],
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
    operationStartDate: [],
    operationEndDate: [],
    counterCategory: [],
    decorationMethod: [],
    commissionType: [],
    settlementMethod: [],
    paymentMethod: [],
    cooperationMethod: [],
    issueOwnerInvoice: [],
    useOwnerCashRegister: [],
    ownerCashCollection: [],
  });

  // 下拉選單選項
  businessTypeCodeOptions: any[] = [];
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  businessTypeOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  decorationMethodOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  whetherOptions: any[] = [];
  // 表格数据
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'name', visible: true },
    { field: 'age', header: 'age', visible: true },
    { field: 'email', header: 'email', visible: true },
    // 其他列
  ];

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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
