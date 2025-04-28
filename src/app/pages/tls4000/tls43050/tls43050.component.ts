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
import { ApprovalStatusService } from '../../../service/basic/approval-status.service';

// 2.4.3.5 訊息狀態查詢作業
@Component({
  selector: 'app-tls43050',
  templateUrl: './tls43050.component.html',
  styleUrl: './tls43050.component.scss'
})
export class TLS43050Component {
  ProgNo: string = '240013';
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
    messageCode: [, [Validators.maxLength(13), this.validationService.numberValidator]], // Input serial number
    registerCode: [, [Validators.maxLength(6), this.validationService.numberValidator]], // Input serial number
    groupCode: [, [Validators.maxLength(3), this.validationService.numberValidator]], // Input serial number
    status: [], // DropDown
    loginID: [, [Validators.maxLength(7), this.validationService.numberValidator]], // Input serial number
    approverID: [, [Validators.maxLength(7), this.validationService.numberValidator]], // Input serial number
    mMessage: ['', [Validators.maxLength(60)]], // Input Text
    dMessage: ['', [Validators.maxLength(60)]], // Input Text
    startdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
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
    { field: 'contactPerson', header: '訊息案號代碼', visible: true },
    { field: 'contactDate', header: '收銀機代碼', visible: true },
    { field: 'UID', header: '群組代碼', visible: true },
    { field: 'industryType', header: '狀態', visible: true },
    { field: 'category', header: '登錄人ID', visible: true },
    { field: 'version', header: '審核人ID', visible: true },
    { field: 'rentNumber', header: '顯示文字(M)', visible: true },
    { field: 'progress', header: '顯示文字(D)', visible: true },
    { field: 'col1', header: '登錄時間', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  statusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private approvalStatusService: ApprovalStatusService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.approvalStatusService.getSystemTypes().subscribe(data => {
      this.statusOptions = data;
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

    this.router.navigate(['/TLS4000/TLS43050CRU'], extras);
  }
}
