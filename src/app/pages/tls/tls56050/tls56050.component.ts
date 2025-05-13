import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

@Component({
  selector: 'app-tls56050',
  templateUrl: './tls56050.component.html',
  styleUrls: ['./tls56050.component.scss'],
})
export class TLS56050Component {
  ProgNo: string = '250036';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    organizationRequestCode: [],
    generalCode: [],
    brandCode: [],
    warehouseOutCode: [],  // For 調出倉別
    warehouseInCode: [],   // For 調入倉別
    issuanceNoteStatus: [],  // For 倉別調撥單狀態
    applicantCode: [],
    approverCode: [],
    shipmentCode: [],  // For 發貨人編號
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    shipmentDateFrom: [],  // For 發貨日期
    shipmentDateTo: [],    // For 發貨日期
  });

  // Dropdown options
  brandCodeOptions: any[] = [];
  warehouseOutOptions: any[] = [];  // For 調出倉別
  warehouseInOptions: any[] = [];   // For 調入倉別
  issuanceNoteStatusOptions: any[] = [];  // For 倉別調撥單狀態
  userCodeOptions: any[] = [];  // For both applicant and approver codes

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
    private brandCodeService: BrandCodeService,
    private warehouseService: WarehouseService,
    private issuanceNoteStatusService: IssuanceNoteStatusService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.warehouseService.getWarehouseOptions().subscribe((data) => {
      this.warehouseOutOptions = data;
      this.warehouseInOptions = data;
    });
    this.issuanceNoteStatusService.getIssuanceNoteStatuses().subscribe((data) => (this.issuanceNoteStatusOptions = data));
    this.userCodeService.getUserCode().subscribe((data) => (this.userCodeOptions = data));  // For both applicant and approver codes
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
