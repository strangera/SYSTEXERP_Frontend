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

// 2.4.1.3 收銀專櫃人員資料維護作業
@Component({
  selector: 'app-tls41030',
  templateUrl: './tls41030.component.html',
  styleUrl: './tls41030.component.scss'
})
export class TLS41030Component {
  ProgNo: string = '240003';
  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    // POS2001 收銀員資料檔

    USR_No: [, [Validators.maxLength(8)]], // 收銀員編號
    USR_Name: ['', [Validators.maxLength(20)]], // 收銀員姓名
    USR_Passwd: ['', [Validators.maxLength(20)]], // 密碼
    USR_Level: [, [Validators.maxLength(6)]], // 收銀鍵盤等級(編號)
    USR_Auth: [, [Validators.maxLength(6)]], // 收銀員授權等級

    USR_JobStatus: ['', [Validators.maxLength(2)]], // 收銀員狀態 J=在職 Q=離職
    USR_Class: ['', [Validators.maxLength(2)]], // 收銀員等級 R=一般 M=店長 S=系統管理者
    USR_RegType: [, [Validators.maxLength(2)]], // 收銀員區分 2=獨立收銀 1=集中收銀

    USR_TLT_No: [, [Validators.maxLength(20)]], // 收銀員所屬櫃編
    USR_TLT_Name: ['', [Validators.maxLength(60)]], // 收銀員所屬專櫃名稱

    USR_OnJobDate: [], // 啟用日期
    USR_QuitDate: [], // 停用日期

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: ['', [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: ['', [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      USR_No: '920019', USR_Name: '朱小姐', USR_Passwd: '920019', USR_Level: 'XXXXXX', USR_Auth: 0,
      USR_JobStatus: 'J', USR_Class: 'R', USR_RegType: 1, USR_TLT_No: '', USR_TLT_Name: '',
      USR_TitleName: '', USR_OnJobDate: '2010/07/03 00:00:00.000', USR_QuitDate: '2026/03/31 00:00:00.000'
    },
    {
      USR_No: '920020', USR_Name: '梁先生', USR_Passwd: '920020', USR_Level: 'XXXXXX', USR_Auth: 0,
      USR_JobStatus: 'J', USR_Class: 'R', USR_RegType: 1, USR_TLT_No: '', USR_TLT_Name: '',
      USR_TitleName: '', USR_OnJobDate: '2014/02/05 00:00:00.000', USR_QuitDate: ' 2025/06/30 00:00:00.000'
    },
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'USR_No', header: '收銀員編號', visible: true },
    { field: 'USR_Name', header: '收銀員姓名', visible: true },
    { field: 'USR_Passwd', header: '密碼', visible: true },
    { field: 'USR_Level', header: '收銀鍵盤等級(編號)', visible: true },
    { field: 'USR_Auth', header: '收銀員授權等級', visible: true },

    { field: 'USR_JobStatus', header: '在職狀態', visible: true },
    { field: 'USR_Class', header: '收銀員等級', visible: true },
    { field: 'USR_RegType', header: '收銀員區分', visible: true },
    { field: 'USR_TLT_No', header: '收銀員所屬櫃編', visible: true },
    { field: 'USR_TLT_Name', header: '收銀員所屬專櫃名稱', visible: true },

    { field: 'USR_TitleName', header: '職稱', visible: false },
    { field: 'USR_OnJobDate', header: '到職日期', visible: false },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  USR_JobStatus_Options: any[] = [
    { value: 'J', label: '在職' },
    { value: 'Q', label: '離職' },
  ];
  USR_Class_Options: any[] = [
    { value: 'R', label: '一般' },
    { value: 'M', label: '店長' },
    { value: 'S', label: '系統管理者' },
  ];
  USR_RegType_Options: any[] = [
    { value: 2, label: '獨立收銀' },
    { value: 1, label: '集中收銀' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
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

    this.router.navigate(['/TLS4000/TLS41030CRU'], extras);
  }
}
