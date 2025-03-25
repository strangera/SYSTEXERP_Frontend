import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { RegionCodeService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls13040',
  templateUrl: './tls13040.component.html',
  styleUrls: ['./tls13040.component.scss'],
})
export class TLS13040Component {
  ProgNo: string = '210013';
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
  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    counterCode: [],
    counterName: [],
    floorCode: [],
    regionCode: [],
    businessTypeCode: [],
    operationStatus: [],
    contractStartDate: [],
    contractEndDate: [],
    contractDeadlineStartDate: [],
    contractDeadlineEndDate: [],
    commissionTypeOptions: [],
    DeductionbigCategoryOptions: [],
    discountOptions: [],
    organizationOptions: [],
  });
  // 表格數據
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // 其他數據
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'name', visible: true },
    { field: 'age', header: 'age', visible: true },
    { field: 'email', header: 'email', visible: true },
    // 其他列
  ];
  // 下拉選單選項
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  DeductionbigCategoryOptions: any[] = [];
  discountOptions: any[] = [];
  organizationOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private regionCodeService: RegionCodeService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private DeductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private discountService: DiscountService,
    private organizationNumber: OrganizationNumberService,
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
    this.regionCodeService.getRegionCodes().subscribe((data) => {
      this.regionOptions = data;
    });
    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.DeductionbigCategoryService.getLocalDeductionCategories().subscribe((data) => {
      this.DeductionbigCategoryOptions = data;
    });
    this.commissionTypeService.getCommissionTypes().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
    this.discountService.getLocalDiscountOptions().subscribe((data) => {
      this.discountOptions = data;
    });
    this.organizationNumber.getOrganizationNumbers().subscribe((data) => {
      this.organizationOptions = data;
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
