import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { TransferReasonService } from '../../../service/basic/transfer-reason.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { PriceChangeStatusService } from '../../../service/basic/price-change-status.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls56080',
  templateUrl: './tls56080.component.html',
  styleUrls: ['./tls56080.component.scss'],
})
export class TLS56080Component {
  ProgNo: string = '250039';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    transferOrderCode: [],
    managementID: [],
    brandCode: [],
    warehouseCode: [],
    transferReason: [],
    applicantCode: [],
    approverCode: [],
    status: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
  });

  // Dropdown options
  transferReasonOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandCodeOptions: any[] = [];
  warehouseOptions: any[] = [];
  userCodeOptions: any[] = [];  // For both applicant and approver codes
  statusOptions: any[] = [];

  // Table data
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' },
    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    // Other columns
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private transferReasonService: TransferReasonService,
    private managementIDService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private warehouseService: WarehouseService,
    private userCodeService: UserCodeService,
    private priceChangeStatusService: PriceChangeStatusService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.transferReasonService.getTransferReasons().subscribe((data) => (this.transferReasonOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.userCodeService.getUserCode().subscribe((data) => (this.userCodeOptions = data));  // For both applicant and approver codes
    this.priceChangeStatusService.getPriceChangeStatusOptions().subscribe((data) => (this.statusOptions = data));
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
      this.router.navigate(['TLS5000/TLS56080CRU'], extras);
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
