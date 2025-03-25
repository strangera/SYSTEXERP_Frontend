import { CounterCodeService } from './../../../service/basic/counter-code.service';
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

// 2.4.2.1 快速鍵維護作業

//先新增主檔再新增明細檔
//透過主檔查詢明細檔
@Component({
  selector: 'app-tls42020',
  templateUrl: './tls42020.component.html',
  styleUrl: './tls42020.component.scss'
})
export class TLS42020Component {
  ProgNo: string = '240008';
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
    // POS1004M_鍵盤設定主檔
    ECR_KBType: ['', [Validators.required, Validators.maxLength(6)]], // 鍵盤型態
    USR_Level: ['', [Validators.required, Validators.maxLength(6)]], // 鍵盤權限等級
    ECR_KBDesc: [, ], // 鍵盤備註

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
    { ECR_KBType: '0', USR_Level: '0', KB_ScanCode: '0101', KB_Func: '3003',
      KB_Arg1: '0', KB_Arg2: '\N', KB_Arg3: '\N', KB_Display1: '結帳', KB_Display2: '\N',
      KB_Font: '細明體', KB_Size: 16, KB_Fonttyped: '101', KB_Style: '1', KB_Switch: 'Y',
      KB_Width: 100, KB_Height: 50, KB_Merge: '0101', KB_Color: 'RGB: 255, 90, 90', KB_FontColor: 'Blue',
    },
    { ECR_KBType: '0', USR_Level: '0', KB_ScanCode: '0102', KB_Func: '3003',
      KB_Arg1: '1', KB_Arg2: '\N', KB_Arg3: '\N', KB_Display1: '商品', KB_Display2: '\N',
      KB_Font: '細明體', KB_Size: 16, KB_Fonttyped: 'YNN', KB_Style: '1', KB_Switch: 'Y',
      KB_Width: 100, KB_Height: 50, KB_Merge: '0102', KB_Color: 'RGB: 255, 180, 180', KB_FontColor: 'White',
    },
    { ECR_KBType: '0', USR_Level: '0', KB_ScanCode: '0103', KB_Func: '3003',
      KB_Arg1: '2', KB_Arg2: '\N', KB_Arg3: '\N', KB_Display1: '付款', KB_Display2: '\N',
      KB_Font: '細明體', KB_Size: 16, KB_Fonttyped: 'YNN', KB_Style: '1', KB_Switch: 'Y',
      KB_Width: 100, KB_Height: 50, KB_Merge: '0103', KB_Color: 'RGB: 255, 180, 180', KB_FontColor: 'White',
    },
    { ECR_KBType: '0', USR_Level: '0', KB_ScanCode: '0104', KB_Func: '3003',
      KB_Arg1: '3', KB_Arg2: '\N', KB_Arg3: '\N', KB_Display1: '管理', KB_Display2: '\N',
      KB_Font: '細明體', KB_Size: 16, KB_Fonttyped: 'YNN', KB_Style: '1', KB_Switch: 'Y',
      KB_Width: 100, KB_Height: 50, KB_Merge: '0104', KB_Color: 'RGB: 255, 180, 180', KB_FontColor: 'White',
    },
    { ECR_KBType: '0', USR_Level: '0', KB_ScanCode: '0105', KB_Func: '1001',
      KB_Arg1: '\N', KB_Arg2: '\N', KB_Arg3: '\N', KB_Display1: '登出', KB_Display2: '\N',
      KB_Font: '細明體', KB_Size: 16, KB_Fonttyped: 'YNN', KB_Style: '1', KB_Switch: 'Y',
      KB_Width: 100, KB_Height: 50, KB_Merge: '0105', KB_Color: 'Navy', KB_FontColor: 'White',
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'ECR_KBType', header: '鍵盤型態', visible: true },
    { field: 'USR_Level', header: '鍵盤權限等級', visible: true },
    // { field: 'ECR_KBDesc', header: '鍵盤備註', visible: true },

    { field: 'KB_ScanCode', header: '按鍵代碼', visible: true },
    { field: 'KB_Func', header: '功能代碼', visible: true },
    { field: 'KB_Arg1', header: '參數(1)', visible: true },
    { field: 'KB_Arg2', header: '參數(2)', visible: true },
    { field: 'KB_Arg3', header: '參數(3)', visible: true },
    { field: 'KB_Display1', header: '按鍵顯示(第一行)', visible: true },
    { field: 'KB_Display2', header: '按鍵顯示(第二行)', visible: true },

    { field: 'KB_Font', header: '顯示字型', visible: true },
    { field: 'KB_Size', header: '顯示字型大小', visible: true },
    { field: 'KB_Fonttyped', header: '顯示字型(粗體/斜體/底線)', visible: true },
    { field: 'KB_Style', header: '按鍵型狀', visible: true },
    { field: 'KB_Switch', header: 'ON/OFF', visible: true },

    { field: 'KB_Width', header: '寬度', visible: true },
    { field: 'KB_Height', header: '高度', visible: true },
    { field: 'KB_Merge', header: '合併鍵的 按鍵代碼', visible: true },
    { field: 'KB_Color', header: '顏色', visible: true },
    { field: 'KB_FontColor', header: '字型顏色', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

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

    this.router.navigate(['/TLS4000/TLS42020CRU'], extras);
  }
}
