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

// 2.4.1.6 收銀機發票安全量參數維護作業
@Component({
  selector: 'app-tls41060',
  templateUrl: './tls41060.component.html',
  styleUrl: './tls41060.component.scss'
})
export class TLS41060Component {
  ProgNo: string = '240006';
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
    // POS1002 收銀機設定檔
    SYS_StoreNo: [, [Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    ECR_Name: ['', [Validators.maxLength(20)]], // 收銀機名稱
    ECR_Type: [, [Validators.maxLength(2)]], // 機台類型

    // 必須新增 機台後才能執行此修改作業(電子發票才會做此修改)
    ECR_GUI_PeriodQty: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 每期發票預設配號量，預設值為50，設定值必須為50的倍數
    ECR_GUI_MinQty: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票最小安全存量，預設值為50，設定值必須為50的倍數
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { ECR_No: 'register123', ECR_Name: '收銀機名稱', ECR_Type: 1, ECR_GUI_PeriodQty: 50, ECR_GUI_MinQty: 50 },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    // { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'ECR_Type', header: '機台類型', visible: true },

    { field: 'ECR_GUI_PeriodQty', header: '機台每期電子發票預設配號數量', visible: true },
    { field: 'ECR_GUI_MinQty', header: '機台電子發票最小安全存量', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  ECR_Type_Option: any[] = [
    { value: 1, label: '集中收銀(統收)' },
    { value: 2, label: '專櫃機台(自收)' },
    { value: 7, label: '它社機台(不使用商場系統但開立商場發票)' },
  ];
  ECR_GUI_Type_Option: any[] = [
    { value: 0, label: '不開發票' },
    { value: 3, label: '二聯式收銀機發票' },
    { value: 7, label: '電子發票(預設值)' },
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

    this.router.navigate(['/TLS4000/TLS41060CRU'], extras);
  }
}
