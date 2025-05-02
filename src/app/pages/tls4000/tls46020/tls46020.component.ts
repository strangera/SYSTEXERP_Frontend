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

// 2.4.6.2  POS環境變數維護作業
@Component({
  selector: 'app-tls46020',
  templateUrl: './tls46020.component.html',
  styleUrl: './tls46020.component.scss'
})
export class TLS46020Component {
  ProgNo: string = '240020';
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
    // POS1002TML_收銀機週邊設定模版檔
    ECR_TmplNo: [, [Validators.maxLength(20)]], // 環境變數編號
    ECR_TmplDesc: [,], // 模版備註
    ECR_SernoType: [[] as number[]], // 交易序號模式 1=循環使用 2=每日重計 3=每月重計
    ECR_GUI_Type: [[] as number[]], // 發票使用類別 00=不開發票 03=二聯式收銀機發票 07=電子發票(預設值)
    ECR_TimeTickInvl: [, [Validators.maxLength(6)]], // 系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次

    //收銀設定
    ECR_ForceInput: [, [Validators.maxLength(1)]], // 是否強制輸入付款金額 預設值為N
    ECR_CustCntEntry: [, [Validators.maxLength(1)]], // 是否輸入來客數 Y/N 預設值為N
    ECR_CustTypeEntry: [, [Validators.maxLength(1)]], // 是否輸入客層 Y/N 預設值為N
    ECR_ClerkEntry: [, [Validators.maxLength(1)]], // 是否強制輸入營業員 Y/N 預設值為N
    ECR_ForceMember: [, [Validators.maxLength(1)]], // 是否強制輸入會員編號 Y/N 預設值為N
    ECR_Interval: [, [this.validationService.numberValidator, Validators.max(999999)]], // 上下傳異動檔間隔(秒) 預設值為6

    ECR_MaxQty: [, [Validators.maxLength(8)]], // 單筆交易數量上限 0=不限制 預設值為999999
    ECR_MaxAmt: [, [Validators.maxLength(8)]], // 單筆交易金額上限 0=不限制 預設值為99999999
    ECR_MaxItemAmt: [, [Validators.maxLength(8)]], //單一明細金額上限 0=不限制 預設值為99999999
    ECR_MaxDisc: [, [Validators.maxLength(8)]], // 單筆交易最大折扣比率限制 0=不限制 預設值為0
    ECR_EdcTimeout: [, [Validators.maxLength(8)]], // 信用卡刷卡機連線時限(秒)預設值為60
    ECR_EdcSettle: [], // 信用卡刷卡機連動日結 Y/N 預設值為Y

    // 報表列印設定 ...

    // 周邊設定 ...

  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      ECR_TmplNo: 'template1', ECR_TmplDesc: 'template_remark1',
      ECR_TmplBegDate: '2024/01/01', ECR_TmplEndDate: '2099-12-31',
      ECR_SernoType: 1, ECR_GUI_Type: 0, ECR_TimeTickInvl: 60,
      ECR_ForceInput: 0, ECR_CustCntEntry: 0, ECR_CustTypeEntry: 0, ECR_ClerkEntry: 0, ECR_ForceMember: 0, ECR_Interval: 6,
      ECR_MaxQty: 999999, ECR_MaxAmt: 99999999, ECR_MaxItemAmt: 99999999, ECR_MaxDisc: 0, ECR_EdcTimeout: 60, ECR_EdcSettle: 'Y'
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ECR_TmplNo', header: '模版編號', visible: true },
    { field: 'ECR_TmplDesc', header: '模版備註', visible: true },

    { field: 'ECR_TmplBegDate', header: '模版啟用日期', visible: true },
    { field: 'ECR_TmplEndDate', header: '模版截止日期', visible: true },

    { field: 'ECR_SernoType', header: '交易序號使用方式', visible: true },
    { field: 'ECR_GUI_Type', header: '發票使用類別', visible: true },
    { field: 'ECR_TimeTickInvl', header: '系統對時間隔(秒)', visible: true },

    { field: 'ECR_MaxQty', header: '單筆交易數量上限', visible: true },
    { field: 'ECR_MaxAmt', header: '單筆交易金額上限', visible: true },
    { field: 'ECR_MaxItemAmt', header: '單筆交易最大金額限制', visible: true },
    { field: 'ECR_MaxDisc', header: '單筆交易最大折扣比率限制', visible: true },
    { field: 'ECR_EdcTimeout', header: '信用卡刷卡機連線時限(秒)', visible: true },
    { field: 'ECR_EdcSettle', header: '信用卡刷卡機連動日結', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  ECR_SernoType_Option: any[] = [
    { value: 1, label: '循環使用' },
    { value: 2, label: '每日重計' },
    { value: 3, label: '每月重計' },
  ];
  ECR_GUI_Type_Option: any[] = [
    { value: '07', label: '電子發票' },
    { value: '00', label: '不開發票' },
    { value: '03', label: '二聯式收銀機發票' },
  ];

  YN_Option: any[] = [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
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
    // this.cahserTypeService.getSystemTypes().subscribe(data => {
    //   this.registerTypeOptions = data;
    // });
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

    this.router.navigate(['/TLS4000/TLS46020CRU'], extras);
  }
}
