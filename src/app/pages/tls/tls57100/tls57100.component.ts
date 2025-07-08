import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { DocumentTypeService } from '../../../service/basic/document-type.service';
import { PriceChangeStatusService } from '../../../service/basic/price-change-status.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls57100',
  templateUrl: './tls57100.component.html',
  styleUrl: './tls57100.component.scss'
})
export class TLS57100Component {
  ProgNo: string = '250049';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    vendorCode: [],
    documentType: [],
    priceChangeStatus: [],
    displayMode: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    inspectionReturnCode: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  vendorOptions: any[] = [];
  documentTypeOptions: any[] = [];
  priceChangeStatusOptions: any[] = [];
  displayModeOptions: any[] = [];

  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'orderNumber', header: '單號', visible: true },
    { field: 'orderType', header: '單據類型', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'unitPrice', header: '售價', visible: true },
    { field: 'subtotal', header: '小計', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private vendorService: VendorService,
    private documentTypeService: DocumentTypeService,
    private priceChangeStatusService: PriceChangeStatusService,
    private displayModeService: DisplayModeService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.vendorService.getVendors().subscribe((data) => (this.vendorOptions = data));
    this.documentTypeService.getDocumentTypes().subscribe((data) => (this.documentTypeOptions = data));
    this.priceChangeStatusService.getPriceChangeStatusOptions().subscribe((data) => (this.priceChangeStatusOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }
}
