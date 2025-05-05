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

// 2.4.5.2 收銀機異動查詢
@Component({
  selector: 'app-tls45020',
  templateUrl: './tls45020.component.html',
  styleUrl: './tls45020.component.scss'
})
export class TLS45020Component {
  ProgNo: string = '240017';
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
    // POS1002SCH 收銀機設定排程檔

    ECR_SchNo: [, [Validators.maxLength(20)]], // 排程編號
    ECR_SchDate: [], // 設定啟用日期
    ECR_SchStatus: [[] as number[]], // 排程狀態 A=啟用 C=取消 預設值為A

    //
    SYS_StoreNo: [, [Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    //
    ORG_ECR_TLT_No: [, [Validators.maxLength(20)]], // 原機台所屬專櫃編號
    ECR_TLT_No: ['', [Validators.maxLength(20)]], // 機台所屬專櫃編號，若為空白則代表不修改
    ORG_ECR_USR_No: ['', [Validators.maxLength(8)]], // 機台所屬收銀員
    ECR_USR_No: ['', [Validators.maxLength(8)]], // 機台所屬收銀員，若為空白則代表不修改
    ORG_ECR_TmplNo: ['', [Validators.maxLength(20)]], // 原模版編號
    ECR_TmplNo: ['', [Validators.maxLength(20)]], // 新模版編號，若為空白則代表不修改
    ORG_ECR_Status: ['', [Validators.maxLength(2)]], // 原收銀機狀態
    ECR_Status: ['', [Validators.maxLength(2)]], // 收銀機狀態，若為空白則代表不修改

    //
    ECR_SchFinTime: [], // 異動作業完成時間

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
      ECR_SchNo: 'schedule123', ECR_SchDate: '2024/08/08', ECR_SchStatus: 'A', SYS_StoreNo: 'store123', ECR_No: 'ecr123',
      ORG_ECR_TLT_No: '123', ECR_TLT_No: '456',
      ORG_ECR_USR_No: '123', ECR_USR_No: '456',
      ORG_ECR_TmplNo: '123', ECR_TmplNo: '456',
      ORG_ECR_Status: '123', ECR_Status: '456',
      ECR_SchFinTime: '2024/09/09 10:10'
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ECR_SchNo', header: '排程編號', visible: true },
    { field: 'ECR_SchDate', header: '設定啟用日期', visible: true },
    { field: 'ECR_SchStatus', header: '排程狀態', visible: true },
    { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: false },

    { field: 'ORG_ECR_TLT_No', header: '原機台所屬專櫃編號', visible: false },
    { field: 'ECR_TLT_No', header: '機台所屬專櫃編號', visible: false },
    { field: 'ORG_ECR_USR_No', header: '原機台所屬收銀員', visible: false },
    { field: 'ECR_USR_No', header: '機台所屬收銀員', visible: false },
    { field: 'ORG_ECR_TmplNo', header: '原模版編號', visible: false },
    { field: 'ECR_TmplNo', header: '模版編號', visible: false },
    { field: 'ORG_ECR_Status', header: '原收銀機狀態', visible: false },
    { field: 'ECR_Status', header: '收銀機狀態', visible: false },

    { field: 'ECR_SchFinTime', header: '異動作業完成時間', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  ECR_SchStatus_Options: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'B', label: '取消' },
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

    this.router.navigate(['/TLS4000/TLS45020CRU'], extras);
  }
}
