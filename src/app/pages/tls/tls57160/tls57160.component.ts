import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';

@Component({
  selector: 'app-tls57160',
  templateUrl: './tls57160.component.html',
  styleUrl: './tls57160.component.scss'
})
export class TLS57160Component {
  ProgNo: string = '250055';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [1, Validators.required],
    initialDate: [],
    managementCode: [],
    productName: [],
    vendorCode: [],
    brandCode: [1, Validators.required],
    displayMode: [],
    displayCount: [],
    inventoryDateFrom: [, Validators.required],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandCodeOptions: any[] = [];
  displayModeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'managementDescription', header: '管理編號說明', visible: true },
    { field: 'productName', header: '商品名稱', visible: true },
    { field: 'internationalCode', header: '國際條碼', visible: true },
    { field: 'quantity1to6', header: '1-6個月數量', visible: true },
    { field: 'cost1to6', header: '1-6個月成本', visible: true },
    { field: 'quantity7to12', header: '7-12個月數量', visible: true },
    { field: 'cost7to12', header: '7-12個月成本', visible: true },
    { field: 'quantity13to18', header: '13-18個月數量', visible: true },
    { field: 'cost13to18', header: '13-18個月成本', visible: true },
    { field: 'quantity19to24', header: '19-24個月數量', visible: true },
    { field: 'cost19to24', header: '19-24個月成本', visible: true },
    { field: 'quantity25to36', header: '25-36個月數量', visible: true },
    { field: 'cost25to36', header: '25-36個月成本', visible: true },
    { field: 'quantityOver36', header: '36個月以上數量', visible: true },
    { field: 'costOver36', header: '36個月以上成本', visible: true },
    { field: 'totalQuantity', header: '合計數量', visible: true },
    { field: 'totalCost', header: '合計成本', visible: true },
    { field: 'averagePrice', header: '平均單價', visible: true },
    { field: 'currentSellingPrice', header: '當前售價', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private managementIDService: ManagementIDService,
    private authService: AuthService,
    private brandCodeService: BrandCodeService,
    private displayModeService: DisplayModeService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
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
