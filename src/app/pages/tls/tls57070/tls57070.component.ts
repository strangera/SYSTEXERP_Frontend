import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

@Component({
  selector: 'app-tls57070',
  templateUrl: './tls57070.component.html',
  styleUrls: ['./tls57070.component.scss'],
})
export class TLS57070Component {
  ProgNo: string = '250046';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    displayMode: [],
    stockDate: [],
    warehouseCode: [],
    brandCode: [],
    displayCount: [],
  });

  // Dropdown options
  displayModeOptions: any[] = [];
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'brand', header: '品牌', visible: true },
    { field: 'beginningQuantity', header: '期初數量', visible: true },
    { field: 'beginningCost', header: '期初成本', visible: true },
    { field: 'purchaseQuantity', header: '進貨數量', visible: true },
    { field: 'purchaseCost', header: '進貨成本', visible: true },
    { field: 'adjustmentQuantity', header: '進退數量', visible: true },
    { field: 'adjustmentCost', header: '進退成本', visible: true },
    { field: 'salesQuantity', header: '銷貨數量', visible: true },
    { field: 'salesCost', header: '銷貨成本', visible: true },
    { field: 'salesPrice', header: '銷貨售價', visible: true },
    { field: 'transferInQuantity', header: '撥入數量', visible: true },
    { field: 'transferInCost', header: '撥入成本', visible: true },
    { field: 'transferOutQuantity', header: '撥出數量', visible: true },
    { field: 'transferOutCost', header: '撥出成本', visible: true },
    { field: 'inventoryAdjustmentQuantity', header: '盤點數量', visible: true },
    { field: 'inventoryAdjustmentCost', header: '盤點成本', visible: true },
    { field: 'scrapQuantity', header: '報廢數量', visible: true },
    { field: 'scrapCost', header: '報廢成本', visible: true },
    { field: 'useQuantity', header: '領用數量', visible: true },
    { field: 'useCost', header: '領用成本', visible: true },
    { field: 'returnQuantity', header: '領用退回數量', visible: true },
    { field: 'returnCost', header: '領用退回成本', visible: true },
    { field: 'interCompanyTransferInQuantity', header: '同業調撥(入)數量', visible: true },
    { field: 'interCompanyTransferInCost', header: '同業調撥(入)成本', visible: true },
    { field: 'interCompanyTransferOutQuantity', header: '同業調撥(出)數量', visible: true },
    { field: 'interCompanyTransferOutCost', header: '同業調撥(出)成本', visible: true },
    { field: 'adjustmentCost', header: '調整成本', visible: true },
    { field: 'endingQuantity', header: '期末數量', visible: true },
    { field: 'endingCost', header: '期末成本', visible: true },
    { field: 'averageCost', header: '平均成本', visible: true },
    { field: 'totalSales', header: '銷售合計', visible: true },
    { field: 'grossProfit', header: '銷售毛利', visible: true },
    { field: 'profitMargin', header: '毛利率', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private displayModeService: DisplayModeService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
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
