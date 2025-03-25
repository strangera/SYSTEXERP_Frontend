import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { PaperStatusService } from '../../../service/basic/paper-status.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

@Component({
  selector: 'app-tls57010',
  templateUrl: './tls57010.component.html',
  styleUrls: ['./tls57010.component.scss'],
})
export class TLS57010Component {
  ProgNo: string = '250040';
  funInfo: FunsrightInfo = {};
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    purchaseDateFrom: [],
    purchaseDateTo: [],
    brandCode: [],
    vendorCode: [],
    managementID: [],
    paperStatus: [],
    includePendingPurchase: [false],  // Checkbox control
    reportStyle: ['匯總'],  // Radio button control with default value
  });

  // Dropdown options
  brandCodeOptions: any[] = [];
  vendorOptions: any[] = [];
  managementIDOptions: any[] = [];
  paperStatusOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'purchaseDate', header: '採購日期', visible: true },
    { field: 'purchaseOrderNumber', header: '採購單號', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'purchaseQuantity', header: '採購量', visible: true },
    { field: 'purchaseAmountNet', header: '進價(未稅)', visible: true },
    { field: 'purchaseAmountGross', header: '定價(含稅)', visible: true },
    { field: 'quantityReceived', header: '已進量', visible: true },
  ];
  

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private brandCodeService: BrandCodeService,
    private vendorService: VendorService,
    private managementIDService: ManagementIDService,
    private paperStatusService: PaperStatusService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.vendorService.getVendors().subscribe((data) => (this.vendorOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.paperStatusService.getSystemTypes().subscribe((data) => (this.paperStatusOptions = data));
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
