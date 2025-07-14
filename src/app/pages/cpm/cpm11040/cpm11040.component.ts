import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//5.1.1.5 設備歸還作業
@Component({
  selector: 'app-cpm11040',
  templateUrl: './cpm11040.component.html',
  styleUrl: './cpm11040.component.scss'
})
export class CPM11040Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    recordCode: [, [Validators.maxLength(14)]], // 記錄編號
    borrowDateFrom: [], // 出借日期
    borrowDateTo: [], // 出借日期
    name: ['', [Validators.maxLength(20)]], // 姓名
    returnDateFrom: [], // 歸還日期
    returnDateTo: [], // 歸還日期
    phone: [, [Validators.maxLength(20)]], // 連絡電話
    paperType: [[] as number[]], // 證件類型

    paperCode: [, [Validators.maxLength(20)]], // 證件編號
    equipmentName: [[] as number[]], // 設備名稱
    deviceCode: [, [Validators.maxLength(10)]], // 設備編號

    rentStatus: [[] as number[]], // 出借狀態
    counterCode: [], // 服務台位置編號
    staffName: ['', [Validators.maxLength(10)]], // 出借處理人員
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { 'name': 'Emily', 'age': 28, 'email': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '記錄編號', visible: true },
    { field: 'col2', header: '出借日期', visible: true },
    { field: 'col3', header: '歸還日期', visible: true },

    { field: 'col4', header: '姓名', visible: true },
    { field: 'col5', header: '連絡電話', visible: true },
    { field: 'col6', header: '出借處理人員', visible: true },

    { field: 'col7', header: '證件類型', visible: true },
    { field: 'col8', header: '證件編號', visible: true },

    { field: 'col9', header: '出借狀態', visible: true },
    { field: 'col10', header: '備註', visible: true },

    // { field: 'col11', header: '廠商帳戶名稱', visible: true },
    // { field: 'col12', header: '付款期限', visible: true },
    // { field: 'col13', header: '票據抬頭', visible: true },
    // { field: 'col14', header: '審核狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  paperTypeOptions: any[] = [
    { value: 1, label: '身分證' },
    { value: 2, label: '健保卡' },
    { value: 3, label: '駕照' },
    { value: 4, label: '護照' },
    { value: 5, label: '其他' },
  ]

  equipmentNameOptions: any[] = [
    { value: 1, label: '奇哥Joie輕便娃娃車' },
    { value: 2, label: '愛心輪椅' },
  ]

  counterCodeOptions: any[] = [
    { value: 1, label: '11A001/服務諮詢台' },
    { value: 2, label: '12A001/VIP室' },
    { value: 3, label: '12D001/總機' },
    { value: 4, label: '15A001/顧客服務中心' },
  ]

  rentStatusOptions: any[] = [
    { value: 1, label: '出借' },
    { value: 2, label: '部分歸還' },
    { value: 3, label: '全部歸還' },
  ]

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '510004';
    this.cruPage = '/CPM1000/CPM11040CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
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
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
