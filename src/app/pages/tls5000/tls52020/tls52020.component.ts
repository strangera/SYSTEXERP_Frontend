import { UserCodeService } from './../../../service/basic/user-code.service';
import { PaperStatusService } from './../../../service/basic/paper-status.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { BrandCodeService } from './../../../service/basic/brand-code.service';
import { ManagementIDService } from './../../../service/basic/management-id.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

// 2.5.2.2  退貨單維護作業
@Component({
  selector: 'app-tls52020',
  templateUrl: './tls52020.component.html',
  styleUrl: './tls52020.component.scss'
})
export class TLS52020Component {
  ProgNo: string = '250015';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    refundOrder: [, [this.validationService.numberValidator]], // Input serial number
    storage: [], // DropDown
    managementID: [], // DropDown
    brandID: [], // DropDown
    vendorID: [], // DropDown
    paperStatus: [[] as number[]], // MultiSelect
    applicant: [], // DropDown
    applicantStartdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    applicantEnddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    checkPerson: [], // DropDown
    checkStartdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    checkEnddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    closePerson: [], // DropDown
    closeStartdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    closeEnddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    //{ contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '退貨單號', visible: true },
    { field: 'contactDate', header: '品牌編號', visible: true },
    { field: 'UID', header: '廠商編號', visible: true },
    { field: 'industryType', header: '退貨單總成本(未稅)', visible: true },
    { field: 'category', header: '單據狀態', visible: true },
    { field: 'version', header: '申請人', visible: true },
    { field: 'rentNumber', header: '申請日期', visible: true },
    { field: 'progress', header: '審核人', visible: true },
    { field: 'col1', header: '審核日期', visible: true },
    { field: 'col2', header: '倉別', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  storageOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandIDOptions: any[] = [];
  vendorIDOptions: any[] = [];
  paperStatusOptions: any[] = [];
  applicantOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private managementIDService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private vendorService: VendorService,
    private paperStatusService: PaperStatusService,
    private userCodeService: UserCodeService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    // ----------------------------------------------------------------
    this.managementIDService.getSystemTypes().subscribe(data => {
      this.managementIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.brandCodeService.getSystemTypes().subscribe(data => {
      this.brandIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.vendorService.getVendors().subscribe(data => {
      this.vendorIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.userCodeService.getUserCode().subscribe(data => {
      this.applicantOptions = data;
    });
    // ----------------------------------------------------------------
    this.paperStatusService.getSystemTypes().subscribe(data => {
      this.paperStatusOptions = data;

      // 全選填入
      // let allSystemValues = this.paperStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   paperStatus: allSystemValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }
  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS5000/TLS52020CRU'], extras);
  }
}
