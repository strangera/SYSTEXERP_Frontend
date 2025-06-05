import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

// 2.4.5.3 收銀機開關機時間表
@Component({
  selector: 'app-tls45030',
  templateUrl: './tls45030.component.html',
  styleUrl: './tls45030.component.scss'
})
export class TLS45030Component {
  ProgNo: string = '240018';
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
    // POS7004_非銷售資料記錄檔

    // from pos1002
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號，專櫃機台(自收)必須設定專櫃編號

    SYS_StoreNo: [, [Validators.maxLength(10)]], // 收銀機所屬門市店號
    TXN_Date: [], // 交易日期
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    TXN_No: [, [Validators.maxLength(6)]], // 交易序號
    FNS_Class: [, [Validators.maxLength(2)]], // 班別

    FNS_DateTime: [], // 操作日期時間
    FNS_Op_Cod: [, [Validators.maxLength(8)]], // 收銀員編號
    FNS_Flag: [[] as number[]], // 方式 0=登入 1=開錢櫃 2=零用金 3=繳大鈔 4=關機清帳 5=授權 6=登出 8=變更密碼 9=開機

    FNS_Amount: [, [Validators.maxLength(8)]], // 金額，未輸入金額的操作則固定為零
    FNS_Data: ['', [Validators.maxLength(50)]], // 非銷售資料
    TLT_No: [, [Validators.maxLength(8)]], // 專櫃編號
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      SYS_StoreNo: 'store123', TXN_Date: '2024/08/08', ECR_No: 'register123', TXN_No: 'transfer123', FNS_Class: 'class123',
      FNS_DateTime: '2024/08/08 10:10', FNS_Op_Cod: 'casher123', FNS_Flag: 1,
      FNS_Amount: 1000, FNS_Data: '非銷售資料', TLT_No: 'counter123',
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'TXN_Date', header: '交易日期', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'FNS_Class', header: '班別', visible: true },

    { field: 'FNS_DateTime', header: '操作日期時間', visible: true },
    { field: 'FNS_Op_Cod', header: '收銀員編號', visible: true },
    { field: 'FNS_Flag', header: '方式', visible: true },

    { field: 'FNS_Amount', header: '金額', visible: true },
    { field: 'FNS_Data', header: '非銷售資料', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  FNS_Flag_Option: any[] = [
    { value: 0, label: '登入' },
    { value: 1, label: '開錢櫃' },
    { value: 2, label: '零用金' },
    { value: 3, label: '繳大鈔' },
    { value: 4, label: '關機清帳' },
    { value: 5, label: '授權' },
    { value: 6, label: '登出' },
    { value: 8, label: '變更密碼' },
    { value: 9, label: '開機' },
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

    this.router.navigate(['/TLS4000/TLS45030CRU'], extras);
  }
}
