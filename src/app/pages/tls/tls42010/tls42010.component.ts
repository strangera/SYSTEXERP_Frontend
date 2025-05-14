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
import { CounterCodeService } from '../../../service/basic/counter-code.service';

// 2.4.2.1 快速鍵維護作業

//需要excel 匯入功能
//專櫃 對應貨號 eg: 專櫃號001
@Component({
  selector: 'app-tls42010',
  templateUrl: './tls42010.component.html',
  styleUrl: './tls42010.component.scss'
})
export class TLS42010Component {
  ProgNo = '240007';
  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading = false;
  submitted = false;
  queryForm = this.formBuilder.group({
    // POS10271_收銀菜單明細檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    // STO_No: ['', [Validators.maxLength(10)]], // 分店編號(ALL代表代表不分店號)
    SBM_Type: ['', [Validators.maxLength(6)]], // 菜單類別 (1=一般菜單(預設值)  2=員工菜單)
    PLU_No: ['', [Validators.maxLength(20)]], // 商品條碼，預設為商品貨號
    TLT_No: ['', [Validators.maxLength(20)]], // 專櫃編號
    TLT_Name: ['', [Validators.maxLength(60)]], // 專櫃名稱
    SBM_BegDate_From: [], // 有效啟始日期
    SBM_BegDate_To: [], // 有效啟始日期
    SBM_EndDate_From: [], // 有效結束日期
    SBM_EndDate_To: [], // 有效結束日期

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
      id: 1, SBM_Type: '一般菜單', TLT_No: 'counter1', TLT_Name: '000285', SBM_BegDate: '2024/06/06 06:06', SBM_EndDate: '2024/07/07 07:07',
      children: [
        {
          id: 1, SBM_SeqNo: 3, PLU_MagNo: '0002850003', PLU_Name: '路易安納大魚排蛋包飯',
          PLU_PrnName: '大魚排蛋包飯', PLU_FixPrc: 219, PLU_SalePrc: 219,
          SBM_BtnNo: 0
        },
        {
          id: 2, SBM_SeqNo: 5, PLU_MagNo: '0002850005', PLU_Name: '英式燉牛肉蛋包飯',
          PLU_PrnName: '牛肉蛋包飯', PLU_FixPrc: 239, PLU_SalePrc: 239,
          SBM_BtnNo: 0
        },
      ]
    },
    {
      id: 2, SBM_Type: '一般菜單', TLT_No: 'counter2', TLT_Name: '000285', SBM_BegDate: '2024/06/06 06:06', SBM_EndDate: '2024/07/07 07:07',
      children: [
        {
          id: 3, SBM_SeqNo: 8, PLU_MagNo: '0002850008', PLU_Name: '海鮮義大利麵',
          PLU_PrnName: '海鮮義大利麵', PLU_FixPrc: 300, PLU_SalePrc: 300,
          SBM_BtnNo: 1
        },
      ]

    }
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  //欄位為 POS1004_鍵盤設定明細檔
  columns: any[] = [
    { field: 'SBM_Type', header: '菜單類別', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    // 其他欄位
  ];
  subColumns: any[] = [
    { field: 'SBM_SeqNo', header: '菜單序號', visible: true },

    { field: 'PLU_MagNo', header: '商品貨號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_PrnName', header: '商品列印名稱', visible: true },
    { field: 'PLU_FixPrc', header: '商品定價', visible: true },
    { field: 'PLU_SalePrc', header: '商品售價', visible: true },

    { field: 'SBM_BtnNo', header: '菜單按鍵序號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  SBM_Type_Options: any[] = [
    { value: 1, label: '一般菜單' },
    { value: 2, label: '員工菜單' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private counterCodeService: CounterCodeService,
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

    this.router.navigate(['/TLS4000/TLS42010CRU'], extras);
  }
}
