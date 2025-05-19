import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { VendorService } from '../../../service/basic/vendor.service';
import { PaperStatusService } from '../../../service/basic/paper-status.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { SystemTypeService } from '../../../service/basic/system-type.service';


@Component({
  selector: 'app-tls52040',
  templateUrl: './tls52040.component.html',
  styleUrl: './tls52040.component.scss'
})
export class TLS52040Component {

  ProgNo: string = '250017';
  funInfo?: FunsrightInfo;

  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  loading: boolean = false;
  submitted: boolean = false;


  queryForm = this.formBuilder.group({
    managementId: [],
    vendorId: [],
    paperStatus: [],
    warehouseId: [],
    brandId: [],
    applicantId: [],
    approverId: [],
    returnId: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
    systemtypemulti: [[] as number[], [Validators.required]], // MultiSelect

  });

  // Dropdown options
  vendorOptions: any[] = [];
  paperStatusOptions: any[] = [];
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  userCodeOptions: any[] = [];
  managementIdOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'refundRequestCode', header: '退貨請收單號', visible: true },
    { field: 'refundAmountExcludingTax', header: '退貨請收單金額(未稅)', visible: true },
    { field: 'refundAmountIncludingTax', header: '退貨請收單金額(含稅)', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'applicant', header: '申請人', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'approver', header: '審核人', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'brandCode', header: '品牌編碼', visible: true },
    { field: 'refundOrderCode', header: '退貨單單號', visible: true },
  ];


  systemTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private vendorService: VendorService,
    private paperStatusService: PaperStatusService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private userCodeService: UserCodeService,
    private managementIdService: ManagementIDService,
    private systemTypeService: SystemTypeService,
    private authService: AuthService,

  ) { }

  ngOnInit(): void {
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;

      // 全選填入
      let allSystemValues = this.systemTypeOptions.map(system => system.value);
      this.queryForm.patchValue({
        systemtypemulti: allSystemValues
      });
    });
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.vendorService.getVendors().subscribe(data => this.vendorOptions = data);
    this.paperStatusService.getSystemTypes().subscribe(data => this.paperStatusOptions = data);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
    this.managementIdService.getSystemTypes().subscribe(data => this.managementIdOptions = data);
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
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };
    this.router.navigate(['TLS5000/TLS52040CRU'], extras);
  }
}
