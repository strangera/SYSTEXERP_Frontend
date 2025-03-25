import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//5.1.1.5 遺失/拾獲管理作業
@Component({
  selector: 'app-cpm11050',
  templateUrl: './cpm11050.component.html',
  styleUrl: './cpm11050.component.scss'
})
export class CPM11050Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    recordCode: [, [Validators.maxLength(10)]], // 記錄編號
    // registerCode: [, [Validators.maxLength(9)]], // 登錄編號
    registerDateFrom: [], // 登錄日期
    registerDateTo: [], // 登錄日期
    lossDateFrom: [], // 遺失日期
    lossDateTo: [], // 遺失日期
    foundDateFrom: [], // 拾獲日期
    foundDateTo: [], // 拾獲日期
    notificationDateFrom: [], // 通知日期
    notificationDateTo: [], // 通知日期
    pickUpDateFrom: [], // 領回日期
    pickUpDateTo: [], // 領回日期
    transferDateFrom: [], // 轉出日期
    transferDateTo: [], // 轉出日期
    //
    objectType: [[] as number[]], // 物品類別
    lostStatus: [[] as number[]], // 失物狀態
    //
    objectDescription: [, ], // 物品敘述
    //
    location: ['', [Validators.maxLength(100)]], // 地點
    serviceStaff: ['', [Validators.maxLength(10)]], // 服務人員
    register: ['', [Validators.maxLength(100)]], // 登錄者
    broadcastStatus: [1, []], // 是否廣播
    //
    condition: ['', [Validators.maxLength(100)]], // 通知/廣播情況
    meetingPoint: ['', [Validators.maxLength(100)]], // 集合地點
    receiverName: ['', [Validators.maxLength(100)]], // 領回人姓名
    receiverPhone: ['', [Validators.maxLength(100)]], // 領回人聯絡電話
    reporterName: [[] as number[]], // 報失者/拾獲者姓名
    assistance: ['', [Validators.maxLength(100)]], // 協助顧客領回處理人員
    finderName: ['', [Validators.maxLength(20)]], // 報失者/拾獲者姓名
    //
    finderIdentity: [[] as number[]], // 報失者/拾獲者身份別
    finderGender: [[] as number[]], // 	報失者/拾獲者性別
    phone: [, [Validators.maxLength(20)]], // 電話
    address: ['', [Validators.maxLength(100)]], // 聯絡地址
    cellphone: [, [Validators.maxLength(100)]], // 手機
    idNumber: [, [Validators.maxLength(20)]], // 證件號碼
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
    { isdelete: true, 'objectType': '其他', 'objectDescription': '黑色直立雨傘', 'recordCode': 190710961,
      'registerDate': '2019/7/10', 'notificationDate': '', 'pickUpDate': '', 'transferDate': '',
      'lostType': '遺失', 'lostStatus': '未通知', 'location': '1F', 'serviceStaff': '任先生', 'finderName': '宋小姐',
      'nightPhone': '', 'dayPhone': '', 'cellphone': '0900000000', 'transferOut': '',
     },
     { isdelete: true, 'objectType': '手機', 'objectDescription': '黑色手機', 'recordCode': 190710942,
      'registerDate': '2019/7/10', 'notificationDate': '', 'pickUpDate': '', 'transferDate': '',
      'lostType': '遺失', 'lostStatus': '未通知', 'location': '5F', 'serviceStaff': '瑜小姐', 'finderName': '王小姐',
      'nightPhone': '', 'dayPhone': '', 'cellphone': 'X', 'transferOut': '',
     },
     { isdelete: false, 'objectType': '其他', 'objectDescription': '紙袋', 'recordCode': 190710901,
      'registerDate': '2019/7/10', 'notificationDate': '', 'pickUpDate': '2019/7/10', 'transferDate': '',
      'lostType': '遺失', 'lostStatus': '已領回', 'location': '全館', 'serviceStaff': '黃小姐', 'finderName': '邱小姐',
      'nightPhone': '', 'dayPhone': '', 'cellphone': '0900000000', 'transferOut': 'X',
     },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'objectType', header: '物品類別', visible: true },
    { field: 'objectDescription', header: '物品敘述', visible: true },
    { field: 'recordCode', header: '紀錄編號', visible: true },

    { field: 'registerDate', header: '登錄日期', visible: true },
    { field: 'notificationDate', header: '通知日期', visible: true },
    { field: 'pickUpDate', header: '領回日期', visible: true },
    { field: 'transferDate', header: '轉出日期', visible: true },

    { field: 'lostType', header: '失物類別', visible: true },
    { field: 'lostStatus', header: '失物狀態', visible: true },

    { field: 'location', header: '地點', visible: true },
    { field: 'serviceStaff', header: '服務人員', visible: true },
    { field: 'finderName', header: '報失者/拾獲者姓名', visible: true },

    { field: 'nightPhone', header: '電話(夜)', visible: true },
    { field: 'dayPhone', header: '電話(日)', visible: true },
    { field: 'cellphone', header: '手機', visible: true },

    { field: 'transferOut', header: '是否轉出', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  objectTypeOptions: any[] = [
    { value: 1, label: '鑰匙' },
    { value: 2, label: '手機' },
    { value: 3, label: '皮包/包包' },
    { value: 4, label: '衣物' },
    { value: 5, label: '電子商品' },
  ];
  lostStatusOptions: any[] = [
    { value: 1, label: '拾獲' },
    { value: 2, label: '遺失' },
  ];

  broadcastStatusOptions: any[] = [
    { value: 1, label: '已廣播' },
    { value: 2, label: '不廣播' },
  ];

  lostPersonTitleOptions: any[] = [
    { value: 1, label: '先生' },
    { value: 2, label: '小姐' },
    { value: 3, label: '女士' },
    { value: 4, label: '同學' },
    { value: 5, label: '小朋友' },
  ];
  reporterNameOptions: any[] = [
    { value: 1, label: '家人' },
    { value: 2, label: '朋友' },
    { value: 3, label: '其他' },
  ];
  finderIdentityOptions: any[] = [
    { value: 1, label: '遊客' },
    { value: 2, label: '員工' },
  ];
  genderOptions: any[] = [
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ];

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
    this.ProgNo = '510005';
    this.cruPage = '/CPM1000/CPM11050FOUND';
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

  // 新增拾獲
  onFound() {
    this.navigateWithState(this.router, CRUDStatus.Create, null, '/CPM1000/CPM11050FOUND');
  }

  // 新增遺失
  onLost() {
    this.navigateWithState(this.router, CRUDStatus.Create, null, '/CPM1000/CPM11050FOUND'); //表單相同(傳入數值不同 遺失/拾獲)
  }

  // 未領取報表
  onUnclaimed() {
    this.navigateWithState(this.router, CRUDStatus.Create, null, '/CPM1000/CPM11050UNCLAIMED');
  }
}
