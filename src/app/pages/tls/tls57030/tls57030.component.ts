import { StockRangeService } from './../../../service/basic/stock-range.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  styleUrls: ['./tls57030.component.scss'],
})
export class TLS57030Component {
  ProgNo: string = '250042';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    radiolist: [1],
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    supplierCode: [],
    warehouseNumber: [],
    inventoryDate: [],
    displayInventoryType: [],
    displayInactive: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  stockRangeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'brandName', header: '品牌名稱', visible: true },
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'managementID', header: '管理編號', visible: true },
    { field: 'productName', header: '商品名稱', visible: true },
    { field: 'barcode', header: '國際條碼', visible: true },
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'bigCategory', header: '大分類', visible: true },
    { field: 'midCategory', header: '中分類', visible: true },
    { field: 'smallCategory', header: '小分類', visible: true },
    { field: 'purchasePriceExclTax', header: '進價(未稅)', visible: true },
    { field: 'sellingPriceInclTax', header: '售價(含稅)', visible: true },
    { field: 'totalQuantity', header: '數量合計', visible: true },
    { field: 'totalPurchaseExclTax', header: '合計進價(未稅)', visible: true },
    { field: 'totalSellingInclTax', header: '合計售價(含稅)', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private authService: AuthService,
    private stockRangeService: StockRangeService
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));

    this.stockRangeService.getStockRangeOptions().subscribe((data) => (this.stockRangeOptions = data));
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
