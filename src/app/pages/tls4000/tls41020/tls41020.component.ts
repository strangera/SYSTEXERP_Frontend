import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

// 2.4.1.2 收銀機EDC資料維護
@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
  styleUrl: './tls41020.component.scss'
})
export class TLS41020Component {
  ProgNo: string = '240002';
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
    // POS1002EDC 收銀機EDC設定檔
    SYS_StoreNo: [, [Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    EDC_No: [, [Validators.maxLength(8)]], // 信用卡刷卡機代碼
    // ECR_LocNo: [, [Validators.maxLength(10)]], // 收銀機位置 #JOIN POS1002
    EDC_BegDate_From: [], // 啟用日期
    EDC_BegDate_To: [], // 啟用日期
    EDC_EdnDate_From: [], // 停用日期
    EDC_EdnDate_To: [], // 停用日期
    EDC_Status: [[] as number[],[Validators.maxLength(2)]], // 信用卡刷卡機狀態 A=啟用 C=停用
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬專櫃名稱
    //
    EDC_IP1: [, [Validators.maxLength(20)]], // 第一台信用卡刷卡機IP
    EDC_IP2: [, [Validators.maxLength(20)]], // 第二台信用卡刷卡機IP
    EDC_IP3: [, [Validators.maxLength(20)]], // 第三台信用卡刷卡機IP
    EDC_TmID1: [, [Validators.maxLength(8)]], // 第一台信用卡刷卡機端末機代碼
    EDC_TmID2: [, [Validators.maxLength(8)]], // 第二台信用卡刷卡機端末機代碼
    EDC_TmID3: [, [Validators.maxLength(8)]], // 第三台信用卡刷卡機端末機代碼

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
    { SYS_StoreNo: 'strore123', ECR_No: 'register123', EDC_No: 'edc123' ,
      EDC_BegDate: '2024/01/01', EDC_EdnDate: '2024/02/02', EDC_Status: 'A',
      ECR_TLT_No: 'counter123', ECR_TLT_Name: '測試專櫃', EDC_IP1: 'EDCcasher123'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'EDC_No', header: '信用卡刷卡機代碼', visible: true },

    { field: 'EDC_BegDate', header: '啟用日期', visible: true },
    { field: 'EDC_EdnDate', header: '停用日期', visible: true },
    { field: 'EDC_Status', header: '信用卡刷卡機狀態', visible: true },

    { field: 'ECR_TLT_No', header: '機台所屬專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '機台所屬專櫃名稱', visible: true },
    { field: 'EDC_IP1', header: '第一台信用卡刷卡機IP', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  EDC_Status_Option: any[] = [
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
    //
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

    this.router.navigate(['/TLS4000/TLS41020CRU'], extras);
  }
}
