import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';

// 2.4.3.4 訊息群組維護作業
@Component({
  selector: 'app-tls43040',
  templateUrl: './tls43040.component.html',
  styleUrl: './tls43040.component.scss'
})
export class TLS43040Component {
  ProgNo: string = '240012';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    // POS1002GRM 收銀機群組主檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    ECR_GrpNo: [, [Validators.maxLength(20)]], // 機台群組編號
    ECR_GrpName: ['', [Validators.maxLength(64)]], // 機台群組名稱
    ECR_GrpDesc: ['', [Validators.maxLength(255)]], // 機台群組備註
    ECR_DtlLimit: ['', [Validators.maxLength(1)]], // 是否限制機台條件，POS1002GRD 0=不限制 1=符合明細設定的機台才列入群組 2=不符合明細設定的機台才列入群組

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
    { ECR_GrpNo: 'serial123', ECR_GrpName: 'group1', ECR_GrpDesc: 'remark1', ECR_DtlLimit: 0 },
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ECR_GrpNo', header: '機台群組編號', visible: true },
    { field: 'ECR_GrpName', header: '機台群組名稱', visible: true },
    { field: 'ECR_GrpDesc', header: '機台群組備註', visible: true },
    { field: 'ECR_DtlLimit', header: '是否限制機台條件', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  ECR_DtlLimit_Options: any[] = [
    { value: 0, label: '不限制' },
    { value: 1, label: '符合明細設定的機台才列入群組' },
    { value: 2, label: '不符合明細設定的機台才列入群組' },
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

    this.router.navigate(['/TLS4000/TLS43040CRU'], extras);
  }
}
