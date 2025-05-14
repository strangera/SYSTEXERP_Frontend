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

// 2.4.3.1 訊息登錄作業
@Component({
  selector: 'app-tls43010',
  templateUrl: './tls43010.component.html',
  styleUrl: './tls43010.component.scss'
})
export class TLS43010Component {
  ProgNo: string = '240009';
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
    // POS50011 廣告資訊設定檔
    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL

    NOT_No: ['', [Validators.maxLength(20)]], // 通告編號
    NOT_Date: [], // 建立日期
    NOT_BegDate_From: [], // 有效開始日期時間
    NOT_BegDate_To: [], // 有效開始日期時間
    NOT_EndDate_From: [], // 有效結束日期時間
    NOT_EndDate_To: [], // 有效結束日期時間
    NOT_File: ['', [Validators.maxLength(200)]], // 媒體檔案名稱
    // NOT_File            NVARCHAR(200)       NOT NULL,      /*媒體檔案名稱*/
    NOT_Status: [, [Validators.maxLength(1)]], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    NOT_Priority: [, [Validators.maxLength(1)]], // 優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)

    NOT_Note: [, [Validators.maxLength(255)]], // 備註
    NOT_PlayTime: [, [Validators.maxLength(6)]], // 媒體檔播放秒數，預設值為30
    NOT_DtlLimit: [, [Validators.maxLength(1)]], // 是否限制播放條件，POS50012 0=不限制(預設值) 1=符合明細設定的機台才播放 2=不符合明細設定的機台才播放*

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      NOT_No: 'no123', NOT_Date: '2024/08/08', NOT_BegDate: '2024/08/08 08:08', NOT_EndDate: '2024/08/08 09:09', NOT_File: '檔案名稱', NOT_Status: 0, NOT_Priority: 0, NOT_Note: 'remark1',
      NOT_PlayTime: 30, NOT_DtlLimit: 0
    },
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '通告日期', visible: true },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
    { field: 'NOT_Note', header: '備註', visible: true },

    { field: 'NOT_PlayTime', header: '媒體檔播放秒數', visible: true },
    { field: 'NOT_DtlLimit', header: '是否限制播放條件', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  NOT_Status_Options: any[] = [
    { value: 0, label: '未審核' },
    { value: 1, label: '已審核' },
    { value: 2, label: '已刪除' },
  ];

  NOT_DtlLimit_Options: any[] = [
    { value: 0, label: '不限制' },
    { value: 1, label: '符合明細設定的機台才播放' },
    { value: 2, label: '不符合明細設定的機台才播放' },
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
    return true;
  }
  canAdd(): boolean {
    return true;
  }
  canEdit(): boolean {
    return true;
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

    this.router.navigate(['/TLS4000/TLS43010CRU'], extras);
  }
}
