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

@Component({
  selector: 'app-tls46010',
  templateUrl: './tls46010.component.html',
  styleUrl: './tls46010.component.scss'
})

// 2.4.6.1 網路位置設定
export class TLS46010Component {
  ProgNo: string = '240019';
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
    // POS10015 門市系統主機設定檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    SYS_StoreNo: [, [Validators.maxLength(10)]], // 門市店號
    SYS_SrvNo: [, [Validators.maxLength(8)]], // 主機編號
    SYS_SrvIP: [, [Validators.maxLength(40)]], // 主機IP
    SYS_SrvPort: [20, [Validators.maxLength(40)]], // 主機連接埠 預設值為20
    SYS_SrvStatus: ['A', [Validators.maxLength(2)]], // 主機狀態 A=啟用 C=停用 預設值為A
    SYS_SrvName: ['', [Validators.maxLength(40)]], // 主機名稱
    SYS_SrvUsrID: ['', [Validators.maxLength(20)]], // 主機登入帳號
    SYS_SrvUsrPwd: ['', [Validators.maxLength(20)]], // 主機登入密碼

    //
    SYS_SRVDDir: ['', [Validators.maxLength(60)]], // 後台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDir: ['', [Validators.maxLength(60)]], // 後台系統上傳目錄 預設值為/MyPOSData/PosUp
    SYS_MyPOSDDir: ['', [Validators.maxLength(60)]], // 傳輸程式下載目錄 預設值為/MyPOSData/MyPOSDown
    SYS_MyPOSUDir: ['', [Validators.maxLength(60)]], // 傳輸程式上傳目錄 預設值為/MyPOSData/MyPOSUp
    SYS_SRVDDirClt: ['', [Validators.maxLength(60)]], // 前台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDirClt: ['', [Validators.maxLength(60)]], // 前台系統上傳目錄 預設值為/MyPOSData/PosUp

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
      SYS_StoreNo: 'store123', SYS_SrvNo: 'register123', SYS_SrvIP: 'registerIP', SYS_SrvPort: 20, SYS_SrvStatus: 'A',
      SYS_SrvName: 'machine123', SYS_SrvUsrID: 'machine_Account',
      SYS_SRVDDir: '/MyPOSData/PosDown  ', SYS_SRVUDir: '/MyPOSData/PosUp',
      SYS_MyPOSDDir: '/MyPOSData/MyPOSDown', SYS_MyPOSUDir: '/MyPOSData/MyPOSUp',
      SYS_SRVDDirClt: 'MyPOSData/PosDown', SYS_SRVUDirClt: '/MyPOSData/PosUp',
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'SYS_StoreNo', header: '門市店號', visible: true },
    { field: 'SYS_SrvNo', header: '主機編號', visible: true },
    { field: 'SYS_SrvIP', header: '主機IP', visible: true },
    { field: 'SYS_SrvPort', header: '主機連接埠', visible: true },
    { field: 'SYS_SrvStatus', header: '主機狀態', visible: true },
    { field: 'SYS_SrvName', header: '主機名稱', visible: true },
    { field: 'SYS_SrvUsrID', header: '主機登入帳號', visible: true },

    { field: 'SYS_SRVDDir', header: '主機端下載目錄', visible: true },
    { field: 'SYS_SRVUDir', header: '主機端上傳目錄', visible: true },

    { field: 'SYS_MyPOSDDir', header: 'KGDPS下載目錄', visible: true },
    { field: 'SYS_MyPOSUDir', header: 'KGDPS上傳目錄', visible: true },

    { field: 'SYS_SRVDDirClt', header: '客戶端下載目錄', visible: true },
    { field: 'SYS_SRVUDirClt', header: '客戶端上傳目錄', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  SYS_SrvStatus_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
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

    this.router.navigate(['/TLS4000/TLS46010CRU'], extras);
  }
}
