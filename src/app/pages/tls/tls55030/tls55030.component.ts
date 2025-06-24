import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { DiscountStatusService } from '../../../service/basic/discount-status.service';
import { PaperTypeService } from '../../../service/basic/paper-type.service';
import { TaxableService } from '../../../service/basic/taxable.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { VendorService } from '../../../service/basic/vendor.service';

@Component({
  selector: 'app-tls55030',
  templateUrl: './tls55030.component.html',
  styleUrls: ['./tls55030.component.scss']
})
export class TLS55030Component {

  ProgNo: string = '250028';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    paperType: [],
    invoiceCode: [],
    documentDate: [],
    billingYearMonth: [],
    billingMethod: [],
    billingCount: [],
    reportYearMonth: [],
    vendorCode: [],
    taxCategory: [],
    amountFrom: [],
    amountTo: [],
    unTaxAmountFrom: [],
    unTaxAmountTo: [],
    taxAmountFrom: [],
    taxAmountTo: [],
    format: [],
    discountStatus: [],
    sendDateFrom: [],
    sendDateTo: [],
    creator: [],
    discountMaintenanceCode: [],
    // Add more form controls as needed
  });

  // Dropdown options
  paperTypeOptions: any[] = [];
  discountStatusOptions: any[] = [];
  taxCategoryOptions: any[] = [];
  vendorOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'billingMonth', header: '結帳年月', visible: true },
    { field: 'storeCode', header: '廠商編號', visible: true },
    { field: 'documentType', header: '單據種類', visible: true },
    { field: 'format', header: '格式', visible: true },
    { field: 'status', header: '狀況', visible: true },
    { field: 'totalDiscountAmount', header: '總折讓金額', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private discountStatusService: DiscountStatusService,
    private paperTypeService: PaperTypeService,
    private taxableService: TaxableService,
    private authService: AuthService,


  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.discountStatusService.getDiscountStatusOptions().subscribe(data => this.discountStatusOptions = data);
    this.paperTypeService.getSystemTypes().subscribe(data => this.paperTypeOptions = data);
    this.taxableService.getSystemTypes().subscribe(data => this.taxCategoryOptions = data);

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
      this.router.navigate(['TLS5000/TLS55030CRU'], extras);
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
