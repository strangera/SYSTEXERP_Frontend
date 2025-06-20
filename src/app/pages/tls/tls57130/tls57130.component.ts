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
  selector: 'app-tls57130',
  templateUrl: './tls57130.component.html',
  styleUrl: './tls57130.component.scss'
})
export class TLS57130Component {
  ProgNo: string = '250052';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    displayMode: [],
    stockDate: [],
    warehouseCode: [],
    brandCode: [],
    displayCount: [],
    startdatetime: [],
    enddatetime: [],
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
    { field: 'managementCode', header: '管理編號', visible: true },
    { field: 'productName', header: '品名', visible: true },
    { field: 'internationalBarcode', header: '國際條碼', visible: true },
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'invoiceAmount', header: '銷售總金額(發票金額)', visible: true },
    { field: 'totalSalesQuantity', header: '銷售總數量', visible: true },
    { field: 'unit', header: '單價', visible: true },
    { field: 'salesAmountSummary', header: '銷售金額/小計(數量*單價)', visible: true },
    { field: 'amountRanking', header: '金額排名', visible: true },
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
