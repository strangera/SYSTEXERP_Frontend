import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

@Component({
  selector: 'app-tls57080',
  templateUrl: './tls57080.component.html',
  styleUrls: ['./tls57080.component.scss'],
})
export class TLS57080Component {
  ProgNo: string = '250047';
  funInfo: FunsrightInfo = {};
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [],
    initialDate: [],
    managementCode: [],
    productName: [],
    vendorCode: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  managementIDOptions: any[] = [];

  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'date', header: '日期', visible: true },
    { field: 'order', header: '單號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'operation', header: '作業', visible: true },
    { field: 'quantityChange', header: '異動量', visible: true },
    { field: 'stockQuantity', header: '庫存量', visible: true },
    { field: 'batchNumber', header: '批號', visible: true },
    { field: 'unit', header: '單價', visible: true },
    { field: 'amount', header: '金額', visible: true },
  ];
  

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private managementIDService: ManagementIDService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
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
