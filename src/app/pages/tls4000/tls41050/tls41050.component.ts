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

// 2.4.1.5 發票訊息維護作業
@Component({
  selector: 'app-tls41050',
  templateUrl: './tls41050.component.html',
  styleUrl: './tls41050.component.scss'
})
export class TLS41050Component {
  ProgNo: string = '240005';
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
    // POS5001_通告檔
    STO_No: ['', [Validators.required, Validators.maxLength(10)]], // 門市店號
    NOT_DateTime: [], // 通告產生時間
    NOT_Type: [[] as number[]], // 通告顯示種類，固定為000000
    /*  101=即時顯示通告   102=暫停時顯示通告 103=功能鍵顯示通告 104=客戶顯示器顯示通告 105=銷貨明細表列印訊息 */

    //
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號，固定為XXXXXX
    NOT_BegDateTime: [], // 開始時間
    NOT_EndDateTime: [], // 結束時間
    NOT_Desc: [,[Validators.maxLength(255)]], // 通告內容
    NOT_Status: [[] as number[]], // 通告狀態 A=已生效(預設值) D=已刪除
    NOT_Remark: ['', [Validators.maxLength(60)]], // 通告備註

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
    { id:1, STO_No: 'store1', NOT_DateTime: '2024/08/08 08:08', NOT_Type: 101 ,ECR_No: 123, NOT_BegDateTime: '2024/08/08 08:08', NOT_EndDateTime: '2024/09/09 08:08',
      NOT_Desc: '通告內容', NOT_Status: 'A', NOT_Remark: '通告備註',
    
      children: [
        { id:1, NOT_SeqNo: 123, TLT_No: 'counter1',
          ECR_Type: '', ECR_GrpNo: 'machineGroup1',
          BUILDING_No: 'building1', FLOOR_No: '1F', AREA_No: 'area1',
         },
         { id:2, NOT_SeqNo: 456, TLT_No: 'counter2', ECR_Type: '',
          ECR_GrpNo: 'machineGroup2',
          BUILDING_No: 'building2', FLOOR_No: '', AREA_No: 'area1',
         },
      ]},
      { id:2, STO_No: 'store2', NOT_DateTime: '2024/08/08 08:08', NOT_Type: 101 ,ECR_No: 123, NOT_BegDateTime: '2024/08/08 08:08', NOT_EndDateTime: '2024/09/09 08:08',
        NOT_Desc: '通告內容', NOT_Status: 'A', NOT_Remark: '通告備註',
      
        children: [
          { id:3, NOT_SeqNo: 789, TLT_No: 'counter3',
            ECR_Type: '', ECR_GrpNo: 'machineGroup3',
            BUILDING_No: 'building1', FLOOR_No: '', AREA_No: 'area2',
           },
        ]},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    // { field: 'ECR_No', header: '收銀機號', visible: true },
    // { field: 'STO_No', header: '門市店號', visible: false },
    { field: 'NOT_DateTime', header: '通告產生時間', visible: true },
    { field: 'NOT_Type', header: '通告顯示種類', visible: true },
    
    { field: 'NOT_BegDateTime', header: '開始時間', visible: true },
    { field: 'NOT_EndDateTime', header: '結束時間', visible: true },

    { field: 'NOT_Desc', header: '通告內容', visible: true },
    { field: 'NOT_Status', header: '通告狀態', visible: true },
    { field: 'NOT_Remark', header: '通告備註', visible: true },
    // 其他欄位
  ];

  subColumns: any[]= [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'NOT_SeqNo', header: '通告序號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },

    { field: 'ECR_Type', header: '機台類型', visible: true },
    { field: 'ECR_GrpNo', header: '機台群組編號', visible: true },

    { field: 'BUILDING_No', header: '館別', visible: true },
    { field: 'FLOOR_No', header: '樓層代碼', visible: true },
    { field: 'AREA_No', header: '區域代碼', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  NOT_Type_Options: any[] = [
    { value: 101, label: '即時顯示通告' },
    { value: 102, label: '暫停時顯示通告' },
    { value: 103, label: '功能鍵顯示通告' },
    { value: 104, label: '客戶顯示器顯示通告' },
    { value: 105, label: '銷貨明細表列印訊息' },
  ];
  NOT_Status_Options: any[] = [
    { value: 'A', label: '已生效' },
    { value: 'D', label: '已刪除' },
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

    this.router.navigate(['/TLS4000/TLS41050CRU'], extras);
  }
}
