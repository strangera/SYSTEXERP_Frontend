import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';

import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';

@Component({
  selector: 'app-tls56030',
  templateUrl: './tls56030.component.html',
  styleUrls: ['./tls56030.component.scss']
})
export class TLS56030Component {

  ProgNo: string = '250034';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    issuanceReturnCode: [],
    applicantCode: [],
    brandCode: [],
    warehouseCode: [],
    organizationNumber: [],
    issuanceReturnStatus: [],
    applicationDateFrom: [],
    applicationDateTo: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  issuanceReturnStatusOptions: any[] = [];

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
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private organizationNumberService: OrganizationNumberService,
    private issuanceNoteStatusService: IssuanceNoteStatusService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationNumberOptions = data);
    this.issuanceNoteStatusService.getIssuanceNoteStatuses().subscribe(data => this.issuanceReturnStatusOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.applicantCodeOptions = data);
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
      this.router.navigate(['TLS5000/TLS56030CRU'], extras);
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
