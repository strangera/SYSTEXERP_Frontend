import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls57110',
  templateUrl: './tls57110.component.html',
  styleUrl: './tls57110.component.scss'
})
export class TLS57110Component {
  ProgNo: string = '250050';
  funInfo?: FunsrightInfo;



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
    { field: 'initialInventory', header: '期初存貨', visible: true },
    { field: 'purchaseQuantity', header: '進貨量', visible: true },
    { field: 'returnQuantity', header: '進退量', visible: true },
    { field: 'salesQuantity', header: '銷貨量', visible: true },
    { field: 'transferIn', header: '撥入量', visible: true },
    { field: 'transferOut', header: '撥出量', visible: true },
    { field: 'inventoryAdjustment', header: '盤點量', visible: true },
    { field: 'damagedQuantity', header: '報廢量', visible: true },
    { field: 'claimQuantity', header: '領用量', visible: true },
    { field: 'claimReturnQuantity', header: '領用退回量', visible: true },
    { field: 'peerTransferIn', header: '同業調入量', visible: true },
    { field: 'peerTransferOut', header: '同業調出量', visible: true },
    { field: 'endingInventory', header: '期末存貨', visible: true },
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
