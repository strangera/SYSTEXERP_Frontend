import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';  // Updated this service
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

@Component({
  selector: 'app-tls56060',
  templateUrl: './tls56060.component.html',
  styleUrls: ['./tls56060.component.scss'],
})
export class TLS56060Component {
  ProgNo: string = '250037';
  funInfo: FunsrightInfo = {};
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    organizationRequestCode: [],
    warehouseRequestCode: [],  // For 申請倉別
    productManagerCode: [],  // For 商品管理編號
    applicantCode: [],
    brandCode: [],
    issuanceCategory: [],
    organizationNumberCode: [],  // Updated field name for 部門編號
    shipmentDateFrom: [],
    shipmentDateTo: [],
    issuanceNoteStatus: [],  // For 倉別調撥單狀態
  });

  // Dropdown options
  productManagerOptions: any[] = [];  // For 商品管理編號
  userCodeOptions: any[] = [];  // For 申請人編號
  brandCodeOptions: any[] = [];
  issuanceNoteStatusOptions: any[] = [];  // For 倉別調撥單狀態
  organizationNumberOptions: any[] = [];  // Updated dropdown for 部門編號
  warehouseOptions: any[] = [];  // For 申請倉別

  // Table data
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    // Other columns
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private brandCodeService: BrandCodeService,
    private issuanceNoteStatusService: IssuanceNoteStatusService,
    private userCodeService: UserCodeService,
    private warehouseService: WarehouseService,
    private managementIDService: ManagementIDService,
    private organizationNumberService: OrganizationNumberService,  // Updated this service
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.issuanceNoteStatusService.getIssuanceNoteStatuses().subscribe((data) => (this.issuanceNoteStatusOptions = data));
    this.userCodeService.getUserCode().subscribe((data) => (this.userCodeOptions = data));  // For both applicant and approver codes
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));  // For 申請倉別
    this.managementIDService.getSystemTypes().subscribe((data) => (this.productManagerOptions = data));  // For 商品管理編號
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.organizationNumberOptions = data));  // Updated dropdown initialization for 部門編號
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
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
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
