import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { DisplayModeService } from '../../../service/basic/display-mode.service';

@Component({
  selector: 'app-tls57050',
  templateUrl: './tls57050.component.html',
  styleUrls: ['./tls57050.component.scss'],
})
export class TLS57050Component {
  ProgNo: string = '250044';
  funInfo: FunsrightInfo = {};
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    salesCode: [],
    salesDateFrom: [],
    salesDateTo: [],
    receiptMachineCode: [],
    transactionSeqCode: [],
    itemCode: [],
    itemStyle: [],
    displayMethod: [],
    displayQuantity: [],
    displayMode: [],
    barcode: [],
    VendorProductNumber: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  displayModeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesOrderNumber', header: '銷售單號', visible: true },
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegister', header: '收銀機號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'salesFixedPrice', header: '銷售定價', visible: true },
    { field: 'salesAmount', header: '銷售金額', visible: true },
    { field: 'adjustmentAmount', header: '整形折價', visible: true },
    { field: 'adjustmentDiscount', header: '整形折扣', visible: true },
  ];
  

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private authService: AuthService,
    private displayModeService: DisplayModeService,
  ) {}

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
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
